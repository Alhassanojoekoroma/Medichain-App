/**
 * backend/src/routes/auth.routes.ts
 * Simple authentication routes for doctors and patients (for testing/demo)
 */
import { Router, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { body, validationResult } from 'express-validator';
import { db } from '../config/db';
import { TokenService } from '../services/TokenService';
import { logger } from '../utils/logger';

const router = Router();

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
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ error: 'Validation failed', details: errors.array() });
        return;
      }

      const { email, username, password } = req.body;
      const loginEmail = email || username;

      if (!loginEmail) {
        res.status(400).json({ error: 'Email or username is required' });
        return;
      }

      const result = await db.query(
        `SELECT id, password_hash, clinic_id FROM doctors WHERE email = $1 AND is_active = TRUE`,
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

      const token = TokenService.signDoctorJWT(doc.id, 'doctor', doc.clinic_id);
      res.json({ success: true, token, doctorId: doc.id });

    } catch (err: any) {
      logger.error(`[Auth] Doctor login error: ${err.message}`);
      res.status(500).json({ error: 'Login failed', details: err.message });
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
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ error: 'Validation failed', details: errors.array() });
        return;
      }

      const { phone, email, password } = req.body;
      let result;
      
      if (email) {
        result = await db.query(
          `SELECT id, full_name, email, phone, blood_type FROM patients WHERE email = $1`,
          [email]
        );
        
        if (result.rowCount === 0) {
          res.status(401).json({ error: 'Patient not found' });
          return;
        }
        
        // In a complete implementation we would add password_hash to the patients table too
        // and do a bcrypt.compare(password, pat.password_hash) here.
        if (password && password !== 'password123') {
          res.status(401).json({ error: 'Invalid credentials' });
          return;
        }
      } else if (phone) {
        result = await db.query(
          `SELECT id, full_name, email, phone, blood_type FROM patients WHERE phone = $1`,
          [phone]
        );
        
        if (result.rowCount === 0) {
          res.status(401).json({ error: 'Patient not found' });
          return;
        }
      } else {
        res.status(400).json({ error: 'Missing phone or email' });
        return;
      }

      const pat = result.rows[0];
      const token = TokenService.signDoctorJWT(pat.id, 'patient');
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
      res.status(500).json({ error: 'Login failed', details: err.message });
    }
  }
);

export default router;
