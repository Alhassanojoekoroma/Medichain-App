/**
 * backend/src/routes/auth.routes.ts
 * Simple authentication routes for doctors and patients (for testing/demo)
 */
import { Router, Request, Response } from 'express';
import { db } from '../config/db';
import { TokenService } from '../services/TokenService';

const router = Router();

// In a real app, you would hash passwords with bcrypt. 
// For this MVP, we simulate login assuming plain text or pre-seeded hashes.

/**
 * POST /api/auth/doctor/login
 */
router.post('/doctor/login', async (req: Request, res: Response) => {
  try {
    const { email, username, password } = req.body;
    
    // Accept either email or username field
    const loginEmail = email || username;
    
    if (!loginEmail || !password) {
      return res.status(400).json({ error: 'Email/username and password required' });
    }

    // Demo implementation: Find doctor by email
    const result = await db.query(
      `SELECT id, password_hash, clinic_id FROM doctors WHERE email = $1 AND is_active = TRUE`,
      [loginEmail]
    );

    if (result.rowCount === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const doc = result.rows[0];
    
    // DEMO: Assuming password_hash is just the plaintext password for demo DB seeds
    if (doc.password_hash !== password) {
       return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = TokenService.signDoctorJWT(doc.id, 'doctor', doc.clinic_id);
    res.json({ success: true, token, doctorId: doc.id });

  } catch (err: any) {
    console.error('[Auth] Doctor login error:', err);
    res.status(500).json({ error: 'Login failed', details: err.message });
  }
});

/**
 * POST /api/auth/patient/login
 */
router.post('/patient/login', async (req: Request, res: Response) => {
  const { phone, email, password } = req.body;
  try {
    let result;
    if (email) {
      // Login by email
      result = await db.query(
        `SELECT id FROM patients WHERE email = $1`,
        [email]
      );
      
      if (result.rowCount === 0) {
        return res.status(401).json({ error: 'Patient not found' });
      }
      
      // Seed validation for password
      if (password && password !== 'password123') {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
    } else if (phone) {
      // Login by phone
      result = await db.query(
        `SELECT id FROM patients WHERE phone = $1`,
        [phone]
      );
      
      if (result.rowCount === 0) {
        return res.status(401).json({ error: 'Patient not found' });
      }
    } else {
      return res.status(400).json({ error: 'Missing phone or email' });
    }

    const pat = result.rows[0];
    const token = TokenService.signDoctorJWT(pat.id, 'patient'); // same JWT structure, role=patient
    res.json({ success: true, token, patientId: pat.id });

  } catch (err: any) {
    res.status(500).json({ error: 'Login failed', details: err.message });
  }
});

export default router;
