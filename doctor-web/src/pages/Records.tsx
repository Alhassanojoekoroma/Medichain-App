import React from 'react';
import { Search, Filter, Shield, ExternalLink, FileText } from 'lucide-react';

const Records: React.FC = () => {
  const records = [
    { id: 'REC-001', patient: 'Michael Chen', date: '2024-03-25', type: 'Lab Report', hash: '0x7f23...a1b2', status: 'Synced' },
    { id: 'REC-002', patient: 'Emma Watson', date: '2024-03-24', type: 'Prescription', hash: '0x3a45...c9d0', status: 'Synced' },
    { id: 'REC-003', patient: 'James Rodriguez', date: '2024-03-22', type: 'X-Ray Result', hash: '0x1e89...f4e5', status: 'Pending' },
    { id: 'REC-004', patient: 'Michael Chen', date: '2024-03-20', type: 'Consultation Note', hash: '0x9d12...b6c7', status: 'Synced' },
  ];

  return (
    <div className="page-container">
      <div className="page-header animate-fade-in">
        <div>
          <h1 className="heading-2 page-title">Blockchain Medical Records</h1>
          <p className="page-subtitle">Immutable audit trail of all medical interactions.</p>
        </div>
        <button className="btn-primary">
          <Shield size={18} />
          <span>Verify Integrity</span>
        </button>
      </div>

      <div className="table-filters animate-fade-in" style={{ animationDelay: '0.1s' }}>
        <div className="search-bar table-search">
          <Search size={18} color="var(--text-muted)" />
          <input type="text" placeholder="Search by Record ID or Patient..." />
        </div>
        <div className="flex gap-2">
          <button className="btn-outline">
            <Filter size={18} />
            <span>Filter</span>
          </button>
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
              <th>On-Chain Hash</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {records.map((rec) => (
              <tr key={rec.id}>
                <td className="font-semibold">{rec.id}</td>
                <td>{rec.patient}</td>
                <td>{rec.date}</td>
                <td>
                  <div className="flex items-center gap-2">
                    <FileText size={16} className="text-primary" />
                    {rec.type}
                  </div>
                </td>
                <td className="font-mono text-xs text-muted">{rec.hash}</td>
                <td>
                  <span className={`status-badge ${rec.status === 'Synced' ? 'status-completed' : 'status-upcoming'}`}>
                    {rec.status}
                  </span>
                </td>
                <td>
                  <button className="icon-btn-sm">
                    <ExternalLink size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Records;
