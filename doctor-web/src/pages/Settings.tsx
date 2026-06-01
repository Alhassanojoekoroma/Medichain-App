import React, { useState } from 'react';
import { User, Shield, Key, FileText, Bell, Clock, CheckCircle, Camera, Star, MapPin, Phone, Mail } from 'lucide-react';

type Tab = 'profile' | 'availability' | 'notifications' | 'security';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('profile');
  const [saved, setSaved] = useState(false);
  const [availability, setAvailability] = useState<Record<string, boolean>>({
    Monday: true, Tuesday: true, Wednesday: true, Thursday: true, Friday: true,
    Saturday: false, Sunday: false,
  });
  const [notifPrefs, setNotifPrefs] = useState({
    newAppointment: true,
    recordSync: true,
    drugAlert: true,
    securityAlert: true,
    weeklyReport: false,
    patientMessage: true,
  });

  const tabs: { key: Tab; label: string; icon: React.ElementType }[] = [
    { key: 'profile', label: 'Profile', icon: User },
    { key: 'availability', label: 'Availability', icon: Clock },
    { key: 'notifications', label: 'Notifications', icon: Bell },
    { key: 'security', label: 'Security', icon: Shield },
  ];

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const inputStyle: React.CSSProperties = {
    width: '100%', border: '1.5px solid var(--border)', borderRadius: '10px',
    padding: '11px 14px', fontSize: '14px', fontFamily: 'inherit',
    color: 'var(--text-main)', outline: 'none', background: 'var(--surface)',
    transition: 'border-color 0.2s ease',
  };

  const labelStyle: React.CSSProperties = {
    fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)',
    marginBottom: '6px', display: 'block', textTransform: 'uppercase', letterSpacing: '0.04em',
  };

  return (
    <div className="page-container" style={{ padding: '2rem', maxWidth: '1100px', margin: '0 auto' }}>
      <div className="page-header animate-fade-in" style={{ marginBottom: '2rem' }}>
        <div>
          <h1 className="heading-2 page-title">Doctor Profile</h1>
          <p className="page-subtitle">Manage your public profile, schedule, and Hyperledger Fabric identity.</p>
        </div>
        {saved && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--success)', fontWeight: 600, fontSize: '14px' }}>
            <CheckCircle size={18} /> Changes saved successfully!
          </div>
        )}
      </div>

      {/* Profile Hero */}
      <div className="card animate-fade-in" style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative' }}>
          <div style={{
            width: '88px', height: '88px', borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white', fontSize: '28px', fontWeight: 'bold',
            boxShadow: '0 4px 14px rgba(13,148,38,0.35)',
          }}>SJ</div>
          <div style={{ width: '14px', height: '14px', borderRadius: '50%', background: '#10B981', border: '3px solid white', position: 'absolute', bottom: '4px', right: '4px' }} />
          <button style={{
            position: 'absolute', bottom: '-4px', right: '-4px',
            width: '28px', height: '28px', borderRadius: '50%',
            background: 'var(--primary)', border: '2px solid white', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Camera size={13} color="white" />
          </button>
        </div>
        <div style={{ flex: 1 }}>
          <h2 style={{ fontWeight: 700, fontSize: '20px', marginBottom: '4px' }}>Dr. Sarah Jenkins</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '10px' }}>Cardiologist · Medichain SL Hospital</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
            {[
              { icon: MapPin, text: 'Freetown, Sierra Leone' },
              { icon: Phone, text: '+232 76 123 456' },
              { icon: Mail, text: 'dr.jenkins@medichain.sl' },
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '13px', color: 'var(--text-muted)' }}>
                <item.icon size={14} /> {item.text}
              </div>
            ))}
          </div>
        </div>
        <div style={{ display: 'flex', gap: '24px', flexShrink: 0 }}>
          {[{ v: '8 yrs', l: 'Experience' }, { v: '12k+', l: 'Patients' }, { v: '4.8', l: 'Rating' }].map((s, i) => (
            <div key={i} style={{ textAlign: 'center' }}>
              <div style={{ fontWeight: 700, fontSize: '20px', color: 'var(--primary)' }}>{s.v}</div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{s.l}</div>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <span style={{ background: 'var(--primary-light)', color: 'var(--primary)', borderRadius: '100px', padding: '6px 14px', fontSize: '12px', fontWeight: 600 }}>
            <Star size={11} style={{ display: 'inline', marginRight: '4px' }} />Verified Doctor
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="tab-nav animate-fade-in" style={{ animationDelay: '0.05s' }}>
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`tab-item ${activeTab === tab.key ? 'active' : ''}`}
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <tab.icon size={15} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="animate-fade-in" style={{ animationDelay: '0.1s' }}>

        {/* ── PROFILE TAB ─────────────────────────────── */}
        {activeTab === 'profile' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div className="card">
              <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <User size={17} color="var(--primary)" /> Personal Information
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                {[
                  { label: 'Full Name', type: 'text', value: 'Dr. Sarah Jenkins' },
                  { label: 'Email Address', type: 'email', value: 'dr.jenkins@medichain.sl' },
                  { label: 'Specialization', type: 'text', value: 'Cardiologist' },
                  { label: 'Phone Number', type: 'text', value: '+232 76 123 456' },
                  { label: 'Hospital / Clinic', type: 'text', value: 'Medichain SL Central Hospital' },
                  { label: 'Medical License No.', type: 'text', value: 'SL-MED-20190234' },
                ].map((f, i) => (
                  <div key={i}>
                    <label style={labelStyle}>{f.label}</label>
                    <input type={f.type} style={inputStyle} defaultValue={f.value}
                      onFocus={e => e.target.style.borderColor = 'var(--primary)'}
                      onBlur={e => e.target.style.borderColor = 'var(--border)'}
                    />
                  </div>
                ))}
              </div>
              <div style={{ marginBottom: '20px' }}>
                <label style={labelStyle}>Professional Bio</label>
                <textarea style={{ ...inputStyle, minHeight: '100px', resize: 'vertical' }}
                  defaultValue="Experienced cardiologist specializing in preventative heart care, echocardiography, and non-invasive cardiovascular medicine. Dedicated to bringing top-tier medical care via Medichain."
                  onFocus={e => e.currentTarget.style.borderColor = 'var(--primary)'}
                  onBlur={e => e.currentTarget.style.borderColor = 'var(--border)'}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button className="btn btn-outline">Discard</button>
                <button className="btn btn-primary" onClick={handleSave}>Save Changes</button>
              </div>
            </div>

            {/* Verified Credentials */}
            <div className="card">
              <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Shield size={17} color="var(--primary)" /> Verified Credentials
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {[
                  { icon: Shield, label: 'Medical License', sub: 'Verified by Medichain', color: '#10B981', bg: '#DCFCE7' },
                  { icon: FileText, label: 'Board Certification', sub: 'Cardiology Board — 2019', color: '#7E22CE', bg: '#F3E8FF' },
                  { icon: Star, label: 'Hyperledger Identity', sub: 'X.509 Certificate Active', color: '#0D9426', bg: 'var(--primary-light)' },
                ].map((c, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px', border: '1.5px solid var(--border)', borderRadius: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: c.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <c.icon size={18} color={c.color} />
                      </div>
                      <div>
                        <div style={{ fontSize: '14px', fontWeight: 600 }}>{c.label}</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{c.sub}</div>
                      </div>
                    </div>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px', background: '#DCFCE7', color: '#166534', borderRadius: '100px', padding: '4px 10px', fontSize: '12px', fontWeight: 600 }}>
                      <CheckCircle size={11} /> Verified
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── AVAILABILITY TAB ─────────────────────────── */}
        {activeTab === 'availability' && (
          <div className="card">
            <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Clock size={17} color="var(--primary)" /> Weekly Schedule
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '24px' }}>
              Toggle availability per day. Patients can book appointments in your active slots.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {DAYS.map(day => (
                <div key={day} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '14px 18px', border: `1.5px solid ${availability[day] ? 'var(--primary-light)' : 'var(--border)'}`,
                  borderRadius: '10px', background: availability[day] ? 'var(--primary-light)' : 'var(--surface)',
                  transition: 'all 0.2s ease',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: availability[day] ? 'var(--primary)' : 'var(--border)' }} />
                    <span style={{ fontWeight: 600, fontSize: '14px' }}>{day}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    {availability[day] && (
                      <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>08:00 AM – 05:00 PM</span>
                    )}
                    <label style={{ position: 'relative', display: 'inline-block', width: '44px', height: '24px', cursor: 'pointer' }}>
                      <input type="checkbox" checked={availability[day]} onChange={() => setAvailability(prev => ({ ...prev, [day]: !prev[day] }))} style={{ opacity: 0, width: 0, height: 0 }} />
                      <span style={{
                        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                        borderRadius: '24px', background: availability[day] ? 'var(--primary)' : '#CBD5E1',
                        transition: 'background 0.2s ease',
                      }}>
                        <span style={{
                          position: 'absolute', height: '18px', width: '18px', left: availability[day] ? '23px' : '3px',
                          bottom: '3px', background: 'white', borderRadius: '50%', transition: 'left 0.2s ease',
                        }} />
                      </span>
                    </label>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end' }}>
              <button className="btn btn-primary" onClick={handleSave}>Save Schedule</button>
            </div>
          </div>
        )}

        {/* ── NOTIFICATIONS TAB ─────────────────────────── */}
        {activeTab === 'notifications' && (
          <div className="card">
            <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Bell size={17} color="var(--primary)" /> Notification Preferences
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '24px' }}>
              Control which alerts and updates you receive.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {[
                { key: 'newAppointment', label: 'New Appointment Booked', sub: 'Notify when a patient schedules an appointment.' },
                { key: 'recordSync', label: 'Record Synced to Chain', sub: 'Notify when a medical record is confirmed on Hyperledger Fabric.' },
                { key: 'drugAlert', label: 'Drug Interaction Alerts', sub: 'Notify about potential drug conflicts for your patients.' },
                { key: 'securityAlert', label: 'Security & Access Alerts', sub: 'Notify about unauthorized access attempts or unusual activity.' },
                { key: 'patientMessage', label: 'Patient Messages', sub: 'Notify when a patient sends you a message.' },
                { key: 'weeklyReport', label: 'Weekly Summary Report', sub: 'Receive a weekly digest of your activity.' },
              ].map(n => (
                <div key={n.key} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '16px', borderBottom: '1px solid var(--border)',
                }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '14px', marginBottom: '2px' }}>{n.label}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{n.sub}</div>
                  </div>
                  <label style={{ position: 'relative', display: 'inline-block', width: '44px', height: '24px', cursor: 'pointer', flexShrink: 0 }}>
                    <input type="checkbox" checked={notifPrefs[n.key as keyof typeof notifPrefs]}
                      onChange={() => setNotifPrefs(prev => ({ ...prev, [n.key]: !prev[n.key as keyof typeof notifPrefs] }))}
                      style={{ opacity: 0, width: 0, height: 0 }}
                    />
                    <span style={{
                      position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                      borderRadius: '24px', background: notifPrefs[n.key as keyof typeof notifPrefs] ? 'var(--primary)' : '#CBD5E1',
                      transition: 'background 0.2s ease',
                    }}>
                      <span style={{
                        position: 'absolute', height: '18px', width: '18px',
                        left: notifPrefs[n.key as keyof typeof notifPrefs] ? '23px' : '3px',
                        bottom: '3px', background: 'white', borderRadius: '50%', transition: 'left 0.2s ease',
                      }} />
                    </span>
                  </label>
                </div>
              ))}
            </div>
            <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end' }}>
              <button className="btn btn-primary" onClick={handleSave}>Save Preferences</button>
            </div>
          </div>
        )}

        {/* ── SECURITY TAB ─────────────────────────────── */}
        {activeTab === 'security' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div className="card">
              <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Key size={17} color="var(--primary)" /> Security & Hyperledger Fabric Identity
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {[
                  { label: 'Fabric Identity Certificate', sub: 'X.509 Certificate connected — used for signing medical records.', status: 'Active', danger: false, action: 'Manage Certificate' },
                  { label: 'Two-Factor Authentication', sub: 'Secure your account with an authenticator app (TOTP).', status: 'Enabled', danger: false, action: 'Configure' },
                  { label: 'Active Sessions', sub: '2 active sessions — Chrome on Windows, Safari on iPhone.', status: null, danger: false, action: 'View Sessions' },
                  { label: 'Delete Account', sub: 'Permanently remove your doctor profile from MediChain. This cannot be undone.', status: null, danger: true, action: 'Delete Account' },
                ].map((item, i) => (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '16px', border: `1.5px solid ${item.danger ? '#FCA5A5' : 'var(--border)'}`,
                    borderRadius: '10px', background: item.danger ? '#FEF2F2' : 'var(--surface)',
                  }}>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 600, color: item.danger ? '#DC2626' : 'var(--text-main)', marginBottom: '4px' }}>{item.label}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{item.sub}</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
                      {item.status && (
                        <span style={{ background: '#DCFCE7', color: '#166534', borderRadius: '100px', padding: '4px 10px', fontSize: '12px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <CheckCircle size={11} /> {item.status}
                        </span>
                      )}
                      <button 
                        className={item.danger ? 'btn-danger' : 'btn btn-outline'} 
                        onClick={() => {
                          if (item.action === 'Manage Certificate') {
                            alert("PalmsChain X.509 cryptographic certificate validated.\nStatus: ACTIVE\nIssuer: palmschain-ca-freetown\nExpiry: May 28, 2027");
                          } else if (item.action === 'Configure') {
                            alert("TOTP Multi-Factor Authentication configuration system starting...\nScan the QR code in your authenticator app (Google Authenticator or Duo).");
                          } else if (item.action === 'View Sessions') {
                            alert("Active Sessions:\n\n1. PalmsChain Portal (Chrome / Windows) - Freetown, SL (Active Now)\n2. PalmsChain Mobile App (iPhone 15) - Waterloo, SL (2 hours ago)");
                          } else if (item.action === 'Delete Account') {
                            alert("CRITICAL WARNING: Profile deletion requires signed medical board authority letter and approval from Ministry of Health registrar. Contact support@palmschain.sl.");
                          }
                        }}
                        style={{ padding: '7px 14px', fontSize: '12px', borderRadius: 'var(--radius-md)', cursor: 'pointer', border: item.danger ? '1.5px solid #DC2626' : undefined, color: item.danger ? '#DC2626' : undefined, background: 'transparent', fontWeight: 600 }}
                      >
                        {item.action}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="card">
              <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Shield size={17} color="var(--primary)" /> Change Password
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', maxWidth: '480px' }}>
                {[
                  { label: 'Current Password', placeholder: '••••••••' },
                  { label: 'New Password', placeholder: 'Min. 8 characters' },
                  { label: 'Confirm New Password', placeholder: 'Repeat new password' },
                ].map((f, i) => (
                  <div key={i}>
                    <label style={labelStyle}>{f.label}</label>
                    <input type="password" style={inputStyle} placeholder={f.placeholder}
                      onFocus={e => e.target.style.borderColor = 'var(--primary)'}
                      onBlur={e => e.target.style.borderColor = 'var(--border)'}
                    />
                  </div>
                ))}
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
                  <button className="btn btn-primary" onClick={() => { handleSave(); alert('Your PalmsChain network security key and account password have been updated successfully.'); }}>Update Password</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Settings;
