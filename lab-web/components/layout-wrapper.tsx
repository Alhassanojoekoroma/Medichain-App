'use client';
import { ReactNode } from 'react';

export function LayoutWrapper({ children }: { children: ReactNode }) {
  return (
    <div className="page-shell">
      {children}
    </div>
  );
}
