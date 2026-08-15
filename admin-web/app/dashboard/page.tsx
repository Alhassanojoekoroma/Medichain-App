'use client';

import React, { useState, useEffect } from 'react';

function Icon({ d, size = 16 }: { d: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden dangerouslySetInnerHTML={{ __html: d }} />
  );
}

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(timer);
  }, []);

  const users = [
    { name: 'Dr. Samuel Conteh', role: 'Doctor', roleClass: 'badge-green', hospital: 'Connaught Hospital', status: 'Active', joined: '12 Jan 2024' },
    { name: 'Aminata Kamara', role: 'Nurse', roleClass: 'badge-brand', hospital: 'Ola During Children\'s Hospital', status: 'Active', joined: '15 Jan 2024' },
    { name: 'John Sesay', role: 'Admin', roleClass: 'badge-blue', hospital: 'Princess Christian Maternity Hospital', status: 'Active', joined: '03 Feb 2024' },
    { name: 'Fatu Mansaray', role: 'Pharmacy', roleClass: 'badge-amber', hospital: 'Lumley Hospital', status: 'Offline', joined: '22 Feb 2024' },
    { name: 'Dr. Ibrahim Bah', role: 'Doctor', roleClass: 'badge-green', hospital: 'Macauley Street Hospital', status: 'Active', joined: '01 Mar 2024' },
    { name: 'Hawa Bangura', role: 'Nurse', roleClass: 'badge-brand', hospital: 'King Harman Road Hospital', status: 'Active', joined: '14 Mar 2024' },
    { name: 'Alpha Turay', role: 'Admin', roleClass: 'badge-blue', hospital: 'Rokupa Government Hospital', status: 'Active', joined: '28 Mar 2024' },
    { name: 'Zainab Koroma', role: 'Pharmacy', roleClass: 'badge-amber', hospital: 'Connaught Hospital', status: 'Away', joined: '05 Apr 2024' },
  ];

  const hospitals = [
    { name: 'Connaught Hospital', init: 'C', loc: 'Freetown, Western Area', status: 'Active', sClass: 'badge-green', users: 142, records: '2,341' },
    { name: 'Ola During Children\'s Hospital', init: 'O', loc: 'Freetown, Western Area', status: 'Active', sClass: 'badge-green', users: 89, records: '1,502' },
    { name: 'Princess Christian Maternity Hospital', init: 'P', loc: 'Freetown, Western Area', status: 'Active', sClass: 'badge-green', users: 112, records: '1,833' },
    { name: 'Lumley Hospital', init: 'L', loc: 'Lumley, Western Area', status: 'Onboarding', sClass: 'badge-amber', users: 24, records: '145' },
    { name: 'Macauley Street Hospital', init: 'M', loc: 'Freetown, Western Area', status: 'Suspended', sClass: 'badge-red', users: 0, records: '0' },
    { name: 'King Harman Road Hospital', init: 'K', loc: 'Freetown, Western Area', status: 'Inactive', sClass: 'badge-ink', users: 45, records: '320' },
  ];

  if (loading) {
    return (
      <div className="grid">
        <div className="mc-skeleton" style={{ height: 100 }} />
        <div className="grid-4">
          <div className="mc-skeleton card" style={{ height: 200 }} />
          <div className="mc-skeleton card" style={{ height: 200 }} />
          <div className="mc-skeleton card" style={{ height: 200 }} />
          <div className="mc-skeleton card" style={{ height: 200 }} />
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Admin Dashboard</h1>
          <p style={{ color: 'var(--gray-500)', fontSize: 13.5, marginTop: 4 }}>System overview for today, {new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <div className="search">
            <Icon d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" size={18} />
            <input type="text" placeholder="Search system..." />
          </div>
          <button className="btn btn-outline">
            <Icon d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            Export Data
          </button>
        </div>
      </div>

      <div className="grid-4" style={{ marginBottom: 24 }}>
        <div className="card">
          <div style={{ fontSize: 13.5, color: 'var(--gray-500)', fontWeight: 600 }}>Connected Hospitals</div>
          <div className="kpi-value">
            <span className="n">24</span>
            <span className="delta delta-up">+2</span>
          </div>
          <div className="vbar-chart" style={{ height: 80, paddingTop: 0 }}>
            <div className="bar" style={{ height: '30%' }} />
            <div className="bar" style={{ height: '45%' }} />
            <div className="bar" style={{ height: '40%' }} />
            <div className="bar" style={{ height: '60%' }} />
            <div className="bar" style={{ height: '55%' }} />
            <div className="bar" style={{ height: '70%' }} />
            <div className="bar" style={{ height: '85%' }} />
            <div className="bar hi" style={{ height: '100%' }} />
          </div>
        </div>

        <div className="card">
          <div style={{ fontSize: 13.5, color: 'var(--gray-500)', fontWeight: 600 }}>Total Users</div>
          <div className="kpi-value">
            <span className="n">1,247</span>
            <span className="delta delta-up">+48</span>
          </div>
          <div className="hstack-wrap" style={{ marginBottom: 8, flexDirection: 'column', gap: 12 }}>
            <div className="hstack">
              <div style={{ width: '25%', background: 'var(--brand)' }} title="Doctors: 320" />
              <div style={{ width: '39%', background: 'var(--brand-tint)' }} title="Nurses: 485" />
              <div style={{ width: '15%', background: 'var(--brand-900)' }} title="Admin: 180" />
              <div style={{ width: '21%', background: 'var(--gray-300)' }} title="Patients: 262" />
            </div>
            <div className="chart-legend" style={{ margin: 0 }}>
              <span><i style={{ background: 'var(--brand)' }}/> Doctors</span>
              <span><i style={{ background: 'var(--brand-tint)' }}/> Nurses</span>
              <span><i style={{ background: 'var(--brand-900)' }}/> Admin</span>
              <span><i style={{ background: 'var(--gray-300)' }}/> Patients</span>
            </div>
          </div>
        </div>

        <div className="card">
          <div style={{ fontSize: 13.5, color: 'var(--gray-500)', fontWeight: 600 }}>Blockchain Tx</div>
          <div className="kpi-value">
            <span className="n">8,432</span>
            <span className="delta delta-up">+124</span>
          </div>
          <svg width="100%" height="80" viewBox="0 0 100 40" preserveAspectRatio="none">
            <polyline fill="none" stroke="var(--brand)" strokeWidth="2" points="0,35 10,32 20,38 30,25 40,28 50,15 60,20 70,10 80,12 90,5 100,2" />
            <path fill="url(#grad)" d="M0,35 L10,32 L20,38 L30,25 L40,28 L50,15 L60,20 L70,10 L80,12 L90,5 L100,2 L100,40 L0,40 Z" opacity="0.3" />
            <defs>
              <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--brand)" stopOpacity="0.8"/>
                <stop offset="100%" stopColor="var(--brand)" stopOpacity="0"/>
              </linearGradient>
            </defs>
          </svg>
        </div>

        <div className="card">
          <div style={{ fontSize: 13.5, color: 'var(--gray-500)', fontWeight: 600 }}>System Uptime</div>
          <div className="kpi-value">
            <span className="n">99.7%</span>
            <span className="delta delta-up" style={{ background: 'var(--green-100)', color: 'var(--green-600)' }}>Online</span>
          </div>
          <div className="gauge-ring-wrap" style={{ height: 80 }}>
             <svg width="140" height="80" viewBox="0 0 140 80">
              <path d="M 10 70 A 60 60 0 0 1 130 70" fill="none" stroke="var(--gray-200)" strokeWidth="12" strokeLinecap="round" />
              <path d="M 10 70 A 60 60 0 0 1 130 70" fill="none" stroke="var(--brand)" strokeWidth="12" strokeLinecap="round" strokeDasharray="188" strokeDashoffset="10" />
            </svg>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 0.6fr', gap: 24, marginBottom: 24 }}>
        <div className="card">
          <div className="card-head">
            <div className="card-title">Registered Users</div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-soft" style={{ minHeight: 36, padding: '6px 14px', fontSize: 13 }}>Filter</button>
              <button className="btn btn-outline" style={{ minHeight: 36, padding: '6px 14px', fontSize: 13 }}>Export</button>
            </div>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table className="dtable">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Role</th>
                  <th>Hospital</th>
                  <th>Status</th>
                  <th>Joined</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u, i) => (
                  <tr key={i}>
                    <td>
                      <div className="cell-user">
                        <div className="avatar" style={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--brand-light)', color: 'var(--brand)' }}>
                          {u.name.replace('Dr. ', '')[0]}
                        </div>
                        {u.name}
                      </div>
                    </td>
                    <td><span className={`badge ${u.roleClass}`}><i className="dot" />{u.role}</span></td>
                    <td style={{ color: 'var(--gray-600)' }}>{u.hospital}</td>
                    <td>{u.status}</td>
                    <td style={{ color: 'var(--gray-500)' }}>{u.joined}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="icon-btn filled" style={{ width: 32, height: 32 }}><Icon d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" size={14} /></button>
                        <button className="icon-btn ghost" style={{ width: 32, height: 32 }}><Icon d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <div className="card" style={{ marginBottom: 24 }}>
            <div className="card-head">
              <div className="card-title">
                <div className="ic"><Icon d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" /></div>
                Fabric Network
              </div>
            </div>
            <div>
              <div className="kv-row"><span className="k">Network Status</span><span className="v"><span className="badge badge-green"><i className="dot" />Active</span></span></div>
              <div className="kv-row"><span className="k">Orderers</span><span className="v">3/3 <span className="badge badge-green"><i className="dot"/></span></span></div>
              <div className="kv-row"><span className="k">Peers</span><span className="v">12/12 <span className="badge badge-green"><i className="dot"/></span></span></div>
              <div className="kv-row"><span className="k">Channels</span><span className="v">4</span></div>
              <div className="kv-row"><span className="k">Last block</span><span className="v">#89,241</span></div>
              <div className="kv-row"><span className="k">Block time</span><span className="v">2.3s avg</span></div>
              <div className="kv-row"><span className="k">Pending tx</span><span className="v">0</span></div>
              <div className="kv-row"><span className="k">Last anchor</span><span className="v">2 min ago</span></div>
            </div>
          </div>

          <div className="card">
            <div className="card-head">
              <div className="card-title">Recent Alerts</div>
            </div>
            <div>
              <div className="alert-item">
                <div className="alert-ic blue"><Icon d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></div>
                <div className="txt">
                  <b>New hospital registered:</b> Lumley Hospital onboarding started.
                  <div className="time">10 mins ago</div>
                </div>
              </div>
              <div className="alert-item">
                <div className="alert-ic amber"><Icon d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></div>
                <div className="txt">
                  <b>Peer node sync delayed:</b> Peer0.Org1 sync is behind by 3s.
                  <div className="time">45 mins ago</div>
                </div>
              </div>
              <div className="alert-item">
                <div className="alert-ic green"><Icon d="M5 13l4 4L19 7" /></div>
                <div className="txt">
                  <b>Batch anchor complete:</b> Block #89,241 successfully anchored to Ethereum testnet.
                  <div className="time">2 hours ago</div>
                </div>
              </div>
              <div className="alert-item">
                <div className="alert-ic brand"><Icon d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></div>
                <div className="txt">
                  <b>DHIS2 export success:</b> Daily aggregated stats pushed to MoHS DHIS2 node.
                  <div className="time">5 hours ago</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="card" style={{ padding: '24px 32px' }}>
        <div className="card-head">
          <div className="card-title">Registered Hospitals</div>
          <button className="btn btn-outline" style={{ minHeight: 36, padding: '6px 14px', fontSize: 13 }}>View All</button>
        </div>
        <div className="grid-3">
          {hospitals.map((h, i) => (
            <div key={i} className="card" style={{ textAlign: 'center', padding: '20px 16px', border: '1px solid var(--border)', boxShadow: 'none' }}>
              <div style={{ width: 56, height: 56, borderRadius: 16, background: 'var(--brand-light)', color: 'var(--brand)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 24, margin: '0 auto 12px' }}>
                {h.init}
              </div>
              <div style={{ fontWeight: 800, fontFamily: 'var(--font-display)', fontSize: 15 }}>{h.name}</div>
              <div style={{ fontSize: 12, color: 'var(--gray-500)', margin: '4px 0 12px' }}>{h.loc}</div>
              <span className={`badge ${h.sClass}`}><i className="dot" />{h.status}</span>
              <div style={{ marginTop: 12, display: 'flex', gap: 8, justifyContent: 'center', alignItems: 'center' }}>
                <span style={{ fontSize: 12, color: 'var(--gray-500)' }}>{h.users} users</span>
                <span style={{ color: 'var(--gray-300)' }}>·</span>
                <span style={{ fontSize: 12, color: 'var(--gray-500)' }}>{h.records} records</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
