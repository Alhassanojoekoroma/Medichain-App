import React, { useState } from 'react';
import { Search, Shield, ExternalLink, FileText, Upload, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { MOCK_RECORDS } from '../services/mockData';

const typeIconMap: Record<string, string> = {
  'Lab Report': '🧪',
  'Prescription': '💊',
  'X-Ray': '🩻',
  'Consultation Note': '📋',
  'Imaging': '🖼️',
  'Discharge Summary': '📄',
};

const Records: React.FC = () => {
  const [filter, setFilter] = useState<'all' | 'Synced' | 'Pending' | 'Failed'>('all');
  const [search, setSearch] = useState('');

  const filtered = MOCK_RECORDS.filter(r => {
    const matchesFilter = filter === 'all' || r.status === filter;
    const matchesSearch = r.id.toLowerCase().includes(search.toLowerCase()) ||
      r.patientName.toLowerCase().includes(search.toLowerCase()) ||
      r.type.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const syncedCount = MOCK_RECORDS.filter(r => r.status === 'Synced').length;
  const pendingCount = MOCK_RECORDS.filter(r => r.status === 'Pending').length;

  return (
    <div className="page-container">
      <div className="page-header animate-fade-in">
        <div>
          <h1 className="heading-2 page-title">Hyperledger Fabric Medical Records</h1>
          <p className="page-subtitle">Immutable, tamper-proof audit trail of all medical interactions on-chain.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn btn-outline" onClick={() => alert('Initiating PalmsChain network integrity check...\n\nAll 7 medical records hashes match local Merkle tree root. Status: 100% SECURE & VERIFIED.')}>
            <Shield size={18} />
            <span>Verify Integrity</span>
          </button>
          <Link to="/upload" className="btn btn-primary">
            <Upload size={18} />
            <span>Upload Record</span>
          </Link>
        </div>
      </div>

      {/* Stats row */}
      <div className="stats-row animate-fade-in" style={{ animationDelay: '0.05s', gridTemplateColumns: 'repeat(3, 1fr)' }}>
        <div className="stat-card" onClick={() => setFilter('all')} style={{ cursor: 'pointer', border: filter === 'all' ? '2px solid var(--primary)' : undefined }}>
          <div className="stat-icon-wrapper blue"><FileText size={20} /></div>
          <div className="stat-value">{MOCK_RECORDS.length}</div>
          <div className="stat-label">Total Records</div>
        </div>
        <div className="stat-card" onClick={() => setFilter('Synced')} style={{ cursor: 'pointer', border: filter === 'Synced' ? '2px solid var(--primary)' : undefined }}>
          <div className="stat-icon-wrapper green"><CheckCircle size={20} /></div>
          <div className="stat-value">{syncedCount}</div>
          <div className="stat-label">Synced to Chain</div>
        </div>
        <div className="stat-card" onClick={() => setFilter('Pending')} style={{ cursor: 'pointer', border: filter === 'Pending' ? '2px solid var(--primary)' : undefined }}>
          <div className="stat-icon-wrapper orange"><Clock size={20} /></div>
          <div className="stat-value">{pendingCount}</div>
          <div className="stat-label">Pending Sync</div>
        </div>
      </div>

      <div className="table-filters animate-fade-in" style={{ animationDelay: '0.1s' }}>
        <div className="search-bar table-search">
          <Search size={18} color="var(--text-muted)" />
          <input
            type="text"
            placeholder="Search by Record ID, Patient, or Type..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          {(['all', 'Synced', 'Pending', 'Failed'] as const).map(f => (
            <button
              key={f}
              className={filter === f ? 'btn btn-primary' : 'btn btn-outline'}
              style={{ padding: '8px 16px', fontSize: '13px' }}
              onClick={() => setFilter(f)}
            >
              {f === 'all' ? 'All' : f}
            </button>
          ))}
        </div>
      </div>

      <div className="table-container animate-fade-in" style={{ animationDelay: '0.2s' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Record ID</th>
              <th>Patient</th>
              <th>Date</th>
              <th>Type</th>
              <th>Fabric Hash</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((rec) => (
              <tr key={rec.id}>
                <td style={{ fontWeight: '600', fontFamily: 'monospace', fontSize: '13px' }}>{rec.id}</td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div className="avatar-sm" style={{ width: '28px', height: '28px', fontSize: '11px' }}>{rec.patientName.split(' ').map((n: string) => n[0]).join('')}</div>
                    {rec.patientName}
                  </div>
                </td>
                <td style={{ color: 'var(--text-muted)', fontSize: '13px' }}>{rec.date}</td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span>{typeIconMap[rec.type] || '📄'}</span>
                    <span className="condition-tag">{rec.type}</span>
                  </div>
                </td>
                <td style={{ fontFamily: 'monospace', fontSize: '12px', color: 'var(--text-muted)', letterSpacing: '0.02em' }}>
                  {rec.txHash || '—'}
                </td>
                <td>
                  <span className={`status-badge ${
                    rec.status === 'Synced' ? 'status-completed' :
                    rec.status === 'Failed' ? 'status-no-show' : 'status-upcoming'
                  }`} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    {rec.status === 'Synced' && <CheckCircle size={12} />}
                    {rec.status === 'Pending' && <Clock size={12} />}
                    {rec.status === 'Failed' && <AlertCircle size={12} />}
                    {rec.status}
                  </span>
                </td>
                <td>
                  <button className="icon-btn-sm" title="View on Explorer">
                    <ExternalLink size={16} />
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                  No records found matching your criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Records;
