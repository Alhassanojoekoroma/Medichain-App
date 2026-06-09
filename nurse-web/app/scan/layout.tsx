'use client';
import ProtectedRoute from '@/components/shared/ProtectedRoute';

export default function NurseRouteLayout({ children }: { children: React.ReactNode }) {
  return <ProtectedRoute allowedRoles={['nurse']}>{children}</ProtectedRoute>;
}
