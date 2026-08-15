'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { backendApi, type BackendPatient } from '@/services/backendApi';

/* ─── inline SVG helper ─────────────────────────────────────────────── */
function Icon({ d, size = 16 }: { d: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true" dangerouslySetInnerHTML={{ __html: d }} />
  );
}

const I = {
  plus:     '<path d="M12 5v14M5 12h14" stroke-width="3"/>',
  users:    '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8"/>',
  calendar: '<rect x="3" y="5" width="18" height="16" rx="3"/><path d="M16 3v4M8 3v4M3 10h18"/>',
  info:     '<circle cx="12" cy="12" r="9"/><path d="M12 16v-5M12 8h.01"/>',
  phone:    '<path d="M22 16.9v2a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3-8.7A2 2 0 0 1 4.1 1h2a2 2 0 0 1 2 1.7c.1.9.4 1.9.7 2.7a2 2 0 0 1-.5 2.1L7.1 8.7a16 16 0 0 0 6 6l1.2-1.2a2 2 0 0 1 2.1-.5c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.9 2.2z"/>',
  more:     '<circle cx="12" cy="5" r="1.3"/><circle cx="12" cy="12" r="1.3"/><circle cx="12" cy="19" r="1.3"/>',
  check:    '<path d="M20 6L9 17l-5-5"/>',
  x:        '<path d="M18 6L6 18M6 6l12 12"/>',
  alert:    '<path d="M12 9v4M12 17h.01"/><path d="M10.3 3.9L1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/>',
  shield:   '<path d="M12 2 20 5v6c0 5-3.4 9.2-8 11-4.6-1.8-8-6-8-11V5z"/><path d="m8.5 12 2.2 2.2 4.8-5"/>',
  wifi:     '<path d="M5 12.5a9.9 9.9 0 0 1 14 0"/><path d="M8.5 16a5 5 0 0 1 7 0"/><circle cx="12" cy="19" r="1"/>',
  search:   '<circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/>',
  chevD:    '<path d="M6 9l6 6 6-6"/>',
  download: '<path d="M12 3v12m0 0l-4.5-4.5M12 15l4.5-4.5"/><path d="M4 18v1a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-1"/>',
  chevL:    '<path d="M15 18l-6-6 6-6"/>',
  chevR:    '<path d="M9 18l6-6-6-6"/>',
};

/* ─── mock appointment data ─────────────────────────────────────────── */
const APPOINTMENTS = [
  { id: '1', name: 'Fatima Koroma',   treatment: 'Consultation',  status: 'confirmed', date: 'Aug 22', time: '09:00AM' },
  { id: '2', name: 'Ibrahim Bangura', treatment: 'Diagnosis',      status: 'confirmed', date: 'Aug 22', time: '10:30AM' },
  { id: '3', name: 'Aminata Sesay',   treatment: 'Surgery',        status: 'confirmed', date: 'Aug 22', time: '12:00PM' },
  { id: '4', name: 'Mohamed Conteh',  treatment: 'Lab Review',     status: 'confirmed', date: 'Aug 22', time: '14:00PM' },
  { id: '5', name: 'Mariatu Kamara',  treatment: 'Follow-up',      status: 'cancelled', date: 'Aug 22', time: '15:30PM' },
];
const REQUESTS = [
  { id: 'r1', name: 'Jane Cooper',    sub: 'Individual consultation', meta: '22 Aug, 10:00 am' },
  { id: 'r2', name: 'Albert Flores',  sub: 'Individual consultation', meta: '24 Aug, 09:00 am' },
  { id: 'r3', name: 'Kristin Watson', sub: 'Individual consultation', meta: '24 Aug, 14:00 pm' },
  { id: 'r4', name: 'Jenny Wilson',   sub: 'Individual consultation', meta: '25 Aug, 11:00 am' },
];
const DAYS = [14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31];
const AVAILABLE = new Set([15,16,17,18,20,21,22,26,27]);

/* ─── sub-components ────────────────────────────────────────────────── */
function Skeleton({ h = 20, w = '100%' }: { h?: number; w?: string }) {
  return <div className="mc-skeleton" style={{ height: h, width: w }} />;
}

function InitialsAvatar({ name, size = 44 }: { name: string; size?: number }) {
  const initials = name.split(/\s+/).map(p => p[0]).join('').slice(0, 2).toUpperCase();
  return (
    <div style={{
      width: size, height: size, borderRadius: 12, flexShrink: 0,
      background: 'var(--brand-light)', color: 'var(--brand)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontWeight: 800, fontSize: size * 0.36, fontFamily: 'var(--font-display)',
    }}>
      {initials}
    </div>
  );
}

/* ─── bubble cluster chart ─────────────────────────────────────────── */
function BubbleCluster() {
  return (
    <div className="bubble-cluster" style={{ height: 140 }}>
      <div className="bubble num" style={{ width: 95, height: 95, background: 'var(--brand-900)', fontSize: 16 }}>Surgery<br /><span style={{ fontSize: 20, fontWeight: 800 }}>180</span></div>
      <div className="bubble num" style={{ width: 120, height: 120, background: 'var(--brand)', fontSize: 18, flexDirection: 'column', gap: 2 }}>
        <span style={{ fontSize: 11, fontWeight: 600, opacity: .8 }}>Consult</span>
        <span style={{ fontSize: 22, fontWeight: 800 }}>240</span>
      </div>
      <div className="bubble num" style={{ width: 65, height: 65, background: 'var(--gray-300)', color: 'var(--ink-700)', fontSize: 13 }}>100</div>
      <div className="bubble num" style={{ width: 48, height: 48, background: 'var(--brand-light)', color: 'var(--brand-dark)', fontSize: 12 }}>60</div>
    </div>
  );
}

/* ─── fan / petal gauge ─────────────────────────────────────────────── */
function FanGauge({ pct }: { pct: number }) {
  const filled = Math.round(16 * pct);
  const angles = Array.from({ length: 16 }, (_, i) => -90 + i * 12);
  return (
    <svg viewBox="0 0 220 130" style={{ width: '100%' }}>
      <g transform="translate(110,120)">
        <g>
          {angles.map((angle, i) => (
            <rect key={i} x={-4} y={-96} width={8} height={30} rx={4}
              fill={i < filled ? 'var(--brand)' : 'var(--gray-200)'}
              transform={`rotate(${angle})`}
            />
          ))}
        </g>
        <line x1={0} y1={0} x2={34} y2={-6} stroke="var(--ink-900)" strokeWidth={3} strokeLinecap="round"
          transform={`rotate(${-90 + pct * 180})`} />
        <circle r={5} fill="var(--ink-900)" />
      </g>
      <text x={8} y={118} fontSize={10} fill="var(--gray-500)" fontFamily="var(--font-body)">0</text>
      <text x={196} y={118} fontSize={10} fill="var(--gray-500)" fontFamily="var(--font-body)">100</text>
    </svg>
  );
}

/* ─── stacked bar ───────────────────────────────────────────────────── */
function HStack({ segments }: { segments: { value: number; color: string; label: string }[] }) {
  const total = segments.reduce((s, seg) => s + seg.value, 0);
  return (
    <>
      <div className="chart-legend">
        {segments.map(s => <span key={s.label}><i style={{ background: s.color }} />{s.label}</span>)}
      </div>
      <div className="hstack-wrap">
        {segments.map(s => (
          <span key={s.label} className="seg-label num" style={{ color: s.color }}>{s.value}</span>
        ))}
      </div>
      <div className="hstack">
        {segments.map(s => (
          <span key={s.label} style={{ width: `${(s.value / total) * 100}%`, background: s.color }} />
        ))}
      </div>
    </>
  );
}

/* ─── vertical bar chart ────────────────────────────────────────────── */
function VBarChart({ counts, labels, highlightIdx = 3 }: { counts: number[]; labels: string[]; highlightIdx?: number }) {
  const max = Math.max(...counts);
  const avg = counts.reduce((a, b) => a + b, 0) / counts.length;
  const avgPct = (avg / max) * 100;
  return (
    <>
      <div className="vbar-chart">
        <div className="avg-line" style={{ bottom: `${avgPct}%` }}>
          <span className="avg-tag">Avg</span>
        </div>
        {counts.map((c, i) => (
          <div key={i} className={`bar${i === highlightIdx ? ' hi' : ''}`}
            style={{ height: `${(c / max) * 100}%` }}
            title={`${labels[i]}: ${c}`} />
        ))}
      </div>
      <div className="chart-axis">
        {labels.map(l => <span key={l}>{l}</span>)}
      </div>
    </>
  );
}

/* ─── main page ─────────────────────────────────────────────────────── */
export default function DoctorDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [patients, setPatients] = useState<BackendPatient[]>([]);
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading');
  const [syncState, setSyncState] = useState<'live' | 'stale' | 'offline'>('live');
  const [selectedDay, setSelectedDay] = useState(22);

  const firstName = user?.name?.replace(/^Dr\.?\s+/i, '').split(' ')[0] || 'Doctor';
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  useEffect(() => {
    let active = true;
    const controller = new AbortController();
    backendApi.getAccessiblePatients()
      .then(res => { if (active) { setPatients(res.patients ?? []); setState('ready'); setSyncState('live'); } })
      .catch(() => { if (active) { setState('error'); setSyncState('offline'); } });
    return () => { active = false; controller.abort(); };
  }, []);

  return (
    <div className="page-shell">
      {/* Offline / stale banner */}
      {syncState === 'offline' && (
        <div className="mc-offline-bar" role="status">
          <Icon d={I.alert} size={16} /> You are offline. Showing cached data.
        </div>
      )}

      {/* ── Navbar ── */}
      <nav className="navbar" role="navigation" aria-label="Main navigation">
        <a href="/dashboard" className="brand">
          <span className="mark" aria-hidden="true">+</span>
          MediChain
          <span style={{ fontSize: 12, background: 'var(--brand-light)', color: 'var(--brand-dark)', padding: '3px 8px', borderRadius: 999, fontWeight: 700 }}>SL</span>
        </a>
        <div className="nav-pills" role="menubar">
          {[
            { href: '/dashboard', label: 'Dashboard', active: true },
            { href: '/patients', label: 'Patients' },
            { href: '/analytics', label: 'Insights' },
            { href: '/appointments', label: 'Appointments' },
            { href: '/records', label: 'Records' },
            { href: '/settings', label: 'Team' },
          ].map(item => (
            <a key={item.href} href={item.href} className={`nav-pill${item.active ? ' active' : ''}`} role="menuitem">
              {item.label}
            </a>
          ))}
        </div>
        <div className="nav-right">
          {/* Sync status */}
          <span className="badge badge-green" title="Data is live">
            <span className="dot" style={{ background: 'var(--green-600)' }} />
            Live data
          </span>
          <button className="icon-btn" aria-label="Notifications">
            <Icon d={I.alert} size={18} />
            <span className="dot" />
          </button>
          <div className="nav-profile">
            <InitialsAvatar name={user?.name || 'Dr'} size={38} />
            <div>
              <div className="name">{user?.name || 'Doctor'}</div>
              <div className="role" style={{ fontSize: 12, color: 'var(--gray-500)' }}>
                {user?.hospital || 'MediChain SL'}
              </div>
            </div>
            <Icon d={I.chevD} size={14} />
          </div>
        </div>
      </nav>

      {/* ── Page body ── */}
      <main id="main-content" className="page-body" style={{ padding: '24px 32px' }}>

        {/* Page header */}
        <div className="page-header">
          <div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 4 }}>
              Welcome back, Dr. {firstName}! ☀️
            </h1>
            <p style={{ color: 'var(--gray-500)', fontSize: 13.5 }}>{dateStr}</p>
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <label className="search" htmlFor="dashboard-search">
              <Icon d={I.search} size={16} />
              <input id="dashboard-search" placeholder="Search patients…" />
            </label>
            <button className="btn btn-outline" style={{ gap: 6 }}>
              <Icon d={I.calendar} size={16} /> Monthly <Icon d={I.chevD} size={14} />
            </button>
            <button className="btn btn-outline">
              <Icon d={I.download} size={16} /> Export data
            </button>
          </div>
        </div>

        {/* ── KPI Row ── */}
        {state === 'loading' ? (
          <div className="grid grid-4" style={{ marginBottom: 20 }}>
            {[0,1,2,3].map(i => <div key={i} className="card"><Skeleton h={180} /></div>)}
          </div>
        ) : state === 'error' ? (
          <div className="mc-notice danger" role="alert" style={{ marginBottom: 20 }}>
            <Icon d={I.alert} size={18} />
            <div><strong>Could not load data</strong><p>Check your connection and try again.</p></div>
          </div>
        ) : (
          <div className="grid grid-4" style={{ marginBottom: 20 }}>

            {/* KPI 1 — Top case types (bubble cluster) */}
            <div className="card">
              <div className="card-head">
                <div className="card-title">
                  <span className="ic"><Icon d={I.plus} size={16} /></span>
                  Top case types this week
                </div>
                <button className="link-more" onClick={() => router.push('/analytics')}>View more</button>
              </div>
              <div className="kpi-value">
                <span className="n num">{patients.length || 580}</span>
                <span className="delta delta-up">+24</span>
              </div>
              <div className="chart-legend">
                <span><i style={{ background: 'var(--brand-900)' }} />Surgery</span>
                <span><i style={{ background: 'var(--brand)' }} />Consult</span>
                <span><i style={{ background: 'var(--gray-300)' }} />Diagnosis</span>
                <span><i style={{ background: 'var(--brand-light)' }} />Biopsy</span>
              </div>
              <BubbleCluster />
            </div>

            {/* KPI 2 — Satisfaction rate (fan gauge) */}
            <div className="card">
              <div className="card-head">
                <div className="card-title">
                  <span className="ic"><Icon d={I.info} size={16} /></span>
                  Patient satisfaction
                </div>
                <button className="link-more" onClick={() => router.push('/analytics')}>View more</button>
              </div>
              <div className="kpi-value">
                <span className="n num">85%</span>
                <span className="delta delta-down">-2%</span>
              </div>
              <FanGauge pct={0.85} />
            </div>

            {/* KPI 3 — Total patients (stacked bar) */}
            <div className="card">
              <div className="card-head">
                <div className="card-title">
                  <span className="ic"><Icon d={I.users} size={16} /></span>
                  Total patients
                </div>
                <button className="link-more" onClick={() => router.push('/patients')}>View more</button>
              </div>
              <div className="kpi-value">
                <span className="n num">{patients.length || 620}</span>
                <span className="delta delta-up">+28</span>
              </div>
              <HStack segments={[
                { value: 420, color: 'var(--brand)', label: 'Inpatient' },
                { value: 120, color: 'var(--brand-tint)', label: 'Discharged' },
                { value: 80,  color: 'var(--gray-200)', label: 'Outpatient' },
              ]} />
            </div>

            {/* KPI 4 — Total appointments (vbar + avg) */}
            <div className="card">
              <div className="card-head">
                <div className="card-title">
                  <span className="ic"><Icon d={I.calendar} size={16} /></span>
                  Total appointments
                </div>
                <button className="link-more" onClick={() => router.push('/appointments')}>View more</button>
              </div>
              <div className="kpi-value">
                <span className="n num">260</span>
                <span className="delta delta-up">+16</span>
              </div>
              <VBarChart
                counts={[40, 55, 35, 88, 70, 30, 60, 45]}
                labels={['03-07', '10-14', '17-21', '24-28']}
                highlightIdx={3}
              />
            </div>
          </div>
        )}

        {/* ── Main 2-col layout ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20, alignItems: 'start' }}>

          {/* ── LEFT: Appointments ── */}
          <div className="card">
            <div className="card-head">
              <div className="card-title">
                <span className="ic"><Icon d={I.calendar} size={16} /></span>
                Upcoming appointments
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div className="legend-row">
                  <span><span className="dot" style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--brand-light)', display: 'inline-block', marginRight: 5 }} />Available</span>
                  <span><span className="dot" style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--ink-900)', display: 'inline-block', marginRight: 5 }} />Selected</span>
                  <span><span className="dot" style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--gray-300)', display: 'inline-block', marginRight: 5 }} />Unavailable</span>
                </div>
                <button className="link-more">View more</button>
              </div>
            </div>

            {/* Date carousel */}
            <div className="date-carousel" style={{ marginBottom: 20 }}>
              <button className="icon-btn ghost" style={{ width: 36, height: 36 }} aria-label="Previous month">
                <Icon d={I.chevL} size={15} />
              </button>
              <div className="date-scroll">
                {DAYS.map(day => {
                  const avail = AVAILABLE.has(day);
                  const sel = day === selectedDay;
                  return (
                    <button key={day}
                      className={`date-chip${sel ? ' selected' : avail ? ' available' : ' unavailable'}`}
                      onClick={() => avail && setSelectedDay(day)}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
              <button className="icon-btn ghost" style={{ width: 36, height: 36 }} aria-label="Next month">
                <Icon d={I.chevR} size={15} />
              </button>
            </div>

            {/* Appointments table */}
            <div style={{ overflowX: 'auto' }}>
              <table className="dtable">
                <thead>
                  <tr>
                    <th><span className="sort">Patient <Icon d="<path d='M7 3v18M4 6l3-3 3 3M17 21V3M14 18l3 3 3-3'/>" size={12} /></span></th>
                    <th><span className="sort">Treatment</span></th>
                    <th><span className="sort">Status</span></th>
                    <th>Date</th>
                    <th><span className="sort">Time</span></th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {APPOINTMENTS.map(appt => (
                    <tr key={appt.id}>
                      <td>
                        <div className="cell-user">
                          <InitialsAvatar name={appt.name} size={36} />
                          {appt.name}
                        </div>
                      </td>
                      <td style={{ color: 'var(--gray-500)' }}>{appt.treatment}</td>
                      <td>
                        <span className={`badge ${appt.status === 'confirmed' ? 'badge-brand' : 'badge-red'}`}>
                          <i className="dot" />
                          {appt.status === 'confirmed' ? 'Confirmed' : 'Cancelled'}
                        </span>
                      </td>
                      <td style={{ color: 'var(--gray-500)' }}>{appt.date}</td>
                      <td style={{ fontVariantNumeric: 'tabular-nums' }}>{appt.time}</td>
                      <td>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button className="icon-btn filled" aria-label={`Call ${appt.name}`} title={`Call ${appt.name}`}>
                            <Icon d={I.phone} size={15} />
                          </button>
                          <button className="icon-btn ghost" aria-label="More options">
                            <Icon d={I.more} size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* ── RIGHT: Appointment requests ── */}
          <div className="card" style={{ position: 'sticky', top: 80 }}>
            <div className="card-head">
              <div className="card-title">
                <span className="ic"><Icon d={I.calendar} size={16} /></span>
                Appointment requests
              </div>
              <button className="link-more">View more</button>
            </div>

            <div>
              {REQUESTS.map(req => (
                <div key={req.id} className="req-item">
                  <InitialsAvatar name={req.name} size={46} />
                  <div className="info">
                    <div className="name">{req.name}</div>
                    <div className="sub">{req.sub}</div>
                    <span className="meta">
                      <Icon d={I.calendar} size={12} />
                      {req.meta}
                    </span>
                  </div>
                  <div className="btns">
                    <button className="round-action decline" aria-label={`Decline ${req.name}`}>
                      <Icon d={I.x} size={14} />
                    </button>
                    <button className="round-action accept" aria-label={`Accept ${req.name}`}>
                      <Icon d={I.check} size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Blockchain + sync footer chip ── */}
        <div style={{ marginTop: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
          <span className="mc-chain-badge">
            <Icon d={I.shield} size={14} />
            <strong>Hyperledger Fabric</strong>
            <small style={{ fontWeight: 500, opacity: .8 }}> · All records anchored on-chain</small>
          </span>
          <span className="badge badge-green">
            <span className="dot" style={{ background: 'var(--green-600)' }} />
            {syncState === 'live' ? 'Live data' : syncState === 'offline' ? 'Offline' : 'Stale data'}
          </span>
        </div>
      </main>
    </div>
  );
}
