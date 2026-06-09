'use client';

import { useState } from 'react';
import ProtectedRoute from '@/components/shared/ProtectedRoute';
import { Sidebar } from '@/components/dashboard/sidebar';
import { MobileMenuButton } from '@/components/dashboard/sidebar';
import { Header } from '@/components/dashboard/header';
import { MOCK_SYSTEM_USERS } from '@/data/mockData';
import { Search, UserCheck, ShieldAlert, Award, Lock } from 'lucide-react';

export default function AdminUsers() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [users, setUsers] = useState(MOCK_SYSTEM_USERS);
  const [search, setSearch] = useState('');

  const handleVerifyCA = (name: string, fabricIdentity: string) => {
    alert(`Verified certificate on Fabric CA Server!
Identity: ${fabricIdentity}
X.509 Certificate Status: VALID (Active)
Issuer: org1-ca.medichain.local`);
  };

  const handleRevoke = (id: string, name: string) => {
    if (confirm(`Are you sure you want to revoke the Fabric CA enrollment certificate for ${name}? This will block all ledger entries from this identity.`)) {
      setUsers(prev => prev.map(u => 
        u.id === id ? { ...u, status: 'Revoked' } : u
      ));
      alert(`Certificate revoked! Identity deleted from CA registry. Access blocked on channels.`);
    }
  };

  const filtered = users.filter(u => 
    (u.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (u.email || '').toLowerCase().includes(search.toLowerCase()) ||
    (u.role || '').toLowerCase().includes(search.toLowerCase())
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
                  <h1 className="text-2xl font-bold tracking-tight text-slate-900 font-display">CA Enrolled User Registry</h1>
                  <p className="text-sm text-slate-500">
                    Verify cryptographic X.509 certificates and manage roles enrolled in the Fabric Certificate Authority.
                  </p>
                </div>

                {/* Search */}
                <div className="bg-white rounded-2xl p-4 border border-[#D8DCE8] shadow-sm flex flex-col md:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search users by name, email, role..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#7c3aed]/20 focus:border-[#7c3aed] transition text-slate-700"
                    />
                  </div>
                </div>

                {/* Users Table */}
                <div className="bg-white rounded-2xl border border-[#D8DCE8] shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead>
                        <tr className="bg-slate-50 text-slate-400 text-xs font-bold uppercase border-b border-slate-100">
                          <th className="py-4 px-5">Name & Email</th>
                          <th className="py-4 px-5">Access Role</th>
                          <th className="py-4 px-5">Fabric MSP Org</th>
                          <th className="py-4 px-5">CA Enrollment ID</th>
                          <th className="py-4 px-5">CA Status</th>
                          <th className="py-4 px-5 text-right">Certificate Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {filtered.map((u) => (
                          <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="py-4 px-5">
                              <div className="flex items-center gap-3">
                                <div className="h-9 w-9 bg-purple-50 text-[#7c3aed] font-bold text-sm rounded-full flex items-center justify-center">
                                  {u.name.split(' ').map((n: string) => n[0]).join('').substring(0,2)}
                                </div>
                                <div>
                                  <div className="font-semibold text-slate-900">{u.name}</div>
                                  <div className="text-[10px] text-slate-400 font-semibold">{u.email}</div>
                                </div>
                              </div>
                            </td>
                            <td className="py-4 px-5 font-semibold text-slate-700 uppercase text-xs">{u.role}</td>
                            <td className="py-4 px-5 text-slate-650 font-medium">
                              <span className="flex items-center gap-1.5">
                                <Lock className="w-3.5 h-3.5 text-slate-400" />
                                {u.fabricOrg}
                              </span>
                            </td>
                            <td className="py-4 px-5 font-mono text-xs text-slate-500">{u.fabricIdentity}</td>
                            <td className="py-4 px-5">
                              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                                u.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                                'bg-rose-50 text-rose-700 border border-rose-100'
                              }`}>
                                {u.status}
                              </span>
                            </td>
                            <td className="py-4 px-5 text-right space-x-1 whitespace-nowrap">
                              <button
                                onClick={() => handleVerifyCA(u.name, u.fabricIdentity)}
                                className="px-3 py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl transition shadow-sm"
                              >
                                Verify CA
                              </button>
                              {u.status === 'Active' && (
                                <button
                                  onClick={() => handleRevoke(u.id, u.name)}
                                  className="px-3 py-1.5 bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold rounded-xl transition shadow-sm"
                                >
                                  Revoke cert
                                </button>
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
