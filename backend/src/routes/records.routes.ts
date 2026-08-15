import { Router, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { db } from '../config/db';
import { requireDoctor, requirePatient, AuthRequest } from '../middleware/auth.middleware';
import { FabricGateway } from '../services/FabricGateway';
import VerificationService, { VerificationStage } from '../services/VerificationService';
import { logger } from '../utils/logger';
import { syntheticSandboxOnly } from '../middleware/containment.middleware';
import { createLedgerAnchor } from '../domain/fabricGovernance';
import { MedicalFileService } from '../services/MedicalFileService';
import { requireIdempotencyKey } from '../contracts/http';

const router = Router();

router.post('/uploads/authorize', requireDoctor, [
  body('patientId').isUUID(),
  body('contentType').isIn(['application/pdf', 'image/jpeg', 'image/png']),
  body('contentLength').isInt({ min: 1, max: 25 * 1024 * 1024 }),
  body('originalName').isString().isLength({ min: 1, max: 180 }),
  body('dataCategories').isArray({ min: 1, max: 5 }),
  body('dataCategories.*').isIn(['labs', 'prescriptions', 'imaging', 'notes', 'referrals']),
  body('purpose').isIn(['treatment', 'care-coordination']),
], async (req: AuthRequest, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ error: { code: 'VALIDATION_ERROR', details: errors.array() } });
  try {
    const idempotencyKey = requireIdempotencyKey(req.header('idempotency-key'));
    const result = await MedicalFileService.authorizeUpload(req.actor!, { ...req.body, idempotencyKey });
    res.status(201).json(result);
  } catch (error) {
    const code = error instanceof Error ? error.message : 'UPLOAD_AUTHORIZATION_FAILED';
    const status = ['CARE_RELATIONSHIP_REQUIRED', 'NO_CONSENT', 'CONSENT_INVALID_FOR_ACTION', 'DOCTOR_MFA_REQUIRED'].includes(code) ? 403 : code === 'DURABLE_DATABASE_REQUIRED' || code === 'MEDICAL_STORAGE_NOT_CONFIGURED' ? 503 : 400;
    res.status(status).json({ error: { code } });
  }
});

router.post('/uploads/:uploadId/complete', requireDoctor, async (req: AuthRequest, res: Response) => {
  try {
    const result = await MedicalFileService.completeUpload(req.actor!, req.params.uploadId);
    res.status(202).json(result);
  } catch (error) {
    const code = error instanceof Error ? error.message : 'UPLOAD_COMPLETION_FAILED';
    res.status(code === 'DURABLE_DATABASE_REQUIRED' ? 503 : 409).json({ error: { code } });
  }
});

router.get('/uploads/:uploadId', requireDoctor, async (req: AuthRequest, res: Response) => {
  try {
    res.set('Cache-Control', 'no-store');
    res.json(await MedicalFileService.status(req.actor!, req.params.uploadId));
  } catch (error) {
    const code = error instanceof Error ? error.message : 'UPLOAD_STATUS_FAILED';
    res.status(code === 'UPLOAD_NOT_FOUND' ? 404 : 500).json({ error: { code } });
  }
});

/**
 * GET /api/records/mine
 * Returns only the authenticated patient's records. The patient identifier is
 * taken from the verified access token and is never accepted from the client.
 */
router.get('/mine', requirePatient, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    res.set('Cache-Control', 'no-store');
    const recordsResult = await db.query(
      `SELECT r.id, r.record_type, r.title, r.integrity_hash, r.created_at,
              d.full_name AS doctor_name, c.name AS clinic_name,
              CASE WHEN COALESCE(r.encrypted_cid, '') <> '' THEN TRUE ELSE FALSE END AS document_available
         FROM health_records r
         LEFT JOIN doctors d ON d.id = r.uploaded_by
         LEFT JOIN clinics c ON c.id = d.clinic_id
        WHERE r.patient_id = $1
        ORDER BY r.created_at DESC`,
      [req.patientId]
    );

    res.json({
      success: true,
      records: recordsResult.rows.map((record: any) => ({
        id: record.id,
        recordType: record.record_type,
        title: record.title,
        integrityHash: record.integrity_hash,
        createdAt: record.created_at,
        doctorName: record.doctor_name ?? null,
        hospitalName: record.clinic_name ?? null,
        documentAvailable: record.document_available === true,
      })),
    });
  } catch (err: any) {
    logger.error(`[RecordsRoutes] Failed to fetch patient records: ${err.message}`);
    res.status(500).json({ error: 'Failed to fetch your records' });
  }
});

/**
 * POST /api/records
 * Create/upload a new health record (Doctors only)
 */
router.post(
  '/',
  requireDoctor,
  syntheticSandboxOnly('Clinical record creation'),
  [
    body('patientId').notEmpty().isUUID().withMessage('Valid Patient ID is required'),
    body('recordType').notEmpty().isIn(['lab', 'prescription', 'imaging', 'note', 'referral']).withMessage('Valid record type is required'),
    body('title').notEmpty().isString().withMessage('Title is required'),
    body('encryptedCid').optional().isString().isLength({ max: 512 }),
    body('integrityHash').matches(/^[a-f0-9]{64}$/i).withMessage('A SHA-256 integrity hash is required'),
    body('dataCategories').optional().isArray(),
  ],
  async (req: AuthRequest, res: Response): Promise<void> => {
    // Role check: Only doctors can create medical records
    if (req.doctor?.role !== 'doctor') {
      res.status(403).json({ error: 'Forbidden: Only doctors can upload medical records or write diagnoses.' });
      return;
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ error: 'Validation failed', details: errors.array() });
      return;
    }

    const { patientId, recordType, title, encryptedCid, integrityHash, dataCategories = ['all'] } = req.body;
    const doctorId = req.doctor!.id;
    const clinicId = req.doctor!.clinicId;

    const finalCid = encryptedCid || '';
    const finalHash = integrityHash;

    try {
      // Step-by-step verification per Tech Health Africa meeting requirements
      const verificationContext = {
        actorId: doctorId,
        actorRole: req.doctor!.role,
        facilityId: clinicId,
        patientId: patientId,
      };

      const verificationResults = await VerificationService.runVerificationPipeline(
        verificationContext,
        [VerificationStage.IDENTITY, VerificationStage.FACILITY, VerificationStage.PATIENT_CONSENT],
        { dataCategories, requestedAccessType: 'write', purpose: 'treatment' }
      );

      // Log verification results to audit trail
      await VerificationService.logVerificationResults(verificationContext, verificationResults);

      // Check if critical verifications failed
      const identityCheck = verificationResults.find((r: any) => r.stage === VerificationStage.IDENTITY);
      if (identityCheck?.status === 'FAILED') {
        logger.warn(`[RecordsRoutes] Identity verification failed for ${doctorId}`);
        res.status(403).json({ error: 'Identity verification failed', details: identityCheck.error });
        return;
      }

      const facilityCheck = verificationResults.find((r: any) => r.stage === VerificationStage.FACILITY);
      if (facilityCheck?.status === 'FAILED') {
        logger.warn(`[RecordsRoutes] Facility verification failed for ${doctorId} at ${clinicId}`);
        res.status(403).json({ error: 'Facility verification failed', details: facilityCheck.error });
        return;
      }

      const consentCheck = verificationResults.find((r: any) => r.stage === VerificationStage.PATIENT_CONSENT);
      if (consentCheck?.status === 'FAILED') {
        logger.warn(`[RecordsRoutes] Consent verification failed for ${doctorId} to access ${patientId}`);
        res.status(403).json({ error: 'Patient consent verification failed', details: consentCheck.error });
        return;
      }

      // 1. Insert record into postgres health_records table
      const recordResult = await db.query(
        `INSERT INTO health_records (patient_id, record_type, title, encrypted_cid, integrity_hash, data_categories, uploaded_by)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING id, patient_id, record_type, title, encrypted_cid, integrity_hash, data_categories, uploaded_by, created_at`,
        [patientId, recordType, title, finalCid, finalHash, JSON.stringify(dataCategories), doctorId]
      );
      const record = recordResult.rows[0];

      // 2. Submit only a privacy-minimized integrity anchor. Patient IDs,
      // object pointers, titles, and clinician IDs never cross this boundary.
      const anchorSecret = process.env.FABRIC_ANCHOR_DIGEST_SECRET || process.env.JWT_SECRET || '';
      const anchor = createLedgerAnchor({
        eventId: record.id,
        eventType: 'CLINICAL_RECORD_SIGNED',
        sourcePayload: {
          recordId: record.id,
          patientId,
          contentHash: finalHash,
          objectKey: finalCid,
          recordType,
          actorId: doctorId,
        },
        policyVersion: process.env.FABRIC_POLICY_VERSION || 'v1',
        organization: process.env.FABRIC_ORGANIZATION || 'SandboxOrg',
      }, anchorSecret);
      const ledgerResult = await FabricGateway.submitGovernedAnchor(anchor);

      // 3. Log access audit
      await db.query(
        `INSERT INTO access_logs (patient_id, actor_id, actor_role, access_type, outcome, data_categories)
         VALUES ($1, $2, $3, 'write_record', 'granted', $4)`,
        [patientId, doctorId, req.doctor!.role, JSON.stringify(dataCategories)]
      );

      res.status(201).json({
        success: true,
        record: {
          id: record.id,
          patientId: record.patient_id,
          recordType: record.record_type,
          title: record.title,
          encryptedCid: record.encrypted_cid,
          integrityHash: record.integrity_hash,
          dataCategories: record.data_categories,
          uploadedBy: record.uploaded_by,
          createdAt: record.created_at,
          ledgerTxHash: ledgerResult.txHash,
          simulated: ledgerResult.simulated === true,
        },
        message: ledgerResult.simulated
          ? 'Synthetic sandbox record saved and simulated ledger transaction completed.'
          : 'Health record saved and committed to the configured ledger.',
      });
    } catch (err: any) {
      logger.error(`[RecordsRoutes] Failed to upload record: ${err.message}`);
      res.status(500).json({ error: 'Failed to upload record', details: err.message });
    }
  }
);

/**
 * GET /api/records
 * Returns a list of health records that the requesting doctor has consent to view
 */
router.get('/', requireDoctor, syntheticSandboxOnly('Clinical record access'), async (req: AuthRequest, res: Response): Promise<void> => {
  // Role check: Only doctors can read clinical medical records
  if (req.doctor?.role !== 'doctor') {
    res.status(403).json({ error: 'Forbidden: Nurses and other staff cannot access clinical medical records directly.' });
    return;
  }

  const doctor = req.doctor!;

  try {
    const recordsResult = await db.query(
      `SELECT DISTINCT r.id, r.patient_id, p.full_name AS patient_name, r.record_type, r.title, r.encrypted_cid, r.integrity_hash, r.data_categories, r.uploaded_by, r.created_at
         FROM health_records r
         JOIN patients p ON r.patient_id = p.id
         JOIN consent_policies cp ON cp.patient_id = r.patient_id
        WHERE cp.is_revoked = FALSE
          AND (cp.expires_at IS NULL OR cp.expires_at > NOW())
          AND (
            (cp.grantee_type = 'doctor' AND cp.grantee_id = $1)
            OR (cp.grantee_type = 'clinic' AND cp.grantee_id = $2)
            OR (cp.grantee_type = 'role' AND cp.grantee_id = $3)
          )
        ORDER BY r.created_at DESC`,
      [doctor.id, doctor.clinicId || '', doctor.role || '']
    );

    res.json({
      success: true,
      records: recordsResult.rows,
    });
  } catch (err: any) {
    logger.error(`[RecordsRoutes] Failed to fetch records: ${err.message}`);
    res.status(500).json({ error: 'Failed to fetch records', details: err.message });
  }
});

export default router;
