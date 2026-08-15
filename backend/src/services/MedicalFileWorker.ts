import * as crypto from 'node:crypto';
import { activationDecision, ClamAvScanner, serverSha256, validateUpload } from '@medichain/file-pipeline';
import { db } from '../config/db';
import { calculateEventHash, pseudonymizeReference } from './AuditIntegrityService';
import { configuredMedicalObjectStorage } from './MedicalFileService';

function safeFailureCode(error: unknown): string {
  const value = error instanceof Error ? error.message : 'FILE_PIPELINE_FAILED';
  return /^[A-Z][A-Z0-9_]{2,63}$/.test(value) ? value : 'FILE_PIPELINE_FAILED';
}

async function setState(uploadId: string, state: string, extras: { scanStatus?: string; failureCode?: string } = {}) {
  await db.query(
    `UPDATE medical_file_uploads
        SET state = $2,
            scan_status = COALESCE($3, scan_status),
            failure_code = $4,
            updated_at = NOW()
      WHERE id = $1`,
    [uploadId, state, extras.scanStatus ?? null, extras.failureCode ?? null]
  );
}

export class MedicalFileWorker {
  static async process(uploadId: string): Promise<void> {
    const rowResult = await db.query(
      `SELECT id, patient_id, actor_id, facility_id, declared_content_type,
              declared_size, quarantine_object_key, state
         FROM medical_file_uploads WHERE id = $1`,
      [uploadId]
    );
    if (!rowResult.rowCount) throw new Error('UPLOAD_NOT_FOUND');
    const upload = rowResult.rows[0];
    if (upload.state === 'active') return;
    if (!['quarantined', 'validating', 'scanning'].includes(upload.state)) throw new Error('UPLOAD_NOT_SCANNABLE');
    if (!upload.quarantine_object_key) throw new Error('QUARANTINE_OBJECT_MISSING');

    const objectStorage = configuredMedicalObjectStorage();
    try {
      await setState(uploadId, 'validating');
      const object = await objectStorage.readQuarantine(upload.quarantine_object_key);
      const validation = validateUpload({
        declaredContentType: upload.declared_content_type,
        declaredSize: Number(upload.declared_size),
        actualSize: object.contentLength,
        firstBytes: object.bytes.subarray(0, 16),
      });
      if (!validation.valid) throw new Error(validation.code);

      await setState(uploadId, 'scanning');
      const clamHost = process.env.CLAMAV_HOST;
      if (!clamHost) throw new Error('CLAMAV_NOT_CONFIGURED');
      const scanner = new ClamAvScanner({ host: clamHost, port: Number(process.env.CLAMAV_PORT || 3310) });
      const scanStatus = await scanner.scan(object.bytes);
      if (scanStatus === 'infected') {
        await objectStorage.deleteQuarantine(upload.quarantine_object_key);
        await setState(uploadId, 'failed', { scanStatus: 'infected', failureCode: 'MALWARE_DETECTED' });
        return;
      }

      const contentHash = serverSha256(object.bytes);
      await setState(uploadId, 'encrypting', { scanStatus: 'clean' });
      const promoted = await objectStorage.promoteClean({ quarantineObjectKey: upload.quarantine_object_key, serverContentHash: contentHash });
      await setState(uploadId, 'pending_verification', { scanStatus: 'clean' });

      const auditPepper = process.env.AUDIT_PEPPER;
      if (!auditPepper || auditPepper.length < 32) throw new Error('AUDIT_PEPPER_REQUIRED');
      if (!db.pool) throw new Error('DURABLE_DATABASE_REQUIRED');
      const client = await db.pool.connect();
      try {
        await client.query('BEGIN');
        await client.query(`SELECT pg_advisory_xact_lock(hashtext('medichain-security-audit-chain'))`);
        const previous = await client.query(`SELECT event_hash FROM security_audit_events ORDER BY sequence_no DESC LIMIT 1`);
        const previousHash = previous.rows[0]?.event_hash ?? null;
        const auditEvent = {
          id: crypto.randomUUID(),
          actorRefHash: pseudonymizeReference(String(upload.actor_id), auditPepper),
          subjectRefHash: pseudonymizeReference(String(upload.patient_id), auditPepper),
          eventType: 'record.upload',
          outcome: 'success',
          occurredAt: new Date().toISOString(),
          metadata: { uploadId, facilityBound: true, scanClean: true },
        };
        const eventHash = calculateEventHash(auditEvent, previousHash);
        await client.query(
          `INSERT INTO security_audit_events
             (id, actor_ref_hash, subject_ref_hash, facility_id, event_type, purpose,
              outcome, metadata, previous_hash, event_hash, occurred_at)
           VALUES ($1,$2,$3,$4,$5,'treatment','success',$6::jsonb,$7,$8,$9)`,
          [auditEvent.id, auditEvent.actorRefHash, auditEvent.subjectRefHash, upload.facility_id, auditEvent.eventType, JSON.stringify(auditEvent.metadata), previousHash, eventHash, auditEvent.occurredAt]
        );
        const evidence = activationDecision({
          scanStatus: 'clean',
          serverContentHash: contentHash,
          encryptedObjectKey: promoted.cleanObjectKey,
          kmsKeyReference: process.env.MEDICAL_KMS_KEY_ID,
          auditEventId: auditEvent.id,
          auditConfirmed: true,
        });
        if (!evidence.allowed) throw new Error('ACTIVATION_EVIDENCE_INCOMPLETE');
        await client.query(
          `UPDATE medical_file_uploads
              SET state = 'active', encrypted_object_key = $2, server_content_hash = $3,
                  scan_status = 'clean', kms_key_reference = $4, audit_event_id = $5,
                  audit_confirmed = TRUE, anchor_status = 'pending', updated_at = NOW()
            WHERE id = $1 AND state = 'pending_verification'`,
          [uploadId, promoted.cleanObjectKey, contentHash, process.env.MEDICAL_KMS_KEY_ID, auditEvent.id]
        );
        await client.query(
          `INSERT INTO outbox_events (topic, aggregate_id, idempotency_key, payload)
           VALUES
             ('fabric.anchor',$1,$2,$3::jsonb),
             ('notification.send',$1,$4,$5::jsonb)
           ON CONFLICT (topic, idempotency_key) DO NOTHING`,
          [uploadId, `${uploadId}:anchor:v1`, JSON.stringify({ uploadId, auditEventId: auditEvent.id, contentHash }), `${uploadId}:available:v1`, JSON.stringify({ patientId: upload.patient_id, event: 'record_available', uploadId })]
        );
        await client.query('COMMIT');
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      } finally {
        client.release();
      }
    } catch (error) {
      await setState(uploadId, 'failed', { failureCode: safeFailureCode(error) });
      throw error;
    }
  }
}
