/**
 * AIService — Phase 5A
 *
 * Integrates with Google Gemini Vision API to perform real OCR and
 * structured data extraction from medical document images.
 *
 * Usage:
 *   const result = await AIService.analyzeDocument(base64Image);
 *
 * For development/testing: set GEMINI_API_KEY in a .env file or
 * the Expo config (app.config.js). In production, call via a secure
 * backend proxy so the key is never shipped in the app bundle.
 */

import Constants from 'expo-constants';

export interface MedicalDocumentExtraction {
  title: string;
  date: string;
  type: 'General' | 'Laboratory' | 'Radiology' | 'Prescription' | 'Referral' | 'Other';
  doctor: string;
  hospital: string;
  aiInsights: string;
  confidence: number; // 0-1
}

// ─── Gemini Prompt ────────────────────────────────────────────────────────────

const MEDICAL_EXTRACTION_PROMPT = `You are a medical document analysis AI assistant.
Analyze this medical document image and extract the following information in JSON format:

{
  "title": "Document/report title",
  "date": "Date in YYYY-MM-DD format",
  "type": "One of: General, Laboratory, Radiology, Prescription, Referral, Other",
  "doctor": "Doctor name with title (e.g. Dr. Smith)",
  "hospital": "Hospital or clinic name",
  "aiInsights": "A 1-2 sentence plain-English summary of the key medical findings, test results, or prescription details",
  "confidence": 0.95
}

If a field cannot be determined, use a sensible default (e.g., "Unknown Doctor" for doctor).
ONLY return valid JSON — no markdown, no extra text.`;

// ─── Service ──────────────────────────────────────────────────────────────────

export const AIService = {
  /**
   * Analyzes a medical document image using Gemini Vision.
   * @param imageUri - Local file URI from expo-image-picker
   */
  analyzeDocument: async (imageUri: string): Promise<MedicalDocumentExtraction> => {
    const apiKey = (Constants.expoConfig?.extra as any)?.geminiApiKey
      || process.env.EXPO_PUBLIC_GEMINI_API_KEY
      || process.env.GEMINI_API_KEY
      || '';

    // If no API key is configured, fall back to simulation so dev flow works
    if (!apiKey || apiKey === 'REPLACE_WITH_YOUR_KEY') {
      console.warn('[AI] No Gemini API key configured — using simulation mode.');
      return AIService._simulateExtraction();
    }

    try {
      // Convert image to base64 using fetch and FileReader to avoid expo-file-system deprecation
      const imgResponse = await fetch(imageUri);
      const blob = await imgResponse.blob();
      const base64Data = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const result = reader.result as string;
          resolve(result.includes(',') ? result.split(',')[1] : result);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });

      // Determine MIME type from extension
      const ext = imageUri.split('.').pop()?.toLowerCase() ?? 'jpg';
      const mimeType = ext === 'png' ? 'image/png' : 'image/jpeg';

      const requestBody = {
        contents: [
          {
            parts: [
              { text: MEDICAL_EXTRACTION_PROMPT },
              {
                inlineData: {
                  mimeType,
                  data: base64Data,
                },
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.1,
          maxOutputTokens: 512,
        },
      };

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Gemini API error ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      const rawText: string = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';

      // Strip any accidental markdown code fences
      const jsonText = rawText.replace(/```(?:json)?/g, '').trim();
      const parsed = JSON.parse(jsonText) as MedicalDocumentExtraction;

      // Normalise confidence to 0-1
      if (parsed.confidence > 1) parsed.confidence = parsed.confidence / 100;

      return parsed;
    } catch (err) {
      console.error('[AI] analyzeDocument error:', err);
      // Graceful fallback
      return {
        title: 'Medical Document',
        date: new Date().toISOString().split('T')[0],
        type: 'General',
        doctor: 'Unknown Doctor',
        hospital: 'Unknown Hospital',
        aiInsights: 'AI analysis was unable to process this document. Please review manually.',
        confidence: 0,
      };
    }
  },

  /**
   * Simulation mode — returns realistic fake data when no API key is set.
   * This ensures the dev flow remains unblocked.
   */
  _simulateExtraction: async (): Promise<any> => {
    await new Promise((r) => setTimeout(r, 2000)); // Simulate network latency
    const demos = [
      {
        title: 'Complete Blood Count (CBC)',
        date: new Date().toISOString().split('T')[0],
        type: 'Laboratory',
        doctor: 'Dr. Amara Conteh',
        hospital: 'Connaught Hospital, Freetown',
        aiInsights: 'Hemoglobin at 13.2 g/dL is slightly below normal range. White blood cell count within normal limits. Recommend follow-up in 6 weeks.',
        confidence: 0.94,
        fhirResource: {
          resourceType: "Observation",
          status: "final",
          code: {
            coding: [{ system: "http://loinc.org", code: "718-7", display: "Hemoglobin [Mass/volume] in Blood" }]
          },
          valueQuantity: { value: 13.2, unit: "g/dL" }
        }
      },
      {
        title: 'Chest X-Ray Report',
        date: new Date().toISOString().split('T')[0],
        type: 'Radiology',
        doctor: 'Dr. Fatima Kamara',
        hospital: 'Sierra Leone Military Hospital',
        aiInsights: 'No active pulmonary consolidation detected. Heart size within normal limits. Lungs are clear bilaterally.',
        confidence: 0.97,
        fhirResource: {
          resourceType: "DiagnosticReport",
          status: "final",
          code: {
            coding: [{ system: "http://loinc.org", code: "39060-9", display: "Chest X-ray, AP and Lateral" }]
          },
          conclusion: "Normal chest x-ray"
        }
      },
      {
        title: 'Malaria RDT Report',
        date: new Date().toISOString().split('T')[0],
        type: 'Laboratory',
        doctor: 'Dr. Mohamed Sesay',
        hospital: 'Goderich District Hospital',
        aiInsights: 'Rapid Diagnostic Test positive for P. falciparum malaria. Artemisinin-based combination therapy (ACT) recommended per national protocol.',
        confidence: 0.99,
        fhirResource: {
          resourceType: "Observation",
          status: "final",
          code: {
            coding: [{ system: "http://loinc.org", code: "43763-2", display: "Plasmodium falciparum antigen [Presence] in Blood by Rapid test" }]
          },
          valueCodeableConcept: { coding: [{ system: "http://snomed.info/sct", code: "10828004", display: "Positive" }] }
        }
      },
    ];
    return demos[Math.floor(Math.random() * demos.length)];
  },
};
