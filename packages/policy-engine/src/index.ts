export type Role = 'patient' | 'doctor' | 'nurse' | 'ministry' | 'admin';
export type Action =
  | 'view_own_records'
  | 'view_patient_record'
  | 'upload_record'
  | 'add_intake'
  | 'correct_record'
  | 'soft_delete_record'
  | 'purge_record'
  | 'view_own_access_log'
  | 'search_audit_log'
  | 'manage_own_consent'
  | 'manage_identity_token'
  | 'request_consent'
  | 'establish_care_relationship'
  | 'break_glass'
  | 'view_aggregates'
  | 'export_aggregate'
  | 'provision_workforce'
  | 'assign_role'
  | 'revoke_own_session'
  | 'force_revoke_session'
  | 'resolve_consent_dispute'
  | 'view_system_health';

export interface Subject {
  id: string;
  role: Role;
  status: 'unverified' | 'active' | 'suspended' | 'disabled';
  sessionId?: string;
  mfaSatisfied: boolean;
  facilityId?: string;
}

export interface Resource {
  patientId?: string;
  facilityId?: string;
  ownerId?: string;
  aggregateOnly?: boolean;
}

export interface ConsentContext {
  status: 'pending' | 'active' | 'revoked' | 'expired' | 'denied';
  access: 'record_read' | 'record_write' | 'intake_write';
  purpose: string;
  granteeId: string;
  granteeType: 'workforce' | 'facility';
  expiresAt: string;
  revokedAt?: string;
  oneTimeUse?: boolean;
  consumedAt?: string;
}

export interface AccessContext {
  purpose?: string;
  legalBasis?: 'consent' | 'care_relationship' | 'emergency' | 'public_health' | 'self_access' | 'administration';
  careRelationshipActive?: boolean;
  consent?: ConsentContext;
  now?: string;
  breakGlassJustification?: string;
  featureFlags?: {
    nurseCanWriteRecords?: boolean;
    legalPurgeEnabled?: boolean;
  };
}

export interface Decision {
  allowed: boolean;
  code: string;
  obligations: string[];
}

const deny = (code: string): Decision => ({ allowed: false, code, obligations: ['audit_denial'] });
const allow = (...obligations: string[]): Decision => ({ allowed: true, code: 'ALLOW', obligations: ['audit_access', ...obligations] });

function consentAllows(subject: Subject, requiredAccess: ConsentContext['access'], context: AccessContext): boolean {
  const consent = context.consent;
  const now = new Date(context.now ?? new Date().toISOString()).getTime();
  if (!consent || consent.status !== 'active' || consent.revokedAt) return false;
  if (consent.access !== requiredAccess || consent.granteeId !== subject.id) return false;
  if (consent.purpose !== context.purpose || new Date(consent.expiresAt).getTime() <= now) return false;
  if (consent.oneTimeUse && consent.consumedAt) return false;
  return true;
}

function clinicalFoundation(subject: Subject, resource: Resource, context: AccessContext, access: ConsentContext['access']): Decision | null {
  if (!subject.facilityId || !resource.facilityId || subject.facilityId !== resource.facilityId) return deny('FACILITY_MISMATCH');
  if (!context.careRelationshipActive) return deny('CARE_RELATIONSHIP_REQUIRED');
  if (context.legalBasis === 'consent' && !consentAllows(subject, access, context)) return deny('CONSENT_INVALID_FOR_ACTION');
  if (!['consent', 'care_relationship'].includes(context.legalBasis ?? '')) return deny('LEGAL_BASIS_REQUIRED');
  return null;
}

export function evaluateAccess(action: Action, subject: Subject, resource: Resource = {}, context: AccessContext = {}): Decision {
  if (subject.status !== 'active') return deny(subject.status === 'unverified' ? 'IDENTITY_VERIFICATION_REQUIRED' : 'ACCOUNT_INACTIVE');
  if (!subject.sessionId) return deny('SESSION_REQUIRED');

  if (subject.role === 'patient') {
    const own = resource.patientId === subject.id || resource.ownerId === subject.id;
    if (action === 'revoke_own_session') return allow('revoke_only_own_session');
    if (!own) return deny('OWN_RESOURCE_ONLY');
    if (['view_own_records', 'view_own_access_log', 'manage_own_consent', 'manage_identity_token'].includes(action)) return allow('scope_to_verified_patient');
    return deny('PATIENT_ACTION_NOT_PERMITTED');
  }

  if (subject.role === 'ministry') {
    if (!subject.mfaSatisfied) return deny('MFA_REQUIRED');
    if (!resource.aggregateOnly) return deny('AGGREGATE_ONLY');
    if (action === 'view_aggregates') return allow('minimum_cell_suppression');
    if (action === 'export_aggregate') return allow('minimum_cell_suppression', 'audit_export');
    return deny('MINISTRY_ACTION_NOT_PERMITTED');
  }

  if (subject.role === 'admin') {
    if (!subject.mfaSatisfied) return deny('MFA_REQUIRED');
    if (['provision_workforce', 'assign_role', 'force_revoke_session', 'resolve_consent_dispute', 'view_system_health'].includes(action)) {
      return allow('audit_admin_action');
    }
    if (action === 'search_audit_log') return allow('audit_the_audit_search', 'require_search_purpose');
    if (action === 'purge_record' && context.featureFlags?.legalPurgeEnabled) return allow('legal_signoff_required', 'audit_admin_action');
    return deny('ADMIN_ACTION_NOT_PERMITTED');
  }

  if (!subject.mfaSatisfied) return deny('MFA_REQUIRED');
  if (!['doctor', 'nurse'].includes(subject.role)) return deny('ROLE_NOT_SUPPORTED');

  if (action === 'break_glass') {
    if (subject.role !== 'doctor') return deny('BREAK_GLASS_ROLE_NOT_PERMITTED');
    if (!context.breakGlassJustification || context.breakGlassJustification.trim().length < 20) return deny('BREAK_GLASS_JUSTIFICATION_REQUIRED');
    return allow('notify_patient', 'admin_review', 'time_box_access', 'prominent_audit');
  }

  if (action === 'view_patient_record') {
    const denied = clinicalFoundation(subject, resource, context, 'record_read');
    return denied ?? allow('minimum_necessary');
  }

  if (action === 'upload_record' || action === 'correct_record') {
    if (subject.role !== 'doctor') return deny('DOCTOR_ONLY_RECORD_WRITE');
    const denied = clinicalFoundation(subject, resource, context, 'record_write');
    return denied ?? allow('server_file_pipeline', 'record_provenance');
  }

  if (action === 'add_intake') {
    if (subject.role !== 'nurse' || !context.featureFlags?.nurseCanWriteRecords) return deny('NURSE_INTAKE_DISABLED');
    const denied = clinicalFoundation(subject, resource, context, 'intake_write');
    return denied ?? allow('structured_intake_only', 'record_provenance');
  }

  if (action === 'request_consent' || action === 'establish_care_relationship') {
    return subject.role === 'doctor' ? allow('audit_clinical_relationship') : deny('DOCTOR_ONLY_RELATIONSHIP_ACTION');
  }

  if (action === 'soft_delete_record') return subject.role === 'doctor' ? allow('reason_required', 'retain_prior_version') : deny('DOCTOR_ONLY_SOFT_DELETE');
  return deny('ACTION_NOT_PERMITTED');
}
