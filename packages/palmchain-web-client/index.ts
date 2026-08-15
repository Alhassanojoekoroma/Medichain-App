export interface LoginCredentials { username: string; password: string }
export interface PortalUser { id: string; name: string; email: string; role: string; hospitalAffiliation?: string; licenseNumber?: string; fabricId?: string }
export interface EnrollmentResponse { success: boolean; doctor?: PortalUser; error?: string }

export async function enrollDoctor(credentials: LoginCredentials): Promise<EnrollmentResponse> {
  try {
    const response = await fetch('/api/session/login', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: credentials.username.trim(), password: credentials.password }),
    });
    const body = await response.json();
    if (!response.ok) return { success: false, error: body.error?.message || body.error || 'Authentication failed' };
    return { success: true, doctor: body.user };
  } catch {
    return { success: false, error: 'The identity service is unavailable.' };
  }
}

export async function getSession(): Promise<PortalUser | null> {
  const response = await fetch('/api/session/current', { cache: 'no-store' });
  if (!response.ok) return null;
  const body = await response.json();
  return body.user ?? null;
}

export async function logoutDoctor(): Promise<void> {
  await fetch('/api/session/logout', { method: 'POST' });
}

export { SessionExpiryGuard } from './session';
