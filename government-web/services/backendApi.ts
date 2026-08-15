/** Government bundles intentionally contain no patient or clinical API client. */
export interface MinistryAggregate {
  indicator: string;
  regionCode: string;
  period: string;
  numerator: number;
  denominator: number;
  completenessPercent: number;
  suppressed: boolean;
}

export interface MinistryAggregateFeed {
  aggregates: MinistryAggregate[];
  feedHealth: {
    status: string;
    received: number;
    lastReceivedAt: string | null;
  };
}

async function request<T>(path: string): Promise<T> {
  const response = await fetch(`/api/backend/${path}`, { cache: 'no-store' });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    const code = body?.error?.code || body?.error || `HTTP_${response.status}`;
    throw new Error(typeof code === 'string' ? code : `HTTP_${response.status}`);
  }
  return body as T;
}

interface ProhibitedEmergencyResult {
  success: boolean;
  profile?: Record<string, unknown>;
}

const prohibited = async (..._args: unknown[]): Promise<ProhibitedEmergencyResult> => {
  throw new Error('Patient-level emergency access is not available in the ministry portal.');
};

export const backendApi = {
  getAggregateFeed: () => request<MinistryAggregateFeed>('intelligence/aggregates'),
  resolveEmergencyQR: prohibited,
};
