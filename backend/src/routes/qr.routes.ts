/**
 * backend/src/routes/qr.routes.ts
 * QR generation endpoints — patient-authenticated
 */
import { Router, Response } from 'express';
import { QRService } from '../services/QRService';
import { requirePatient, AuthRequest } from '../middleware/auth.middleware';
import { body, validationResult } from 'express-validator';
import { disabledPendingSecurityReview } from '../middleware/containment.middleware';
import { enforcePolicy } from '../middleware/authorization.middleware';

const router = Router();

/**
 * POST /api/qr/generate
 * Generate a NORMAL sharing QR for the authenticated patient.
 * Body: { ttlSeconds?: number, isOneTime?: boolean }
 */
router.post(
  '/generate',
  requirePatient,
  enforcePolicy({ resourceType: 'qr-token', action: 'create', patientIdFrom: 'actor' }),
  body('ttlSeconds').optional().isInt({ min: 60, max: 3600 }),
  body('isOneTime').optional().isBoolean(),
  async (req: AuthRequest, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      const { ttlSeconds = 900, isOneTime = false } = req.body;
      const result = await QRService.generateNormalQR(req.patientId!, ttlSeconds, isOneTime);
      res.json({
        success: true,
        tokenId: result.tokenId,
        qrPayload: result.payload,        // encode this JSON as QR image on client
        message: 'Share this QR with your doctor. Never share the raw JSON directly.',
      });
    } catch (err) {
      res.status(500).json({ error: 'Failed to generate QR' });
    }
  }
);

/**
 * POST /api/qr/emergency
 * Generate/rotate the EMERGENCY bracelet QR for the authenticated patient.
 * Old emergency token is revoked automatically.
 */
router.post('/emergency', requirePatient, disabledPendingSecurityReview('Emergency QR issuance'), async (req: AuthRequest, res: Response) => {
  try {
    const result = await QRService.generateEmergencyQR(req.patientId!);
    res.json({
      success: true,
      tokenId: result.tokenId,
      qrPayload: result.payload,
      warning: 'Print or save this QR. It contains access to your emergency profile.',
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to generate emergency QR' });
  }
});

/**
 * DELETE /api/qr/token/:tokenId
 * Revoke a specific QR token by its DB ID.
 */
router.delete('/token/:tokenId', requirePatient, enforcePolicy({ resourceType: 'qr-token', action: 'revoke', patientIdFrom: 'actor' }), async (req: AuthRequest, res: Response) => {
  try {
    const { db } = await import('../config/db');
    const r = await db.query(
      `UPDATE access_tokens SET is_revoked = TRUE
        WHERE id = $1 AND patient_id = $2 AND is_revoked = FALSE`,
      [req.params.tokenId, req.patientId]
    );
    if ((r.rowCount ?? 0) === 0) return res.status(404).json({ error: 'Token not found or already revoked' });
    res.json({ success: true, message: 'QR token revoked. Existing scans will fail immediately.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to revoke token' });
  }
});

/**
 * GET /api/qr/mine
 * List all active QR tokens for the authenticated patient.
 */
router.get('/mine', requirePatient, enforcePolicy({ resourceType: 'qr-token', action: 'read', patientIdFrom: 'actor' }), async (req: AuthRequest, res: Response) => {
  try {
    const { db } = await import('../config/db');
    const result = await db.query(
      `SELECT id, token_type, expires_at, is_one_time, used_at, created_at
         FROM access_tokens
        WHERE patient_id = $1 AND is_revoked = FALSE
        ORDER BY created_at DESC`,
      [req.patientId]
    );
    res.json({ tokens: result.rows });
  } catch (err) {
    res.status(500).json({ error: 'Failed to list tokens' });
  }
});

export default router;
