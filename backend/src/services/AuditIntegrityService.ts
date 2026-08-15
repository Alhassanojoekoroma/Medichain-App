import crypto from 'crypto';

export interface IntegrityEvent {
  id: string;
  actorRefHash: string;
  subjectRefHash?: string;
  eventType: string;
  outcome: string;
  occurredAt: string;
  metadata: Record<string, string | number | boolean>;
}

function canonical(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(canonical).join(',')}]`;
  if (value && typeof value === 'object') {
    const object = value as Record<string, unknown>;
    return `{${Object.keys(object).sort().map(key => `${JSON.stringify(key)}:${canonical(object[key])}`).join(',')}}`;
  }
  return JSON.stringify(value);
}

export function pseudonymizeReference(reference: string, auditPepper: string): string {
  if (auditPepper.length < 32) throw new Error('AUDIT_PEPPER_TOO_SHORT');
  return crypto.createHmac('sha256', auditPepper).update(reference).digest('hex');
}

export function calculateEventHash(event: IntegrityEvent, previousHash: string | null): string {
  return crypto.createHash('sha256').update(canonical({ event, previousHash })).digest('hex');
}

export function verifyAuditChain(events: Array<IntegrityEvent & { previousHash: string | null; eventHash: string }>): boolean {
  let previous: string | null = null;
  for (const event of events) {
    if (event.previousHash !== previous) return false;
    const { previousHash, eventHash, ...integrityEvent } = event;
    if (calculateEventHash(integrityEvent, previousHash) !== eventHash) return false;
    previous = eventHash;
  }
  return true;
}
