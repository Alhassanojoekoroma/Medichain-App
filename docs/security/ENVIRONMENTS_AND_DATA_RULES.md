# PalmChain Environment Classification and Data Rules

**Effective:** Phase 1 containment, 2026-07-16  
**Enforcement:** `backend/src/config/environment.ts`, CI security checks and release review

## Environment classes

| `APP_ENVIRONMENT` | Permitted data | Network posture | Simulation/demo | Release status |
|---|---|---|---|---|
| `sandbox` | Synthetic only | Local or explicitly isolated development network | Allowed only when each individual gate is explicitly true | Development only |
| `development` | Synthetic only | Developer-controlled; no public exposure | Prohibited | Development only |
| `test` | Synthetic fixtures only | Ephemeral CI/test | Prohibited unless a test calls the pure configuration function with an explicit sandbox fixture | Verification only |
| `pilot` | Real data only after written Phase 2+ approvals | Approved restricted pilot network | Prohibited | Currently blocked |
| `production` | Real data only after all release gates | Approved production network | Prohibited | Currently blocked |

`DATA_CLASSIFICATION=real` is accepted only with `APP_ENVIRONMENT=pilot` or `production`. That validation does not approve real-data use; it only prevents a contradictory configuration. The current release decision still blocks both environments.

## Fail-closed rules

1. `JWT_SECRET` and `QR_TOKEN_SECRET` are runtime-supplied, non-placeholder values of at least 32 characters in every environment, including the sandbox.
2. CORS origins are explicitly listed outside the synthetic sandbox. Missing or unknown browser origins are rejected.
3. Database absence or connection loss fails the operation. It becomes a mock database only when `APP_ENVIRONMENT=sandbox`, `DATA_CLASSIFICATION=synthetic` and `ALLOW_SIMULATION=true` are all present.
4. `FABRIC_MODE` defaults to `disabled`. `simulated` additionally requires the full synthetic-sandbox simulation gate. `real` requires runtime-mounted TLS CA, certificate and private-key paths; no repository identity is loaded.
5. Demo authentication and demo fixtures require an explicit synthetic sandbox, `ENABLE_DEMO_AUTH=true`, `ENABLE_DEMO_DATA=true`, and a runtime `SANDBOX_PATIENT_PASSWORD`. No password is source-controlled.
6. Patient and workforce login are unavailable outside the explicit sandbox unless `IDENTITY_PROVIDER_MODE=oidc` is configured with an approved HTTPS issuer, audience and JWKS endpoint. Production recovery remains an identity-owner gate.
7. Mobile network failure never creates a local authenticated session.
8. Direct client AI and legacy AI/IPFS/notarization/sync are disabled. No environment flag re-enables them.
9. Authenticated, MFA-protected break-glass is available through centralized policy. Anonymous emergency resolution, emergency QR issuance and manual audit-ledger sync remain disabled pending their separate approvals.
10. Clinical Phase 5 record access/mutation, broad patient lists, legacy access-request flows and patient enrollment remain synthetic-sandbox-only. Phase 2 granular consent and Phase 4 QR/Health-ID/offline commands do not by themselves authorize production use.

## Data rules

### Synthetic data

- Must be clearly fictional and must not be derived from an identifiable real person.
- Must not use real phone numbers, emails, national identifiers, documents, images or free-text notes.
- Must not be sent to a live provider account unless that exact synthetic test is approved and cost-limited.
- Must never be represented as a verified patient, provider, signature, clinical result or ledger receipt.

### Real or potentially real data

- Do not enter, import, photograph, upload, cache, sync, export or anchor it in the current system.
- If data provenance is uncertain, classify it as real until a privacy owner confirms otherwise.
- Discovery of real data triggers containment: stop processing, preserve minimum incident evidence, notify the privacy/security owner and follow the approved breach/incident process.

### Logs and diagnostics

- Log method and route path, not query strings or request bodies.
- Do not log tokens, credentials, QR payloads, medical text, filenames, patient/actor identifiers or provider response bodies.
- Public errors are stable and generic. Detailed diagnostics belong in access-controlled, redacted operations tooling.

## Local sandbox setup

Use `backend/.env.example` as the variable inventory. Generate ephemeral local secrets rather than copying values from documentation or another environment. For PowerShell, a developer may create process-local random values without writing them to disk:

```powershell
$env:JWT_SECRET = [Convert]::ToBase64String([Security.Cryptography.RandomNumberGenerator]::GetBytes(48))
$env:QR_TOKEN_SECRET = [Convert]::ToBase64String([Security.Cryptography.RandomNumberGenerator]::GetBytes(48))
```

Then set the environment/data classification and only the sandbox feature gates actually required. Never reuse these values outside the current local process.

## Promotion rule

Configuration promotion is not data/release approval. Pilot or production requires closure of all Critical findings, Phase 2 authorization evidence, local legal/DPIA and clinical approval, exercised backup/restore and incident response, accessibility evidence, protected CI and an updated release decision.
