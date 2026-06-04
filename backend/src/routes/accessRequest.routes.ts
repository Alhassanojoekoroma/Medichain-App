/**
 * backend/src/routes/accessRequest.routes.ts
 * GAP 5: Doctor access request workflow endpoints
 * Doctors request access → Patients approve/deny asynchronously
 */
import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { AccessRequestService } from '../services/AccessRequestService';
import { requireDoctor, requirePatient, AuthRequest } from '../middleware/auth.middleware';
import { logger } from '../utils/logger';

const router = Router();

/**
 * POST /api/access-requests
 * Doctor submits an access request for a patient
 * Requires Doctor JWT
 */
router.post(
  '/', 
  requireDoctor, 
  [
    body('patientId').notEmpty().withMessage('patientId is required'),
    body('reason').notEmpty().withMessage('reason is required'),
    body('dataCategories').optional().isArray()
  ],
  async (req: AuthRequest, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ error: 'Validation failed', details: errors.array() });
      return;
    }

    const doctor = req.doctor!;
    const { patientId, reason, dataCategories } = req.body;

    try {
      const requestId = await AccessRequestService.createRequest({
        doctorId: doctor.id,
        patientId,
        reason,
        dataCategories: dataCategories || ['all'],
      });

      res.json({
        success: true,
        requestId,
        message: 'Access request sent to patient',
      });
    } catch (err: any) {
      logger.error(`Create access request error: ${err.message}`);
      res.status(500).json({ error: 'Failed to create request', details: err.message });
    }
  }
);

/**
 * GET /api/access-requests/doctor/my-requests
 * Doctor views their pending access requests
 * Requires Doctor JWT
 */
router.get('/doctor/my-requests', requireDoctor, async (req: AuthRequest, res: Response) => {
  const doctor = req.doctor!;

  try {
    const requests = await AccessRequestService.listDoctorRequests(doctor.id);
    res.json({ success: true, requests });
  } catch (err: any) {
    console.error('List doctor requests error:', err);
    res.status(500).json({ error: 'Failed to fetch requests', details: err.message });
  }
});

/**
 * GET /api/access-requests/patient/pending
 * Patient views their pending access requests from doctors
 * Requires Patient JWT
 */
router.get('/patient/pending', requirePatient, async (req: AuthRequest, res: Response) => {
  const patient = req.patient!;

  try {
    const requests = await AccessRequestService.listPendingRequests(patient.id);
    res.json({ success: true, requests });
  } catch (err: any) {
    console.error('List pending requests error:', err);
    res.status(500).json({ error: 'Failed to fetch requests', details: err.message });
  }
});

/**
 * GET /api/access-requests/patient/history
 * Patient views their request history (approved + denied)
 * Requires Patient JWT
 */
router.get('/patient/history', requirePatient, async (req: AuthRequest, res: Response) => {
  const patient = req.patient!;
  const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;

  try {
    const history = await AccessRequestService.listRequestHistory(patient.id, limit);
    res.json({ success: true, history });
  } catch (err: any) {
    console.error('List request history error:', err);
    res.status(500).json({ error: 'Failed to fetch history', details: err.message });
  }
});

/**
 * PATCH /api/access-requests/:id/approve
 * Patient approves a doctor's access request
 * Requires Patient JWT
 */
router.patch(
  '/:id/approve', 
  requirePatient, 
  [
    body('dataCategories').optional().isArray()
  ],
  async (req: AuthRequest, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ error: 'Validation failed', details: errors.array() });
      return;
    }

    const patient = req.patient!;
    const { id } = req.params;
    const { dataCategories } = req.body;

    try {
      await AccessRequestService.approveRequest({
        requestId: id,
        patientId: patient.id,
        dataCategories: dataCategories || ['all'],
      });

      res.json({
        success: true,
        message: 'Access request approved. Doctor can now view your records.',
      });
    } catch (err: any) {
      logger.error(`Approve request error: ${err.message}`);
      res.status(500).json({ error: 'Failed to approve request', details: err.message });
    }
  }
);

/**
 * PATCH /api/access-requests/:id/deny
 * Patient denies a doctor's access request
 * Requires Patient JWT
 */
router.patch(
  '/:id/deny', 
  requirePatient, 
  [
    body('denialReason').optional().isString()
  ],
  async (req: AuthRequest, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ error: 'Validation failed', details: errors.array() });
      return;
    }

    const patient = req.patient!;
    const { id } = req.params;
    const { denialReason } = req.body;

    try {
      await AccessRequestService.denyRequest({
        requestId: id,
        patientId: patient.id,
        denialReason,
      });

      res.json({
        success: true,
        message: 'Access request denied.',
      });
    } catch (err: any) {
      logger.error(`Deny request error: ${err.message}`);
      res.status(500).json({ error: 'Failed to deny request', details: err.message });
    }
  }
);

export default router;
