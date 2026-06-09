'use client';

import { useState } from 'react';
import ProtectedRoute from '@/components/shared/ProtectedRoute';
import { Sidebar } from '@/components/dashboard/sidebar';
import { MobileMenuButton } from '@/components/dashboard/sidebar';
import { Header } from '@/components/dashboard/header';
import { MOCK_REGIONAL_STATS, MOCK_DRUG_DISTRIBUTION, MOCK_DISEASE_STATS } from '@/data/mockData';
import { FileDown, Calendar, Database, ShieldCheck, CheckCircle2 } from 'lucide-react';

export default function GovernmentReports() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [reportsLog, setReportsLog] = useState([
    { name: 'National Malaria Watch May 2026.csv', date: '2026-06-01', size: '12 KB', status: 'Completed', by: 'CA-MOHS-Rep-01' },
    { name: 'Western Area Triage Volume Q1.csv', date: '2026-05-15', size: '24 KB', status: 'Completed', by: 'CA-MOHS-Rep-01' },
    { name: 'Drug Shipments Audit Connaught.csv', date: '2026-05-10', size: '8 KB', status: 'Completed', by: 'CA-MOHS-Rep-01' },
  ]);

  const downloadCSV = (filename: string, content: string) => {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Add to log
    const newLog = {
      name: filename,
      date: new Date().toISOString().split('T')[0],
      size: `${Math.round(content.length / 1024)} KB`,
      status: 'Completed',
      by: 'CA-MOHS-Rep-01'
    };
    setReportsLog(prev => [newLog, ...prev]);
  };

  const exportDiseaseStats = () => {
    let csv = 'Disease,Registered Cases,Prevalence Change (%),Trend Direction\n';
    MOCK_DISEASE_STATS.forEach(d => {
      csv += `"${d.disease}",${d.cases},${d.change}%,"${d.trend}"\n`;
    });
    downloadCSV('Epidemiological_Disease_Stats.csv', csv);
  };

  const exportDrugDistribution = () => {
    let csv = 'Medicine,Hospital Facility,Quantity Shipped,Shipment Date,Region,Status,Fabric TxID,Fabric Block\n';
    MOCK_DRUG_DISTRIBUTION.forEach(d => {
      csv += `"${d.drug}","${d.hospital}",${d.qty},"${d.date}","${d.region}","${d.status}","${d.txId || 'N/A'}",${d.blockNumber || 'N/A'}\n`;
    });
    downloadCSV('Pharmaceutical_Ledger_Distribution.csv', csv);
  };

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
                  <h1 className="text-2xl font-bold tracking-tight text-slate-900 font-display">Public Health Reports Log</h1>
                  <p className="text-sm text-slate-500">
                    Compile and export public health statistics and ledger-anchored supply logs into verified CSV files.
                  </p>
                </div>

                {/* Export Control Panel */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white rounded-2xl p-6 border border-[#D8DCE8] shadow-sm flex flex-col justify-between space-y-4 text-left">
                    <div className="space-y-2">
                      <div className="w-10 h-10 bg-sky-50 rounded-xl flex items-center justify-center">
                        <Database className="w-5 h-5 text-[#0284c7]" />
                      </div>
                      <h3 className="font-bold text-slate-900 text-sm">Epidemiological Prevalence Report</h3>
                      <p className="text-xs text-slate-500">
                        Compiles national infection statistics including Malaria, Typhoid, and Cholera workloads. No PII is included in the output.
                      </p>
                    </div>
                    <button
                      onClick={exportDiseaseStats}
                      className="w-full py-2 bg-[#0284c7] hover:bg-[#026c9e] text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm"
                    >
                      <FileDown className="w-4 h-4" />
                      Generate and Download CSV
                    </button>
                  </div>

                  <div className="bg-white rounded-2xl p-6 border border-[#D8DCE8] shadow-sm flex flex-col justify-between space-y-4 text-left">
                    <div className="space-y-2">
                      <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      </div>
                      <h3 className="font-bold text-slate-900 text-sm">Drug Distribution Audit Ledger</h3>
                      <p className="text-xs text-slate-500">
                        Extracts pharmaceutical logistics commits anchored on the blockchain. Includes transaction IDs and block indices.
                      </p>
                    </div>
                    <button
                      onClick={exportDrugDistribution}
                      className="w-full py-2 bg-[#0284c7] hover:bg-[#026c9e] text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm"
                    >
                      <FileDown className="w-4 h-4" />
                      Generate and Download CSV
                    </button>
                  </div>
                </div>

                {/* Reports Generation Log Table */}
                <div className="bg-white rounded-2xl border border-[#D8DCE8] shadow-sm overflow-hidden">
                  <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                    <h3 className="font-bold text-slate-900 text-sm">Report Generation History</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead>
                        <tr className="bg-slate-50 text-slate-400 text-xs font-bold uppercase border-b border-slate-100">
                          <th className="py-3 px-4">Filename</th>
                          <th className="py-3 px-4">Date Compiled</th>
                          <th className="py-3 px-4">File Size</th>
                          <th className="py-3 px-4">Enrolled Authority</th>
                          <th className="py-3 px-4 text-right">Ledger Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {reportsLog.map((log, i) => (
                          <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                            <td className="py-3.5 px-4 font-semibold text-slate-900 flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-slate-400" />
                              {log.name}
                            </td>
                            <td className="py-3.5 px-4 text-slate-500">{log.date}</td>
                            <td className="py-3.5 px-4 font-bold text-slate-600">{log.size}</td>
                            <td className="py-3.5 px-4 font-mono text-[10px] text-slate-500">{log.by}</td>
                            <td className="py-3.5 px-4 text-right">
                              <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded text-[10px] font-bold border border-emerald-100">
                                <ShieldCheck className="w-3 h-3" />
                                {log.status}
                              </span>
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
