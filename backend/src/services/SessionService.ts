import { db } from '../config/db';
import { readSecurityConfig } from '../config/environment';
import { DoctorJWT } from './TokenService';

export interface SessionState {
  revokedAt?: string | null;
  expiresAt: string;
  tokenVersion: number;
  actorStatus: 'active' | 'suspended' | 'disabled';
  facilityActive?: boolean;
  lastActivityAt?: string;
  absoluteExpiresAt?: string;
  idleTimeoutSeconds?: number;
}

export function isSessionStateActive(state: SessionState, tokenVersion: number, now = new Date()): boolean {
  const idleActive = !state.lastActivityAt || !state.idleTimeoutSeconds ||
    Date.parse(state.lastActivityAt) + state.idleTimeoutSeconds * 1000 > now.getTime();
  const absoluteActive = !state.absoluteExpiresAt || Date.parse(state.absoluteExpiresAt) > now.getTime();
  return !state.revokedAt && state.actorStatus === 'active' && state.facilityActive !== false &&
    state.tokenVersion === tokenVersion && Date.parse(state.expiresAt) > now.getTime() && idleActive && absoluteActive;
}

export interface ActiveSession {
  expiresAt: string;
  idleExpiresAt: string;
  absoluteExpiresAt: string;
}

export interface SessionSummary {
  id: string;
  actorRole: string;
  facilityId?: string;
  mfaVerifiedAt?: string;
  lastActivityAt: string;
  expiresAt: string;
  absoluteExpiresAt: string;
  revokedAt?: string;
  current: boolean;
}

export class SessionService {
  static async listForActor(actorId: string, currentSessionId: string): Promise<SessionSummary[]> {
    const result = await db.query(
      `SELECT id, actor_role, facility_id, mfa_verified_at, last_activity_at,
              expires_at, absolute_expires_at, revoked_at
         FROM identity_sessions
        WHERE actor_id = $1
        ORDER BY last_activity_at DESC`,
      [actorId]
    );
    return result.rows.map((row: any) => ({
      id: String(row.id),
      actorRole: row.actor_role,
      facilityId: row.facility_id ?? undefined,
      mfaVerifiedAt: row.mfa_verified_at ? new Date(row.mfa_verified_at).toISOString() : undefined,
      lastActivityAt: new Date(row.last_activity_at).toISOString(),
      expiresAt: new Date(row.expires_at).toISOString(),
      absoluteExpiresAt: new Date(row.absolute_expires_at).toISOString(),
      revokedAt: row.revoked_at ? new Date(row.revoked_at).toISOString() : undefined,
      current: String(row.id) === currentSessionId,
    }));
  }

  static async assertActive(payload: DoctorJWT, options: { touchActivity?: boolean } = {}): Promise<ActiveSession> {
    const config = readSecurityConfig();
    if (payload.identityIssuer || payload.identitySubject) {
      if (!payload.identityIssuer || !payload.identitySubject) throw new Error('IDENTITY_BINDING_INCOMPLETE');
      const binding = await db.query(
        `SELECT actor_id, actor_role FROM identity_bindings
          WHERE issuer = $1 AND subject = $2 AND is_active = TRUE`,
        [payload.identityIssuer, payload.identitySubject]
      );
      if (!binding.rowCount || String(binding.rows[0].actor_id) !== payload.sub || binding.rows[0].actor_role !== payload.role) {
        throw new Error('IDENTITY_BINDING_INVALID');
      }
    }
    const expiresAt = new Date(payload.exp * 1000);
    const absoluteExpiresAt = new Date((payload.authTime + config.sessionAbsoluteTimeoutSeconds) * 1000);
    await db.query(
      `INSERT INTO identity_sessions
         (id, actor_id, actor_role, facility_id, token_version, mfa_verified_at, expires_at, last_activity_at, absolute_expires_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,NOW(),$8)
       ON CONFLICT (id) DO UPDATE
         SET expires_at = GREATEST(identity_sessions.expires_at, EXCLUDED.expires_at)
       WHERE identity_sessions.revoked_at IS NULL`,
      [payload.sid, payload.sub, payload.role, payload.clinicId ?? null, payload.tokenVersion, payload.mfa ? new Date() : null, expiresAt, absoluteExpiresAt]
    );
    const session = await db.query(
      `SELECT revoked_at, expires_at, token_version, last_activity_at, absolute_expires_at
         FROM identity_sessions WHERE id = $1 AND actor_id = $2`,
      [payload.sid, payload.sub]
    );
    if (!session.rowCount) throw new Error('SESSION_NOT_REGISTERED');
    let status = 'active';
    let facilityActive = true;
    if (payload.role === 'patient') {
      const actor = await db.query(`SELECT account_status FROM patients WHERE id = $1`, [payload.sub]);
      if (!actor.rowCount) throw new Error('ACTOR_NOT_FOUND');
      status = actor.rows[0].account_status ?? 'active';
    } else {
      const actor = await db.query(
        `SELECT d.account_status, d.clinic_id AS actor_facility_id, c.is_active AS facility_active
           FROM doctors d JOIN clinics c ON c.id = d.clinic_id WHERE d.id = $1`,
        [payload.sub]
      );
      if (!actor.rowCount) throw new Error('ACTOR_NOT_FOUND');
      status = actor.rows[0].account_status ?? 'active';
      facilityActive = actor.rows[0].facility_active !== false;
      if (!payload.clinicId || String(actor.rows[0].actor_facility_id) !== payload.clinicId) {
        throw new Error('IDENTITY_FACILITY_MISMATCH');
      }
    }
    if (!isSessionStateActive({
      revokedAt: session.rows[0].revoked_at,
      expiresAt: new Date(session.rows[0].expires_at).toISOString(),
      lastActivityAt: new Date(session.rows[0].last_activity_at).toISOString(),
      absoluteExpiresAt: new Date(session.rows[0].absolute_expires_at).toISOString(),
      idleTimeoutSeconds: config.sessionIdleTimeoutSeconds,
      tokenVersion: Number(session.rows[0].token_version),
      actorStatus: status as SessionState['actorStatus'],
      facilityActive,
    }, payload.tokenVersion)) throw new Error('SESSION_REVOKED');

    let lastActivityAt = new Date(session.rows[0].last_activity_at);
    if (options.touchActivity !== false) {
      const touched = await db.query(
        `UPDATE identity_sessions SET last_activity_at = NOW()
          WHERE id = $1 AND actor_id = $2 AND revoked_at IS NULL
          RETURNING last_activity_at`,
        [payload.sid, payload.sub]
      );
      if (!touched.rowCount) throw new Error('SESSION_REVOKED');
      lastActivityAt = new Date(touched.rows[0].last_activity_at);
    }
    return {
      expiresAt: expiresAt.toISOString(),
      idleExpiresAt: new Date(lastActivityAt.getTime() + config.sessionIdleTimeoutSeconds * 1000).toISOString(),
      absoluteExpiresAt: absoluteExpiresAt.toISOString(),
    };
  }

  static async revoke(sessionId: string, actorId: string): Promise<boolean> {
    const result = await db.query(
      `UPDATE identity_sessions SET revoked_at = NOW()
        WHERE id = $1 AND actor_id = $2 AND revoked_at IS NULL`,
      [sessionId, actorId]
    );
    return (result.rowCount ?? 0) === 1;
  }
}
