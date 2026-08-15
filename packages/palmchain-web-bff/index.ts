import { NextRequest, NextResponse } from 'next/server';

const backend = () => (process.env.BACKEND_INTERNAL_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000').replace(/\/$/, '');

function cookieName(): string {
  return process.env.NODE_ENV === 'production' ? '__Host-palmchain_session' : 'palmchain_session';
}

function cookieOptions() {
  return { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict' as const, path: '/', maxAge: 15 * 60 };
}

function noStore(response: NextResponse): NextResponse {
  response.headers.set('Cache-Control', 'no-store, max-age=0');
  response.headers.set('Pragma', 'no-cache');
  return response;
}

function sameOrigin(request: NextRequest): boolean {
  const origin = request.headers.get('origin');
  const fetchSite = request.headers.get('sec-fetch-site');
  if (fetchSite && !['same-origin', 'none'].includes(fetchSite)) return false;
  return !origin || origin === request.nextUrl.origin;
}

export async function login(request: NextRequest, allowedRoles: string[]): Promise<NextResponse> {
  if (!sameOrigin(request)) return noStore(NextResponse.json({ error: { code: 'CSRF_REJECTED', message: 'Cross-origin request rejected' } }, { status: 403 }));
  if (!request.headers.get('content-type')?.toLowerCase().startsWith('application/json')) {
    return noStore(NextResponse.json({ error: { code: 'CONTENT_TYPE_REQUIRED', message: 'JSON request required' } }, { status: 415 }));
  }
  const input = await request.json().catch(() => null);
  if (typeof input?.email !== 'string' || input.email.length > 254 || typeof input?.password !== 'string' || input.password.length < 1 || input.password.length > 1024) {
    return noStore(NextResponse.json({ error: { code: 'VALIDATION_ERROR', message: 'Credentials required' } }, { status: 400 }));
  }
  let upstream: Response;
  try {
    upstream = await fetch(`${backend()}/api/auth/doctor/login`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: input.email.trim(), password: input.password }), cache: 'no-store',
    });
  } catch {
    return noStore(NextResponse.json({ error: { code: 'IDENTITY_SERVICE_UNAVAILABLE', message: 'The identity service is unavailable' } }, { status: 503 }));
  }
  const body = await upstream.json().catch(() => ({}));
  if (!upstream.ok) return noStore(NextResponse.json({ error: { code: body.code || 'AUTHENTICATION_FAILED', message: 'Authentication failed' } }, { status: upstream.status }));
  if (!allowedRoles.includes(body.role)) return noStore(NextResponse.json({ error: { code: 'PORTAL_ROLE_MISMATCH', message: 'Use the portal assigned to your role' } }, { status: 403 }));
  const response = NextResponse.json({ user: { id: body.doctorId, name: body.fullName, email: input.email, role: body.role } });
  response.cookies.set(cookieName(), body.token, cookieOptions());
  return noStore(response);
}

export async function current(request: NextRequest): Promise<NextResponse> {
  const token = request.cookies.get(cookieName())?.value;
  if (!token) return noStore(NextResponse.json({ error: { code: 'AUTHENTICATION_REQUIRED' } }, { status: 401 }));
  let upstream: Response;
  try {
    upstream = await fetch(`${backend()}/api/platform/sessions/current`, { headers: { Authorization: `Bearer ${token}` }, cache: 'no-store' });
  } catch {
    return noStore(NextResponse.json({ error: { code: 'IDENTITY_SERVICE_UNAVAILABLE' } }, { status: 503 }));
  }
  if (!upstream.ok) {
    const response = NextResponse.json({ error: { code: 'SESSION_INVALID' } }, { status: 401 });
    response.cookies.set(cookieName(), '', { ...cookieOptions(), maxAge: 0 });
    return noStore(response);
  }
  const body = await upstream.json();
  return noStore(NextResponse.json({ user: { id: body.actor.id, name: body.actor.fullName, role: body.actor.role }, session: body.session }));
}

export async function renewSandbox(request: NextRequest): Promise<NextResponse> {
  if (!sameOrigin(request)) return noStore(NextResponse.json({ error: { code: 'CSRF_REJECTED' } }, { status: 403 }));
  const token = request.cookies.get(cookieName())?.value;
  if (!token) return noStore(NextResponse.json({ error: { code: 'AUTHENTICATION_REQUIRED' } }, { status: 401 }));
  let upstream: Response;
  try {
    upstream = await fetch(`${backend()}/api/platform/sessions/renew-sandbox`, {
      method: 'POST', headers: { Authorization: `Bearer ${token}`, 'X-PalmChain-Activity': 'foreground' }, cache: 'no-store',
    });
  } catch {
    return noStore(NextResponse.json({ error: { code: 'IDENTITY_SERVICE_UNAVAILABLE' } }, { status: 503 }));
  }
  const body = await upstream.json().catch(() => ({}));
  if (!upstream.ok || typeof body.token !== 'string') {
    const response = NextResponse.json({ error: { code: body.error?.code || 'SESSION_RENEWAL_FAILED' } }, { status: upstream.status });
    if (upstream.status === 401) response.cookies.set(cookieName(), '', { ...cookieOptions(), maxAge: 0 });
    return noStore(response);
  }
  const response = NextResponse.json({ session: body.session });
  response.cookies.set(cookieName(), body.token, cookieOptions());
  return noStore(response);
}

export async function logout(request: NextRequest): Promise<NextResponse> {
  if (!sameOrigin(request)) return noStore(NextResponse.json({ error: { code: 'CSRF_REJECTED' } }, { status: 403 }));
  const token = request.cookies.get(cookieName())?.value;
  if (token) await fetch(`${backend()}/api/platform/sessions/logout`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } }).catch(() => undefined);
  const response = new NextResponse(null, { status: 204 });
  response.cookies.set(cookieName(), '', { ...cookieOptions(), maxAge: 0 });
  return noStore(response);
}

export async function proxy(request: NextRequest, segments: string[], allowedPrefixes: string[]): Promise<NextResponse> {
  const path = segments.join('/');
  if (!allowedPrefixes.some(prefix => path === prefix || path.startsWith(`${prefix}/`))) return NextResponse.json({ error: { code: 'PORTAL_CAPABILITY_DENIED' } }, { status: 403 });
  if (!['GET', 'HEAD'].includes(request.method) && !sameOrigin(request)) return NextResponse.json({ error: { code: 'CSRF_REJECTED' } }, { status: 403 });
  const token = request.cookies.get(cookieName())?.value;
  if (!token) return NextResponse.json({ error: { code: 'AUTHENTICATION_REQUIRED' } }, { status: 401 });
  const url = `${backend()}/api/${path}${request.nextUrl.search}`;
  const body = ['GET', 'HEAD'].includes(request.method) ? undefined : await request.text();
  const upstream = await fetch(url, {
    method: request.method,
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': request.headers.get('content-type') || 'application/json', 'X-Correlation-ID': request.headers.get('x-correlation-id') || crypto.randomUUID(), 'X-PalmChain-Activity': request.headers.get('x-palmchain-activity') === 'foreground' ? 'foreground' : 'background', ...(request.headers.get('idempotency-key') ? { 'Idempotency-Key': request.headers.get('idempotency-key')! } : {}) },
    body, cache: 'no-store', redirect: 'manual',
  });
  return new NextResponse(await upstream.arrayBuffer(), { status: upstream.status, headers: { 'Content-Type': upstream.headers.get('content-type') || 'application/json', 'X-Correlation-ID': upstream.headers.get('x-correlation-id') || '' } });
}
