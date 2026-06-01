/**
 * backend/src/services/TokenService.ts
 * 
 * Issues and validates all tokens in the MediChain system:
 * - Short-lived access tokens embedded in QR codes (normal + emergency)
 * - JWT session tokens for authenticated doctors
 * - HMAC signatures to prevent QR tampering
 */

import crypto from 'crypto';
import jwt from 'jsonwebtoken';

const QR_TOKEN_SECRET = process.env.QR_TOKEN_SECRET!;
const JWT_SECRET = process.env.JWT_SECRET!;
const JWT_EXPIRY = process.env.JWT_EXPIRY || '8h';

export type QRType = 'NORMAL' | 'EMERGENCY' | 'SESSION';

export interface QRPayload {
  type: QRType;
  token: string;         // random UUID (the actual reference)
  sig: string;           // HMAC-SHA256 of token+type+exp
  exp?: number;          // unix epoch; undefined = non-expiring
  v: number;             // version
}

export interface DoctorJWT {
  sub: string;           // doctorId or patientId
  role: 'doctor' | 'admin' | 'patient';
  clinicId?: string;
  iat: number;
  exp: number;
}

export class TokenService {
  // ── QR token issuance ─────────────────────────────────────

  static generateRawToken(): string {
    return crypto.randomUUID();
  }

  /**
   * Sign a QR payload with HMAC-SHA256.
   * Prevents an attacker from forging a QR for a different patient.
   */
  static signQRPayload(token: string, type: QRType, exp?: number): string {
    const data = `${token}:${type}:${exp ?? 'none'}`;
    return crypto.createHmac('sha256', QR_TOKEN_SECRET).update(data).digest('hex');
  }

  static buildQRPayload(token: string, type: QRType, ttlSeconds?: number): QRPayload {
    const exp = ttlSeconds ? Math.floor(Date.now() / 1000) + ttlSeconds : undefined;
    const sig = this.signQRPayload(token, type, exp);
    return { type, token, sig, exp, v: 1 };
  }

  /**
   * Verify a scanned QR payload before any DB lookup.
   * Fast client-side tamper detection.
   */
  static verifyQRSignature(payload: QRPayload): boolean {
    const expected = this.signQRPayload(payload.token, payload.type, payload.exp);
    try {
      return crypto.timingSafeEqual(
        Buffer.from(payload.sig, 'hex'),
        Buffer.from(expected, 'hex')
      );
    } catch {
      return false;
    }
  }

  static isQRExpired(payload: QRPayload): boolean {
    if (!payload.exp) return false;
    return Math.floor(Date.now() / 1000) > payload.exp;
  }

  /** Hash a token before storing in DB — never store the raw token */
  static hashToken(rawToken: string): string {
    return crypto.createHash('sha256').update(rawToken).digest('hex');
  }

  // ── Doctor JWT ────────────────────────────────────────────

  static signDoctorJWT(doctorId: string, role: 'doctor' | 'admin' | 'patient', clinicId?: string): string {
    return jwt.sign({ sub: doctorId, role, clinicId }, JWT_SECRET, { expiresIn: JWT_EXPIRY } as jwt.SignOptions);
  }

  static verifyDoctorJWT(token: string): DoctorJWT {
    return jwt.verify(token, JWT_SECRET) as DoctorJWT;
  }

  /** 
   * Issue a short-lived session token for a specific doctor-patient pair.
   * Expires in 30 minutes — designed for a single consultation session.
   */
  static signSessionToken(doctorId: string, patientId: string): string {
    return jwt.sign({ sub: doctorId, patientId, type: 'SESSION' }, JWT_SECRET, { expiresIn: '30m' } as jwt.SignOptions);
  }
}
