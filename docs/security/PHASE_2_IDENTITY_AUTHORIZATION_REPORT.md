# Phase 2 — Identity, Authorization and Data Governance Report

**Date:** 2026-07-16  
**Engineering status:** CONDITIONALLY IMPLEMENTED  
**Pilot/production status:** FAIL / STOP SHIP

## Implemented

- External OIDC verification with remote JWKS, pinned issuer/audience, RS256/ES256 allow-listing and required identity/session claims.
- Local password/JWT authentication restricted to an explicit synthetic sandbox; login fails closed elsewhere without an approved identity provider.
- Server-side session expiry, logout revocation, token-version revocation, account status and facility status checks on every protected request.
- Shared deny-by-default policy using role, status, facility, ownership, purpose, consent, care relationship, sensitivity, MFA and break-glass attributes.
- Routine PHI denied to admin, government and non-clinical staff. Government is limited to de-identified public-health aggregates with suppression/export obligations.
- Granular, purpose-bound, expiring consent. Broad role consent and new `all` grants are rejected.
- MFA-protected, 15-minute break-glass with reason, justification, minimum dataset, review and patient-notification obligations.
- Session, care-relationship, break-glass, integrity-audit, data-governance and managed-object schemas.
- Privacy-minimized audit-chain hashing/pseudonymization primitives and tamper verification.
- Browser bearer tokens moved behind a shared BFF using `HttpOnly`, `SameSite=Strict`, production `Secure` cookies and origin checks.

## Verification

- Positive/negative tests cover cross-patient, cross-facility, consent, relationship, MFA, inactive/revoked session, admin PHI denial and government aggregate separation.
- Backend suite: 27 passing tests, 0 failures, including the live synthetic patient-core journey.
- Live synthetic smoke test passed login, server-derived session, consent, QR scan, Health ID, break-glass, sync and logout revocation.
- All five portal production builds passed with the shared session boundary.

## Exit-gate gaps requiring external evidence

1. Ministry/facility owners must select and configure the production identity provider, workforce/facility registry, MFA/recovery policy and claim contract.
2. PostgreSQL tenant/RLS and managed-object policies require tests against the approved real services; schemas alone are not deployment evidence.
3. Local counsel/data-protection owners must approve lawful basis, retention, DPIA, emergency disclosure and residency entries.
4. Audit pepper/KMS, monitoring, reviewer assignment and patient-notification delivery must be configured in the target environment.
5. Credential revocation/history actions from Phase 1 remain external-owner actions.

These gaps prevent a production exit even though the application now fails closed when they are absent.
