import crypto from 'crypto';

export interface DocumentationDraftOutput { summary: string; suggestedNote: string; warnings: string[]; sourceRefs: string[]; confidence: number }
export interface AIDraft { id: string; status: 'generated' | 'quarantined' | 'accepted' | 'rejected'; modelId: string; modelVersion: string; output?: DocumentationDraftOutput; quarantineReasons: string[]; createdBy: string; reviewedBy?: string; reviewedAt?: string; acceptedText?: string; changeDigest?: string }

const INJECTION = /(ignore|disregard).{0,30}(previous|system|instruction)|system prompt|tool[_ -]?call|developer message/i;
const UNSAFE_AUTHORITY = /\b(diagnosis is|must prescribe|start treatment|discharge the patient)\b/i;

export function validateDocumentationRequest(input: unknown): { valid: boolean; reasons: string[]; sourceText?: string; sourceRefs?: string[] } {
  if (!input || typeof input !== 'object') return { valid: false, reasons: ['REQUEST_INVALID'] };
  const value = input as Record<string, unknown>;
  const reasons: string[] = [];
  if (typeof value.sourceText !== 'string' || value.sourceText.trim().length < 10 || value.sourceText.length > 4000) reasons.push('SOURCE_TEXT_INVALID');
  if (!Array.isArray(value.sourceRefs) || value.sourceRefs.length < 1 || value.sourceRefs.length > 20 || value.sourceRefs.some(ref => typeof ref !== 'string' || ref.length > 100)) reasons.push('SOURCE_REFS_INVALID');
  if (typeof value.sourceText === 'string' && INJECTION.test(value.sourceText)) reasons.push('PROMPT_INJECTION_DETECTED');
  return { valid: reasons.length === 0, reasons, sourceText: typeof value.sourceText === 'string' ? value.sourceText.trim() : undefined, sourceRefs: Array.isArray(value.sourceRefs) ? value.sourceRefs.filter((ref): ref is string => typeof ref === 'string') : undefined };
}

export function validateDocumentationOutput(input: unknown): { valid: boolean; reasons: string[]; output?: DocumentationDraftOutput } {
  if (!input || typeof input !== 'object') return { valid: false, reasons: ['OUTPUT_SCHEMA_INVALID'] };
  const value = input as Record<string, unknown>;
  const reasons: string[] = [];
  if (typeof value.summary !== 'string' || value.summary.length > 2000) reasons.push('SUMMARY_INVALID');
  if (typeof value.suggestedNote !== 'string' || value.suggestedNote.length > 4000) reasons.push('NOTE_INVALID');
  if (!Array.isArray(value.warnings) || value.warnings.some(item => typeof item !== 'string')) reasons.push('WARNINGS_INVALID');
  if (!Array.isArray(value.sourceRefs) || value.sourceRefs.some(item => typeof item !== 'string')) reasons.push('SOURCE_REFS_INVALID');
  if (typeof value.confidence !== 'number' || value.confidence < 0 || value.confidence > 1) reasons.push('CONFIDENCE_INVALID');
  if ((typeof value.summary === 'string' && UNSAFE_AUTHORITY.test(value.summary)) || (typeof value.suggestedNote === 'string' && UNSAFE_AUTHORITY.test(value.suggestedNote))) reasons.push('CLINICAL_AUTHORITY_CLAIM');
  return { valid: reasons.length === 0, reasons, output: reasons.length ? undefined : value as unknown as DocumentationDraftOutput };
}

export function createAIDraft(input: { id: string; modelId: string; modelVersion: string; createdBy: string; output: unknown }): AIDraft {
  const validation = validateDocumentationOutput(input.output);
  return { id: input.id, status: validation.valid ? 'generated' : 'quarantined', modelId: input.modelId, modelVersion: input.modelVersion, output: validation.output, quarantineReasons: validation.reasons, createdBy: input.createdBy };
}

export function reviewAIDraft(draft: AIDraft, input: { reviewerId: string; decision: 'accept' | 'reject'; acceptedText?: string; originalSuggestedText?: string; reviewedAt?: string }): AIDraft {
  if (draft.status !== 'generated' || draft.createdBy !== input.reviewerId) throw new Error('AI_REVIEW_NOT_PERMITTED');
  if (input.decision === 'accept' && (!input.acceptedText || input.acceptedText.length < 3 || input.acceptedText.length > 4000)) throw new Error('AI_ACCEPTED_TEXT_INVALID');
  const reviewedAt = input.reviewedAt ?? new Date().toISOString();
  const changeDigest = input.decision === 'accept' ? crypto.createHash('sha256').update(`${input.originalSuggestedText ?? draft.output?.suggestedNote ?? ''}\n${input.acceptedText}`).digest('hex') : undefined;
  return { ...draft, status: input.decision === 'accept' ? 'accepted' : 'rejected', reviewedBy: input.reviewerId, reviewedAt, acceptedText: input.decision === 'accept' ? input.acceptedText : undefined, changeDigest };
}

export function consumeAIQuota(state: { userCount: number; facilityCount: number; costUnits: number }, requestedUnits: number, limits = { user: 20, facility: 200, cost: 500 }): typeof state {
  if (!Number.isSafeInteger(requestedUnits) || requestedUnits <= 0) throw new Error('AI_COST_UNIT_INVALID');
  const next = { userCount: state.userCount + 1, facilityCount: state.facilityCount + 1, costUnits: state.costUnits + requestedUnits };
  if (next.userCount > limits.user || next.facilityCount > limits.facility || next.costUnits > limits.cost) throw new Error('AI_QUOTA_EXCEEDED');
  return next;
}
