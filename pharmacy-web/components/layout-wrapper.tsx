import React from 'react';

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div className="page-shell">
      {children}
    </div>
  );
}
