'use client';

import { useState, useEffect } from 'react';
import { LayoutWrapper } from '@/components/layout-wrapper';
import { useAuth } from '@/hooks/useAuth';

/* ─── inline SVG helper ─────────────────────────────────────────────── */
function Icon({ d, size = 16 }: { d: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true" dangerouslySetInnerHTML={{ __html: d }} />
  );
}

const I = {
  download: '<path d="M12 3v12m0 0l-4.5-4.5M12 15l4.5-4.5"/><path d="M4 18v1a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-1"/>',
  eye:      '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>',
  more:     '<circle cx="12" cy="5" r="1.3"/><circle cx="12" cy="12" r="1.3"/><circle cx="12" cy="19" r="1.3"/>',
  phone:    '<path d="M22 16.9v2a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3-8.7A2 2 0 0 1 4.1 1h2a2 2 0 0 1 2 1.7c.1.9.4 1.9.7 2.7a2 2 0 0 1-.5 2.1L7.1 8.7a16 16 0 0 0 6 6l1.2-1.2a2 2 0 0 1 2.1-.5c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.9 2.2z"/>',
  alert:    '<path d="M12 9v4M12 17h.01"/><path d="M10.3 3.9L1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/>',
  shield:   '<path d="M12 2 20 5v6c0 5-3.4 9.2-8 11-4.6-1.8-8-6-8-11V5z"/><path d="m8.5 12 2.2 2.2 4.8-5"/>',
  chevD:    '<path d="M6 9l6 6 6-6"/>',
  check:    '<path d="M20 6L9 17l-5-5"/>',
};

/* ─── Mock Data ─────────────────────────────────────────────────────── */
const TEST_REQUESTS = [
  { id: '1', patient: 'Ibrahim Bangura', test: 'FBC', sample: 'Whole blood', dr: 'Dr. Sesay', prio: 'Stat', status: 'Resulted', statusClass: 'badge-green', pClass: 'badge-red' },
  { id: '2', patient: 'Aminata Sesay', test: 'LFTs', sample: 'Serum', dr: 'Dr. Cole', prio: 'Stat', status: 'Resulted', statusClass: 'badge-green', pClass: 'badge-red' },
  { id: '3', patient: 'Mohamed Conteh', test: 'Malaria RDT', sample: 'Capillary blood', dr: 'Dr. Bangura', prio: 'Stat', status: 'Processing', statusClass: 'badge-brand', pClass: 'badge-red' },
  { id: '4', patient: 'Fatu Kamara', test: 'Typhoid Widal', sample: 'Serum', dr: 'Dr. Jalloh', prio: 'Routine', status: 'Processing', statusClass: 'badge-brand', pClass: 'badge-amber' },
  { id: '5', patient: 'Abdul Koroma', test: 'Urine MC&S', sample: 'Urine', dr: 'Dr. Sesay', prio: 'Routine', status: 'Received', statusClass: 'badge-amber', pClass: 'badge-amber' },
  { id: '6', patient: 'Zainab Mansaray', test: 'Chest X-Ray', sample: 'N/A', dr: 'Dr. Cole', prio: 'Routine', status: 'Received', statusClass: 'badge-amber', pClass: 'badge-amber' },
  { id: '7', patient: 'Osman Tarawally', test: 'ECG', sample: 'N/A', dr: 'Dr. Bangura', prio: 'Routine', status: 'Received', statusClass: 'badge-amber', pClass: 'badge-amber' },
  { id: '8', patient: 'Mariatu Fornah', test: 'HbA1c', sample: 'Whole blood', dr: 'Dr. Sesay', prio: 'Routine', status: 'Received', statusClass: 'badge-amber', pClass: 'badge-amber' },
];

const CRITICAL_ALERTS = [
  { id: 'c1', patient: 'Ibrahim Bangura', text: 'Hb 5.2 g/dL', desc: 'Severe anaemia' },
  { id: 'c2', patient: 'Aminata Sesay', text: 'K⁺ 6.8 mEq/L', desc: 'Hyperkalaemia' },
  { id: 'c3', patient: 'Mohamed Conteh', text: 'Glucose 28.4 mmol/L', desc: 'Hyperglycaemia' },
];

/* ─── Helper Components ─────────────────────────────────────────────── */
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

/* ─── Main Page ─────────────────────────────────────────────────────── */
export default function LabDashboard() {
  const { user } = useAuth();
  const [state, setState] = useState<\'loading\' | \'ready\' | \'error\'>(\'loading\');
  const [syncState, setSyncState] = useState<\'live\' | \'stale\' | \'offline\'>(\'live\');

  const now = new Date();
  const dateStr = now.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setState('ready');
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  return (
    <LayoutWrapper>
      {/* Offline banner */}
      {syncState === 'offline' && (
        <div className="mc-offline-bar" role="status">
          <Icon d={I.alert} size={16} /> You are offline. Showing cached data.
        </div>
      )}

      {/* ── Navbar ── */}
      <nav className="navbar" role="navigation" aria-label="Main navigation">
        <a href="/dashboard" className="brand">
          <span className="mark" aria-hidden="true">M</span>
          MediChain
          <span style={{ fontSize: 12, background: 'var(--brand-light)', color: 'var(--brand-dark)', padding: '3px 8px', borderRadius: 999, fontWeight: 700 }}>SL Lab</span>
        </a>
        <div className="nav-pills" role="menubar">
          {[
            { href: '/dashboard', label: 'Dashboard', active: true },
            { href: '/requests', label: 'Test Requests' },
            { href: '/results', label: 'Results' },
            { href: '/patients', label: 'Patients' },
            { href: '/reports', label: 'Reports' },
          ].map(item => (
            <a key={item.href} href={item.href} className={`nav-pill${item.active ? ' active' : ''}`} role="menuitem">
              {item.label}
            </a>
          ))}
        </div>
        <div className="nav-right">
          <span className="badge badge-green" title="Data is live">
            <span className="dot" style={{ background: 'var(--green-600)' }} />
            Live data
          </span>
          <button className="icon-btn" aria-label="Notifications">
            <Icon d={I.alert} size={18} />
            <span className="dot" />
          </button>
          <div className="nav-profile">
            <InitialsAvatar name={user?.name || 'Lab Tech'} size={38} />
            <div>
              <div className="name">{user?.name || 'Lab Tech'}</div>
              <div className="role" style={{ fontSize: 12, color: 'var(--gray-500)' }}>
                Central Laboratory
              </div>
            </div>
            <Icon d={I.chevD} size={14} />
          </div>
        </div>
      </nav>

      {/* ── Page body ── */}
      <main id="main-content" className="page-body">
        {/* Page header */}
        <div className="page-header">
          <div>
            <h1 className="page-title">Laboratory Dashboard</h1>
            <p style={{ color: 'var(--gray-500)', fontSize: 13.5 }}>{dateStr}</p>
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <button className="btn btn-outline">
              <Icon d={I.download} size={16} /> Export Data
            </button>
          </div>
        </div>

        {state === 'loading' ? (
          <div className="grid grid-4" style={{ marginBottom: 20 }}>
            {[0, 1, 2, 3].map(i => <div key={i} className="card"><Skeleton h={180} /></div>)}
          </div>
        ) : state === 'error' ? (
          <div className="mc-notice danger" role="alert" style={{ marginBottom: 20 }}>
            <Icon d={I.alert} size={18} />
            <div><strong>Could not load data</strong><p>Check your connection and try again.</p></div>
          </div>
        ) : (
          <>
            {/* ── KPI Row ── */}
            <div className="grid grid-4" style={{ marginBottom: 24 }}>
              {/* Tests ordered today */}
              <div className="card">
                <div className="card-head">
                  <div className="card-title text-gray-500" style={{ color: 'var(--gray-500)' }}>Tests ordered today</div>
                  <div className="delta delta-up">+8</div>
                </div>
                <div className="kpi-value"><span className="n">47</span></div>
                <div className="vbar-chart" style={{ height: 60, paddingTop: 10 }}>
                  {[40, 60, 50, 90, 70, 100, 80, 50].map((h, i) => (
                    <div key={i} className={`bar ${[3, 6].includes(i) ? 'hi' : ''}`} style={{ height: `${h}%` }} />
                  ))}
                </div>
              </div>

              {/* Pending results */}
              <div className="card">
                <div className="card-head">
                  <div className="card-title text-gray-500" style={{ color: 'var(--gray-500)' }}>Pending results</div>
                  <div className="badge badge-amber"><span className="dot" />Needs Action</div>
                </div>
                <div className="gauge-ring-wrap" style={{ height: 120 }}>
                  <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
                    <circle cx="50" cy="50" r="40" fill="none" stroke="var(--gray-100)" strokeWidth="12" />
                    <circle cx="50" cy="50" r="40" fill="none" stroke="var(--brand)" strokeWidth="12" strokeDasharray="251.2" strokeDashoffset={251.2 * (1 - 0.38)} strokeLinecap="round" />
                  </svg>
                  <div className="gauge-center">
                    <div className="n">18</div>
                    <div className="lbl" style={{ color: 'var(--gray-500)' }}>pending</div>
                  </div>
                </div>
              </div>

              {/* Reported today */}
              <div className="card">
                <div className="card-head">
                  <div className="card-title text-gray-500" style={{ color: 'var(--gray-500)' }}>Reported today</div>
                </div>
                <div className="kpi-value"><span className="n">29</span></div>
                <div className="hstack-wrap" style={{ marginBottom: 12, marginTop: 16 }}>
                  <div className="hstack">
                    <div style={{ width: '48%', background: 'var(--brand)' }} title="Blood: 14" />
                    <div style={{ width: '28%', background: 'var(--brand-tint)' }} title="Urine: 8" />
                    <div style={{ width: '17%', background: 'var(--gray-300)' }} title="Imaging: 5" />
                    <div style={{ width: '7%', background: 'var(--gray-100)' }} title="Other: 2" />
                  </div>
                </div>
                <div className="chart-legend" style={{ marginBottom: 0, justifyContent: 'space-between' }}>
                  <span><i style={{ background: 'var(--brand)' }} /> Blood</span>
                  <span><i style={{ background: 'var(--brand-tint)' }} /> Urine</span>
                  <span><i style={{ background: 'var(--gray-300)' }} /> Imaging</span>
                  <span><i style={{ background: 'var(--gray-100)' }} /> Other</span>
                </div>
              </div>

              {/* Critical flags */}
              <div className="card">
                <div className="card-head">
                  <div className="card-title text-gray-500" style={{ color: 'var(--gray-500)' }}>Critical flags</div>
                </div>
                <div className="kpi-value">
                  <div style={{ background: 'var(--red-100)', color: 'var(--red-600)', padding: '10px 16px', borderRadius: 12, display: 'inline-flex', alignItems: 'center', gap: 10 }}>
                    <Icon d={I.alert} size={24} />
                    <span className="n text-red-600" style={{ fontSize: 32 }}>3</span>
                  </div>
                </div>
                <p style={{ fontSize: 13, color: 'var(--gray-500)', marginTop: 8 }}>
                  Results require immediate notification to prescribing doctor.
                </p>
              </div>
            </div>

            {/* ── Main 2-col layout ── */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24, alignItems: 'start', marginBottom: 24 }}>
              
              {/* LEFT: Test Requests */}
              <div className="card">
                <div className="card-head">
                  <div className="card-title">
                    Test Requests
                  </div>
                  <button className="link-more">View all</button>
                </div>
                <div style={{ overflowX: 'auto' }}>
                  <table className="dtable">
                    <thead>
                      <tr>
                        <th>Patient</th>
                        <th>Test</th>
                        <th>Sample Type</th>
                        <th>Ordered By</th>
                        <th>Priority</th>
                        <th>Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {TEST_REQUESTS.map(req => (
                        <tr key={req.id}>
                          <td>
                            <div className="cell-user">{req.patient}</div>
                          </td>
                          <td style={{ fontWeight: 600 }}>{req.test}</td>
                          <td style={{ color: 'var(--gray-500)' }}>{req.sample}</td>
                          <td style={{ color: 'var(--gray-500)' }}>{req.dr}</td>
                          <td>
                            <span className={`badge ${req.pClass}`}>
                              <i className="dot" /> {req.prio}
                            </span>
                          </td>
                          <td>
                            <span className={`badge ${req.statusClass}`}>
                              <i className="dot" /> {req.status}
                            </span>
                          </td>
                          <td>
                            <div style={{ display: 'flex', gap: 8 }}>
                              <button className="icon-btn filled" aria-label="View Details" title="View Details">
                                <Icon d={I.eye} size={15} />
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

              {/* RIGHT: Critical Results */}
              <div className="card">
                <div className="card-head">
                  <div className="card-title">
                    Critical Results
                  </div>
                  <button className="link-more">View all</button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  {CRITICAL_ALERTS.map(alert => (
                    <div key={alert.id} className="alert-item" style={{ alignItems: 'center' }}>
                      <div className="alert-ic red">
                        <Icon d={I.alert} size={18} />
                      </div>
                      <div className="txt">
                        <b>{alert.patient}</b><br />
                        <span style={{ color: 'var(--red-600)', fontWeight: 700 }}>{alert.text}</span> <span style={{ color: 'var(--gray-500)' }}>({alert.desc})</span>
                      </div>
                      <button className="icon-btn filled" style={{ background: 'var(--brand)' }} aria-label={`Call Doctor for ${alert.patient}`} title={`Call Doctor for ${alert.patient}`}>
                        <Icon d={I.phone} size={15} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Bottom card: Today's Workflow */}
            <div className="card" style={{ marginBottom: 24 }}>
              <div className="card-head">
                <div className="card-title">Today's Workflow</div>
              </div>
              <div style={{ padding: '0 8px' }}>
                <div className="checklist-step">
                  <div className="line" />
                  <div className="step-dot done"><Icon d={I.check} size={14} /></div>
                  <div className="step-body">
                    <div className="t">Sample collection</div>
                    <div className="s">Done</div>
                  </div>
                </div>
                <div className="checklist-step">
                  <div className="line" />
                  <div className="step-dot done"><Icon d={I.check} size={14} /></div>
                  <div className="step-body">
                    <div className="t">Sample processing</div>
                    <div className="s">Done</div>
                  </div>
                </div>
                <div className="checklist-step">
                  <div className="line" />
                  <div className="step-dot current" />
                  <div className="step-body">
                    <div className="t">Testing in progress</div>
                    <div className="s">Current</div>
                  </div>
                </div>
                <div className="checklist-step">
                  <div className="line" />
                  <div className="step-dot pending" />
                  <div className="step-body">
                    <div className="t">Quality control</div>
                    <div className="s">Pending</div>
                  </div>
                </div>
                <div className="checklist-step">
                  <div className="line" />
                  <div className="step-dot pending" />
                  <div className="step-body">
                    <div className="t">Result entry</div>
                    <div className="s">Pending</div>
                  </div>
                </div>
                <div className="checklist-step">
                  <div className="line" />
                  <div className="step-dot pending" />
                  <div className="step-body">
                    <div className="t">Report & notify</div>
                    <div className="s">Pending</div>
                  </div>
                </div>
              </div>
            </div>

            {/* ── Blockchain + sync footer chip ── */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
              <span className="mc-chain-badge">
                <Icon d={I.shield} size={14} />
                <strong>Hyperledger Fabric</strong>
                <small style={{ fontWeight: 500, opacity: .8 }}> · Lab results immutably anchored</small>
              </span>
            </div>
          </>
        )}
      </main>
    </LayoutWrapper>
  );
}
