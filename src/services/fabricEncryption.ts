/**
 * src/services/fabricEncryption.ts
 * 
 * Utility service for encrypting PII and medical records before 
 * they are uploaded to IPFS or sent to the Hyperledger Fabric network.
 * Uses cryptographically secure AES-256-GCM via the Web Crypto API.
 */

import * as Crypto from 'expo-crypto';

export class FabricEncryptionService {
  /**
   * Generates a secure symmetric key for encrypting medical records.
   */
  static async generateSymmetricKey(): Promise<string> {
    const randomBytes = await Crypto.getRandomBytesAsync(32);
    return Buffer.from(randomBytes).toString('base64');
  }

  /**
   * Encrypts a medical document or text payload before sending to IPFS.
   * 
   * @param payload The data to encrypt (string)
   * @param symmetricKey The AES key (base64 encoded)
   * @returns The encrypted payload and initialization vector (IV) in base64
   */
  static async encryptPayload(payload: string, symmetricKey: string): Promise<{ encrypted: string; iv: string }> {
    const ivBytes = await Crypto.getRandomBytesAsync(12); // GCM standard IV size is 12 bytes
    const keyBuffer = Buffer.from(symmetricKey, 'base64');
    
    // Import raw key into Web Crypto API
    const cryptoKey = await global.crypto.subtle.importKey(
      'raw',
      keyBuffer as any,
      { name: 'AES-GCM' },
      false,
      ['encrypt']
    );

    const encoder = new TextEncoder();
    const encodedPayload = encoder.encode(payload);

    // Perform AES-GCM encryption
    const ciphertext = await global.crypto.subtle.encrypt(
      { name: 'AES-GCM', iv: ivBytes as any } as any,
      cryptoKey,
      encodedPayload as any
    );

    return {
      encrypted: Buffer.from(ciphertext).toString('base64'),
      iv: Buffer.from(ivBytes).toString('base64'),
    };
  }

  /**
   * Decrypts an AES-256-GCM encrypted payload.
   * 
   * @param encryptedBase64 The encrypted payload in base64
   * @param symmetricKey The AES key (base64 encoded)
   * @param ivBase64 The initialization vector (IV) in base64
   * @returns The decrypted plaintext string
   */
  static async decryptPayload(encryptedBase64: string, symmetricKey: string, ivBase64: string): Promise<string> {
    const keyBuffer = Buffer.from(symmetricKey, 'base64');
    const ivBytes = Buffer.from(ivBase64, 'base64');
    const encryptedBytes = Buffer.from(encryptedBase64, 'base64');

    // Import raw key into Web Crypto API
    const cryptoKey = await global.crypto.subtle.importKey(
      'raw',
      keyBuffer as any,
      { name: 'AES-GCM' },
      false,
      ['decrypt']
    );

    // Perform AES-GCM decryption
    const decryptedBuffer = await global.crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: ivBytes as any } as any,
      cryptoKey,
      encryptedBytes as any
    );

    const decoder = new TextDecoder();
    return decoder.decode(decryptedBuffer);
  }

  /**
   * Generates a deterministic SHA-256 hash of the unencrypted file.
   * This hash is stored on the Hyperledger Fabric ledger to prove data integrity.
   * 
   * @param payload The original data
   * @returns The SHA-256 hash
   */
  static async generateLedgerHash(payload: string): Promise<string> {
    const hash = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      payload
    );
    return hash;
  }
}
