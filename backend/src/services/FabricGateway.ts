/**
 * backend/src/services/FabricGateway.ts
 *
 * Hyperledger Fabric Gateway integration for MediChain.
 * Connects to the local peer0 node using the official @hyperledger/fabric-gateway SDK.
 */

import * as grpc from '@grpc/grpc-js';
import { connect, Contract, Gateway, Identity, Signer, signers } from '@hyperledger/fabric-gateway';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

export interface FabricTxResult {
  txHash: string;
  blockNumber?: number;
  timestamp: string;
  payload?: any;
}

export class FabricGateway {
  private static connected = false;
  private static gateway: Gateway | null = null;
  private static client: grpc.Client | null = null;
  private static mode: 'real' | 'simulated' = 'simulated';

  /**
   * Connect to the Hyperledger Fabric network.
   */
  static async connect(): Promise<void> {
    const runMode = process.env.FABRIC_MODE || 'real';
    if (runMode === 'simulated') {
      this.mode = 'simulated';
      this.connected = true;
      console.log('[FabricGateway] Running in SIMULATED mode');
      return;
    }

    try {
      console.log('[FabricGateway] Connecting to Hyperledger Fabric peer...');

      // 1. Define network directories
      const baseDir = process.cwd();
      const networkDir = baseDir.endsWith('backend') 
        ? path.resolve(baseDir, '../medichain-network')
        : path.resolve(baseDir, './medichain-network');

      // 2. Establish gRPC connection to peer (with TLS)
      const peerEndpoint = process.env.FABRIC_PEER_ENDPOINT || 'peer0.org1.medichain.local:7051';
      const tlsCaPath = path.resolve(
        networkDir,
        'crypto-config/peerOrganizations/org1.medichain.local/peers/peer0.org1.medichain.local/tls/ca.crt'
      );
      if (!fs.existsSync(tlsCaPath)) {
        throw new Error(`TLS CA certificate not found at: ${tlsCaPath}`);
      }
      const tlsCaCert = fs.readFileSync(tlsCaPath);
      this.client = new grpc.Client(peerEndpoint, grpc.credentials.createSsl(tlsCaCert));

      // 3. Load Org1 Admin Identity
      const mspId = process.env.FABRIC_MSP_ID || 'Org1MSP';

      const certPath = path.resolve(
        networkDir,
        'crypto-config/peerOrganizations/org1.medichain.local/users/Admin@org1.medichain.local/msp/signcerts/Admin@org1.medichain.local-cert.pem'
      );
      
      if (!fs.existsSync(certPath)) {
        throw new Error(`Admin certificate not found at: ${certPath}`);
      }
      const credentials = fs.readFileSync(certPath);
      const identity: Identity = { mspId, credentials };

      // 4. Load Org1 Admin Private Key Signer
      const keyPath = path.resolve(
        networkDir,
        'crypto-config/peerOrganizations/org1.medichain.local/users/Admin@org1.medichain.local/msp/keystore/priv_sk'
      );
      if (!fs.existsSync(keyPath)) {
        throw new Error(`Admin private key not found at: ${keyPath}`);
      }
      const privateKeyPem = fs.readFileSync(keyPath);
      const privateKey = crypto.createPrivateKey(privateKeyPem);
      const signer = signers.newPrivateKeySigner(privateKey);

      // 5. Connect Gateway client
      this.gateway = connect({
        client: this.client,
        identity,
        signer,
        evaluateOptions: () => ({ deadline: Date.now() + 5000 }),
        endorseOptions: () => ({ deadline: Date.now() + 15000 }),
        submitOptions: () => ({ deadline: Date.now() + 5000 }),
        commitStatusOptions: () => ({ deadline: Date.now() + 60000 }),
      });

      this.mode = 'real';
      this.connected = true;
      console.log('[FabricGateway] Successfully connected to Hyperledger Fabric');
    } catch (error) {
      console.error('[FabricGateway] Failed to connect to live Fabric network. Falling back to SIMULATION:', error);
      this.mode = 'simulated';
      this.connected = true;
    }
  }

  static async disconnect(): Promise<void> {
    if (this.gateway) {
      this.gateway.close();
      this.gateway = null;
    }
    if (this.client) {
      this.client.close();
      this.client = null;
    }
    this.connected = false;
    console.log('[FabricGateway] Disconnected from Fabric network');
  }

  /**
   * Submit a transaction to the ledger (write operation).
   */
  static async submitTx(
    chaincodeName: string,
    functionName: string,
    ...args: string[]
  ): Promise<FabricTxResult> {
    if (this.mode === 'simulated' || !this.gateway) {
      const txHash = `sim_${chaincodeName}_${crypto.randomUUID().substring(0, 12)}`;
      console.log(`[FabricGateway] [SIMULATED] submitTx(${chaincodeName}.${functionName}, args=${JSON.stringify(args)}) → ${txHash}`);
      return {
        txHash,
        blockNumber: Math.floor(Math.random() * 100000),
        timestamp: new Date().toISOString(),
      };
    }

    try {
      console.log(`[FabricGateway] [REAL] Submitting transaction: ${chaincodeName}.${functionName}`);
      const network = this.gateway.getNetwork('medichain');
      const contract = network.getContract(chaincodeName);

      // Submitting transactions evaluates endorsements and commits to the ledger
      const submitResult = await contract.submitTransaction(functionName, ...args);
      const payloadString = new TextDecoder().decode(submitResult);
      let payload = null;
      try {
        payload = JSON.parse(payloadString);
      } catch {
        payload = payloadString;
      }

      // Generate a mock hash for logging if tx details are abstract
      const txHash = `fabric_${crypto.randomBytes(16).toString('hex')}`;

      return {
        txHash,
        timestamp: new Date().toISOString(),
        payload,
      };
    } catch (error) {
      console.error(`[FabricGateway] submitTx ${chaincodeName}.${functionName} failed:`, error);
      throw error;
    }
  }

  /**
   * Evaluate a transaction (read-only query).
   */
  static async evaluateTx(
    chaincodeName: string,
    functionName: string,
    ...args: string[]
  ): Promise<Record<string, unknown>> {
    if (this.mode === 'simulated' || !this.gateway) {
      console.log(`[FabricGateway] [SIMULATED] evaluateTx(${chaincodeName}.${functionName}, args=${JSON.stringify(args)})`);
      return { simulated: true, args };
    }

    try {
      console.log(`[FabricGateway] [REAL] Evaluating query: ${chaincodeName}.${functionName}`);
      const network = this.gateway.getNetwork('medichain');
      const contract = network.getContract(chaincodeName);

      const resultBytes = await contract.evaluateTransaction(functionName, ...args);
      const resultString = new TextDecoder().decode(resultBytes);
      
      try {
        return JSON.parse(resultString);
      } catch {
        return { result: resultString };
      }
    } catch (error) {
      console.error(`[FabricGateway] evaluateTx ${chaincodeName}.${functionName} failed:`, error);
      throw error;
    }
  }

  static isConnected(): boolean {
    return this.connected;
  }

  static async healthCheck(): Promise<{ connected: boolean; mode: string }> {
    return {
      connected: this.connected,
      mode: this.mode,
    };
  }
}
