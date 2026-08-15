import Link from 'next/link';
import { Card, CardHeading, EmptyState, Icon, Notice, StatusBadge, VerifiedOnChain } from '@medichain/design-system/web';
import { backendGet, clinicalSession } from '@/lib/backend';

type Patient = { id: string; fullName: string; dob?: string; phone?: string; email?: string; bloodType?: string; allergies?: unknown; medications?: unknown; chronicConditions?: unknown };
type RecordItem = { id: string; record_type?: string; title?: string; integrity_hash?: string; created_at?: string };
type Treatment = { id: string; title?: string; treatment_type?: string; doctor_name?: string; created_at?: string; ledger_tx_hash?: string };
type PatientChart = { patient: Patient; records: RecordItem[]; treatments: Treatment[]; actorRole: string };

const textList = (value: unknown) => Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string' && item.trim().length > 0) : [];
const displayDate = (value?: string) => {
  if (!value) return 'Not recorded';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'Not recorded' : new Intl.DateTimeFormat('en-SL', { dateStyle: 'medium' }).format(date);
};

export default async function PatientPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await clinicalSession();
  const { id } = await params;
  if (!session) return <Notice tone="warning" title="MFA sign-in required">Sign in before opening a patient chart.</Notice>;
  const result = await backendGet<PatientChart>(`/api/access/patient/${encodeURIComponent(id)}`);
  if (!result.ok) return <><header className="mc-page-head"><div><p className="mc-eyebrow">Patient record</p><h1>Chart unavailable</h1></div><StatusBadge tone={result.code === 'FORBIDDEN' ? 'danger' : 'warning'}>{result.code === 'FORBIDDEN' ? 'Access denied' : 'Unavailable'}</StatusBadge></header><Notice tone={result.code === 'FORBIDDEN' ? 'danger' : 'warning'} title={result.code === 'FORBIDDEN' ? 'Care relationship or consent required' : 'The clinical service is unavailable'}>No patient details or records have been cached as current. Return to search and retry after the authorization state is confirmed.</Notice></>;

  const { patient, records = [], treatments = [] } = result.data;
  const allergies = textList(patient.allergies);
  const medications = textList(patient.medications);
  const conditions = textList(patient.chronicConditions);
  return <>
    <header className="mc-page-head"><div><p className="mc-eyebrow">Confirmed patient · {patient.id}</p><h1>{patient.fullName}</h1><p className="mc-lead">Only the fields and records returned through the centralized consent and care-relationship policy are shown.</p></div><StatusBadge tone="success">Authorized view</StatusBadge></header>
    <div className="mc-two-column"><Card className="mc-patient-card"><CardHeading icon="users" title="Patient information" /><div className="mc-kv-list"><div className="mc-kv-row"><span>Date of birth</span><strong>{displayDate(patient.dob)}</strong></div><div className="mc-kv-row"><span>Phone</span><strong>{patient.phone ?? 'Not recorded'}</strong></div><div className="mc-kv-row"><span>Blood type</span><strong>{patient.bloodType ?? 'Not recorded'}</strong></div></div>{session.actor.role === 'doctor' ? <Link className="mc-button" href={`/upload?patientId=${encodeURIComponent(patient.id)}`} prefetch={false}><Icon name="upload" size={16} /> Continue to record upload</Link> : null}</Card><Card><CardHeading icon="activity" title="Key clinical overview" /><div className="mc-kv-list"><div className="mc-kv-row"><span>Allergies</span><strong>{allergies.join(', ') || 'None recorded'}</strong></div><div className="mc-kv-row"><span>Current medications</span><strong>{medications.join(', ') || 'None recorded'}</strong></div><div className="mc-kv-row"><span>Chronic conditions</span><strong>{conditions.join(', ') || 'None recorded'}</strong></div></div></Card></div>
    <section className="mc-card-grid" aria-label="Patient records and treatments"><Card><CardHeading icon="file" title="Key records" action={<StatusBadge tone="neutral">{records.length}</StatusBadge>} />{records.length ? <div className="mc-record-list">{records.map(record => <div className="mc-record-item" key={record.id}><span className="mc-icon-circle"><Icon name="file" size={16} /></span><div className="mc-record-copy"><strong>{record.title ?? record.record_type ?? 'Clinical record'}</strong><small>{displayDate(record.created_at)}</small></div>{record.integrity_hash ? <VerifiedOnChain /> : <StatusBadge tone="warning">Anchor pending</StatusBadge>}</div>)}</div> : <EmptyState icon="file" title="No records available">No active records were returned for this authorized view.</EmptyState>}</Card><Card><CardHeading icon="activity" title="Treatment history" action={<StatusBadge tone="neutral">{treatments.length}</StatusBadge>} />{treatments.length ? <div className="mc-record-list">{treatments.map(item => <div className="mc-record-item" key={item.id}><span className="mc-icon-circle"><Icon name="activity" size={16} /></span><div className="mc-record-copy"><strong>{item.title ?? item.treatment_type ?? 'Treatment'}</strong><small>{item.doctor_name ?? 'Clinician'} · {displayDate(item.created_at)}</small></div>{item.ledger_tx_hash ? <VerifiedOnChain /> : null}</div>)}</div> : <EmptyState icon="activity" title="No treatment history">No treatment items were returned for this view.</EmptyState>}</Card><Card><CardHeading icon="shield" title="Access basis" /><div className="mc-kv-list"><div className="mc-kv-row"><span>Role</span><strong>{result.data.actorRole}</strong></div><div className="mc-kv-row"><span>Policy</span><strong>Centralized</strong></div><div className="mc-kv-row"><span>Audit event</span><strong>Recorded</strong></div></div></Card></section>
  </>;
}
