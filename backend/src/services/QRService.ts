/**
 * backend/src/services/QRService.ts
 * 
 * Generates the three QR code types for MediChain SL:
 *   1. NORMAL  — routine data sharing (time-limited, revocable)
 *   2. EMERGENCY — bracelet QR, minimal critical data, no auth required
 *   3. SESSION  — doctor session reference after login
 * 
 * SECURITY: QR codes never contain PHI. They contain only a signed token
 * that references a server-side record. The server resolves the token
 * after validating consent, expiry, and revocation.
 */

import { db } from '../config/db';
import { TokenService, QRType, QRPayload } from './TokenService';

export interface GenerateQRResult {
  payload: QRPayload;      // JSON to encode into QR image
  tokenId: string;         // DB row UUID for management
}

export class QRService {

  /**
   * Generate a NORMAL QR for routine doctor sharing.
   * 
   * @param patientId  — authenticated patient's UUID
   * @param ttlSeconds — 0 = permanent (until revoked), otherwise time-limited
   * @param isOneTime  — if true, invalidated after first successful scan
   */
  static async generateNormalQR(
    patientId: string,
    ttlSeconds = 0,
    isOneTime = false
  ): Promise<GenerateQRResult> {
    const rawToken = TokenService.generateRawToken();
    const payload = TokenService.buildQRPayload(rawToken, 'NORMAL', ttlSeconds || undefined);
    const tokenHash = TokenService.hashToken(rawToken);

    const result = await db.query(
      `INSERT INTO access_tokens
         (patient_id, token_type, token_hash, signature, expires_at, is_one_time)
       VALUES ($1, 'NORMAL', $2, $3, $4, $5)
       RETURNING id`,
      [
        patientId,
        tokenHash,
        payload.sig,
        payload.exp ? new Date(payload.exp * 1000) : null,
        isOneTime,
      ]
    );

    return { payload, tokenId: result.rows[0].id };
  }

  /**
   * Generate (or refresh) an EMERGENCY QR.
   * 
   * Emergency QR is stored separately, has no expiry by default,
   * and unlocks only the emergency_profiles row.
   * Patient can call this again to rotate the token (invalidates old one).
   */
  static async generateEmergencyQR(patientId: string): Promise<GenerateQRResult> {
    // Revoke any existing emergency token first (rotation)
    await db.query(
      `UPDATE access_tokens
         SET is_revoked = TRUE
       WHERE patient_id = $1 AND token_type = 'EMERGENCY' AND is_revoked = FALSE`,
      [patientId]
    );

    const rawToken = TokenService.generateRawToken();
    // Emergency QR: no expiry, no one-time restriction (must be durable for bracelet use)
    const payload = TokenService.buildQRPayload(rawToken, 'EMERGENCY');
    const tokenHash = TokenService.hashToken(rawToken);

    const result = await db.query(
      `INSERT INTO access_tokens
         (patient_id, token_type, token_hash, signature, expires_at, is_one_time)
       VALUES ($1, 'EMERGENCY', $2, $3, NULL, FALSE)
       RETURNING id`,
      [patientId, tokenHash, payload.sig]
    );

    return { payload, tokenId: result.rows[0].id };
  }

  /**
   * Generate a SESSION QR for a doctor (post-login).
   * Short-lived (30 min), tied to a specific doctor ID.
   */
  static async generateSessionQR(doctorId: string, patientId: string): Promise<QRPayload> {
    const sessionToken = TokenService.signSessionToken(doctorId, patientId);
    const payload = TokenService.buildQRPayload(sessionToken, 'SESSION', 1800);
    return payload;
  }

  /**
   * Resolve a scanned NORMAL token:
   * 1. Verify signature
   * 2. Check expiry
   * 3. Check revocation
   * 4. Return patientId for consent lookup
   */
  static async resolveNormalToken(payload: QRPayload): Promise<string> {
    if (!TokenService.verifyQRSignature(payload)) {
      throw new Error('INVALID_SIGNATURE');
    }
    if (TokenService.isQRExpired(payload)) {
      throw new Error('TOKEN_EXPIRED');
    }

    const tokenHash = TokenService.hashToken(payload.token);
    const result = await db.query(
      `SELECT id, patient_id, is_revoked, is_one_time, used_at
         FROM access_tokens
        WHERE token_hash = $1 AND token_type = 'NORMAL'`,
      [tokenHash]
    );

    if (result.rowCount === 0) throw new Error('TOKEN_NOT_FOUND');
    const row = result.rows[0];
    if (row.is_revoked) throw new Error('TOKEN_REVOKED');
    if (row.is_one_time && row.used_at) throw new Error('TOKEN_ALREADY_USED');

    // Mark as used for one-time tokens
    if (row.is_one_time) {
      await db.query(`UPDATE access_tokens SET used_at = NOW() WHERE id = $1`, [row.id]);
    }

    return row.patient_id;
  }

  /**
   * Resolve an EMERGENCY token → return emergency profile data.
   * No authentication required — any scanner can access minimal critical data.
   */
  static async resolveEmergencyToken(payload: QRPayload): Promise<Record<string, unknown>> {
    if (!TokenService.verifyQRSignature(payload)) {
      throw new Error('INVALID_SIGNATURE');
    }

    const tokenHash = TokenService.hashToken(payload.token);
    const result = await db.query(
      `SELECT at.patient_id, ep.allergies, ep.blood_type, ep.medications,
              ep.chronic_conditions, ep.emergency_contacts, ep.emergency_notes,
              ep.hidden_fields, p.full_name
         FROM access_tokens at
         JOIN emergency_profiles ep ON ep.patient_id = at.patient_id
         JOIN patients p ON p.id = at.patient_id
        WHERE at.token_hash = $1 AND at.token_type = 'EMERGENCY' AND at.is_revoked = FALSE`,
      [tokenHash]
    );

    if (result.rowCount === 0) throw new Error('EMERGENCY_TOKEN_INVALID');

    const row = result.rows[0];
    const hidden: string[] = row.hidden_fields || [];

    // Least-privilege: strip hidden fields chosen by patient
    const profile: Record<string, unknown> = {
      fullName: row.full_name,
      bloodType: hidden.includes('bloodType') ? null : row.blood_type,
      allergies: hidden.includes('allergies') ? [] : row.allergies,
      medications: hidden.includes('medications') ? [] : row.medications,
      chronicConditions: hidden.includes('chronicConditions') ? [] : row.chronic_conditions,
      emergencyContacts: hidden.includes('emergencyContacts') ? [] : row.emergency_contacts,
      emergencyNotes: hidden.includes('emergencyNotes') ? null : row.emergency_notes,
    };

    return profile;
  }
}
