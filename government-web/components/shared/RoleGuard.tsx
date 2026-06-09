// doctor-web/components/shared/RoleGuard.tsx
// Use this to SHOW or HIDE individual UI elements based on role.
// Example: <RoleGuard roles={['doctor', 'admin']}><UploadButton /></RoleGuard>

import { useAuth } from '../../hooks/useAuth';
import { UserRole } from '../../types';

interface Props {
  roles: UserRole[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export default function RoleGuard({ roles, children, fallback = null }: Props) {
  const { role } = useAuth();
  if (!role || !roles.includes(role)) return <>{fallback}</>;
  return <>{children}</>;
}
