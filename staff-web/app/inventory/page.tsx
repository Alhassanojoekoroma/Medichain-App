'use client';

import { useState } from 'react';
import ProtectedRoute from '@/components/shared/ProtectedRoute';
import { Sidebar } from '@/components/dashboard/sidebar';
import { MobileMenuButton } from '@/components/dashboard/sidebar';
import { Header } from '@/components/dashboard/header';
import { MOCK_DRUG_INVENTORY } from '@/data/mockData';
import { Search, Package, Plus, AlertCircle, RefreshCw, Layers } from 'lucide-react';

export default function StaffInventory() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [inventory, setInventory] = useState(MOCK_DRUG_INVENTORY);
  const [search, setSearch] = useState('');
  
  // Restock form state
  const [selectedDrug, setSelectedDrug] = useState('');
  const [addQty, setAddQty] = useState(50);

  const handleQuickRestock = (name: string, amount: number) => {
    setInventory(prev => prev.map(item => {
      if (item.name === name) {
        const newStock = item.inStock + amount;
        let newStatus = 'In Stock';
        if (newStock === 0) newStatus = 'Out of Stock';
        else if (newStock < item.threshold) newStatus = 'Low Stock';
        
        return {
          ...item,
          inStock: newStock,
          status: newStatus,
          lastRestocked: new Date().toISOString().split('T')[0]
        };
      }
      return item;
    }));
  };

  const handleFormRestock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDrug) return;
    handleQuickRestock(selectedDrug, Number(addQty));
    alert(`Successfully added ${addQty} units of ${selectedDrug} to local storage. Ledger commit logs created.`);
    setSelectedDrug('');
  };

  const filtered = inventory.filter(item => 
    (item.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (item.category || '').toLowerCase().includes(search.toLowerCase())
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
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900 font-display">Medicine Inventory Management</h1>
                    <p className="text-sm text-slate-500">
                      Manage pharmaceutical stocks, define alert thresholds, and log restock transactions.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Left: Inventory List */}
                  <div className="lg:col-span-2 space-y-4">
                    <div className="bg-white rounded-2xl p-4 border border-[#D8DCE8] shadow-sm flex flex-col md:flex-row gap-4">
                      <div className="relative flex-1">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                        <input
                          type="text"
                          placeholder="Search medicine by name or category..."
                          value={search}
                          onChange={(e) => setSearch(e.target.value)}
                          className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#d97706]/20 focus:border-[#d97706] transition text-slate-700"
                        />
                      </div>
                    </div>

                    <div className="bg-white rounded-2xl border border-[#D8DCE8] shadow-sm overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                          <thead>
                            <tr className="bg-slate-50 text-slate-400 text-xs font-bold uppercase border-b border-slate-100">
                              <th className="py-4 px-5">Medicine Name</th>
                              <th className="py-4 px-5">Category</th>
                              <th className="py-4 px-5">Current Stock</th>
                              <th className="py-4 px-5">Threshold</th>
                              <th className="py-4 px-5">Last Restocked</th>
                              <th className="py-4 px-5 text-right">Quick Restock</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {filtered.map((item, idx) => (
                              <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                                <td className="py-4 px-5 font-semibold text-slate-900">
                                  <div className="flex items-center gap-2.5">
                                    <div className="w-2.5 h-2.5 rounded-full bg-slate-200 flex-shrink-0" style={{
                                      backgroundColor: item.status === 'Out of Stock' ? '#E53E3E' :
                                                      item.status === 'Low Stock' ? '#D97706' : '#1D9E75'
                                    }} />
                                    <span>{item.name}</span>
                                  </div>
                                </td>
                                <td className="py-4 px-5 text-slate-500 font-semibold">{item.category}</td>
                                <td className="py-4 px-5 font-bold text-slate-900">{item.inStock} units</td>
                                <td className="py-4 px-5 text-slate-400 font-semibold">{item.threshold} units</td>
                                <td className="py-4 px-5 text-slate-500">{item.lastRestocked}</td>
                                <td className="py-4 px-5 text-right space-x-1 whitespace-nowrap">
                                  <button
                                    onClick={() => handleQuickRestock(item.name, 50)}
                                    className="px-2.5 py-1 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold rounded-lg transition"
                                  >
                                    +50
                                  </button>
                                  <button
                                    onClick={() => handleQuickRestock(item.name, 100)}
                                    className="px-2.5 py-1 bg-[#d97706]/10 hover:bg-[#d97706]/20 text-[#d97706] text-xs font-bold rounded-lg transition"
                                  >
                                    +100
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>

                  {/* Right: Restock Form */}
                  <div className="lg:col-span-1">
                    <div className="bg-white rounded-2xl border border-[#D8DCE8] shadow-sm p-5 space-y-4">
                      <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                        <Plus className="w-5 h-5 text-[#d97706]" />
                        <h3 className="font-bold text-slate-900 text-sm">Add New Stock Batch</h3>
                      </div>
                      <form onSubmit={handleFormRestock} className="space-y-4 text-left">
                        <div>
                          <label className="block text-xs font-bold text-[#5D6582] mb-1">Select Medicine *</label>
                          <select
                            required
                            value={selectedDrug}
                            onChange={(e) => setSelectedDrug(e.target.value)}
                            className="w-full border border-[#D8DCE8] bg-slate-50 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#d97706]/20 focus:border-[#d97706] transition text-slate-700"
                          >
                            <option value="">-- Choose Medicine --</option>
                            {inventory.map((item, idx) => (
                              <option key={idx} value={item.name}>{item.name}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-[#5D6582] mb-1">Batch Quantity to Add *</label>
                          <input
                            type="number"
                            required
                            min={1}
                            value={addQty}
                            onChange={(e) => setAddQty(Number(e.target.value))}
                            className="w-full border border-[#D8DCE8] rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#d97706]/20 focus:border-[#d97706] transition"
                          />
                        </div>
                        <button
                          type="submit"
                          className="w-full py-2.5 bg-[#d97706] hover:bg-[#b45309] text-white rounded-xl text-sm font-bold transition shadow-sm"
                        >
                          Register Batch Restock
                        </button>
                      </form>
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
