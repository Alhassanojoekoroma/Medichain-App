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

export interface AuditInput {
  patientId?: string;
  actorId: string;
  actorRole: string;
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
        input.actorRole,
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

    const result = await OfflineQueue.drain(async (eventType, payload) => {
      let txResult;
      switch (eventType) {
        case 'AUDIT_LOG':
          // AddAuditLog(id, actor, actorRole, subject, action, details, status)
          txResult = await FabricGateway.submitTx(
            'audit',
            'AddAuditLog',
            String(payload.logId),
            String(payload.actorId),
            String(payload.actorRole),
            String(payload.patientId || 'none'),
            String(payload.accessType),
            JSON.stringify({ isEmergency: payload.isEmergency }),
            String(payload.outcome)
          );

          // Update postgres access_logs table so it reflects synced status
          await db.query(
            `UPDATE access_logs SET synced_to_ledger = TRUE, ledger_tx_hash = $1 WHERE id = $2`,
            [txResult.txHash, payload.logId]
          );
          return txResult.txHash;

        case 'CONSENT_GRANT':
          // RegisterConsent(id, patientId, granteeType, granteeId, accessType, dataCategoriesJSON, expiresAt)
          txResult = await FabricGateway.submitTx(
            'consent',
            'RegisterConsent',
            String(payload.consentId),
            String(payload.patientId),
            String(payload.granteeType || 'doctor'),
            String(payload.granteeId),
            String(payload.accessType),
            JSON.stringify(payload.dataCategories || ['all']),
            String(payload.expiresAt || '')
          );
          return txResult.txHash;

        case 'CONSENT_REVOKE':
          // RevokeConsent(id, reason)
          const target = payload.target as any;
          if (target && target.consentId) {
            txResult = await FabricGateway.submitTx(
              'consent',
              'RevokeConsent',
              String(target.consentId),
              String(payload.reason || 'Revoked by patient')
            );
            return txResult.txHash;
          }
          return 'skipped_blanket_revocation';

        case 'ACCESS_REQUEST_APPROVED':
          // ApproveAccessRequest(requestId)
          txResult = await FabricGateway.submitTx(
            'doctor',
            'ApproveAccessRequest',
            String(payload.requestId)
          );
          return txResult.txHash;

        default:
          throw new Error(`Unknown event type: ${eventType}`);
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
