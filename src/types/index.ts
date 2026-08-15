export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  bloodType: string;
  weight: string;
  height: string;
  avatar?: string;
}

export interface Medication {
  id: string;
  name: string;
  dosage: string;
  time: string;
  frequency?: string;
  status: 'pending' | 'taken' | 'skipped';
}

export interface Record {
  id: string;
  title: string;
  date: string;
  type: string;
  doctor: string;
  hospital: string;
  fileUri?: string;
  aiInsights?: string;
  hash?: string;
  notarized?: boolean;
  supersedes?: string;
  fhirResource?: any;
}

// Async Doctor Access Requests
export interface DoctorAccessRequest {
  id: string;
  doctorId: string;
  doctorName: string;
  hospital: string;
  requestedAt: string;
  status: 'pending' | 'approved' | 'denied';
}

export interface Appointment {
  id: string;
  doctorName: string;
  specialty: string;
  date: string;
  time: string;
  status: 'upcoming' | 'completed' | 'cancelled';
}

export interface BlockchainLog {
  id: string;
  action: string;
  timestamp: string;
  details: string;
  txHash: string;
}

export interface HealthMetric {
  id: string;
  type: 'Glucose' | 'Blood Pressure' | 'Heart Rate' | 'Weight';
  value: number;
  unit: string;
  date: string;
}

export interface Allergy {
  id: string;
  type: 'Drug' | 'Food' | 'Environmental' | 'Other';
  name: string;
  severity: 'Low' | 'High' | 'Critical';
  reaction: string;
}
