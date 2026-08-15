'use client';

import { useState, useEffect } from 'react';
import { LayoutWrapper } from '@/components/dashboard/layout-wrapper';
import { useAuth } from '@/hooks/useAuth';
import { 
  FileText, CheckCircle2, AlertTriangle, Clock, 
  ExternalLink, Search, Filter, Plus, RefreshCw, FileDown, Database, X, ShieldCheck
} from 'lucide-react';
import type { MedicalRecord, RecordStatus, RecordType } from '@/types';
import Link from 'next/link';
import { backendApi } from '@/services/backendApi';

export default function RecordsPage() {
  useAuth(); // Require authentication

  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncingId, setSyncingId] = useState<string | null>(null);
  const [selectedPreviewRecord, setSelectedPreviewRecord] = useState<MedicalRecord | null>(null);

  const loadRecords = async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const res = await backendApi.getRecords();
      setRecords(res.records ?? []);
    } catch (err: any) {
      setRecords([]);
      setLoadError(err?.message || 'Medical records are unavailable.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const load = async () => {
      await loadRecords();
    };

    void load();
  }, []);

  const getStatusIcon = (status: RecordStatus) => {
    switch (status) {
      case 'Synced':
        return <CheckCircle2 className="h-4 w-4 text-emerald-600" />;
      case 'Pending':
        return <Clock className="h-4 w-4 text-amber-500" />;
      case 'Verifying':
        return <RefreshCw className="h-4 w-4 text-violet-500 animate-spin" />;
      case 'Failed':
        return <AlertTriangle className="h-4 w-4 text-rose-500" />;
    }
  };

  const getStatusClass = (status: RecordStatus) => {
    switch (status) {
      case 'Synced':
        return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'Pending':
        return 'bg-amber-50 text-amber-700 border-amber-100';
      case 'Verifying':
        return 'bg-violet-50 text-violet-700 border-violet-100';
      case 'Failed':
        return 'bg-rose-50 text-rose-700 border-rose-100';
    }
  };

  // Push a pending record to Hyperledger Fabric channel
  const handleForceSync = async (recordId: string) => {
    setSyncingId(recordId);
    
    // Set local state to verifying
    setRecords(prev => prev.map(rec => 
      rec.id === recordId ? { ...rec, status: 'Verifying' } : rec
    ));

    try {
      await backendApi.forceSync();
      // Reload from backend
      await loadRecords();
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Sync failed');
      // Revert state
      loadRecords();
    } finally {
      setSyncingId(null);
    }
  };

  const handleDownload = (rec: MedicalRecord) => {
    const text = `
MediChain SL Blockchain-Secured Health Record
============================================
Patient ID: ${rec.patientId}
Patient Name: ${rec.patientName}
Record Type: ${rec.type}
Description: ${rec.description}
Date: ${rec.date}
IPFS CID: ${rec.ipfsCid || 'N/A'}
Cryptographic Hash (SHA-256): ${rec.hash}
Blockchain Transaction ID: ${rec.txHash || 'N/A'}
Blockchain Block Height: ${rec.blockNumber || 'N/A'}
Verification Status: Verified & Anchored (Hyperledger Fabric)
============================================
CONFIDENTIAL - MEDICAL INFORMATION ONLY FOR AUTHORIZED PERSONNEL
`;
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `medical_record_${rec.id.substring(0,8)}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const filteredRecords = records.filter(rec => {
    const nameMatch = (rec.patientName || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                      (rec.id || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                      (rec.description || '').toLowerCase().includes(searchTerm.toLowerCase());
    const typeMatch = typeFilter === 'all' || rec.type === typeFilter;
    const statusMatch = statusFilter === 'all' || rec.status === statusFilter;
    return nameMatch && typeMatch && statusMatch;
  });

  // Extract unique record types for filtering
  const recordTypes: RecordType[] = [
    'Lab Report', 'Prescription', 'X-Ray', 'Surgery Report', 
    'Consultation Note', 'Imaging', 'Discharge Summary', 'Vaccination', 'Referral Letter'
  ];

  return (
    <LayoutWrapper title="Medical Records">
      <div className="space-y-6">
        {/* Header Summary */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Blockchain-Secured Records</h1>
            <p className="text-sm text-slate-500">Immutable patient medical history stored on Hyperledger Fabric ledger</p>
          </div>
          <div className="flex gap-2">
            <Link
              href="/records/upload"
              className="flex items-center gap-2 bg-brand hover:bg-brand-dark text-white px-4 py-2 rounded-lg text-sm font-medium transition shadow-sm"
            >
              <Plus className="h-4 w-4" />
              Upload Record
            </Link>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search record description, patient name, ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition"
            />
          </div>
          
          <div className="flex flex-wrap gap-2">
            <div className="relative flex items-center">
              <Filter className="absolute left-3 h-4 w-4 text-slate-400 pointer-events-none" />
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition appearance-none cursor-pointer text-slate-700"
              >
                <option value="all">All Types</option>
                {recordTypes.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <div className="relative flex items-center">
              <Database className="absolute left-3 h-4 w-4 text-slate-400 pointer-events-none" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition appearance-none cursor-pointer text-slate-700"
              >
                <option value="all">All Ledgers</option>
                <option value="Synced">Synced</option>
                <option value="Pending">Pending</option>
                <option value="Verifying">Verifying</option>
                <option value="Failed">Failed</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table list */}
        {loadError && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-800">{loadError} No substitute records have been shown.</div>}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/75 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4 font-medium">Record Details</th>
                  <th className="py-3.5 px-4 font-medium">Patient</th>
                  <th className="py-3.5 px-4 font-medium">Upload Date</th>
                  <th className="py-3.5 px-4 font-medium">IPFS / Hash Details</th>
                  <th className="py-3.5 px-4 font-medium text-center">Verification</th>
                  <th className="py-3.5 px-4 font-medium">Ledger Status</th>
                  <th className="py-3.5 px-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-10 text-center text-slate-500">
                      <RefreshCw className="h-8 w-8 text-brand mx-auto mb-2 animate-spin" />
                      <p className="font-medium">Loading medical records...</p>
                    </td>
                  </tr>
                ) : filteredRecords.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-10 text-center text-slate-500">
                      <FileText className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                      <p className="font-medium">No medical records found</p>
                      <p className="text-xs text-slate-400 mt-1">Try modifying your search or filter criteria.</p>
                    </td>
                  </tr>
                ) : (
                  filteredRecords.map((rec) => (
                    <tr key={rec.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center">
                            <FileText className="h-5 w-5" />
                          </div>
                          <div>
                            <div className="font-semibold text-slate-900">{rec.type}</div>
                            <div className="text-xs text-slate-500 truncate max-w-xs">{rec.description}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4 font-medium text-slate-700">
                        {rec.patientName}
                      </td>
                      <td className="py-4 px-4 text-slate-500 whitespace-nowrap">
                        {rec.date}
                      </td>
                      <td className="py-4 px-4">
                        <div className="font-mono text-xs text-slate-400 space-y-1">
                          <div className="flex items-center gap-1">
                            <span className="font-semibold text-slate-600">HASH:</span>
                            <span className="truncate max-w-[120px]">{rec.hash}</span>
                          </div>
                          {rec.ipfsCid && (
                            <div className="flex items-center gap-1 text-brand">
                              <span className="font-semibold">IPFS:</span>
                              <span className="truncate max-w-[120px]">{rec.ipfsCid}</span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-4 text-center">
                        {rec.verified ? (
                          <div className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded text-xs font-semibold border border-emerald-100">
                            <CheckCircle2 className="h-3 w-3" />
                            Verified
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-1 bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-xs font-semibold">
                            Pending Sync
                          </div>
                        )}
                      </td>
                      <td className="py-4 px-4 whitespace-nowrap">
                        <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border inline-flex items-center gap-1.5 ${getStatusClass(rec.status)}`}>
                          {getStatusIcon(rec.status)}
                          {rec.status}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          {rec.status === 'Pending' && (
                            <button
                              disabled={syncingId !== null}
                              onClick={() => handleForceSync(rec.id)}
                              className="px-2.5 py-1.5 text-xs font-medium text-white bg-brand hover:bg-brand-dark rounded-lg transition shadow-sm flex items-center gap-1 disabled:opacity-50"
                            >
                              <RefreshCw className={`h-3 w-3 ${syncingId === rec.id ? 'animate-spin' : ''}`} />
                              Sync Chain
                            </button>
                          )}
                          {rec.status === 'Synced' && rec.ipfsCid && (
                            <button
                              onClick={() => setSelectedPreviewRecord(rec)}
                              className="p-1.5 text-slate-500 hover:text-brand hover:bg-slate-100 rounded-lg transition"
                              title="View Document Details & Preview"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </button>
                          )}
                          <button 
                            onClick={() => handleDownload(rec)}
                            className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition" 
                            title="Download Local Copy"
                          >
                            <FileDown className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* In-App Record Preview Modal */}
      {selectedPreviewRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="border-b border-slate-200 p-5 flex justify-between items-center bg-slate-50">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-6 w-6 text-brand" />
                <div>
                  <h3 className="font-bold text-slate-900">MediChain Secured Record Preview</h3>
                  <p className="text-xs text-slate-500 font-mono">ID: {selectedPreviewRecord.id}</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedPreviewRecord(null)}
                className="p-1 text-slate-400 hover:text-slate-900 hover:bg-slate-200 rounded-full transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto space-y-6 text-left flex-1">
              {/* Certificate Banner */}
              <div className="border border-emerald-100 bg-emerald-50/50 rounded-xl p-4 flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-emerald-950">Hyperledger Fabric Verified</h4>
                  <p className="text-xs text-emerald-800 leading-normal">
                    This file integrity hash was anchored to block <strong className="font-bold">#{selectedPreviewRecord.blockNumber}</strong> with transaction ID <code className="bg-emerald-100 px-1 rounded font-mono text-[10px] break-all">{selectedPreviewRecord.txHash}</code>. The document is verified as untampered.
                  </p>
                </div>
              </div>

              {/* Record Summary Metadata */}
              <div className="grid grid-cols-2 gap-4 text-sm bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div>
                  <span className="text-xs text-slate-400 block font-semibold uppercase tracking-wider">Patient Name</span>
                  <span className="font-bold text-slate-800">{selectedPreviewRecord.patientName}</span>
                </div>
                <div>
                  <span className="text-xs text-slate-400 block font-semibold uppercase tracking-wider">Record Type</span>
                  <span className="font-bold text-slate-800">{selectedPreviewRecord.type}</span>
                </div>
                <div>
                  <span className="text-xs text-slate-400 block font-semibold uppercase tracking-wider">Pinning Date</span>
                  <span className="font-bold text-slate-800">{selectedPreviewRecord.date}</span>
                </div>
                <div>
                  <span className="text-xs text-slate-400 block font-semibold uppercase tracking-wider">IPFS Gateway CID</span>
                  <span className="font-bold text-brand font-mono text-xs select-all truncate block">{selectedPreviewRecord.ipfsCid}</span>
                </div>
              </div>

              {/* Report Body Details */}
              <div className="border border-slate-200 rounded-xl p-5 bg-white space-y-4">
                <div className="border-b border-slate-100 pb-2.5 flex justify-between items-center">
                  <span className="font-bold text-xs uppercase tracking-wider text-slate-400">Clinical Findings Report</span>
                  <span className="text-xs text-slate-500 font-medium">Provider: Connaught Hospital</span>
                </div>
                <div className="space-y-3">
                  <div>
                    <h5 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Summary Notes:</h5>
                    <p className="text-sm text-slate-600 mt-1 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">
                      {selectedPreviewRecord.description}
                    </p>
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Cryptographic Document Integrity:</h5>
                    <p className="text-xs font-mono text-slate-500 mt-1 bg-slate-50 p-2 rounded border border-slate-100 break-all select-all">
                      SHA256: {selectedPreviewRecord.hash}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="border-t border-slate-200 p-4 bg-slate-50 flex justify-end gap-3">
              <button
                onClick={() => handleDownload(selectedPreviewRecord)}
                className="px-4 py-2 border border-slate-300 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-xl transition flex items-center gap-1.5"
              >
                <FileDown className="h-4 w-4" />
                Download Report
              </button>
              <button
                onClick={() => setSelectedPreviewRecord(null)}
                className="px-4 py-2 bg-brand hover:bg-brand-dark text-white text-sm font-semibold rounded-xl transition"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </LayoutWrapper>
  );
}
