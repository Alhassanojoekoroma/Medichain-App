'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

function Icon({ d, size = 16 }: { d: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true" dangerouslySetInnerHTML={{ __html: d }} />
  );
}
const I = {
  users:    '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8"/>',
  calendar: '<rect x="3" y="5" width="18" height="16" rx="3"/><path d="M16 3v4M8 3v4M3 10h18"/>',
  info:     '<circle cx="12" cy="12" r="9"/><path d="M12 16v-5M12 8h.01"/>',
  plus:     '<path d="M12 5v14M5 12h14" stroke-width="3"/>',
  download: '<path d="M12 3v12m0 0l-4.5-4.5M12 15l4.5-4.5"/><path d="M4 18v1a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-1"/>',
  filter:   '<path d="M4 6h16M7 12h10M10 18h4"/>',
  sort:     '<path d="M7 3v18M4 6l3-3 3 3M17 21V3M14 18l3 3 3-3"/>',
  chevD:    '<path d="M6 9l6 6 6-6"/>',
};

/* Heatmap data — disease/case frequency grid */
const HEATMAP_ROWS = ['Malaria', 'Typhoid', 'Anaemia', 'Hypertension', 'Diabetes'];
const HEATMAP_COLS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
const HEATMAP_DATA = [
  [0.85, 0.78, 0.92, 0.67, 0.45, 0.72],
  [0.55, 0.48, 0.61, 0.70, 0.52, 0.44],
  [0.40, 0.45, 0.38, 0.55, 0.42, 0.60],
  [0.30, 0.35, 0.28, 0.32, 0.40, 0.38],
  [0.25, 0.28, 0.22, 0.30, 0.35, 0.29],
];

/* Stacked bars — cases by month */
const STACKBARS = [
  { mon: 'Mar', surgery: 45, consult: 80, lab: 35 },
  { mon: 'Apr', surgery: 52, consult: 95, lab: 40 },
  { mon: 'May', surgery: 38, consult: 72, lab: 28 },
  { mon: 'Jun', surgery: 61, consult: 110, lab: 49 },
  { mon: 'Jul', surgery: 70, consult: 125, lab: 55 },
  { mon: 'Aug', surgery: 82, consult: 140, lab: 62 },
];

/* Area chart — patient trend (simple SVG path) */
function AreaChart() {
  const w = 480; const h = 120;
  const vals = [42, 55, 38, 67, 80, 72, 95, 88, 110, 102, 120, 115];
  const max = Math.max(...vals);
  const pts = vals.map((v, i) => [
    (i / (vals.length - 1)) * w,
    h - (v / max) * (h - 16),
  ]);
  const linePath = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ');
  const areaPath = `${linePath} L${w},${h} L0,${h} Z`;
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return (
    <div style={{ overflowX: 'auto' }}>
      <svg viewBox={`0 0 ${w} ${h + 24}`} style={{ width: '100%', minWidth: 320 }}>
        {/* Area fill */}
        <defs>
          <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--brand)" stopOpacity="0.18" />
            <stop offset="100%" stopColor="var(--brand)" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={areaPath} fill="url(#areaGrad)" />
        <path d={linePath} fill="none" stroke="var(--brand)" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
        {/* Dots */}
        {pts.map((p, i) => (
          <circle key={i} cx={p[0]} cy={p[1]} r={4} fill="var(--brand)" />
        ))}
        {/* x-axis labels */}
        {vals.map((_, i) => (
          <text key={i} x={(i / (vals.length - 1)) * w} y={h + 18}
            textAnchor="middle" fontSize={10} fill="var(--gray-500)" fontFamily="var(--font-body)">
            {months[i]}
          </text>
        ))}
      </svg>
    </div>
  );
}

/* Stacked vertical bars — case types by month */
function StackedVBars() {
  const maxTotal = Math.max(...STACKBARS.map(b => b.surgery + b.consult + b.lab));
  const maxH = 140;
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 14, height: maxH, position: 'relative' }}>
      {STACKBARS.map(b => {
        const total = b.surgery + b.consult + b.lab;
        const scale = maxH / maxTotal;
        const h1 = b.lab * scale;
        const h2 = b.consult * scale;
        const h3 = b.surgery * scale;
        return (
          <div key={b.mon} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0 }}>
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', borderRadius: '8px 8px 0 0', overflow: 'hidden' }}>
              <div style={{ background: 'var(--brand)', height: h3 }} title={`Surgery: ${b.surgery}`} />
              <div style={{ background: 'var(--brand-tint)', height: h2 }} title={`Consult: ${b.consult}`} />
              <div style={{ background: 'var(--gray-200)', height: h1 }} title={`Lab: ${b.lab}`} />
            </div>
            <div style={{ fontSize: 10.5, color: 'var(--gray-500)', marginTop: 6 }}>{b.mon}</div>
          </div>
        );
      })}
    </div>
  );
}

/* Heatmap component */
function InsightsHeatmap() {
  return (
    <div className="heatmap" style={{
      display: 'grid',
      gridTemplateColumns: `80px repeat(${HEATMAP_COLS.length}, 1fr)`,
      gap: 6,
      alignItems: 'center',
    }}>
      <div />
      {HEATMAP_COLS.map(c => <div key={c} className="clabel">{c}</div>)}
      {HEATMAP_ROWS.map((row, ri) => (
        <>
          <div key={`rl-${ri}`} className="rlabel">{row}</div>
          {HEATMAP_COLS.map((_, ci) => {
            const v = HEATMAP_DATA[ri][ci];
            return (
              <div key={ci} className="cell"
                style={{ background: `rgba(13,148,38,${0.1 + v * 0.85})` }}
                title={`${row} · ${HEATMAP_COLS[ci]}: ${Math.round(v * 100)}%`}
              />
            );
          })}
        </>
      ))}
    </div>
  );
}

/* Bottleneck / care gaps table */
const BOTTLENECKS = [
  { id: '01', area: 'Lab turnaround', dept: 'Laboratory', avg: '4.2h', target: '2h', severity: 'red' },
  { id: '02', area: 'ICU bed wait', dept: 'Inpatient', avg: '3.1h', target: '1h', severity: 'red' },
  { id: '03', area: 'Pharmacy wait', dept: 'Pharmacy', avg: '1.8h', target: '45min', severity: 'amber' },
  { id: '04', area: 'Consult delays', dept: 'Outpatient', avg: '52min', target: '30min', severity: 'amber' },
  { id: '05', area: 'Discharge process', dept: 'Ward', avg: '2.3h', target: '2h', severity: 'blue' },
];

export default function AnalyticsPage() {
  const router = useRouter();
  const [period, setPeriod] = useState<'3mo' | '6mo' | '1yr'>('3mo');

  return (
    <div className="page-body" style={{ padding: '28px 32px' }}>

      {/* Page header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Clinical Insights</h1>
          <p style={{ color: 'var(--gray-500)', fontSize: 13.5, marginTop: 4 }}>
            Aggregated analytics for your hospital and assigned patients.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <div className="toggle-group">
            {(['3mo','6mo','1yr'] as const).map(p => (
              <button key={p} className={period === p ? 'active' : ''} onClick={() => setPeriod(p)}>
                {p === '3mo' ? '3 month' : p === '6mo' ? '6 month' : '1 year'}
              </button>
            ))}
          </div>
          <button className="btn btn-outline">
            <Icon d={I.filter} size={16} /> Filter
          </button>
          <button className="btn btn-outline">
            <Icon d={I.download} size={16} /> Export data
          </button>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-4" style={{ marginBottom: 20 }}>
        {[
          { icon: I.users, title: 'Total patients seen', value: 620, delta: '+28', unit: '' },
          { icon: I.plus, title: 'Procedures completed', value: 184, delta: '+12', unit: '' },
          { icon: I.calendar, title: 'Avg wait time', value: '42min', delta: '-8%', unit: '' },
          { icon: I.info, title: 'Patient satisfaction', value: '85%', delta: '-2%', unit: '' },
        ].map(kpi => (
          <div key={kpi.title} className="card">
            <div className="card-head">
              <div className="card-title">
                <span className="ic"><Icon d={kpi.icon} size={16} /></span>
                {kpi.title}
              </div>
              <button className="link-more">View more</button>
            </div>
            <div className="kpi-value">
              <span className="n num">{kpi.value}</span>
              <span className={`delta ${kpi.delta.startsWith('-') ? 'delta-down' : 'delta-up'}`}>
                {kpi.delta}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Area chart + stacked bars */}
      <div className="grid grid-2" style={{ marginBottom: 20 }}>
        <div className="card">
          <div className="card-head">
            <div className="card-title">
              <span className="ic"><Icon d={I.users} size={16} /></span>
              Patient volume trend
            </div>
            <button className="link-more">View all</button>
          </div>
          <div className="kpi-value">
            <span className="n num">1,247</span>
            <span className="delta delta-up">+48</span>
          </div>
          <AreaChart />
        </div>

        <div className="card">
          <div className="card-head">
            <div className="card-title">
              <span className="ic"><Icon d={I.plus} size={16} /></span>
              Case types by month
            </div>
            <button className="link-more">View all</button>
          </div>
          <div className="chart-legend">
            <span><i style={{ background: 'var(--brand)' }} />Surgery</span>
            <span><i style={{ background: 'var(--brand-tint)' }} />Consultation</span>
            <span><i style={{ background: 'var(--gray-200)' }} />Lab</span>
          </div>
          <StackedVBars />
        </div>
      </div>

      {/* Heatmap + Bottlenecks */}
      <div className="grid grid-2" style={{ marginBottom: 20 }}>
        <div className="card">
          <div className="card-head">
            <div className="card-title">
              <span className="ic"><Icon d={I.info} size={16} /></span>
              Disease frequency by month
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <span className="toggle-group">
                <button className="active">Diagnosis</button>
                <button>Procedure</button>
              </span>
            </div>
          </div>
          <div className="kpi-value">
            <span className="n num">5 conditions</span>
          </div>
          <InsightsHeatmap />
          <div style={{ fontSize: 11.5, color: 'var(--gray-400)', marginTop: 12 }}>
            Darker green = higher frequency. Data from EMR records at this hospital.
          </div>
        </div>

        <div className="card">
          <div className="card-head">
            <div className="card-title">
              <span className="ic"><Icon d={I.calendar} size={16} /></span>
              Care bottlenecks
            </div>
            <button className="link-more">View all</button>
          </div>
          <div style={{ marginTop: 4 }}>
            {BOTTLENECKS.map(b => (
              <div key={b.id} className="bottleneck-row" style={{ gridTemplateColumns: '24px 1.6fr .8fr 1fr 1fr 1.2fr' }}>
                <span className="bn-icon">{b.id}</span>
                <span style={{ fontWeight: 700, fontSize: 13 }}>{b.area}</span>
                <span style={{ color: 'var(--gray-500)', fontSize: 12.5 }}>{b.dept}</span>
                <span className="num" style={{ fontWeight: 700, fontSize: 13 }}>{b.avg}</span>
                <span style={{ color: 'var(--gray-400)', fontSize: 12 }}>Target: {b.target}</span>
                <span className={`badge badge-${b.severity}`}>
                  <i className="dot" />
                  {b.severity === 'red' ? 'Critical' : b.severity === 'amber' ? 'At risk' : 'On track'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}
