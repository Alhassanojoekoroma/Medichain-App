/**
 * backend/src/routes/consent.routes.ts
 * Patient consent management endpoints
 */
import { Router, Response } from 'express';
import { ConsentService, GrantConsentInput } from '../services/ConsentService';
import { requirePatient, AuthRequest } from '../middleware/auth.middleware';

const router = Router();

/**
 * POST /api/consent
 * Patient grants consent to a doctor, clinic, or role.
 */
router.post('/', requirePatient, async (req: AuthRequest, res: Response) => {
  try {
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
    res.status(500).json({ error: 'Failed to grant consent', details: err.message });
  }
});

/**
 * POST /api/consent/clinic
 * Patient grants consent to an entire clinic (all staff affiliated with that clinic).
 * Body: { clinicId, dataCategories?, ttlHours?, purpose? }
 */
router.post('/clinic', requirePatient, async (req: AuthRequest, res: Response) => {
  try {
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
      dataCategories: dataCategories || ['all'],
      purpose: purpose || 'Clinic-level access',
      ttlHours,
    });

    res.json({ success: true, consentId, message: `Consent granted to clinic ${clinicId}. All affiliated staff can now access your records.` });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to grant clinic consent', details: err.message });
  }
});

/**
 * POST /api/consent/role
 * Patient grants consent to all staff with a specific role (e.g., all nurses).
 * Body: { role: 'nurse'|'doctor'|'staff', dataCategories?, ttlHours?, purpose? }
 * Use case: "Allow all nurses at my hospital to check my allergy list during triage."
 */
router.post('/role', requirePatient, async (req: AuthRequest, res: Response) => {
  try {
    const { role, dataCategories, ttlHours, purpose } = req.body;
    if (!role || !['doctor', 'nurse', 'staff', 'admin'].includes(role)) {
      res.status(400).json({ error: 'role must be one of: doctor, nurse, staff, admin' });
      return;
    }

    const consentId = await ConsentService.grantConsent({
      patientId: req.patientId!,
      granteeType: 'role',
      granteeId: role,
      accessType: 'read',
      dataCategories: dataCategories || ['labs', 'prescriptions'],
      purpose: purpose || `Role-level access for ${role}s`,
      ttlHours,
    });

    res.json({
      success: true,
      consentId,
      message: `Consent granted to all ${role}s. Any credentialed ${role} can now access your specified medical data categories.`,
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to grant role consent', details: err.message });
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
 * Revoke a specific consent policy.
 */
router.delete('/:id', requirePatient, async (req: AuthRequest, res: Response) => {
  try {
    const rowsAffected = await ConsentService.revokeConsent(
      req.patientId!,
      { consentId: req.params.id },
      req.body.reason
    );
    if (rowsAffected === 0) {
      return res.status(404).json({ error: 'Consent not found or already revoked' });
    }
    res.json({ success: true, message: 'Consent revoked.' });
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
