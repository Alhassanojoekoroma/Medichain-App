# PalmChain V2 Phase 1 Containment Report

**Date:** 2026-07-16  
**Branch:** `codex/palmchain-v2-phase-1`  
**Scope:** Phase 1 containment and engineering foundation only  
**Application release recommendation:** **FAIL / STOP SHIP remains in force**  
**Phase 1 local engineering status:** **CONDITIONAL — implemented and verified locally; external-owner exit evidence remains open**

## 1. Objective completed

Phase 1 removed or closed the immediately unsafe active paths identified by Phase 0 and created a reproducible verification baseline. It did not implement the Phase 2 identity, centralized authorization, lawful-basis, break-glass or data-governance architecture.

## 2. Containment delivered

### Secrets and client boundaries

- Removed the tracked AI provider credential from the root environment example without reproducing its value.
- Removed 23 tracked generated Fabric identity/certificate files under `medichain-network/crypto-config/**` and ignored future crypto-config, keystore, wallet and `priv_sk` paths.
- Removed the public AI variable from the ignored local `.env` and proved the exported Android client contains no AI credential, AI configuration variable or direct Gemini endpoint reference.
- Removed direct mobile AI calls and simulated medical extraction. `AIService` now fails with an explicit manual-entry message.
- Removed direct/simulated mobile Fabric operations and placeholder encryption/key/recovery utilities.
- Replaced the Fabric gateway’s repository Admin identity with runtime-mounted TLS CA/certificate/private-key paths. It defaults to disabled, never falls back, and returns the actual committed transaction ID in real mode.

### Authentication, database and simulation

- Removed mobile offline demo login and locally generated fake session tokens.
- Removed active hard-coded demo passwords and credential hints from mobile and all five portals.
- Patient demo login and synthetic seed accounts now require an explicit synthetic sandbox and runtime password; outside it, patient login fails closed pending Phase 2 identity.
- Added strict environment/data classification, strong runtime secret validation, explicit CORS origins and sandbox-only simulation/demo gates.
- PostgreSQL absence/connection loss now fails operations closed unless explicit synthetic-sandbox simulation is enabled.
- Migration failures stop startup; synthetic fixtures are disabled unless explicitly gated.
- Backend startup no longer starts a degraded service after a real Fabric initialization failure.

### Endpoint and workflow containment

- Replaced the legacy JavaScript gateway with a local-only tombstone. All former AI, IPFS, notarization and sync operations return `410`; health returns `503 DECOMMISSIONED`.
- Removed unused legacy integration/service implementations and their AI/IPFS/Fabric/upload/database dependencies.
- Disabled emergency resolution, emergency QR issuance and manual audit-ledger sync in every environment pending approved replacements.
- Limited normal QR tokens to 60–3600 seconds with a 15-minute default; non-expiring normal QR issuance was removed.
- Restricted QR patient access, patient chart/list, record read/create, treatment create, broad consent/access-request operations and automatic-consent patient enrollment to an explicit synthetic sandbox until Phase 2 authorization is implemented.
- Disabled unsafe mobile offline mutation queueing/transmission; existing items are never transmitted by the legacy client.
- Restricted CORS, added an authentication-specific rate limit, limited JSON bodies, removed query strings from request logging and removed raw health/auth error detail from public responses.

### Delivery foundation

- Added backend environment and containment unit tests.
- Added legacy tombstone integration tests.
- Added a tracked-file secret/containment scanner.
- Added root/backend/legacy `check` or `test` scripts.
- Added ESLint and a Next.js core-web-vitals baseline to all five portals. React-compiler legacy issues remain visible as warnings instead of making the newly introduced baseline unusable.
- Added GitHub Actions gates for mobile type/security checks, backend build/tests, legacy tests, dependency thresholds, all portal lint/build checks and pull requests/branches.
- Updated the canonical README and historical readiness/deployment documents to state that they are prototype history, not release evidence.
- Added environment/data rules and a credential/history response record.

## 3. Principal files changed

| Area | Files / purpose |
|---|---|
| Environment policy | `backend/src/config/environment.ts`, `backend/.env.example`, `.env.example` |
| Runtime fail-closed behavior | `backend/src/config/db.ts`, `migrate.ts`, `index.ts`, `TokenService.ts`, `FabricGateway.ts` |
| Route containment | `backend/src/middleware/containment.middleware.ts` and affected access, request, audit, auth, consent, patient, QR, record and treatment routes |
| Legacy shutdown | `backend/api/index.js`, package manifests/lock, removed `backend/api/routes` and unsafe service implementations |
| Mobile containment | `app.config.js`, `src/services/aiService.ts`, `authService.ts`, `syncService.ts`, `index.ts`; removed placeholder `cryptoKeyService.ts` |
| Demo credential removal | five portal auth/login flows and doctor/nurse patient-onboarding notices |
| Verification | `backend/test/security-containment.test.js`, `backend/api/test/decommissioned.test.js`, `scripts/phase1-security-check.mjs`, `.github/workflows/phase1-security.yml` |
| Portal quality baseline | each portal `package.json`, lockfile and `eslint.config.mjs` |
| Governance | `README.md`, historical-document warnings and `docs/security/*` |

Pre-existing user modifications to doctor analytics/dashboard, government dashboard/regional and government `next-env.d.ts` were preserved and are not claimed as Phase 1 work.

## 4. Verification evidence

| Verification | Result |
|---|---|
| Root `npm run check` | Pass: mobile TypeScript plus security scanner |
| Backend `npm run check` with test environment | Pass: typecheck/build and 8/8 containment tests |
| Legacy `npm test` | Pass: 2/2 tombstone tests; former sensitive routes return 410 and health returns 503 |
| Doctor portal `npm run lint` | Pass: 0 errors; 34 visible pre-existing warnings |
| Doctor portal `npm run build` | Pass: Next 16.2.6 production build and 16 routes generated |
| Android Expo export | Pass: 1,696 modules bundled; temporary artifact secret/direct-AI scan passed and artifact was removed |
| Working-tree code credential scan | Pass: no tracked active code/config match; only the scanner’s `priv_sk` rule text matches |
| Root production dependency audit | 0 critical, 0 high, 11 moderate |
| Primary backend production dependency audit | 0 vulnerabilities |
| Legacy tombstone production dependency audit | 0 vulnerabilities |
| Representative portal production dependency audit | 0 critical, 0 high, 2 moderate |
| Git path history inspection | `.env.example` appears in four commits; Fabric crypto directory appears in one commit |

The remaining root/portal moderate advisories are in the Expo/portal toolchain and require a separately tested major framework upgrade for full removal. CI rejects high/critical advisories; backend and legacy CI reject moderate or above.

## 5. Security, privacy, clinical and accessibility effect

- Anonymous paid-AI, raw-IPFS, ledger-write and sync attack surfaces are no longer active.
- No mobile provider credential, direct AI call, fake authentication, fake blockchain transaction, fake encryption or fake key recovery remains in an active client service.
- Clinical and emergency paths that lack Phase 2 authorization/break-glass controls now return an explicit unavailable state rather than unsafe data/success.
- Database/Fabric dependency failure no longer becomes a silent trustworthy success outside the sandbox.
- Portal lint now exposes React and accessibility-quality debt consistently; those warnings remain for Phase 3 consolidation and UX phases.
- The changes reduce exposure but intentionally reduce prototype functionality. Availability is not preferred over confidentiality/integrity for unapproved workflows.

## 6. Deviations and limits

- Provider-side AI credential revocation, usage review and billing/log inspection could not be performed because no provider-owner access was supplied.
- Shared Git history was not rewritten because that requires explicit repository-owner approval and coordination with every remote/collaborator. Current-tree removal is complete; rotation/revocation remains primary.
- Deployed Fabric identities/networks could not be invalidated or inspected. Current-tree identities were removed and the gateway no longer loads them.
- GitHub protected-branch requirements cannot be proven from local source. The workflow exists, but a repository administrator must make it required.
- Only the doctor portal was installed, linted and built locally. CI is configured to install/lint/build all five portals from clean environments.
- The local ignored `.env` was sanitized by variable name, but clones/builds/caches remain part of the external artifact inventory.

## 7. Remaining findings and next dependencies

Phase 1 does not make the application deployable. The following remain open:

- authoritative workforce/patient identity, MFA, recovery and session revocation;
- active facility/care/task relationships and centralized deny-by-default authorization;
- contextual lawful basis/consent, break-glass and scoped repository/RLS enforcement;
- encrypted mobile/file storage, secure offline protocol and conflict resolution;
- approved clinical provenance/signature/correction workflows;
- Fabric governance/chaincode authorization/privacy or an ADR to remove Fabric;
- FHIR/Ministry contracts, local legal/DPIA and clinical safety approval;
- backup/restore, incident operations, penetration testing and WCAG 2.2 AA evidence;
- provider credential revocation, history/artifact response and protected CI enforcement.

## 8. Migration and rollback

- Old QR/emergency tokens must be considered untrusted and revoked before any replacement workflow.
- Existing “verified”, “signed”, “anchored” or “synced” records cannot be promoted as truth; provenance must be re-established.
- Broad consent and synthetic seeded records must not migrate into a real-data environment.
- Rollback may restore code only to the safe contained posture. It must never restore the legacy gateway, client AI/provider keys, tracked Fabric identities, fake auth/simulation or public emergency access.
- The removed Fabric crypto directory must be regenerated only as disposable sandbox material outside Git; no deleted identity may be trusted.

## 9. Decision and approval gate

The local Phase 1 engineering objective is substantially complete, but its exit gate is **CONDITIONAL** until credential/network owners attach revocation/invalidation evidence, a repository owner resolves the history response and makes CI required, and clean all-portal CI is observed.

The application remains **FAIL / STOP SHIP** for real PHI, pilot, production and public exposure. Do not begin Phase 2 automatically. After the external Phase 1 evidence is reviewed—or the risk owners explicitly accept those bounded open actions—the human may authorize:

> Phase 1 containment is reviewed and approved. Begin Phase 2 identity, authorization and data governance on a new `codex/palmchain-v2-phase-2` branch. Do not implement later phases.
