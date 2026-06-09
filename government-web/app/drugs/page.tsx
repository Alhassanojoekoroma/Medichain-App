'use client';

import { useState } from 'react';
import ProtectedRoute from '@/components/shared/ProtectedRoute';
import { Sidebar } from '@/components/dashboard/sidebar';
import { MobileMenuButton } from '@/components/dashboard/sidebar';
import { Header } from '@/components/dashboard/header';
import { MOCK_DRUG_DISTRIBUTION } from '@/data/mockData';
import { Search, ShieldAlert, CheckCircle2, RefreshCw, FileText, Lock } from 'lucide-react';

export default function GovernmentDrugDistribution() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [search, setSearch] = useState('');

  const filtered = MOCK_DRUG_DISTRIBUTION.filter(d => 
    (d.drug || '').toLowerCase().includes(search.toLowerCase()) ||
    (d.hospital || '').toLowerCase().includes(search.toLowerCase())
  );

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
                  <h1 className="text-2xl font-bold tracking-tight text-slate-900 font-display">National Drug Distribution Log</h1>
                  <p className="text-sm text-slate-500">
                    Verify bulk pharmaceutical delivery orders committed to the national-analytics ledger.
                  </p>
                </div>

                {/* Search */}
                <div className="bg-white rounded-2xl p-4 border border-[#D8DCE8] shadow-sm flex flex-col md:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search distribution log by medicine name or destination hospital..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0284c7]/20 focus:border-[#0284c7] transition text-slate-700"
                    />
                  </div>
                </div>

                {/* Distribution Log Table */}
                <div className="bg-white rounded-2xl border border-[#D8DCE8] shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead>
                        <tr className="bg-slate-50 text-slate-400 text-xs font-bold uppercase border-b border-slate-100">
                          <th className="py-4 px-5">Medicine</th>
                          <th className="py-4 px-5">Destination Facility</th>
                          <th className="py-4 px-5">Quantity</th>
                          <th className="py-4 px-5">Shipment Date</th>
                          <th className="py-4 px-5">Fabric Commit</th>
                          <th className="py-4 px-5">Shipment Status</th>
                          <th className="py-4 px-5 text-right">Verification</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {filtered.map((d, i) => (
                          <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                            <td className="py-4 px-5 font-semibold text-[#0284c7]">{d.drug}</td>
                            <td className="py-4 px-5 font-medium text-slate-900">{d.hospital}</td>
                            <td className="py-4 px-5 font-bold text-slate-700">{d.qty.toLocaleString()} units</td>
                            <td className="py-4 px-5 text-slate-500">{d.date}</td>
                            <td className="py-4 px-5 font-mono text-[10px] text-slate-400 space-y-0.5">
                              {d.txId ? (
                                <>
                                  <div className="flex items-center gap-1">
                                    <span className="font-bold text-slate-500">TX:</span>
                                    <span className="truncate max-w-[100px]" title={d.txId}>{d.txId}</span>
                                  </div>
                                  <div>
                                    <span className="font-bold text-slate-500">BLOCK:</span> #{d.blockNumber}
                                  </div>
                                </>
                              ) : (
                                <span className="text-slate-400 italic">Not Committed</span>
                              )}
                            </td>
                            <td className="py-4 px-5">
                              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                                d.status === 'Delivered' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                                d.status === 'In Transit' ? 'bg-blue-50 text-blue-700 border border-blue-100' :
                                'bg-amber-50 text-amber-700 border border-amber-100'
                              }`}>
                                {d.status}
                              </span>
                            </td>
                            <td className="py-4 px-5 text-right">
                              {d.txId ? (
                                <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded text-xs font-bold border border-emerald-100 shadow-sm">
                                  <Lock className="w-3 h-3" />
                                  Anchored
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 px-2 py-0.5 rounded text-xs font-bold border border-amber-100 animate-pulse">
                                  Pending Commit
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
