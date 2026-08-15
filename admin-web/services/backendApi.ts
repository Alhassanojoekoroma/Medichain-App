/** Administrative bundles intentionally contain no patient/clinical API client. */
const unavailable = async (..._args: unknown[]): Promise<any> => {
  throw new Error('This operation is unavailable to the administrative role.');
};

export const backendApi = {
  forceSync: unavailable,
  resolveEmergencyQR: unavailable,
};
