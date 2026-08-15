const test = require('node:test');
const assert = require('node:assert/strict');
const { assessPilotRelease, redactOperationalPath, OperationalTelemetry, REQUIRED_PILOT_GATES } = require('../dist/domain/operationalReadiness');

test('pilot release cannot pass with missing external evidence', () => {
  const evidence = REQUIRED_PILOT_GATES.map(gate => ({ gate, status: 'pending', owner: 'owner' }));
  const assessment = assessPilotRelease({ evidence, criticalFindings: 0, highFindings: 0 });
  assert.equal(assessment.decision, 'FAIL');
  assert.equal(assessment.verified, 0);
  assert.equal(assessment.blockers.length, REQUIRED_PILOT_GATES.length);
});

test('pilot release passes only when every gate has reviewed evidence and no severe finding', () => {
  const evidence = REQUIRED_PILOT_GATES.map(gate => ({ gate, status: 'verified', owner: 'owner', evidenceRef: `evidence/${gate}.pdf`, reviewedAt: '2026-07-16T00:00:00.000Z' }));
  assert.equal(assessPilotRelease({ evidence, criticalFindings: 0, highFindings: 0 }).decision, 'PASS');
  assert.equal(assessPilotRelease({ evidence, criticalFindings: 1, highFindings: 0 }).decision, 'FAIL');
  assert.equal(assessPilotRelease({ evidence, criticalFindings: 0, highFindings: 1 }).decision, 'FAIL');
});

test('operational logs redact identifiers and sensitive query values', () => {
  const path = '/api/clinical/patients/bb010000-0000-4000-8000-000000000001?token=secret&email=person@example.com';
  const redacted = redactOperationalPath(path);
  assert.equal(redacted.includes('bb010000'), false);
  assert.equal(redacted.includes('secret'), false);
  assert.equal(redacted.includes('person@example.com'), false);
});

test('privacy-minimized telemetry calculates a bounded p95 and error rate', () => {
  OperationalTelemetry.resetForTest();
  for (let i = 1; i <= 100; i += 1) OperationalTelemetry.observe(i, i === 100 ? 500 : 200);
  const snapshot = OperationalTelemetry.snapshot();
  assert.equal(snapshot.requests, 100);
  assert.equal(snapshot.p95Ms, 95);
  assert.equal(snapshot.errorRatePercent, 1);
});
