export interface PublicError {
  error: { code: string; message: string; correlationId?: string; details?: unknown };
}

export function publicError(code: string, message: string, correlationId?: string, details?: unknown): PublicError {
  return { error: { code, message, ...(correlationId ? { correlationId } : {}), ...(details === undefined ? {} : { details }) } };
}

export function parsePage(input: { limit?: unknown; cursor?: unknown }, defaultLimit = 25): { limit: number; cursor?: string } {
  const parsed = typeof input.limit === 'string' ? Number(input.limit) : input.limit;
  const limit = Number.isInteger(parsed) ? Number(parsed) : defaultLimit;
  if (limit < 1 || limit > 100) throw new Error('PAGINATION_LIMIT_INVALID');
  if (input.cursor !== undefined && (typeof input.cursor !== 'string' || input.cursor.length > 200)) throw new Error('PAGINATION_CURSOR_INVALID');
  return { limit, ...(input.cursor ? { cursor: input.cursor as string } : {}) };
}

export function requireIdempotencyKey(value: unknown): string {
  if (typeof value !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)) {
    throw new Error('IDEMPOTENCY_KEY_REQUIRED');
  }
  return value;
}
