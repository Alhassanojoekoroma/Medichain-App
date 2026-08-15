'use client';

import React, { useState, useEffect } from 'react';

function Icon({ d, size = 16 }: { d: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden dangerouslySetInnerHTML={{ __html: d }} />
  );
}

export default function HospitalsPage() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  const hospitals = [
    { name: 'Connaught Hospital', init: 'C', loc: 'Freetown', dist: 'Western Area', beds: 400, users: 142, records: '2,341', status: 'Active', sClass: 'badge-green' },
    { name: 'Ola During Children\'s Hospital', init: 'O', loc: 'Freetown', dist: 'Western Area', beds: 150, users: 89, records: '1,502', status: 'Active', sClass: 'badge-green' },
    { name: 'Princess Christian Maternity Hospital', init: 'P', loc: 'Freetown', dist: 'Western Area', beds: 200, users: 112, records: '1,833', status: 'Active', sClass: 'badge-green' },
    { name: 'Lumley Hospital', init: 'L', loc: 'Lumley', dist: 'Western Area', beds: 80, users: 24, records: '145', status: 'Onboarding', sClass: 'badge-amber' },
    { name: 'Macauley Street Hospital', init: 'M', loc: 'Freetown', dist: 'Western Area', beds: 60, users: 0, records: '0', status: 'Suspended', sClass: 'badge-red' },
    { name: 'King Harman Road Hospital', init: 'K', loc: 'Freetown', dist: 'Western Area', beds: 100, users: 45, records: '320', status: 'Inactive', sClass: 'badge-ink' },
    { name: 'Bo Government Hospital', init: 'B', loc: 'Bo City', dist: 'Bo District', beds: 350, users: 95, records: '1,120', status: 'Active', sClass: 'badge-green' },
    { name: 'Kenema Government Hospital', init: 'K', loc: 'Kenema', dist: 'Kenema District', beds: 300, users: 88, records: '984', status: 'Active', sClass: 'badge-green' },
  ];

  if (loading) {
    return (
      <div className="grid">
        <div className="mc-skeleton" style={{ height: 100 }} />
        <div className="mc-skeleton card" style={{ height: 500 }} />
      </div>
    );
  }

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Hospitals Management</h1>
          <p style={{ color: 'var(--gray-500)', fontSize: 13.5, marginTop: 4 }}>Manage registered facilities across Sierra Leone.</p>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <div className="search">
            <Icon d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" size={18} />
            <input type="text" placeholder="Search hospitals..." />
          </div>
          <button className="btn btn-primary">
            <Icon d="M12 4v16m8-8H4" />
            Register Hospital
          </button>
        </div>
      </div>

      <div className="card">
        <div className="card-head">
          <div className="card-title">Facilities Directory</div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-soft" style={{ minHeight: 36, padding: '6px 14px', fontSize: 13 }}>Filter</button>
            <button className="btn btn-outline" style={{ minHeight: 36, padding: '6px 14px', fontSize: 13 }}>Export</button>
          </div>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="dtable">
            <thead>
              <tr>
                <th>Hospital Name</th>
                <th>Location</th>
                <th>District</th>
                <th>Beds</th>
                <th>Users</th>
                <th>Records</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {hospitals.map((h, i) => (
                <tr key={i}>
                  <td>
                    <div className="cell-user">
                      <div className="avatar" style={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--brand-light)', color: 'var(--brand)' }}>
                        {h.init}
                      </div>
                      {h.name}
                    </div>
                  </td>
                  <td style={{ color: 'var(--gray-600)' }}>{h.loc}</td>
                  <td style={{ color: 'var(--gray-600)' }}>{h.dist}</td>
                  <td className="num">{h.beds}</td>
                  <td className="num">{h.users}</td>
                  <td className="num">{h.records}</td>
                  <td><span className={`badge ${h.sClass}`}><i className="dot" />{h.status}</span></td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button className="icon-btn filled" style={{ width: 32, height: 32 }}><Icon d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" size={14} /></button>
                      <button className="icon-btn ghost" style={{ width: 32, height: 32 }}><Icon d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
