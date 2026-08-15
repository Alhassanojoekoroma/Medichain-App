'use client';

import { ShieldCheck, UserRound } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export function Header() {
  const { user } = useAuth();
  return (
    <header className="flex min-h-20 items-center justify-between gap-4 py-3" aria-label="Account header">
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Secure workspace</p>
        <p className="mt-1 text-sm font-semibold text-slate-700">{user?.hospital || 'MediChain Sierra Leone'}</p>
      </div>
      <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-3 py-2">
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-700"><UserRound className="h-4 w-4" /></span>
        <span className="hidden sm:block"><span className="block text-sm font-bold text-slate-900">{user?.name || 'Signed-in user'}</span><span className="block text-xs capitalize text-slate-500">{user?.role || 'account'}</span></span>
        <ShieldCheck className="h-4 w-4 text-emerald-600" aria-label="Authenticated session" />
      </div>
    </header>
  );
}
