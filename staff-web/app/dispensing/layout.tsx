'use client';
import ProtectedRoute from '@/components/shared/ProtectedRoute';

export default function StaffRouteLayout({ children }: { children: React.ReactNode }) {
  return <ProtectedRoute allowedRoles={['staff']}>{children}</ProtectedRoute>;
}
