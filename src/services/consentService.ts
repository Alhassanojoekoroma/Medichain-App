/**
 * src/services/consentService.ts
 * Patient Mobile App API client for Consent management.
 */
import { AuthService, BACKEND_URL } from './authService';

const API_BASE_URL = `${BACKEND_URL}/api`;

export interface ConsentRequestParams {
  granteeType: 'doctor' | 'clinic' | 'role' | 'purpose';
  granteeId: string;
  accessType?: 'read' | 'write' | 'emergency_read';
  dataCategories?: string[];
  purpose?: string;
  ttlHours?: number;
  isOneTime?: boolean;
}

export class ConsentServiceClient {
  private static async getAuthHeaders() {
    const token = await AuthService.getToken();
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    };
  }

  /**
   * Grant consent to a doctor/clinic
   */
  static async grantConsent(params: ConsentRequestParams) {
    const response = await fetch(`${API_BASE_URL}/consent`, {
      method: 'POST',
      headers: await this.getAuthHeaders(),
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      throw new Error('Failed to grant consent');
    }
    return response.json();
  }

  /**
   * List all active consents for the logged in patient
   */
  static async getMyConsents() {
    const response = await fetch(`${API_BASE_URL}/consent/mine`, {
      method: 'GET',
      headers: await this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch consents');
    }
    return response.json();
  }

  /**
   * Revoke a specific consent policy
   */
  static async revokeConsent(consentId: string, reason?: string) {
    const response = await fetch(`${API_BASE_URL}/consent/${consentId}`, {
      method: 'DELETE',
      headers: await this.getAuthHeaders(),
      body: JSON.stringify({ reason }),
    });

    if (!response.ok) {
      throw new Error('Failed to revoke consent');
    }
    return response.json();
  }

  /**
   * Revoke ALL access for a specific doctor
   */
  static async revokeDoctorAccess(doctorId: string, reason?: string) {
    const response = await fetch(`${API_BASE_URL}/consent/doctor/${doctorId}`, {
      method: 'DELETE',
      headers: await this.getAuthHeaders(),
      body: JSON.stringify({ reason }),
    });

    if (!response.ok) {
      throw new Error('Failed to revoke doctor access');
    }
    return response.json();
  }

  /**
   * Get Access Audit History
   */
  static async getAuditHistory(limit: number = 50) {
    const response = await fetch(`${API_BASE_URL}/audit/patient?limit=${limit}`, {
      method: 'GET',
      headers: await this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch audit history');
    }
    return response.json();
  }

  /**
   * Fetch treatments/medication history for the patient from backend
   */
  static async getMyTreatments(patientId: string) {
    const response = await fetch(`${API_BASE_URL}/treatments/patient/${patientId}`, {
      method: 'GET',
      headers: await this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch treatments');
    }
    return response.json();
  }
}
