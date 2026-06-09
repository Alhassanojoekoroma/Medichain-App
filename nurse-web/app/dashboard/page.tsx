'use client';

import { useState } from 'react';
import ProtectedRoute from '@/components/shared/ProtectedRoute';
import NurseLayout from '@/components/layouts/NurseLayout';
import { MOCK_PATIENTS, MOCK_APPOINTMENTS } from '@/data/mockData';
import { Users, Calendar, Heart, AlertCircle, ShieldAlert } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function NurseDashboard() {
  const router = useRouter();
  const [vitalsQueue, setVitalsQueue] = useState([
    { id: 'bb010000-0000-0000-0000-000000000001', name: 'Alex Johnson', status: 'Pending', room: 'Ward 2A' },
    { id: 'bb010000-0000-0000-0000-000000000002', name: 'Mariama Conteh', status: 'In Progress', room: 'Triage Room 1' },
  ]);

  const handleTakeVitals = (id: string) => {
    alert(`Starting vitals checklist for patient: ${id}`);
  };

  return (
    <ProtectedRoute allowedRoles={['nurse']}>
      <NurseLayout>
        <div className="space-y-6">
          {/* Header Title */}
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 font-display">Triage Nurse Station</h1>
            <p className="text-sm text-slate-500">
              Fabric-secured triage status monitor and clinical admission logs
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl p-5 border border-[#D8DCE8] shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Admitted Today</span>
                <div className="w-8 h-8 bg-emerald-50 rounded-lg flex items-center justify-center">
                  <Users className="w-4 h-4 text-[#1D9E75]" />
                </div>
              </div>
              <div className="text-3xl font-extrabold text-slate-900">12</div>
              <p className="text-[10px] text-slate-400 mt-1">Hospital admissions</p>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-[#D8DCE8] shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Appointments Today</span>
                <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                  <Calendar className="w-4 h-4 text-blue-600" />
                </div>
              </div>
              <div className="text-3xl font-extrabold text-slate-900">8</div>
              <p className="text-[10px] text-slate-400 mt-1">Scheduled checkups</p>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-[#D8DCE8] shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Pending Vitals</span>
                <div className="w-8 h-8 bg-orange-50 rounded-lg flex items-center justify-center">
                  <Heart className="w-4 h-4 text-orange-500" />
                </div>
              </div>
              <div className="text-3xl font-extrabold text-slate-900">5</div>
              <p className="text-[10px] text-slate-400 mt-1">Awaiting triage intake</p>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-[#D8DCE8] shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Meds Reminders</span>
                <div className="w-8 h-8 bg-purple-50 rounded-lg flex items-center justify-center">
                  <AlertCircle className="w-4 h-4 text-purple-600" />
                </div>
              </div>
              <div className="text-3xl font-extrabold text-slate-900">3</div>
              <p className="text-[10px] text-slate-400 mt-1">Due for inpatients</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Active Admitted Patients */}
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-white rounded-2xl border border-[#D8DCE8] shadow-sm overflow-hidden">
                <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                  <h3 className="font-bold text-slate-900 text-sm">Active Admitted Patients</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="bg-slate-50 text-slate-400 text-xs font-bold uppercase border-b border-slate-100">
                        <th className="py-3 px-4">Name</th>
                        <th className="py-3 px-4">Age / Blood</th>
                        <th className="py-3 px-4">Condition</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {MOCK_PATIENTS.slice(0, 4).map((patient) => (
                        <tr key={patient.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="py-3.5 px-4 font-semibold text-slate-900">{patient.name}</td>
                          <td className="py-3.5 px-4 text-slate-500">
                            {patient.age} • <span className="font-bold text-rose-500 text-xs">{patient.bloodType}</span>
                          </td>
                          <td className="py-3.5 px-4 text-slate-500">{patient.condition}</td>
                          <td className="py-3.5 px-4">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                              patient.status === 'Critical' ? 'bg-rose-50 text-[#E53E3E]' : 'bg-emerald-50 text-[#1D9E75]'
                            }`}>
                              {patient.status === 'Critical' && <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />}
                              {patient.status}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right space-x-2">
                            <button
                              onClick={() => handleTakeVitals(patient.id)}
                              className="px-3 py-1 bg-[#1D9E75] hover:bg-[#167d5c] text-white text-xs font-semibold rounded-lg transition"
                            >
                              Take Vitals
                            </button>
                            <button
                              onClick={() => router.push(`/patients/${patient.id}`)}
                              className="px-3 py-1 border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-semibold rounded-lg transition"
                            >
                              View
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Right: Pending Vitals Queue */}
            <div className="lg:col-span-1 space-y-4">
              <div className="bg-white rounded-2xl border border-[#D8DCE8] shadow-sm p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-[#1D9E75]" />
                    Vitals Intake Queue
                  </h3>
                </div>
                <div className="space-y-3">
                  {vitalsQueue.map((item) => (
                    <div key={item.id} className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-slate-900 text-sm">{item.name}</p>
                        <p className="text-[10px] text-slate-400 font-semibold">{item.room}</p>
                      </div>
                      <button
                        onClick={() => handleTakeVitals(item.id)}
                        className="px-3 py-1 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold rounded-lg transition shadow-sm"
                      >
                        Start
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </NurseLayout>
    </ProtectedRoute>
  );
}
