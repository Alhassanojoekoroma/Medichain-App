import { cookies } from 'next/headers';
import { cache } from 'react';

export interface ClinicalSession {
  actor: { id: string; role: 'doctor' | 'nurse'; facilityId?: string; fullName?: string; mfa: boolean };
}

export type BackendResult<T> =
  | { ok: true; data: T }
  | { ok: false; code: 'SIGNED_OUT' | 'FORBIDDEN' | 'UNAVAILABLE' };

function apiBase(): string {
  const value = process.env.CLINICAL_API_URL;
  if (!value) throw new Error('CLINICAL_API_URL_NOT_CONFIGURED');
  return value.replace(/\/$/, '');
}

async function safeJson<T>(response: Response): Promise<T | null> {
  const text = await response.text();
  if (!text) return null;
  try { return JSON.parse(text) as T; } catch { return null; }
}

async function backendRequest<T>(path: string, init?: RequestInit, acceptedStatuses: number[] = []): Promise<BackendResult<T>> {
  const store = await cookies();
  const token = store.get('__Host-medichain_session')?.value;
  if (!token) return { ok: false, code: 'SIGNED_OUT' };
  try {
    const response = await fetch(`${apiBase()}${path}`, {
      ...init,
      headers: { 'content-type': 'application/json', authorization: `Bearer ${token}`, ...init?.headers },
      cache: 'no-store',
    });
    if (response.status === 401) return { ok: false, code: 'SIGNED_OUT' };
    if (response.status === 403) return { ok: false, code: 'FORBIDDEN' };
    if (!response.ok && !acceptedStatuses.includes(response.status)) return { ok: false, code: 'UNAVAILABLE' };
    const data = await safeJson<T>(response);
    return data === null ? { ok: false, code: 'UNAVAILABLE' } : { ok: true, data };
  } catch {
    return { ok: false, code: 'UNAVAILABLE' };
  }
}

export async function backendGet<T>(path: string): Promise<BackendResult<T>> {
  return backendRequest<T>(path);
}

export async function backendPost<T>(path: string, body: unknown, acceptedStatuses: number[] = []): Promise<BackendResult<T>> {
  return backendRequest<T>(path, { method: 'POST', body: JSON.stringify(body) }, acceptedStatuses);
}

export const clinicalSession = cache(async (): Promise<ClinicalSession | null> => {
  const result = await backendGet<ClinicalSession>('/api/platform/sessions/current');
  if (!result.ok || !['doctor', 'nurse'].includes(result.data.actor.role) || !result.data.actor.mfa) return null;
  return result.data;
});
