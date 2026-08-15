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
import { readSecurityConfig } from '../config/environment';

const securityConfig = readSecurityConfig();
const QR_TOKEN_SECRET = securityConfig.qrTokenSecret;
const JWT_SECRET = securityConfig.jwtSecret;
// These HMAC tokens exist only for the explicit synthetic sandbox. Keep them
// short lived so test behavior does not normalize long-lived bearer sessions.
const JWT_EXPIRY = process.env.JWT_EXPIRY || '15m';

export type QRType = 'NORMAL' | 'EMERGENCY' | 'SESSION';

export interface QRPayload {
  type: QRType;
  token: string;         // random UUID (the actual reference)
  sig: string;           // HMAC-SHA256 of token+type+exp
  exp?: number;          // unix epoch; undefined = non-expiring
  v: number;             // version
}

export type ClinicalRole = 'doctor' | 'nurse' | 'laboratory' | 'pharmacy' | 'staff' | 'admin' | 'government' | 'patient';

export interface DoctorJWT {
  sub: string;           // doctorId, patientId, or staffId
  role: ClinicalRole;
  clinicId?: string;
  fullName?: string;     // actor's display name for audit logs
  sid: string;
  mfa: boolean;
  tokenVersion: number;
  authTime: number;
  identityIssuer?: string;
  identitySubject?: string;
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
    if (payload.v !== 1 || !['NORMAL', 'EMERGENCY', 'SESSION'].includes(payload.type)) return false;
    if (!/^[0-9a-f-]{36}$/i.test(payload.token) && payload.type !== 'SESSION') return false;
    if (!/^[0-9a-f]{64}$/i.test(payload.sig)) return false;
    if (payload.type === 'NORMAL' && !payload.exp) return false;
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
    return Math.floor(Date.now() / 1000) >= payload.exp;
  }

  /** Hash a token before storing in DB — never store the raw token */
  static hashToken(rawToken: string): string {
    return crypto.createHash('sha256').update(rawToken).digest('hex');
  }

  // ── Doctor JWT ────────────────────────────────────────────

  static signDoctorJWT(
    doctorId: string,
    role: ClinicalRole,
    clinicId?: string,
    fullName?: string,
    options: { sessionId?: string; mfa?: boolean; tokenVersion?: number; authTime?: number } = {}
  ): string {
    return jwt.sign({
      sub: doctorId,
      role,
      clinicId,
      fullName,
      sid: options.sessionId ?? crypto.randomUUID(),
      mfa: options.mfa ?? false,
      tokenVersion: options.tokenVersion ?? 0,
      authTime: options.authTime ?? Math.floor(Date.now() / 1000),
    }, JWT_SECRET, {
      expiresIn: JWT_EXPIRY,
      issuer: 'palmchain-api',
      audience: 'palmchain-apps',
      jwtid: crypto.randomUUID(),
    } as jwt.SignOptions);
  }

  static verifyDoctorJWT(token: string): DoctorJWT {
    const payload = jwt.verify(token, JWT_SECRET, {
      issuer: 'palmchain-api',
      audience: 'palmchain-apps',
      algorithms: ['HS256'],
    }) as DoctorJWT;
    if (!payload.sid || typeof payload.mfa !== 'boolean' || !Number.isInteger(payload.tokenVersion)) {
      throw new Error('TOKEN_ASSURANCE_CLAIMS_MISSING');
    }
    return payload;
  }

  /** 
   * Issue a short-lived session token for a specific doctor-patient pair.
   * Expires in 30 minutes — designed for a single consultation session.
   */
  static signSessionToken(doctorId: string, patientId: string): string {
    return jwt.sign({ sub: doctorId, patientId, type: 'SESSION' }, JWT_SECRET, { expiresIn: '30m' } as jwt.SignOptions);
  }
}
