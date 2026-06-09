'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import jsQR from 'jsqr';
import { LayoutWrapper } from '@/components/dashboard/layout-wrapper';
import { MOCK_PATIENTS } from '@/data/mockData';
import { backendApi } from '@/services/backendApi';
import { useAuth } from '@/hooks/useAuth';
import { 
  QrCode, Camera, ShieldCheck, Search, ArrowRight, 
  AlertCircle, RefreshCw, X, ShieldAlert, CheckCircle2, Loader2 
} from 'lucide-react';
import Link from 'next/link';
import type { Patient } from '@/types';

export default function ScanQRPage() {
  useAuth(); // Require authentication
  const router = useRouter();

  const [scanResult, setScanResult] = useState<string | null>(null);
  const [scannedPatient, setScannedPatient] = useState<Patient | null>(null);
  const [manualId, setManualId] = useState('');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [isLoadingCamera, setIsLoadingCamera] = useState(false);
  const [isResolving, setIsResolving] = useState(false);
  const [resolveError, setResolveError] = useState<string | null>(null);
  const [resolvedPatientId, setResolvedPatientId] = useState<string | null>(null);
  const [allowedCategories, setAllowedCategories] = useState<string[]>([]);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Stop camera feed
  const stopCamera = () => {
    setIsScanning(false);
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  // Start camera feed
  const startCamera = async () => {
    setCameraError(null);
    setIsLoadingCamera(true);
    setScanResult(null);
    setScannedPatient(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true'); // Required for iOS
        videoRef.current.play();
        setIsScanning(true);
        setIsLoadingCamera(false);
      }
    } catch (err) {
      console.error('Camera access error:', err);
      setCameraError('Unable to access camera. Please check permissions or select a manual patient ID below.');
      setIsLoadingCamera(false);
    }
  };

  // Scan frame by frame in animation loop
  useEffect(() => {
    if (!isScanning) return;

    const scanFrame = () => {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (!video || !canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx || video.readyState !== video.HAVE_ENOUGH_DATA) {
        animationFrameRef.current = requestAnimationFrame(scanFrame);
        return;
      }

      // Match canvas sizes
      canvas.height = video.videoHeight;
      canvas.width = video.videoWidth;

      // Draw current video frame to hidden canvas
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

      // Perform jsQR decode
      const code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: 'dontInvert'
      });

      if (code && code.data) {
        // Success match!
        console.log('QR Code Decoded:', code.data);
        handleQRDecoded(code.data);
        return; // Break scan loop
      }

      animationFrameRef.current = requestAnimationFrame(scanFrame);
    };

    animationFrameRef.current = requestAnimationFrame(scanFrame);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isScanning]);

  const resolveQROrId = async (raw: string) => {
    setIsResolving(true);
    setResolveError(null);
    setScannedPatient(null);
    setResolvedPatientId(null);

    // Try to parse as JSON QR payload first (MediChain format)
    let qrPayload: object | null = null;
    try {
      qrPayload = JSON.parse(raw);
    } catch {
      // Not JSON — might be a plain patientId or URL
    }

    if (qrPayload) {
      // --- Backend QR scan ---
      try {
        const response = await backendApi.scanQR(qrPayload);
        setResolvedPatientId(response.patientId);
        setAllowedCategories(response.allowedCategories || []);
        // Attempt to find in mock patients for display
        const mockMatch = MOCK_PATIENTS.find(p => p.id === response.patientId);
        setScannedPatient(mockMatch || null);
      } catch (err: any) {
        setResolveError(err.message || 'Could not resolve QR code with the backend.');
      }
    } else {
      // --- Plain ID or URL fallback ---
      const patientId = raw.includes('/') ? raw.split('/').pop() || '' : raw;
      const mockMatch = MOCK_PATIENTS.find(
        p =>
          (p.id || '').toLowerCase() === patientId.toLowerCase() ||
          (p.name || '').toLowerCase().includes(patientId.toLowerCase())
      );
      if (mockMatch) {
        setScannedPatient(mockMatch);
        setResolvedPatientId(mockMatch.id);
      } else {
        // Query backend for this patient as a fallback
        try {
          const detail = await backendApi.getPatientDetail(patientId);
          if (detail && detail.patient) {
            const reconstructed = {
              id: detail.patient.id,
              name: detail.patient.fullName,
              initials: (detail.patient.fullName || '')
                .split(' ')
                .map((n: string) => n.charAt(0))
                .join('')
                .slice(0, 2)
                .toUpperCase() || 'PT',
              age: new Date().getFullYear() - new Date(detail.patient.dob).getFullYear(),
              gender: 'Female', // fallback gender
              bloodType: detail.patient.bloodType || 'Unknown',
              phone: detail.patient.phone || 'N/A',
              emergencyContactName: 'None',
              allergies: detail.patient.allergies.map((a: any) => typeof a === 'string' ? a : a.name),
            };
            setScannedPatient(reconstructed as any);
            setResolvedPatientId(detail.patient.id);
          } else {
            setResolveError(`No patient found matching "${patientId}"`);
          }
        } catch (err: any) {
          setResolveError(err.message || `No patient found matching "${patientId}"`);
        }
      }
    }

    setIsResolving(false);
  };

  const handleQRDecoded = (decodedData: string) => {
    stopCamera();
    setScanResult(decodedData);
    resolveQROrId(decodedData);
  };

  const handleManualSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualId) return;
    stopCamera();
    setScanResult(manualId);
    resolveQROrId(manualId);
  };

  // Clean up streams on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  return (
    <LayoutWrapper title="Scan Patient QR">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header Title */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 font-display">Scan Medical Access Card</h1>
          <p className="text-sm text-slate-500">
            Scan a patient&apos;s physical or mobile QR card to establish secure credentials validation on-chain
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          
          {/* Left Panel: Camera scanner */}
          <div className="lg:col-span-3 space-y-4">
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col min-h-[380px]">
              
              {/* Box Header */}
              <div className="border-b border-slate-100 bg-slate-50/50 p-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Camera className="h-4.5 w-4.5 text-brand" />
                  <span className="text-sm font-semibold text-slate-700">Live Camera Feed</span>
                </div>
                {isScanning && (
                  <span className="flex items-center gap-1.5 text-xs text-brand font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 animate-pulse">
                    <span className="h-1.5 w-1.5 rounded-full bg-brand" />
                    Scanning
                  </span>
                )}
              </div>

              {/* Box Body */}
              <div className="flex-1 flex flex-col items-center justify-center p-6 relative bg-slate-950 min-h-[320px]">
                
                {/* Canvas needed by jsQR */}
                <canvas ref={canvasRef} className="hidden" />

                {isScanning ? (
                  <div className="relative w-full max-w-sm aspect-video sm:aspect-square bg-black rounded-lg overflow-hidden border border-slate-800">
                    <video 
                      ref={videoRef} 
                      className="w-full h-full object-cover"
                      muted
                      playsInline
                    />
                    
                    {/* Scanner Target Box Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="w-48 h-48 sm:w-60 sm:h-60 border-2 border-brand rounded-xl relative shadow-[0_0_0_9999px_rgba(0,0,0,0.5)]">
                        {/* Red Scanning Pulse Line */}
                        <div className="absolute left-0 w-full h-[2px] bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.8)] top-0 animate-[bounce_3s_infinite]" />
                        
                        {/* Corner designs */}
                        <div className="absolute top-[-2px] left-[-2px] w-6 h-6 border-t-4 border-l-4 border-brand rounded-tl-md" />
                        <div className="absolute top-[-2px] right-[-2px] w-6 h-6 border-t-4 border-r-4 border-brand rounded-tr-md" />
                        <div className="absolute bottom-[-2px] left-[-2px] w-6 h-6 border-b-4 border-l-4 border-brand rounded-bl-md" />
                        <div className="absolute bottom-[-2px] right-[-2px] w-6 h-6 border-b-4 border-r-4 border-brand rounded-br-md" />
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Call to Action to Start Scanner */
                  <div className="text-center space-y-4 max-w-sm py-8">
                    <div className="h-16 w-16 bg-slate-900 rounded-full flex items-center justify-center mx-auto border border-slate-800 text-slate-400">
                      <QrCode className="h-8 w-8" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-white">Camera Offline</h3>
                      <p className="text-xs text-slate-400 mt-1">
                        Start scanner to capture QR code credentials. Authenticated session credentials required.
                      </p>
                    </div>
                    <button
                      onClick={startCamera}
                      disabled={isLoadingCamera}
                      className="w-full py-2 bg-brand hover:bg-brand-dark text-white rounded-lg text-sm font-medium transition flex items-center justify-center gap-1.5 shadow-sm disabled:opacity-50"
                    >
                      {isLoadingCamera ? (
                        <>
                          <RefreshCw className="h-4 w-4 animate-spin" />
                          Initializing...
                        </>
                      ) : (
                        <>
                          <Camera className="h-4 w-4" />
                          Initialize Scanner Feed
                        </>
                      )}
                    </button>
                  </div>
                )}

                {/* Error Banner */}
                {cameraError && (
                  <div className="absolute bottom-4 left-4 right-4 bg-rose-950 border border-rose-900 text-rose-200 text-xs rounded-lg p-3 flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
                    <span>{cameraError}</span>
                  </div>
                )}
              </div>

              {/* Stop camera action */}
              {isScanning && (
                <div className="p-3 border-t border-slate-100 bg-slate-50 flex justify-center">
                  <button
                    onClick={stopCamera}
                    className="px-4 py-1.5 border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg transition"
                  >
                    Cancel Scan
                  </button>
                </div>
              )}
            </div>

            {/* Manual fallback input */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-3">
              <h3 className="text-sm font-bold text-slate-800">Or Search Patient Record Manually</h3>
              <form onSubmit={handleManualSearch} className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    placeholder="Enter Patient ID (e.g. P001, P002) or Name..."
                    value={manualId}
                    onChange={(e) => setManualId(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition text-slate-700"
                  />
                </div>
                <button
                  type="submit"
                  className="px-4 py-2 bg-brand hover:bg-brand-dark text-white rounded-lg text-sm font-medium transition shadow-sm"
                >
                  Query
                </button>
              </form>
            </div>
          </div>

          {/* Right Panel: Scanned results */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden h-full flex flex-col justify-between">
              
              <div className="border-b border-slate-100 bg-slate-50/50 p-4">
                <h3 className="text-sm font-bold text-slate-700">Ledger Decoded Output</h3>
              </div>

              {scanResult ? (
                /* Something scanned */
                <div className="p-6 flex-1 flex flex-col justify-between gap-6 animate-in fade-in duration-300">
                  <div className="space-y-4">
                    {/* Header info */}
                    <div className="flex items-center gap-2 text-xs text-brand bg-brand-light px-2.5 py-1 rounded-md font-semibold border border-emerald-100 self-start">
                      <ShieldCheck className="h-4 w-4" />
                      Fabric Verified Decryption Key
                    </div>

                    {isResolving ? (
                      <div className="flex flex-col items-center justify-center py-8 gap-3 text-slate-400">
                        <Loader2 className="h-8 w-8 animate-spin" />
                        <p className="text-xs">Verifying with backend...</p>
                      </div>
                    ) : resolveError ? (
                      /* Error resolving */
                      <div className="text-center py-6 space-y-3">
                        <ShieldAlert className="h-10 w-10 text-amber-500 mx-auto" />
                        <div className="space-y-1">
                          <h4 className="font-semibold text-slate-800">Unregistered Payload</h4>
                          <p className="text-xs text-slate-500">{resolveError}</p>
                        </div>
                        <div className="bg-slate-50 p-2.5 rounded font-mono text-[10px] text-slate-600 border border-slate-100">
                          {scanResult.slice(0, 80)}{scanResult.length > 80 ? '...' : ''}
                        </div>
                      </div>
                    ) : scannedPatient ? (
                      /* Matching Patient Found */
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <div className="h-12 w-12 rounded-full bg-brand-light text-brand font-bold text-lg flex items-center justify-center border border-emerald-100">
                            {scannedPatient.initials}
                          </div>
                          <div>
                            <h4 className="font-bold text-slate-900 text-lg">{scannedPatient.name}</h4>
                            <p className="text-xs text-slate-500">
                              Patient ID: <span className="font-semibold text-slate-700">{scannedPatient.id}</span>
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 text-xs border-t border-b border-slate-100 py-3.5">
                          <div>
                            <span className="block text-slate-400 font-medium">Age / Gender</span>
                            <span className="font-semibold text-slate-700">{scannedPatient.age} yrs • {scannedPatient.gender}</span>
                          </div>
                          <div>
                            <span className="block text-slate-400 font-medium">Blood Type</span>
                            <span className="font-semibold text-rose-600 font-bold text-sm">{scannedPatient.bloodType}</span>
                          </div>
                          <div>
                            <span className="block text-slate-400 font-medium">Emergency Contact</span>
                            <span className="font-semibold text-slate-700 truncate block">{scannedPatient.emergencyContactName}</span>
                          </div>
                          <div>
                            <span className="block text-slate-400 font-medium">Phone</span>
                            <span className="font-semibold text-slate-700">{scannedPatient.phone}</span>
                          </div>
                        </div>

                        {scannedPatient.allergies.length > 0 && (
                          <div className="space-y-1">
                            <span className="block text-[11px] text-slate-400 font-bold uppercase">Allergy Alert</span>
                            <div className="flex flex-wrap gap-1">
                              {scannedPatient.allergies.map(all => (
                                <span key={all} className="px-2 py-0.5 bg-rose-50 text-rose-700 text-[10px] font-bold rounded border border-rose-100">
                                  {all}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {allowedCategories.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {allowedCategories.map(cat => (
                              <span key={cat} className="px-2 py-0.5 bg-brand-light text-brand text-[10px] font-semibold rounded">
                                {cat}
                              </span>
                            ))}
                          </div>
                        )}

                        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-emerald-800 text-xs flex gap-2">
                          <CheckCircle2 className="h-4 w-4 shrink-0 text-brand mt-0.5" />
                          <span>
                            <strong>Access granted:</strong> Blockchain consent verified. Record access logged to Fabric ledger.
                          </span>
                        </div>
                      </div>
                    ) : (
                      /* resolvedPatientId exists but no mock patient — still navigate */
                      resolvedPatientId ? (
                        <div className="text-center py-6 space-y-3">
                          <CheckCircle2 className="h-10 w-10 text-brand mx-auto" />
                          <h4 className="font-semibold text-slate-800">Patient Verified</h4>
                          <p className="text-xs text-slate-500">Record resolved from backend ledger.</p>
                        </div>
                      ) : null
                    )}
                  </div>

                  {(scannedPatient || resolvedPatientId) && !isResolving && (
                    <Link
                      href={`/patients/${scannedPatient?.id || resolvedPatientId}`}
                      className="w-full py-2.5 bg-brand hover:bg-brand-dark text-white rounded-lg text-sm font-semibold transition flex items-center justify-center gap-1.5 shadow-sm mt-4"
                    >
                      View Complete Ledger Record
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  )}
                </div>
              ) : (
                /* Idle, nothing scanned */
                <div className="p-10 flex-1 flex flex-col items-center justify-center text-center text-slate-400">
                  <QrCode className="h-12 w-12 text-slate-300 mb-3" />
                  <p className="text-sm font-semibold text-slate-700">Awaiting Decoded Stream</p>
                  <p className="text-xs text-slate-400 mt-1 max-w-[200px]">
                    Once a valid medical QR code is scanned, the secure medical payload details will render here.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </LayoutWrapper>
  );
}
