export const runtime = 'nodejs';

export function GET() {
  return Response.json({ status: 'healthy', app: 'clinical-portal' }, { headers: { 'Cache-Control': 'no-store' } });
}
