'use client';

import { useState } from 'react';
import ProtectedRoute from '@/components/shared/ProtectedRoute';
import { Sidebar } from '@/components/dashboard/sidebar';
import { MobileMenuButton } from '@/components/dashboard/sidebar';
import { Header } from '@/components/dashboard/header';
import { MOCK_AUDIT_LOG } from '@/data/mockData';
import { Search, ShieldAlert, CheckCircle2, RefreshCw, Eye, Lock } from 'lucide-react';

export default function AdminAccessLogs() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [search, setSearch] = useState('');

  // Filter logs related to access or patient viewing
  const accessLogs = MOCK_AUDIT_LOG.filter(log => log.action === 'access_granted' || log.action === 'record_upload');

  const filtered = accessLogs.filter(log => 
    (log.user || '').toLowerCase().includes(search.toLowerCase()) ||
    (log.resource || '').toLowerCase().includes(search.toLowerCase()) ||
    (log.action || '').toLowerCase().includes(search.toLowerCase())
  );

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
                  <h1 className="text-2xl font-bold tracking-tight text-slate-900 font-display">Patient Access Consent Logs</h1>
                  <p className="text-sm text-slate-500">
                    Audit log of all clinical data sharing requests and consent transactions committed to the ledger.
                  </p>
                </div>

                {/* Search */}
                <div className="bg-white rounded-2xl p-4 border border-[#D8DCE8] shadow-sm flex flex-col md:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search logs by practitioner, patient, action..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#7c3aed]/20 focus:border-[#7c3aed] transition text-slate-700"
                    />
                  </div>
                </div>

                {/* Access Table */}
                <div className="bg-white rounded-2xl border border-[#D8DCE8] shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead>
                        <tr className="bg-slate-50 text-slate-400 text-xs font-bold uppercase border-b border-slate-100">
                          <th className="py-4 px-5">Timestamp</th>
                          <th className="py-4 px-5">Practitioner (ID / Role)</th>
                          <th className="py-4 px-5">Action Type</th>
                          <th className="py-4 px-5">Subject Resource</th>
                          <th className="py-4 px-5">Client IP</th>
                          <th className="py-4 px-5">Fabric Transaction Hash</th>
                          <th className="py-4 px-5 text-right">Block ID</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {filtered.map((log, i) => (
                          <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                            <td className="py-4 px-5 text-slate-500 font-medium">{log.timestamp}</td>
                            <td className="py-4 px-5">
                              <div className="font-semibold text-slate-900">{log.user}</div>
                              <div className="text-[10px] text-slate-400 font-bold uppercase">{log.role}</div>
                            </td>
                            <td className="py-4 px-5">
                              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] font-bold ${
                                log.action === 'access_granted' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                                'bg-violet-50 text-violet-700 border border-violet-100'
                              }`}>
                                {log.action === 'access_granted' ? 'CONSENT_GRANTED' : 'RECORD_PUBLISH'}
                              </span>
                            </td>
                            <td className="py-4 px-5 font-bold text-slate-700">{log.resource}</td>
                            <td className="py-4 px-5 text-slate-500 font-mono text-xs">{log.ip}</td>
                            <td className="py-4 px-5 font-mono text-[10px] text-slate-400 max-w-[150px] truncate" title={log.fabricTxId || 'N/A'}>
                              {log.fabricTxId || '—'}
                            </td>
                            <td className="py-4 px-5 text-right font-extrabold text-slate-900">
                              {log.fabricBlock ? `#${log.fabricBlock}` : '—'}
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
