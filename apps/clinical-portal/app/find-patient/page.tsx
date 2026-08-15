import Link from 'next/link';
import { Card, EmptyState, Icon, Notice, StatusBadge } from '@medichain/design-system/web';
import { backendPost, clinicalSession } from '@/lib/backend';

type PatientMatch = { id: string; displayName: string; phoneMasked?: string; facilityId?: string; dateOfBirth?: string };
type SearchResponse = { status: 'matched' | 'ambiguous' | 'none'; patientId?: string; candidates: string[]; matches?: PatientMatch[] };

const searchBody = (query: string) => /^\+?\d[\d\s-]+$/.test(query) ? { phone: query.replace(/[\s-]/g, '') } : { name: query };

export default async function FindPatientPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const session = await clinicalSession();
  const { q = '' } = await searchParams;
  const query = q.trim();
  const allowed = session?.actor.role === 'doctor';
  const result = allowed && query.length >= 2 ? await backendPost<SearchResponse>('/api/clinical/patients/match', searchBody(query), [404, 409]) : null;
  const matches: PatientMatch[] = result?.ok ? result.data.matches ?? result.data.candidates.map(id => ({ id, displayName: 'Identity details unavailable' })) : [];

  return <>
    <header className="mc-page-head"><div><p className="mc-eyebrow">Step 1 of 3</p><h1>Find the correct patient</h1><p className="mc-lead">Search by full name or Sierra Leone phone number. Every plausible match remains separate for a staff member to confirm—MediChain never selects the top result silently.</p></div><StatusBadge tone="primary">Human confirmation required</StatusBadge></header>
    <form className="mc-search-form" role="search"><div className="mc-field"><label htmlFor="patient-search">Patient search</label><input id="patient-search" className="mc-search-input" name="q" defaultValue={query} minLength={2} required placeholder="Full name or +232 phone number" autoComplete="off" /></div><button className="mc-button" type="submit" disabled={!allowed}><Icon name="search" size={17} /> Search securely</button></form>
    {!session ? <Notice tone="warning" title="MFA sign-in required">Sign in before searching for any patient identity.</Notice> : null}
    {session?.actor.role === 'nurse' ? <Notice tone="warning" title="Patient search is not enabled for nurses">Nurse record access remains blocked until the clinical-governance permission decision is approved.</Notice> : null}
    {result && !result.ok ? <Notice tone="danger" title="Patient matching unavailable">The service did not return a safe, readable response. No match was guessed.</Notice> : null}
    {result?.ok && result.data.status === 'none' ? <Card><EmptyState icon="search" title="No matching patient">Check the spelling or phone number. New registration must still pass the duplicate-check gate.</EmptyState></Card> : null}
    {result?.ok && matches.length > 0 ? <><Notice tone={result.data.status === 'ambiguous' ? 'warning' : 'info'} title={result.data.status === 'ambiguous' ? 'Multiple possible patients' : 'Confirm this identity'}>{result.data.status === 'ambiguous' ? 'Compare the details side by side and choose only after an in-person identity check.' : 'One likely match was found, but a human must still confirm it.'}</Notice><section className="mc-card-grid" aria-label="Possible patient matches">{matches.map(match => <Card className="mc-patient-card" key={match.id}><div><p className="mc-patient-id">Facility record {match.facilityId ?? match.id}</p><h2>{match.displayName}</h2></div><div className="mc-patient-meta"><span><em>Phone</em><strong>{match.phoneMasked ?? 'Not displayed'}</strong></span><span><em>Date of birth</em><strong>{match.dateOfBirth ?? 'Confirm in person'}</strong></span></div><Link className="mc-button" href={`/patients/${encodeURIComponent(match.id)}`} prefetch={false}>Confirm and open <Icon name="shield" size={16} /></Link></Card>)}</section></> : null}
    {!result && allowed && query.length < 2 ? <Card><EmptyState icon="search" title="Start with a patient identifier">Enter at least two characters. Search results are not preloaded, which reduces unnecessary patient-data transfer.</EmptyState></Card> : null}
  </>;
}
