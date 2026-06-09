'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft, Phone, Mail, MapPin, AlertCircle, Pill, QrCode,
  Calendar, FileText, Edit, Loader2, Lock, Send, CheckCircle2, X,
} from 'lucide-react';
import { LayoutWrapper } from '@/components/dashboard/layout-wrapper';
import { MOCK_PATIENTS, MOCK_RECORDS, MOCK_APPOINTMENTS } from '@/data/mockData';
import { backendApi, BackendPatientDetail } from '@/services/backendApi';
import type { Patient } from '@/types';

// ─── Access Request Modal ──────────────────────────────────────────────────────

function AccessRequestModal({
  patientId,
  patientName,
  onClose,
  onSuccess,
}: {
  patientId: string;
  patientName: string;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) return;
    setSubmitting(true);
    setErr(null);
    try {
      await backendApi.requestPatientAccess({
        patientId,
        reason: reason.trim(),
        categories: ['all'],
      });
      setSubmitted(true);
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 2000);
    } catch (error: any) {
      setErr(error.message || 'Failed to send access request. Please try again.');
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-lg hover:bg-[#EAEEF2] transition-colors"
        >
          <X className="w-4 h-4 text-[#8C91A8]" />
        </button>

        {submitted ? (
          <div className="text-center py-6 space-y-3">
            <CheckCircle2 className="w-12 h-12 text-brand mx-auto" />
            <h3 className="text-lg font-bold text-[#101326]">Request Sent!</h3>
            <p className="text-sm text-[#8C91A8]">
              Your access request for <strong>{patientName}</strong> has been sent. The patient
              will be notified on their MediChain app.
            </p>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 bg-[#EDE9FF] rounded-xl flex items-center justify-center">
                <Lock className="w-5 h-5 text-[#8F76FF]" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#101326]">Request Record Access</h3>
                <p className="text-xs text-[#8C91A8]">Patient: {patientName}</p>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-4 text-xs text-amber-800">
              You do not currently have consent to view this patient's full medical record. Submit a
              request and the patient will approve or deny it via the MediChain patient app.
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#5D6582] mb-1">
                  Reason for Access Request <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={4}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="e.g. Patient is presenting with chest pain and requires immediate medical history review..."
                  className="w-full border border-[#D8DCE8] rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand resize-none"
                />
              </div>

              {err && (
                <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                  {err}
                </p>
              )}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 border border-[#D8DCE8] hover:bg-[#EAEEF2] text-[#5D6582] py-2.5 rounded-xl text-sm font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || !reason.trim()}
                  className="flex-1 bg-brand hover:bg-brand-dark disabled:opacity-60 text-white py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-colors"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Send Request
                    </>
                  )}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function PatientDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [loading, setLoading] = useState(true);
  const [accessDenied, setAccessDenied] = useState(false);
  const [showAccessModal, setShowAccessModal] = useState(false);
  const [backendData, setBackendData] = useState<BackendPatientDetail | null>(null);

  // Dynamic roles & treatment state
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [showPrescribeModal, setShowPrescribeModal] = useState(false);
  const [prescribeForm, setPrescribeForm] = useState({ title: '', treatmentType: 'medication', description: '' });
  const [prescribing, setPrescribing] = useState(false);
  const [prescribeError, setPrescribeError] = useState<string | null>(null);

  // Fallback to mock data
  const mockPatient = MOCK_PATIENTS.find((p) => p.id === id) as Patient | undefined;
  const patientRecords = MOCK_RECORDS.filter((r) => r.patientId === id);
  const patientAppointments = MOCK_APPOINTMENTS.filter((a) => a.patientId === id);

  const fetchDetail = async () => {
    setLoading(true);
    try {
      const data = await backendApi.getPatientDetail(id);
      setBackendData(data);
      setAccessDenied(false);
    } catch (err: any) {
      if (err.status === 403) {
        setAccessDenied(true);
      }
      setBackendData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [id]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const userStr = sessionStorage.getItem('mc_user');
      if (userStr) {
        try {
          setCurrentUser(JSON.parse(userStr));
        } catch (e) {}
      }
    }
  }, []);

  const handlePrescribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prescribeForm.title.trim()) return;
    setPrescribing(true);
    setPrescribeError(null);
    try {
      await backendApi.recordTreatment({
        patientId: id,
        treatmentType: prescribeForm.treatmentType,
        title: prescribeForm.title.trim(),
        description: prescribeForm.description.trim(),
      });
      await fetchDetail();
      setShowPrescribeModal(false);
      setPrescribeForm({ title: '', treatmentType: 'medication', description: '' });
    } catch (err: any) {
      setPrescribeError(err.message || 'Failed to record medication/treatment.');
    } finally {
      setPrescribing(false);
    }
  };

  // Derive role from backend response (most accurate) or fall back to sessionStorage
  const actorRole = backendData?.actorRole || currentUser?.role || 'doctor';
  const isDoctor = actorRole === 'doctor' || actorRole === 'admin';
  const isNurse  = actorRole === 'nurse';

  // Loading state
  if (loading) {
    return (
      <LayoutWrapper>
        <div className="flex flex-col items-center justify-center py-24 gap-3 text-[#8C91A8]">
          <Loader2 className="w-6 h-6 animate-spin" />
          <p className="text-sm">Loading patient record from blockchain...</p>
        </div>
      </LayoutWrapper>
    );
  }

  // Access denied — show overlay with request button
  if (accessDenied) {
    const patientName = mockPatient?.name || `Patient ${id}`;
    const initials = (patientName || '').split(' ').map((n: string) => n.charAt(0)).join('').slice(0, 2).toUpperCase();

    return (
      <LayoutWrapper>
        {showAccessModal && (
          <AccessRequestModal
            patientId={id}
            patientName={patientName}
            onClose={() => setShowAccessModal(false)}
            onSuccess={() => {
              setShowAccessModal(false);
              router.push('/patients');
            }}
          />
        )}

        <div className="space-y-4 sm:space-y-6">
          {/* Back + Header */}
          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={() => router.push('/patients')}
              className="p-2 hover:bg-brand-light rounded-xl transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-[#5D6582]" />
            </button>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-[#101326]">{patientName}</h1>
              <p className="text-sm text-[#8C91A8]">Patient ID: {id}</p>
            </div>
          </div>

          {/* Access Denied card */}
          <div className="max-w-lg mx-auto">
            <div className="bg-white rounded-2xl border border-[#D8DCE8] p-8 text-center space-y-6">
              <div className="relative inline-flex">
                <div className="w-20 h-20 rounded-full bg-[#EAEEF2] flex items-center justify-center font-bold text-2xl text-[#8C91A8]">
                  {initials}
                </div>
                <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center">
                  <Lock className="w-4 h-4 text-white" />
                </div>
              </div>

              <div>
                <h2 className="text-lg font-bold text-[#101326]">Access Restricted</h2>
                <p className="text-sm text-[#8C91A8] mt-2 max-w-xs mx-auto">
                  You don't have consent to view <strong>{patientName}</strong>'s medical records.
                  Request access and the patient will be notified.
                </p>
              </div>

              <div className="bg-[#EAEEF2] rounded-xl p-4 text-sm text-[#5D6582] text-left space-y-2">
                <p className="font-semibold text-[#101326] text-xs uppercase tracking-wider">
                  How it works
                </p>
                <ol className="space-y-1 text-xs list-decimal list-inside">
                  <li>Submit an access request with your clinical reason</li>
                  <li>The patient receives a push notification on MediChain</li>
                  <li>Once approved, you will have access to their records</li>
                  <li>All access is logged on the Hyperledger Fabric blockchain</li>
                </ol>
              </div>

              <button
                id="request-access-btn"
                onClick={() => setShowAccessModal(true)}
                className="w-full bg-brand hover:bg-brand-dark text-white py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-colors"
              >
                <Send className="w-4 h-4" />
                Request Access to Records
              </button>
            </div>
          </div>
        </div>
      </LayoutWrapper>
    );
  }

  // Use backend data or fall back to mock
  const patient = backendData
    ? {
        id: backendData.patient.id,
        name: backendData.patient.fullName,
        initials: (backendData.patient.fullName || '').split(' ').map((n) => n.charAt(0)).join('').slice(0, 2).toUpperCase(),
        phone: backendData.patient.phone,
        email: backendData.patient.email,
        bloodType: backendData.patient.bloodType,
        address: '',
        status: 'Active',
        allergies: backendData.patient.allergies.map((a) =>
          typeof a === 'string' ? a : a.name
        ),
        medications: backendData.patient.medications.map((m) =>
          typeof m === 'string' ? m : `${m.name}${m.dosage ? ` ${m.dosage}` : ''}`
        ),
        condition: (backendData.patient.chronicConditions || []).map((c: any) =>
          typeof c === 'string' ? c : c.name
        ).join(', ') || 'See records',
        notes: '',
        emergencyContactName: '',
        emergencyContactPhone: '',
        age: backendData.patient.dob
          ? new Date().getFullYear() - new Date(backendData.patient.dob).getFullYear()
          : 0,
        gender: 'Unknown',
      }
    : mockPatient;

  if (!patient) {
    return (
      <LayoutWrapper>
        <div className="text-center py-20">
          <p className="text-xl font-bold text-[#101326]">Patient not found</p>
          <button
            onClick={() => router.push('/patients')}
            className="mt-4 text-brand hover:underline text-sm"
          >
            ← Back to Patients
          </button>
        </div>
      </LayoutWrapper>
    );
  }

  // Use backend records or mock records
  const records = backendData
    ? backendData.records.map((r) => ({
        id: r.id,
        patientId: r.patient_id,
        type: r.record_type,
        description: r.title,
        date: new Date(r.created_at).toLocaleDateString('en-GB', {
          day: '2-digit', month: 'short', year: 'numeric',
        }),
        status: 'Synced',
      }))
    : patientRecords;

  return (
    <LayoutWrapper>
      <div className="space-y-4 sm:space-y-6">
        {/* Back + Header */}
        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={() => router.push('/patients')}
            className="p-2 hover:bg-brand-light rounded-xl transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-[#5D6582]" />
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#101326]">{patient.name}</h1>
            <p className="text-sm text-[#8C91A8]">Patient ID: {patient.id}</p>
          </div>
          <div className="ml-auto flex gap-2">
            {isDoctor && (
              <button
                onClick={() => setShowPrescribeModal(true)}
                className="flex items-center gap-2 border border-[#8F76FF] text-[#8F76FF] hover:bg-[#EDE9FF] px-3 py-2 rounded-xl text-sm font-medium transition-colors"
              >
                <Pill className="w-4 h-4" />
                <span className="hidden sm:inline">Prescribe</span>
              </button>
            )}
            <button
              onClick={() => router.push(`/public/patient-qr/${id}`)}
              className="flex items-center gap-2 border border-[#D8DCE8] hover:border-brand px-3 py-2 rounded-xl text-sm font-medium text-[#5D6582] hover:text-brand transition-colors"
            >
              <QrCode className="w-4 h-4" />
              <span className="hidden sm:inline">View QR</span>
            </button>
            {isDoctor && (
              <button
                onClick={() => alert('Edit patient demographics coming soon.')}
                className="flex items-center gap-2 bg-brand hover:bg-brand-dark text-white px-3 py-2 rounded-xl text-sm font-medium transition-colors"
              >
                <Edit className="w-4 h-4" />
                <span className="hidden sm:inline">Edit</span>
              </button>
            )}
          </div>
        </div>

        {/* Nurse triage read-only notice */}
        {isNurse && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl px-5 py-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-amber-900">Triage Read-Only Access (Nurse)</p>
              <p className="text-xs text-amber-700 mt-0.5">
                You are viewing this patient in triage mode. You can see allergies, medications, and treatment history.
                Clinical diagnoses and full medical records are restricted to attending doctors only. All access is logged immutably on Hyperledger Fabric.
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Left: Demographics */}
          <div className="lg:col-span-1 space-y-4">
            {/* Profile card */}
            <div className="bg-white rounded-2xl p-5 border border-[#D8DCE8]">
              <div className="flex items-center gap-4 mb-4">
                <div
                  className={`w-16 h-16 rounded-full flex items-center justify-center font-bold text-xl ${
                    (patient as any).status === 'Critical'
                      ? 'bg-[#FEE2E2] text-[#E53E3E]'
                      : 'bg-brand-light text-brand'
                  }`}
                >
                  {patient.initials}
                </div>
                <div>
                  <div className="font-bold text-[#101326] text-lg">{patient.name}</div>
                  {(patient as any).age > 0 && (
                    <div className="text-sm text-[#8C91A8]">
                      {(patient as any).gender} • {(patient as any).age} years
                    </div>
                  )}
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-brand-light text-brand">
                    {(patient as any).status || 'Active'}
                  </span>
                </div>
              </div>

              <div className="space-y-2.5">
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="w-4 h-4 text-[#8C91A8]" />
                  <span className="text-[#5D6582]">{patient.phone}</span>
                </div>
                {patient.email && (
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="w-4 h-4 text-[#8C91A8]" />
                    <span className="text-[#5D6582]">{patient.email}</span>
                  </div>
                )}
                {(patient as any).address && (
                  <div className="flex items-start gap-2 text-sm">
                    <MapPin className="w-4 h-4 text-[#8C91A8] mt-0.5" />
                    <span className="text-[#5D6582]">{(patient as any).address}</span>
                  </div>
                )}
              </div>

              <div className="mt-4 pt-4 border-t border-[#D8DCE8] grid grid-cols-2 gap-3">
                <div className="bg-[#EDE9FF] rounded-xl p-3 text-center">
                  <div className="text-lg font-bold text-[#8F76FF]">{patient.bloodType}</div>
                  <div className="text-xs text-[#8C91A8]">Blood Type</div>
                </div>
                {(patient as any).age > 0 && (
                  <div className="bg-brand-light rounded-xl p-3 text-center">
                    <div className="text-lg font-bold text-brand">{(patient as any).age}</div>
                    <div className="text-xs text-[#8C91A8]">Age</div>
                  </div>
                )}
              </div>
            </div>

            {/* Emergency Contact */}
            {(patient as any).emergencyContactName && (
              <div className="bg-white rounded-2xl p-5 border border-[#D8DCE8]">
                <h3 className="font-semibold text-[#101326] mb-3 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-[#E53E3E]" />
                  Emergency Contact
                </h3>
                <p className="font-medium text-[#101326] text-sm">{(patient as any).emergencyContactName}</p>
                <p className="text-sm text-[#5D6582]">{(patient as any).emergencyContactPhone}</p>
              </div>
            )}

            {/* Insurance */}
            {(patient as any).insuranceProvider && (
              <div className="bg-white rounded-2xl p-5 border border-[#D8DCE8]">
                <h3 className="font-semibold text-[#101326] mb-2">Insurance</h3>
                <p className="text-sm font-medium text-[#5D6582]">{(patient as any).insuranceProvider}</p>
                <p className="text-xs text-[#8C91A8]">ID: {(patient as any).insuranceId}</p>
              </div>
            )}
          </div>

          {/* Right: Medical details */}
          <div className="lg:col-span-2 space-y-4">
            {/* Primary condition */}
            <div className="bg-white rounded-2xl p-5 border border-[#D8DCE8]">
              <h3 className="font-semibold text-[#101326] mb-3">Primary Condition</h3>
              <p className="text-[#5D6582]">{(patient as any).condition}</p>
              {(patient as any).notes && (
                <div className="mt-3 p-3 bg-[#FFF3E6] border border-[#FDE8DC] rounded-xl">
                  <p className="text-xs text-[#FA6E3C] font-medium mb-1">Clinical Note</p>
                  <p className="text-sm text-[#5D6582]">{(patient as any).notes}</p>
                </div>
              )}
            </div>

            {/* Allergies */}
            <div className="bg-white rounded-2xl p-5 border border-[#D8DCE8]">
              <h3 className="font-semibold text-[#101326] mb-3 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-[#FA6E3C]" />
                Allergies
              </h3>
              {patient.allergies && patient.allergies.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {(patient.allergies as string[]).map((a) => (
                    <span key={a} className="allergy-chip">
                      {a}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-[#8C91A8]">No known allergies</p>
              )}
            </div>

            {/* Treatments & Medication History */}
            <div className="bg-white rounded-2xl p-5 border border-[#D8DCE8]">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-[#101326] flex items-center gap-2">
                  <Pill className="w-4 h-4 text-[#8F76FF]" />
                  Treatments & Medication history
                </h3>
                {isDoctor && (
                  <button
                    onClick={() => setShowPrescribeModal(true)}
                    className="text-xs text-brand hover:underline font-semibold"
                  >
                    + Issue Medication
                  </button>
                )}
              </div>
              <div className="space-y-3">
                {backendData && backendData.treatments && backendData.treatments.length > 0 ? (
                  backendData.treatments.map((t: any) => (
                    <div key={t.id} className="p-3 bg-[#EDE9FF] rounded-xl border border-[#D8DCE8] space-y-1.5">
                      <div className="flex items-start justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-[#8F76FF] bg-white px-2 py-0.5 rounded-lg border border-[#EDE9FF]">
                          {t.treatment_type}
                        </span>
                        {t.ledger_tx_hash && (
                          <span className="text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded-md font-semibold flex items-center gap-0.5">
                            Synced to Ledger
                          </span>
                        )}
                      </div>
                      <h4 className="font-semibold text-sm text-[#101326]">{t.title}</h4>
                      {t.description && (
                        <p className="text-xs text-[#5D6582] bg-white/70 p-2 rounded-lg italic">
                          {t.description}
                        </p>
                      )}
                      <div className="flex items-center justify-between text-[10px] text-[#8C91A8] pt-1">
                        <span>Issued by: {t.doctor_name || 'Medical Practitioner'}</span>
                        <span>{new Date(t.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                      </div>
                    </div>
                  ))
                ) : (patient.medications as string[]).length > 0 ? (
                  (patient.medications as string[]).map((med, i) => (
                    <div key={i} className="flex items-center gap-2 p-2 bg-[#EDE9FF] rounded-xl">
                      <div className="w-2 h-2 bg-[#8F76FF] rounded-full" />
                      <span className="text-sm text-[#5D6582]">{med}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-[#8C91A8]">No medications or treatments recorded yet</p>
                )}
              </div>
            </div>

            {/* Records */}
            <div className="bg-white rounded-2xl p-5 border border-[#D8DCE8]">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-[#101326] flex items-center gap-2">
                  <FileText className="w-4 h-4 text-brand" />
                  Medical Records ({records.length})
                </h3>
                {isDoctor && (
                  <button
                    onClick={() => router.push('/records/upload')}
                    className="text-xs text-brand hover:underline font-medium"
                  >
                    + Upload
                  </button>
                )}
              </div>
              <div className="space-y-2">
                {records.map((record: any) => (
                  <div key={record.id} className="flex items-center gap-3 p-3 bg-[#EAEEF2] rounded-xl">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        record.status === 'Synced'
                          ? 'bg-brand'
                          : record.status === 'Pending'
                          ? 'bg-[#FA6E3C]'
                          : 'bg-[#8F76FF]'
                      }`}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[#101326]">{record.type || record.record_type}</p>
                      <p className="text-xs text-[#8C91A8] truncate">{record.description || record.title}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-[#8C91A8]">{record.date}</p>
                      <span className={`text-xs font-semibold ${record.status === 'Synced' ? 'text-brand' : 'text-[#FA6E3C]'}`}>
                        {record.status}
                      </span>
                    </div>
                  </div>
                ))}
                {records.length === 0 && (
                  <p className="text-sm text-[#8C91A8] text-center py-4">No records yet</p>
                )}
              </div>
            </div>

            {/* Appointments */}
            <div className="bg-white rounded-2xl p-5 border border-[#D8DCE8]">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-[#101326] flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-brand" />
                  Appointments ({patientAppointments.length})
                </h3>
                <button
                  onClick={() => router.push('/appointments')}
                  className="text-xs text-brand hover:underline font-medium"
                >
                  View all
                </button>
              </div>
              <div className="space-y-2">
                {patientAppointments.slice(0, 3).map((appt: any) => (
                  <div key={appt.id} className="flex items-center gap-3 p-3 bg-[#EAEEF2] rounded-xl">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-[#101326]">
                        {appt.category} • {appt.type}
                      </p>
                      <p className="text-xs text-[#8C91A8]">
                        {appt.date} {appt.startTime}–{appt.endTime}
                      </p>
                    </div>
                    <span
                      className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                        appt.status === 'Completed'
                          ? 'bg-brand-light text-brand'
                          : appt.status === 'In Progress'
                          ? 'bg-[#FFF3E6] text-[#FA6E3C]'
                          : appt.status === 'No-Show'
                          ? 'bg-[#FEE2E2] text-[#E53E3E]'
                          : 'bg-[#EDE9FF] text-[#8F76FF]'
                      }`}
                    >
                      {appt.status}
                    </span>
                  </div>
                ))}
                {patientAppointments.length === 0 && (
                  <p className="text-sm text-[#8C91A8] text-center py-4">No appointments</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {showPrescribeModal && (
        <PrescribeModal
          onClose={() => setShowPrescribeModal(false)}
          onSubmit={handlePrescribe}
          form={prescribeForm}
          setForm={setPrescribeForm}
          submitting={prescribing}
          error={prescribeError}
        />
      )}
    </LayoutWrapper>
  );
}

function PrescribeModal({
  onClose,
  onSubmit,
  form,
  setForm,
  submitting,
  error,
}: {
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  form: { title: string; treatmentType: string; description: string };
  setForm: React.Dispatch<React.SetStateAction<{ title: string; treatmentType: string; description: string }>>;
  submitting: boolean;
  error: string | null;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-lg hover:bg-[#EAEEF2] transition-colors"
        >
          <X className="w-4 h-4 text-[#8C91A8]" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 bg-[#EDE9FF] rounded-xl flex items-center justify-center">
            <Pill className="w-5 h-5 text-[#8F76FF]" />
          </div>
          <div>
            <h3 className="text-base font-bold text-[#101326]">Record Patient Treatment</h3>
            <p className="text-xs text-[#8C91A8]">Add a new prescription or clinical action</p>
          </div>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-[#5D6582] mb-1">
              Treatment Type <span className="text-red-500">*</span>
            </label>
            <select
              value={form.treatmentType}
              onChange={(e) => setForm(f => ({ ...f, treatmentType: e.target.value }))}
              className="w-full border border-[#D8DCE8] rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand"
            >
              <option value="medication">Medication / Prescription</option>
              <option value="procedure">Clinical Procedure / Surgery</option>
              <option value="therapy">Therapy / Rehabilitation</option>
              <option value="other">Other Treatment</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#5D6582] mb-1">
              Title / Medication Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Paracetamol 500mg or Appendectomy"
              value={form.title}
              onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))}
              className="w-full border border-[#D8DCE8] rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#5D6582] mb-1">
              Instructions & Dosage Notes
            </label>
            <textarea
              rows={3}
              placeholder="e.g. Take 1 tablet twice daily after meals for 5 days."
              value={form.description}
              onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
              className="w-full border border-[#D8DCE8] rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand resize-none"
            />
          </div>

          {error && (
            <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-[#D8DCE8] hover:bg-[#EAEEF2] text-[#5D6582] py-2.5 rounded-xl text-sm font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !form.title.trim()}
              className="flex-1 bg-[#8F76FF] hover:bg-[#7b5eff] disabled:opacity-60 text-white py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-colors"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Record'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
