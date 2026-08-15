'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

function Icon({ d, size = 16 }: { d: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden dangerouslySetInnerHTML={{ __html: d }} />
  );
}

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const navItems = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Hospitals', href: '/hospitals' },
    { label: 'Users', href: '/users' },
    { label: 'Blockchain', href: '/blockchain' },
    { label: 'Analytics', href: '/analytics' },
    { label: 'System', href: '/system' },
  ];

  return (
    <div className="page-shell">
      <nav className="navbar">
        <Link href="/dashboard" className="brand">
          <div className="mark">M</div>
          MediChain Admin
        </Link>
        <div className="nav-pills">
          {navItems.map(item => (
            <Link
              key={item.label}
              href={item.href}
              className={`nav-pill ${pathname === item.href ? 'active' : ''}`}
            >
              {item.label}
            </Link>
          ))}
        </div>
        <div className="nav-right">
          <button className="icon-btn ghost" aria-label="Notifications">
            <Icon d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9 M13.73 21a2 2 0 0 1-3.46 0" size={20} />
            <span className="dot" />
          </button>
          <div className="nav-profile">
            <div className="avatar" style={{width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--brand-light)', color: 'var(--brand)', fontWeight: 800, fontSize: 16}}>
              A
            </div>
            <div>
              <div className="name">System Admin</div>
              <div className="role">MoHS Headquarters</div>
            </div>
          </div>
        </div>
      </nav>
      <main className="page-body">
        {children}
      </main>
    </div>
  );
}
