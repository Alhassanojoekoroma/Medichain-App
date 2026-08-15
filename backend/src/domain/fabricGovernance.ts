import crypto from 'crypto';

export type AnchorEventType = 'AUDIT' | 'CONSENT_GRANTED' | 'CONSENT_REVOKED' | 'CLINICAL_RECORD_SIGNED' | 'ACCESS_DECISION';
export interface LedgerAnchor {
  schemaVersion: 1;
  eventId: string;
  eventType: AnchorEventType;
  payloadDigest: string;
  policyVersion: string;
  organization: string;
  occurredAt: string;
}

const EVENT_TYPES = new Set<AnchorEventType>(['AUDIT', 'CONSENT_GRANTED', 'CONSENT_REVOKED', 'CLINICAL_RECORD_SIGNED', 'ACCESS_DECISION']);
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function canonical(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(canonical).join(',')}]`;
  if (value && typeof value === 'object') return `{${Object.entries(value as Record<string, unknown>).sort(([a], [b]) => a.localeCompare(b)).map(([key, item]) => `${JSON.stringify(key)}:${canonical(item)}`).join(',')}}`;
  return JSON.stringify(value);
}

export function createLedgerAnchor(input: { eventId: string; eventType: AnchorEventType; sourcePayload: unknown; policyVersion: string; organization: string; occurredAt?: string }, digestSecret: string): LedgerAnchor {
  if (!UUID.test(input.eventId) || !EVENT_TYPES.has(input.eventType)) throw new Error('ANCHOR_INPUT_INVALID');
  if (!/^[A-Za-z][A-Za-z0-9.-]{2,63}$/.test(input.organization) || !/^[A-Za-z0-9.-]{1,32}$/.test(input.policyVersion)) throw new Error('ANCHOR_GOVERNANCE_INVALID');
  if (digestSecret.length < 32) throw new Error('ANCHOR_DIGEST_SECRET_WEAK');
  return {
    schemaVersion: 1,
    eventId: input.eventId,
    eventType: input.eventType,
    payloadDigest: crypto.createHmac('sha256', digestSecret).update(canonical(input.sourcePayload)).digest('hex'),
    policyVersion: input.policyVersion,
    organization: input.organization,
    occurredAt: input.occurredAt ?? new Date().toISOString(),
  };
}

export function validateLedgerAnchor(value: unknown): value is LedgerAnchor {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const anchor = value as Record<string, unknown>;
  const allowed = ['schemaVersion', 'eventId', 'eventType', 'payloadDigest', 'policyVersion', 'organization', 'occurredAt'];
  return Object.keys(anchor).every(key => allowed.includes(key)) && anchor.schemaVersion === 1 && typeof anchor.eventId === 'string' && UUID.test(anchor.eventId) && EVENT_TYPES.has(anchor.eventType as AnchorEventType) && typeof anchor.payloadDigest === 'string' && /^[0-9a-f]{64}$/.test(anchor.payloadDigest) && typeof anchor.policyVersion === 'string' && typeof anchor.organization === 'string' && typeof anchor.occurredAt === 'string' && !Number.isNaN(Date.parse(anchor.occurredAt));
}

export type LedgerAction = 'anchor' | 'read' | 'governance';
export function authorizeLedgerIdentity(input: { mspId: string; role: string; action: LedgerAction; approvedMsps: ReadonlySet<string> }): boolean {
  if (!input.approvedMsps.has(input.mspId)) return false;
  if (input.action === 'anchor') return input.role === 'anchor-writer';
  if (input.action === 'read') return ['anchor-writer', 'anchor-auditor', 'consortium-admin'].includes(input.role);
  return input.role === 'consortium-admin';
}

export function validateMultiOrganizationEndorsement(requiredMsps: ReadonlySet<string>, endorsements: string[]): boolean {
  const unique = new Set(endorsements);
  return requiredMsps.size >= 2 && [...requiredMsps].every(msp => unique.has(msp));
}

export interface AnchorOutboxState { status: 'pending' | 'anchored' | 'failed'; attempts: number; txId?: string }
export function reconcileAnchor(state: AnchorOutboxState, result: { committed: boolean; txId?: string }): AnchorOutboxState {
  if (state.status === 'anchored') return state;
  if (result.committed && result.txId) return { status: 'anchored', attempts: state.attempts + 1, txId: result.txId };
  return { status: state.attempts + 1 >= 5 ? 'failed' : 'pending', attempts: state.attempts + 1 };
}
