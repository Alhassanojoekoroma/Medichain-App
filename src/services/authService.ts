/**
 * AuthService — Phase 5D
 *
 * Handles persistent, cryptographically-secure authentication:
 * - Tokens stored in expo-secure-store (hardware-backed keychain)
 * - Session validation on app launch
 * - Fails closed when the identity service is unavailable
 */

import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { atob } from '../utils/base64';

// Keys used in SecureStore
const KEYS = {
  SESSION_TOKEN: 'medichain_session_token',
  USER_ID: 'medichain_user_id',
  USER_EMAIL: 'medichain_user_email',
  REFRESH_TOKEN: 'medichain_refresh_token',
} as const;

export interface AuthSession {
  userId: string;
  email: string;
  sessionToken: string;
  expiresAt: number; // Unix timestamp ms
  fullName?: string;
  phone?: string;
  bloodType?: string;
}

export interface SessionWindow {
  expiresAt: string;
  idleExpiresAt: string;
  absoluteExpiresAt: string;
}

export interface PatientRegistration {
  fullName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  bloodType: string;
}

export interface PendingPatientRegistration {
  patientId: string;
  verificationStatus: 'unverified';
  nextStep: string;
}

// ─── Detect backend API URL ───────────────────────────────────────────────────
// On Android Emulator, localhost resolves to the host machine as 10.0.2.2
// In Expo Go, EXPO_PUBLIC_API_URL can be set in .env.mobile
export const BACKEND_URL = (() => {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:5000';
  }
  return 'http://localhost:5000'; // Works for iOS simulator & web browser
})();

const IDENTITY_MODE = process.env.EXPO_PUBLIC_IDENTITY_MODE || 'managed';

function decodeJwtPayload(token: string): Record<string, unknown> {
  const parts = token.split('.');
  if (parts.length !== 3) throw new Error('SESSION_TOKEN_INVALID');
  const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=');
  return JSON.parse(atob(padded));
}

function tokenExpiry(token: string): number {
  const payload = decodeJwtPayload(token);
  if (typeof payload.exp !== 'number' || !Number.isFinite(payload.exp)) throw new Error('SESSION_EXPIRY_INVALID');
  return payload.exp * 1000;
}

async function parseJsonResponse<T = unknown>(response: Response): Promise<T | null> {
  const text = await response.text();
  if (!text) {
    return null;
  }
  try {
    return JSON.parse(text) as T;
  } catch {
    return null;
  }
}

async function parseJsonOrText(response: Response): Promise<{ json: unknown | null; text: string }> {
  const text = await response.text();
  if (!text) {
    return { json: null, text: '' };
  }
  try {
    return { json: JSON.parse(text), text };
  } catch {
    return { json: null, text };
  }
}

async function clearLocalSession(): Promise<void> {
  await Promise.all([
    SecureStore.deleteItemAsync(KEYS.SESSION_TOKEN),
    SecureStore.deleteItemAsync(KEYS.USER_ID),
    SecureStore.deleteItemAsync(KEYS.USER_EMAIL),
    SecureStore.deleteItemAsync(KEYS.REFRESH_TOKEN),
  ]);
}

export const AuthService = {
  isSandboxPasswordLoginEnabled: IDENTITY_MODE === 'sandbox',
  register: async (registration: PatientRegistration): Promise<PendingPatientRegistration> => {
    if (IDENTITY_MODE !== 'sandbox') {
      throw new Error('Managed identity registration is required before a production account can be created.');
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    try {
      const response = await fetch(`${BACKEND_URL}/api/auth/patient/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...registration,
          email: registration.email.trim().toLowerCase(),
          fullName: registration.fullName.trim(),
          phone: registration.phone.trim(),
        }),
        signal: controller.signal,
      });
      const data = await parseJsonOrText(response);
      const jsonData = data.json as Record<string, unknown> | null;
      if (!response.ok) {
        const apiError = jsonData?.error || data.text || `Account creation failed (HTTP ${response.status})`;
        throw new Error(String(apiError));
      }

      if (!jsonData || typeof jsonData.patientId !== 'string' || jsonData.verificationStatus !== 'unverified' || typeof jsonData.nextStep !== 'string') {
        throw new Error('Invalid response from the identity service during account creation.');
      }
      return {
        patientId: jsonData.patientId,
        verificationStatus: 'unverified',
        nextStep: jsonData.nextStep,
      };
    } catch (err: any) {
      if (err.name === 'AbortError' || err.message?.includes('fetch') || err.message?.includes('Network')) {
        throw new Error('Unable to reach the identity service. No account was created.');
      }
      throw err;
    } finally {
      clearTimeout(timeoutId);
    }
  },
  /**
   * Login — calls the MediChain backend API and fails closed when it cannot
   * obtain a server-issued session.
   */
  login: async (email: string, password: string): Promise<AuthSession> => {
    if (IDENTITY_MODE !== 'sandbox') {
      throw new Error('Managed identity sign-in is required. Configure the approved provider SDK; PalmChain will not collect production passwords.');
    }
    const normalizedEmail = email.trim().toLowerCase();

    // ── 1. Try real backend ────────────────────────────────────────────────────
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    try {
      const response = await fetch(`${BACKEND_URL}/api/auth/patient/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: normalizedEmail, password }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await parseJsonOrText(response);
        const jsonData = data.json as { success?: boolean; token?: string; patientId?: string; patient?: Record<string, unknown>; } | null;
        if (!jsonData || typeof jsonData.token !== 'string') {
          const bodyText = data.text || 'No response body from identity service.';
          throw new Error(`Invalid response from the identity service: ${bodyText}`);
        }
        const sessionToken = jsonData.token;
        const userId = jsonData.patientId || normalizedEmail;
        const expiresAt = tokenExpiry(sessionToken);
        if (expiresAt <= Date.now()) throw new Error('The identity service returned an expired session.');

        // Persist to hardware-backed keychain
        await Promise.all([
          SecureStore.setItemAsync(KEYS.SESSION_TOKEN, sessionToken),
          SecureStore.setItemAsync(KEYS.USER_ID, String(userId)),
          SecureStore.setItemAsync(KEYS.USER_EMAIL, normalizedEmail),
        ]);

        const patientData = (jsonData.patient as Record<string, unknown>) || {};
        return {
          userId: String(userId),
          email: normalizedEmail,
          sessionToken,
          expiresAt,
          fullName: typeof patientData.fullName === 'string' ? patientData.fullName : undefined,
          phone: typeof patientData.phone === 'string' ? patientData.phone : undefined,
          bloodType: typeof patientData.bloodType === 'string' ? patientData.bloodType : undefined,
        };
      }

      // Backend returned an error (e.g. 401 Invalid credentials)
      const errorResponse = await parseJsonOrText(response);
      const err = errorResponse.json as Record<string, unknown> | null;
      const bodyText = errorResponse.text?.trim() || '';
      const message = err?.error || (bodyText ? `Server responded with: ${bodyText}` : `Login failed (HTTP ${response.status})`);
      throw new Error(String(message));

    } catch (err: any) {
      clearTimeout(timeoutId);
      // A network failure must never create a local authenticated session.
      if (err.name === 'AbortError' || err.message?.includes('fetch') || err.message?.includes('Network')) {
        throw new Error('Unable to reach the identity service. No offline login was created.');
      }

      // Re-throw API-level errors (wrong password etc.)
      throw err;
    }
  },

  /**
   * Restores session from secure storage on app launch.
   * Returns null if no valid session exists.
   */
  restoreSession: async (): Promise<AuthSession | null> => {
    try {
      const [token, userId, email] = await Promise.all([
        SecureStore.getItemAsync(KEYS.SESSION_TOKEN),
        SecureStore.getItemAsync(KEYS.USER_ID),
        SecureStore.getItemAsync(KEYS.USER_EMAIL),
      ]);

      if (!token || !userId || !email) return null;

      // Decode the payload to check expiry
      const expMs = tokenExpiry(token);
      if (Date.now() > expMs) {
        // Token expired — clean up
        await clearLocalSession();
        return null;
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      let response: Response;
      try {
        response = await fetch(`${BACKEND_URL}/api/platform/sessions/current`, {
          headers: { Authorization: `Bearer ${token}` },
          signal: controller.signal,
        });
      } catch {
        // An outage never creates an offline authenticated session. Keep the
        // encrypted token so the user can retry after connectivity returns.
        return null;
      } finally {
        clearTimeout(timeoutId);
      }

      if (response.status === 401 || response.status === 403) {
        await clearLocalSession();
        return null;
      }
      if (!response.ok) return null;
      const current = await parseJsonResponse<{ actor?: { id?: unknown; role?: unknown; fullName?: unknown } }>(response).catch(() => null);
      if (!current?.actor || current.actor.id !== userId || current.actor.role !== 'patient') {
        await clearLocalSession();
        return null;
      }

      return {
        userId,
        email,
        sessionToken: token,
        expiresAt: expMs,
        fullName: typeof current.actor.fullName === 'string' ? current.actor.fullName : undefined,
      };
    } catch {
      return null;
    }
  },

  /**
   * Clears all session data from secure storage.
   */
  logout: async (): Promise<void> => {
    const token = await SecureStore.getItemAsync(KEYS.SESSION_TOKEN);
    if (token) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);
      try {
        await fetch(`${BACKEND_URL}/api/platform/sessions/logout`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          signal: controller.signal,
        });
      } catch {
        // Local sign-out must still complete. Provider-wide logout and refresh
        // token revocation are added through its maintained SDK.
      } finally {
        clearTimeout(timeoutId);
      }
    }
    await clearLocalSession();
  },

  /**
   * Returns the current stored token, or null.
   */
  getToken: async (): Promise<string | null> => {
    return SecureStore.getItemAsync(KEYS.SESSION_TOKEN);
  },

  getCurrentSessionWindow: async (): Promise<SessionWindow | null> => {
    const token = await SecureStore.getItemAsync(KEYS.SESSION_TOKEN);
    if (!token) return null;
    const response = await fetch(`${BACKEND_URL}/api/platform/sessions/current`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (response.status === 401 || response.status === 403) {
      await clearLocalSession();
      return null;
    }
    if (!response.ok) throw new Error('SESSION_STATUS_UNAVAILABLE');
    const body = await parseJsonResponse<{ session?: SessionWindow }>(response);
    if (!body?.session?.expiresAt || !body.session.idleExpiresAt || !body.session.absoluteExpiresAt) {
      throw new Error('SESSION_STATUS_INVALID');
    }
    return body.session as SessionWindow;
  },

  renewSandboxSession: async (): Promise<SessionWindow> => {
    if (IDENTITY_MODE !== 'sandbox') throw new Error('MANAGED_IDENTITY_REFRESH_REQUIRED');
    const token = await SecureStore.getItemAsync(KEYS.SESSION_TOKEN);
    if (!token) throw new Error('AUTHENTICATION_REQUIRED');
    const response = await fetch(`${BACKEND_URL}/api/platform/sessions/renew-sandbox`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) {
      if (response.status === 401 || response.status === 403) await clearLocalSession();
      throw new Error('SESSION_RENEWAL_FAILED');
    }
    const body = await parseJsonResponse<{ token: string }>(response);
    if (!body || typeof body.token !== 'string' || tokenExpiry(body.token) <= Date.now()) throw new Error('SESSION_RENEWAL_INVALID');
    await SecureStore.setItemAsync(KEYS.SESSION_TOKEN, body.token);
    const current = await AuthService.getCurrentSessionWindow();
    if (!current) throw new Error('SESSION_RENEWAL_INVALID');
    return current;
  },

  /**
   * Checks if a valid (non-expired) session is stored.
   */
  hasValidSession: async (): Promise<boolean> => {
    const session = await AuthService.restoreSession();
    return session !== null;
  },
};
