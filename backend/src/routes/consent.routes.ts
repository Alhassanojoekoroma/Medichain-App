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
