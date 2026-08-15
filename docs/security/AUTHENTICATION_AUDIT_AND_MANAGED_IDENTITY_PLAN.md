# PalmChain Authentication Audit and Managed Identity Plan

**Date:** 2026-07-16  
**Mode:** AUDIT_FIX_VERIFY  
**Risk:** HIGH-RISK health and government data  
**Decision before repair:** **FAIL / STOP SHIP for real identities or patient data**

## Executive conclusion

PalmChain must not own production passwords, password reset, email or phone verification, MFA enrollment, recovery, credential breach detection, or refresh-token rotation. Those controls belong to a selected, contractually approved managed OpenID Connect (OIDC) provider. PalmChain remains responsible for server-side authorization, local actor/facility mapping, consent, minimum-necessary access, session containment, audit evidence, and clinical step-up requirements.

The backend already fails closed when demo authentication is disabled and contains an OIDC/JWKS token verifier. This is a useful foundation, but it is not yet an end-to-end managed authentication implementation because the web and mobile clients still present the sandbox password flow and no provider SDK/callback flow has been selected.

## Findings recorded before repair

### AUTH-001 — Managed login is not implemented end to end

- **Severity:** High / Stop Ship
- **Confidence:** High
- **Status:** Open; vendor decision required
- **Affected:** Web portal login routes, mobile login, deployment identity configuration
- **Evidence:** Clients submit credentials to PalmChain sandbox endpoints. The backend can validate OIDC access tokens but clients cannot yet acquire them through a provider SDK using Authorization Code + PKCE.
- **Scenario:** A deployment team enables a pilot expecting password reset, recovery, MFA, token rotation, and provider logout, but those user journeys do not exist.
- **Impact:** Account lifecycle and recovery are incomplete; real-user deployment is not supportable.
- **Required fix:** Select a managed OIDC provider and its maintained web/native SDKs. Configure exact callbacks, logout URLs, API audience, PKCE, MFA policy, recovery, log export, and incident operations.
- **Verification:** Provider conformance and adversarial login/recovery/session tests plus independent review.

### AUTH-002 — Mobile session restoration does not check authoritative session state

- **Severity:** Medium
- **Confidence:** High
- **Status:** Repair planned in this change
- **Affected:** `src/services/authService.ts`
- **Evidence:** Restoration decodes the locally stored JWT expiry but does not call `/api/platform/sessions/current`.
- **Scenario:** A locally stored token belongs to a revoked session, disabled actor, disabled facility, or incremented token version. The UI restores an authenticated state until a protected API call fails.
- **Impact:** Stale authenticated UI and confusing/offline exposure risk; backend data access remains fail-closed.
- **Required fix:** Validate restored sessions with the backend, clear on authoritative 401/403, and never create an offline authenticated session.
- **Verification:** Revoke session, restart app, confirm restoration fails and secure storage is cleared.

### AUTH-003 — Sandbox password login asserts MFA without an MFA ceremony

- **Severity:** Medium
- **Confidence:** High
- **Status:** Repair planned in this change
- **Affected:** `backend/src/routes/auth.routes.ts`
- **Evidence:** Password-only synthetic login issues tokens with `mfa: true`.
- **Scenario:** Sandbox tests appear to prove an MFA requirement even though no second factor occurred.
- **Impact:** False security evidence and possible misuse of MFA-gated synthetic workflows.
- **Required fix:** Issue `mfa: false`; test MFA-gated policies separately with explicit test fixtures.
- **Verification:** Sandbox login token has `mfa=false`; MFA-required authorization remains denied.

### AUTH-004 — Pilot/production can start without a configured identity provider

- **Severity:** Medium
- **Confidence:** High
- **Status:** Repair planned in this change
- **Affected:** `backend/src/config/environment.ts`
- **Evidence:** `IDENTITY_PROVIDER_MODE=disabled` is accepted outside the sandbox; requests later fail with `IDENTITY_PROVIDER_REQUIRED`.
- **Scenario:** Operators deploy an apparently healthy service that cannot authenticate real users.
- **Impact:** Misleading readiness and avoidable outage.
- **Required fix:** Require OIDC at configuration load for pilot and production.
- **Verification:** Pilot/production configuration without OIDC throws before server startup.

### AUTH-005 — Security-sensitive OIDC role mapping uses generic fixed claim names

- **Severity:** High / Stop Ship until provider mapping is verified
- **Confidence:** Medium
- **Status:** Partial repair planned; provider-side control remains open
- **Affected:** `backend/src/services/IdentityService.ts`
- **Evidence:** The API trusts `role`, `status`, `facility_id`, and `palmchain_actor_id` claims without a deployment-specific namespaced claim contract.
- **Scenario:** A provider is configured to copy user-editable profile metadata into a trusted role claim.
- **Impact:** Privilege escalation across clinical, government, or administrative roles.
- **Required fix:** Use configurable PalmChain-namespaced claims populated only by a privileged provider hook/action; map to an existing active local actor and facility; never derive authorization from email or client-editable metadata.
- **Verification:** Tokens with missing, generic, unknown, or user-editable role claims are rejected; only the approved namespaced claims pass.

### AUTH-006 — Remote JWKS resolver is recreated for every request

- **Severity:** Low
- **Confidence:** High
- **Status:** Repair planned in this change
- **Affected:** `backend/src/services/IdentityService.ts`
- **Impact:** Avoidable latency and greater sensitivity to identity-provider/JWKS availability.
- **Required fix:** Cache the `jose` remote JWKS resolver by configured URI while retaining key rotation behavior.

### AUTH-007 — Web bearer token is stored directly in the BFF cookie

- **Severity:** Medium
- **Confidence:** High
- **Status:** Open for provider integration
- **Affected:** `packages/palmchain-web-bff/index.ts`
- **Evidence:** `palmchain_session` contains the API access token. It is HttpOnly, SameSite=Strict and Secure in production, which reduces exposure, but it is still a bearer credential rather than an opaque server-side web session.
- **Impact:** Token theft has direct API value until expiry/revocation.
- **Required fix:** Use the selected provider's maintained server/BFF SDK and an opaque, rotated web session; keep provider/API refresh tokens server-side only.

### AUTH-008 — Logout is local only

- **Severity:** Medium
- **Confidence:** High
- **Status:** Open for provider integration
- **Affected:** Web and mobile logout
- **Evidence:** PalmChain revokes its local session ID, but no managed-provider session or refresh-token family exists yet to revoke.
- **Impact:** After provider integration, a user may be silently reauthenticated unless provider logout/revocation is completed.
- **Required fix:** Use provider SDK logout and revocation, then revoke PalmChain local session state and clear local artifacts.

### AUTH-009 — Recovery, verification, MFA enrollment and identity operations are not verified

- **Severity:** High / Stop Ship
- **Confidence:** High
- **Status:** Open; vendor and operating process required
- **Affected:** Managed identity tenant and support operations
- **Required controls:** Verified contact ownership, phishing-resistant MFA for privileged users where available, recovery stronger than or equivalent to normal authentication, factor-change notification/delay, help-desk verification, session revocation, compromised credential response, audit export, and tested break-glass support procedures.

## Target architecture

1. Web and mobile clients redirect to the managed provider using its maintained SDK.
2. Native mobile uses the system browser and Authorization Code + PKCE; it contains no client secret.
3. Web uses the provider's server/BFF integration. Refresh tokens remain server-side; the browser receives only an opaque secure session cookie.
4. The API validates access-token signature, issuer, audience, expiry, issued-at time, algorithm and required PalmChain namespaced claims through HTTPS JWKS.
5. The external subject maps to a pre-provisioned local PalmChain actor and active facility. A signed token alone does not create a clinical account or grant a role.
6. Authorization is evaluated by PalmChain for every resource and action. Managed authentication never replaces consent, purpose, relationship, facility, ownership, MFA/step-up, or minimum-necessary rules.
7. Local session state provides immediate PalmChain revocation and token-version containment. Provider logout/revocation handles the upstream identity session.

## Provider selection gate

The provider must support OIDC discovery and JWKS, Authorization Code + PKCE, separate native and confidential web clients, exact redirect URI allow-listing, short-lived access tokens, refresh-token rotation/reuse detection, MFA and step-up claims (`amr`/`acr`), recovery controls, administrative separation of duties, tenant audit logs/export, user and session revocation APIs, breached-password defenses, data residency/processing terms, uptime/support commitments, and independent security/compliance evidence appropriate to PalmChain's jurisdiction and data classification.

Do not select a provider solely from UI convenience or a pricing page. Legal, Ministry, security, privacy, operations and procurement owners must approve the tenant design and contract.

## Standards basis

- OAuth 2.0 Security Best Current Practice (RFC 9700): do not use the resource-owner password credential grant.
- OAuth 2.0 for Native Apps (RFC 8252): use an external user agent and Authorization Code + PKCE; native apps cannot keep a client secret.
- OpenID Connect Core: exact pre-registered redirects, state/nonce protections, issuer/audience validation.
- OWASP authentication, session and MFA guidance: reauthenticate for risk events, rotate/revoke sessions, and make recovery/factor changes at least as strong as normal authentication.

## Release decision

The planned code repairs improve containment and evidence but do not make production authentication complete. Real-user release remains **FAIL** until AUTH-001, AUTH-005, AUTH-007, AUTH-008 and AUTH-009 are closed with a selected provider, tested configuration, operational ownership and independent review.

## Repair and verification record

Implemented on 2026-07-16:

- AUTH-002: mobile restoration now calls the authoritative current-session endpoint; revoked/invalid/mismatched identities are cleared, and a network outage cannot create an offline authenticated session.
- AUTH-003: password-only sandbox tokens now assert `mfa=false`; explicit test-only assurance fixtures exercise MFA-gated government/admin paths, and break-glass is denied to the password-only session.
- AUTH-004: pilot and production configuration now requires OIDC before server startup.
- AUTH-005: OIDC claim names must be explicitly namespaced and unique; issuer/subject must be pre-bound to the same local actor and role; workforce facility claims must match the local actor facility. Provider-side claim governance remains unverified.
- AUTH-006: the remote JWKS resolver is cached while retaining `jose` key-rotation behavior.
- AUTH-007 partial: production cookies use the `__Host-` prefix, authentication responses are non-cacheable, invalid sessions clear the cookie, request shape/content type are bounded, and production pages hide password fields. An opaque provider-managed BFF session remains open.
- AUTH-008 partial: mobile logout now attempts PalmChain server revocation before clearing secure storage. Provider logout and refresh-token-family revocation remain open.
- Role-specific portal headers now render the authenticated context rather than static doctor session-storage data.
- Misleading Fabric-CA and encryption claims were removed from login surfaces.

Verification evidence:

- Backend TypeScript build: PASS.
- Backend automated suite: **46/46 PASS**.
- Mobile TypeScript: PASS.
- Root security and UX checks: PASS across 957 tracked paths and all five portal contracts.
- Doctor, nurse, staff, government and admin TypeScript: PASS.
- Doctor and admin optimized production builds: PASS; shared BFF is consumed by all portals.
- All five portal ESLint checks with errors-only output: PASS.
- Production doctor login smoke: HTTP 200, managed-identity notice present, password field absent.

Post-repair decision remains **FAIL for real identities**, because the managed provider tenant, maintained SDK login/callback/logout flows, recovery/MFA operations, opaque web session and independent configuration review do not yet exist.
