'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { enrollDoctor, logoutDoctor, getSession, type LoginCredentials } from '@/services/auth';
import type { AuthUser } from '@/types';

const PUBLIC_ROUTES = ['/login', '/public'];

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const checkSession = async () => {
      const isPublicRoute = PUBLIC_ROUTES.some(r => pathname.startsWith(r));
      if (isPublicRoute) { setLoading(false); return; }

      const session = await getSession();
      if (session) {
        setUser(session as AuthUser);
      } else if (!isPublicRoute) {
        router.push('/login');
      }
      setLoading(false);
    };
    checkSession();
  }, [pathname, router]);

  const login = useCallback(async (credentials: LoginCredentials) => {
    const result = await enrollDoctor(credentials);
    if (result.success && result.doctor) {
      setUser(result.doctor as AuthUser);
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('mc_user', JSON.stringify(result.doctor));
      }
      router.push('/dashboard');
      return { success: true };
    }
    return { success: false, error: result.error };
  }, [router]);

  const logout = useCallback(async () => {
    await logoutDoctor();
    setUser(null);
    router.push('/login');
  }, [router]);

  return { user, loading, login, logout };
}
