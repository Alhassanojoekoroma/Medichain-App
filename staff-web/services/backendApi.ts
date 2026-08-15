/** Non-clinical staff bundles intentionally contain no patient/clinical API client. */
const unavailable = async (..._args: unknown[]): Promise<any> => {
  throw new Error('This operation requires an authorized clinical workflow.');
};

export const backendApi = {
  forceSync: unavailable,
  resolveEmergencyQR: unavailable,
};
