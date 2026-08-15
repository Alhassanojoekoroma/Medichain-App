import { NextFunction, Request, Response } from 'express';
import { readSecurityConfig } from '../config/environment';

export function syntheticSandboxOnly(featureName: string) {
  return (_req: Request, res: Response, next: NextFunction): void => {
    const config = readSecurityConfig();
    if (config.isSyntheticSandbox) {
      next();
      return;
    }

    res.status(503).json({
      error: 'Feature unavailable',
      code: 'PHASE_1_CONTAINMENT',
      message: `${featureName} is disabled until its Phase 2 authorization controls are verified.`,
    });
  };
}

export function disabledPendingSecurityReview(featureName: string) {
  return (_req: Request, res: Response): void => {
    res.status(503).json({
      error: 'Feature unavailable',
      code: 'SECURITY_REVIEW_REQUIRED',
      message: `${featureName} is disabled pending an approved secure workflow.`,
    });
  };
}

