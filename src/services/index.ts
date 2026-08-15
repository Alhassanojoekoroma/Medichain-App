// Re-export database service so screens can import from a single location.
export * from './database';
export { SyncServiceInstance } from './syncService';
export * from './aiService';

import * as Crypto from 'expo-crypto';

export class ContainedFeatureError extends Error {
  readonly code = 'PHASE_1_CONTAINMENT';

  constructor(feature: string) {
    super(`${feature} is unavailable pending an approved secure implementation.`);
    this.name = 'ContainedFeatureError';
  }
}

/**
 * Mobile clients never submit directly to Fabric. Ledger operations must pass
 * through the authenticated server policy boundary after Phase 3 approval.
 */
export const BlockchainService = {
  grantAccess: async (_doctorId: string, _expiryMinutes: number): Promise<string> => {
    throw new ContainedFeatureError('Blockchain access grants');
  },
  revokeAccess: async (_accessId: string): Promise<boolean> => {
    throw new ContainedFeatureError('Blockchain access revocation');
  },
  notarizeRecord: async (_recordId: string, _contentHash: string): Promise<string> => {
    throw new ContainedFeatureError('Blockchain record notarization');
  },
};

/**
 * Only non-secret hashing remains available in the client. Encryption, key
 * derivation, signing keys and recovery require a reviewed key lifecycle and
 * platform-backed implementation; placeholders must never claim success.
 */
export const SecurityUtils = {
  encryptData: (_data: string): string => {
    throw new ContainedFeatureError('Client medical-data encryption');
  },

  generateHash: async (data: string): Promise<string> => {
    const hash = await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, data);
    return `0x${hash}`;
  },

  deriveKey: (_secret: string): string => {
    throw new ContainedFeatureError('Client key derivation');
  },

  generateKeyPair: async (): Promise<{ publicKey: string; privateKeyStored: boolean }> => {
    throw new ContainedFeatureError('Patient signing-key generation');
  },

  recoverKeyFromGuardians: async (_guardianShares: string[]): Promise<{ success: boolean; privateKey?: string }> => {
    throw new ContainedFeatureError('Guardian key recovery');
  },
};
