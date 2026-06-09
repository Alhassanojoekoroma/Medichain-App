// doctor-web/lib/anonymise.ts
// USE THIS on every data source in the Government portal.
// It strips all fields that could identify an individual patient or user.

type SensitiveKeys = 'name' | 'email' | 'phone' | 'fabricIdentity' | 'fabricOrg' | 'walletAddress' | 'patientName' | 'dob' | 'address' | 'enrolledAt';

export function anonymisePatientData<T extends Record<string, unknown>>(
  data: T[]
): Omit<T, SensitiveKeys>[] {
  return data.map(({ name, email, phone, fabricIdentity, fabricOrg, walletAddress, patientName, dob, address, enrolledAt, ...rest }) => rest as Omit<T, SensitiveKeys>);
}
