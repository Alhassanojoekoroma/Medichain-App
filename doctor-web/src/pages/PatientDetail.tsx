import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft, User, FileText, Calendar, Activity, Phone, Mail,
  MapPin, Heart, AlertTriangle, Clock, CheckCircle, ShieldCheck, Pill, Send
} from 'lucide-react';
import { MOCK_PATIENTS, MOCK_RECORDS, MOCK_APPOINTMENTS } from '../services/mockData';
import { fetchPatientDetail, requestPatientAccess } from '../services/api';
import type { Patient, MedicalRecord, Appointment } from '../types';

interface BackendPatientDetail extends Patient {
  medicalRecords?: MedicalRecord[];
  appointments?: Appointment[];
}

type DetailTab = 'overview' | 'records' | 'appointments' | 'medications';

const PatientDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState<DetailTab>('overview');
  const [backendPatient, setBackendPatient] = useState<BackendPatientDetail | null>(null);
  const [isRequestingAccess, setIsRequestingAccess] = useState(false);
  const [requestMessage, setRequestMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // Try to load from backend API first; fall back to mock
  const patient = MOCK_PATIENTS.find(p => p.id === id);

  useEffect(() => {
    const loadPatientData = async () => {
      if (!id || id.startsWith('emergency_')) return; // Skip for emergency patients
      try {
        const data = await fetchPatientDetail(id);
        if (data) {
          // Map PatientBackendResponse to BackendPatientDetail
          const mapped: BackendPatientDetail = {
            id: data.patient.id,
            name: data.patient.fullName,
            initials: data.patient.fullName.split(' ').map((n: string) => n[0]).join('').toUpperCase(),
            age: patient ? patient.age : 30,
            gender: (patient ? patient.gender : 'Other') as any,
            dob: data.patient.dob || '',
            phone: data.patient.phone || '',
            email: data.patient.email || '',
            address: patient ? patient.address : '',
            bloodType: data.patient.bloodType || 'Unknown',
            condition: patient ? patient.condition : 'General Consultation',
            lastVisit: patient ? patient.lastVisit : new Date().toISOString().split('T')[0],
            status: (patient ? patient.status : 'Active') as any,
            allergies: data.patient.allergies || [],
            medications: data.patient.medications || [],
            notes: data.patient.notes || '',
            walletAddress: data.patient.walletAddress || undefined,
            medicalRecords: data.records.map(r => ({
              id: r.id,
              patientId: r.patient_id,
              patientName: data.patient.fullName,
              date: r.created_at.split('T')[0],
              type: r.record_type as any,
              description: r.title || '',
              hash: r.integrity_hash || '',
              txHash: r.integrity_hash || undefined,
              blockNumber: undefined,
              status: 'Synced',
              verified: true
            })),
            appointments: []
          };
          setBackendPatient(mapped);
        }
      } catch (error) {
        console.error('Failed to load patient data:', error);
      }
    };
    loadPatientData();
  }, [id]);

  const handleRequestAccess = async () => {
    if (!id || !patient) return;
    setIsRequestingAccess(true);
    setRequestMessage(null);

    try {
      const result = await requestPatientAccess(id, `Patient consultation and medical record review`);
      if (result.success) {
        setRequestMessage({ type: 'success', text: 'Access request sent! Patient will be notified.' });
        setTimeout(() => setRequestMessage(null), 5000);
      } else {
        setRequestMessage({ type: 'error', text: result.error || 'Failed to request access' });
      }
    } catch (error) {
      setRequestMessage({ type: 'error', text: 'Error requesting access' });
    } finally {
      setIsRequestingAccess(false);
    }
  };

  if (!patient) {
    return (
      <div className="page-container" style={{ textAlign: 'center', padding: '60px' }}>
        <AlertTriangle size={48} color="var(--warning)" style={{ margin: '0 auto 16px' }} />
        <h2 className="heading-3">Patient Not Found</h2>
        <p className="page-subtitle" style={{ marginBottom: '24px' }}>No patient exists with ID: {id}</p>
        <Link to="/patients" className="btn btn-primary">← Back to Patients</Link>
      </div>
    );
  }

  const displayPatient = backendPatient || patient;
  const patientRecords = (backendPatient?.medicalRecords || MOCK_RECORDS).filter((r: MedicalRecord) => r.patientId === id);
  const patientAppointments = (backendPatient?.appointments || MOCK_APPOINTMENTS).filter((a: Appointment) => a.patientId === id);

  const tabs: { key: DetailTab; label: string; icon: React.ElementType; count?: number }[] = [
    { key: 'overview', label: 'Overview', icon: User },
    { key: 'records', label: 'Medical Records', icon: FileText, count: patientRecords.length },
    { key: 'appointments', label: 'Appointments', icon: Calendar, count: patientAppointments.length },
    { key: 'medications', label: 'Medications', icon: Pill, count: displayPatient.medications.length },
  ];

  const statusColor = displayPatient.status === 'Active' ? '#10B981' : displayPatient.status === 'Critical' ? '#DC2626' : '#94A3B8';

  return (
    <div className="page-container">
      {/* Back nav */}
      <div className="animate-fade-in" style={{ marginBottom: '20px' }}>
        <Link to="/patients" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '14px', fontWeight: 500, textDecoration: 'none' }}>
          <ArrowLeft size={16} /> Back to Patients
        </Link>
      </div>

      {/* Patient Header */}
      <div className="card animate-fade-in" style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative' }}>
            <div style={{
              width: '72px', height: '72px', borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--primary-light), var(--primary-mid))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '24px', fontWeight: 700, color: 'var(--primary)',
              border: `3px solid ${statusColor}`,
            }}>
              {patient.initials}
            </div>
            <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: statusColor, border: '2px solid white', position: 'absolute', bottom: '2px', right: '2px' }} />
          </div>

          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
              <h1 style={{ fontSize: '22px', fontWeight: 700 }}>{displayPatient.name}</h1>
              <span className={`status-badge ${displayPatient.status === 'Active' ? 'status-upcoming' : displayPatient.status === 'Critical' ? 'status-no-show' : 'status-cancelled'}`}>
                {displayPatient.status}
              </span>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
              {[
                { icon: User, text: `${displayPatient.age} yrs · ${displayPatient.gender}` },
                { icon: Heart, text: `Blood Type: ${displayPatient.bloodType}` },
                { icon: Phone, text: displayPatient.phone },
                { icon: Mail, text: displayPatient.email },
                { icon: MapPin, text: displayPatient.address },
              ].map((f, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '13px', color: 'var(--text-muted)' }}>
                  <f.icon size={13} /> {f.text}
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="btn btn-outline" onClick={() => alert(`Scheduling appointment for ${displayPatient.name}...\nRedirecting to calendar system.`)}>
              <Calendar size={16} /> Book Appointment
            </button>
            <button className="btn btn-primary" onClick={() => {
              const desc = prompt("Enter medical record description:");
              if (desc) {
                alert(`Preparing to sync new medical record on-chain for ${displayPatient.name}:\n\nDescription: ${desc}\nStatus: Pending Sync\nLedger: PalmsChain Fabric Node`);
              }
            }}>
              <FileText size={16} /> Add Record
            </button>
            <button 
              className="btn btn-secondary" 
              onClick={handleRequestAccess}
              disabled={isRequestingAccess}
            >
              <Send size={16} /> {isRequestingAccess ? 'Sending...' : 'Request Access'}
            </button>
          </div>

          {requestMessage && (
            <div style={{
              marginTop: '12px',
              padding: '12px 16px',
              borderRadius: 'var(--radius-md)',
              background: requestMessage.type === 'success' ? '#D1FAE5' : '#FEE2E2',
              color: requestMessage.type === 'success' ? '#065F46' : '#7F1D1D',
              fontSize: '13px',
              fontWeight: 600,
            }}>
              {requestMessage.text}
            </div>
          )}
        </div>

        {/* Quick stats strip */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginTop: '20px', paddingTop: '20px', borderTop: '1px solid var(--border)' }}>
          {[
            { label: 'Condition', value: displayPatient.condition, icon: Activity, color: 'blue' },
            { label: 'Last Visit', value: displayPatient.lastVisit, icon: Clock, color: 'green' },
            { label: 'Records', value: `${patientRecords.length} on-chain`, icon: ShieldCheck, color: 'purple' },
            { label: 'Appointments', value: `${patientAppointments.length} total`, icon: Calendar, color: 'orange' },
          ].map((s, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: 'var(--bg-color)', borderRadius: 'var(--radius-md)' }}>
              <div className={`stat-icon-wrapper ${s.color}`} style={{ width: '36px', height: '36px', flexShrink: 0 }}>
                <s.icon size={16} />
              </div>
              <div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{s.label}</div>
                <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-main)' }}>{s.value}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="tab-nav animate-fade-in" style={{ animationDelay: '0.05s' }}>
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`tab-item ${activeTab === tab.key ? 'active' : ''}`}
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <tab.icon size={14} />
            {tab.label}
            {tab.count !== undefined && (
              <span style={{
                background: activeTab === tab.key ? 'var(--primary-light)' : 'var(--bg-color)',
                color: activeTab === tab.key ? 'var(--primary)' : 'var(--text-muted)',
                borderRadius: '100px', padding: '1px 7px', fontSize: '11px', fontWeight: 700,
              }}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="animate-fade-in" style={{ animationDelay: '0.1s' }}>

        {/* ── OVERVIEW ─────────────────────────────────── */}
        {activeTab === 'overview' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            {/* Allergies */}
            <div className="card">
              <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertTriangle size={16} color="#DC2626" /> Allergies & Warnings
              </h3>
              {displayPatient.allergies.length > 0 ? (
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {displayPatient.allergies.map((a: string) => (
                    <span key={a} className="allergy-chip" style={{ fontSize: '13px', padding: '5px 12px' }}>{a}</span>
                  ))}
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--success)', fontWeight: 600, fontSize: '14px' }}>
                  <CheckCircle size={16} /> No known allergies
                </div>
              )}
            </div>

            {/* Notes */}
            <div className="card">
              <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FileText size={16} color="var(--primary)" /> Clinical Notes
              </h3>
              <p style={{ fontSize: '14px', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                {displayPatient.notes || 'No clinical notes recorded.'}
              </p>
            </div>

            {/* Blockchain info */}
            <div className="card" style={{ gridColumn: 'span 2' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShieldCheck size={16} color="var(--primary)" /> Blockchain Identity
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                {[
                  { label: 'Patient ID', value: patient.id },
                  { label: 'Wallet Address', value: patient.walletAddress ? `${patient.walletAddress.substring(0, 12)}...` : 'Not connected' },
                  { label: 'Records on Chain', value: `${patientRecords.filter(r => r.status === 'Synced').length} / ${patientRecords.length}` },
                ].map((f, i) => (
                  <div key={i} style={{ padding: '12px', background: 'var(--bg-color)', borderRadius: 'var(--radius-md)' }}>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '4px' }}>{f.label}</div>
                    <div style={{ fontFamily: 'monospace', fontSize: '13px', fontWeight: 600, color: 'var(--text-main)' }}>{f.value}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── RECORDS ──────────────────────────────────── */}
        {activeTab === 'records' && (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Record ID</th>
                  <th>Date</th>
                  <th>Type</th>
                  <th>Description</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {patientRecords.length === 0 ? (
                  <tr><td colSpan={5} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>No records found.</td></tr>
                ) : patientRecords.map(rec => (
                  <tr key={rec.id}>
                    <td style={{ fontFamily: 'monospace', fontSize: '13px', fontWeight: 600 }}>{rec.id}</td>
                    <td style={{ color: 'var(--text-muted)' }}>{rec.date}</td>
                    <td><span className="condition-tag">{rec.type}</span></td>
                    <td style={{ fontSize: '13px' }}>{rec.description}</td>
                    <td>
                      <span className={`status-badge ${rec.status === 'Synced' ? 'status-completed' : rec.status === 'Failed' ? 'status-no-show' : 'status-upcoming'}`}>
                        {rec.status === 'Synced' && <CheckCircle size={11} />}
                        {rec.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ── APPOINTMENTS ─────────────────────────────── */}
        {activeTab === 'appointments' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {patientAppointments.length === 0 ? (
              <div className="card" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>No appointments found.</div>
            ) : patientAppointments.map(apt => (
              <div key={apt.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                  <div style={{ textAlign: 'center', minWidth: '80px', borderRight: '1px solid var(--border)', paddingRight: '16px' }}>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--primary)' }}>{apt.startTime}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{apt.date}</div>
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '14px' }}>{apt.category}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{apt.type}</div>
                  </div>
                </div>
                <span className={`status-badge ${
                  apt.status === 'Upcoming' ? 'status-upcoming' :
                  apt.status === 'Completed' ? 'status-completed' :
                  apt.status === 'No-Show' ? 'status-no-show' : 'status-cancelled'
                }`}>
                  {apt.status}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* ── MEDICATIONS ──────────────────────────────── */}
        {activeTab === 'medications' && (
          <div className="card">
            <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Pill size={16} color="var(--primary)" /> Current Medications
            </h3>
            {displayPatient.medications.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>No active medications.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {displayPatient.medications.map((med: string, i: number) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 16px', background: 'var(--bg-color)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Pill size={16} color="var(--primary)" />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: '14px' }}>{med}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Active prescription</div>
                    </div>
                    <span className="status-badge status-upcoming" style={{ fontSize: '11px' }}>Active</span>
                  </div>
                ))}
              </div>
            )}

            {patient.allergies.length > 0 && (
              <div style={{ marginTop: '24px', padding: '14px', background: '#FEF2F2', borderRadius: 'var(--radius-md)', border: '1px solid #FCA5A5', display: 'flex', gap: '10px' }}>
                <AlertTriangle size={18} color="#DC2626" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <p style={{ fontWeight: 700, fontSize: '14px', color: '#DC2626', marginBottom: '4px' }}>Drug Allergy Warning</p>
                  <p style={{ fontSize: '13px', color: '#991B1B' }}>
                    Patient is allergic to: <strong>{patient.allergies.join(', ')}</strong>. Review all medications for potential conflicts.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientDetail;
