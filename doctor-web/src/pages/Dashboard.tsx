import React from 'react';
import { Users, Calendar, FileText, Activity, TrendingUp, Clock } from 'lucide-react';

const Dashboard: React.FC = () => {
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
              1,248
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
            <div className="stat-value">24</div>
            <div className="stat-label">Today's Appointments</div>
          </div>

          <div className="stat-card">
            <div className="stat-icon-wrapper orange">
              <FileText size={24} />
            </div>
            <div className="stat-value">156</div>
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
            <div className="stat-label">On-chain Sync Rate</div>
          </div>
        </div>

        <div className="appointments-area">
          <div className="card-header">
            <h3 className="card-title">Upcoming Appointments</h3>
            <a href="#" className="view-all">View Schedule</a>
          </div>
          <div className="appointment-list">
            {[
              { name: 'Michael Chen', time: '09:00 AM', type: 'Follow up - Cardiology', status: 'Upcoming', img: 'MC' },
              { name: 'Emma Watson', time: '10:30 AM', type: 'Annual Checkup', status: 'Upcoming', img: 'EW' },
              { name: 'James Rodriguez', time: '11:45 AM', type: 'ECG Results Review', status: 'Upcoming', img: 'JR' },
              { name: 'Sophia Miller', time: '02:00 PM', type: 'Consultation', status: 'Upcoming', img: 'SM' },
            ].map((apt, i) => (
              <div className="appointment-item" key={i}>
                <div className="patient-info">
                  <div className="patient-avatar" style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    backgroundColor: `hsl(${i * 60 + 200}, 70%, 85%)`, 
                    color: `hsl(${i * 60 + 200}, 70%, 30%)`, 
                    fontWeight: 'bold' 
                  }}>
                    {apt.img}
                  </div>
                  <div className="patient-details">
                    <h4>{apt.name}</h4>
                    <p>{apt.type}</p>
                  </div>
                </div>
                <div className="appointment-time">
                  <span className="time-badge">{apt.time}</span>
                  <span className={`status-badge status-${apt.status.toLowerCase()}`}>{apt.status}</span>
                </div>
              </div>
            ))}
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
                <p className="activity-text"><strong>Michael Chen's</strong> lab results synced to blockchain.</p>
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
                <ShieldCheck size={18} />
              </div>
              <div className="activity-content">
                <p className="activity-text">Access granted by <strong>James Rodriguez</strong>.</p>
                <span className="activity-time">2 hours ago</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ShieldCheck: React.FC<{size?: number}> = ({size = 18}) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/>
  </svg>
);

export default Dashboard;
