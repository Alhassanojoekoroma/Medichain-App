-- MediChain SL — QR Access Control Schema
-- PostgreSQL

-- ─── PATIENTS ────────────────────────────────────────────────
CREATE TABLE patients (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name     TEXT NOT NULL,
  date_of_birth DATE NOT NULL,
  blood_type    VARCHAR(5),
  phone         TEXT UNIQUE,
  email         TEXT UNIQUE,
  wallet_address TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ─── DOCTORS ────────────────────────────────────────────────
CREATE TABLE doctors (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name     TEXT NOT NULL,
  email         TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  license_no    TEXT UNIQUE NOT NULL,
  specialty     TEXT,
  clinic_id     UUID,
  is_active     BOOLEAN DEFAULT TRUE,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ─── CLINICS ────────────────────────────────────────────────
CREATE TABLE clinics (
  id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name      TEXT NOT NULL,
  address   TEXT,
  phone     TEXT,
  is_active BOOLEAN DEFAULT TRUE
);

ALTER TABLE doctors ADD CONSTRAINT fk_clinic
  FOREIGN KEY (clinic_id) REFERENCES clinics(id);

-- ─── EMERGENCY PROFILE (off-chain minimal dataset) ───────────
CREATE TABLE emergency_profiles (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id          UUID UNIQUE NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  allergies           JSONB DEFAULT '[]',        -- [{ name, severity }]
  blood_type          VARCHAR(5),
  medications         JSONB DEFAULT '[]',        -- [{ name, dosage }]
  chronic_conditions  JSONB DEFAULT '[]',
  emergency_contacts  JSONB DEFAULT '[]',        -- [{ name, phone, relation }]
  emergency_notes     TEXT,
  hidden_fields       JSONB DEFAULT '[]',        -- fields patient chose to hide
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

-- ─── ACCESS TOKENS (QR references) ────────────────────────────
CREATE TABLE access_tokens (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id      UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  token_type      VARCHAR(20) NOT NULL CHECK (token_type IN ('NORMAL','EMERGENCY','SESSION')),
  token_hash      TEXT UNIQUE NOT NULL,   -- SHA-256 of the actual token (never store raw)
  signature       TEXT NOT NULL,          -- HMAC-SHA256 of payload
  expires_at      TIMESTAMPTZ,            -- NULL = permanent until revoked
  is_one_time     BOOLEAN DEFAULT FALSE,
  is_revoked      BOOLEAN DEFAULT FALSE,
  used_at         TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_access_tokens_patient ON access_tokens(patient_id);
CREATE INDEX idx_access_tokens_hash ON access_tokens(token_hash);

-- ─── CONSENT POLICIES ─────────────────────────────────────────
CREATE TABLE consent_policies (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id      UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  grantee_type    VARCHAR(20) NOT NULL CHECK (grantee_type IN ('doctor','clinic','role','purpose')),
  grantee_id      TEXT NOT NULL,   -- doctorId, clinicId, 'nurse', 'emergency', etc.
  access_type     VARCHAR(20) NOT NULL CHECK (access_type IN ('read','write','emergency_read')),
  data_categories JSONB DEFAULT '["all"]',  -- ["labs","prescriptions","imaging"]
  purpose         TEXT,
  expires_at      TIMESTAMPTZ,
  is_one_time     BOOLEAN DEFAULT FALSE,
  is_revoked      BOOLEAN DEFAULT FALSE,
  revoked_at      TIMESTAMPTZ,
  ledger_tx_hash  TEXT,             -- Fabric tx hash of the consent record
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_consent_patient ON consent_policies(patient_id);
CREATE INDEX idx_consent_grantee ON consent_policies(grantee_id);

-- ─── ACCESS LOGS ──────────────────────────────────────────────
CREATE TABLE access_logs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id      UUID REFERENCES patients(id),
  actor_id        TEXT NOT NULL,       -- doctorId or 'emergency_anon'
  actor_role      VARCHAR(30),
  token_id        UUID REFERENCES access_tokens(id),
  consent_id      UUID REFERENCES consent_policies(id),
  access_type     VARCHAR(20) NOT NULL,
  data_categories JSONB,
  ip_address      INET,
  is_emergency    BOOLEAN DEFAULT FALSE,
  outcome         VARCHAR(10) NOT NULL CHECK (outcome IN ('granted','denied')),
  denial_reason   TEXT,
  ledger_tx_hash  TEXT,               -- Fabric tx hash once synced
  synced_to_ledger BOOLEAN DEFAULT FALSE,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_access_logs_patient ON access_logs(patient_id);
CREATE INDEX idx_access_logs_actor ON access_logs(actor_id);
CREATE INDEX idx_access_logs_synced ON access_logs(synced_to_ledger) WHERE synced_to_ledger = FALSE;

-- ─── REVOCATION EVENTS ────────────────────────────────────────
CREATE TABLE revocation_events (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id      UUID NOT NULL REFERENCES patients(id),
  revoked_type    VARCHAR(20) CHECK (revoked_type IN ('token','doctor','clinic','all')),
  revoked_target  TEXT NOT NULL,   -- token_id, doctor_id, clinic_id, or 'all'
  reason          TEXT,
  ledger_tx_hash  TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ─── OFFLINE SYNC QUEUE ───────────────────────────────────────
CREATE TABLE sync_queue (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type  VARCHAR(30) NOT NULL,  -- 'AUDIT_LOG', 'CONSENT', 'REVOCATION'
  payload     JSONB NOT NULL,
  attempts    INT DEFAULT 0,
  last_error  TEXT,
  synced_at   TIMESTAMPTZ,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ─── HEALTH RECORDS (off-chain encrypted references) ──────────
CREATE TABLE health_records (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id      UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  record_type     VARCHAR(30),   -- lab, prescription, imaging, note, referral
  title           TEXT,
  encrypted_cid   TEXT,          -- IPFS CID of AES-GCM encrypted payload
  integrity_hash  TEXT,          -- SHA-256 of plaintext (stored on ledger too)
  data_categories JSONB,
  uploaded_by     TEXT,          -- doctorId or patientId
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ─── DOCTOR ACCESS REQUESTS (GAP 5 - Async access flow) ────────
CREATE TABLE doctor_access_requests (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id       UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
  patient_id      UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  reason          TEXT NOT NULL,     -- Why is doctor requesting access? (referral, consultation, etc.)
  data_categories JSONB DEFAULT '["all"]',
  status          VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','denied','expired')),
  approved_at     TIMESTAMPTZ,
  denied_at       TIMESTAMPTZ,
  denial_reason   TEXT,
  expires_at      TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '7 days'),  -- 7-day expiry
  ledger_tx_hash  TEXT,              -- Fabric tx hash once synced to blockchain
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_access_requests_patient ON doctor_access_requests(patient_id);
CREATE INDEX idx_access_requests_doctor ON doctor_access_requests(doctor_id);
CREATE INDEX idx_access_requests_status ON doctor_access_requests(status) WHERE status = 'pending';
CREATE INDEX idx_access_requests_expires ON doctor_access_requests(expires_at) WHERE status = 'pending';
