export type DataClassification = 'C0_PUBLIC' | 'C1_INTERNAL' | 'C2_PERSONAL' | 'C3_PHI' | 'C4_RESTRICTED' | 'D1_DEIDENTIFIED';

export type Role = 'patient' | 'doctor' | 'nurse' | 'ministry' | 'admin';
export type AccountStatus = 'unverified' | 'active' | 'suspended' | 'disabled';
export type RecordStatus = 'uploading' | 'scanning' | 'pending_verification' | 'active' | 'failed' | 'superseded' | 'soft_deleted';
export type LegalBasis = 'consent' | 'care_relationship' | 'emergency' | 'public_health' | 'self_access' | 'administration';
export type ConsentAccess = 'record_read' | 'record_write' | 'intake_write';
export type ConsentStatus = 'pending' | 'active' | 'revoked' | 'expired' | 'denied';

export interface Classified<T> {
  value: T;
  classification: DataClassification;
}

export interface Patient {
  id: string;
  status: AccountStatus;
  phone: Classified<string>;
  displayName: Classified<string>;
  dateOfBirth?: Classified<string>;
  verifiedAt?: string;
  version: number;
}

export interface WorkforceAccount {
  id: string;
  role: Exclude<Role, 'patient'>;
  status: AccountStatus;
  facilityId?: string;
  licenseVerificationStatus?: 'pending' | 'verified' | 'rejected' | 'expired';
  mfaSatisfied: boolean;
  sessionId: string;
}

export interface CareRelationship {
  id: string;
  patientId: string;
  facilityId: string;
  clinicianId: string;
  kind: 'admission' | 'referral' | 'patient_grant';
  startsAt: string;
  expiresAt?: string;
  revokedAt?: string;
}

export interface Consent {
  id: string;
  patientId: string;
  granteeId: string;
  granteeType: 'workforce' | 'facility';
  access: ConsentAccess;
  purpose: string;
  status: ConsentStatus;
  startsAt: string;
  expiresAt: string;
  revokedAt?: string;
  oneTimeUse: boolean;
  consumedAt?: string;
  version: number;
}

export interface MedicalRecord {
  id: string;
  patientId: string;
  facilityId: string;
  createdBy: string;
  status: RecordStatus;
  title: Classified<string>;
  treatmentType?: Classified<string>;
  objectKey?: Classified<string>;
  contentHash?: string;
  version: number;
  supersedesId?: string;
  createdAt: string;
  updatedAt: string;
  anchorStatus: 'not_requested' | 'pending' | 'anchored' | 'failed_retrying';
}

export interface AuditEvent {
  id: string;
  actorReferenceHash: string;
  subjectReferenceHash: string;
  action: string;
  outcome: 'allowed' | 'denied' | 'failed';
  legalBasis: LegalBasis;
  occurredAt: string;
  previousHash: string | null;
  eventHash: string;
}
