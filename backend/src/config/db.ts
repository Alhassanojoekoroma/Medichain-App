import { Pool } from 'pg';
import { logger } from '../utils/logger';
import bcrypt from 'bcrypt';
import crypto from 'crypto';

// ─── Seeded in-memory mock data (mirrors migrate.ts seed) ────────────────────
// Used automatically when PostgreSQL is unreachable (dev / no-DB mode).

const BCRYPT_HASH = bcrypt.hashSync('password123', 10);

const MOCK_CLINIC = {
  id: 'c0010000-0000-0000-0000-000000000001',
  name: 'Connaught Hospital, Freetown',
};

const MOCK_DOCTORS: Record<string, any> = {
  'doctor@medichain.sl': {
    id: 'd0010000-0000-0000-0000-000000000001',
    email: 'doctor@medichain.sl',
    password_hash: BCRYPT_HASH,
    full_name: 'Dr. Amara Kofi',
    role: 'doctor',
    clinic_id: MOCK_CLINIC.id,
    is_active: true,
  },
  'doctor2@medichain.sl': {
    id: 'd0010000-0000-0000-0000-000000000002',
    email: 'doctor2@medichain.sl',
    password_hash: BCRYPT_HASH,
    full_name: 'Dr. John Kamara',
    role: 'doctor',
    clinic_id: MOCK_CLINIC.id,
    is_active: true,
  },
  'nurse@medichain.sl': {
    id: 'd0010000-0000-0000-0000-000000000003',
    email: 'nurse@medichain.sl',
    password_hash: BCRYPT_HASH,
    full_name: 'Nurse Inos',
    role: 'nurse',
    clinic_id: MOCK_CLINIC.id,
    is_active: true,
  },
  'staff@medichain.sl': {
    id: 'd0010000-0000-0000-0000-000000000004',
    email: 'staff@medichain.sl',
    password_hash: BCRYPT_HASH,
    full_name: 'Admin Staff',
    role: 'staff',
    clinic_id: MOCK_CLINIC.id,
    is_active: true,
  },
};

const MOCK_PATIENTS: Record<string, any> = {
  'bb010000-0000-0000-0000-000000000001': {
    id: 'bb010000-0000-0000-0000-000000000001',
    full_name: 'Alex Johnson',
    date_of_birth: '1996-03-15',
    phone: '+23276543210',
    email: 'alex.j@example.com',
    blood_type: 'O+',
    wallet_address: '0xABCD1234',
  },
  'bb010000-0000-0000-0000-000000000002': {
    id: 'bb010000-0000-0000-0000-000000000002',
    full_name: 'Fatima Kamara',
    date_of_birth: '1990-07-22',
    phone: '+23277891234',
    email: 'fatima.k@example.com',
    blood_type: 'A+',
    wallet_address: '0xEF015678',
  },
  'bb010000-0000-0000-0000-000000000003': {
    id: 'bb010000-0000-0000-0000-000000000003',
    full_name: 'Mohamed Sesay',
    date_of_birth: '1985-11-10',
    phone: '+23278765432',
    email: 'mo.sesay@example.com',
    blood_type: 'B+',
    wallet_address: '0x23459ABC',
  },
};

const MOCK_CONSENTS: any[] = [
  // Doctor 1 → all patients
  { id: crypto.randomUUID(), patient_id: 'bb010000-0000-0000-0000-000000000001', grantee_type: 'doctor', grantee_id: 'd0010000-0000-0000-0000-000000000001', access_type: 'read', data_categories: JSON.stringify(['all']), is_revoked: false, is_one_time: false, used_at: null, expires_at: null },
  { id: crypto.randomUUID(), patient_id: 'bb010000-0000-0000-0000-000000000002', grantee_type: 'doctor', grantee_id: 'd0010000-0000-0000-0000-000000000001', access_type: 'read', data_categories: JSON.stringify(['all']), is_revoked: false, is_one_time: false, used_at: null, expires_at: null },
  { id: crypto.randomUUID(), patient_id: 'bb010000-0000-0000-0000-000000000003', grantee_type: 'doctor', grantee_id: 'd0010000-0000-0000-0000-000000000001', access_type: 'read', data_categories: JSON.stringify(['all']), is_revoked: false, is_one_time: false, used_at: null, expires_at: null },
  // Doctor 2 → all patients
  { id: crypto.randomUUID(), patient_id: 'bb010000-0000-0000-0000-000000000001', grantee_type: 'doctor', grantee_id: 'd0010000-0000-0000-0000-000000000002', access_type: 'read', data_categories: JSON.stringify(['all']), is_revoked: false, is_one_time: false, used_at: null, expires_at: null },
  { id: crypto.randomUUID(), patient_id: 'bb010000-0000-0000-0000-000000000002', grantee_type: 'doctor', grantee_id: 'd0010000-0000-0000-0000-000000000002', access_type: 'read', data_categories: JSON.stringify(['all']), is_revoked: false, is_one_time: false, used_at: null, expires_at: null },
  // Clinic-level consent (all staff at the clinic can access patients)
  { id: crypto.randomUUID(), patient_id: 'bb010000-0000-0000-0000-000000000001', grantee_type: 'clinic', grantee_id: MOCK_CLINIC.id, access_type: 'read', data_categories: JSON.stringify(['all']), is_revoked: false, is_one_time: false, used_at: null, expires_at: null },
  { id: crypto.randomUUID(), patient_id: 'bb010000-0000-0000-0000-000000000002', grantee_type: 'clinic', grantee_id: MOCK_CLINIC.id, access_type: 'read', data_categories: JSON.stringify(['all']), is_revoked: false, is_one_time: false, used_at: null, expires_at: null },
  { id: crypto.randomUUID(), patient_id: 'bb010000-0000-0000-0000-000000000003', grantee_type: 'clinic', grantee_id: MOCK_CLINIC.id, access_type: 'read', data_categories: JSON.stringify(['all']), is_revoked: false, is_one_time: false, used_at: null, expires_at: null },
  // Role-based consent: nurses can read triage data
  { id: crypto.randomUUID(), patient_id: 'bb010000-0000-0000-0000-000000000001', grantee_type: 'role', grantee_id: 'nurse', access_type: 'read', data_categories: JSON.stringify(['labs', 'prescriptions']), is_revoked: false, is_one_time: false, used_at: null, expires_at: null },
];

const MOCK_EMERGENCY: Record<string, any> = {
  'bb010000-0000-0000-0000-000000000001': { allergies: [{ name: 'Penicillin', severity: 'Moderate' }], medications: [{ name: 'Lisinopril', dosage: '10mg', frequency: 'Once daily' }], chronic_conditions: [{ name: 'Hypertension' }] },
  'bb010000-0000-0000-0000-000000000002': { allergies: [], medications: [{ name: 'Metformin', dosage: '500mg', frequency: 'Twice daily' }], chronic_conditions: [{ name: 'Type 2 Diabetes' }] },
  'bb010000-0000-0000-0000-000000000003': { allergies: [{ name: 'Sulfa drugs', severity: 'High' }], medications: [], chronic_conditions: [] },
};

const MOCK_RECORDS: any[] = [
  { id: 'rec0001-0000-0000-0000-000000000001', patient_id: 'bb010000-0000-0000-0000-000000000001', record_type: 'Laboratory', title: 'Full Blood Count — June 2026', encrypted_cid: 'QmXf8Y7zKpLm3NqRsT2uVwE5hJcGbMnAoP9iDkFlH6ySv', integrity_hash: '0xabc123def456', data_categories: JSON.stringify(['labs']), uploaded_by: 'd0010000-0000-0000-0000-000000000001', created_at: new Date(Date.now() - 86400000 * 3).toISOString(), ledger_tx_hash: '0xfabric001ledger' },
  { id: 'rec0002-0000-0000-0000-000000000001', patient_id: 'bb010000-0000-0000-0000-000000000001', record_type: 'Prescription', title: 'Lisinopril 10mg — 30 day supply', encrypted_cid: 'QmPrescriptionMockCID', integrity_hash: '0xprescription456', data_categories: JSON.stringify(['prescriptions']), uploaded_by: 'd0010000-0000-0000-0000-000000000001', created_at: new Date(Date.now() - 86400000 * 7).toISOString(), ledger_tx_hash: '0xfabric003ledger' },
];

const MOCK_TREATMENTS: any[] = [
  { id: 'trx0001-0000-0000-0000-000000000001', patient_id: 'bb010000-0000-0000-0000-000000000001', doctor_id: 'd0010000-0000-0000-0000-000000000001', treatment_type: 'medication', title: 'Lisinopril 10mg', description: 'Take 1 tablet once daily. Monitor blood pressure weekly.', created_at: new Date(Date.now() - 86400000 * 7).toISOString(), ledger_tx_hash: '0xfabric002ledger', doctor_name: 'Dr. Amara Kofi' },
];

const ACCESS_LOGS: any[] = [];
const MOCK_ACCESS_TOKENS: any[] = [];

// ─── Mock SQL router ─────────────────────────────────────────────────────────

function mockQuery(text: string, params: any[] = []): { rows: any[]; rowCount: number } {
  const sql = text.trim().replace(/\s+/g, ' ').toLowerCase();

  // Counts
  if (sql.includes('count(*)') || sql.includes('count(1)')) {
    if (sql.includes('from clinics')) return { rows: [{ count: '1' }], rowCount: 1 };
    if (sql.includes('from doctors')) {
      if (sql.includes("email = 'nurse@medichain.sl'")) {
        const hasNurse = Object.values(MOCK_DOCTORS).some((d: any) => d.email === 'nurse@medichain.sl');
        return { rows: [{ count: hasNurse ? '1' : '0' }], rowCount: 1 };
      }
      if (sql.includes("email = 'staff@medichain.sl'")) {
        const hasStaff = Object.values(MOCK_DOCTORS).some((d: any) => d.email === 'staff@medichain.sl');
        return { rows: [{ count: hasStaff ? '1' : '0' }], rowCount: 1 };
      }
      return { rows: [{ count: Object.keys(MOCK_DOCTORS).length.toString() }], rowCount: 1 };
    }
    if (sql.includes('from patients')) return { rows: [{ count: Object.keys(MOCK_PATIENTS).length.toString() }], rowCount: 1 };
    if (sql.includes('from health_records')) return { rows: [{ count: MOCK_RECORDS.length.toString() }], rowCount: 1 };
    return { rows: [{ count: '0' }], rowCount: 1 };
  }

  // Clinics lookup
  if (sql.includes('from clinics') && sql.includes('limit 1')) {
    return { rows: [MOCK_CLINIC], rowCount: 1 };
  }

  // Doctors
  if (sql.includes('from doctors where email')) {
    const email = (params[0] || '').toLowerCase();
    const doc = MOCK_DOCTORS[email];
    if (!doc || !doc.is_active) return { rows: [], rowCount: 0 };
    return { rows: [doc], rowCount: 1 };
  }
  if (sql.includes('from doctors where id')) {
    const id = params[0];
    const doc = Object.values(MOCK_DOCTORS).find((d: any) => d.id === id);
    return doc ? { rows: [doc], rowCount: 1 } : { rows: [], rowCount: 0 };
  }
  if (sql.includes('from doctors d')) {
    return { rows: [], rowCount: 0 };
  }

  // Clinics
  if (sql.includes('from clinics where id')) {
    const id = params[0];
    if (id === MOCK_CLINIC.id) return { rows: [MOCK_CLINIC], rowCount: 1 };
    return { rows: [], rowCount: 0 };
  }

  // Patients
  if (sql.includes('insert into patients')) {
    const newPatient = {
      id: crypto.randomUUID(),
      full_name: params[0], date_of_birth: params[1], blood_type: params[2],
      phone: params[3], email: params[4],
      wallet_address: `0x${crypto.randomBytes(8).toString('hex')}`,
    };
    MOCK_PATIENTS[newPatient.id] = newPatient;
    return { rows: [newPatient], rowCount: 1 };
  }
  if (sql.includes('from patients where id')) {
    const p = MOCK_PATIENTS[params[0]];
    return p ? { rows: [p], rowCount: 1 } : { rows: [], rowCount: 0 };
  }
  if (sql.includes('from patients where email')) {
    const p = Object.values(MOCK_PATIENTS).find((p: any) => p.email === params[0]);
    return p ? { rows: [p], rowCount: 1 } : { rows: [], rowCount: 0 };
  }
  if (sql.includes('from patients where phone')) {
    const p = Object.values(MOCK_PATIENTS).find((p: any) => p.phone === params[0]);
    return p ? { rows: [p], rowCount: 1 } : { rows: [], rowCount: 0 };
  }
  if (sql.includes('from patients')) {
    return { rows: Object.values(MOCK_PATIENTS), rowCount: Object.keys(MOCK_PATIENTS).length };
  }

  // Consent policies
  if (sql.includes('from consent_policies') && sql.includes('patient_id = $1') && sql.includes('access_type = $4')) {
    const [patientId, doctorId, clinicId, accessType, actorRole] = params;
    const match = MOCK_CONSENTS.find(c =>
      c.patient_id === patientId && !c.is_revoked && c.access_type === accessType &&
      (
        (c.grantee_type === 'doctor' && c.grantee_id === doctorId) ||
        (c.grantee_type === 'clinic' && c.grantee_id === clinicId) ||
        (c.grantee_type === 'role' && c.grantee_id === actorRole) ||
        (c.grantee_type === 'purpose' && c.grantee_id === 'emergency' && accessType === 'emergency_read')
      )
    );
    if (!match) return { rows: [], rowCount: 0 };
    const row = {
      ...match,
      data_categories: typeof match.data_categories === 'string' ? JSON.parse(match.data_categories) : match.data_categories
    };
    return { rows: [row], rowCount: 1 };
  }
  if (sql.includes('from consent_policies') && params[0]) {
    const rows = MOCK_CONSENTS.filter(c => c.patient_id === params[0] && !c.is_revoked).map(c => ({
      ...c,
      data_categories: typeof c.data_categories === 'string' ? JSON.parse(c.data_categories) : c.data_categories
    }));
    return { rows, rowCount: rows.length };
  }
  if (sql.includes('insert into consent_policies')) {
    const c = { id: crypto.randomUUID(), patient_id: params[0], grantee_type: params[1], grantee_id: params[2], access_type: params[3], data_categories: params[4], purpose: params[5], expires_at: params[6], is_one_time: params[7], is_revoked: false };
    MOCK_CONSENTS.push(c);
    return { rows: [c], rowCount: 1 };
  }
  if (sql.includes('update consent_policies') && sql.includes('is_revoked = true')) {
    const id = params[0]; const c = MOCK_CONSENTS.find(c => c.id === id);
    if (c) { c.is_revoked = true; return { rows: [], rowCount: 1 }; }
    return { rows: [], rowCount: 0 };
  }

  // Emergency profiles
  if (sql.includes('insert into emergency_profiles')) {
    const patientId = params[0];
    const bloodType = params[1];
    MOCK_EMERGENCY[patientId] = {
      allergies: [],
      medications: [],
      chronic_conditions: [],
      emergency_contacts: [],
      blood_type: bloodType,
      hidden_fields: []
    };
    return { rows: [{ id: crypto.randomUUID() }], rowCount: 1 };
  }
  if (sql.includes('from emergency_profiles')) {
    const ep = MOCK_EMERGENCY[params[0]];
    return ep ? { rows: [ep], rowCount: 1 } : { rows: [], rowCount: 0 };
  }

  // Health records
  if (sql.includes('insert into health_records')) {
    const r = { id: crypto.randomUUID(), patient_id: params[0], record_type: params[1], title: params[2], encrypted_cid: `QmMock${crypto.randomBytes(8).toString('hex')}`, integrity_hash: `0x${crypto.randomBytes(16).toString('hex')}`, data_categories: params[3], uploaded_by: params[4], created_at: new Date().toISOString(), ledger_tx_hash: `0xfabric${crypto.randomBytes(8).toString('hex')}` };
    MOCK_RECORDS.push(r);
    return { rows: [r], rowCount: 1 };
  }
  if (sql.includes('from health_records')) {
    const rawRecs = params[0] ? MOCK_RECORDS.filter(r => r.patient_id === params[0]) : MOCK_RECORDS;
    const recs = rawRecs.map(r => ({
      ...r,
      patient_name: MOCK_PATIENTS[r.patient_id]?.full_name || 'Unknown Patient'
    }));
    return { rows: recs, rowCount: recs.length };
  }

  // Treatments
  if (sql.includes('insert into treatments')) {
    const t = { id: crypto.randomUUID(), patient_id: params[0], doctor_id: params[1], treatment_type: params[2], title: params[3], description: params[4], created_at: new Date().toISOString(), ledger_tx_hash: `0xfabric${crypto.randomBytes(8).toString('hex')}`, doctor_name: Object.values(MOCK_DOCTORS).find((d: any) => d.id === params[1])?.full_name || 'Unknown Doctor' };
    MOCK_TREATMENTS.push(t);
    return { rows: [t], rowCount: 1 };
  }
  if (sql.includes('from treatments')) {
    const treats = params[0] ? MOCK_TREATMENTS.filter(t => t.patient_id === params[0]) : MOCK_TREATMENTS;
    return { rows: treats, rowCount: treats.length };
  }

  // Access logs
  if (sql.includes('insert into access_logs')) {
    const log = { id: crypto.randomUUID(), created_at: new Date().toISOString() };
    ACCESS_LOGS.push(log);
    return { rows: [log], rowCount: 1 };
  }
  if (sql.includes('from access_logs')) {
    return { rows: ACCESS_LOGS, rowCount: ACCESS_LOGS.length };
  }



  // QR tokens
  if (sql.includes('insert into access_tokens')) {
    const t = {
      id: crypto.randomUUID(),
      patient_id: params[0],
      token_type: params[1],
      token_hash: params[2],
      signature: params[3],
      expires_at: params[4],
      is_one_time: params[5],
      is_revoked: false,
      used_at: null
    };
    MOCK_ACCESS_TOKENS.push(t);
    return { rows: [t], rowCount: 1 };
  }
  if (sql.includes('update access_tokens')) {
    if (sql.includes('is_revoked = true') || sql.includes('is_revoked = truth')) {
      const patientId = params[0];
      const tokens = MOCK_ACCESS_TOKENS.filter(t => t.patient_id === patientId);
      for (const t of tokens) {
        t.is_revoked = true;
      }
    }
    return { rows: [], rowCount: 1 };
  }
  if (sql.includes('from access_tokens')) {
    const hash = params[0];
    const match = MOCK_ACCESS_TOKENS.find(t => t.token_hash === hash && !t.is_revoked);
    if (!match) return { rows: [], rowCount: 0 };

    if (sql.includes('full_name') || sql.includes('emergency_profiles')) {
      // Emergency resolve query: JOIN patients and emergency_profiles
      const patient = MOCK_PATIENTS[match.patient_id];
      const ep = MOCK_EMERGENCY[match.patient_id] || { allergies: [], medications: [], chronic_conditions: [] };
      const row = {
        patient_id: match.patient_id,
        allergies: typeof ep.allergies === 'string' ? ep.allergies : JSON.stringify(ep.allergies || []),
        blood_type: patient?.blood_type || ep.blood_type || 'O+',
        medications: typeof ep.medications === 'string' ? ep.medications : JSON.stringify(ep.medications || []),
        chronic_conditions: typeof ep.chronic_conditions === 'string' ? ep.chronic_conditions : JSON.stringify(ep.chronic_conditions || []),
        emergency_contacts: typeof ep.emergency_contacts === 'string' ? ep.emergency_contacts : JSON.stringify(ep.emergency_contacts || []),
        emergency_notes: ep.emergency_notes || '',
        hidden_fields: typeof ep.hidden_fields === 'string' ? ep.hidden_fields : JSON.stringify(ep.hidden_fields || []),
        full_name: patient?.full_name || 'Unknown Patient'
      };
      return { rows: [row], rowCount: 1 };
    }

    // Normal resolve query
    return { rows: [match], rowCount: 1 };
  }

  // DDL, misc
  if (
    sql.includes('alter table') || sql.includes('create table') || sql.includes('create index') ||
    sql.includes('insert into revocation_events') || sql.includes('from offline_queue') ||
    sql.includes('insert into offline_queue') || sql.includes('update offline_queue') ||
    sql.includes('from access_requests') || sql.includes('insert into access_requests') ||
    sql.includes('insert into sync_queue')
  ) {
    return { rows: [{ id: crypto.randomUUID() }], rowCount: 1 };
  }
  if (sql.includes('select 1')) return { rows: [{ '?column?': 1 }], rowCount: 1 };

  logger.warn(`[DB-MOCK] Unhandled query: ${text.substring(0, 120)}`);
  return { rows: [], rowCount: 0 };
}

// ─── Real Postgres pool ───────────────────────────────────────────────────────

let dbAvailable = false;
let pool: Pool | null = null;

if (process.env.DATABASE_URL) {
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 3000,
  });

  pool.on('error', (err) => {
    logger.error(`[DB] Pool error: ${err.message}`);
    dbAvailable = false;
  });

  // Probe connectivity at startup
  pool.query('SELECT 1')
    .then(() => {
      dbAvailable = true;
      logger.info('[DB] ✅ PostgreSQL connected successfully.');
    })
    .catch((err) => {
      dbAvailable = false;
      logger.warn(`[DB] ⚠️  PostgreSQL unavailable. Running in SIMULATION mode with seeded dev data. (${err.code})`);
    });
} else {
  logger.warn('[DB] ⚠️  DATABASE_URL not set. Running in SIMULATION mode with seeded dev data.');
}

// ─── Unified db interface ─────────────────────────────────────────────────────

export const db = {
  on: (event: string, listener: (...args: any[]) => void) => pool?.on(event as any, listener),

  query: async (text: string, params?: any[]): Promise<{ rows: any[]; rowCount: number }> => {
    if (dbAvailable && pool) {
      try {
        const res = await pool.query(text, params);
        return { rows: res.rows, rowCount: res.rowCount ?? 0 };
      } catch (err: any) {
        const isConnErr = ['ECONNREFUSED', 'ENOTFOUND', 'ECONNRESET', 'ETIMEDOUT', 'AggregateError'].some(c => err.code === c || err.name === c);
        if (isConnErr) {
          dbAvailable = false;
          logger.warn('[DB] Lost connection to PostgreSQL — switching to SIMULATION mode.');
        } else {
          logger.error(`[DB] Query error`, { text: text.substring(0, 100), error: err.message });
          throw err;
        }
      }
    }
    // Simulation fallback
    return mockQuery(text, params);
  },

  pool: pool as any,
  getMockPatients: () => Object.values(MOCK_PATIENTS),
  getMockDoctors: () => Object.values(MOCK_DOCTORS),
};
