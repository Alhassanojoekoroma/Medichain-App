import { NextRequest } from 'next/server';
import { proxy } from '@palmchain/web-bff';

// Ministry access is limited to de-identified aggregate intelligence. Patient,
// record, consent, QR, and other clinical APIs are deliberately unavailable.
const ALLOWED = ['intelligence'];

async function handler(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  return proxy(request, (await context.params).path, ALLOWED);
}

export { handler as GET, handler as POST };
