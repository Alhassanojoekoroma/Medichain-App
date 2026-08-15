'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, User, Phone, MapPin, AlertCircle, Pill, Shield, Check, Printer } from 'lucide-react';
import { LayoutWrapper } from '@/components/dashboard/layout-wrapper';
import { backendApi } from '@/services/backendApi';
import type { BloodType } from '@/types';
import QRCode from 'qrcode';

const BLOOD_TYPES: BloodType[] = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

interface SuccessInfo {
  patientId: string;
  accessKey: string;
  qrPayload: any;
  name: string;
  email: string;
  phone: string;
}

// ─── Success Modal Component ──────────────────────────────────────────────────
function SuccessModal({ info, onClose }: { info: SuccessInfo; onClose: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current && info.qrPayload) {
      // Build public scanning URL
      const publicUrl = `${window.location.origin}/public/emergency?token=${encodeURIComponent(
        JSON.stringify(info.qrPayload)
      )}`;
      QRCode.toCanvas(canvasRef.current, publicUrl, { width: 160, margin: 1 }, (error) => {
        if (error) console.error(error);
      });
    }
  }, [info]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 print:p-0 print:static print:bg-white">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 space-y-6 animate-in fade-in zoom-in-95 duration-200 print:shadow-none print:p-0">
        <div className="text-center space-y-2 print:hidden">
          <div className="h-12 w-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto border border-emerald-100 shadow-sm">
            <Check className="h-6 w-6" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 font-display">Patient Registered Successfully!</h2>
          <p className="text-sm text-slate-500">
            The patient has been registered and anchored on the Hyperledger Fabric ledger.
          </p>
        </div>

        {/* Printable Card */}
        <div className="border border-slate-200 rounded-xl p-5 bg-slate-50 space-y-4 print:border-none print:bg-white print:p-0">
          <div className="border-b border-slate-200 pb-3 flex justify-between items-center">
            <span className="font-bold text-slate-900 text-sm">Patient Access Credentials</span>
            <span className="text-xs font-semibold bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full print:hidden">
              Active Card
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
            <div className="sm:col-span-2 space-y-3 text-left">
              <div>
                <span className="text-xs text-slate-500 block font-semibold">PATIENT NAME</span>
                <span className="text-sm font-bold text-slate-800">{info.name}</span>
              </div>
              <div>
                <span className="text-xs text-slate-500 block font-semibold">ACCESS KEY / LOGIN ID</span>
                <span className="text-xs font-mono font-bold bg-white border border-slate-200 px-2 py-1 rounded select-all block text-brand break-all">
                  {info.accessKey}
                </span>
              </div>
            </div>

            <div className="flex flex-col items-center justify-center border-t sm:border-t-0 sm:border-l border-slate-200 pt-3 sm:pt-0 sm:pl-4 print:border-none">
              <canvas ref={canvasRef} className="border border-slate-200 bg-white rounded-lg shadow-sm w-36 h-36" />
              <span className="text-[10px] text-slate-400 mt-1 font-semibold text-center uppercase tracking-wider">
                Emergency QR
              </span>
            </div>
          </div>

          <div className="bg-slate-100/50 p-3 rounded-lg border border-slate-200 text-xs text-slate-600 print:hidden text-left">
            <span className="font-semibold text-slate-700 block mb-1">Patient onboarding is contained:</span>
            Patient login and credential issuance remain disabled until the approved identity provider and recovery workflow are implemented.
          </div>
        </div>

        <div className="flex gap-3 print:hidden">
          <button
            onClick={handlePrint}
            className="flex-1 border border-[var(--gray-200)] hover:bg-[var(--primary-50)] text-[var(--gray-600)] py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-1.5 transition-colors"
          >
            <Printer className="w-4 h-4" />
            Print Card
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-brand hover:bg-brand-dark text-white py-2.5 rounded-xl text-sm font-semibold transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function NewPatientPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successInfo, setSuccessInfo] = useState<SuccessInfo | null>(null);

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
    setError(null);
    try {
      const response = await backendApi.createPatient(form);
      if (response.success) {
        setSuccessInfo({
          patientId: response.patientId,
          accessKey: response.accessKey,
          qrPayload: response.qrPayload,
          name: form.name,
          email: form.email,
          phone: form.phone,
        });
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to register patient on the blockchain.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <LayoutWrapper>
      <div className="max-w-3xl mx-auto space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3 pt-2">
          <button onClick={() => router.back()} className="p-2 hover:bg-brand-light rounded-xl transition-colors">
            <ArrowLeft className="w-5 h-5 text-[var(--gray-600)]" />
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-[var(--ink-900)] font-display">Add New Patient</h1>
            <p className="text-sm text-[var(--gray-500)]">Register a new patient on the blockchain</p>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600" />
            {error}
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-4">
          {/* Demographics */}
          <div className="bg-white rounded-2xl p-5 border border-[var(--gray-200)] shadow-sm">
            <h2 className="font-semibold text-[var(--ink-900)] mb-4 flex items-center gap-2 text-base">
              <User className="w-4.5 h-4.5 text-brand" /> Patient Demographics
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2 text-left">
                <label className="block text-xs font-semibold text-[var(--gray-600)] mb-1">Full Name *</label>
                <input required value={form.name} onChange={e => set('name', e.target.value)}
                  placeholder="e.g. Aminata Koroma"
                  className="w-full border border-[var(--gray-200)] rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand" />
              </div>
              <div className="text-left">
                <label className="block text-xs font-semibold text-[var(--gray-600)] mb-1">Date of Birth *</label>
                <input required type="date" value={form.dob} onChange={e => set('dob', e.target.value)}
                  className="w-full border border-[var(--gray-200)] rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand" />
              </div>
              <div className="text-left">
                <label className="block text-xs font-semibold text-[var(--gray-600)] mb-1">Gender *</label>
                <select value={form.gender} onChange={e => set('gender', e.target.value)}
                  className="w-full border border-[var(--gray-200)] rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand">
                  <option>Female</option><option>Male</option><option>Other</option>
                </select>
              </div>
              <div className="text-left">
                <label className="block text-xs font-semibold text-[var(--gray-600)] mb-1">Blood Type *</label>
                <select value={form.bloodType} onChange={e => set('bloodType', e.target.value)}
                  className="w-full border border-[var(--gray-200)] rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand">
                  {BLOOD_TYPES.map(bt => <option key={bt}>{bt}</option>)}
                </select>
              </div>
              <div className="text-left">
                <label className="block text-xs font-semibold text-[var(--gray-600)] mb-1">Phone *</label>
                <input required value={form.phone} onChange={e => set('phone', e.target.value)}
                  placeholder="+232 76 123 456"
                  className="w-full border border-[var(--gray-200)] rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand" />
              </div>
              <div className="text-left">
                <label className="block text-xs font-semibold text-[var(--gray-600)] mb-1">Email</label>
                <input type="email" value={form.email} onChange={e => set('email', e.target.value)}
                  placeholder="patient@email.com"
                  className="w-full border border-[var(--gray-200)] rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand" />
              </div>
              <div className="sm:col-span-2 text-left">
                <label className="block text-xs font-semibold text-[var(--gray-600)] mb-1">Address *</label>
                <input required value={form.address} onChange={e => set('address', e.target.value)}
                  placeholder="e.g. 12 Wilkinson Road, Freetown"
                  className="w-full border border-[var(--gray-200)] rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand" />
              </div>
            </div>
          </div>

          {/* Medical info */}
          <div className="bg-white rounded-2xl p-5 border border-[var(--gray-200)] shadow-sm">
            <h2 className="font-semibold text-[var(--ink-900)] mb-4 flex items-center gap-2 text-base">
              <Pill className="w-4.5 h-4.5 text-[var(--purple-600)]" /> Medical Information
            </h2>
            <div className="space-y-4">
              <div className="text-left">
                <label className="block text-xs font-semibold text-[var(--gray-600)] mb-1">Primary Condition *</label>
                <input required value={form.condition} onChange={e => set('condition', e.target.value)}
                  placeholder="e.g. Hypertension, Type 2 Diabetes"
                  className="w-full border border-[var(--gray-200)] rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand" />
              </div>
              <div className="text-left">
                <label className="block text-xs font-semibold text-[var(--gray-600)] mb-1">
                  Allergies <span className="text-[var(--gray-500)] font-normal">(comma-separated)</span>
                </label>
                <input value={form.allergies} onChange={e => set('allergies', e.target.value)}
                  placeholder="e.g. Penicillin, Aspirin"
                  className="w-full border border-[var(--gray-200)] rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand" />
              </div>
              <div className="text-left">
                <label className="block text-xs font-semibold text-[var(--gray-600)] mb-1">
                  Current Medications <span className="text-[var(--gray-500)] font-normal">(comma-separated)</span>
                </label>
                <input value={form.medications} onChange={e => set('medications', e.target.value)}
                  placeholder="e.g. Lisinopril 10mg, Amlodipine 5mg"
                  className="w-full border border-[var(--gray-200)] rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand" />
              </div>
              <div className="text-left">
                <label className="block text-xs font-semibold text-[var(--gray-600)] mb-1">Clinical Notes</label>
                <textarea value={form.notes} onChange={e => set('notes', e.target.value)}
                  rows={3} placeholder="Additional clinical notes..."
                  className="w-full border border-[var(--gray-200)] rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand resize-none" />
              </div>
            </div>
          </div>

          {/* Emergency + Insurance */}
          <div className="bg-white rounded-2xl p-5 border border-[var(--gray-200)] shadow-sm">
            <h2 className="font-semibold text-[var(--ink-900)] mb-4 flex items-center gap-2 text-base">
              <AlertCircle className="w-4.5 h-4.5 text-[var(--red-600)]" /> Emergency Contact & Insurance
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="text-left">
                <label className="block text-xs font-semibold text-[var(--gray-600)] mb-1">Emergency Contact Name *</label>
                <input required value={form.emergencyContactName} onChange={e => set('emergencyContactName', e.target.value)}
                  placeholder="e.g. Ibrahim Koroma"
                  className="w-full border border-[var(--gray-200)] rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand" />
              </div>
              <div className="text-left">
                <label className="block text-xs font-semibold text-[var(--gray-600)] mb-1">Emergency Contact Phone *</label>
                <input required value={form.emergencyContactPhone} onChange={e => set('emergencyContactPhone', e.target.value)}
                  placeholder="e.g. +232 76 987 654"
                  className="w-full border border-[var(--gray-200)] rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand" />
              </div>
              <div className="text-left">
                <label className="block text-xs font-semibold text-[var(--gray-600)] mb-1">Insurance Provider</label>
                <input value={form.insuranceProvider} onChange={e => set('insuranceProvider', e.target.value)}
                  placeholder="e.g. NASSIT"
                  className="w-full border border-[var(--gray-200)] rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand" />
              </div>
              <div className="text-left">
                <label className="block text-xs font-semibold text-[var(--gray-600)] mb-1">Insurance ID</label>
                <input value={form.insuranceId} onChange={e => set('insuranceId', e.target.value)}
                  placeholder="e.g. NAS-2291-AK"
                  className="w-full border border-[var(--gray-200)] rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand" />
              </div>
            </div>
          </div>

          {/* QR Access Permissions */}
          <div className="bg-white rounded-2xl p-5 border border-[var(--gray-200)] shadow-sm">
            <h2 className="font-semibold text-[var(--ink-900)] mb-1 flex items-center gap-2 text-base">
              <Shield className="w-4.5 h-4.5 text-brand" /> QR Public Access Permissions
            </h2>
            <p className="text-xs text-[var(--gray-500)] mb-4 text-left">Choose which fields are visible on the public emergency QR card (no login required)</p>
            <div className="flex items-center gap-3 mb-3 text-left">
              <input type="checkbox" id="qrAccess" checked={form.qrPublicAccess} onChange={e => set('qrPublicAccess', e.target.checked)} className="accent-brand w-4 h-4 cursor-pointer" />
              <label htmlFor="qrAccess" className="text-sm font-semibold text-[var(--ink-900)] cursor-pointer">Enable public QR emergency card</label>
            </div>
            {form.qrPublicAccess && (
              <div className="grid grid-cols-2 gap-2 ml-7 text-left">
                {[['qrName', 'Name'], ['qrBloodType', 'Blood Type'], ['qrAllergies', 'Allergies'], ['qrEmergencyContact', 'Emergency Contact']].map(([key, label]) => (
                  <div key={key} className="flex items-center gap-2">
                    <input type="checkbox" id={key} checked={form[key as keyof typeof form] as boolean}
                      onChange={e => set(key, e.target.checked)} className="accent-brand w-4 h-4 cursor-pointer" />
                    <label htmlFor={key} className="text-sm text-[var(--gray-600)] cursor-pointer font-medium">{label}</label>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit */}
          <div className="flex gap-3 pb-6">
            <button type="button" onClick={() => router.back()}
              className="flex-1 border border-[var(--gray-200)] hover:bg-[var(--primary-50)] text-[var(--gray-600)] py-3 rounded-xl text-sm font-semibold transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={saving}
              className="flex-1 bg-brand hover:bg-brand-dark disabled:opacity-60 text-white py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-colors">
              {saving ? (
                <>
                  <Save className="w-4 h-4 animate-pulse" />
                  Registering on Blockchain...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Register Patient
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {successInfo && (
        <SuccessModal info={successInfo} onClose={() => {
          setSuccessInfo(null);
          router.push('/patients');
        }} />
      )}
    </LayoutWrapper>
  );
}
