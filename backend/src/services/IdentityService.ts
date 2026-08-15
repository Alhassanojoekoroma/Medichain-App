import { createRemoteJWKSet, jwtVerify, JWTPayload } from 'jose';
import { readSecurityConfig, SecurityConfig } from '../config/environment';
import { ClinicalRole, DoctorJWT, TokenService } from './TokenService';

const ROLES = new Set<ClinicalRole>(['doctor', 'nurse', 'laboratory', 'pharmacy', 'staff', 'admin', 'government', 'patient']);

const jwksCache = new Map<string, ReturnType<typeof createRemoteJWKSet>>();

function remoteJwks(uri: string): ReturnType<typeof createRemoteJWKSet> {
  let resolver = jwksCache.get(uri);
  if (!resolver) {
    resolver = createRemoteJWKSet(new URL(uri), {
      cooldownDuration: 30_000,
      timeoutDuration: 5_000,
    });
    jwksCache.set(uri, resolver);
  }
  return resolver;
}

function booleanMfa(payload: JWTPayload, acceptedAcrValues: string[]): boolean {
  const amr = Array.isArray(payload.amr) ? payload.amr : [];
  return amr.includes('mfa') || amr.includes('otp') || amr.includes('hwk') ||
    (typeof payload.acr === 'string' && acceptedAcrValues.includes(payload.acr));
}

export function normalizedClaims(payload: JWTPayload, config: SecurityConfig): DoctorJWT {
  if (!config.oidcActorIdClaim || !config.oidcRoleClaim || !config.oidcStatusClaim ||
      !config.oidcFacilityIdClaim || !config.oidcTokenVersionClaim || !config.oidcIssuer) {
    throw new Error('IDENTITY_CLAIM_CONTRACT_MISSING');
  }
  const role = payload[config.oidcRoleClaim];
  const status = payload[config.oidcStatusClaim];
  const actorId = payload[config.oidcActorIdClaim];
  const facilityId = payload[config.oidcFacilityIdClaim];
  const tokenVersion = payload[config.oidcTokenVersionClaim];
  if (!payload.sub || typeof actorId !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(actorId) || typeof role !== 'string' || !ROLES.has(role as ClinicalRole)) throw new Error('IDENTITY_CLAIMS_INVALID');
  if (status !== 'active') throw new Error('IDENTITY_INACTIVE');
  if (!payload.sid || typeof payload.sid !== 'string') throw new Error('IDENTITY_SESSION_MISSING');
  if (typeof payload.auth_time !== 'number' || payload.auth_time <= 0) throw new Error('IDENTITY_AUTH_TIME_MISSING');
  if (role !== 'patient' && (typeof facilityId !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(facilityId))) throw new Error('IDENTITY_FACILITY_MISSING');
  if (!Number.isInteger(tokenVersion) || Number(tokenVersion) < 0) throw new Error('IDENTITY_TOKEN_VERSION_INVALID');
  return {
    sub: actorId,
    role: role as ClinicalRole,
    clinicId: typeof facilityId === 'string' ? facilityId : undefined,
    fullName: typeof payload.name === 'string' ? payload.name : undefined,
    sid: payload.sid,
    mfa: booleanMfa(payload, config.oidcMfaAcrValues),
    tokenVersion: Number(tokenVersion),
    authTime: payload.auth_time,
    identityIssuer: config.oidcIssuer,
    identitySubject: payload.sub,
    iat: payload.iat ?? 0,
    exp: payload.exp ?? 0,
  };
}

export class IdentityService {
  static async verifyAccessToken(token: string): Promise<DoctorJWT> {
    const config = readSecurityConfig();
    if (config.identityProviderMode === 'sandbox') return TokenService.verifyDoctorJWT(token);
    if (config.identityProviderMode !== 'oidc' || !config.oidcJwksUri || !config.oidcIssuer || !config.oidcAudience) {
      throw new Error('IDENTITY_PROVIDER_REQUIRED');
    }
    const jwks = remoteJwks(config.oidcJwksUri);
    const { payload } = await jwtVerify(token, jwks, {
      issuer: config.oidcIssuer,
      audience: config.oidcAudience,
      algorithms: ['RS256', 'ES256'],
      clockTolerance: config.oidcClockToleranceSeconds,
      maxTokenAge: config.oidcMaxTokenAgeSeconds,
      requiredClaims: ['sub', 'exp', 'iat', 'sid', 'auth_time', config.oidcActorIdClaim!, config.oidcRoleClaim!, config.oidcStatusClaim!, config.oidcTokenVersionClaim!],
    });
    return normalizedClaims(payload, config);
  }
}
