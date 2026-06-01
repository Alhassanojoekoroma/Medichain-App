/**
 * backend/api/services/IPFSStorage.js
 *
 * Manages IPFS storage via web3.storage.
 * Uploads medical documents and returns IPFS CID for decentralized storage.
 */

const { Web3Storage } = require('web3.storage');
const crypto = require('crypto');

class IPFSStorage {
  constructor() {
    const apiToken = process.env.WEB3_STORAGE_TOKEN;
    if (!apiToken) {
      console.warn('[IPFS] WEB3_STORAGE_TOKEN not set. IPFS uploads will fail.');
    }
    this.client = apiToken ? new Web3Storage({ token: apiToken }) : null;
  }

  /**
   * Check if IPFS is configured
   */
  isConfigured() {
    return !!this.client;
  }

  /**
   * Upload a file buffer to IPFS
   * Returns: { cid, hash }
   */
  async uploadFile(buffer, filename) {
    try {
      if (!this.isConfigured()) {
        throw new Error('Web3.Storage not configured. Set WEB3_STORAGE_TOKEN env var.');
      }

      // Create a File object from buffer
      const file = new File([buffer], filename, { type: 'application/octet-stream' });

      console.log(`[IPFS] Uploading: ${filename} (${buffer.length} bytes)`);

      const cid = await this.client.put([file], {
        name: filename,
        maxRetries: 3,
      });

      const hash = crypto.createHash('sha256').update(buffer).digest('hex');

      console.log(`[IPFS] Upload successful: ${cid}`);

      return {
        cid: cid.toString(),
        hash,
        filename,
        size: buffer.length,
      };
    } catch (error) {
      console.error('[IPFS] Upload error:', error);
      throw error;
    }
  }

  /**
   * Get file status from IPFS (returns null if not found)
   */
  async getStatus(cid) {
    try {
      if (!this.isConfigured()) {
        return null;
      }

      const status = await this.client.status(cid);
      return {
        cid: status.cid,
        created: status.created,
        dagSize: status.dagSize,
        pins: status.pins || [],
      };
    } catch (error) {
      console.error(`[IPFS] Get status error for ${cid}:`, error);
      return null;
    }
  }

  /**
   * Calculate SHA-256 hash for integrity verification
   */
  async calculateHash(buffer) {
    return crypto.createHash('sha256').update(buffer).digest('hex');
  }

  /**
   * Generate IPFS retrieval URL
   */
  getGatewayUrl(cid) {
    // Use public IPFS gateway
    return `https://w3s.link/ipfs/${cid}`;
  }

  /**
   * Get the IPFS HTTP gateway URL
   */
  getHttpGateway() {
    return process.env.IPFS_GATEWAY_URL || 'https://w3s.link/ipfs/';
  }
}

module.exports = new IPFSStorage();
