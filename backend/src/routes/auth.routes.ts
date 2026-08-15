/**
 * backend/src/routes/auth.routes.ts
 * Simple authentication routes for doctors and patients (for testing/demo)
 */
import { Router, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { body, validationResult } from 'express-validator';
import { db } from '../config/db';
import { TokenService } from '../services/TokenService';
import { logger } from '../utils/logger';
import { readSecurityConfig } from '../config/environment';

const router = Router();

function constantTimeStringEqual(left: string, right: string): boolean {
  const leftHash = crypto.createHash('sha256').update(left).digest();
  const rightHash = crypto.createHash('sha256').update(right).digest();
  return crypto.timingSafeEqual(leftHash, rightHash);
}

/**
 * POST /api/auth/patient/register
 * Synthetic-sandbox onboarding only. Production registration is delegated to
 * the approved managed identity provider so unverified identities never gain a
 * medical-record session.
 */
router.post(
  '/patient/register',
  [
    body('fullName').trim().isLength({ min: 2, max: 100 }),
    body('email').isEmail().normalizeEmail(),
    body('phone').trim().matches(/^\+232\s?\d{2}\s?\d{3}\s?\d{3}$/).withMessage('Use a Sierra Leone phone number, for example +232 76 123 456'),
    body('dateOfBirth').isISO8601().withMessage('Date of birth must use YYYY-MM-DD'),
    body('bloodType').optional({ checkFalsy: true }).isIn(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']),
  ],
  async (req: Request, res: Response): Promise<void> => {
    try {
      const securityConfig = readSecurityConfig();
      if (!securityConfig.allowDemoAuth) {
        res.status(503).json({ error: 'Managed identity registration is required', code: 'IDENTITY_PROVIDER_REQUIRED' });
        return;
      }

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ error: 'Please check the registration details', details: errors.array() });
        return;
      }

      const { fullName, email, phone, dateOfBirth } = req.body;
      const bloodType = req.body.bloodType || null;
      const duplicate = await db.query(
        'SELECT id FROM patients WHERE lower(email) = lower($1) OR phone = $2 LIMIT 1',
        [email, phone]
      );
      if (duplicate.rowCount) {
        res.status(409).json({ error: 'An account already uses this email or phone number' });
        return;
      }

      const result = await db.query(
        `INSERT INTO patients (full_name, date_of_birth, blood_type, phone, email, account_status)
         VALUES ($1, $2, $3, $4, $5, 'unverified')
         RETURNING id, full_name, email, phone, blood_type, account_status`,
        [fullName, dateOfBirth, bloodType, phone, String(email).toLowerCase()]
      );
      const patient = result.rows[0];
      res.status(201).json({
        success: true,
        patientId: patient.id,
        verificationStatus: patient.account_status,
        nextStep: 'Visit a participating facility with an accepted identity document before medical records can be used.',
        patient: {
          id: patient.id,
          fullName: patient.full_name,
          email: patient.email,
          phone: patient.phone,
          bloodType: patient.blood_type,
        },
      });
    } catch (err: any) {
      logger.error(`[Auth] Patient registration error: ${err.message}`);
      res.status(500).json({ error: 'Account creation failed' });
    }
  }
);

/**
 * POST /api/auth/doctor/login
 */
router.post(
  '/doctor/login',
  [
    body('email').optional().isEmail().withMessage('Valid email is required'),
    body('username').optional().isString(),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  async (req: Request, res: Response): Promise<void> => {
    try {
      const securityConfig = readSecurityConfig();
      if (!securityConfig.allowDemoAuth) {
        res.status(503).json({ error: 'Workforce login unavailable', code: 'IDENTITY_PROVIDER_REQUIRED' });
        return;
      }
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ error: 'Validation failed', details: errors.array() });
        return;
      }

      const { email, username, password } = req.body;
      const loginEmail = String(email || username || '').trim().toLowerCase();

      if (!loginEmail) {
        res.status(400).json({ error: 'Email or username is required' });
        return;
      }

      const result = await db.query(
        `SELECT id, password_hash, clinic_id, role, full_name FROM doctors WHERE email = $1 AND is_active = TRUE`,
        [loginEmail]
      );

      if (result.rowCount === 0) {
        res.status(401).json({ error: 'Invalid credentials' });
        return;
      }

      const doc = result.rows[0];
      
      const isMatch = await bcrypt.compare(password, doc.password_hash);
      if (!isMatch) {
        res.status(401).json({ error: 'Invalid credentials' });
        return;
      }

      // A password-only sandbox ceremony is not MFA. Tests that need an MFA
      // assertion must use an explicit assurance fixture rather than this login.
      const token = TokenService.signDoctorJWT(doc.id, doc.role || 'doctor', doc.clinic_id, doc.full_name, { mfa: false });
      res.json({ success: true, token, doctorId: doc.id, role: doc.role || 'doctor', fullName: doc.full_name });

    } catch (err: any) {
      logger.error(`[Auth] Doctor login error: ${err.message}`);
      res.status(500).json({ error: 'Login failed' });
    }
  }
);

/**
 * POST /api/auth/patient/login
 */
router.post(
  '/patient/login',
  [
    body('phone').optional().isString(),
    body('email').optional().isEmail(),
    body('password').optional().isString()
  ],
  async (req: Request, res: Response): Promise<void> => {
    try {
      const securityConfig = readSecurityConfig();
      if (!securityConfig.allowDemoAuth) {
        res.status(503).json({
          error: 'Patient login unavailable',
          code: 'IDENTITY_PROVIDER_REQUIRED',
        });
        return;
      }

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ error: 'Validation failed', details: errors.array() });
        return;
      }

      const { phone, email, password } = req.body;
      
      if (!password) {
        res.status(400).json({ error: 'Password is required' });
        return;
      }

      let result;
      
      if (email) {
        result = await db.query(
          `SELECT id, full_name, email, phone, blood_type, account_status FROM patients WHERE email = $1`,
          [email]
        );
        
        if (result.rowCount === 0) {
          res.status(401).json({ error: 'Invalid credentials' });
          return;
        }
        
        if (!constantTimeStringEqual(password, securityConfig.sandboxPatientPassword!)) {
          res.status(401).json({ error: 'Invalid credentials' });
          return;
        }
      } else if (phone) {
        result = await db.query(
          `SELECT id, full_name, email, phone, blood_type, account_status FROM patients WHERE phone = $1`,
          [phone]
        );
        
        if (result.rowCount === 0) {
          res.status(401).json({ error: 'Invalid credentials' });
          return;
        }

        if (!constantTimeStringEqual(password, securityConfig.sandboxPatientPassword!)) {
          res.status(401).json({ error: 'Invalid credentials' });
          return;
        }
      } else {
        res.status(400).json({ error: 'Missing phone or email' });
        return;
      }

      const pat = result.rows[0];
      if (pat.account_status !== 'active') {
        res.status(403).json({
          error: 'In-person verification is required before medical records can be used',
          code: 'IDENTITY_VERIFICATION_REQUIRED',
          verificationStatus: pat.account_status || 'unverified',
        });
        return;
      }
      const token = TokenService.signDoctorJWT(pat.id, 'patient', undefined, pat.full_name, { mfa: false });
      res.json({
        success: true,
        token,
        patientId: pat.id,
        patient: {
          id: pat.id,
          fullName: pat.full_name,
          email: pat.email,
          phone: pat.phone,
          bloodType: pat.blood_type
        }
      });

    } catch (err: any) {
      logger.error(`[Auth] Patient login error: ${err.message}`);
      res.status(500).json({ error: 'Login failed' });
    }
  }
);

export default router;
