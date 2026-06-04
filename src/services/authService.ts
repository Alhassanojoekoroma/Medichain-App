/**
 * AuthService — Phase 5D
 *
 * Handles persistent, cryptographically-secure authentication:
 * - Tokens stored in expo-secure-store (hardware-backed keychain)
 * - Session validation on app launch
 * - Simulated JWT flow that is ready to plug in a real backend endpoint
 */

import * as SecureStore from 'expo-secure-store';
import { useStore } from '../store/useStore';
import { atob, btoa } from '../utils/base64';

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

// ─── Demo credentials (replace with real backend call) ───────────────────────
const DEMO_CREDENTIALS = {
  email: 'patient@medichain.sl',
  password: 'password123',
  userId: '1',
};

// ─── JWT-like token generation (replace with real JWT from server) ─────────
function generateSessionToken(userId: string, email: string): string {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = btoa(JSON.stringify({
    sub: userId,
    email,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7, // 7 days
  }));
  // In production this signature would be provided by the server
  const signature = btoa(`medichain_${userId}_${Date.now()}`);
  return `${header}.${payload}.${signature}`;
}

// ─── Detect backend API URL ───────────────────────────────────────────────────
// On Android Emulator, localhost resolves to the host machine as 10.0.2.2
// In Expo Go, EXPO_PUBLIC_API_URL can be set in .env.mobile
export const BACKEND_URL = (() => {
  // Check for explicit override first
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }
  return 'http://localhost:5000'; // Works for iOS simulator & web browser
})();

export const AuthService = {
  /**
   * Login — calls the real MediChain backend API with a graceful demo fallback.
   * On connection failure, falls back to demo credential validation so the app
   * works even when the backend is not running.
   */
  login: async (email: string, password: string): Promise<AuthSession> => {
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
        const data = await response.json(); // { success, token, patientId }
        const sessionToken = data.token;
        const userId = data.patientId || normalizedEmail;

        // Persist to hardware-backed keychain
        await Promise.all([
          SecureStore.setItemAsync(KEYS.SESSION_TOKEN, sessionToken),
          SecureStore.setItemAsync(KEYS.USER_ID, String(userId)),
          SecureStore.setItemAsync(KEYS.USER_EMAIL, normalizedEmail),
        ]);

        // Parse expiry from JWT payload
        let expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000;
        try {
          const parts = sessionToken.split('.');
          if (parts.length === 3) {
            const payload = JSON.parse(atob(parts[1]));
            if (payload.exp) expiresAt = payload.exp * 1000;
          }
        } catch {
          // ignore parse errors
        }

        const patientData = data.patient || {};
        return {
          userId: String(userId),
          email: normalizedEmail,
          sessionToken,
          expiresAt,
          fullName: patientData.fullName,
          phone: patientData.phone,
          bloodType: patientData.bloodType,
        };
      }

      // Backend returned an error (e.g. 401 Invalid credentials)
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error || `Login failed (HTTP ${response.status})`);

    } catch (err: any) {
      clearTimeout(timeoutId);
      // Network error — fall back to offline demo mode
      if (err.name === 'AbortError' || err.message?.includes('fetch') || err.message?.includes('Network')) {
        console.warn('[AuthService] Backend unreachable, using offline demo mode');

        // ── 2. Offline demo fallback ───────────────────────────────────────────
        if (
          normalizedEmail !== DEMO_CREDENTIALS.email ||
          password !== DEMO_CREDENTIALS.password
        ) {
          throw new Error('Invalid email or password. Please check your credentials.');
        }

        await new Promise((r) => setTimeout(r, 500)); // Simulate latency

        const sessionToken = generateSessionToken(DEMO_CREDENTIALS.userId, normalizedEmail);
        const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000;

        await Promise.all([
          SecureStore.setItemAsync(KEYS.SESSION_TOKEN, sessionToken),
          SecureStore.setItemAsync(KEYS.USER_ID, DEMO_CREDENTIALS.userId),
          SecureStore.setItemAsync(KEYS.USER_EMAIL, normalizedEmail),
        ]);

        return { userId: DEMO_CREDENTIALS.userId, email: normalizedEmail, sessionToken, expiresAt };
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
      const parts = token.split('.');
      if (parts.length !== 3) return null;

      const payload = JSON.parse(atob(parts[1]));
      const expMs = payload.exp * 1000;
      if (Date.now() > expMs) {
        // Token expired — clean up
        await AuthService.logout();
        return null;
      }

      return {
        userId,
        email,
        sessionToken: token,
        expiresAt: expMs,
      };
    } catch {
      return null;
    }
  },

  /**
   * Clears all session data from secure storage.
   */
  logout: async (): Promise<void> => {
    await Promise.all([
      SecureStore.deleteItemAsync(KEYS.SESSION_TOKEN),
      SecureStore.deleteItemAsync(KEYS.USER_ID),
      SecureStore.deleteItemAsync(KEYS.USER_EMAIL),
      SecureStore.deleteItemAsync(KEYS.REFRESH_TOKEN),
    ]);
  },

  /**
   * Returns the current stored token, or null.
   */
  getToken: async (): Promise<string | null> => {
    return SecureStore.getItemAsync(KEYS.SESSION_TOKEN);
  },

  /**
   * Checks if a valid (non-expired) session is stored.
   */
  hasValidSession: async (): Promise<boolean> => {
    const session = await AuthService.restoreSession();
    return session !== null;
  },
};
