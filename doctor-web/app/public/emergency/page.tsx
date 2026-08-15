'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { 
  Heart, AlertTriangle, ShieldCheck, Phone, 
  MapPin, User, ShieldAlert, Award, FileText, Loader2, ArrowLeft, Pill, Activity, ShieldCheck as VerifiedIcon
} from 'lucide-react';
import Link from 'next/link';
import { backendApi } from '@/services/backendApi';

// ─── Emergency Profile Resolver Component ─────────────────────────────────────
function EmergencyProfileContent() {
  const searchParams = useSearchParams();
  const tokenStr = searchParams.get('token');

  const tokenError = tokenStr ? null : 'No emergency access token provided in URL.';
  const [loading, setLoading] = useState<boolean>(!tokenError);
  const [error, setError] = useState<string | null>(tokenError);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    if (!tokenStr) return;

    const loadProfile = async () => {
      let parsedPayload: any = null;

      try {
        parsedPayload = JSON.parse(decodeURIComponent(tokenStr));
      } catch {
        try {
          parsedPayload = JSON.parse(tokenStr);
        } catch {
          setError('The emergency access token is malformed.');
          setLoading(false);
          return;
        }
      }

      if (!parsedPayload || parsedPayload.type !== 'EMERGENCY') {
        setError('Invalid token type. Expected EMERGENCY access token.');
        setLoading(false);
        return;
      }

      try {
        const res = await backendApi.resolveEmergencyQR(parsedPayload);
        if (res.success && res.profile) {
          setProfile(res.profile);
        } else {
          setError('Could not verify access token.');
        }
      } catch (err: any) {
        console.error(err);
        setError(err.message || 'Verification key has been revoked or expired.');
      } finally {
        setLoading(false);
      }
    };

    void loadProfile();
  }, [tokenStr]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-6 gap-4">
        <div className="relative">
          <Loader2 className="w-12 h-12 animate-spin text-rose-500" />
          <Heart className="w-5 h-5 text-rose-500 absolute inset-0 m-auto animate-pulse" />
        </div>
        <p className="text-sm font-semibold tracking-wider text-slate-400 uppercase animate-pulse">
          Decrypting Ledger Emergency Credentials...
        </p>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 text-white text-center">
        <div className="max-w-md space-y-4">
          <div className="w-16 h-16 bg-rose-950/40 text-rose-500 rounded-full flex items-center justify-center mx-auto border border-rose-900/60 shadow-lg shadow-rose-950/20">
            <ShieldAlert className="h-8 w-8" />
          </div>
          <h1 className="text-xl font-bold font-display">Record Access Restricted</h1>
          <p className="text-sm text-slate-400 leading-relaxed">
            {error || 'The emergency query reference key does not match any authenticated record on the PalmsChain SL network.'}
          </p>
          <p className="text-xs text-slate-500 leading-relaxed">
            Emergency credentials access may have been rotated, revoked, or restricted by the patient.
          </p>
          <div className="pt-4 flex flex-col gap-2">
            <Link 
              href="/login" 
              className="px-5 py-2.5 bg-brand hover:bg-brand-dark rounded-xl text-sm font-semibold transition shadow-md"
            >
              Doctor Login Authorization
            </Link>
            <Link 
              href="/scan" 
              className="text-xs text-slate-500 hover:text-slate-400 transition"
            >
              Go Back
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Parse fields safely (arrays might be parsed JSON arrays or strings)
  const allergies = Array.isArray(profile.allergies) 
    ? profile.allergies 
    : (typeof profile.allergies === 'string' ? JSON.parse(profile.allergies) : []);
  const medications = Array.isArray(profile.medications) 
    ? profile.medications 
    : (typeof profile.medications === 'string' ? JSON.parse(profile.medications) : []);
  const chronicConditions = Array.isArray(profile.chronicConditions) 
    ? profile.chronicConditions 
    : (typeof profile.chronicConditions === 'string' ? JSON.parse(profile.chronicConditions) : []);
  const emergencyContacts = Array.isArray(profile.emergencyContacts) 
    ? profile.emergencyContacts 
    : (typeof profile.emergencyContacts === 'string' ? JSON.parse(profile.emergencyContacts) : []);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col items-center justify-center p-4 sm:p-6 font-sans">
      <div className="w-full max-w-lg bg-slate-950 border border-rose-950 rounded-3xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-300">
        
        {/* Flashy EMERGENCY Banner */}
        <div className="bg-gradient-to-r from-rose-700 via-rose-600 to-rose-700 text-white p-5 text-center relative border-b border-rose-800 space-y-1">
          <div className="absolute top-4 left-4 flex gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-white animate-pulse" />
            <span className="h-2.5 w-2.5 rounded-full bg-white/40" />
          </div>
          <h2 className="text-lg font-black tracking-widest uppercase flex items-center justify-center gap-2">
            <Heart className="h-5 w-5 fill-white animate-pulse" />
            Emergency Medical Card
          </h2>
          <p className="text-[10px] text-rose-100 font-bold uppercase tracking-wider">
            First Responder Decrypted Credentials
          </p>
        </div>

        {/* Info Blocks */}
        <div className="p-6 space-y-6">
          
          {/* Blood Type Display (CRITICAL) */}
          <div className="bg-rose-950/20 border border-rose-900/60 rounded-2xl p-4 flex items-center justify-between gap-4">
            <div>
              <span className="text-[10px] font-bold text-rose-400 uppercase tracking-widest block">Validated Blood Type</span>
              <span className="text-xs text-slate-400 mt-0.5 block leading-normal">
                Cross-checked against Fabric Ledger state
              </span>
            </div>
            {profile.bloodType ? (
              <div className="h-16 w-16 bg-rose-600/90 text-white border border-rose-500 rounded-full font-black text-2xl flex items-center justify-center shadow-lg shadow-rose-900/40">
                {profile.bloodType}
              </div>
            ) : (
              <div className="h-16 w-16 bg-slate-800 text-slate-500 rounded-full font-black text-xs flex items-center justify-center border border-slate-700">
                RESTRICTED
              </div>
            )}
          </div>

          {/* Demographic details */}
          <div className="space-y-4">
            <div>
              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Full Name</span>
              <div className="flex items-center gap-2 bg-slate-900 p-3 rounded-xl border border-slate-800/80">
                <User className="h-4.5 w-4.5 text-rose-500" />
                <span className="font-bold text-sm text-slate-100">
                  {profile.fullName || 'Consent Restricted'}
                </span>
              </div>
            </div>

            {/* Allergies Alerts */}
            <div>
              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Critical Allergies / Intolerances</span>
              {allergies.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {allergies.map((all: any, i: number) => {
                    const name = typeof all === 'string' ? all : (all.name || 'Unknown');
                    const severity = typeof all === 'string' ? 'High' : (all.severity || 'High');
                    return (
                      <span key={i} className="px-3 py-1.5 bg-rose-950/40 text-rose-300 text-xs font-semibold rounded-lg border border-rose-900/60 shadow-inner">
                        ⚠️ {name} ({severity})
                      </span>
                    );
                  })}
                </div>
              ) : (
                <div className="text-xs text-emerald-400 font-semibold bg-emerald-950/20 p-3 rounded-xl border border-emerald-950/40">
                  No critical allergies declared on-chain
                </div>
              )}
            </div>

            {/* Medications */}
            <div>
              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Active Medications</span>
              {medications.length > 0 ? (
                <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800/80 space-y-2">
                  {medications.map((med: any, i: number) => {
                    const name = typeof med === 'string' ? med : (med.name || 'Unknown');
                    const dosage = typeof med === 'string' ? '' : (med.dosage ? ` - ${med.dosage}` : '');
                    return (
                      <div key={i} className="flex items-center gap-2 text-xs text-slate-200">
                        <Pill className="h-3.5 w-3.5 text-rose-400 shrink-0" />
                        <span>{name}{dosage}</span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-xs text-slate-500 italic bg-slate-900 p-3 rounded-xl border border-slate-800/85">
                  No active medications reported
                </div>
              )}
            </div>

            {/* Chronic Conditions */}
            {chronicConditions.length > 0 && (
              <div>
                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Chronic Conditions</span>
                <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800/80 space-y-2">
                  {chronicConditions.map((cond: any, i: number) => {
                    const name = typeof cond === 'string' ? cond : (cond.name || 'Unknown');
                    return (
                      <div key={i} className="flex items-center gap-2 text-xs text-slate-200">
                        <Activity className="h-3.5 w-3.5 text-rose-400 shrink-0" />
                        <span>{name}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Emergency Contacts */}
            <div>
              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Primary Emergency Contact</span>
              {emergencyContacts.length > 0 ? (
                <div className="bg-slate-900 p-4 rounded-xl border border-slate-800/80 space-y-2">
                  {emergencyContacts.map((contact: any, i: number) => (
                    <div key={i} className="space-y-1">
                      <div className="text-sm font-semibold text-slate-200">
                        {contact.name} {contact.relation ? `(${contact.relation})` : ''}
                      </div>
                      <a 
                        href={`tel:${contact.phone}`}
                        className="flex items-center gap-2 text-xs font-semibold text-rose-400 hover:text-rose-300 transition"
                      >
                        <Phone className="h-4 w-4" />
                        {contact.phone}
                      </a>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-xs text-slate-500 italic bg-slate-900 p-3 rounded-xl border border-slate-800/85 text-center">
                  No emergency contacts declared
                </div>
              )}
            </div>

            {/* Emergency Notes */}
            {profile.emergencyNotes && (
              <div>
                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Critical Notes</span>
                <div className="bg-amber-950/20 border border-amber-900/40 p-3 rounded-xl text-xs text-amber-200/90 leading-relaxed flex gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                  <span>{profile.emergencyNotes}</span>
                </div>
              </div>
            )}

          </div>

          {/* Secure watermark */}
          <div className="border-t border-slate-900 pt-4 flex items-center justify-between text-[10px] text-slate-500">
            <div className="flex items-center gap-1">
              <VerifiedIcon className="h-4 w-4 text-brand" />
              <span>Hyperledger Fabric Authenticated</span>
            </div>
            <span>Patient ID: {profile.patientId.substring(0, 18)}...</span>
          </div>

        </div>

      </div>

      {/* Footer warning */}
      <p className="text-[10px] text-slate-500 text-center max-w-xs leading-relaxed mt-4">
        This document represents raw medical access parameters parsed directly from the distributed ledger channel. All writes are immutable.
      </p>
    </div>
  );
}

// ─── Main Page with Suspense boundary ─────────────────────────────────────────
export default function EmergencyPublicPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-6 gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-rose-500" />
        <p className="text-xs text-slate-400 animate-pulse">Initializing Decryption Session...</p>
      </div>
    }>
      <EmergencyProfileContent />
    </Suspense>
  );
}
