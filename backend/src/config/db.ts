/**
 * backend/src/config/db.ts
 * Database connector with self-seeding local JSON file fallback for offline/development environments.
 */
import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';

const useMockDb = !process.env.DATABASE_URL || process.env.DATABASE_URL.includes('localhost:5432') || process.env.DATABASE_URL.includes('placeholder');
const MOCK_DB_PATH = path.join(__dirname, '../../mock_db.json');

// Real Pool instance, only created if not using mock db
let realPool: Pool | null = null;
if (!useMockDb) {
  try {
    realPool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 3000,
    });
    realPool.on('error', (err) => {
      console.error('[DB] Unexpected PG Pool error:', err);
    });
    console.log('[DB] Connecting to PostgreSQL production database...');
  } catch (err) {
    console.error('[DB] Failed to initialize PostgreSQL pool, falling back to local simulation:', err);
  }
}

// Initial seed data
const SEED_DATA = {
  clinics: [
    { id: 'c0010000-0000-0000-0000-000000000001', name: 'Connaught Hospital, Freetown', address: 'Lightfoot Boston Street, Freetown', phone: '+232 22 222222', is_active: true }
  ],
  doctors: [
    {
      id: 'd0010000-0000-0000-0000-000000000001',
      full_name: 'Dr. Amara Kofi',
      email: 'doctor@medichain.sl',
      password_hash: 'password123',
      license_no: 'SL-MED-2019-0047',
      specialty: 'General Medicine',
      clinic_id: 'c0010000-0000-0000-0000-000000000001',
      is_active: true
    },
    {
      id: 'd0010000-0000-0000-0000-000000000002',
      full_name: 'Dr. John Kamara',
      email: 'doctor@medichain.local',
      password_hash: 'Test@123456',
      license_no: 'SL-MED-2022-0089',
      specialty: 'Cardiology',
      clinic_id: 'c0010000-0000-0000-0000-000000000001',
      is_active: true
    }
  ],
  patients: [
    {
      id: 'p0010000-0000-0000-0000-000000000001',
      full_name: 'Alex Johnson',
      date_of_birth: '1990-05-15',
      blood_type: 'O+',
      phone: '+232 76 000 001',
      email: 'patient@medichain.sl',
      wallet_address: '0x35ef000000000000000000000000000000000001'
    }
  ],
  emergency_profiles: [
    {
      id: 'e0010000-0000-0000-0000-000000000001',
      patient_id: 'p0010000-0000-0000-0000-000000000001',
      allergies: [{ name: 'Penicillin', severity: 'High' }, { name: 'Peanuts', severity: 'Moderate' }],
      blood_type: 'O+',
      medications: [{ name: 'Paracetamol', dosage: '500mg' }, { name: 'Lisinopril', dosage: '10mg' }],
      chronic_conditions: [{ name: 'Hypertension' }],
      emergency_contacts: [{ name: 'Fatmata Conteh', phone: '+232 77 654321', relation: 'Spouse' }],
      emergency_notes: 'Patient suffers from seasonal allergies. Epipen in personal bag.',
      hidden_fields: []
    }
  ],
  health_records: [
    {
      id: 'h0010000-0000-0000-0000-000000000001',
      patient_id: 'p0010000-0000-0000-0000-000000000001',
      record_type: 'lab',
      title: 'Full Blood Count (FBC)',
      encrypted_cid: 'QmXoypizjW3WknFixtLH48q6zoGwE3vT13fCQ99F755355',
      integrity_hash: '0x123abc789def0123456789abcdef0123456789abcdef0123456789abcdef0123',
      data_categories: ['labs'],
      uploaded_by: 'doctor-amara-kofi@medichain.sl',
      created_at: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString()
    },
    {
      id: 'h0010000-0000-0000-0000-000000000002',
      patient_id: 'p0010000-0000-0000-0000-000000000001',
      record_type: 'prescription',
      title: 'Anti-hypertension Regimen',
      encrypted_cid: 'QmYwAPJ882QF8FSLMLgwstJeaJ6gUpUr1c1A005232',
      integrity_hash: '0x456def789def0123456789abcdef0123456789abcdef0123456789abcdef0123',
      data_categories: ['prescriptions'],
      uploaded_by: 'doctor-amara-kofi@medichain.sl',
      created_at: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString()
    }
  ],
  consent_policies: [] as any[],
  access_tokens: [] as any[],
  access_logs: [] as any[],
  revocation_events: [] as any[],
  sync_queue: [] as any[],
  doctor_access_requests: [] as any[],
};

// Initialize file database if it doesn't exist
if (useMockDb) {
  if (!fs.existsSync(MOCK_DB_PATH)) {
    fs.writeFileSync(MOCK_DB_PATH, JSON.stringify(SEED_DATA, null, 2));
    console.log(`[DB] Seeding mock database in ${MOCK_DB_PATH}...`);
  } else {
    console.log(`[DB] Using existing mock database from ${MOCK_DB_PATH}`);
  }
}

// Read database from file
function readDb(): typeof SEED_DATA {
  try {
    const data = fs.readFileSync(MOCK_DB_PATH, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error('[DB] Error reading mock db, using in-memory fallback', err);
    return SEED_DATA;
  }
}

// Write database to file
function writeDb(data: typeof SEED_DATA) {
  try {
    fs.writeFileSync(MOCK_DB_PATH, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('[DB] Error writing to mock db', err);
  }
}

// Helper to simulate SQL results
function makeResult(rows: any[]) {
  return {
    rows,
    rowCount: rows.length,
  };
}

export const db = {
  on: (event: string, listener: (...args: any[]) => void) => {
    // console.log(`[Mock DB] Listening to event: ${event}`);
  },

  query: async (queryText: string, params: any[] = []): Promise<{ rows: any[]; rowCount: number }> => {
    if (realPool && !useMockDb) {
      const result = await realPool.query(queryText, params);
      return {
        rows: result.rows,
        rowCount: result.rowCount ?? 0,
      };
    }

    const data = readDb();
    const cleanSql = queryText.replace(/\s+/g, ' ').trim();

    // ─── SELECT 1 ───
    if (cleanSql === 'SELECT 1') {
      return makeResult([{ 1: 1 }]);
    }

    // ─── DOCTORS LOGIN ───
    // `SELECT id, password_hash, clinic_id FROM doctors WHERE email = $1 AND is_active = TRUE`
    if (cleanSql.includes('FROM doctors WHERE email = $1')) {
      const email = params[0].trim().toLowerCase();
      const doc = data.doctors.find(d => d.email.trim().toLowerCase() === email && d.is_active);
      return makeResult(doc ? [doc] : []);
    }

    // ─── PATIENTS LOGIN ───
    // `SELECT id FROM patients WHERE phone = $1`
    if (cleanSql.includes('FROM patients WHERE phone = $1')) {
      const phone = params[0].trim();
      const pat = data.patients.find(p => p.phone.trim() === phone || p.phone.replace(/\s+/g, '') === phone.replace(/\s+/g, ''));
      return makeResult(pat ? [pat] : []);
    }
    
    // Support login by email for patients as well
    if (cleanSql.includes('FROM patients WHERE email = $1')) {
      const email = params[0].trim().toLowerCase();
      const pat = data.patients.find(p => p.email && p.email.trim().toLowerCase() === email);
      return makeResult(pat ? [pat] : []);
    }

    // ─── VALIDATIONS ───
    if (cleanSql.includes('SELECT id FROM doctors WHERE id = $1')) {
      const doc = data.doctors.find(d => d.id === params[0]);
      return makeResult(doc ? [doc] : []);
    }
    if (cleanSql.includes('SELECT id FROM patients WHERE id = $1')) {
      const pat = data.patients.find(p => p.id === params[0]);
      return makeResult(pat ? [pat] : []);
    }

    // ─── ACCESS REQUESTS ───
    // `INSERT INTO doctor_access_requests (doctor_id, patient_id, reason, data_categories, expires_at) ...`
    if (cleanSql.startsWith('INSERT INTO doctor_access_requests')) {
      const newReq = {
        id: `r-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        doctor_id: params[0],
        patient_id: params[1],
        reason: params[2],
        data_categories: typeof params[3] === 'string' ? JSON.parse(params[3]) : params[3],
        status: 'pending',
        expires_at: new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      data.doctor_access_requests.push(newReq);
      writeDb(data);
      return makeResult([{ id: newReq.id }]);
    }

    // `SELECT doctor_id, patient_id FROM doctor_access_requests WHERE id = $1 AND status = 'pending'`
    if (cleanSql.includes('FROM doctor_access_requests WHERE id = $1 AND status = \'pending\'')) {
      const req = data.doctor_access_requests.find(r => r.id === params[0] && r.status === 'pending');
      return makeResult(req ? [req] : []);
    }

    // `UPDATE doctor_access_requests SET status = 'approved', approved_at = NOW()...`
    if (cleanSql.includes('SET status = \'approved\' WHERE id = $1')) {
      const reqIndex = data.doctor_access_requests.findIndex(r => r.id === params[0]);
      if (reqIndex !== -1) {
        data.doctor_access_requests[reqIndex].status = 'approved';
        data.doctor_access_requests[reqIndex].approved_at = new Date().toISOString();
        data.doctor_access_requests[reqIndex].updated_at = new Date().toISOString();
        writeDb(data);
      }
      return makeResult([]);
    }

    // `UPDATE doctor_access_requests SET status = 'denied', denied_at = NOW()...`
    if (cleanSql.includes('SET status = \'denied\' WHERE id = $1')) {
      const reqIndex = data.doctor_access_requests.findIndex(r => r.id === params[0]);
      if (reqIndex !== -1) {
        data.doctor_access_requests[reqIndex].status = 'denied';
        data.doctor_access_requests[reqIndex].denied_at = new Date().toISOString();
        data.doctor_access_requests[reqIndex].denial_reason = params[1] || 'Patient denied';
        data.doctor_access_requests[reqIndex].updated_at = new Date().toISOString();
        writeDb(data);
      }
      return makeResult([]);
    }

    // `SELECT ar.id... FROM doctor_access_requests ar JOIN doctors d... WHERE ar.patient_id = $1 AND ar.status = 'pending'...`
    if (cleanSql.includes('FROM doctor_access_requests ar') && cleanSql.includes('ar.status = \'pending\'')) {
      const patientId = params[0];
      const pendingReqs = data.doctor_access_requests
        .filter(ar => ar.patient_id === patientId && ar.status === 'pending' && new Date(ar.expires_at) > new Date())
        .map(ar => {
          const doc = data.doctors.find(d => d.id === ar.doctor_id) || { full_name: 'Unknown Doctor', specialty: 'General', clinic_id: '' };
          const clinic = data.clinics.find(c => c.id === doc.clinic_id) || { name: 'Unknown Clinic' };
          return {
            id: ar.id,
            doctor_id: ar.doctor_id,
            reason: ar.reason,
            data_categories: ar.data_categories,
            created_at: ar.created_at,
            expires_at: ar.expires_at,
            doctor_name: doc.full_name,
            specialty: doc.specialty,
            clinic_name: clinic.name
          };
        });
      return makeResult(pendingReqs);
    }

    // Patient History: ar.status IN ('approved', 'denied')
    if (cleanSql.includes('FROM doctor_access_requests ar') && cleanSql.includes('IN (\'approved\', \'denied\')')) {
      const patientId = params[0];
      const history = data.doctor_access_requests
        .filter(ar => ar.patient_id === patientId && (ar.status === 'approved' || ar.status === 'denied'))
        .map(ar => {
          const doc = data.doctors.find(d => d.id === ar.doctor_id) || { full_name: 'Unknown Doctor', specialty: 'General', clinic_id: '' };
          const clinic = data.clinics.find(c => c.id === doc.clinic_id) || { name: 'Unknown Clinic' };
          return {
            id: ar.id,
            doctor_id: ar.doctor_id,
            reason: ar.reason,
            status: ar.status,
            approved_at: ar.approved_at,
            denied_at: ar.denied_at,
            denial_reason: ar.denial_reason,
            doctor_name: doc.full_name,
            specialty: doc.specialty,
            clinic_name: clinic.name
          };
        });
      return makeResult(history);
    }

    // Doctor Requests: ar.doctor_id = $1
    if (cleanSql.includes('FROM doctor_access_requests ar') && cleanSql.includes('ar.doctor_id = $1')) {
      const doctorId = params[0];
      const docReqs = data.doctor_access_requests
        .filter(ar => ar.doctor_id === doctorId)
        .map(ar => {
          const pat = data.patients.find(p => p.id === ar.patient_id) || { full_name: 'Unknown Patient', phone: '', blood_type: '' };
          return {
            id: ar.id,
            patient_id: ar.patient_id,
            patient_name: pat.full_name,
            phone: pat.phone,
            blood_type: pat.blood_type,
            reason: ar.reason,
            status: ar.status,
            created_at: ar.created_at,
            expires_at: ar.expires_at
          };
        });
      return makeResult(docReqs);
    }

    // ─── CONSENT POLICIES ───
    // `INSERT INTO consent_policies ...`
    if (cleanSql.startsWith('INSERT INTO consent_policies')) {
      const newPolicy = {
        id: `cp-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        patient_id: params[0],
        grantee_type: params[1],
        grantee_id: params[2],
        access_type: params[3],
        data_categories: typeof params[4] === 'string' ? JSON.parse(params[4]) : params[4],
        purpose: params[5],
        expires_at: params[6] ? new Date(params[6]).toISOString() : null,
        is_one_time: params[7] ?? false,
        used_at: null,
        is_revoked: false,
        created_at: new Date().toISOString()
      };
      data.consent_policies.push(newPolicy);
      writeDb(data);
      return makeResult([{ id: newPolicy.id }]);
    }

    // `SELECT id, grantee_type... FROM consent_policies WHERE patient_id = $1 AND is_revoked = FALSE` (listPatientConsents)
    if (cleanSql.includes('FROM consent_policies WHERE patient_id = $1 AND is_revoked = FALSE') && !cleanSql.includes('grantee_type = \'doctor\'')) {
      const patId = params[0];
      const policies = data.consent_policies.filter(cp => cp.patient_id === patId && !cp.is_revoked);
      return makeResult(policies);
    }

    // Check Consent (complex query checking direct doctor, clinic, emergency)
    if (cleanSql.includes('FROM consent_policies WHERE patient_id = $1 AND is_revoked = FALSE') && cleanSql.includes('grantee_type = \'doctor\'')) {
      const patientId = params[0];
      const doctorId = params[1];
      const clinicId = params[2];
      const accessType = params[3];
      const matched = data.consent_policies.filter(cp => 
        cp.patient_id === patientId &&
        !cp.is_revoked &&
        (cp.expires_at === null || new Date(cp.expires_at) > new Date()) &&
        cp.access_type === accessType &&
        (
          (cp.grantee_type === 'doctor' && cp.grantee_id === doctorId) ||
          (cp.grantee_type === 'clinic' && cp.grantee_id === clinicId) ||
          (cp.grantee_type === 'purpose' && cp.grantee_id === 'emergency' && accessType === 'emergency_read')
        )
      );
      // Sort by newest created_at
      matched.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      return makeResult(matched.length > 0 ? [matched[0]] : []);
    }

    // `UPDATE consent_policies SET used_at = NOW() WHERE id = $1`
    if (cleanSql.includes('UPDATE consent_policies SET used_at = NOW() WHERE id = $1')) {
      const cpIndex = data.consent_policies.findIndex(cp => cp.id === params[0]);
      if (cpIndex !== -1) {
        data.consent_policies[cpIndex].used_at = new Date().toISOString();
        writeDb(data);
      }
      return makeResult([]);
    }

    // `UPDATE consent_policies SET is_revoked = TRUE... WHERE id = $1 AND patient_id = $2`
    if (cleanSql.includes('UPDATE consent_policies SET is_revoked = TRUE')) {
      let count = 0;
      if (cleanSql.includes('id = $1 AND patient_id = $2')) {
        const id = params[0];
        const patientId = params[1];
        data.consent_policies = data.consent_policies.map(cp => {
          if (cp.id === id && cp.patient_id === patientId && !cp.is_revoked) {
            count++;
            return { ...cp, is_revoked: true, revoked_at: new Date().toISOString() };
          }
          return cp;
        });
      } else if (cleanSql.includes('patient_id = $1 AND grantee_id = $2')) {
        const patientId = params[0];
        const granteeId = params[1];
        data.consent_policies = data.consent_policies.map(cp => {
          if (cp.patient_id === patientId && cp.grantee_id === granteeId && !cp.is_revoked) {
            count++;
            return { ...cp, is_revoked: true, revoked_at: new Date().toISOString() };
          }
          return cp;
        });
      }
      if (count > 0) writeDb(data);
      return makeResult([]).rowCount = count as any; // simulate rowCount return
    }

    // `SELECT DISTINCT p.id, p.full_name... FROM consent_policies cp JOIN patients p...` (List patients with doctor consent)
    if (cleanSql.includes('FROM consent_policies cp JOIN patients p')) {
      const doctorId = params[0];
      const clinicId = params[1];
      const patientIdsWithConsent = data.consent_policies
        .filter(cp => 
          !cp.is_revoked && 
          (cp.expires_at === null || new Date(cp.expires_at) > new Date()) &&
          (
            (cp.grantee_type === 'doctor' && cp.grantee_id === doctorId) ||
            (cp.grantee_type === 'clinic' && cp.grantee_id === clinicId)
          )
        )
        .map(cp => cp.patient_id);
      
      const matchedPatients = data.patients
        .filter(p => patientIdsWithConsent.includes(p.id))
        .map(p => {
          const ep = data.emergency_profiles.find(e => e.patient_id === p.id) || { allergies: [] };
          return {
            id: p.id,
            full_name: p.full_name,
            blood_type: p.blood_type,
            phone: p.phone,
            allergies: ep.allergies
          };
        });
      return makeResult(matchedPatients);
    }

    // ─── PATIENT DETAILS ───
    if (cleanSql.includes('FROM patients WHERE id = $1')) {
      const pat = data.patients.find(p => p.id === params[0]);
      return makeResult(pat ? [pat] : []);
    }
    if (cleanSql.includes('FROM emergency_profiles WHERE patient_id = $1')) {
      const ep = data.emergency_profiles.find(e => e.patient_id === params[0]);
      return makeResult(ep ? [ep] : []);
    }
    if (cleanSql.includes('FROM health_records WHERE patient_id = $1')) {
      const records = data.health_records.filter(r => r.patient_id === params[0]);
      return makeResult(records);
    }

    // ─── ACCESS TOKENS ───
    // `INSERT INTO access_tokens ...`
    if (cleanSql.startsWith('INSERT INTO access_tokens')) {
      const newToken = {
        id: `t-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        patient_id: params[0],
        token_type: params[1],
        token_hash: params[2],
        signature: params[3],
        expires_at: params[4] ? new Date(params[4]).toISOString() : null,
        is_one_time: params[5] ?? false,
        is_revoked: false,
        used_at: null,
        created_at: new Date().toISOString()
      };
      data.access_tokens.push(newToken);
      writeDb(data);
      return makeResult([{ id: newToken.id }]);
    }

    // `SELECT id, patient_id, is_revoked... FROM access_tokens WHERE token_hash = $1 AND token_type = 'NORMAL'`
    if (cleanSql.includes('FROM access_tokens WHERE token_hash = $1 AND token_type = \'NORMAL\'')) {
      const tok = data.access_tokens.find(t => t.token_hash === params[0] && t.token_type === 'NORMAL');
      return makeResult(tok ? [tok] : []);
    }

    // `UPDATE access_tokens SET used_at = NOW() WHERE id = $1`
    if (cleanSql.includes('UPDATE access_tokens SET used_at = NOW() WHERE id = $1')) {
      const tIndex = data.access_tokens.findIndex(t => t.id === params[0]);
      if (tIndex !== -1) {
        data.access_tokens[tIndex].used_at = new Date().toISOString();
        writeDb(data);
      }
      return makeResult([]);
    }

    // Revoke old emergency token (rotation)
    // `UPDATE access_tokens SET is_revoked = TRUE WHERE patient_id = $1 AND token_type = 'EMERGENCY' AND is_revoked = FALSE`
    if (cleanSql.includes('UPDATE access_tokens SET is_revoked = TRUE WHERE patient_id = $1 AND token_type = \'EMERGENCY\'')) {
      const patId = params[0];
      data.access_tokens = data.access_tokens.map(t => {
        if (t.patient_id === patId && t.token_type === 'EMERGENCY') {
          return { ...t, is_revoked: true };
        }
        return t;
      });
      writeDb(data);
      return makeResult([]);
    }

    // Resolve Emergency Token
    // `SELECT at.patient_id, ep.allergies... FROM access_tokens at JOIN emergency_profiles ep ON ep.patient_id = at.patient_id JOIN patients p ON p.id = at.patient_id WHERE at.token_hash = $1 AND at.token_type = 'EMERGENCY' AND at.is_revoked = FALSE`
    if (cleanSql.includes('FROM access_tokens at JOIN emergency_profiles ep') && cleanSql.includes('EMERGENCY')) {
      const tokenHash = params[0];
      const tokenRow = data.access_tokens.find(t => t.token_hash === tokenHash && t.token_type === 'EMERGENCY' && !t.is_revoked);
      if (!tokenRow) return makeResult([]);
      
      const pat = data.patients.find(p => p.id === tokenRow.patient_id);
      const ep = data.emergency_profiles.find(e => e.patient_id === tokenRow.patient_id);
      if (!pat || !ep) return makeResult([]);

      return makeResult([{
        patient_id: pat.id,
        full_name: pat.full_name,
        blood_type: pat.blood_type,
        allergies: ep.allergies,
        medications: ep.medications,
        chronic_conditions: ep.chronic_conditions,
        emergency_contacts: ep.emergency_contacts,
        emergency_notes: ep.emergency_notes,
        hidden_fields: ep.hidden_fields
      }]);
    }

    // List tokens for patient
    // `SELECT id, token_type, expires_at, is_one_time, used_at, created_at FROM access_tokens WHERE patient_id = $1 AND is_revoked = FALSE`
    if (cleanSql.includes('FROM access_tokens WHERE patient_id = $1 AND is_revoked = FALSE')) {
      const patId = params[0];
      const activeToks = data.access_tokens.filter(t => t.patient_id === patId && !t.is_revoked);
      return makeResult(activeToks);
    }
    
    // Revoke token
    // `UPDATE access_tokens SET is_revoked = TRUE WHERE id = $1 AND patient_id = $2 AND is_revoked = FALSE`
    if (cleanSql.includes('UPDATE access_tokens SET is_revoked = TRUE WHERE id = $1 AND patient_id = $2')) {
      const id = params[0];
      const patId = params[1];
      const tokenIndex = data.access_tokens.findIndex(t => t.id === id && t.patient_id === patId && !t.is_revoked);
      if (tokenIndex !== -1) {
        data.access_tokens[tokenIndex].is_revoked = true;
        writeDb(data);
        return makeResult([data.access_tokens[tokenIndex]]);
      }
      return makeResult([]);
    }

    // ─── ACCESS LOGS ───
    if (cleanSql.startsWith('INSERT INTO access_logs')) {
      const newLog = {
        id: `l-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        patient_id: params[0],
        actor_id: params[1],
        actor_role: params[2],
        token_id: params[3] ?? null,
        consent_id: params[4] ?? null,
        access_type: params[5],
        data_categories: typeof params[6] === 'string' ? JSON.parse(params[6]) : params[6],
        ip_address: params[7] ?? '127.0.0.1',
        is_emergency: params[8] ?? false,
        outcome: params[9],
        denial_reason: params[10] ?? null,
        created_at: new Date().toISOString()
      };
      data.access_logs.push(newLog);
      writeDb(data);
      return makeResult([{ id: newLog.id }]);
    }

    // ─── OFFLINE SYNC QUEUE ───
    if (cleanSql.startsWith('INSERT INTO sync_queue')) {
      const newItem = {
        id: `sq-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        event_type: params[0],
        payload: typeof params[1] === 'string' ? JSON.parse(params[1]) : params[1],
        attempts: 0,
        last_error: null,
        synced_at: null,
        created_at: new Date().toISOString()
      };
      data.sync_queue.push(newItem);
      writeDb(data);
      return makeResult([{ id: newItem.id }]);
    }

    console.warn(`[Mock DB] Unhandled SQL Query:\n  ${cleanSql}\nParams:`, params);
    return makeResult([]);
  }
};
