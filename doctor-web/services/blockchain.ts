// services/blockchain.ts
// Stub Hyperledger Fabric service — returns mock data.
// Replace each function body with real Fabric Gateway SDK calls.

import { MOCK_RECORDS, MOCK_BLOCKCHAIN_STATUS } from '@/data/mockData';
import type { MedicalRecord, BlockchainStatus } from '@/types';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export async function getBlockchainStatus(): Promise<BlockchainStatus> {
  try {
    const res = await fetch(`${BASE_URL}/api/fabric/status`, { credentials: 'include' });
    if (!res.ok) throw new Error('Network error');
    return res.json();
  } catch {
    return MOCK_BLOCKCHAIN_STATUS;
  }
}

export async function getPatientRecords(patientId: string): Promise<MedicalRecord[]> {
  try {
    const res = await fetch(`${BASE_URL}/api/fabric/records/${patientId}`, { credentials: 'include' });
    if (!res.ok) throw new Error('Network error');
    return res.json();
  } catch {
    return MOCK_RECORDS.filter(r => r.patientId === patientId);
  }
}

export async function uploadRecord(
  record: Omit<MedicalRecord, 'id' | 'hash' | 'txHash' | 'blockNumber' | 'status' | 'verified'>,
  file: File
): Promise<{ success: boolean; recordId?: string; txHash?: string; error?: string }> {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('metadata', JSON.stringify(record));
    const res = await fetch(`${BASE_URL}/api/fabric/records/upload`, {
      method: 'POST',
      credentials: 'include',
      body: formData,
    });
    if (!res.ok) throw new Error('Upload failed');
    return res.json();
  } catch {
    // Simulate a successful upload in dev mode
    await new Promise(r => setTimeout(r, 1500));
    return {
      success: true,
      recordId: `R${String(Date.now()).slice(-4)}`,
      txHash: `0x${Math.random().toString(16).slice(2)}`,
    };
  }
}

export async function forceSyncRecords(): Promise<{ synced: number; failed: number }> {
  try {
    const res = await fetch(`${BASE_URL}/api/fabric/sync`, {
      method: 'POST',
      credentials: 'include',
    });
    if (!res.ok) throw new Error('Sync failed');
    return res.json();
  } catch {
    await new Promise(r => setTimeout(r, 1000));
    return { synced: 2, failed: 0 };
  }
}
