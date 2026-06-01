'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Plus, Filter, ChevronRight } from 'lucide-react';
import { LayoutWrapper } from '@/components/dashboard/layout-wrapper';
import { MOCK_PATIENTS } from '@/data/mockData';
import type { Patient, PatientStatus } from '@/types';

function StatusBadge({ status }: { status: PatientStatus }) {
  const styles = {
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

export default function PatientsPage() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<PatientStatus | 'All'>('All');

  const filtered = MOCK_PATIENTS.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.condition.toLowerCase().includes(search.toLowerCase()) ||
      p.id.toLowerCase().includes(search.toLowerCase());
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
            <p className="text-sm text-[#8C91A8]">{MOCK_PATIENTS.length} registered patients</p>
          </div>
          <button
            id="add-patient-btn"
            onClick={() => router.push('/patients/new')}
            className="flex items-center gap-2 bg-brand hover:bg-brand-dark text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add New Patient
          </button>
        </div>

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
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-[#D8DCE8] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-[#8C91A8]" />
              {(['All', 'Active', 'Critical', 'Inactive'] as const).map(s => (
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

        {/* Patients grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
          {filtered.map((patient) => (
            <PatientCard key={patient.id} patient={patient} onClick={() => router.push(`/patients/${patient.id}`)} />
          ))}
          {filtered.length === 0 && (
            <div className="col-span-full text-center py-16 text-[#8C91A8]">
              <p className="text-lg font-medium">No patients found</p>
              <p className="text-sm mt-1">Try adjusting your search or filter</p>
            </div>
          )}
        </div>
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
          <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm ${
            patient.status === 'Critical' ? 'bg-[#FEE2E2] text-[#E53E3E]' : 'bg-brand-light text-brand'
          }`}>
            {patient.initials}
          </div>
          <div>
            <div className="font-semibold text-[#101326] text-sm">{patient.name}</div>
            <div className="text-xs text-[#8C91A8]">{patient.gender} • {patient.age} yrs</div>
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

      {patient.allergies.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {patient.allergies.slice(0, 2).map(a => (
            <span key={a} className="allergy-chip">{a}</span>
          ))}
          {patient.allergies.length > 2 && (
            <span className="text-xs text-[#8C91A8]">+{patient.allergies.length - 2} more</span>
          )}
        </div>
      )}

      <div className="text-xs text-[#8C91A8] mt-2 pt-2 border-t border-[#D8DCE8]">
        Last visit: {new Date(patient.lastVisit).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
        {patient.nextVisit && (
          <span className="ml-2 text-brand">• Next: {new Date(patient.nextVisit).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}</span>
        )}
      </div>
    </button>
  );
}
