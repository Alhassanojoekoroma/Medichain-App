/**
 * backend/api/routes/sync.js
 * 
 * Sync endpoints for patient-doctor app synchronization
 * Handles record sharing, access requests, and consent updates
 */

const express = require('express');
const router = express.Router();
const OfflineQueue = require('../services/OfflineQueue');
const FabricGateway = require('../services/FabricGateway');

/**
 * POST /api/sync/record
 * Sync a patient record to specific doctors
 */
router.post('/record', async (req, res) => {
  try {
    const { recordId, recipientDoctorIds, timestamp } = req.body;

    if (!recordId || !recipientDoctorIds || recipientDoctorIds.length === 0) {
      return res.status(400).json({ 
        error: 'Missing required fields: recordId, recipientDoctorIds' 
      });
    }

    // Queue for blockchain notarization
    await OfflineQueue.enqueue('RECORD_SHARED', {
      recordId,
      recipientDoctorIds,
      sharedAt: timestamp || new Date().toISOString(),
    });

    res.json({
      status: 'queued',
      recordId,
      recipientCount: recipientDoctorIds.length,
      message: 'Record share request queued for sync'
    });
  } catch (error) {
    console.error('[Sync] Record sync error:', error);
    res.status(500).json({ error: error.message || 'Failed to sync record' });
  }
});

/**
 * POST /api/sync/access
 * Sync access request approval/denial
 */
router.post('/access', async (req, res) => {
  try {
    const { accessRequestId, approved, timestamp } = req.body;

    if (!accessRequestId === undefined || approved === undefined) {
      return res.status(400).json({ 
        error: 'Missing required fields: accessRequestId, approved' 
      });
    }

    // Queue for blockchain recording
    await OfflineQueue.enqueue('ACCESS_REQUEST_APPROVED', {
      accessRequestId,
      approved,
      respondedAt: timestamp || new Date().toISOString(),
    });

    res.json({
      status: 'queued',
      accessRequestId,
      approved,
      message: approved ? 'Access granted and queued for sync' : 'Access denied and recorded'
    });
  } catch (error) {
    console.error('[Sync] Access sync error:', error);
    res.status(500).json({ error: error.message || 'Failed to sync access' });
  }
});

/**
 * POST /api/sync/consent
 * Sync consent updates between patient and doctors
 */
router.post('/consent', async (req, res) => {
  try {
    const { consentId, consentData, timestamp } = req.body;

    if (!consentId || !consentData) {
      return res.status(400).json({ 
        error: 'Missing required fields: consentId, consentData' 
      });
    }

    // Queue for blockchain recording
    await OfflineQueue.enqueue('CONSENT', {
      consentId,
      ...consentData,
      updatedAt: timestamp || new Date().toISOString(),
    });

    res.json({
      status: 'queued',
      consentId,
      message: 'Consent update queued for sync'
    });
  } catch (error) {
    console.error('[Sync] Consent sync error:', error);
    res.status(500).json({ error: error.message || 'Failed to sync consent' });
  }
});

/**
 * POST /api/sync/audit
 * Sync audit logs for access tracking
 */
router.post('/audit', async (req, res) => {
  try {
    const { action, details, timestamp } = req.body;

    if (!action) {
      return res.status(400).json({ 
        error: 'Missing required field: action' 
      });
    }

    // Queue for blockchain audit trail
    await OfflineQueue.enqueue('AUDIT_LOG', {
      action,
      details: details || {},
      loggedAt: timestamp || new Date().toISOString(),
    });

    res.json({
      status: 'queued',
      action,
      message: 'Audit log queued for recording'
    });
  } catch (error) {
    console.error('[Sync] Audit sync error:', error);
    res.status(500).json({ error: error.message || 'Failed to sync audit log' });
  }
});

/**
 * GET /api/sync/status
 * Get current sync queue status
 */
router.get('/status', async (req, res) => {
  try {
    const stats = await OfflineQueue.getStats();
    res.json({
      status: 'ok',
      queue: stats,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('[Sync] Status check error:', error);
    res.status(500).json({ error: error.message || 'Failed to get sync status' });
  }
});

/**
 * POST /api/sync/force
 * Force immediate sync of pending items
 */
router.post('/force', async (req, res) => {
  try {
    const pending = await OfflineQueue.getPending(50);
    
    if (pending.length === 0) {
      return res.json({
        synced: 0,
        pending: 0,
        message: 'No pending items to sync'
      });
    }

    let synced = 0;
    let failed = 0;

    for (const item of pending) {
      try {
        const payload = typeof item.payload === 'string' 
          ? JSON.parse(item.payload) 
          : item.payload;

        let success = false;

        // Route based on event type
        switch (item.event_type) {
          case 'AUDIT_LOG':
            success = await FabricGateway.submitAuditLog(payload);
            break;
          case 'CONSENT':
            success = await FabricGateway.submitConsent(payload);
            break;
          case 'NOTARIZE_RECORD':
            success = await FabricGateway.notarizeRecord(payload);
            break;
          case 'REVOCATION':
            success = await FabricGateway.revokeConsent(
              payload.consentId,
              payload.patientId,
              payload.reason
            );
            break;
          case 'ACCESS_REQUEST_APPROVED':
            success = await FabricGateway.recordAccessRequestApproval(payload);
            break;
          case 'RECORD_SHARED':
            success = await FabricGateway.recordDataShare(payload);
            break;
          default:
            console.warn(`Unknown event type: ${item.event_type}`);
        }

        if (success) {
          await OfflineQueue.markSynced(item.id, 'manual_force_sync');
          synced++;
        }
      } catch (error) {
        console.error(`Error syncing ${item.id}:`, error.message);
        await OfflineQueue.recordError(item.id, error);
        failed++;
      }
    }

    res.json({
      synced,
      failed,
      pending: pending.length - synced,
      message: `Manually synced ${synced} / ${pending.length} items`
    });
  } catch (error) {
    console.error('[Sync] Force sync error:', error);
    res.status(500).json({ error: error.message || 'Force sync failed' });
  }
});

module.exports = router;
