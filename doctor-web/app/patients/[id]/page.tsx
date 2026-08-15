'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

const I = {
  phone: '<path d="M22 16.9v2a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3-8.7A2 2 0 0 1 4.1 1h2a2 2 0 0 1 2 1.7c.1.9.4 1.9.7 2.7a2 2 0 0 1-.5 2.1L7.1 8.7a16 16 0 0 0 6 6l1.2-1.2a2 2 0 0 1 2.1-.5c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.9 2.2z"/>',
  calendar: '<rect x="3" y="5" width="18" height="16" rx="3"/><path d="M16 3v4M8 3v4M3 10h18"/>',
  shield: '<path d="M12 2 20 5v6c0 5-3.4 9.2-8 11-4.6-1.8-8-6-8-11V5z"/><path d="m8.5 12 2.2 2.2 4.8-5"/>',
  chevLeft: '<path d="M15 18l-6-6 6-6"/>',
  alert: '<path d="M12 9v4M12 17h.01"/><path d="M10.3 3.9L1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/>',
  check: '<path d="M20 6L9 17l-5-5"/>',
  more: '<circle cx="12" cy="5" r="1.3"/><circle cx="12" cy="12" r="1.3"/><circle cx="12" cy="19" r="1.3"/>',
  sparkles: '<path d="M12 2l1.5 4.5L18 8l-4.5 1.5L12 14l-1.5-4.5L6 8l4.5-1.5z"/><path d="M5 14.5l.75 2.25L8 17.5l-2.25.75L5 20.5l-.75-2.25L2 17.5l2.25-.75z"/>',
  file: '<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5"/>',
  eye: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/>',
  download2: '<path d="M12 3v12m0 0l-4.5-4.5M12 15l4.5-4.5"/><path d="M4 18v1a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-1"/>',
  edit: '<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/>',
  filter: '<path d="M4 6h16M7 12h10M10 18h4"/>',
};

function Icon({ d, size = 16 }: { d: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true" dangerouslySetInnerHTML={{ __html: d }} />
  );
}

const backendApi = {
  getPatient: async (id: string) => {
    return new Promise((resolve) => setTimeout(() => resolve({
      id: '1456',
      name: 'Fatima Koroma',
      gender: 'Female',
      dob: '12.02.1995',
      location: 'Freetown, Sierra Leone',
      lastSynced: 'Just now',
      procedure: 'Hip replacement',
      date: '28.08.2025',
      doctor: 'Dr. Amadu Williams',
      anaesthesiologist: 'Dr. John Davies',
      status: 'In Progress'
    }), 600));
  }
};

export default function PatientDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [patient, setPatient] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    backendApi.getPatient(id)
      .then(data => {
        setPatient(data);
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ animation: 'pulse 1.5s infinite', display: 'flex', gap: '20px', height: '80vh' }}>
          <div style={{ width: '280px', background: 'var(--gray-200)', borderRadius: '12px' }}></div>
          <div style={{ flex: 1, background: 'var(--gray-200)', borderRadius: '12px' }}></div>
          <div style={{ width: '280px', background: 'var(--gray-200)', borderRadius: '12px' }}></div>
        </div>
      </div>
    );
  }

  if (error || !patient) {
    return (
      <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
        <div className="mc-notice danger">Failed to load patient information.</div>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', maxWidth: '1300px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
        <Link href="/patients">
          <button className="btn btn-outline"><Icon d={I.chevLeft} /> Back</button>
        </Link>
        <h1 className="page-title" style={{ margin: 0 }}>Patient information</h1>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr 280px', gap: '20px', alignItems: 'start' }}>
        
        {/* LEFT COLUMN */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ height: '140px', background: 'var(--brand-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'white', color: 'var(--brand)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, fontWeight: 800, boxShadow: 'var(--shadow-sm)' }}>
                {patient.name.charAt(0)}
              </div>
            </div>
            <div style={{ padding: '20px' }}>
              <div className="profile-name" style={{ textAlign: 'center', marginBottom: '12px' }}>
                <div style={{ fontSize: '20px', fontWeight: 600, color: 'var(--ink-900)' }}>{patient.name}</div>
                <div className="idtag" style={{ fontSize: '13px', color: 'var(--gray-500)', marginTop: '4px' }}>ID: {patient.id}</div>
              </div>
              
              <div className="profile-tags" style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', justifyContent: 'center', marginBottom: '20px' }}>
                <span className="chip" style={{ fontSize: '12px', padding: '2px 8px', background: 'var(--gray-100)', borderRadius: '4px', color: 'var(--gray-700)' }}>{patient.gender}</span>
                <span className="chip" style={{ fontSize: '12px', padding: '2px 8px', background: 'var(--gray-100)', borderRadius: '4px', color: 'var(--gray-700)' }}>{patient.dob}</span>
                <span className="chip" style={{ fontSize: '12px', padding: '2px 8px', background: 'var(--gray-100)', borderRadius: '4px', color: 'var(--gray-700)' }}>{patient.location}</span>
              </div>

              <div className="mc-chain-badge" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', background: '#F0FDF4', color: '#166534', padding: '8px', borderRadius: '6px', fontSize: '12px', fontWeight: 500, marginBottom: '20px' }}>
                <Icon d={I.shield} size={14} />
                <span>Verified on-chain • {patient.lastSynced}</span>
              </div>

              <div className="profile-actions" style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
                <button className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }}><Icon d={I.phone} /> Call</button>
                <button className="btn btn-outline" style={{ padding: '0 12px' }}><Icon d={I.calendar} /></button>
                <button className="icon-btn ghost" style={{ width: 36, height: 36, flexShrink: 0 }}><Icon d={I.more} /></button>
              </div>

              <div style={{ borderTop: '1px solid var(--gray-200)', paddingTop: '20px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--ink-900)', marginBottom: '16px', margin: 0 }}>Planned procedure details</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px' }}>
                  <div className="profile-detail-row" style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--gray-500)' }}>Planned procedure</span><span style={{ fontWeight: 500, color: 'var(--ink-900)', textAlign: 'right' }}>{patient.procedure}</span></div>
                  <div className="profile-detail-row" style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--gray-500)' }}>Surgery date</span><span style={{ fontWeight: 500, color: 'var(--ink-900)' }}>{patient.date}</span></div>
                  <div className="profile-detail-row" style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--gray-500)' }}>Attending physician</span><span style={{ fontWeight: 500, color: 'var(--ink-900)', textAlign: 'right' }}>{patient.doctor}</span></div>
                  <div className="profile-detail-row" style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--gray-500)' }}>Anaesthesiologist</span><span style={{ fontWeight: 500, color: 'var(--ink-900)', textAlign: 'right' }}>{patient.anaesthesiologist}</span></div>
                  <div className="profile-detail-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><span style={{ color: 'var(--gray-500)' }}>Status</span><span className="badge badge-amber"><i className="dot" style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: 'currentColor', marginRight: 4 }} />{patient.status}</span></div>
                </div>
              </div>
            </div>
          </div>

          <div className="card" style={{ padding: 0 }}>
            <div className="card-head" style={{ padding: '16px', borderBottom: '1px solid var(--gray-200)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--gray-50)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, fontSize: '14px', color: 'var(--ink-900)' }}>
                <div style={{ color: 'var(--red-600)' }}><Icon d={I.alert} size={16} /></div>
                Important alerts
              </div>
              <div style={{ display: 'flex', gap: '4px' }}>
                <button className="icon-btn ghost" style={{ width: 28, height: 28 }}><Icon d={I.plus} size={14} /></button>
                <button className="icon-btn ghost" style={{ width: 28, height: 28 }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
                </button>
              </div>
            </div>
            <div style={{ padding: '12px' }}>
              <div className="alert-item" style={{ padding: '10px 12px', background: '#FEF2F2', borderLeft: '3px solid #DC2626', borderRadius: '4px', marginBottom: '8px', fontSize: '13px' }}>
                <div style={{ fontWeight: 600, color: '#991B1B', marginBottom: '2px' }}>Blood thinner - Apixaban</div>
                <div style={{ color: '#B91C1C' }}>Pause confirmed</div>
              </div>
              <div className="alert-item" style={{ padding: '10px 12px', background: '#FEF2F2', borderLeft: '3px solid #DC2626', borderRadius: '4px', marginBottom: '8px', fontSize: '13px' }}>
                <div style={{ fontWeight: 600, color: '#991B1B', marginBottom: '2px' }}>DNR</div>
                <div style={{ color: '#B91C1C' }}>Yes</div>
              </div>
              <div className="alert-item" style={{ padding: '10px 12px', background: '#EFF6FF', borderLeft: '3px solid #2563EB', borderRadius: '4px', fontSize: '13px' }}>
                <div style={{ fontWeight: 600, color: '#1E40AF', marginBottom: '2px' }}>Lab tests</div>
                <div style={{ color: '#1D4ED8' }}>Update Hb/INR</div>
              </div>
            </div>
          </div>
        </div>

        {/* CENTER COLUMN */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="card" style={{ padding: 0 }}>
            <div className="card-head" style={{ padding: '16px 20px', borderBottom: '1px solid var(--gray-200)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: '16px', fontWeight: 600, margin: 0, color: 'var(--ink-900)' }}>Key clinical overview</h2>
              <button className="icon-btn ghost" style={{ width: 32, height: 32 }}><Icon d={I.edit} size={16} /></button>
            </div>
            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px', fontSize: '14px' }}>
              <div className="kv-row" style={{ display: 'flex' }}><div style={{ width: '180px', color: 'var(--gray-500)' }}>Language</div><div style={{ flex: 1, fontWeight: 500, color: 'var(--ink-900)' }}>Krio, English</div></div>
              <div className="kv-row" style={{ display: 'flex' }}><div style={{ width: '180px', color: 'var(--gray-500)' }}>Allergies</div><div style={{ flex: 1, fontWeight: 500, color: 'var(--red-600)' }}>Penicillin</div></div>
              <div className="kv-row" style={{ display: 'flex' }}><div style={{ width: '180px', color: 'var(--gray-500)' }}>Pre-existing conditions</div><div style={{ flex: 1, fontWeight: 500, color: 'var(--ink-900)' }}>Hypertension, Type 2 Diabetes</div></div>
              <div className="kv-row" style={{ display: 'flex' }}><div style={{ width: '180px', color: 'var(--gray-500)' }}>Medications</div><div style={{ flex: 1, fontWeight: 500, color: 'var(--ink-900)' }}>Lisinopril 10mg, Metformin 500mg, Apixaban 5mg</div></div>
              <div className="kv-row" style={{ display: 'flex', alignItems: 'center' }}><div style={{ width: '180px', color: 'var(--gray-500)' }}>DNR/DNI</div><div style={{ flex: 1 }}><span className="badge badge-blue">Active</span></div></div>
              <div className="kv-row" style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ width: '180px', color: 'var(--gray-500)' }}>ASA classification</div>
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className="badge badge-red">ASA III</span>
                  <span style={{ fontSize: '12px', color: 'var(--gray-400)' }}>Uploaded: 14.08.2025</span>
                </div>
              </div>
              <div className="kv-row" style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ width: '180px', color: 'var(--gray-500)' }}>ICU need</div>
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 500, color: 'var(--ink-900)' }}>
                  Required
                  <span className="badge badge-amber">Confirmation pending</span>
                </div>
              </div>
              <div className="kv-row" style={{ display: 'flex' }}><div style={{ width: '180px', color: 'var(--gray-500)' }}>Last lab date</div><div style={{ flex: 1, fontWeight: 500, color: 'var(--ink-900)' }}>15.08.2025</div></div>
            </div>

            {/* AI Assist panel */}
            <div className="mc-ai-panel" style={{ margin: '0 20px 20px 20px', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#6366F1', fontWeight: 600, fontSize: '13px', marginBottom: '12px' }}>
                <Icon d={I.sparkles} size={14} /> AI Assist suggested updates
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {['Chief complaint', 'Assessment', 'Plan'].map(field => (
                  <div key={field} style={{ background: 'white', padding: '12px', borderRadius: '6px', border: '1px solid #E2E8F0', fontSize: '13px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <div className="mc-ai-chip" style={{ fontSize: '11px', fontWeight: 600, color: '#4F46E5', background: '#EEF2FF', padding: '2px 6px', borderRadius: '4px' }}>{field}</div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button className="icon-btn ghost" style={{ width: 24, height: 24, color: 'var(--gray-400)' }}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 10h10a5 5 0 0 1 5 5v2m-7-9l-4-4-4 4"/></svg>
                        </button>
                        <button className="icon-btn ghost" style={{ width: 24, height: 24, color: '#16A34A', background: '#DCFCE7' }}><Icon d={I.check} size={14}/></button>
                      </div>
                    </div>
                    <div style={{ color: 'var(--ink-900)' }}>Patient reports persistent hip pain radiating to the thigh, exacerbated by movement.</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="card" style={{ padding: 0 }}>
            <div className="card-head" style={{ padding: '16px 20px', borderBottom: '1px solid var(--gray-200)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: '16px', fontWeight: 600, margin: 0, color: 'var(--ink-900)' }}>Patient journey</h2>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button className="icon-btn ghost" style={{ width: 32, height: 32 }}><Icon d={I.search} size={16} /></button>
                <button className="icon-btn ghost" style={{ width: 32, height: 32 }}><Icon d={I.filter} size={16} /></button>
                <button className="icon-btn ghost" style={{ width: 32, height: 32 }}><Icon d={I.edit} size={16} /></button>
              </div>
            </div>
            <div style={{ padding: '24px 20px' }}>
              
              <div className="checklist-step" style={{ display: 'flex', gap: '16px', position: 'relative', paddingBottom: '24px' }}>
                <div className="line" style={{ position: 'absolute', left: 9, top: 24, bottom: 0, width: 2, background: 'var(--brand)' }}></div>
                <div className="step-dot done" style={{ width: 20, height: 20, borderRadius: '50%', background: 'var(--brand)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1, flexShrink: 0, marginTop: 2 }}>
                  <Icon d={I.check} size={12} />
                </div>
                <div className="step-body" style={{ flex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div className="t" style={{ fontWeight: 600, color: 'var(--ink-900)', fontSize: '14px', marginBottom: '2px' }}>Intake</div>
                    <div className="s" style={{ fontSize: '12px', color: 'var(--gray-500)' }}>4 of 4 tasks completed</div>
                  </div>
                  <span className="badge badge-green">Done</span>
                </div>
              </div>

              <div className="checklist-step" style={{ display: 'flex', gap: '16px', position: 'relative', paddingBottom: '24px' }}>
                <div className="line" style={{ position: 'absolute', left: 9, top: 24, bottom: 0, width: 2, background: 'var(--brand)' }}></div>
                <div className="step-dot done" style={{ width: 20, height: 20, borderRadius: '50%', background: 'var(--brand)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1, flexShrink: 0, marginTop: 2 }}>
                  <Icon d={I.check} size={12} />
                </div>
                <div className="step-body" style={{ flex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div className="t" style={{ fontWeight: 600, color: 'var(--ink-900)', fontSize: '14px', marginBottom: '2px' }}>Triage</div>
                    <div className="s" style={{ fontSize: '12px', color: 'var(--gray-500)' }}>2 of 2 tasks completed</div>
                  </div>
                  <span className="badge badge-green">Done</span>
                </div>
              </div>

              <div className="checklist-step" style={{ display: 'flex', gap: '16px', position: 'relative', paddingBottom: '24px' }}>
                <div className="line" style={{ position: 'absolute', left: 9, top: 24, bottom: 0, width: 2, background: 'var(--brand)' }}></div>
                <div className="step-dot done" style={{ width: 20, height: 20, borderRadius: '50%', background: 'var(--brand)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1, flexShrink: 0, marginTop: 2 }}>
                  <Icon d={I.check} size={12} />
                </div>
                <div className="step-body" style={{ flex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div className="t" style={{ fontWeight: 600, color: 'var(--ink-900)', fontSize: '14px', marginBottom: '2px' }}>Consultation</div>
                    <div className="s" style={{ fontSize: '12px', color: 'var(--gray-500)' }}>3 of 3 tasks completed</div>
                  </div>
                  <span className="badge badge-green">Done</span>
                </div>
              </div>

              <div className="checklist-step" style={{ display: 'flex', gap: '16px', position: 'relative', paddingBottom: '24px' }}>
                <div className="line" style={{ position: 'absolute', left: 9, top: 24, bottom: 0, width: 2, background: 'var(--gray-200)' }}></div>
                <div className="step-dot current" style={{ width: 20, height: 20, borderRadius: '50%', background: 'white', border: '2px solid var(--brand)', zIndex: 1, flexShrink: 0, marginTop: 2, position: 'relative' }}>
                  <div style={{ position: 'absolute', inset: 3, background: 'var(--brand)', borderRadius: '50%' }}></div>
                </div>
                <div className="step-body" style={{ flex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div className="t" style={{ fontWeight: 600, color: 'var(--brand)', fontSize: '14px', marginBottom: '2px' }}>Lab</div>
                    <div className="s" style={{ fontSize: '12px', color: 'var(--gray-500)' }}>1 of 3 tasks completed</div>
                  </div>
                  <span className="badge badge-amber">In progress</span>
                </div>
              </div>

              <div className="checklist-step" style={{ display: 'flex', gap: '16px', position: 'relative', paddingBottom: '24px' }}>
                <div className="line" style={{ position: 'absolute', left: 9, top: 24, bottom: 0, width: 2, background: 'var(--gray-200)' }}></div>
                <div className="step-dot pending" style={{ width: 20, height: 20, borderRadius: '50%', background: 'white', border: '2px solid var(--gray-300)', zIndex: 1, flexShrink: 0, marginTop: 2 }}></div>
                <div className="step-body" style={{ flex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center', opacity: 0.5 }}>
                  <div>
                    <div className="t" style={{ fontWeight: 600, color: 'var(--ink-900)', fontSize: '14px', marginBottom: '2px' }}>Pharmacy</div>
                    <div className="s" style={{ fontSize: '12px', color: 'var(--gray-500)' }}>0 of 2 tasks completed</div>
                  </div>
                  <span className="badge badge-gray">Pending</span>
                </div>
              </div>

              <div className="checklist-step" style={{ display: 'flex', gap: '16px', position: 'relative' }}>
                <div className="step-dot pending" style={{ width: 20, height: 20, borderRadius: '50%', background: 'white', border: '2px solid var(--gray-300)', zIndex: 1, flexShrink: 0, marginTop: 2 }}></div>
                <div className="step-body" style={{ flex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center', opacity: 0.5 }}>
                  <div>
                    <div className="t" style={{ fontWeight: 600, color: 'var(--ink-900)', fontSize: '14px', marginBottom: '2px' }}>Discharge</div>
                    <div className="s" style={{ fontSize: '12px', color: 'var(--gray-500)' }}>0 of 1 tasks completed</div>
                  </div>
                  <span className="badge badge-gray">Pending</span>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="card" style={{ padding: 0 }}>
            <div className="card-head" style={{ padding: '16px', borderBottom: '1px solid var(--gray-200)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: '14px', fontWeight: 600, margin: 0, color: 'var(--ink-900)' }}>Key documents</h2>
              <div style={{ display: 'flex', gap: '4px' }}>
                <button className="icon-btn ghost" style={{ width: 28, height: 28 }}><Icon d={I.edit} size={14} /></button>
                <button className="icon-btn ghost" style={{ width: 28, height: 28 }}><Icon d={I.plus} size={14} /></button>
              </div>
            </div>
            
            <div style={{ padding: '8px 0' }}>
              <div className="doc-group-head" style={{ padding: '8px 16px', fontSize: '12px', fontWeight: 600, color: 'var(--gray-500)', display: 'flex', alignItems: 'center', cursor: 'pointer', background: 'var(--gray-50)' }}>
                <span style={{ display: 'inline-block', width: '16px', fontSize: '9px' }}>▼</span> Consent & Legal
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <div className="doc-item" style={{ padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--gray-100)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div className="doc-ic blue" style={{ width: 32, height: 32, borderRadius: '6px', background: '#EFF6FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon d={I.file} size={16} /></div>
                    <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--ink-900)' }}>Consent form.txt</div>
                  </div>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <button className="icon-btn ghost" style={{ width: 28, height: 28, color: 'var(--gray-400)' }}><Icon d={I.eye} size={14} /></button>
                    <button className="icon-btn ghost" style={{ width: 28, height: 28, color: 'var(--gray-400)' }}><Icon d={I.download2} size={14} /></button>
                  </div>
                </div>
                <div className="doc-item" style={{ padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--gray-100)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div className="doc-ic red" style={{ width: 32, height: 32, borderRadius: '6px', background: '#FEF2F2', color: '#DC2626', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon d={I.file} size={16} /></div>
                    <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--ink-900)' }}>Risk certification.pdf</div>
                  </div>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <button className="icon-btn ghost" style={{ width: 28, height: 28, color: 'var(--gray-400)' }}><Icon d={I.eye} size={14} /></button>
                    <button className="icon-btn ghost" style={{ width: 28, height: 28, color: 'var(--gray-400)' }}><Icon d={I.download2} size={14} /></button>
                  </div>
                </div>
                <div className="doc-item" style={{ padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div className="doc-ic blue" style={{ width: 32, height: 32, borderRadius: '6px', background: '#EFF6FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon d={I.file} size={16} /></div>
                    <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--ink-900)' }}>DNRForm.txt</div>
                  </div>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <button className="icon-btn ghost" style={{ width: 28, height: 28, color: 'var(--gray-400)' }}><Icon d={I.eye} size={14} /></button>
                    <button className="icon-btn ghost" style={{ width: 28, height: 28, color: 'var(--gray-400)' }}><Icon d={I.download2} size={14} /></button>
                  </div>
                </div>
              </div>

              <div className="doc-group-head" style={{ padding: '8px 16px', fontSize: '12px', fontWeight: 600, color: 'var(--gray-500)', display: 'flex', alignItems: 'center', cursor: 'pointer', background: 'var(--gray-50)', borderTop: '1px solid var(--gray-200)' }}>
                <span style={{ display: 'inline-block', width: '16px', fontSize: '9px' }}>▼</span> Diagnostics
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <div className="doc-item" style={{ padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--gray-100)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div className="doc-ic red" style={{ width: 32, height: 32, borderRadius: '6px', background: '#FEF2F2', color: '#DC2626', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon d={I.file} size={16} /></div>
                    <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--ink-900)' }}>Labs12.05.pdf</div>
                  </div>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <button className="icon-btn ghost" style={{ width: 28, height: 28, color: 'var(--gray-400)' }}><Icon d={I.eye} size={14} /></button>
                    <button className="icon-btn ghost" style={{ width: 28, height: 28, color: 'var(--gray-400)' }}><Icon d={I.download2} size={14} /></button>
                  </div>
                </div>
                <div className="doc-item" style={{ padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div className="doc-ic blue" style={{ width: 32, height: 32, borderRadius: '6px', background: '#EFF6FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon d={I.file} size={16} /></div>
                    <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--ink-900)' }}>X-rayPelvis.txt</div>
                  </div>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <button className="icon-btn ghost" style={{ width: 28, height: 28, color: 'var(--gray-400)' }}><Icon d={I.eye} size={14} /></button>
                    <button className="icon-btn ghost" style={{ width: 28, height: 28, color: 'var(--gray-400)' }}><Icon d={I.download2} size={14} /></button>
                  </div>
                </div>
              </div>

              <div className="doc-group-head" style={{ padding: '8px 16px', fontSize: '12px', fontWeight: 600, color: 'var(--gray-500)', display: 'flex', alignItems: 'center', cursor: 'pointer', background: 'var(--gray-50)', borderTop: '1px solid var(--gray-200)' }}>
                <span style={{ display: 'inline-block', width: '16px', fontSize: '9px' }}>▶</span> Medication & Risk
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
