export type IndicatorCode = 'encounter_count' | 'critical_lab_followup' | 'referral_completion' | 'documentation_completeness';
export const INDICATOR_CATALOG: Record<IndicatorCode, { title: string; unit: 'count' | 'percent'; minimumCellSize: number }> = {
  encounter_count: { title: 'Completed encounters', unit: 'count', minimumCellSize: 10 },
  critical_lab_followup: { title: 'Critical laboratory follow-up', unit: 'percent', minimumCellSize: 10 },
  referral_completion: { title: 'Referral completion', unit: 'percent', minimumCellSize: 10 },
  documentation_completeness: { title: 'Documentation completeness', unit: 'percent', minimumCellSize: 10 },
};

export interface AggregateCell { indicator: IndicatorCode; regionCode: string; period: string; numerator: number; denominator: number; expectedFacilities: number; reportingFacilities: number }
export function publishAggregate(cell: AggregateCell): { indicator: IndicatorCode; regionCode: string; period: string; value: number | null; suppressed: boolean; completeness: number; warnings: string[] } {
  if (!INDICATOR_CATALOG[cell.indicator] || !/^[A-Z0-9-]{2,20}$/.test(cell.regionCode) || !/^\d{4}-(0[1-9]|1[0-2])$/.test(cell.period)) throw new Error('INDICATOR_INPUT_INVALID');
  for (const value of [cell.numerator, cell.denominator, cell.expectedFacilities, cell.reportingFacilities]) if (!Number.isSafeInteger(value) || value < 0) throw new Error('INDICATOR_INPUT_INVALID');
  if (cell.numerator > cell.denominator || cell.reportingFacilities > cell.expectedFacilities || cell.expectedFacilities === 0) throw new Error('INDICATOR_INPUT_INVALID');
  const minimum = INDICATOR_CATALOG[cell.indicator].minimumCellSize;
  const suppressed = cell.denominator < minimum;
  const completeness = cell.reportingFacilities / cell.expectedFacilities;
  const warnings = completeness < 0.8 ? ['INCOMPLETE_REPORTING'] : [];
  const value = suppressed ? null : INDICATOR_CATALOG[cell.indicator].unit === 'count' ? cell.numerator : Number(((cell.numerator / Math.max(1, cell.denominator)) * 100).toFixed(1));
  return { indicator: cell.indicator, regionCode: cell.regionCode, period: cell.period, value, suppressed, completeness, warnings };
}

export interface IntelligenceSignal { id: string; status: 'pending-review' | 'confirmed' | 'dismissed'; indicator: IndicatorCode; rationale: string; createdBy: 'rule' | 'ai'; reviewedBy?: string; reviewedAt?: string }
export function reviewSignal(signal: IntelligenceSignal, reviewerId: string, decision: 'confirm' | 'dismiss', reviewedAt = new Date().toISOString()): IntelligenceSignal {
  if (signal.status !== 'pending-review' || !reviewerId) throw new Error('SIGNAL_REVIEW_INVALID');
  return { ...signal, status: decision === 'confirm' ? 'confirmed' : 'dismissed', reviewedBy: reviewerId, reviewedAt };
}

export interface ExportRequest { id: string; requestedBy: string; status: 'pending' | 'approved' | 'rejected'; approvedBy?: string }
export function decideExport(request: ExportRequest, approverId: string, decision: 'approve' | 'reject'): ExportRequest {
  if (request.status !== 'pending' || request.requestedBy === approverId) throw new Error('EXPORT_SEPARATION_OF_DUTIES_REQUIRED');
  return { ...request, status: decision === 'approve' ? 'approved' : 'rejected', approvedBy: approverId };
}
