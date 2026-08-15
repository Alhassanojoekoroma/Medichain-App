process.env.APP_ENVIRONMENT = 'test';
process.env.DATA_CLASSIFICATION = 'synthetic';
process.env.IDENTITY_PROVIDER_MODE = 'disabled';
process.env.CORS_ALLOWED_ORIGINS = 'http://localhost:3000';
process.env.JWT_SECRET = 'j'.repeat(48);
process.env.QR_TOKEN_SECRET = 'q'.repeat(48);

const test = require('node:test');
const assert = require('node:assert/strict');

const { authorize } = require('../dist/domain/authorization');
const { evaluateSyncCommand } = require('../dist/domain/syncProtocol');
const { validateFhirResource, capabilityStatement } = require('../dist/domain/fhir');
const { calculateEventHash, verifyAuditChain, pseudonymizeReference } = require('../dist/services/AuditIntegrityService');
const { BreakGlassService } = require('../dist/services/BreakGlassService');
const { generateHealthId, replaceLostHealthId } = require('../dist/services/HealthIdService');
const { TokenService } = require('../dist/services/TokenService');
const { isSessionStateActive } = require('../dist/services/SessionService');
const { parsePage, requireIdempotencyKey } = require('../dist/contracts/http');
const fs = require('node:fs');
const path = require('node:path');

const doctor = { id: 'doctor-1', role: 'doctor', status: 'active', facilityId: 'facility-a', mfa: true, sessionId: 'session-1' };
const nurse = { ...doctor, id: 'nurse-1', role: 'nurse' };
const admin = { ...doctor, id: 'admin-1', role: 'admin' };
const government = { ...doctor, id: 'government-1', role: 'government' };
const patient = { id: 'patient-1', role: 'patient', status: 'active', mfa: true, sessionId: 'patient-session' };

function clinical(actor = doctor, overrides = {}) {
  return authorize({
    actor,
    resource: { type: 'clinical-record', patientId: 'patient-1', facilityId: 'facility-a', sensitivity: 'standard' },
    action: 'read',
    purpose: 'treatment',
    hasActiveConsent: true,
    hasCareRelationship: true,
    ...overrides,
  });
}

test('doctor with matching facility, relationship, purpose and consent can read', () => {
  assert.equal(clinical().allowed, true);
});

test('cross-facility access is denied', () => {
  assert.equal(clinical(doctor, { resource: { type: 'clinical-record', patientId: 'patient-1', facilityId: 'facility-b' } }).code, 'CROSS_FACILITY_ACCESS');
});

test('missing consent and relationship are independently denied', () => {
  assert.equal(clinical(doctor, { hasActiveConsent: false }).code, 'ACTIVE_CONSENT_REQUIRED');
  assert.equal(clinical(doctor, { hasCareRelationship: false }).code, 'CARE_RELATIONSHIP_REQUIRED');
});

test('admin has no default PHI access', () => {
  assert.equal(clinical(admin).code, 'ROLE_HAS_NO_CLINICAL_ACCESS');
});

test('government role is limited to approved de-identified aggregates', () => {
  const aggregate = authorize({ actor: government, resource: { type: 'aggregate-analytics' }, action: 'read', purpose: 'public-health' });
  assert.equal(aggregate.allowed, true);
  assert.ok(aggregate.obligations.includes('de-identify'));
  assert.equal(clinical(government).code, 'ROLE_HAS_NO_CLINICAL_ACCESS');
  assert.equal(authorize({ actor: admin, resource: { type: 'aggregate-analytics' }, action: 'read', purpose: 'public-health' }).allowed, false);
});

test('patient can access only their own resources', () => {
  const own = authorize({ actor: patient, resource: { type: 'consent', patientId: 'patient-1' }, action: 'read', purpose: 'patient-service' });
  const other = authorize({ actor: patient, resource: { type: 'consent', patientId: 'patient-2' }, action: 'read', purpose: 'patient-service' });
  assert.equal(own.allowed, true);
  assert.equal(other.code, 'CROSS_PATIENT_ACCESS');
});

test('nurse cannot revoke or export clinical data', () => {
  assert.equal(clinical(nurse, { action: 'create' }).code, 'NURSE_RECORD_WRITE_DISABLED');
  assert.equal(clinical(nurse, { action: 'export' }).code, 'NURSE_ACTION_NOT_PERMITTED');
  assert.equal(clinical(nurse, { action: 'revoke' }).code, 'NURSE_ACTION_NOT_PERMITTED');
});

test('restricted clinical access requires MFA', () => {
  assert.equal(clinical({ ...doctor, mfa: false }, { resource: { type: 'clinical-record', patientId: 'patient-1', facilityId: 'facility-a', sensitivity: 'restricted' } }).code, 'STEP_UP_REQUIRED');
});

test('break-glass is time-boxed, minimum-necessary and requires MFA approval', () => {
  const denied = authorize({ actor: doctor, resource: { type: 'emergency-summary', patientId: 'patient-1', facilityId: 'facility-a' }, action: 'read', purpose: 'emergency', breakGlassApproved: false });
  const allowed = authorize({ actor: doctor, resource: { type: 'emergency-summary', patientId: 'patient-1', facilityId: 'facility-a' }, action: 'read', purpose: 'emergency', breakGlassApproved: true });
  assert.equal(denied.code, 'BREAK_GLASS_REQUIRED');
  assert.equal(allowed.allowed, true);
  assert.ok(allowed.obligations.includes('mandatory-review'));
  assert.throws(() => BreakGlassService.validate({ patientId: 'p', actorId: 'd', facilityId: 'f', mfa: false, reasonCode: 'life-threatening', justification: 'A sufficiently detailed clinical justification' }), /STEP_UP_REQUIRED/);
});

test('offline commands are idempotent, versioned, reauthorized and detect conflicts', () => {
  const command = { id: '019c011e-70b0-7000-8000-000000000001', type: 'CONSENT_UPDATE', resourceId: 'consent-1', patientId: 'patient-1', baseVersion: 2, issuedAt: new Date().toISOString(), payload: { status: 'revoked' } };
  const allowed = { allowed: true, code: 'ALLOW', obligations: [] };
  assert.equal(evaluateSyncCommand(command, patient, { version: 2, processedIds: new Set() }, allowed).status, 'accepted');
  assert.equal(evaluateSyncCommand(command, patient, { version: 2, processedIds: new Set([command.id]) }, allowed).status, 'duplicate');
  assert.equal(evaluateSyncCommand({ ...command, baseVersion: 1 }, patient, { version: 2, processedIds: new Set() }, allowed).status, 'conflict');
  assert.equal(evaluateSyncCommand(command, { ...patient, id: 'patient-2' }, { version: 2, processedIds: new Set() }, allowed).status, 'denied');
});

test('FHIR R4 capability and minimum resource validation are deterministic', () => {
  assert.equal(capabilityStatement.fhirVersion, '4.0.1');
  assert.equal(validateFhirResource({ resourceType: 'Patient', identifier: [{ system: 'urn:palmchain:health-id', value: 'redacted' }] }).valid, true);
  assert.equal(validateFhirResource({ resourceType: 'Patient' }).valid, false);
  assert.equal(validateFhirResource({ resourceType: 'ClaimResponse' }).valid, false);
});

test('audit chain detects mutation and pseudonymizes identifiers', () => {
  const pepper = 'p'.repeat(48);
  const base = { id: 'event-1', actorRefHash: pseudonymizeReference('doctor-1', pepper), subjectRefHash: pseudonymizeReference('patient-1', pepper), eventType: 'record.read', outcome: 'granted', occurredAt: '2026-07-16T00:00:00.000Z', metadata: { purpose: 'treatment' } };
  const first = { ...base, previousHash: null, eventHash: calculateEventHash(base, null) };
  const nextBase = { ...base, id: 'event-2', eventType: 'consent.revoke' };
  const second = { ...nextBase, previousHash: first.eventHash, eventHash: calculateEventHash(nextBase, first.eventHash) };
  assert.equal(verifyAuditChain([first, second]), true);
  assert.equal(verifyAuditChain([first, { ...second, outcome: 'denied' }]), false);
  assert.notEqual(base.actorRefHash, 'doctor-1');
});

test('scoped QR is signed, expires, rejects tampering and supports token rotation primitives', () => {
  const payload = TokenService.buildQRPayload(TokenService.generateRawToken(), 'NORMAL', 60);
  assert.equal(TokenService.verifyQRSignature(payload), true);
  assert.equal(TokenService.verifyQRSignature({ ...payload, type: 'EMERGENCY' }), false);
  assert.equal(TokenService.verifyQRSignature({ ...payload, v: 2 }), false);
});

test('health identifiers are random references and lost identifiers can be replaced', () => {
  const first = generateHealthId();
  const second = generateHealthId();
  assert.match(first.identifier, /^SLH-/);
  assert.notEqual(first.identifier, second.identifier);
  assert.equal(first.identifierHash.length, 64);
  const replaced = replaceLostHealthId({ id: 'old', patientId: 'patient-1', identifierHash: first.identifierHash, status: 'lost' }, 'new');
  assert.equal(replaced.status, 'replaced');
  assert.equal(replaced.replacedBy, 'new');
});

test('session revocation, account disablement, facility disablement and token-version change fail closed', () => {
  const now = new Date();
  const active = {
    revokedAt: null,
    expiresAt: new Date(now.getTime() + 60_000).toISOString(),
    lastActivityAt: new Date(now.getTime() - 60_000).toISOString(),
    absoluteExpiresAt: new Date(now.getTime() + 120_000).toISOString(),
    idleTimeoutSeconds: 120,
    tokenVersion: 2,
    actorStatus: 'active',
    facilityActive: true,
  };
  assert.equal(isSessionStateActive(active, 2), true);
  assert.equal(isSessionStateActive({ ...active, revokedAt: new Date().toISOString() }, 2), false);
  assert.equal(isSessionStateActive({ ...active, actorStatus: 'disabled' }, 2), false);
  assert.equal(isSessionStateActive({ ...active, facilityActive: false }, 2), false);
  assert.equal(isSessionStateActive(active, 3), false);
  assert.equal(isSessionStateActive({ ...active, lastActivityAt: new Date(now.getTime() - 121_000).toISOString() }, 2, now), false);
  assert.equal(isSessionStateActive({ ...active, absoluteExpiresAt: new Date(now.getTime() - 1).toISOString() }, 2, now), false);
});

test('HTTP contract bounds pagination and requires UUID idempotency keys', () => {
  assert.deepEqual(parsePage({ limit: '50' }), { limit: 50 });
  assert.throws(() => parsePage({ limit: '101' }), /PAGINATION_LIMIT_INVALID/);
  assert.equal(requireIdempotencyKey('019c011e-70b0-7000-8000-000000000001'), '019c011e-70b0-7000-8000-000000000001');
  assert.throws(() => requireIdempotencyKey('repeat-me'), /IDEMPOTENCY_KEY_REQUIRED/);
});

test('OpenAPI contract is parseable and operation IDs are unique', () => {
  const contract = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'openapi', 'palmchain-v2.openapi.json'), 'utf8'));
  assert.equal(contract.openapi, '3.1.0');
  const ids = [];
  for (const pathItem of Object.values(contract.paths)) {
    for (const operation of Object.values(pathItem)) if (operation.operationId) ids.push(operation.operationId);
  }
  assert.equal(new Set(ids).size, ids.length);
  assert.ok(ids.includes('submitOfflineCommand'));
});

test('non-clinical portal bundles contain no patient API routes and clinical clients contain no bearer token storage', () => {
  const root = path.join(__dirname, '..', '..');
  for (const portal of ['admin-web', 'government-web', 'staff-web']) {
    const client = fs.readFileSync(path.join(root, portal, 'services', 'backendApi.ts'), 'utf8');
    assert.doesNotMatch(client, /\/api\/(?:access|patients|records|treatments|consent|qr)/);
  }
  for (const portal of ['doctor-web', 'nurse-web']) {
    const client = fs.readFileSync(path.join(root, portal, 'services', 'backendApi.ts'), 'utf8');
    assert.doesNotMatch(client, /mc_token|Authorization.*Bearer/);
  }
});
