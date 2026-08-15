/**
 * backend/src/middleware/auth.middleware.ts
 * JWT verification middleware for doctor + patient routes
 */
import { Request, Response, NextFunction } from 'express';
import { ActorContext } from '../domain/authorization';
import { IdentityService } from '../services/IdentityService';
import { DoctorJWT } from '../services/TokenService';
import { SessionService } from '../services/SessionService';

export interface AuthRequest extends Request {
  doctor?: { id: string; role: string; clinicId?: string; fullName?: string; sessionId: string; mfa: boolean; tokenVersion: number };
  patientId?: string;
  patient?: { id: string };
  actor?: ActorContext;
  correlationId?: string;
  identity?: DoctorJWT;
  session?: { expiresAt: string; idleExpiresAt: string; absoluteExpiresAt: string };
}

function attachIdentity(req: AuthRequest, payload: DoctorJWT): void {
  req.identity = payload;
  req.actor = {
    id: payload.sub,
    role: payload.role,
    status: 'active',
    facilityId: payload.clinicId,
    mfa: payload.mfa,
    sessionId: payload.sid,
  };
  if (payload.role === 'patient') {
    req.patientId = payload.sub;
    req.patient = { id: payload.sub };
  } else {
    req.doctor = {
      id: payload.sub,
      role: payload.role,
      clinicId: payload.clinicId,
      fullName: payload.fullName,
      sessionId: payload.sid,
      mfa: payload.mfa,
      tokenVersion: payload.tokenVersion,
    };
  }
}

function shouldTouchSession(req: AuthRequest): boolean {
  if (/\/sessions\/(current|logout)(?:\?|$)/.test(req.originalUrl)) return false;
  return req.header('x-palmchain-activity') !== 'background';
}

function bearer(req: AuthRequest): string | null {
  const header = req.headers.authorization;
  return header?.startsWith('Bearer ') ? header.slice(7) : null;
}

export async function requireAuthenticated(req: AuthRequest, res: Response, next: NextFunction) {
  const token = bearer(req);
  if (!token) return res.status(401).json({ error: 'Missing authorization header' });
  try {
    const payload = await IdentityService.verifyAccessToken(token);
    req.session = await SessionService.assertActive(payload, { touchActivity: shouldTouchSession(req) });
    attachIdentity(req, payload);
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

export async function requireDoctor(req: AuthRequest, res: Response, next: NextFunction) {
  const token = bearer(req);
  if (!token) return res.status(401).json({ error: 'Missing authorization header' });
  try {
    const payload = await IdentityService.verifyAccessToken(token);
    req.session = await SessionService.assertActive(payload, { touchActivity: shouldTouchSession(req) });
    if (!['doctor', 'nurse', 'laboratory', 'pharmacy', 'admin', 'government', 'staff'].includes(payload.role)) {
      return res.status(403).json({ error: 'Forbidden: Access restricted to hospital staff' });
    }
    if (!payload.mfa) {
      return res.status(403).json({ error: { code: 'MFA_REQUIRED', message: 'A multi-factor authenticated workforce session is required' } });
    }
    attachIdentity(req, payload);
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

export async function requirePatient(req: AuthRequest, res: Response, next: NextFunction) {
  const token = bearer(req);
  if (!token) return res.status(401).json({ error: 'Missing authorization header' });
  try {
    // Patient uses same JWT structure, role = 'patient'
    const payload = await IdentityService.verifyAccessToken(token);
    req.session = await SessionService.assertActive(payload, { touchActivity: shouldTouchSession(req) });
    if (payload.role !== 'patient') return res.status(403).json({ error: 'Forbidden' });
    attachIdentity(req, payload);
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}
