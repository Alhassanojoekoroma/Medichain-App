import { db } from './db';
import bcrypt from 'bcrypt';

export async function runMigrations() {
  console.log('[Migrate] Checking and applying database migrations...');
  try {
    // 1. Add role to doctors if not exists
    await db.query(`
      ALTER TABLE doctors ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'doctor' CHECK (role IN ('doctor', 'nurse', 'admin', 'staff'));
    `);

    // 2. Create treatments table
    await db.query(`
      CREATE TABLE IF NOT EXISTS treatments (
        id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        patient_id      UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
        doctor_id       UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
        treatment_type  VARCHAR(50) DEFAULT 'medication' CHECK (treatment_type IN ('medication', 'procedure', 'therapy', 'other')),
        title           TEXT NOT NULL,
        description     TEXT,
        created_at      TIMESTAMPTZ DEFAULT NOW(),
        ledger_tx_hash  TEXT
      );
    `);

    // 3. Let's check if clinics are empty, if so, seed them
    const clinicsRes = await db.query('SELECT count(*) FROM clinics');
    const clinicsCount = parseInt(clinicsRes.rows[0].count);
    let clinicId = 'c0010000-0000-0000-0000-000000000001';
    if (clinicsCount === 0) {
      await db.query(`
        INSERT INTO clinics (id, name, address, phone, is_active)
        VALUES ($1, 'Connaught Hospital, Freetown', 'Lightfoot Boston Street, Freetown', '+232 22 222222', true)
      `, [clinicId]);
      console.log('[Migrate] Seeded clinic');
    } else {
      const firstClinic = await db.query('SELECT id FROM clinics LIMIT 1');
      clinicId = firstClinic.rows[0].id;
    }

    // 4. Let's seed doctors with different roles
    const doctorsRes = await db.query('SELECT count(*) FROM doctors');
    const doctorsCount = parseInt(doctorsRes.rows[0].count);
    
    // Hash password "password123"
    const passHash = await bcrypt.hash('password123', 10);
    
    if (doctorsCount === 0) {
      // Seed Doctor Amara Kofi
      await db.query(`
        INSERT INTO doctors (id, full_name, email, password_hash, license_no, specialty, clinic_id, role, is_active)
        VALUES ('d0010000-0000-0000-0000-000000000001', 'Dr. Amara Kofi', 'doctor@medichain.sl', $1, 'SL-MED-2019-0047', 'General Medicine', $2, 'doctor', true)
      `, [passHash, clinicId]);

      // Seed Doctor John Kamara
      await db.query(`
        INSERT INTO doctors (id, full_name, email, password_hash, license_no, specialty, clinic_id, role, is_active)
        VALUES ('d0010000-0000-0000-0000-000000000002', 'Dr. John Kamara', 'doctor@medichain.local', $1, 'SL-MED-2022-0089', 'Cardiology', $2, 'doctor', true)
      `, [passHash, clinicId]);

      console.log('[Migrate] Seeded baseline doctors');
    }

    // Let's ensure Nurse Inos is seeded
    const nurseRes = await db.query("SELECT count(*) FROM doctors WHERE email = 'nurse@medichain.sl'");
    if (parseInt(nurseRes.rows[0].count) === 0) {
      await db.query(`
        INSERT INTO doctors (id, full_name, email, password_hash, license_no, specialty, clinic_id, role, is_active)
        VALUES ('d0010000-0000-0000-0000-000000000003', 'Nurse Inos', 'nurse@medichain.sl', $1, 'SL-NUR-2020-0112', 'Pediatric Nursing', $2, 'nurse', true)
      `, [passHash, clinicId]);
      console.log('[Migrate] Seeded Nurse Inos');
    }

    // Let's ensure Staff Member is seeded
    const staffRes = await db.query("SELECT count(*) FROM doctors WHERE email = 'staff@medichain.sl'");
    if (parseInt(staffRes.rows[0].count) === 0) {
      await db.query(`
        INSERT INTO doctors (id, full_name, email, password_hash, license_no, specialty, clinic_id, role, is_active)
        VALUES ('d0010000-0000-0000-0000-000000000004', 'Staff Member', 'staff@medichain.sl', $1, 'SL-STA-2021-0021', 'Administration', $2, 'staff', true)
      `, [passHash, clinicId]);
      console.log('[Migrate] Seeded Staff Member');
    }

    // 5. Let's seed a default patient if empty
    const patientsRes = await db.query('SELECT count(*) FROM patients');
    const patientsCount = parseInt(patientsRes.rows[0].count);
    let patientId = 'p0010000-0000-0000-0000-000000000001';
    if (patientsCount === 0) {
      await db.query(`
        INSERT INTO patients (id, full_name, date_of_birth, blood_type, phone, email, wallet_address)
        VALUES ($1, 'Alex Johnson', '1990-05-15', 'O+', '+232 76 000 001', 'patient@medichain.sl', '0x35ef000000000000000000000000000000000001')
      `, [patientId]);
      
      // Seed emergency profile
      await db.query(`
        INSERT INTO emergency_profiles (patient_id, allergies, blood_type, medications, chronic_conditions, emergency_contacts, emergency_notes, hidden_fields)
        VALUES ($1, '[{"name": "Penicillin", "severity": "High"}, {"name": "Peanuts", "severity": "Moderate"}]', 'O+', '[{"name": "Paracetamol", "dosage": "500mg"}, {"name": "Lisinopril", "dosage": "10mg"}]', '[{"name": "Hypertension"}]', '[{"name": "Fatmata Conteh", "phone": "+232 77 654321", "relation": "Spouse"}]', 'Patient suffers from seasonal allergies. Epipen in personal bag.', '[]')
      `, [patientId]);

      // Seed default consent policies so doctors and clinics can view records immediately
      await db.query(`
        INSERT INTO consent_policies (patient_id, grantee_type, grantee_id, access_type, data_categories, purpose, expires_at, is_one_time)
        VALUES ($1, $2, $3, $4, $5::jsonb, $6, NULL, FALSE)
      `, [patientId, 'doctor', 'd0010000-0000-0000-0000-000000000001', 'read', JSON.stringify(['all']), 'Primary care consult']);

      await db.query(`
        INSERT INTO consent_policies (patient_id, grantee_type, grantee_id, access_type, data_categories, purpose, expires_at, is_one_time)
        VALUES ($1, $2, $3, $4, $5::jsonb, $6, NULL, FALSE)
      `, [patientId, 'clinic', clinicId, 'read', JSON.stringify(['all']), 'Clinic level read access']);

      console.log('[Migrate] Seeded default patient with consent policies');
    }

    console.log('[Migrate] Database migrations applied successfully.');
  } catch (error) {
    console.error('[Migrate] Migration failed:', error);
  }
}
