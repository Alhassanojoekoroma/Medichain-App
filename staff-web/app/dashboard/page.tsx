'use client';

import { useState } from 'react';
import ProtectedRoute from '@/components/shared/ProtectedRoute';
import { Sidebar } from '@/components/dashboard/sidebar';
import { MobileMenuButton } from '@/components/dashboard/sidebar';
import { Header } from '@/components/dashboard/header';
import { MOCK_PRESCRIPTIONS, MOCK_DRUG_INVENTORY } from '@/data/mockData';
import { ClipboardList, CheckCircle2, AlertTriangle, Package, Activity, Search, RefreshCw } from 'lucide-react';

export default function StaffDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [prescriptions, setPrescriptions] = useState(MOCK_PRESCRIPTIONS);
  const [inventory, setInventory] = useState(MOCK_DRUG_INVENTORY);
  const [search, setSearch] = useState('');

  const handleDispense = (id: string) => {
    // Simulate committing to blockchain
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
    alert(`Dispense committed! Prescription ${id} successfully signed and updated on medical-records channel.`);
  };

  const pendingRX = prescriptions.filter(rx => rx.status === 'Pending');
  const lowStockCount = inventory.filter(i => i.status === 'Low Stock' || i.status === 'Out of Stock').length;

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
                  <h1 className="text-2xl font-bold tracking-tight text-slate-900 font-display">Pharmacy Operations Dashboard</h1>
                  <p className="text-sm text-slate-500">
                    Verify prescriptions, manage medicine inventory, and log dispense transactions on Hyperledger Fabric.
                  </p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-white rounded-2xl p-5 border border-[#D8DCE8] shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Pending Presc.</span>
                      <div className="w-8 h-8 bg-amber-50 rounded-lg flex items-center justify-center">
                        <ClipboardList className="w-4 h-4 text-[#d97706]" />
                      </div>
                    </div>
                    <div className="text-3xl font-extrabold text-slate-900">{pendingRX.length}</div>
                    <p className="text-[10px] text-slate-400 mt-1">Awaiting dispense</p>
                  </div>

                  <div className="bg-white rounded-2xl p-5 border border-[#D8DCE8] shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Dispensed Total</span>
                      <div className="w-8 h-8 bg-emerald-50 rounded-lg flex items-center justify-center">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      </div>
                    </div>
                    <div className="text-3xl font-extrabold text-slate-900">
                      {prescriptions.filter(rx => rx.status === 'Dispensed').length}
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">Ledger confirmed logs</p>
                  </div>

                  <div className="bg-white rounded-2xl p-5 border border-[#D8DCE8] shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Stock Alerts</span>
                      <div className="w-8 h-8 bg-rose-50 rounded-lg flex items-center justify-center">
                        <AlertTriangle className="w-4 h-4 text-rose-500" />
                      </div>
                    </div>
                    <div className="text-3xl font-extrabold text-slate-900">{lowStockCount}</div>
                    <p className="text-[10px] text-slate-400 mt-1">Low or out-of-stock items</p>
                  </div>

                  <div className="bg-white rounded-2xl p-5 border border-[#D8DCE8] shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Fabric Sync</span>
                      <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                        <Activity className="w-4 h-4 text-blue-600" />
                      </div>
                    </div>
                    <div className="text-3xl font-extrabold text-slate-900">Active</div>
                    <p className="text-[10px] text-slate-400 mt-1">Channel: pharmacy-records</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Left: Pending Prescriptions Queue */}
                  <div className="lg:col-span-2 space-y-4">
                    <div className="bg-white rounded-2xl border border-[#D8DCE8] shadow-sm overflow-hidden">
                      <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                        <h3 className="font-bold text-slate-900 text-sm">Active Prescriptions Queue</h3>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                          <thead>
                            <tr className="bg-slate-50 text-slate-400 text-xs font-bold uppercase border-b border-slate-100">
                              <th className="py-3 px-4">Rx ID</th>
                              <th className="py-3 px-4">Patient Name</th>
                              <th className="py-3 px-4">Prescribed Drug</th>
                              <th className="py-3 px-4">Dosage / Qty</th>
                              <th className="py-3 px-4 text-right">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {pendingRX.map((rx) => (
                              <tr key={rx.id} className="hover:bg-slate-50/50 transition-colors">
                                <td className="py-3.5 px-4 font-semibold text-[#d97706]">{rx.id}</td>
                                <td className="py-3.5 px-4 text-slate-400 font-medium italic">Anonymized Patient</td>
                                <td className="py-3.5 px-4 font-medium text-slate-900">{rx.drug}</td>
                                <td className="py-3.5 px-4 text-slate-500">
                                  {rx.dosage} • <span className="font-bold text-slate-600">Qty: {rx.qty}</span>
                                </td>
                                <td className="py-3.5 px-4 text-right">
                                  <button
                                    onClick={() => handleDispense(rx.id)}
                                    className="px-3.5 py-1.5 bg-[#d97706] hover:bg-[#b45309] text-white text-xs font-bold rounded-xl transition shadow-sm"
                                  >
                                    Dispense
                                  </button>
                                </td>
                              </tr>
                            ))}
                            {pendingRX.length === 0 && (
                              <tr>
                                <td colSpan={5} className="py-12 text-center text-slate-400">
                                  <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-emerald-500" />
                                  <p className="font-semibold text-sm">All Prescriptions Dispensed</p>
                                  <p className="text-xs text-slate-400 mt-1">Pending queue is currently empty</p>
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>

                  {/* Right: Low Stock Alert checklist */}
                  <div className="lg:col-span-1 space-y-4">
                    <div className="bg-white rounded-2xl border border-[#D8DCE8] shadow-sm p-5 space-y-4">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                        <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                          <Package className="w-4 h-4 text-[#d97706]" />
                          Low Stock Checklist
                        </h3>
                      </div>
                      <div className="space-y-3">
                        {inventory.map((item, idx) => (
                          <div key={idx} className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                            <div>
                              <p className="font-semibold text-slate-900 text-sm">{item.name}</p>
                              <p className="text-[10px] text-slate-400 font-semibold">Stock: {item.inStock} / Threshold: {item.threshold}</p>
                            </div>
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                              item.status === 'Out of Stock' ? 'bg-rose-50 text-rose-700 border border-rose-100' :
                              item.status === 'Low Stock' ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                              'bg-emerald-50 text-emerald-700 border border-emerald-100'
                            }`}>
                              {item.status}
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
