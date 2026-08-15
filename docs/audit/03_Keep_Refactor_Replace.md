# PalmChain V2 Keep / Refactor / Replace Report

**Decision context:** architecture disposition after Phase 0 inspection. “Keep” means the concept or bounded implementation is a viable base, not that it is production-approved. All dispositions remain behind the Phase 0 release gate.

## 1. Disposition summary

| Subsystem / concept | Decision | Why and evidence | Target state | Dependencies / migration risk |
|---|---|---|---|---|
| Patient-owned access and consent concept | **Keep** | Aligns with product purpose; current broad consent implementation is unsafe (`backend/src/routes/consent.routes.ts:18-98`) | Versioned, granular, purpose/category/action-bound consent plus other lawful bases; accessible receipts and immediate future-effect revocation | Local legal/clinical rules; migration of broad grants is high-risk |
| Emergency minimum-data concept | **Keep** | Valuable low-connectivity use case; current anonymous permanent token over-discloses (`QRService.ts:64-86,139-173`) | Authenticated responder break-glass, minimum dataset, timebox, reason, review and patient notice; limited offline card only if approved | Emergency policy and threat model; revoke existing tokens |
| QR as transport/capability mechanism | **Refactor** | Generation/revocation structure exists (`qr.routes.ts:17-91`), but ttl=0 and permanent emergency token are unsafe | Opaque, short-lived, audience/purpose-bound, revocable, non-PHI token; one-time where possible; server reauthorization | Token migration, printed artifacts, clock/offline behavior |
| NFC concept | **Refactor** | Blueprint use case is plausible; no verified implementation | Store only same safe opaque capability as QR; no PHI in tag; anti-cloning/replay and loss workflow | Device/platform research and emergency policy |
| Express TypeScript primary API | **Refactor** | Coherent routes/services and backend typecheck passes; authorization/error/degradation are unsafe | Single supported API/BFF with strict schemas, central ABAC, scoped repositories, idempotency, structured errors/audit | Incremental strangler plan; preserve route compatibility only where safe |
| Legacy JavaScript API gateway | **Replace** | Unauthenticated AI/IPFS/notarize/sync surface (`backend/api/index.js:17-249`; `routes/sync.js:17-237`) | Remove; migrate only approved functions to typed primary API and isolated workers | Immediate disable; clients/offline queue may depend on endpoints |
| Authentication | **Replace** | Hard-coded patient password, dev secret fallback, fake offline auth, no MFA/revocation (`auth.routes.ts:95-147`; `TokenService.ts:13-47`; `authService.ts:64-155`) | Managed identity/session architecture, workforce MFA, patient onboarding/recovery, active role/facility checks, short sessions and revocation | IdP selection, migration and support workflow; account-linking risk |
| Portal client auth/permissions | **Replace** | sessionStorage user/JWT trusted; missing role defaults to doctor (`doctor-web/services/auth.ts:62-132`; `hooks/usePermission.ts:59-62`) | Server-derived session and permissions; UI consumes capabilities only for presentation; no sensitive token in script-readable storage where avoidable | Cross-portal session/BFF design |
| Five duplicated Next portals | **Refactor** | Broad route/UI work exists, but auth/API/permissions/mocks are duplicated and drift-prone | One workforce web application or monorepo packages with role-specific navigation and shared verified services/design system | UX migration and role separation; preserve user workflows, not duplicated code |
| Portal UI primitives/design tokens | **Keep** | Reusable component primitives include focus/ARIA patterns | Consolidated accessible design system with tested state components | Visual regression and WCAG verification |
| Portal mock datasets and fabricated verification | **Replace** | Production pages import mocks and API adapters invent verified/block values (`doctor-web/services/backendApi.ts:172-189,228-236`) | Explicit Storybook/demo fixtures isolated from runtime; typed real API results with provenance states | Page-by-page migration; prevent accidental demo bundle |
| Expo/React Native shell and navigation | **Refactor** | Twenty patient screens provide workflow/design base | Retain navigation/UI where usability-tested; replace trust, storage, auth, AI, crypto and sync services | Mobile migration and device testing |
| PostgreSQL | **Keep** | Appropriate authoritative transactional store; useful schema exists (`backend/db/schema.sql:5-166`) | Versioned migrations, tenant/facility/ownership model, RLS defense-in-depth, encrypted backups, PITR, constrained enums/FKs, data lifecycle | Schema migration, synthetic-data reset, backup/restore plan |
| Duplicated database schemas / automatic startup seeding | **Replace** | Two schemas and startup demo seed with known password; errors swallowed (`backend/src/config/migrate.ts:41-117`) | One migration toolchain; explicit environment-gated synthetic fixtures; migration failures stop startup | Existing dev data; clean baseline and rollback |
| In-memory database fallback | **Replace** | Missing/lost DB silently simulates (`backend/src/config/db.ts:530-579`) | Fail closed for sensitive operations; explicit health/readiness states; separate demo adapter at build/deploy boundary | Demo workflows need intentional fixture service |
| Consent service implementation | **Replace** | Decision checks omit care, purpose, status, sensitivity, environment and emergency (`ConsentService.ts:154-213`) | Policy decision service using approved matrix; consent is one input, not authorization itself | Identity/facility/care model and local lawful bases |
| Access-request workflow concept | **Refactor** | Patient approval/request history is a useful pattern; defaults are broad and updates non-transactional (`AccessRequestService.ts:67-124`) | Narrow requested categories/actions/purpose/time; transactional decision; notifications and audit; no silent all-data default | Consent/policy/event infrastructure |
| Audit concept | **Keep** | Access transparency and immutable evidence are core requirements | Server-generated append-only event store, scoped views, integrity proofs, SIEM/alerts, patient access history and privacy review | Event taxonomy, retention, pseudonymization |
| Current audit implementation/ledger payload | **Replace** | Unauthenticated sync, unscoped list, client-forgeable chaincode and raw identifiers (`audit.routes.ts:13-89`; `medichain_audit.go:26-197`) | Off-chain detailed audit; optionally anchor periodic batch Merkle roots/hashes with no patient/actor identifier | Migration/forensic handling of old events |
| Hyperledger Fabric concept | **Refactor** | Permissioned ledger may support multi-party integrity if governance justifies it; current design creates false assurance | Limit to cross-organization proofs/status where a relational signed audit is insufficient; multi-org governance, TLS, HSM/managed PKI, least privilege | Ministry/facility governance, cost/ops skills, privacy assessment; be willing to remove |
| Current Fabric network and generated crypto | **Replace** | Single Org1, TLS off, tracked keys (`medichain-network/configtx.yaml:18-34`; `docker-compose.yml:15-16,40,62`) | Reproducible dev network with disposable keys outside Git; separately governed pilot network and enrollment | Credential incident response; all old identities untrusted |
| Current chaincode | **Replace** | Caller authorization largely absent; passed IDs trusted; linkable identifiers stored (`backend/chaincode/**/*.go`) | Minimal contracts with identity/attribute/object checks, approved endorsement and private-data/off-chain design; full negative tests | Transaction redesign; existing ledger state migration |
| Fabric gateway | **Replace** | Admin identity and fabricated hash/fallback semantics (`FabricGateway.ts:60-84,123-160`) | Least-privilege service identity, commit-status listener/receipt, exact transaction ID, circuit breaker that fails closed | Network/PKI and transaction API |
| Mobile cryptographic key/signature service | **Replace** | Placeholder HMAC/hash, non-empty verification, fake recovery (`cryptoKeyService.ts:141-162,223-318`) | Platform-backed keys where appropriate, server challenge, managed recovery, threat-modeled signature meaning | Clinical/legal signature requirements; device replacement |
| “Blockchain verified” user-facing badge | **Refactor** | Useful provenance communication only if truthful; currently fabricated | Explicit states: local draft, server accepted, committed, independently verified, failed; show what is and is not proven | Provenance API and UX research |
| Mobile SQLite offline store | **Refactor** | Offline capability is important for Sierra Leone context; store currently contains unencrypted PHI (`database.ts:15-119`) | Minimized encrypted database, hardware-backed key, backup exclusion, session wipe and per-record sync metadata | Device policy, library selection, migration |
| Current mobile/server offline queue | **Replace** | Arbitrary JSON, weak IDs, unauth sync, no conflicts/reauthorization (`syncService.ts:55-123`; `OfflineQueue.ts:22-31`) | Domain operation log with UUID/idempotency, base version, dependency order, server reauthorization, conflict UI and audit | ABAC, resource versioning, event contracts |
| Medical file upload concept | **Refactor** | Clinical documents are needed; raw public IPFS is unsuitable | Authenticated direct-to-managed-object-store upload, allowlist/size, malware/CDR, envelope encryption, short URLs, retention/deletion | Storage region, KMS, DPA, scanning service |
| IPFS/Web3 storage of raw PHI | **Replace** | Public/distributed persistence and deletion uncertainty (`IPFSStorage.js:31-104`) | Managed encrypted object storage; if content addressing is needed, store hash separately and never public raw PHI | Existing CIDs may be undeletable; incident/privacy response |
| AI-assisted document extraction concept | **Refactor** | Could reduce data entry after narrow clinical validation; current flow is uncontrolled | Server-only job, explicit consent/purpose, minimization, structured schema, abstention, clinician confirmation, evaluation/monitoring and kill switch | Legal/processor/clinical safety approval; no rollout in early containment |
| Current direct Gemini mobile integration | **Replace** | Public key and direct medical image upload (`app.config.js:46-51`; `aiService.ts:52-126`) | No provider key or sensitive request in client; governed server worker | Key rotation and mobile release invalidation |
| Simulated AI clinical response | **Replace** | Plausible fake conclusions (`aiService.ts:146-201`) | Explicit non-clinical fixtures isolated to demo/test | Remove any path into records |
| FHIR concept | **Keep** | Correct interoperability direction | Versioned FHIR façade/adapters, local profiles, terminology, provenance, consent/security labels, conformance testing | Ministry/Health Information Hub and facility interface decisions |
| Current FHIR implementation | **Replace** | No verified server FHIR capability; local fields/types are not interoperability | Implement from approved use cases and profiles, not generic JSON labels | MPI, identifiers, terminology and data mapping |
| Ministry analytics concept | **Refactor** | Public-health analytics is valuable; current portals/mocks imply broad access | Separate de-identified aggregate pipeline, disclosure control/small-cell suppression, data-quality and approval workflow | Ministry data-sharing agreement and metrics definitions |
| Observability | **Replace** | Console logs/raw errors and no demonstrated alerts (`index.ts:86-89`; service logs) | Structured redacted logs, metrics/traces, security/audit alerts, correlation, retention and runbooks | Hosting/SIEM choice and privacy logging standard |
| Health/readiness endpoints | **Refactor** | Basic probes exist | Separate liveness/readiness; minimal public response; authenticated diagnostic detail; dependency state never equals clinical success | Deployment/orchestrator design |
| Rate limiting and abuse protection | **Replace** | Only global IP limit in primary API; none on costly legacy routes (`index.ts:40-50`) | Per-route and per-identity/device/facility distributed quotas, login defenses, AI/storage budgets and anomaly response | Redis/equivalent, WAF, product limits |
| Error handling | **Refactor** | Central Express structure can support it; many handlers return raw messages | Typed public error catalog, non-enumerating auth/object response, correlation ID, redacted server diagnostics | API contract and observability |
| Tests | **Replace** | No test files found | Layered unit/contract/integration/negative authorization/offline/chaincode/accessibility/e2e/security tests with fixtures only | Test environments and seed strategy |
| CI/CD | **Replace** | No CI config found | Protected checks, clean install/build/type/lint/test, SAST/secret/dependency/IaC/container/SBOM, signed artifacts, approval and rollback | Repository/hosting administration |
| Documentation | **Refactor** | Extensive useful design history but contradicted readiness claims | Evidence-linked living architecture, ADRs, API/data dictionaries, threat model, runbooks and truthful release status | Documentation ownership and release checklist |
| Existing production-readiness/completion reports | **Replace** | Claims conflict with inspected controls and tests | Archive as historical prototype notes; generate release attestations from verified gates | Stakeholder communication |

## 2. Recommended target architecture

```text
Mobile / Workforce Web
        |
   TLS + WAF/API edge
        |
 Server session + Policy Enforcement Point
        |---------- Policy Decision Service
        |             (identity, facility, care, basis, purpose,
        |              sensitivity, time/device, emergency)
        |
 Typed domain services / scoped repositories
   |          |             |              |
PostgreSQL  Audit store  Encrypted files  FHIR/integration workers
   |          |             |              |
backup/PITR integrity root  KMS/scanner    Ministry/facility contracts
              |
     optional minimal Fabric anchor
     (hash/status only; no PHI/identifiers)
```

AI is an asynchronous, server-only, policy-controlled worker behind the file pipeline. Offline sync submits signed/authenticated domain operations to the same policy enforcement point; it never bypasses authorization or writes directly to Fabric.

## 3. Migration rules

1. Do not migrate prototype “verified”, “signed”, “anchored” or “synced” flags as truth. Re-verify source evidence or mark legacy/unverified.
2. Revoke/rotate old tokens, AI keys and Fabric identities; do not reuse committed key material.
3. Treat existing public IPFS CIDs as a privacy incident inventory, not as the target file index.
4. Reset or explicitly map synthetic demo data; never silently merge it into pilot data.
5. Convert broad consent to deny-by-default pending renewed, informed and legally approved basis.
6. Preserve audit evidence, but segregate events that could have been client-forged or simulated.
7. Use strangler migration at the API boundary: disable unsafe routes first, then add approved typed operations.
8. Maintain rollback that restores the last safe disabled/read-only posture; rollback must never re-enable anonymous or simulated paths.

## 4. Decision

PalmChain should not be discarded wholesale. Its patient-centered concept, screen/workflow exploration, PostgreSQL choice, TypeScript API structure and reusable UI primitives are useful foundations. The trust-producing implementations—identity, authorization, consent decisioning, emergency access, AI/files, offline protocol, cryptography, Fabric gateway/chaincode/network, audit assurance and release evidence—must be replaced or deeply refactored before real-data use.
