/**
 * Sync Service - Manages data synchronization between patient mobile app,
 * doctor web app, and Hyperledger Fabric blockchain
 */

import Constants from 'expo-constants';
import * as SecureStore from 'expo-secure-store';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000';

export interface SyncQueueItem {
  id: string;
  type: 'record' | 'consent' | 'access' | 'audit';
  payload: any;
  createdAt: number;
  synced: boolean;
}

interface SyncStatus {
  pending: number;
  synced: number;
  failed: number;
  lastSync?: number;
}

class SyncService {
  private isOnline = true;
  private syncInProgress = false;
  private lastSyncTime = 0;
  private syncInterval = 30000; // 30 seconds

  /**
   * Initialize sync service
   */
  async initialize() {
    console.log('[Sync] Initializing sync service...');
    // Start periodic sync
    this.startPeriodicSync();
  }

  /**
   * Start periodic sync timer
   */
  private startPeriodicSync() {
    setInterval(async () => {
      if (this.isOnline && !this.syncInProgress) {
        await this.syncAllPending();
      }
    }, this.syncInterval);
  }

  /**
   * Enqueue an action for sync (for offline support)
   */
  async enqueueAction(type: string, payload: any): Promise<string> {
    try {
      const id = `${type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const item: SyncQueueItem = {
        id,
        type: type as any,
        payload,
        createdAt: Date.now(),
        synced: false,
      };

      // Store locally for offline support
      const existingQueue = await this.getLocalQueue();
      existingQueue.push(item);
      await SecureStore.setItemAsync('medichain_sync_queue', JSON.stringify(existingQueue));

      console.log(`[Sync] Enqueued ${type}: ${id}`);

      // Try to sync immediately if online
      if (this.isOnline) {
        await this.syncItem(item);
      }

      return id;
    } catch (error) {
      console.error('[Sync] Enqueue error:', error);
      throw error;
    }
  }

  /**
   * Get local sync queue
   */
  private async getLocalQueue(): Promise<SyncQueueItem[]> {
    try {
      const queue = await SecureStore.getItemAsync('medichain_sync_queue');
      return queue ? JSON.parse(queue) : [];
    } catch (error) {
      console.error('[Sync] Get queue error:', error);
      return [];
    }
  }

  /**
   * Sync a single item to backend
   */
  private async syncItem(item: SyncQueueItem): Promise<boolean> {
    try {
      const endpoint = `/api/sync/${item.type}`;
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await this.getAuthToken()}`,
        },
        body: JSON.stringify(item.payload),
      });

      if (response.ok) {
        console.log(`[Sync] Successfully synced ${item.type}: ${item.id}`);
        return true;
      }

      console.error(`[Sync] Failed to sync ${item.type}: ${response.status}`);
      return false;
    } catch (error) {
      console.error(`[Sync] Error syncing ${item.id}:`, error);
      return false;
    }
  }

  /**
   * Sync all pending items
   */
  async syncAllPending(): Promise<SyncStatus> {
    if (this.syncInProgress) {
      return { pending: 0, synced: 0, failed: 0 };
    }

    this.syncInProgress = true;

    try {
      const queue = await this.getLocalQueue();
      const pending = queue.filter(item => !item.synced);

      if (pending.length === 0) {
        console.log('[Sync] No pending items');
        this.syncInProgress = false;
        return { pending: 0, synced: 0, failed: 0 };
      }

      console.log(`[Sync] Syncing ${pending.length} pending items...`);

      let synced = 0;
      let failed = 0;

      for (const item of pending) {
        const success = await this.syncItem(item);
        if (success) {
          synced++;
          item.synced = true;
        } else {
          failed++;
        }
      }

      // Update local queue
      await SecureStore.setItemAsync('medichain_sync_queue', JSON.stringify(queue));

      const status = { pending: pending.length - synced, synced, failed, lastSync: Date.now() };
      console.log('[Sync] Sync complete:', status);

      this.lastSyncTime = Date.now();
      this.syncInProgress = false;

      return status;
    } catch (error) {
      console.error('[Sync] Error during sync:', error);
      this.syncInProgress = false;
      return { pending: 0, synced: 0, failed: 0 };
    }
  }

  /**
   * Get sync status
   */
  async getSyncStatus(): Promise<SyncStatus> {
    try {
      const queue = await this.getLocalQueue();
      const pending = queue.filter(item => !item.synced);
      const synced = queue.filter(item => item.synced);

      return {
        pending: pending.length,
        synced: synced.length,
        failed: 0,
        lastSync: this.lastSyncTime,
      };
    } catch (error) {
      console.error('[Sync] Get status error:', error);
      return { pending: 0, synced: 0, failed: 0 };
    }
  }

  /**
   * Sync patient record to blockchain and doctor app
   */
  async syncRecordToDoctors(recordId: string, recipientDoctorIds: string[]) {
    try {
      await this.enqueueAction('record', {
        recordId,
        recipientDoctorIds,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('[Sync] Error syncing record to doctors:', error);
    }
  }

  /**
   * Sync access request approval
   */
  async syncAccessApproval(accessRequestId: string, approved: boolean) {
    try {
      await this.enqueueAction('access', {
        accessRequestId,
        approved,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('[Sync] Error syncing access approval:', error);
    }
  }

  /**
   * Sync consent update
   */
  async syncConsent(consentId: string, consentData: any) {
    try {
      await this.enqueueAction('consent', {
        consentId,
        ...consentData,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('[Sync] Error syncing consent:', error);
    }
  }

  /**
   * Sync audit log
   */
  async syncAuditLog(action: string, details: any) {
    try {
      await this.enqueueAction('audit', {
        action,
        details,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('[Sync] Error syncing audit log:', error);
    }
  }

  /**
   * Get authentication token
   */
  private async getAuthToken(): Promise<string> {
    try {
      const token = await SecureStore.getItemAsync('auth_token');
      return token || '';
    } catch (error) {
      console.error('[Sync] Error getting auth token:', error);
      return '';
    }
  }

  /**
   * Set online/offline status
   */
  setOnlineStatus(online: boolean) {
    this.isOnline = online;
    console.log(`[Sync] Online status: ${online}`);
  }

  /**
   * Force sync
   */
  async forceSyncNow(): Promise<SyncStatus> {
    console.log('[Sync] Force sync requested');
    return await this.syncAllPending();
  }

  /**
   * Clear sync queue
   */
  async clearQueue() {
    try {
      await SecureStore.setItemAsync('medichain_sync_queue', JSON.stringify([]));
      console.log('[Sync] Queue cleared');
    } catch (error) {
      console.error('[Sync] Error clearing queue:', error);
    }
  }
}

export const SyncServiceInstance = new SyncService();
