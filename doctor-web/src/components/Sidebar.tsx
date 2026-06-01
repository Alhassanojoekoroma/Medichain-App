import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  FileText, 
  Settings, 
  ShieldCheck,
  QrCode,
  BarChart,
  Bell,
  ClipboardList,
  LogOut
} from 'lucide-react';
import { NavLink } from 'react-router-dom';

const Sidebar: React.FC = () => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/' },
    { id: 'patients', label: 'My Patients', icon: Users, path: '/patients' },
    { id: 'appointments', label: 'Appointments', icon: Calendar, path: '/appointments' },
    { id: 'records', label: 'Medical Records', icon: FileText, path: '/records' },
    { id: 'analytics', label: 'Analytics', icon: BarChart, path: '/analytics' },
    { id: 'scan', label: 'Scan QR Code', icon: QrCode, path: '/scan' },
    { id: 'access-log', label: 'Access Log', icon: ClipboardList, path: '/access-log' },
    { id: 'notifications', label: 'Notifications', icon: Bell, path: '/notifications' },
    { id: 'settings', label: 'Doctor Profile', icon: Settings, path: '/settings' },
  ];

  return (
    <aside className="sidebar">
      <div className="logo-container">
        <div className="logo-icon">
          <ShieldCheck size={24} />
        </div>
        <span className="logo-text">PalmsChain Portal</span>
      </div>

      <nav className="nav-menu">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.id}
              to={item.path}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              <Icon className="nav-item-icon" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="user-profile" style={{ flexDirection: 'column', gap: '1rem', alignItems: 'stretch' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div className="avatar">DR</div>
          <div className="user-info">
            <span className="user-name">Dr. Sarah Jenkins</span>
            <span className="user-role">Cardiologist</span>
          </div>
        </div>
        <button className="btn btn-ghost" onClick={() => {
          if (confirm('Are you sure you want to log out from PalmsChain Doctor Portal?')) {
            localStorage.removeItem('mc_doctor_token');
            alert('Logged out successfully.');
            window.location.reload();
          }
        }} style={{ justifyContent: 'flex-start', padding: '0.5rem', color: '#DC2626' }}>
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
