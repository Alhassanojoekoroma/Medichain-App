import { Router, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { syntheticSandboxOnly } from '../middleware/containment.middleware';
import { db } from '../config/db';
import { requireDoctor, requirePatient, AuthRequest } from '../middleware/auth.middleware';
import { FabricGateway } from '../services/FabricGateway';
import { QRService } from '../services/QRService';
import VerificationService, { VerificationStage } from '../services/VerificationService';
import { logger } from '../utils/logger';

const router = Router();

/**
 * GET /api/patients/me
 * Returns the authenticated patient's own demographic profile.
 */
router.get('/me', requirePatient, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    res.set('Cache-Control', 'no-store');
    const result = await db.query(
      `SELECT id, full_name, date_of_birth, blood_type, phone, email
         FROM patients
        WHERE id = $1`,
      [req.patientId]
    );
    const patient = result.rows[0];
    if (!patient) {
      res.status(404).json({ error: 'Patient profile not found' });
      return;
    }

    res.json({
      success: true,
      patient: {
        id: patient.id,
        fullName: patient.full_name,
        dateOfBirth: patient.date_of_birth,
        bloodType: patient.blood_type,
        phone: patient.phone,
        email: patient.email,
      },
    });
  } catch (err: any) {
    logger.error(`[PatientsRoutes] Failed to fetch patient profile: ${err.message}`);
    res.status(500).json({ error: 'Failed to fetch your profile' });
  }
});

/**
 * POST /api/patients
 * Create a new patient record (Doctors, Nurses, and Admins only)
 * Per Tech Health Africa meeting (June 2026): Nurses are responsible for patient registration
 */
router.post(
  '/',
  requireDoctor,
  syntheticSandboxOnly('Patient enrollment with automatic broad consent'),
  [
    body('fullName').notEmpty().withMessage('Full name is required'),
    body('dateOfBirth').notEmpty().isDate().withMessage('Valid Date of Birth is required'),
    body('bloodType').optional().isString(),
    body('phone').optional().isString(),
    body('email').optional().isEmail().withMessage('Valid email is required'),
  ],
  async (req: AuthRequest, res: Response): Promise<void> => {
    // Role Check - Updated per Tech Health Africa meeting: Nurses can register patients
    const allowedRoles = ['doctor', 'nurse', 'admin'];
    if (!req.doctor || !allowedRoles.includes(req.doctor.role)) {
      res.status(403).json({ error: 'Forbidden: Only doctors, nurses, and admins can register new patients' });
      return;
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ error: 'Validation failed', details: errors.array() });
      return;
    }

    const { fullName, dateOfBirth, bloodType = 'O+', phone, email } = req.body;
    const doctorId = req.doctor!.id;
    const clinicId = req.doctor!.clinicId;

    try {
      // Step-by-step verification per Tech Health Africa meeting requirements
      const verificationContext = {
        actorId: doctorId,
        actorRole: req.doctor!.role,
        facilityId: clinicId,
      };

      const verificationResults = await VerificationService.runVerificationPipeline(
        verificationContext,
        [VerificationStage.IDENTITY, VerificationStage.FACILITY]
      );

      // Log verification results to audit trail
      await VerificationService.logVerificationResults(verificationContext, verificationResults);

      // Check if critical verifications failed
      const identityCheck = verificationResults.find((r: any) => r.stage === VerificationStage.IDENTITY);
      if (identityCheck?.status === 'FAILED') {
        logger.warn(`[PatientsRoutes] Identity verification failed for ${doctorId}`);
        res.status(403).json({ error: 'Identity verification failed', details: identityCheck.error });
        return;
      }

      const facilityCheck = verificationResults.find((r: any) => r.stage === VerificationStage.FACILITY);
      if (facilityCheck?.status === 'FAILED') {
        logger.warn(`[PatientsRoutes] Facility verification failed for ${doctorId} at ${clinicId}`);
        res.status(403).json({ error: 'Facility verification failed', details: facilityCheck.error });
        return;
      }

      // 1. Insert patient
      const patientResult = await db.query(
        `INSERT INTO patients (full_name, date_of_birth, blood_type, phone, email)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id, full_name, date_of_birth, blood_type, phone, email`,
        [fullName, dateOfBirth, bloodType, phone, email]
      );
      const patient = patientResult.rows[0];
      const patientId = patient.id;

      // 2. Insert emergency profile
      await db.query(
        `INSERT INTO emergency_profiles (patient_id, blood_type, allergies, medications, chronic_conditions, emergency_contacts, hidden_fields)
         VALUES ($1, $2, '[]', '[]', '[]', '[]', '[]')`,
        [patientId, bloodType]
      );

      // 3. Automatically grant default consent policies to the doctor and clinic
      await db.query(
        `INSERT INTO consent_policies (patient_id, grantee_type, grantee_id, access_type, data_categories, purpose, expires_at, is_one_time)
         VALUES ($1, $2, $3, $4, $5::jsonb, $6, NULL, FALSE)`,
        [patientId, 'doctor', doctorId, 'read', JSON.stringify(['all']), 'Registering Doctor Access']
      );

      if (clinicId) {
        await db.query(
          `INSERT INTO consent_policies (patient_id, grantee_type, grantee_id, access_type, data_categories, purpose, expires_at, is_one_time)
           VALUES ($1, $2, $3, $4, $5::jsonb, $6, NULL, FALSE)`,
          [patientId, 'clinic', clinicId, 'read', JSON.stringify(['all']), 'Registering Clinic Access']
        );
      }

      // 4. Register patient on Fabric blockchain
      const mockPublicKey = `pubkey_${patientId.substring(0, 8)}`;
      await FabricGateway.submitTx('patient', 'CreatePatient', patientId, mockPublicKey, '[]');

      // 5. Generate emergency QR token
      const qrResult = await QRService.generateEmergencyQR(patientId);

      // 6. Log the registration
      await db.query(
        `INSERT INTO access_logs (patient_id, actor_id, actor_role, access_type, outcome, data_categories)
         VALUES ($1, $2, $3, 'write', 'granted', '["demographics"]')`,
        [patientId, doctorId, req.doctor!.role]
      );

      res.status(201).json({
        success: true,
        patient: {
          id: patient.id,
          fullName: patient.full_name,
          dateOfBirth: patient.date_of_birth,
          bloodType: patient.blood_type,
          phone: patient.phone,
          email: patient.email,
        },
        qrToken: qrResult.tokenId,
        qrPayload: qrResult.payload,
        message: 'Patient registered successfully in DB and anchored on-chain.',
      });
    } catch (err: any) {
      logger.error(`[PatientsRoutes] Failed to register patient: ${err.message}`);
      res.status(500).json({ error: 'Failed to register patient', details: err.message });
    }
  }
);

/**
 * PUT /api/patients/privacy
 * Update patient privacy settings (Patient only)
 */
router.put(
  '/privacy',
  requirePatient,
  [
    body('hiddenFields').isArray().withMessage('hiddenFields must be an array of strings'),
  ],
  async (req: AuthRequest, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ error: 'Validation failed', details: errors.array() });
      return;
    }

    const { hiddenFields } = req.body;
    const patientId = req.patientId!;

    try {
      await db.query(
        `UPDATE emergency_profiles
            SET hidden_fields = $1, updated_at = NOW()
          WHERE patient_id = $2`,
        [JSON.stringify(hiddenFields), patientId]
      );

      res.json({
        success: true,
        message: 'Privacy settings updated successfully.',
      });
    } catch (err: any) {
      logger.error(`[PatientsRoutes] Failed to update privacy: ${err.message}`);
      res.status(500).json({ error: 'Failed to update privacy settings', details: err.message });
    }
  }
);

export default router;
