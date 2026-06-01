'use client';

import { useState } from 'react';
import { LayoutWrapper } from '@/components/dashboard/layout-wrapper';
import { MOCK_ANALYTICS, MOCK_DEPT_STATS } from '@/data/mockData';
import { useAuth } from '@/hooks/useAuth';
import { 
  Users, Database, Calendar, TrendingUp, ArrowUpRight, 
  BarChart3, Activity, PieChart, Info 
} from 'lucide-react';
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, 
  Tooltip, PieChart as RechartsPieChart, Pie, Cell, Legend 
} from 'recharts';

export default function AnalyticsPage() {
  useAuth(); // Require authentication

  const [activeTab, setActiveTab] = useState<'all' | 'monthly' | 'dept'>('all');

  // Simple statistics counters
  const totalMonthlyEnrolled = MOCK_ANALYTICS.reduce((acc, curr) => acc + curr.patients, 0);
  const totalMonthlyRecords = MOCK_ANALYTICS.reduce((acc, curr) => acc + curr.records, 0);
  const totalMonthlyAppointments = MOCK_ANALYTICS.reduce((acc, curr) => acc + curr.appointments, 0);

  return (
    <LayoutWrapper title="Healthcare Analytics &amp; Reporting">
      <div className="space-y-6">
        
        {/* Header Summary */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 font-display">System Analytics</h1>
            <p className="text-sm text-slate-500">
              High-level overview of patient registrations, medical record volumes, and department resource allocation
            </p>
          </div>
          <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition ${
                activeTab === 'all' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('monthly')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition ${
                activeTab === 'monthly' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Growth Trends
            </button>
            <button
              onClick={() => setActiveTab('dept')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition ${
                activeTab === 'dept' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Departments
            </button>
          </div>
        </div>

        {/* Small Analytics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Registrations Enrolled</span>
              <h3 className="text-2xl font-bold text-slate-950">{totalMonthlyEnrolled}</h3>
              <div className="flex items-center gap-1 text-xs text-emerald-600 font-semibold pt-0.5">
                <ArrowUpRight className="h-3.5 w-3.5" />
                <span>+12.4% this quarter</span>
              </div>
            </div>
            <div className="h-10 w-10 rounded-lg bg-brand-light text-brand flex items-center justify-center">
              <Users className="h-5 w-5" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Records Anchored</span>
              <h3 className="text-2xl font-bold text-slate-950">{totalMonthlyRecords}</h3>
              <div className="flex items-center gap-1 text-xs text-emerald-600 font-semibold pt-0.5">
                <ArrowUpRight className="h-3.5 w-3.5" />
                <span>+8.2% ledger growth</span>
              </div>
            </div>
            <div className="h-10 w-10 rounded-lg bg-brand-light text-brand flex items-center justify-center">
              <Database className="h-5 w-5" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Total Bookings</span>
              <h3 className="text-2xl font-bold text-slate-950">{totalMonthlyAppointments}</h3>
              <div className="flex items-center gap-1 text-xs text-brand font-semibold pt-0.5">
                <TrendingUp className="h-3.5 w-3.5" />
                <span>Steady clinic load</span>
              </div>
            </div>
            <div className="h-10 w-10 rounded-lg bg-brand-light text-brand flex items-center justify-center">
              <Calendar className="h-5 w-5" />
            </div>
          </div>

        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          
          {/* Growth Trend Area Chart */}
          {(activeTab === 'all' || activeTab === 'monthly') && (
            <div className={`bg-white p-5 rounded-xl border border-slate-200 shadow-sm ${activeTab === 'monthly' ? 'lg:col-span-5' : 'lg:col-span-3'} flex flex-col justify-between`}>
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-4.5 w-4.5 text-brand" />
                  <h3 className="font-bold text-slate-800 text-sm">Ledger &amp; Patient Growth Trends</h3>
                </div>
                <div className="flex gap-4 text-xs font-semibold text-slate-500">
                  <span className="flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full bg-brand" />
                    Patients
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full bg-[#8F76FF]" />
                    Records
                  </span>
                </div>
              </div>

              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={MOCK_ANALYTICS} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorPatients" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2952ff" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#2952ff" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorRecords" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8F76FF" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#8F76FF" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="month" tickLine={false} axisLine={false} style={{ fontSize: 10, fill: '#94a3b8' }} />
                    <YAxis tickLine={false} axisLine={false} style={{ fontSize: 10, fill: '#94a3b8' }} />
                    <Tooltip contentStyle={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 11 }} />
                    <Area type="monotone" dataKey="patients" name="Patients Enrolled" stroke="#2952ff" strokeWidth={2} fillOpacity={1} fill="url(#colorPatients)" />
                    <Area type="monotone" dataKey="records" name="Medical Records" stroke="#8F76FF" strokeWidth={2} fillOpacity={1} fill="url(#colorRecords)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Department Donut Chart */}
          {(activeTab === 'all' || activeTab === 'dept') && (
            <div className={`bg-white p-5 rounded-xl border border-slate-200 shadow-sm ${activeTab === 'dept' ? 'lg:col-span-5' : 'lg:col-span-2'} flex flex-col justify-between`}>
              <div className="border-b border-slate-100 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <PieChart className="h-4.5 w-4.5 text-brand" />
                  <h3 className="font-bold text-slate-800 text-sm">Department Distribution</h3>
                </div>
              </div>

              <div className="h-56 relative">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPieChart>
                    <Pie
                      data={MOCK_DEPT_STATS}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={75}
                      paddingAngle={3}
                      dataKey="count"
                    >
                      {MOCK_DEPT_STATS.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value} patients`, 'Consultations']} />
                  </RechartsPieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-2xl font-black text-slate-900">
                    {MOCK_DEPT_STATS.reduce((a, b) => a + b.count, 0)}
                  </span>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Total Cases</span>
                </div>
              </div>

              {/* Department breakdown listing */}
              <div className="space-y-2 mt-4 max-h-[180px] overflow-y-auto pr-1">
                {MOCK_DEPT_STATS.map((dept) => (
                  <div key={dept.name} className="flex items-center justify-between text-xs py-1 border-b border-slate-50 last:border-b-0">
                    <div className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: dept.color }} />
                      <span className="font-semibold text-slate-700">{dept.name}</span>
                    </div>
                    <span className="text-slate-400 font-medium">{dept.count} pts ({dept.percentage}%)</span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Quality assurance notice */}
        <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 flex gap-3 text-xs leading-relaxed text-emerald-800">
          <Info className="h-4.5 w-4.5 text-brand shrink-0 mt-0.5" />
          <div>
            <strong className="block text-emerald-950 font-bold mb-0.5">Automated Performance Verification</strong>
            All statistical graphs represent aggregated off-chain metadata. Client signatures and block validation speeds on the Hyperledger Fabric channel remain under <strong>250ms</strong> across all channel peers in Sierra Leone.
          </div>
        </div>

      </div>
    </LayoutWrapper>
  );
}
