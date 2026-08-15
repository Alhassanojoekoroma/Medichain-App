import crypto from 'crypto';
import { ActorContext, AuthorizationDecision } from './authorization';

export type SyncCommandType = 'CONSENT_UPDATE' | 'QR_REVOKE' | 'PROFILE_UPDATE';

export interface SyncCommand {
  id: string;
  type: SyncCommandType;
  resourceId: string;
  patientId: string;
  baseVersion: number;
  issuedAt: string;
  payload: Record<string, unknown>;
}

export interface StoredCommandState {
  version: number;
  processedIds: Set<string>;
}

export type SyncDecision =
  | { status: 'accepted'; nextVersion: number; payloadHash: string }
  | { status: 'duplicate'; nextVersion: number }
  | { status: 'conflict'; serverVersion: number }
  | { status: 'denied'; code: string };

export function evaluateSyncCommand(
  command: SyncCommand,
  actor: ActorContext,
  state: StoredCommandState,
  authorization: AuthorizationDecision,
  now = new Date()
): SyncDecision {
  if (state.processedIds.has(command.id)) return { status: 'duplicate', nextVersion: state.version };
  if (actor.role !== 'patient' || actor.id !== command.patientId) return { status: 'denied', code: 'SYNC_ACTOR_MISMATCH' };
  if (!authorization.allowed) return { status: 'denied', code: authorization.code };
  const issuedAt = Date.parse(command.issuedAt);
  if (!Number.isFinite(issuedAt) || issuedAt > now.getTime() + 5 * 60_000 || issuedAt < now.getTime() - 30 * 24 * 60 * 60_000) {
    return { status: 'denied', code: 'SYNC_TIMESTAMP_INVALID' };
  }
  if (!Number.isSafeInteger(command.baseVersion) || command.baseVersion !== state.version) {
    return { status: 'conflict', serverVersion: state.version };
  }
  const payloadHash = crypto.createHash('sha256').update(JSON.stringify(command.payload)).digest('hex');
  return { status: 'accepted', nextVersion: state.version + 1, payloadHash };
}
