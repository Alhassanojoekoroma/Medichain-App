// doctor-web/components/shared/ProtectedRoute.tsx

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, redirectByRole } from '../../hooks/useAuth';
import { UserRole } from '../../types';

interface Props {
  allowedRoles: UserRole[];
  children: React.ReactNode;
}

export default function ProtectedRoute({ allowedRoles, children }: Props) {
  const { role, isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!isAuthenticated) {
      router.replace('/login');
      return;
    }
    if (role && !allowedRoles.includes(role)) {
      redirectByRole(role, router);
    }
  }, [isAuthenticated, role, loading, allowedRoles, router]);

  if (loading || !isAuthenticated || (role && !allowedRoles.includes(role))) {
    return null;
  }
  return <>{children}</>;
}
