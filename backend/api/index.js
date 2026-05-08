require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const { GoogleGenAI } = require('@google/genai');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

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

// Placeholder endpoint for IPFS upload
app.post('/api/ipfs/upload', upload.single('document'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No document uploaded' });
        }
        
        // TODO: Implement actual IPFS pinning (e.g. via web3.storage or Pinata)
        // For now, simulate a return hash
        const simulatedHash = 'Qm' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        res.json({ hash: simulatedHash });
    } catch (error) {
        console.error('IPFS upload error:', error);
        res.status(500).json({ error: 'Failed to upload to IPFS' });
    }
});

// Placeholder for Hyperledger Fabric interaction
app.post('/api/blockchain/notarize', async (req, res) => {
    const { patientId, recordHash } = req.body;
    try {
        // TODO: Use fabric-network SDK to submit transaction to the 'medichain_patient' contract
        // contract.submitTransaction('AddDocument', patientId, recordHash);
        
        const txHash = '0x' + Math.random().toString(36).substring(2, 15);
        res.json({ txHash, status: 'Notarized on Ledger' });
    } catch (error) {
        console.error('Blockchain error:', error);
        res.status(500).json({ error: 'Failed to notarize on blockchain' });
    }
});

app.listen(port, () => {
    console.log(`MediChain API Gateway listening on port ${port}`);
});
