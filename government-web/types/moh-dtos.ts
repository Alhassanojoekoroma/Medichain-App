// MoH DTOs — district-level only. No patient-identifiable fields.

export interface DistrictSummary {
  districtId: string;
  districtName: string;
  totalCases: number;
  activeCases: number;
  recoveries: number;
  vaccineRate: number; // 0-1
  facilityCount: number;
  alertCount: number;
  trend: 'up' | 'down' | 'stable';
  // DELIBERATELY NO: patientId, patientName, patientDob, etc.
}

export interface NationalSummary {
  totalCasesNational: number;
  activeOutbreaks: number;
  vaccineCoverageNational: number;
  connectedFacilities: number;
  districts: DistrictSummary[];
}

export interface ChiefdomDensity {
  chiefdomId: string;
  chiefdomName: string;
  districtId: string;
  caseDensity: number; // 0-1, relative density
  // NO patient-identifiable fields
}
