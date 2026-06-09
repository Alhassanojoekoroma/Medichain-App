'use client';

import { useState } from 'react';
import ProtectedRoute from '@/components/shared/ProtectedRoute';
import { Sidebar } from '@/components/dashboard/sidebar';
import { MobileMenuButton } from '@/components/dashboard/sidebar';
import { Header } from '@/components/dashboard/header';
import { MOCK_APPOINTMENTS } from '@/data/mockData';
import { Clock, CheckCircle2, UserCheck, Calendar, Search } from 'lucide-react';

export default function StaffAppointments() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [appointments, setAppointments] = useState(MOCK_APPOINTMENTS);
  const [search, setSearch] = useState('');

  const handleCheckIn = (id: string) => {
    setAppointments(prev => prev.map(app => 
      app.id === id ? { ...app, status: 'In Progress' } : app
    ));
    alert(`Patient check-in submitted. Queue status updated to 'In Progress' on peer nodes.`);
  };

  const filtered = appointments.filter(app => 
    (app.patientName || '').toLowerCase().includes(search.toLowerCase()) ||
    (app.id || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <ProtectedRoute allowedRoles={['staff']}>
      <div className="min-h-screen bg-[#EAEEF2] staff-portal">
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

              <div className="space-y-6 pb-8">
                {/* Title */}
                <div>
                  <h1 className="text-2xl font-bold tracking-tight text-slate-900 font-display">Triage Queue & Patient Check-in</h1>
                  <p className="text-sm text-slate-500">
                    Verify patient appointments, manage queue status, and register clinic arrivals.
                  </p>
                </div>

                {/* Filter and Search */}
                <div className="bg-white rounded-2xl p-4 border border-[#D8DCE8] shadow-sm flex flex-col md:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search appointments by name or ID..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#d97706]/20 focus:border-[#d97706] transition text-slate-700"
                    />
                  </div>
                </div>

                {/* Appointments Table */}
                <div className="bg-white rounded-2xl border border-[#D8DCE8] shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead>
                        <tr className="bg-slate-50 text-slate-400 text-xs font-bold uppercase border-b border-slate-100">
                          <th className="py-4 px-5">Patient Details</th>
                          <th className="py-4 px-5">Time Slot</th>
                          <th className="py-4 px-5">Consultation Mode</th>
                          <th className="py-4 px-5">Queue Status</th>
                          <th className="py-4 px-5 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {filtered.map((app) => (
                          <tr key={app.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="py-4 px-5">
                              <div className="flex items-center gap-3">
                                <div className="h-9 w-9 bg-amber-50 text-[#d97706] font-bold text-sm rounded-full flex items-center justify-center">
                                  {app.patientInitials}
                                </div>
                                <div>
                                  <div className="font-semibold text-slate-900">{app.patientName}</div>
                                  <div className="text-[10px] text-slate-400 font-semibold">ID: {app.patientId.substring(0, 18)}...</div>
                                </div>
                              </div>
                            </td>
                            <td className="py-4 px-5 text-slate-600 font-medium">{app.startTime} - {app.endTime}</td>
                            <td className="py-4 px-5 text-slate-500 font-semibold">{app.type}</td>
                            <td className="py-4 px-5">
                              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                                app.status === 'Completed' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                                app.status === 'In Progress' ? 'bg-orange-50 text-orange-700 border border-orange-100' :
                                app.status === 'Cancelled' ? 'bg-rose-50 text-rose-700 border border-rose-100' :
                                'bg-violet-50 text-violet-700 border border-violet-100'
                              }`}>
                                {app.status}
                              </span>
                            </td>
                            <td className="py-4 px-5 text-right">
                              {app.status === 'Upcoming' && (
                                <button
                                  onClick={() => handleCheckIn(app.id)}
                                  className="px-3.5 py-1.5 bg-[#d97706] hover:bg-[#b45309] text-white text-xs font-bold rounded-xl transition shadow-sm flex items-center gap-1.5 ml-auto"
                                >
                                  <UserCheck className="w-3.5 h-3.5" />
                                  Check In
                                </button>
                              )}
                              {app.status !== 'Upcoming' && (
                                <span className="text-xs text-slate-400 font-semibold">Checked In ✓</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
