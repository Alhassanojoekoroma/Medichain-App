import Link from 'next/link';
import { Card, CardHeading, EmptyState, Icon, Notice, StatusBadge, SyncStatus } from '@medichain/design-system/web';
import { backendGet, clinicalSession, type BackendResult } from '@/lib/backend';

type Tasks = { tasks?: unknown[] };
type Requests = { requests?: unknown[] };
type Uploads = { uploads?: unknown[] };

export default async function HomePage() {
  const session = await clinicalSession();
  if (!session) return <SignedOut />;
  const [tasks, requests, uploads] = await Promise.all([
    backendGet<Tasks>('/api/clinical/tasks'),
    backendGet<Requests>('/api/access-requests?scope=initiated'),
    backendGet<Uploads>('/api/records/uploads?scope=mine'),
  ]);
  const live = tasks.ok && requests.ok && uploads.ok;

  return <>
    <header className="mc-page-head">
      <div><p className="mc-eyebrow">Clinical workspace</p><h1>Good day, {session.actor.fullName ?? (session.actor.role === 'doctor' ? 'Doctor' : 'Nurse')}</h1><p className="mc-lead">Your focused work queue contains only actions authorized for your role and current facility.</p></div>
      <SyncStatus state={live ? 'live' : 'offline'} lastUpdated={live ? 'just now' : undefined} />
    </header>
    {!live ? <Notice tone="warning" title="Some live services are unavailable">No values have been guessed. Each unavailable card stays visibly unconfirmed until the clinical API reconnects.</Notice> : null}
    <section className="mc-card-grid" aria-label="Work summary">
      <Summary title="Assigned patients" icon="users" result={tasks} keyName="tasks" empty="No assigned or recently-seen patients." />
      <Summary title="Consent requests" icon="shield" result={requests} keyName="requests" empty="No consent decisions are waiting." />
      <Summary title="Record processing" icon="upload" result={uploads} keyName="uploads" empty="No records are currently processing." />
    </section>
  </>;
}

function SignedOut() {
  const configuredUrl = process.env.CLINICAL_OIDC_LOGIN_URL?.trim();
  const loginUrl = configuredUrl?.startsWith('https://') ? configuredUrl : null;
  return <>
    <header className="mc-page-head"><div><p className="mc-eyebrow">Secure clinical access</p><h1>Patient records begin with verified staff identity.</h1><p className="mc-lead">Doctors and nurses sign in through the hospital identity provider with MFA. No clinical data is cached or displayed before that check succeeds.</p></div><StatusBadge tone="neutral">Signed out</StatusBadge></header>
    <div className="mc-two-column">
      <Card><EmptyState icon="lock" title="Sign in to continue">{loginUrl ? 'Use your hospital workforce account and second factor.' : 'The managed OIDC provider is not configured in this environment.'}</EmptyState>{loginUrl ? <Link className="mc-button" href={loginUrl}>Continue to secure sign in <Icon name="lock" size={16} /></Link> : <button className="mc-button" disabled>Secure sign in unavailable</button>}</Card>
      <Card><CardHeading icon="shield" title="Protected by default" /><div className="mc-kv-list"><div className="mc-kv-row"><span>Workforce identity</span><strong>OIDC</strong></div><div className="mc-kv-row"><span>Second factor</span><strong>Required</strong></div><div className="mc-kv-row"><span>Patient data</span><strong>Not loaded</strong></div><div className="mc-kv-row"><span>Session state</span><strong>Signed out</strong></div></div></Card>
    </div>
  </>;
}

function Summary({ title, icon, result, keyName, empty }: { title: string; icon: 'users' | 'shield' | 'upload'; result: BackendResult<Record<string, unknown[]>>; keyName: string; empty: string }) {
  const items = result.ok && Array.isArray(result.data[keyName]) ? result.data[keyName] : null;
  return <Card><CardHeading icon={icon} title={title} action={<StatusBadge tone={result.ok ? 'success' : 'warning'}>{result.ok ? 'Live' : 'Unavailable'}</StatusBadge>} />
    <div className="mc-metric"><strong>{items ? items.length : '—'}</strong><span>{items?.length === 1 ? 'item' : 'items'}</span></div>
    <p className="mc-muted">{items ? (items.length ? 'Open this workflow to review the current items.' : empty) : 'Waiting for a confirmed response from the clinical API.'}</p>
    <div className={`mc-meter${items?.length ? '' : ' is-empty'}`} aria-hidden="true"><span /></div>
  </Card>;
}
