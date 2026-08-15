export interface FhirResource {
  resourceType: string;
  id?: string;
  meta?: { profile?: string[] };
  [key: string]: unknown;
}

const SUPPORTED = new Set(['Bundle', 'Patient', 'Consent', 'AllergyIntolerance', 'MedicationStatement', 'DocumentReference', 'Encounter', 'Observation', 'ServiceRequest', 'DiagnosticReport', 'MedicationRequest', 'MedicationDispense', 'ReferralRequest', 'Appointment', 'Provenance']);

export function validateFhirResource(resource: unknown): { valid: boolean; issues: string[] } {
  if (!resource || typeof resource !== 'object' || Array.isArray(resource)) return { valid: false, issues: ['FHIR resource must be an object'] };
  const candidate = resource as FhirResource;
  const issues: string[] = [];
  if (!SUPPORTED.has(candidate.resourceType)) issues.push('Unsupported resourceType');
  if (candidate.id && !/^[A-Za-z0-9\-.]{1,64}$/.test(candidate.id)) issues.push('Invalid FHIR id');
  if (candidate.resourceType === 'Patient' && !Array.isArray(candidate.identifier)) issues.push('Patient.identifier is required');
  if (candidate.resourceType === 'Consent' && typeof candidate.status !== 'string') issues.push('Consent.status is required');
  if (candidate.resourceType === 'Bundle') {
    if (!['collection', 'transaction', 'batch'].includes(String(candidate.type))) issues.push('Bundle.type is invalid');
    if (!Array.isArray(candidate.entry) || candidate.entry.length > 100) issues.push('Bundle.entry must contain at most 100 resources');
    else candidate.entry.forEach((entry, index) => {
      const resource = entry && typeof entry === 'object' ? (entry as { resource?: unknown }).resource : undefined;
      for (const issue of validateFhirResource(resource).issues) issues.push(`Bundle.entry[${index}]: ${issue}`);
    });
  }
  return { valid: issues.length === 0, issues };
}

export const capabilityStatement = {
  resourceType: 'CapabilityStatement',
  status: 'active',
  kind: 'instance',
  fhirVersion: '4.0.1',
  format: ['json'],
  rest: [{
    mode: 'server',
    security: { cors: true, description: 'Bearer authentication; centralized PalmChain authorization policy applies.' },
    resource: [...SUPPORTED].map(type => ({ type, interaction: [{ code: 'read' }, { code: 'search-type' }] })),
  }],
};
