import { Router, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { db } from '../config/db';
import { requireDoctor, AuthRequest } from '../middleware/auth.middleware';
import { ConsentService } from '../services/ConsentService';
import { FabricGateway } from '../services/FabricGateway';
import { AuditService } from '../services/AuditService';
import { TokenService } from '../services/TokenService';
import { logger } from '../utils/logger';
import crypto from 'crypto';

const router = Router();

/**
 * POST /api/treatments
 * Record a medication, tablet, or treatment given to a patient (Doctors only)
 */
router.post(
  '/',
  requireDoctor,
  [
    body('patientId').notEmpty().isUUID().withMessage('Valid Patient ID is required'),
    body('treatmentType').notEmpty().isIn(['medication', 'procedure', 'therapy', 'other']).withMessage('Valid treatment type is required'),
    body('title').notEmpty().isString().withMessage('Title (e.g., medication name) is required'),
    body('description').optional().isString().withMessage('Description/dosage instructions must be a string'),
  ],
  async (req: AuthRequest, res: Response): Promise<void> => {
    // Only doctors can write treatments or prescribe medication
    if (req.doctor?.role !== 'doctor') {
      res.status(403).json({ error: 'Forbidden: Only doctors can prescribe treatments or issue medications.' });
      return;
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ error: 'Validation failed', details: errors.array() });
      return;
    }

    const { patientId, treatmentType, title, description } = req.body;
    const doctorId = req.doctor!.id;

    try {
      // 1. Verify consent
      const consent = await ConsentService.checkConsent(
        patientId,
        doctorId,
        req.doctor!.clinicId || null,
        'write',
        ['prescriptions']
      );

      if (!consent.allowed) {
        res.status(403).json({ error: `Access denied: ${consent.reason}` });
        return;
      }

      // 2. Generate on-chain audit hashes
      const docHash = `0x${crypto.createHash('sha256').update(`${patientId}:${title}:${description}:${Date.now()}`).digest('hex')}`;
      const docCid = `Qm${crypto.randomBytes(22).toString('hex')}`;

      // 3. Save treatment in PostgreSQL
      const treatmentResult = await db.query(
        `INSERT INTO treatments (patient_id, doctor_id, treatment_type, title, description)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id, patient_id, doctor_id, treatment_type, title, description, created_at`,
        [patientId, doctorId, treatmentType, title, description]
      );
      const treatment = treatmentResult.rows[0];

      // If this is a medication, append it to active medications in emergency profile
      if (treatmentType === 'medication') {
        try {
          const epRes = await db.query(
            `SELECT medications FROM emergency_profiles WHERE patient_id = $1`,
            [patientId]
          );
          if (epRes.rowCount > 0) {
            let currentMeds = epRes.rows[0].medications || [];
            if (typeof currentMeds === 'string') {
              try {
                currentMeds = JSON.parse(currentMeds);
              } catch {
                currentMeds = [];
              }
            }
            if (!Array.isArray(currentMeds)) {
              currentMeds = [];
            }
            // Append new medication
            currentMeds.push({ name: title, dosage: description || '', frequency: 'As directed' });
            await db.query(
              `UPDATE emergency_profiles SET medications = $1 WHERE patient_id = $2`,
              [JSON.stringify(currentMeds), patientId]
            );
          }
        } catch (epErr: any) {
          logger.warn(`Failed to update emergency profile medications: ${epErr.message}`);
        }
      }

      // 4. Anchor on-chain
      const tx = await FabricGateway.submitTx(
        'patient',
        'AddDocument',
        patientId,
        docHash,
        docCid,
        'prescription', // Type on-chain is prescription/treatment
        doctorId,
        'patient_signed_tx_placeholder'
      );

      // 5. Update treatment row with ledger transaction hash
      await db.query(
        `UPDATE treatments SET ledger_tx_hash = $1 WHERE id = $2`,
        [tx.txHash, treatment.id]
      );

      // 6. Log the audit event
      await AuditService.log({
        patientId,
        actorId: doctorId,
        actorRole: req.doctor!.role,
        accessType: 'write_treatment',
        outcome: 'granted',
      });

      res.status(201).json({
        success: true,
        treatment: {
          ...treatment,
          ledger_tx_hash: tx.txHash,
        },
        message: 'Treatment/medication recorded successfully and anchored on blockchain ledger.',
      });

    } catch (err: any) {
      logger.error(`[TreatmentsRoutes] Failed to record treatment: ${err.message}`);
      res.status(500).json({ error: 'Failed to record treatment', details: err.message });
    }
  }
);

/**
 * GET /api/treatments/patient/:patientId
 * Get treatment history for a patient (accessible to doctors and nurses who have consent, and the patient themselves)
 */
router.get(
  '/patient/:patientId',
  async (req: AuthRequest, res: Response): Promise<void> => {
    const { patientId } = req.params;
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Missing authorization header' });
      return;
    }

    try {
      const payload = TokenService.verifyDoctorJWT(authHeader.slice(7));
      const actorId = payload.sub;
      const actorRole = payload.role;

      // Access checks:
      // 1. Patient viewing their own records
      // 2. Doctor/Nurse/Staff with active read consent
      let hasAccess = false;
      let clinicId: string | null = null;

      if (actorRole === 'patient') {
        if (actorId === patientId) {
          hasAccess = true;
        }
      } else if (['doctor', 'nurse', 'staff', 'admin'].includes(actorRole)) {
        clinicId = payload.clinicId || null;
        const consent = await ConsentService.checkConsent(
          patientId,
          actorId,
          clinicId,
          'read',
          ['prescriptions']
        );
        hasAccess = consent.allowed;
      }

      if (!hasAccess) {
        // Log access denial
        await AuditService.log({
          patientId,
          actorId,
          actorRole,
          accessType: 'read_treatment',
          outcome: 'denied',
          denialReason: 'No active consent policy',
        });
        res.status(403).json({ error: 'Access denied: You do not have consent to view this patient\'s treatments.' });
        return;
      }

      // Fetch treatments
      const treatmentsResult = await db.query(
        `SELECT t.id, t.patient_id, t.treatment_type, t.title, t.description, t.created_at, t.ledger_tx_hash,
                d.full_name AS doctor_name, d.specialty AS doctor_specialty
           FROM treatments t
           JOIN doctors d ON d.id = t.doctor_id
          WHERE t.patient_id = $1
          ORDER BY t.created_at DESC`,
        [patientId]
      );

      // Log success
      await AuditService.log({
        patientId,
        actorId,
        actorRole,
        accessType: 'read_treatment',
        outcome: 'granted',
      });

      res.json({
        success: true,
        treatments: treatmentsResult.rows,
      });

    } catch (err: any) {
      logger.error(`[TreatmentsRoutes] Failed to fetch treatment history: ${err.message}`);
      res.status(500).json({ error: 'Failed to fetch treatment history', details: err.message });
    }
  }
);

export default router;
