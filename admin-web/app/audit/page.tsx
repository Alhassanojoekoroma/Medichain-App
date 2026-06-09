'use client';

import { useState } from 'react';
import ProtectedRoute from '@/components/shared/ProtectedRoute';
import { Sidebar } from '@/components/dashboard/sidebar';
import { MobileMenuButton } from '@/components/dashboard/sidebar';
import { Header } from '@/components/dashboard/header';
import { MOCK_AUDIT_LOG } from '@/data/mockData';
import { Search, Activity, RefreshCw, Lock, ShieldCheck, HelpCircle, AlertCircle } from 'lucide-react';

export default function AdminAuditExplorer() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('all');

  const filtered = MOCK_AUDIT_LOG.filter(log => {
    const matchSearch = 
      (log.user || '').toLowerCase().includes(search.toLowerCase()) ||
      (log.resource || '').toLowerCase().includes(search.toLowerCase()) ||
      (log.fabricTxId || '').toLowerCase().includes(search.toLowerCase());
    const matchAction = actionFilter === 'all' || log.action === actionFilter;
    return matchSearch && matchAction;
  });

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
                <div>
                  <h1 className="text-2xl font-bold tracking-tight text-slate-900 font-display">Fabric Channel Audit Explorer</h1>
                  <p className="text-sm text-slate-500">
                    Query raw transactions committed to the ledger channels and inspect block payload checksums.
                  </p>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-2xl p-4 border border-[#D8DCE8] shadow-sm flex flex-col md:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search by TxID, user, or resource..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#7c3aed]/20 focus:border-[#7c3aed] transition text-slate-700"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-400">Action:</span>
                    <select
                      value={actionFilter}
                      onChange={(e) => setActionFilter(e.target.value)}
                      className="border border-[#D8DCE8] bg-white rounded-xl px-3 py-1.5 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#7c3aed]/20 focus:border-[#7c3aed] transition cursor-pointer text-slate-700"
                    >
                      <option value="all">All Actions</option>
                      <option value="record_upload">Record Upload</option>
                      <option value="access_granted">Access Granted</option>
                      <option value="user_registered">User Registered</option>
                      <option value="login">User Login</option>
                    </select>
                  </div>
                </div>

                {/* Ledger Audit Table */}
                <div className="bg-white rounded-2xl border border-[#D8DCE8] shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead>
                        <tr className="bg-slate-50 text-slate-400 text-xs font-bold uppercase border-b border-slate-100">
                          <th className="py-4 px-5">Block Index</th>
                          <th className="py-4 px-5">Fabric Channel</th>
                          <th className="py-4 px-5">Committer ID</th>
                          <th className="py-4 px-5">Tx Type</th>
                          <th className="py-4 px-5">Transaction Hash</th>
                          <th className="py-4 px-5">Operation</th>
                          <th className="py-4 px-5 text-right">Verification</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-medium">
                        {filtered.map((log, i) => (
                          <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                            <td className="py-4 px-5 font-bold text-slate-900">
                              {log.fabricBlock ? `#${log.fabricBlock}` : '—'}
                            </td>
                            <td className="py-4 px-5 text-slate-500 font-semibold">{log.channel || '—'}</td>
                            <td className="py-4 px-5 text-slate-700">{log.user}</td>
                            <td className="py-4 px-5 font-bold text-slate-400 text-[10px] uppercase">
                              {log.fabricTxId ? 'ENDORSER_TRANSACTION' : 'SYSTEM_LOG'}
                            </td>
                            <td className="py-4 px-5 font-mono text-[10px] text-[#7c3aed] select-all max-w-[150px] truncate" title={log.fabricTxId || 'N/A'}>
                              {log.fabricTxId || '—'}
                            </td>
                            <td className="py-4 px-5 text-slate-600 font-semibold">{log.action}</td>
                            <td className="py-4 px-5 text-right">
                              {log.status === 'Success' ? (
                                <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded text-[10px] font-bold border border-emerald-100">
                                  <ShieldCheck className="w-3 h-3" />
                                  Success
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 bg-rose-50 text-rose-700 px-2 py-0.5 rounded text-[10px] font-bold border border-rose-100">
                                  <AlertCircle className="w-3 h-3" />
                                  Failed
                                </span>
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
