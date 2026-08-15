import * as SecureStore from 'expo-secure-store';
import * as Crypto from 'expo-crypto';
import Constants from 'expo-constants';

export type PatientCommandType = 'CONSENT_UPDATE' | 'QR_REVOKE' | 'PROFILE_UPDATE';
export type QueueState = 'queued' | 'conflict' | 'denied';

export interface SyncQueueItem {
  id: string;
  type: PatientCommandType;
  resourceId: string;
  patientId: string;
  baseVersion: number;
  issuedAt: string;
  payload: Record<string, unknown>;
  state: QueueState;
  serverVersion?: number;
  denialCode?: string;
}

export interface SyncStatus {
  pending: number;
  synced: number;
  failed: number;
  conflicts: number;
  lastSync?: number;
}

const INDEX_KEY = 'palmchain_outbox_index_v2';
const ITEM_PREFIX = 'palmchain_outbox_v2_';
const MAX_COMMANDS = 20;
const MAX_SERIALIZED_BYTES = 1800;

function apiBaseUrl(): string {
  const value = Constants.expoConfig?.extra?.apiBaseUrl;
  if (typeof value !== 'string' || !/^https?:\/\//.test(value)) throw new Error('API_URL_NOT_CONFIGURED');
  return value.replace(/\/$/, '');
}

async function readIndex(): Promise<string[]> {
  const raw = await SecureStore.getItemAsync(INDEX_KEY);
  if (!raw) return [];
  const parsed = JSON.parse(raw);
  if (!Array.isArray(parsed) || parsed.some(id => typeof id !== 'string')) throw new Error('OUTBOX_INDEX_CORRUPT');
  return parsed;
}

async function writeIndex(ids: string[]): Promise<void> {
  await SecureStore.setItemAsync(INDEX_KEY, JSON.stringify(ids));
}

async function readItem(id: string): Promise<SyncQueueItem | null> {
  const raw = await SecureStore.getItemAsync(`${ITEM_PREFIX}${id}`);
  return raw ? JSON.parse(raw) as SyncQueueItem : null;
}

async function writeItem(item: SyncQueueItem): Promise<void> {
  const serialized = JSON.stringify(item);
  if (new TextEncoder().encode(serialized).length > MAX_SERIALIZED_BYTES) throw new Error('OUTBOX_COMMAND_TOO_LARGE');
  await SecureStore.setItemAsync(`${ITEM_PREFIX}${item.id}`, serialized);
}

class SyncService {
  private syncInProgress = false;
  private lastSyncTime = 0;

  async initialize(): Promise<void> {
    // Sync is user/session driven. No background timer transmits health-related
    // commands without current authentication and server-side reauthorization.
  }

  async enqueuePatientCommand(input: Omit<SyncQueueItem, 'id' | 'issuedAt' | 'state'>): Promise<string> {
    if (!Number.isSafeInteger(input.baseVersion) || input.baseVersion < 0) throw new Error('BASE_VERSION_REQUIRED');
    if (!input.patientId || !input.resourceId) throw new Error('RESOURCE_CONTEXT_REQUIRED');
    const index = await readIndex();
    if (index.length >= MAX_COMMANDS) throw new Error('OUTBOX_CAPACITY_REACHED');
    const item: SyncQueueItem = {
      ...input,
      id: Crypto.randomUUID(),
      issuedAt: new Date().toISOString(),
      state: 'queued',
    };
    await writeItem(item);
    await writeIndex([...index, item.id]);
    return item.id;
  }

  async enqueueAction(): Promise<string> {
    throw new Error('Legacy offline action format is disabled. Use a versioned patient command.');
  }

  private async syncItem(item: SyncQueueItem, authToken: string): Promise<'synced' | 'retained'> {
    const response = await fetch(`${apiBaseUrl()}/api/platform/sync/commands`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
        'Idempotency-Key': item.id,
      },
      body: JSON.stringify({
        id: item.id,
        type: item.type,
        resourceId: item.resourceId,
        baseVersion: item.baseVersion,
        issuedAt: item.issuedAt,
        payload: item.payload,
      }),
    });
    const result = await response.json().catch(() => ({}));
    if (response.ok && result.status !== 'conflict' && result.status !== 'denied') return 'synced';
    if (response.status === 409) {
      item.state = 'conflict';
      item.serverVersion = result.serverVersion;
      await writeItem(item);
      return 'retained';
    }
    if (response.status === 401) throw new Error('REAUTHENTICATION_REQUIRED');
    if (response.status === 403) {
      item.state = 'denied';
      item.denialCode = result.code || result.error?.code || 'AUTHORIZATION_REVOKED';
      await writeItem(item);
      return 'retained';
    }
    throw new Error('SYNC_TEMPORARILY_UNAVAILABLE');
  }

  async syncAllPending(): Promise<SyncStatus> {
    if (this.syncInProgress) return this.getSyncStatus();
    const authToken = await SecureStore.getItemAsync('medichain_session_token');
    if (!authToken) throw new Error('REAUTHENTICATION_REQUIRED');
    this.syncInProgress = true;
    let synced = 0;
    let failed = 0;
    try {
      const ids = await readIndex();
      const retained: string[] = [];
      for (const id of ids) {
        const item = await readItem(id);
        if (!item) continue;
        if (item.state !== 'queued') { retained.push(id); continue; }
        try {
          if (await this.syncItem(item, authToken) === 'synced') {
            await SecureStore.deleteItemAsync(`${ITEM_PREFIX}${id}`);
            synced += 1;
          } else retained.push(id);
        } catch (error) {
          retained.push(id);
          failed += 1;
          if (error instanceof Error && error.message === 'REAUTHENTICATION_REQUIRED') throw error;
        }
      }
      await writeIndex(retained);
      this.lastSyncTime = Date.now();
      const status = await this.getSyncStatus();
      return { ...status, synced, failed, lastSync: this.lastSyncTime };
    } finally {
      this.syncInProgress = false;
    }
  }

  async getSyncStatus(): Promise<SyncStatus> {
    const items = (await Promise.all((await readIndex()).map(readItem))).filter(Boolean) as SyncQueueItem[];
    return {
      pending: items.filter(item => item.state === 'queued').length,
      conflicts: items.filter(item => item.state === 'conflict').length,
      failed: items.filter(item => item.state === 'denied').length,
      synced: 0,
      lastSync: this.lastSyncTime || undefined,
    };
  }

  async clearQueue(): Promise<void> {
    const ids = await readIndex();
    await Promise.all(ids.map(id => SecureStore.deleteItemAsync(`${ITEM_PREFIX}${id}`)));
    await SecureStore.deleteItemAsync(INDEX_KEY);
  }

  async forceSyncNow(): Promise<SyncStatus> {
    return this.syncAllPending();
  }

  setOnlineStatus(): void {}

  async syncRecordToDoctors(): Promise<never> { throw new Error('Clinical record sync begins in Phase 5.'); }
  async syncAccessApproval(): Promise<never> { throw new Error('Legacy access approvals are disabled.'); }
  async syncConsent(): Promise<never> { throw new Error('Use enqueuePatientCommand with a base version.'); }
  async syncAuditLog(): Promise<never> { throw new Error('Clients cannot submit audit events.'); }
}

export const SyncServiceInstance = new SyncService();
