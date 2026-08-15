/**
 * Hyperledger Fabric gateway with fail-closed environment controls.
 *
 * Generated repository identities are never loaded. Real mode requires
 * runtime-mounted least-privilege identity paths. Simulation is permitted only
 * by the explicit synthetic-sandbox gate in config/environment.ts.
 */

import * as grpc from '@grpc/grpc-js';
import { connect, Gateway, Identity, signers } from '@hyperledger/fabric-gateway';
import crypto from 'crypto';
import fs from 'fs';
import { readSecurityConfig, FabricMode } from '../config/environment';
import { LedgerAnchor, validateLedgerAnchor } from '../domain/fabricGovernance';
import { logger } from '../utils/logger';

export interface FabricTxResult {
  txHash: string;
  timestamp: string;
  payload?: unknown;
  simulated?: boolean;
}

function requiredRuntimePath(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} is required when FABRIC_MODE=real.`);
  }
  if (!fs.existsSync(value)) {
    throw new Error(`${name} does not reference an available runtime-mounted file.`);
  }
  return value;
}

export class FabricGateway {
  private static connected = false;
  private static gateway: Gateway | null = null;
  private static client: grpc.Client | null = null;
  private static mode: FabricMode = 'disabled';

  static async connect(): Promise<void> {
    const config = readSecurityConfig();
    this.mode = config.fabricMode;

    if (this.mode === 'disabled') {
      this.connected = false;
      logger.info('[FabricGateway] Disabled by environment policy.');
      return;
    }

    if (this.mode === 'simulated') {
      // readSecurityConfig has already proved this is an explicit synthetic sandbox.
      this.connected = true;
      logger.warn('[FabricGateway] Synthetic-sandbox simulation is active.');
      return;
    }

    const peerEndpoint = process.env.FABRIC_PEER_ENDPOINT;
    const mspId = process.env.FABRIC_MSP_ID;
    if (!peerEndpoint || !mspId) {
      throw new Error('FABRIC_PEER_ENDPOINT and FABRIC_MSP_ID are required when FABRIC_MODE=real.');
    }

    const tlsCaCert = fs.readFileSync(requiredRuntimePath('FABRIC_TLS_CA_PATH'));
    const credentials = fs.readFileSync(requiredRuntimePath('FABRIC_CERT_PATH'));
    const privateKeyPem = fs.readFileSync(requiredRuntimePath('FABRIC_PRIVATE_KEY_PATH'));

    try {
      this.client = new grpc.Client(peerEndpoint, grpc.credentials.createSsl(tlsCaCert));
      const identity: Identity = { mspId, credentials };
      const privateKey = crypto.createPrivateKey(privateKeyPem);
      const signer = signers.newPrivateKeySigner(privateKey);

      this.gateway = connect({
        client: this.client,
        identity,
        signer,
        evaluateOptions: () => ({ deadline: Date.now() + 5000 }),
        endorseOptions: () => ({ deadline: Date.now() + 15000 }),
        submitOptions: () => ({ deadline: Date.now() + 5000 }),
        commitStatusOptions: () => ({ deadline: Date.now() + 60000 }),
      });
      this.connected = true;
      logger.info('[FabricGateway] Connected using a runtime-mounted identity.');
    } catch (error) {
      await this.disconnect();
      this.mode = 'real';
      throw error;
    }
  }

  static async disconnect(): Promise<void> {
    this.gateway?.close();
    this.client?.close();
    this.gateway = null;
    this.client = null;
    this.connected = false;
  }

  static async submitTx(
    chaincodeName: string,
    functionName: string,
    ...args: string[]
  ): Promise<FabricTxResult> {
    if (this.mode === 'simulated') {
      return {
        txHash: `sandbox_simulation_${crypto.randomUUID()}`,
        timestamp: new Date().toISOString(),
        simulated: true,
      };
    }
    if (this.mode !== 'real' || !this.gateway || !this.connected) {
      throw new Error('Fabric is unavailable. No ledger transaction was submitted.');
    }

    const channelName = process.env.FABRIC_CHANNEL || 'medichain';
    const contract = this.gateway.getNetwork(channelName).getContract(chaincodeName);
    const submitted = await contract.submitAsync(functionName, { arguments: args });
    const status = await submitted.getStatus();
    if (!status.successful) {
      throw new Error(`Fabric transaction failed to commit with status code ${status.code}.`);
    }

    const payloadString = new TextDecoder().decode(submitted.getResult());
    let payload: unknown = payloadString;
    try {
      payload = payloadString ? JSON.parse(payloadString) : null;
    } catch {
      // Preserve a non-JSON chaincode response as text.
    }

    return {
      txHash: submitted.getTransactionId(),
      timestamp: new Date().toISOString(),
      payload,
      simulated: false,
    };
  }

  static async evaluateTx(
    chaincodeName: string,
    functionName: string,
    ...args: string[]
  ): Promise<Record<string, unknown>> {
    if (this.mode === 'simulated') {
      return { simulated: true };
    }
    if (this.mode !== 'real' || !this.gateway || !this.connected) {
      throw new Error('Fabric is unavailable. No ledger query was evaluated.');
    }

    const channelName = process.env.FABRIC_CHANNEL || 'medichain';
    const contract = this.gateway.getNetwork(channelName).getContract(chaincodeName);
    const resultString = new TextDecoder().decode(
      await contract.evaluateTransaction(functionName, ...args)
    );

    try {
      return JSON.parse(resultString);
    } catch {
      return { result: resultString };
    }
  }

  static async submitGovernedAnchor(anchor: LedgerAnchor): Promise<FabricTxResult> {
    if (!validateLedgerAnchor(anchor)) throw new Error('LEDGER_ANCHOR_INVALID');
    return this.submitTx('palmchain-anchor', 'PutAnchor', JSON.stringify(anchor));
  }

  static isConnected(): boolean {
    return this.connected;
  }

  static async healthCheck(): Promise<{ connected: boolean; mode: FabricMode }> {
    return { connected: this.connected, mode: this.mode };
  }
}
