/**
 * backend/api/services/OfflineQueue.js
 *
 * Manages persistent queue for offline-first sync to Hyperledger Fabric.
 * All transactions (audits, consents, revocations) are queued locally,
 * then synced to ledger in batches when network is available.
 */

const { Pool } = require('pg');

class OfflineQueue {
  constructor() {
    this.pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });
  }

  /**
   * Enqueue an event for later sync to Fabric
   */
  async enqueue(eventType, payload) {
    try {
      const result = await this.pool.query(
        `INSERT INTO sync_queue (event_type, payload, attempts)
         VALUES ($1, $2, 0)
         RETURNING id, created_at`,
        [eventType, JSON.stringify(payload)]
      );
      console.log(`[Queue] Enqueued ${eventType}:`, result.rows[0]);
      return result.rows[0];
    } catch (error) {
      console.error(`[Queue] Enqueue error for ${eventType}:`, error);
      throw error;
    }
  }

  /**
   * Get pending events (not yet synced)
   */
  async getPending(limit = 50) {
    try {
      const result = await this.pool.query(
        `SELECT id, event_type, payload, attempts
         FROM sync_queue
         WHERE synced_at IS NULL
         ORDER BY created_at ASC
         LIMIT $1`,
        [limit]
      );
      return result.rows;
    } catch (error) {
      console.error('[Queue] Get pending error:', error);
      throw error;
    }
  }

  /**
   * Mark an event as successfully synced to Fabric
   */
  async markSynced(queueId, fabricTxHash) {
    try {
      await this.pool.query(
        `UPDATE sync_queue
         SET synced_at = NOW(), last_error = NULL
         WHERE id = $1`,
        [queueId]
      );
      console.log(`[Queue] Marked synced: ${queueId} (tx: ${fabricTxHash})`);
    } catch (error) {
      console.error('[Queue] Mark synced error:', error);
      throw error;
    }
  }

  /**
   * Increment retry count and record error
   */
  async recordError(queueId, error) {
    try {
      await this.pool.query(
        `UPDATE sync_queue
         SET attempts = attempts + 1,
             last_error = $1
         WHERE id = $2`,
        [error.message || String(error), queueId]
      );
      console.log(`[Queue] Recorded error for ${queueId}:`, error.message);
    } catch (err) {
      console.error('[Queue] Record error failed:', err);
    }
  }

  /**
   * Get sync statistics
   */
  async getStats() {
    try {
      const result = await this.pool.query(
        `SELECT
           COUNT(*) FILTER (WHERE synced_at IS NULL) as pending,
           COUNT(*) FILTER (WHERE synced_at IS NOT NULL) as synced,
           COUNT(*) FILTER (WHERE attempts > 3) as failed,
           COUNT(DISTINCT event_type) as event_types
         FROM sync_queue
         WHERE created_at > NOW() - INTERVAL '24 hours'`
      );
      return result.rows[0];
    } catch (error) {
      console.error('[Queue] Get stats error:', error);
      return { pending: 0, synced: 0, failed: 0, event_types: 0 };
    }
  }

  async disconnect() {
    await this.pool.end();
  }
}

module.exports = new OfflineQueue();
