'use client';
import ProtectedRoute from '@/components/shared/ProtectedRoute';

export default function AdminRouteLayout({ children }: { children: React.ReactNode }) {
  return <ProtectedRoute allowedRoles={['admin']}>{children}</ProtectedRoute>;
}
