const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';
const DOCTOR_TOKEN_KEY = 'mc_doctor_token';

export interface DoctorLoginResponse {
  success: boolean;
  token?: string;
  doctorId?: string;
  error?: string;
}

export interface AccessScanResponse {
  success: boolean;
  patientId?: string;
  sessionToken?: string;
  allowedCategories?: string[];
  profile?: Record<string, unknown>;
  error?: string;
}

export interface PatientBackendResponse {
  patient: {
    id: string;
    fullName: string;
    dob: string | null;
    phone: string | null;
    email: string | null;
    bloodType: string | null;
    walletAddress: string | null;
    allergies: string[];
    medications: string[];
    notes?: string | null;
  };
  records: Array<{
    id: string;
    patient_id: string;
    record_type: string;
    title: string | null;
    encrypted_cid: string | null;
    integrity_hash: string | null;
    data_categories: string[] | null;
    uploaded_by: string | null;
    created_at: string;
  }>;
}

export const getAuthToken = (): string | null => {
  return localStorage.getItem(DOCTOR_TOKEN_KEY);
};

export const setAuthToken = (token: string): void => {
  localStorage.setItem(DOCTOR_TOKEN_KEY, token);
};

export const clearAuthToken = (): void => {
  localStorage.removeItem(DOCTOR_TOKEN_KEY);
};

const buildHeaders = (token?: string) => {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  const authToken = token || getAuthToken();
  if (authToken) headers.Authorization = `Bearer ${authToken}`;
  return headers;
};

export const doctorLogin = async (email: string, password: string): Promise<DoctorLoginResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/doctor/login`, {
      method: 'POST',
      headers: buildHeaders(),
      body: JSON.stringify({ email, password }),
    });
    const data = await response.json();
    if (response.ok && data.token) {
      setAuthToken(data.token);
      return { success: true, token: data.token, doctorId: data.doctorId };
    }
    return { success: false, error: data.error || 'Login failed' };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Network error';
    return { success: false, error: message };
  }
};

export const scanQrPayload = async (payload: unknown, isEmergency = false): Promise<AccessScanResponse> => {
  try {
    const endpoint = isEmergency ? '/api/access/emergency' : '/api/access/scan';
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: buildHeaders(),
      body: JSON.stringify({ qrPayload: payload }),
    });
    const data = await response.json();
    return { success: response.ok, ...data };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Network error' };
  }
};

export const fetchPatientDetail = async (patientId: string): Promise<PatientBackendResponse | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/access/patient/${patientId}`, {
      method: 'GET',
      headers: buildHeaders(),
    });
    if (!response.ok) return null;
    const data = await response.json();
    return data;
  } catch {
    return null;
  }
};

export const listDoctorPatients = async (): Promise<PatientBackendResponse[] | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/access/patients`, {
      method: 'GET',
      headers: buildHeaders(),
    });
    if (!response.ok) return null;
    const data = await response.json();
    return data.patients || null;
  } catch {
    return null;
  }
};

/**
 * GAP 5: Access Request Workflow
 */

export interface AccessRequestResponse {
  success: boolean;
  requestId?: string;
  message?: string;
  error?: string;
}

export interface AccessRequestStatus {
  id: string;
  patientId: string;
  patientName: string;
  patientPhone: string;
  reason: string;
  status: 'pending' | 'approved' | 'denied';
  createdAt: string;
  expiresAt: string;
}

export const requestPatientAccess = async (patientId: string, reason: string): Promise<AccessRequestResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/access-requests`, {
      method: 'POST',
      headers: buildHeaders(),
      body: JSON.stringify({ patientId, reason, dataCategories: ['all'] }),
    });
    const data = await response.json();
    return { success: response.ok, ...data };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Network error' };
  }
};

export const listDoctorAccessRequests = async (): Promise<AccessRequestStatus[] | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/access-requests/doctor/my-requests`, {
      method: 'GET',
      headers: buildHeaders(),
    });
    if (!response.ok) return null;
    const data = await response.json();
    return data.requests || null;
  } catch {
    return null;
  }
};
