/**
 * backend/src/routes/consent.routes.ts
 * Patient consent management endpoints
 */
import { Router, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { ConsentService, GrantConsentInput } from '../services/ConsentService';
import { requirePatient, requireDoctor, requireAuthenticated, AuthRequest } from '../middleware/auth.middleware';
import { db } from '../config/db';
import { AuditService } from '../services/AuditService';
import { enforcePolicy } from '../middleware/authorization.middleware';

const router = Router();

/**
 * POST /api/consent
 * Patient grants consent to a doctor, clinic, or role.
 */
router.post('/', requirePatient,
  body('granteeType').isIn(['doctor', 'clinic']),
  body('granteeId').isString().isLength({ min: 1, max: 100 }),
  body('accessType').optional().isIn(['read', 'write']),
  body('dataCategories').isArray({ min: 1, max: 5 }),
  body('dataCategories.*').isIn(['labs', 'prescriptions', 'imaging', 'notes', 'referrals']),
  body('purpose').isIn(['treatment', 'care-coordination']),
  body('ttlHours').isInt({ min: 1, max: 720 }),
  enforcePolicy({ resourceType: 'consent', action: 'create', patientIdFrom: 'actor' }), async (req: AuthRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ error: { code: 'VALIDATION_ERROR', details: errors.array() } });
    const input: GrantConsentInput = {
      patientId: req.patientId!,
      granteeType: req.body.granteeType,
      granteeId: req.body.granteeId,
      accessType: req.body.accessType || 'read',
      dataCategories: req.body.dataCategories || ['all'],
      purpose: req.body.purpose,
      ttlHours: req.body.ttlHours,
      isOneTime: req.body.isOneTime,
    };

    const consentId = await ConsentService.grantConsent(input);
    res.json({ success: true, consentId, message: 'Consent granted successfully.' });
  } catch (err: any) {
    res.status(400).json({ error: { code: err.message || 'CONSENT_INVALID', message: 'Consent request was not accepted' } });
  }
});

/**
 * POST /api/consent/clinic
 * Patient grants consent to an entire clinic (all staff affiliated with that clinic).
 * Body: { clinicId, dataCategories?, ttlHours?, purpose? }
 */
router.post('/clinic', requirePatient,
  body('clinicId').isUUID(),
  body('dataCategories').isArray({ min: 1, max: 5 }),
  body('dataCategories.*').isIn(['labs', 'prescriptions', 'imaging', 'notes', 'referrals']),
  body('purpose').isIn(['treatment', 'care-coordination']),
  body('ttlHours').isInt({ min: 1, max: 720 }),
  enforcePolicy({ resourceType: 'consent', action: 'create', patientIdFrom: 'actor' }), async (req: AuthRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ error: { code: 'VALIDATION_ERROR', details: errors.array() } });
    const { clinicId, dataCategories, ttlHours, purpose } = req.body;
    if (!clinicId) {
      res.status(400).json({ error: 'clinicId is required' });
      return;
    }

    const consentId = await ConsentService.grantConsent({
      patientId: req.patientId!,
      granteeType: 'clinic',
      granteeId: clinicId,
      accessType: 'read',
      dataCategories,
      purpose,
      ttlHours,
    });

    res.json({ success: true, consentId, message: `Consent granted to verified clinicians at facility ${clinicId}, subject to relationship and purpose checks.` });
  } catch (err: any) {
    res.status(400).json({ error: { code: err.message || 'CONSENT_INVALID', message: 'Facility consent was not accepted' } });
  }
});

/**
 * POST /api/consent/role
 * Patient grants consent to all staff with a specific role (e.g., all nurses).
 * Body: { role: 'nurse'|'doctor'|'staff', dataCategories?, ttlHours?, purpose? }
 * Use case: "Allow all nurses at my hospital to check my allergy list during triage."
 */
router.post('/role', requirePatient, (_req, res) => {
  res.status(410).json({ error: { code: 'BROAD_ROLE_CONSENT_REMOVED', message: 'Choose a verified practitioner or facility and granular data categories.' } });
});

/**
 * GET /api/consent
 * List active consents for the logged-in doctor (granted to them or their clinic).
 * Requires Doctor JWT
 */
router.get('/', requireDoctor, async (req: AuthRequest, res: Response) => {
  try {
    const doctor = req.doctor!;
    const result = await db.query(
      `SELECT cp.id, cp.patient_id, p.full_name AS patient_name, cp.grantee_type,
              cp.grantee_id, cp.access_type, cp.data_categories, cp.purpose,
              cp.expires_at, cp.created_at, cp.is_one_time
         FROM consent_policies cp
         JOIN patients p ON p.id = cp.patient_id
        WHERE cp.is_revoked = FALSE
          AND (cp.expires_at IS NULL OR cp.expires_at > NOW())
          AND (
            (cp.grantee_type = 'doctor' AND cp.grantee_id = $1)
            OR (cp.grantee_type = 'clinic' AND cp.grantee_id = $2)
          )
        ORDER BY cp.created_at DESC`,
      [doctor.id, doctor.clinicId || '']
    );

    res.json({ success: true, consents: result.rows });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch doctor consents', details: err.message });
  }
});

/**
 * GET /api/consent/mine
 * List active consents for the patient.
 */
router.get('/mine', requirePatient, async (req: AuthRequest, res: Response) => {
  try {
    const consents = await ConsentService.listPatientConsents(req.patientId!);
    res.json({ success: true, consents });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch consents', details: err.message });
  }
});

/**
 * DELETE /api/consent/:id
 * Revoke a specific consent policy. Supports both Patient JWT and Doctor JWT.
 */
router.delete('/:id', requireAuthenticated, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const payload = req.actor!;
    
    if (payload.role === 'patient') {
      // Patient revoking consent they granted
      const rowsAffected = await ConsentService.revokeConsent(
        payload.id,
        { consentId: req.params.id },
        req.body.reason
      );
      if (rowsAffected === 0) {
        res.status(404).json({ error: 'Consent not found or already revoked' });
        return;
      }
      res.json({ success: true, message: 'Consent revoked successfully.' });
    } else if (['doctor', 'nurse', 'admin', 'staff'].includes(payload.role)) {
      // Doctor/Clinic revoking consent granted to them
      const consentId = req.params.id;
      const result = await db.query(
        `UPDATE consent_policies
            SET is_revoked = TRUE, revoked_at = NOW()
          WHERE id = $1 AND is_revoked = FALSE
            AND (
              (grantee_type = 'doctor' AND grantee_id = $2)
              OR (grantee_type = 'clinic' AND grantee_id = $3)
            )
          RETURNING patient_id`,
        [consentId, payload.id, payload.facilityId || '']
      );

      if (result.rowCount === 0) {
        res.status(404).json({ error: 'Consent not found, already revoked, or unauthorized' });
        return;
      }

      const patientId = result.rows[0].patient_id;

      // Log audit trail
      await AuditService.log({
        patientId,
        actorId: payload.id,
        actorRole: payload.role,
        accessType: 'revoke_consent',
        outcome: 'granted',
      });

      res.json({ success: true, message: 'Access key/consent revoked successfully by clinician.' });
    } else {
      res.status(403).json({ error: 'Forbidden role' });
    }
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to revoke consent', details: err.message });
  }
});

/**
 * DELETE /api/consent/doctor/:doctorId
 * Revoke ALL active consents for a specific doctor.
 */
router.delete('/doctor/:doctorId', requirePatient, async (req: AuthRequest, res: Response) => {
  try {
    const rowsAffected = await ConsentService.revokeConsent(
      req.patientId!,
      { doctorId: req.params.doctorId },
      req.body.reason
    );
    res.json({ success: true, message: `Revoked ${rowsAffected} active policies for doctor.` });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to revoke doctor access', details: err.message });
  }
});

export default router;
