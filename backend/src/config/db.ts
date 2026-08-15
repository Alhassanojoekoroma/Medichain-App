import { Pool } from 'pg';
import { logger } from '../utils/logger';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { readSecurityConfig } from './environment';

// ─── Explicit synthetic-sandbox fixture data ────────────────────────────────
// Used only when ENABLE_DEMO_DATA=true in a fully explicit synthetic sandbox.

const securityConfig = readSecurityConfig();
const BCRYPT_HASH = securityConfig.allowDemoAuth && securityConfig.sandboxPatientPassword
  ? bcrypt.hashSync(securityConfig.sandboxPatientPassword, 10)
  : '';

const SANDBOX_CLINIC = {
  id: 'c0010000-0000-0000-0000-000000000001',
  name: 'Connaught Hospital, Freetown',
};

const SANDBOX_DOCTORS: Record<string, any> = {
  'doctor@medichain.sl': {
    id: 'd0010000-0000-0000-0000-000000000001',
    email: 'doctor@medichain.sl',
    password_hash: BCRYPT_HASH,
    full_name: 'Dr. Amara Kofi',
    role: 'doctor',
    clinic_id: SANDBOX_CLINIC.id,
    is_active: true,
  },
  'doctor2@medichain.sl': {
    id: 'd0010000-0000-0000-0000-000000000002',
    email: 'doctor2@medichain.sl',
    password_hash: BCRYPT_HASH,
    full_name: 'Dr. John Kamara',
    role: 'doctor',
    clinic_id: SANDBOX_CLINIC.id,
    is_active: true,
  },
  'nurse@medichain.sl': {
    id: 'd0010000-0000-0000-0000-000000000003',
    email: 'nurse@medichain.sl',
    password_hash: BCRYPT_HASH,
    full_name: 'Nurse Inos',
    role: 'nurse',
    clinic_id: SANDBOX_CLINIC.id,
    is_active: true,
  },
  'staff@medichain.sl': {
    id: 'd0010000-0000-0000-0000-000000000004',
    email: 'staff@medichain.sl',
    password_hash: BCRYPT_HASH,
    full_name: 'Admin Staff',
    role: 'staff',
    clinic_id: SANDBOX_CLINIC.id,
    is_active: true,
  },
  'laboratory@medichain.sl': {
    id: 'd0010000-0000-0000-0000-000000000005',
    email: 'laboratory@medichain.sl',
    password_hash: BCRYPT_HASH,
    full_name: 'Laboratory Officer',
    role: 'laboratory',
    clinic_id: SANDBOX_CLINIC.id,
    is_active: true,
  },
  'pharmacy@medichain.sl': {
    id: 'd0010000-0000-0000-0000-000000000006',
    email: 'pharmacy@medichain.sl',
    password_hash: BCRYPT_HASH,
    full_name: 'Pharmacy Officer',
    role: 'pharmacy',
    clinic_id: SANDBOX_CLINIC.id,
    is_active: true,
  },
  'analyst@health.gov.sl': {
    id: 'd0010000-0000-0000-0000-000000000007', email: 'analyst@health.gov.sl', password_hash: BCRYPT_HASH,
    full_name: 'Ministry Health Analyst', role: 'government', clinic_id: SANDBOX_CLINIC.id, is_active: true,
  },
  'approver@health.gov.sl': {
    id: 'd0010000-0000-0000-0000-000000000008', email: 'approver@health.gov.sl', password_hash: BCRYPT_HASH,
    full_name: 'Ministry Export Approver', role: 'government', clinic_id: SANDBOX_CLINIC.id, is_active: true,
  },
  'admin@medichain.sl': {
    id: 'd0010000-0000-0000-0000-000000000009', email: 'admin@medichain.sl', password_hash: BCRYPT_HASH,
    full_name: 'Synthetic Operations Administrator', role: 'admin', clinic_id: SANDBOX_CLINIC.id, is_active: true,
  },
};

const SANDBOX_PATIENTS: Record<string, any> = {};

// Helper to define a synthetic patient by UUID and sandbox alias.
const definePatient = (uuid: string, mockId: string, patientData: any) => {
  const data = { id: uuid, account_status: 'active', ...patientData };
  SANDBOX_PATIENTS[uuid] = data;
  SANDBOX_PATIENTS[mockId] = data;
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

const SANDBOX_CONSENTS: any[] = [];

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
  SANDBOX_CONSENTS.push({
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
  SANDBOX_CONSENTS.push({
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
  SANDBOX_CONSENTS.push({
    id: crypto.randomUUID(),
    patient_id: pId,
    grantee_type: 'clinic',
    grantee_id: SANDBOX_CLINIC.id,
    access_type: 'read',
    data_categories: JSON.stringify(['all']),
    is_revoked: false,
    is_one_time: false,
    used_at: null,
    expires_at: null,
    created_at: new Date().toISOString()
  });
}

const SANDBOX_EMERGENCY: Record<string, any> = {
  'bb010000-0000-0000-0000-000000000001': { allergies: [{ name: 'Penicillin', severity: 'Moderate' }, { name: 'Aspirin', severity: 'Low' }], medications: [{ name: 'Lisinopril', dosage: '10mg', frequency: 'Once daily' }, { name: 'Amlodipine', dosage: '5mg', frequency: 'Once daily' }], chronic_conditions: [{ name: 'Hypertension' }], emergency_contacts: [{ name: 'Ibrahim Koroma', phone: '+23276987654' }] },
  'bb010000-0000-0000-0000-000000000002': { allergies: [{ name: 'Sulfa drugs', severity: 'Moderate' }], medications: [{ name: 'Metformin', dosage: '500mg', frequency: 'Twice daily' }], chronic_conditions: [{ name: 'Type 2 Diabetes' }], emergency_contacts: [{ name: 'Fatmata Bangura', phone: '+23277345678' }] },
  'bb010000-0000-0000-0000-000000000003': { allergies: [{ name: 'NSAIDs', severity: 'Moderate' }, { name: 'Dust mites', severity: 'Low' }], medications: [{ name: 'Salbutamol', dosage: '100mcg', frequency: 'As needed' }], chronic_conditions: [{ name: 'Asthma' }], emergency_contacts: [{ name: 'Alhaji Sesay', phone: '+23278456789' }] },
  'bb010000-0000-0000-0000-000000000004': { allergies: [{ name: 'Iodine contrast', severity: 'High' }], medications: [{ name: 'Aspirin', dosage: '75mg' }], chronic_conditions: [{ name: 'Coronary Artery Disease' }], emergency_contacts: [{ name: 'Mariama Turay', phone: '+23279567890' }] },
  'bb010000-0000-0000-0000-000000000005': { allergies: [{ name: 'Morphine', severity: 'High' }], medications: [{ name: 'Hydroxyurea', dosage: '500mg' }], chronic_conditions: [{ name: 'Sickle Cell Disease' }], emergency_contacts: [{ name: 'Kadiatu Mansaray', phone: '+23276678901' }] },
  'bb010000-0000-0000-0000-000000000006': { allergies: [], medications: [], chronic_conditions: [{ name: 'Malaria (recurrent)' }], emergency_contacts: [{ name: 'Fatmata Kamara', phone: '+23277678901' }] },
};

// Aliases for P00X in SANDBOX_EMERGENCY
for (let i = 1; i <= 8; i++) {
  const uuid = `bb010000-0000-0000-0000-00000000000${i}`;
  const mockId = `P00${i}`;
  if (SANDBOX_EMERGENCY[uuid]) {
    SANDBOX_EMERGENCY[mockId] = SANDBOX_EMERGENCY[uuid];
  } else {
    SANDBOX_EMERGENCY[uuid] = { allergies: [], medications: [], chronic_conditions: [], emergency_contacts: [] };
    SANDBOX_EMERGENCY[mockId] = SANDBOX_EMERGENCY[uuid];
  }
}

const SANDBOX_RECORDS: any[] = [
  { id: 'rec0001-0000-0000-0000-000000000001', patient_id: 'bb010000-0000-0000-0000-000000000001', record_type: 'Laboratory', title: 'Full Blood Count — June 2026', encrypted_cid: 'QmXf8Y7zKpLm3NqRsT2uVwE5hJcGbMnAoP9iDkFlH6ySv', integrity_hash: '0xabc123def456', data_categories: JSON.stringify(['labs']), uploaded_by: 'd0010000-0000-0000-0000-000000000001', created_at: new Date(Date.now() - 86400000 * 3).toISOString(), ledger_tx_hash: '0xfabric001ledger' },
];

const SANDBOX_TREATMENTS: any[] = [
  { id: 'trx0001-0000-0000-0000-000000000001', patient_id: 'bb010000-0000-0000-0000-000000000001', doctor_id: 'd0010000-0000-0000-0000-000000000001', treatment_type: 'medication', title: 'Lisinopril 10mg', description: 'Take 1 tablet once daily. Monitor blood pressure weekly.', created_at: new Date(Date.now() - 86400000 * 7).toISOString(), ledger_tx_hash: '0xfabric002ledger', doctor_name: 'Dr. Amara Kofi' },
];

const ACCESS_LOGS: any[] = [];
const SANDBOX_ACCESS_TOKENS: any[] = [];
const SANDBOX_IDENTITY_SESSIONS = new Map<string, any>();
const SANDBOX_HEALTH_IDS: any[] = [];
const SANDBOX_BREAK_GLASS: any[] = [];
const SANDBOX_OFFLINE_COMMANDS = new Map<string, any>();
const SANDBOX_RESOURCE_VERSIONS = new Map<string, number>();

// ─── Mock SQL router ─────────────────────────────────────────────────────────

function sandboxQuery(text: string, params: any[] = []): { rows: any[]; rowCount: number } {
  // Normalize parameters to resolve frontend sandbox IDs to UUIDs
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

  if (sql.startsWith('with ensured as') && sql.includes('insert into offline_commands')) {
    const key = `${params[0]}:${params[1]}`;
    const current = SANDBOX_RESOURCE_VERSIONS.get(key) ?? 0;
    if (SANDBOX_OFFLINE_COMMANDS.has(params[3]) || current !== params[2]) return { rows: [], rowCount: 0 };
    const resultingVersion = current + 1;
    SANDBOX_RESOURCE_VERSIONS.set(key, resultingVersion);
    SANDBOX_OFFLINE_COMMANDS.set(params[3], { command_id: params[3], patient_id: params[0], resulting_version: resultingVersion });
    return { rows: [{ resulting_version: resultingVersion }], rowCount: 1 };
  }
  if (sql.includes('from offline_commands') && sql.includes('command_id = $1')) {
    const command = SANDBOX_OFFLINE_COMMANDS.get(params[0]);
    if (!command || (params[1] && command.patient_id !== params[1])) return { rows: [], rowCount: 0 };
    return { rows: [command], rowCount: 1 };
  }
  if (sql.includes('from resource_versions')) {
    const version = SANDBOX_RESOURCE_VERSIONS.get(`${params[0]}:${params[1]}`);
    return version === undefined ? { rows: [], rowCount: 0 } : { rows: [{ version }], rowCount: 1 };
  }


  // Counts
  if (sql.includes('count(*)') || sql.includes('count(1)')) {
    if (sql.includes('from clinics')) return { rows: [{ count: '1' }], rowCount: 1 };
    if (sql.includes('from doctors')) {
      if (sql.includes("email = 'nurse@medichain.sl'")) {
        const hasNurse = Object.values(SANDBOX_DOCTORS).some((d: any) => d.email === 'nurse@medichain.sl');
        return { rows: [{ count: hasNurse ? '1' : '0' }], rowCount: 1 };
      }
      if (sql.includes("email = 'staff@medichain.sl'")) {
        const hasStaff = Object.values(SANDBOX_DOCTORS).some((d: any) => d.email === 'staff@medichain.sl');
        return { rows: [{ count: hasStaff ? '1' : '0' }], rowCount: 1 };
      }
      return { rows: [{ count: Object.keys(SANDBOX_DOCTORS).length.toString() }], rowCount: 1 };
    }
    if (sql.includes('from patients')) return { rows: [{ count: Object.keys(SANDBOX_PATIENTS).length.toString() }], rowCount: 1 };
    if (sql.includes('from health_records')) return { rows: [{ count: SANDBOX_RECORDS.length.toString() }], rowCount: 1 };
    return { rows: [{ count: '0' }], rowCount: 1 };
  }

  // Clinics lookup
  if (sql.includes('from clinics') && sql.includes('limit 1')) {
    return { rows: [SANDBOX_CLINIC], rowCount: 1 };
  }

  // Doctors
  if (sql.includes('from doctors where email')) {
    const email = (params[0] || '').toLowerCase();
    const doc = SANDBOX_DOCTORS[email];
    if (!doc || !doc.is_active) return { rows: [], rowCount: 0 };
    return { rows: [doc], rowCount: 1 };
  }
  if (sql.includes('from doctors where id')) {
    const id = params[0];
    const doc = Object.values(SANDBOX_DOCTORS).find((d: any) => d.id === id);
    return doc ? { rows: [doc], rowCount: 1 } : { rows: [], rowCount: 0 };
  }
  if (sql.includes('from doctors d') && sql.includes('facility_active')) {
    const doc = Object.values(SANDBOX_DOCTORS).find((d: any) => d.id === params[0]) as any;
    return doc ? { rows: [{ account_status: doc.is_active ? 'active' : 'disabled', actor_facility_id: doc.clinic_id, facility_active: true }], rowCount: 1 } : { rows: [], rowCount: 0 };
  }
  if (sql.includes('from doctors d')) {
    return { rows: [], rowCount: 0 };
  }

  // Clinics
  if (sql.includes('from clinics where id')) {
    const id = params[0];
    if (id === SANDBOX_CLINIC.id) return { rows: [SANDBOX_CLINIC], rowCount: 1 };
    return { rows: [], rowCount: 0 };
  }

  // Patients
  if (sql.includes('insert into patients')) {
    const newPatient = {
      id: crypto.randomUUID(),
      full_name: params[0], date_of_birth: params[1], blood_type: params[2],
      phone: params[3], email: params[4],
      account_status: 'unverified',
      wallet_address: `0x${crypto.randomBytes(8).toString('hex')}`,
    };
    SANDBOX_PATIENTS[newPatient.id] = newPatient;
    return { rows: [newPatient], rowCount: 1 };
  }
  if (sql.includes('from patients where id')) {
    const p = SANDBOX_PATIENTS[params[0]];
    return p ? { rows: [p], rowCount: 1 } : { rows: [], rowCount: 0 };
  }
  if (sql.includes('from patients where email')) {
    const p = Object.values(SANDBOX_PATIENTS).find((p: any) => p.email === params[0]);
    return p ? { rows: [p], rowCount: 1 } : { rows: [], rowCount: 0 };
  }
  if (sql.includes('from patients where phone')) {
    const p = Object.values(SANDBOX_PATIENTS).find((p: any) => p.phone === params[0]);
    return p ? { rows: [p], rowCount: 1 } : { rows: [], rowCount: 0 };
  }
  if (sql.includes('lower(email) = lower($1)') && sql.includes('phone = $2')) {
    const p = Object.values(SANDBOX_PATIENTS).find((patient: any) =>
      String(patient.email).toLowerCase() === String(params[0]).toLowerCase() || patient.phone === params[1]
    );
    return p ? { rows: [{ id: p.id }], rowCount: 1 } : { rows: [], rowCount: 0 };
  }
  if (sql.includes('from patients')) {
    return { rows: Object.values(SANDBOX_PATIENTS), rowCount: Object.keys(SANDBOX_PATIENTS).length };
  }

  // Consent policies
  if (sql.includes('from consent_policies') && sql.includes('patient_id = $1') && sql.includes('access_type = $4')) {
    const [patientId, doctorId, clinicId, accessType, purpose] = params;
    const match = SANDBOX_CONSENTS.find(c =>
      c.patient_id === patientId && !c.is_revoked && c.access_type === accessType &&
      c.purpose === purpose &&
      (
        (c.grantee_type === 'doctor' && c.grantee_id === doctorId) ||
        (c.grantee_type === 'clinic' && c.grantee_id === clinicId)
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
    const rows = SANDBOX_CONSENTS.filter(c => c.patient_id === params[0] && !c.is_revoked).map(c => ({
      ...c,
      data_categories: typeof c.data_categories === 'string' ? JSON.parse(c.data_categories) : c.data_categories
    }));
    return { rows, rowCount: rows.length };
  }
  if (sql.includes('insert into consent_policies')) {
    const c = { id: crypto.randomUUID(), patient_id: params[0], grantee_type: params[1], grantee_id: params[2], access_type: params[3], data_categories: params[4], purpose: params[5], expires_at: params[6], is_one_time: params[7], is_revoked: false };
    SANDBOX_CONSENTS.push(c);
    return { rows: [c], rowCount: 1 };
  }
  if (sql.includes('update consent_policies') && sql.includes('is_revoked = true')) {
    const id = params[0]; const c = SANDBOX_CONSENTS.find(c => c.id === id);
    if (c) { c.is_revoked = true; return { rows: [], rowCount: 1 }; }
    return { rows: [], rowCount: 0 };
  }

  // Emergency profiles
  if (sql.includes('insert into emergency_profiles')) {
    const patientId = params[0];
    const bloodType = params[1];
    SANDBOX_EMERGENCY[patientId] = {
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
      if (SANDBOX_EMERGENCY[patientId]) {
        SANDBOX_EMERGENCY[patientId].medications = medications;
        // Keep alias in sync
        for (let i = 1; i <= 8; i++) {
          const uuid = `bb010000-0000-0000-0000-00000000000${i}`;
          const mockId = `P00${i}`;
          if (patientId === uuid || patientId === mockId) {
            SANDBOX_EMERGENCY[uuid].medications = medications;
            SANDBOX_EMERGENCY[mockId].medications = medications;
          }
        }
      }
    } else if (sql.includes('hidden_fields = $1')) {
      const hiddenFields = typeof params[0] === 'string' ? JSON.parse(params[0]) : params[0];
      const patientId = params[1];
      if (SANDBOX_EMERGENCY[patientId]) {
        SANDBOX_EMERGENCY[patientId].hidden_fields = hiddenFields;
      }
    }
    return { rows: [], rowCount: 1 };
  }
  if (sql.includes('from emergency_profiles')) {
    const ep = SANDBOX_EMERGENCY[params[0]];
    return ep ? { rows: [ep], rowCount: 1 } : { rows: [], rowCount: 0 };
  }

  // Health records
  if (sql.includes('insert into health_records')) {
    const r = { id: crypto.randomUUID(), patient_id: params[0], record_type: params[1], title: params[2], encrypted_cid: `QmMock${crypto.randomBytes(8).toString('hex')}`, integrity_hash: `0x${crypto.randomBytes(16).toString('hex')}`, data_categories: params[3], uploaded_by: params[4], created_at: new Date().toISOString(), ledger_tx_hash: `0xfabric${crypto.randomBytes(8).toString('hex')}` };
    SANDBOX_RECORDS.push(r);
    return { rows: [r], rowCount: 1 };
  }
  if (sql.includes('from health_records')) {
    let rawRecs = SANDBOX_RECORDS;
    if (params.length === 3) {
      const [doctorId, clinicId, role] = params;
      // Filter records by patient IDs for which the doctor has consent in SANDBOX_CONSENTS
      const allowedPatients = patientUuids.filter(pId => {
        return SANDBOX_CONSENTS.some(c =>
          c.patient_id === pId && !c.is_revoked &&
          (
            (c.grantee_type === 'doctor' && c.grantee_id === doctorId) ||
            (c.grantee_type === 'clinic' && c.grantee_id === clinicId) ||
            (c.grantee_type === 'role' && c.grantee_id === role)
          )
        );
      });
      rawRecs = SANDBOX_RECORDS.filter(r => allowedPatients.includes(r.patient_id));
    } else if (params[0]) {
      rawRecs = SANDBOX_RECORDS.filter(r => r.patient_id === params[0]);
    }
    const recs = rawRecs.map(r => ({
      ...r,
      patient_name: SANDBOX_PATIENTS[r.patient_id]?.full_name || 'Unknown Patient',
      doctor_name: Object.values(SANDBOX_DOCTORS).find((doctor: any) => doctor.id === r.uploaded_by)?.full_name ?? null,
      clinic_name: Object.values(SANDBOX_DOCTORS).some((doctor: any) => doctor.id === r.uploaded_by && doctor.clinic_id === SANDBOX_CLINIC.id)
        ? SANDBOX_CLINIC.name
        : null,
      document_available: Boolean(r.encrypted_cid),
    }));
    return { rows: recs, rowCount: recs.length };
  }

  // Treatments
  if (sql.includes('insert into treatments')) {
    const t = { id: crypto.randomUUID(), patient_id: params[0], doctor_id: params[1], treatment_type: params[2], title: params[3], description: params[4], created_at: new Date().toISOString(), ledger_tx_hash: `0xfabric${crypto.randomBytes(8).toString('hex')}`, doctor_name: Object.values(SANDBOX_DOCTORS).find((d: any) => d.id === params[1])?.full_name || 'Unknown Doctor' };
    SANDBOX_TREATMENTS.push(t);
    return { rows: [t], rowCount: 1 };
  }
  if (sql.includes('from treatments')) {
    const treats = params[0] ? SANDBOX_TREATMENTS.filter(t => t.patient_id === params[0]) : SANDBOX_TREATMENTS;
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
    const literalNormal = sql.includes("'normal'");
    const literalEmergency = sql.includes("'emergency'");
    const t = {
      id: crypto.randomUUID(),
      patient_id: params[0],
      token_type: literalNormal ? 'NORMAL' : literalEmergency ? 'EMERGENCY' : params[1],
      token_hash: literalNormal || literalEmergency ? params[1] : params[2],
      signature: literalNormal || literalEmergency ? params[2] : params[3],
      expires_at: literalNormal ? params[3] : literalEmergency ? null : params[4],
      is_one_time: literalNormal ? params[4] : literalEmergency ? false : params[5],
      is_revoked: false,
      used_at: null
    };
    SANDBOX_ACCESS_TOKENS.push(t);
    return { rows: [t], rowCount: 1 };
  }
  if (sql.includes('update access_tokens')) {
    if (sql.includes("token_hash = $1") && sql.includes("token_type = 'normal'") && sql.includes('returning')) {
      const token = SANDBOX_ACCESS_TOKENS.find(t =>
        t.token_hash === params[0] && !t.is_revoked &&
        (!t.expires_at || new Date(t.expires_at).getTime() > Date.now()) &&
        (!t.is_one_time || !t.used_at)
      );
      if (!token) return { rows: [], rowCount: 0 };
      if (token.is_one_time) token.used_at = new Date().toISOString();
      return { rows: [token], rowCount: 1 };
    }
    if (sql.includes('is_revoked = true') || sql.includes('is_revoked = truth')) {
      const patientId = params[0];
      const tokens = SANDBOX_ACCESS_TOKENS.filter(t => t.patient_id === patientId);
      for (const t of tokens) {
        t.is_revoked = true;
      }
    }
    return { rows: [], rowCount: 1 };
  }
  if (sql.includes('from access_tokens')) {
    const hash = params[0];
    const match = SANDBOX_ACCESS_TOKENS.find(t => t.token_hash === hash && !t.is_revoked);
    if (!match) return { rows: [], rowCount: 0 };

    if (sql.includes('full_name') || sql.includes('emergency_profiles')) {
      // Emergency resolve query: JOIN patients and emergency_profiles
      const patient = SANDBOX_PATIENTS[match.patient_id];
      const ep = SANDBOX_EMERGENCY[match.patient_id] || { allergies: [], medications: [], chronic_conditions: [] };
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

  // Identity session lifecycle
  if (sql.includes('insert into identity_sessions')) {
    if (!SANDBOX_IDENTITY_SESSIONS.has(params[0])) {
      SANDBOX_IDENTITY_SESSIONS.set(params[0], {
        id: params[0], actor_id: params[1], actor_role: params[2], facility_id: params[3],
        token_version: params[4], mfa_verified_at: params[5], expires_at: params[6],
        last_activity_at: new Date().toISOString(), absolute_expires_at: params[7], revoked_at: null,
      });
    } else {
      const existing = SANDBOX_IDENTITY_SESSIONS.get(params[0]);
      if (!existing.revoked_at && new Date(params[6]).getTime() > new Date(existing.expires_at).getTime()) existing.expires_at = params[6];
    }
    return { rows: [], rowCount: 1 };
  }
  if (sql.includes('from identity_sessions')) {
    if (sql.includes('where actor_id = $1')) {
      const sessions = [...SANDBOX_IDENTITY_SESSIONS.values()].filter(session => session.actor_id === params[0]);
      return { rows: sessions, rowCount: sessions.length };
    }
    const session = SANDBOX_IDENTITY_SESSIONS.get(params[0]);
    if (!session || (params[1] && session.actor_id !== params[1])) return { rows: [], rowCount: 0 };
    return { rows: [session], rowCount: 1 };
  }
  if (sql.includes('update identity_sessions')) {
    const session = SANDBOX_IDENTITY_SESSIONS.get(params[0]);
    if (!session || session.actor_id !== params[1] || session.revoked_at) return { rows: [], rowCount: 0 };
    if (sql.includes('last_activity_at')) {
      session.last_activity_at = new Date().toISOString();
      return { rows: [{ last_activity_at: session.last_activity_at }], rowCount: 1 };
    }
    session.revoked_at = new Date().toISOString();
    return { rows: [], rowCount: 1 };
  }

  // Patient Health ID lifecycle
  if (sql.includes('insert into health_identifiers')) {
    SANDBOX_HEALTH_IDS.push({ id: params[0], patient_id: params[1], identifier_hash: params[2], status: 'active', issued_at: new Date().toISOString(), revoked_at: null });
    return { rows: [], rowCount: 1 };
  }
  if (sql.includes('from health_identifiers')) {
    let rows = SANDBOX_HEALTH_IDS.filter(item => item.patient_id === params[0]);
    if (sql.includes("status = 'active'")) rows = rows.filter(item => item.status === 'active');
    return { rows, rowCount: rows.length };
  }
  if (sql.includes('update health_identifiers') && sql.includes("status = 'lost'")) {
    const item = SANDBOX_HEALTH_IDS.find(candidate => candidate.patient_id === params[0] && candidate.status === 'active');
    if (!item) return { rows: [], rowCount: 0 };
    item.status = 'lost'; item.revoked_at = new Date().toISOString();
    return { rows: [{ id: item.id }], rowCount: 1 };
  }
  if (sql.includes('update health_identifiers') && sql.includes('replaced_by')) {
    const item = SANDBOX_HEALTH_IDS.find(candidate => candidate.id === params[1]);
    if (!item) return { rows: [], rowCount: 0 };
    item.status = 'replaced'; item.replaced_by = params[0];
    return { rows: [], rowCount: 1 };
  }

  // Reviewed, time-boxed emergency access
  if (sql.includes('insert into break_glass_events')) {
    const event = { id: crypto.randomUUID(), patient_id: params[0], actor_id: params[1], facility_id: params[2], reason_code: params[3], justification: params[4], approved_categories: params[5], expires_at: params[6] };
    SANDBOX_BREAK_GLASS.push(event);
    return { rows: [{ id: event.id }], rowCount: 1 };
  }
  if (sql.includes('from break_glass_events')) {
    const event = SANDBOX_BREAK_GLASS.find(item => item.id === params[0] && item.patient_id === params[1] && item.actor_id === params[2] && item.facility_id === params[3] && new Date(item.expires_at).getTime() > Date.now());
    return event ? { rows: [{ id: event.id }], rowCount: 1 } : { rows: [], rowCount: 0 };
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

  logger.warn(`[DB-SANDBOX] Unhandled query: ${text.substring(0, 120)}`);
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
  dbAvailable = true;

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
      if (securityConfig.allowDemoData) {
        logger.warn(`[DB] PostgreSQL unavailable. Explicit synthetic fixture storage is active. (${err.code})`);
      } else {
        logger.error(`[DB] PostgreSQL unavailable. Sensitive operations will fail closed. (${err.code})`);
      }
    });
} else {
  if (securityConfig.allowDemoData) {
    logger.warn('[DB] DATABASE_URL not set. Explicit synthetic fixture storage is active.');
  } else {
    logger.error('[DB] DATABASE_URL not set. Sensitive operations will fail closed.');
  }

}

// ─── Unified db interface ─────────────────────────────────────────────────────

export const db = {
  on: (event: string, listener: (...args: any[]) => void) => pool?.on(event as any, listener),

  query: async (text: string, params?: any[]): Promise<{ rows: any[]; rowCount: number }> => {
    if (pool) {
      try {
        const res = await pool.query(text, params);
        dbAvailable = true;
        return { rows: res.rows, rowCount: res.rowCount ?? 0 };
      } catch (err: any) {
        const isConnErr = ['ECONNREFUSED', 'ENOTFOUND', 'ECONNRESET', 'ETIMEDOUT', 'AggregateError'].some(c => err.code === c || err.name === c);
        if (isConnErr) {
          dbAvailable = false;
          if (securityConfig.allowDemoData) {
            logger.warn('[DB] Lost PostgreSQL connection. Explicit synthetic fixture storage is active.');
          } else {
            logger.error('[DB] Lost PostgreSQL connection. Failing closed.');
            throw err;
          }
        } else {
          logger.error(`[DB] Query error`, { text: text.substring(0, 100), error: err.message });
          throw err;
        }
      }
    }
    if (securityConfig.allowDemoData) {
      return sandboxQuery(text, params);
    }
    throw new Error('Database unavailable. The operation was not persisted.');
  },

  pool: pool as any,
  isSimulated: () => securityConfig.allowDemoData && !dbAvailable,
  getSandboxPatients: () => {
    if (!securityConfig.allowDemoData) return [];
    // Only return unique patient records by filtering out duplicate references (sandbox aliases)
    const seen = new Set<string>();
    return Object.values(SANDBOX_PATIENTS).filter((p: any) => {
      if (seen.has(p.id)) return false;
      seen.add(p.id);
      return true;
    });
  },
  getSandboxDoctors: () => securityConfig.allowDemoData ? Object.values(SANDBOX_DOCTORS) : [],
};
