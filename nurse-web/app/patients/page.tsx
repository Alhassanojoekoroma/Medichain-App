'use client';

import { useState } from 'react';
import ProtectedRoute from '@/components/shared/ProtectedRoute';
import NurseLayout from '@/components/layouts/NurseLayout';
import { MOCK_PATIENTS } from '@/data/mockData';
import { Search, Filter, RefreshCw, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function NursePatientsPage() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<'All' | 'Active' | 'Critical' | 'Inactive'>('All');
  const [patients, setPatients] = useState(MOCK_PATIENTS);

  const handleTakeVitals = (id: string) => {
    alert(`Taking vitals check for patient ID: ${id}`);
  };

  const handleAdmit = (id: string) => {
    alert(`Patient ID ${id} admitted successfully.`);
  };

  const filtered = patients.filter((p) => {
    const matchSearch =
      (p.name || '').toLowerCase().includes(search.toLowerCase()) ||
      (p.condition || '').toLowerCase().includes(search.toLowerCase()) ||
      (p.id || '').toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'All' || p.status === filterStatus;
    return matchSearch && matchStatus;
  });

  return (
    <ProtectedRoute allowedRoles={['nurse']}>
      <NurseLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 font-display">Triage Patients Directory</h1>
              <p className="text-sm text-slate-500">
                Total {filtered.length} active patients under triage supervision
              </p>
            </div>
            <button
              onClick={() => setPatients(MOCK_PATIENTS)}
              className="flex items-center gap-2 border border-slate-200 hover:bg-slate-50 text-slate-600 px-3.5 py-2 rounded-xl text-sm font-semibold transition shadow-sm"
            >
              <RefreshCw className="w-4 h-4" />
              Sync Peer
            </button>
          </div>

          {/* Search + Filter */}
          <div className="bg-white rounded-2xl p-4 border border-[#D8DCE8] shadow-sm flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search by name, ID, or condition..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1D9E75]/20 focus:border-[#1D9E75] transition text-slate-700"
              />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Filter className="w-4 h-4 text-slate-400 mr-1" />
              {(['All', 'Active', 'Critical', 'Inactive'] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setFilterStatus(s)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
                    filterStatus === s
                      ? 'bg-[#1D9E75] text-white'
                      : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Patients Table */}
          <div className="bg-white rounded-2xl border border-[#D8DCE8] shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-slate-50 text-slate-400 text-xs font-bold uppercase border-b border-slate-100">
                    <th className="py-4 px-5">Patient Name</th>
                    <th className="py-4 px-5">Age / Gender</th>
                    <th className="py-4 px-5">Blood Type</th>
                    <th className="py-4 px-5">Primary Condition</th>
                    <th className="py-4 px-5">Allergies</th>
                    <th className="py-4 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.map((patient) => (
                    <tr key={patient.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-full font-bold text-sm flex items-center justify-center ${
                            patient.status === 'Critical' ? 'bg-rose-50 text-[#E53E3E]' : 'bg-emerald-50 text-[#1D9E75]'
                          }`}>
                            {patient.initials}
                          </div>
                          <div>
                            <div className="font-semibold text-slate-900">{patient.name}</div>
                            <div className="text-[10px] text-slate-400 font-semibold">ID: {patient.id.substring(0, 18)}...</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-5 text-slate-500">{patient.age} yrs • {patient.gender}</td>
                      <td className="py-4 px-5">
                        <span className="text-xs font-bold bg-[#EDE9FF] text-[#8F76FF] px-2.5 py-1 rounded-full">
                          {patient.bloodType}
                        </span>
                      </td>
                      <td className="py-4 px-5 text-slate-500">{patient.condition}</td>
                      <td className="py-4 px-5">
                        <div className="flex flex-wrap gap-1">
                          {patient.allergies && patient.allergies.length > 0 ? (
                            patient.allergies.map((a) => (
                              <span key={a} className="allergy-chip bg-rose-50 text-rose-700 border border-rose-100 px-2 py-0.5 rounded-md text-[10px] font-bold">
                                {a}
                              </span>
                            ))
                          ) : (
                            <span className="text-slate-400 text-xs">None</span>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-5 text-right space-x-2 whitespace-nowrap">
                        <button
                          onClick={() => handleTakeVitals(patient.id)}
                          className="px-3.5 py-1.5 bg-[#1D9E75] hover:bg-[#157959] text-white text-xs font-bold rounded-xl transition shadow-sm"
                        >
                          Take Vitals
                        </button>
                        <button
                          onClick={() => handleAdmit(patient.id)}
                          className="px-3.5 py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl transition shadow-sm"
                        >
                          Admit
                        </button>
                        <button
                          onClick={() => router.push(`/patients/${patient.id}`)}
                          className="px-3 py-1.5 text-slate-400 hover:text-slate-600 transition"
                        >
                          Details
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={6} className="text-center py-16 text-slate-400">
                        <AlertCircle className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                        <p className="font-semibold">No patients found</p>
                        <p className="text-xs text-slate-400 mt-1">Try adjusting your search criteria</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </NurseLayout>
    </ProtectedRoute>
  );
}
