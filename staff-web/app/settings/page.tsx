'use client';

import { useState } from 'react';
import { LayoutWrapper } from '@/components/dashboard/layout-wrapper';
import { LOGGED_IN_DOCTOR } from '@/data/mockData';
import { useAuth } from '@/hooks/useAuth';
import { 
  User, Shield, Bell, Save, CheckCircle2, Lock, 
  Hospital, Award, Mail, RefreshCw, KeyRound 
} from 'lucide-react';

export default function SettingsPage() {
  useAuth(); // Require authentication

  const [doctorName, setDoctorName] = useState(LOGGED_IN_DOCTOR.name);
  const [doctorEmail, setDoctorEmail] = useState(LOGGED_IN_DOCTOR.email);
  const [hospital, setHospital] = useState(LOGGED_IN_DOCTOR.hospitalAffiliation);
  const [license, setLicense] = useState(LOGGED_IN_DOCTOR.licenseNumber);

  // Notifications Toggles
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [criticalSms, setCriticalSms] = useState(true);
  const [syncConfirmations, setSyncConfirmations] = useState(false);

  // Security Toggles
  const [mfa, setMfa] = useState(true);
  
  // Status states
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);

    // Simulate saving doctor profile configurations
    setTimeout(() => {
      setIsSaving(false);
      setSaveSuccess(true);
      
      // Clear alert after 3 seconds
      setTimeout(() => setSaveSuccess(false), 3000);
    }, 1500);
  };

  return (
    <LayoutWrapper title="Portal Settings">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header Summary */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 font-display">Account Settings</h1>
          <p className="text-sm text-slate-500">
            Configure your local doctor profile, notification triggers, and Hyperledger Fabric CA cryptographic credentials
          </p>
        </div>

        {saveSuccess && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl p-4 flex items-center gap-3 text-sm animate-in fade-in slide-in-from-top-2 duration-300">
            <CheckCircle2 className="h-5 w-5 text-brand shrink-0" />
            <div>
              <strong>Profile Configuration Saved:</strong> All credentials and notification updates written successfully.
            </div>
          </div>
        )}

        <form onSubmit={handleSaveSettings} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Panel: Profile info */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* General Info Card */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="border-b border-slate-100 bg-slate-50/50 p-4 flex items-center gap-2">
                <User className="h-4.5 w-4.5 text-brand" />
                <h3 className="text-sm font-bold text-slate-700">General Information</h3>
              </div>

              <div className="p-5 space-y-4">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                      Doctor Name (Full)
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                      <input
                        type="text"
                        required
                        value={doctorName}
                        onChange={(e) => setDoctorName(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition text-slate-800"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                      Professional Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                      <input
                        type="email"
                        required
                        value={doctorEmail}
                        onChange={(e) => setDoctorEmail(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition text-slate-800"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                      Hospital Affiliation
                    </label>
                    <div className="relative">
                      <Hospital className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                      <input
                        type="text"
                        required
                        value={hospital}
                        onChange={(e) => setHospital(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition text-slate-800"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                      Medical License Reference Number
                    </label>
                    <div className="relative">
                      <Award className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                      <input
                        type="text"
                        required
                        value={license}
                        onChange={(e) => setLicense(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition text-slate-800"
                      />
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* Notification Preferences */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="border-b border-slate-100 bg-slate-50/50 p-4 flex items-center gap-2">
                <Bell className="h-4.5 w-4.5 text-brand" />
                <h3 className="text-sm font-bold text-slate-700">Notification Channels</h3>
              </div>

              <div className="p-5 space-y-4">
                
                <div className="flex items-center justify-between py-2 border-b border-slate-50 last:border-b-0">
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-slate-800 block">Critical Emergency SMS</span>
                    <span className="text-[11px] text-slate-500 leading-normal block">
                      Receive immediate cellular SMS warnings for patients listed under critical statuses
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={criticalSms}
                    onChange={(e) => setCriticalSms(e.target.checked)}
                    className="w-9 h-5 rounded-full bg-slate-200 checked:bg-brand appearance-none cursor-pointer transition relative before:content-[''] before:absolute before:w-4 before:h-4 before:rounded-full before:bg-white before:top-0.5 before:left-0.5 before:transition-all checked:before:translate-x-4"
                  />
                </div>

                <div className="flex items-center justify-between py-2 border-b border-slate-50 last:border-b-0">
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-slate-800 block">Daily Email Summary</span>
                    <span className="text-[11px] text-slate-500 leading-normal block">
                      Receive a daily schedule outline and outstanding digital signoff requirements
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={emailAlerts}
                    onChange={(e) => setEmailAlerts(e.target.checked)}
                    className="w-9 h-5 rounded-full bg-slate-200 checked:bg-brand appearance-none cursor-pointer transition relative before:content-[''] before:absolute before:w-4 before:h-4 before:rounded-full before:bg-white before:top-0.5 before:left-0.5 before:transition-all checked:before:translate-x-4"
                  />
                </div>

                <div className="flex items-center justify-between py-2 border-b border-slate-50 last:border-b-0">
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-slate-800 block">Ledger Sync Confirmations</span>
                    <span className="text-[11px] text-slate-500 leading-normal block">
                      Get immediate alerts each time a transaction block is mined successfully
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={syncConfirmations}
                    onChange={(e) => setSyncConfirmations(e.target.checked)}
                    className="w-9 h-5 rounded-full bg-slate-200 checked:bg-brand appearance-none cursor-pointer transition relative before:content-[''] before:absolute before:w-4 before:h-4 before:rounded-full before:bg-white before:top-0.5 before:left-0.5 before:transition-all checked:before:translate-x-4"
                  />
                </div>

              </div>
            </div>

          </div>

          {/* Right Panel: Blockchain Credentials */}
          <div className="space-y-6">
            
            {/* Blockchain Node info */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="border-b border-slate-100 bg-slate-50/50 p-4 flex items-center gap-2">
                <Shield className="h-4.5 w-4.5 text-brand" />
                <h3 className="text-sm font-bold text-slate-700">Hyperledger Fabric CA</h3>
              </div>

              <div className="p-5 space-y-4">
                
                <div className="space-y-1">
                  <span className="block text-[10px] font-bold text-slate-400 uppercase">Enrollment Identity</span>
                  <div className="bg-slate-50 p-2.5 rounded font-mono text-[10px] text-brand border border-slate-150 break-all select-all flex items-start gap-1">
                    <KeyRound className="h-3.5 w-3.5 shrink-0 mt-0.5 text-slate-500" />
                    <span>{LOGGED_IN_DOCTOR.fabricId}</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="block text-[10px] font-bold text-slate-400 uppercase">Cryptographic Wallet</span>
                  <div className="bg-slate-50 p-2.5 rounded font-mono text-[10px] text-slate-500 border border-slate-150 select-all leading-relaxed">
                    <strong>USER TYPE:</strong> doctor<br />
                    <strong>MSP ID:</strong> HospitalConnaughtMSP<br />
                    <strong>TLS:</strong> Enabled (TLSv1.3)
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-3">
                  <div className="flex items-center justify-between text-xs py-1">
                    <span className="text-slate-400 font-medium flex items-center gap-1">
                      <Lock className="h-3.5 w-3.5 text-emerald-600" />
                      Enrollment Certificate
                    </span>
                    <span className="text-emerald-700 font-bold">Valid (Active)</span>
                  </div>
                </div>

              </div>
            </div>

            {/* MFA Panel */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-3">
              <h3 className="text-sm font-bold text-slate-800">Local Security</h3>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-600 leading-normal max-w-[150px]">
                  Enforce biometric FaceID or PIN lock before loading patient decrypted keys
                </span>
                <input
                  type="checkbox"
                  checked={mfa}
                  onChange={(e) => setMfa(e.target.checked)}
                  className="w-9 h-5 rounded-full bg-slate-200 checked:bg-brand appearance-none cursor-pointer transition relative before:content-[''] before:absolute before:w-4 before:h-4 before:rounded-full before:bg-white before:top-0.5 before:left-0.5 before:transition-all checked:before:translate-x-4"
                />
              </div>
            </div>

            {/* Action buttons */}
            <button
              type="submit"
              disabled={isSaving}
              className="w-full py-2.5 bg-brand hover:bg-brand-dark text-white text-sm font-semibold rounded-lg transition shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Saving Changes...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save Portal Settings
                </>
              )}
            </button>

          </div>

        </form>

      </div>
    </LayoutWrapper>
  );
}
