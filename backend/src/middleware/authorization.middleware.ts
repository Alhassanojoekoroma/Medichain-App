import { NextFunction, Response } from 'express';
import { Action, authorize, Purpose, ResourceType, Sensitivity } from '../domain/authorization';
import { AuthRequest } from './auth.middleware';

export interface PolicyOptions {
  resourceType: ResourceType;
  action: Action;
  purpose?: Purpose;
  patientIdFrom?: 'actor' | 'params' | 'body' | 'query';
  facilityIdFromActor?: boolean;
  sensitivity?: Sensitivity;
  consent?: boolean;
  careRelationship?: boolean;
}

function patientId(req: AuthRequest, source?: PolicyOptions['patientIdFrom']): string | undefined {
  if (source === 'actor') return req.actor?.id;
  if (source === 'params') return req.params.patientId;
  if (source === 'body') return req.body?.patientId;
  if (source === 'query') return typeof req.query.patientId === 'string' ? req.query.patientId : undefined;
  return undefined;
}

export function enforcePolicy(options: PolicyOptions) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.actor) return res.status(401).json({ error: { code: 'AUTHENTICATION_REQUIRED', message: 'Authentication required' } });
    const decision = authorize({
      actor: req.actor,
      resource: {
        type: options.resourceType,
        patientId: patientId(req, options.patientIdFrom),
        facilityId: options.facilityIdFromActor ? req.actor.facilityId : undefined,
        sensitivity: options.sensitivity,
      },
      action: options.action,
      purpose: options.purpose ?? (req.actor.role === 'patient' ? 'patient-service' : 'treatment'),
      hasActiveConsent: options.consent ?? req.actor.role === 'patient',
      hasCareRelationship: options.careRelationship ?? req.actor.role === 'patient',
    });
    res.locals.authorizationDecision = decision;
    if (!decision.allowed) {
      return res.status(403).json({ error: { code: decision.code, message: 'Access denied by policy' } });
    }
    next();
  };
}
