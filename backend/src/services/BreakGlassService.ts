import { db } from '../config/db';

const REASONS = new Set(['unconscious-patient', 'life-threatening', 'unable-to-consent']);
const CATEGORIES = ['allergies', 'medications', 'conditions', 'blood-type'];

export interface BreakGlassRequest {
  patientId: string;
  actorId: string;
  facilityId: string;
  mfa: boolean;
  reasonCode: string;
  justification: string;
}

export class BreakGlassService {
  static validate(input: BreakGlassRequest): void {
    if (!input.mfa) throw new Error('STEP_UP_REQUIRED');
    if (!REASONS.has(input.reasonCode)) throw new Error('EMERGENCY_REASON_INVALID');
    const length = input.justification.trim().length;
    if (length < 20 || length > 500) throw new Error('EMERGENCY_JUSTIFICATION_INVALID');
    if (!input.patientId || !input.actorId || !input.facilityId) throw new Error('EMERGENCY_IDENTITY_CONTEXT_REQUIRED');
  }

  static async open(input: BreakGlassRequest): Promise<{ id: string; expiresAt: string; categories: string[] }> {
    this.validate(input);
    const expiresAt = new Date(Date.now() + 15 * 60_000);
    const result = await db.query(
      `INSERT INTO break_glass_events
        (patient_id, actor_id, facility_id, reason_code, justification, approved_categories, expires_at)
       VALUES ($1,$2,$3,$4,$5,$6::jsonb,$7)
       RETURNING id`,
      [input.patientId, input.actorId, input.facilityId, input.reasonCode, input.justification.trim(), JSON.stringify(CATEGORIES), expiresAt]
    );
    return { id: result.rows[0].id, expiresAt: expiresAt.toISOString(), categories: [...CATEGORIES] };
  }

  static async verify(id: string, patientId: string, actorId: string, facilityId: string): Promise<boolean> {
    const result = await db.query(
      `SELECT id FROM break_glass_events
        WHERE id = $1 AND patient_id = $2 AND actor_id = $3 AND facility_id = $4
          AND expires_at > NOW()`,
      [id, patientId, actorId, facilityId]
    );
    return (result.rowCount ?? 0) === 1;
  }
}
