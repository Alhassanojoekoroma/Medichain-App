/**
 * backend/src/services/AccessRequestService.ts
 * GAP 5: Doctor access request workflow
 * Doctors request access asynchronously; patients approve/deny
 */
import { db } from '../config/db';
import { OfflineQueue } from './OfflineQueue';
import { FabricGateway } from './FabricGateway';

export interface CreateAccessRequestInput {
  doctorId: string;
  patientId: string;
  reason: string;
  dataCategories?: string[];
}

export interface ApprovalInput {
  requestId: string;
  patientId: string;
  dataCategories?: string[];
}

export interface DenialInput {
  requestId: string;
  patientId: string;
  denialReason?: string;
}

export class AccessRequestService {
  /**
   * Doctor submits a request for access to patient records
   * Status: pending
   * Expires in 7 days
   */
  static async createRequest(input: CreateAccessRequestInput): Promise<string> {
    const { doctorId, patientId, reason, dataCategories = ['all'] } = input;

    // Validate doctor and patient exist
    const [docRes, patRes] = await Promise.all([
      db.query('SELECT id FROM doctors WHERE id = $1', [doctorId]),
      db.query('SELECT id FROM patients WHERE id = $1', [patientId]),
    ]);

    if (docRes.rowCount === 0) throw new Error('Doctor not found');
    if (patRes.rowCount === 0) throw new Error('Patient not found');

    // Create request
    const result = await db.query(
      `INSERT INTO doctor_access_requests (doctor_id, patient_id, reason, data_categories, expires_at)
       VALUES ($1, $2, $3, $4, NOW() + INTERVAL '7 days')
       RETURNING id`,
      [doctorId, patientId, reason, JSON.stringify(dataCategories)]
    );

    const requestId = result.rows[0].id;

    // TODO: Send push notification to patient
    console.log(`[AccessRequestService] Patient ${patientId} has new access request from doctor ${doctorId}`);

    return requestId;
  }

  /**
   * Patient approves a doctor's access request
   * Creates consent policy and queues Fabric transaction
   */
  static async approveRequest(input: ApprovalInput): Promise<void> {
    const { requestId, patientId, dataCategories = ['all'] } = input;

    // Fetch the request
    const reqRes = await db.query(
      `SELECT doctor_id, patient_id FROM doctor_access_requests
       WHERE id = $1 AND status = 'pending'`,
      [requestId]
    );

    if (reqRes.rowCount === 0) {
      throw new Error('Request not found or already processed');
    }

    const { doctor_id, patient_id } = reqRes.rows[0];

    // Verify patient matches
    if (patient_id !== patientId) {
      throw new Error('Unauthorized: patient mismatch');
    }

    // Create consent policy
    const consentRes = await db.query(
      `INSERT INTO consent_policies (
        patient_id, grantee_type, grantee_id, access_type, 
        data_categories, purpose, expires_at
       ) VALUES ($1, $2, $3, $4, $5, $6, NOW() + INTERVAL '90 days')
       RETURNING id`,
      [
        patientId,
        'doctor',
        doctor_id,
        'read',
        JSON.stringify(dataCategories),
        'Doctor access request approved',
      ]
    );

    const consentId = consentRes.rows[0].id;

    // Update request status
    await db.query(
      `UPDATE doctor_access_requests 
       SET status = 'approved', approved_at = NOW(), updated_at = NOW()
       WHERE id = $1`,
      [requestId]
    );

    // Queue approval on Fabric
    await OfflineQueue.enqueue('ACCESS_REQUEST_APPROVED', {
      requestId,
      doctorId: doctor_id,
      patientId,
      consentId,
      dataCategories,
    });

    console.log(`[AccessRequestService] Request ${requestId} approved for doctor ${doctor_id}`);
  }

  /**
   * Patient denies a doctor's access request
   */
  static async denyRequest(input: DenialInput): Promise<void> {
    const { requestId, patientId, denialReason } = input;

    // Fetch the request
    const reqRes = await db.query(
      `SELECT doctor_id, patient_id FROM doctor_access_requests
       WHERE id = $1 AND status = 'pending'`,
      [requestId]
    );

    if (reqRes.rowCount === 0) {
      throw new Error('Request not found or already processed');
    }

    const { patient_id } = reqRes.rows[0];

    // Verify patient matches
    if (patient_id !== patientId) {
      throw new Error('Unauthorized: patient mismatch');
    }

    // Update request status
    await db.query(
      `UPDATE doctor_access_requests 
       SET status = 'denied', denied_at = NOW(), denial_reason = $2, updated_at = NOW()
       WHERE id = $1`,
      [requestId, denialReason || 'Patient denied access']
    );

    console.log(`[AccessRequestService] Request ${requestId} denied by patient ${patientId}`);
  }

  /**
   * List pending access requests for a patient
   */
  static async listPendingRequests(patientId: string): Promise<any[]> {
    const result = await db.query(
      `SELECT 
         ar.id, ar.doctor_id, ar.reason, ar.data_categories, 
         ar.created_at, ar.expires_at,
         d.full_name AS doctor_name, d.specialty, 
         c.name AS clinic_name
       FROM doctor_access_requests ar
       JOIN doctors d ON ar.doctor_id = d.id
       LEFT JOIN clinics c ON d.clinic_id = c.id
       WHERE ar.patient_id = $1 AND ar.status = 'pending'
         AND ar.expires_at > NOW()
       ORDER BY ar.created_at DESC`,
      [patientId]
    );

    return result.rows.map((row) => ({
      id: row.id,
      doctorId: row.doctor_id,
      doctorName: row.doctor_name,
      specialty: row.specialty,
      clinicName: row.clinic_name,
      reason: row.reason,
      dataCategories: row.data_categories,
      createdAt: row.created_at,
      expiresAt: row.expires_at,
    }));
  }

  /**
   * List access request history for a patient (approved + denied)
   */
  static async listRequestHistory(patientId: string, limit = 20): Promise<any[]> {
    const result = await db.query(
      `SELECT 
         ar.id, ar.doctor_id, ar.reason, ar.status, 
         ar.approved_at, ar.denied_at, ar.denial_reason,
         d.full_name AS doctor_name, d.specialty,
         c.name AS clinic_name
       FROM doctor_access_requests ar
       JOIN doctors d ON ar.doctor_id = d.id
       LEFT JOIN clinics c ON d.clinic_id = c.id
       WHERE ar.patient_id = $1 AND ar.status IN ('approved', 'denied')
       ORDER BY COALESCE(ar.approved_at, ar.denied_at) DESC
       LIMIT $2`,
      [patientId, limit]
    );

    return result.rows.map((row) => ({
      id: row.id,
      doctorId: row.doctor_id,
      doctorName: row.doctor_name,
      specialty: row.specialty,
      clinicName: row.clinic_name,
      reason: row.reason,
      status: row.status,
      approvedAt: row.approved_at,
      deniedAt: row.denied_at,
      denialReason: row.denial_reason,
    }));
  }

  /**
   * List pending requests for a doctor (their outgoing requests)
   */
  static async listDoctorRequests(doctorId: string): Promise<any[]> {
    const result = await db.query(
      `SELECT 
         ar.id, ar.patient_id, ar.reason, ar.status, 
         ar.created_at, ar.expires_at,
         p.full_name AS patient_name, p.phone, p.blood_type
       FROM doctor_access_requests ar
       JOIN patients p ON ar.patient_id = p.id
       WHERE ar.doctor_id = $1
       ORDER BY ar.created_at DESC`,
      [doctorId]
    );

    return result.rows.map((row) => ({
      id: row.id,
      patientId: row.patient_id,
      patientName: row.patient_name,
      patientPhone: row.phone,
      bloodType: row.blood_type,
      reason: row.reason,
      status: row.status,
      createdAt: row.created_at,
      expiresAt: row.expires_at,
    }));
  }

  /**
   * Expire old pending requests (cleanup task)
   */
  static async expireOldRequests(): Promise<number> {
    const result = await db.query(
      `UPDATE doctor_access_requests
       SET status = 'expired', updated_at = NOW()
       WHERE status = 'pending' AND expires_at < NOW()`
    );

    return result.rowCount || 0;
  }
}
