import crypto from 'crypto';
import { Router, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { requireDoctor, AuthRequest } from '../middleware/auth.middleware';
import { syntheticSandboxOnly } from '../middleware/containment.middleware';
import { db } from '../config/db';
import { ClinicalNote, canPerformClinicalAction, correctNote, dispenseMedication, LabEvent, LabStatus, matchPatients, reconcileOfflineClinicalCommand, ReferralEvent, ReferralStatus, signNote, transitionLab, transitionReferral, validateClinicalCode } from '../domain/clinical';
import { validateFhirResource } from '../domain/fhir';

const router = Router();
const encounters = new Map<string, any>();
const notes = new Map<string, ClinicalNote>();
const observations = new Map<string, any>();
const administrations = new Map<string, any>();
const labs = new Map<string, { id: string; patientId: string; facilityId?: string; status: LabStatus; version: number; code: unknown; result?: unknown; critical?: boolean }>();
const prescriptions = new Map<string, { id: string; patientId: string; facilityId?: string; status: 'active' | 'completed' | 'cancelled'; quantity: number; dispensed: number; processedCommands: Set<string>; medicationCode: unknown }>();
const referrals = new Map<string, { id: string; patientId: string; facilityId?: string; destination: string; status: ReferralStatus; version: number; reasonCode: unknown }>();
const appointments = new Map<string, any>();
const tasks = new Map<string, any>();
const downtimeStates = new Map<string, { version: number; processedCommands: Set<string> }>();
router.use(requireDoctor, syntheticSandboxOnly('Phase 5 clinical workflows'));

function permitted(req: AuthRequest, action: Parameters<typeof canPerformClinicalAction>[1]): boolean {
  return canPerformClinicalAction(req.doctor!.role, action);
}

function publicPrescription(value: (typeof prescriptions extends Map<string, infer T> ? T : never)) {
  return { ...value, processedCommands: [...value.processedCommands] };
}

router.post('/patients/match', async (req: AuthRequest, res: Response) => {
  if (!permitted(req, 'patient-match')) return res.status(403).json({ error: { code: 'PATIENT_MATCH_NOT_PERMITTED' } });
  const patients = db.getSandboxPatients();
  const candidates = patients.map((patient: any) => ({ patientId: patient.id, phone: patient.phone, dateOfBirth: patient.date_of_birth, name: patient.full_name }));
  const result = matchPatients(req.body, candidates);
  const matches = result.candidates.map(id => {
    const patient = patients.find((candidate: any) => candidate.id === id);
    const phone = String(patient?.phone ?? '');
    return {
      id,
      displayName: patient?.full_name ?? 'Identity details unavailable',
      phoneMasked: phone.length > 4 ? `${'*'.repeat(Math.min(phone.length - 4, 8))}${phone.slice(-4)}` : undefined,
      facilityId: patient?.facility_id ?? undefined,
      dateOfBirth: patient?.date_of_birth ?? undefined,
    };
  });
  res.status(result.status === 'ambiguous' ? 409 : result.status === 'none' ? 404 : 200).json({ ...result, matches });
});

router.get('/patients/:patientId/summary', (req: AuthRequest, res: Response) => {
  if (!permitted(req, 'view-summary')) return res.status(403).json({ error: { code: 'SUMMARY_NOT_PERMITTED' } });
  const patientId = req.params.patientId;
  const select = <T extends { patientId: string }>(store: Map<string, T>) => [...store.values()].filter(item => item.patientId === patientId);
  res.json({ patientId, encounters: select(encounters), notes: [...notes.values()].filter(note => encounters.get(note.encounterId)?.patientId === patientId), observations: select(observations), labs: select(labs), prescriptions: select(prescriptions).map(publicPrescription), referrals: select(referrals), appointments: select(appointments) });
});

router.post('/encounters', body('patientId').isString(), body('reasonCode').isObject(), (req: AuthRequest, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty() || !validateClinicalCode(req.body.reasonCode)) return res.status(400).json({ error: { code: 'CLINICAL_INPUT_INVALID' } });
  if (!permitted(req, 'create-encounter')) return res.status(403).json({ error: { code: 'DOCTOR_REQUIRED' } });
  const encounter = { id: crypto.randomUUID(), patientId: req.body.patientId, practitionerId: req.doctor!.id, facilityId: req.doctor!.clinicId, status: 'in-progress', reasonCode: req.body.reasonCode, startedAt: new Date().toISOString() };
  encounters.set(encounter.id, encounter);
  res.status(201).json({ encounter });
});

router.post('/encounters/:encounterId/notes', body('text').isString().isLength({ min: 3, max: 20_000 }), (req: AuthRequest, res: Response) => {
  if (!permitted(req, 'sign-note') || !encounters.has(req.params.encounterId)) return res.status(403).json({ error: { code: 'NOTE_NOT_PERMITTED' } });
  const draft: ClinicalNote = { id: crypto.randomUUID(), encounterId: req.params.encounterId, authorId: req.doctor!.id, text: req.body.text, status: 'draft', version: 1 };
  const note = signNote(draft, req.doctor!.id);
  notes.set(note.id, note);
  res.status(201).json({ note });
});

router.post('/notes/:noteId/corrections', body('text').isString(), body('reason').isString().isLength({ min: 10, max: 500 }), (req: AuthRequest, res: Response) => {
  const original = notes.get(req.params.noteId);
  if (!original || !permitted(req, 'correct-note')) return res.status(404).json({ error: { code: 'SIGNED_NOTE_NOT_FOUND' } });
  try {
    const result = correctNote(original, crypto.randomUUID(), req.doctor!.id, req.body.text, req.body.reason);
    notes.set(result.original.id, result.original); notes.set(result.correction.id, result.correction);
    res.status(201).json(result);
  } catch (error) { res.status(409).json({ error: { code: error instanceof Error ? error.message : 'CORRECTION_REJECTED' } }); }
});

router.post('/encounters/:encounterId/observations', (req: AuthRequest, res: Response) => {
  const encounter = encounters.get(req.params.encounterId);
  if (!encounter || !permitted(req, 'record-observation') || !validateClinicalCode(req.body.code) || typeof req.body.value !== 'number') return res.status(403).json({ error: { code: 'OBSERVATION_NOT_PERMITTED' } });
  const observation = { id: crypto.randomUUID(), encounterId: encounter.id, patientId: encounter.patientId, facilityId: encounter.facilityId, code: req.body.code, value: req.body.value, unit: String(req.body.unit ?? ''), recordedBy: req.doctor!.id, recordedAt: new Date().toISOString(), version: 1 };
  observations.set(observation.id, observation);
  res.status(201).json({ observation });
});

router.post('/encounters/:encounterId/administrations', (req: AuthRequest, res: Response) => {
  const encounter = encounters.get(req.params.encounterId);
  if (!encounter || !permitted(req, 'administer-medication') || !validateClinicalCode(req.body.medicationCode)) return res.status(403).json({ error: { code: 'ADMINISTRATION_NOT_PERMITTED' } });
  const administration = { id: crypto.randomUUID(), encounterId: encounter.id, patientId: encounter.patientId, medicationCode: req.body.medicationCode, administeredBy: req.doctor!.id, administeredAt: new Date().toISOString(), status: 'completed' };
  administrations.set(administration.id, administration);
  res.status(201).json({ administration });
});

router.post('/labs', (req: AuthRequest, res: Response) => {
  if (!permitted(req, 'order-lab') || !validateClinicalCode(req.body.code)) return res.status(403).json({ error: { code: 'LAB_ORDER_NOT_PERMITTED' } });
  const order = { id: crypto.randomUUID(), patientId: req.body.patientId, facilityId: req.doctor!.clinicId, status: 'ordered' as LabStatus, version: 0, code: req.body.code };
  labs.set(order.id, order); res.status(201).json({ order });
});
router.post('/labs/:id/transition', (req: AuthRequest, res: Response) => {
  const order = labs.get(req.params.id); if (!order) return res.status(404).json({ error: { code: 'LAB_ORDER_NOT_FOUND' } });
  const actionByEvent: Partial<Record<LabEvent, Parameters<typeof canPerformClinicalAction>[1]>> = { COLLECT: 'collect-specimen', START: 'start-lab', RESULT: 'result-lab', CORRECT: 'correct-lab' };
  const action = actionByEvent[req.body.event as LabEvent];
  if (!action || !permitted(req, action)) return res.status(403).json({ error: { code: 'LAB_TRANSITION_NOT_PERMITTED' } });
  try { order.status = transitionLab(order.status, req.body.event); order.version += 1; if (req.body.event === 'RESULT' || req.body.event === 'CORRECT') { order.result = req.body.result; order.critical = req.body.critical === true; if (order.critical) { const taskId = crypto.randomUUID(); tasks.set(taskId, { id: taskId, facilityId: order.facilityId, patientId: order.patientId, type: 'critical-lab', status: 'open', priority: 'urgent', assignedRole: 'doctor', sourceId: order.id }); } } res.json({ order }); }
  catch (error) { res.status(409).json({ error: { code: error instanceof Error ? error.message : 'LAB_TRANSITION_INVALID' } }); }
});

router.post('/prescriptions', (req: AuthRequest, res: Response) => {
  if (!permitted(req, 'prescribe') || !validateClinicalCode(req.body.medicationCode) || !Number.isSafeInteger(req.body.quantity) || req.body.quantity <= 0) return res.status(400).json({ error: { code: 'PRESCRIPTION_INVALID' } });
  const prescription = { id: crypto.randomUUID(), patientId: req.body.patientId, facilityId: req.doctor!.clinicId, status: 'active' as const, quantity: req.body.quantity, dispensed: 0, processedCommands: new Set<string>(), medicationCode: req.body.medicationCode };
  prescriptions.set(prescription.id, prescription); res.status(201).json({ prescription: { ...prescription, processedCommands: [] } });
});
router.post('/prescriptions/:id/dispense', (req: AuthRequest, res: Response) => {
  const current = prescriptions.get(req.params.id); if (!current) return res.status(404).json({ error: { code: 'PRESCRIPTION_NOT_FOUND' } });
  if (!permitted(req, 'dispense')) return res.status(403).json({ error: { code: 'DISPENSE_NOT_PERMITTED' } });
  try { const next = dispenseMedication(current, req.body.quantity, req.body.commandId); prescriptions.set(current.id, { ...current, ...next }); res.json({ prescription: { ...next, processedCommands: [...next.processedCommands] } }); }
  catch (error) { res.status(409).json({ error: { code: error instanceof Error ? error.message : 'DISPENSE_REJECTED' } }); }
});

router.post('/referrals', (req: AuthRequest, res: Response) => {
  if (!permitted(req, 'refer') || !validateClinicalCode(req.body.reasonCode) || typeof req.body.destination !== 'string') return res.status(400).json({ error: { code: 'REFERRAL_INVALID' } });
  const referral = { id: crypto.randomUUID(), patientId: req.body.patientId, facilityId: req.doctor!.clinicId, destination: req.body.destination, status: 'requested' as ReferralStatus, version: 0, reasonCode: req.body.reasonCode };
  referrals.set(referral.id, referral); tasks.set(referral.id, { id: referral.id, facilityId: referral.facilityId, patientId: referral.patientId, type: 'referral', status: 'open', priority: 'routine', assignedRole: 'staff', sourceId: referral.id });
  res.status(201).json({ referral });
});
router.post('/referrals/:id/transition', (req: AuthRequest, res: Response) => {
  const referral = referrals.get(req.params.id); if (!referral) return res.status(404).json({ error: { code: 'REFERRAL_NOT_FOUND' } });
  if (!permitted(req, 'schedule-appointment')) return res.status(403).json({ error: { code: 'REFERRAL_TRANSITION_NOT_PERMITTED' } });
  try { referral.status = transitionReferral(referral.status, req.body.event as ReferralEvent); referral.version += 1; res.json({ referral }); }
  catch (error) { res.status(409).json({ error: { code: error instanceof Error ? error.message : 'REFERRAL_TRANSITION_INVALID' } }); }
});
router.post('/appointments', (req: AuthRequest, res: Response) => {
  const referral = referrals.get(req.body.referralId);
  if (!permitted(req, 'schedule-appointment') || !referral || referral.status !== 'accepted' || Number.isNaN(Date.parse(req.body.start))) return res.status(409).json({ error: { code: 'APPOINTMENT_NOT_PERMITTED' } });
  referral.status = transitionReferral(referral.status, 'SCHEDULE'); referral.version += 1;
  const appointment = { id: crypto.randomUUID(), patientId: referral.patientId, referralId: referral.id, facilityId: req.doctor!.clinicId, start: new Date(req.body.start).toISOString(), status: 'booked', createdBy: req.doctor!.id };
  appointments.set(appointment.id, appointment); res.status(201).json({ appointment, referral });
});

router.get('/tasks', (req: AuthRequest, res: Response) => {
  if (!permitted(req, 'view-task-queue')) return res.status(403).json({ error: { code: 'TASK_QUEUE_NOT_PERMITTED' } });
  res.json({ tasks: [...tasks.values()].filter(task => task.facilityId === req.doctor!.clinicId && (task.assignedRole === req.doctor!.role || req.doctor!.role === 'doctor')) });
});
router.post('/tasks/:id/complete', (req: AuthRequest, res: Response) => {
  const task = tasks.get(req.params.id); if (!task) return res.status(404).json({ error: { code: 'TASK_NOT_FOUND' } });
  if (!permitted(req, 'task-update') || (task.assignedRole !== req.doctor!.role && req.doctor!.role !== 'doctor')) return res.status(403).json({ error: { code: 'TASK_UPDATE_NOT_PERMITTED' } });
  if (task.status === 'completed') return res.status(409).json({ error: { code: 'TASK_ALREADY_COMPLETED' } });
  task.status = 'completed'; task.completedBy = req.doctor!.id; task.completedAt = new Date().toISOString(); res.json({ task });
});

router.post('/downtime/reconcile', (req: AuthRequest, res: Response) => {
  if (!permitted(req, 'downtime-reconcile') || typeof req.body.resourceId !== 'string' || typeof req.body.commandId !== 'string' || !Number.isInteger(req.body.baseVersion)) return res.status(400).json({ error: { code: 'DOWNTIME_COMMAND_INVALID' } });
  const current = downtimeStates.get(req.body.resourceId) ?? { version: 0, processedCommands: new Set<string>() };
  try { const result = reconcileOfflineClinicalCommand(current, { id: req.body.commandId, baseVersion: req.body.baseVersion }); downtimeStates.set(req.body.resourceId, result.state); res.status(result.status === 'accepted' ? 202 : 200).json({ status: result.status, version: result.state.version }); }
  catch (error) { res.status(409).json({ error: { code: error instanceof Error ? error.message : 'DOWNTIME_RECONCILIATION_FAILED' }, serverVersion: current.version }); }
});

router.get('/patients/:patientId/fhir', (req: AuthRequest, res: Response) => {
  if (!permitted(req, 'view-summary')) return res.status(403).json({ error: { code: 'FHIR_EXPORT_NOT_PERMITTED' } });
  const patientId = req.params.patientId;
  const entries = [
    ...[...encounters.values()].filter(item => item.patientId === patientId).map(item => ({ resource: { resourceType: 'Encounter', id: item.id, status: item.status, subject: { reference: `Patient/${patientId}` } } })),
    ...[...observations.values()].filter(item => item.patientId === patientId).map(item => ({ resource: { resourceType: 'Observation', id: item.id, status: 'final', code: { coding: [item.code] }, valueQuantity: { value: item.value, unit: item.unit }, subject: { reference: `Patient/${patientId}` } } })),
    ...[...labs.values()].filter(item => item.patientId === patientId).map(item => ({ resource: { resourceType: 'ServiceRequest', id: item.id, status: item.status === 'cancelled' ? 'revoked' : 'active', intent: 'order', code: { coding: [item.code] }, subject: { reference: `Patient/${patientId}` } } })),
    ...[...prescriptions.values()].filter(item => item.patientId === patientId).map(item => ({ resource: { resourceType: 'MedicationRequest', id: item.id, status: item.status === 'cancelled' ? 'cancelled' : item.status === 'completed' ? 'completed' : 'active', intent: 'order', medicationCodeableConcept: { coding: [item.medicationCode] }, subject: { reference: `Patient/${patientId}` } } })),
  ];
  res.json({ resourceType: 'Bundle', type: 'collection', entry: entries });
});
router.post('/fhir/import', (req: AuthRequest, res: Response) => {
  if (!permitted(req, 'create-encounter')) return res.status(403).json({ error: { code: 'FHIR_IMPORT_NOT_PERMITTED' } });
  const result = validateFhirResource(req.body);
  res.status(result.valid ? 202 : 422).json({ resourceType: 'OperationOutcome', issue: result.issues.map(diagnostics => ({ severity: 'error', code: 'invalid', diagnostics })), accepted: result.valid });
});

export default router;
