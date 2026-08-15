# PalmChain V2 Endpoint, Validation and Abuse-Control Inventory

**Inventory date:** 2026-07-16  
**Test status for every route:** no automated route/security tests were found. All behavior is source-inspected and otherwise unverified.  
**Current primary API limit:** one IP-based limit of 100 requests per 15 minutes for all `/api` routes (`backend/src/index.ts:40-50`). It is not an authorization or cost-control boundary.  
**Current legacy API limit:** none found.

## 1. Codes used in tables

- **Auth:** `PUB` none; `PAT` patient JWT; `WF` doctor/nurse/admin/staff JWT through `requireDoctor`; `MAN` route manually parses token.
- **Validation:** `V` partial express-validator checks; `P` ad-hoc presence/type checks; `N` no meaningful schema validation. No strict OpenAPI/JSON-schema rejection of unknown fields was found.
- **Sensitivity:** `PHI`, `AUTH`, `AUDIT`, `CONSENT`, `FILE`, `AI`, `LEDGER`, `OPS`, `AGG`.
- **Idempotency:** `N` none; `Q` partial database uniqueness/status behavior but no client idempotency contract; `RO` read-only.
- **Audit:** `Y` route/service attempts a domain audit event; `N` absent; `F` audit path is forgeable/untrusted.
- **Error:** `RAW` may return/log `err.message`/provider detail; `GEN` generally generic; `ENUM` account/object enumeration; `SIM` may return synthetic success/degraded truth.
- **Target control:** all protected routes additionally require the approved attributes in `02_Authorization_Matrix.md` and server/data enforcement. `RL-AUTH`, `RL-READ`, `RL-WRITE`, `RL-EMERG`, `RL-AI`, `RL-FILE`, `RL-SYNC`, `RL-EXPORT`, `RL-ADMIN`, `RL-OPS` denote distinct distributed policies, not one fixed number.

## 2. Primary TypeScript API

### Authentication and health

| Method/path | Caller/current auth | Required authorization attributes | Validation / request-response | Sensitivity | Idem | Audit | Current rate / target | Error | Evidence |
|---|---|---|---|---|---|---|---|---|---|
| POST `/api/auth/doctor/login` | PUB | identity, active credential/facility, MFA/assurance, device/risk | V email/username/password; response includes JWT/user | AUTH | N | N | global only / RL-AUTH per account+IP+device, progressive delay | RAW/ENUM risk | `backend/src/routes/auth.routes.ts:17-64` |
| POST `/api/auth/patient/login` | PUB | verified patient identity, onboarding/recovery status, device/risk | V but password optional; hard-coded password path; JWT/user | AUTH/PHI | N | N | global only / RL-AUTH | RAW/ENUM/SIM | `auth.routes.ts:71-147` |
| GET `/api/health` | PUB | public minimal liveness only; detailed readiness requires ops auth | no request schema; returns DB/Fabric state | OPS | RO | N | global / RL-OPS | RAW/SIM | `backend/src/index.ts:72-89` |

### QR and emergency access

| Method/path | Caller/current auth | Required authorization attributes | Validation / request-response | Sensitivity | Idem | Audit | Current rate / target | Error | Evidence |
|---|---|---|---|---|---|---|---|---|---|
| POST `/api/qr/generate` | PAT | own patient, purpose, dataset, audience, bounded expiry, device/step-up | V ttl 0..604800 and one-time; returns capability token | PHI/AUTH | N | N | global / RL-WRITE | RAW | `backend/src/routes/qr.routes.ts:17-38` |
| POST `/api/qr/emergency` | PAT | own patient, approved minimum dataset, expiry, step-up | N body; returns permanent-until-revoke token | PHI/AUTH | N | N | global / RL-EMERG | RAW | `qr.routes.ts:46-58`; `QRService.ts:64-86` |
| DELETE `/api/qr/token/:tokenId` | PAT | own token; current session; reason optional | P path only; scoped SQL | AUTH | Q | N | global / RL-WRITE | GEN | `qr.routes.ts:64-76` |
| GET `/api/qr/mine` | PAT | own tokens | query not paginated; token metadata response | AUTH | RO | N | global / RL-READ | RAW | `qr.routes.ts:83-98` |
| POST `/api/access/scan` | WF | active role/facility, care/task relationship, token audience/purpose/category, consent/basis, device | P token/categories; response patient data | PHI/CONSENT | N | Y | global / RL-READ + anti-enumeration/replay | RAW | `backend/src/routes/access.routes.ts:20-78` |
| POST `/api/access/emergency` | PUB | target requires authenticated responder, reason, timebox and BG obligations | P token; returns extensive emergency profile anonymously | PHI | N | partial/F | global / RL-EMERG, very low, anomaly alert | RAW/ENUM | `access.routes.ts:92-130`; `QRService.ts:139-173` |
| GET `/api/access/patient/:patientId` | WF | role, facility, care relationship, basis/consent, purpose, category/field mask, sensitivity | P path; broad demographics/emergency/records response | PHI | RO | Y | global / RL-READ | RAW/ENUM | `access.routes.ts:140-255` |
| GET `/api/access/patients` | WF | assigned/scoped patient list only; facility/purpose; pagination | weak query; broad clinic/role list and simulation fallback | PHI | RO | N | global / RL-READ | RAW/SIM | `access.routes.ts:264-320` |

### Access requests and consent

| Method/path | Caller/current auth | Required authorization attributes | Validation / request-response | Sensitivity | Idem | Audit | Current rate / target | Error | Evidence |
|---|---|---|---|---|---|---|---|---|---|
| POST `/api/access-requests` | WF | active role/facility/care reason; requested action/categories/purpose/time | V patientId/reason/categories; response request | CONSENT/PHI | N | Y | global / RL-WRITE | RAW | `backend/src/routes/accessRequest.routes.ts:19-53` |
| GET `/api/access-requests/doctor/my-requests` | WF | own requests; role/facility | no pagination contract | CONSENT | RO | N | global / RL-READ | RAW | `accessRequest.routes.ts:62-72` |
| GET `/api/access-requests/patient/pending` | PAT | own patient | no query schema | CONSENT/PHI | RO | N | global / RL-READ | RAW | `accessRequest.routes.ts:79-89` |
| GET `/api/access-requests/patient/history` | PAT | own patient | P integer limit without bounded validator | CONSENT | RO | N | global / RL-READ | RAW | `accessRequest.routes.ts:96-107` |
| PATCH `/api/access-requests/:id/approve` | PAT | own pending request; informed purpose/action/categories/expiry; current requester status | V optional categories; defaults can grant all data/90 days | CONSENT/PHI | Q | Y | global / RL-WRITE, replay-safe | RAW | `accessRequest.routes.ts:114-147`; `AccessRequestService.ts:67-124` |
| PATCH `/api/access-requests/:id/deny` | PAT | own pending request | V optional reason | CONSENT | Q | Y | global / RL-WRITE, replay-safe | RAW | `accessRequest.routes.ts:154-184` |
| POST `/api/consent` | PAT | own patient; validated grantee, action, categories, purpose, expiry, legal basis | N/ad-hoc body; accepts broad caller-controlled values | CONSENT/PHI | N | Y | global / RL-WRITE | RAW | `backend/src/routes/consent.routes.ts:18-35` |
| POST `/api/consent/clinic` | PAT | own patient; active facility; scoped purpose/action/categories/expiry | N/ad-hoc; grants clinic all-staff/all-data | CONSENT/PHI | N | Y | global / RL-WRITE | RAW | `consent.routes.ts:43-64` |
| POST `/api/consent/role` | PAT | own patient; approved narrow role scope and purpose | P role/access/categories; can grant any credentialed role globally | CONSENT/PHI | N | Y | global / RL-WRITE | RAW | `consent.routes.ts:68-98` |
| GET `/api/consent` | WF | only consents relevant to own patient/case/facility; purpose | query/body behavior unverified | CONSENT/PHI | RO | N | global / RL-READ | RAW | `consent.routes.ts:106-129` |
| GET `/api/consent/mine` | PAT | own patient | no query schema | CONSENT | RO | N | global / RL-READ | RAW | `consent.routes.ts:135-142` |
| DELETE `/api/consent/:id` | MAN | patient owns grant or workforce is exact grantee/active facility; future effect immediate | manual bearer parse; body reason unvalidated | CONSENT | Q | partial | global / RL-WRITE | RAW | `consent.routes.ts:145-210` |
| DELETE `/api/consent/doctor/:doctorId` | PAT | own patient; exact active grant; reason/receipt | P path | CONSENT | Q | partial | global / RL-WRITE | RAW | `consent.routes.ts:213-235` |

### Patients, records and treatments

| Method/path | Caller/current auth | Required authorization attributes | Validation / request-response | Sensitivity | Idem | Audit | Current rate / target | Error | Evidence |
|---|---|---|---|---|---|---|---|---|---|
| POST `/api/patients` | WF | approved enrollment role/facility/workflow, duplicate/MPI policy, patient identity proof | V demographic fields; auto broad consent; mock key/anchor | PHI/AUTH/LEDGER | N | Y | global / RL-WRITE | RAW/SIM | `backend/src/routes/patients.routes.ts:15-107` |
| PUT `/api/patients/privacy` | PAT | own patient; supported field-level privacy rules and clinical safety constraints | V array only; strings/content not strictly bounded | PHI/CONSENT | N | N | global / RL-WRITE | RAW | `patients.routes.ts:114-146` |
| POST `/api/records` | WF | clinician role, active facility/care relationship, write basis, category/sensitivity, purpose, signer | V core fields; any UUID; mock CID/hash/signature/anchor | PHI/LEDGER | N | Y | global / RL-WRITE | RAW/SIM | `backend/src/routes/records.routes.ts:15-94` |
| GET `/api/records?patientId=` | WF (doctor-only route check) | active facility/care, read basis, purpose/category/field mask | P query patientId; broad consent predicate | PHI | RO | Y | global / RL-READ | RAW/ENUM | `records.routes.ts:101-134` |
| POST `/api/treatments` | WF | authorized clinician, active facility/care, write basis, purpose/sensitivity, signer | V fields; consent check lacks full context; placeholder anchor | PHI/LEDGER | N | Y | global / RL-WRITE | RAW/SIM | `backend/src/routes/treatments.routes.ts:18-135` |
| GET `/api/treatments/patient/:patientId` | MAN | patient-own or clinician active care/basis/purpose and field mask | manual bearer auth; path only | PHI | RO | partial | global / RL-READ | RAW/ENUM | `treatments.routes.ts:149-230` |

### Audit and queue operations

| Method/path | Caller/current auth | Required authorization attributes | Validation / request-response | Sensitivity | Idem | Audit | Current rate / target | Error | Evidence |
|---|---|---|---|---|---|---|---|---|---|
| GET `/api/audit` | WF | privacy/auditor or tightly scoped own facility/case metadata; purpose and export obligations | weak query/pagination; currently all logs | AUDIT/PHI | RO | N | global / RL-READ or RL-EXPORT | RAW | `backend/src/routes/audit.routes.ts:13-30` |
| GET `/api/audit/patient` | PAT | own patient, redacted actor/security fields | query limit behavior | AUDIT/PHI | RO | N | global / RL-READ | RAW | `audit.routes.ts:68-75` |
| POST `/api/audit/sync` | PUB | target internal authenticated worker only; integrity receipt; no caller event forgery | no body; drains queue | AUDIT/LEDGER | N | F | global / RL-SYNC, internal network | RAW/SIM | `audit.routes.ts:78-89` |

## 3. Legacy JavaScript API — immediate disable/replace

The sync router is mounted at `/api/sync` (`backend/api/index.js:21`), so its operations are `/api/sync/record`, `/access`, `/consent`, `/audit`, `/status` and `/force`. A separate `/api/sync/blockchain` route also exists.

| Method/path | Current caller/auth | Target authorization attributes | Validation / response | Sensitivity | Idem | Audit | Current rate / target | Error | Evidence |
|---|---|---|---|---|---|---|---|---|---|
| GET `/api/health` (declared twice) | PUB | public minimal liveness; detailed diagnostics ops-only | N; service internals | OPS | RO | N | none / RL-OPS | RAW/SIM | `backend/api/index.js:29,252-277` |
| POST `/api/extract` | PUB | governed authenticated clinical AI job, patient/care/basis/purpose, human review | unrestricted memory upload; provider JSON; no strict schema | AI/FILE/PHI | N | N | none / RL-AI + cost budget | RAW | `index.js:26-89` |
| POST `/api/ipfs/upload` | PUB | approved file pipeline, object auth, purpose, scan/encryption/retention | unrestricted upload; returns public CID/gateway | FILE/PHI | N | N | none / RL-FILE | RAW | `index.js:92-126`; `IPFSStorage.js:31-104` |
| POST `/api/blockchain/notarize` | PUB | server-internal authorized domain command; exact subject/signer/provenance | P caller patientId/CID/hash/uploader | LEDGER/PHI | N | F | none / internal RL-WRITE | RAW/SIM | `index.js:130-185` |
| POST `/api/sync/blockchain` | PUB | internal authenticated queue worker, idempotent receipt | N; drains queue | LEDGER/AUDIT | N | F | none / internal RL-SYNC | RAW/SIM | `index.js:188-249` |
| POST `/api/sync/record` | PUB | authenticated device/session; patient/resource ABAC at sync time, version/idempotency | P arbitrary record payload | PHI | N | F | none / RL-SYNC | RAW/SIM | `backend/api/routes/sync.js:17-47` |
| POST `/api/sync/access` | PUB | authenticated responder/workforce and full ABAC | P caller payload; condition bug noted | PHI/AUDIT | N | F | none / RL-SYNC | RAW/SIM | `sync.js:50-80` |
| POST `/api/sync/consent` | PUB | authenticated patient/guardian; contextual consent schema | P caller payload | CONSENT/PHI | N | F | none / RL-SYNC | RAW/SIM | `sync.js:83-112` |
| POST `/api/sync/audit` | PUB | no client-authored authoritative audit; server generates event | P caller event | AUDIT/PHI | N | F | none / internal only | RAW/SIM | `sync.js:115-140` |
| GET `/api/sync/status` | PUB | authenticated own-device status or ops aggregate | N; queue stats | OPS/AUDIT | RO | N | none / RL-OPS | RAW | `sync.js:147-162` |
| POST `/api/sync/force` | PUB | ops-only dual control or internal worker | N; force drains all queues | PHI/CONSENT/AUDIT/LEDGER | N | F | none / internal RL-ADMIN | RAW/SIM | `sync.js:165-237` |

## 4. Non-HTTP sensitive operations

| Operation | Current caller/control | Required target controls | Status/evidence |
|---|---|---|---|
| Mobile direct Gemini request | Any app holder with bundled key | Remove; server-only governed job with authenticated purpose, cost and human review | Critical gap (`src/services/aiService.ts:52-126`) |
| Mobile SecureStore offline queue | Local app code; arbitrary payload | Encrypted domain queue, device/session binding, UUID/idempotency/version and server reauthorization | High gap (`src/services/syncService.ts:55-123`) |
| Fabric `patient` transactions | Any enrolled invoker; mutators do not enforce role/object | MSP/attribute/object/purpose checks, endorsement and privacy | Critical gap (`backend/chaincode/patient/medichain_patient.go:55-353`) |
| Fabric `doctor` verification/access | Passed IDs; TODO instead of identity policy | Ministry/facility authority attributes and subject/workflow checks | Critical gap (`medichain_doctor.go:87-251`) |
| Fabric `consent` transactions | No client identity checks | Patient/guardian or authorized policy service, version/purpose/object checks | Critical gap (`medichain_consent.go:37-164`) |
| Fabric `audit` add/read/query | No client identity checks | Gateway-only append; scoped auditor reads; no direct identifiers | Critical gap (`medichain_audit.go:26-197`) |
| Startup migration/demo seed | Every primary API startup; errors swallowed | Explicit migration job; environment-gated fixtures; fail startup on migration error | High gap (`backend/src/config/migrate.ts:41-117`) |
| Fabric gateway submit | Org1 Admin; simulation/fake receipt | Least-privilege identity, exact receipt/commit status, fail closed | Critical gap (`FabricGateway.ts:60-160`) |

## 5. Required abuse-control policy

Before a route is re-enabled for pilot, its owner must document and test:

- per-account, IP, device, facility, integration-client and global limits as applicable;
- endpoint concurrency, payload size, pagination ceiling and timeouts;
- login enumeration resistance and progressive throttling;
- QR/token guessing, replay and scan anomaly controls;
- AI token/request/day budgets, maximum pages/bytes, queue capacity and kill switch;
- file type/size/count, malware/CDR status and storage quota;
- sync batch size, idempotency/replay window and dead-letter capacity;
- export row/cell limits, watermarking, asynchronous job approval and download expiry;
- admin/break-glass step-up, low rate, dual control where required, and immediate alerts;
- stable `429`/retry behavior without leaking account/resource existence.

## 6. Inventory conclusion

No sensitive mutation in the legacy API is acceptable as currently exposed. The primary API also cannot be considered protected merely because it has a JWT middleware and a global rate limit. Re-enablement requires strict schema contracts, central authorization attributes, scoped data queries, idempotency for retriable mutations, trustworthy audit events, route-specific abuse controls, safe error semantics and automated positive/negative tests.
