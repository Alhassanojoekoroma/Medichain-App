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

const MOCK_PATIENTS: Record<string, any> = {};

// Helper to define a patient both by UUID and by P00X mock ID
const definePatient = (uuid: string, mockId: string, patientData: any) => {
  const data = { id: uuid, ...patientData };
  MOCK_PATIENTS[uuid] = data;
  MOCK_PATIENTS[mockId] = data;
};

definePatient('bb010000-0000-0000-0000-000000000001', 'P001', {
  full_name: 'Aminata Koroma',
  date_of_birth: '1991-03-15',
  phone: '+23276123456',
  email: 'aminata.k@email.com',
  blood_type: 'O+',
  wallet_address: '0xABCD1234',
});

definePatient('bb010000-0000-0000-0000-000000000002', 'P002', {
  full_name: 'Mohamed Bangura',
  date_of_birth: '1980-07-22',
  phone: '+23277234567',
  email: 'mbangura@email.com',
  blood_type: 'A+',
  wallet_address: '0xEF015678',
});

definePatient('bb010000-0000-0000-0000-000000000003', 'P003', {
  full_name: 'Fatmata Sesay',
  date_of_birth: '1997-11-08',
  phone: '+23278345678',
  email: 'fatmata.s@email.com',
  blood_type: 'B-',
  wallet_address: '0x23459ABC',
});

definePatient('bb010000-0000-0000-0000-000000000004', 'P004', {
  full_name: 'Ibrahim Turay',
  date_of_birth: '1963-05-01',
  phone: '+23279456789',
  email: 'ituray@email.com',
  blood_type: 'AB+',
  wallet_address: '0x34560DEF',
});

definePatient('bb010000-0000-0000-0000-000000000005', 'P005', {
  full_name: 'Isatu Mansaray',
  date_of_birth: '2007-02-14',
  phone: '+23276567890',
  email: 'imansaray@email.com',
  blood_type: 'O-',
  wallet_address: '0x45671ABC',
});

definePatient('bb010000-0000-0000-0000-000000000006', 'P006', {
  full_name: 'Samuel Kamara',
  date_of_birth: '1988-09-30',
  phone: '+23277678901',
  email: 'skamara@email.com',
  blood_type: 'A-',
  wallet_address: '0x56782DEF',
});

definePatient('bb010000-0000-0000-0000-000000000007', 'P007', {
  full_name: 'Mariama Conteh',
  date_of_birth: '1974-04-05',
  phone: '+23278789012',
  email: 'mconteh@email.com',
  blood_type: 'B+',
  wallet_address: '0x67893ABC',
});

definePatient('bb010000-0000-0000-0000-000000000008', 'P008', {
  full_name: 'Alhaji Jalloh',
  date_of_birth: '1955-12-12',
  phone: '+23279890123',
  email: 'ajalloh@email.com',
  blood_type: 'O+',
  wallet_address: '0x78904DEF',
});

const MOCK_CONSENTS: any[] = [];

// Seed default read consents for Doctor 1 (d0010000-0000-0000-0000-000000000001) to all 8 patients
const patientUuids = [
  'bb010000-0000-0000-0000-000000000001',
  'bb010000-0000-0000-0000-000000000002',
  'bb010000-0000-0000-0000-000000000003',
  'bb010000-0000-0000-0000-000000000004',
  'bb010000-0000-0000-0000-000000000005',
  'bb010000-0000-0000-0000-000000000006',
  'bb010000-0000-0000-0000-000000000007',
  'bb010000-0000-0000-0000-000000000008',
];

for (const pId of patientUuids) {
  // Doctor 1 consent
  MOCK_CONSENTS.push({
    id: crypto.randomUUID(),
    patient_id: pId,
    grantee_type: 'doctor',
    grantee_id: 'd0010000-0000-0000-0000-000000000001',
    access_type: 'read',
    data_categories: JSON.stringify(['all']),
    is_revoked: false,
    is_one_time: false,
    used_at: null,
    expires_at: null,
    created_at: new Date().toISOString()
  });
  // Doctor 1 write consent (so the doctor can prescription/upload)
  MOCK_CONSENTS.push({
    id: crypto.randomUUID(),
    patient_id: pId,
    grantee_type: 'doctor',
    grantee_id: 'd0010000-0000-0000-0000-000000000001',
    access_type: 'write',
    data_categories: JSON.stringify(['all', 'prescriptions']),
    is_revoked: false,
    is_one_time: false,
    used_at: null,
    expires_at: null,
    created_at: new Date().toISOString()
  });
  // Clinic-level consent
  MOCK_CONSENTS.push({
    id: crypto.randomUUID(),
    patient_id: pId,
    grantee_type: 'clinic',
    grantee_id: MOCK_CLINIC.id,
    access_type: 'read',
    data_categories: JSON.stringify(['all']),
    is_revoked: false,
    is_one_time: false,
    used_at: null,
    expires_at: null,
    created_at: new Date().toISOString()
  });
}

const MOCK_EMERGENCY: Record<string, any> = {
  'bb010000-0000-0000-0000-000000000001': { allergies: [{ name: 'Penicillin', severity: 'Moderate' }, { name: 'Aspirin', severity: 'Low' }], medications: [{ name: 'Lisinopril', dosage: '10mg', frequency: 'Once daily' }, { name: 'Amlodipine', dosage: '5mg', frequency: 'Once daily' }], chronic_conditions: [{ name: 'Hypertension' }], emergency_contacts: [{ name: 'Ibrahim Koroma', phone: '+23276987654' }] },
  'bb010000-0000-0000-0000-000000000002': { allergies: [{ name: 'Sulfa drugs', severity: 'Moderate' }], medications: [{ name: 'Metformin', dosage: '500mg', frequency: 'Twice daily' }], chronic_conditions: [{ name: 'Type 2 Diabetes' }], emergency_contacts: [{ name: 'Fatmata Bangura', phone: '+23277345678' }] },
  'bb010000-0000-0000-0000-000000000003': { allergies: [{ name: 'NSAIDs', severity: 'Moderate' }, { name: 'Dust mites', severity: 'Low' }], medications: [{ name: 'Salbutamol', dosage: '100mcg', frequency: 'As needed' }], chronic_conditions: [{ name: 'Asthma' }], emergency_contacts: [{ name: 'Alhaji Sesay', phone: '+23278456789' }] },
  'bb010000-0000-0000-0000-000000000004': { allergies: [{ name: 'Iodine contrast', severity: 'High' }], medications: [{ name: 'Aspirin', dosage: '75mg' }], chronic_conditions: [{ name: 'Coronary Artery Disease' }], emergency_contacts: [{ name: 'Mariama Turay', phone: '+23279567890' }] },
  'bb010000-0000-0000-0000-000000000005': { allergies: [{ name: 'Morphine', severity: 'High' }], medications: [{ name: 'Hydroxyurea', dosage: '500mg' }], chronic_conditions: [{ name: 'Sickle Cell Disease' }], emergency_contacts: [{ name: 'Kadiatu Mansaray', phone: '+23276678901' }] },
  'bb010000-0000-0000-0000-000000000006': { allergies: [], medications: [], chronic_conditions: [{ name: 'Malaria (recurrent)' }], emergency_contacts: [{ name: 'Fatmata Kamara', phone: '+23277678901' }] },
};

// Aliases for P00X in MOCK_EMERGENCY
for (let i = 1; i <= 8; i++) {
  const uuid = `bb010000-0000-0000-0000-00000000000${i}`;
  const mockId = `P00${i}`;
  if (MOCK_EMERGENCY[uuid]) {
    MOCK_EMERGENCY[mockId] = MOCK_EMERGENCY[uuid];
  } else {
    MOCK_EMERGENCY[uuid] = { allergies: [], medications: [], chronic_conditions: [], emergency_contacts: [] };
    MOCK_EMERGENCY[mockId] = MOCK_EMERGENCY[uuid];
  }
}

const MOCK_RECORDS: any[] = [
  { id: 'rec0001-0000-0000-0000-000000000001', patient_id: 'bb010000-0000-0000-0000-000000000001', record_type: 'Laboratory', title: 'Full Blood Count — June 2026', encrypted_cid: 'QmXf8Y7zKpLm3NqRsT2uVwE5hJcGbMnAoP9iDkFlH6ySv', integrity_hash: '0xabc123def456', data_categories: JSON.stringify(['labs']), uploaded_by: 'd0010000-0000-0000-0000-000000000001', created_at: new Date(Date.now() - 86400000 * 3).toISOString(), ledger_tx_hash: '0xfabric001ledger' },
];

const MOCK_TREATMENTS: any[] = [
  { id: 'trx0001-0000-0000-0000-000000000001', patient_id: 'bb010000-0000-0000-0000-000000000001', doctor_id: 'd0010000-0000-0000-0000-000000000001', treatment_type: 'medication', title: 'Lisinopril 10mg', description: 'Take 1 tablet once daily. Monitor blood pressure weekly.', created_at: new Date(Date.now() - 86400000 * 7).toISOString(), ledger_tx_hash: '0xfabric002ledger', doctor_name: 'Dr. Amara Kofi' },
];

const ACCESS_LOGS: any[] = [];
const MOCK_ACCESS_TOKENS: any[] = [];

// ─── Mock SQL router ─────────────────────────────────────────────────────────

function mockQuery(text: string, params: any[] = []): { rows: any[]; rowCount: number } {
  // Normalize parameters to resolve frontend mock IDs to UUIDs
  params = params.map(p => {
    if (p === 'P001') return 'bb010000-0000-0000-0000-000000000001';
    if (p === 'P002') return 'bb010000-0000-0000-0000-000000000002';
    if (p === 'P003') return 'bb010000-0000-0000-0000-000000000003';
    if (p === 'P004') return 'bb010000-0000-0000-0000-000000000004';
    if (p === 'P005') return 'bb010000-0000-0000-0000-000000000005';
    if (p === 'P006') return 'bb010000-0000-0000-0000-000000000006';
    if (p === 'P007') return 'bb010000-0000-0000-0000-000000000007';
    if (p === 'P008') return 'bb010000-0000-0000-0000-000000000008';
    return p;
  });

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
  if (sql.includes('update emergency_profiles')) {
    if (sql.includes('medications = $1')) {
      const medications = typeof params[0] === 'string' ? JSON.parse(params[0]) : params[0];
      const patientId = params[1];
      if (MOCK_EMERGENCY[patientId]) {
        MOCK_EMERGENCY[patientId].medications = medications;
        // Keep alias in sync
        for (let i = 1; i <= 8; i++) {
          const uuid = `bb010000-0000-0000-0000-00000000000${i}`;
          const mockId = `P00${i}`;
          if (patientId === uuid || patientId === mockId) {
            MOCK_EMERGENCY[uuid].medications = medications;
            MOCK_EMERGENCY[mockId].medications = medications;
          }
        }
      }
    } else if (sql.includes('hidden_fields = $1')) {
      const hiddenFields = typeof params[0] === 'string' ? JSON.parse(params[0]) : params[0];
      const patientId = params[1];
      if (MOCK_EMERGENCY[patientId]) {
        MOCK_EMERGENCY[patientId].hidden_fields = hiddenFields;
      }
    }
    return { rows: [], rowCount: 1 };
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
    let rawRecs = MOCK_RECORDS;
    if (params.length === 3) {
      const [doctorId, clinicId, role] = params;
      // Filter records by patient IDs for which the doctor has consent in MOCK_CONSENTS
      const allowedPatients = patientUuids.filter(pId => {
        return MOCK_CONSENTS.some(c =>
          c.patient_id === pId && !c.is_revoked &&
          (
            (c.grantee_type === 'doctor' && c.grantee_id === doctorId) ||
            (c.grantee_type === 'clinic' && c.grantee_id === clinicId) ||
            (c.grantee_type === 'role' && c.grantee_id === role)
          )
        );
      });
      rawRecs = MOCK_RECORDS.filter(r => allowedPatients.includes(r.patient_id));
    } else if (params[0]) {
      rawRecs = MOCK_RECORDS.filter(r => r.patient_id === params[0]);
    }
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
  isSimulated: () => !dbAvailable,
  getMockPatients: () => {
    // Only return unique patient records by filtering out duplicate references (mock aliases)
    const seen = new Set<string>();
    return Object.values(MOCK_PATIENTS).filter((p: any) => {
      if (seen.has(p.id)) return false;
      seen.add(p.id);
      return true;
    });
  },
  getMockDoctors: () => Object.values(MOCK_DOCTORS),
};
