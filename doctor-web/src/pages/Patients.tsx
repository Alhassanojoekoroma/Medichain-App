import React, { useState } from 'react';
import { Search, UserPlus, Eye, Filter } from 'lucide-react';
import { Link } from 'react-router-dom';
import { MOCK_PATIENTS } from '../services/mockData';

const Patients: React.FC = () => {
  const [patients] = useState(MOCK_PATIENTS);
  const [showInactive, setShowInactive] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const activeCount = patients.filter(p => p.status === 'Active' || p.status === 'Critical').length;
  const inactiveCount = patients.filter(p => p.status === 'Inactive').length;
  
  const filteredPatients = patients
    .filter(p => showInactive ? true : p.status !== 'Inactive')
    .filter(p => {
      if (!searchTerm) return true;
      const term = searchTerm.toLowerCase();
      return p.name.toLowerCase().includes(term) ||
             p.id.toLowerCase().includes(term) ||
             p.condition.toLowerCase().includes(term);
    });

  return (
    <div className="page-container">
      <div className="page-header animate-fade-in">
        <div>
          <h1 className="heading-2 page-title">My Patients</h1>
          <p className="page-subtitle">Manage and view your patient records securely.</p>
        </div>
        <Link to="/patients/new" className="btn btn-primary">
          <UserPlus size={18} />
          <span>Add New Patient</span>
        </Link>
      </div>

      <div className="table-filters animate-fade-in" style={{ animationDelay: '0.1s' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1 }}>
          <div className="search-bar table-search">
            <Search size={18} color="var(--text-muted)" />
            <input 
              type="text" 
              placeholder="Filter by name, ID, or condition..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
            Total: {filteredPatients.length} patients | {activeCount} active | {inactiveCount} inactive
          </span>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '14px', cursor: 'pointer' }}>
            <input 
              type="checkbox" 
              checked={showInactive} 
              onChange={() => setShowInactive(!showInactive)} 
              style={{ width: '16px', height: '16px', accentColor: 'var(--primary)' }}
            />
            Show Inactive
          </label>
          <button className="btn btn-outline" title="Filters coming soon">
            <Filter size={18} />
            <span>Filters</span>
          </button>
        </div>
      </div>

      <div className="table-container animate-fade-in" style={{ animationDelay: '0.2s' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Patient Name</th>
              <th>Age / Gender</th>
              <th>Last Visit</th>
              <th>Condition</th>
              <th>Allergies</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filteredPatients.map((patient) => (
              <tr key={patient.id} className={patient.status === 'Critical' ? 'status-critical' : ''}>
                <td>
                  <div className="table-cell-user">
                    <div className="avatar-sm">{patient.initials}</div>
                    <span style={{ fontWeight: '600' }}>{patient.name}</span>
                  </div>
                </td>
                <td>{patient.age} / {patient.gender}</td>
                <td>{patient.lastVisit}</td>
                <td><span className="condition-tag">{patient.condition}</span></td>
                <td>
                  {patient.allergies.length > 0 ? (
                    <span className="allergy-chip">{patient.allergies[0]}</span>
                  ) : (
                    <span className="text-muted">-</span>
                  )}
                </td>
                <td>
                  <span className={`status-dot ${patient.status.toLowerCase()}${patient.status === 'Critical' ? ' pulse' : ''}`} style={{ backgroundColor: patient.status === 'Active' ? '#10B981' : patient.status === 'Critical' ? '#E53E3E' : '#94A3B8' }}></span>
                  {patient.status}
                </td>
                <td>
                  <Link to={`/patients/${patient.id}`} className="icon-btn-sm" title="View Records">
                    <Eye size={18} />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Patients;
