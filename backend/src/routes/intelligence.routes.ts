import crypto from 'crypto';
import { Router, Response } from 'express';
import { requireDoctor, AuthRequest } from '../middleware/auth.middleware';
import { syntheticSandboxOnly } from '../middleware/containment.middleware';
import { decideExport, ExportRequest, INDICATOR_CATALOG, IntelligenceSignal, publishAggregate, reviewSignal } from '../domain/healthIntelligence';

const router = Router();
const aggregates: unknown[] = [];
const signals = new Map<string, IntelligenceSignal>();
const exportRequests = new Map<string, ExportRequest>();
router.use(requireDoctor, syntheticSandboxOnly('Ministry health intelligence'));
router.use((req: AuthRequest, res: Response, next) => req.doctor!.role === 'government' && req.doctor!.mfa ? next() : res.status(403).json({ error: { code: 'MINISTRY_ANALYST_REQUIRED' } }));

router.get('/indicators', (_req, res) => res.json({ catalog: INDICATOR_CATALOG, dataLevel: 'aggregate-only' }));
router.post('/aggregates', (req: AuthRequest, res: Response) => {
  if (req.body.patientId || req.body.rows || req.body.records) return res.status(422).json({ error: { code: 'ROW_LEVEL_DATA_PROHIBITED' } });
  try { const aggregate = { ...publishAggregate(req.body), provenance: { submittedBy: req.doctor!.id, submittedAt: new Date().toISOString(), interface: 'sandbox-hih-contract-v1' } }; aggregates.push(aggregate); res.status(202).json({ aggregate }); }
  catch (error) { res.status(422).json({ error: { code: error instanceof Error ? error.message : 'INDICATOR_INPUT_INVALID' } }); }
});
router.get('/aggregates', (_req, res) => res.json({ aggregates, feedHealth: { status: 'synthetic', received: aggregates.length, lastReceivedAt: aggregates.length ? new Date().toISOString() : null } }));
router.post('/signals', (req: AuthRequest, res: Response) => {
  if (!INDICATOR_CATALOG[req.body.indicator as keyof typeof INDICATOR_CATALOG] || typeof req.body.rationale !== 'string') return res.status(422).json({ error: { code: 'SIGNAL_INVALID' } });
  const signal: IntelligenceSignal = { id: crypto.randomUUID(), status: 'pending-review', indicator: req.body.indicator, rationale: req.body.rationale.slice(0, 500), createdBy: req.body.createdBy === 'ai' ? 'ai' : 'rule' };
  signals.set(signal.id, signal); res.status(201).json({ signal });
});
router.post('/signals/:id/review', (req: AuthRequest, res: Response) => {
  const signal = signals.get(req.params.id); if (!signal) return res.status(404).json({ error: { code: 'SIGNAL_NOT_FOUND' } });
  try { const reviewed = reviewSignal(signal, req.doctor!.id, req.body.decision); signals.set(reviewed.id, reviewed); res.json({ signal: reviewed }); }
  catch (error) { res.status(409).json({ error: { code: error instanceof Error ? error.message : 'SIGNAL_REVIEW_INVALID' } }); }
});
router.post('/exports', (req: AuthRequest, res: Response) => { const request: ExportRequest = { id: crypto.randomUUID(), requestedBy: req.doctor!.id, status: 'pending' }; exportRequests.set(request.id, request); res.status(201).json({ request }); });
router.post('/exports/:id/decision', (req: AuthRequest, res: Response) => {
  const request = exportRequests.get(req.params.id); if (!request) return res.status(404).json({ error: { code: 'EXPORT_NOT_FOUND' } });
  try { const decided = decideExport(request, req.doctor!.id, req.body.decision); exportRequests.set(decided.id, decided); res.json({ request: decided }); }
  catch (error) { res.status(409).json({ error: { code: error instanceof Error ? error.message : 'EXPORT_DECISION_INVALID' } }); }
});

export default router;
