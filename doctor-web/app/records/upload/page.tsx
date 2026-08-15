'use client';

import { useState, useRef, FormEvent } from 'react';
import { useRouter } from 'next/navigation';

function Icon({ d, size = 16 }: { d: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true" dangerouslySetInnerHTML={{ __html: d }} />
  );
}
const I = {
  chevL:     '<path d="M15 18l-6-6 6-6"/>',
  upload:    '<path d="M12 16V4M7 9l5-5 5 5"/><path d="M5 15v5h14v-5"/>',
  file:      '<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5"/>',
  x:         '<path d="M18 6L6 18M6 6l12 12"/>',
  check:     '<path d="M20 6L9 17l-5-5"/>',
  shield:    '<path d="M12 2 20 5v6c0 5-3.4 9.2-8 11-4.6-1.8-8-6-8-11V5z"/><path d="m8.5 12 2.2 2.2 4.8-5"/>',
  sparkles:  '<path d="M12 2l1.5 4.5L18 8l-4.5 1.5L12 14l-1.5-4.5L6 8l4.5-1.5z"/><path d="M5 14.5l.75 2.25L8 17.5l-2.25.75L5 20.5l-.75-2.25L2 17.5l2.25-.75z"/>',
  chevD:     '<path d="M6 9l6 6 6-6"/>',
  search:    '<circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/>',
};

const RECORD_TYPES = ['Consultation', 'Lab Result', 'Prescription', 'Radiology', 'Surgical Report', 'Discharge Summary', 'Referral', 'Other'];

interface UploadedFile { name: string; size: number; type: string; }

export default function RecordsUploadPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [dragging, setDragging] = useState(false);
  const [patientSearch, setPatientSearch] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<string | null>(null);
  const [recordType, setRecordType] = useState('');
  const [description, setDescription] = useState('');
  const [aiSummary, setAiSummary] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiConfirmed, setAiConfirmed] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [done, setDone] = useState(false);

  function handleFiles(fileList: FileList | null) {
    if (!fileList) return;
    const newFiles: UploadedFile[] = Array.from(fileList).map(f => ({
      name: f.name, size: f.size, type: f.type,
    }));
    setFiles(prev => [...prev, ...newFiles]);
  }

  function removeFile(idx: number) {
    setFiles(prev => prev.filter((_, i) => i !== idx));
  }

  function formatBytes(b: number) {
    if (b < 1024) return `${b} B`;
    if (b < 1048576) return `${(b / 1024).toFixed(1)} KB`;
    return `${(b / 1048576).toFixed(1)} MB`;
  }

  async function requestAiSummary() {
    setAiLoading(true);
    // Simulate AI processing (real impl calls the AI service endpoint)
    await new Promise(r => setTimeout(r, 1800));
    setAiSummary(`Patient presents for ${recordType || 'consultation'}. ${description || 'Clinical notes pending physician review.'}  Assessment and management plan documented. Follow-up in 2 weeks. Records anchored for audit.`);
    setAiLoading(false);
  }

  async function handleUpload(e: FormEvent) {
    e.preventDefault();
    if (!selectedPatient || !recordType || files.length === 0) return;
    setUploading(true);
    // Real implementation: call backendApi.uploadRecord(...)
    await new Promise(r => setTimeout(r, 2200));
    setUploading(false);
    setDone(true);
  }

  const MOCK_PATIENTS = [
    { id: '1001', name: 'Fatima Koroma' },
    { id: '1002', name: 'Ibrahim Bangura' },
    { id: '1003', name: 'Aminata Sesay' },
    { id: '1004', name: 'Mohamed Conteh' },
    { id: '1005', name: 'Mariatu Kamara' },
  ].filter(p => p.name.toLowerCase().includes(patientSearch.toLowerCase()));

  // Done state
  if (done) return (
    <div className="page-body" style={{ padding: '28px 32px', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
      <div style={{ textAlign: 'center', maxWidth: 480 }}>
        <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'var(--green-100)', color: 'var(--green-600)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
          <Icon d={I.check} size={36} />
        </div>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 700, marginBottom: 10 }}>Record uploaded successfully</h2>
        <p style={{ color: 'var(--gray-500)', lineHeight: 1.6, marginBottom: 24 }}>
          The medical record has been uploaded and is pending blockchain anchoring. It will be verifiable on Hyperledger Fabric within 2–3 minutes.
        </p>
        <div className="mc-chain-badge" style={{ justifyContent: 'center', marginBottom: 24 }}>
          <Icon d={I.shield} size={14} />
          <span><strong>Hyperledger Fabric</strong><small> · Anchoring in progress…</small></span>
        </div>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
          <button className="btn btn-outline" onClick={() => router.push('/records')}>
            View records
          </button>
          <button className="btn btn-primary" onClick={() => { setDone(false); setFiles([]); setStep(1); setSelectedPatient(null); setRecordType(''); setDescription(''); setAiSummary(''); setAiConfirmed(false); }}>
            Upload another
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="page-body" style={{ padding: '28px 32px' }}>

      {/* Header */}
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button className="btn btn-outline" style={{ padding: '8px 12px' }} onClick={() => router.back()}>
            <Icon d={I.chevL} size={16} /> Back
          </button>
          <h1 className="page-title">Upload Medical Record</h1>
        </div>
      </div>

      {/* Step indicator */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginBottom: 28, maxWidth: 500 }}>
        {[
          { n: 1, label: 'Select patient' },
          { n: 2, label: 'Upload files' },
          { n: 3, label: 'Review & submit' },
        ].map(({ n, label }, i) => (
          <>
            <div key={n} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{
                width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 800, fontSize: 13,
                background: step > n ? 'var(--brand)' : step === n ? 'var(--brand)' : 'var(--gray-100)',
                color: step >= n ? '#fff' : 'var(--gray-500)',
                transition: 'background .2s',
              }}>
                {step > n ? <Icon d={I.check} size={15} /> : n}
              </div>
              <span style={{ fontSize: 13, fontWeight: step === n ? 700 : 500, color: step === n ? 'var(--ink-900)' : 'var(--gray-500)' }}>
                {label}
              </span>
            </div>
            {i < 2 && (
              <div style={{ flex: 1, height: 2, background: step > n + 1 ? 'var(--brand)' : 'var(--gray-200)', margin: '0 8px', borderRadius: 2, transition: 'background .2s' }} />
            )}
          </>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20, alignItems: 'start' }}>

        {/* Main form */}
        <form onSubmit={handleUpload}>

          {/* STEP 1 — Select patient */}
          <div className="card" style={{ marginBottom: 16 }}>
            <div className="card-head">
              <div className="card-title">
                <span className="ic" style={{ background: step >= 1 ? 'var(--brand-light)' : 'var(--gray-100)', color: step >= 1 ? 'var(--brand)' : 'var(--gray-400)' }}>1</span>
                Select patient
              </div>
            </div>
            {selectedPatient ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--brand-light)', borderRadius: 14, padding: '12px 16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 12, background: 'var(--brand)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 16, flexShrink: 0 }}>
                    {selectedPatient[0]}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700 }}>{selectedPatient}</div>
                    <div style={{ fontSize: 12, color: 'var(--brand-dark)' }}>Patient selected</div>
                  </div>
                </div>
                <button type="button" className="icon-btn ghost" style={{ width: 34, height: 34 }} onClick={() => setSelectedPatient(null)}>
                  <Icon d={I.x} size={14} />
                </button>
              </div>
            ) : (
              <>
                <label className="search" htmlFor="patient-search" style={{ marginBottom: 12 }}>
                  <Icon d={I.search} size={16} />
                  <input id="patient-search" placeholder="Search patient by name or ID…" value={patientSearch} onChange={e => setPatientSearch(e.target.value)} />
                </label>
                {patientSearch && (
                  <div style={{ border: '1px solid var(--gray-200)', borderRadius: 16, overflow: 'hidden' }}>
                    {MOCK_PATIENTS.length > 0 ? MOCK_PATIENTS.map(p => (
                      <button key={p.id} type="button" onClick={() => { setSelectedPatient(p.name); setStep(2); setPatientSearch(''); }}
                        style={{ width: '100%', textAlign: 'left', padding: '12px 16px', border: 'none', background: '#fff', cursor: 'pointer', borderTop: '1px solid var(--gray-100)', display: 'flex', gap: 12, alignItems: 'center', minHeight: 44 }}>
                        <div style={{ width: 34, height: 34, borderRadius: 10, background: 'var(--brand-light)', color: 'var(--brand)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, flexShrink: 0 }}>{p.name[0]}</div>
                        <div><div style={{ fontWeight: 700 }}>{p.name}</div><div style={{ fontSize: 12, color: 'var(--gray-500)' }}>ID: {p.id}</div></div>
                      </button>
                    )) : (
                      <div style={{ padding: '16px', textAlign: 'center', color: 'var(--gray-500)', fontSize: 13.5 }}>No patients found</div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>

          {/* STEP 2 — Upload files */}
          <div className="card" style={{ marginBottom: 16, opacity: !selectedPatient ? .5 : 1 }}>
            <div className="card-head">
              <div className="card-title">
                <span className="ic" style={{ background: step >= 2 ? 'var(--brand-light)' : 'var(--gray-100)', color: step >= 2 ? 'var(--brand)' : 'var(--gray-400)' }}>2</span>
                Upload files
              </div>
            </div>

            {/* Drag-drop zone */}
            <div
              onDragOver={e => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={e => { e.preventDefault(); setDragging(false); handleFiles(e.dataTransfer.files); if (step < 2) setStep(2); }}
              onClick={() => fileInputRef.current?.click()}
              style={{
                border: `2px dashed ${dragging ? 'var(--brand)' : 'var(--gray-200)'}`,
                borderRadius: 20,
                padding: '32px 20px',
                textAlign: 'center',
                cursor: 'pointer',
                background: dragging ? 'var(--brand-light)' : 'var(--gray-50)',
                transition: 'border-color .15s, background .15s',
                marginBottom: 16,
              }}
            >
              <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'var(--brand-light)', color: 'var(--brand)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                <Icon d={I.upload} size={24} />
              </div>
              <div style={{ fontWeight: 700, marginBottom: 6 }}>Drop files here or click to upload</div>
              <div style={{ fontSize: 13, color: 'var(--gray-500)' }}>PDF, JPG, PNG up to 10 MB each</div>
              <input ref={fileInputRef} type="file" multiple accept=".pdf,.jpg,.jpeg,.png,.txt" style={{ display: 'none' }} onChange={e => { handleFiles(e.target.files); if (step < 2) setStep(2); }} />
            </div>

            {/* File list */}
            {files.map((f, i) => (
              <div key={i} className="kv-row">
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 34, height: 34, borderRadius: 10, background: 'var(--brand-light)', color: 'var(--brand)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Icon d={I.file} size={16} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 13.5 }}>{f.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--gray-500)' }}>{formatBytes(f.size)}</div>
                  </div>
                </div>
                <button type="button" className="icon-btn ghost" style={{ width: 32, height: 32 }} onClick={() => removeFile(i)}>
                  <Icon d={I.x} size={14} />
                </button>
              </div>
            ))}
          </div>

          {/* STEP 3 — Metadata + AI + Submit */}
          <div className="card" style={{ opacity: files.length === 0 ? .5 : 1 }}>
            <div className="card-head">
              <div className="card-title">
                <span className="ic" style={{ background: step >= 3 ? 'var(--brand-light)' : 'var(--gray-100)', color: step >= 3 ? 'var(--brand)' : 'var(--gray-400)' }}>3</span>
                Record details & submit
              </div>
            </div>

            {/* Record type */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 13.5, fontWeight: 600, marginBottom: 8, color: 'var(--ink-700)' }} htmlFor="record-type">
                Record type *
              </label>
              <div style={{ position: 'relative' }}>
                <select
                  id="record-type"
                  className="portal-field"
                  style={{ paddingRight: 40, appearance: 'none', cursor: 'pointer' }}
                  value={recordType}
                  onChange={e => setRecordType(e.target.value)}
                  required
                >
                  <option value="">Select record type…</option>
                  {RECORD_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                <span style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--gray-500)' }}>
                  <Icon d={I.chevD} size={16} />
                </span>
              </div>
            </div>

            {/* Clinical notes */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 13.5, fontWeight: 600, marginBottom: 8, color: 'var(--ink-700)' }} htmlFor="description">
                Clinical notes
              </label>
              <textarea
                id="description"
                className="portal-field"
                style={{ minHeight: 120, resize: 'vertical' }}
                placeholder="Add clinical notes, diagnosis, or additional context…"
                value={description}
                onChange={e => setDescription(e.target.value)}
              />
            </div>

            {/* AI Assist panel */}
            <div className="mc-ai-panel" style={{ marginBottom: 20 }}>
              <div className="mc-ai-panel-head">
                <Icon d={I.sparkles} size={18} />
                AI Report Assist
                <span style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--gray-500)', fontWeight: 500 }}>
                  Review before saving
                </span>
              </div>
              {aiLoading ? (
                <div className="mc-skeleton" style={{ height: 60 }} />
              ) : aiSummary && !aiConfirmed ? (
                <div>
                  <div className="kv-row" style={{ marginBottom: 10 }}>
                    <div>
                      <div style={{ fontSize: 11.5, color: 'var(--gray-500)', marginBottom: 2 }}>AI-generated summary</div>
                      <div style={{ fontSize: 13.5, fontWeight: 600 }}>{aiSummary}</div>
                    </div>
                  </div>
                  <div className="mc-ai-confirm-row">
                    <button type="button" className="btn btn-soft" style={{ padding: '8px 14px', fontSize: 13 }} onClick={() => { setAiSummary(''); }}>
                      Revert
                    </button>
                    <button type="button" className="btn btn-primary" style={{ flex: 1, fontSize: 13 }} onClick={() => { setDescription(aiSummary); setAiConfirmed(true); }}>
                      <Icon d={I.check} size={14} /> Use this summary
                    </button>
                  </div>
                </div>
              ) : aiConfirmed ? (
                <div className="mc-notice info">
                  <Icon d={I.sparkles} size={16} />
                  <div><strong>AI summary applied</strong><p>The AI-generated summary has been added to the clinical notes.</p></div>
                </div>
              ) : (
                <button type="button" className="btn btn-soft btn-full" onClick={requestAiSummary} disabled={!description && !recordType} style={{ fontSize: 13.5 }}>
                  <Icon d={I.sparkles} size={16} />
                  Generate AI summary from notes
                </button>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="btn btn-primary btn-full"
              disabled={!selectedPatient || !recordType || files.length === 0 || uploading}
              style={{ fontSize: 15, fontWeight: 700 }}
              onClick={() => files.length > 0 && step < 3 && setStep(3)}
            >
              {uploading ? (
                <>
                  <span style={{ width: 16, height: 16, borderRadius: '50%', border: '2px solid rgba(255,255,255,.3)', borderTopColor: '#fff', display: 'inline-block', animation: 'spin .7s linear infinite' }} />
                  Uploading and anchoring…
                </>
              ) : (
                <>
                  <Icon d={I.upload} size={16} />
                  Upload record
                </>
              )}
            </button>
          </div>
        </form>

        {/* Right sidebar — guidance */}
        <div>
          <div className="card" style={{ marginBottom: 16 }}>
            <div className="card-head">
              <div className="card-title">
                <span className="ic"><Icon d={I.shield} size={16} /></span>
                Blockchain anchoring
              </div>
            </div>
            <div style={{ fontSize: 13, color: 'var(--gray-600)', lineHeight: 1.6 }}>
              Every record uploaded through MediChain SL is cryptographically anchored on Hyperledger Fabric within minutes. Once anchored, the record becomes tamper-evident and verifiable by the patient, MoH, and authorised facilities.
            </div>
            <div style={{ marginTop: 14 }}>
              <div className="checklist-step">
                <div className="line" />
                <div className="step-dot done"><Icon d={I.check} size={11} /></div>
                <div><div className="t">Record uploaded</div><div className="s">Stored securely on-server</div></div>
              </div>
              <div className="checklist-step">
                <div className="line" />
                <div className="step-dot current" />
                <div><div className="t">Hash generated</div><div className="s">SHA-256 fingerprint created</div></div>
              </div>
              <div className="checklist-step">
                <div className="step-dot pending" />
                <div><div className="t">Fabric anchor</div><div className="s">Written to national ledger</div></div>
              </div>
            </div>
          </div>

          <div className="mc-notice info">
            <Icon d={I.shield} size={16} />
            <div>
              <strong>Data protection</strong>
              <p>All uploads are encrypted in transit (TLS 1.3) and at rest. Compliant with Sierra Leone data protection guidelines.</p>
            </div>
          </div>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
