'use client';

import { useState, useEffect } from 'react';
import { LayoutWrapper } from '@/components/layout-wrapper';

// Mock translation function
function t(key: string) {
  return key;
}

function Icon({ d, size = 16, color = 'currentColor' }: { d: string; size?: number, color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true" dangerouslySetInnerHTML={{ __html: d }} />
  );
}

const I = {
  alert: '<path d="M12 9v4M12 17h.01"/><path d="M10.3 3.9L1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/>',
  download: '<path d="M12 3v12m0 0l-4.5-4.5M12 15l4.5-4.5"/><path d="M4 18v1a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-1"/>',
  check: '<path d="M20 6L9 17l-5-5"/>',
  more: '<circle cx="12" cy="5" r="1.3"/><circle cx="12" cy="12" r="1.3"/><circle cx="12" cy="19" r="1.3"/>',
  shield: '<path d="M12 2 20 5v6c0 5-3.4 9.2-8 11-4.6-1.8-8-6-8-11V5z"/><path d="m8.5 12 2.2 2.2 4.8-5"/>',
  pill: '<path d="M10.5 20.5A7 7 0 0 1 5.5 8.5l6-6a7 7 0 0 1 9 9l-10 10z"/><line x1="8.5" y1="8.5" x2="15.5" y2="15.5"/>',
  clock: '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
  box: '<path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/>',
};

function InitialsAvatar({ name, size = 34 }: { name: string; size?: number }) {
  const initials = name.split(/\s+/).map(p => p[0]).join('').slice(0, 2).toUpperCase();
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', flexShrink: 0,
      background: 'var(--brand-light)', color: 'var(--brand)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontWeight: 800, fontSize: size * 0.36, fontFamily: 'var(--font-display)',
    }}>
      {initials}
    </div>
  );
}

export default function PharmacyDashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  const now = new Date();
  const dateStr = now.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <LayoutWrapper>
      {isOffline && (
        <div className="mc-offline-bar">
          <Icon d={I.alert} size={16} /> {t('Offline: Working from local cache')}
        </div>
      )}

      {/* Navbar */}
      <nav className="navbar" role="navigation" aria-label="Main navigation">
        <a href="/dashboard" className="brand">
          <span className="mark" aria-hidden="true">+</span>
          MediChain
          <span style={{ fontSize: 12, background: 'var(--brand-light)', color: 'var(--brand-dark)', padding: '3px 8px', borderRadius: 999, fontWeight: 700 }}>Pharmacy</span>
        </a>
        <div className="nav-pills" role="menubar">
          {[
            { href: '/dashboard', label: 'Dashboard', active: true },
            { href: '/prescriptions', label: 'Prescriptions' },
            { href: '/inventory', label: 'Inventory' },
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
          <div className="nav-profile">
            <InitialsAvatar name="Pharmacist User" size={38} />
            <div>
              <div className="name">Pharmacist</div>
              <div className="role" style={{ fontSize: 12, color: 'var(--gray-500)' }}>Central Branch</div>
            </div>
          </div>
        </div>
      </nav>

      <main className="page-body">
        {/* Page header */}
        <div className="page-header">
          <div>
            <h1 className="page-title">{t('Pharmacy Dashboard')}</h1>
            <p style={{ color: 'var(--gray-500)', fontSize: 13.5 }}>{dateStr}</p>
          </div>
          <button className="btn btn-outline">
            <Icon d={I.download} size={16} /> {t('Export Report')}
          </button>
        </div>

        {isLoading ? (
          <div className="grid grid-4" style={{ marginBottom: 24 }}>
            <div className="card"><div className="mc-skeleton" style={{ height: 180, width: '100%' }}></div></div>
            <div className="card"><div className="mc-skeleton" style={{ height: 180, width: '100%' }}></div></div>
            <div className="card"><div className="mc-skeleton" style={{ height: 180, width: '100%' }}></div></div>
            <div className="card"><div className="mc-skeleton" style={{ height: 180, width: '100%' }}></div></div>
          </div>
        ) : isError ? (
          <div className="mc-notice danger" role="alert" style={{ marginBottom: 24 }}>
            <Icon d={I.alert} size={18} />
            <div><strong>{t('Could not load data')}</strong><p>{t('Check your connection and try again.')}</p></div>
          </div>
        ) : (
          <>
            {/* KPI Row */}
            <div className="grid grid-4" style={{ marginBottom: 24 }}>
              
              {/* Prescriptions today */}
              <div className="card">
                <div className="card-head">
                  <div className="card-title">
                    <span className="ic"><Icon d={I.pill} size={16} /></span>
                    {t('Prescriptions today')}
                  </div>
                </div>
                <div className="kpi-value">
                  <span className="n">84</span>
                  <span className="delta delta-up">+12</span>
                </div>
                <div className="vbar-chart" style={{ height: 80, paddingTop: 10 }}>
                  <div className="bar" style={{ height: '30%' }}></div>
                  <div className="bar" style={{ height: '45%' }}></div>
                  <div className="bar" style={{ height: '35%' }}></div>
                  <div className="bar" style={{ height: '55%' }}></div>
                  <div className="bar hi" style={{ height: '80%' }}></div>
                  <div className="bar" style={{ height: '60%' }}></div>
                  <div className="bar" style={{ height: '100%' }}></div>
                  <div className="bar" style={{ height: '75%' }}></div>
                </div>
              </div>

              {/* Pending dispensing */}
              <div className="card">
                <div className="card-head">
                  <div className="card-title">
                    <span className="ic" style={{ background: 'var(--amber-100)', color: 'var(--amber-600)' }}><Icon d={I.clock} size={16} /></span>
                    {t('Pending dispensing')}
                  </div>
                  <span className="badge badge-amber"><span className="dot" />{t('Action needed')}</span>
                </div>
                <div className="gauge-ring-wrap" style={{ height: 120 }}>
                  <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
                    <circle cx="50" cy="50" r="40" fill="none" stroke="var(--gray-100)" strokeWidth="12" />
                    <circle cx="50" cy="50" r="40" fill="none" stroke="var(--amber-600)" strokeWidth="12" strokeDasharray="251.2" strokeDashoffset={251.2 * (1 - 0.73)} strokeLinecap="round" />
                  </svg>
                  <div className="gauge-center">
                    <div className="n">23</div>
                    <div className="lbl">{t('pending')}</div>
                  </div>
                </div>
              </div>

              {/* Dispensed today */}
              <div className="card">
                <div className="card-head">
                  <div className="card-title">
                    <span className="ic"><Icon d={I.check} size={16} /></span>
                    {t('Dispensed today')}
                  </div>
                </div>
                <div className="kpi-value"><span className="n">61</span></div>
                
                <div className="chart-legend" style={{ marginBottom: 12, display: 'flex', gap: 12 }}>
                  <span><i style={{ background: 'var(--brand)' }}></i> {t('New')}</span>
                  <span><i style={{ background: 'var(--brand-tint)' }}></i> {t('Refill')}</span>
                  <span><i style={{ background: 'var(--gray-200)' }}></i> {t('Emerg.')}</span>
                </div>
                
                <div className="hstack">
                  <div style={{ width: '65.5%', background: 'var(--brand)' }} title="New: 40"></div>
                  <div style={{ width: '24.5%', background: 'var(--brand-tint)' }} title="Refill: 15"></div>
                  <div style={{ width: '10%', background: 'var(--gray-200)' }} title="Emergency: 6"></div>
                </div>
              </div>

              {/* Out-of-stock alerts */}
              <div className="card">
                <div className="card-head">
                  <div className="card-title">
                    <span className="ic" style={{ background: 'var(--red-100)', color: 'var(--red-600)' }}><Icon d={I.alert} size={16} /></span>
                    {t('Out-of-stock alerts')}
                  </div>
                  <span className="badge badge-red"><span className="dot" />{t('Critical')}</span>
                </div>
                <div className="kpi-value"><span className="n" style={{ color: 'var(--red-600)' }}>5</span></div>
                <div style={{ display: 'flex', gap: 6, marginTop: 16 }}>
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} style={{ width: 12, height: 12, borderRadius: 3, background: 'var(--red-600)' }} />
                  ))}
                </div>
                <p style={{ fontSize: 13, color: 'var(--gray-500)', marginTop: 12 }}>{t('Items require immediate restock requisition.')}</p>
              </div>

            </div>

            {/* Main 2-Col Layout */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24, marginBottom: 24, alignItems: 'start' }}>
              
              {/* LEFT: Prescription Queue */}
              <div className="card">
                <div className="card-head">
                  <div className="card-title">
                    <span className="ic"><Icon d={I.pill} size={16} /></span>
                    {t('Prescription Queue')}
                  </div>
                  <button className="link-more">{t('View All')}</button>
                </div>
                
                <div style={{ overflowX: 'auto' }}>
                  <table className="dtable">
                    <thead>
                      <tr>
                        <th>{t('Patient')}</th>
                        <th>{t('Medication')}</th>
                        <th>{t('Dose')}</th>
                        <th>{t('Prescribing Dr')}</th>
                        <th>{t('Priority')}</th>
                        <th>{t('Status')}</th>
                        <th>{t('Action')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { patient: 'Fatu Kamara', med: 'Artemether-Lumefantrine', dose: '80/480mg', dr: 'Dr. Sesay', prio: 'Urgent', pClass: 'badge-red', status: 'Pending', sClass: 'badge-amber' },
                        { patient: 'Ibrahim Bah', med: 'Amoxicillin', dose: '500mg', dr: 'Dr. Cole', prio: 'Normal', pClass: 'badge-amber', status: 'Processing', sClass: 'badge-brand' },
                        { patient: 'Aminata Turay', med: 'Metformin', dose: '850mg', dr: 'Dr. Bangura', prio: 'Normal', pClass: 'badge-amber', status: 'Ready', sClass: 'badge-green' },
                        { patient: 'Mohamed Conteh', med: 'Oxytocin', dose: '10IU', dr: 'Dr. Sesay', prio: 'Urgent', pClass: 'badge-red', status: 'Pending', sClass: 'badge-amber' },
                        { patient: 'Zainab Mansaray', med: 'Paracetamol', dose: '1g', dr: 'Dr. Cole', prio: 'Normal', pClass: 'badge-amber', status: 'Ready', sClass: 'badge-green' },
                        { patient: 'Abdul Koroma', med: 'Lisinopril', dose: '10mg', dr: 'Dr. Jalloh', prio: 'Urgent', pClass: 'badge-red', status: 'Processing', sClass: 'badge-brand' },
                        { patient: 'Mariatu Fornah', med: 'ORS', dose: '1 sachet', dr: 'Dr. Bangura', prio: 'Normal', pClass: 'badge-amber', status: 'Pending', sClass: 'badge-amber' },
                        { patient: 'Osman Tarawally', med: 'Co-trimoxazole', dose: '480mg', dr: 'Dr. Sesay', prio: 'Normal', pClass: 'badge-amber', status: 'Pending', sClass: 'badge-amber' },
                      ].map((row, i) => (
                        <tr key={i}>
                          <td><div className="cell-user">{row.patient}</div></td>
                          <td style={{ fontWeight: 700 }}>{row.med}</td>
                          <td style={{ color: 'var(--gray-600)' }}>{row.dose}</td>
                          <td style={{ color: 'var(--gray-600)' }}>{row.dr}</td>
                          <td><span className={`badge ${row.pClass}`}><div className="dot"></div>{row.prio}</span></td>
                          <td><span className={`badge ${row.sClass}`}><div className="dot"></div>{row.status}</span></td>
                          <td>
                            <div style={{ display: 'flex', gap: 8 }}>
                              <button className="icon-btn filled" aria-label="Dispense">
                                <Icon d={I.check} size={15} />
                              </button>
                              <button className="icon-btn ghost" aria-label="More">
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

              {/* RIGHT: Stock Alerts */}
              <div className="card">
                <div className="card-head">
                  <div className="card-title">
                    <span className="ic"><Icon d={I.box} size={16} /></span>
                    {t('Stock Alerts')}
                  </div>
                  <button className="link-more">{t('Inventory')}</button>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <div className="alert-item">
                    <div className="alert-ic red">
                      <Icon d={I.alert} size={18} color="currentColor" />
                    </div>
                    <div className="txt">
                      <b>Artemether-Lumefantrine</b>
                      <div style={{ color: 'var(--red-600)', fontWeight: 700, marginTop: 4 }}>3 {t('units remain')}</div>
                    </div>
                  </div>
                  
                  <div className="alert-item">
                    <div className="alert-ic red">
                      <Icon d={I.alert} size={18} color="currentColor" />
                    </div>
                    <div className="txt">
                      <b>Oxytocin</b>
                      <div style={{ color: 'var(--red-600)', fontWeight: 700, marginTop: 4 }}>1 {t('vial remain')}</div>
                    </div>
                  </div>
                  
                  <div className="alert-item">
                    <div className="alert-ic amber">
                      <Icon d={I.alert} size={18} color="currentColor" />
                    </div>
                    <div className="txt">
                      <b>Paracetamol 1g</b>
                      <div style={{ color: 'var(--amber-600)', fontWeight: 700, marginTop: 4 }}>12 {t('units remain')}</div>
                    </div>
                  </div>
                  
                  <div className="alert-item">
                    <div className="alert-ic amber">
                      <Icon d={I.alert} size={18} color="currentColor" />
                    </div>
                    <div className="txt">
                      <b>IV Fluid 0.9% NaCl</b>
                      <div style={{ color: 'var(--amber-600)', fontWeight: 700, marginTop: 4 }}>8 {t('bags remain')}</div>
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* Bottom: Recently Dispensed */}
            <div className="card">
              <div className="card-head">
                <div className="card-title">
                  <span className="ic"><Icon d={I.clock} size={16} /></span>
                  {t('Recently Dispensed')}
                </div>
                <button className="btn btn-soft">{t('View All')}</button>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {[
                  { patient: 'Isatu Jalloh', med: 'Amoxicillin 500mg', time: '10 mins ago' },
                  { patient: 'Kelfala Marah', med: 'Lisinopril 10mg', time: '25 mins ago' },
                  { patient: 'Mabinty Kamara', med: 'Artemether-Lumefantrine', time: '1 hour ago' },
                  { patient: 'Alusine Turay', med: 'Paracetamol 1g', time: '2 hours ago' },
                  { patient: 'Haja Sesay', med: 'Metformin 850mg', time: '3 hours ago' },
                ].map((item, idx) => (
                  <div className="kv-row" key={idx}>
                    <div className="v">
                      <InitialsAvatar name={item.patient} size={28} />
                      {item.patient}
                      <span style={{ color: 'var(--gray-400)', fontWeight: 400, margin: '0 8px' }}>/</span>
                      <span style={{ color: 'var(--gray-600)' }}>{item.med}</span>
                    </div>
                    <div className="k" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                      <span className="badge badge-green"><span className="dot" />{t('Dispensed')}</span>
                      {item.time}
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </>
        )}

        {/* Blockchain footer chip */}
        <div style={{ marginTop: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
          <span className="mc-chain-badge">
            <Icon d={I.shield} size={14} />
            <strong>Hyperledger Fabric</strong>
            <small style={{ fontWeight: 500, opacity: .8 }}> · All dispense records anchored</small>
          </span>
        </div>
      </main>
    </LayoutWrapper>
  );
}
