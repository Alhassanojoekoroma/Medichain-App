'use client';

import { useState, useEffect } from 'react';
import { LayoutWrapper } from '@/components/dashboard/layout-wrapper';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import {
  Users, AlertCircle, Heart, Pill, ShieldCheck, Clock,
  Search, Activity, Stethoscope, Lock, Info
} from 'lucide-react';
import { backendApi } from '@/services/backendApi';

interface TriagePatient {
  id: string;
  name: string;
  bloodType: string;
  phone: string;
  allergies: any[];
}

export default function StaffTriagePage() {
  useAuth();
  const router = useRouter();

  const [currentUser, setCurrentUser] = useState<any>(null);
  const [patients, setPatients] = useState<TriagePatient[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const u = sessionStorage.getItem('mc_user');
      if (u) {
        try { setCurrentUser(JSON.parse(u)); } catch {}
      }
    }
  }, []);

  useEffect(() => {
    backendApi.getAccessiblePatients()
      .then(res => {
        setPatients(res.patients || []);
        setError(null);
      })
      .catch(err => {
        setError(err.message || 'Failed to load patients. Please ensure the backend is running.');
      })
      .finally(() => setLoading(false));
  }, []);

  const role = currentUser?.role || 'staff';
  const name = currentUser?.name || 'Staff Member';

  const filteredPatients = patients.filter(p =>
    (p.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.phone?.includes(searchTerm)
  );

  const roleColor = role === 'nurse'
    ? 'bg-teal-100 text-teal-800 border-teal-200'
    : 'bg-blue-100 text-blue-800 border-blue-200';

  const roleIcon = role === 'nurse' ? Stethoscope : Users;
  const RoleIcon = roleIcon;

  return (
    <LayoutWrapper title="Staff Triage Portal">
      <div className="space-y-6">

        {/* Role Identity Banner */}
        <div className="bg-gradient-to-r from-teal-600 to-teal-700 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center">
              <RoleIcon className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">{name}</h1>
              <p className="text-teal-200 text-sm mt-0.5">
                {role === 'nurse' ? 'Registered Nurse' : 'Hospital Staff'} · Connaught Hospital, Freetown
              </p>
            </div>
            <div className="ml-auto">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/20 text-white text-xs font-bold rounded-full border border-white/30`}>
                <ShieldCheck className="w-3.5 h-3.5" />
                Fabric Verified
              </span>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-3 gap-4 text-center">
            <div className="bg-white/10 rounded-xl p-3">
              <p className="text-2xl font-bold">{patients.length}</p>
              <p className="text-teal-200 text-xs mt-0.5">Consented Patients</p>
            </div>
            <div className="bg-white/10 rounded-xl p-3">
              <p className="text-2xl font-bold">Read</p>
              <p className="text-teal-200 text-xs mt-0.5">Access Level</p>
            </div>
            <div className="bg-white/10 rounded-xl p-3">
              <p className="text-2xl font-bold">8h</p>
              <p className="text-teal-200 text-xs mt-0.5">Token Expiry</p>
            </div>
          </div>
        </div>

        {/* Access Scope Notice */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
          <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-amber-900">Your Triage Access Scope</p>
            <ul className="text-xs text-amber-800 mt-1 space-y-1 list-disc list-inside">
              <li><strong>✅ Can view:</strong> Patient allergies, active medications, treatment history, blood type, emergency contacts</li>
              <li><strong>🔒 Restricted:</strong> Clinical diagnoses, lab results, imaging, full medical records (Doctor role only)</li>
              <li><strong>📋 All access</strong> is cryptographically logged on the Hyperledger Fabric blockchain and visible to the patient</li>
            </ul>
          </div>
        </div>

        {/* Patient Search */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search patients by name or phone..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition"
              />
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
              <Lock className="h-3.5 w-3.5 text-teal-600" />
              Triage Mode
            </div>
          </div>
        </div>

        {/* Patient List */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-slate-400">
            <Activity className="w-8 h-8 animate-pulse" />
            <p className="text-sm">Loading consented patients from ledger...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
            <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-2" />
            <p className="text-sm font-medium text-red-700">{error}</p>
            <p className="text-xs text-red-500 mt-1">Ensure the backend API is running on port 5000</p>
          </div>
        ) : filteredPatients.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
            <Users className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="font-semibold text-slate-700">No consented patients found</p>
            <p className="text-xs text-slate-400 mt-1">
              Patients must grant your role or clinic triage access via the MediChain patient app.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPatients.map(patient => {
              const initials = patient.name
                .split(' ')
                .map(n => n[0])
                .join('')
                .slice(0, 2)
                .toUpperCase();

              const allergies: string[] = Array.isArray(patient.allergies)
                ? patient.allergies.map((a: any) => typeof a === 'string' ? a : a.name)
                : [];

              return (
                <button
                  key={patient.id}
                  onClick={() => router.push(`/patients/${patient.id}`)}
                  className="bg-white rounded-2xl border border-slate-200 p-5 text-left hover:border-teal-400 hover:shadow-md transition-all group"
                >
                  {/* Patient header */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-full bg-teal-100 text-teal-700 font-bold text-lg flex items-center justify-center group-hover:bg-teal-200 transition-colors">
                      {initials}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900 text-sm">{patient.name}</p>
                      <p className="text-xs text-slate-400">{patient.phone}</p>
                    </div>
                    <span className="ml-auto text-xs font-bold px-2 py-1 rounded-full bg-teal-50 text-teal-700 border border-teal-100">
                      {patient.bloodType}
                    </span>
                  </div>

                  {/* Triage data only */}
                  <div className="space-y-2.5">
                    {/* Allergies */}
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-3.5 h-3.5 text-orange-500 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-0.5">Allergies</p>
                        {allergies.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {allergies.map((a, i) => (
                              <span key={i} className="text-[10px] bg-red-50 text-red-700 border border-red-100 px-1.5 py-0.5 rounded-md font-medium">
                                {a}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-slate-400">No known allergies</p>
                        )}
                      </div>
                    </div>

                    {/* Blood type */}
                    <div className="flex items-center gap-2">
                      <Heart className="w-3.5 h-3.5 text-red-500 shrink-0" />
                      <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Blood Type:</p>
                      <span className="text-xs font-bold text-slate-700">{patient.bloodType}</span>
                    </div>

                    {/* Access note */}
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                      <span className="flex items-center gap-1 text-[10px] text-teal-600 font-semibold">
                        <ShieldCheck className="w-3 h-3" />
                        Logged on Ledger
                      </span>
                      <span className="text-[10px] text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Tap to view triage
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Role restrictions card */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5">
          <h3 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
            <Lock className="w-4 h-4 text-slate-500" />
            Role Access Matrix: {role === 'nurse' ? 'Registered Nurse' : 'Hospital Staff'}
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
            {[
              { label: 'Blood Type & Allergies', allowed: true },
              { label: 'Active Medications', allowed: true },
              { label: 'Treatment History', allowed: true },
              { label: 'Emergency Contacts', allowed: true },
              { label: 'Chronic Conditions', allowed: true },
              { label: 'Lab Results & Imaging', allowed: false },
              { label: 'Clinical Diagnoses', allowed: false },
              { label: 'Full Medical Records', allowed: false },
              { label: 'Prescribe Treatments', allowed: false },
            ].map(item => (
              <div key={item.label} className={`flex items-center gap-1.5 p-2 rounded-lg ${item.allowed ? 'bg-teal-50 text-teal-800' : 'bg-slate-100 text-slate-400'}`}>
                {item.allowed
                  ? <ShieldCheck className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                  : <Lock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                }
                {item.label}
              </div>
            ))}
          </div>
        </div>
      </div>
    </LayoutWrapper>
  );
}
