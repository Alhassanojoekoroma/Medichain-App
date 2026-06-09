'use client';

import { useParams } from 'next/navigation';
import { MOCK_PATIENTS } from '@/data/mockData';
import { 
  Heart, AlertTriangle, ShieldCheck, Phone, 
  MapPin, User, ShieldAlert, Award, FileText 
} from 'lucide-react';
import Link from 'next/link';

export default function PublicEmergencyPatientCard() {
  const params = useParams();
  const patientId = params.id as string;

  // Find patient record
  const patient = MOCK_PATIENTS.find(p => p.id === patientId);

  if (!patient) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 text-white text-center">
        <div className="max-w-md space-y-4">
          <ShieldAlert className="h-16 w-16 text-rose-500 mx-auto" />
          <h1 className="text-xl font-bold font-display">Record Not Anchored</h1>
          <p className="text-sm text-slate-400 leading-relaxed">
            The emergency query reference key does not match any authenticated record on the MediChain SL network.
          </p>
          <div className="pt-4">
            <Link 
              href="/login" 
              className="px-5 py-2.5 bg-brand hover:bg-brand-dark rounded-lg text-sm font-semibold transition"
            >
              Portal Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Check if public access toggled
  if (!patient.qrPublicAccess) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 text-white text-center">
        <div className="max-w-md space-y-4">
          <AlertTriangle className="h-16 w-16 text-amber-500 mx-auto" />
          <h1 className="text-xl font-bold font-display">Consent Restricted</h1>
          <p className="text-sm text-slate-400 leading-relaxed">
            The patient has revoked open emergency public credentials access. Credentials can only be accessed with doctor-signed Fabric keys.
          </p>
          <div className="pt-4">
            <Link 
              href="/login" 
              className="px-5 py-2.5 bg-brand hover:bg-brand-dark text-white rounded-lg text-sm font-semibold transition"
            >
              Doctor Login Authorization
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const isPermitted = (field: 'name' | 'bloodType' | 'allergies' | 'emergencyContact') => {
    return patient.qrPublicFields.includes(field);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col items-center justify-center p-4 sm:p-6 select-none font-sans">
      <div className="w-full max-w-lg bg-slate-950 border border-rose-950 rounded-2xl overflow-hidden shadow-2xl">
        
        {/* Flashy EMERGENCY Banner */}
        <div className="bg-gradient-to-r from-rose-700 via-rose-600 to-rose-700 text-white p-5 text-center relative border-b border-rose-800 space-y-1">
          <div className="absolute top-3 left-4 flex gap-1 animate-pulse">
            <span className="h-2 w-2 rounded-full bg-white" />
            <span className="h-2 w-2 rounded-full bg-white" />
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
          <div className="bg-rose-950/20 border border-rose-900/60 rounded-xl p-4 flex items-center justify-between gap-4">
            <div>
              <span className="text-[10px] font-bold text-rose-400 uppercase tracking-widest block">Validated Blood Type</span>
              <span className="text-xs text-slate-400 mt-0.5 block leading-normal">
                {isPermitted('bloodType') ? 'Cross-checked against Fabric Ledger state' : 'Restricted by patient preference'}
              </span>
            </div>
            {isPermitted('bloodType') ? (
              <div className="h-16 w-16 bg-rose-600/90 text-white border border-rose-500 rounded-full font-black text-2xl flex items-center justify-center shadow-lg shadow-rose-900/40">
                {patient.bloodType}
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
              <div className="flex items-center gap-2 bg-slate-900 p-3 rounded-lg border border-slate-800/80">
                <User className="h-4.5 w-4.5 text-rose-500" />
                <span className="font-bold text-sm text-slate-100">
                  {isPermitted('name') ? patient.name : 'Consent Restricted'}
                </span>
              </div>
            </div>

            {/* Allergies Alerts */}
            <div>
              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Critical Allergies / Intolerances</span>
              {isPermitted('allergies') ? (
                patient.allergies.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {patient.allergies.map(all => (
                      <span key={all} className="px-3 py-1.5 bg-rose-950/40 text-rose-300 text-xs font-semibold rounded-lg border border-rose-900/60 shadow-inner">
                        ⚠️ {all}
                      </span>
                    ))}
                  </div>
                ) : (
                  <div className="text-xs text-emerald-400 font-semibold bg-emerald-950/20 p-3 rounded-lg border border-emerald-950/40">
                    No critical drug allergies declared on-chain
                  </div>
                )
              ) : (
                <div className="text-xs text-slate-500 italic bg-slate-900 p-3 rounded-lg border border-slate-800/85 text-center">
                  Allergy Consent Restricted
                </div>
              )}
            </div>

            {/* Emergency Contact */}
            <div>
              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Primary Emergency Contact</span>
              {isPermitted('emergencyContact') ? (
                <div className="bg-slate-900 p-4 rounded-lg border border-slate-800/80 space-y-2">
                  <div className="text-sm font-semibold text-slate-200">
                    {patient.emergencyContactName}
                  </div>
                  <a 
                    href={`tel:${patient.emergencyContactPhone}`}
                    className="flex items-center gap-2 text-xs font-semibold text-rose-400 hover:text-rose-300 transition"
                  >
                    <Phone className="h-4 w-4" />
                    {patient.emergencyContactPhone}
                  </a>
                </div>
              ) : (
                <div className="text-xs text-slate-500 italic bg-slate-900 p-3 rounded-lg border border-slate-800/85 text-center">
                  Contact Consent Restricted
                </div>
              )}
            </div>

          </div>

          {/* Secure watermark */}
          <div className="border-t border-slate-900 pt-4 flex items-center justify-between text-[10px] text-slate-500">
            <div className="flex items-center gap-1">
              <ShieldCheck className="h-4 w-4 text-brand" />
              <span>Hyperledger Fabric Authenticated</span>
            </div>
            <span>ID: {patient.id}</span>
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
