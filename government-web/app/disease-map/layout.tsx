'use client';
import ProtectedRoute from '@/components/shared/ProtectedRoute';

export default function GovRouteLayout({ children }: { children: React.ReactNode }) {
  return <ProtectedRoute allowedRoles={['government']}>{children}</ProtectedRoute>;
}
