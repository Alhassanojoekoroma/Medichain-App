import crypto from 'crypto';

export type LabStatus = 'ordered' | 'specimen-collected' | 'in-progress' | 'resulted' | 'corrected' | 'cancelled';
export type LabEvent = 'COLLECT' | 'START' | 'RESULT' | 'CORRECT' | 'CANCEL';
const LAB_TRANSITIONS: Record<LabStatus, Partial<Record<LabEvent, LabStatus>>> = {
  ordered: { COLLECT: 'specimen-collected', CANCEL: 'cancelled' },
  'specimen-collected': { START: 'in-progress', CANCEL: 'cancelled' },
  'in-progress': { RESULT: 'resulted', CANCEL: 'cancelled' },
  resulted: { CORRECT: 'corrected' }, corrected: { CORRECT: 'corrected' }, cancelled: {},
};
export function transitionLab(status: LabStatus, event: LabEvent): LabStatus {
  const next = LAB_TRANSITIONS[status][event];
  if (!next) throw new Error('LAB_TRANSITION_INVALID');
  return next;
}

export interface PrescriptionState { status: 'active' | 'completed' | 'cancelled'; quantity: number; dispensed: number; processedCommands: Set<string> }
export function dispenseMedication(state: PrescriptionState, quantity: number, commandId: string): PrescriptionState {
  if (state.processedCommands.has(commandId)) return state;
  if (state.status !== 'active') throw new Error('PRESCRIPTION_NOT_ACTIVE');
  if (!Number.isSafeInteger(quantity) || quantity <= 0) throw new Error('DISPENSE_QUANTITY_INVALID');
  if (state.dispensed + quantity > state.quantity) throw new Error('DISPENSE_EXCEEDS_PRESCRIPTION');
  const dispensed = state.dispensed + quantity;
  return { ...state, dispensed, status: dispensed === state.quantity ? 'completed' : 'active', processedCommands: new Set([...state.processedCommands, commandId]) };
}

export interface ClinicalNote { id: string; encounterId: string; authorId: string; text: string; status: 'draft' | 'signed' | 'corrected'; version: number; signatureHash?: string; supersedesId?: string }
export function signNote(note: ClinicalNote, signerId: string, signedAt = new Date().toISOString()): ClinicalNote {
  if (note.status !== 'draft' || note.authorId !== signerId) throw new Error('NOTE_SIGNING_NOT_PERMITTED');
  if (note.text.trim().length < 3) throw new Error('NOTE_CONTENT_REQUIRED');
  const signatureHash = crypto.createHash('sha256').update(`${note.id}:${note.encounterId}:${note.authorId}:${note.version}:${note.text}:${signedAt}`).digest('hex');
  return { ...note, status: 'signed', signatureHash };
}
export function correctNote(original: ClinicalNote, correctionId: string, authorId: string, text: string, reason: string): { original: ClinicalNote; correction: ClinicalNote } {
  if (original.status !== 'signed' && original.status !== 'corrected') throw new Error('SIGNED_NOTE_REQUIRED');
  if (reason.trim().length < 10) throw new Error('CORRECTION_REASON_REQUIRED');
  const draft: ClinicalNote = { id: correctionId, encounterId: original.encounterId, authorId, text, status: 'draft', version: original.version + 1, supersedesId: original.id };
  return { original: { ...original, status: 'corrected' }, correction: signNote(draft, authorId) };
}

export interface MatchCandidate { patientId: string; healthIdHash?: string; phone?: string; dateOfBirth?: string; name?: string }
export function matchPatients(query: Omit<MatchCandidate, 'patientId'>, candidates: MatchCandidate[]): { status: 'matched' | 'ambiguous' | 'none'; patientId?: string; candidates: string[] } {
  const scored = candidates.map(candidate => ({ candidate, score: (query.healthIdHash && query.healthIdHash === candidate.healthIdHash ? 100 : 0) + (query.phone && query.phone === candidate.phone ? 30 : 0) + (query.dateOfBirth && query.dateOfBirth === candidate.dateOfBirth ? 20 : 0) + (query.name && query.name.toLowerCase() === candidate.name?.toLowerCase() ? 10 : 0) })).filter(item => item.score >= 30).sort((a, b) => b.score - a.score);
  if (!scored.length) return { status: 'none', candidates: [] };
  if (scored.length > 1 && scored[0].score === scored[1].score) return { status: 'ambiguous', candidates: scored.filter(item => item.score === scored[0].score).map(item => item.candidate.patientId) };
  return { status: 'matched', patientId: scored[0].candidate.patientId, candidates: [scored[0].candidate.patientId] };
}

export function validateClinicalCode(input: unknown): input is { system: string; code: string; display?: string } {
  if (!input || typeof input !== 'object') return false;
  const code = input as Record<string, unknown>;
  return typeof code.system === 'string' && /^https:\/\//.test(code.system) && typeof code.code === 'string' && /^[A-Za-z0-9.\-]{1,40}$/.test(code.code);
}

export type ClinicalWorkforceRole = 'doctor' | 'nurse' | 'laboratory' | 'pharmacy' | 'staff';
export type ClinicalAction =
  | 'patient-match' | 'view-summary' | 'create-encounter' | 'sign-note' | 'correct-note'
  | 'record-observation' | 'administer-medication' | 'order-lab' | 'collect-specimen'
  | 'start-lab' | 'result-lab' | 'correct-lab' | 'prescribe' | 'dispense'
  | 'refer' | 'schedule-appointment' | 'view-task-queue' | 'task-update' | 'downtime-reconcile';

const CLINICAL_ACTIONS: Record<ClinicalWorkforceRole, ReadonlySet<ClinicalAction>> = {
  doctor: new Set(['patient-match', 'view-summary', 'create-encounter', 'sign-note', 'correct-note', 'order-lab', 'prescribe', 'refer', 'view-task-queue', 'task-update', 'downtime-reconcile']),
  nurse: new Set(['view-summary', 'record-observation', 'administer-medication', 'collect-specimen', 'view-task-queue', 'task-update', 'downtime-reconcile']),
  laboratory: new Set(['view-summary', 'start-lab', 'result-lab', 'correct-lab', 'view-task-queue', 'task-update', 'downtime-reconcile']),
  pharmacy: new Set(['view-summary', 'dispense', 'view-task-queue', 'task-update', 'downtime-reconcile']),
  staff: new Set(['schedule-appointment', 'view-task-queue', 'task-update']),
};

export function canPerformClinicalAction(role: string, action: ClinicalAction): boolean {
  return Object.prototype.hasOwnProperty.call(CLINICAL_ACTIONS, role) && CLINICAL_ACTIONS[role as ClinicalWorkforceRole].has(action);
}

export type ReferralStatus = 'requested' | 'accepted' | 'scheduled' | 'completed' | 'cancelled';
export type ReferralEvent = 'ACCEPT' | 'SCHEDULE' | 'COMPLETE' | 'CANCEL';
const REFERRAL_TRANSITIONS: Record<ReferralStatus, Partial<Record<ReferralEvent, ReferralStatus>>> = {
  requested: { ACCEPT: 'accepted', CANCEL: 'cancelled' },
  accepted: { SCHEDULE: 'scheduled', CANCEL: 'cancelled' },
  scheduled: { COMPLETE: 'completed', CANCEL: 'cancelled' },
  completed: {}, cancelled: {},
};
export function transitionReferral(status: ReferralStatus, event: ReferralEvent): ReferralStatus {
  const next = REFERRAL_TRANSITIONS[status][event];
  if (!next) throw new Error('REFERRAL_TRANSITION_INVALID');
  return next;
}

export interface OfflineClinicalState { version: number; processedCommands: Set<string> }
export interface OfflineClinicalCommand { id: string; baseVersion: number }
export function reconcileOfflineClinicalCommand(state: OfflineClinicalState, command: OfflineClinicalCommand): { status: 'accepted' | 'duplicate'; state: OfflineClinicalState } {
  if (state.processedCommands.has(command.id)) return { status: 'duplicate', state };
  if (command.baseVersion !== state.version) throw new Error('DOWNTIME_VERSION_CONFLICT');
  return { status: 'accepted', state: { version: state.version + 1, processedCommands: new Set([...state.processedCommands, command.id]) } };
}
