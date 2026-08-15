'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

function Icon({ d, size = 16 }: { d: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true" dangerouslySetInnerHTML={{ __html: d }} />
  );
}
const I = {
  plus:    '<path d="M12 5v14M5 12h14" stroke-width="3"/>',
  eye:     '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/>',
  eyeOff:  '<path d="M17.9 17.9A10 10 0 0 1 2 12a10 10 0 0 1 2.5-5M9.9 4.2A10 10 0 0 1 22 12a10 10 0 0 1-4 6M1 1l22 22"/>',
  shield:  '<path d="M12 2 20 5v6c0 5-3.4 9.2-8 11-4.6-1.8-8-6-8-11V5z"/><path d="m8.5 12 2.2 2.2 4.8-5"/>',
  check:   '<path d="M20 6L9 17l-5-5"/>',
  lock:    '<rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>',
  wifi:    '<path d="M5 12.5a9.9 9.9 0 0 1 14 0"/><path d="M8.5 16a5 5 0 0 1 7 0"/><circle cx="12" cy="19" r="1"/>',
};

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    if (!email.trim() || !password) { setError('Email and password are required.'); return; }
    setLoading(true);
    try {
      const result = await login({ username: email.trim(), password });
      if (!result.success) {
        setError(result.error || 'Sign in failed. Check your credentials and try again.');
      } else {
        router.push('/dashboard');
      }
    } catch (err: any) {
      setError(err?.message || 'Sign in failed. Check your credentials and try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', fontFamily: 'var(--font-body)' }}>

      {/* Left panel — brand */}
      <div style={{
        width: '50%',
        background: 'linear-gradient(145deg, var(--brand-900) 0%, var(--brand) 100%)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '40px 48px',
        color: '#fff',
      }}
        className="login-brand-panel"
      >
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 38, height: 38, borderRadius: 11, background: 'rgba(255,255,255,.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Icon d={I.plus} size={22} />
          </div>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 20 }}>MediChain SL</span>
        </div>

        {/* Center message */}
        <div>
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 40,
            fontWeight: 800,
            letterSpacing: '-0.02em',
            lineHeight: 1.2,
            marginBottom: 20,
          }}>
            Doctor Portal
          </h1>
          <p style={{ fontSize: 17, opacity: .8, lineHeight: 1.6, maxWidth: 380, marginBottom: 32 }}>
            Blockchain-secured patient records for Sierra Leone. Access patient histories, upload clinical reports, and collaborate securely.
          </p>

          {/* Feature list */}
          {[
            'Patient records secured on Hyperledger Fabric',
            'AI-assisted clinical report generation',
            'Offline-first with automatic sync',
            'Ministry of Health integrated reporting',
          ].map(feat => (
            <div key={feat} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
              <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'rgba(255,255,255,.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon d={I.check} size={12} />
              </div>
              <span style={{ fontSize: 14, opacity: .85 }}>{feat}</span>
            </div>
          ))}
        </div>

        {/* Bottom trust badge */}
        <div style={{
          background: 'rgba(255,255,255,.1)',
          borderRadius: 16,
          padding: '16px 18px',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
        }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(255,255,255,.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Icon d={I.shield} size={20} />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 14 }}>Protected by Hyperledger Fabric</div>
            <div style={{ fontSize: 12, opacity: .7, marginTop: 2 }}>All records immutably anchored on the national blockchain.</div>
          </div>
        </div>
      </div>

      {/* Right panel — form */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--canvas)',
        padding: '40px 24px',
      }}>
        <div style={{ width: '100%', maxWidth: 440 }}>

          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: 36 }}>
            <div style={{
              width: 52, height: 52, borderRadius: 16, background: 'var(--brand-light)',
              color: 'var(--brand)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 16px', fontSize: 28, fontWeight: 800,
            }}>
              <Icon d={I.plus} size={26} />
            </div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 6 }}>
              Welcome back
            </h2>
            <p style={{ color: 'var(--gray-500)', fontSize: 14 }}>Sign in to MediChain SL Doctor Portal</p>
          </div>

          {/* Error notice */}
          {error && (
            <div className="mc-notice danger" role="alert" style={{ marginBottom: 20 }}>
              <Icon d={I.shield} size={16} />
              <div>
                <strong>Sign in failed</strong>
                <p>{error}</p>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} noValidate>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 13.5, fontWeight: 600, color: 'var(--ink-700)', marginBottom: 8 }} htmlFor="email">
                Email address
              </label>
              <input
                id="email"
                type="email"
                className="portal-field"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="doctor@connaught.sl"
                autoComplete="email"
                required
                disabled={loading}
              />
            </div>

            <div style={{ marginBottom: 24, position: 'relative' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <label style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--ink-700)' }} htmlFor="password">
                  Password
                </label>
                <a href="/auth/reset-password" style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--brand)' }}>
                  Forgot password?
                </a>
              </div>
              <div style={{ position: 'relative' }}>
                <input
                  id="password"
                  type={showPwd ? 'text' : 'password'}
                  className="portal-field"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Your password"
                  autoComplete="current-password"
                  required
                  disabled={loading}
                  style={{ paddingRight: 48 }}
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(v => !v)}
                  style={{
                    position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
                    border: 'none', background: 'none', color: 'var(--gray-500)', cursor: 'pointer',
                    padding: 4, display: 'flex', alignItems: 'center',
                  }}
                  aria-label={showPwd ? 'Hide password' : 'Show password'}
                >
                  <Icon d={showPwd ? I.eyeOff : I.eye} size={18} />
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-full"
              disabled={loading}
              style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}
            >
              {loading ? (
                <>
                  <span style={{
                    width: 16, height: 16, borderRadius: '50%',
                    border: '2px solid rgba(255,255,255,.3)',
                    borderTopColor: '#fff',
                    display: 'inline-block',
                    animation: 'spin .7s linear infinite',
                  }} />
                  Signing in…
                </>
              ) : (
                <>
                  <Icon d={I.lock} size={16} />
                  Sign In
                </>
              )}
            </button>
          </form>

          {/* Offline warning */}
          <div style={{ marginTop: 20, display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center', color: 'var(--green-600)', fontSize: 12.5, fontWeight: 600 }}>
            <Icon d={I.wifi} size={14} />
            Requires network connection. Offline access available after first login.
          </div>

        </div>
      </div>

      {/* Responsive */}
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 768px) {
          .login-brand-panel { display: none !important; }
        }
      `}</style>
    </div>
  );
}
