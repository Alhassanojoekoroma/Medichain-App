/**
 * backend/src/routes/audit.routes.ts
 * Audit logging and history endpoints
 */
import { Router, Response } from 'express';
import { AuditService } from '../services/AuditService';
import { requirePatient, AuthRequest } from '../middleware/auth.middleware';

const router = Router();

/**
 * GET /api/audit/patient
 * Get access history for the authenticated patient.
 */
router.get('/patient', requirePatient, async (req: AuthRequest, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 50;
    const history = await AuditService.getPatientAccessHistory(req.patientId!, limit);
    res.json({ success: true, history });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch audit history', details: err.message });
  }
});

/**
 * POST /api/audit/sync
 * Manually trigger the offline queue to sync events to Hyperledger Fabric.
 * (Usually called by a background cron job)
 */
router.post('/sync', async (req, res) => {
  try {
    const result = await AuditService.syncToLedger();
    res.json({ success: true, result });
  } catch (err: any) {
    res.status(500).json({ error: 'Sync failed', details: err.message });
  }
});

export default router;
