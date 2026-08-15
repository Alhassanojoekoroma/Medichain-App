const test = require('node:test');
const assert = require('node:assert/strict');

const { readSecurityConfig } = require('../dist/config/environment');
const {
  disabledPendingSecurityReview,
  syntheticSandboxOnly,
} = require('../dist/middleware/containment.middleware');

const strongSecrets = {
  JWT_SECRET: 'j'.repeat(48),
  QR_TOKEN_SECRET: 'q'.repeat(48),
};

const validOidc = {
  IDENTITY_PROVIDER_MODE: 'oidc',
  OIDC_ISSUER: 'https://identity.example/',
  OIDC_AUDIENCE: 'https://api.palmchain.health',
  OIDC_JWKS_URI: 'https://identity.example/.well-known/jwks.json',
  OIDC_ACTOR_ID_CLAIM: 'https://palmchain.health/actor_id',
  OIDC_ROLE_CLAIM: 'https://palmchain.health/role',
  OIDC_STATUS_CLAIM: 'https://palmchain.health/status',
  OIDC_FACILITY_ID_CLAIM: 'https://palmchain.health/facility_id',
  OIDC_TOKEN_VERSION_CLAIM: 'https://palmchain.health/token_version',
};

test('rejects simulation outside an explicit synthetic sandbox', () => {
  assert.throws(
    () => readSecurityConfig({
      ...strongSecrets,
      APP_ENVIRONMENT: 'production',
      DATA_CLASSIFICATION: 'real',
      CORS_ALLOWED_ORIGINS: 'https://app.example',
      ALLOW_SIMULATION: 'true',
    }),
    /restricted to an explicit synthetic sandbox/
  );
});

test('rejects simulated Fabric unless the sandbox simulation gate is explicit', () => {
  assert.throws(
    () => readSecurityConfig({
      ...strongSecrets,
      APP_ENVIRONMENT: 'sandbox',
      DATA_CLASSIFICATION: 'synthetic',
      FABRIC_MODE: 'simulated',
    }),
    /FABRIC_MODE=simulated requires/
  );
});

test('rejects placeholder or missing token secrets', () => {
  assert.throws(
    () => readSecurityConfig({
      APP_ENVIRONMENT: 'test',
      DATA_CLASSIFICATION: 'synthetic',
      JWT_SECRET: 'dev-jwt-secret-change-in-production',
      QR_TOKEN_SECRET: 'q'.repeat(48),
    }),
    /JWT_SECRET must be supplied/
  );
});

test('requires explicit CORS origins outside the sandbox', () => {
  assert.throws(
    () => readSecurityConfig({
      ...strongSecrets,
      APP_ENVIRONMENT: 'development',
      DATA_CLASSIFICATION: 'synthetic',
    }),
    /CORS_ALLOWED_ORIGINS/
  );
});

test('requires managed OIDC identity before pilot or production startup', () => {
  assert.throws(
    () => readSecurityConfig({
      ...strongSecrets,
      APP_ENVIRONMENT: 'pilot',
      DATA_CLASSIFICATION: 'real',
      CORS_ALLOWED_ORIGINS: 'https://app.example',
    }),
    /require IDENTITY_PROVIDER_MODE=oidc/
  );

  const config = readSecurityConfig({
    ...strongSecrets,
    ...validOidc,
    APP_ENVIRONMENT: 'pilot',
    DATA_CLASSIFICATION: 'real',
    CORS_ALLOWED_ORIGINS: 'https://app.example',
  });
  assert.equal(config.identityProviderMode, 'oidc');
});

test('rejects generic or duplicate authorization claim names', () => {
  assert.throws(
    () => readSecurityConfig({
      ...strongSecrets,
      ...validOidc,
      APP_ENVIRONMENT: 'pilot',
      DATA_CLASSIFICATION: 'real',
      CORS_ALLOWED_ORIGINS: 'https://app.example',
      OIDC_ROLE_CLAIM: 'role',
    }),
    /namespaced claim/
  );
  assert.throws(
    () => readSecurityConfig({
      ...strongSecrets,
      ...validOidc,
      APP_ENVIRONMENT: 'pilot',
      DATA_CLASSIFICATION: 'real',
      CORS_ALLOWED_ORIGINS: 'https://app.example',
      OIDC_STATUS_CLAIM: 'https://palmchain.health/role',
    }),
    /claim names must be unique/
  );
});

test('allows demo behavior only in a fully explicit synthetic sandbox', () => {
  const config = readSecurityConfig({
    ...strongSecrets,
    APP_ENVIRONMENT: 'sandbox',
    DATA_CLASSIFICATION: 'synthetic',
    ALLOW_SIMULATION: 'true',
    ENABLE_DEMO_AUTH: 'true',
    ENABLE_DEMO_DATA: 'true',
    SANDBOX_PATIENT_PASSWORD: 'synthetic-only-password',
    FABRIC_MODE: 'simulated',
  });

  assert.equal(config.isSyntheticSandbox, true);
  assert.equal(config.allowSimulation, true);
  assert.equal(config.allowDemoAuth, true);
  assert.equal(config.allowDemoData, true);
});

function fakeResponse() {
  return {
    statusCode: 200,
    body: undefined,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(body) {
      this.body = body;
      return this;
    },
  };
}

test('high-risk routes fail closed outside the synthetic sandbox', () => {
  const original = { ...process.env };
  Object.assign(process.env, strongSecrets, {
    APP_ENVIRONMENT: 'development',
    DATA_CLASSIFICATION: 'synthetic',
    CORS_ALLOWED_ORIGINS: 'https://app.example',
    FABRIC_MODE: 'disabled',
  });
  delete process.env.ALLOW_SIMULATION;
  delete process.env.ENABLE_DEMO_AUTH;
  delete process.env.ENABLE_DEMO_DATA;
  delete process.env.IDENTITY_PROVIDER_MODE;

  try {
    const res = fakeResponse();
    let nextCalled = false;
    syntheticSandboxOnly('Clinical record access')({}, res, () => { nextCalled = true; });
    assert.equal(res.statusCode, 503);
    assert.equal(res.body.code, 'PHASE_1_CONTAINMENT');
    assert.equal(nextCalled, false);
  } finally {
    process.env = original;
  }
});

test('high-risk route gate can open only in an explicit synthetic sandbox', () => {
  const original = { ...process.env };
  Object.assign(process.env, strongSecrets, {
    APP_ENVIRONMENT: 'sandbox',
    DATA_CLASSIFICATION: 'synthetic',
    FABRIC_MODE: 'disabled',
    IDENTITY_PROVIDER_MODE: 'disabled',
  });

  try {
    const res = fakeResponse();
    let nextCalled = false;
    syntheticSandboxOnly('Clinical record access')({}, res, () => { nextCalled = true; });
    assert.equal(nextCalled, true);
    assert.equal(res.statusCode, 200);
  } finally {
    process.env = original;
  }
});

test('emergency containment gate is closed in every environment', () => {
  const res = fakeResponse();
  disabledPendingSecurityReview('Emergency access')({}, res);
  assert.equal(res.statusCode, 503);
  assert.equal(res.body.code, 'SECURITY_REVIEW_REQUIRED');
});
