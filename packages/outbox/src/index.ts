export type OutboxTopic = 'audit.write' | 'notification.send' | 'fabric.anchor' | 'file.scan';
export type OutboxStatus = 'pending' | 'processing' | 'completed' | 'dead_letter';

export interface OutboxEvent {
  id: string;
  topic: OutboxTopic;
  aggregateId: string;
  idempotencyKey: string;
  payload: Record<string, unknown>;
  status: OutboxStatus;
  attempts: number;
  nextAttemptAt: string;
  createdAt: string;
  lockedUntil?: string;
  completedAt?: string;
  lastErrorCode?: string;
}

export interface OutboxRepository {
  claimBatch(input: { limit: number; now: string; leaseUntil: string }): Promise<OutboxEvent[]>;
  complete(id: string, completedAt: string): Promise<void>;
  retry(id: string, input: { attempts: number; nextAttemptAt: string; errorCode: string; deadLetter: boolean }): Promise<void>;
}

export type OutboxHandlers = Partial<Record<OutboxTopic, (event: OutboxEvent) => Promise<void>>>;

export function retryDelaySeconds(attempt: number): number {
  if (!Number.isInteger(attempt) || attempt < 1) throw new Error('OUTBOX_ATTEMPT_INVALID');
  return Math.min(3600, 2 ** Math.min(attempt, 10) * 5);
}

function safeErrorCode(error: unknown): string {
  const raw = error instanceof Error ? error.message : 'OUTBOX_HANDLER_FAILED';
  return /^[A-Z][A-Z0-9_]{2,63}$/.test(raw) ? raw : 'OUTBOX_HANDLER_FAILED';
}

export async function dispatchOutbox(input: {
  repository: OutboxRepository;
  handlers: OutboxHandlers;
  now?: Date;
  limit?: number;
  leaseSeconds?: number;
  maxAttempts?: number;
}): Promise<{ claimed: number; completed: number; retried: number; deadLettered: number }> {
  const now = input.now ?? new Date();
  const limit = input.limit ?? 50;
  const leaseSeconds = input.leaseSeconds ?? 60;
  const maxAttempts = input.maxAttempts ?? 10;
  if (!Number.isInteger(limit) || limit < 1 || limit > 100 || leaseSeconds < 15 || leaseSeconds > 300 || maxAttempts < 1 || maxAttempts > 20) {
    throw new Error('OUTBOX_DISPATCH_POLICY_INVALID');
  }
  const events = await input.repository.claimBatch({
    limit,
    now: now.toISOString(),
    leaseUntil: new Date(now.getTime() + leaseSeconds * 1000).toISOString(),
  });
  let completed = 0;
  let retried = 0;
  let deadLettered = 0;
  for (const event of events) {
    const handler = input.handlers[event.topic];
    try {
      if (!handler) throw new Error('OUTBOX_HANDLER_MISSING');
      await handler(event);
      await input.repository.complete(event.id, now.toISOString());
      completed += 1;
    } catch (error) {
      const attempts = event.attempts + 1;
      const deadLetter = attempts >= maxAttempts;
      await input.repository.retry(event.id, {
        attempts,
        nextAttemptAt: new Date(now.getTime() + retryDelaySeconds(attempts) * 1000).toISOString(),
        errorCode: safeErrorCode(error),
        deadLetter,
      });
      if (deadLetter) deadLettered += 1;
      else retried += 1;
    }
  }
  return { claimed: events.length, completed, retried, deadLettered };
}
