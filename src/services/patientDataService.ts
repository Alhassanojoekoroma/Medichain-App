import { Record as MedicalRecord, User } from '../types';
import { AuthService, BACKEND_URL } from './authService';

interface PatientProfileResponse {
  patient?: {
    id?: unknown;
    fullName?: unknown;
    email?: unknown;
    phone?: unknown;
    bloodType?: unknown;
  };
}

interface PatientRecordsResponse {
  records?: Array<{
    id?: unknown;
    title?: unknown;
    recordType?: unknown;
    createdAt?: unknown;
    doctorName?: unknown;
    hospitalName?: unknown;
    integrityHash?: unknown;
  }>;
}

export interface PatientSnapshot {
  user: User;
  records: MedicalRecord[];
}

async function authorizedJson<T>(path: string, token: string, signal: AbortSignal): Promise<T> {
  const response = await fetch(`${BACKEND_URL}${path}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'x-palmchain-activity': 'background',
    },
    signal,
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    if (response.status === 401 || response.status === 403) throw new Error('SESSION_NOT_AUTHORIZED');
    throw new Error(typeof body.error === 'string' ? body.error : `SYNC_FAILED_${response.status}`);
  }
  return body as T;
}

function requiredString(value: unknown, field: string): string {
  if (typeof value !== 'string' || value.trim() === '') throw new Error(`INVALID_PATIENT_DATA_${field}`);
  return value;
}

export const PatientDataService = {
  async fetchSnapshot(): Promise<PatientSnapshot> {
    const token = await AuthService.getToken();
    if (!token) throw new Error('AUTHENTICATION_REQUIRED');

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);
    try {
      const [profileBody, recordsBody] = await Promise.all([
        authorizedJson<PatientProfileResponse>('/api/patients/me', token, controller.signal),
        authorizedJson<PatientRecordsResponse>('/api/records/mine', token, controller.signal),
      ]);

      const profile = profileBody.patient;
      if (!profile || !Array.isArray(recordsBody.records)) throw new Error('INVALID_PATIENT_DATA');

      const user: User = {
        id: requiredString(profile.id, 'ID'),
        name: requiredString(profile.fullName, 'NAME'),
        email: typeof profile.email === 'string' ? profile.email : '',
        phone: typeof profile.phone === 'string' ? profile.phone : '',
        bloodType: typeof profile.bloodType === 'string' ? profile.bloodType : '',
        weight: '',
        height: '',
      };

      const records = recordsBody.records.map((record): MedicalRecord => ({
        id: requiredString(record.id, 'RECORD_ID'),
        title: requiredString(record.title, 'RECORD_TITLE'),
        type: requiredString(record.recordType, 'RECORD_TYPE'),
        date: requiredString(record.createdAt, 'RECORD_DATE'),
        doctor: typeof record.doctorName === 'string' && record.doctorName.trim() ? record.doctorName : 'Provider not listed',
        hospital: typeof record.hospitalName === 'string' && record.hospitalName.trim() ? record.hospitalName : 'Facility not listed',
        hash: typeof record.integrityHash === 'string' ? record.integrityHash : undefined,
      }));

      return { user, records };
    } catch (error: any) {
      if (error?.name === 'AbortError') throw new Error('SYNC_TIMEOUT');
      throw error;
    } finally {
      clearTimeout(timeoutId);
    }
  },
};
