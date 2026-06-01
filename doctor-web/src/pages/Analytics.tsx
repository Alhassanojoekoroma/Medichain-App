import React, { useState } from 'react';
import {
  Users, Calendar, FileText,
  ArrowUp, ArrowDown, Activity, BarChart2
} from 'lucide-react';
import { MOCK_PATIENTS, MOCK_APPOINTMENTS, MOCK_RECORDS } from '../services/mockData';

const BAR_COLORS = ['#0D9426', '#70D182', '#0A7A1E', '#E8F5EC', '#3B82F6', '#8B5CF6'];

const Analytics: React.FC = () => {
  const [period, setPeriod] = useState<'7d' | '30d' | '90d'>('30d');

  const conditionCounts: Record<string, number> = {};
  MOCK_PATIENTS.forEach(p => {
    conditionCounts[p.condition] = (conditionCounts[p.condition] || 0) + 1;
  });
  const conditionData = Object.entries(conditionCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);
  const maxCondition = Math.max(...conditionData.map(d => d[1]));

  const statusCounts: Record<string, number> = {};
  MOCK_APPOINTMENTS.forEach(a => {
    statusCounts[a.status] = (statusCounts[a.status] || 0) + 1;
  });

  const syncedPct = Math.round((MOCK_RECORDS.filter(r => r.status === 'Synced').length / MOCK_RECORDS.length) * 100);

  const kpis = [
    { label: 'Total Patients', value: MOCK_PATIENTS.length, icon: Users, color: 'blue', trend: '+12%', up: true },
    { label: 'Total Appointments', value: MOCK_APPOINTMENTS.length, icon: Calendar, color: 'green', trend: '+8%', up: true },
    { label: 'Records on Chain', value: MOCK_RECORDS.length, icon: FileText, color: 'purple', trend: '+5%', up: true },
    { label: 'Ledger Sync Rate', value: `${syncedPct}%`, icon: Activity, color: 'orange', trend: '+1%', up: true },
  ];

  return (
    <div className="page-container">
      <div className="page-header animate-fade-in">
        <div>
          <h1 className="heading-2 page-title">Analytics Dashboard</h1>
          <p className="page-subtitle">Insights into patient outcomes, appointments, and blockchain activity.</p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          {(['7d', '30d', '90d'] as const).map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={period === p ? 'btn btn-primary' : 'btn btn-outline'}
              style={{ padding: '8px 16px', fontSize: '13px' }}
            >
              {p === '7d' ? 'Last 7 Days' : p === '30d' ? 'Last 30 Days' : 'Last 90 Days'}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="stats-row animate-fade-in" style={{ animationDelay: '0.05s' }}>
        {kpis.map((k, i) => (
          <div key={i} className="stat-card">
            <div className={`stat-icon-wrapper ${k.color}`}><k.icon size={22} /></div>
            <div className="stat-value">
              {k.value}
              <span className={`stat-trend ${k.up ? 'positive' : 'negative'}`}>
                {k.up ? <ArrowUp size={14} /> : <ArrowDown size={14} />} {k.trend}
              </span>
            </div>
            <div className="stat-label">{k.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginTop: '8px' }}>

        {/* Conditions Bar Chart */}
        <div className="card animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <div className="card-header" style={{ marginBottom: '24px' }}>
            <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <BarChart2 size={18} color="var(--primary)" /> Patient Conditions
            </h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {conditionData.map(([condition, count], i) => (
              <div key={condition}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}>
                  <span style={{ fontWeight: 600 }}>{condition}</span>
                  <span style={{ color: 'var(--text-muted)' }}>{count} patients</span>
                </div>
                <div style={{ background: 'var(--bg-color)', borderRadius: '4px', height: '8px', overflow: 'hidden' }}>
                  <div style={{
                    height: '100%',
                    width: `${(count / maxCondition) * 100}%`,
                    background: BAR_COLORS[i % BAR_COLORS.length],
                    borderRadius: '4px',
                    transition: 'width 0.8s ease'
                  }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Appointment Status Donut */}
        <div className="card animate-fade-in" style={{ animationDelay: '0.15s' }}>
          <div className="card-header" style={{ marginBottom: '24px' }}>
            <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Calendar size={18} color="var(--primary)" /> Appointment Breakdown
            </h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {Object.entries(statusCounts).map(([status, count]) => {
              const pct = Math.round((count / MOCK_APPOINTMENTS.length) * 100);
              const statusColors: Record<string, string> = {
                'Upcoming': '#0D9426', 'Completed': '#3B82F6',
                'In Progress': '#F97316', 'No-Show': '#EF4444', 'Cancelled': '#94A3B8'
              };
              return (
                <div key={status}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: statusColors[status] || '#94A3B8' }} />
                      <span style={{ fontWeight: 600 }}>{status}</span>
                    </div>
                    <span style={{ color: 'var(--text-muted)' }}>{count} ({pct}%)</span>
                  </div>
                  <div style={{ background: 'var(--bg-color)', borderRadius: '4px', height: '8px', overflow: 'hidden' }}>
                    <div style={{
                      height: '100%',
                      width: `${pct}%`,
                      background: statusColors[status] || '#94A3B8',
                      borderRadius: '4px',
                      transition: 'width 0.8s ease'
                    }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Blockchain Metrics */}
        <div className="card animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <div className="card-header" style={{ marginBottom: '24px' }}>
            <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Activity size={18} color="var(--primary)" /> Blockchain Metrics
            </h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              { label: 'Total Transactions', value: '12,492', change: '+247 this week', up: true },
              { label: 'Avg Confirmation Time', value: '1.8s', change: '-0.2s vs last week', up: true },
              { label: 'Failed Transactions', value: '3', change: '-5 vs last week', up: true },
              { label: 'Smart Contracts Invoked', value: '4,821', change: '+321 this week', up: true },
              { label: 'Active Peers', value: '8 / 8', change: '100% uptime', up: true },
            ].map((m, i) => (
              <div key={i} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '12px 16px', background: 'var(--bg-color)', borderRadius: 'var(--radius-md)'
              }}>
                <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>{m.label}</span>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 700, fontSize: '15px', color: 'var(--text-main)' }}>{m.value}</div>
                  <div style={{ fontSize: '11px', color: m.up ? 'var(--success)' : 'var(--danger)', display: 'flex', alignItems: 'center', gap: '2px', justifyContent: 'flex-end' }}>
                    {m.up ? <ArrowUp size={10} /> : <ArrowDown size={10} />} {m.change}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Patient Gender / Age Distribution */}
        <div className="card animate-fade-in" style={{ animationDelay: '0.25s' }}>
          <div className="card-header" style={{ marginBottom: '24px' }}>
            <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Users size={18} color="var(--primary)" /> Patient Demographics
            </h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Gender */}
            <div>
              <p style={{ fontSize: '13px', fontWeight: 600, marginBottom: '10px' }}>Gender Distribution</p>
              {(() => {
                const males = MOCK_PATIENTS.filter(p => p.gender === 'Male').length;
                const females = MOCK_PATIENTS.filter(p => p.gender === 'Female').length;
                const total = males + females;
                return (
                  <div style={{ display: 'flex', height: '24px', borderRadius: '8px', overflow: 'hidden', gap: '2px' }}>
                    <div style={{ width: `${(males / total) * 100}%`, background: '#3B82F6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', color: 'white', fontWeight: 600 }}>
                      ♂ {males}
                    </div>
                    <div style={{ width: `${(females / total) * 100}%`, background: '#EC4899', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', color: 'white', fontWeight: 600 }}>
                      ♀ {females}
                    </div>
                  </div>
                );
              })()}
            </div>
            {/* Age brackets */}
            <div>
              <p style={{ fontSize: '13px', fontWeight: 600, marginBottom: '10px' }}>Age Distribution</p>
              {[
                { label: '18–30', color: '#0D9426' },
                { label: '31–50', color: '#3B82F6' },
                { label: '51–70', color: '#F97316' },
                { label: '70+', color: '#8B5CF6' },
              ].map(({ label, color }) => {
                const [lo, hi] = label.split('–').map(Number);
                const count = MOCK_PATIENTS.filter(p => {
                  if (label === '70+') return p.age >= 70;
                  return p.age >= lo && p.age <= hi;
                }).length;
                const pct = Math.round((count / MOCK_PATIENTS.length) * 100);
                return (
                  <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                    <span style={{ fontSize: '12px', width: '40px', color: 'var(--text-muted)' }}>{label}</span>
                    <div style={{ flex: 1, background: 'var(--bg-color)', borderRadius: '4px', height: '8px', overflow: 'hidden' }}>
                      <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: '4px', transition: 'width 0.8s ease' }} />
                    </div>
                    <span style={{ fontSize: '12px', width: '30px', textAlign: 'right', color: 'var(--text-muted)' }}>{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
