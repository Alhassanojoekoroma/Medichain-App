'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, User, Phone, MapPin, AlertCircle, Pill, Shield } from 'lucide-react';
import { LayoutWrapper } from '@/components/dashboard/layout-wrapper';
import type { BloodType } from '@/types';

const BLOOD_TYPES: BloodType[] = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export default function NewPatientPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: '', dob: '', gender: 'Female', phone: '', email: '', address: '',
    bloodType: 'O+' as BloodType, condition: '', allergies: '', medications: '',
    notes: '', emergencyContactName: '', emergencyContactPhone: '',
    insuranceProvider: '', insuranceId: '',
    qrPublicAccess: true,
    qrName: true, qrBloodType: true, qrAllergies: true, qrEmergencyContact: true,
  });

  const set = (k: string, v: string | boolean) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await new Promise(r => setTimeout(r, 1200));
    setSaving(false);
    router.push('/patients');
  };

  return (
    <LayoutWrapper>
      <div className="max-w-3xl mx-auto space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3 pt-2">
          <button onClick={() => router.back()} className="p-2 hover:bg-brand-light rounded-xl transition-colors">
            <ArrowLeft className="w-5 h-5 text-[#5D6582]" />
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#101326]">Add New Patient</h1>
            <p className="text-sm text-[#8C91A8]">Register a new patient on the blockchain</p>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          {/* Demographics */}
          <div className="bg-white rounded-2xl p-5 border border-[#D8DCE8]">
            <h2 className="font-semibold text-[#101326] mb-4 flex items-center gap-2">
              <User className="w-4 h-4 text-brand" /> Patient Demographics
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-[#5D6582] mb-1">Full Name *</label>
                <input required value={form.name} onChange={e => set('name', e.target.value)}
                  placeholder="e.g. Aminata Koroma"
                  className="w-full border border-[#D8DCE8] rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand" />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#5D6582] mb-1">Date of Birth *</label>
                <input required type="date" value={form.dob} onChange={e => set('dob', e.target.value)}
                  className="w-full border border-[#D8DCE8] rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand" />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#5D6582] mb-1">Gender *</label>
                <select value={form.gender} onChange={e => set('gender', e.target.value)}
                  className="w-full border border-[#D8DCE8] rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand">
                  <option>Female</option><option>Male</option><option>Other</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-[#5D6582] mb-1">Blood Type *</label>
                <select value={form.bloodType} onChange={e => set('bloodType', e.target.value)}
                  className="w-full border border-[#D8DCE8] rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand">
                  {BLOOD_TYPES.map(bt => <option key={bt}>{bt}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-[#5D6582] mb-1">Phone *</label>
                <input required value={form.phone} onChange={e => set('phone', e.target.value)}
                  placeholder="+232 76 123 456"
                  className="w-full border border-[#D8DCE8] rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand" />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#5D6582] mb-1">Email</label>
                <input type="email" value={form.email} onChange={e => set('email', e.target.value)}
                  placeholder="patient@email.com"
                  className="w-full border border-[#D8DCE8] rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand" />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-[#5D6582] mb-1">Address *</label>
                <input required value={form.address} onChange={e => set('address', e.target.value)}
                  placeholder="e.g. 12 Wilkinson Road, Freetown"
                  className="w-full border border-[#D8DCE8] rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand" />
              </div>
            </div>
          </div>

          {/* Medical info */}
          <div className="bg-white rounded-2xl p-5 border border-[#D8DCE8]">
            <h2 className="font-semibold text-[#101326] mb-4 flex items-center gap-2">
              <Pill className="w-4 h-4 text-[#8F76FF]" /> Medical Information
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#5D6582] mb-1">Primary Condition *</label>
                <input required value={form.condition} onChange={e => set('condition', e.target.value)}
                  placeholder="e.g. Hypertension, Type 2 Diabetes"
                  className="w-full border border-[#D8DCE8] rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand" />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#5D6582] mb-1">
                  Allergies <span className="text-[#8C91A8]">(comma-separated)</span>
                </label>
                <input value={form.allergies} onChange={e => set('allergies', e.target.value)}
                  placeholder="e.g. Penicillin, Aspirin"
                  className="w-full border border-[#D8DCE8] rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand" />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#5D6582] mb-1">
                  Current Medications <span className="text-[#8C91A8]">(comma-separated)</span>
                </label>
                <input value={form.medications} onChange={e => set('medications', e.target.value)}
                  placeholder="e.g. Lisinopril 10mg, Amlodipine 5mg"
                  className="w-full border border-[#D8DCE8] rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand" />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#5D6582] mb-1">Clinical Notes</label>
                <textarea value={form.notes} onChange={e => set('notes', e.target.value)}
                  rows={3} placeholder="Additional clinical notes..."
                  className="w-full border border-[#D8DCE8] rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand resize-none" />
              </div>
            </div>
          </div>

          {/* Emergency + Insurance */}
          <div className="bg-white rounded-2xl p-5 border border-[#D8DCE8]">
            <h2 className="font-semibold text-[#101326] mb-4 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-[#E53E3E]" /> Emergency Contact & Insurance
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-[#5D6582] mb-1">Emergency Contact Name *</label>
                <input required value={form.emergencyContactName} onChange={e => set('emergencyContactName', e.target.value)}
                  className="w-full border border-[#D8DCE8] rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand" />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#5D6582] mb-1">Emergency Contact Phone *</label>
                <input required value={form.emergencyContactPhone} onChange={e => set('emergencyContactPhone', e.target.value)}
                  className="w-full border border-[#D8DCE8] rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand" />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#5D6582] mb-1">Insurance Provider</label>
                <input value={form.insuranceProvider} onChange={e => set('insuranceProvider', e.target.value)}
                  placeholder="e.g. NASSIT"
                  className="w-full border border-[#D8DCE8] rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand" />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#5D6582] mb-1">Insurance ID</label>
                <input value={form.insuranceId} onChange={e => set('insuranceId', e.target.value)}
                  className="w-full border border-[#D8DCE8] rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand" />
              </div>
            </div>
          </div>

          {/* QR Access Permissions */}
          <div className="bg-white rounded-2xl p-5 border border-[#D8DCE8]">
            <h2 className="font-semibold text-[#101326] mb-1 flex items-center gap-2">
              <Shield className="w-4 h-4 text-brand" /> QR Public Access Permissions
            </h2>
            <p className="text-xs text-[#8C91A8] mb-4">Choose which fields are visible on the public emergency QR card (no login required)</p>
            <div className="flex items-center gap-3 mb-3">
              <input type="checkbox" id="qrAccess" checked={form.qrPublicAccess} onChange={e => set('qrPublicAccess', e.target.checked)} className="accent-brand w-4 h-4" />
              <label htmlFor="qrAccess" className="text-sm font-medium text-[#101326]">Enable public QR emergency card</label>
            </div>
            {form.qrPublicAccess && (
              <div className="grid grid-cols-2 gap-2 ml-7">
                {[['qrName', 'Name'], ['qrBloodType', 'Blood Type'], ['qrAllergies', 'Allergies'], ['qrEmergencyContact', 'Emergency Contact']].map(([key, label]) => (
                  <div key={key} className="flex items-center gap-2">
                    <input type="checkbox" id={key} checked={form[key as keyof typeof form] as boolean}
                      onChange={e => set(key, e.target.checked)} className="accent-brand w-4 h-4" />
                    <label htmlFor={key} className="text-sm text-[#5D6582]">{label}</label>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit */}
          <div className="flex gap-3 pb-6">
            <button type="button" onClick={() => router.back()}
              className="flex-1 border border-[#D8DCE8] hover:bg-[#EAEEF2] text-[#5D6582] py-3 rounded-xl text-sm font-medium transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={saving}
              className="flex-1 bg-brand hover:bg-brand-dark disabled:opacity-60 text-white py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-colors">
              <Save className="w-4 h-4" />
              {saving ? 'Registering on Blockchain...' : 'Register Patient'}
            </button>
          </div>
        </form>
      </div>
    </LayoutWrapper>
  );
}
