import { db } from './db';
import bcrypt from 'bcrypt';
import { readSecurityConfig } from './environment';
import { logger } from '../utils/logger';

export async function runMigrations() {
  logger.info('[Migrate] Checking and applying database migrations...');
  try {
    // 1. Add role to doctors if not exists
    await db.query(`
      ALTER TABLE doctors ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'doctor' CHECK (role IN ('doctor', 'nurse', 'laboratory', 'pharmacy', 'admin', 'government', 'staff'));
      ALTER TABLE doctors DROP CONSTRAINT IF EXISTS doctors_role_check;
      ALTER TABLE doctors ADD CONSTRAINT doctors_role_check CHECK (role IN ('doctor', 'nurse', 'laboratory', 'pharmacy', 'admin', 'government', 'staff'));
      ALTER TABLE doctors ADD COLUMN IF NOT EXISTS account_status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (account_status IN ('active','suspended','disabled'));
      ALTER TABLE patients ADD COLUMN IF NOT EXISTS account_status VARCHAR(20) NOT NULL DEFAULT 'unverified';
      ALTER TABLE patients DROP CONSTRAINT IF EXISTS patients_account_status_check;
      ALTER TABLE patients ALTER COLUMN account_status SET DEFAULT 'unverified';
      ALTER TABLE patients ADD CONSTRAINT patients_account_status_check CHECK (account_status IN ('unverified','active','suspended','disabled'));
    `);

    // Phase 2-4 security spine and patient-core persistence. These structures
    // contain no fixtures and are required in every environment.
    await db.query(`
      CREATE TABLE IF NOT EXISTS identity_sessions (
        id TEXT PRIMARY KEY,
        actor_id TEXT NOT NULL,
        actor_role VARCHAR(20) NOT NULL CHECK (actor_role IN ('doctor','nurse','laboratory','pharmacy','staff','admin','government','patient')),
        facility_id UUID,
        token_version INTEGER NOT NULL DEFAULT 0,
        mfa_verified_at TIMESTAMPTZ,
        revoked_at TIMESTAMPTZ,
        expires_at TIMESTAMPTZ NOT NULL,
        last_activity_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        absolute_expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '8 hours'),
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      ALTER TABLE identity_sessions ALTER COLUMN id TYPE TEXT USING id::text;
      ALTER TABLE identity_sessions ADD COLUMN IF NOT EXISTS last_activity_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
      ALTER TABLE identity_sessions ADD COLUMN IF NOT EXISTS absolute_expires_at TIMESTAMPTZ;
      UPDATE identity_sessions
         SET absolute_expires_at = COALESCE(absolute_expires_at, created_at + INTERVAL '8 hours');
      ALTER TABLE identity_sessions ALTER COLUMN absolute_expires_at SET NOT NULL;
      CREATE INDEX IF NOT EXISTS idx_identity_sessions_actor ON identity_sessions(actor_id);

      CREATE TABLE IF NOT EXISTS identity_bindings (
        issuer TEXT NOT NULL,
        subject TEXT NOT NULL,
        actor_id TEXT NOT NULL,
        actor_role VARCHAR(20) NOT NULL,
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        provisioned_by TEXT NOT NULL,
        provisioned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        disabled_at TIMESTAMPTZ,
        PRIMARY KEY (issuer, subject),
        UNIQUE (issuer, actor_id)
      );
      CREATE INDEX IF NOT EXISTS idx_identity_bindings_actor ON identity_bindings(actor_id) WHERE is_active = TRUE;

      CREATE TABLE IF NOT EXISTS care_relationships (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
        practitioner_id UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
        facility_id UUID NOT NULL REFERENCES clinics(id),
        status VARCHAR(20) NOT NULL CHECK (status IN ('active','ended','suspended')),
        starts_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        ends_at TIMESTAMPTZ,
        UNIQUE(patient_id, practitioner_id, facility_id, starts_at)
      );

      ALTER TABLE consent_policies ADD COLUMN IF NOT EXISTS used_at TIMESTAMPTZ;

      CREATE TABLE IF NOT EXISTS medical_file_uploads (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        patient_id UUID NOT NULL REFERENCES patients(id),
        actor_id UUID NOT NULL REFERENCES doctors(id),
        facility_id UUID NOT NULL REFERENCES clinics(id),
        idempotency_key UUID NOT NULL,
        declared_content_type VARCHAR(80) NOT NULL,
        declared_size BIGINT NOT NULL CHECK (declared_size > 0 AND declared_size <= 26214400),
        original_name TEXT NOT NULL,
        state VARCHAR(32) NOT NULL CHECK (state IN ('authorized','uploading','quarantined','validating','scanning','encrypting','pending_verification','active','failed')),
        quarantine_object_key TEXT,
        encrypted_object_key TEXT,
        server_content_hash CHAR(64),
        scan_status VARCHAR(16) NOT NULL DEFAULT 'pending' CHECK (scan_status IN ('pending','clean','infected','error')),
        kms_key_reference TEXT,
        audit_event_id UUID,
        audit_confirmed BOOLEAN NOT NULL DEFAULT FALSE,
        anchor_status VARCHAR(20) NOT NULL DEFAULT 'not_requested' CHECK (anchor_status IN ('not_requested','pending','anchored','failed_retrying')),
        anchor_tx_id TEXT,
        attempts INTEGER NOT NULL DEFAULT 0,
        failure_code VARCHAR(64),
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        UNIQUE(actor_id, idempotency_key)
      );
      CREATE INDEX IF NOT EXISTS idx_medical_file_uploads_patient ON medical_file_uploads(patient_id, created_at DESC);
      CREATE INDEX IF NOT EXISTS idx_medical_file_uploads_work ON medical_file_uploads(state, updated_at) WHERE state <> 'active';

      CREATE TABLE IF NOT EXISTS outbox_events (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        topic VARCHAR(40) NOT NULL CHECK (topic IN ('audit.write','notification.send','fabric.anchor','file.scan')),
        aggregate_id UUID NOT NULL,
        idempotency_key TEXT NOT NULL,
        payload JSONB NOT NULL,
        status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','processing','completed','dead_letter')),
        attempts INTEGER NOT NULL DEFAULT 0,
        next_attempt_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        locked_until TIMESTAMPTZ,
        completed_at TIMESTAMPTZ,
        last_error_code VARCHAR(64),
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        UNIQUE(topic, idempotency_key)
      );
      CREATE INDEX IF NOT EXISTS idx_outbox_claim ON outbox_events(status, next_attempt_at) WHERE status IN ('pending','processing');

      CREATE TABLE IF NOT EXISTS break_glass_events (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        patient_id UUID NOT NULL REFERENCES patients(id),
        actor_id UUID NOT NULL REFERENCES doctors(id),
        facility_id UUID NOT NULL REFERENCES clinics(id),
        reason_code VARCHAR(40) NOT NULL,
        justification TEXT NOT NULL CHECK (char_length(justification) BETWEEN 20 AND 500),
        approved_categories JSONB NOT NULL,
        expires_at TIMESTAMPTZ NOT NULL,
        reviewed_at TIMESTAMPTZ,
        reviewed_by TEXT,
        patient_notified_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_break_glass_review ON break_glass_events(created_at) WHERE reviewed_at IS NULL;

      CREATE TABLE IF NOT EXISTS security_audit_events (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        sequence_no BIGSERIAL UNIQUE NOT NULL,
        actor_ref_hash CHAR(64) NOT NULL,
        subject_ref_hash CHAR(64),
        facility_id UUID,
        event_type VARCHAR(60) NOT NULL,
        purpose VARCHAR(40),
        outcome VARCHAR(10) NOT NULL CHECK (outcome IN ('granted','denied','success','failure')),
        metadata JSONB NOT NULL DEFAULT '{}',
        previous_hash CHAR(64),
        event_hash CHAR(64) NOT NULL,
        occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS data_governance_rules (
        data_class VARCHAR(40) PRIMARY KEY,
        retention_days INTEGER NOT NULL CHECK (retention_days > 0),
        storage_zone VARCHAR(40) NOT NULL,
        export_allowed BOOLEAN NOT NULL DEFAULT FALSE,
        legal_basis_status VARCHAR(20) NOT NULL CHECK (legal_basis_status IN ('pending','approved','prohibited')),
        approved_by TEXT,
        approved_at TIMESTAMPTZ
      );

      CREATE TABLE IF NOT EXISTS managed_objects (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
        storage_key TEXT UNIQUE NOT NULL,
        content_type TEXT NOT NULL,
        size_bytes BIGINT NOT NULL CHECK (size_bytes BETWEEN 1 AND 26214400),
        sha256 CHAR(64) NOT NULL,
        malware_status VARCHAR(20) NOT NULL CHECK (malware_status IN ('pending','clean','rejected')),
        retention_until TIMESTAMPTZ NOT NULL,
        deleted_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS health_identifiers (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
        identifier_hash CHAR(64) UNIQUE NOT NULL,
        status VARCHAR(20) NOT NULL CHECK (status IN ('active','lost','revoked','replaced')),
        replaced_by UUID REFERENCES health_identifiers(id),
        issued_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        revoked_at TIMESTAMPTZ
      );

      CREATE TABLE IF NOT EXISTS offline_commands (
        command_id UUID PRIMARY KEY,
        patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
        resource_id TEXT NOT NULL,
        command_type VARCHAR(40) NOT NULL,
        base_version INTEGER NOT NULL CHECK (base_version >= 0),
        resulting_version INTEGER,
        payload_hash CHAR(64) NOT NULL,
        status VARCHAR(20) NOT NULL CHECK (status IN ('accepted','denied','conflict')),
        denial_code TEXT,
        processed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS resource_versions (
        patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
        resource_id TEXT NOT NULL,
        version INTEGER NOT NULL DEFAULT 0 CHECK (version >= 0),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        PRIMARY KEY(patient_id, resource_id)
      );

      CREATE TABLE IF NOT EXISTS clinical_encounters (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(), patient_id UUID NOT NULL REFERENCES patients(id),
        facility_id UUID NOT NULL REFERENCES clinics(id), practitioner_id UUID NOT NULL REFERENCES doctors(id),
        status VARCHAR(20) NOT NULL CHECK (status IN ('planned','in-progress','completed','cancelled')),
        reason_code JSONB NOT NULL, started_at TIMESTAMPTZ, ended_at TIMESTAMPTZ, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      CREATE TABLE IF NOT EXISTS clinical_notes (
        id UUID PRIMARY KEY, encounter_id UUID NOT NULL REFERENCES clinical_encounters(id), author_id UUID NOT NULL REFERENCES doctors(id),
        body TEXT NOT NULL, status VARCHAR(20) NOT NULL CHECK (status IN ('draft','signed','corrected')),
        version INTEGER NOT NULL, supersedes_id UUID REFERENCES clinical_notes(id), correction_reason TEXT,
        signature_hash CHAR(64), signed_at TIMESTAMPTZ, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        UNIQUE(encounter_id, version)
      );
      CREATE TABLE IF NOT EXISTS nursing_observations (
        id UUID PRIMARY KEY, encounter_id UUID NOT NULL REFERENCES clinical_encounters(id), patient_id UUID NOT NULL REFERENCES patients(id),
        author_id UUID NOT NULL REFERENCES doctors(id), code JSONB NOT NULL, value JSONB NOT NULL, status VARCHAR(20) NOT NULL CHECK (status IN ('preliminary','final','corrected')),
        supersedes_id UUID REFERENCES nursing_observations(id), recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      CREATE TABLE IF NOT EXISTS lab_orders (
        id UUID PRIMARY KEY, patient_id UUID NOT NULL REFERENCES patients(id), encounter_id UUID REFERENCES clinical_encounters(id),
        facility_id UUID NOT NULL REFERENCES clinics(id), ordered_by UUID NOT NULL REFERENCES doctors(id), code JSONB NOT NULL,
        status VARCHAR(30) NOT NULL, version INTEGER NOT NULL DEFAULT 0, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      CREATE TABLE IF NOT EXISTS lab_results (
        id UUID PRIMARY KEY, order_id UUID NOT NULL REFERENCES lab_orders(id), result JSONB NOT NULL, critical BOOLEAN NOT NULL DEFAULT FALSE,
        status VARCHAR(20) NOT NULL CHECK (status IN ('final','corrected')), supersedes_id UUID REFERENCES lab_results(id),
        reported_by TEXT NOT NULL, reported_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      CREATE TABLE IF NOT EXISTS prescriptions (
        id UUID PRIMARY KEY, patient_id UUID NOT NULL REFERENCES patients(id), encounter_id UUID REFERENCES clinical_encounters(id),
        facility_id UUID NOT NULL REFERENCES clinics(id), prescribed_by UUID NOT NULL REFERENCES doctors(id), medication_code JSONB NOT NULL,
        quantity INTEGER NOT NULL CHECK (quantity > 0), dispensed INTEGER NOT NULL DEFAULT 0, status VARCHAR(20) NOT NULL CHECK (status IN ('active','completed','cancelled')),
        version INTEGER NOT NULL DEFAULT 0, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      CREATE TABLE IF NOT EXISTS dispensing_events (
        id UUID PRIMARY KEY, prescription_id UUID NOT NULL REFERENCES prescriptions(id), command_id UUID UNIQUE NOT NULL,
        quantity INTEGER NOT NULL CHECK (quantity > 0), dispenser_id TEXT NOT NULL, dispensed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      CREATE TABLE IF NOT EXISTS referrals (
        id UUID PRIMARY KEY, patient_id UUID NOT NULL REFERENCES patients(id), encounter_id UUID REFERENCES clinical_encounters(id),
        source_facility_id UUID NOT NULL REFERENCES clinics(id), destination_facility_id UUID NOT NULL REFERENCES clinics(id),
        reason_code JSONB NOT NULL, status VARCHAR(20) NOT NULL CHECK (status IN ('requested','accepted','scheduled','completed','declined','cancelled')),
        appointment_at TIMESTAMPTZ, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      CREATE TABLE IF NOT EXISTS facility_tasks (
        id UUID PRIMARY KEY, facility_id UUID NOT NULL REFERENCES clinics(id), task_type VARCHAR(40) NOT NULL, resource_id UUID NOT NULL,
        priority VARCHAR(10) NOT NULL CHECK (priority IN ('routine','urgent','stat')), status VARCHAR(20) NOT NULL DEFAULT 'open',
        assigned_role VARCHAR(20), created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      CREATE TABLE IF NOT EXISTS downtime_events (
        id UUID PRIMARY KEY, facility_id UUID NOT NULL REFERENCES clinics(id), opened_by TEXT NOT NULL, reason TEXT NOT NULL,
        opened_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), closed_at TIMESTAMPTZ, reconciliation_status VARCHAR(20) NOT NULL DEFAULT 'pending'
      );
      CREATE TABLE IF NOT EXISTS ledger_anchor_outbox (
        event_id UUID PRIMARY KEY, event_type VARCHAR(40) NOT NULL, payload_digest CHAR(64) NOT NULL,
        policy_version VARCHAR(32) NOT NULL, organization VARCHAR(64) NOT NULL, occurred_at TIMESTAMPTZ NOT NULL,
        status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','anchored','failed')),
        attempts INTEGER NOT NULL DEFAULT 0, ledger_tx_id TEXT, next_attempt_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      CREATE TABLE IF NOT EXISTS ai_model_register (
        model_id VARCHAR(100) NOT NULL, version VARCHAR(50) NOT NULL, use_case VARCHAR(100) NOT NULL,
        provider VARCHAR(100) NOT NULL, status VARCHAR(20) NOT NULL CHECK (status IN ('disabled','evaluation','approved','retired')),
        approved_at TIMESTAMPTZ, PRIMARY KEY(model_id, version)
      );
      CREATE TABLE IF NOT EXISTS ai_documentation_drafts (
        id UUID PRIMARY KEY, created_by UUID NOT NULL REFERENCES doctors(id), facility_id UUID NOT NULL REFERENCES clinics(id),
        model_id VARCHAR(100) NOT NULL, model_version VARCHAR(50) NOT NULL, status VARCHAR(20) NOT NULL,
        output JSONB, quarantine_reasons JSONB NOT NULL DEFAULT '[]', reviewed_by UUID REFERENCES doctors(id),
        reviewed_at TIMESTAMPTZ, accepted_text TEXT, change_digest CHAR(64), created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      CREATE TABLE IF NOT EXISTS aggregate_indicator_feeds (
        id UUID PRIMARY KEY, indicator_code VARCHAR(60) NOT NULL, region_code VARCHAR(20) NOT NULL, period CHAR(7) NOT NULL,
        numerator INTEGER NOT NULL, denominator INTEGER NOT NULL, value NUMERIC, suppressed BOOLEAN NOT NULL,
        completeness NUMERIC NOT NULL, warnings JSONB NOT NULL DEFAULT '[]', submitted_by UUID NOT NULL REFERENCES doctors(id),
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), UNIQUE(indicator_code, region_code, period)
      );
      CREATE TABLE IF NOT EXISTS intelligence_signals (
        id UUID PRIMARY KEY, indicator_code VARCHAR(60) NOT NULL, rationale TEXT NOT NULL, source VARCHAR(10) NOT NULL,
        status VARCHAR(20) NOT NULL DEFAULT 'pending-review', reviewed_by UUID REFERENCES doctors(id), reviewed_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      CREATE TABLE IF NOT EXISTS aggregate_export_requests (
        id UUID PRIMARY KEY, requested_by UUID NOT NULL REFERENCES doctors(id), status VARCHAR(20) NOT NULL DEFAULT 'pending',
        approved_by UUID REFERENCES doctors(id), created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), decided_at TIMESTAMPTZ,
        CHECK (approved_by IS NULL OR approved_by <> requested_by)
      );
      CREATE TABLE IF NOT EXISTS release_evidence (
        gate_code VARCHAR(80) PRIMARY KEY, status VARCHAR(20) NOT NULL CHECK (status IN ('pending','verified','failed')),
        owner TEXT NOT NULL, evidence_ref TEXT, reviewed_by TEXT, reviewed_at TIMESTAMPTZ,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        CHECK (status <> 'verified' OR (evidence_ref IS NOT NULL AND reviewed_by IS NOT NULL AND reviewed_at IS NOT NULL))
      );
      CREATE TABLE IF NOT EXISTS operational_exercises (
        id UUID PRIMARY KEY, exercise_type VARCHAR(40) NOT NULL CHECK (exercise_type IN ('backup-restore','failover','incident','rollback','migration')),
        environment VARCHAR(30) NOT NULL, started_at TIMESTAMPTZ NOT NULL, completed_at TIMESTAMPTZ,
        outcome VARCHAR(20) NOT NULL CHECK (outcome IN ('planned','passed','failed')), evidence_ref TEXT,
        actual_rpo_minutes INTEGER, actual_rto_minutes INTEGER, reviewed_by TEXT
      );
      CREATE TABLE IF NOT EXISTS safety_incidents (
        id UUID PRIMARY KEY, incident_type VARCHAR(30) NOT NULL CHECK (incident_type IN ('security','privacy','clinical-safety','availability')),
        severity VARCHAR(10) NOT NULL CHECK (severity IN ('critical','high','medium','low')), status VARCHAR(20) NOT NULL,
        correlation_ref TEXT NOT NULL, opened_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), closed_at TIMESTAMPTZ,
        summary_redacted TEXT NOT NULL
      );
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

    const securityConfig = readSecurityConfig();
    if (!securityConfig.allowDemoData) {
      logger.info('[Migrate] Synthetic fixtures are disabled for this environment.');
      logger.info('[Migrate] Database migrations applied successfully.');
      return;
    }

    // 3. Let's check if clinics are empty, if so, seed them
    const clinicsRes = await db.query('SELECT count(*) FROM clinics');
    const clinicsCount = parseInt(clinicsRes.rows[0].count);
    let clinicId = 'c0010000-0000-0000-0000-000000000001';
    if (clinicsCount === 0) {
      await db.query(`
        INSERT INTO clinics (id, name, address, phone, is_active)
        VALUES ($1, 'Connaught Hospital, Freetown', 'Lightfoot Boston Street, Freetown', '+232 22 222222', true)
      `, [clinicId]);
      logger.info('[Migrate] Seeded clinic');
    } else {
      const firstClinic = await db.query('SELECT id FROM clinics LIMIT 1');
      clinicId = firstClinic.rows[0].id;
    }

    // 4. Let's seed doctors with different roles
    const doctorsRes = await db.query('SELECT count(*) FROM doctors');
    const doctorsCount = parseInt(doctorsRes.rows[0].count);
    
    // Sandbox-only credential supplied at runtime; never use a source-controlled password.
    const passHash = await bcrypt.hash(securityConfig.sandboxPatientPassword!, 10);
    
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

      logger.info('[Migrate] Seeded baseline doctors');
    }

    // Let's ensure Nurse Inos is seeded
    const nurseRes = await db.query("SELECT count(*) FROM doctors WHERE email = 'nurse@medichain.sl'");
    if (parseInt(nurseRes.rows[0].count) === 0) {
      await db.query(`
        INSERT INTO doctors (id, full_name, email, password_hash, license_no, specialty, clinic_id, role, is_active)
        VALUES ('d0010000-0000-0000-0000-000000000003', 'Nurse Inos', 'nurse@medichain.sl', $1, 'SL-NUR-2020-0112', 'Pediatric Nursing', $2, 'nurse', true)
      `, [passHash, clinicId]);
      logger.info('[Migrate] Seeded Nurse Inos');
    }

    // Let's ensure Staff Member is seeded
    const staffRes = await db.query("SELECT count(*) FROM doctors WHERE email = 'staff@medichain.sl'");
    if (parseInt(staffRes.rows[0].count) === 0) {
      await db.query(`
        INSERT INTO doctors (id, full_name, email, password_hash, license_no, specialty, clinic_id, role, is_active)
        VALUES ('d0010000-0000-0000-0000-000000000004', 'Staff Member', 'staff@medichain.sl', $1, 'SL-STA-2021-0021', 'Administration', $2, 'staff', true)
      `, [passHash, clinicId]);
      logger.info('[Migrate] Seeded Staff Member');
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

      logger.info('[Migrate] Seeded default patient with consent policies');
    }

    logger.info('[Migrate] Database migrations applied successfully.');
  } catch (error) {
    logger.error('[Migrate] Migration failed:', error);
    throw error;
  }
}
