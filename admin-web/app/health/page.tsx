'use client';

import { useCallback, useEffect, useState } from 'react';
import ProtectedRoute from '@/components/shared/ProtectedRoute';

type Health = { status: string; dependencies: Record<string, string>; checkedAt: string };
type Readiness = { assessment: { decision: string; verified: number; total: number; blockers: string[] } };
type Metrics = { metrics: { requests: number; errors: number; p95Ms: number; errorRatePercent: number }; targets: { ordinaryP95Ms: number; errorRatePercent: number } };

export default function AdminHealthMonitor() {
  const [data, setData] = useState<{ health: Health; readiness: Readiness; metrics: Metrics } | null>(null);
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading');
  const load = useCallback(async () => {
    try {
      const responses = await Promise.all(['/api/operations/dependency-health', '/api/operations/readiness', '/api/operations/metrics'].map(url => fetch(url, { cache: 'no-store' })));
      const bodies = await Promise.all(responses.map(response => response.json()));
      if (responses.slice(1).some(response => !response.ok)) throw new Error('operations unavailable');
      setData({ health: bodies[0], readiness: bodies[1], metrics: bodies[2] });
      setState('ready');
    } catch { setState('error'); }
  }, []);
  useEffect(() => { void load(); }, [load]);

  return <ProtectedRoute allowedRoles={['admin']}>
    <main className="min-h-screen bg-[#EAEEF2] p-4 sm:p-8" aria-labelledby="operations-title">
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div><h1 id="operations-title" className="text-2xl font-bold text-slate-950">Pilot operations and readiness</h1><p className="mt-1 text-slate-700">Measured service evidence. Pending gates are not approvals.</p></div>
          <button onClick={() => { setState('loading'); void load(); }} disabled={state === 'loading'} className="rounded-lg bg-slate-950 px-4 py-2 font-semibold text-white disabled:opacity-60">{state === 'loading' ? 'Checking…' : 'Refresh evidence'}</button>
        </div>
        <div aria-live="polite" className="mt-6">
          {state === 'loading' && <p role="status">Checking operational evidence…</p>}
          {state === 'error' && <section role="alert" className="rounded-xl border border-red-300 bg-red-50 p-5"><h2 className="font-bold">Operational evidence unavailable</h2><p>No readiness decision changed. Check the approved operations channel and retry.</p></section>}
          {state === 'ready' && data && <div className="space-y-5">
            <section className="rounded-xl border bg-white p-5" aria-labelledby="release-title"><h2 id="release-title" className="font-bold">Release decision: {data.readiness.assessment.decision}</h2><p>{data.readiness.assessment.verified} of {data.readiness.assessment.total} required gates verified.</p><p className="mt-2 text-sm text-slate-600">{data.readiness.assessment.blockers.length} blockers remain. See the governed evidence register; blocker details are not exposed on shared displays.</p></section>
            <section className="rounded-xl border bg-white p-5" aria-labelledby="dependency-title"><h2 id="dependency-title" className="font-bold">Dependencies</h2><dl className="mt-3 grid gap-3 sm:grid-cols-3">{Object.entries(data.health.dependencies).map(([name, value]) => <div key={name}><dt className="font-semibold capitalize">{name}</dt><dd>{value}</dd></div>)}</dl><p className="mt-3 text-sm">Last checked: <time dateTime={data.health.checkedAt}>{new Date(data.health.checkedAt).toLocaleString('en-SL')}</time></p></section>
            <section className="rounded-xl border bg-white p-5" aria-labelledby="metrics-title"><h2 id="metrics-title" className="font-bold">Privacy-minimized API window</h2><dl className="mt-3 grid gap-3 sm:grid-cols-4"><div><dt>Requests</dt><dd className="font-bold">{data.metrics.metrics.requests}</dd></div><div><dt>Errors</dt><dd className="font-bold">{data.metrics.metrics.errors}</dd></div><div><dt>p95 latency</dt><dd className="font-bold">{data.metrics.metrics.p95Ms.toFixed(0)} ms</dd></div><div><dt>Error rate</dt><dd className="font-bold">{data.metrics.metrics.errorRatePercent}%</dd></div></dl></section>
          </div>}
        </div>
      </div>
    </main>
  </ProtectedRoute>;
}
