# PalmChain V2 Gap Analysis

**Baseline:** current state at `main@871eb5f3968f53921b07c6acade1531e1acc5bbe` on 2026-07-16  
**Targets:** PalmChain V2 blueprint, supplied AI App Security/UX Audit Standard, OWASP application-security principles, NIST risk principles, WHO health-AI governance direction, FHIR interoperability direction, and locally verified Sierra Leone law/policy  
**Current release state:** FAIL / STOP SHIP

## 1. Prioritization model

- **Containment:** remove or isolate an existing unsafe path without depending on the final architecture.
- **Architectural control:** create the trusted identity, authorization, data, audit and operations foundation.
- **Product capability:** add governed workflows only after the foundation proves safe.
- **Effort:** S (days), M (1-3 sprints), L (multi-sprint), XL (program/multi-party).

Phase assignments are recommendations, not authority to implement. Phase 1 requires explicit approval after review of the full audit pack.

## 2. Immediate containment gaps

| ID | Gap / risk | Evidence | Target | Effort | Owner type | Dependencies | Verification criterion |
|---|---|---|---|---|---|---|---|
| G-01 | Legacy AI, IPFS, notarize and sync routes are unauthenticated; Critical PHI/cost/integrity exposure | `backend/api/index.js:17-249`; `backend/api/routes/sync.js:17-237` | Phase 1 | S | Security/backend/ops | Deployment inventory | Routes removed or network-disabled; anonymous negative tests show no side effect |
| G-02 | Client-delivered Gemini secret and tracked Fabric private keys; assume compromise | `app.config.js:46-51`; `src/services/aiService.ts:52-108`; tracked `medichain-network/crypto-config/**/priv_sk` | Phase 1 | M | Security/DevOps/Fabric | Provider access, incident owner | Rotation/revocation evidence; clean history/bundle/repo scan; no private key tracked |
| G-03 | Cross-patient record mutation and unscoped audit read | `backend/src/routes/records.routes.ts:15-94`; `audit.routes.ts:13-30` | Phase 1 | M | Backend/security/data | Approved interim deny rules | Quarantined or fully ABAC-protected; object/facility negative tests pass |
| G-04 | Anonymous permanent emergency QR returns excessive data | `backend/src/services/QRService.ts:64-86,139-173`; `access.routes.ts:92-130` | Phase 1 | S | Privacy/clinical/backend | Minimum emergency dataset decision | Existing tokens revoked; new flow limited/disabled; anonymous excessive-data tests fail closed |
| G-05 | Simulation/fallback can report authentication, persistence, verification or clinical success | `db.ts:530-579`; `FabricGateway.ts:30-160`; `authService.ts:64-155`; `aiService.ts:58-62,146-201` | Phase 1 | M | Architecture/all engineering | Environment classification | Pilot/production cannot start in simulation; dependency faults return explicit failure/degraded state |
| G-06 | Broad default clinic/role/all-data consent and automatic indefinite grants | `patients.routes.ts:60-72`; `consent.routes.ts:43-98`; `ConsentService.ts:154-213` | Phase 1 | M | Privacy/legal/security/backend | Interim lawful-basis rules | Broad grants migrated/revoked; deny-by-default tests pass |
| G-07 | Fabric services use TLS-disabled single-org network and privileged admin identity | `medichain-network/docker-compose.yml:15-16,40,62`; `configtx.yaml:18-34`; `FabricGateway.ts:60-84` | Phase 1 | S | Fabric/ops/security | Network inventory | Network cannot be reached by application; credentials rotated; exposure documented |
| G-08 | Production-readiness claims can trigger unsafe deployment | `README.md:3,826`; `COMPLETION_REPORT.md:3,232-402`; `DEPLOYMENT_READY.md:3,439-463` | Phase 1 | S | Product/compliance | Stakeholder owner | Prototype warning is canonical; release claims require evidence links |

## 3. Architecture and security foundation gaps

| ID | Gap / risk | Evidence | Target | Effort | Owner type | Dependencies | Verification criterion |
|---|---|---|---|---|---|---|---|
| G-09 | No central deny-by-default ABAC/PDP/PEP | `auth.middleware.ts:14-33`; route-local checks; `ConsentService.ts:154-213` | Phase 2 | XL | Security/architecture/backend | Approved authorization matrix, identity/facility registry | Policy decision uses role, facility, relationship, lawful basis, purpose, sensitivity, time/device and emergency attributes; complete negative matrix passes |
| G-10 | Weak workforce/patient identity, no MFA/revocation/status/recovery assurance | `auth.routes.ts:17-147`; `TokenService.ts:13-47`; `cryptoKeyService.ts:223-318` | Phase 2 | L | Identity/security | IdP and onboarding decisions | MFA, lockout/throttling, disabled-account, role change, recovery and session revocation tests pass |
| G-11 | Browser trusts sessionStorage role/user metadata | `doctor-web/services/auth.ts:62-91,118-132`; duplicated portals | Phase 2 | M | Web/security | BFF/session design | HTTP-only secure session or equivalent; server derives role; tampered client metadata never grants access |
| G-12 | PostgreSQL has no observed tenant/facility/ownership policy or RLS | `backend/db/schema.sql:5-166` | Phase 2 | L | Data/backend/security | Resource/tenant model | Scoped repository queries plus RLS/defense-in-depth; cross-facility database tests pass |
| G-13 | Consent is modeled as a broad permission rather than contextual lawful basis | `consent.routes.ts:18-98`; `ConsentService.ts:154-213` | Phase 2 | XL | Privacy/legal/security/clinical | Local legal verification, purpose taxonomy | Versioned, purpose-bound, granular, expiring/revocable records; policy and receipt tests pass |
| G-14 | Break-glass lacks authenticated responder, justification, minimum necessary, review and notification | `QRService.ts:64-86,139-173`; `access.routes.ts:92-130` | Phase 2 | L | Clinical/privacy/security | Emergency workflow approval | Strong identity, reason, timebox, dataset limit, immutable audit, review and patient notification proven |
| G-15 | Audit events are forgeable, over-broad and may leak identifiers to ledger | `audit.routes.ts:13-89`; `AuditService.ts:61-145`; `medichain_audit.go:26-197` | Phase 2/3 | L | Security/privacy/data/Fabric | Event taxonomy, ledger decision | Append-only server events, scoped query, integrity verification; no direct patient/actor identifiers on shared ledger |
| G-16 | Client/request schemas are partially validated; sensitive nested inputs lack strict schemas | route validators and arbitrary payloads in legacy sync | Phase 2 | M | Backend/security | API contract standard | Reject unknown/type-invalid/oversized content; generated OpenAPI and contract tests |
| G-17 | Global IP-only 100/15m limit is inadequate for login, AI, files, lookup, sync and exports | `backend/src/index.ts:40-50`; no legacy limiter | Phase 1/2 | M | Security/backend/ops | Identity/device keys, storage | Endpoint-specific quotas, cost ceilings, distributed store and 429 tests |
| G-18 | Error responses and console logs expose internals/identifiers | `index.ts:86-89`; `AccessRequestService.ts:57-58`; route `details: err.message` patterns | Phase 2 | M | Backend/SRE/privacy | Structured logging/redaction standard | Stable public errors; correlated redacted logs; secret/PHI log tests |

## 4. Data, interoperability and blockchain gaps

| ID | Gap / risk | Evidence | Target | Effort | Owner type | Dependencies | Verification criterion |
|---|---|---|---|---|---|---|---|
| G-19 | PHI stored in mobile SQLite without demonstrated encryption/key lifecycle | `src/services/database.ts:15-119` | Phase 2/4 | L | Mobile/security/privacy | Offline scope and device policy | Encrypted store, hardware-backed key strategy, backup exclusion, remote/session wipe and device tests |
| G-20 | Offline sync lacks stable idempotency, base versions, server reauthorization, ordered dependency and conflicts | `src/services/syncService.ts:55-123,262-269`; `OfflineQueue.ts:22-31` | Phase 4 | XL | Mobile/backend/data/security | ABAC and resource versioning | Replay/duplicate/stale/revoked/partial/device-loss test suite passes |
| G-21 | Raw medical documents are sent to public/distributed IPFS without encryption/deletion proof | `backend/api/services/IPFSStorage.js:31-60,92-104` | Phase 1 disable; Phase 4 replace | L | Security/privacy/storage | Data residency/retention decision | Encrypted managed storage, malware scan, signed access, lifecycle/deletion and audit tests |
| G-22 | No usable FHIR R4/R5 API, profiles, terminology, conformance or MPI strategy | no server FHIR routes/tests found | Phase 4/5 | XL | Interoperability/clinical/data | Ministry/Health Information Hub interface agreement | CapabilityStatement, profiles, terminology validation, SMART/security if applicable, conformance tests |
| G-23 | Chaincode trusts arguments/caller and stores linkable metadata; private data not designed | `backend/chaincode/**/*.go`; `AuditService.ts:61-145` | Phase 3 | XL | Fabric/security/privacy | Ledger value decision, multi-party governance | MSP/attribute/object negative tests; privacy analysis; only approved hashes/status metadata on ledger |
| G-24 | Documentation claims endorsement policy not represented by current single-org configuration | patient chaincode comment `:13-20`; `configtx.yaml:18-34` | Phase 3 | L | Fabric/governance | Ministry/facility organizations | Lifecycle and transaction endorsement tests match approved policy |
| G-25 | “Transaction hash”, signature and verification fields are fabricated/placeholders | `FabricGateway.ts:123-160`; `records.routes.ts:42-88`; `cryptoKeyService.ts:141-162`; portal API adapters | Phase 1/3 | M | Architecture/Fabric/web/mobile | Provenance/status model | UI/API distinguishes submitted/committed/failed; receipt verified from ledger; cryptographic signatures validate against managed keys |

## 5. AI, clinical safety and product gaps

| ID | Gap / risk | Evidence | Target | Effort | Owner type | Dependencies | Verification criterion |
|---|---|---|---|---|---|---|---|
| G-26 | No approved clinical AI use case, model/data governance, prompt-injection control, structured validation or human review | `aiService.ts:52-201`; `backend/api/index.js:34-89` | Later governed AI phase | XL | Clinical safety/AI/privacy/security | Legal, processor, clinical safety approvals | Narrow indication, evaluation dataset, schema/abstention, clinician confirmation, monitoring and rollback evidence |
| G-27 | Simulated AI emits plausible clinical conclusions | `aiService.ts:146-201` | Phase 1 | S | Mobile/clinical safety | Demo policy | Removed from non-demo builds; demo content unmistakably synthetic and cannot enter a record |
| G-28 | Admin and government portals can imply broad PHI/national visibility | client permissions and mock portal pages | Phase 2/5 | L | Product/privacy/security | Minimum-necessary analytics policy | Admin has no routine clinical read; government receives approved de-identified aggregate data with disclosure controls |
| G-29 | No clinical record correction/signature/provenance workflow | record routes and placeholder signature paths | Phase 3/4 | XL | Clinical/product/data | Workflow and medico-legal approval | Immutable version history, author/signatory, correction reason, status lifecycle and provenance tests |

## 6. UX, accessibility, operations and quality gaps

| ID | Gap / risk | Evidence | Target | Effort | Owner type | Dependencies | Verification criterion |
|---|---|---|---|---|---|---|---|
| G-30 | Important pages lack a shared state contract for empty/loading/denied/expired/offline/queued/degraded/conflict/recovery | no web route-level loading/error/not-found files; simulated success paths | Phase 2-5 | L | Product/design/web/mobile | Truthful backend status model | State matrix acceptance tests across all critical journeys |
| G-31 | WCAG 2.2 AA, keyboard, screen reader, contrast, reflow, touch and timeout are unverified | some UI primitive ARIA; no a11y tests | Phase 2-5 | L | Accessibility/design/QA | Supported browser/device matrix | Automated checks plus manual assistive-tech test evidence; no critical/serious defects |
| G-32 | Shared-device privacy, session timeout and screenshot/notification exposure are undefined | sessionStorage/mobile flows; no policy evidence | Phase 2 | M | Security/privacy/product | Device/session policy | Privacy timeout, reauth, redaction, clear local data and notification tests |
| G-33 | No localization/health-literacy evidence for Sierra Leone users | English-centric UI; no localization test evidence | Phase 5 | L | Product/content/research | User research and language decisions | Approved plain-language content, locale support and representative usability tests |
| G-34 | No automated tests or CI release gates | inventory found zero test files and zero CI config | Phase 1 onward | XL | QA/DevSecOps | Branch/release policy | Protected CI runs unit, integration, negative auth, SAST, dependency, secret, SBOM and artifact checks |
| G-35 | Build/lint is not reproducibly green | backend typecheck passes; root typecheck fails; doctor lint executable unavailable | Phase 1 | M | Engineering/DevOps | Package manager/monorepo decision | Clean install and all required checks pass from documented lockfiles/toolchain |
| G-36 | No verified backup/restore, incident response, monitoring/SLO or audit alerting | no evidence supplied | Phase 1/5 | XL | SRE/security/privacy | Hosting architecture and ownership | Restore exercise, incident tabletop, alerts, retention, on-call and SLO evidence |
| G-37 | Dependency vulnerabilities are unresolved | non-mutating npm audit metadata: root critical/high; legacy high; other moderate | Phase 1 | M | DevSecOps/engineering | Advisory triage and compatibility | SBOM/advisory review; no unaccepted critical/high reachable finding |
| G-38 | Current legal readiness is unknown | no qualified local legal verification/DPIA evidence | Before any real-data pilot | XL | Local counsel/privacy/Ministry | Final enacted law/policy and controller/processor roles | Signed legal basis, DPIA, retention, rights, breach, cross-border and processor approvals |

## 7. Critical path

1. **Contain exposure:** disable legacy sensitive routes, public emergency over-disclosure, simulation in non-demo environments and Fabric application connectivity.
2. **Respond to secrets:** inventory deployments/builds, revoke/rotate, remove tracked keys/history through an approved incident procedure, add scans.
3. **Establish truth:** define environment/provenance/status semantics so “saved”, “verified”, “anchored”, “signed” and “synced” are only asserted when proven.
4. **Build identity and ABAC:** authoritative role/facility/care relationship/lawful basis/purpose/sensitivity/emergency decisions, deny by default.
5. **Harden data/audit:** scoped PostgreSQL access, encryption and key management, append-only audit, logging/monitoring, backup/restore.
6. **Rebuild clinical workflows:** consent, break-glass, record provenance/correction, offline protocol and accessible states.
7. **Add interoperability and limited ledger:** validated FHIR boundary; Fabric only where governance and privacy analysis justify it.
8. **Consider AI last:** only a narrow, evaluated, processor-approved, human-reviewed use case.

## 8. Exit criteria by decision gate

### Phase 1 containment exit

- No sensitive anonymous route; no client secret; no tracked live-capable private key.
- No simulation or fabricated trust result in pilot/production configuration.
- Critical record/audit/emergency paths are disabled or centrally authorized.
- Required CI exists and runs secret/dependency/type/lint plus initial negative authorization tests.
- Deployment inventory, credential incident response and prototype labeling are documented.

### Foundation/pilot exit

- All Critical and unaccepted High findings closed with evidence.
- Authorization matrix implemented at server/data boundaries and independently negative-tested.
- Legal/DPIA/clinical/privacy approvals for the pilot and processors are signed.
- Encryption/key lifecycle, backup/restore, incident response, observability and access review are exercised.
- Accessible, truthful offline/degraded/conflict states pass representative user testing.
- No real PHI until data migration, retention, deletion/correction and breach procedures are approved.
