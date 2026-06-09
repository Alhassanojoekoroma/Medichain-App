'use client';

import { useState } from 'react';
import ProtectedRoute from '@/components/shared/ProtectedRoute';
import { Sidebar } from '@/components/dashboard/sidebar';
import { MobileMenuButton } from '@/components/dashboard/sidebar';
import { Header } from '@/components/dashboard/header';
import { MOCK_DISEASE_STATS } from '@/data/mockData';
import { ShieldCheck, MapPin, AlertCircle, BarChart, Bug, TrendingUp } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, AreaChart, Area, XAxis, YAxis, CartesianGrid } from 'recharts';

export default function GovernmentDiseaseMap() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const COLORS = ['#0284c7', '#8F76FF', '#e11d48', '#f59e0b', '#10b981'];

  // Mock timeline for epidemiological mapping
  const timelineData = [
    { month: 'Jan', Malaria: 4100, Typhoid: 980, Cholera: 120 },
    { month: 'Feb', Malaria: 4300, Typhoid: 1050, Cholera: 150 },
    { month: 'Mar', Malaria: 4500, Typhoid: 1100, Cholera: 280 },
    { month: 'Apr', Malaria: 4700, Typhoid: 1180, Cholera: 310 },
    { month: 'May', Malaria: 4820, Typhoid: 1230, Cholera: 340 },
  ];

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
                  <h1 className="text-2xl font-bold tracking-tight text-slate-900 font-display">Epidemiological Watchlist</h1>
                  <p className="text-sm text-slate-500">
                    Analyze infection case loads, disease prevalence indexes, and active outbreaks.
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Left Column: Recharts disease timeline */}
                  <div className="lg:col-span-2 bg-white rounded-2xl p-5 border border-[#D8DCE8] shadow-sm space-y-4">
                    <h3 className="font-bold text-slate-900 text-sm">Epidemiological 5-Month Case Trends</h3>
                    <div className="h-72">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={timelineData}>
                          <defs>
                            <linearGradient id="colorMalaria" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#0284c7" stopOpacity={0.2}/>
                              <stop offset="95%" stopColor="#0284c7" stopOpacity={0}/>
                            </linearGradient>
                            <linearGradient id="colorTyphoid" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#8F76FF" stopOpacity={0.2}/>
                              <stop offset="95%" stopColor="#8F76FF" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                          <XAxis dataKey="month" stroke="#8C91A8" fontSize={11} tickLine={false} />
                          <YAxis stroke="#8C91A8" fontSize={11} tickLine={false} axisLine={false} />
                          <Tooltip />
                          <Legend />
                          <Area type="monotone" dataKey="Malaria" stroke="#0284c7" fillOpacity={1} fill="url(#colorMalaria)" />
                          <Area type="monotone" dataKey="Typhoid" stroke="#8F76FF" fillOpacity={1} fill="url(#colorTyphoid)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Right Column: Case distribution Pie Chart */}
                  <div className="lg:col-span-1 bg-white rounded-2xl p-5 border border-[#D8DCE8] shadow-sm space-y-4">
                    <h3 className="font-bold text-slate-900 text-sm">Case Load Ratio</h3>
                    <div className="h-60">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={MOCK_DISEASE_STATS}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="cases"
                            nameKey="disease"
                          >
                            {MOCK_DISEASE_STATS.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-500 font-bold border-t border-slate-100 pt-3">
                      {MOCK_DISEASE_STATS.map((d, i) => (
                        <div key={i} className="flex items-center gap-1.5">
                          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                          <span className="truncate">{d.disease}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Hotspots Watchlist */}
                <div className="bg-white rounded-2xl p-5 border border-[#D8DCE8] shadow-sm space-y-4 text-left">
                  <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                    <Bug className="w-4 h-4 text-rose-500" />
                    Outbreak Hotspots Watchlist
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-600">
                    <div className="p-3 bg-rose-50 rounded-xl border border-rose-100 space-y-1">
                      <div className="font-bold text-rose-800 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        Malaria Spike Alert
                      </div>
                      <p>Western Area reports +12% increase in malaria cases. Heavy rainfall has increased vector breeding environments.</p>
                    </div>
                    <div className="p-3 bg-amber-50 rounded-xl border border-amber-100 space-y-1">
                      <div className="font-bold text-amber-800 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        Typhoid Watch
                      </div>
                      <p>Northern Province monitoring ongoing. Distribution of chlorination tablets in progress.</p>
                    </div>
                    <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100 space-y-1">
                      <div className="font-bold text-emerald-800 flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        Cholera Suppressed
                      </div>
                      <p>Eastern Province reporting zero new cases for 21 consecutive days. Block verification confirmed.</p>
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
