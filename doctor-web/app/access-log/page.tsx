'use client';

import { useState } from 'react';
import { LayoutWrapper } from '@/components/dashboard/layout-wrapper';
import { MOCK_ACCESS_REQUESTS } from '@/data/mockData';
import { useAuth } from '@/hooks/useAuth';
import { 
  ShieldCheck, ShieldAlert, Clock, Search, Filter, 
  Check, X, RefreshCw, AlertCircle, FileText, Lock
} from 'lucide-react';
import type { AccessRequest, AccessStatus } from '@/types';

export default function AccessLogPage() {
  useAuth(); // Require authentication

  const [requests, setRequests] = useState<AccessRequest[]>(MOCK_ACCESS_REQUESTS);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [processingId, setProcessingId] = useState<string | null>(null);

  const getStatusIcon = (status: AccessStatus) => {
    switch (status) {
      case 'Approved':
        return <ShieldCheck className="h-4 w-4 text-emerald-600" />;
      case 'Pending':
        return <Clock className="h-4 w-4 text-amber-500 animate-pulse" />;
      case 'Expired':
        return <Lock className="h-4 w-4 text-slate-400" />;
      case 'Revoked':
        return <ShieldAlert className="h-4 w-4 text-rose-500" />;
    }
  };

  const getStatusClass = (status: AccessStatus) => {
    switch (status) {
      case 'Approved':
        return 'bg-emerald-50 text-emerald-700 border-emerald-150';
      case 'Pending':
        return 'bg-amber-50 text-amber-700 border-amber-150';
      case 'Expired':
        return 'bg-slate-50 text-slate-600 border-slate-200';
      case 'Revoked':
        return 'bg-rose-50 text-rose-700 border-rose-150';
    }
  };

  const handleStatusChange = (requestId: string, newStatus: 'Approved' | 'Revoked') => {
    setProcessingId(requestId);
    
    // Simulate smart contract state update on ledger
    setTimeout(() => {
      setRequests(prev => prev.map(req => 
        req.id === requestId 
          ? { 
              ...req, 
              status: newStatus,
              grantedBy: newStatus === 'Approved' ? 'Dr. Amara Kofi (Doctor)' : undefined,
              txHash: '0x' + Math.random().toString(16).substring(2, 10) + '...'
            } 
          : req
      ));
      setProcessingId(null);
    }, 1200);
  };

  const filteredRequests = requests.filter(req => {
    const nameMatch = req.patientName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                      req.id.toLowerCase().includes(searchTerm.toLowerCase());
    const statusMatch = statusFilter === 'all' || req.status === statusFilter;
    return nameMatch && statusMatch;
  });

  return (
    <LayoutWrapper title="Access Requests Log">
      <div className="space-y-6">
        
        {/* Header Summary */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Ledger Access Log</h1>
            <p className="text-sm text-slate-500">Monitor, authorize, and revoke hospital access keys to patient electronic records</p>
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-lg py-2 px-3 text-xs text-amber-800 flex items-center gap-2 max-w-sm">
            <AlertCircle className="h-4 w-4 text-amber-600 shrink-0" />
            <span>Consent logs are cryptographically anchored and cannot be deleted.</span>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search request ID, patient name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition text-slate-700"
            />
          </div>
          <div className="relative flex items-center">
            <Filter className="absolute left-3 h-4 w-4 text-slate-400 pointer-events-none" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition appearance-none cursor-pointer text-slate-700"
            >
              <option value="all">All Authorization states</option>
              <option value="Approved">Approved</option>
              <option value="Pending">Pending Approval</option>
              <option value="Expired">Expired</option>
              <option value="Revoked">Revoked</option>
            </select>
          </div>
        </div>

        {/* Table of logs */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/75 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4 font-medium">Request Reference ID</th>
                  <th className="py-3.5 px-4 font-medium">Patient Details</th>
                  <th className="py-3.5 px-4 font-medium">Requested Files</th>
                  <th className="py-3.5 px-4 font-medium">Request Date</th>
                  <th className="py-3.5 px-4 font-medium">Expiry / Status Date</th>
                  <th className="py-3.5 px-4 font-medium">Validation Signatures</th>
                  <th className="py-3.5 px-4 font-medium">Status</th>
                  <th className="py-3.5 px-4 font-medium text-right">Ledger Consent Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filteredRequests.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-10 text-center text-slate-500">
                      <ShieldAlert className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                      <p className="font-medium">No consent log matching criteria</p>
                    </td>
                  </tr>
                ) : (
                  filteredRequests.map((req) => (
                    <tr key={req.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-4 px-4 font-mono font-semibold text-xs text-slate-500">
                        {req.id}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="h-8 w-8 rounded-full bg-brand-light text-brand text-xs font-bold flex items-center justify-center">
                            {req.patientInitials}
                          </div>
                          <div>
                            <div className="font-semibold text-slate-900">{req.patientName}</div>
                            <div className="text-[10px] text-slate-400">ID: {req.patientId}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex flex-wrap gap-1 max-w-[200px]">
                          {req.recordTypes.map((type) => (
                            <span key={type} className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px] font-medium border border-slate-200">
                              <FileText className="h-2.5 w-2.5" />
                              {type}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-4 px-4 text-xs text-slate-500 whitespace-nowrap">
                        {req.requestedAt.split('T')[0]} <span className="text-[10px] block text-slate-400">{req.requestedAt.split('T')[1].substring(0, 5)} UTC</span>
                      </td>
                      <td className="py-4 px-4 text-xs text-slate-500 whitespace-nowrap">
                        {req.expiresAt ? req.expiresAt.split('T')[0] : 'N/A'} 
                        {req.expiresAt && <span className="text-[10px] block text-slate-400">{req.expiresAt.split('T')[1].substring(0, 5)} UTC</span>}
                      </td>
                      <td className="py-4 px-4">
                        {req.txHash ? (
                          <div className="font-mono text-[10px] text-brand space-y-0.5">
                            <span className="block font-semibold">SIG APPROVED:</span>
                            <span className="text-slate-400 truncate max-w-[100px] block select-all">{req.txHash}</span>
                            {req.grantedBy && <span className="text-[9px] block text-slate-500 font-sans italic">By {req.grantedBy}</span>}
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400 italic">No signature anchored</span>
                        )}
                      </td>
                      <td className="py-4 px-4 whitespace-nowrap">
                        <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border inline-flex items-center gap-1.5 ${getStatusClass(req.status)}`}>
                          {getStatusIcon(req.status)}
                          {req.status}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right whitespace-nowrap">
                        {processingId === req.id ? (
                          <div className="flex justify-end text-xs text-slate-500 items-center gap-1">
                            <RefreshCw className="h-3.5 w-3.5 animate-spin text-brand" />
                            Ledger signing...
                          </div>
                        ) : req.status === 'Pending' ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleStatusChange(req.id, 'Revoked')}
                              className="p-1.5 border border-rose-200 text-rose-600 hover:bg-rose-50 rounded-lg transition"
                              title="Deny Consent"
                            >
                              <X className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleStatusChange(req.id, 'Approved')}
                              className="px-2.5 py-1.5 text-xs font-medium text-white bg-brand hover:bg-brand-dark rounded-lg transition shadow-sm flex items-center gap-1"
                              title="Authorize Access"
                            >
                              <Check className="h-3.5 w-3.5" />
                              Approve
                            </button>
                          </div>
                        ) : req.status === 'Approved' ? (
                          <button
                            onClick={() => handleStatusChange(req.id, 'Revoked')}
                            className="px-2.5 py-1.5 border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-medium rounded-lg transition"
                          >
                            Revoke Key
                          </button>
                        ) : (
                          <span className="text-xs text-slate-400 italic">Historical Record Locked</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </LayoutWrapper>
  );
}
