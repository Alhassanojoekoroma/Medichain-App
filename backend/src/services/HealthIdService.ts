import crypto from 'crypto';

export type HealthIdStatus = 'active' | 'lost' | 'revoked' | 'replaced';

export interface HealthIdRecord {
  id: string;
  patientId: string;
  identifierHash: string;
  status: HealthIdStatus;
  replacedBy?: string;
}

export function generateHealthId(): { identifier: string; identifierHash: string } {
  const identifier = `SLH-${crypto.randomBytes(16).toString('base64url')}`;
  return { identifier, identifierHash: crypto.createHash('sha256').update(identifier).digest('hex') };
}

export function replaceLostHealthId(current: HealthIdRecord, replacementId: string): HealthIdRecord {
  if (current.status !== 'active' && current.status !== 'lost') throw new Error('HEALTH_ID_NOT_REPLACEABLE');
  if (!replacementId || replacementId === current.id) throw new Error('HEALTH_ID_REPLACEMENT_INVALID');
  return { ...current, status: 'replaced', replacedBy: replacementId };
}
