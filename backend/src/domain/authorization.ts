import {
  Action as PlatformAction,
  Decision as PlatformDecision,
  evaluateAccess,
  Role as PlatformRole,
} from '@medichain/policy-engine';

export type WorkforceRole = 'doctor' | 'nurse' | 'laboratory' | 'pharmacy' | 'staff' | 'admin' | 'government' | 'patient';
export type ActorStatus = 'active' | 'suspended' | 'disabled';
export type ResourceType =
  | 'patient-demographics'
  | 'clinical-record'
  | 'emergency-summary'
  | 'consent'
  | 'access-history'
  | 'qr-token'
  | 'aggregate-analytics'
  | 'system-administration';
export type Action = 'read' | 'create' | 'update' | 'revoke' | 'export' | 'administer';
export type Purpose = 'treatment' | 'care-coordination' | 'patient-service' | 'emergency' | 'operations' | 'public-health';
export type Sensitivity = 'standard' | 'restricted';

export interface ActorContext {
  id: string;
  role: WorkforceRole;
  status: ActorStatus;
  facilityId?: string;
  mfa: boolean;
  sessionId: string;
}

export interface ResourceContext {
  type: ResourceType;
  patientId?: string;
  facilityId?: string;
  ownerId?: string;
  sensitivity?: Sensitivity;
}

export interface AuthorizationRequest {
  actor: ActorContext;
  resource: ResourceContext;
  action: Action;
  purpose: Purpose;
  hasActiveConsent?: boolean;
  hasCareRelationship?: boolean;
  breakGlassApproved?: boolean;
}

export interface AuthorizationDecision {
  allowed: boolean;
  code: string;
  obligations: string[];
}

const deny = (code: string): AuthorizationDecision => ({ allowed: false, code, obligations: ['audit-denial'] });

function role(role: WorkforceRole): PlatformRole | null {
  if (role === 'government') return 'ministry';
  if (['patient', 'doctor', 'nurse', 'admin'].includes(role)) return role as PlatformRole;
  return null;
}

function actionFor(request: AuthorizationRequest): PlatformAction | null {
  const { actor, resource, action, purpose } = request;
  if (purpose === 'emergency') return 'break_glass';
  if (actor.role === 'patient') {
    if (resource.type === 'clinical-record' && action === 'read') return 'view_own_records';
    if (resource.type === 'access-history' && action === 'read') return 'view_own_access_log';
    if (resource.type === 'consent' && ['read', 'create', 'update', 'revoke'].includes(action)) return 'manage_own_consent';
    if (resource.type === 'qr-token' && ['read', 'create', 'revoke'].includes(action)) return 'manage_identity_token';
    return null;
  }
  if (actor.role === 'government' && resource.type === 'aggregate-analytics') {
    return action === 'export' ? 'export_aggregate' : action === 'read' ? 'view_aggregates' : null;
  }
  if (actor.role === 'admin' && resource.type === 'system-administration' && action === 'administer') return 'assign_role';
  if (resource.type === 'clinical-record') {
    if (action === 'read') return 'view_patient_record';
    if (action === 'create') return 'upload_record';
    if (action === 'update') return 'correct_record';
  }
  return null;
}

function compatibilityCode(decision: PlatformDecision, request: AuthorizationRequest): string {
  if (decision.allowed) return decision.code;
  if (decision.code === 'FACILITY_MISMATCH') return 'CROSS_FACILITY_ACCESS';
  if (decision.code === 'OWN_RESOURCE_ONLY') return 'CROSS_PATIENT_ACCESS';
  if (decision.code === 'CONSENT_INVALID_FOR_ACTION') return 'ACTIVE_CONSENT_REQUIRED';
  if (decision.code === 'BREAK_GLASS_JUSTIFICATION_REQUIRED') return 'BREAK_GLASS_REQUIRED';
  if (request.actor.role === 'admin' && request.resource.type !== 'system-administration') return 'ROLE_HAS_NO_CLINICAL_ACCESS';
  if (request.actor.role === 'government' && request.resource.type !== 'aggregate-analytics') return 'ROLE_HAS_NO_CLINICAL_ACCESS';
  if (decision.code === 'MFA_REQUIRED' && request.resource.sensitivity === 'restricted') return 'STEP_UP_REQUIRED';
  if (decision.code === 'DOCTOR_ONLY_RECORD_WRITE' && request.actor.role === 'nurse') return 'NURSE_RECORD_WRITE_DISABLED';
  if (request.actor.role === 'nurse' && ['update', 'revoke', 'export'].includes(request.action)) return 'NURSE_ACTION_NOT_PERMITTED';
  return decision.code;
}

/**
 * Compatibility adapter for the legacy API contract. All decisions are made
 * by @medichain/policy-engine; this module only maps old route vocabulary to
 * the approved v1 action model while the endpoints are migrated.
 */
export function authorize(request: AuthorizationRequest): AuthorizationDecision {
  const mappedRole = role(request.actor.role);
  if (!mappedRole) return deny('ROLE_HAS_NO_CLINICAL_ACCESS');
  const mappedAction = actionFor(request);
  if (!mappedAction) {
    if (request.actor.role === 'patient' && request.resource.patientId !== request.actor.id) return deny('CROSS_PATIENT_ACCESS');
    if (request.actor.role === 'admin' || request.actor.role === 'government' || request.actor.role === 'staff') return deny('ROLE_HAS_NO_CLINICAL_ACCESS');
    if (request.actor.role === 'nurse' && ['update', 'revoke', 'export'].includes(request.action)) return deny('NURSE_ACTION_NOT_PERMITTED');
    return deny('ACTION_NOT_PERMITTED');
  }

  const requiredAccess = mappedAction === 'upload_record' || mappedAction === 'correct_record' ? 'record_write' : 'record_read';
  const consent = request.hasActiveConsent ? {
    status: 'active' as const,
    access: requiredAccess as 'record_read' | 'record_write',
    purpose: request.purpose === 'care-coordination' ? 'care-coordination' : 'treatment',
    granteeId: request.actor.id,
    granteeType: 'workforce' as const,
    expiresAt: '2099-01-01T00:00:00.000Z',
  } : undefined;
  const decision = evaluateAccess(mappedAction, {
    id: request.actor.id,
    role: mappedRole,
    status: request.actor.status,
    sessionId: request.actor.sessionId,
    mfaSatisfied: request.actor.mfa,
    facilityId: request.actor.facilityId,
  }, {
    patientId: request.resource.patientId,
    ownerId: request.resource.ownerId,
    facilityId: request.resource.facilityId,
    aggregateOnly: request.resource.type === 'aggregate-analytics',
  }, {
    purpose: request.purpose === 'care-coordination' ? 'care-coordination' : 'treatment',
    legalBasis: request.purpose === 'emergency' ? 'emergency' : request.actor.role === 'patient' ? 'self_access' : request.actor.role === 'government' ? 'public_health' : request.actor.role === 'admin' ? 'administration' : 'consent',
    careRelationshipActive: request.hasCareRelationship,
    consent,
    breakGlassJustification: request.breakGlassApproved ? 'Verified break-glass event with written justification' : undefined,
  });

  const obligations = [...decision.obligations];
  if (request.actor.role === 'government' && decision.allowed) obligations.push('de-identify', 'suppress-small-cells');
  if (request.purpose === 'emergency' && decision.allowed) obligations.push('minimum-necessary', 'time-boxed', 'notify-patient', 'mandatory-review');
  return { allowed: decision.allowed, code: compatibilityCode(decision, request), obligations };
}
