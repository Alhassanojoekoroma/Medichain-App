'use client'
import { useState, useEffect } from 'react'
import LayoutWrapper from '@/components/dashboard/layout-wrapper'
import { useAuth } from '@/hooks/useAuth'

export default function NurseDashboard() {
  const auth = useAuth()
  const name = auth?.user?.name?.split(' ')[0] || 'Fatima'
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  
  useEffect(() => {
    // Simulate data fetch
    const timer = setTimeout(() => {
      setLoading(false)
    }, 1000)
    return () => clearTimeout(timer)
  }, [])
  
  if (error) {
    return (
      <LayoutWrapper>
        <div className="mc-notice danger">
          <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" dangerouslySetInnerHTML={{__html: '<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>'}}/>
          Failed to load triage data. Please try again.
        </div>
      </LayoutWrapper>
    )
  }

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
  
  return (
    <LayoutWrapper>
      <div className="page-header">
        <div>
          <h1 className="page-title">Welcome back, {name} 🏥</h1>
          <p style={{ color: 'var(--gray-500)', fontSize: 14, marginTop: 4 }}>{today}</p>
        </div>
      </div>
      
      {loading ? (
        <>
          <div className="grid grid-4" style={{ marginBottom: 24 }}>
            {[1,2,3,4].map(i => <div key={i} className="mc-skeleton" style={{ height: 140 }}></div>)}
          </div>
          <div className="grid" style={{ gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)', marginBottom: 24 }}>
            <div className="mc-skeleton" style={{ height: 400 }}></div>
            <div className="mc-skeleton" style={{ height: 400 }}></div>
          </div>
        </>
      ) : (
        <>
          {/* KPI Row */}
          <div className="grid grid-4" style={{ marginBottom: 24 }}>
            <div className="card">
              <div className="card-head">
                <div className="card-title">
                  <div className="ic"><svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" dangerouslySetInnerHTML={{__html: '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>'}}/></div>
                  Patients in queue
                </div>
              </div>
              <div className="kpi-value">
                <span className="n">42</span>
                <span className="delta delta-up">↑ 12%</span>
              </div>
              <div className="vbar-chart">
                 <div className="bar" style={{height: '30%'}}></div>
                 <div className="bar" style={{height: '50%'}}></div>
                 <div className="bar" style={{height: '40%'}}></div>
                 <div className="bar" style={{height: '70%'}}></div>
                 <div className="bar hi" style={{height: '100%'}}></div>
                 <div className="bar" style={{height: '60%'}}></div>
                 <div className="bar" style={{height: '80%'}}></div>
              </div>
            </div>
            
            <div className="card">
              <div className="card-head">
                <div className="card-title">
                  <div className="ic"><svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" dangerouslySetInnerHTML={{__html: '<rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>'}}/></div>
                  Triage beds available
                </div>
              </div>
              <div className="gauge-ring-wrap" style={{height:90, position:'relative', display:'flex', justifyContent:'center', marginTop: 24}}>
                <svg width={160} height={100} viewBox="0 0 160 100" style={{overflow:'visible'}}>
                  <path d="M16 80 A64 64 0 0 1 144 80" fill="none" stroke="var(--gray-100)" strokeWidth={16} strokeLinecap="round"/>
                  <path d="M16 80 A64 64 0 0 1 144 80" fill="none" stroke="var(--brand)" strokeWidth={16} strokeLinecap="round" strokeDasharray={201} strokeDashoffset={201 * 0.26} style={{transition:'stroke-dashoffset .6s ease'}}/>
                </svg>
                <div className="gauge-center"><div className="n num">74%</div><div className="lbl">Beds available</div></div>
              </div>
            </div>
            
            <div className="card">
              <div className="card-head">
                <div className="card-title">
                  <div className="ic"><svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" dangerouslySetInnerHTML={{__html: '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>'}}/></div>
                  Completed today
                </div>
              </div>
              <div className="kpi-value">
                <span className="n">128</span>
              </div>
              <div className="hstack-wrap">
                <div className="hstack">
                  <div style={{width: '40%', background: 'var(--brand)'}}></div>
                  <div style={{width: '35%', background: 'var(--brand-tint)'}}></div>
                  <div style={{width: '25%', background: 'var(--gray-200)'}}></div>
                </div>
              </div>
              <div className="chart-legend">
                <span><i style={{background: 'var(--brand)'}}></i> Routine</span>
                <span><i style={{background: 'var(--brand-tint)'}}></i> Urgent</span>
                <span><i style={{background: 'var(--gray-200)'}}></i> Critical</span>
              </div>
            </div>
            
            <div className="card">
              <div className="card-head">
                <div className="card-title">
                  <div className="ic"><svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" dangerouslySetInnerHTML={{__html: '<path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>'}}/></div>
                  Critical alerts
                </div>
              </div>
              <div className="kpi-value">
                <span className="n">3</span>
                <span className="badge badge-red"><span className="dot"></span> Requires action</span>
              </div>
              <div style={{marginTop: 16}}>
                <div className="kv-row">
                  <span className="k">Vitals Warning</span>
                  <span className="v">Ibrahim B.</span>
                </div>
                <div className="kv-row">
                  <span className="k">Bed Shortage</span>
                  <span className="v">Ward B</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Main content row */}
          <div className="grid" style={{ gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)', marginBottom: 24 }}>
            <div className="card" style={{ overflow: 'hidden' }}>
              <div className="card-head">
                <div className="card-title">
                  <div className="ic"><svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" dangerouslySetInnerHTML={{__html: '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>'}}/></div>
                  Triage Queue
                </div>
                <button className="link-more">View all</button>
              </div>
              
              <div className="date-carousel" style={{ marginBottom: 16 }}>
                <button className="icon-btn ghost" style={{width: 32, height: 32}}><svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" dangerouslySetInnerHTML={{__html: '<polyline points="15 18 9 12 15 6"/>'}}/></button>
                <div className="date-scroll">
                  {[14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31].map(d => (
                    <button key={d} className={`date-chip ${d === 22 ? 'selected' : 'available'}`}>{d}</button>
                  ))}
                </div>
                <button className="icon-btn ghost" style={{width: 32, height: 32}}><svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" dangerouslySetInnerHTML={{__html: '<polyline points="9 18 15 12 9 6"/>'}}/></button>
              </div>
              
              <div style={{ overflowX: 'auto' }}>
                <table className="dtable">
                  <thead>
                    <tr>
                      <th>Patient ↕</th>
                      <th>Chief Complaint ↕</th>
                      <th>Vitals ↕</th>
                      <th>Triage Level ↕</th>
                      <th>Wait Time ↕</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>
                        <div className="cell-user">
                          <div className="avatar" style={{width:32,height:32,background:'var(--brand-light)',color:'var(--brand-dark)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:12}}>AK</div>
                          Aminata Kamara
                        </div>
                      </td>
                      <td>Severe chest pain</td>
                      <td>HR 120, BP 160/95</td>
                      <td><span className="badge badge-red"><span className="dot"></span>Critical</span></td>
                      <td><span className="num">5 min</span></td>
                      <td>
                        <div style={{display:'flex', gap:4}}>
                          <button className="icon-btn filled" style={{width:32,height:32}}><svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" dangerouslySetInnerHTML={{__html: '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>'}}/></button>
                          <button className="icon-btn ghost" style={{width:32,height:32}}><svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" dangerouslySetInnerHTML={{__html: '<circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/>'}}/></button>
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <div className="cell-user">
                          <div className="avatar" style={{width:32,height:32,background:'var(--brand-light)',color:'var(--brand-dark)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:12}}>MB</div>
                          Mohamed Bangura
                        </div>
                      </td>
                      <td>High fever, chills</td>
                      <td>HR 105, Temp 39.5</td>
                      <td><span className="badge badge-amber"><span className="dot"></span>Urgent</span></td>
                      <td><span className="num">15 min</span></td>
                      <td>
                        <div style={{display:'flex', gap:4}}>
                          <button className="icon-btn filled" style={{width:32,height:32}}><svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" dangerouslySetInnerHTML={{__html: '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>'}}/></button>
                          <button className="icon-btn ghost" style={{width:32,height:32}}><svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" dangerouslySetInnerHTML={{__html: '<circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/>'}}/></button>
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <div className="cell-user">
                          <div className="avatar" style={{width:32,height:32,background:'var(--brand-light)',color:'var(--brand-dark)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:12}}>ZS</div>
                          Zainab Sesay
                        </div>
                      </td>
                      <td>Abdominal pain</td>
                      <td>HR 90, BP 120/80</td>
                      <td><span className="badge badge-amber"><span className="dot"></span>Urgent</span></td>
                      <td><span className="num">25 min</span></td>
                      <td>
                        <div style={{display:'flex', gap:4}}>
                          <button className="icon-btn filled" style={{width:32,height:32}}><svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" dangerouslySetInnerHTML={{__html: '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>'}}/></button>
                          <button className="icon-btn ghost" style={{width:32,height:32}}><svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" dangerouslySetInnerHTML={{__html: '<circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/>'}}/></button>
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <div className="cell-user">
                          <div className="avatar" style={{width:32,height:32,background:'var(--brand-light)',color:'var(--brand-dark)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:12}}>IC</div>
                          Ibrahim Conteh
                        </div>
                      </td>
                      <td>Mild cough</td>
                      <td>HR 80, BP 115/75</td>
                      <td><span className="badge badge-green"><span className="dot"></span>Routine</span></td>
                      <td><span className="num">45 min</span></td>
                      <td>
                        <div style={{display:'flex', gap:4}}>
                          <button className="icon-btn filled" style={{width:32,height:32}}><svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" dangerouslySetInnerHTML={{__html: '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>'}}/></button>
                          <button className="icon-btn ghost" style={{width:32,height:32}}><svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" dangerouslySetInnerHTML={{__html: '<circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/>'}}/></button>
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <div className="cell-user">
                          <div className="avatar" style={{width:32,height:32,background:'var(--brand-light)',color:'var(--brand-dark)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:12}}>FK</div>
                          Fatima Kamara
                        </div>
                      </td>
                      <td>Sprained ankle</td>
                      <td>HR 85, BP 120/80</td>
                      <td><span className="badge badge-green"><span className="dot"></span>Routine</span></td>
                      <td><span className="num">50 min</span></td>
                      <td>
                        <div style={{display:'flex', gap:4}}>
                          <button className="icon-btn filled" style={{width:32,height:32}}><svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" dangerouslySetInnerHTML={{__html: '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>'}}/></button>
                          <button className="icon-btn ghost" style={{width:32,height:32}}><svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" dangerouslySetInnerHTML={{__html: '<circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/>'}}/></button>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            
            <div className="card">
              <div className="card-head">
                <div className="card-title">Appointment Requests</div>
              </div>
              <div className="req-item">
                <div className="info">
                  <div className="name">Osman Turay</div>
                  <div className="sub">Walk-in triage</div>
                  <div className="meta">10 mins ago</div>
                </div>
                <div className="btns">
                  <button className="round-action accept"><svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" dangerouslySetInnerHTML={{__html: '<polyline points="20 6 9 17 4 12"/>'}}/></button>
                  <button className="round-action decline"><svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" dangerouslySetInnerHTML={{__html: '<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>'}}/></button>
                </div>
              </div>
              <div className="req-item">
                <div className="info">
                  <div className="name">Isatu Mansaray</div>
                  <div className="sub">Walk-in triage</div>
                  <div className="meta">25 mins ago</div>
                </div>
                <div className="btns">
                  <button className="round-action accept"><svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" dangerouslySetInnerHTML={{__html: '<polyline points="20 6 9 17 4 12"/>'}}/></button>
                  <button className="round-action decline"><svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" dangerouslySetInnerHTML={{__html: '<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>'}}/></button>
                </div>
              </div>
              <div className="req-item">
                <div className="info">
                  <div className="name">Hassan Koroma</div>
                  <div className="sub">Walk-in triage</div>
                  <div className="meta">40 mins ago</div>
                </div>
                <div className="btns">
                  <button className="round-action accept"><svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" dangerouslySetInnerHTML={{__html: '<polyline points="20 6 9 17 4 12"/>'}}/></button>
                  <button className="round-action decline"><svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" dangerouslySetInnerHTML={{__html: '<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>'}}/></button>
                </div>
              </div>
              <div className="req-item">
                <div className="info">
                  <div className="name">Marie Kamara</div>
                  <div className="sub">Walk-in triage</div>
                  <div className="meta">1 hour ago</div>
                </div>
                <div className="btns">
                  <button className="round-action accept"><svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" dangerouslySetInnerHTML={{__html: '<polyline points="20 6 9 17 4 12"/>'}}/></button>
                  <button className="round-action decline"><svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" dangerouslySetInnerHTML={{__html: '<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>'}}/></button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Bottom row alerts */}
          <div className="card" style={{ width: '100%' }}>
            <div className="card-head">
              <div className="card-title">Important Alerts</div>
            </div>
            
            <div className="alert-item">
              <div className="alert-ic red"><svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" dangerouslySetInnerHTML={{__html: '<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>'}}/></div>
              <div className="txt">
                <b>Critical Vitals</b> — Patient Aminata Kamara shows abnormal HR (120) and BP (160/95). Immediate attention required.
                <div className="time">Just now</div>
              </div>
            </div>
            
            <div className="alert-item">
              <div className="alert-ic amber"><svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" dangerouslySetInnerHTML={{__html: '<path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>'}}/></div>
              <div className="txt">
                <b>Bed Shortage</b> — Triage ward B is currently at 95% capacity. Only 2 beds available.
                <div className="time">15 mins ago</div>
              </div>
            </div>
            
            <div className="alert-item">
              <div className="alert-ic blue"><svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" dangerouslySetInnerHTML={{__html: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>'}}/></div>
              <div className="txt">
                <b>Lab Result Ready</b> — Rapid malaria test for Mohamed Bangura is complete.
                <div className="time">1 hour ago</div>
              </div>
            </div>
            
            <div className="alert-item">
              <div className="alert-ic brand"><svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" dangerouslySetInnerHTML={{__html: '<polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 17 22 12"/>'}}/></div>
              <div className="txt">
                <b>Blockchain Sync</b> — 45 triage records successfully hashed and synced to MediChain SL network.
                <div className="time">2 hours ago</div>
              </div>
            </div>
          </div>
        </>
      )}
    </LayoutWrapper>
  )
}
