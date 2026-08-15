# PalmChain V2 Deny-by-Default Authorization Matrix

**Status:** target policy for approval; current code does not enforce this matrix  
**Rule:** UI visibility is never authorization. Every request is denied unless the server policy decision and scoped data access both authorize it.

## 1. Decision attributes

Every protected operation must evaluate:

| Attribute | Required source | Failure behavior |
|---|---|---|
| Authenticated subject and assurance | Server-validated session/token from approved identity system | Deny |
| Active role/credential | Authoritative workforce/patient/facility registry, not client claims alone | Deny |
| Active facility membership | Server facility assignment and status | Deny |
| Resource ownership/subject | Scoped database lookup | Deny without revealing existence |
| Care relationship/assignment | Active encounter/team/referral/order relationship | Deny |
| Patient/guardian relationship | Verified, scoped, current legal/guardianship record | Deny |
| Lawful basis/consent | Versioned, active, purpose/category/action-bound record or documented alternative basis | Deny |
| Purpose of use | Server-controlled taxonomy, compatible with role/workflow | Deny |
| Resource sensitivity | Data classification, including restricted categories | Deny or step-up |
| Time | Session, assignment, consent and emergency time windows | Deny if expired |
| Device/environment | Managed device/network/step-up rules for high-risk actions | Deny or require step-up |
| Emergency status | Authenticated break-glass case, reason, timebox, minimum dataset and review | Deny normal bypass |

The policy decision must return `allow/deny`, reason code, permitted field/category mask, obligation set (audit, notification, watermark, step-up, timebox), and policy version. Denials must not disclose whether an unrelated patient/resource exists.

## 2. Roles

| Code | Role | Scope boundary |
|---|---|---|
| PAT | Patient | Own record and approved dependants only |
| DOC | Doctor | Assigned/current clinical relationship within active facility and purpose |
| NUR | Nurse | Assigned nursing workflows and minimum necessary categories |
| LAB | Laboratory professional | Orders/specimens/results assigned to lab/facility; no unrelated chart browsing |
| PHA | Pharmacist/staff | Valid prescriptions/dispensing/inventory task; minimum necessary |
| FAD | Facility administrator | Workforce/facility operations; no routine clinical-content access |
| SYS | PalmChain system administrator | Platform operations; no routine decrypted PHI/content access |
| MOH | Ministry analyst | Approved de-identified/aggregate datasets only |
| AUD | Privacy/auditor | Purpose-bound metadata/audit review; content only under approved investigation procedure |
| EMR | Emergency responder | Authenticated, timeboxed break-glass minimum dataset |
| INT | Integration client | Registered client, mTLS/strong auth, contract and patient/facility/purpose scopes |

## 3. Permission notation

- `OWN`: own/verified dependant resource.
- `CARE`: active facility and care/task relationship plus approved basis and purpose.
- `TASK`: assigned order/dispensing/lab task only.
- `META`: metadata only; no clinical content.
- `AGG`: approved de-identified aggregate only.
- `BG`: authenticated break-glass minimum dataset with reason, timebox, notification/review.
- `CONTRACT`: registered integration scope, purpose and data contract.
- `APPROVAL`: dual-control or named approval required.
- `—`: deny.

## 4. Resource-by-action matrix

### 4.1 Patient identity and demographics

| Role | Create | Read | Update/correct | Sign | Revoke | Export/print | Share | Delete/retain |
|---|---|---|---|---|---|---|---|---|
| PAT | onboarding | OWN | OWN with verification/version | identity attestation where required | sessions/shares | OWN, step-up | granular OWN | request correction/deletion; retention law applies |
| DOC | CARE enrollment only | CARE minimum | propose CARE correction | clinical attestation, not identity | — | CARE purpose-limited | referral workflow | — |
| NUR | CARE enrollment if assigned | CARE minimum | propose CARE correction | — | — | normally — | — | — |
| LAB/PHA | — | TASK minimum identity | — | — | — | task label only | task workflow | — |
| FAD | facility registration metadata | identity/admin minimum | admin metadata only | — | disable facility account | approved admin export, no chart | approved registration | retention execution with approval |
| SYS | — | META/pseudonymous | platform metadata only | — | disable session/account by approved procedure | META with APPROVAL | — | retention job with APPROVAL |
| MOH | — | AGG | — | — | — | AGG | approved AGG | — |
| AUD | — | META; content by APPROVAL | — | audit attestation | — | approved investigation | — | verify hold/retention |
| EMR | — | BG minimum identity | — | — | — | — | handoff in emergency workflow | — |
| INT | CONTRACT create | CONTRACT | CONTRACT correction | CONTRACT | CONTRACT | CONTRACT | CONTRACT | contract/legal policy |

### 4.2 Clinical records: notes, diagnoses, allergies, medications, labs, imaging, referrals

| Role | Create | Read | Update/correct | Sign | Revoke | Export/print | Share | Delete/retain |
|---|---|---|---|---|---|---|---|---|
| PAT | patient-submitted section only | OWN | annotate/request correction | acknowledge, not clinician-sign | revoke consent/share | OWN with warnings/step-up | granular/timeboxed | request; clinical retention applies |
| DOC | CARE | CARE by category/purpose | CARE new version; never overwrite signed | CARE credential + step-up | revoke draft/order if authorized | CARE + watermark/audit | referral/consult with basis | no hard delete; correction/retention workflow |
| NUR | CARE nursing scope | CARE nursing/minimum | CARE nursing version | credentialed nursing sign | own draft | limited CARE | handoff/team | no hard delete |
| LAB | TASK result | TASK order/context/results | TASK correction/version | credentialed result sign | cancel/revoke per lab workflow | TASK | ordering team | retain per policy |
| PHA | TASK dispense record | TASK prescription/allergy minimum | TASK correction/version | credentialed dispense sign | reverse per policy | TASK label/summary | prescribing team | retain per policy |
| FAD | — | — (except approved exceptional investigation) | — | — | — | — | — | retention execution without content access |
| SYS | — | — | — | — | — | — | — | encrypted retention job with dual control |
| MOH | — | AGG only | — | — | — | AGG | approved AGG | aggregate retention policy |
| AUD | — | META; content only APPROVAL | — | investigation attestation | — | approved, redacted | approved investigation | verify legal hold/retention |
| EMR | emergency observations only | BG emergency dataset | append emergency event | responder sign | — | — | emergency handoff | retain per clinical policy |
| INT | CONTRACT/order workflow | CONTRACT | CONTRACT version/correction | CONTRACT signer | CONTRACT | CONTRACT | CONTRACT | contract/legal policy |

### 4.3 Consent, lawful basis, access requests and guardian authority

| Role | Create | Read | Update/correct | Sign | Revoke | Export/print | Share | Delete/retain |
|---|---|---|---|---|---|---|---|---|
| PAT | OWN grant/deny; guardian if verified | OWN | replace with new version | OWN informed confirmation | OWN immediate future-effect | receipt | receipt/verification | retain evidence; no rewrite |
| DOC/NUR/LAB/PHA | request scoped access | own requests + applicable decision | narrow pending request | attest purpose | withdraw request | own receipt | — | retain evidence |
| FAD | facility policy metadata, not patient consent | facility request metadata | admin correction | policy approval | revoke facility membership, not patient choice | approved metadata | — | retain evidence |
| SYS | — | META | — | — | emergency containment only with APPROVAL | META | — | retain evidence |
| MOH | — | AGG | — | — | — | AGG | — | aggregate retention |
| AUD | — | all consent/audit metadata; scoped content if approved | — | audit finding | — | approved evidence | — | verify retention/hold |
| EMR | create BG request/reason | own BG case | append reason/outcome | responder sign | end BG session | — | review queue | retain evidence |
| INT | CONTRACT request | CONTRACT | CONTRACT correction | client assertion | CONTRACT revoke | CONTRACT receipt | CONTRACT | retain evidence |

### 4.4 Emergency profile and QR/NFC capability token

| Role | Create | Read | Update/correct | Sign | Revoke | Export/print | Share | Delete/retain |
|---|---|---|---|---|---|---|---|---|
| PAT | OWN token/profile | OWN | OWN profile | confirm dataset | OWN immediate | token with warning | timeboxed capability | revoke token; profile retention policy |
| DOC/NUR | CARE profile suggestion | CARE or BG minimum | CARE version | clinical sign | — | normally — | emergency handoff | — |
| LAB/PHA/FAD/SYS/MOH | — | — except SYS metadata | — | — | SYS containment APPROVAL | — | — | metadata retention only |
| AUD | — | token/access META; approved incident content | — | review attestation | recommend revoke | evidence | — | verify retention |
| EMR | — | BG only after strong auth/reason | append emergency event, not silently edit patient profile | responder sign | end own session | no bulk/export | emergency handoff | — |
| INT | CONTRACT issue/read only if explicitly approved | CONTRACT minimum | CONTRACT | CONTRACT | CONTRACT | — | CONTRACT | policy |

### 4.5 Audit events and security logs

| Role | Create | Read | Correct | Sign | Revoke | Export/print | Share | Delete/retain |
|---|---|---|---|---|---|---|---|---|
| PAT | system-generated only | OWN access history, redacted | append dispute | — | — | OWN receipt | privacy authority | no delete; retention policy |
| DOC/NUR/LAB/PHA | system-generated only | own activity and assigned case minimum | append explanation | event attestation where required | — | own approved | supervisor/privacy | no delete |
| FAD | system-generated/admin event | facility META only | append investigation note | admin attestation | — | approved facility report | AUD | retention policy |
| SYS | system-generated | platform META; break-glass content APPROVAL | append operational note | system integrity proof | — | dual-control export | AUD/security | lifecycle job; legal hold honored |
| MOH | — | AGG | — | — | — | AGG | approved AGG | aggregate policy |
| AUD | investigation event | scoped cross-facility audit metadata | append finding; never alter original | audit attestation | — | approved signed export | regulator/leadership under policy | verify hold/retention |
| EMR | BG events are automatic | own BG case | append reason/outcome | responder attestation | — | — | reviewer | no delete |
| INT | system-generated | CONTRACT delivery logs | append reconciliation | client/server receipt | — | CONTRACT | CONTRACT | policy |

### 4.6 Users, roles, facilities, keys, policy and system configuration

| Role | Create | Read | Update/correct | Sign/approve | Revoke | Export/print/share | Delete/retain |
|---|---|---|---|---|---|---|---|
| PAT/DOC/NUR/LAB/PHA | — | own account/facility metadata | own non-privileged profile | — | own sessions | own account receipt | account closure request |
| FAD | facility users within delegated scope | facility workforce metadata | facility assignment, no self-elevation | dual approval for privileged roles | facility account/membership | approved roster, redacted | retain identity/audit evidence |
| SYS | platform/facility bootstrap under approval | platform config/META | config via change control | dual control for privileged/security changes | sessions/keys/accounts under incident process | signed config evidence | controlled lifecycle, no audit deletion |
| MOH | approved facility registry entry where mandated | national facility/provider metadata | approved registry changes | authority approval | registry status | approved public/aggregate | retention policy |
| AUD | — | config/change/identity audit META | append finding | audit attestation | recommend containment | approved evidence | verify retention |
| INT | registered client under approval | own client metadata | rotate own metadata/key through managed workflow | client/admin approval | own credential/admin containment | own contract metadata | retain registration/audit |
| EMR | — | own account metadata | own profile | — | own session | — | policy |

### 4.7 Ministry analytics and reports

| Role | Create | Read | Correct | Approve | Export/print | Share | Delete/retain |
|---|---|---|---|---|---|---|---|
| PAT/workforce | source events through normal workflows | own/facility dashboards only as authorized | correct source via clinical workflow | — | minimum scoped | — | source policy |
| FAD | facility aggregate job | own facility AGG with small-cell protection | source correction request | approve facility submission | approved AGG | Ministry contract | policy |
| SYS | pipeline operation, no analytic purpose | pipeline META | job config under change control | dual control | no content export | — | pipeline retention |
| MOH | approved query/report | AGG/de-identified only | annotate/re-run, never alter source | report approval | approved AGG | approved recipients | approved retention |
| AUD | review query/disclosure | query/disclosure META | append finding | audit attestation | approved evidence | regulator | policy |
| INT | CONTRACT aggregate submission | CONTRACT status/result | CONTRACT correction | CONTRACT | CONTRACT | CONTRACT | contract policy |
| EMR | — | — | — | — | — | — | — |

### 4.8 Files, AI jobs and FHIR/integration exchanges

| Role | Create | Read | Update/correct | Sign/approve | Revoke/cancel | Export/share | Delete/retain |
|---|---|---|---|---|---|---|---|
| PAT | OWN upload if approved | OWN | replace/version metadata | confirm intended use | cancel pending/revoke future AI consent | own file/result with warnings | legal/clinical retention |
| DOC/NUR/LAB | CARE/TASK upload or order | CARE/TASK | version/correct metadata | clinician confirms AI output before record use | cancel pending | referral/order workflow | retention policy |
| PHA | TASK only where required | TASK | task metadata | credentialed task sign | cancel | task workflow | policy |
| FAD/SYS | no routine content; operate metadata/pipeline | META only | config metadata | dual-control operational approval | incident containment | no content | lifecycle job with policy |
| MOH | approved aggregate import/export only | AGG | correction workflow | report approval | cancel job | approved AGG | policy |
| AUD | job/exchange META; content by APPROVAL | scoped | append finding | attestation | recommend containment | approved evidence | verify retention/deletion |
| EMR | no AI; emergency exchange only if approved | BG minimum | append emergency event | responder sign | cancel own exchange | emergency handoff | clinical policy |
| INT | CONTRACT FHIR/file operation | CONTRACT | CONTRACT version/correction | signed request/receipt | CONTRACT revoke | CONTRACT | contract/legal policy |

## 5. Required enforcement points

| Layer | Enforcement responsibility | Current evidence/gap |
|---|---|---|
| Edge/API gateway | TLS, route allowlist, authenticated client, request size/type, distributed rate/cost limits | Legacy gateway has wildcard CORS/no auth; primary API has global IP-only limiter (`backend/api/index.js:17-27`; `backend/src/index.ts:27-50`) |
| Session middleware | Signature/issuer/audience/expiry, token/session revocation, active account/role/facility, assurance | Current middleware trusts JWT claims (`backend/src/middleware/auth.middleware.ts:14-33`) |
| Policy enforcement point | Normalize action/resource/context; call central policy; enforce field mask/obligations | Absent; route-local checks |
| Service/repository | Query only authorized objects; transactionally re-check mutable attributes | Record and audit routes lack object/facility scope (`records.routes.ts:15-94`; `audit.routes.ts:13-30`) |
| PostgreSQL | Tenant/facility/owner defense-in-depth, constraints, transactions, versioning | No observed RLS/policy in `backend/db/schema.sql` |
| File/object store | Per-object authorization, envelope encryption, signed short-lived access, malware state | Raw IPFS path lacks these controls (`backend/api/services/IPFSStorage.js:31-104`) |
| Offline sync | Authenticate device/session, reauthorize every operation, idempotency/version/conflict | Absent (`src/services/syncService.ts:55-123`) |
| Integration/FHIR | mTLS/client auth, scopes, contract/purpose/patient context, schema/terminology validation | Absent/unknown |
| Fabric gateway | Least-privilege organization identity and transaction policy | Org1 Admin identity (`backend/src/services/FabricGateway.ts:60-84`) |
| Chaincode | Caller MSP/attributes, object ownership/workflow, endorsement and private-data policy | Mostly absent (`backend/chaincode/**/*.go`) |
| Audit | Record allow/deny, actor, purpose, policy, obligations and outcome without excessive PHI | Current events/queries are forgeable and over-broad |

## 6. Mandatory positive and negative tests

Every resource/action needs at least one positive and the following applicable negative cases:

1. unauthenticated, expired, revoked and malformed session;
2. correct role but inactive credential or facility membership;
3. wrong role, wrong facility and no care/task relationship;
4. correct object ID but wrong patient/guardian/owner;
5. absent, denied, revoked, expired or category-incompatible consent/lawful basis;
6. wrong purpose, restricted sensitivity, unsafe device/environment or expired time window;
7. changed permission between queueing and offline synchronization;
8. guessed/sequential/different valid object ID (BOLA);
9. client-tampered role, facility, purpose, patient ID and field/category mask;
10. emergency access without responder identity, reason, timebox, review or minimum dataset;
11. bulk/export/print/share attempts outside approved scope, including small-cell analytics;
12. retries/duplicates/stale versions/partial transaction failure;
13. direct chaincode invocation from wrong MSP/attribute and for another subject;
14. audit query/export by unrelated facility and audit-event forgery attempt;
15. disabled dependency must fail closed, never switch to simulated authorization or persistence.

Tests must assert HTTP/result status, response minimization, absence of side effects, database/ledger state, audit event, notification/obligation, and stable non-enumerating error behavior.

## 7. Current-state conclusion

The current role checks are not an implementation of this matrix. `requireDoctor` collapses doctor, nurse, admin and staff into one trust level, client portals derive permissions locally, consent grants can be role/clinic-wide, and data queries are not consistently scoped. Implementation must begin with the identity/attribute model and server/data enforcement points; copying this matrix into UI menus would not close any finding.
