'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Plus, Filter, ChevronRight, Loader2, RefreshCw, WifiOff } from 'lucide-react';
import { LayoutWrapper } from '@/components/dashboard/layout-wrapper';
import { MOCK_PATIENTS } from '@/data/mockData';
import { backendApi, BackendPatient } from '@/services/backendApi';
import type { Patient, PatientStatus } from '@/types';

// ─── Helper to adapt backend patient to UI shape ─────────────────────────────

function adaptBackendPatient(bp: BackendPatient): Patient {
  const names = bp.name.split(' ');
  const initials = names.map((n) => n[0]).join('').slice(0, 2).toUpperCase();
  return {
    id: bp.id,
    name: bp.name,
    initials,
    age: bp.dateOfBirth ? new Date().getFullYear() - new Date(bp.dateOfBirth).getFullYear() : 0,
    gender: 'Unknown' as any,
    bloodType: (bp.bloodType || 'O+') as any,
    phone: bp.phone,
    email: bp.email,
    address: '',
    condition: 'See full record',
    status: 'Active' as PatientStatus,
    allergies: (bp.allergies || []).map((a: any) =>
      typeof a === 'string' ? a : a.name
    ),
    medications: [],
    lastVisit: new Date().toISOString(),
    nextVisit: null,
    emergencyContactName: '',
    emergencyContactPhone: '',
    notes: '',
  } as unknown as Patient;
}

// ─── UI Components ────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: PatientStatus }) {
  const styles: Record<PatientStatus, string> = {
    Active: 'bg-brand-light text-brand',
    Inactive: 'bg-[#EAEEF2] text-[#8C91A8]',
    Critical: 'bg-[#FEE2E2] text-[#E53E3E]',
  };
  return (
    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${styles[status]}`}>
      {status}
    </span>
  );
}

function BloodTypeBadge({ type }: { type: string }) {
  return (
    <span className="text-xs font-bold bg-[#EDE9FF] text-[#8F76FF] px-2 py-0.5 rounded-full">
      {type}
    </span>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function PatientsPage() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<PatientStatus | 'All'>('All');
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [usingMock, setUsingMock] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPatients = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await backendApi.getAccessiblePatients();
      if (data.patients && data.patients.length > 0) {
        setPatients(data.patients.map(adaptBackendPatient));
        setUsingMock(false);
      } else {
        // Backend returned empty — fall back to mock so the UI is never blank
        setPatients(MOCK_PATIENTS);
        setUsingMock(true);
      }
    } catch (err: any) {
      // Can't reach backend (not running or no token) — use mock data
      console.warn('[Patients] Backend unavailable, using mock data:', err.message);
      setPatients(MOCK_PATIENTS);
      setUsingMock(true);
    } finally {
      setLoading(false);
    }
  };

  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    fetchPatients();
  }, []);

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

  const filtered = patients.filter((p) => {
    const matchSearch =
      (p.name || '').toLowerCase().includes(search.toLowerCase()) ||
      (p.condition && p.condition.toLowerCase().includes(search.toLowerCase())) ||
      (p.id || '').toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'All' || p.status === filterStatus;
    return matchSearch && matchStatus;
  });

  return (
    <LayoutWrapper>
      <div className="space-y-4 sm:space-y-6">
        {/* Page header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#101326]">Patients</h1>
            <div className="flex items-center gap-2">
              <p className="text-sm text-[#8C91A8]">
                {loading ? 'Loading...' : `${patients.length} registered patients`}
              </p>
              {usingMock && !loading && (
                <span className="text-xs bg-amber-50 border border-amber-200 text-amber-700 px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                  <WifiOff className="w-3 h-3" />
                  Demo data
                </span>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <button
              id="refresh-patients-btn"
              onClick={fetchPatients}
              disabled={loading}
              className="flex items-center gap-2 border border-[#D8DCE8] hover:bg-[#EAEEF2] text-[#5D6582] px-3 py-2.5 rounded-xl text-sm font-medium transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            {currentUser?.role === 'doctor' && (
              <button
                id="add-patient-btn"
                onClick={() => router.push('/patients/new')}
                className="flex items-center gap-2 bg-brand hover:bg-brand-dark text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add New Patient
              </button>
            )}
          </div>
        </div>

        {/* Error banner */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-2xl p-4 border border-[#D8DCE8]">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8C91A8]" />
              <input
                id="patient-search"
                type="text"
                placeholder="Search by name, condition or ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-[#D8DCE8] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-[#8C91A8]" />
              {(['All', 'Active', 'Critical', 'Inactive'] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setFilterStatus(s)}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
                    filterStatus === s
                      ? 'bg-brand text-white'
                      : 'bg-[#EAEEF2] text-[#5D6582] hover:bg-brand-light'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Loading state */}
        {loading && (
          <div className="flex items-center justify-center py-16 gap-3 text-[#8C91A8]">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-sm">Loading patients from backend...</span>
          </div>
        )}

        {/* Patients grid */}
        {!loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
            {filtered.map((patient) => (
              <PatientCard
                key={patient.id}
                patient={patient}
                onClick={() => router.push(`/patients/${patient.id}`)}
              />
            ))}
            {filtered.length === 0 && (
              <div className="col-span-full text-center py-16 text-[#8C91A8]">
                <p className="text-lg font-medium">No patients found</p>
                <p className="text-sm mt-1">Try adjusting your search or filter</p>
              </div>
            )}
          </div>
        )}
      </div>
    </LayoutWrapper>
  );
}

function PatientCard({ patient, onClick }: { patient: Patient; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="bg-white rounded-2xl p-4 sm:p-5 border border-[#D8DCE8] hover:border-brand hover:shadow-sm transition-all text-left w-full group"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div
            className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm ${
              patient.status === 'Critical' ? 'bg-[#FEE2E2] text-[#E53E3E]' : 'bg-brand-light text-brand'
            }`}
          >
            {patient.initials}
          </div>
          <div>
            <div className="font-semibold text-[#101326] text-sm">{patient.name}</div>
            {patient.age > 0 ? (
              <div className="text-xs text-[#8C91A8]">
                {patient.gender} • {patient.age} yrs
              </div>
            ) : (
              <div className="text-xs text-[#8C91A8]">{patient.phone}</div>
            )}
          </div>
        </div>
        <ChevronRight className="w-4 h-4 text-[#8C91A8] group-hover:text-brand transition-colors" />
      </div>

      <div className="flex items-center gap-2 mb-3">
        <StatusBadge status={patient.status} />
        <BloodTypeBadge type={patient.bloodType} />
      </div>

      <div className="text-xs text-[#5D6582] mb-2">
        <span className="font-medium">Condition:</span> {patient.condition}
      </div>

      {patient.allergies && patient.allergies.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {patient.allergies.slice(0, 2).map((a) => (
            <span key={a} className="allergy-chip">
              {a}
            </span>
          ))}
          {patient.allergies.length > 2 && (
            <span className="text-xs text-[#8C91A8]">+{patient.allergies.length - 2} more</span>
          )}
        </div>
      )}

      {patient.lastVisit && (
        <div className="text-xs text-[#8C91A8] mt-2 pt-2 border-t border-[#D8DCE8]">
          Last visit:{' '}
          {new Date(patient.lastVisit).toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          })}
          {patient.nextVisit && (
            <span className="ml-2 text-brand">
              • Next:{' '}
              {new Date(patient.nextVisit).toLocaleDateString('en-GB', {
                day: '2-digit',
                month: 'short',
              })}
            </span>
          )}
        </div>
      )}
    </button>
  );
}
