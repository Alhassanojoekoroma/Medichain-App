import React, { useState } from 'react';
import { ClipboardList, Search, Eye, ShieldCheck, AlertCircle, CheckCircle, Clock } from 'lucide-react';

interface AccessLogEntry {
  id: string;
  timestamp: string;
  action: 'READ' | 'WRITE' | 'DELETE' | 'GRANT' | 'REVOKE';
  actor: string;
  actorRole: string;
  patientName: string;
  recordId: string;
  txHash: string;
  status: 'Approved' | 'Denied' | 'Pending';
}

const MOCK_ACCESS_LOGS: AccessLogEntry[] = [
  { id: 'LOG-001', timestamp: '2026-05-09 09:15:22', action: 'READ', actor: 'Dr. Sarah Jenkins', actorRole: 'Doctor', patientName: 'Michael Chen', recordId: 'REC-001', txHash: '0xa1b2c3d4...e5f6', status: 'Approved' },
  { id: 'LOG-002', timestamp: '2026-05-09 08:43:11', action: 'WRITE', actor: 'Dr. Sarah Jenkins', actorRole: 'Doctor', patientName: 'Emma Watson', recordId: 'REC-002', txHash: '0xf7a8b9c0...d1e2', status: 'Approved' },
  { id: 'LOG-003', timestamp: '2026-05-09 08:12:05', action: 'GRANT', actor: 'Dr. Sarah Jenkins', actorRole: 'Doctor', patientName: 'James Rodriguez', recordId: 'REC-003', txHash: '0x3e4f5a6b...c7d8', status: 'Approved' },
  { id: 'LOG-004', timestamp: '2026-05-08 17:30:44', action: 'READ', actor: 'Nurse Linda Osei', actorRole: 'Nurse', patientName: 'Sophia Miller', recordId: 'REC-004', txHash: '—', status: 'Denied' },
  { id: 'LOG-005', timestamp: '2026-05-08 15:22:10', action: 'WRITE', actor: 'Dr. Sarah Jenkins', actorRole: 'Doctor', patientName: 'Michael Chen', recordId: 'REC-005', txHash: '0x9c0d1e2f...a3b4', status: 'Approved' },
  { id: 'LOG-006', timestamp: '2026-05-08 12:05:33', action: 'REVOKE', actor: 'Dr. Sarah Jenkins', actorRole: 'Doctor', patientName: 'David Wilson', recordId: 'REC-006', txHash: '0x5c6d7e8f...b9a0', status: 'Approved' },
  { id: 'LOG-007', timestamp: '2026-05-07 10:11:00', action: 'DELETE', actor: 'Admin System', actorRole: 'System', patientName: 'Emma Watson', recordId: 'REC-007', txHash: '—', status: 'Denied' },
  { id: 'LOG-008', timestamp: '2026-05-07 09:55:21', action: 'READ', actor: 'Dr. Sarah Jenkins', actorRole: 'Doctor', patientName: 'James Rodriguez', recordId: 'REC-008', txHash: '0x2f3a4b5c...6d7e', status: 'Approved' },
];

const actionColors: Record<string, { bg: string; color: string }> = {
  READ: { bg: '#DBEAFE', color: '#1D4ED8' },
  WRITE: { bg: '#DCFCE7', color: '#166534' },
  DELETE: { bg: '#FEE2E2', color: '#DC2626' },
  GRANT: { bg: '#F3E8FF', color: '#7E22CE' },
  REVOKE: { bg: '#FFF7ED', color: '#C2410C' },
};

const AccessLog: React.FC = () => {
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filtered = MOCK_ACCESS_LOGS.filter(log => {
    const matchSearch = log.patientName.toLowerCase().includes(search.toLowerCase()) ||
      log.actor.toLowerCase().includes(search.toLowerCase()) ||
      log.recordId.toLowerCase().includes(search.toLowerCase());
    const matchAction = actionFilter === 'all' || log.action === actionFilter;
    const matchStatus = statusFilter === 'all' || log.status === statusFilter;
    return matchSearch && matchAction && matchStatus;
  });

  const approvedCount = MOCK_ACCESS_LOGS.filter(l => l.status === 'Approved').length;
  const deniedCount = MOCK_ACCESS_LOGS.filter(l => l.status === 'Denied').length;

  return (
    <div className="page-container">
      <div className="page-header animate-fade-in">
        <div>
          <h1 className="heading-2 page-title" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <ClipboardList color="var(--primary)" size={26} />
            Patient Data Access Log
          </h1>
          <p className="page-subtitle">Immutable blockchain audit trail of all data access events.</p>
        </div>
        <button className="btn btn-outline" onClick={() => alert('Generating cryptographic audit report...\nFormat: PDF / JSON-LD\nSignature: PalmsChain Authority Certificate')}>
          <ShieldCheck size={18} />
          <span>Export Audit Report</span>
        </button>
      </div>

      {/* Stats */}
      <div className="stats-row animate-fade-in" style={{ gridTemplateColumns: 'repeat(4, 1fr)', animationDelay: '0.05s' }}>
        <div className="stat-card">
          <div className="stat-icon-wrapper blue"><ClipboardList size={20} /></div>
          <div className="stat-value">{MOCK_ACCESS_LOGS.length}</div>
          <div className="stat-label">Total Events</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon-wrapper green"><CheckCircle size={20} /></div>
          <div className="stat-value">{approvedCount}</div>
          <div className="stat-label">Approved</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon-wrapper orange"><AlertCircle size={20} /></div>
          <div className="stat-value">{deniedCount}</div>
          <div className="stat-label">Denied</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon-wrapper purple"><Eye size={20} /></div>
          <div className="stat-value">{MOCK_ACCESS_LOGS.filter(l => l.action === 'READ').length}</div>
          <div className="stat-label">Read Events</div>
        </div>
      </div>

      {/* Filters */}
      <div className="table-filters animate-fade-in" style={{ animationDelay: '0.1s', flexWrap: 'wrap', gap: '12px' }}>
        <div className="search-bar table-search" style={{ flex: 1, minWidth: '200px' }}>
          <Search size={18} color="var(--text-muted)" />
          <input
            type="text"
            placeholder="Search by patient, actor, or record ID..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <select
            value={actionFilter}
            onChange={e => setActionFilter(e.target.value)}
            style={{
              padding: '8px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)',
              background: 'var(--surface)', color: 'var(--text-main)', fontSize: '13px', cursor: 'pointer'
            }}
          >
            <option value="all">All Actions</option>
            {['READ', 'WRITE', 'DELETE', 'GRANT', 'REVOKE'].map(a => <option key={a} value={a}>{a}</option>)}
          </select>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            style={{
              padding: '8px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)',
              background: 'var(--surface)', color: 'var(--text-main)', fontSize: '13px', cursor: 'pointer'
            }}
          >
            <option value="all">All Statuses</option>
            <option value="Approved">Approved</option>
            <option value="Denied">Denied</option>
            <option value="Pending">Pending</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="table-container animate-fade-in" style={{ animationDelay: '0.15s' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>Action</th>
              <th>Actor</th>
              <th>Patient</th>
              <th>Record ID</th>
              <th>Tx Hash</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(log => {
              const ac = actionColors[log.action] || { bg: '#F1F5F9', color: '#64748B' };
              return (
                <tr key={log.id}>
                  <td style={{ fontFamily: 'monospace', fontSize: '12px', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                    {log.timestamp}
                  </td>
                  <td>
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', padding: '3px 10px',
                      borderRadius: '100px', fontSize: '11px', fontWeight: 700,
                      background: ac.bg, color: ac.color, letterSpacing: '0.05em'
                    }}>
                      {log.action}
                    </span>
                  </td>
                  <td>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '13px' }}>{log.actor}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{log.actorRole}</div>
                    </div>
                  </td>
                  <td style={{ fontWeight: 500 }}>{log.patientName}</td>
                  <td style={{ fontFamily: 'monospace', fontSize: '12px' }}>{log.recordId}</td>
                  <td style={{ fontFamily: 'monospace', fontSize: '11px', color: 'var(--text-muted)' }}>
                    {log.txHash}
                  </td>
                  <td>
                    <span className={`status-badge ${
                      log.status === 'Approved' ? 'status-completed' :
                      log.status === 'Denied' ? 'status-no-show' : 'status-upcoming'
                    }`} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      {log.status === 'Approved' && <CheckCircle size={11} />}
                      {log.status === 'Denied' && <AlertCircle size={11} />}
                      {log.status === 'Pending' && <Clock size={11} />}
                      {log.status}
                    </span>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)' }}>
                  No access events match your filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AccessLog;
