import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { QrCode, ShieldCheck, AlertCircle, Clock, CheckCircle, ScanLine, User, FileText, Activity } from 'lucide-react';
import { MOCK_PATIENTS } from '../services/mockData';
import { scanQrPayload } from '../services/api';
import type { Patient } from '../types';

type ScanState = 'idle' | 'scanning' | 'success' | 'error';

const ScanQR: React.FC = () => {
  const navigate = useNavigate();
  const [scanState, setScanState] = useState<ScanState>('idle');
  const [scannedPatient, setScannedPatient] = useState<Patient | null>(null);
  const [manualId, setManualId] = useState('');

  const handleManualLookup = async () => {
    if (!manualId.trim()) return;
    setScanState('scanning');
    
    try {
      // In a real app, the scanner reads a JSON string from the QR code.
      // Here, the doctor might paste the raw JSON payload into the manual input box.
      let payload;
      try {
        payload = JSON.parse(manualId);
      } catch (e) {
        // Fallback: Try to load from mock by patient ID (demo mode)
        if (/^P\d+/.test(manualId.toUpperCase())) {
          setTimeout(() => {
            const patient = MOCK_PATIENTS.find(p => p.id === manualId.toUpperCase()) || null;
            if (patient) {
              setScannedPatient(patient);
              setScanState('success');
            } else {
              setScanState('error');
            }
          }, 1000);
          return;
        }
        throw new Error('Invalid QR Payload format');
      }

      // Real scan: resolve QR payload via backend API
      const isEmergency = !!(payload && typeof payload === 'object' && (payload as any).type === 'EMERGENCY');
      const result = await scanQrPayload(payload, isEmergency);

      if (result.success && result.patientId) {
        // Get patient data from mock (in real app, backend would return more patient info)
        const patientData = MOCK_PATIENTS.find(p => p.id === result.patientId) || MOCK_PATIENTS[0];
        setScannedPatient(patientData);
        setScanState('success');
      } else if (result.success && result.profile) {
        // Emergency access: profile is returned directly
        const emergencyPatient: Patient = {
          id: 'emergency_' + Date.now(),
          name: (result.profile.fullName as string) || 'Emergency Patient',
          initials: ((result.profile.fullName as string) || 'EP').split(' ').map(w => w[0]).join(''),
          age: 0,
          gender: 'Other',
          dob: '',
          phone: '',
          email: '',
          address: '',
          bloodType: (result.profile.bloodType as string) || 'Unknown',
          condition: 'Emergency',
          lastVisit: new Date().toLocaleDateString(),
          status: 'Active',
          allergies: (result.profile.allergies as string[]) || [],
          medications: (result.profile.medications as string[]) || [],
          notes: (result.profile.emergencyNotes as string) || '',
        };
        setScannedPatient(emergencyPatient);
        setScanState('success');
      } else {
        console.error('Scan failed:', result.error);
        setScanState('error');
      }
    } catch (err) {
      console.error(err);
      setScanState('error');
    }
  };

  const simulateScan = () => {
    // Just a visual simulation for demo if no backend running
    setScanState('scanning');
    setTimeout(() => {
      const patient = MOCK_PATIENTS.find(p => p.id === 'P001') || null;
      if (patient) {
        setScannedPatient(patient);
        setScanState('success');
      } else {
        setScanState('error');
      }
    }, 2200);
  };

  const reset = () => {
    setScanState('idle');
    setScannedPatient(null);
    setManualId('');
  };

  return (
    <div className="page-container">
      <div className="page-header animate-fade-in">
        <div>
          <h1 className="heading-2 page-title" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <QrCode color="var(--primary)" size={26} />
            QR Code Scanner
          </h1>
          <p className="page-subtitle">Scan a patient's QR code to request blockchain-verified record access.</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', alignItems: 'start' }}>

        {/* Scanner Panel */}
        <div className="card animate-fade-in" style={{ animationDelay: '0.05s' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ScanLine size={18} color="var(--primary)" /> Camera Scanner
          </h3>

          {/* Scan viewport */}
          <div
            onClick={scanState === 'idle' ? simulateScan : undefined}
            style={{
              position: 'relative',
              width: '100%',
              aspectRatio: '1',
              background: scanState === 'scanning'
                ? 'linear-gradient(135deg, #0A7A1E, #0D9426)'
                : scanState === 'success'
                  ? 'linear-gradient(135deg, #DCFCE7, #E8F5EC)'
                  : scanState === 'error'
                    ? 'linear-gradient(135deg, #FEF2F2, #FEE2E2)'
                    : 'linear-gradient(135deg, #F8FAFC, #F1F5F9)',
              borderRadius: '16px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: scanState === 'idle' ? 'pointer' : 'default',
              transition: 'all 0.3s ease',
              border: scanState === 'success'
                ? '2px solid var(--primary)'
                : scanState === 'error'
                  ? '2px solid #DC2626'
                  : '2px dashed var(--border)',
              marginBottom: '20px',
              overflow: 'hidden',
            }}
          >
            {/* Corner markers */}
            {['topLeft', 'topRight', 'bottomLeft', 'bottomRight'].map((pos) => {
              const isTop = pos.includes('top');
              const isLeft = pos.includes('Left');
              return (
                <div
                  key={pos}
                  style={{
                    position: 'absolute',
                    [isTop ? 'top' : 'bottom']: '20px',
                    [isLeft ? 'left' : 'right']: '20px',
                    width: '28px', height: '28px',
                    borderTop: isTop ? '3px solid var(--primary)' : 'none',
                    borderBottom: !isTop ? '3px solid var(--primary)' : 'none',
                    borderLeft: isLeft ? '3px solid var(--primary)' : 'none',
                    borderRight: !isLeft ? '3px solid var(--primary)' : 'none',
                    opacity: scanState === 'idle' ? 0.4 : 1,
                    transition: 'opacity 0.3s',
                  }}
                />
              );
            })}

            {scanState === 'idle' && (
              <>
                <QrCode size={72} color="var(--text-muted)" strokeWidth={1.2} />
                <p style={{ marginTop: '16px', fontWeight: 600, color: 'var(--text-main)' }}>Click to Simulate Scan</p>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>Or use manual lookup below</p>
              </>
            )}

            {scanState === 'scanning' && (
              <>
                {/* Animated scan line */}
                <div style={{
                  position: 'absolute', top: '50%', left: '10%', right: '10%',
                  height: '3px', background: 'rgba(255,255,255,0.9)',
                  borderRadius: '2px', boxShadow: '0 0 12px rgba(255,255,255,0.8)',
                  animation: 'scanLine 1.5s ease-in-out infinite',
                }} />
                <QrCode size={72} color="white" strokeWidth={1.2} />
                <p style={{ marginTop: '16px', fontWeight: 700, color: 'white', fontSize: '16px' }}>Scanning…</p>
                <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.8)', marginTop: '4px' }}>Reading patient QR code</p>
                <style>{`
                  @keyframes scanLine {
                    0% { top: 15%; }
                    50% { top: 85%; }
                    100% { top: 15%; }
                  }
                `}</style>
              </>
            )}

            {scanState === 'success' && (
              <>
                <CheckCircle size={72} color="var(--primary)" strokeWidth={1.5} />
                <p style={{ marginTop: '16px', fontWeight: 700, color: 'var(--primary)', fontSize: '16px' }}>Patient Found!</p>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>{scannedPatient?.name}</p>
              </>
            )}

            {scanState === 'error' && (
              <>
                <AlertCircle size={72} color="#DC2626" strokeWidth={1.5} />
                <p style={{ marginTop: '16px', fontWeight: 700, color: '#DC2626', fontSize: '16px' }}>No Match Found</p>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>QR code not recognized</p>
              </>
            )}
          </div>

          {/* Manual lookup */}
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              type="text"
              placeholder="Enter Patient ID or Name…"
              value={manualId}
              onChange={e => setManualId(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleManualLookup()}
              style={{
                flex: 1, padding: '10px 14px', borderRadius: 'var(--radius-md)',
                border: '1.5px solid var(--border)', outline: 'none',
                fontSize: '14px', fontFamily: 'inherit', color: 'var(--text-main)',
                background: 'var(--surface)',
              }}
            />
            <button className="btn btn-primary" onClick={handleManualLookup} disabled={!manualId.trim()}>
              Search
            </button>
          </div>

          {scanState !== 'idle' && (
            <button className="btn btn-outline" onClick={reset} style={{ width: '100%', marginTop: '12px' }}>
              Reset Scanner
            </button>
          )}
        </div>

        {/* Result Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {scannedPatient && scanState === 'success' ? (
            <>
              {/* Access Granted Banner */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                background: 'var(--primary-light)', border: '1.5px solid var(--primary)',
                borderRadius: 'var(--radius-md)', padding: '14px 18px',
              }}>
                <ShieldCheck size={20} color="var(--primary)" />
                <div>
                  <p style={{ fontWeight: 700, color: 'var(--primary)', fontSize: '14px' }}>Access Granted via Blockchain</p>
                  <p style={{ fontSize: '12px', color: 'var(--primary-dark)' }}>Verified on Hyperledger Fabric · {new Date().toLocaleTimeString()}</p>
                </div>
              </div>

              {/* Patient card */}
              <div className="card animate-fade-in">
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
                  <div style={{
                    width: '56px', height: '56px', borderRadius: '50%',
                    background: 'var(--primary-light)', display: 'flex',
                    alignItems: 'center', justifyContent: 'center',
                    fontSize: '20px', fontWeight: 700, color: 'var(--primary)',
                  }}>
                    {scannedPatient.initials}
                  </div>
                  <div>
                    <h3 style={{ fontWeight: 700, fontSize: '18px' }}>{scannedPatient.name}</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
                      {scannedPatient.age} yrs · {scannedPatient.gender} · {scannedPatient.bloodType}
                    </p>
                  </div>
                  <span className={`status-badge ${scannedPatient.status === 'Active' ? 'status-upcoming' : scannedPatient.status === 'Critical' ? 'status-no-show' : 'status-cancelled'}`} style={{ marginLeft: 'auto' }}>
                    {scannedPatient.status}
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
                  {[
                    { label: 'Last Visit', value: scannedPatient.lastVisit },
                    { label: 'Condition', value: scannedPatient.condition },
                    { label: 'Phone', value: scannedPatient.phone },
                    { label: 'Blood Type', value: scannedPatient.bloodType },
                  ].map((f, i) => (
                    <div key={i} style={{ padding: '10px 12px', background: 'var(--bg-color)', borderRadius: 'var(--radius-md)' }}>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>{f.label}</div>
                      <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-main)' }}>{f.value}</div>
                    </div>
                  ))}
                </div>

                {scannedPatient.allergies.length > 0 && (
                  <div style={{ marginBottom: '20px' }}>
                    <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>Allergies</div>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      {scannedPatient.allergies.map(a => (
                        <span key={a} className="allergy-chip">{a}</span>
                      ))}
                    </div>
                  </div>
                )}

                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => navigate(`/patients/${scannedPatient.id}`)}>
                    <FileText size={16} /> View Full Records
                  </button>
                  <button className="btn btn-outline" style={{ flex: 1 }} onClick={() => alert(`Starting consultation session for ${scannedPatient.name}.\nPalmsChain Session ID: SECURE-${scannedPatient.id}-${Date.now().toString().slice(-4)}`)}>
                    <Activity size={16} /> Start Consultation
                  </button>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* How it works */}
              <div className="card animate-fade-in" style={{ animationDelay: '0.1s' }}>
                <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '16px' }}>How QR Access Works</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {[
                    { step: '1', icon: QrCode, title: 'Patient Shows QR', desc: 'Patient generates a one-time QR code from their MediChain mobile app.' },
                    { step: '2', icon: ScanLine, title: 'Doctor Scans', desc: 'Doctor scans the QR code using this portal or a connected device.' },
                    { step: '3', icon: ShieldCheck, title: 'Blockchain Verifies', desc: 'Hyperledger Fabric validates identity and grants time-limited access.' },
                    { step: '4', icon: FileText, title: 'Secure Access', desc: 'Doctor can view authorized records. Every access is logged immutably on-chain.' },
                  ].map((s, i) => (
                    <div key={i} style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                      <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '14px', flexShrink: 0 }}>
                        {s.step}
                      </div>
                      <div>
                        <p style={{ fontWeight: 600, fontSize: '14px', marginBottom: '2px' }}>{s.title}</p>
                        <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.5 }}>{s.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent scans */}
              <div className="card animate-fade-in" style={{ animationDelay: '0.15s' }}>
                <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '16px' }}>Recent Scans</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {[
                    { name: 'Michael Chen', time: '09:15 AM', status: 'Granted' },
                    { name: 'Emma Watson', time: 'Yesterday', status: 'Granted' },
                    { name: 'Unknown', time: '2 days ago', status: 'Denied' },
                  ].map((s, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', background: 'var(--bg-color)', borderRadius: 'var(--radius-md)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <User size={16} color="var(--text-muted)" />
                        <span style={{ fontWeight: 600, fontSize: '14px' }}>{s.name}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Clock size={12} /> {s.time}
                        </span>
                        <span className={`status-badge ${s.status === 'Granted' ? 'status-upcoming' : 'status-no-show'}`}>
                          {s.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ScanQR;
