import crypto from 'crypto';
import { Router, Response } from 'express';
import { requireDoctor, AuthRequest } from '../middleware/auth.middleware';
import { syntheticSandboxOnly } from '../middleware/containment.middleware';
import { AIDraft, consumeAIQuota, createAIDraft, reviewAIDraft, validateDocumentationRequest } from '../domain/aiGovernance';

const router = Router();
const drafts = new Map<string, AIDraft>();
const quotas = new Map<string, { userCount: number; facilityCount: number; costUnits: number }>();
const MODEL = { id: 'palmchain-synthetic-documentation', version: '1.0.0', useCase: 'clinical-note-draft', provider: 'local-synthetic', retention: 'none', clinicalAuthority: false };

router.use(requireDoctor, syntheticSandboxOnly('Responsible AI documentation assistant'));
router.use((req: AuthRequest, res: Response, next) => {
  if (process.env.AI_ASSISTANT_ENABLED !== 'true') return res.status(503).json({ error: { code: 'AI_KILL_SWITCH_ACTIVE' } });
  if (req.doctor!.role !== 'doctor') return res.status(403).json({ error: { code: 'DOCTOR_REVIEW_REQUIRED' } });
  next();
});

router.get('/model-register', (_req, res) => res.json({ models: [MODEL] }));

router.post('/drafts', (req: AuthRequest, res: Response) => {
  const request = validateDocumentationRequest(req.body);
  if (!request.valid) return res.status(422).json({ status: 'quarantined', reasons: request.reasons });
  const quotaKey = `${req.doctor!.clinicId}:${req.doctor!.id}`;
  try { quotas.set(quotaKey, consumeAIQuota(quotas.get(quotaKey) ?? { userCount: 0, facilityCount: 0, costUnits: 0 }, Math.ceil(request.sourceText!.length / 100))); }
  catch (error) { return res.status(429).json({ error: { code: error instanceof Error ? error.message : 'AI_QUOTA_EXCEEDED' } }); }
  // Synthetic deterministic provider: no network call and no provider credential.
  const sourceText = request.sourceText!;
  const output = { summary: sourceText.slice(0, 500), suggestedNote: `Draft for clinician review: ${sourceText.slice(0, 1500)}`, warnings: ['AI draft — verify every statement before signing.'], sourceRefs: request.sourceRefs!, confidence: 0.5 };
  const draft = createAIDraft({ id: crypto.randomUUID(), modelId: MODEL.id, modelVersion: MODEL.version, createdBy: req.doctor!.id, output });
  drafts.set(draft.id, draft);
  res.status(201).json({ draft });
});

router.post('/drafts/:id/review', (req: AuthRequest, res: Response) => {
  const draft = drafts.get(req.params.id);
  if (!draft) return res.status(404).json({ error: { code: 'AI_DRAFT_NOT_FOUND' } });
  try { const reviewed = reviewAIDraft(draft, { reviewerId: req.doctor!.id, decision: req.body.decision, acceptedText: req.body.acceptedText }); drafts.set(reviewed.id, reviewed); res.json({ draft: reviewed }); }
  catch (error) { res.status(409).json({ error: { code: error instanceof Error ? error.message : 'AI_REVIEW_REJECTED' } }); }
});

export default router;
