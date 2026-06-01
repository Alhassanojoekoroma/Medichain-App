/**
 * backend/src/services/ConsentService.ts
 * 
 * Patient-controlled consent and revocation logic.
 * Every grant/revoke is written to Postgres immediately and
 * queued for Hyperledger Fabric sync.
 */

import { db } from '../config/db';
import { AuditService } from './AuditService';
import { OfflineQueue } from './OfflineQueue';

export type GranteeType = 'doctor' | 'clinic' | 'role' | 'purpose';
export type AccessType = 'read' | 'write' | 'emergency_read';
export type DataCategory = 'labs' | 'prescriptions' | 'imaging' | 'notes' | 'referrals' | 'all';

export interface GrantConsentInput {
  patientId: string;
  granteeType: GranteeType;
  granteeId: string;         // doctorId, clinicId, 'nurse', 'emergency', etc.
  accessType: AccessType;
  dataCategories: DataCategory[];
  purpose?: string;
  ttlHours?: number;         // undefined = no expiry
  isOneTime?: boolean;
}

export class ConsentService {

  /**
   * Grant consent from a patient to a doctor/clinic/role.
   * Returns the new consent policy ID.
   */
  static async grantConsent(input: GrantConsentInput): Promise<string> {
    const expiresAt = input.ttlHours
      ? new Date(Date.now() + input.ttlHours * 3600 * 1000)
      : null;

    const result = await db.query(
      `INSERT INTO consent_policies
         (patient_id, grantee_type, grantee_id, access_type, data_categories,
          purpose, expires_at, is_one_time)
       VALUES ($1,$2,$3,$4,$5::jsonb,$6,$7,$8)
       RETURNING id`,
      [
        input.patientId,
        input.granteeType,
        input.granteeId,
        input.accessType,
        JSON.stringify(input.dataCategories),
        input.purpose ?? null,
        expiresAt,
        input.isOneTime ?? false,
      ]
    );

    const consentId = result.rows[0].id;

    // Queue for blockchain sync (offline-safe)
    await OfflineQueue.enqueue('CONSENT_GRANT', {
      consentId,
      patientId: input.patientId,
      granteeId: input.granteeId,
      accessType: input.accessType,
      dataCategories: input.dataCategories,
      expiresAt: expiresAt?.toISOString(),
      isOneTime: input.isOneTime,
    });

    await AuditService.log({
      patientId: input.patientId,
      actorId: input.patientId,
      actorRole: 'patient',
      accessType: 'grant_consent',
      dataCategories: input.dataCategories,
      outcome: 'granted',
    });

    return consentId;
  }

  /**
   * Revoke consent by policy ID.
   * Also handles blanket revocation by doctor, clinic, or token.
   */
  static async revokeConsent(
    patientId: string,
    target: { consentId?: string; doctorId?: string; clinicId?: string; revokeAll?: boolean },
    reason?: string
  ): Promise<number> {
    let rowsAffected = 0;

    if (target.consentId) {
      const r = await db.query(
        `UPDATE consent_policies
            SET is_revoked = TRUE, revoked_at = NOW()
          WHERE id = $1 AND patient_id = $2 AND is_revoked = FALSE`,
        [target.consentId, patientId]
      );
      rowsAffected = r.rowCount ?? 0;
    } else if (target.doctorId) {
      const r = await db.query(
        `UPDATE consent_policies
            SET is_revoked = TRUE, revoked_at = NOW()
          WHERE patient_id = $1 AND grantee_id = $2 AND is_revoked = FALSE`,
        [patientId, target.doctorId]
      );
      rowsAffected = r.rowCount ?? 0;
    } else if (target.clinicId) {
      const r = await db.query(
        `UPDATE consent_policies
            SET is_revoked = TRUE, revoked_at = NOW()
          WHERE patient_id = $1 AND grantee_type = 'clinic' AND grantee_id = $2 AND is_revoked = FALSE`,
        [patientId, target.clinicId]
      );
      rowsAffected = r.rowCount ?? 0;
    } else if (target.revokeAll) {
      const r = await db.query(
        `UPDATE consent_policies
            SET is_revoked = TRUE, revoked_at = NOW()
          WHERE patient_id = $1 AND is_revoked = FALSE`,
        [patientId]
      );
      rowsAffected = r.rowCount ?? 0;
    }

    // Log revocation event
    await db.query(
      `INSERT INTO revocation_events (patient_id, revoked_type, revoked_target, reason)
       VALUES ($1, $2, $3, $4)`,
      [
        patientId,
        target.doctorId ? 'doctor' : target.clinicId ? 'clinic' : target.revokeAll ? 'all' : 'token',
        target.doctorId ?? target.clinicId ?? target.consentId ?? 'all',
        reason ?? null,
      ]
    );

    // Queue blockchain revocation sync
    await OfflineQueue.enqueue('CONSENT_REVOKE', {
      patientId,
      target,
      reason,
      timestamp: new Date().toISOString(),
    });

    return rowsAffected;
  }

  /**
   * Check if a specific doctor has active consent to access a patient's data.
   * Called on every access attempt — this is the authorization gate.
   */
  static async checkConsent(
    patientId: string,
    doctorId: string,
    clinicId: string | null,
    accessType: AccessType,
    requestedCategories: DataCategory[]
  ): Promise<{ allowed: boolean; consentId?: string; allowedCategories?: DataCategory[]; reason?: string }> {

    // Check direct doctor consent
    const result = await db.query(
      `SELECT id, data_categories, access_type, is_one_time, used_at, expires_at
         FROM consent_policies
        WHERE patient_id = $1
          AND is_revoked = FALSE
          AND (expires_at IS NULL OR expires_at > NOW())
          AND (
            (grantee_type = 'doctor' AND grantee_id = $2)
            OR (grantee_type = 'clinic' AND grantee_id = $3)
            OR (grantee_type = 'purpose' AND grantee_id = 'emergency' AND $4 = 'emergency_read')
          )
          AND access_type = $4
        ORDER BY created_at DESC
        LIMIT 1`,
      [patientId, doctorId, clinicId ?? '', accessType]
    );

    if (result.rowCount === 0) {
      return { allowed: false, reason: 'NO_CONSENT' };
    }

    const policy = result.rows[0];

    // One-time policy already used
    if (policy.is_one_time && policy.used_at) {
      return { allowed: false, reason: 'ONE_TIME_EXPIRED' };
    }

    const allowedCategories: DataCategory[] = policy.data_categories;
    const hasAll = allowedCategories.includes('all');
    const permitted = requestedCategories.every(
      cat => hasAll || allowedCategories.includes(cat)
    );

    if (!permitted) {
      return {
        allowed: false,
        reason: 'CATEGORY_NOT_PERMITTED',
        allowedCategories,
      };
    }

    // Mark one-time policy as used
    if (policy.is_one_time) {
      await db.query(`UPDATE consent_policies SET used_at = NOW() WHERE id = $1`, [policy.id]);
    }

    return { allowed: true, consentId: policy.id, allowedCategories };
  }

  /** List all active consents for a patient (for the UI) */
  static async listPatientConsents(patientId: string) {
    const result = await db.query(
      `SELECT id, grantee_type, grantee_id, access_type, data_categories,
              purpose, expires_at, is_one_time, created_at
         FROM consent_policies
        WHERE patient_id = $1 AND is_revoked = FALSE
        ORDER BY created_at DESC`,
      [patientId]
    );
    return result.rows;
  }
}
