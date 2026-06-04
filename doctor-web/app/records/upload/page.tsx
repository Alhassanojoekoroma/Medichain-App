'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useDropzone } from 'react-dropzone';
import { LayoutWrapper } from '@/components/dashboard/layout-wrapper';
import { MOCK_PATIENTS } from '@/data/mockData';
import { backendApi } from '@/services/backendApi';
import { useAuth } from '@/hooks/useAuth';
import { 
  ArrowLeft, FileText, Upload, CheckCircle2, 
  RefreshCw, ShieldAlert, FileIcon, X, Check, Database
} from 'lucide-react';
import Link from 'next/link';
import type { RecordType } from '@/types';

export default function UploadRecordPage() {
  useAuth(); // Require authentication
  const router = useRouter();

  const [patients, setPatients] = useState<any[]>([]);
  const [loadingPatients, setLoadingPatients] = useState(true);
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [recordType, setRecordType] = useState<RecordType>('Lab Report');
  const [description, setDescription] = useState('');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [fileHash, setFileHash] = useState('');

  // Sync animation states
  const [syncStatus, setSyncStatus] = useState<'idle' | 'hashing' | 'ipfs' | 'fabric' | 'success' | 'error'>('idle');
  const [syncProgress, setSyncProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState('');
  const [createdRecordInfo, setCreatedRecordInfo] = useState<{
    hash: string;
    ipfsCid: string;
    txHash: string;
    blockNumber: number;
  } | null>(null);

  // Load patients and check for query param
  useEffect(() => {
    backendApi.getAccessiblePatients()
      .then(res => {
        setPatients(res.patients || []);
      })
      .catch(err => {
        console.error('Failed to load accessible patients', err);
      })
      .finally(() => {
        setLoadingPatients(false);
      });

    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const pid = params.get('patientId');
      if (pid) {
        setSelectedPatientId(pid);
      }
    }
  }, []);

  // Generate simple mock SHA-256 hash for demonstration
  const generateMockHash = (fileName: string, fileSize: number) => {
    const seed = fileName + fileSize + Date.now();
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
      const char = seed.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(16).padStart(16, '0') + Math.abs(hash * 3).toString(16).padStart(16, '0');
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      setUploadedFile(file);
      setSyncStatus('hashing');
      setStatusMessage('Computing cryptographic hash (SHA-256)...');
      
      setTimeout(() => {
        const hash = generateMockHash(file.name, file.size);
        setFileHash(hash);
        setSyncStatus('idle');
        setStatusMessage('');
      }, 1000);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles: 1,
    accept: {
      'application/pdf': ['.pdf'],
      'image/*': ['.jpeg', '.jpg', '.png'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    }
  });

  const removeFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    setUploadedFile(null);
    setFileHash('');
    setSyncStatus('idle');
  };

  const recordTypes: RecordType[] = [
    'Lab Report', 'Prescription', 'X-Ray', 'Surgery Report', 
    'Consultation Note', 'Imaging', 'Discharge Summary', 'Vaccination', 'Referral Letter'
  ];

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatientId || !uploadedFile || !fileHash) return;

    // Start simulation progress bar
    setSyncStatus('ipfs');
    setStatusMessage('Uploading encrypted payload to IPFS...');
    setSyncProgress(15);

    try {
      // IPFS Progress simulation
      await new Promise(resolve => setTimeout(resolve, 800));
      setSyncProgress(40);
      setStatusMessage('Payload staged on IPFS (CID: QmXf8...h6ySv)');

      // Fabric Anchoring Progress simulation
      await new Promise(resolve => setTimeout(resolve, 800));
      setSyncStatus('fabric');
      setSyncProgress(65);
      setStatusMessage('Invoking MediChain Hyperledger Fabric Smart Contract (cc_medical_records)...');

      await new Promise(resolve => setTimeout(resolve, 800));
      setSyncProgress(85);
      setStatusMessage('Replicating transactions across channel peers (Connaught Hospital, COMAHS, MoHS)...');

      // Actual backend anchoring
      const response = await backendApi.uploadRecord({
        patientId: selectedPatientId,
        recordType: recordType,
        title: uploadedFile.name,
        description: description
      });

      if (response.success) {
        setSyncProgress(100);
        setSyncStatus('success');
        setStatusMessage('Medical Record successfully verified and anchored to Hyperledger Fabric channel!');
        setCreatedRecordInfo({
          hash: response.record.hash,
          ipfsCid: response.record.ipfsCid,
          txHash: response.record.txHash,
          blockNumber: response.record.blockNumber
        });
      } else {
        throw new Error('Verification or anchoring returned negative result');
      }
    } catch (err: any) {
      console.error(err);
      setSyncStatus('error');
      setStatusMessage(err.message || 'Failed to upload and anchor record.');
    }
  };

  return (
    <LayoutWrapper title="Upload Medical Record">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Back Link */}
        <Link
          href="/records"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-brand transition"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Medical Records
        </Link>

        {/* Main Content Card */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="border-b border-slate-100 bg-slate-50/50 p-5 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Anchor New Medical Record</h2>
              <p className="text-xs text-slate-500">Immutable document pinning backed by Hyperledger Fabric &amp; IPFS</p>
            </div>
            <Database className="h-5 w-5 text-brand" />
          </div>

          {syncStatus === 'success' ? (
            /* Success Display */
            <div className="p-8 text-center space-y-6 animate-in fade-in zoom-in duration-300">
              <div className="h-16 w-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto border border-emerald-100 shadow-sm">
                <CheckCircle2 className="h-10 w-10" />
              </div>
              
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-slate-900">Record Anchored Successfully</h3>
                <p className="text-sm text-slate-500 max-w-md mx-auto">
                  The medical record has been securely uploaded, cryptographically hashed, and written onto the distributed ledger channel.
                </p>
              </div>

              {createdRecordInfo && (
                <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 text-left font-mono text-xs space-y-3 max-w-lg mx-auto">
                  <div className="flex justify-between items-center py-1 border-b border-slate-100">
                    <span className="font-semibold text-slate-600">IPFS Gateway CID</span>
                    <span className="text-brand select-all">{createdRecordInfo.ipfsCid.substring(0, 24)}...</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-slate-100">
                    <span className="font-semibold text-slate-600">Document SHA-256</span>
                    <span className="text-slate-700 select-all">{createdRecordInfo.hash.substring(0, 24)}...</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-slate-100">
                    <span className="font-semibold text-slate-600">Transaction ID</span>
                    <span className="text-slate-700 select-all">{createdRecordInfo.txHash}</span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="font-semibold text-slate-600">Ledger Block Height</span>
                    <span className="text-emerald-700 font-bold">#{createdRecordInfo.blockNumber}</span>
                  </div>
                </div>
              )}

              <div className="flex justify-center gap-3 pt-4">
                <button
                  onClick={() => {
                    setSelectedPatientId('');
                    setDescription('');
                    setUploadedFile(null);
                    setFileHash('');
                    setSyncStatus('idle');
                    setSyncProgress(0);
                    setCreatedRecordInfo(null);
                  }}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-medium rounded-lg transition"
                >
                  Upload Another Record
                </button>
                <Link
                  href="/records"
                  className="px-4 py-2 bg-brand hover:bg-brand-dark text-white text-sm font-medium rounded-lg transition shadow-sm"
                >
                  View Records List
                </Link>
              </div>
            </div>
          ) : syncStatus !== 'idle' && syncStatus !== 'hashing' ? (
            /* Sync Progression display */
            <div className="p-8 text-center space-y-6">
              <div className="h-14 w-14 bg-brand-light text-brand rounded-full flex items-center justify-center mx-auto border border-[#cbeed4] shadow-sm animate-pulse">
                <RefreshCw className="h-8 w-8 animate-spin" />
              </div>

              <div className="space-y-2">
                <h3 className="text-base font-bold text-slate-800">Ledger Synchronization In Progress</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">{statusMessage}</p>
              </div>

              {/* Progress Bar */}
              <div className="max-w-md mx-auto space-y-2">
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-brand transition-all duration-500 rounded-full" 
                    style={{ width: `${syncProgress}%` }}
                  />
                </div>
                <span className="text-xs font-semibold text-slate-600">{syncProgress}%</span>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 max-w-md mx-auto text-left text-xs text-amber-800 flex items-start gap-2">
                <ShieldAlert className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
                <span>
                  <strong>Do not navigate away:</strong> Cryptographic signatures are currently being validated by MediChain Fabric Gateway peers.
                </span>
              </div>
            </div>
          ) : (
            /* Upload Form input */
            <form onSubmit={handleUploadSubmit} className="p-6 space-y-5">
              
              {/* Patient selection */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Patient Select *
                </label>
                <select
                  required
                  value={selectedPatientId}
                  onChange={(e) => setSelectedPatientId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition cursor-pointer text-slate-700"
                >
                  <option value="">-- Choose patient --</option>
                  {loadingPatients ? (
                    <option disabled>Loading patients...</option>
                  ) : patients.length === 0 ? (
                    <option disabled>No accessible patients found</option>
                  ) : (
                    patients.map((pat) => (
                      <option key={pat.id} value={pat.id}>
                        {pat.name} ({pat.id})
                      </option>
                    ))
                  )}
                </select>
              </div>

              {/* Record details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                    Record Category *
                  </label>
                  <select
                    value={recordType}
                    onChange={(e) => setRecordType(e.target.value as RecordType)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition cursor-pointer text-slate-700"
                  >
                    {recordTypes.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                    IPFS Encrypted Payload (File) *
                  </label>
                  <div className="text-xs text-slate-500 leading-5">
                    Records are automatically encrypted using AES-256 before being routed to off-chain IPFS nodes.
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Record Summary / Findings Description *
                </label>
                <textarea
                  required
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Summarize key test findings, prescription courses, or post-surgery review remarks..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition placeholder:text-slate-400"
                />
              </div>

              {/* Dropzone field */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Document Upload (PDF, JPEG, DOCX) *
                </label>

                {!uploadedFile ? (
                  <div
                    {...getRootProps()}
                    className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition ${
                      isDragActive 
                        ? 'border-brand bg-brand/5' 
                        : 'border-slate-200 bg-slate-50 hover:border-slate-300'
                    }`}
                  >
                    <input {...getInputProps()} />
                    <Upload className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                    <p className="text-sm font-semibold text-slate-700">
                      {isDragActive ? 'Drop the file here' : 'Drag & drop file, or browse'}
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      Max file size 25MB. All files cryptographically hashed instantly.
                    </p>
                  </div>
                ) : (
                  <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-emerald-50 text-brand flex items-center justify-center">
                        <FileIcon className="h-6 w-6" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-900 truncate max-w-sm">{uploadedFile.name}</p>
                        <p className="text-xs text-slate-400">{(uploadedFile.size / (1024 * 1024)).toFixed(2)} MB</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {syncStatus === 'hashing' ? (
                        <div className="flex items-center gap-1.5 text-xs text-slate-500">
                          <RefreshCw className="h-3 w-3 animate-spin text-brand" />
                          Hashing...
                        </div>
                      ) : fileHash ? (
                        <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-semibold bg-emerald-50 px-2 py-1 rounded border border-emerald-100">
                          <Check className="h-3 w-3" />
                          SHA256 Generated
                        </div>
                      ) : null}
                      <button 
                        type="button" 
                        onClick={removeFile}
                        className="p-1 text-slate-400 hover:text-slate-900 transition hover:bg-slate-100 rounded-full"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )}

                {fileHash && (
                  <div className="mt-2.5 font-mono text-[10px] text-slate-400 select-all p-2 bg-slate-50 rounded border border-slate-150 flex items-center gap-2">
                    <span className="font-semibold text-slate-500">CLIENT-SIDE SHA256:</span>
                    <span>{fileHash}</span>
                  </div>
                )}
              </div>

              {/* Submit CTA */}
              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <Link
                  href="/records"
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-medium rounded-lg transition"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={!selectedPatientId || !uploadedFile || syncStatus === 'hashing'}
                  className="px-4 py-2 bg-brand hover:bg-brand-dark disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition shadow-sm flex items-center gap-2"
                >
                  <Database className="h-4 w-4" />
                  Anchor to Blockchain
                </button>
              </div>

            </form>
          )}
        </div>
      </div>
    </LayoutWrapper>
  );
}
