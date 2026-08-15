# PalmChain V2 Phase 0 Release Decision

> **2026-07-16 update:** Phases 2-4 engineering controls are conditionally implemented and locally verified. See `docs/security/PHASE_2_IDENTITY_AUTHORIZATION_REPORT.md`, `PHASE_3_PLATFORM_CONTRACTS_REPORT.md` and `PHASE_4_PATIENT_CORE_REPORT.md`. The decision remains **FAIL / STOP SHIP** for real PHI, pilot, production and public exposure because external identity, legal/DPIA, credential, real-service, accessibility/usability and operational evidence remains open.

**Decision date:** 2026-07-16  
**Baseline:** `main@871eb5f3968f53921b07c6acade1531e1acc5bbe`  
**Decision:** **FAIL / STOP SHIP for any pilot, production deployment, external network exposure, or use of real patient data**  
**Permitted posture:** isolated local development with clearly synthetic data, no live-capable credentials, no public endpoints and no claim of production, clinical, cryptographic or blockchain assurance.

## 1. Executive summary

PalmChain has substantial product exploration: a patient mobile app, five workforce/government portals, a TypeScript API, PostgreSQL schemas, consent/access workflows and Fabric prototypes. That breadth is useful for planning, but it does not constitute a trusted health system.

The audit found six Critical, four High and two Medium consolidated findings. Critical failures include anonymous sensitive AI/file/sync/ledger operations, cross-patient/cross-facility authorization bypass, exposed/tracked privileged credential material, uncontrolled processing/storage of medical documents, unauthorized/TLS-disabled Fabric design, and simulated outcomes presented as trustworthy authentication, persistence, AI, signature or blockchain success.

The system has no automated tests or CI configuration, no verified backup/restore or incident process, no proven legal/DPIA/processor/clinical-safety approval, and no verified WCAG 2.2 AA or deployment security evidence. Repository documents that call the application “production-ready” or “100% complete” are contradicted by code and test evidence.

The project may continue only as a contained prototype while Phase 1 performs approved containment. Phase 1 must not expand features; it must close exposure, secret and false-assurance paths and establish the first release gates.

## 2. Risk summary

| Severity | Count | Consolidated findings | Release effect |
|---|---:|---|---|
| Critical | 6 | Anonymous legacy sensitive routes; BOLA/cross-facility access; AI/Fabric secret material; unsafe AI/file processing; unauthorized/privacy-weak Fabric; simulated trust success | Each independently requires FAIL |
| High | 4 | Weak auth/session/recovery; contextual consent/emergency failure; unsafe offline sync; absent operational/release assurance | Stop ship unless formally contained/accepted; several support Critical exploitability |
| Medium | 2 | Incomplete/unverified UX-accessibility states; misleading readiness documentation | Fix before broad release; documentation correction is part of containment |

Detailed fields, evidence, reproduction, impact, remediation, ownership, tests and assumptions are in `00_Current_State_Audit.md`.

## 3. Explicit stop-ship reasons

The release is FAIL because all of the following remain unresolved:

1. **Sensitive routes lack required authentication:** legacy AI extraction, IPFS upload, blockchain notarization/drain and record/access/consent/audit sync are anonymously callable (`backend/api/index.js:17-249`; `backend/api/routes/sync.js:17-237`).
2. **Object/facility authorization is not verified and is demonstrably incomplete:** any workforce JWT can create a record for an arbitrary patient UUID, and workforce audit listing is unscoped (`backend/src/routes/records.routes.ts:15-94`; `audit.routes.ts:13-30`).
3. **Privileged key material is exposed:** a Gemini key is placed in the client bundle/request and Fabric private keys are tracked; provider/identity rotation is not verified (`app.config.js:46-51`; `src/services/aiService.ts:52-108`; `medichain-network/crypto-config/**/priv_sk`).
4. **Paid AI has no meaningful authentication/cost limit on the legacy route and medical images are sent directly from the client.**
5. **Medical file handling is unsafe:** unrestricted in-memory upload and raw IPFS/public-gateway storage lack encryption, malware controls, access lifecycle and deletion assurance (`backend/api/index.js:26-27,92-126`; `IPFSStorage.js:31-104`).
6. **Sensitive behavior can fail open or claim synthetic success:** database, Fabric, mobile auth and AI fallbacks can mimic real results (`backend/src/config/db.ts:530-579`; `FabricGateway.ts:30-160`; `src/services/authService.ts:64-155`; `aiService.ts:58-62,146-201`).
7. **Fabric does not provide claimed trust:** single organization, TLS disabled, privileged admin gateway, missing chaincode caller authorization and linkable metadata (`medichain-network/configtx.yaml:18-34`; `docker-compose.yml:15-16,40,62`; `backend/chaincode/**/*.go`).
8. **Emergency PHI is exposed by a permanent-until-revoked anonymous capability without authenticated break-glass controls** (`backend/src/services/QRService.ts:64-86,139-173`).
9. **No backup/restore plan or exercise for irreplaceable production data was verified.**
10. **High-risk healthcare/AI behavior has no qualified clinical, privacy, legal and human review evidence.**
11. **Essential live deployment controls are uninspectable:** hosting/network, database roles/content, secrets manager, backups, WAF, monitoring, provider configuration and deployed Fabric state were not supplied.
12. **There is no automated test/CI evidence:** zero test files and zero CI configurations were found; root typecheck is not green and portal lint cannot run in the inspected installation.

## 4. Trust summary

| Trust claim | Evidence state | Decision |
|---|---|---|
| “Authenticated user” | Patient demo/static password and mobile network-failure fallback; workforce JWT lacks active status/facility checks | Not trustworthy |
| “Authorized clinician” | Broad role JWT plus incomplete consent; object/care/facility context missing | Not trustworthy |
| “Patient consented” | Broad arbitrary role/clinic/category grants; purpose/context/legal basis incomplete | Not trustworthy as authorization |
| “Emergency access” | Anonymous token possession, extensive profile, permanent-until-revoked | Not acceptable break-glass |
| “Saved/synced” | Database/offline paths can simulate or swallow failure | Not trustworthy |
| “Signed” | placeholder/HMAC/non-empty verification and fake recovery | Not a proven clinical/legal signature |
| “Blockchain anchored/verified” | fabricated hashes/fallback, admin identity, unauthorized chaincode, single-org/TLS-off network | Not trustworthy |
| “Audit trail” | anonymous sync, unscoped queries, forgeable chaincode and simulated gateway | Not trustworthy for assurance |
| “AI extracted” | uncontrolled direct/anonymous provider calls or simulated conclusions | Not clinically trustworthy |
| “Private/encrypted/deleted” | raw IPFS and unencrypted local PHI; no verified lifecycle | Not demonstrated |
| “Production-ready” | contradicted by Critical findings and absent release evidence | False/unsupported |

## 5. Unresolved and unverified areas

- Whether any credential/private key was or remains live, and whether it exists in forks, releases, caches, builds or provider logs.
- Whether any public endpoint has been deployed or any real patient data was entered, uploaded to AI/IPFS, stored in databases/devices or written as ledger metadata.
- Cloud/hosting topology, domain/TLS/WAF, network policy, database accounts/RLS, secret manager, storage buckets, KMS, logs, monitoring and on-call ownership.
- Backup/PITR, restore evidence, retention/legal hold, deletion/correction and incident/breach procedures.
- Current enacted Sierra Leone data protection/health-record obligations and controller/processor/cross-border basis; qualified local legal verification is mandatory.
- Ministry of Health, Health Information Hub and pilot-facility interface/governance approval.
- Clinical safety case, intended-use statement, human review, emergency workflow approval and AI processor/evaluation evidence.
- Rendered WCAG 2.2 AA, keyboard/screen-reader, contrast, reflow, touch, timeout, shared-device and low-connectivity usability.
- Penetration test, chaincode/endorsement tests, FHIR conformance, mobile binary/device controls and disaster recovery.

Unknown exposure must be handled conservatively. It is not evidence that the system is safe.

## 6. Prioritized remediation roadmap

### Phase 1 — Containment and evidence foundation

1. Inventory every deployment, build, domain, provider account, storage location, database and Fabric network; prohibit real PHI and external exposure.
2. Disable/remove/network-isolate the legacy API, anonymous emergency over-disclosure and sensitive sync routes.
3. Revoke/rotate Gemini and Fabric credentials; remove private keys/secrets from source/history through an approved incident procedure; scan source, history and artifacts.
4. Prohibit simulation in any pilot/production configuration; make database/Fabric/AI/auth failure explicit and fail sensitive operations closed.
5. Quarantine record mutation, unscoped audit/patient listing and broad clinic/role consent until deny-by-default enforcement exists.
6. Replace readiness claims with prototype warnings and an evidence register.
7. Establish reproducible package/toolchain checks and protected CI with type/lint, secret/SCA/SAST, SBOM and initial negative authorization tests.
8. Document incident response, risk owners and the exact safe local-development posture.

**Phase 1 exit:** no Critical anonymous/exposed-secret/fake-success path; clean verified scans and credential rotation; sensitive routes disabled or centrally protected; initial CI mandatory and green.

### Phase 2 — Identity, authorization, privacy and data foundation

Implement authoritative identity/MFA/session revocation, active facility/credential and care/task relationships, central ABAC/PEP/PDP, scoped data repositories/RLS, contextual consent/lawful basis, authenticated break-glass, structured validation/errors, endpoint-specific abuse controls, encryption/key management and append-only audit.

### Phase 3 — Clinical provenance and limited ledger decision

Implement record lifecycle/version/correction/signature/provenance. Decide through ADR whether Fabric is justified. If retained, rebuild with multi-party governance, TLS, managed least-privilege identities, caller/object authorization, approved endorsement, privacy-minimized transactions and exact commit receipts.

### Phase 4 — Files, offline and interoperability

Introduce encrypted managed files with malware/CDR/lifecycle controls; domain-safe offline queue with idempotency/version/reauthorization/conflict UX; FHIR interfaces from approved Ministry/facility use cases with identity, terminology, provenance and conformance tests.

### Phase 5 — Pilot readiness and optional governed AI

Complete legal/DPIA/clinical/privacy/accessibility approvals, operations/restore/incident exercises, penetration test and representative pilot usability. Consider only a narrow server-side AI use case with approved processor terms, evaluation, schema/abstention, clinician confirmation, monitoring and kill switch.

## 7. Evidence required to change this decision

A future decision may become CONDITIONAL only when:

- all Critical findings are closed with reproducible evidence;
- every High finding is closed or explicitly accepted by named qualified risk owners with bounded pilot controls;
- the authorization matrix is implemented at edge/server/data/chaincode points and negative-tested;
- credentials are rotated and source/history/build/provider scans are clean;
- no non-demo environment can simulate authentication, persistence, signature, AI or ledger success;
- legal/DPIA/processor, clinical safety and pilot-facility/Ministry approvals are documented;
- database/file encryption, key lifecycle, backup/restore, incident response, audit alerts and operational ownership are exercised;
- CI is protected and reproducibly green with tests and security gates;
- accessibility and low-connectivity critical journeys pass qualified manual and automated tests;
- any remaining unknown is proven outside the deployed pilot boundary.

PASS requires all applicable release gates, not merely Phase 1 containment.

## 8. Phase 0 completion statement

The required Phase 0 documentation has been produced under `docs/audit/`. No application code, configuration, dependencies, schemas, chaincode, infrastructure or generated assets were intentionally changed. Phase 1 is **not authorized by this report**.

The human approval phrase may be:

> Phase 0 is reviewed and approved. Begin Phase 1 containment on a new `codex/palmchain-v2-phase-1` branch. Do not implement later phases.

Until that explicit approval is given, work stops at this release decision.
