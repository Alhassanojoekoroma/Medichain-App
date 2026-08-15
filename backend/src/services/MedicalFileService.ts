import { S3Client } from '@aws-sdk/client-s3';
import { MedicalObjectStorage, SupportedFileType } from '@medichain/file-pipeline';
import { db } from '../config/db';
import { ActorContext, authorize } from '../domain/authorization';
import { ConsentService, DataCategory } from './ConsentService';

export interface UploadAuthorizationInput {
  patientId: string;
  contentType: SupportedFileType;
  contentLength: number;
  originalName: string;
  dataCategories: DataCategory[];
  purpose: 'treatment' | 'care-coordination';
  idempotencyKey: string;
}

export function configuredMedicalObjectStorage(): MedicalObjectStorage {
  const quarantineBucket = process.env.MEDICAL_QUARANTINE_BUCKET;
  const cleanBucket = process.env.MEDICAL_CLEAN_BUCKET;
  const kmsKeyId = process.env.MEDICAL_KMS_KEY_ID;
  const region = process.env.AWS_REGION;
  if (!quarantineBucket || !cleanBucket || !kmsKeyId || !region) throw new Error('MEDICAL_STORAGE_NOT_CONFIGURED');
  const endpoint = process.env.S3_ENDPOINT;
  const client = new S3Client({
    region,
    endpoint: endpoint || undefined,
    forcePathStyle: process.env.S3_FORCE_PATH_STYLE === 'true',
  });
  return new MedicalObjectStorage(client, { quarantineBucket, cleanBucket, kmsKeyId });
}

function safeOriginalName(value: string): string {
  const name = value.trim().replace(/^.*[\\/]/, '').replace(/[\u0000-\u001f\u007f]/g, '');
  if (!name || name.length > 180) throw new Error('FILE_NAME_INVALID');
  return name;
}

function requirePool() {
  if (!db.pool) throw new Error('DURABLE_DATABASE_REQUIRED');
  return db.pool;
}

export class MedicalFileService {
  static async authorizeUpload(actor: ActorContext, input: UploadAuthorizationInput) {
    if (actor.role !== 'doctor' || !actor.facilityId || !actor.mfa) throw new Error('DOCTOR_MFA_REQUIRED');
    const relationship = await db.query(
      `SELECT id FROM care_relationships
        WHERE patient_id = $1 AND practitioner_id = $2 AND facility_id = $3
          AND status = 'active' AND (ends_at IS NULL OR ends_at > NOW())
        LIMIT 1`,
      [input.patientId, actor.id, actor.facilityId]
    );
    if (!relationship.rowCount) throw new Error('CARE_RELATIONSHIP_REQUIRED');
    const consent = await ConsentService.checkConsent(
      input.patientId,
      actor.id,
      actor.facilityId,
      'write',
      input.dataCategories,
      actor.role,
      input.purpose
    );
    if (!consent.allowed) throw new Error(consent.reason || 'CONSENT_INVALID_FOR_ACTION');
    const decision = authorize({
      actor,
      resource: { type: 'clinical-record', patientId: input.patientId, facilityId: actor.facilityId },
      action: 'create',
      purpose: input.purpose,
      hasActiveConsent: true,
      hasCareRelationship: true,
    });
    if (!decision.allowed) throw new Error(decision.code);

    const pool = requirePool();
    const objectStorage = configuredMedicalObjectStorage();
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const existing = await client.query(
        `SELECT id, quarantine_object_key, declared_content_type, declared_size, state
           FROM medical_file_uploads WHERE actor_id = $1 AND idempotency_key = $2 FOR UPDATE`,
        [actor.id, input.idempotencyKey]
      );
      let row = existing.rows[0];
      if (row) {
        if (row.declared_content_type !== input.contentType || Number(row.declared_size) !== input.contentLength) throw new Error('IDEMPOTENCY_KEY_REUSED_WITH_DIFFERENT_INPUT');
      } else {
        const authorization = await objectStorage.authorizeQuarantineUpload({ contentType: input.contentType, contentLength: input.contentLength });
        const inserted = await client.query(
          `INSERT INTO medical_file_uploads
             (patient_id, actor_id, facility_id, idempotency_key, declared_content_type,
              declared_size, original_name, state, quarantine_object_key)
           VALUES ($1,$2,$3,$4,$5,$6,$7,'authorized',$8)
           RETURNING id, quarantine_object_key, declared_content_type, declared_size, state`,
          [input.patientId, actor.id, actor.facilityId, input.idempotencyKey, input.contentType, input.contentLength, safeOriginalName(input.originalName), authorization.objectKey]
        );
        row = inserted.rows[0];
      }
      await client.query('COMMIT');
      const signed = await objectStorage.authorizeQuarantineUpload({
        contentType: input.contentType,
        contentLength: input.contentLength,
        objectKey: row.quarantine_object_key,
      });
      return {
        uploadId: row.id,
        state: row.state,
        uploadUrl: signed.uploadUrl,
        requiredHeaders: signed.requiredHeaders,
        expiresInSeconds: signed.expiresInSeconds,
      };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  static async completeUpload(actor: ActorContext, uploadId: string) {
    const pool = requirePool();
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const result = await client.query(
        `UPDATE medical_file_uploads
            SET state = 'quarantined', updated_at = NOW()
          WHERE id = $1 AND actor_id = $2 AND facility_id = $3
            AND state IN ('authorized','uploading')
        RETURNING id, state, updated_at`,
        [uploadId, actor.id, actor.facilityId]
      );
      if (!result.rowCount) throw new Error('UPLOAD_NOT_COMPLETABLE');
      await client.query(
        `INSERT INTO outbox_events (topic, aggregate_id, idempotency_key, payload)
         VALUES ('file.scan',$1,$2,$3::jsonb)
         ON CONFLICT (topic, idempotency_key) DO NOTHING`,
        [uploadId, `${uploadId}:scan:v1`, JSON.stringify({ uploadId })]
      );
      await client.query('COMMIT');
      return { uploadId, state: result.rows[0].state, updatedAt: result.rows[0].updated_at };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  static async status(actor: ActorContext, uploadId: string) {
    const result = await db.query(
      `SELECT id, state, scan_status, anchor_status, attempts, failure_code, created_at, updated_at
         FROM medical_file_uploads
        WHERE id = $1 AND actor_id = $2 AND facility_id = $3`,
      [uploadId, actor.id, actor.facilityId]
    );
    if (!result.rowCount) throw new Error('UPLOAD_NOT_FOUND');
    const row = result.rows[0];
    return {
      uploadId: row.id,
      state: row.state,
      scanStatus: row.scan_status,
      anchorStatus: row.anchor_status,
      attempts: Number(row.attempts),
      failureCode: row.failure_code,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}
