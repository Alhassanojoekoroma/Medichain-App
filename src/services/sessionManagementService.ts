import { AuthService, BACKEND_URL } from './authService';

export interface ManagedSession {
  id: string;
  actorRole: string;
  facilityId?: string;
  mfaVerifiedAt?: string;
  lastActivityAt: string;
  expiresAt: string;
  absoluteExpiresAt: string;
  revokedAt?: string;
  current: boolean;
}

async function authorizedRequest(path: string, init: RequestInit = {}): Promise<Response> {
  const token = await AuthService.getToken();
  if (!token) throw new Error('AUTHENTICATION_REQUIRED');
  return fetch(`${BACKEND_URL}${path}`, {
    ...init,
    headers: { Authorization: `Bearer ${token}`, ...init.headers },
  });
}

export const SessionManagementService = {
  async list(): Promise<ManagedSession[]> {
    const response = await authorizedRequest('/api/platform/sessions');
    if (response.status === 401 || response.status === 403) throw new Error('SESSION_EXPIRED');
    if (!response.ok) throw new Error('SESSIONS_UNAVAILABLE');
    const body = await response.json() as { sessions?: unknown };
    if (!Array.isArray(body.sessions)) throw new Error('SESSIONS_INVALID');
    return body.sessions.filter((value): value is ManagedSession => {
      if (!value || typeof value !== 'object') return false;
      const session = value as Record<string, unknown>;
      return typeof session.id === 'string' && typeof session.actorRole === 'string' &&
        typeof session.lastActivityAt === 'string' && typeof session.expiresAt === 'string' &&
        typeof session.absoluteExpiresAt === 'string' && typeof session.current === 'boolean';
    });
  },

  async revoke(sessionId: string): Promise<void> {
    const response = await authorizedRequest(`/api/platform/sessions/${encodeURIComponent(sessionId)}`, {
      method: 'DELETE',
    });
    if (response.status === 401 || response.status === 403) throw new Error('SESSION_EXPIRED');
    if (response.status === 404) throw new Error('SESSION_NOT_FOUND');
    if (!response.ok) throw new Error('SESSION_REVOKE_FAILED');
  },
};
