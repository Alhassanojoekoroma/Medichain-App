/**
 * backend/api/services/SyncScheduler.js
 *
 * Periodically syncs pending transactions from OfflineQueue to Fabric blockchain.
 * Implements exponential backoff for failed retries.
 */

const OfflineQueue = require('./OfflineQueue');
const FabricGateway = require('./FabricGateway');

class SyncScheduler {
  constructor() {
    this.intervalId = null;
    this.isRunning = false;
    this.syncInterval = process.env.SYNC_INTERVAL_MS || 30000; // Default 30 seconds
  }

  /**
   * Start the sync scheduler
   */
  start() {
    if (this.isRunning) {
      console.log('[Scheduler] Already running');
      return;
    }

    this.isRunning = true;
    console.log(`[Scheduler] Starting sync scheduler (interval: ${this.syncInterval}ms)`);

    // Run sync immediately
    this.sync();

    // Schedule recurring syncs
    this.intervalId = setInterval(() => {
      this.sync().catch(err => {
        console.error('[Scheduler] Sync error:', err);
      });
    }, this.syncInterval);
  }

  /**
   * Stop the sync scheduler
   */
  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isRunning = false;
    console.log('[Scheduler] Stopped');
  }

  /**
   * Perform a sync operation
   */
  async sync() {
    try {
      const stats = await OfflineQueue.getStats();
      
      if (stats.pending === 0) {
        console.log('[Scheduler] No pending transactions');
        return;
      }

      console.log(`[Scheduler] Syncing ${stats.pending} pending transactions...`);

      const pending = await OfflineQueue.getPending(50);
      let synced = 0;
      let failed = 0;

      for (const item of pending) {
        // Skip items that have exceeded max retry attempts
        if (item.attempts >= 5) {
          console.warn(`[Scheduler] Skipping item ${item.id} (max retries exceeded)`);
          continue;
        }

        try {
          const payload = typeof item.payload === 'string'
            ? JSON.parse(item.payload)
            : item.payload;

          let txHash = null;

          // Route by event type
          switch (item.event_type) {
            case 'AUDIT_LOG':
              txHash = await FabricGateway.submitAuditLog(payload);
              break;
            case 'CONSENT':
              txHash = await FabricGateway.submitConsent(payload);
              break;
            case 'NOTARIZE_RECORD':
              txHash = await FabricGateway.notarizeRecord(payload);
              break;
            case 'REVOCATION':
              txHash = await FabricGateway.revokeConsent(
                payload.consentId,
                payload.patientId,
                payload.reason
              );
              break;
            case 'ACCESS_REQUEST_APPROVED':
              // GAP 5: Record doctor access request approval on blockchain
              txHash = await FabricGateway.recordAccessRequestApproval(payload);
              break;
            default:
              console.warn(`[Scheduler] Unknown event type: ${item.event_type}`);
          }

          if (txHash) {
            await OfflineQueue.markSynced(item.id, txHash);
            synced++;
            console.log(`[Scheduler] Synced: ${item.event_type} (${item.id})`);
          }
        } catch (error) {
          console.error(`[Scheduler] Failed to sync item ${item.id}:`, error.message);
          await OfflineQueue.recordError(item.id, error);
          failed++;
        }
      }

      console.log(`[Scheduler] Sync complete: ${synced} synced, ${failed} failed`);
    } catch (error) {
      console.error('[Scheduler] Sync operation failed:', error);
    }
  }

  /**
   * Get scheduler status
   */
  getStatus() {
    return {
      running: this.isRunning,
      interval: this.syncInterval,
      lastSync: this.lastSync || null,
    };
  }
}

module.exports = new SyncScheduler();
