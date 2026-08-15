/**
 * backend/src/services/AuditService.ts
 * 
 * Writes every access event to:
 *   1. Postgres (immediate, available offline-safe)
 *   2. OfflineQueue for Hyperledger Fabric sync
 * 
 * Every access attempt — granted or denied — is recorded.
 */

import { db } from '../config/db';
import { OfflineQueue } from './OfflineQueue';
import { FabricGateway } from './FabricGateway';
import crypto from 'crypto';
import { AnchorEventType, createLedgerAnchor } from '../domain/fabricGovernance';

export interface AuditInput {
  patientId?: string;
  actorId: string;
  actorRole: string;
  actorFullName?: string;   // display name: "Nurse Inos" or "Dr. Amara Kofi"
  clinicName?: string;      // hospital name: "Connaught Hospital, Freetown"
  tokenId?: string;
  consentId?: string;
  accessType: string;
  dataCategories?: string[];
  ipAddress?: string;
  isEmergency?: boolean;
  outcome: 'granted' | 'denied';
  denialReason?: string;
}

export class AuditService {

  static async log(input: AuditInput): Promise<string> {
    const result = await db.query(
      `INSERT INTO access_logs
         (patient_id, actor_id, actor_role, token_id, consent_id,
          access_type, data_categories, ip_address, is_emergency, outcome, denial_reason)
       VALUES ($1,$2,$3,$4,$5,$6,$7::jsonb,$8,$9,$10,$11)
       RETURNING id`,
      [
        input.patientId ?? null,
        input.actorId,
        // Store role + full name together for easy display: "nurse:Nurse Inos"
        input.actorFullName
          ? `${input.actorRole}:${input.actorFullName}${input.clinicName ? ':' + input.clinicName : ''}`
          : input.actorRole,
        input.tokenId ?? null,
        input.consentId ?? null,
        input.accessType,
        JSON.stringify(input.dataCategories ?? []),
        input.ipAddress ?? null,
        input.isEmergency ?? false,
        input.outcome,
        input.denialReason ?? null,
      ]
    );

    const logId = result.rows[0].id;

    // Queue for Fabric sync (works even offline)
    await OfflineQueue.enqueue('AUDIT_LOG', {
      logId,
      patientId: input.patientId,
      actorId: input.actorId,
      actorRole: input.actorRole,
      actorFullName: input.actorFullName,
      accessType: input.accessType,
      outcome: input.outcome,
      isEmergency: input.isEmergency,
      timestamp: new Date().toISOString(),
    });

    return logId;
  }

  /** Sync pending items from the Offline Queue to Hyperledger Fabric */
  static async syncToLedger(): Promise<{ processed: number; failed: number }> {
    // Ensure FabricGateway is connected
    if (!FabricGateway.isConnected()) {
      await FabricGateway.connect();
    }

    const result = await OfflineQueue.drain(async (eventType, payload, queueEventId) => {
      const eventTypeMap: Record<string, AnchorEventType> = {
        AUDIT_LOG: 'AUDIT',
        CONSENT_GRANT: 'CONSENT_GRANTED',
        CONSENT_REVOKE: 'CONSENT_REVOKED',
        REVOCATION: 'CONSENT_REVOKED',
        ACCESS_REQUEST_APPROVED: 'ACCESS_DECISION',
      };
      const anchorEventType = eventTypeMap[eventType];
      if (!anchorEventType) throw new Error(`Unknown event type: ${eventType}`);

      const eventId = String(payload.logId || payload.consentId || payload.requestId || queueEventId);
      const anchor = createLedgerAnchor({
        eventId,
        eventType: anchorEventType,
        sourcePayload: payload,
        policyVersion: process.env.FABRIC_POLICY_VERSION || 'v1',
        organization: process.env.FABRIC_ORGANIZATION || 'SandboxOrg',
      }, process.env.FABRIC_ANCHOR_DIGEST_SECRET || process.env.JWT_SECRET || '');
      const txResult = await FabricGateway.submitGovernedAnchor(anchor);

      switch (eventType) {
        case 'AUDIT_LOG':

          // Update postgres access_logs table so it reflects synced status
          await db.query(
            `UPDATE access_logs SET synced_to_ledger = TRUE, ledger_tx_hash = $1 WHERE id = $2`,
            [txResult.txHash, payload.logId]
          );
          return txResult.txHash;

        default:
          return txResult.txHash;
      }
    });

    return { processed: result.processed, failed: result.failed };
  }

  static async getPatientAccessHistory(patientId: string, limit = 50) {
    const result = await db.query(
      `SELECT al.id, al.actor_id, al.actor_role, al.access_type,
              al.data_categories, al.is_emergency, al.outcome,
              al.denial_reason, al.created_at, al.ledger_tx_hash,
              d.full_name AS doctor_name, c.name AS clinic_name
         FROM access_logs al
         LEFT JOIN doctors d ON d.id::text = al.actor_id
         LEFT JOIN clinics c ON c.id::text = al.actor_id
        WHERE al.patient_id = $1
        ORDER BY al.created_at DESC
        LIMIT $2`,
      [patientId, limit]
    );
    return result.rows;
  }
}
