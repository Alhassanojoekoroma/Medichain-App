export type AppEnvironment = 'sandbox' | 'development' | 'pilot' | 'production' | 'test';
export type DataClassification = 'synthetic' | 'real';
export type FabricMode = 'disabled' | 'real' | 'simulated';
export type IdentityProviderMode = 'disabled' | 'sandbox' | 'oidc';

export interface SecurityConfig {
  appEnvironment: AppEnvironment;
  dataClassification: DataClassification;
  isSyntheticSandbox: boolean;
  allowSimulation: boolean;
  allowDemoAuth: boolean;
  allowDemoData: boolean;
  sandboxPatientPassword?: string;
  jwtSecret: string;
  qrTokenSecret: string;
  corsAllowedOrigins: string[];
  fabricMode: FabricMode;
  identityProviderMode: IdentityProviderMode;
  oidcIssuer?: string;
  oidcAudience?: string;
  oidcJwksUri?: string;
  oidcActorIdClaim?: string;
  oidcRoleClaim?: string;
  oidcStatusClaim?: string;
  oidcFacilityIdClaim?: string;
  oidcTokenVersionClaim?: string;
  oidcMfaAcrValues: string[];
  oidcMaxTokenAgeSeconds: number;
  oidcClockToleranceSeconds: number;
  sessionIdleTimeoutSeconds: number;
  sessionAbsoluteTimeoutSeconds: number;
}

const APP_ENVIRONMENTS = new Set<AppEnvironment>([
  'sandbox',
  'development',
  'pilot',
  'production',
  'test',
]);
const DATA_CLASSIFICATIONS = new Set<DataClassification>(['synthetic', 'real']);
const FABRIC_MODES = new Set<FabricMode>(['disabled', 'real', 'simulated']);
const IDENTITY_PROVIDER_MODES = new Set<IdentityProviderMode>(['disabled', 'sandbox', 'oidc']);

function parseBoolean(value: string | undefined): boolean {
  return value === 'true';
}

function requireStrongSecret(name: string, value: string | undefined): string {
  if (!value || value.length < 32 || /change[-_ ]?me|dev[-_ ]?(jwt|qr|secret)/i.test(value)) {
    throw new Error(`${name} must be supplied at runtime and contain at least 32 non-placeholder characters.`);
  }
  return value;
}

function boundedInteger(name: string, value: string | undefined, fallback: number, min: number, max: number): number {
  const parsed = value === undefined || value === '' ? fallback : Number(value);
  if (!Number.isInteger(parsed) || parsed < min || parsed > max) {
    throw new Error(`${name} must be an integer between ${min} and ${max}.`);
  }
  return parsed;
}

function requiredNamespacedClaim(env: NodeJS.ProcessEnv, name: string): string {
  const value = env[name]?.trim();
  if (!value || (!value.startsWith('https://') && !value.startsWith('urn:palmchain:'))) {
    throw new Error(`${name} must be an explicit provider-controlled, namespaced claim name.`);
  }
  return value;
}

export function readSecurityConfig(env: NodeJS.ProcessEnv = process.env): SecurityConfig {
  const appEnvironment = (env.APP_ENVIRONMENT || 'development') as AppEnvironment;
  const dataClassification = (env.DATA_CLASSIFICATION || 'synthetic') as DataClassification;
  const fabricMode = (env.FABRIC_MODE || 'disabled') as FabricMode;
  const identityProviderMode = (env.IDENTITY_PROVIDER_MODE || (parseBoolean(env.ENABLE_DEMO_AUTH) ? 'sandbox' : 'disabled')) as IdentityProviderMode;

  if (!APP_ENVIRONMENTS.has(appEnvironment)) {
    throw new Error(`APP_ENVIRONMENT must be one of: ${Array.from(APP_ENVIRONMENTS).join(', ')}.`);
  }
  if (!DATA_CLASSIFICATIONS.has(dataClassification)) {
    throw new Error(`DATA_CLASSIFICATION must be one of: ${Array.from(DATA_CLASSIFICATIONS).join(', ')}.`);
  }
  if (!FABRIC_MODES.has(fabricMode)) {
    throw new Error(`FABRIC_MODE must be one of: ${Array.from(FABRIC_MODES).join(', ')}.`);
  }
  if (!IDENTITY_PROVIDER_MODES.has(identityProviderMode)) {
    throw new Error(`IDENTITY_PROVIDER_MODE must be one of: ${Array.from(IDENTITY_PROVIDER_MODES).join(', ')}.`);
  }

  const isSyntheticSandbox = appEnvironment === 'sandbox' && dataClassification === 'synthetic';
  const allowSimulation = parseBoolean(env.ALLOW_SIMULATION);
  const allowDemoAuth = parseBoolean(env.ENABLE_DEMO_AUTH);
  const allowDemoData = parseBoolean(env.ENABLE_DEMO_DATA);

  if ((allowSimulation || allowDemoAuth || allowDemoData) && !isSyntheticSandbox) {
    throw new Error('Simulation, demo authentication, and demo data are restricted to an explicit synthetic sandbox.');
  }
  if (allowDemoData && !allowDemoAuth) {
    throw new Error('ENABLE_DEMO_DATA=true requires ENABLE_DEMO_AUTH=true because the synthetic fixtures include test accounts.');
  }
  if (fabricMode === 'simulated' && (!isSyntheticSandbox || !allowSimulation)) {
    throw new Error('FABRIC_MODE=simulated requires APP_ENVIRONMENT=sandbox, DATA_CLASSIFICATION=synthetic, and ALLOW_SIMULATION=true.');
  }
  if (identityProviderMode === 'sandbox' && (!isSyntheticSandbox || !allowDemoAuth)) {
    throw new Error('IDENTITY_PROVIDER_MODE=sandbox requires explicit synthetic-sandbox demo authentication.');
  }
  if ((appEnvironment === 'pilot' || appEnvironment === 'production') && identityProviderMode !== 'oidc') {
    throw new Error('Pilot and production environments require IDENTITY_PROVIDER_MODE=oidc.');
  }
  if (identityProviderMode === 'oidc' && (allowDemoAuth || allowDemoData)) {
    throw new Error('OIDC identity cannot be combined with demo authentication or demo accounts.');
  }

  let oidcActorIdClaim: string | undefined;
  let oidcRoleClaim: string | undefined;
  let oidcStatusClaim: string | undefined;
  let oidcFacilityIdClaim: string | undefined;
  let oidcTokenVersionClaim: string | undefined;
  if (identityProviderMode === 'oidc') {
    for (const key of ['OIDC_ISSUER', 'OIDC_AUDIENCE', 'OIDC_JWKS_URI'] as const) {
      if (!env[key]) throw new Error(`${key} is required when IDENTITY_PROVIDER_MODE=oidc.`);
    }
    for (const key of ['OIDC_ISSUER', 'OIDC_JWKS_URI'] as const) {
      try {
        const url = new URL(env[key]!);
        if (url.protocol !== 'https:') throw new Error('not https');
      } catch {
        throw new Error(`${key} must be an absolute HTTPS URL.`);
      }
    }
    oidcActorIdClaim = requiredNamespacedClaim(env, 'OIDC_ACTOR_ID_CLAIM');
    oidcRoleClaim = requiredNamespacedClaim(env, 'OIDC_ROLE_CLAIM');
    oidcStatusClaim = requiredNamespacedClaim(env, 'OIDC_STATUS_CLAIM');
    oidcFacilityIdClaim = requiredNamespacedClaim(env, 'OIDC_FACILITY_ID_CLAIM');
    oidcTokenVersionClaim = requiredNamespacedClaim(env, 'OIDC_TOKEN_VERSION_CLAIM');
    const claimNames = [oidcActorIdClaim, oidcRoleClaim, oidcStatusClaim, oidcFacilityIdClaim, oidcTokenVersionClaim];
    if (new Set(claimNames).size !== claimNames.length) {
      throw new Error('OIDC PalmChain claim names must be unique.');
    }
  }
  if (dataClassification === 'real' && appEnvironment !== 'pilot' && appEnvironment !== 'production') {
    throw new Error('Real data is allowed only in a separately approved pilot or production environment.');
  }

  let sandboxPatientPassword: string | undefined;
  if (allowDemoAuth) {
    sandboxPatientPassword = env.SANDBOX_PATIENT_PASSWORD;
    if (!sandboxPatientPassword || sandboxPatientPassword.length < 12) {
      throw new Error('SANDBOX_PATIENT_PASSWORD must contain at least 12 characters when demo authentication is enabled.');
    }
  }

  const corsAllowedOrigins = (env.CORS_ALLOWED_ORIGINS || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  if (!isSyntheticSandbox && appEnvironment !== 'test' && corsAllowedOrigins.length === 0) {
    throw new Error('CORS_ALLOWED_ORIGINS must explicitly list approved origins outside the synthetic sandbox.');
  }

  return {
    appEnvironment,
    dataClassification,
    isSyntheticSandbox,
    allowSimulation,
    allowDemoAuth,
    allowDemoData,
    sandboxPatientPassword,
    jwtSecret: requireStrongSecret('JWT_SECRET', env.JWT_SECRET),
    qrTokenSecret: requireStrongSecret('QR_TOKEN_SECRET', env.QR_TOKEN_SECRET),
    corsAllowedOrigins,
    fabricMode,
    identityProviderMode,
    oidcIssuer: env.OIDC_ISSUER,
    oidcAudience: env.OIDC_AUDIENCE,
    oidcJwksUri: env.OIDC_JWKS_URI,
    oidcActorIdClaim,
    oidcRoleClaim,
    oidcStatusClaim,
    oidcFacilityIdClaim,
    oidcTokenVersionClaim,
    oidcMfaAcrValues: (env.OIDC_MFA_ACR_VALUES || '')
      .split(',')
      .map(value => value.trim())
      .filter(Boolean),
    oidcMaxTokenAgeSeconds: boundedInteger('OIDC_MAX_TOKEN_AGE_SECONDS', env.OIDC_MAX_TOKEN_AGE_SECONDS, 900, 60, 3600),
    oidcClockToleranceSeconds: boundedInteger('OIDC_CLOCK_TOLERANCE_SECONDS', env.OIDC_CLOCK_TOLERANCE_SECONDS, 30, 0, 120),
    sessionIdleTimeoutSeconds: boundedInteger('SESSION_IDLE_TIMEOUT_SECONDS', env.SESSION_IDLE_TIMEOUT_SECONDS, 15 * 60, 5 * 60, 60 * 60),
    sessionAbsoluteTimeoutSeconds: boundedInteger('SESSION_ABSOLUTE_TIMEOUT_SECONDS', env.SESSION_ABSOLUTE_TIMEOUT_SECONDS, 8 * 60 * 60, 30 * 60, 24 * 60 * 60),
  };
}
