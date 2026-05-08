import React from 'react';
import { Search, UserPlus, MoreVertical, Filter } from 'lucide-react';

const Patients: React.FC = () => {
  const patients = [
    { id: '1', name: 'Michael Chen', age: 42, gender: 'Male', lastVisit: '2024-03-15', condition: 'Hypertension', status: 'Active' },
    { id: '2', name: 'Emma Watson', age: 28, gender: 'Female', lastVisit: '2024-03-18', condition: 'Checkup', status: 'Active' },
    { id: '3', name: 'James Rodriguez', age: 35, gender: 'Male', lastVisit: '2024-03-20', condition: 'Post-op', status: 'Active' },
    { id: '4', name: 'Sophia Miller', age: 54, gender: 'Female', lastVisit: '2024-03-22', condition: 'Diabetes', status: 'Active' },
    { id: '5', name: 'David Wilson', age: 61, gender: 'Male', lastVisit: '2024-03-25', condition: 'Cardiology', status: 'Inactive' },
  ];

  return (
    <div className="page-container">
      <div className="page-header animate-fade-in">
        <div>
          <h1 className="heading-2 page-title">My Patients</h1>
          <p className="page-subtitle">Manage and view your patient records securely.</p>
        </div>
        <button className="btn-primary">
          <UserPlus size={18} />
          <span>Add New Patient</span>
        </button>
      </div>

      <div className="table-filters animate-fade-in" style={{ animationDelay: '0.1s' }}>
        <div className="search-bar table-search">
          <Search size={18} color="var(--text-muted)" />
          <input type="text" placeholder="Filter by name, ID, or condition..." />
        </div>
        <button className="btn-outline">
          <Filter size={18} />
          <span>Filters</span>
        </button>
      </div>

      <div className="table-container animate-fade-in" style={{ animationDelay: '0.2s' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Patient Name</th>
              <th>Age / Gender</th>
              <th>Last Visit</th>
              <th>Condition</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {patients.map((patient) => (
              <tr key={patient.id}>
                <td>
                  <div className="table-cell-user">
                    <div className="avatar-sm">{patient.name.split(' ').map(n => n[0]).join('')}</div>
                    <span className="font-semibold">{patient.name}</span>
                  </div>
                </td>
                <td>{patient.age} / {patient.gender}</td>
                <td>{patient.lastVisit}</td>
                <td><span className="condition-tag">{patient.condition}</span></td>
                <td>
                  <span className={`status-dot ${patient.status.toLowerCase()}`}></span>
                  {patient.status}
                </td>
                <td>
                  <button className="icon-btn-sm">
                    <MoreVertical size={18} />
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

export default Patients;
