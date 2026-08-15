# PalmChain V2 Phase 0 Current-State Audit

**Audit date:** 2026-07-16  
**Decision scope:** current pilot/production readiness; local development with synthetic data is considered separately  
**Repository:** `C:\Users\dejen\OneDrive\Documents\Medichain App`  
**Git baseline:** branch `main`, commit `871eb5f3968f53921b07c6acade1531e1acc5bbe`  
**Audit mode:** documentation-only freeze; no application code, configuration, dependency, schema, chaincode, infrastructure, generated-file, or external-system changes

## 1. Executive result

PalmChain is a broad healthcare application prototype with substantial UI coverage and working TypeScript backend structure, but it is **not safe for pilot or production use with real patient data**. The current release decision is **FAIL / STOP SHIP**.

The dominant problem is not visual completeness. It is the absence of a reliable trust boundary. Sensitive actions are accepted from unauthenticated callers or from self-contained client claims; object, facility, care-relationship, consent-purpose, and emergency authorization are not consistently enforced. Several successful responses represent simulated database, cryptographic, AI, IPFS, or Fabric outcomes as though they were real. Tracked blockchain private keys, TLS-disabled Fabric services, client-side AI credentials, public emergency data, and unauthenticated AI/file/sync routes are independently sufficient to stop a release.

No real PHI should be entered. Network exposure should remain disabled except isolated local development with synthetic data. All existing credentials and Fabric identities that may have been used outside a disposable environment must be treated as compromised and rotated in Phase 1.

## 2. Scope and method

The audit covered all 837 visible repository files, the supplied audit prompt and standard, the PalmChain V2 blueprint and execution prompt, Git metadata, package manifests, route definitions, data schemas, auth/authorization middleware, mobile services, five web portals, the TypeScript API, legacy JavaScript API, PostgreSQL access, four Go chaincodes, Fabric network material, offline sync, AI and IPFS flows, UX state handling, tests, CI, deployment documentation, and tracked secret-like paths.

Evidence states are constrained to:

- **Verified:** directly demonstrated by inspection or a non-mutating command.
- **Implemented-unverified:** code exists, but behavior was not proven in a representative deployed environment.
- **Simulated/prototype:** mock, fallback, placeholder, or fabricated behavior.
- **Absent/unknown:** no adequate implementation/evidence was found or the area was uninspectable.

Commands were read-only except creation of this audit pack. Secret values were never printed. The backend TypeScript check passed. Root TypeScript failed on generated nurse portal route declarations. Doctor portal lint could not start because the ESLint executable was unavailable. No test files or CI configuration were found. Dynamic penetration tests, real cloud/deployment inspection, database row-level checks against a running instance, device accessibility testing, Fabric transaction validation, legal review, and Ministry/facility integration testing remain unverified.

## 3. Worktree state and preservation

The following changes pre-dated the audit and were preserved:

- Modified: `doctor-web/app/analytics/page.tsx`, `doctor-web/app/dashboard/page.tsx`, `government-web/app/dashboard/page.tsx`, `government-web/app/regional/page.tsx`, `government-web/next-env.d.ts`.
- Untracked: `MediChain_SL_Patient_App_PRD.txt` and the three PalmChain blueprint/prompt artifacts.

Phase 0 adds only `docs/audit/*.md`.

## 4. Component and dependency inventory

| Component | Technology / manifest evidence | Purpose | State |
|---|---|---|---|
| Patient mobile app | Expo 54, React Native 0.81.5; root `package.json` (30 runtime dependencies) | Patient login, records, QR, consent, access, AI upload, offline behavior | Simulated/prototype |
| Primary API | Express/TypeScript; `backend/package.json` (12 runtime dependencies) | Auth, patients, records, treatments, access, consent, QR, audit | Implemented-unverified |
| Legacy API gateway | Express/JavaScript; `backend/api/package.json` (10 runtime dependencies) | Gemini extraction, IPFS, Fabric notarization, offline sync | Implemented-unverified; unsafe |
| Doctor portal | Next 16.2.6; `doctor-web/package.json` (53 runtime dependencies) | Clinical UI | Simulated/prototype |
| Nurse portal | Next 16.2.6; `nurse-web/package.json` | Nursing UI | Simulated/prototype |
| Staff/pharmacy portal | Next 16.2.6; `staff-web/package.json` | Dispensing/inventory UI | Simulated/prototype |
| Facility admin portal | Next 16.2.6; `admin-web/package.json` | Users, access, audit, health UI | Simulated/prototype |
| Government portal | Next 16.2.6; `government-web/package.json` | Regional/national analytics UI | Simulated/prototype |
| PostgreSQL | `backend/db/schema.sql`; duplicated model schema | Operational identities, PHI, consent, tokens, logs, queues, records | Implemented-unverified |
| Fabric integration | `backend/src/services/FabricGateway.ts`; legacy JS gateway | Anchoring/audit | Simulated/prototype |
| Go chaincode | patient, doctor, consent, audit contracts | Shared-ledger state and queries | Implemented-unverified; unauthorized |
| Fabric network | single Org1, one peer/orderer, generated crypto material | Local blockchain network | Simulated/prototype; unsafe |
| Local mobile store | SQLite plus SecureStore | PHI cache and offline queue | Implemented-unverified; unencrypted PHI store |
| AI processor | direct Gemini call in mobile and legacy server route | Medical-document extraction | Implemented-unverified; unsafe |
| File storage | Web3/IPFS legacy service | Medical document storage | Implemented-unverified; unsafe |
| FHIR/interoperability | types/claims and blueprint direction only | National and facility exchange | Absent/unknown |
| Observability/operations | console logging, health routes, offline queue | Operations and recovery | Simulated/prototype |
| Automated tests/CI | no test files or CI configuration found | Verification and release gate | Absent/unknown |

Non-mutating `npm audit --omit=dev` metadata reported: root 18 vulnerabilities (1 critical, 2 high, 14 moderate, 1 low); TypeScript backend 1 moderate; legacy API 5 (2 high, 3 moderate); representative doctor portal 2 moderate. Advisory applicability and upgrade paths require Phase 1 triage.

## 5. Roles, data, stores, and external processors

### Roles observed or required

Patient, doctor, nurse, staff/pharmacist, facility administrator, application/system administrator, Ministry/government analyst, privacy/audit user, emergency responder, guardian, and integration client. The current API collapses several workforce roles into one `requireDoctor` boundary (`backend/src/middleware/auth.middleware.ts:14-33`), while portals derive permissions in the client and default a missing role to doctor (`doctor-web/hooks/usePermission.ts:59-62`).

### Sensitive data classes

Identity/contact data; demographics; patient/facility/clinician identifiers; diagnoses, allergies, medications, treatments, lab, imaging, notes and referrals; emergency contacts and notes; consent and access-request data; audit activity; document images/files and IPFS CIDs; device/session/token data; public keys/signatures; AI prompts/responses; operational logs; regional/national analytics.

### Stores and processors

- PostgreSQL: authoritative application data by design, without observed RLS or tenant policy (`backend/db/schema.sql:5-166`).
- Mobile SQLite/SecureStore: PHI, files, AI insights, FHIR-shaped data, sessions, queue (`src/services/database.ts:15-119`; `src/services/syncService.ts:55-123`).
- Fabric world state: patient, doctor, consent, record, actor and subject metadata (`backend/chaincode/**`).
- Public/distributed IPFS gateway: raw uploaded medical documents (`backend/api/services/IPFSStorage.js:31-60,92-104`).
- Google Gemini: medical images and prompts from client/server (`src/services/aiService.ts:52-126`; `backend/api/index.js:34-89`).
- Browser sessionStorage: JWT and user object (`doctor-web/services/auth.ts:62-91,118-132`; duplicated portals).

## 6. Trust boundaries and degradation behavior

Principal trust boundaries are: untrusted mobile/browser to APIs; primary API to PostgreSQL; legacy API to AI/IPFS/Fabric; mobile offline store to sync API; API/admin Fabric identity to chaincode; organization peers to shared ledger; public QR holder to emergency profile; portal UI to sessionStorage; future FHIR/Ministry systems to integration layer.

Degraded dependencies currently fail open or produce synthetic success:

- PostgreSQL missing/lost switches to in-memory simulation (`backend/src/config/db.ts:530-579`).
- Fabric connection failure switches to simulation and fabricated transaction hashes (`backend/src/services/FabricGateway.ts:30-104,123-160`).
- Mobile authentication network failure accepts demo credentials and creates a fake session (`src/services/authService.ts:64-155`).
- AI without a key generates simulated clinical extraction (`src/services/aiService.ts:58-62,146-201`).
- Mobile blockchain/crypto services return mock success, placeholder hashes/keys, and base64 “encryption” (`src/services/index.ts:15-160`; `src/services/cryptoKeyService.ts:141-162`).
- Offline failures are swallowed and queued without a defined conflict or reauthorization protocol (`src/services/syncService.ts:55-123`; `backend/src/services/OfflineQueue.ts:22-31`).

## 7. Capability evidence register

| Capability | State | Evidence and conclusion |
|---|---|---|
| Backend compilation | Verified | `npm run typecheck` in `backend` passed on 2026-07-16. |
| Doctor/patient JWT login | Implemented-unverified | Routes exist; patient password is hard-coded and no MFA/revocation proof (`backend/src/routes/auth.routes.ts:17-147`). |
| Per-object/facility authorization | Absent/unknown | Record creation accepts any UUID; audit listing is not clinic-scoped (`records.routes.ts:15-94`; `audit.routes.ts:13-30`). |
| Patient consent CRUD | Implemented-unverified | Direct/clinic/role grants exist; enforcement omits critical attributes (`consent.routes.ts:18-98`; `ConsentService.ts:154-213`). |
| Emergency access governance | Simulated/prototype | Anonymous permanent token returns extensive emergency data; no break-glass identity/reason/review (`QRService.ts:64-86,139-173`). |
| Tamper-evident audit | Simulated/prototype | Queuing and chaincode exist; sync/add/query lack authorization and Fabric may simulate (`audit.routes.ts:78-89`; `medichain_audit.go:26-197`). |
| Fabric transaction truth | Simulated/prototype | Real and simulated paths can return generated hashes; placeholders are anchored (`FabricGateway.ts:123-160`; `records.routes.ts:42-88`). |
| Patient-controlled cryptographic signature | Simulated/prototype | Non-empty check/HMAC placeholder; placeholder signature sent (`cryptoKeyService.ts:141-162`; `records.routes.ts:42-65`). |
| Secure medical file storage | Absent/unknown | Raw buffer is uploaded to IPFS without encryption/malware controls (`IPFSStorage.js:31-60`). |
| Governed clinical AI | Absent/unknown | Direct client key and unauthenticated endpoint; no schema/human-review/monitoring gates (`app.config.js:46-51`; `backend/api/index.js:34-89`). |
| Offline clinical mutation safety | Absent/unknown | Arbitrary queue payload, weak IDs, mismatched token key, no idempotency/version/conflict protocol (`syncService.ts:55-123,262-269`). |
| FHIR interoperability | Absent/unknown | No validated server endpoints, profiles, terminology or conformance tests found. |
| Accessibility WCAG 2.2 AA | Absent/unknown | UI primitives include some ARIA, but no conformance tests; no route-level loading/error boundaries were found. |
| CI and automated security tests | Absent/unknown | Zero CI configurations and zero test/spec files found by repository inventory. |
| Reproducible portal quality check | Absent/unknown | Portal lint executable unavailable; root typecheck fails on generated nurse route types. |
| Production operations/DR | Absent/unknown | No verified backup/restore, incident response, SLO, SIEM, deployment inventory or recovery exercise. |

## 8. Findings

Each finding below uses the required Phase 0 fields. Reproduction is limited to safe source inspection; no exploit was executed and no secret or real PHI was accessed.

### PC-CRIT-001 — Sensitive legacy API operations are unauthenticated

- **Severity / confidence:** Critical / High.
- **Affected asset, role, data, environment:** legacy API; any network caller; medical files, AI output, CIDs, patient/audit/consent payloads; any exposed environment.
- **Evidence:** wildcard CORS and no auth at `backend/api/index.js:17-27`; AI `:34-89`; IPFS `:92-126`; notarization `:130-185`; blockchain drain `:188-249`; sync mutations `backend/api/routes/sync.js:17-237`.
- **Preconditions / safe reproduction:** inspect route middleware; each route reaches its handler without authentication/authorization.
- **Actual / expected:** caller-controlled sensitive operations execute anonymously; expected authenticated, authorized, validated, rate/cost-limited operations or no route.
- **Impact:** PHI exfiltration, forged audit/consent/records, unbounded AI/storage cost, ledger pollution, operational compromise.
- **Root cause:** prototype gateway was exposed without a centralized security boundary.
- **Remediation / safer alternative:** disable and network-isolate the gateway; migrate only necessary functions behind the primary API/BFF with deny-by-default authorization, validation, quotas, malware scanning, encryption and audit.
- **Owner / phase / dependencies:** security + backend; Phase 1 containment, Phase 2 replacement; credential rotation and deployment inventory.
- **Verification / status:** negative integration tests must return 401/403/429 and show no side effect; **Open**.
- **Residual risk / unverified:** live exposure and historical use are unknown; treat credentials/data as compromised until verified.

### PC-CRIT-002 — Cross-patient and cross-facility authorization is bypassable

- **Severity / confidence:** Critical / High.
- **Affected asset, role, data, environment:** primary API/PostgreSQL; workforce accounts; all patient records and audit data.
- **Evidence:** any workforce JWT can create a record for any UUID without patient/facility/care check (`backend/src/routes/records.routes.ts:15-94`); workforce audit list returns unscoped logs (`audit.routes.ts:13-30`); patient list accepts broad clinic/role grants (`access.routes.ts:264-320`).
- **Preconditions / safe reproduction:** authenticated low-privilege workforce token plus a different patient UUID; source path has no required relationship query before mutation.
- **Actual / expected:** object IDs and broad role claims determine access; expected server-side ABAC using active role, facility, care relationship, lawful basis/consent, purpose, sensitivity, time/environment and emergency state.
- **Impact:** unauthorized PHI access/alteration, clinical integrity harm, privacy breach, regulatory and trust failure.
- **Root cause:** route-local RBAC and permissive consent replaced a central policy decision/enforcement design.
- **Remediation / safer alternative:** introduce deny-by-default policy enforcement and scoped repository queries; quarantine record mutation and broad audit/list endpoints first.
- **Owner / phase / dependencies:** security/backend/data; Phase 1 containment and Phase 2 authorization foundation; approved matrix and identity/facility model.
- **Verification / status:** positive and negative tests across patient, facility, role, care relationship and revoked consent; **Open**.
- **Residual risk / unverified:** database RLS and live tenant configuration were not available; schema inspection found none.

### PC-CRIT-003 — Client and repository contain privileged AI/Fabric secret material

- **Severity / confidence:** Critical / High.
- **Affected asset, role, data, environment:** Gemini account, Fabric organizations, all users and ledger integrity.
- **Evidence:** Gemini key is injected into public Expo config (`app.config.js:46-51`) and used in a client URL (`src/services/aiService.ts:52-108`); multiple Fabric `priv_sk` paths are tracked under `medichain-network/crypto-config/**`; gateway uses Org1 Admin identity (`backend/src/services/FabricGateway.ts:60-84`). Values were not read.
- **Preconditions / safe reproduction:** inspect build configuration and `git ls-files`; no secret values required.
- **Actual / expected:** privileged material is distributable through source/client artifacts; expected server-side secret manager, short-lived identities, least privilege, no tracked private keys.
- **Impact:** paid API abuse, medical image disclosure, fabricated ledger transactions, complete identity compromise.
- **Root cause:** development credentials and generated crypto artifacts were committed and client/server boundaries blurred.
- **Remediation / safer alternative:** revoke/rotate, remove from history per approved incident procedure, add scanning/pre-commit/CI gates, issue least-privilege identities from managed PKI, proxy AI server-side.
- **Owner / phase / dependencies:** security/DevOps/Fabric owner; immediate Phase 1; provider and repository history response.
- **Verification / status:** provider-side revocation evidence, history scan, clean build-bundle scan, no private key tracked; **Open**.
- **Residual risk / unverified:** whether any credential was live or copied is unknown; rotation is mandatory if uncertain.

### PC-CRIT-004 — Medical AI and file upload disclose data without governance

- **Severity / confidence:** Critical / High.
- **Affected asset, role, data, environment:** patient documents/images, AI account, IPFS storage; patients and clinicians.
- **Evidence:** direct mobile Gemini upload (`src/services/aiService.ts:52-126`); unauthenticated extraction (`backend/api/index.js:34-89`); unrestricted in-memory upload (`:26-27`); raw IPFS upload and public gateway (`IPFSStorage.js:31-60,92-104`).
- **Preconditions / safe reproduction:** inspect request construction and upload middleware.
- **Actual / expected:** sensitive files reach external processors without authenticated purpose, minimization, encryption, retention, DPA/residency evidence, malware/type/size controls or human review; expected a governed server pipeline and explicit clinical-use boundaries.
- **Impact:** irreversible privacy disclosure, unsafe clinical reliance, prompt/content abuse, memory/cost exhaustion.
- **Root cause:** proof-of-concept integrations were connected directly to user flows.
- **Remediation / safer alternative:** disable in Phase 1; design encrypted object storage, malware/CDR pipeline, allowlist, size quotas, consent/purpose, processor governance, schema validation and clinician verification before reintroduction.
- **Owner / phase / dependencies:** security/privacy/clinical AI/backend; Phase 1 disable, later governed AI/file phases; legal and data-processing approval.
- **Verification / status:** threat tests, upload matrix, cost quotas, processor contracts, deletion and human-review evidence; **Open**.
- **Residual risk / unverified:** external data already submitted and provider retention are unknown.

### PC-CRIT-005 — Fabric chaincode lacks caller authorization and network privacy

- **Severity / confidence:** Critical / High.
- **Affected asset, role, data, environment:** ledger state, consent, doctor verification, audit metadata, patient identifiers.
- **Evidence:** no client identity calls in audit/consent chaincode; doctor verification authorization is only a TODO comment (`backend/chaincode/doctor/medichain_doctor.go:87-115`); request/approval trust passed IDs (`:143-251`); patient mutators do not authorize caller (`backend/chaincode/patient/medichain_patient.go:55-353`); single Org1 policy (`medichain-network/configtx.yaml:18-34`); TLS disabled (`docker-compose.yml:15-16,40,62`).
- **Preconditions / safe reproduction:** inspect each public transaction function and network policy.
- **Actual / expected:** any enrolled invoker may mutate/query sensitive world state according to network exposure; expected attribute/MSP policy, multi-organization governance, TLS, endorsement matching policy, private-data/off-chain minimization and explicit transaction schemas.
- **Impact:** forged provider/consent/audit state, metadata disclosure, false assurance and weak nonrepudiation.
- **Root cause:** documentation policy was not implemented in identity, endorsement, chaincode or private-data controls.
- **Remediation / safer alternative:** stop network use; redesign ledger scope to hashes/status only; implement identity/attribute checks, collections where justified, TLS and multi-party governance; prefer off-chain PHI.
- **Owner / phase / dependencies:** Fabric/security/privacy; Phase 1 containment, Phase 3 redesign; governance agreement and key management.
- **Verification / status:** chaincode negative tests by MSP/role/object, endorsement tests, TLS scan, metadata review; **Open**.
- **Residual risk / unverified:** deployed chaincode/network state was not inspected.

### PC-CRIT-006 — Simulated outcomes are represented as trustworthy clinical/security success

- **Severity / confidence:** Critical / High.
- **Affected asset, role, data, environment:** records, auth, audit, blockchain, AI, patient signatures; all users.
- **Evidence:** database simulation (`backend/src/config/db.ts:530-579`); Fabric fallback and fabricated hashes (`FabricGateway.ts:30-160`); fake auth on network failure (`src/services/authService.ts:64-155`); AI synthetic extraction (`aiService.ts:58-62,146-201`); placeholder crypto/blockchain (`src/services/index.ts:15-160`; `cryptoKeyService.ts:141-162`); portals mark data verified and invent block values (`doctor-web/services/backendApi.ts:172-189,228-236`).
- **Preconditions / safe reproduction:** remove/unavailable dependency in a non-PHI local environment and inspect fallback branches; no destructive execution performed.
- **Actual / expected:** failure can yield a success/verified/anchored/authenticated presentation; expected fail closed with explicit degraded state and no claim of persistence, signature or verification.
- **Impact:** clinicians/patients act on nonexistent or fabricated evidence; lost data, false audit assurance and security bypass.
- **Root cause:** demo continuity was prioritized over truth-preserving failure semantics.
- **Remediation / safer alternative:** central environment gate; prohibit simulation outside explicit demo builds; make all trust states provenance-aware; fail sensitive operations closed.
- **Owner / phase / dependencies:** architecture/backend/mobile/web/QA; Phase 1; environment and status model.
- **Verification / status:** fault-injection tests prove no sensitive success during dependency failure; **Open**.
- **Residual risk / unverified:** existing records cannot currently prove which path produced them.

### PC-HIGH-001 — Authentication/session and recovery controls are weak

- **Severity / confidence:** High / High.
- **Affected asset, role, data, environment:** patient/workforce accounts, shared devices, all PHI.
- **Evidence:** hard-coded patient password and enumeration (`backend/src/routes/auth.routes.ts:95-147`); development secret fallbacks and 8-hour HS256 JWT (`TokenService.ts:13-47`); no active-account/facility check in middleware (`auth.middleware.ts:14-33`); sessionStorage trust (`doctor-web/services/auth.ts:62-91,118-132`); local recovery accepts non-empty code (`cryptoKeyService.ts:223-318`).
- **Preconditions / safe reproduction:** source inspection; no account access attempted.
- **Actual / expected:** weak/static secrets, long self-contained sessions, client-trusted user state and placeholder recovery; expected managed identity, MFA for workforce, throttling, rotation/revocation, device/session controls and verified recovery.
- **Impact:** account takeover, persistent access after role/facility changes, shared-device exposure.
- **Root cause:** demo authentication was extended into application flows.
- **Remediation / safer alternative:** disable demo fallback, implement central IdP/session service and server-side status checks; secure patient onboarding/recovery.
- **Owner / phase / dependencies:** identity/security; Phase 1 containment and Phase 2 foundation; identity provider and facility registry.
- **Verification / status:** credential stuffing, enumeration, revoked/disabled account, MFA and recovery tests; **Open**.
- **Residual risk / unverified:** deployment secrets/session stores were unavailable.

### PC-HIGH-002 — Consent and emergency access do not implement lawful, contextual authorization

- **Severity / confidence:** High / High.
- **Affected asset, role, data, environment:** patient consent and emergency profile; workforce/emergency callers.
- **Evidence:** arbitrary/broad grants (`backend/src/routes/consent.routes.ts:18-98`); consent check omits purpose/care/environment/emergency/facility status (`ConsentService.ts:154-213`); emergency QR is permanent until revoked and returns extensive data anonymously (`QRService.ts:64-86,139-173`; `access.routes.ts:92-130`).
- **Preconditions / safe reproduction:** inspect allowed input and decision predicate.
- **Actual / expected:** possession of token or broad role/clinic grant unlocks data; expected minimum-necessary, purpose-bound, expiring consent and authenticated break-glass with reason, strong audit and review.
- **Impact:** over-disclosure, unsafe emergency misuse, invalid consent reliance.
- **Root cause:** consent record presence is treated as the whole authorization decision.
- **Remediation / safer alternative:** revoke broad defaults; establish lawful-basis and policy model; minimize emergency dataset and implement break-glass workflow.
- **Owner / phase / dependencies:** privacy/legal/security/clinical; Phase 1 containment, Phase 2 policy; local legal and Ministry/facility approval.
- **Verification / status:** revoked/expired/wrong-purpose/wrong-facility/emergency negative tests and review workflow; **Open**.
- **Residual risk / unverified:** Sierra Leone enacted obligations and facility policy require qualified local verification.

### PC-HIGH-003 — Offline queue lacks integrity, idempotency, authorization and conflict safety

- **Severity / confidence:** High / High.
- **Affected asset, role, data, environment:** mobile PHI and clinical mutations in intermittent connectivity.
- **Evidence:** arbitrary SecureStore JSON queue and weak random IDs (`src/services/syncService.ts:55-69`); posts to unauthenticated legacy sync (`:101-123`); mismatched auth storage key (`:262-269`); server queue swallows failures (`backend/src/services/OfflineQueue.ts:22-31`); audit sync unauthenticated (`audit.routes.ts:78-89`).
- **Preconditions / safe reproduction:** inspect serialization, endpoints and token keys.
- **Actual / expected:** queued operations can be replayed, forged, silently lost or applied after permission changes; expected encrypted local store, stable idempotency key, version/precondition, server reauthorization, ordered domain queue and user-visible conflict resolution.
- **Impact:** duplicate or lost clinical changes, stale consent application, false sync state and audit forgery.
- **Root cause:** transport retry was used instead of an offline domain protocol.
- **Remediation / safer alternative:** disable sensitive offline mutations first; design per-operation contracts, idempotency/versioning and reauthorization.
- **Owner / phase / dependencies:** mobile/backend/data/security; Phase 1 containment, Phase 4 offline redesign.
- **Verification / status:** replay, duplicate, revoked permission, stale version, partial failure and device-loss tests; **Open**.
- **Residual risk / unverified:** OS backup behavior and device compromise controls were not tested.

### PC-HIGH-004 — Operational security and release assurance are absent

- **Severity / confidence:** High / High.
- **Affected asset, role, data, environment:** all services and production operators.
- **Evidence:** zero test/spec files and zero CI configurations; no verified backup/restore or incident plan; portal lint unavailable; root typecheck fails; health route exposes raw error (`backend/src/index.ts:72-89`); server starts after Fabric failure (`:98-115`).
- **Preconditions / safe reproduction:** repository inventory and non-mutating checks.
- **Actual / expected:** no automated negative authorization, recovery or supply-chain gate; expected protected CI, tests, SBOM/secret/dependency scans, deploy policy, observability and exercised backup/restore.
- **Impact:** regressions and compromise reach users undetected; recovery from PHI loss cannot be assured.
- **Root cause:** completion was measured by screens/features rather than release evidence.
- **Remediation / safer alternative:** establish Phase 1 CI/security baseline and operational runbooks before any pilot.
- **Owner / phase / dependencies:** DevSecOps/QA/SRE; Phase 1 onward; environment inventory and risk ownership.
- **Verification / status:** required branch checks, test evidence, restore exercise, alert drill and release attestation; **Open**.
- **Residual risk / unverified:** external hosting controls were not available for inspection.

### PC-MED-001 — UX and accessibility do not expose reliable high-risk system states

- **Severity / confidence:** Medium / Medium-High.
- **Affected asset, role, data, environment:** mobile and five portals; patients/workforce, especially assistive-technology and low-connectivity users.
- **Evidence:** 20 mobile screens and 64 web page routes exist, but no Next route-level `loading.tsx`, `error.tsx` or `not-found.tsx` files; UI primitives have some ARIA but no WCAG tests; simulation/degraded paths often present success (PC-CRIT-006).
- **Preconditions / safe reproduction:** static route/state inventory; device/screen-reader testing not performed.
- **Actual / expected:** important empty/loading/offline/conflict/denied/expired/degraded/recovery states are inconsistent or absent; expected an explicit state contract, accessible announcements/focus, safe confirmation and recoverable next steps.
- **Impact:** duplicate actions, misunderstanding, PHI shoulder-surfing, inaccessible care workflows and clinical risk.
- **Root cause:** screen-first implementation without cross-state acceptance criteria.
- **Remediation / safer alternative:** implement shared state components and WCAG 2.2 AA test plan after security containment.
- **Owner / phase / dependencies:** product/design/accessibility/engineering; Phase 2-5; workflow and status semantics.
- **Verification / status:** keyboard, screen reader, contrast, reflow, touch, timeout and connectivity matrix; **Open**.
- **Residual risk / unverified:** rendered contrast, localization and device behavior require hands-on testing.

### PC-MED-002 — Documentation materially misrepresents implementation and readiness

- **Severity / confidence:** Medium / High.
- **Affected asset, role, data, environment:** governance, funders, operators, implementers and patients.
- **Evidence:** `README.md:3,826`, `ARCHITECTURE.md:538`, `COMPLETION_REPORT.md:3,232-402`, `DEPLOYMENT_READY.md:3,439-463`, `BLOCKCHAIN_ENGINEER_HANDOFF.md:4-5,417-438` claim production-ready/complete; findings above show critical stubs and controls absent.
- **Preconditions / safe reproduction:** compare claims with code, configuration and test evidence.
- **Actual / expected:** assurance language is unsupported; expected prototype labeling and traceable capability evidence.
- **Impact:** unsafe deployment decisions, invalid risk acceptance, procurement/reputation harm.
- **Root cause:** documentation tracked intended features and UI completion, not verified behavior.
- **Remediation / safer alternative:** quarantine claims, maintain evidence register, require release sign-off and ADRs.
- **Owner / phase / dependencies:** product/compliance/engineering leadership; Phase 1; approval workflow.
- **Verification / status:** every assurance claim maps to test/deployment evidence; **Open**.
- **Residual risk / unverified:** externally distributed copies and stakeholder reliance are unknown.

## 9. Dependency, test, CI and deployment evidence

| Check | Result |
|---|---|
| Backend `npm run typecheck` | Pass |
| Root `npm exec tsc -- --noEmit` | Fail: generated `nurse-web/.next/dev/types/routes.d.ts` syntax errors |
| Doctor portal `npm run lint` | Could not run: `eslint` executable unavailable |
| Repository test-file inventory | 0 files matching common JS/TS/Go test conventions |
| CI inventory | 0 GitHub Actions/GitLab/Azure/Jenkins configurations |
| Dependency audit | Known findings in root, backend, legacy API and representative web portal; see Section 4 |
| Deployed services, WAF, secrets manager, database, backups, monitoring | Absent/unknown; no access/evidence supplied |
| Legal/DPIA/processor agreements/clinical safety case | Absent/unknown; qualified local review required |

## 10. Documentation contradictions

The repository repeatedly states “production-ready”, “100% complete”, “fully functional”, “tested” and “blockchain integration complete.” Those claims are contradicted by zero automated tests/CI, failed/unavailable checks, placeholder signatures/hashes, simulated dependencies, missing FHIR implementation, unprotected chaincode, disabled Fabric TLS, public AI/IPFS/sync routes, and tracked keys. Until evidence gates pass, all readiness documents must be treated as historical prototype notes, not release evidence.

## 11. Uninspectable and unresolved areas

- Whether any tracked/API credential remains active or appeared in distributed builds.
- Git remotes, forks, caches, release artifacts and provider logs containing prior secrets.
- Live hosting/network exposure, cloud roles, WAF, TLS, domains, buckets, database accounts and backups.
- Actual PostgreSQL/Fabric contents and whether any real PHI has been used.
- Mobile binary configuration, OS backup, device integrity and app-store artifacts.
- External AI/IPFS retention, residency, deletion and contractual terms for this deployment.
- Sierra Leone legal obligations as enacted and current in July 2026; Ministry/facility approvals.
- Clinical safety, human factors, penetration testing, accessibility conformance and disaster recovery.

These unknowns do not reduce severity. Where exposure is plausible, Phase 1 must assume compromise until disproved.
