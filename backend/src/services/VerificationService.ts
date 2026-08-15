/**
 * Verification Service
 * Implements step-by-step verification logic per Tech Health Africa meeting (June 2026)
 * Verification at every stage is required for data security and compliance
 */

import { db } from '../config/db';
import { logger } from '../utils/logger';
import crypto from 'crypto';

export enum VerificationStage {
  IDENTITY = 'IDENTITY',
  CREDENTIALS = 'CREDENTIALS',
  FACILITY = 'FACILITY',
  PATIENT_CONSENT = 'PATIENT_CONSENT',
  DATA_ACCESS = 'DATA_ACCESS',
  BLOCKCHAIN = 'BLOCKCHAIN',
}

export enum VerificationStatus {
  PENDING = 'PENDING',
  VERIFIED = 'VERIFIED',
  FAILED = 'FAILED',
  SKIPPED = 'SKIPPED',
}

export interface VerificationResult {
  stage: VerificationStage;
  status: VerificationStatus;
  timestamp: string;
  verifiedBy?: string;
  details?: any;
  error?: string;
}

export interface VerificationContext {
  actorId: string;
  actorRole: string;
  facilityId?: string;
  patientId?: string;
  requestId?: string;
}

class VerificationService {
  /**
   * Verify actor identity
   * Checks if the actor is authenticated and has valid credentials
   */
  static async verifyIdentity(context: VerificationContext): Promise<VerificationResult> {
    try {
      const result: VerificationResult = {
        stage: VerificationStage.IDENTITY,
        status: VerificationStatus.PENDING,
        timestamp: new Date().toISOString(),
      };

      // Check if actor exists and is active
      const actorQuery = context.actorRole === 'patient'
        ? 'SELECT id, account_status FROM patients WHERE id = $1'
        : 'SELECT id, account_status, is_active FROM doctors WHERE id = $1';

      const actorResult = await db.query(actorQuery, [context.actorId]);

      if (actorResult.rows.length === 0) {
        result.status = VerificationStatus.FAILED;
        result.error = 'Actor not found';
        logger.warn(`[Verification] Identity verification failed: Actor ${context.actorId} not found`);
        return result;
      }

      const actor = actorResult.rows[0];
      const isActive = context.actorRole === 'patient'
        ? actor.account_status === 'active'
        : actor.is_active && actor.account_status === 'active';

      if (!isActive) {
        result.status = VerificationStatus.FAILED;
        result.error = 'Actor account is not active';
        logger.warn(`[Verification] Identity verification failed: Actor ${context.actorId} is not active`);
        return result;
      }

      result.status = VerificationStatus.VERIFIED;
      result.verifiedBy = 'system';
      result.details = { actorId: context.actorId, role: context.actorRole };
      logger.info(`[Verification] Identity verified for ${context.actorRole} ${context.actorId}`);
      return result;
    } catch (error: any) {
      logger.error(`[Verification] Identity verification error: ${error.message}`);
      return {
        stage: VerificationStage.IDENTITY,
        status: VerificationStatus.FAILED,
        timestamp: new Date().toISOString(),
        error: error.message,
      };
    }
  }

  /**
   * Verify facility access
   * Checks if the actor has access to the specified facility
   */
  static async verifyFacility(context: VerificationContext): Promise<VerificationResult> {
    try {
      const result: VerificationResult = {
        stage: VerificationStage.FACILITY,
        status: VerificationStatus.PENDING,
        timestamp: new Date().toISOString(),
      };

      if (!context.facilityId) {
        result.status = VerificationStatus.SKIPPED;
        result.details = { reason: 'No facility specified' };
        return result;
      }

      // Check if facility exists and is active
      const facilityResult = await db.query(
        'SELECT id, is_active FROM clinics WHERE id = $1',
        [context.facilityId]
      );

      if (facilityResult.rows.length === 0) {
        result.status = VerificationStatus.FAILED;
        result.error = 'Facility not found';
        logger.warn(`[Verification] Facility verification failed: Facility ${context.facilityId} not found`);
        return result;
      }

      const facility = facilityResult.rows[0];
      if (!facility.is_active) {
        result.status = VerificationStatus.FAILED;
        result.error = 'Facility is not active';
        logger.warn(`[Verification] Facility verification failed: Facility ${context.facilityId} is not active`);
        return result;
      }

      // For non-patient roles, verify actor is assigned to this facility
      if (context.actorRole !== 'patient') {
        const assignmentResult = await db.query(
          'SELECT id FROM doctors WHERE id = $1 AND clinic_id = $2',
          [context.actorId, context.facilityId]
        );

        if (assignmentResult.rows.length === 0) {
          result.status = VerificationStatus.FAILED;
          result.error = 'Actor is not assigned to this facility';
          logger.warn(`[Verification] Facility verification failed: Actor ${context.actorId} not assigned to ${context.facilityId}`);
          return result;
        }
      }

      result.status = VerificationStatus.VERIFIED;
      result.verifiedBy = 'system';
      result.details = { facilityId: context.facilityId };
      logger.info(`[Verification] Facility verified: ${context.actorId} at ${context.facilityId}`);
      return result;
    } catch (error: any) {
      logger.error(`[Verification] Facility verification error: ${error.message}`);
      return {
        stage: VerificationStage.FACILITY,
        status: VerificationStatus.FAILED,
        timestamp: new Date().toISOString(),
        error: error.message,
      };
    }
  }

  /**
   * Verify patient consent
   * Checks if patient has granted consent for the requested access
   */
  static async verifyPatientConsent(
    context: VerificationContext,
    dataCategories: string[] = ['all'],
    requestedAccessType: 'read' | 'write' = 'read',
    purpose: 'treatment' | 'care-coordination' = 'treatment'
  ): Promise<VerificationResult> {
    try {
      const result: VerificationResult = {
        stage: VerificationStage.PATIENT_CONSENT,
        status: VerificationStatus.PENDING,
        timestamp: new Date().toISOString(),
      };

      if (!context.patientId) {
        result.status = VerificationStatus.SKIPPED;
        result.details = { reason: 'No patient specified' };
        return result;
      }

      // If actor is the patient, consent is implied
      if (context.actorId === context.patientId) {
        result.status = VerificationStatus.VERIFIED;
        result.details = { reason: 'Self-access' };
        return result;
      }

      // Check a narrow, active policy. Role-wide and purpose-wide grants are
      // intentionally excluded from normal clinical authorization.
      const consentResult = await db.query(
        `SELECT id, access_type, data_categories, purpose, grantee_type,
                expires_at, is_revoked, revoked_at, is_one_time, used_at
         FROM consent_policies
         WHERE patient_id = $1
         AND is_revoked = FALSE
         AND revoked_at IS NULL
         AND (expires_at IS NULL OR expires_at > NOW())
         AND access_type = $4
         AND purpose = $5
         AND (is_one_time = FALSE OR used_at IS NULL)
         AND (
           (grantee_type = 'doctor' AND grantee_id = $2)
           OR (grantee_type = 'clinic' AND grantee_id = $3)
         )
         LIMIT 1`,
        [context.patientId, context.actorId, context.facilityId ?? '', requestedAccessType, purpose]
      );

      if (consentResult.rows.length === 0) {
        result.status = VerificationStatus.FAILED;
        result.error = 'No active consent policy found';
        logger.warn(`[Verification] Consent verification failed: No consent for ${context.actorId} to access ${context.patientId}`);
        return result;
      }

      const consent = consentResult.rows[0];
      
      // Verify data categories match
      const consentCategories = Array.isArray(consent.data_categories) 
        ? consent.data_categories 
        : JSON.parse(consent.data_categories);
      
      const hasAllAccess = consentCategories.includes('all');
      const hasRequestedAccess = dataCategories.every(cat => consentCategories.includes(cat));

      if (!hasAllAccess && !hasRequestedAccess) {
        result.status = VerificationStatus.FAILED;
        result.error = 'Consent does not cover requested data categories';
        logger.warn(`[Verification] Consent verification failed: Insufficient data categories for ${context.actorId}`);
        return result;
      }

      result.status = VerificationStatus.VERIFIED;
      result.verifiedBy = 'system';
      result.details = { consentId: consent.id, accessType: consent.access_type };
      logger.info(`[Verification] Consent verified: ${context.actorId} has access to ${context.patientId}`);
      return result;
    } catch (error: any) {
      logger.error(`[Verification] Consent verification error: ${error.message}`);
      return {
        stage: VerificationStage.PATIENT_CONSENT,
        status: VerificationStatus.FAILED,
        timestamp: new Date().toISOString(),
        error: error.message,
      };
    }
  }

  /**
   * Run complete verification pipeline
   * Executes all verification stages in sequence
   */
  static async runVerificationPipeline(
    context: VerificationContext,
    stages: VerificationStage[] = [
      VerificationStage.IDENTITY,
      VerificationStage.FACILITY,
      VerificationStage.PATIENT_CONSENT,
    ],
    options?: {
      dataCategories?: string[];
      requestedAccessType?: 'read' | 'write';
      purpose?: 'treatment' | 'care-coordination';
    }
  ): Promise<VerificationResult[]> {
    const results: VerificationResult[] = [];

    for (const stage of stages) {
      let result: VerificationResult;

      switch (stage) {
        case VerificationStage.IDENTITY:
          result = await this.verifyIdentity(context);
          break;
        case VerificationStage.FACILITY:
          result = await this.verifyFacility(context);
          break;
        case VerificationStage.PATIENT_CONSENT:
          result = await this.verifyPatientConsent(
            context,
            options?.dataCategories,
            options?.requestedAccessType,
            options?.purpose
          );
          break;
        default:
          result = {
            stage,
            status: VerificationStatus.SKIPPED,
            timestamp: new Date().toISOString(),
            details: { reason: 'Stage not implemented' },
          };
      }

      results.push(result);

      // Stop pipeline if a critical verification fails
      if (result.status === VerificationStatus.FAILED && stage === VerificationStage.IDENTITY) {
        logger.error(`[Verification] Pipeline stopped at ${stage}: Critical failure`);
        break;
      }
    }

    return results;
  }

  /**
   * Log verification results to audit trail
   */
  static async logVerificationResults(
    context: VerificationContext,
    results: VerificationResult[]
  ): Promise<void> {
    for (const result of results) {
      if (result.status === VerificationStatus.SKIPPED) continue;

      await db.query(
          `INSERT INTO security_audit_events (
            actor_ref_hash, subject_ref_hash, facility_id, event_type, outcome, metadata, event_hash
          ) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [
            this.hashRef(context.actorId),
            context.patientId ? this.hashRef(context.patientId) : null,
            context.facilityId || null,
            `VERIFICATION_${result.stage}`,
            result.status.toLowerCase(),
            JSON.stringify({
              stage: result.stage,
              status: result.status,
              timestamp: result.timestamp,
              errorCode: result.error ? 'VERIFICATION_FAILED' : undefined,
              requestId: context.requestId,
            }),
            this.hashRef(`${context.actorId}:${result.stage}:${result.timestamp}`),
          ]
      );
    }
    logger.info(`[Verification] Audit log created for ${results.length} verification stages`);
  }

  private static hashRef(ref: string): string {
    const pepper = process.env.AUDIT_PEPPER || process.env.JWT_SECRET;
    if (!pepper || pepper.length < 32) throw new Error('AUDIT_PEPPER_REQUIRED');
    return crypto.createHmac('sha256', pepper).update(ref).digest('hex');
  }
}

export default VerificationService;
