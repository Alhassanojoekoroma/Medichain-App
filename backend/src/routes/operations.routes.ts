import { Router, Response } from 'express';
import { requireDoctor, AuthRequest } from '../middleware/auth.middleware';
import { REQUIRED_PILOT_GATES, assessPilotRelease, OperationalTelemetry, PilotEvidence } from '../domain/operationalReadiness';
import { db } from '../config/db';
import { FabricGateway } from '../services/FabricGateway';

const router = Router();
router.use(requireDoctor, (req: AuthRequest, res: Response, next) => req.doctor!.role === 'admin' && req.doctor!.mfa ? next() : res.status(403).json({ error: { code: 'OPERATIONS_ADMIN_REQUIRED' } }));

router.get('/readiness', (_req, res) => {
  const evidence: PilotEvidence[] = REQUIRED_PILOT_GATES.map(gate => ({ gate, status: 'pending', owner: 'unassigned' }));
  res.json({ assessment: assessPilotRelease({ evidence, criticalFindings: 0, highFindings: 0 }), evidence, notice: 'Pending is not approval. Attach reviewed evidence through the governed release process.' });
});
router.get('/metrics', (_req, res) => res.json({ metrics: OperationalTelemetry.snapshot(), classification: 'privacy-minimized-process-window', targets: { ordinaryP95Ms: 500, errorRatePercent: 1 } }));
router.get('/dependency-health', async (_req, res) => {
  let database: 'available' | 'unavailable' = 'unavailable';
  try { await db.query('SELECT 1'); database = 'available'; } catch { database = 'unavailable'; }
  const fabric = await FabricGateway.healthCheck();
  const dependencies = { database, fabric: fabric.mode === 'disabled' ? 'disabled' : fabric.connected ? 'available' : 'unavailable', ai: process.env.AI_ASSISTANT_ENABLED === 'true' ? 'synthetic-evaluation' : 'disabled' };
  res.status(database === 'available' ? 200 : 503).json({ status: database === 'available' ? 'ready' : 'not-ready', dependencies, checkedAt: new Date().toISOString() });
});
router.get('/pipeline-health', async (_req, res) => {
  const [uploads, outbox] = await Promise.all([
    db.query(`SELECT state, COUNT(*)::int AS count FROM medical_file_uploads GROUP BY state`),
    db.query(`SELECT topic, status, COUNT(*)::int AS count FROM outbox_events GROUP BY topic, status`),
  ]);
  res.set('Cache-Control', 'no-store');
  res.json({
    uploads: uploads.rows,
    outbox: outbox.rows,
    containsPatientData: false,
    checkedAt: new Date().toISOString(),
  });
});

export default router;
