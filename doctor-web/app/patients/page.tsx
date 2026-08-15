'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

const I = {
  search: '<circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/>',
  filter: '<path d="M4 6h16M7 12h10M10 18h4"/>',
  sort:   '<path d="M7 3v18M4 6l3-3 3 3M17 21V3M14 18l3 3 3-3"/>',
  grid:   '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
  list:   '<path d="M4 6h16M4 12h16M4 18h16"/>',
  plus:   '<path d="M12 5v14M5 12h14"/>',
  edit:   '<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/>',
  trash:  '<path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>',
  download: '<path d="M12 3v12m0 0l-4.5-4.5M12 15l4.5-4.5"/><path d="M4 18v1a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-1"/>',
};

function Icon({ d, size = 16 }: { d: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true" dangerouslySetInnerHTML={{ __html: d }} />
  );
}

// Mock backend API
const backendApi = {
  getAccessiblePatients: async () => {
    return new Promise((resolve) => setTimeout(() => resolve([
      { id: '1001', name: 'Fatima Koroma', procedure: 'Hip replacement', status: 'Ready', date: '28.08.2025', doctor: 'Dr. Amadu Williams', tags: ['ASA II', 'ICU needed', 'High Risk'], tone: 'green' },
      { id: '1002', name: 'Ibrahim Bangura', procedure: 'Cardiac Bypass', status: 'At-Risk', date: '01.09.2025', doctor: 'Dr. Isatu Kamara', tags: ['ASA IV', 'High Risk'], tone: 'red' },
      { id: '1003', name: 'Aminata Sesay', procedure: 'Appendectomy', status: 'In Progress', date: '08.09.2025', doctor: 'Dr. Moses Fofanah', tags: ['ASA I'], tone: 'amber' },
      { id: '1004', name: 'Mohamed Conteh', procedure: 'Hernia Repair', status: 'At-Risk', date: '09.09.2025', doctor: 'Dr. Bintu Koroma', tags: ['ASA II', 'ICU needed'], tone: 'red' },
      { id: '1005', name: 'Kadiatu Jalloh', procedure: 'Cataract Surgery', status: 'Discharged', date: '15.08.2025', doctor: 'Dr. John Davies', tags: ['ASA II'], tone: 'ink' },
      { id: '1006', name: 'Suleiman Turay', procedure: 'Knee Replacement', status: 'Ready', date: '10.09.2025', doctor: 'Dr. Amadu Williams', tags: ['ASA III', 'High Risk'], tone: 'green' },
      { id: '1007', name: 'Zainab Mansaray', procedure: 'Gallbladder Removal', status: 'In Progress', date: '12.09.2025', doctor: 'Dr. Isatu Kamara', tags: ['ASA I'], tone: 'amber' },
      { id: '1008', name: 'Abu Bakarr', procedure: 'Spinal Fusion', status: 'At-Risk', date: '20.09.2025', doctor: 'Dr. Moses Fofanah', tags: ['ASA IV', 'ICU needed'], tone: 'red' }
    ]), 800));
  }
};

export default function PatientsPage() {
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    backendApi.getAccessiblePatients()
      .then((data: any) => {
        setPatients(data);
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  }, []);

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 className="page-title">All patients view</h1>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <div className="search" style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <div style={{ position: 'absolute', left: '10px', color: 'var(--gray-500)', display: 'flex' }}><Icon d={I.search} size={14} /></div>
            <input type="text" placeholder="Search patients..." style={{ paddingLeft: '32px', height: '36px', borderRadius: 'var(--r-md)', border: '1px solid var(--gray-300)', fontSize: '14px' }} />
          </div>
          <button className="btn btn-soft"><Icon d={I.filter} /> Filter</button>
          <button className="btn btn-soft"><Icon d={I.sort} /> Sort</button>
          <div className="view-toggle" style={{ display: 'flex', background: 'var(--gray-100)', borderRadius: 'var(--r-md)', padding: '2px' }}>
            <button className={`icon-btn ghost ${view === 'list' ? 'active' : ''}`} style={{ background: view === 'list' ? 'white' : 'transparent', boxShadow: view === 'list' ? 'var(--shadow-sm)' : 'none' }} onClick={() => setView('list')}><Icon d={I.list} /></button>
            <button className={`icon-btn ghost ${view === 'grid' ? 'active' : ''}`} style={{ background: view === 'grid' ? 'white' : 'transparent', boxShadow: view === 'grid' ? 'var(--shadow-sm)' : 'none' }} onClick={() => setView('grid')}><Icon d={I.grid} /></button>
          </div>
          <button className="btn btn-outline"><Icon d={I.download} /> Export data</button>
          <button className="btn btn-primary"><Icon d={I.plus} /> New patient</button>
        </div>
      </div>

      {loading && (
        <div className={view === 'grid' ? "grid grid-4" : ""} style={{ gap: '16px' }}>
          {[1, 2, 3, 4, 5, 6, 7, 8].map(n => (
            <div key={n} className="patient-card" style={{ opacity: 0.5, animation: 'pulse 1.5s infinite' }}>
              <div style={{ height: '24px', background: 'var(--gray-200)', borderRadius: '4px', marginBottom: '16px' }}></div>
              <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'var(--gray-200)' }}></div>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ height: '14px', width: '30%', background: 'var(--gray-200)', borderRadius: '4px' }}></div>
                  <div style={{ height: '16px', width: '70%', background: 'var(--gray-200)', borderRadius: '4px' }}></div>
                </div>
              </div>
              <div style={{ height: '100px', background: 'var(--gray-200)', borderRadius: '4px' }}></div>
            </div>
          ))}
        </div>
      )}

      {error && !loading && (
        <div className="mc-notice danger">Failed to load patients. Please check your connection.</div>
      )}

      {!loading && !error && patients.length === 0 && (
        <div className="mc-empty">
          <div style={{ marginBottom: '12px', color: 'var(--gray-400)' }}><Icon d={I.search} size={48} /></div>
          <h3>No patients found</h3>
          <p>Get started by adding a new patient to the registry.</p>
        </div>
      )}

      {!loading && !error && patients.length > 0 && view === 'grid' && (
        <div className="grid grid-4" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
          {patients.map(p => (
            <Link href={`/patients/${p.id}`} key={p.id} style={{ textDecoration: 'none', color: 'inherit' }}>
              <div className="patient-card">
                <div className="top" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <input type="checkbox" style={{ width: 16, height: 16 }} onClick={(e) => e.stopPropagation()} />
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button className="icon-btn ghost" style={{ width: 30, height: 30 }} onClick={(e) => e.preventDefault()}><Icon d={I.edit} size={13} /></button>
                    <button className="icon-btn ghost" style={{ width: 30, height: 30 }} onClick={(e) => e.preventDefault()}><Icon d={I.trash} size={13} /></button>
                  </div>
                </div>
                <div className="idrow" style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '16px' }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--brand-light)', color: 'var(--brand)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 18, flexShrink: 0 }}>
                    {p.name.charAt(0)}
                  </div>
                  <div>
                    <div className="id" style={{ fontSize: '12px', color: 'var(--gray-500)', fontWeight: 500 }}>ID: {p.id}</div>
                    <div className="name" style={{ fontSize: '15px', fontWeight: 600, color: 'var(--ink-900)' }}>{p.name}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px', fontSize: '13px' }}>
                  <div className="prow" style={{ display: 'flex', justifyContent: 'space-between' }}><span className="k" style={{ color: 'var(--gray-500)' }}>Procedure:</span><span className="v" style={{ fontWeight: 500, color: 'var(--ink-900)' }}>{p.procedure}</span></div>
                  <div className="prow" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span className="k" style={{ color: 'var(--gray-500)' }}>Status:</span>
                    <span className={`badge badge-${p.tone}`}><i className="dot" style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: 'currentColor', marginRight: 4 }} />{p.status}</span>
                  </div>
                  <div className="prow" style={{ display: 'flex', justifyContent: 'space-between' }}><span className="k" style={{ color: 'var(--gray-500)' }}>Procedure date:</span><span className="v" style={{ fontWeight: 500, color: 'var(--ink-900)' }}>{p.date}</span></div>
                  <div className="prow" style={{ display: 'flex', justifyContent: 'space-between' }}><span className="k" style={{ color: 'var(--gray-500)' }}>Assigned physician:</span><span className="v" style={{ fontWeight: 500, color: 'var(--ink-900)' }}>{p.doctor}</span></div>
                </div>
                <div className="tags" style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                  {p.tags.map((t: string) => <span key={t} className="chip" style={{ fontSize: '11px', padding: '2px 8px', background: 'var(--gray-100)', color: 'var(--gray-600)', borderRadius: '4px', fontWeight: 500 }}>#{t}</span>)}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {!loading && !error && patients.length > 0 && view === 'list' && (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table className="dtable" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--gray-200)', background: 'var(--gray-50)' }}>
                <th style={{ padding: '12px 16px', width: '40px' }}><input type="checkbox" /></th>
                <th style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--gray-600)' }}>Patient</th>
                <th style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--gray-600)' }}>Procedure</th>
                <th style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--gray-600)' }}>Status</th>
                <th style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--gray-600)' }}>Date</th>
                <th style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--gray-600)' }}>Physician</th>
                <th style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--gray-600)' }}>Tags</th>
                <th style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--gray-600)', textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {patients.map(p => (
                <tr key={p.id} style={{ borderBottom: '1px solid var(--gray-100)' }}>
                  <td style={{ padding: '12px 16px' }}><input type="checkbox" /></td>
                  <td style={{ padding: '12px 16px' }}>
                    <Link href={`/patients/${p.id}`} style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--brand-light)', color: 'var(--brand)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 13 }}>{p.name.charAt(0)}</div>
                      <div>
                        <div style={{ fontWeight: 600, color: 'var(--ink-900)' }}>{p.name}</div>
                        <div style={{ fontSize: '11px', color: 'var(--gray-500)' }}>ID: {p.id}</div>
                      </div>
                    </Link>
                  </td>
                  <td style={{ padding: '12px 16px', color: 'var(--ink-900)', fontWeight: 500 }}>{p.procedure}</td>
                  <td style={{ padding: '12px 16px' }}><span className={`badge badge-${p.tone}`}><i className="dot" style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: 'currentColor', marginRight: 4 }} />{p.status}</span></td>
                  <td style={{ padding: '12px 16px', color: 'var(--ink-900)' }}>{p.date}</td>
                  <td style={{ padding: '12px 16px', color: 'var(--ink-900)' }}>{p.doctor}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                      {p.tags.slice(0,2).map((t: string) => <span key={t} className="chip" style={{ fontSize: '11px', padding: '2px 6px', background: 'var(--gray-100)', color: 'var(--gray-600)', borderRadius: '4px' }}>#{t}</span>)}
                      {p.tags.length > 2 && <span className="chip" style={{ fontSize: '11px', padding: '2px 6px', background: 'var(--gray-100)', color: 'var(--gray-600)', borderRadius: '4px' }}>+{p.tags.length - 2}</span>}
                    </div>
                  </td>
                  <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '4px' }}>
                      <button className="icon-btn ghost" style={{ width: 28, height: 28 }}><Icon d={I.edit} size={14} /></button>
                      <button className="icon-btn ghost" style={{ width: 28, height: 28 }}><Icon d={I.trash} size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
