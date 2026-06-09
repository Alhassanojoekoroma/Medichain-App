'use client';

import { useState } from 'react';
import ProtectedRoute from '@/components/shared/ProtectedRoute';
import { Sidebar } from '@/components/dashboard/sidebar';
import { MobileMenuButton } from '@/components/dashboard/sidebar';
import { Header } from '@/components/dashboard/header';
import { MOCK_PRESCRIPTIONS } from '@/data/mockData';
import { Search, ClipboardList, CheckCircle2, AlertTriangle, ShieldCheck, Activity, RefreshCw } from 'lucide-react';

export default function StaffPrescriptions() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [prescriptions, setPrescriptions] = useState(MOCK_PRESCRIPTIONS);
  const [search, setSearch] = useState('');

  const handleDispense = (id: string) => {
    setPrescriptions(prev => prev.map(rx => {
      if (rx.id === id) {
        return {
          ...rx,
          status: 'Dispensed',
          fabricTxId: 'c' + Math.random().toString(16).substring(2, 65) + 'a',
          fabricBlock: Math.floor(150 + Math.random() * 50)
        };
      }
      return rx;
    }));
    alert(`Dispense transaction committed! Prescription ${id} is now updated on the blockchain ledger.`);
  };

  const filtered = prescriptions.filter(rx => 
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
                  <h1 className="text-2xl font-bold tracking-tight text-slate-900 font-display">Prescription Dispensing Records</h1>
                  <p className="text-sm text-slate-500">
                    Verify and dispense physician prescriptions securely. Patient names are anonymized to protect PII.
                  </p>
                </div>

                {/* Search */}
                <div className="bg-white rounded-2xl p-4 border border-[#D8DCE8] shadow-sm flex flex-col md:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search prescriptions by Rx ID or Drug name..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#d97706]/20 focus:border-[#d97706] transition text-slate-700"
                    />
                  </div>
                </div>

                {/* Prescriptions Table */}
                <div className="bg-white rounded-2xl border border-[#D8DCE8] shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead>
                        <tr className="bg-slate-50 text-slate-400 text-xs font-bold uppercase border-b border-slate-100">
                          <th className="py-4 px-5">Rx ID</th>
                          <th className="py-4 px-5">Patient Name</th>
                          <th className="py-4 px-5">Prescribed Medicine</th>
                          <th className="py-4 px-5">Instructions & Qty</th>
                          <th className="py-4 px-5">Issued By</th>
                          <th className="py-4 px-5">Ledger Details</th>
                          <th className="py-4 px-5">Status</th>
                          <th className="py-4 px-5 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {filtered.map((rx) => (
                          <tr key={rx.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="py-4 px-5 font-semibold text-[#d97706]">{rx.id}</td>
                            <td className="py-4 px-5 text-slate-400 italic font-semibold">Anonymized Patient</td>
                            <td className="py-4 px-5 font-semibold text-slate-900">{rx.drug}</td>
                            <td className="py-4 px-5 text-slate-500">
                              {rx.dosage} • <span className="font-semibold text-slate-600">Qty: {rx.qty}</span>
                            </td>
                            <td className="py-4 px-5 text-slate-600">{rx.issuedBy}</td>
                            <td className="py-4 px-5 font-mono text-[10px] text-slate-400 space-y-0.5">
                              <div className="flex items-center gap-1">
                                <span className="font-bold text-slate-500">TX:</span>
                                <span className="truncate max-w-[100px]" title={rx.fabricTxId}>{rx.fabricTxId}</span>
                              </div>
                              <div>
                                <span className="font-bold text-slate-500">BLOCK:</span> #{rx.fabricBlock}
                              </div>
                            </td>
                            <td className="py-4 px-5">
                              <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                                rx.status === 'Dispensed' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                                rx.status === 'Pending' ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                                'bg-slate-100 text-slate-500'
                              }`}>
                                {rx.status}
                              </span>
                            </td>
                            <td className="py-4 px-5 text-right">
                              {rx.status === 'Pending' ? (
                                <button
                                  onClick={() => handleDispense(rx.id)}
                                  className="px-3.5 py-1.5 bg-[#d97706] hover:bg-[#b45309] text-white text-xs font-bold rounded-xl transition shadow-sm"
                                >
                                  Dispense
                                </button>
                              ) : (
                                <span className="text-xs text-slate-400 font-semibold">Processed</span>
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
