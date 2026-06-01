/**
 * src/services/qrService.ts
 * Patient Mobile App API client for QR operations.
 */
import { AuthService } from './authService';
import { QRPayload } from '../../backend/src/services/TokenService'; // Just for type definition in this MVP structure

// In a real app, define the env var, e.g., process.env.API_URL
const API_BASE_URL = 'http://10.0.2.2:3001/api'; // Android Emulator default

export class QRServiceClient {
  private static async getAuthHeaders() {
    const token = await AuthService.getToken();
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    };
  }

  /**
   * Generate a Normal QR code for sharing with a doctor
   */
  static async generateNormalQR(ttlSeconds: number = 3600, isOneTime: boolean = true) {
    const response = await fetch(`${API_BASE_URL}/qr/generate`, {
      method: 'POST',
      headers: await this.getAuthHeaders(),
      body: JSON.stringify({ ttlSeconds, isOneTime }),
    });

    if (!response.ok) {
      throw new Error('Failed to generate QR code');
    }
    return response.json();
  }

  /**
   * Generate an Emergency Bracelet QR code
   */
  static async generateEmergencyQR() {
    const response = await fetch(`${API_BASE_URL}/qr/emergency`, {
      method: 'POST',
      headers: await this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to generate emergency QR code');
    }
    return response.json();
  }

  /**
   * List my active QR tokens
   */
  static async getActiveTokens() {
    const response = await fetch(`${API_BASE_URL}/qr/mine`, {
      method: 'GET',
      headers: await this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch active tokens');
    }
    return response.json();
  }

  /**
   * Revoke a specific QR token
   */
  static async revokeToken(tokenId: string) {
    const response = await fetch(`${API_BASE_URL}/qr/token/${tokenId}`, {
      method: 'DELETE',
      headers: await this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to revoke token');
    }
    return response.json();
  }
}
