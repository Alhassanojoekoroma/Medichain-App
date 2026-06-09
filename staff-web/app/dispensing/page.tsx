'use client';

import { useState } from 'react';
import ProtectedRoute from '@/components/shared/ProtectedRoute';
import { Sidebar } from '@/components/dashboard/sidebar';
import { MobileMenuButton } from '@/components/dashboard/sidebar';
import { Header } from '@/components/dashboard/header';
import { MOCK_PRESCRIPTIONS } from '@/data/mockData';
import { FileText, CheckCircle2, ShieldCheck, Activity, Search } from 'lucide-react';

export default function StaffDispensingHistory() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [search, setSearch] = useState('');

  const dispensedPrescriptions = MOCK_PRESCRIPTIONS.filter(rx => rx.status === 'Dispensed');

  const filtered = dispensedPrescriptions.filter(rx => 
    (rx.drug || '').toLowerCase().includes(search.toLowerCase()) ||
    (rx.id || '').toLowerCase().includes(search.toLowerCase())
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
                  <h1 className="text-2xl font-bold tracking-tight text-slate-900 font-display">Dispensing Ledger History</h1>
                  <p className="text-sm text-slate-500">
                    Audit log of all completed medicine dispensing operations registered on the medical-records channel.
                  </p>
                </div>

                {/* Search */}
                <div className="bg-white rounded-2xl p-4 border border-[#D8DCE8] shadow-sm flex flex-col md:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search history by Rx ID or medicine name..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#d97706]/20 focus:border-[#d97706] transition text-slate-700"
                    />
                  </div>
                </div>

                {/* History Table */}
                <div className="bg-white rounded-2xl border border-[#D8DCE8] shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead>
                        <tr className="bg-slate-50 text-slate-400 text-xs font-bold uppercase border-b border-slate-100">
                          <th className="py-4 px-5">Rx ID</th>
                          <th className="py-4 px-5">Dispensed Medicine</th>
                          <th className="py-4 px-5">Quantity Dispensed</th>
                          <th className="py-4 px-5">Dispensed At</th>
                          <th className="py-4 px-5">Fabric Transaction ID</th>
                          <th className="py-4 px-5">Fabric Block</th>
                          <th className="py-4 px-5 text-right">Verification</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {filtered.map((rx) => (
                          <tr key={rx.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="py-4 px-5 font-semibold text-[#d97706]">{rx.id}</td>
                            <td className="py-4 px-5 font-semibold text-slate-900">{rx.drug}</td>
                            <td className="py-4 px-5 font-bold text-slate-700">{rx.qty} units</td>
                            <td className="py-4 px-5 text-slate-500">{rx.issuedAt}</td>
                            <td className="py-4 px-5 font-mono text-xs text-[#d97706] select-all max-w-[200px] truncate" title={rx.fabricTxId}>
                              {rx.fabricTxId}
                            </td>
                            <td className="py-4 px-5 font-bold text-slate-900">#{rx.fabricBlock}</td>
                            <td className="py-4 px-5 text-right">
                              <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full text-xs font-bold border border-emerald-100 shadow-sm">
                                <ShieldCheck className="w-3.5 h-3.5" />
                                Confirmed
                              </span>
                            </td>
                          </tr>
                        ))}
                        {filtered.length === 0 && (
                          <tr>
                            <td colSpan={7} className="py-12 text-center text-slate-400">
                              <FileText className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                              <p className="font-semibold text-sm">No Dispensed Logs Found</p>
                              <p className="text-xs text-slate-400 mt-1">Dispensing transactions history is empty or filtered out</p>
                            </td>
                          </tr>
                        )}
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
