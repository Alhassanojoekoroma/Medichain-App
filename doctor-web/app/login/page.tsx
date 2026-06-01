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
    <div className="min-h-screen bg-[#EAEEF2] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-14 h-14 bg-brand rounded-full flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-2xl">M</span>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#101326]">MediChain SL</h1>
            <p className="text-sm text-[#8C91A8]">Doctor Web Portal</p>
          </div>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl p-8 border border-[#D8DCE8] shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="w-5 h-5 text-brand" />
            <h2 className="text-lg font-semibold text-[#101326]">Secure Sign In</h2>
          </div>
          <p className="text-sm text-[#8C91A8] mb-6">
            Authenticated via Hyperledger Fabric Certificate Authority.
            Your identity is cryptographically verified on the blockchain.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-[#101326] mb-1.5">
                Fabric Enrollment ID
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="e.g. doctor or your.email@hospital.sl"
                className="w-full border border-[#D8DCE8] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-[#101326] mb-1.5">
                Password / Enrollment Secret
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Your enrollment secret"
                  className="w-full border border-[#D8DCE8] rounded-xl px-4 py-2.5 pr-11 text-sm focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8C91A8] hover:text-[#5D6582]"
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
              className="w-full bg-brand hover:bg-brand-dark disabled:opacity-60 text-white rounded-xl py-2.5 font-semibold text-sm flex items-center justify-center gap-2 transition-colors"
            >
              {loading ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Enrolling with Fabric CA...</>
              ) : (
                <><Lock className="w-4 h-4" /> Sign In Securely</>
              )}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-[#D8DCE8]">
            <div className="bg-brand-light rounded-xl p-3">
              <p className="text-xs text-[#5D6582] text-center font-medium mb-1">🔐 Development Credentials</p>
              <p className="text-xs text-[#8C91A8] text-center">
                Username: <strong className="text-brand">doctor</strong> &nbsp;|&nbsp;
                Password: <strong className="text-brand">medichain2026</strong>
              </p>
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-[#8C91A8] mt-6">
          MediChain SL — Your Records. Your Control.<br />
          Built for Sierra Leone. Designed for the World.
        </p>
      </div>
    </div>
  );
}
