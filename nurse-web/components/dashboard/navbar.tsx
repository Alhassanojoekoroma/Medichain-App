'use client'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'

export default function Navbar() {
  const auth = useAuth()
  const name = auth?.user?.name || 'Fatima Koroma'
  const role = (auth?.role as string) || 'Triage Nurse'
  
  return (
    <nav className="navbar">
      <Link href="/dashboard" className="brand">
        <div className="mark">M</div>
        MediChain SL
      </Link>
      <div className="nav-pills">
        <Link href="/dashboard" className="nav-pill active">Dashboard</Link>
        <Link href="/patients" className="nav-pill">Patients</Link>
        <Link href="/schedule" className="nav-pill">Schedule</Link>
        <Link href="/alerts" className="nav-pill">Alerts</Link>
        <Link href="/team" className="nav-pill">Team</Link>
      </div>
      <div className="nav-right">
        <button className="icon-btn">
          <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" dangerouslySetInnerHTML={{__html: '<path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>'}}/>
          <span className="dot"></span>
        </button>
        <div className="nav-profile">
          <div className="avatar" style={{width: 36, height: 36, background: 'var(--brand-light)', color: 'var(--brand-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold'}}>{name.charAt(0)}</div>
          <div>
            <div className="name">{name}</div>
            <div className="role">{role}</div>
          </div>
        </div>
      </div>
    </nav>
  )
}
