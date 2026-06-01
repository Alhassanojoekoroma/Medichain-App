import React, { useState } from 'react';
import { Bell, CheckCheck, AlertTriangle, Info, ShieldAlert, Trash2, CheckCircle } from 'lucide-react';

interface Notification {
  id: string;
  type: 'alert' | 'info' | 'warning' | 'security';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

const INITIAL_NOTIFICATIONS: Notification[] = [
  { id: 'N001', type: 'alert', title: 'Drug Interaction Detected', message: 'Sophia Miller: Metformin + Glipizide interaction is flagged as HIGH RISK. Review immediately.', timestamp: '10 mins ago', read: false },
  { id: 'N002', type: 'security', title: 'Unauthorized Access Attempt', message: 'An unverified actor attempted to access James Rodriguez\'s records. Event denied and logged to Ledger.', timestamp: '25 mins ago', read: false },
  { id: 'N003', type: 'info', title: 'Patient Access Granted', message: 'Emma Watson has granted you access to her Cardiology records via QR scan.', timestamp: '1 hour ago', read: false },
  { id: 'N004', type: 'info', title: 'Appointment Confirmed', message: 'Michael Chen confirmed his 09:00 AM appointment for tomorrow.', timestamp: '2 hours ago', read: true },
  { id: 'N005', type: 'warning', title: 'Ledger Sync Delayed', message: '3 records are pending sync to Hyperledger Fabric. Last sync attempt: 45 minutes ago.', timestamp: '45 mins ago', read: true },
  { id: 'N006', type: 'info', title: 'Lab Results Available', message: 'Lab results for David Wilson are ready for review and have been synced to Hyperledger Fabric.', timestamp: '3 hours ago', read: true },
  { id: 'N007', type: 'security', title: 'Identity Token Expiring', message: 'Your Hyperledger Fabric identity certificate expires in 7 days. Please renew.', timestamp: '5 hours ago', read: true },
  { id: 'N008', type: 'warning', title: 'Prescription Renewal Due', message: 'James Rodriguez\'s Metoprolol prescription is due for renewal within 5 days.', timestamp: '1 day ago', read: true },
];

const typeConfig: Record<string, { icon: React.ElementType; color: string; bg: string; border: string }> = {
  alert: { icon: AlertTriangle, color: '#DC2626', bg: '#FEF2F2', border: '#FCA5A5' },
  info: { icon: Info, color: '#1D4ED8', bg: '#DBEAFE', border: '#93C5FD' },
  warning: { icon: AlertTriangle, color: '#D97706', bg: '#FFF7ED', border: '#FCD34D' },
  security: { icon: ShieldAlert, color: '#7E22CE', bg: '#F3E8FF', border: '#C4B5FD' },
};

const Notifications: React.FC = () => {
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
  const [activeTab, setActiveTab] = useState<'all' | 'unread'>('all');

  const unreadCount = notifications.filter(n => !n.read).length;
  const displayed = activeTab === 'unread' ? notifications.filter(n => !n.read) : notifications;

  const markAllRead = () => setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  const markRead = (id: string) => setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  const deleteNotification = (id: string) => setNotifications(prev => prev.filter(n => n.id !== id));

  return (
    <div className="page-container">
      <div className="page-header animate-fade-in">
        <div>
          <h1 className="heading-2 page-title" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Bell color="var(--primary)" size={26} />
            Notifications
            {unreadCount > 0 && (
              <span style={{
                background: 'var(--danger)', color: 'white', borderRadius: '100px',
                padding: '2px 8px', fontSize: '13px', fontWeight: 700
              }}>
                {unreadCount}
              </span>
            )}
          </h1>
          <p className="page-subtitle">System alerts, ledger events, and patient updates.</p>
        </div>
        {unreadCount > 0 && (
          <button className="btn btn-outline" onClick={markAllRead}>
            <CheckCheck size={18} />
            <span>Mark all as read</span>
          </button>
        )}
      </div>

      {/* Tab bar */}
      <div style={{ display: 'flex', gap: '4px', background: 'var(--bg-color)', borderRadius: 'var(--radius-md)', padding: '4px', width: 'fit-content', marginBottom: '24px' }}>
        {[{ key: 'all', label: `All (${notifications.length})` }, { key: 'unread', label: `Unread (${unreadCount})` }].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as 'all' | 'unread')}
            style={{
              padding: '8px 20px', borderRadius: 'var(--radius-sm)', border: 'none', cursor: 'pointer',
              fontWeight: 600, fontSize: '14px', transition: 'all 0.2s ease',
              background: activeTab === tab.key ? 'var(--surface)' : 'transparent',
              color: activeTab === tab.key ? 'var(--primary)' : 'var(--text-muted)',
              boxShadow: activeTab === tab.key ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Notification list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {displayed.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
            <CheckCircle size={48} color="var(--primary-light)" style={{ margin: '0 auto 16px' }} />
            <p style={{ fontWeight: 600 }}>All caught up!</p>
            <p style={{ fontSize: '14px' }}>No unread notifications.</p>
          </div>
        ) : displayed.map(n => {
          const cfg = typeConfig[n.type];
          const Icon = cfg.icon;
          return (
            <div
              key={n.id}
              className="card animate-fade-in"
              style={{
                display: 'flex', alignItems: 'flex-start', gap: '16px',
                borderLeft: `4px solid ${cfg.border}`,
                opacity: n.read ? 0.75 : 1,
                background: n.read ? 'var(--surface)' : 'white',
                position: 'relative',
                padding: '16px 20px',
              }}
            >
              {!n.read && (
                <div style={{
                  position: 'absolute', top: '16px', right: '16px',
                  width: '8px', height: '8px', borderRadius: '50%', background: 'var(--primary)'
                }} />
              )}
              <div style={{
                flexShrink: 0, width: '40px', height: '40px', borderRadius: '10px',
                background: cfg.bg, display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <Icon size={20} color={cfg.color} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                  <h4 style={{ fontWeight: 700, fontSize: '14px', color: 'var(--text-main)' }}>{n.title}</h4>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', flexShrink: 0, marginLeft: '12px' }}>{n.timestamp}</span>
                </div>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.5 }}>{n.message}</p>
                {!n.read && (
                  <button
                    onClick={() => markRead(n.id)}
                    style={{
                      marginTop: '10px', background: 'none', border: 'none', cursor: 'pointer',
                      fontSize: '12px', color: 'var(--primary)', fontWeight: 600, padding: 0
                    }}
                  >
                    Mark as read
                  </button>
                )}
              </div>
              <button
                onClick={() => deleteNotification(n.id)}
                className="icon-btn-sm"
                style={{ flexShrink: 0, color: 'var(--text-muted)' }}
                title="Dismiss"
              >
                <Trash2 size={16} />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Notifications;
