import { proxy } from '@palmchain/web-bff';
import type { NextRequest } from 'next/server';
const handle = (request: NextRequest, context: { params: Promise<{ path: string[] }> }) => context.params.then(({ path }) => proxy(request, ['operations', ...path], ['operations']));
export const GET = handle;
