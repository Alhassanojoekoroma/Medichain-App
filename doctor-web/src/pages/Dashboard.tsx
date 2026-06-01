import React from 'react';
import { Users, Calendar, FileText, Activity, TrendingUp, Clock, AlertTriangle, ShieldCheck as ShieldCheckIcon, RefreshCw, Server } from 'lucide-react';
import { Link } from 'react-router-dom';
import { MOCK_PATIENTS, MOCK_APPOINTMENTS, MOCK_RECORDS } from '../services/mockData';

const Dashboard: React.FC = () => {
  const today = new Date().toISOString().split('T')[0];
  const todayAppointments = MOCK_APPOINTMENTS.filter(a => a.date === today);
  const pendingReviews = MOCK_RECORDS.filter(r => r.status === 'Pending').length;
  const [isSyncing, setIsSyncing] = React.useState(false);

  const handleForceSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      alert("PalmsChain Ledger Sync Completed!\n\nStatus: 7/7 records successfully synced.\nBlock Number: 18524738\nValidators: Waterloo, Connaught, Freetown");
    }, 2000);
  };
  
  return (
    <div className="page-container">
      <div className="page-header animate-fade-in">
        <div>
          <h1 className="heading-2 page-title">Welcome back, Dr. Jenkins</h1>
          <p className="page-subtitle">Here's your daily overview for {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
        </div>
      </div>

      <div className="dashboard-grid animate-fade-in" style={{ animationDelay: '0.1s' }}>
        <div className="stats-row">
          <div className="stat-card">
            <div className="stat-icon-wrapper blue">
              <Users size={24} />
            </div>
            <div className="stat-value">
              {MOCK_PATIENTS.length}
              <span className="stat-trend positive">
                <TrendingUp size={16} /> +12%
              </span>
            </div>
            <div className="stat-label">Total Patients</div>
          </div>

          <div className="stat-card">
            <div className="stat-icon-wrapper green">
              <Calendar size={24} />
            </div>
            <div className="stat-value">{todayAppointments.length}</div>
            <div className="stat-label">Today's Appointments</div>
          </div>

          <div className="stat-card">
            <div className="stat-icon-wrapper orange">
              <FileText size={24} />
            </div>
            <div className="stat-value">{pendingReviews}</div>
            <div className="stat-label">Pending Reviews</div>
          </div>

          <div className="stat-card">
            <div className="stat-icon-wrapper purple">
              <Activity size={24} />
            </div>
            <div className="stat-value">
              98%
              <span className="stat-trend positive">
                <TrendingUp size={16} /> +1%
              </span>
            </div>
            <div className="stat-label">Ledger Sync Rate</div>
          </div>
        </div>

        <div className="appointments-area">
          <div className="card-header">
            <h3 className="card-title">Upcoming Appointments</h3>
            <Link to="/appointments" className="view-all">View Schedule</Link>
          </div>
          <div className="appointment-list">
            {todayAppointments.slice(0, 4).map((apt, i) => (
              <div className="appointment-item" key={apt.id}>
                <div className="patient-info">
                  <div className="patient-avatar" style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    backgroundColor: `hsl(${i * 60 + 200}, 70%, 85%)`, 
                    color: `hsl(${i * 60 + 200}, 70%, 30%)`, 
                    fontWeight: 'bold' 
                  }}>
                    {apt.patientInitials}
                  </div>
                  <div className="patient-details">
                    <h4>{apt.patientName}</h4>
                    <p>{apt.category}</p>
                  </div>
                </div>
                <div className="appointment-time">
                  <span className="time-badge">{apt.startTime}</span>
                  <span className={`status-badge status-${apt.status.toLowerCase().replace(' ', '-')}`}>{apt.status}</span>
                </div>
              </div>
            ))}
            {todayAppointments.length === 0 && <p className="text-muted">No appointments today.</p>}
          </div>
        </div>

        <div className="activity-area">
          <div className="card-header">
            <h3 className="card-title">Recent Activity</h3>
          </div>
          <div className="activity-feed">
            <div className="activity-item">
              <div className="activity-icon">
                <FileText size={18} />
              </div>
              <div className="activity-content">
                <p className="activity-text"><strong>Michael Chen's</strong> lab results synced to Hyperledger Fabric.</p>
                <span className="activity-time">10 mins ago</span>
              </div>
            </div>
            <div className="activity-item">
              <div className="activity-icon">
                <Clock size={18} />
              </div>
              <div className="activity-content">
                <p className="activity-text">Appointment rescheduled with <strong>Emma Watson</strong>.</p>
                <span className="activity-time">1 hour ago</span>
              </div>
            </div>
            <div className="activity-item">
              <div className="activity-icon">
                <ShieldCheckIcon size={18} />
              </div>
              <div className="activity-content">
                <p className="activity-text">Access granted by <strong>James Rodriguez</strong>.</p>
                <span className="activity-time">2 hours ago</span>
              </div>
            </div>
          </div>
        </div>

        <div className="appointments-area" style={{ gridColumn: 'span 6' }}>
          <div className="card-header">
            <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertTriangle color="var(--warning)" size={20} />
              Drug Interaction Alerts
            </h3>
          </div>
          <div className="appointment-list">
            <div className="appointment-item" style={{ borderLeft: '3px solid var(--warning)' }}>
              <div>
                <h4 style={{ color: 'var(--text-main)', marginBottom: '4px' }}>James Rodriguez</h4>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Oxycodone + Amoxicillin</p>
              </div>
              <span className="badge-warning" style={{ padding: '4px 8px', borderRadius: '4px', fontSize: '12px', background: '#FFF7ED', color: '#B45309', fontWeight: 600 }}>Medium Risk</span>
            </div>
            <div className="appointment-item" style={{ borderLeft: '3px solid #DC2626' }}>
              <div>
                <h4 style={{ color: 'var(--text-main)', marginBottom: '4px' }}>Sophia Miller</h4>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Metformin + Glipizide</p>
              </div>
              <span className="badge-danger" style={{ padding: '4px 8px', borderRadius: '4px', fontSize: '12px', background: '#FEF2F2', color: '#DC2626', fontWeight: 600 }}>High Risk</span>
            </div>
          </div>
        </div>

        <div className="activity-area" style={{ gridColumn: 'span 6' }}>
          <div className="card-header">
            <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Server color="var(--primary)" size={20} />
              Blockchain Health
            </h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: 'var(--bg-color)', borderRadius: 'var(--radius-md)' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Network Status</span>
              <span style={{ color: 'var(--success)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}><div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--success)' }}></div> Connected</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: 'var(--bg-color)', borderRadius: 'var(--radius-md)' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Total Records on Chain</span>
              <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>12,492</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: 'var(--bg-color)', borderRadius: 'var(--radius-md)' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Pending Sync</span>
              <span style={{ color: 'var(--warning)', fontWeight: 600 }}>{pendingReviews}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: 'var(--bg-color)', borderRadius: 'var(--radius-md)' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Last Sync</span>
              <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>2 mins ago</span>
            </div>
            <button 
              className="btn btn-primary" 
              onClick={handleForceSync} 
              disabled={isSyncing} 
              style={{ width: '100%', marginTop: '8px', opacity: isSyncing ? 0.7 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
            >
              <RefreshCw size={16} style={{ animation: isSyncing ? 'spin 2s linear infinite' : 'none' }} />
              <span>{isSyncing ? 'Syncing Ledger...' : 'Force Sync Now'}</span>
            </button>
            
            <style>{`
              @keyframes spin {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
              }
            `}</style>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
