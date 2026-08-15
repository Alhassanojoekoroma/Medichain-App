export const WORKFLOW_STATES = [
  'initial', 'loading', 'partial', 'success', 'empty', 'no-results', 'error', 'offline',
  'forbidden', 'unavailable', 'stale-retrying', 'completed-recoverable',
] as const;
export type WorkflowState = typeof WORKFLOW_STATES[number];

export interface WorkflowStateModel { state: WorkflowState; title: string; message: string; announcement: 'polite' | 'assertive'; recoveryAction?: string; preservesInput: boolean }
const COPY: Record<WorkflowState, Omit<WorkflowStateModel, 'state'>> = {
  initial: { title: 'Ready', message: 'Choose an action to begin.', announcement: 'polite', preservesInput: true },
  loading: { title: 'Loading', message: 'Please wait. Your current page remains available.', announcement: 'polite', preservesInput: true },
  partial: { title: 'Partially available', message: 'Some information is still loading. Available information is clearly marked.', announcement: 'polite', recoveryAction: 'Retry missing information', preservesInput: true },
  success: { title: 'Saved', message: 'The server confirmed this action.', announcement: 'polite', preservesInput: true },
  empty: { title: 'Nothing recorded', message: 'No information has been recorded here yet.', announcement: 'polite', recoveryAction: 'Return to tasks', preservesInput: true },
  'no-results': { title: 'No matching results', message: 'Try a different search. No patient existence is disclosed.', announcement: 'polite', recoveryAction: 'Clear filters', preservesInput: true },
  error: { title: 'Could not complete the action', message: 'Your entered information is preserved. Retry or contact support with the reference shown.', announcement: 'assertive', recoveryAction: 'Try again', preservesInput: true },
  offline: { title: 'Offline', message: 'Server changes are unavailable. Only clearly dated approved cached information may be viewed.', announcement: 'assertive', recoveryAction: 'Check connection', preservesInput: true },
  forbidden: { title: 'Access not available', message: 'Your role or current care context does not permit this action.', announcement: 'assertive', recoveryAction: 'Return safely', preservesInput: false },
  unavailable: { title: 'Service unavailable', message: 'This capability is currently disabled. No success was recorded.', announcement: 'assertive', recoveryAction: 'Try later', preservesInput: true },
  'stale-retrying': { title: 'Information may be out of date', message: 'The last verified time must be checked before acting.', announcement: 'assertive', recoveryAction: 'Refresh safely', preservesInput: true },
  'completed-recoverable': { title: 'Completed', message: 'A receipt and the next safe action are available.', announcement: 'polite', recoveryAction: 'View receipt', preservesInput: true },
};
export function workflowState(state: WorkflowState): WorkflowStateModel { return { state, ...COPY[state] }; }

export const SUPPORTED_LOCALES = ['en-SL', 'kri-SL'] as const;
export type SupportedLocale = typeof SUPPORTED_LOCALES[number];
const MESSAGES: Record<SupportedLocale, Record<'skip' | 'loading' | 'retry' | 'offline' | 'privacy', string>> = {
  'en-SL': { skip: 'Skip to main content', loading: 'Loading', retry: 'Try again', offline: 'You are offline', privacy: 'Protect patient privacy on shared devices.' },
  'kri-SL': { skip: 'Go na di mein tin dem', loading: 'Wi de lod am', retry: 'Tray igen', offline: 'Intanet nɔ de', privacy: 'Kip di pesin in infɔmeshɔn sef pan sheb divays.' },
};
export function message(locale: string, key: keyof typeof MESSAGES['en-SL']): string { return MESSAGES[SUPPORTED_LOCALES.includes(locale as SupportedLocale) ? locale as SupportedLocale : 'en-SL'][key]; }
