'use client';
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Eye, EyeOff, Shield, Loader2, Lock } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const sandboxPasswordLogin = process.env.NODE_ENV !== 'production' && process.env.NEXT_PUBLIC_IDENTITY_MODE !== 'managed';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const result = await login({ username, password });
    if (!result.success) {
      setError(result.error || 'Login failed');
    }
    setLoading(false);
  };

  return (
    <div className="portal-center">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-14 h-14 bg-brand rounded-full flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-2xl">M</span>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[var(--ink-900)]">MediChain SL</h1>
            <p className="text-sm text-[var(--gray-500)]">Staff and Pharmacy Portal</p>
          </div>
        </div>

        {/* Card */}
        <div className="portal-card p-8 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="w-5 h-5 text-brand" />
            <h2 className="text-lg font-semibold text-[var(--ink-900)]">Secure Sign In</h2>
          </div>
          <p className="text-sm text-[var(--gray-500)] mb-6">
            {sandboxPasswordLogin
              ? 'Synthetic sandbox credentials only. Never enter a real password.'
              : 'Production sign-in is delegated to the approved managed identity provider with MFA and account recovery.'}
          </p>

          {sandboxPasswordLogin ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-[var(--ink-900)] mb-1.5">
                Fabric Enrollment ID
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="e.g. doctor or your.email@hospital.sl"
                className="portal-field text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand)]/20 focus:border-[var(--brand)]"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-[var(--ink-900)] mb-1.5">
                Password / Enrollment Secret
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Your enrollment secret"
                  className="portal-field text-sm pr-11 focus:outline-none focus:ring-2 focus:ring-[var(--brand)]/20 focus:border-[var(--brand)]"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--gray-500)] hover:text-[var(--ink-700)]"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
                {error}
              </div>
            )}

            <button
              id="login-submit"
              type="submit"
              disabled={loading}
              className="w-full portal-button btn-primary disabled:opacity-60"
            >
              {loading ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Enrolling with Fabric CA...</>
              ) : (
                <><Lock className="w-4 h-4" /> Sign In Securely</>
              )}
            </button>
          </form>
          ) : (
            <div role="alert" className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-4 text-sm text-amber-900">
              Managed identity is required but not configured for this build. PalmChain will not collect production passwords. Ask the identity administrator to complete the approved provider integration.
            </div>
          )}

        </div>

        <p className="text-center text-xs text-[var(--gray-500)] mt-6">
          MediChain SL — Your Records. Your Control.<br />
          Built for Sierra Leone. Designed for the World.
        </p>
      </div>
    </div>
  );
}
