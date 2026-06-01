require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const { GoogleGenAI } = require('@google/genai');
const OfflineQueue = require('./services/OfflineQueue');
const FabricGateway = require('./services/FabricGateway');
const IPFSStorage = require('./services/IPFSStorage');
const SyncScheduler = require('./services/SyncScheduler');
const syncRoutes = require('./routes/sync');
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Register sync routes
app.use('/api/sync', syncRoutes);

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Multer setup for handling file uploads in memory
const upload = multer({ storage: multer.memoryStorage() });

app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'MediChain API Gateway is running' });
});

// Endpoint for OCR Extraction using Gemini
app.post('/api/extract', upload.single('document'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No document uploaded' });
        }

        // Convert the uploaded file to base64 for Gemini
        const base64Data = req.file.buffer.toString('base64');
        const mimeType = req.file.mimetype;

        const prompt = `
        Analyze this medical document. Extract the key medical details and map them to an HL7 FHIR R4 JSON format.
        Return ONLY valid JSON with the following structure:
        {
          "title": "Short title of the document",
          "date": "YYYY-MM-DD",
          "type": "General | Laboratory | Radiology | Prescription",
          "doctor": "Doctor Name if available",
          "hospital": "Hospital Name if available",
          "aiInsights": "A brief summary of the findings in plain English",
          "confidence": 0.95,
          "fhirResource": {
            // The HL7 FHIR R4 standard JSON object (e.g. Observation, DiagnosticReport, etc.)
          }
        }
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: [
                {
                    role: 'user',
                    parts: [
                        { inlineData: { data: base64Data, mimeType } },
                        { text: prompt }
                    ]
                }
            ],
            config: {
                temperature: 0.2,
                responseMimeType: 'application/json'
            }
        });

        if (response.text) {
            const extractedData = JSON.parse(response.text);
            return res.json(extractedData);
        } else {
            throw new Error("Failed to extract data from Gemini");
        }

    } catch (error) {
        console.error('Error during extraction:', error);
        res.status(500).json({ error: 'Failed to process document' });
    }
});

// Endpoint for IPFS upload with web3.storage
app.post('/api/ipfs/upload', upload.single('document'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No document uploaded' });
        }

        // Check if IPFS is configured
        if (!IPFSStorage.isConfigured()) {
            return res.status(503).json({ 
                error: 'IPFS storage not configured. Set WEB3_STORAGE_TOKEN env var.' 
            });
        }

        // Upload to IPFS
        const ipfsResult = await IPFSStorage.uploadFile(
            req.file.buffer,
            req.file.originalname
        );

        // Calculate integrity hash for blockchain verification
        const integrityHash = await IPFSStorage.calculateHash(req.file.buffer);

        res.json({
            cid: ipfsResult.cid,
            hash: ipfsResult.hash,
            integrityHash,
            filename: ipfsResult.filename,
            size: ipfsResult.size,
            gateway: IPFSStorage.getGatewayUrl(ipfsResult.cid),
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('IPFS upload error:', error);
        res.status(500).json({ error: error.message || 'Failed to upload to IPFS' });
    }
});

// Endpoint to notarize a record on blockchain (with IPFS reference)
app.post('/api/blockchain/notarize', async (req, res) => {
    const { patientId, recordType, ipfsCid, integrityHash, uploadedBy } = req.body;
    
    try {
        if (!patientId || !ipfsCid || !integrityHash) {
            return res.status(400).json({ 
                error: 'Missing required fields: patientId, ipfsCid, integrityHash' 
            });
        }

        // Generate record ID
        const recordId = uuidv4();

        // First, enqueue the transaction for async sync
        await OfflineQueue.enqueue('NOTARIZE_RECORD', {
            recordId,
            patientId,
            recordType: recordType || 'document',
            integrityHash,
            ipfsCid,
            uploadedBy: uploadedBy || 'system',
            timestamp: new Date().toISOString(),
        });

        // Try to submit to Fabric immediately
        let txHash = null;
        try {
            txHash = await FabricGateway.notarizeRecord({
                recordId,
                patientId,
                recordType: recordType || 'document',
                integrityHash,
                ipfsCid,
                uploadedBy: uploadedBy || 'system',
            });
        } catch (fabricError) {
            console.warn('[Blockchain] Immediate Fabric submission failed, queued for retry:', fabricError.message);
            // Transaction is already queued, so we can return success
            // Client will be able to check status via sync endpoint
        }

        res.json({
            recordId,
            ipfsCid,
            integrityHash,
            txHash: txHash || null,
            status: txHash ? 'notarized' : 'queued_for_sync',
            message: txHash 
                ? 'Record notarized on blockchain' 
                : 'Record queued for blockchain sync',
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Blockchain notarization error:', error);
        res.status(500).json({ error: error.message || 'Failed to notarize on blockchain' });
    }
});

// Endpoint to sync pending transactions to blockchain
app.post('/api/sync/blockchain', async (req, res) => {
    try {
        const pending = await OfflineQueue.getPending(50);
        
        if (pending.length === 0) {
            return res.json({
                synced: 0,
                failed: 0,
                pending: 0,
                message: 'No pending transactions'
            });
        }

        let synced = 0;
        let failed = 0;

        for (const item of pending) {
            try {
                const payload = typeof item.payload === 'string' 
                    ? JSON.parse(item.payload) 
                    : item.payload;

                let txHash = null;

                // Route based on event type
                if (item.event_type === 'AUDIT_LOG') {
                    txHash = await FabricGateway.submitAuditLog(payload);
                } else if (item.event_type === 'CONSENT') {
                    txHash = await FabricGateway.submitConsent(payload);
                } else if (item.event_type === 'NOTARIZE_RECORD') {
                    txHash = await FabricGateway.notarizeRecord(payload);
                } else if (item.event_type === 'REVOCATION') {
                    txHash = await FabricGateway.revokeConsent(
                        payload.consentId,
                        payload.patientId,
                        payload.reason
                    );
                }

                if (txHash) {
                    await OfflineQueue.markSynced(item.id, txHash);
                    synced++;
                }
            } catch (error) {
                console.error(`[Sync] Error processing queue item ${item.id}:`, error);
                await OfflineQueue.recordError(item.id, error);
                failed++;
            }
        }

        res.json({
            synced,
            failed,
            pending: pending.length - synced,
            message: `Synced ${synced} / ${pending.length} transactions`
        });
    } catch (error) {
        console.error('Blockchain sync error:', error);
        res.status(500).json({ error: error.message || 'Sync failed' });
    }
});

// Health check endpoint including service status
app.get('/api/health', async (req, res) => {
    try {
        const fabricStatus = FabricGateway.getStatus();
        const ipfsConfigured = IPFSStorage.isConfigured();
        const queueStats = await OfflineQueue.getStats();

        res.json({
            status: 'OK',
            message: 'MediChain API Gateway is running',
            timestamp: new Date().toISOString(),
            services: {
                fabric: fabricStatus,
                ipfs: {
                    configured: ipfsConfigured,
                    gateway: ipfsConfigured ? IPFSStorage.getHttpGateway() : null
                },
                queue: queueStats
            }
        });
    } catch (error) {
        res.status(503).json({
            status: 'ERROR',
            message: error.message
        });
    }
});

app.listen(port, async () => {
    console.log(`MediChain API Gateway listening on port ${port}`);
    console.log(`Health check: http://localhost:${port}/api/health`);

    // Initialize Fabric connection (non-blocking)
    try {
        await FabricGateway.connect();
        console.log('✓ Fabric gateway connected');
    } catch (error) {
        console.warn('⚠ Fabric connection failed (will retry on-demand):', error.message);
    }

    // Start sync scheduler
    SyncScheduler.start();
});
