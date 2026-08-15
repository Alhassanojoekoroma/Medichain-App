/**
 * backend/src/services/OfflineQueue.ts
 * 
 * Offline-first sync queue for low-connectivity environments (Sierra Leone).
 * 
 * Events that need blockchain anchoring are written to the sync_queue table.
 * A background job (or POST /api/audit/sync) drains the queue when connectivity
 * is restored. The queue survives server restarts.
 */

import { db } from '../config/db';

export type QueueEventType =
  | 'AUDIT_LOG'
  | 'CONSENT_GRANT'
  | 'CONSENT_REVOKE'
  | 'REVOCATION'
  | 'ACCESS_REQUEST_APPROVED';

export class OfflineQueue {

  static async enqueue(eventType: QueueEventType, payload: Record<string, unknown>): Promise<void> {
    await db.query(
      `INSERT INTO sync_queue (event_type, payload) VALUES ($1, $2::jsonb)`,
      [eventType, JSON.stringify(payload)]
    );
  }

  /** 
   * Process pending queue items. Called by cron or POST /api/audit/sync.
   * Returns counts for monitoring.
   */
  static async drain(fabricSubmitFn: (eventType: string, payload: Record<string, unknown>, queueEventId: string) => Promise<string>): Promise<{ processed: number; failed: number }> {
    const pending = await db.query(
      `SELECT id, event_type, payload
         FROM sync_queue
        WHERE synced_at IS NULL AND attempts < 5
        ORDER BY created_at ASC
        LIMIT 100`
    );

    let processed = 0;
    let failed = 0;

    for (const row of pending.rows) {
      try {
        const txHash = await fabricSubmitFn(row.event_type, row.payload, String(row.id));

        await db.query(
          `UPDATE sync_queue SET synced_at = NOW(), payload = payload || $1::jsonb WHERE id = $2`,
          [JSON.stringify({ txHash }), row.id]
        );
        processed++;
      } catch (err) {
        await db.query(
          `UPDATE sync_queue SET attempts = attempts + 1, last_error = $1 WHERE id = $2`,
          [String(err), row.id]
        );
        failed++;
      }
    }

    return { processed, failed };
  }

  static async getQueueStats(): Promise<{ pending: number; failed: number; synced: number }> {
    const result = await db.query(`
      SELECT
        COUNT(*) FILTER (WHERE synced_at IS NULL AND attempts < 5) AS pending,
        COUNT(*) FILTER (WHERE attempts >= 5) AS failed,
        COUNT(*) FILTER (WHERE synced_at IS NOT NULL) AS synced
      FROM sync_queue
    `);
    return result.rows[0];
  }
}
