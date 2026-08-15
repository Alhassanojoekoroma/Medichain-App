import { Router, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { requireDoctor, requirePatient, AuthRequest } from '../middleware/auth.middleware';
import { BreakGlassService } from '../services/BreakGlassService';
import { capabilityStatement, validateFhirResource } from '../domain/fhir';
import { authorize } from '../domain/authorization';
import { evaluateSyncCommand, SyncCommand } from '../domain/syncProtocol';
import { db } from '../config/db';
import { requireAuthenticated } from '../middleware/auth.middleware';
import { SessionService } from '../services/SessionService';
import { requireIdempotencyKey } from '../contracts/http';
import { generateHealthId } from '../services/HealthIdService';
import crypto from 'crypto';
import { readSecurityConfig } from '../config/environment';
import { TokenService } from '../services/TokenService';

const router = Router();

router.post('/sessions/logout', requireAuthenticated, async (req: AuthRequest, res: Response) => {
  await SessionService.revoke(req.actor!.sessionId, req.actor!.id);
  res.status(204).send();
});
router.get('/sessions/current', requireAuthenticated, (req: AuthRequest, res: Response) => {
  res.json({
    actor: { id: req.actor!.id, role: req.actor!.role, facilityId: req.actor!.facilityId, mfa: req.actor!.mfa, fullName: req.doctor?.fullName },
    session: req.session,
  });
});
router.get('/sessions', requireAuthenticated, async (req: AuthRequest, res: Response) => {
  const sessions = await SessionService.listForActor(req.actor!.id, req.actor!.sessionId);
  res.set('Cache-Control', 'no-store');
  res.json({ sessions });
});
router.delete('/sessions/:sessionId', requireAuthenticated, async (req: AuthRequest, res: Response) => {
  const revoked = await SessionService.revoke(req.params.sessionId, req.actor!.id);
  if (!revoked) return res.status(404).json({ error: { code: 'SESSION_NOT_FOUND' } });
  res.status(204).send();
});

router.post('/sessions/renew-sandbox', requireAuthenticated, (req: AuthRequest, res: Response) => {
  const config = readSecurityConfig();
  if (!config.isSyntheticSandbox || !config.allowDemoAuth || config.identityProviderMode !== 'sandbox') {
    return res.status(404).json({ error: { code: 'SESSION_RENEWAL_NOT_AVAILABLE' } });
  }
  const identity = req.identity!;
  const token = TokenService.signDoctorJWT(
    identity.sub,
    identity.role,
    identity.clinicId,
    identity.fullName,
    { mfa: identity.mfa, tokenVersion: identity.tokenVersion, authTime: identity.authTime }
  );
  const renewed = TokenService.verifyDoctorJWT(token);
  const absoluteExpiresAt = new Date((identity.authTime + config.sessionAbsoluteTimeoutSeconds) * 1000);
  res.json({
    token,
    session: {
      expiresAt: new Date(Math.min(renewed.exp * 1000, absoluteExpiresAt.getTime())).toISOString(),
      absoluteExpiresAt: absoluteExpiresAt.toISOString(),
    },
  });
});

router.get('/health-id', requirePatient, async (req: AuthRequest, res: Response) => {
  const result = await db.query(
    `SELECT id, status, issued_at, revoked_at FROM health_identifiers
      WHERE patient_id = $1 ORDER BY issued_at DESC`,
    [req.patientId]
  );
  res.json({ identifiers: result.rows });
});

router.post('/health-id/issue', requirePatient, async (req: AuthRequest, res: Response) => {
  const active = await db.query(`SELECT id FROM health_identifiers WHERE patient_id = $1 AND status = 'active'`, [req.patientId]);
  if (active.rowCount) return res.status(409).json({ error: { code: 'ACTIVE_HEALTH_ID_EXISTS' } });
  const id = crypto.randomUUID();
  const generated = generateHealthId();
  await db.query(
    `INSERT INTO health_identifiers (id, patient_id, identifier_hash, status) VALUES ($1,$2,$3,'active')`,
    [id, req.patientId, generated.identifierHash]
  );
  res.status(201).json({ id, identifier: generated.identifier, warning: 'The identifier is shown once. Store the physical token securely.' });
});

router.post('/health-id/lost', requirePatient, async (req: AuthRequest, res: Response) => {
  const oldId = await db.query(
    `UPDATE health_identifiers SET status = 'lost', revoked_at = NOW()
      WHERE patient_id = $1 AND status = 'active' RETURNING id`,
    [req.patientId]
  );
  if (!oldId.rowCount) return res.status(404).json({ error: { code: 'ACTIVE_HEALTH_ID_NOT_FOUND' } });
  const id = crypto.randomUUID();
  const generated = generateHealthId();
  await db.query(
    `INSERT INTO health_identifiers (id, patient_id, identifier_hash, status) VALUES ($1,$2,$3,'active')`,
    [id, req.patientId, generated.identifierHash]
  );
  await db.query(`UPDATE health_identifiers SET status = 'replaced', replaced_by = $1 WHERE id = $2`, [id, oldId.rows[0].id]);
  res.status(201).json({ id, identifier: generated.identifier, replacedId: oldId.rows[0].id });
});

router.post('/break-glass', requireDoctor,
  body('patientId').matches(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i),
  body('reasonCode').isIn(['unconscious-patient', 'life-threatening', 'unable-to-consent']),
  body('justification').isString().isLength({ min: 20, max: 500 }),
  async (req: AuthRequest, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ error: { code: 'VALIDATION_ERROR', details: errors.array() } });
    // Nurse emergency access is a clinical-governance decision and therefore
    // remains disabled. Break-glass is doctor-only in the approved v1 matrix.
    if (req.doctor!.role !== 'doctor') return res.status(403).json({ error: { code: 'BREAK_GLASS_ROLE_NOT_PERMITTED' } });
    try {
      const event = await BreakGlassService.open({
        patientId: req.body.patientId,
        actorId: req.doctor!.id,
        facilityId: req.doctor!.clinicId ?? '',
        mfa: req.doctor!.mfa,
        reasonCode: req.body.reasonCode,
        justification: req.body.justification,
      });
      res.status(201).json({ breakGlass: event, obligations: ['patient-notification', 'mandatory-review'] });
    } catch (error) {
      res.status(403).json({ error: { code: error instanceof Error ? error.message : 'BREAK_GLASS_DENIED' } });
    }
  });

router.get('/fhir/metadata', (_req, res) => res.json(capabilityStatement));
router.post('/fhir/$validate', requireDoctor, (req, res) => {
  const result = validateFhirResource(req.body);
  res.status(result.valid ? 200 : 422).json({ resourceType: 'OperationOutcome', issue: result.issues.map(diagnostics => ({ severity: 'error', code: 'invalid', diagnostics })) });
});

router.post('/sync/commands', requirePatient, async (req: AuthRequest, res: Response) => {
  const command = req.body as SyncCommand;
  if (!command || typeof command.id !== 'string' || typeof command.resourceId !== 'string' || typeof command.baseVersion !== 'number') {
    return res.status(400).json({ error: { code: 'SYNC_COMMAND_INVALID' } });
  }
  try {
    const idempotencyKey = requireIdempotencyKey(req.header('idempotency-key'));
    if (idempotencyKey !== command.id) return res.status(400).json({ error: { code: 'IDEMPOTENCY_KEY_MISMATCH' } });
  } catch {
    return res.status(400).json({ error: { code: 'IDEMPOTENCY_KEY_REQUIRED' } });
  }
  const authorization = authorize({
    actor: req.actor!,
    resource: { type: command.type === 'QR_REVOKE' ? 'qr-token' : command.type === 'CONSENT_UPDATE' ? 'consent' : 'patient-demographics', patientId: req.patientId },
    action: command.type === 'QR_REVOKE' ? 'revoke' : 'update',
    purpose: 'patient-service',
  });
  const decision = evaluateSyncCommand(
    { ...command, patientId: req.patientId! },
    req.actor!,
    { version: command.baseVersion, processedIds: new Set() },
    authorization
  );
  if (decision.status === 'accepted') {
    const claimed = await db.query(
      `WITH ensured AS (
         INSERT INTO resource_versions (patient_id, resource_id, version) VALUES ($1,$2,0)
         ON CONFLICT (patient_id, resource_id) DO NOTHING
       ), claimed AS (
         UPDATE resource_versions SET version = version + 1, updated_at = NOW()
          WHERE patient_id = $1 AND resource_id = $2 AND version = $3
        RETURNING version
       ), recorded AS (
         INSERT INTO offline_commands
           (command_id, patient_id, resource_id, command_type, base_version, resulting_version, payload_hash, status)
         SELECT $4,$1,$2,$5,$3,claimed.version,$6,'accepted' FROM claimed
         ON CONFLICT (command_id) DO NOTHING
         RETURNING resulting_version
       ) SELECT resulting_version FROM recorded`,
      [req.patientId, command.resourceId, command.baseVersion, command.id, command.type, decision.payloadHash]
    );
    if (claimed.rowCount) return res.status(202).json({ ...decision, nextVersion: Number(claimed.rows[0].resulting_version) });
    const duplicate = await db.query(`SELECT resulting_version FROM offline_commands WHERE command_id = $1 AND patient_id = $2`, [command.id, req.patientId]);
    if (duplicate.rowCount) return res.status(200).json({ status: 'duplicate', nextVersion: Number(duplicate.rows[0].resulting_version) });
    const current = await db.query(`SELECT version FROM resource_versions WHERE patient_id = $1 AND resource_id = $2`, [req.patientId, command.resourceId]);
    return res.status(409).json({ status: 'conflict', serverVersion: Number(current.rows[0]?.version ?? 0) });
  }
  res.status(decision.status === 'duplicate' ? 200 : decision.status === 'conflict' ? 409 : 403).json(decision);
});

export default router;
