"use client";

import React, { useState, useEffect } from "react";

const DISTRICTS = [
  { name: "Western Area Urban", pct: 72, cases: 1842 },
  { name: "Western Area Rural", pct: 58, cases: 654 },
  { name: "Bo", pct: 65, cases: 923 },
  { name: "Kenema", pct: 61, cases: 741 },
  { name: "Kono", pct: 53, cases: 312 },
  { name: "Bombali", pct: 68, cases: 488 },
  { name: "Kailahun", pct: 44, cases: 267 },
  { name: "Kambia", pct: 71, cases: 198 },
  { name: "Karene", pct: 49, cases: 143 },
  { name: "Moyamba", pct: 63, cases: 221 },
  { name: "Pujehun", pct: 55, cases: 176 },
  { name: "Port Loko", pct: 69, cases: 534 },
  { name: "Tonkolili", pct: 57, cases: 289 },
  { name: "Falaba", pct: 41, cases: 91 },
];

const HEATMAP_DATA = [
  { row: "Pujehun Central", cells: [0.2, 0.3, 0.4, 0.7, 0.85, 0.9] },
  { row: "Bo Town", cells: [0.4, 0.5, 0.5, 0.6, 0.7, 0.8] },
  { row: "Kenema City", cells: [0.3, 0.4, 0.4, 0.3, 0.2, 0.1] },
  { row: "Kambia District", cells: [0.1, 0.1, 0.2, 0.2, 0.3, 0.2] },
  { row: "Bombali Sebora", cells: [0.5, 0.4, 0.3, 0.2, 0.1, 0.1] },
];

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate network loading
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="mc-empty">
        <div className="mc-skeleton" style={{ width: 200, height: 32, marginBottom: 16 }}></div>
        <div className="mc-skeleton" style={{ width: 120, height: 24 }}></div>
      </div>
    );
  }

  return (
    <>
      <div className="page-header">
        <div>
          <div style={{ fontSize: 14, color: 'var(--gray-500)', fontWeight: 600, marginBottom: 4 }}>Ministry of Health — Sierra Leone</div>
          <h1 className="page-title">National Health Dashboard</h1>
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <button className="btn btn-soft">
            <i dangerouslySetInnerHTML={{ __html: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>` }} />
            Export
          </button>
          <div className="search">
            <i dangerouslySetInnerHTML={{ __html: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>` }} />
            <input type="date" defaultValue="2026-08-06" style={{ background: 'transparent', border: 'none', outline: 'none' }} />
          </div>
        </div>
      </div>

      <div className="grid grid-4" style={{ marginBottom: 32 }}>
        {/* KPI 1 */}
        <div className="card">
          <div className="card-head">
            <div className="card-title">National cases</div>
            <span className="delta delta-up">+312</span>
          </div>
          <div className="kpi-value">
            <span className="n">12,847</span>
          </div>
          <div className="vbar-chart">
            {[20, 35, 45, 30, 60, 50, 80].map((h, i) => (
              <div key={i} className={`bar ${i === 6 ? 'hi' : ''}`} style={{ height: `${h}%` }}></div>
            ))}
          </div>
        </div>

        {/* KPI 2 */}
        <div className="card">
          <div className="card-head">
            <div className="card-title">Active outbreaks</div>
          </div>
          <div className="kpi-value" style={{ marginBottom: 0 }}>
            <span className="n">3</span>
          </div>
          <div style={{ marginTop: 16 }}>
            <span className="badge badge-red"><i className="dot"></i>Immediate Action</span>
          </div>
        </div>

        {/* KPI 3 */}
        <div className="card">
          <div className="card-head">
            <div className="card-title">Vaccine coverage</div>
          </div>
          <div className="kpi-value" style={{ marginBottom: 0 }}>
            <span className="n">67%</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: 16 }}>
            <svg width="120" height="60" viewBox="0 0 100 50">
              {Array.from({ length: 8 }).map((_, i) => {
                const angle = -90 + (i * (180 / 7));
                return (
                  <line 
                    key={i} 
                    x1="50" y1="50" x2="50" y2="10" 
                    stroke={i < 5 ? "var(--brand)" : "var(--gray-200)"} 
                    strokeWidth="8" 
                    strokeLinecap="round" 
                    transform={`rotate(${angle} 50 50)`} 
                  />
                );
              })}
            </svg>
          </div>
        </div>

        {/* KPI 4 */}
        <div className="card">
          <div className="card-head">
            <div className="card-title">Connected facilities</div>
            <span className="delta delta-up">+2</span>
          </div>
          <div className="kpi-value">
            <span className="n">48</span>
          </div>
          <div className="hstack" style={{ marginTop: 24 }}>
            <div style={{ width: '58%', background: 'var(--brand)', height: '100%' }}></div>
            <div style={{ width: '29%', background: 'var(--brand-tint)', height: '100%' }}></div>
            <div style={{ width: '13%', background: 'var(--gray-200)', height: '100%' }}></div>
          </div>
          <div style={{ display: 'flex', gap: 12, fontSize: 12, color: 'var(--gray-500)', marginTop: 8 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><i style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--brand)' }}></i> Govt: 28</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><i style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--brand-tint)' }}></i> Pvt: 14</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><i style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--gray-200)' }}></i> NGO: 6</span>
          </div>
        </div>
      </div>

      <h2 style={{ fontSize: 18, color: 'var(--ink-900)', marginBottom: 16 }}>Districts — Vaccine Coverage</h2>
      <div className="grid grid-4" style={{ marginBottom: 32 }}>
        {DISTRICTS.map((d) => {
          let tone = 'green';
          if (d.pct < 50) tone = 'red';
          else if (d.pct <= 65) tone = 'amber';

          const rate = d.pct / 100;
          return (
            <div key={d.name} className="card" style={{ textAlign: 'center', padding: '18px 14px' }}>
              <div style={{ fontSize: 12, color: 'var(--gray-500)', fontWeight: 700, marginBottom: 10 }}>{d.name}</div>
              <div className="gauge-ring-wrap" style={{ height: 80 }}>
                <svg width={120} height={80} viewBox="0 0 120 80" style={{ overflow: 'visible' }}>
                  <path d="M12 68 A48 48 0 0 1 108 68" fill="none" stroke="var(--gray-200)" strokeWidth={12} strokeLinecap="round" />
                  <path d="M12 68 A48 48 0 0 1 108 68" fill="none" stroke="var(--brand)" strokeWidth={12} strokeLinecap="round" strokeDasharray={150.8} strokeDashoffset={150.8 * (1 - rate)} />
                </svg>
                <div className="gauge-center" style={{ top: '65%' }}>
                  <div className="n num" style={{ fontSize: 20 }}>{d.pct}%</div>
                </div>
              </div>
              <div style={{ fontSize: 12, color: 'var(--gray-500)', marginTop: 6 }}>Vaccine coverage</div>
              <span className={`badge badge-${tone}`} style={{ marginTop: 8 }}>
                <i className="dot" />{d.cases.toLocaleString()} cases
              </span>
            </div>
          );
        })}
      </div>

      <div className="grid grid-2">
        {/* Left Col: Heatmap */}
        <div className="card">
          <div className="card-head">
            <div className="card-title">Case Density by Chiefdom — 6 Month Heatmap</div>
          </div>
          <div className="heatmap" style={{ gridTemplateColumns: "120px repeat(6, 1fr)" }}>
            <div className="clabel"></div>
            <div className="clabel">Jan</div>
            <div className="clabel">Feb</div>
            <div className="clabel">Mar</div>
            <div className="clabel">Apr</div>
            <div className="clabel">May</div>
            <div className="clabel">Jun</div>

            {HEATMAP_DATA.map((row) => (
              <React.Fragment key={row.row}>
                <div className="rlabel">{row.row}</div>
                {row.cells.map((val, i) => (
                  <div key={i} className="cell" style={{ background: `rgba(23, 77, 122, ${val})` }} title={`Value: ${val}`}></div>
                ))}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Right Col: Alerts */}
        <div className="card">
          <div className="card-head">
            <div className="card-title">National Alerts</div>
          </div>
          <div className="alert-item">
            <div className="alert-ic red">
              <i dangerouslySetInnerHTML={{ __html: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>` }} />
            </div>
            <div className="txt">
              <b>Outbreak alert</b> — Bo District, Lassa fever cluster
              <div className="time">Just now</div>
            </div>
          </div>
          
          <div className="alert-item">
            <div className="alert-ic amber">
              <i dangerouslySetInnerHTML={{ __html: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>` }} />
            </div>
            <div className="txt">
              <b>Vaccine shortage</b> — Kailahun, resupply ETA 5 days
              <div className="time">2 hours ago</div>
            </div>
          </div>

          <div className="alert-item">
            <div className="alert-ic blue">
              <i dangerouslySetInnerHTML={{ __html: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>` }} />
            </div>
            <div className="txt">
              <b>3 new facilities registered</b> — Port Loko District
              <div className="time">5 hours ago</div>
            </div>
          </div>

          <div className="alert-item">
            <div className="alert-ic brand">
              <i dangerouslySetInnerHTML={{ __html: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>` }} />
            </div>
            <div className="txt">
              <b>Hyperledger Fabric sync complete</b> — 48 facilities
              <div className="time">1 day ago</div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
