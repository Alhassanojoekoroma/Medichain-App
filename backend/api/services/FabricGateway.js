/**
 * backend/api/services/FabricGateway.js
 *
 * Manages connection to Hyperledger Fabric network.
 * Handles contract transactions for audit, consent, and patient records.
 */

const { Gateway, Wallets } = require('fabric-network');
const path = require('path');
const fs = require('fs');

class FabricGateway {
  constructor() {
    this.gateway = null;
    this.network = null;
    this.contracts = {}; // { auditContract, consentContract, patientContract }
    this.isConnected = false;
  }

  /**
   * Initialize connection to Fabric network
   * Assumes wallets and crypto material are set up locally
   */
  async connect() {
    try {
      if (this.isConnected) {
        console.log('[Fabric] Already connected');
        return;
      }

      const ccpPath = process.env.FABRIC_CONNECTION_PROFILE || 
        path.resolve(__dirname, '../../medichain-network/connection-profile.json');
      
      if (!fs.existsSync(ccpPath)) {
        throw new Error(`Connection profile not found at ${ccpPath}`);
      }

      const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));
      const walletPath = process.env.FABRIC_WALLET_PATH || 
        path.resolve(__dirname, '../wallet');

      const wallet = await Wallets.newFileSystemWallet(walletPath);

      // Check if admin identity exists
      const adminIdentity = await wallet.get('admin');
      if (!adminIdentity) {
        console.warn('[Fabric] Admin identity not found. Using read-only mode.');
      }

      this.gateway = new Gateway();
      await this.gateway.connect(ccp, {
        wallet,
        identity: adminIdentity ? 'admin' : undefined,
        discovery: { 
          enabled: true, 
          asLocalhost: process.env.FABRIC_LOCALNET === 'true' 
        },
      });

      this.network = await this.gateway.getNetwork('medichain');

      // Get contract references
      this.contracts.auditContract = this.network.getContract('medichain-audit');
      this.contracts.consentContract = this.network.getContract('medichain-consent');
      this.contracts.patientContract = this.network.getContract('medichain-patient');

      this.isConnected = true;
      console.log('[Fabric] Connected to network');
    } catch (error) {
      console.error('[Fabric] Connection error:', error);
      this.isConnected = false;
      throw error;
    }
  }

  /**
   * Submit audit log to ledger
   */
  async submitAuditLog(auditData) {
    try {
      if (!this.isConnected) await this.connect();

      const {
        logId,
        patientId,
        actorId,
        actorRole,
        accessType,
        outcome,
        isEmergency,
        timestamp,
      } = auditData;

      const result = await this.contracts.auditContract.submitTransaction(
        'AddAuditLog',
        logId,
        patientId || 'unknown',
        actorId,
        actorRole,
        accessType,
        outcome,
        isEmergency ? 'true' : 'false',
        timestamp
      );

      const txHash = Buffer.from(result).toString('utf8');
      console.log(`[Fabric] Audit logged (tx: ${txHash})`);
      return txHash;
    } catch (error) {
      console.error('[Fabric] Submit audit error:', error);
      throw error;
    }
  }

  /**
   * Submit consent policy to ledger
   */
  async submitConsent(consentData) {
    try {
      if (!this.isConnected) await this.connect();

      const {
        consentId,
        patientId,
        granteeType,
        granteeId,
        accessType,
        dataCategories,
        expiresAt,
      } = consentData;

      const result = await this.contracts.consentContract.submitTransaction(
        'RegisterConsent',
        consentId,
        patientId,
        granteeType,
        granteeId,
        accessType,
        JSON.stringify(dataCategories),
        expiresAt || 'never'
      );

      const txHash = Buffer.from(result).toString('utf8');
      console.log(`[Fabric] Consent registered (tx: ${txHash})`);
      return txHash;
    } catch (error) {
      console.error('[Fabric] Submit consent error:', error);
      throw error;
    }
  }

  /**
   * Submit record hash to ledger for integrity verification
   */
  async notarizeRecord(recordData) {
    try {
      if (!this.isConnected) await this.connect();

      const {
        recordId,
        patientId,
        recordType,
        integrityHash,
        ipfsCid,
        uploadedBy,
      } = recordData;

      const result = await this.contracts.patientContract.submitTransaction(
        'AddDocument',
        recordId,
        patientId,
        recordType,
        integrityHash,
        ipfsCid,
        uploadedBy
      );

      const txHash = Buffer.from(result).toString('utf8');
      console.log(`[Fabric] Record notarized (tx: ${txHash})`);
      return txHash;
    } catch (error) {
      console.error('[Fabric] Notarize record error:', error);
      throw error;
    }
  }

  /**
   * Revoke consent on ledger
   */
  async revokeConsent(consentId, patientId, reason) {
    try {
      if (!this.isConnected) await this.connect();

      const result = await this.contracts.consentContract.submitTransaction(
        'RevokeConsent',
        consentId,
        patientId,
        reason || 'patient_request'
      );

      const txHash = Buffer.from(result).toString('utf8');
      console.log(`[Fabric] Consent revoked (tx: ${txHash})`);
      return txHash;
    } catch (error) {
      console.error('[Fabric] Revoke consent error:', error);
      throw error;
    }
  }

  /**
   * Query consent by ID (read-only)
   */
  async queryConsent(consentId) {
    try {
      if (!this.isConnected) await this.connect();

      const result = await this.contracts.consentContract.evaluateTransaction(
        'GetConsent',
        consentId
      );

      return JSON.parse(Buffer.from(result).toString('utf8'));
    } catch (error) {
      console.error('[Fabric] Query consent error:', error);
      throw error;
    }
  }

  /**
   * Record doctor access request approval on blockchain (GAP 5)
   * Called after patient approves an async access request
   */
  async recordAccessRequestApproval(approvalData) {
    try {
      if (!this.isConnected) await this.connect();

      const {
        requestId,
        doctorId,
        patientId,
        consentId,
        dataCategories,
      } = approvalData;

      // Record as audit log: Patient approved doctor access request
      const result = await this.contracts.auditContract.submitTransaction(
        'AddAuditLog',
        requestId, // logId
        patientId, // actor
        'patient', // actorRole
        doctorId, // subject
        'ACCESS_REQUEST_APPROVED', // action
        JSON.stringify({
          consentId,
          dataCategories,
          requestId,
        }), // details
        'completed' // status
      );

      const txHash = Buffer.from(result).toString('utf8');
      console.log(`[Fabric] Access request approval recorded (tx: ${txHash})`);
      return txHash;
    } catch (error) {
      console.error('[Fabric] Record access request approval error:', error);
      throw error;
    }
  }

  /**
   * Get connection status
   */
  getStatus() {
    return {
      connected: this.isConnected,
      hasAuditContract: !!this.contracts.auditContract,
      hasConsentContract: !!this.contracts.consentContract,
      hasPatientContract: !!this.contracts.patientContract,
    };
  }

  /**
   * Disconnect from network
   */
  async disconnect() {
    if (this.gateway) {
      await this.gateway.disconnect();
      this.isConnected = false;
      console.log('[Fabric] Disconnected');
    }
  }
}

module.exports = new FabricGateway();
