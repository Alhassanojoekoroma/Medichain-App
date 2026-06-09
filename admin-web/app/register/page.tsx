'use client';

import { useState } from 'react';
import ProtectedRoute from '@/components/shared/ProtectedRoute';
import { Sidebar } from '@/components/dashboard/sidebar';
import { MobileMenuButton } from '@/components/dashboard/sidebar';
import { Header } from '@/components/dashboard/header';
import { UserPlus, ShieldCheck, Lock, Activity } from 'lucide-react';

export default function AdminRegister() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'doctor',
    hospital: 'Connaught Hospital',
    enrollCA: true,
    mspId: 'Org1MSP',
  });

  const mspOrgs = {
    doctor: 'DoctorOrg',
    nurse: 'NurseOrg',
    staff: 'PharmacyOrg',
    government: 'GovernmentOrg',
    admin: 'AdminOrg',
  };

  const handleRoleChange = (role: string) => {
    let msp = 'Org1MSP';
    if (role === 'nurse') msp = 'Org2MSP';
    else if (role === 'staff') msp = 'PharmacyMSP';
    else if (role === 'government') msp = 'GovernmentMSP';
    else if (role === 'admin') msp = 'AdminMSP';

    setFormData(prev => ({
      ...prev,
      role,
      mspId: msp
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email) return;

    // Simulate CA enrollment
    const enrollmentID = `${formData.role}-${formData.name.toLowerCase().replace(/\s+/g, '-')}`;
    alert(`Registration Successful!
    
User: ${formData.name}
Role: ${formData.role.toUpperCase()}
Hyperledger Fabric MSP ID: ${formData.mspId}
Fabric Org Assigned: ${mspOrgs[formData.role as keyof typeof mspOrgs]}
-------------------------------------------
${formData.enrollCA ? `✓ CA enrollment completed successfully!
✓ X.509 Certificate generated: cn=${enrollmentID},ou=${formData.role},o=medichain
✓ Credentials stored in HSM/Secure Wallet.` : 'CA enrollment skipped.'}`);

    setFormData({
      name: '',
      email: '',
      role: 'doctor',
      hospital: 'Connaught Hospital',
      enrollCA: true,
      mspId: 'Org1MSP',
    });
  };

  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <div className="min-h-screen bg-[#EAEEF2] admin-portal">
        <div className="flex">
          {/* Sidebar */}
          <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(false)} />

          {/* Main Content */}
          <div className="flex-1 min-w-0 lg:pl-[260px]">
            <div className="px-3 sm:px-4 lg:px-6 max-w-[1600px] mx-auto">
              <div className="flex items-center gap-2 sm:gap-4">
                <MobileMenuButton onClick={() => setSidebarOpen(true)} />
                <div className="flex-1">
                  <Header />
                </div>
              </div>

              <div className="space-y-6 pb-8 text-left">
                {/* Title */}
                <div>
                  <h1 className="text-2xl font-bold tracking-tight text-slate-900 font-display">CA Enrollment Station</h1>
                  <p className="text-sm text-slate-500">
                    Register new healthcare personnel and enroll them directly in the Hyperledger Fabric Certificate Authority (CA) server.
                  </p>
                </div>

                <div className="max-w-2xl bg-white rounded-2xl border border-[#D8DCE8] shadow-sm p-6 space-y-6">
                  <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                    <UserPlus className="w-5 h-5 text-[#7c3aed]" />
                    <h3 className="font-bold text-slate-900 text-sm">Enroll New Practitioner Certificate</h3>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Full Name */}
                    <div>
                      <label className="block text-xs font-bold text-[#5D6582] mb-1">Full Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="Dr. Samuel Bangura"
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full border border-[#D8DCE8] rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#7c3aed]/20 focus:border-[#7c3aed] transition"
                      />
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-xs font-bold text-[#5D6582] mb-1">Email Address *</label>
                      <input
                        type="email"
                        required
                        placeholder="samuel@medichain.sl"
                        value={formData.email}
                        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                        className="w-full border border-[#D8DCE8] rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#7c3aed]/20 focus:border-[#7c3aed] transition"
                      />
                    </div>

                    {/* Role */}
                    <div>
                      <label className="block text-xs font-bold text-[#5D6582] mb-1">Access Role Selector *</label>
                      <select
                        value={formData.role}
                        onChange={(e) => handleRoleChange(e.target.value)}
                        className="w-full border border-[#D8DCE8] bg-slate-50 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#7c3aed]/20 focus:border-[#7c3aed] transition cursor-pointer text-slate-700"
                      >
                        <option value="doctor">Doctor (DoctorOrg)</option>
                        <option value="nurse">Nurse (NurseOrg)</option>
                        <option value="staff">Pharmacist / Staff (PharmacyOrg)</option>
                        <option value="government">Government Representative (GovernmentOrg)</option>
                        <option value="admin">Super Administrator (AdminOrg)</option>
                      </select>
                    </div>

                    {/* Facility */}
                    <div>
                      <label className="block text-xs font-bold text-[#5D6582] mb-1">Primary Hospital Facility</label>
                      <input
                        type="text"
                        required
                        value={formData.hospital}
                        onChange={(e) => setFormData(prev => ({ ...prev, hospital: e.target.value }))}
                        className="w-full border border-[#D8DCE8] rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#7c3aed]/20 focus:border-[#7c3aed] transition"
                      />
                    </div>

                    {/* CA Checklist Options */}
                    <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl space-y-3">
                      <div className="flex items-center justify-between text-xs text-slate-500 font-bold border-b border-slate-200/60 pb-2">
                        <span>FABRIC MSP SETTINGS</span>
                        <span className="font-mono text-[10px] text-[#7c3aed]">{formData.mspId}</span>
                      </div>
                      <div className="flex items-start gap-2.5">
                        <input
                          type="checkbox"
                          id="enrollCA"
                          checked={formData.enrollCA}
                          onChange={(e) => setFormData(prev => ({ ...prev, enrollCA: e.target.checked }))}
                          className="accent-[#7c3aed] h-4.5 w-4.5 rounded border-slate-350 cursor-pointer mt-0.5"
                        />
                        <label htmlFor="enrollCA" className="text-xs font-semibold text-slate-700 cursor-pointer select-none">
                          Enroll on Fabric CA Server (auto-generate X.509 cryptographic certificate and key pair)
                        </label>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2.5 bg-[#7c3aed] hover:bg-[#6228ca] text-white rounded-xl text-sm font-bold transition shadow-sm flex items-center justify-center gap-1.5"
                    >
                      <ShieldCheck className="w-4.5 h-4.5" />
                      Enroll Practitioner CA Identity
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
