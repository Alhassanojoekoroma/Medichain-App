const test = require('node:test');
const assert = require('node:assert/strict');
const { transitionLab, dispenseMedication, signNote, correctNote, matchPatients, validateClinicalCode, canPerformClinicalAction, transitionReferral, reconcileOfflineClinicalCommand } = require('../dist/domain/clinical');
const { validateFhirResource } = require('../dist/domain/fhir');

test('lab workflow follows ordered specimen and result states and rejects replay', () => {
  assert.equal(transitionLab('ordered', 'COLLECT'), 'specimen-collected');
  assert.equal(transitionLab('specimen-collected', 'START'), 'in-progress');
  assert.equal(transitionLab('in-progress', 'RESULT'), 'resulted');
  assert.throws(() => transitionLab('resulted', 'RESULT'), /LAB_TRANSITION_INVALID/);
  assert.equal(transitionLab('resulted', 'CORRECT'), 'corrected');
});

test('pharmacy workflow is idempotent and prevents over-dispensing', () => {
  const initial = { status: 'active', quantity: 30, dispensed: 0, processedCommands: new Set() };
  const partial = dispenseMedication(initial, 10, 'command-1');
  assert.equal(partial.dispensed, 10);
  assert.equal(dispenseMedication(partial, 10, 'command-1').dispensed, 10);
  assert.throws(() => dispenseMedication(partial, 21, 'command-2'), /DISPENSE_EXCEEDS_PRESCRIPTION/);
  const complete = dispenseMedication(partial, 20, 'command-2');
  assert.equal(complete.status, 'completed');
});

test('signed clinical notes cannot be overwritten and corrections append provenance', () => {
  const draft = { id: 'note-1', encounterId: 'encounter-1', authorId: 'doctor-1', text: 'Clinical assessment', status: 'draft', version: 1 };
  const signed = signNote(draft, 'doctor-1', '2026-07-16T00:00:00.000Z');
  assert.equal(signed.status, 'signed');
  assert.equal(signed.signatureHash.length, 64);
  assert.throws(() => signNote(signed, 'doctor-1'), /NOTE_SIGNING_NOT_PERMITTED/);
  const corrected = correctNote(signed, 'note-2', 'doctor-1', 'Corrected clinical assessment', 'Incorrect laterality recorded');
  assert.equal(corrected.original.status, 'corrected');
  assert.equal(corrected.correction.supersedesId, 'note-1');
  assert.equal(corrected.correction.version, 2);
});

test('patient matching refuses ambiguous demographic matches', () => {
  const candidates = [
    { patientId: 'p1', phone: '076000001', dateOfBirth: '1990-01-01', name: 'A K' },
    { patientId: 'p2', phone: '076000001', dateOfBirth: '1990-01-01', name: 'A K' },
  ];
  assert.equal(matchPatients({ phone: '076000001', dateOfBirth: '1990-01-01', name: 'A K' }, candidates).status, 'ambiguous');
  assert.equal(matchPatients({ healthIdHash: 'unique' }, [{ ...candidates[0], healthIdHash: 'unique' }]).patientId, 'p1');
});

test('clinical terminology and Phase 5 FHIR resources validate', () => {
  assert.equal(validateClinicalCode({ system: 'https://loinc.org', code: '718-7', display: 'Haemoglobin' }), true);
  assert.equal(validateClinicalCode({ system: 'javascript:alert(1)', code: 'x' }), false);
  assert.equal(validateFhirResource({ resourceType: 'Observation', id: 'obs-1', status: 'final' }).valid, true);
  assert.equal(validateFhirResource({ resourceType: 'MedicationRequest', id: 'rx-1', status: 'active' }).valid, true);
  assert.equal(validateFhirResource({ resourceType: 'Bundle', type: 'collection', entry: [{ resource: { resourceType: 'Observation', id: 'obs-1' } }] }).valid, true);
});

test('clinical role matrix separates ordering collection result and dispense duties', () => {
  assert.equal(canPerformClinicalAction('doctor', 'order-lab'), true);
  assert.equal(canPerformClinicalAction('doctor', 'result-lab'), false);
  assert.equal(canPerformClinicalAction('nurse', 'collect-specimen'), true);
  assert.equal(canPerformClinicalAction('laboratory', 'result-lab'), true);
  assert.equal(canPerformClinicalAction('pharmacy', 'dispense'), true);
  assert.equal(canPerformClinicalAction('staff', 'dispense'), false);
});

test('referrals and downtime reconciliation reject invalid transitions and stale commands', () => {
  assert.equal(transitionReferral('requested', 'ACCEPT'), 'accepted');
  assert.equal(transitionReferral('accepted', 'SCHEDULE'), 'scheduled');
  assert.throws(() => transitionReferral('completed', 'SCHEDULE'), /REFERRAL_TRANSITION_INVALID/);
  const initial = { version: 0, processedCommands: new Set() };
  const accepted = reconcileOfflineClinicalCommand(initial, { id: 'command-1', baseVersion: 0 });
  assert.equal(accepted.status, 'accepted');
  assert.equal(reconcileOfflineClinicalCommand(accepted.state, { id: 'command-1', baseVersion: 0 }).status, 'duplicate');
  assert.throws(() => reconcileOfflineClinicalCommand(accepted.state, { id: 'command-2', baseVersion: 0 }), /DOWNTIME_VERSION_CONFLICT/);
});
