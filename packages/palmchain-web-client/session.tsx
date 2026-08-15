'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';

interface SessionWindow {
  expiresAt: string;
  idleExpiresAt: string;
  absoluteExpiresAt: string;
}

const WARNING_SECONDS = 60;
const RENEWAL_LEAD_SECONDS = 120;
const READING_GRACE_MS = 10 * 60 * 1000;

function deadline(session: SessionWindow): number {
  return Math.min(...[session.expiresAt, session.idleExpiresAt, session.absoluteExpiresAt].map(value => Date.parse(value)));
}

export function SessionExpiryGuard(): React.JSX.Element | null {
  const [session, setSession] = useState<SessionWindow | null>(null);
  const [secondsRemaining, setSecondsRemaining] = useState<number | null>(null);
  const [renewing, setRenewing] = useState(false);
  const lastMeaningfulActivity = useRef(Date.now());
  const renewInFlight = useRef(false);
  const attemptedDeadline = useRef<number | null>(null);
  const expiryHandled = useRef(false);
  const stayButton = useRef<HTMLButtonElement>(null);

  const isPublicPage = useCallback(() => /^\/(login|public)(\/|$)/.test(window.location.pathname), []);
  const recordActivity = useCallback(() => {
    if (document.visibilityState === 'visible' && document.hasFocus()) lastMeaningfulActivity.current = Date.now();
  }, []);

  const loadSession = useCallback(async () => {
    if (isPublicPage()) return;
    try {
      const response = await fetch('/api/session/current', { cache: 'no-store' });
      if (response.status === 401) {
        setSession(null);
        return;
      }
      if (!response.ok) return;
      const body = await response.json();
      if (body.session?.expiresAt && body.session?.idleExpiresAt && body.session?.absoluteExpiresAt) {
        setSession(body.session);
        expiryHandled.current = false;
      }
    } catch {
      // A transient outage must not extend or erase the server-authoritative deadline.
    }
  }, [isPublicPage]);

  const signOutExpired = useCallback(async () => {
    if (expiryHandled.current) return;
    expiryHandled.current = true;
    await fetch('/api/session/logout', { method: 'POST' }).catch(() => undefined);
    window.location.assign('/login?reason=session-expired');
  }, []);

  const renew = useCallback(async (sessionDeadline?: number, manual = false) => {
    if (!manual && sessionDeadline && attemptedDeadline.current === sessionDeadline) return false;
    if (renewInFlight.current) return false;
    if (sessionDeadline) attemptedDeadline.current = sessionDeadline;
    renewInFlight.current = true;
    setRenewing(true);
    try {
      const response = await fetch('/api/session/renew', { method: 'POST' });
      if (!response.ok) {
        if (response.status === 401) await signOutExpired();
        return false;
      }
      recordActivity();
      await loadSession();
      attemptedDeadline.current = null;
      return true;
    } catch {
      return false;
    } finally {
      renewInFlight.current = false;
      setRenewing(false);
    }
  }, [loadSession, recordActivity, signOutExpired]);

  useEffect(() => {
    if (isPublicPage()) return;
    recordActivity();
    void loadSession();

    const actionable = 'button, a[href], input, select, textarea, [role="button"], [role="link"]';
    const onClick = (event: MouseEvent) => {
      if (event.isTrusted && event.target instanceof Element && event.target.closest(actionable)) recordActivity();
    };
    const onSubmit = (event: SubmitEvent) => { if (event.isTrusted) recordActivity(); };
    const onKeyboard = (event: KeyboardEvent) => { if (event.isTrusted) recordActivity(); };
    const onScroll = (event: Event) => { if (event.isTrusted) recordActivity(); };
    const onNavigation = () => recordActivity();
    const onVisibility = () => { if (document.visibilityState === 'visible') void loadSession(); };

    document.addEventListener('click', onClick, true);
    document.addEventListener('submit', onSubmit, true);
    document.addEventListener('keydown', onKeyboard, true);
    document.addEventListener('scroll', onScroll, true);
    window.addEventListener('popstate', onNavigation);
    document.addEventListener('visibilitychange', onVisibility);

    const nativeFetch = window.fetch.bind(window);
    window.fetch = async (...args: Parameters<typeof fetch>) => {
      let requestArgs = args;
      let applicationRequest = false;
      let foregroundRequest = false;
      try {
        const input = args[0];
        const rawUrl = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
        const url = new URL(rawUrl, window.location.href);
        applicationRequest = url.origin === window.location.origin && url.pathname.startsWith('/api/') && !url.pathname.startsWith('/api/session/');
        foregroundRequest = document.visibilityState === 'visible' && document.hasFocus();
        if (applicationRequest) {
          const init = args[1];
          const headers = new Headers(init?.headers ?? (input instanceof Request ? input.headers : undefined));
          headers.set('X-PalmChain-Activity', foregroundRequest ? 'foreground' : 'background');
          requestArgs = input instanceof Request
            ? [new Request(input, { ...init, headers })]
            : [input, { ...init, headers }];
        }
      } catch {
        // Activity classification must never alter an application request.
      }
      const response = await nativeFetch(...requestArgs);
      if (response.ok && applicationRequest && foregroundRequest) recordActivity();
      return response;
    };

    return () => {
      document.removeEventListener('click', onClick, true);
      document.removeEventListener('submit', onSubmit, true);
      document.removeEventListener('keydown', onKeyboard, true);
      document.removeEventListener('scroll', onScroll, true);
      window.removeEventListener('popstate', onNavigation);
      document.removeEventListener('visibilitychange', onVisibility);
      window.fetch = nativeFetch;
    };
  }, [isPublicPage, loadSession, recordActivity]);

  useEffect(() => {
    if (!session) return;
    const check = () => {
      const remaining = Math.max(0, Math.ceil((deadline(session) - Date.now()) / 1000));
      setSecondsRemaining(remaining);
      if (remaining === 0) {
        void signOutExpired();
        return;
      }
      const recentForegroundWork = document.visibilityState === 'visible' && document.hasFocus() &&
        Date.now() - lastMeaningfulActivity.current <= READING_GRACE_MS;
      if (remaining <= RENEWAL_LEAD_SECONDS && remaining > WARNING_SECONDS && recentForegroundWork) void renew(deadline(session));
    };
    check();
    const timer = window.setInterval(check, 1000);
    return () => window.clearInterval(timer);
  }, [renew, session, signOutExpired]);

  const warningVisible = secondsRemaining !== null && secondsRemaining > 0 && secondsRemaining <= WARNING_SECONDS;
  useEffect(() => { if (warningVisible) stayButton.current?.focus(); }, [warningVisible]);
  if (!warningVisible) return null;

  return (
    <div role="presentation" style={{ position: 'fixed', inset: 0, zIndex: 10000, display: 'grid', placeItems: 'center', background: 'rgba(15, 23, 42, 0.66)', padding: 24 }}>
      <section role="dialog" aria-modal="true" aria-labelledby="session-warning-title" aria-describedby="session-warning-description" style={{ width: 'min(100%, 440px)', borderRadius: 16, background: '#fff', color: '#0f172a', padding: 24, boxShadow: '0 24px 80px rgba(0,0,0,.35)' }}>
        <h2 id="session-warning-title" style={{ margin: '0 0 12px', fontSize: 24 }}>Your session expires in {secondsRemaining} seconds</h2>
        <p id="session-warning-description" style={{ margin: '0 0 24px', lineHeight: 1.5 }}>For your security, save any unfinished work. Stay signed in to continue, or sign out now.</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'flex-end' }}>
          <button type="button" onClick={() => void signOutExpired()} style={{ minHeight: 44, border: '1px solid #94a3b8', borderRadius: 8, background: '#fff', padding: '0 16px', fontWeight: 600 }}>Sign out now</button>
          <button ref={stayButton} type="button" disabled={renewing} onClick={() => { recordActivity(); void renew(undefined, true); }} style={{ minHeight: 44, border: 0, borderRadius: 8, background: '#0f766e', color: '#fff', padding: '0 16px', fontWeight: 700 }}>{renewing ? 'Renewing…' : 'Stay signed in'}</button>
        </div>
      </section>
    </div>
  );
}
