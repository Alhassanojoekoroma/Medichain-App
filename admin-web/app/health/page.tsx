'use client';

import { useState } from 'react';
import ProtectedRoute from '@/components/shared/ProtectedRoute';
import { Sidebar } from '@/components/dashboard/sidebar';
import { MobileMenuButton } from '@/components/dashboard/sidebar';
import { Header } from '@/components/dashboard/header';
import { MOCK_SYSTEM_HEALTH } from '@/data/mockData';
import { ShieldCheck, HeartPulse, RefreshCw, Activity, Cpu, Database } from 'lucide-react';

export default function AdminHealthMonitor() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [healthData, setHealthData] = useState(MOCK_SYSTEM_HEALTH);
  const [checking, setChecking] = useState(false);

  const handleRefreshDiagnostics = () => {
    setChecking(true);
    setTimeout(() => {
      setHealthData(prev => prev.map(item => ({
        ...item,
        lastChecked: new Date().toISOString().replace('T', ' ').substring(0, 16)
      })));
      setChecking(false);
      alert('Full diagnostic sequence completed on channels medical-records, pharmacy-records, national-analytics, system-administration.');
    }, 1000);
  };

  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <div className="min-h-screen bg-[#EAEEF2] admin-portal">
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

              <div className="space-y-6 pb-8 text-left">
                {/* Title */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900 font-display">Hyperledger Network Node Health</h1>
                    <p className="text-sm text-slate-500">
                      Real-time status tracking of peer nodes, orderer, database engines, and decentralized IPFS clusters.
                    </p>
                  </div>
                  <button
                    onClick={handleRefreshDiagnostics}
                    disabled={checking}
                    className="flex items-center gap-2 bg-[#7c3aed] hover:bg-[#6228ca] text-white px-4 py-2 rounded-xl text-xs font-bold transition shadow-sm disabled:opacity-50"
                  >
                    <RefreshCw className={`w-4 h-4 ${checking ? 'animate-spin' : ''}`} />
                    Run Live Diagnostics
                  </button>
                </div>

                {/* Health Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {healthData.map((node, i) => (
                    <div key={i} className="bg-white rounded-2xl p-5 border border-[#D8DCE8] shadow-sm flex flex-col justify-between space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          {node.service.includes('Database') || node.service.includes('Postgre') ? (
                            <Database className="w-5 h-5 text-slate-400" />
                          ) : node.service.includes('API') || node.service.includes('Server') ? (
                            <Cpu className="w-5 h-5 text-slate-400" />
                          ) : (
                            <Activity className="w-5 h-5 text-slate-400" />
                          )}
                          <h3 className="font-bold text-slate-900 text-sm">{node.service}</h3>
                        </div>
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                          node.status === 'Online' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                          node.status === 'Degraded' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                          'bg-rose-50 text-rose-700 border-rose-100'
                        }`}>
                          <span className="w-1.5 h-1.5 rounded-full" style={{
                            backgroundColor: node.status === 'Online' ? '#10b981' :
                                            node.status === 'Degraded' ? '#f59e0b' : '#ef4444'
                          }} />
                          {node.status}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs border-t border-slate-100 pt-3">
                        <div>
                          <span className="text-slate-400 block font-semibold">Uptime Score</span>
                          <span className="font-bold text-slate-800">{node.uptime}%</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block font-semibold">Last Verified</span>
                          <span className="font-semibold text-slate-700 truncate block">{node.lastChecked}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
