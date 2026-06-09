import { Router, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { db } from '../config/db';
import { requireDoctor, AuthRequest } from '../middleware/auth.middleware';
import { FabricGateway } from '../services/FabricGateway';
import { logger } from '../utils/logger';
import crypto from 'crypto';

const router = Router();

/**
 * POST /api/records
 * Create/upload a new health record (Doctors only)
 */
router.post(
  '/',
  requireDoctor,
  [
    body('patientId').notEmpty().isUUID().withMessage('Valid Patient ID is required'),
    body('recordType').notEmpty().isIn(['lab', 'prescription', 'imaging', 'note', 'referral']).withMessage('Valid record type is required'),
    body('title').notEmpty().isString().withMessage('Title is required'),
    body('encryptedCid').optional().isString(),
    body('integrityHash').optional().isString(),
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

    // Generate mock encryption CID and plain-text document SHA-256 integrity hash if not provided
    const finalCid = encryptedCid || `Qm${crypto.randomBytes(22).toString('hex')}`;
    const finalHash = integrityHash || `0x${crypto.randomBytes(32).toString('hex')}`;

    try {
      // 1. Insert record into postgres health_records table
      const recordResult = await db.query(
        `INSERT INTO health_records (patient_id, record_type, title, encrypted_cid, integrity_hash, data_categories, uploaded_by)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING id, patient_id, record_type, title, encrypted_cid, integrity_hash, data_categories, uploaded_by, created_at`,
        [patientId, recordType, title, finalCid, finalHash, JSON.stringify(dataCategories), doctorId]
      );
      const record = recordResult.rows[0];

      // 2. Anchor the record on the blockchain by calling FabricGateway
      await FabricGateway.submitTx(
        'patient',
        'AddDocument',
        patientId,
        finalHash,
        finalCid,
        recordType,
        doctorId,
        'patient_signed_tx_placeholder'
      );

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
        },
        message: 'Health record successfully saved in database and anchored to blockchain ledger.',
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
router.get('/', requireDoctor, async (req: AuthRequest, res: Response): Promise<void> => {
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
