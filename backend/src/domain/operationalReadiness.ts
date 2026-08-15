export const REQUIRED_PILOT_GATES = [
  'pilot-scope-approved', 'legal-dpia-approved', 'ministry-approval', 'clinical-safety-review',
  'independent-penetration-test', 'backup-restore-exercise', 'failover-exercise', 'incident-drill',
  'trained-users', 'support-roster', 'monitoring-alerts', 'rollback-rehearsal', 'migration-rehearsal',
] as const;
export type PilotGate = typeof REQUIRED_PILOT_GATES[number];
export type EvidenceStatus = 'verified' | 'pending' | 'failed';
export interface PilotEvidence { gate: PilotGate; status: EvidenceStatus; owner: string; evidenceRef?: string; reviewedAt?: string }
export interface ReleaseAssessment { decision: 'PASS' | 'CONDITIONAL' | 'FAIL'; blockers: string[]; verified: number; total: number }

export function assessPilotRelease(input: { evidence: PilotEvidence[]; criticalFindings: number; highFindings: number }): ReleaseAssessment {
  const byGate = new Map(input.evidence.map(item => [item.gate, item]));
  const blockers: string[] = [];
  if (input.criticalFindings > 0) blockers.push('UNRESOLVED_CRITICAL_FINDINGS');
  if (input.highFindings > 0) blockers.push('UNRESOLVED_HIGH_FINDINGS');
  for (const gate of REQUIRED_PILOT_GATES) {
    const evidence = byGate.get(gate);
    if (!evidence || evidence.status !== 'verified' || !evidence.evidenceRef || !evidence.reviewedAt) blockers.push(`GATE_NOT_VERIFIED:${gate}`);
  }
  const verified = REQUIRED_PILOT_GATES.filter(gate => byGate.get(gate)?.status === 'verified' && byGate.get(gate)?.evidenceRef && byGate.get(gate)?.reviewedAt).length;
  return { decision: blockers.length ? 'FAIL' : 'PASS', blockers, verified, total: REQUIRED_PILOT_GATES.length };
}

export function redactOperationalPath(path: string): string {
  return path
    .replace(/[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}/gi, ':id')
    .replace(/\bP\d{3,}\b/gi, ':patient-ref')
    .replace(/([?&](?:token|code|email|phone)=)[^&]*/gi, '$1:redacted');
}

export interface TelemetrySnapshot { requests: number; errors: number; p95Ms: number; errorRatePercent: number }
export class OperationalTelemetry {
  private static durations: number[] = [];
  private static errors = 0;
  static observe(durationMs: number, statusCode: number): void {
    if (!Number.isFinite(durationMs) || durationMs < 0) return;
    this.durations.push(durationMs); if (this.durations.length > 1000) this.durations.shift();
    if (statusCode >= 500) this.errors += 1;
  }
  static snapshot(): TelemetrySnapshot {
    const sorted = [...this.durations].sort((a, b) => a - b);
    const p95Ms = sorted.length ? sorted[Math.min(sorted.length - 1, Math.ceil(sorted.length * 0.95) - 1)] : 0;
    return { requests: sorted.length, errors: this.errors, p95Ms, errorRatePercent: sorted.length ? Number(((this.errors / sorted.length) * 100).toFixed(2)) : 0 };
  }
  static resetForTest(): void { this.durations = []; this.errors = 0; }
}
