/**
 * backend/src/routes/audit.routes.ts
 * Audit logging and history endpoints
 */
import { Router, Response } from 'express';
import { AuditService } from '../services/AuditService';
import { requirePatient, requireDoctor, AuthRequest } from '../middleware/auth.middleware';
import { db } from '../config/db';

const router = Router();

/**
 * GET /api/audit
 * Get access history for the logged-in doctor's clinic.
 * Requires Doctor JWT
 */
router.get('/', requireDoctor, async (req: AuthRequest, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 100;
    // Query all access logs from database
    const result = await db.query(
      `SELECT al.id, al.patient_id, p.full_name AS patient_name, al.actor_id, al.actor_role,
              al.access_type, al.data_categories, al.is_emergency, al.outcome,
              al.denial_reason, al.created_at, al.ledger_tx_hash
         FROM access_logs al
         LEFT JOIN patients p ON p.id = al.patient_id
        ORDER BY al.created_at DESC
        LIMIT $1`,
      [limit]
    );

    // Format results to match what the doctor UI needs
    const logs = result.rows.map(row => {
      // Split role and name if stored as "doctor:Dr. Amara Kofi:Connaught Hospital"
      const actorParts = (row.actor_role || '').split(':');
      const role = actorParts[0] || 'Unknown';
      const actorName = actorParts[1] || 'Unknown';
      const clinicName = actorParts[2] || 'Connaught Hospital';
      
      return {
        id: row.id,
        patientId: row.patient_id,
        patientName: row.patient_name || 'Emergency Lookup',
        actorId: row.actor_id,
        actorRole: role,
        actorName: actorName,
        clinicName: clinicName,
        accessType: row.access_type,
        dataCategories: row.data_categories || [],
        isEmergency: row.is_emergency,
        outcome: row.outcome,
        denialReason: row.denial_reason,
        createdAt: row.created_at,
        ledgerTxHash: row.ledger_tx_hash
      };
    });

    res.json({ success: true, logs });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch audit logs', details: err.message });
  }
});

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
