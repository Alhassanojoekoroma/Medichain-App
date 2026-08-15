const test = require('node:test');
const assert = require('node:assert/strict');
const { evaluateAccess } = require('../dist/index');

const base = { status: 'active', sessionId: 'session-1', mfaSatisfied: true, facilityId: 'facility-a' };
const subject = role => ({ ...base, id: `${role}-1`, role });
const resource = { patientId: 'patient-1', facilityId: 'facility-a' };
const consent = (granteeId, access) => ({ status: 'active', access, purpose: 'treatment', granteeId, granteeType: 'workforce', expiresAt: '2099-01-01T00:00:00.000Z' });
const clinical = (role, action, access = 'record_read', extra = {}) => evaluateAccess(action, subject(role), resource, { purpose: 'treatment', legalBasis: 'consent', careRelationshipActive: true, consent: consent(`${role}-1`, access), ...extra });

test('unverified patient cannot view or hold records', () => {
  const patient = { ...subject('patient'), id: 'patient-1', status: 'unverified' };
  assert.equal(evaluateAccess('view_own_records', patient, { patientId: 'patient-1' }).code, 'IDENTITY_VERIFICATION_REQUIRED');
});

test('patient is strictly limited to own records, access log, consent, and session', () => {
  const patient = { ...subject('patient'), id: 'patient-1' };
  for (const action of ['view_own_records', 'view_own_access_log', 'manage_own_consent', 'manage_identity_token']) {
    assert.equal(evaluateAccess(action, patient, { patientId: 'patient-1' }).allowed, true);
  }
  assert.equal(evaluateAccess('view_own_records', patient, { patientId: 'patient-2' }).allowed, false);
  assert.equal(evaluateAccess('upload_record', patient, { patientId: 'patient-1' }).allowed, false);
});

test('doctor writes require relationship and correctly scoped live consent', () => {
  assert.equal(clinical('doctor', 'upload_record', 'record_write').allowed, true);
  assert.equal(clinical('doctor', 'correct_record', 'record_write').allowed, true);
  assert.equal(clinical('doctor', 'upload_record', 'record_read').code, 'CONSENT_INVALID_FOR_ACTION');
  assert.equal(clinical('doctor', 'upload_record', 'record_write', { careRelationshipActive: false }).code, 'CARE_RELATIONSHIP_REQUIRED');
  assert.equal(clinical('doctor', 'upload_record', 'record_write', { consent: { ...consent('doctor-1', 'record_write'), status: 'revoked', revokedAt: '2026-01-01T00:00:00.000Z' } }).code, 'CONSENT_INVALID_FOR_ACTION');
});

test('nurse document upload is always denied and intake is disabled by default', () => {
  assert.equal(clinical('nurse', 'upload_record', 'record_write').code, 'DOCTOR_ONLY_RECORD_WRITE');
  assert.equal(clinical('nurse', 'add_intake', 'intake_write').code, 'NURSE_INTAKE_DISABLED');
  assert.equal(clinical('nurse', 'add_intake', 'intake_write', { featureFlags: { nurseCanWriteRecords: true } }).allowed, true);
});

test('break glass is doctor-only and requires a meaningful justification', () => {
  assert.equal(evaluateAccess('break_glass', subject('doctor'), resource, { breakGlassJustification: 'short' }).allowed, false);
  assert.equal(evaluateAccess('break_glass', subject('nurse'), resource, { breakGlassJustification: 'Emergency condition requiring immediate access' }).allowed, false);
  assert.equal(evaluateAccess('break_glass', subject('doctor'), resource, { breakGlassJustification: 'Emergency condition requiring immediate access' }).allowed, true);
});

test('ministry is aggregate-only and exports retain suppression obligations', () => {
  assert.equal(evaluateAccess('view_aggregates', subject('ministry'), { aggregateOnly: true }).allowed, true);
  assert.equal(evaluateAccess('export_aggregate', subject('ministry'), { aggregateOnly: true }).obligations.includes('minimum_cell_suppression'), true);
  assert.equal(evaluateAccess('view_patient_record', subject('ministry'), resource).code, 'AGGREGATE_ONLY');
});

test('admin operational actions are allowed but routine PHI access is denied', () => {
  for (const action of ['provision_workforce', 'assign_role', 'search_audit_log', 'force_revoke_session', 'resolve_consent_dispute', 'view_system_health']) {
    assert.equal(evaluateAccess(action, subject('admin')).allowed, true);
  }
  assert.equal(evaluateAccess('view_patient_record', subject('admin'), resource).code, 'ADMIN_ACTION_NOT_PERMITTED');
  assert.equal(evaluateAccess('purge_record', subject('admin'), resource).allowed, false);
});

test('all unsupported role/action pairs deny by default', () => {
  const denied = [
    ['patient', 'view_aggregates'], ['patient', 'search_audit_log'], ['doctor', 'assign_role'],
    ['doctor', 'export_aggregate'], ['nurse', 'correct_record'], ['nurse', 'request_consent'],
    ['ministry', 'provision_workforce'], ['ministry', 'upload_record'], ['admin', 'upload_record']
  ];
  for (const [role, action] of denied) assert.equal(evaluateAccess(action, subject(role), resource).allowed, false, `${role}:${action}`);
});
