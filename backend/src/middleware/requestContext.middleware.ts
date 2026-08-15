import crypto from 'crypto';
import { NextFunction, Request, Response } from 'express';

const CORRELATION_ID = /^[A-Za-z0-9._-]{8,80}$/;

export function requestContext(req: Request & { correlationId?: string }, res: Response, next: NextFunction): void {
  const supplied = req.header('x-correlation-id');
  const correlationId = supplied && CORRELATION_ID.test(supplied) ? supplied : crypto.randomUUID();
  req.correlationId = correlationId;
  res.setHeader('x-correlation-id', correlationId);
  next();
}

export function notFound(req: Request & { correlationId?: string }, res: Response): void {
  res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Resource not found', correlationId: req.correlationId } });
}

export function safeError(
  err: Error,
  req: Request & { correlationId?: string },
  res: Response,
  _next: NextFunction
): void {
  void _next;
  res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'The request could not be completed', correlationId: req.correlationId } });
}
