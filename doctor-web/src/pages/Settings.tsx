import React from 'react';
import { User, Bell, Shield, Wallet, Globe } from 'lucide-react';

const Settings: React.FC = () => {
  return (
    <div className="page-container">
      <div className="page-header animate-fade-in">
        <div>
          <h1 className="heading-2 page-title">Settings</h1>
          <p className="page-subtitle">Configure your profile, security, and notification preferences.</p>
        </div>
      </div>

      <div className="settings-grid animate-fade-in" style={{ animationDelay: '0.1s' }}>
        <div className="settings-card glass-panel">
          <div className="settings-section">
            <div className="section-header">
              <User size={20} className="text-primary" />
              <h3 className="font-semibold">Profile Information</h3>
            </div>
            <div className="section-content p-4 flex flex-col gap-4">
              <div className="flex gap-4 items-center">
                <div className="avatar w-16 h-16 text-lg">DR</div>
                <button className="btn-outline text-sm">Change Avatar</button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="text-xs font-semibold text-muted mb-1 block">Full Name</label>
                  <input type="text" className="search-input w-full border p-2 rounded-md" defaultValue="Dr. Sarah Jenkins" />
                </div>
                <div className="form-group">
                  <label className="text-xs font-semibold text-muted mb-1 block">Specialization</label>
                  <input type="text" className="search-input w-full border p-2 rounded-md" defaultValue="Cardiologist" />
                </div>
              </div>
            </div>
          </div>

          <div className="settings-section border-t mt-4 pt-4">
            <div className="section-header">
              <Shield size={20} className="text-primary" />
              <h3 className="font-semibold">Security & Blockchain</h3>
            </div>
            <div className="section-content p-4 flex flex-col gap-3">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <div className="font-semibold">Wallet Connection</div>
                  <div className="text-xs text-muted">Manage your connected Ethereum wallet for record signing.</div>
                </div>
                <button className="wallet-btn">Manage Wallet</button>
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <div className="font-semibold">Two-Factor Authentication</div>
                  <div className="text-xs text-muted">Add an extra layer of security to your account.</div>
                </div>
                <span className="status-badge status-completed">Enabled</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
