'use client';

import { useState } from 'react';
import ProtectedRoute from '@/components/shared/ProtectedRoute';
import { Sidebar } from '@/components/dashboard/sidebar';
import { MobileMenuButton } from '@/components/dashboard/sidebar';
import { Header } from '@/components/dashboard/header';
import { MOCK_AUDIT_LOG, MOCK_SYSTEM_HEALTH } from '@/data/mockData';
import { Shield, Users, Layers, Activity, AlertCircle, CheckCircle2, Lock } from 'lucide-react';

export default function AdminDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [logs, setLogs] = useState(MOCK_AUDIT_LOG);

  const totalBlocks = 150; // mock value based on audit logs
  const onlineServices = MOCK_SYSTEM_HEALTH.filter(s => s.status === 'Online').length;

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

              <div className="space-y-6 pb-8">
                {/* Title */}
                <div>
                  <h1 className="text-2xl font-bold tracking-tight text-slate-900 font-display">System Administration</h1>
                  <p className="text-sm text-slate-500">
                    Manage Fabric CA credentials, audit permission logs, and monitor blockchain peer services.
                  </p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-white rounded-2xl p-5 border border-[#D8DCE8] shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Network Peers</span>
                      <div className="w-8 h-8 bg-purple-50 rounded-lg flex items-center justify-center">
                        <Layers className="w-4 h-4 text-[#7c3aed]" />
                      </div>
                    </div>
                    <div className="text-3xl font-extrabold text-slate-900">4 Nodes</div>
                    <p className="text-[10px] text-slate-400 mt-1">2 Orgs, 1 Orderer, 1 CA</p>
                  </div>

                  <div className="bg-white rounded-2xl p-5 border border-[#D8DCE8] shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Ledger Height</span>
                      <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                        <Activity className="w-4 h-4 text-blue-600" />
                      </div>
                    </div>
                    <div className="text-3xl font-extrabold text-slate-900">#{totalBlocks}</div>
                    <p className="text-[10px] text-slate-400 mt-1">Committed blocks count</p>
                  </div>

                  <div className="bg-white rounded-2xl p-5 border border-[#D8DCE8] shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Online Services</span>
                      <div className="w-8 h-8 bg-emerald-50 rounded-lg flex items-center justify-center">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      </div>
                    </div>
                    <div className="text-3xl font-extrabold text-slate-900">{onlineServices} / 7</div>
                    <p className="text-[10px] text-slate-400 mt-1">Status check optimal</p>
                  </div>

                  <div className="bg-white rounded-2xl p-5 border border-[#D8DCE8] shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Alerts</span>
                      <div className="w-8 h-8 bg-rose-50 rounded-lg flex items-center justify-center">
                        <AlertCircle className="w-4 h-4 text-rose-500" />
                      </div>
                    </div>
                    <div className="text-3xl font-extrabold text-slate-900">1 Degraded</div>
                    <p className="text-[10px] text-slate-400 mt-1">IPFS Node storage high</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Left Column: Recent Audit Log Feed */}
                  <div className="lg:col-span-2 space-y-4">
                    <div className="bg-white rounded-2xl border border-[#D8DCE8] shadow-sm overflow-hidden text-left">
                      <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                        <h3 className="font-bold text-slate-900 text-sm">System Operations Log</h3>
                      </div>
                      <div className="p-5 space-y-4">
                        {logs.map((log, i) => (
                          <div key={i} className="flex items-start gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                              log.status === 'Success' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                            }`}>
                              {log.status === 'Success' ? <CheckCircle2 className="w-4.5 h-4.5" /> : <AlertCircle className="w-4.5 h-4.5" />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-2">
                                <span className="font-bold text-slate-950 text-xs">{log.user} ({log.role})</span>
                                <span className="text-[10px] text-slate-400">{log.timestamp}</span>
                              </div>
                              <p className="text-xs text-slate-600 mt-1">
                                Action: <strong className="font-semibold text-slate-800">{log.action}</strong> on <strong className="font-semibold text-slate-850">{log.resource}</strong>
                              </p>
                              {log.fabricTxId && (
                                <div className="mt-2 font-mono text-[9px] text-slate-400 flex items-center gap-1.5">
                                  <Lock className="w-3 h-3 text-[#7c3aed]" />
                                  <span className="truncate max-w-[240px]" title={log.fabricTxId}>TX: {log.fabricTxId}</span>
                                  <span>•</span>
                                  <span>Block: #{log.fabricBlock}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Node Service overview */}
                  <div className="lg:col-span-1 space-y-4">
                    <div className="bg-white rounded-2xl border border-[#D8DCE8] shadow-sm p-5 space-y-4 text-left">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                        <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                          <Shield className="w-4 h-4 text-[#7c3aed]" />
                          Node Monitor Summary
                        </h3>
                      </div>
                      <div className="space-y-3">
                        {MOCK_SYSTEM_HEALTH.slice(0, 4).map((node, i) => (
                          <div key={i} className="flex items-center justify-between p-2 hover:bg-slate-50 rounded-lg transition text-xs">
                            <div>
                              <span className="font-semibold text-slate-800 block">{node.service}</span>
                              <span className="text-[10px] text-slate-400">Uptime: {node.uptime}%</span>
                            </div>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              node.status === 'Online' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                            }`}>
                              {node.status}
                            </span>
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
      </div>
    </ProtectedRoute>
  );
}
