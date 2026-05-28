// Re-export database service so screens can import from a single location
export * from './database';

import { BlockchainLog, Record } from '../types';
import Constants from 'expo-constants';
import * as Crypto from 'expo-crypto';

// Use EXPO_PUBLIC_ prefix for client-side environment variables
const GATEWAY_URL = process.env.EXPO_PUBLIC_HYPERLEDGER_GATEWAY_URL || 'http://localhost:3000/api';

/**
 * Hyperledger Fabric Production/Simulation Service
 */
export const BlockchainService = {
  /**
   * Grants access to a doctor on the ledger
   */
  grantAccess: async (doctorId: string, expiryMinutes: number): Promise<string> => {
    if (!GATEWAY_URL) throw new Error('GATEWAY_URL is not defined');
    const response = await fetch(`${GATEWAY_URL}/access/grant`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        patientId: 'patient_john', 
        doctorId, 
        expiryMinutes 
      })
    });
    if (!response.ok) throw new Error('Failed to grant access on blockchain');
    const data = await response.json();
    return data.txHash;
  },

  /**
   * Revokes access on the ledger
   */
  revokeAccess: async (accessId: string): Promise<boolean> => {
    if (!GATEWAY_URL) throw new Error('GATEWAY_URL is not defined');
    const response = await fetch(`${GATEWAY_URL}/access/revoke`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        patientId: 'patient_john', 
        doctorId: accessId 
      })
    });
    if (!response.ok) throw new Error('Failed to revoke access on blockchain');
    return true;
  },

  /**
   * Records a hash of a medical record on the blockchain
   */
  notarizeRecord: async (recordId: string, contentHash: string): Promise<string> => {
    if (!GATEWAY_URL) throw new Error('GATEWAY_URL is not defined');
    const response = await fetch(`${GATEWAY_URL}/records/notarize`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        patientId: 'patient_john', 
        recordId, 
        documentHash: contentHash,
        ipfsHash: 'Qm' + contentHash.slice(2, 32),
        recordType: 'General',
        doctorId: 'Self',
        patientSignature: 'SignedByPatient'
      })
    });
    if (!response.ok) throw new Error('Failed to notarize record on blockchain');
    const data = await response.json();
    return data.txHash;
  }
};

export * from './aiService';

/**
 * Advanced Security Utilities
 */
export const SecurityUtils = {
  /**
   * AES-256 encryption for sensitive medical data (Placeholder for real implementation)
   */
  encryptData: (data: string): string => {
    // Note: In production, use expo-crypto or react-native-crypto for real symmetric encryption.
    const encoded = btoa(data);
    return `ENC[AES256]:${encoded}`;
  },

  /**
   * Real SHA-256 hashing for blockchain notarization
   */
  generateHash: async (data: string): Promise<string> => {
    try {
      // Use Expo Crypto to generate a real SHA-256 hash
      const hash = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        data
      );
      return `0x${hash}`;
    } catch (e) {
      console.warn("Crypto hashing failed, falling back to basic hash.", e);
      let hash = 0;
      for (let i = 0; i < data.length; i++) {
        const char = data.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
      }
      return '0x' + Math.abs(hash).toString(16).padStart(64, '0').slice(0, 64);
    }
  },

  /**
   * Secure key derivation (Placeholder)
   */
  deriveKey: (secret: string): string => {
    return btoa(secret).slice(0, 32);
  },

  /**
   * ARCHITECTURE GAP #4: Generates a patient's private/public key pair
   * In a real app, the private key is stored ONLY in SecureStore or a Secure Enclave.
   */
  generateKeyPair: async (): Promise<{ publicKey: string, privateKeyStored: boolean }> => {
    return new Promise(async (resolve) => {
      const mockKeyData = `pubkey_${Date.now()}_${Math.random()}`;
      const hash = await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, mockKeyData);
      setTimeout(() => resolve({ publicKey: `0x04${hash}`, privateKeyStored: true }), 1000);
    });
  },

  /**
   * ARCHITECTURE GAP #5: Social Key Recovery (3-of-5 threshold signature scheme simulation)
   * Recovers the master private key if 3 out of 5 guardians provide their shares.
   */
  recoverKeyFromGuardians: async (guardianShares: string[]): Promise<{ success: boolean, privateKey?: string }> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        if (guardianShares.length >= 3) {
          // In reality, this would use Shamir's Secret Sharing to reconstruct the key
          resolve({ success: true, privateKey: '0xRECOVERED_PRIVATE_KEY_SIMULATION' });
        } else {
          resolve({ success: false });
        }
      }, 2000);
    });
  }
};

