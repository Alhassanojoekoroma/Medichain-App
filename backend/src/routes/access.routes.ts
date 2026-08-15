/**
 * backend/src/routes/access.routes.ts
 * QR scanning and resolution endpoints (Doctor / Emergency responder)
 */
import { Router, Request, Response } from 'express';
import { QRService } from '../services/QRService';
import { ConsentService } from '../services/ConsentService';
import { AuditService } from '../services/AuditService';
import { QRPayload, TokenService } from '../services/TokenService';
import { requireDoctor, AuthRequest } from '../middleware/auth.middleware';
import { db } from '../config/db';
import { disabledPendingSecurityReview, syntheticSandboxOnly } from '../middleware/containment.middleware';
import { authorize } from '../domain/authorization';
import { BreakGlassService } from '../services/BreakGlassService';

const router = Router();

/**
 * POST /api/access/scan
 * A doctor scans a NORMAL QR code.
 * Requires Doctor JWT.
 */
router.post('/scan', requireDoctor, syntheticSandboxOnly('QR-based patient access'), async (req: AuthRequest, res: Response) => {
  const payload: QRPayload = req.body.qrPayload;
  const doctor = req.doctor!;

  if (!payload || payload.type !== 'NORMAL') {
    return res.status(400).json({ error: 'Invalid QR payload. Expected NORMAL.' });
  }

  try {
    // 1. Resolve QR token to patient ID (checks signature, expiry, revocation)
    const patientId = await QRService.resolveNormalToken(payload);

    // 2. Check if the doctor has active consent
    // For a scan, we might assume they are requesting 'read' access to 'all' or specific categories
    const requestedCategories = req.body.categories || ['all'];
    const consentCheck = await ConsentService.checkConsent(
      patientId,
      doctor.id,
      doctor.clinicId || null,
      'read',
      requestedCategories
    );

    if (!consentCheck.allowed) {
      // Log denied access attempt
      await AuditService.log({
        patientId,
        actorId: doctor.id,
        actorRole: doctor.role,
        accessType: 'read',
        dataCategories: requestedCategories,
        outcome: 'denied',
        denialReason: consentCheck.reason,
      });
      return res.status(403).json({ error: 'Access denied: ' + consentCheck.reason });
    }

    const policy = authorize({
      actor: req.actor!,
      resource: { type: 'clinical-record', patientId, facilityId: req.actor!.facilityId },
      action: 'read',
      purpose: 'treatment',
      hasActiveConsent: true,
      hasCareRelationship: true,
    });
    if (!policy.allowed) return res.status(403).json({ error: 'Access denied', code: policy.code });

    // Log granted access
    await AuditService.log({
      patientId,
      actorId: doctor.id,
      actorRole: doctor.role,
      consentId: consentCheck.consentId,
      accessType: 'read',
      dataCategories: consentCheck.allowedCategories,
      outcome: 'granted',
    });

    // 3. Issue a short-lived SESSION token for the doctor to use for subsequent API calls
    const sessionToken = TokenService.signSessionToken(doctor.id, patientId);

    // Return the session token and basic patient info
    // The doctor portal will use this session token to fetch encrypted records via other endpoints
    res.json({
      success: true,
      patientId,
      sessionToken,
      allowedCategories: consentCheck.allowedCategories,
    });

  } catch (err: any) {
    // Log failure if we could at least resolve the patientId, otherwise generic log
    // (If token is revoked/invalid, resolveNormalToken throws)
    res.status(400).json({ error: err.message || 'Failed to resolve QR' });
  }
});

/**
 * POST /api/access/emergency
 * A paramedic/doctor scans an EMERGENCY QR code.
 * DOES NOT require authentication (anonymous access allowed for emergencies).
 */
router.post('/emergency', requireDoctor, async (req: AuthRequest, res: Response) => {
  const { patientId, breakGlassId } = req.body;
  if (!patientId || !breakGlassId) return res.status(400).json({ error: { code: 'BREAK_GLASS_CONTEXT_REQUIRED' } });
  try {
    const approved = await BreakGlassService.verify(breakGlassId, patientId, req.doctor!.id, req.doctor!.clinicId ?? '');
    const policy = authorize({
      actor: req.actor!,
      resource: { type: 'emergency-summary', patientId, facilityId: req.actor!.facilityId },
      action: 'read', purpose: 'emergency', breakGlassApproved: approved,
    });
    if (!policy.allowed) return res.status(403).json({ error: { code: policy.code } });
    const result = await db.query(
      `SELECT allergies, blood_type, medications, chronic_conditions
         FROM emergency_profiles WHERE patient_id = $1`,
      [patientId]
    );
    if (!result.rowCount) return res.status(404).json({ error: { code: 'EMERGENCY_SUMMARY_NOT_FOUND' } });
    await AuditService.log({
      patientId,
      actorId: req.doctor!.id,
      actorRole: req.doctor!.role,
      accessType: 'emergency_read',
      isEmergency: true,
      outcome: 'granted',
    });
    res.json({ success: true, profile: result.rows[0], obligations: policy.obligations });
  } catch {
    res.status(500).json({ error: { code: 'EMERGENCY_ACCESS_FAILED' } });
  }
});

/**
 * GET /api/access/patient/:patientId
 * Fetch patient details for a doctor (who has consent).
 * Returns personal info + all accessible records.
 * Requires doctor JWT.
 */
router.get('/patient/:patientId', requireDoctor, syntheticSandboxOnly('Patient chart access'), async (req: AuthRequest, res: Response) => {
  const { patientId } = req.params;
  const doctor = req.doctor!;

  try {
    // 0. Fetch clinic name for enriched audit logs
    let clinicName: string | undefined;
    if (doctor.clinicId) {
      try {
        const clinicRes = await db.query(`SELECT name FROM clinics WHERE id = $1`, [doctor.clinicId]);
        if ((clinicRes.rowCount ?? 0) > 0) clinicName = clinicRes.rows[0].name;
      } catch {}
    }

    // 1. Check if doctor has valid consent to view this patient
    const consent = await ConsentService.checkConsent(
      patientId,
      doctor.id,
      doctor.clinicId || null,
      'read',
      ['all'],
      doctor.role   // pass actor's role for role-based consent checks
    );

    if (!consent.allowed) {
      // Log denied access attempt
      await AuditService.log({
        patientId,
        actorId: doctor.id,
        actorRole: doctor.role,
        actorFullName: doctor.fullName,
        clinicName,
        accessType: 'patient_detail',
        outcome: 'denied',
        denialReason: consent.reason || 'No consent for patient',
      });
      return res.status(403).json({ error: 'Access denied', reason: consent.reason });
    }

    const policy = authorize({
      actor: req.actor!,
      resource: { type: 'clinical-record', patientId, facilityId: req.actor!.facilityId },
      action: 'read', purpose: 'treatment', hasActiveConsent: true, hasCareRelationship: true,
    });
    if (!policy.allowed) return res.status(403).json({ error: 'Access denied', reason: policy.code });

    // 2. Fetch patient personal data
    const patientRes = await db.query(
      `SELECT id, full_name, date_of_birth, phone, email, blood_type, wallet_address
         FROM patients WHERE id = $1`,
      [patientId]
    );

    if (patientRes.rowCount === 0) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    const patientRow = patientRes.rows[0];

    // 3. Fetch emergency profile (allergies, medications, notes)
    const emergencyRes = await db.query(
      `SELECT allergies, medications, chronic_conditions
         FROM emergency_profiles WHERE patient_id = $1`,
      [patientId]
    );

    const emergencyData = (emergencyRes.rowCount ?? 0) > 0 ? emergencyRes.rows[0] : null;

    // 4. Fetch health records (only returned to doctors)
    const recordsRes = await db.query(
      `SELECT id, patient_id, record_type, title, encrypted_cid, integrity_hash, 
              data_categories, uploaded_by, created_at
         FROM health_records WHERE patient_id = $1
         ORDER BY created_at DESC`,
      [patientId]
    );

    // 5. Fetch treatments (returned to both doctors and nurses)
    const treatmentsRes = await db.query(
      `SELECT t.id, t.patient_id, t.treatment_type, t.title, t.description, t.created_at, t.ledger_tx_hash,
              d.full_name AS doctor_name
         FROM treatments t
         JOIN doctors d ON d.id = t.doctor_id
        WHERE t.patient_id = $1
        ORDER BY t.created_at DESC`,
      [patientId]
    );

    // Log successful access with enriched actor info
    await AuditService.log({
      patientId,
      actorId: doctor.id,
      actorRole: doctor.role,
      actorFullName: doctor.fullName,
      clinicName,
      consentId: consent.consentId,
      accessType: 'patient_detail',
      outcome: 'granted',
    });

    const isDoctor = doctor.role === 'doctor';

    res.json({
      patient: {
        id: patientRow.id,
        fullName: patientRow.full_name,
        dob: patientRow.date_of_birth,
        phone: patientRow.phone,
        email: patientRow.email,
        bloodType: patientRow.blood_type,
        walletAddress: patientRow.wallet_address,
        allergies: emergencyData?.allergies || [],
        medications: emergencyData?.medications || [],
        chronicConditions: emergencyData?.chronic_conditions || [],
      },
      // Nurses only see treatments/triage data; doctors see full records
      records: isDoctor ? recordsRes.rows : [],
      treatments: treatmentsRes.rows,
      actorRole: doctor.role,    // tell the UI what the current user's role is
    });
  } catch (err: any) {
    console.error('Get patient error:', err);
    res.status(500).json({ error: 'Failed to fetch patient', details: err.message });
  }
});

/**
 * GET /api/access/patients
 * List all patients accessible to this doctor (has consent).
 * Returns minimal patient summaries.
 */
router.get('/patients', requireDoctor, syntheticSandboxOnly('Broad patient listing'), async (req: AuthRequest, res: Response) => {
  const doctor = req.doctor!;

  if (!['doctor', 'nurse'].includes(doctor.role) || !doctor.clinicId) {
    return res.status(403).json({ error: 'Clinical role and facility are required' });
  }

  try {
    // Try the efficient JOIN query first (works when real DB is available)
    let patients: any[] = [];

    try {
      if ((db as any).isSimulated && (db as any).isSimulated()) {
        throw new Error('Simulation mode');
      }

      const result = await db.query(
        `SELECT DISTINCT p.id, p.full_name, p.blood_type, p.phone, p.date_of_birth, ep.allergies
           FROM consent_policies cp
           JOIN patients p ON p.id = cp.patient_id
           LEFT JOIN emergency_profiles ep ON ep.patient_id = p.id
          WHERE (cp.grantee_id = $1 OR cp.grantee_id = $2 OR cp.grantee_id = $3)
            AND cp.is_revoked = FALSE
            AND (cp.expires_at IS NULL OR cp.expires_at > NOW())
          ORDER BY p.full_name ASC`,
        [doctor.id, doctor.clinicId || '', doctor.role || '']
      );
      patients = result.rows.map((row: any) => ({
        id: row.id,
        name: row.full_name,
        bloodType: row.blood_type,
        phone: row.phone,
        dateOfBirth: row.date_of_birth,
        allergies: row.allergies || [],
      }));
    } catch {
      // Fallback: query sandbox patients one by one using the consent check
      const allPatients = db.getSandboxPatients ? db.getSandboxPatients() : [];
      for (const p of allPatients) {
        const consent = await ConsentService.checkConsent(
          p.id, doctor.id, doctor.clinicId || null, 'read', ['all'], doctor.role
        );
        if (consent.allowed) {
          const epRes = await db.query(`SELECT allergies FROM emergency_profiles WHERE patient_id = $1`, [p.id]);
          patients.push({
            id: p.id,
            name: p.full_name,
            bloodType: p.blood_type,
            phone: p.phone,
            dateOfBirth: p.date_of_birth,
            allergies: epRes.rows[0]?.allergies || [],
          });
        }
      }
    }

    res.json({ patients });
  } catch (err: any) {
    console.error('List patients error:', err);
    res.status(500).json({ error: 'Failed to list patients', details: err.message });
  }
});

export default router;
