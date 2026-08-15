import type {
  AccessRequest,
  AnalyticsDataPoint,
  Appointment,
  AuthUser,
  BlockchainStatus,
  DepartmentStat,
  DrugInteractionAlert,
  MedicalRecord,
  Notification,
  Patient,
} from '@/types';

/**
 * Honest initial values for screens whose live service is not connected yet.
 * These values intentionally contain no people, clinical facts, or fabricated
 * infrastructure status.
 */
export const EMPTY_PATIENTS: Patient[] = [];
export const EMPTY_APPOINTMENTS: Appointment[] = [];
export const EMPTY_RECORDS: MedicalRecord[] = [];
export const EMPTY_ACCESS_REQUESTS: AccessRequest[] = [];
export const EMPTY_NOTIFICATIONS: Notification[] = [];
export const EMPTY_ANALYTICS: AnalyticsDataPoint[] = [];
export const EMPTY_DEPARTMENT_STATS: DepartmentStat[] = [];
export const EMPTY_DRUG_ALERTS: DrugInteractionAlert[] = [];

export const UNAVAILABLE_NETWORK_STATUS: BlockchainStatus = {
  connected: false,
  pendingTx: 0,
  totalRecords: 0,
};

export const SESSION_USER_PLACEHOLDER: AuthUser = {
  id: '',
  name: 'Signed-in user',
  email: '',
  role: 'doctor',
  isEnrolled: false,
};

export interface RegionalStat {
  region: string;
  patients: number;
  facilities: number;
  doctors: number;
  drugScore: number;
}

export interface DrugDistributionItem {
  drug: string;
  hospital: string;
  qty: number;
  date: string;
  region: string;
  status: string;
  txId?: string;
  blockNumber?: number;
}

export interface DiseaseStat {
  disease: string;
  cases: number;
  change: number;
  trend: 'up' | 'down';
}

export interface PrescriptionItem {
  id: string;
  drug: string;
  dosage: string;
  qty: number;
  issuedBy: string;
  issuedAt: string;
  status: string;
  fabricTxId?: string;
  fabricBlock?: number;
}

export interface DrugInventoryItem {
  name: string;
  category: string;
  inStock: number;
  threshold: number;
  lastRestocked: string;
  supplier: string;
  status: string;
}

export interface SystemUserItem {
  id: string;
  name: string;
  email: string;
  role: AuthUser['role'];
  hospital: string;
  status: string;
  registeredAt: string;
  fabricIdentity: string;
  fabricOrg: string;
  enrolledAt: string;
}

export interface AuditLogItem {
  timestamp: string;
  user: string;
  role: string;
  action: string;
  resource: string;
  ip: string;
  status: string;
  fabricTxId?: string;
  fabricBlock?: number;
  channel?: string;
}

export interface SystemHealthItem {
  service: string;
  status: string;
  uptime: number;
  lastChecked: string;
}

export const EMPTY_REGIONAL_STATS: RegionalStat[] = [];
export const EMPTY_DRUG_DISTRIBUTION: DrugDistributionItem[] = [];
export const EMPTY_DISEASE_STATS: DiseaseStat[] = [];
export const EMPTY_PRESCRIPTIONS: PrescriptionItem[] = [];
export const EMPTY_DRUG_INVENTORY: DrugInventoryItem[] = [];
export const EMPTY_SYSTEM_USERS: SystemUserItem[] = [];
export const EMPTY_AUDIT_LOG: AuditLogItem[] = [];
export const EMPTY_SYSTEM_HEALTH: SystemHealthItem[] = [];
