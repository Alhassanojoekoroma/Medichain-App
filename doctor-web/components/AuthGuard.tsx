'use client';

import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { usePathname } from 'next/navigation';
import { Loader2 } from 'lucide-react';

const PUBLIC_ROUTES = ['/login', '/public'];

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, loading } = useAuth();

  const isPublicRoute = PUBLIC_ROUTES.some((r) => pathname.startsWith(r));

  if (isPublicRoute) {
    return <>{children}</>;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--primary-50)] flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 text-[var(--ink-700)] animate-spin" />
          <span className="text-sm text-[var(--gray-500)] font-medium">Verifying session...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return <>{children}</>;
}
