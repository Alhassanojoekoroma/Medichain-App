// types/index.ts

export type UserRole = 'doctor' | 'nurse' | 'staff' | 'government' | 'admin';

export interface AuthUser {
  id: string;
  name: string;
  role: UserRole;
  email: string;
  hospital?: string;
  licenseNumber?: string;
  fabricIdentity?: string;   // Fabric CA enrolment ID — NOT an Ethereum wallet address
  fabricOrg?: string;        // e.g. 'DoctorOrg', 'NurseOrg', 'PharmacyOrg'
  fabricChannel?: string;    // e.g. 'medical-records-channel'
  enrolledAt?: string;       // ISO date when user was enrolled on Fabric CA
  // Compatibility fields
  fabricId?: string;
  hospitalAffiliation?: string;
  avatar?: string;
  isEnrolled?: boolean;
}

export interface Permission {
  canViewPatients:       boolean;
  canViewPatientNames:   boolean;
  canViewRecords:        boolean;
  canUploadRecords:      boolean;
  canWritePrescriptions: boolean;
  canDispenseMeds:       boolean;
  canViewAppointments:   boolean;
  canBookAppointments:   boolean;
  canScanQR:             boolean;
  canViewDrugLogs:       boolean;
  canViewNationalStats:  boolean;
  canRegisterUsers:      boolean;
  canManageAccess:       boolean;
  canViewAuditLog:       boolean;
  canViewSystemHealth:   boolean;
  dataIsAnonymised:      boolean;
}

export type PatientStatus = 'Active' | 'Inactive' | 'Critical';
export type BloodType = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';

export interface Patient {
  id: string;
  name: string;
  initials: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  dob: string;
  phone: string;
  email?: string;
  address: string;
  bloodType: BloodType;
  condition: string;
  lastVisit: string;
  nextVisit?: string;
  status: PatientStatus;
  fabricWalletAddress?: string;
  allergies: string[];
  medications: string[];
  notes?: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  insuranceProvider?: string;
  insuranceId?: string;
  assignedDoctorId: string;
  qrPublicAccess: boolean;
  qrPublicFields: Array<'name' | 'bloodType' | 'allergies' | 'emergencyContact'>;
}

export type AppointmentType = 'In-Person' | 'Virtual';
export type AppointmentStatus = 'Upcoming' | 'In Progress' | 'Completed' | 'No-Show' | 'Cancelled';
export type AppointmentCategory = 'Consultation' | 'Follow-up' | 'Emergency' | 'Lab Review' | 'Imaging';

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  patientInitials: string;
  patientAge: number;
  patientGender: 'Male' | 'Female' | 'Other';
  date: string;
  startTime: string;
  endTime: string;
  type: AppointmentType;
  category: AppointmentCategory;
  status: AppointmentStatus;
  notes?: string;
  videoCallRoomId?: string;
}

export type RecordType = 'Lab Report' | 'Prescription' | 'X-Ray' | 'Surgery Report' | 'Consultation Note' | 'Imaging' | 'Discharge Summary' | 'Vaccination' | 'Referral Letter';
export type RecordStatus = 'Synced' | 'Pending' | 'Verifying' | 'Failed';

export interface MedicalRecord {
  id: string;
  patientId: string;
  patientName: string;
  date: string;
  type: RecordType;
  description: string;
  hash: string;
  txHash?: string;
  blockNumber?: number;
  status: RecordStatus;
  verified: boolean;
  ipfsCid?: string;
  uploadedBy: string;
  fileSize?: string;
}

export type AccessStatus = 'Approved' | 'Pending' | 'Expired' | 'Revoked';

export interface AccessRequest {
  id: string;
  patientId: string;
  patientName: string;
  patientInitials: string;
  requestedAt: string;
  expiresAt: string;
  status: AccessStatus;
  recordTypes: RecordType[];
  grantedBy?: string;
  txHash?: string;
}

export type NotificationType = 'success' | 'info' | 'warning' | 'danger';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  link?: string;
}

export interface AnalyticsDataPoint {
  month: string;
  patients: number;
  appointments: number;
  records: number;
}

export interface DepartmentStat {
  name: string;
  percentage: number;
  color: string;
  count: number;
}

export interface BlockchainStatus {
  connected: boolean;
  fabricId?: string;
  network?: string;
  balance?: string;
  lastSync?: string;
  pendingTx: number;
  totalRecords: number;
}

export interface DrugInteractionAlert {
  id: string;
  patientId: string;
  patientName: string;
  drug1: string;
  drug2: string;
  severity: 'High' | 'Medium' | 'Low';
  description: string;
}
