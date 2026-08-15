import Link from 'next/link';
import { Card, CardHeading, Icon, Notice, StatusBadge } from '@medichain/design-system/web';
import { clinicalSession } from '@/lib/backend';

export default async function UploadPage({ searchParams }: { searchParams: Promise<{ patientId?: string }> }) {
  const session = await clinicalSession();
  const { patientId } = await searchParams;
  if (!session) return <><header className="mc-page-head"><div><p className="mc-eyebrow">Secure workflow</p><h1>Upload or add a record</h1></div></header><Notice tone="warning" title="MFA sign-in required">Sign in before record creation can begin.</Notice></>;
  if (session.actor.role !== 'doctor') return <><header className="mc-page-head"><div><p className="mc-eyebrow">Permission controlled</p><h1>Record creation unavailable</h1></div><StatusBadge tone="warning">Read-only</StatusBadge></header><Notice tone="warning" title="Nurse write access is disabled">The governance flag defaults to false. No upload control is rendered unless both policy and backend permission are approved.</Notice></>;

  return <>
    <header className="mc-page-head"><div><p className="mc-eyebrow">Step 3 of 3</p><h1>Upload or add a record</h1><p className="mc-lead">The file remains visibly pending through quarantine, malware scan, encryption, audit, and integrity anchoring. MediChain never reports instant success.</p></div><StatusBadge tone={patientId ? 'primary' : 'warning'}>{patientId ? 'Patient selected' : 'Patient required'}</StatusBadge></header>
    {!patientId ? <Notice tone="warning" title="Choose a verified patient first">Search, confirm the identity in person, and establish the required care relationship and write consent before choosing a file.</Notice> : null}
    <div className="mc-two-column"><Card><CardHeading icon="upload" title="Record file" /><div className="mc-kv-list"><div className="mc-kv-row"><span>Accepted</span><strong>PDF, JPEG, PNG</strong></div><div className="mc-kv-row"><span>Maximum size</span><strong>25 MB</strong></div><div className="mc-kv-row"><span>Upload target</span><strong>Encrypted quarantine</strong></div></div><div className="mc-notice"><span className="mc-notice-icon"><Icon name="lock" /></span><div><strong>Direct upload stays locked</strong><p>The relationship and exact write consent must be confirmed by the backend before a short-lived upload URL is issued.</p></div></div>{patientId ? <button className="mc-button" disabled>Authorization check pending</button> : <Link className="mc-button" href="/find-patient">Find a patient first</Link>}</Card><Card><CardHeading icon="activity" title="Honest processing lifecycle" /><div className="mc-kv-list"><div className="mc-kv-row"><span>1</span><strong>Uploading</strong></div><div className="mc-kv-row"><span>2</span><strong>Scanning</strong></div><div className="mc-kv-row"><span>3</span><strong>Pending verification</strong></div><div className="mc-kv-row"><span>4</span><strong>Available</strong></div></div></Card></div>
  </>;
}
