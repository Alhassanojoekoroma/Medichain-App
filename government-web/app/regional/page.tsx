'use client';

import { useState } from 'react';
import ProtectedRoute from '@/components/shared/ProtectedRoute';
import { Sidebar } from '@/components/dashboard/sidebar';
import { MobileMenuButton } from '@/components/dashboard/sidebar';
import { Header } from '@/components/dashboard/header';
import { EMPTY_REGIONAL_STATS } from '@/data/runtimeData';
import { Map, MapPin, Building, Award, Landmark, RefreshCw, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function GovernmentRegionalStats() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState('');

  const regionData = EMPTY_REGIONAL_STATS.find(r => r.region === selectedRegion);

  if (!regionData) {
    return (
      <ProtectedRoute allowedRoles={['government']}>
        <div className="min-h-screen bg-[#EAEEF2] government-portal">
          <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(false)} />
          <main className="lg:pl-[260px]">
            <div className="mx-auto max-w-4xl px-4 py-10">
              <MobileMenuButton onClick={() => setSidebarOpen(true)} />
              <section role="status" className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-6 text-amber-950">
                <h1 className="text-xl font-bold">District reporting feed not connected</h1>
                <p className="mt-2 text-sm">No regional statistics are available, and no demonstration figures are being substituted. Connect the approved aggregate data service before using this screen.</p>
              </section>
            </div>
          </main>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute allowedRoles={['government']}>
      <div className="min-h-screen bg-[#EAEEF2] government-portal">
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
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900 font-display">Regional Clinical Metrics</h1>
                    <p className="text-sm text-slate-500">
                      Audit hospital workloads and pharmaceutical distribution indexes by Sierra Leone administrative district.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-400">Select Region:</span>
                    <select
                      value={selectedRegion}
                      onChange={(e) => setSelectedRegion(e.target.value)}
                      className="border border-[#D8DCE8] bg-white rounded-xl px-3 py-1.5 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#0284c7]/20 focus:border-[#0284c7] transition cursor-pointer text-slate-700"
                    >
                      {EMPTY_REGIONAL_STATS.map((r, i) => (
                        <option key={i} value={r.region}>{r.region}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-white rounded-2xl p-5 border border-[#D8DCE8] shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Anonymized Patients</span>
                      <div className="w-8 h-8 bg-sky-50 rounded-lg flex items-center justify-center">
                        <MapPin className="w-4 h-4 text-[#0284c7]" />
                      </div>
                    </div>
                    <div className="text-3xl font-extrabold text-slate-900">{regionData.patients.toLocaleString()}</div>
                    <p className="text-[10px] text-slate-400 mt-1">Aggregated admissions count</p>
                  </div>

                  <div className="bg-white rounded-2xl p-5 border border-[#D8DCE8] shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Health Facilities</span>
                      <div className="w-8 h-8 bg-purple-50 rounded-lg flex items-center justify-center">
                        <Building className="w-4 h-4 text-purple-650" />
                      </div>
                    </div>
                    <div className="text-3xl font-extrabold text-slate-900">{regionData.facilities}</div>
                    <p className="text-[10px] text-slate-400 mt-1">Active registered clinics</p>
                  </div>

                  <div className="bg-white rounded-2xl p-5 border border-[#D8DCE8] shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Enrolled Doctors</span>
                      <div className="w-8 h-8 bg-emerald-50 rounded-lg flex items-center justify-center">
                        <Award className="w-4 h-4 text-emerald-600" />
                      </div>
                    </div>
                    <div className="text-3xl font-extrabold text-slate-900">{regionData.doctors}</div>
                    <p className="text-[10px] text-slate-400 mt-1">CA verified identities</p>
                  </div>

                  <div className="bg-white rounded-2xl p-5 border border-[#D8DCE8] shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Drug Stock Score</span>
                      <div className="w-8 h-8 bg-amber-50 rounded-lg flex items-center justify-center">
                        <Landmark className="w-4 h-4 text-amber-500" />
                      </div>
                    </div>
                    <div className="text-3xl font-extrabold text-slate-900">{regionData.drugScore}%</div>
                    <p className="text-[10px] text-slate-400 mt-1">Average availability index</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Chart of regional comparison */}
                  <div className="lg:col-span-2 bg-white rounded-2xl p-4 sm:p-5 border border-[#D8DCE8] shadow-sm">
                    <div className="flex items-center gap-2 mb-4 sm:mb-6">
                      <div className="w-7 h-7 sm:w-8 sm:h-8 bg-sky-50 rounded-lg flex items-center justify-center">
                        <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#0284c7]" />
                      </div>
                      <h3 className="text-sm sm:text-base font-semibold text-[#101326]">Inter-Regional Workload Comparison</h3>
                      <span className="ml-auto text-xs text-[#8C91A8]">SL Districts</span>
                    </div>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={EMPTY_REGIONAL_STATS}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                          <XAxis dataKey="region" stroke="#8C91A8" fontSize={11} tickLine={false} />
                          <YAxis stroke="#8C91A8" fontSize={11} tickLine={false} axisLine={false} />
                          <Tooltip cursor={{ fill: '#f1f5f9' }} />
                          <Bar dataKey="patients" fill="#0284c7" radius={[4, 4, 0, 0]} name="Aggregated Patients" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Regional Leaderboard info */}
                  <div className="lg:col-span-1 bg-white rounded-2xl p-4 sm:p-5 border border-[#D8DCE8] shadow-sm text-left">
                    <div className="flex items-center gap-2 mb-4 sm:mb-6">
                      <div className="w-7 h-7 sm:w-8 sm:h-8 bg-purple-50 rounded-lg flex items-center justify-center">
                        <Building className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-650" />
                      </div>
                      <h3 className="text-sm sm:text-base font-semibold text-[#101326]">Prevalence and Stock Insights</h3>
                    </div>
                    <div className="space-y-4 text-xs text-slate-600 leading-relaxed">
                      <p>
                        The region <strong className="text-slate-800">{regionData.region}</strong> is reporting a total of <strong className="text-[#0284c7]">{regionData.patients.toLocaleString()}</strong> admissions.
                      </p>
                      <p>
                        Facilities in this region have maintained a supply chain index of <strong className="text-amber-600">{regionData.drugScore}%</strong>, which is currently {regionData.drugScore > 75 ? 'Optimal' : 'Needs attention'}.
                      </p>
                      <p>
                        All metrics are compiled by verifying block hashes committed by connected Org nodes representing {regionData.facilities} local clinics.
                      </p>
                    </div>
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
