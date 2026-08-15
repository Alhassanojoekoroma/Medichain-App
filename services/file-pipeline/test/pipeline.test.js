const test = require('node:test');
const assert = require('node:assert/strict');
const { activationDecision, assertPreviewTtl, failUpload, serverSha256, transitionUpload, validateUpload } = require('../dist/index');

const upload = { id: 'upload-1', idempotencyKey: '019c011e-70b0-7000-8000-000000000001', patientId: 'patient-1', actorId: 'doctor-1', facilityId: 'facility-1', declaredContentType: 'application/pdf', declaredSize: 8, originalName: 'record.pdf', state: 'authorized', attempts: 0, createdAt: '2026-08-02T00:00:00.000Z', updatedAt: '2026-08-02T00:00:00.000Z' };

test('record lifecycle cannot skip quarantine, scanning, or verification', () => {
  assert.throws(() => transitionUpload(upload, 'active'), /PIPELINE_TRANSITION_INVALID/);
  let current = upload;
  for (const state of ['uploading', 'quarantined', 'validating', 'scanning', 'encrypting', 'pending_verification', 'active']) current = transitionUpload(current, state);
  assert.equal(current.state, 'active');
});

test('magic bytes and actual size override client declarations', () => {
  const pdf = Uint8Array.from([0x25, 0x50, 0x44, 0x46, 0x2d, 0x31, 0x2e, 0x37]);
  assert.deepEqual(validateUpload({ declaredContentType: 'application/pdf', declaredSize: 8, actualSize: 8, firstBytes: pdf }), { valid: true });
  assert.equal(validateUpload({ declaredContentType: 'image/png', declaredSize: 8, actualSize: 8, firstBytes: pdf }).code, 'FILE_SIGNATURE_MISMATCH');
  assert.equal(validateUpload({ declaredContentType: 'application/pdf', declaredSize: 7, actualSize: 8, firstBytes: pdf }).code, 'FILE_SIZE_MISMATCH');
});

test('server computes deterministic SHA-256 and activation requires every trust signal', () => {
  const hash = serverSha256(Buffer.from('clinical document'));
  assert.match(hash, /^[a-f0-9]{64}$/);
  const incomplete = activationDecision({ scanStatus: 'clean', serverContentHash: hash, auditConfirmed: false });
  assert.equal(incomplete.allowed, false);
  assert.deepEqual(incomplete.missing, ['encrypted_object', 'kms_evidence', 'audit_confirmation']);
  assert.equal(activationDecision({ scanStatus: 'clean', serverContentHash: hash, encryptedObjectKey: 'clean/random-id', kmsKeyReference: 'kms/key-id', auditEventId: 'audit-id', auditConfirmed: true }).allowed, true);
});

test('failures are visible, retryable, and active records cannot be changed to failed', () => {
  const failed = failUpload(transitionUpload(upload, 'uploading'), 'NETWORK_INTERRUPTED');
  assert.equal(failed.state, 'failed');
  assert.equal(transitionUpload(failed, 'authorized').attempts, 1);
  const active = { ...upload, state: 'active' };
  assert.throws(() => failUpload(active, 'SCAN_ERROR'), /ACTIVE_RECORD_CANNOT_FAIL/);
});

test('preview URLs are deliberately short lived', () => {
  assert.equal(assertPreviewTtl(120), 120);
  assert.throws(() => assertPreviewTtl(301), /SIGNED_URL_TTL_INVALID/);
});
