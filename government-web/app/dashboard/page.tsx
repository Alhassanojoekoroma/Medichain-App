'use client';

import { useState } from 'react';
import ProtectedRoute from '@/components/shared/ProtectedRoute';
import { Sidebar } from '@/components/dashboard/sidebar';
import { MobileMenuButton } from '@/components/dashboard/sidebar';
import { Header } from '@/components/dashboard/header';
import { MOCK_REGIONAL_STATS, MOCK_DISEASE_STATS } from '@/data/mockData';
import { MapPin, TrendingUp, AlertTriangle, ShieldCheck, Heart, Users, Activity } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

export default function GovernmentDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Sum up some stats
  const totalNationalCases = MOCK_DISEASE_STATS.reduce((acc, curr) => acc + curr.cases, 0);
  const averageGrowth = 4.8; // mock %

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
                <div>
                  <h1 className="text-2xl font-bold tracking-tight text-slate-900 font-display">National Public Health Registry</h1>
                  <p className="text-sm text-slate-500">
                    Sierra Leone Ministry of Health and Sanitation real-time epidemiological statistics & ledger commits.
                  </p>
                </div>

                {/* Info Alert */}
                <div className="bg-[#e0f2fe] border border-sky-200 text-sky-850 p-4 rounded-2xl text-xs flex items-center gap-3">
                  <ShieldCheck className="w-5 h-5 text-[#0284c7] shrink-0" />
                  <div>
                    <strong>PII Protection Active:</strong> All clinical records retrieved from the blockchain channel are stripped of names, contact numbers, and specific dates of birth using automated hashing algorithms before rendering.
                  </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-white rounded-2xl p-5 border border-[#D8DCE8] shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">National Cases</span>
                      <div className="w-8 h-8 bg-sky-50 rounded-lg flex items-center justify-center">
                        <TrendingUp className="w-4 h-4 text-[#0284c7]" />
                      </div>
                    </div>
                    <div className="text-3xl font-extrabold text-slate-900">{totalNationalCases}</div>
                    <p className="text-[10px] text-slate-400 mt-1">Active registered infections</p>
                  </div>

                  <div className="bg-white rounded-2xl p-5 border border-[#D8DCE8] shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Growth Rate</span>
                      <div className="w-8 h-8 bg-emerald-50 rounded-lg flex items-center justify-center">
                        <Activity className="w-4 h-4 text-emerald-600" />
                      </div>
                    </div>
                    <div className="text-3xl font-extrabold text-slate-900">+{averageGrowth}%</div>
                    <p className="text-[10px] text-slate-400 mt-1">Monthly trend average</p>
                  </div>

                  <div className="bg-white rounded-2xl p-5 border border-[#D8DCE8] shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Districts</span>
                      <div className="w-8 h-8 bg-purple-50 rounded-lg flex items-center justify-center">
                        <MapPin className="w-4 h-4 text-purple-600" />
                      </div>
                    </div>
                    <div className="text-3xl font-extrabold text-slate-900">{MOCK_REGIONAL_STATS.length}</div>
                    <p className="text-[10px] text-slate-400 mt-1">Health monitoring posts</p>
                  </div>

                  <div className="bg-white rounded-2xl p-5 border border-[#D8DCE8] shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Ledger Health</span>
                      <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                        <ShieldCheck className="w-4 h-4 text-blue-600" />
                      </div>
                    </div>
                    <div className="text-3xl font-extrabold text-slate-900">100%</div>
                    <p className="text-[10px] text-slate-400 mt-1">Peers synchronized</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Left Column: Recharts disease cases chart */}
                  <div className="lg:col-span-2 bg-white rounded-2xl p-5 border border-[#D8DCE8] shadow-sm space-y-4">
                    <h3 className="font-bold text-slate-900 text-sm">Disease Prevalence Trend Analysis</h3>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={MOCK_DISEASE_STATS}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                          <XAxis dataKey="disease" stroke="#8C91A8" fontSize={11} tickLine={false} />
                          <YAxis stroke="#8C91A8" fontSize={11} tickLine={false} axisLine={false} />
                          <Tooltip cursor={{ fill: '#f1f5f9' }} />
                          <Bar dataKey="cases" fill="#0284c7" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Right Column: Disease table */}
                  <div className="lg:col-span-1 bg-white rounded-2xl p-5 border border-[#D8DCE8] shadow-sm space-y-4">
                    <h3 className="font-bold text-slate-900 text-sm">Prevalence Matrix</h3>
                    <div className="space-y-3">
                      {MOCK_DISEASE_STATS.map((d, i) => (
                        <div key={i} className="flex items-center justify-between p-2 hover:bg-slate-50 rounded-lg transition">
                          <div>
                            <span className="text-sm font-semibold text-slate-800 block">{d.disease}</span>
                            <span className="text-[10px] text-slate-400 font-bold">Region: SL National</span>
                          </div>
                          <div className="text-right">
                            <span className="text-sm font-bold text-slate-900 block">{d.cases} cases</span>
                            <span className={`text-[10px] font-bold ${
                              d.trend === 'up' ? 'text-rose-500' : 'text-emerald-500'
                            }`}>
                              {d.trend === 'up' ? '↑' : '↓'} {Math.abs(d.change)}%
                            </span>
                          </div>
                        </div>
                      ))}
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
