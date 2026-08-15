import { NextRequest } from 'next/server';
import { proxy } from '@palmchain/web-bff';
const ALLOWED = ['access', 'access-requests', 'consent', 'audit', 'records', 'treatments', 'patients', 'qr', 'platform/fhir'];
async function handler(request: NextRequest, context: { params: Promise<{ path: string[] }> }) { return proxy(request, (await context.params).path, ALLOWED); }
export { handler as GET, handler as POST, handler as PUT, handler as PATCH, handler as DELETE };
