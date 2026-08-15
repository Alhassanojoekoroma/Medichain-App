"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="navbar">
      <Link href="/dashboard" className="brand">
        <div className="mark">SL</div>
        Ministry of Health
      </Link>
      
      <div className="nav-pills">
        <Link href="/dashboard" className={`nav-pill ${pathname === '/dashboard' ? 'active' : ''}`}>Dashboard</Link>
        <Link href="/districts" className={`nav-pill ${pathname === '/districts' ? 'active' : ''}`}>Districts</Link>
        <Link href="/reports" className={`nav-pill ${pathname === '/reports' ? 'active' : ''}`}>Reports</Link>
        <Link href="/facilities" className={`nav-pill ${pathname === '/facilities' ? 'active' : ''}`}>Facilities</Link>
        <Link href="/settings" className={`nav-pill ${pathname === '/settings' ? 'active' : ''}`}>Settings</Link>
      </div>

      <div className="nav-right">
        <div className="nav-profile">
          <div className="avatar" style={{width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--brand-light)', color: 'var(--brand)', fontWeight: 700}}>MH</div>
          <div>
            <div className="name">MoH Official</div>
            <div className="role">National View</div>
          </div>
        </div>
      </div>
    </nav>
  );
}
