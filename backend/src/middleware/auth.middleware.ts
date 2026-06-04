/**
 * backend/src/middleware/auth.middleware.ts
 * JWT verification middleware for doctor + patient routes
 */
import { Request, Response, NextFunction } from 'express';
import { TokenService } from '../services/TokenService';

export interface AuthRequest extends Request {
  doctor?: { id: string; role: string; clinicId?: string; fullName?: string };
  patientId?: string;
  patient?: { id: string };
}

export function requireDoctor(req: AuthRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing authorization header' });
  }
  try {
    const payload = TokenService.verifyDoctorJWT(header.slice(7));
    if (!['doctor', 'nurse', 'admin', 'staff'].includes(payload.role)) {
      return res.status(403).json({ error: 'Forbidden: Access restricted to hospital staff' });
    }
    req.doctor = {
      id: payload.sub,
      role: payload.role,
      clinicId: payload.clinicId,
      fullName: payload.fullName,
    };
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

export function requirePatient(req: AuthRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing authorization header' });
  }
  try {
    // Patient uses same JWT structure, role = 'patient'
    const payload = TokenService.verifyDoctorJWT(header.slice(7));
    if (payload.role !== 'patient') return res.status(403).json({ error: 'Forbidden' });
    req.patientId = payload.sub;
    req.patient = { id: payload.sub };
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}
