'use client';

import { useState, useEffect } from 'react';
import { AlertTriangle, Database, RefreshCw } from 'lucide-react';
import { MOCK_DRUG_ALERTS, MOCK_BLOCKCHAIN_STATUS } from '@/data/mockData';
import { useRouter } from 'next/navigation';
import { backendApi } from '@/services/backendApi';

export function OverviewCards() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState('');

  useEffect(() => {
    setMounted(true);
  }, []);

  const lastSyncTime = mounted && MOCK_BLOCKCHAIN_STATUS.lastSync
    ? new Date(MOCK_BLOCKCHAIN_STATUS.lastSync).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : '...';

  const handleForceSync = async () => {
    setIsSyncing(true);
    setSyncMessage('Broadcasting offline queue to peer consensus nodes...');
    try {
      await backendApi.forceSync();
      setSyncMessage('Consensus reached! Fabric ledger synchronized.');
      setTimeout(() => {
        setSyncMessage('');
      }, 3500);
    } catch (err: any) {
      console.error(err);
      setSyncMessage(err.message || 'Sync failed: Peer channel timeout.');
      setTimeout(() => {
        setSyncMessage('');
      }, 4000);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
      {/* Drug Interaction Alerts */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#D8DCE8]">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-7 h-7 bg-[#FEF0EB] rounded-lg flex items-center justify-center">
            <AlertTriangle className="w-4 h-4 text-[#FA6E3C]" />
          </div>
          <h3 className="text-sm sm:text-base font-semibold text-[#101326]">Drug Interaction Alerts</h3>
          <span className="ml-auto bg-[#FEF0EB] text-[#FA6E3C] text-xs font-bold px-2 py-0.5 rounded-full">
            {MOCK_DRUG_ALERTS.length}
          </span>
        </div>
        <div className="space-y-2">
          {MOCK_DRUG_ALERTS.map(alert => (
            <button
              key={alert.id}
              onClick={() => router.push(`/patients/${alert.patientId}`)}
              className="w-full flex items-start gap-3 p-3 bg-[#FFFBF9] border border-[#FDE8DC] rounded-xl hover:border-[#FA6E3C] transition-colors text-left"
            >
              <span className={`text-xs font-bold px-2 py-1 rounded-full flex-shrink-0 ${
                alert.severity === 'High' ? 'bg-[#FEE2E2] text-[#E53E3E]' : 'bg-[#FFF3E6] text-[#FA6E3C]'
              }`}>
                {alert.severity}
              </span>
              <div>
                <p className="text-xs font-semibold text-[#101326]">{alert.patientName}</p>
                <p className="text-xs text-[#8C91A8]">{alert.drug1} + {alert.drug2}</p>
                <p className="text-xs text-[#5D6582] mt-0.5">{alert.description}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Blockchain Health */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#D8DCE8]">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-7 h-7 bg-brand-light rounded-lg flex items-center justify-center">
            <Database className="w-4 h-4 text-brand" />
          </div>
          <h3 className="text-sm font-semibold text-[#101326]">Blockchain Health</h3>
          <div className="ml-auto flex items-center gap-1.5">
            <div className="w-2 h-2 bg-brand rounded-full animate-pulse" />
            <span className="text-xs text-brand font-medium">Live</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-brand-light rounded-xl p-3">
            <p className="text-xs text-[#8C91A8]">Total Records</p>
            <p className="text-2xl font-bold text-brand">{MOCK_BLOCKCHAIN_STATUS.totalRecords}</p>
          </div>
          <div className="bg-[#FFF3E6] rounded-xl p-3">
            <p className="text-xs text-[#8C91A8]">Pending Sync</p>
            <p className="text-2xl font-bold text-[#FA6E3C]">{MOCK_BLOCKCHAIN_STATUS.pendingTx}</p>
          </div>
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[#8C91A8]">Network</span>
            <span className="font-medium text-[#101326]">{MOCK_BLOCKCHAIN_STATUS.network}</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-[#8C91A8]">Enrolled As</span>
            <span className="font-medium text-[#101326] truncate max-w-[160px]">{MOCK_BLOCKCHAIN_STATUS.fabricId}</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-[#8C91A8]">Last Sync</span>
            <span className="font-medium text-[#101326]">{lastSyncTime}</span>
          </div>
        </div>

        <button 
          onClick={handleForceSync}
          disabled={isSyncing}
          className="w-full bg-brand hover:bg-brand-dark disabled:bg-[#d8eddcf2] disabled:text-brand disabled:cursor-not-allowed text-white rounded-full py-2.5 text-sm font-semibold transition-colors flex items-center justify-center gap-2 shadow-sm"
        >
          {isSyncing ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin text-brand" />
              Syncing Ledger...
            </>
          ) : (
            'Force Sync Now'
          )}
        </button>
        {syncMessage && (
          <p className="text-[10px] text-center font-bold text-slate-500 mt-2 uppercase tracking-wider animate-pulse">
            {syncMessage}
          </p>
        )}
      </div>
    </div>
  );
}
