import { dispatchOutbox, OutboxEvent, OutboxRepository } from '@medichain/outbox';
import { db } from '../config/db';
import { createLedgerAnchor } from '../domain/fabricGovernance';
import { FabricGateway } from './FabricGateway';
import { MedicalFileWorker } from './MedicalFileWorker';

class PostgresOutboxRepository implements OutboxRepository {
  async claimBatch(input: { limit: number; now: string; leaseUntil: string }): Promise<OutboxEvent[]> {
    if (!db.pool) throw new Error('DURABLE_DATABASE_REQUIRED');
    const result = await db.pool.query(
      `WITH claimable AS (
         SELECT id FROM outbox_events
          WHERE (status = 'pending' OR (status = 'processing' AND locked_until < $1))
            AND next_attempt_at <= $1
          ORDER BY created_at ASC
          FOR UPDATE SKIP LOCKED
          LIMIT $2
       )
       UPDATE outbox_events o
          SET status = 'processing', locked_until = $3
         FROM claimable c
        WHERE o.id = c.id
      RETURNING o.*`,
      [input.now, input.limit, input.leaseUntil]
    );
    return result.rows.map((row: any) => ({
      id: String(row.id),
      topic: row.topic,
      aggregateId: String(row.aggregate_id),
      idempotencyKey: row.idempotency_key,
      payload: row.payload,
      status: row.status,
      attempts: Number(row.attempts),
      nextAttemptAt: new Date(row.next_attempt_at).toISOString(),
      createdAt: new Date(row.created_at).toISOString(),
      lockedUntil: row.locked_until ? new Date(row.locked_until).toISOString() : undefined,
    }));
  }

  async complete(id: string, completedAt: string): Promise<void> {
    await db.query(
      `UPDATE outbox_events SET status = 'completed', completed_at = $2,
              locked_until = NULL, last_error_code = NULL WHERE id = $1`,
      [id, completedAt]
    );
  }

  async retry(id: string, input: { attempts: number; nextAttemptAt: string; errorCode: string; deadLetter: boolean }): Promise<void> {
    await db.query(
      `UPDATE outbox_events SET status = $2, attempts = $3, next_attempt_at = $4,
              last_error_code = $5, locked_until = NULL WHERE id = $1`,
      [id, input.deadLetter ? 'dead_letter' : 'pending', input.attempts, input.nextAttemptAt, input.errorCode]
    );
  }
}

function requiredAnchorSecret(): string {
  const value = process.env.FABRIC_ANCHOR_DIGEST_SECRET;
  if (!value || value.length < 32) throw new Error('FABRIC_ANCHOR_SECRET_REQUIRED');
  return value;
}

export class OutboxWorkerService {
  static async runOnce() {
    return dispatchOutbox({
      repository: new PostgresOutboxRepository(),
      handlers: {
        'file.scan': async event => {
          await MedicalFileWorker.process(String(event.payload.uploadId || event.aggregateId));
        },
        'fabric.anchor': async event => {
          const auditEventId = String(event.payload.auditEventId || '');
          const anchor = createLedgerAnchor({
            eventId: auditEventId,
            eventType: 'CLINICAL_RECORD_SIGNED',
            sourcePayload: event.payload,
            policyVersion: process.env.FABRIC_POLICY_VERSION || 'v1',
            organization: process.env.FABRIC_ORGANIZATION || 'HospitalMSP',
          }, requiredAnchorSecret());
          const result = await FabricGateway.submitGovernedAnchor(anchor);
          await db.query(
            `UPDATE medical_file_uploads SET anchor_status = 'anchored', anchor_tx_id = $2,
                    updated_at = NOW() WHERE id = $1`,
            [event.aggregateId, result.txHash]
          );
        },
        'notification.send': async () => {
          // The vendor adapter is intentionally fail-closed until a Sierra
          // Leone SMS/push provider is selected and configured.
          throw new Error('NOTIFICATION_PROVIDER_NOT_CONFIGURED');
        },
        'audit.write': async () => {
          throw new Error('AUDIT_HANDLER_NOT_CONFIGURED');
        },
      },
    });
  }
}
