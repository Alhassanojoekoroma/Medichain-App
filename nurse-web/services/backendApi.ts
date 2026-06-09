// services/backendApi.ts
/**
 * Frontend client for Medichain Backend API.
 * Communicates with Next.js or direct Node.js Express server on port 5000.
 */

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export interface BackendPatient {
  id: string;
  name: string;
  bloodType: string;
  phone: string;
  email: string;
  allergies: any[];
  dateOfBirth?: string;
}

export interface BackendPatientDetail {
  patient: {
    id: string;
    fullName: string;
    dob: string;
    phone: string;
    email: string;
    bloodType: string;
    walletAddress: string;
    allergies: any[];
    medications: any[];
    chronicConditions: any[];
  };
  records: any[];
  treatments?: any[];
  actorRole?: string;   // role of the currently logged-in user
}

function getAuthHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (typeof window !== 'undefined') {
    const token = sessionStorage.getItem('mc_token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }
  return headers;
}

/** Returns the currently logged-in user info from sessionStorage */
export function getCurrentUser(): { id?: string; role?: string; fullName?: string } | null {
  if (typeof window === 'undefined') return null;
  const userStr = sessionStorage.getItem('mc_user');
  if (!userStr) return null;
  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
}

export const backendApi = {
  getAccessiblePatients: async (): Promise<{ patients: BackendPatient[] }> => {
    const res = await fetch(`${BASE_URL}/api/access/patients`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) {
      if (res.status === 401 || res.status === 403) {
        throw { status: res.status, message: 'Unauthorized or forbidden access to patients list' };
      }
      throw new Error('Failed to fetch accessible patients list');
    }
    return res.json();
  },

  getPatientDetail: async (patientId: string): Promise<BackendPatientDetail> => {
    const res = await fetch(`${BASE_URL}/api/access/patient/${patientId}`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) {
      if (res.status === 403) {
        throw { status: 403, message: 'Forbidden: No consent to view this patient' };
      }
      throw new Error('Failed to fetch patient detail from backend');
    }
    const data = await res.json();
    
    // Adapt the backend response to match the Frontend interface expectations
    const ep = data.emergencyProfile || {};
    const patientData = {
      id: data.patient.id,
      fullName: data.patient.fullName || data.patient.full_name,
      dob: data.patient.dob || data.patient.date_of_birth,
      phone: data.patient.phone || 'N/A',
      email: data.patient.email || 'N/A',
      bloodType: data.patient.bloodType || data.patient.blood_type || 'O+',
      walletAddress: data.patient.walletAddress || data.patient.wallet_address || '',
      allergies: ep.allergies || [],
      medications: ep.medications || [],
      chronicConditions: ep.chronic_conditions || [],
    };
    
    return {
      patient: patientData,
      records: data.records || [],
      treatments: data.treatments || [],
      actorRole: data.actorRole,
    };
  },

  createPatient: async (form: any): Promise<{ success: boolean; patientId: string; accessKey: string; qrPayload: any }> => {
    const payload = {
      fullName: form.name,
      dateOfBirth: form.dob,
      bloodType: form.bloodType,
      phone: form.phone,
      email: form.email,
    };

    const res = await fetch(`${BASE_URL}/api/patients`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to create patient record.');
    }

    const data = await res.json();
    return {
      success: true,
      patientId: data.patient.id,
      accessKey: data.patient.id,
      qrPayload: data.qrPayload,
    };
  },

  requestPatientAccess: async ({ patientId, reason, categories = ['all'] }: { patientId: string; reason: string; categories?: string[] }): Promise<any> => {
    const res = await fetch(`${BASE_URL}/api/access-requests`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        patientId,
        reason,
        dataCategories: categories,
      }),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to request patient access');
    }
    return res.json();
  },

  getRecords: async (): Promise<{ records: any[] }> => {
    const res = await fetch(`${BASE_URL}/api/records`, {
      headers: getAuthHeaders(),
    });

    if (!res.ok) {
      if (res.status === 403) {
        throw { status: 403, message: 'Nurses are restricted from clinical medical records' };
      }
      throw new Error('Failed to fetch clinical medical records');
    }

    const data = await res.json();
    // Adapt records for the UI MedicalRecord shape
    const adapted = (data.records || []).map((r: any) => ({
      id: r.id,
      patientId: r.patient_id,
      patientName: r.patient_name || 'Unknown',
      type: r.record_type,
      description: r.title,
      date: new Date(r.created_at).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }),
      status: 'Synced',
      hash: r.integrity_hash,
      ipfsCid: r.encrypted_cid,
      txHash: r.ledger_tx_hash || '0x' + r.id.replace(/-/g, '').substring(0, 16),
      blockNumber: 104200,
      verified: true
    }));

    return { records: adapted };
  },

  uploadRecord: async (recordData: { patientId: string; recordType: string; title: string; description: string }): Promise<any> => {
    // Map frontend user-facing record types to backend enum: 'lab', 'prescription', 'imaging', 'note', 'referral'
    const typeMap: Record<string, string> = {
      'Lab Report': 'lab',
      'Prescription': 'prescription',
      'X-Ray': 'imaging',
      'Surgery Report': 'note',
      'Consultation Note': 'note',
      'Imaging': 'imaging',
      'Discharge Summary': 'note',
      'Vaccination': 'note',
      'Referral Letter': 'referral'
    };

    const backendType = typeMap[recordData.recordType] || 'note';

    const payload = {
      patientId: recordData.patientId,
      recordType: backendType,
      title: recordData.title,
      dataCategories: [backendType === 'prescription' ? 'prescriptions' : 'general']
    };

    const res = await fetch(`${BASE_URL}/api/records`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to upload medical record.');
    }

    const data = await res.json();
    return {
      success: true,
      record: {
        hash: data.record.integrityHash,
        ipfsCid: data.record.encryptedCid,
        txHash: data.record.ledger_tx_hash || '0x' + data.record.id.replace(/-/g, '').substring(0, 16),
        blockNumber: 104250
      }
    };
  },

  scanQR: async (qrPayload: any): Promise<{ patientId: string; allowedCategories: string[] }> => {
    const res = await fetch(`${BASE_URL}/api/access/scan`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ qrPayload }),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to resolve scanned QR code.');
    }

    return res.json();
  },

  forceSync: async (): Promise<any> => {
    const res = await fetch(`${BASE_URL}/api/audit/sync`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });

    if (!res.ok) {
      throw new Error('Failed to force sync offline ledger queue');
    }
    return res.json();
  },

  // ─── TREATMENTS ───
  getPatientTreatments: async (patientId: string): Promise<{ success: boolean; treatments: any[] }> => {
    const res = await fetch(`${BASE_URL}/api/treatments/patient/${patientId}`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) {
      throw new Error('Failed to fetch treatments for patient');
    }
    return res.json();
  },

  recordTreatment: async (treatmentData: { patientId: string; treatmentType: string; title: string; description: string }): Promise<any> => {
    const res = await fetch(`${BASE_URL}/api/treatments`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(treatmentData),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to record treatment.');
    }
    return res.json();
  },

  // ─── CONSENT ───
  grantClinicConsent: async (params: { clinicId: string; dataCategories?: string[]; ttlHours?: number; purpose?: string }): Promise<any> => {
    const res = await fetch(`${BASE_URL}/api/consent/clinic`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(params),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to grant clinic consent.');
    }
    return res.json();
  },

  grantRoleConsent: async (params: { role: string; dataCategories?: string[]; ttlHours?: number; purpose?: string }): Promise<any> => {
    const res = await fetch(`${BASE_URL}/api/consent/role`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(params),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to grant role consent.');
    }
    return res.json();
  },

  revokeConsent: async (consentId: string, reason?: string): Promise<any> => {
    const res = await fetch(`${BASE_URL}/api/consent/${consentId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
      body: JSON.stringify({ reason }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to revoke consent.');
    }
    return res.json();
  },

  getMyConsents: async (): Promise<{ consents: any[] }> => {
    const res = await fetch(`${BASE_URL}/api/consent/mine`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch your consents.');
    return res.json();
  },

  getPatientAuditHistory: async (): Promise<{ history: any[] }> => {
    const res = await fetch(`${BASE_URL}/api/audit/patient`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch access history.');
    return res.json();
  },

  getLedgerAccessLogs: async (limit = 100): Promise<{ success: boolean; logs: any[] }> => {
    const res = await fetch(`${BASE_URL}/api/audit?limit=${limit}`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch ledger activity logs.');
    return res.json();
  },

  getClinicianConsents: async (): Promise<{ success: boolean; consents: any[] }> => {
    const res = await fetch(`${BASE_URL}/api/consent`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch clinician consents.');
    return res.json();
  },

  resolveEmergencyQR: async (qrPayload: any): Promise<{ success: boolean; profile: any }> => {
    const res = await fetch(`${BASE_URL}/api/access/emergency`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ qrPayload }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to resolve emergency QR code.');
    }
    return res.json();
  },
};
