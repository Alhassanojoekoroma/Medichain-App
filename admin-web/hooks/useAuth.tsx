'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { enrollDoctor, logoutDoctor, getSession, type LoginCredentials } from '@/services/auth';
import { AuthUser, UserRole } from '../types';

interface AuthContextType {
  user: AuthUser | null;
  role: UserRole | null;
  setUser: (user: AuthUser | null) => void;
  loading: boolean;
  login: (credentials: LoginCredentials) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

const PUBLIC_ROUTES = ['/login', '/public'];

export function redirectByRole(role: UserRole, router: any) {
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    const protocol = window.location.protocol;
    const isLocal = hostname === 'localhost' || hostname === '127.0.0.1';

    if (isLocal) {
      const PORT_MAP: Record<UserRole, string> = {
        doctor:     '3001',
        nurse:      '3002',
        staff:      '3003',
        government: '3004',
        admin:      '3005',
      };
      const currentPort = window.location.port;
      const targetPort = PORT_MAP[role];
      if (targetPort && currentPort !== targetPort) {
        window.location.href = `${protocol}//${hostname}:${targetPort}/dashboard`;
        return;
      }
    } else {
      const parts = hostname.split('.');
      if (parts.length >= 3) {
        const subdomain = parts[0];
        const domain = parts.slice(1).join('.');
        const validRoles = ['doctor', 'nurse', 'staff', 'government', 'admin'];
        if (validRoles.includes(role) && subdomain !== role) {
          window.location.href = `${protocol}//${role}.${domain}/dashboard`;
          return;
        }
      }
    }
  }
  router.replace('/dashboard');
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const setUser = useCallback((u: AuthUser | null) => {
    setUserState(u);
  }, []);

  useEffect(() => {
    const checkSession = async () => {
      const isPublicRoute = PUBLIC_ROUTES.some(r => pathname.startsWith(r));
      if (isPublicRoute) {
        setLoading(false);
        return;
      }

      const session = await getSession();
      if (session) {
        setUserState(session as AuthUser);
        setLoading(false);
      } else {
        setUserState(null);
        setLoading(false);
        if (!isPublicRoute) {
          router.replace('/login');
        }
      }
    };
    checkSession();
  }, [pathname, router]);

  const login = useCallback(async (credentials: LoginCredentials) => {
    const result = await enrollDoctor(credentials);
    if (result.success && result.doctor) {
      const authUser = result.doctor as AuthUser;
      setUserState(authUser);
      redirectByRole(authUser.role, router);
      return { success: true };
    }
    return { success: false, error: result.error };
  }, [router]);

  const logout = useCallback(async () => {
    await logoutDoctor();
    setUserState(null);
    router.push('/login');
  }, [router]);

  return (
    <AuthContext.Provider value={{
      user,
      role: user?.role ?? null,
      setUser,
      loading,
      login,
      logout,
      isAuthenticated: !!user
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
