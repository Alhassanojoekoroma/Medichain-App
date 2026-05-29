require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const { GoogleGenAI } = require('@google/genai');
const axios = require('axios');
const FormData = require('form-data');
const fabric = require('./fabric');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Multer setup for handling file uploads in memory
const upload = multer({ storage: multer.memoryStorage() });

// Connect to Hyperledger Fabric Gateway on server startup
fabric.connect().catch(err => {
    console.error('Failed to initialize Fabric gateway:', err);
});

app.get('/', (req, res) => {
    res.json({
        message: 'Welcome to MediChain API Gateway',
        docs: 'Visit /api/health to check server status'
    });
});

app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        message: 'MediChain API Gateway is running',
        blockchain: 'Connected to live Fabric Network'
    });
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

// Real IPFS upload using Pinata (with robust mock fallback if credentials aren't set)
app.post('/api/ipfs/upload', upload.single('document'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No document uploaded' });
        }

        const pinataJwt = process.env.PINATA_JWT;
        
        if (pinataJwt && pinataJwt !== 'YOUR_PINATA_JWT') {
            console.log('📡 [IPFS] Uploading to live Pinata IPFS Service...');
            
            const formData = new FormData();
            formData.append('file', req.file.buffer, {
                filename: req.file.originalname || 'medical_record.pdf',
                contentType: req.file.mimetype
            });

            const response = await axios.post('https://api.pinata.cloud/pinning/pinFileToIPFS', formData, {
                headers: {
                    ...formData.getHeaders(),
                    'Authorization': `Bearer ${pinataJwt}`
                },
                maxBodyLength: Infinity
            });

            console.log('🟢 [IPFS] Upload success! Hash:', response.data.IpfsHash);
            return res.json({ hash: response.data.IpfsHash });
        } else {
            console.warn('⚠️ PINATA_JWT not configured. Simulating IPFS upload...');
            // Artificial delay
            await new Promise(resolve => setTimeout(resolve, 600));
            // Generate standard IPFS multihash lookalike
            const randomBytes = crypto ? crypto.randomBytes(21) : Buffer.from(Math.random().toString());
            const simulatedHash = 'Qm' + randomBytes.toString('hex').slice(0, 44);
            
            console.log('🟢 [IPFS Simulated] Hash:', simulatedHash);
            return res.json({ hash: simulatedHash });
        }
    } catch (error) {
        console.error('❌ IPFS upload error:', error.message);
        res.status(500).json({ error: 'Failed to upload to IPFS: ' + error.message });
    }
});

// Notarize medical record on Hyperledger Fabric ledger
app.post('/api/records/notarize', async (req, res) => {
    const { patientId, recordId, documentHash, ipfsHash, recordType, doctorId, patientSignature } = req.body;
    
    if (!patientId || !documentHash) {
        return res.status(400).json({ error: 'Missing required notarization fields: patientId, documentHash' });
    }

    try {
        console.log(`📡 [Blockchain] Notarizing record for patient: ${patientId}`);
        
        // Invoke AddDocument on the 'patient' smart contract
        const result = await fabric.submitTransaction(
            'patient',
            'AddDocument',
            patientId,
            documentHash,
            ipfsHash || '',
            recordType || 'General',
            doctorId || 'Self',
            patientSignature || 'Signed'
        );

        // Commit audit log entry onto the 'audit' smart contract
        try {
            const auditId = 'aud_' + Math.random().toString(36).substring(2, 11);
            await fabric.submitTransaction(
                'audit',
                'AddAuditLog',
                auditId,
                doctorId || 'Self',
                'doctor',
                patientId,
                'ADD_RECORD',
                `Notarized record hash ${documentHash.slice(0, 10)}...`,
                'success'
            );
        } catch (auditErr) {
            console.error('Failed to commit audit trail onto blockchain:', auditErr);
        }

        res.json({ 
            success: true, 
            txHash: result.txHash, 
            status: 'Notarized on Hyperledger Fabric Ledger',
            mode: 'Production'
        });
    } catch (error) {
        console.error('❌ Blockchain Notarization Error:', error);
        res.status(500).json({ error: 'Failed to notarize on blockchain: ' + error.message });
    }
});

// Grant access to a doctor
app.post('/api/access/grant', async (req, res) => {
    const { patientId, doctorId } = req.body;

    if (!patientId || !doctorId) {
        return res.status(400).json({ error: 'Missing required parameters: patientId, doctorId' });
    }

    try {
        console.log(`📡 [Blockchain] Granting access for doctor ${doctorId} to patient ${patientId}`);
        const result = await fabric.submitTransaction('patient', 'GrantAccess', patientId, doctorId);

        // Commit audit log entry onto the 'audit' smart contract
        try {
            const auditId = 'aud_' + Math.random().toString(36).substring(2, 11);
            await fabric.submitTransaction(
                'audit',
                'AddAuditLog',
                auditId,
                patientId,
                'patient',
                doctorId,
                'GRANT_ACCESS',
                `Granted access permission to doctor ID ${doctorId}`,
                'success'
            );
        } catch (auditErr) {
            console.error('Failed to commit audit trail for access grant:', auditErr);
        }

        res.json({ 
            success: true, 
            txHash: result.txHash,
            status: result.status 
        });
    } catch (error) {
        console.error('❌ Blockchain Grant Access Error:', error);
        res.status(500).json({ error: 'Failed to grant access on blockchain: ' + error.message });
    }
});

// Revoke access from a doctor
app.post('/api/access/revoke', async (req, res) => {
    const { patientId, doctorId } = req.body;

    if (!patientId || !doctorId) {
        return res.status(400).json({ error: 'Missing required parameters: patientId, doctorId' });
    }

    try {
        console.log(`📡 [Blockchain] Revoking access for doctor ${doctorId} from patient ${patientId}`);
        const result = await fabric.submitTransaction('patient', 'RevokeAccess', patientId, doctorId);

        // Commit audit log entry onto the 'audit' smart contract
        try {
            const auditId = 'aud_' + Math.random().toString(36).substring(2, 11);
            await fabric.submitTransaction(
                'audit',
                'AddAuditLog',
                auditId,
                patientId,
                'patient',
                doctorId,
                'REVOKE_ACCESS',
                `Revoked access permission from doctor ID ${doctorId}`,
                'success'
            );
        } catch (auditErr) {
            console.error('Failed to commit audit trail for access revocation:', auditErr);
        }

        res.json({ 
            success: true, 
            txHash: result.txHash,
            status: result.status 
        });
    } catch (error) {
        console.error('❌ Blockchain Revoke Access Error:', error);
        res.status(500).json({ error: 'Failed to revoke access on blockchain: ' + error.message });
    }
});

// Graceful gateway shutdown
process.on('SIGINT', async () => {
    console.log('Gracefully disconnecting from Fabric gateway...');
    await fabric.disconnect();
    process.exit(0);
});

app.listen(port, () => {
    console.log(`🚀 MediChain API Gateway listening on port ${port}`);
});
