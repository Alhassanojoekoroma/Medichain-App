'use client';

import { useState, useEffect } from 'react';
import { LayoutWrapper } from '@/components/dashboard/layout-wrapper';
import { useAuth } from '@/hooks/useAuth';
import { backendApi } from '@/services/backendApi';
import { 
  ShieldCheck, ShieldAlert, Clock, Search, Filter, 
  Check, X, RefreshCw, AlertCircle, FileText, Lock, Key, History, Database, User
} from 'lucide-react';

interface ConsentPolicy {
  id: string;
  patient_id: string;
  patient_name: string;
  grantee_type: string;
  grantee_id: string;
  access_type: string;
  data_categories: string[] | string;
  purpose: string;
  expires_at: string | null;
  created_at: string;
  is_one_time: boolean;
}

interface AuditLog {
  id: string;
  patientId: string;
  patientName: string;
  actorId: string;
  actorRole: string;
  actorName: string;
  clinicName: string;
  accessType: string;
  dataCategories: string[] | string;
  isEmergency: boolean;
  outcome: string;
  denialReason: string | null;
  createdAt: string;
  ledgerTxHash: string | null;
}

export default function AccessLogPage() {
  useAuth(); // Require authentication

  const [activeTab, setActiveTab] = useState<'consents' | 'ledger'>('consents');
  const [consents, setConsents] = useState<ConsentPolicy[]>([]);
  const [ledgerLogs, setLedgerLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [revokingId, setRevokingId] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [consentsRes, logsRes] = await Promise.all([
        backendApi.getClinicianConsents(),
        backendApi.getLedgerAccessLogs()
      ]);
      if (consentsRes.success) {
        setConsents(consentsRes.consents || []);
      }
      if (logsRes.success) {
        setLedgerLogs(logsRes.logs || []);
      }
    } catch (err: any) {
      console.error('Failed to load access logs or consents:', err);
      setError(err.message || 'Failed to fetch ledger logs and consents.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRevokeConsent = async (consentId: string) => {
    if (!confirm('Are you sure you want to revoke this patient access key? You will no longer be able to read their files.')) {
      return;
    }
    setRevokingId(consentId);
    try {
      const res = await backendApi.revokeConsent(consentId, 'Revoked by Doctor');
      if (res.success) {
        // Remove from list
        setConsents(prev => prev.filter(c => c.id !== consentId));
        // Refresh audit logs since revocation creates an audit trail event
        const logsRes = await backendApi.getLedgerAccessLogs();
        if (logsRes.success) {
          setLedgerLogs(logsRes.logs || []);
        }
      }
    } catch (err: any) {
      console.error('Failed to revoke consent:', err);
      alert(err.message || 'Failed to revoke consent.');
    } finally {
      setRevokingId(null);
    }
  };

  const handleForceSync = async () => {
    setSyncing(true);
    try {
      await backendApi.forceSync();
      // Refresh logs after synchronization
      const logsRes = await backendApi.getLedgerAccessLogs();
      if (logsRes.success) {
        setLedgerLogs(logsRes.logs || []);
      }
      alert('Hyperledger Fabric channel synchronized successfully.');
    } catch (err: any) {
      console.error('Sync failed:', err);
      alert('Synchronization failed: ' + err.message);
    } finally {
      setSyncing(false);
    }
  };

  // Filter lists based on search term
  const filteredConsents = consents.filter(c => 
    c.patient_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.patient_id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredLogs = ledgerLogs.filter(log => 
    log.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.accessType.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (log.ledgerTxHash || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const parseCategories = (cats: any): string[] => {
    if (!cats) return ['General'];
    if (typeof cats === 'string') {
      try {
        return JSON.parse(cats);
      } catch {
        return [cats];
      }
    }
    return cats;
  };

  return (
    <LayoutWrapper title="Access Logs &amp; Keys">
      <div className="space-y-6">
        
        {/* Header Summary */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Distributed Ledger Access Logs</h1>
            <p className="text-sm text-slate-500">Monitor active access keys and verify cryptographically anchored event logs.</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleForceSync}
              disabled={syncing}
              className="px-3.5 py-2 border border-slate-200 hover:bg-slate-50 disabled:bg-slate-100 disabled:text-slate-400 text-slate-700 text-xs font-semibold rounded-lg transition inline-flex items-center gap-1.5 shadow-sm"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${syncing ? 'animate-spin' : ''}`} />
              Force Fabric Sync
            </button>
            <div className="bg-amber-50 border border-amber-200 rounded-lg py-2 px-3 text-xs text-amber-800 flex items-center gap-2 max-w-sm">
              <AlertCircle className="h-4 w-4 text-amber-600 shrink-0" />
              <span>Fabric audit entries are immutable and sign-verified.</span>
            </div>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-slate-200 bg-slate-50/50 p-1 rounded-lg">
          <button
            onClick={() => { setActiveTab('consents'); setSearchTerm(''); }}
            className={`flex-1 py-2 px-4 text-sm font-semibold rounded-md transition flex items-center justify-center gap-2 ${
              activeTab === 'consents' 
                ? 'bg-white text-brand shadow-sm border border-slate-200' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Key className="h-4 w-4" />
            Active Record Access Keys ({consents.length})
          </button>
          <button
            onClick={() => { setActiveTab('ledger'); setSearchTerm(''); }}
            className={`flex-1 py-2 px-4 text-sm font-semibold rounded-md transition flex items-center justify-center gap-2 ${
              activeTab === 'ledger' 
                ? 'bg-white text-brand shadow-sm border border-slate-200' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <History className="h-4 w-4" />
            Distributed Ledger Activity Trail ({ledgerLogs.length})
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder={
                activeTab === 'consents' 
                  ? "Search patient name, key reference ID..." 
                  : "Search patient name, transaction hash, action..."
              }
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition text-slate-700"
            />
          </div>
          <button
            onClick={fetchData}
            className="p-2 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 transition text-slate-600"
            title="Refresh Data"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 text-sm text-rose-800 flex items-start gap-2">
            <ShieldAlert className="h-5 w-5 text-rose-650 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Failed to load ledger records</p>
              <p className="text-xs text-rose-600">{error}</p>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-12 text-center text-slate-500">
            <RefreshCw className="h-8 w-8 animate-spin text-brand mx-auto mb-3" />
            <p className="font-medium text-sm">Querying Hyperledger Fabric peer node state...</p>
          </div>
        ) : (
          /* Active Access Keys Tab */
          activeTab === 'consents' ? (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden animate-in fade-in duration-200">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/75 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      <th className="py-3.5 px-4 font-medium">Key Policy Reference</th>
                      <th className="py-3.5 px-4 font-medium">Patient Details</th>
                      <th className="py-3.5 px-4 font-medium">Granted To</th>
                      <th className="py-3.5 px-4 font-medium">Allowed Categories</th>
                      <th className="py-3.5 px-4 font-medium">Purpose</th>
                      <th className="py-3.5 px-4 font-medium">Expiration</th>
                      <th className="py-3.5 px-4 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    {filteredConsents.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-10 text-center text-slate-500">
                          <Lock className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                          <p className="font-semibold">No active access keys matching your criteria</p>
                        </td>
                      </tr>
                    ) : (
                      filteredConsents.map((policy) => (
                        <tr key={policy.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="py-4 px-4 font-mono font-semibold text-xs text-slate-400">
                            {policy.id.substring(0, 18)}...
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-2.5">
                              <div className="h-8 w-8 rounded-full bg-indigo-50 text-indigo-600 text-xs font-bold flex items-center justify-center border border-indigo-100">
                                {policy.patient_name.split(' ').map(n=>n[0]).join('').substring(0,2).toUpperCase()}
                              </div>
                              <div>
                                <div className="font-semibold text-slate-900">{policy.patient_name}</div>
                                <div className="text-[10px] text-slate-400">ID: {policy.patient_id.substring(0, 18)}...</div>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold capitalize border ${
                              policy.grantee_type === 'clinic'
                                ? 'bg-amber-50 text-amber-700 border-amber-100'
                                : 'bg-blue-50 text-blue-700 border-blue-100'
                            }`}>
                              {policy.grantee_type}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex flex-wrap gap-1 max-w-[200px]">
                              {parseCategories(policy.data_categories).map((cat) => (
                                <span key={cat} className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px] font-medium border border-slate-200">
                                  <FileText className="h-2.5 w-2.5" />
                                  {cat}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="py-4 px-4 text-xs text-slate-600">
                            {policy.purpose || 'Clinical consultation'}
                          </td>
                          <td className="py-4 px-4 text-xs text-slate-500">
                            {policy.expires_at ? new Date(policy.expires_at).toLocaleString() : 'Never Expires'}
                          </td>
                          <td className="py-4 px-4 text-right">
                            {revokingId === policy.id ? (
                              <span className="text-xs text-slate-400 inline-flex items-center gap-1 font-semibold">
                                <RefreshCw className="h-3 w-3 animate-spin text-rose-500" />
                                Revoking...
                              </span>
                            ) : (
                              <button
                                onClick={() => handleRevokeConsent(policy.id)}
                                className="px-2.5 py-1.5 text-xs font-semibold border border-rose-200 text-rose-600 hover:bg-rose-50 rounded-lg transition"
                              >
                                Revoke Key
                              </button>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            /* Ledger activity logs */
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden animate-in fade-in duration-200">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/75 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      <th className="py-3.5 px-4 font-medium">Fabric Tx ID / Signature</th>
                      <th className="py-3.5 px-4 font-medium">Timestamp</th>
                      <th className="py-3.5 px-4 font-medium">Patient</th>
                      <th className="py-3.5 px-4 font-medium">Action Performed</th>
                      <th className="py-3.5 px-4 font-medium">Actor Credentials</th>
                      <th className="py-3.5 px-4 font-medium">categories</th>
                      <th className="py-3.5 px-4 font-medium text-right">Ledger Outcome</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    {filteredLogs.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-10 text-center text-slate-500">
                          <Database className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                          <p className="font-semibold">No blockchain audit events matching criteria</p>
                        </td>
                      </tr>
                    ) : (
                      filteredLogs.map((log) => (
                        <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="py-4 px-4 font-mono text-[10px] text-slate-500">
                            {log.ledgerTxHash ? (
                              <div className="space-y-0.5">
                                <span className="block font-bold text-emerald-700 text-[8px] bg-emerald-50 border border-emerald-100 px-1 py-0.5 rounded w-max">ANCHOURED</span>
                                <span className="select-all block text-slate-400 font-medium">{log.ledgerTxHash.substring(0, 18)}...</span>
                              </div>
                            ) : (
                              <div className="space-y-0.5">
                                <span className="block font-bold text-amber-700 text-[8px] bg-amber-50 border border-amber-100 px-1 py-0.5 rounded w-max">OFFLINE QUEUE</span>
                                <span className="select-all block text-slate-400 font-medium">0x{log.id.replace(/-/g, '').substring(0, 16)}</span>
                              </div>
                            )}
                          </td>
                          <td className="py-4 px-4 text-xs text-slate-500 whitespace-nowrap">
                            {new Date(log.createdAt).toLocaleDateString()}
                            <span className="text-[10px] block text-slate-400">{new Date(log.createdAt).toLocaleTimeString()}</span>
                          </td>
                          <td className="py-4 px-4 font-semibold text-slate-900">
                            {log.patientName}
                          </td>
                          <td className="py-4 px-4">
                            <span className="font-medium text-slate-700 capitalize">
                              {log.accessType.replace(/_/g, ' ')}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <div className="text-xs text-slate-700">
                              <span className="font-semibold block">{log.actorName || 'Clinical Personnel'}</span>
                              <span className="text-[10px] text-slate-400 capitalize">{log.actorRole} @ {log.clinicName || 'Unknown Hospital'}</span>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex flex-wrap gap-1 max-w-[150px]">
                              {parseCategories(log.dataCategories).map((cat) => (
                                <span key={cat} className="px-1.5 py-0.5 bg-slate-50 text-slate-550 border border-slate-200 rounded text-[9px]">
                                  {cat}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="py-4 px-4 text-right">
                            <span className={`px-2 py-0.5 text-xs font-semibold rounded-full border inline-flex items-center gap-1 ${
                              log.outcome === 'granted'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                                : 'bg-rose-50 text-rose-700 border-rose-100'
                            }`}>
                              {log.outcome === 'granted' ? <ShieldCheck className="h-3 w-3" /> : <ShieldAlert className="h-3 w-3" />}
                              {log.outcome === 'granted' ? 'Access Granted' : 'Access Denied'}
                            </span>
                            {log.denialReason && (
                              <span className="block text-[10px] text-rose-550 italic mt-0.5">{log.denialReason}</span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )
        )}
      </div>
    </LayoutWrapper>
  );
}
