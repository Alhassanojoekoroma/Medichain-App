'use client';

import { useState } from 'react';

function Icon({ d, size = 16 }: { d: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true" dangerouslySetInnerHTML={{ __html: d }} />
  );
}
const I = {
  calendar: '<rect x="3" y="5" width="18" height="16" rx="3"/><path d="M16 3v4M8 3v4M3 10h18"/>',
  chevD:    '<path d="M6 9l6 6 6-6"/>',
  filter:   '<path d="M4 6h16M7 12h10M10 18h4"/>',
  plus:     '<path d="M12 5v14M5 12h14"/>',
  phone:    '<path d="M22 16.9v2a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3-8.7A2 2 0 0 1 4.1 1h2a2 2 0 0 1 2 1.7c.1.9.4 1.9.7 2.7a2 2 0 0 1-.5 2.1L7.1 8.7a16 16 0 0 0 6 6l1.2-1.2a2 2 0 0 1 2.1-.5c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.9 2.2z"/>',
  more:     '<circle cx="12" cy="5" r="1.3"/><circle cx="12" cy="12" r="1.3"/><circle cx="12" cy="19" r="1.3"/>',
  chevL:    '<path d="M15 18l-6-6 6-6"/>',
  chevR:    '<path d="M9 18l6-6-6-6"/>',
  clock:    '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/>',
  check:    '<path d="M20 6L9 17l-5-5"/>',
  x:        '<path d="M18 6L6 18M6 6l12 12"/>',
};

/* ── Doctor availability/schedule data ──────────────────────────────── */
const DOCTORS = [
  { id: 'd1', name: 'Dr. Amadu Williams',   role: 'General Surgeon',   avatar: 'AW' },
  { id: 'd2', name: 'Dr. Isatu Kamara',     role: 'Anaesthesiologist', avatar: 'IK' },
  { id: 'd3', name: 'Dr. Moses Fofanah',    role: 'Cardiologist',      avatar: 'MF' },
  { id: 'd4', name: 'Dr. Bintu Koroma',     role: 'Gynaecologist',     avatar: 'BK' },
];

type BlockType = 'primary' | 'ward' | 'consent' | 'break';

interface ScheduleBlock {
  label: string;
  type: BlockType;
  start: number; // col index 0-5 for 7-12 half-hours
  span: number;
}

const SCHEDULE: Record<string, ScheduleBlock[]> = {
  d1: [
    { label: 'Hip replacement — Fatima K.', type: 'primary', start: 0, span: 3 },
    { label: 'Ward round', type: 'ward', start: 3, span: 2 },
    { label: 'Consent sign', type: 'consent', start: 5, span: 1 },
  ],
  d2: [
    { label: 'Pre-op anaesthesia', type: 'primary', start: 0, span: 2 },
    { label: 'Break', type: 'break', start: 2, span: 1 },
    { label: 'Cardiac bypass — Ibrahim B.', type: 'primary', start: 3, span: 3 },
  ],
  d3: [
    { label: 'ECG review clinic', type: 'primary', start: 0, span: 2 },
    { label: 'Consent', type: 'consent', start: 2, span: 1 },
    { label: 'Ward round', type: 'ward', start: 3, span: 1 },
    { label: 'Break', type: 'break', start: 4, span: 1 },
    { label: 'Consult', type: 'primary', start: 5, span: 1 },
  ],
  d4: [
    { label: 'Break', type: 'break', start: 0, span: 1 },
    { label: 'Appendectomy — Aminata S.', type: 'primary', start: 1, span: 4 },
    { label: 'Consent', type: 'consent', start: 5, span: 1 },
  ],
};

const TIME_SLOTS = ['7:00', '7:30', '8:00', '8:30', '9:00', '9:30', '10:00', '10:30', '11:00', '11:30', '12:00'];
const GANTT_COLS = ['7:00–7:30', '7:30–8:30', '8:30–9:30', '9:30–10:30', '10:30–11:00', '11:00–12:00'];

const BLOCK_STYLE: Record<BlockType, string> = {
  primary: 'gb-primary',
  ward:    'gb-ward',
  consent: 'gb-consent',
  break:   'gb-break',
};

/* ── Appointment list ────────────────────────────────────────────────── */
const ALL_APPOINTMENTS = [
  { id: 'a1', name: 'Fatima Koroma',   type: 'Hip Replacement Surgery',     date: '22 Aug 2025', time: '09:00AM', doctor: 'Dr. Amadu Williams',  status: 'confirmed' },
  { id: 'a2', name: 'Ibrahim Bangura', type: 'Cardiac Bypass',               date: '22 Aug 2025', time: '10:30AM', doctor: 'Dr. Isatu Kamara',    status: 'confirmed' },
  { id: 'a3', name: 'Aminata Sesay',   type: 'Appendectomy',                 date: '22 Aug 2025', time: '12:00PM', doctor: 'Dr. Bintu Koroma',    status: 'confirmed' },
  { id: 'a4', name: 'Mohamed Conteh',  type: 'Hernia Repair',                date: '22 Aug 2025', time: '14:00PM', doctor: 'Dr. Moses Fofanah',   status: 'confirmed' },
  { id: 'a5', name: 'Mariatu Kamara',  type: 'Pre-op Consultation',          date: '22 Aug 2025', time: '15:30PM', doctor: 'Dr. Amadu Williams',  status: 'cancelled' },
  { id: 'a6', name: 'Alhassan Koroma', type: 'ENT Consultation',             date: '23 Aug 2025', time: '08:00AM', doctor: 'Dr. Isatu Kamara',    status: 'pending' },
  { id: 'a7', name: 'Adama Jalloh',   type: 'Orthopaedic Follow-up',        date: '23 Aug 2025', time: '10:00AM', doctor: 'Dr. Moses Fofanah',   status: 'confirmed' },
  { id: 'a8', name: 'Sia Mansaray',   type: 'Antenatal Check',              date: '23 Aug 2025', time: '11:30AM', doctor: 'Dr. Bintu Koroma',    status: 'confirmed' },
];

const STATUS_BADGE: Record<string, string> = {
  confirmed: 'badge-brand',
  pending:   'badge-amber',
  cancelled: 'badge-red',
};
const STATUS_LABEL: Record<string, string> = {
  confirmed: 'Confirmed',
  pending:   'Pending',
  cancelled: 'Cancelled',
};

/* ── Avatar initials ─────────────────────────────────────────────────── */
function InitialsAvatar({ name, size = 36 }: { name: string; size?: number }) {
  const initials = name.split(/\s+/).map(p => p[0]).join('').slice(0, 2).toUpperCase();
  return (
    <div style={{
      width: size, height: size, borderRadius: size * 0.3, flexShrink: 0,
      background: 'var(--brand-light)', color: 'var(--brand)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontWeight: 800, fontSize: size * 0.36, fontFamily: 'var(--font-display)',
    }}>
      {initials}
    </div>
  );
}

/* ── Page ────────────────────────────────────────────────────────────── */
export default function AppointmentsPage() {
  const [view, setView] = useState<'list' | 'gantt'>('list');
  const [selectedWeek] = useState('Aug 22–28, 2025');

  return (
    <div className="page-body" style={{ padding: '28px 32px' }}>

      {/* Page header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Appointments</h1>
          <p style={{ color: 'var(--gray-500)', fontSize: 13.5, marginTop: 4 }}>
            Manage your schedule and patient appointments.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <div className="view-toggle">
            <button className={view === 'list' ? 'active' : ''} onClick={() => setView('list')} aria-label="List view" title="List view">
              <Icon d="<path d='M4 6h16M4 12h16M4 18h16'/>" size={16} />
            </button>
            <button className={view === 'gantt' ? 'active' : ''} onClick={() => setView('gantt')} aria-label="Gantt view" title="Schedule view">
              <Icon d="<rect x='3' y='3' width='7' height='7' rx='1.5'/><rect x='14' y='3' width='7' height='7' rx='1.5'/><rect x='3' y='14' width='7' height='7' rx='1.5'/><rect x='14' y='14' width='7' height='7' rx='1.5'/>" size={16} />
            </button>
          </div>
          <button className="btn btn-outline">
            <Icon d={I.filter} size={16} /> Filter
          </button>
          <button className="btn btn-outline">
            <Icon d={I.calendar} size={16} /> {selectedWeek} <Icon d={I.chevD} size={14} />
          </button>
          <button className="btn btn-primary">
            <Icon d={I.plus} size={16} /> New appointment
          </button>
        </div>
      </div>

      {/* ── LIST VIEW ── */}
      {view === 'list' && (
        <div className="card">
          <div className="card-head">
            <div className="card-title">
              <span className="ic"><Icon d={I.calendar} size={16} /></span>
              All appointments
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <span className="badge badge-green"><i className="dot" />{ALL_APPOINTMENTS.filter(a => a.status === 'confirmed').length} Confirmed</span>
              <span className="badge badge-amber"><i className="dot" />{ALL_APPOINTMENTS.filter(a => a.status === 'pending').length} Pending</span>
              <span className="badge badge-red"><i className="dot" />{ALL_APPOINTMENTS.filter(a => a.status === 'cancelled').length} Cancelled</span>
            </div>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table className="dtable">
              <thead>
                <tr>
                  <th><span className="sort">Patient <Icon d="<path d='M7 3v18M4 6l3-3 3 3M17 21V3M14 18l3 3 3-3'/>" size={12} /></span></th>
                  <th>Appointment type</th>
                  <th><span className="sort">Date</span></th>
                  <th>Time</th>
                  <th>Assigned physician</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {ALL_APPOINTMENTS.map(appt => (
                  <tr key={appt.id}>
                    <td>
                      <div className="cell-user">
                        <InitialsAvatar name={appt.name} size={34} />
                        {appt.name}
                      </div>
                    </td>
                    <td style={{ color: 'var(--gray-500)' }}>{appt.type}</td>
                    <td style={{ color: 'var(--gray-500)', fontVariantNumeric: 'tabular-nums' }}>{appt.date}</td>
                    <td style={{ fontVariantNumeric: 'tabular-nums' }}>{appt.time}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <InitialsAvatar name={appt.doctor.replace('Dr. ', '')} size={28} />
                        <span style={{ fontSize: 13, fontWeight: 600 }}>{appt.doctor}</span>
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${STATUS_BADGE[appt.status]}`}>
                        <i className="dot" />{STATUS_LABEL[appt.status]}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 8 }}>
                        {appt.status !== 'cancelled' && (
                          <button className="icon-btn filled" style={{ width: 34, height: 34 }} aria-label={`Call ${appt.name}`} title={`Call ${appt.name}`}>
                            <Icon d={I.phone} size={15} />
                          </button>
                        )}
                        <button className="icon-btn ghost" style={{ width: 34, height: 34 }} aria-label="More options">
                          <Icon d={I.more} size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Pagination */}
          <div className="pagination">
            <span>Showing 1–8 of 8 appointments</span>
            <div className="page-controls">
              <button className="icon-btn ghost" style={{ width: 34, height: 34 }} aria-label="Previous page">
                <Icon d={I.chevL} size={14} />
              </button>
              <div className="page-box">Page <span style={{ background: 'var(--brand)', color: '#fff', padding: '2px 8px', borderRadius: 8, fontVariantNumeric: 'tabular-nums' }}>1</span> of 1</div>
              <button className="icon-btn ghost" style={{ width: 34, height: 34 }} aria-label="Next page">
                <Icon d={I.chevR} size={14} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── GANTT / SCHEDULE VIEW ── */}
      {view === 'gantt' && (
        <div className="card" style={{ overflowX: 'auto' }}>
          <div className="card-head">
            <div className="card-title">
              <span className="ic"><Icon d={I.clock} size={16} /></span>
              Team schedule — {selectedWeek}
            </div>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
              {[
                { cls: 'gb-primary', label: 'Surgery / procedure' },
                { cls: 'gb-ward',    label: 'Ward round' },
                { cls: 'gb-consent', label: 'Consent' },
                { cls: 'gb-break',   label: 'Break' },
              ].map(({ cls, label }) => (
                <span key={cls} className={`gantt-block ${cls}`} style={{ fontSize: 12 }}>
                  <i />{label}
                </span>
              ))}
            </div>
          </div>

          <table className="gantt" style={{ minWidth: 700 }}>
            <thead>
              <tr>
                <th style={{ width: 200, paddingBottom: 12 }}>Physician</th>
                {GANTT_COLS.map(col => (
                  <th key={col}>{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {DOCTORS.map(doc => (
                <tr key={doc.id}>
                  <td>
                    <div className="doc-cell">
                      <div style={{
                        width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                        background: 'var(--brand-light)', color: 'var(--brand)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 800, fontSize: 13,
                      }}>
                        {doc.avatar}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 13 }}>{doc.name}</div>
                        <div className="role" style={{ fontSize: 11.5, color: 'var(--gray-500)' }}>{doc.role}</div>
                      </div>
                    </div>
                  </td>
                  {/* Render schedule using CSS grid within the row */}
                  <td colSpan={GANTT_COLS.length} style={{ padding: '8px 6px', height: 62 }}>
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: `repeat(${GANTT_COLS.length}, 1fr)`,
                      gap: 4,
                      height: 46,
                    }}>
                      {SCHEDULE[doc.id].map((block, bi) => {
                        // Fill empty cells before block
                        const emptyCells = bi === 0 ? block.start : 0;
                        return (
                          <>
                            {bi === 0 && block.start > 0 && (
                              <div key={`empty-${bi}`} style={{ gridColumn: `1 / span ${block.start}` }} />
                            )}
                            <div
                              key={bi}
                              className={`gantt-block ${BLOCK_STYLE[block.type]}`}
                              style={{
                                gridColumn: `${block.start + 1} / span ${block.span}`,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 6,
                                fontSize: 11.5,
                                overflow: 'hidden',
                                padding: '6px 10px',
                                height: 46,
                              }}
                              title={block.label}
                            >
                              <i />
                              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {block.label}
                              </span>
                            </div>
                          </>
                        );
                      })}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Time axis */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '200px repeat(11, 1fr)',
            padding: '8px 6px 0',
            gap: 4,
          }}>
            <div />
            {TIME_SLOTS.map(t => (
              <div key={t} style={{ fontSize: 11, color: 'var(--gray-400)', textAlign: 'center', fontVariantNumeric: 'tabular-nums' }}>{t}</div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
