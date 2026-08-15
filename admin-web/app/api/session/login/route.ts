import { login } from '@palmchain/web-bff';
export const POST = (request: Parameters<typeof login>[0]) => login(request, ['admin']);
