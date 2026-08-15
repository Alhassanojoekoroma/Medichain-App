/**
 * Client AI processing is intentionally disabled during Phase 1 containment.
 *
 * Medical documents must never be sent directly from a mobile client to an AI
 * provider. A later phase may introduce a server-side, authenticated and
 * clinically governed processing job after privacy and safety approval.
 */

export interface MedicalDocumentExtraction {
  title: string;
  date: string;
  type: 'General' | 'Laboratory' | 'Radiology' | 'Prescription' | 'Referral' | 'Other';
  doctor: string;
  hospital: string;
  aiInsights: string;
  confidence: number;
}

export class AIProcessingUnavailableError extends Error {
  readonly code = 'AI_PROCESSING_DISABLED';

  constructor() {
    super('AI document processing is unavailable pending security, privacy, and clinical review. Please enter verified document details manually.');
    this.name = 'AIProcessingUnavailableError';
  }
}

export const AIService = {
  analyzeDocument: async (_imageUri: string): Promise<MedicalDocumentExtraction> => {
    throw new AIProcessingUnavailableError();
  },
};
