# PalmChain V2 Master Blueprint and Codex Execution Guide

**Status:** Audit-first working specification  
**Version:** 2.0  
**Prepared:** 14 July 2026  
**Product name:** PalmChain V2  
**Current repository name:** MediChain SL / Medichain App  
**Primary jurisdiction:** Sierra Leone  
**Risk classification:** High-risk health, identity, government and AI system  

> **Controlling instruction:** Codex must read the two supplied audit documents first. It may inspect the repository and create audit documentation, but it must not modify application code, configuration, dependencies, schemas, infrastructure or generated assets until the audit pack in Phase 0 has been delivered, reviewed and explicitly approved.

## Document purpose

This document is the single implementation compass for turning the current MediChain SL repository into PalmChain V2. It consolidates the recovered ChatGPT discussion titled **“Model comparison for blockchain,”** the supplied security and UX audit requirements, evidence from the current repository, and the applicable national and international direction.

It is intentionally more than a feature list. It defines the desired health outcomes, product boundaries, user journeys, trust model, target architecture, data placement, authorization rules, security and AI governance, phased delivery plan, evidence gates and instructions for Codex.

This is not a claim that the application is production-ready. Repository observations in this document are preliminary orientation findings, not a substitute for the formal Phase 0 audit.

## Source hierarchy and conflict rule

Codex shall use this order when instructions conflict:

1. Applicable law, Ministry of Health direction, patient safety and explicit security stop-ship rules.
2. `AI_App_Security_UX_Audit_Standard.md`.
3. `AI_App_Audit_Master_Prompt.txt`.
4. This blueprint and its approved change decisions.
5. Approved phase acceptance criteria and architecture decision records.
6. Existing repository documentation.
7. Existing implementation behavior.

Existing claims such as “production-ready,” “complete” or percentage-complete are not evidence. Tests, deployed configuration, traceable controls and verified behavior are evidence.

## Recovered product decisions

The ChatGPT conversation was found and reviewed on 14 July 2026. The following decisions are carried forward:

- PalmChain is a healthcare-transformation platform, not a blockchain demonstration.
- The mission is to ensure timely, secure and informed care for every patient.
- Build around end-to-end healthcare journeys, not isolated features.
- Use one platform, one source of truth and shared services, with role-specific experiences.
- Patients primarily use a simple mobile experience. Doctors, nurses, laboratories, pharmacies, facility teams and Ministry users primarily use web experiences suited to their work.
- The platform must not assume that every patient owns a smartphone. A Health ID card, QR/NFC token, assisted registration and authorized facility workflows must cover non-smartphone users.
- Start with secure identity, an emergency profile, core longitudinal records, patient consent and a usable clinician workflow; prove outcomes with a pilot facility before national expansion.
- Emergency access must disclose the minimum necessary information. Full access requires authenticated clinical access or a controlled break-glass flow.
- Patients need transparent access history and practical consent profiles, not confusing micro-permission screens.
- Offline resilience is a core requirement for low-connectivity facilities.
- AI assists with documentation, summarization and intelligence; it does not replace clinical or public-health judgment.
- Hyperledger Fabric may provide consortium governance and integrity evidence, while clinical content remains off-chain.
- National value is described in health outcomes, trust, interoperability and adoption—not in “taking over” through AI or blockchain.

## 1. Vision, mission and product principles

### 1.1 Vision

A trusted, nationally interoperable digital health platform that helps patients and authorized care teams obtain the right health information at the right time, including in emergencies and low-connectivity settings, while preserving privacy, clinical accountability and public trust.

### 1.2 Mission

Ensure timely, secure and informed care for every patient by connecting consented health information across the care journey and reducing administrative work for health professionals.

### 1.3 Measurable outcomes

PalmChain must be measured by outcomes rather than feature count:

- reduce time to obtain a usable emergency summary;
- reduce duplicate registration, tests and record searching;
- improve completeness and timeliness of clinical documentation;
- give patients understandable access and consent visibility;
- support safe work during connectivity outages;
- improve referral continuity across facilities;
- provide Ministry users with timely, lawful, de-identified or aggregated indicators;
- demonstrate that every sensitive read, write, export and emergency override is attributable and reviewable;
- achieve adoption without adding unsafe burdens to clinicians.

Baselines and targets must be agreed with pilot facilities during discovery. No percentage improvement may be advertised without a defined measurement method and verified baseline.

### 1.4 Design principles

1. **Safety before speed.** A delayed feature is preferable to an unsafe clinical workflow.
2. **Minimum necessary access.** Identity, authorization and purpose are evaluated on every request.
3. **Off-chain clinical truth.** Clinical data belongs in an encrypted, governed clinical repository; blockchain contains only minimized integrity and governance evidence.
4. **One platform, role-fit channels.** Reuse services and design language while respecting different user contexts.
5. **Offline is a state, not an exception.** Every critical workflow defines offline, queued, conflict and recovery behavior.
6. **Human authority over AI.** AI output is a draft or signal until an accountable human verifies it.
7. **Interoperate through standards.** Use FHIR R4 as the baseline exchange model unless the Ministry approves another version or national profile.
8. **Deny by default.** Missing policy, identity, facility, relationship, consent or purpose yields denial—not a permissive fallback.
9. **Evidence over claims.** Release decisions are tied to tests, traceability and verified controls.
10. **Accessible and locally usable.** Design for WCAG 2.2 AA, low bandwidth, shared devices, health-literacy variation and local language needs.

### 1.5 Non-goals for initial releases

- autonomous diagnosis, prescribing or treatment decisions;
- a public cryptocurrency, token sale or public-chain storage of health data;
- replacing the Ministry’s Health Information Hub, DHIS2 or approved national systems;
- placing raw FHIR resources, names, phone numbers, national identifiers, medical documents or stable patient identifiers on a ledger;
- claiming a single application can replace all facility systems without discovery, migration and governance;
- national deployment before a measured, independently reviewed pilot.

## 2. Sierra Leone alignment and legal readiness

### 2.1 National digital-health direction

PalmChain should integrate with national direction instead of creating a parallel silo. The Ministry’s Digital Health Coordination Unit within DPPI leads digital-health coordination and the 2024–2026 Digital Health Roadmap. Relevant roadmap themes include governance, integration and scale, enterprise architecture, standards and interoperability, policy development, workforce and infrastructure.

The Health Information Hub launched in January 2026 as a centralized platform integrating DHIS2 and other systems for planning and analytics. PalmChain should supply only approved indicators or exchange payloads through a Ministry-approved interface; it should not duplicate the Hub’s national analytics mandate.

The Ministry has also pursued phased EMR implementation and previously piloted an EMR at Connaught Hospital. PalmChain’s positioning should therefore be an interoperable care and trust platform that can complement or extend approved EMR direction, subject to Ministry architecture review.

### 2.2 Legal verification gate

Sierra Leone’s Cabinet approved the country’s first National Data Protection Policy in April 2026 and authorized development of future legislation. As of this document’s verification date, authoritative evidence of final comprehensive enactment and commencement was not confirmed. This is an evidence status, not a legal opinion.

Before any production patient-data processing, PalmChain must obtain written local legal and Ministry review covering at least:

- lawful bases and special-category health-data rules;
- controller, joint-controller and processor roles;
- consent versus clinical/public-interest bases;
- patient notice, access, correction, objection and deletion/retention rights;
- minors, guardians and capacity;
- emergency processing;
- cross-border hosting and AI-provider transfers;
- breach notification and regulator/Ministry escalation;
- data residency, records retention and health-sector requirements;
- research, surveillance and secondary use;
- biometric, national identifier and NFC/QR usage;
- contractual and insurance requirements.

**Production legal gate:** no production PHI, no live AI processing of patient data, and no national integration until the legal register, data-protection impact assessment, data-processing agreements and Ministry approvals are signed.

## 3. Current-state orientation

### 3.1 Repository shape

The repository currently contains:

- an Expo/React Native patient application;
- an Express/TypeScript backend using PostgreSQL with simulation fallbacks;
- five Next.js portals for admin, doctor, government, nurse and staff roles;
- Go chaincodes for patient, doctor, consent and audit functions;
- a single-organization Hyperledger Fabric development network;
- multiple product, audit and completion documents that disagree about readiness.

### 3.2 Preliminary high-risk signals

The formal audit must confirm every item, but the following evidence is sufficient to require an audit freeze:

| Area | Preliminary evidence | Risk implication | Phase 0 disposition |
|---|---|---|---|
| Secrets | `.env.example` contains a credential-like value; Fabric private key material appears tracked | Credential compromise and history exposure | Do not print values; verify validity; rotate/revoke; remove safely; inspect history |
| Client AI | `app.config.js:48` exposes a Gemini key through Expo configuration; `src/services/aiService.ts:53-55,103` calls the model from the client | Secret disclosure, uncontrolled PHI transfer, abuse and cost exposure | Stop-ship until server mediation and provider controls exist |
| Authentication | `backend/src/routes/auth.routes.ts:106,121`, `src/services/authService.ts:35` and portal auth code contain demo-password or fake-token behavior | Account compromise and false assurance | Replace; do not patch around demo authentication |
| Browser tokens | `doctor-web/services/auth.ts:82-86` uses `sessionStorage` for the JWT | Theft through injected script and weak session control | Redesign with approved identity and session pattern |
| CORS/errors | `backend/src/index.ts:29` permits credentialed origins through an always-true callback; routes expose raw error detail | Cross-origin and information-disclosure risk | Restrict by environment; sanitize errors; test |
| Authorization | The current code does not demonstrate centralized object-, facility-, care-relationship-, consent- and purpose-level enforcement | Broken object-level authorization | Build policy matrix and deny-by-default enforcement before features |
| Audit route | `backend/src/routes/audit.routes.ts:83` exposes a sync route without clear authentication | Audit forgery, data leakage or corruption | Verify and gate |
| Simulation | `backend/src/config/db.ts:551,554,571` and `backend/src/services/FabricGateway.ts:101` fall back to simulated behavior | Fail-open operation and misleading success | Remove silent fallback from pilot/production; surface degraded state |
| Cryptography | `src/services/cryptoKeyService.ts:142,161` contains placeholder verification; `src/services/index.ts:154` returns a fake recovered key | No trustworthy signature/recovery property | Replace with reviewed platform/key-management design |
| Fabric | `medichain-network/docker-compose.yml:16,40,62` disables TLS; the network is `Org1MSP` only and uses development credentials | Not a production consortium or secure transport | Treat as local prototype; redesign governance and deployment |
| Chaincode privacy | Stable identifiers, hashes and audit details appear on shared world state despite “no PII” comments | Metadata correlation and privacy leakage | Minimize/pseudonymize; private data collections where justified |
| Test evidence | No repository-wide CI and no meaningful automated test suite were found during orientation | Release claims are unverifiable | Build traceable security, unit, integration, contract and UX tests |

### 3.3 Documentation conflicts

Some repository documents describe blockchain and production readiness as complete, while other audit documents identify stubs, placeholders and incomplete UX/accessibility. Phase 0 must build a capability evidence register with only four allowed states:

- **Verified:** demonstrated by inspected code, configuration and passing test or deployed evidence.
- **Implemented, unverified:** code exists but the required behavior has not been verified.
- **Simulated/prototype:** behavior is mocked, hard-coded, development-only or fail-open.
- **Absent/unknown:** evidence was not found or inspection was not possible.

## 4. Keep, refactor or replace baseline

These are planning decisions subject to Phase 0 confirmation.

### 4.1 Keep

- patient-controlled consent as a product principle;
- scoped, expiring QR access as a concept;
- a minimum emergency profile;
- patient access-history visibility;
- offline-first intent and local facility workflows;
- PostgreSQL or an equivalent governed off-chain clinical store;
- FHIR R4 as the initial interoperability baseline;
- permissioned Fabric as an optional integrity/governance component when real multi-organization governance exists;
- Expo/React Native, TypeScript, Express and Next.js where the audit shows they remain maintainable and supportable;
- audit and provenance as first-class domain capabilities.

### 4.2 Refactor

- consolidate the five duplicated portals into a shared role-aware workforce platform or shared packages with bounded role modules;
- centralize authorization using role plus facility, care relationship, consent, purpose, sensitivity, emergency status and time;
- formalize the clinical model and FHIR mappings;
- replace ad hoc offline behavior with an encrypted outbox, idempotency keys, conflict policies and recovery UI;
- define the full twelve-state UX contract for important screens;
- add accessibility, observability, backups, recovery and operations as product requirements;
- make the Fabric adapter asynchronous and auditable through a transactional outbox;
- restrict chaincode using verified client identity, organization membership and explicit endorsement rules;
- convert product documentation into traceable, test-backed evidence.

### 4.3 Replace

- demo passwords, custom/fake JWT generation and duplicated client-side role trust;
- direct Gemini calls and client-bundled AI secrets;
- simulated database/blockchain success in any pilot or production environment;
- placeholder cryptography, key recovery and signature verification;
- the single-organization, TLS-disabled Fabric network as a production design;
- broad “all doctors” or “all nurses” consent without facility, relationship and purpose limits;
- raw or publicly retrievable IPFS content for clinical documents; use encrypted private object storage unless a reviewed private-content design is approved;
- claims that deletion of a pointer automatically deletes all content or satisfies legal erasure;
- readiness claims unsupported by tests, configuration and operational evidence.

## 5. Target platform architecture

### 5.1 Logical architecture

```text
Patient mobile / assisted access / workforce web / Ministry analytics / integrations
                                  |
                         API gateway and BFFs
                                  |
             Identity provider + policy decision/enforcement points
                                  |
 Clinical/FHIR | Consent & access | Scheduling | Pharmacy | AI draft services
             |                    |                 |
 PostgreSQL/FHIR repository   Encrypted object store   Quarantine/review queues
             |
      Transactional audit/outbox
             |
 Optional Fabric anchor adapter ---- Permissioned multi-organization Fabric
             |
 Ministry-approved HIE / Health Information Hub / aggregate reporting interfaces
```

### 5.2 Trust boundaries

1. **Public edge:** QR scanners, patient devices and unauthenticated emergency viewers are hostile by default.
2. **Authenticated user edge:** role claims alone are insufficient; the server re-evaluates context for every action.
3. **Clinical service boundary:** only validated, authorized commands reach clinical stores.
4. **AI boundary:** model inputs and outputs are untrusted; PHI is minimized and provider terms are enforced.
5. **Integration boundary:** every external system has a registered identity, scoped contract, rate limits and replay protection.
6. **Ledger boundary:** ledger availability never makes clinical content public and never becomes the sole dependency for urgent care.
7. **Operations boundary:** administrators manage systems but cannot browse PHI by default.

### 5.3 Data placement rules

| Data class | Approved placement | Prohibited placement |
|---|---|---|
| Patient identity and demographics | Encrypted clinical database with field/column controls where justified | Public chain, logs, analytics exports |
| FHIR clinical resources | Governed FHIR repository/PostgreSQL; encrypted backups | Blockchain payloads, browser storage, public IPFS |
| Documents and images | Private encrypted object store with malware scanning and short-lived access | Public URLs or unencrypted decentralized storage |
| Device data | Minimum encrypted cache; platform secure storage for secrets | Plain AsyncStorage/localStorage for tokens or PHI |
| Audit evidence | Append-only off-chain audit plus optional minimized ledger anchor | Raw clinical narrative or direct identifiers on ledger |
| Ledger anchor | Pseudonymous event reference, keyed/salted digest, policy/version, organization and time | Name, phone, NIN, raw FHIR, document CID, stable patient ID |
| Ministry analytics | Approved de-identified or aggregated indicators | Identifiable row-level clinical records without explicit authority |
| AI data | Minimum necessary, contracted, time-limited processing; quarantine before persistence | Training or retention without explicit approval and notice |

### 5.4 Blockchain decision

Hyperledger Fabric is the preferred blockchain option only for a governed consortium that needs shared integrity evidence, cross-organization policy and auditable consent/event anchors. It is not required to make the pilot clinically useful.

The pilot has two safe modes:

- **Fabric-enabled:** only after at least two real governed organizations, TLS, certificate lifecycle, endorsement policy, private-data design, monitoring, backup and recovery are verified.
- **Fabric-disabled:** the platform uses an append-only, cryptographically protected off-chain audit and clearly reports ledger anchoring as unavailable. It must never return simulated blockchain success.

A public EVM chain is not recommended because public replication, gas volatility and metadata permanence conflict with health privacy and operational control. A conventional signed audit service is an acceptable pilot starting point and may remain the primary operational log even when Fabric anchoring is added.

### 5.5 Fabric V2 pattern

- Consortium membership is governed through signed agreements and MSP lifecycle procedures.
- A channel is not treated as a privacy cure. Use the minimum channel count needed for governance.
- Private Data Collections may protect limited inter-organization details, but collection membership, hashes and metadata still require privacy analysis.
- Chaincode receives pseudonymous references and validates submitting MSP, role/attributes, event type, policy version and idempotency key.
- Endorsement policies match real organizations and approved governance.
- Clinical writes succeed in the clinical store first through a transaction/outbox pattern; ledger anchoring is retried and reconciled without duplicating records.
- The ledger is never the only source needed to treat a patient.
- Key rotation, revocation, certificate expiration, organization onboarding/removal and disaster recovery are tested.

## 6. Identity, consent and authorization

### 6.1 Identity model

- Workforce identities use an approved OIDC/OAuth 2.1 provider, MFA and authoritative facility/registration status.
- High-risk actions require recent authentication or step-up verification.
- Patient identity supports assisted registration, deduplication review and recovery without exposing clinical data to help-desk staff.
- A Health ID is a platform identifier, not proof that the person presenting it is the patient.
- QR/NFC tokens contain no readable clinical data and resolve through a signed, scoped, expiring token.
- Integration clients use workload identity, rotated credentials, narrow scopes and mTLS or an equivalent approved control.
- Sessions support revocation, inactivity/absolute expiry, device visibility and suspicious-activity handling.

### 6.2 Authorization formula

Every server request is evaluated as:

```text
allow = authenticated
    AND active_identity
    AND permitted_role_action
    AND permitted_facility
    AND valid_resource_relationship
    AND permitted_purpose
    AND consent_or_other_approved_basis
    AND sensitivity_rule
    AND environment_rule
    AND NOT explicit_deny
```

The server is authoritative. UI hiding is usability, not security. Queries must be scoped before retrieval; a handler must not fetch a record and decide later whether to hide it.

### 6.3 Authorization matrix

| Actor | Default allowed | Conditional access | Default denied |
|---|---|---|---|
| Patient | Own summary, records, consents, access history, appointments, profile | Guardian/dependent records with verified relationship | Other patients, internal security/admin detail |
| Doctor | Assigned/care-team patient chart; create signed clinical entries | Referral, on-call or emergency access with purpose and policy | Unrelated patient records; altering another author’s signed note |
| Nurse | Assigned-patient observations, medication administration and nursing tasks | Expanded care-team access by facility policy | Diagnosis/prescription outside scope; unrelated charts |
| Laboratory | Orders assigned to the laboratory; result entry and correction workflow | Minimum relevant history when ordered and authorized | Full chart browsing; unrelated orders |
| Pharmacist/staff | Valid prescription and minimum dispensing context | Allergy/interaction context where policy permits | Unrelated notes, government analytics, authoring diagnosis |
| Facility admin | Users, roles, facility configuration and operational metrics | Approved break-glass review metadata | Routine clinical content; national configuration |
| PalmChain system admin | Infrastructure health, tenant/facility metadata and support diagnostics | Time-bound, approved support access with dual control | Routine PHI browsing or clinical editing |
| Ministry analyst | Approved aggregate/de-identified indicators | Authorized row-level public-health workflow with specific legal basis and controls | Direct clinical browsing by default |
| Privacy/auditor | Audit events, policy evidence and investigation metadata | Minimum clinical context under approved case | Editing clinical content or erasing audit history |
| Emergency responder | Public minimum emergency card | Authenticated break-glass minimum clinical set | Full longitudinal record without justification |
| Integration client | Contracted resources and operations for one registered purpose | Patient/facility scope in signed contract | Interactive browsing, bulk export or secondary use by default |

Phase 0 must expand this into resource-by-action rules for create, read, update, correct, sign, revoke, export, print, share and delete/retain.

### 6.4 Consent model

Consent is recorded as a versioned policy with subject, grantor authority, recipient or recipient class, purpose, data scope, facility, start/end time and revocation state. Revocation blocks new access immediately but does not rewrite valid historical clinical use or erase audit evidence.

Use understandable profiles such as “my current care team,” “this referral,” “this facility for 30 days” and “emergency minimum.” Broad professional-role grants are not sufficient on their own.

### 6.5 Emergency and break-glass access

The unauthenticated emergency card shows only Ministry/clinical-governance-approved items, for example preferred name, critical allergies, current high-risk medicines, major conditions necessary for immediate care, blood group only if clinically verified, emergency contact and last-updated time. Address and full history should not be public by default.

Authenticated break-glass requires:

- verified workforce identity and step-up authentication;
- a selected reason and free-text justification;
- minimum necessary scope and short duration;
- prominent emergency banner;
- immutable audit and optional ledger anchor;
- patient notification when safe and lawful;
- facility privacy review within a defined SLA;
- sanctions and alerting for repeated or suspicious use.

## 7. Core healthcare journeys

### 7.1 Patient with a smartphone

1. Register or accept an assisted-registration invitation.
2. Verify identity and recovery methods.
3. Review privacy notice and consent choices in plain language.
4. See an emergency summary and verify high-risk items with a clinician.
5. Review longitudinal timeline, documents, medicines, appointments and notifications.
6. Generate a short-lived, single-use QR share for a defined purpose and scope.
7. Receive a real-time or next-connectivity notification when the token is used.
8. Review access history and revoke future access.
9. Correct demographic data or request amendment of clinical information without overwriting provenance.

### 7.2 Patient without a smartphone

1. Register through an authorized facility or outreach workflow with deduplication safeguards.
2. Receive a durable Health ID card/bracelet containing a non-clinical QR/NFC reference.
3. Choose a PIN, trusted contact or facility-assisted recovery method appropriate to local policy.
4. Receive printed or verbal consent information and a receipt where practical.
5. Use the card at participating facilities; staff authenticate before retrieving anything beyond the emergency minimum.
6. Review or revoke permissions through a facility desk, call centre or future USSD/SMS channel after identity verification.
7. Replace a lost card by revoking the old token, not by deleting the patient record.

### 7.3 Emergency bystander and clinician

1. A bystander scans/taps the token.
2. The resolver validates signature, status, expiry/rate and abuse signals.
3. The bystander sees only the minimum emergency card and a call-for-help action.
4. The scan is audited without exposing the full record.
5. At the facility, an authenticated clinician opens the patient match and uses normal authorization or break-glass.
6. The patient or privacy team is notified and the override is reviewed.

### 7.4 Doctor

1. Sign in with MFA and choose the active facility/context.
2. View schedule, assigned patients, urgent tasks and referral queue.
3. Verify patient identity and open a permission-filtered timeline.
4. Document encounter, problems, observations, medications, orders and care plan using structured forms or a supervised AI draft.
5. Review provenance, sign the record and issue referral/prescription where authorized.
6. If offline, work only within cached authorization and allowed data scope; queue signed commands.
7. Resolve conflicts or rejected commands after reconnection.

### 7.5 Nurse

1. Open shift and assigned ward/clinic list.
2. Confirm patient with two identifiers or approved wristband workflow.
3. Record observations, nursing assessment, medication administration and escalation.
4. Receive due/overdue alerts without unsafe alarm overload.
5. Escalate deterioration to an accountable clinician.
6. Handover using a structured, signed summary.

### 7.6 Laboratory

1. Receive an authenticated, scoped order.
2. Verify patient/specimen identifiers and collection state.
3. Track collection, receipt, processing, quality control and result state.
4. Validate and release the result with correction provenance.
5. Alert the care team to critical results through an acknowledged workflow.
6. Share only approved public-health indicators with Ministry systems.

### 7.7 Pharmacy

1. Receive a signed, valid prescription.
2. Verify patient and prescription status.
3. Review the minimum necessary allergy/interaction context.
4. Record partial/full dispense, substitution, stock exception or refusal with reason.
5. Prevent replay and double dispensing through idempotent status transitions.
6. Notify the care team of significant issues.

### 7.8 Facility administration

1. Invite and verify workforce users.
2. Assign time-bound facility roles using separation of duties.
3. Monitor system health, access anomalies, break-glass reviews and unresolved queues.
4. Manage facility locations, departments, devices and integrations.
5. Run approved operational reports without default access to clinical narratives.

### 7.9 Ministry and public health

1. Sign in through a restricted government workspace.
2. View data-quality, completeness and aggregate surveillance indicators.
3. Drill down only to an approved geographic/organizational aggregation level.
4. Receive algorithmic signals labelled with source, confidence, coverage and limitations.
5. Request authorized investigation data through a separate governed workflow.
6. Record the accountable human decision; AI does not declare an outbreak.

## 8. Experience blueprint

### 8.1 Patient mobile navigation

Recommended routes/modules:

- Welcome, language and accessibility setup
- Registration, identity verification and recovery
- Home and urgent actions
- Emergency card preview
- Health timeline and record detail
- Medicines and allergies
- Appointments and referrals
- Documents/results
- Share access / QR token
- Consents and trusted facilities
- Access history and report concern
- Notifications
- Profile, dependents and card/device management
- Offline queue, sync status and help

### 8.2 Workforce web navigation

Use one shared shell with permissioned modules:

- Sign-in, step-up and facility selection
- Role dashboard and task inbox
- Patient search/match and duplicate-resolution request
- Patient summary/timeline
- Encounter workspace
- Orders and results
- Medication/prescription/dispensing
- Referrals and appointments
- Consent/access status
- Emergency/break-glass workflow
- Offline queue/conflict resolution
- Reports appropriate to role
- Audit/access review where authorized
- User/facility/integration administration
- Help, policy and system status

### 8.3 Ministry workspace

- National and district overview
- Facility coverage and data quality
- Surveillance indicators and signal review
- Program dashboards
- Interoperability and feed health
- Approved export/request workflow
- Model/indicator documentation
- Access and investigation audit

### 8.4 Twelve-state contract

Every important screen or component must define and test:

1. first-use/empty;
2. loading/skeleton;
3. success with data;
4. validation error;
5. authorization denied;
6. authentication expired;
7. network/offline;
8. queued/pending synchronization;
9. partial/degraded dependency;
10. conflict/stale data;
11. irreversible or high-risk confirmation;
12. completed/recoverable next step.

Clinical screens also require signed/draft/corrected/entered-in-error status, provenance, author/time, and a clear distinction between patient-reported, imported, clinician-verified and AI-drafted information.

### 8.5 Accessibility and localization

- Meet WCAG 2.2 AA for supported web and mobile surfaces.
- Support keyboard navigation, visible focus, semantic landmarks, screen readers and logical headings.
- Do not rely on color alone; provide text/icon/state labels with adequate contrast.
- Use 44x44 CSS-pixel touch targets where practical and support text resizing/reflow.
- Use plain language and test health comprehension with Sierra Leone users.
- Design translations and locale-aware date/time/number formatting from the start.
- Avoid instructions that assume literacy, perfect vision, private devices or continuous connectivity.
- Provide safe timeout warnings and privacy-conscious shared-device behavior.

## 9. Clinical data and FHIR interoperability

### 9.1 FHIR baseline

Use HL7 FHIR R4 as a canonical exchange baseline until the Ministry approves a national implementation guide or another version. FHIR is not itself an authorization or security protocol; TLS, identity, consent, access control, validation, audit and provenance remain required.

Initial resource map:

| Domain | Candidate FHIR R4 resources |
|---|---|
| Identity/care context | Patient, RelatedPerson, Practitioner, PractitionerRole, Organization, Location, HealthcareService |
| Encounters | Encounter, EpisodeOfCare, CareTeam |
| Clinical summary | Condition, AllergyIntolerance, Observation, Procedure, Immunization, FamilyMemberHistory |
| Medicines | Medication, MedicationRequest, MedicationDispense, MedicationAdministration, MedicationStatement |
| Diagnostics | ServiceRequest, Specimen, DiagnosticReport, Observation, ImagingStudy |
| Documents | DocumentReference, Composition, Binary only through protected storage/reference patterns |
| Scheduling/referral | Appointment, Schedule, Slot, Task, ServiceRequest |
| Consent/audit | Consent, AuditEvent, Provenance |
| Public health | Measure, MeasureReport and approved indicator mappings where appropriate |

### 9.2 Interoperability rules

- Maintain a versioned internal-to-FHIR mapping and terminology register.
- Validate profiles, references, cardinality, codes and narrative safety at the boundary.
- Use an MPI/identity reconciliation workflow; never merge solely on name or phone number.
- Preserve source system, author, organization, import time and transformation provenance.
- Use idempotency and replay protection for inbound/outbound events.
- Quarantine invalid or ambiguous payloads; never silently coerce clinically important values.
- Agree national identifiers, code systems, facility registry and terminology with the Ministry.
- Export only the minimum fields authorized for the stated purpose.

## 10. Offline-first and low-connectivity design

### 10.1 Principles

- Offline capability is role- and workflow-specific, not a full local copy of the database.
- Cached data is encrypted, time-bounded and restricted to recently authorized patients/tasks.
- A device cannot grant itself new access while offline.
- Every queued mutation has an immutable client command ID, actor, device, patient, base version, local time and server receipt time.
- The server reauthorizes every queued command on synchronization.
- “Saved on this device,” “queued,” “synced,” “rejected” and “needs review” are distinct states.

### 10.2 Conflict policy examples

| Data | Default merge behavior |
|---|---|
| New clinical observation | Append with provenance; flag implausible duplicate |
| Signed note | Never overwrite; create correction/addendum |
| Demographics | Field-level review for conflicting authoritative updates |
| Medication dispense | Server-enforced state transition; reject replay/double dispense |
| Consent revocation | Revocation wins for future access; queued reads are not permitted |
| Appointment | Versioned update; user resolves conflicting schedule |

### 10.3 Device operations

Define enrollment, supported OS versions, secure storage, screen lock, remote session revocation, lost/stolen handling, cache expiry, jailbreak/root risk, telemetry minimization and safe decommissioning. Shared facility devices require rapid user switching without data crossover.

## 11. AI and health-intelligence governance

### 11.1 Allowed early use cases

- speech or typed notes converted into a structured draft;
- draft encounter summary and referral letter;
- extraction/classification of imported documents into a quarantine queue;
- patient-friendly explanation of clinician-approved information;
- coding or data-quality suggestions for human review;
- de-identified aggregate trend exploration and public-health signal prioritization.

### 11.2 Prohibited without separate clinical validation and approval

- autonomous diagnosis, triage, prescribing or treatment change;
- output presented as a confirmed fact without source and accountable review;
- silent insertion into the signed clinical record;
- model training on patient data without explicit governance, lawful basis and contracts;
- Ministry action or outbreak declaration made solely by a model;
- model access to unrestricted national records;
- client-side calls using embedded provider keys.

### 11.3 AI pipeline

1. Verify actor, patient, purpose and consent/other lawful basis.
2. Minimize/redact input and classify sensitivity.
3. Enforce model allow-list, region, retention, no-training and vendor contract.
4. Apply rate, cost, token and concurrency limits per user/facility.
5. Treat prompts, retrieved documents and tool output as hostile input.
6. Require structured schema output and validate units, dates, references and allowed codes.
7. Show source context, uncertainty and “AI draft” status.
8. Require named human accept/edit/reject action before clinical persistence.
9. Store prompt template/model version and safety metadata without retaining unnecessary PHI.
10. Monitor errors, subgroup performance, drift, overrides, near misses and cost.

### 11.4 Outbreak intelligence

The intelligence layer uses approved, de-identified or aggregated feeds, known coverage denominators and human-reviewed signals. Dashboards must show data completeness, timeliness, geographic bias, threshold basis, confidence and false-alarm history. A signal creates a review task, not a public-health conclusion.

### 11.5 AI evidence pack

Each enabled use case requires intended-use statement, excluded uses, data flow, risk assessment, model/provider card, evaluation dataset description, safety and subgroup metrics, human-factors test, incident process, rollback/kill switch, monitoring thresholds, version register and approval owner.

## 12. Security, privacy and operations baseline

### 12.1 Control families

- centralized authentication and server-side RBAC/ABAC;
- schema validation, output encoding and safe file handling;
- encryption in transit and at rest with managed key rotation;
- secret management and repository/history scanning;
- CSRF/XSS/SSRF/injection/request-smuggling defenses appropriate to each surface;
- API object-, function- and property-level authorization tests;
- rate limits, quotas, abuse detection and export controls;
- append-only, privacy-minimized audit with protected time source;
- dependency/SBOM, SAST, secret, container and infrastructure scanning;
- secure build provenance, separated environments and change approval;
- monitored backups and restoration exercises;
- incident response, breach workflow and patient-safety escalation;
- data retention, legal hold and verified deletion processes.

### 12.2 Threats that require explicit tests

- guessed patient IDs and cross-facility object access;
- privilege escalation through manipulated role/facility claims;
- QR replay, enumeration, screenshots and excessive scanning;
- consent race/revocation timing and cached access;
- break-glass abuse;
- duplicate patient linkage and mistaken identity;
- offline replay, clock manipulation and conflict loss;
- prescription/result tampering and double dispensing;
- token theft, XSS and shared-device residue;
- malicious files and prompt injection;
- model data leakage, unsafe output and cost exhaustion;
- Fabric identity misuse, endorsement mismatch, metadata correlation and ledger outage;
- bulk export, analytics re-identification and insider access;
- backup loss, ransomware and dependency compromise.

### 12.3 Release stop-ship rules

A release is **FAIL / STOP SHIP** when any Critical finding remains, authorization is not verified, secrets are exposed, database/storage access controls are unverified, paid AI lacks abuse/cost controls, backup restoration is untested, human review is absent for clinical AI, legal/Ministry approval is missing for production PHI, or an essential area could not be inspected.

High findings require written risk-owner acceptance only when the audit standard and organizational policy permit it; patient-safety, auth bypass and active credential exposure are not papered over by acceptance.

## 13. Delivery phases

Durations are planning ranges, not commitments. A phase begins only when its entry criteria are met. Evidence and safety gates—not dates—control advancement.

### Phase 0 — Evidence gate and audit freeze (2–5 working days)

**Objective:** establish the trustworthy current state before any code change.

**Allowed changes:** audit documentation only, preferably under `docs/audit/`. Read-only commands may inspect code, history, configuration and dependency metadata. Do not expose secret values in output.

**Required deliverables:**

1. `00_Current_State_Audit.md`
2. `01_Gap_Analysis.md`
3. `02_Authorization_Matrix.md`
4. `03_Keep_Refactor_Replace.md`
5. `04_Endpoint_Rate_Limit_Inventory.md`
6. `05_Data_Flow_Threat_Model.md`
7. `06_UX_A11y_State_Matrix.md`
8. `07_Release_Decision.md`

**Required content:** repository inventory; trust boundaries and data flows; secret/credential hygiene; database/storage/Fabric/AI review; endpoint/auth/rate map; cross-role authorization matrix; findings in the supplied standard’s format; UX twelve-state and WCAG review; test evidence; unverified areas; remediation sequence; PASS/CONDITIONAL/FAIL decision.

**Immediate containment procedure:** if a credential-like value or private key is found, record only file/path/category and exposure status, never its value. Determine whether it is active, rotate/revoke through an authorized owner, inspect history and deployment exposure, and document safe removal.

**Exit gate:** audit pack is complete, evidence-linked and reviewed; all Critical issues have owners and containment; a human explicitly authorizes Phase 1. Otherwise Codex waits.

### Phase 1 — Containment and engineering foundation (1–2 weeks)

**Objective:** remove immediate unsafe behavior and establish a verifiable delivery baseline.

**Work:** rotate/revoke exposed credentials; remove secrets/private keys from tracked source safely; add environment validation and secret manager integration; eliminate direct client AI access; disable hard-coded/demo authentication outside an explicit non-PHI sandbox; remove silent success fallbacks; restrict CORS; standardize safe errors; add CI with build, type, lint, unit baseline, secret scanning, dependency review and artifacts; create environment classification and data rules.

**Exit evidence:** clean secret scan and documented history response; no live secret in client bundle; no simulation in pilot/production; CI required on protected branches; threat-model controls mapped; build reproducible; Phase 0 Critical items closed or independently verified as contained.

### Phase 2 — Identity, authorization and data governance (2–4 weeks)

**Objective:** create the security spine on which all product modules depend.

**Work:** integrate approved identity provider; MFA and session lifecycle; authoritative workforce/facility status; patient identity/recovery; centralized policy engine or shared enforcement library; consent policy service; resource-level query scoping; break-glass; audit events; data classification/retention; object storage access; legal/DPIA register.

**Exit evidence:** authorization matrix has positive/negative tests for every role/resource/action; cross-patient and cross-facility tests pass; step-up and revocation tested; administrators lack default PHI access; audit integrity and privacy reviewed; database and storage rules verified.

### Phase 3 — Platform consolidation and contracts (2–4 weeks)

**Objective:** reduce duplicate security logic and stabilize interfaces.

**Work:** decide monorepo/workspace structure; create shared identity, permission, design-system, API-client and observability packages; consolidate five portals into a shared workforce shell or prove why separate deployments are needed; define OpenAPI contracts; create FHIR mapping layer; standardize errors, idempotency, pagination and correlation IDs; migrate in small vertical slices.

**Exit evidence:** duplicated auth/permission logic removed from active paths; contract tests pass; role bundles cannot import unauthorized modules; deprecation plan exists; no regression in Phase 2 controls.

### Phase 4 — Patient core, Health ID, consent and offline (4–6 weeks)

**Objective:** deliver a safe patient experience for smartphone and non-smartphone users.

**Work:** registration/recovery; emergency summary; timeline; access history; consent profiles; scoped single-use QR; card/NFC lifecycle; lost/stolen flow; assisted service; encrypted local cache; outbox/sync/conflict UI; notifications; accessibility and comprehension testing.

**Exit evidence:** QR replay/enumeration tests pass; public emergency disclosure approved; revocation blocks new access; lost token can be revoked; offline commands are reauthorized; patient usability/health-literacy tests meet agreed thresholds; WCAG 2.2 AA evidence exists for core flows.

### Phase 5 — Clinical workforce and FHIR workflows (4–8 weeks)

**Objective:** support an end-to-end pilot care journey.

**Work:** patient matching; clinician summary; encounter and signed notes; nursing observations/administration; lab orders/results/critical alerts; pharmacy prescriptions/dispensing; referral and appointment; provenance/corrections; terminology; FHIR import/export; facility task queues; downtime procedures.

**Exit evidence:** one complete patient journey works across roles; signed records are append/correct, not overwritten; laboratory and pharmacy state machines resist replay; FHIR validation and contract tests pass; clinical safety review and simulated downtime exercise complete.

### Phase 6 — Fabric consortium trust layer (4–8 weeks, after governance)

**Objective:** add real cross-organization integrity and governance only where it creates measurable value.

**Entry gate:** participating organizations and governance agreement exist; Phase 2 controls are stable; clinical data placement is approved.

**Work:** production topology; TLS and certificate lifecycle; MSP governance; multiple organizations; endorsement policy; minimized anchor schema; private-data evaluation; chaincode client-identity authorization; outbox/adapter; reconciliation; monitoring; key rotation; backup/recovery; organization onboarding/removal.

**Exit evidence:** no PHI or stable patient ID on ledger; multi-org endorsement tests pass; invalid MSP/role/action denied; outage does not block urgent clinical care; replay/idempotency and reconciliation verified; penetration and privacy review complete.

### Phase 7 — Responsible AI documentation assistant (3–5 weeks)

**Objective:** reduce documentation burden without transferring clinical authority to a model.

**Work:** server-side AI gateway; provider contract/configuration; data minimization; prompt/tool defenses; structured output validation; review UI; source display; evaluation harness; per-user/facility quotas; monitoring; kill switch; version/model register; start with one low-risk documentation use case.

**Exit evidence:** no provider key or direct model call in clients; accepted AI content records reviewer and changes; unsafe/malformed outputs are quarantined; cost-abuse tests pass; clinical safety, privacy, subgroup and human-factors evaluation approved.

### Phase 8 — Ministry integration and health intelligence (3–6 weeks)

**Objective:** provide approved, high-quality aggregate insight without creating uncontrolled surveillance.

**Work:** agree indicator catalog and data-sharing basis; integrate through approved Health Information Hub/HIE pattern; data-quality and completeness measures; de-identification; geographic suppression; signal-review workflow; access/export approval; provenance and feed health.

**Exit evidence:** Ministry sign-off; re-identification review; aggregate definitions reconcile with source; incomplete data is visible; analysts cannot default to row-level PHI; AI signals require and record human review.

### Phase 9 — UX, accessibility, performance and field validation (3–6 weeks, partly parallel)

**Objective:** make the safe system usable in real facilities and low-connectivity conditions.

**Work:** twelve-state completion; WCAG 2.2 AA; localization; low-end-device and bandwidth tests; clinician time-on-task; patient comprehension; error recovery; performance budgets; shared-device privacy; stakeholder and field feedback.

**Exit evidence:** critical journeys pass accessibility and usability criteria; p95 targets hold under pilot load; offline recovery is understood; no unresolved severe UX issue can lead to wrong-patient or wrong-action behavior.

### Phase 10 — Pilot release and operational readiness (4–8 weeks)

**Objective:** run a controlled pilot with measurable safety and rollback.

**Work:** select one facility/service line; migration rehearsal; training; support; monitoring/SLOs; incident and clinical-safety response; backup restore; disaster recovery; penetration test; DPIA/legal/Ministry approvals; rollback; go/no-go review; outcome measurement.

**Exit evidence:** independent security review; restore and failover exercises; signed legal/governance documents; trained users; alert/incident drills; release decision PASS or explicitly bounded CONDITIONAL under the supplied standard; no Critical finding.

### Phase 11 — Scale and continuous assurance (ongoing)

**Objective:** expand only when pilot outcomes and governance support it.

**Work:** phased facility onboarding; capacity planning; model and policy monitoring; quarterly access review; periodic threat model/penetration/restore exercises; dependency maintenance; feedback and safety cases; roadmap review; public transparency reporting where approved.

**Exit evidence for each expansion wave:** previous-wave outcomes met; data quality and support capacity acceptable; legal/contracts current; no unresolved systemic control gap; rollback available.

## 14. Verification strategy

### 14.1 Required test layers

- unit tests for policy, validation, clinical state machines and pure domain logic;
- database integration tests with real constraints and transaction behavior;
- API contract and schema tests;
- authorization matrix tests, including cross-user/facility/role negative cases;
- FHIR profile and interoperability tests;
- offline/replay/idempotency/conflict tests;
- QR/NFC expiry, single-use and enumeration tests;
- Fabric chaincode and multi-organization integration tests;
- AI adversarial, schema, privacy, cost and human-review tests;
- browser/mobile end-to-end tests for critical journeys and twelve states;
- WCAG automated checks plus manual keyboard/screen-reader review;
- performance, load, soak and degraded-dependency tests;
- backup restoration, failover and incident exercises;
- SAST, secret, dependency, container, IaC and DAST scanning;
- independent penetration and clinical-safety review before pilot.

### 14.2 Traceability

Every release requirement has an identifier, owner, implementation reference, test reference, evidence location and status. Findings link to remediation commits and regression tests. An untested security assertion remains unverified.

### 14.3 Suggested service objectives

Exact targets require pilot baselines. Initial design targets for review:

- emergency-card resolver p95 under 2 seconds on supported connectivity;
- ordinary authenticated API p95 under 500 ms excluding external dependencies;
- zero silent data loss; every queued command reaches a visible terminal state;
- RPO/RTO approved by clinical and Ministry stakeholders, then restoration-tested;
- critical security alert acknowledgement and clinical-safety incident escalation within approved SLAs;
- audit event coverage for 100% of sensitive reads, writes, exports, consent changes and break-glass events.

## 15. Deployment, observability and change management

### 15.1 Environments

Maintain isolated development, automated test, security test, staging/pilot and production environments. Synthetic data is default outside production. Any exceptional real-data use requires authorization, minimization, logging and deletion proof.

### 15.2 Observability

Collect privacy-minimized metrics, traces and structured logs with correlation IDs. Never log tokens, credentials, raw clinical narratives, full FHIR payloads or AI prompts by default. Monitor authentication, denials, QR abuse, break-glass, export, sync backlog, AI usage/cost/errors, integration lag, Fabric anchor lag, backups and data quality.

### 15.3 Change control

- one approved phase or bounded vertical slice per change set;
- architecture decision records for identity, FHIR, offline, Fabric, AI provider and hosting;
- clinical, privacy and security review for high-risk changes;
- database migration forward and rollback plans;
- feature flags that fail safely and do not bypass authorization;
- release notes, training impact and support playbook;
- no weakening of tests or controls to make a pipeline pass.

## 16. Stakeholder demonstration scope

Use synthetic data only. The safe demonstration story is:

1. Register a synthetic patient and show a verified emergency summary.
2. Scan an expiring QR and show minimum disclosure plus access history.
3. Sign in as a clinician and show a permission-filtered timeline.
4. Create a draft encounter, verify it and sign it.
5. Revoke future access and demonstrate denial.
6. Show offline queue and a controlled reconnection.
7. Show an aggregate Ministry dashboard with clearly synthetic/de-identified data.
8. Label Fabric and AI truthfully as prototype, disabled or verified depending on evidence.

Do not demonstrate real patient data, real provider keys, simulated success described as production behavior, or fabricated outcome statistics.

## 17. How to use this tonight

Place these files in or alongside the repository:

- `PalmChain_V2_Master_Blueprint_and_Codex_Execution_Guide.md`
- `PalmChain_Codex_Master_Execution_Prompt.txt`
- `AI_App_Audit_Master_Prompt.txt`
- `AI_App_Security_UX_Audit_Standard.md`

Give Codex the repository and the standalone execution prompt. Use this starting instruction:

> Read the two audit documents first, then the PalmChain V2 blueprint and the entire repository. Begin Phase 0 only. Do not modify application code, configuration, dependencies, database schemas or infrastructure. Produce the required current-state audit, gap analysis, authorization matrix, keep/refactor/replace report and the rest of the Phase 0 audit pack with file-and-line evidence. Do not reveal secret values. Stop after the release decision and wait for my explicit approval before implementing Phase 1.

Review the eight audit deliverables. Resolve questions about scope, risk ownership, legal approval, Ministry integration, pilot facility and production claims. Only then say, for example: “Phase 0 is approved. Begin Phase 1 containment on a new `codex/palmchain-v2-phase-1` branch.”

## 18. Open decisions and owners

| Decision | Required owner(s) | Needed before |
|---|---|---|
| Legal basis, controller roles, retention and cross-border processing | Sierra Leone counsel, Ministry, privacy lead | Production PHI |
| National patient/facility/provider identifiers and FHIR profile | Ministry/DHCU/DPPI and clinical informatics | External integration |
| Public emergency-card fields | Clinical safety, privacy, patient representatives | Phase 4 release |
| Pilot facility/service line and outcome measures | Ministry/facility/product/clinical leads | Phase 5 build/pilot |
| Identity provider and workforce verification source | Security, Ministry/facilities | Phase 2 |
| Hosting region, key manager and backup objectives | Security, operations, legal | Phase 1–2 |
| Fabric consortium members and governance | Participating organizations, Ministry, legal | Phase 6 |
| AI provider, permitted data, retention and evaluations | Clinical safety, privacy, security, procurement | Phase 7 |
| Health Information Hub interface and approved indicators | Ministry/DPPI | Phase 8 |
| Local languages and assisted-service model | User research, facilities, patient groups | Phase 4/9 |

## 19. Definition of done

PalmChain V2 is not “done” because screens render or chaincode deploys. A capability is done only when:

- the user and safety outcome is defined;
- data classification and lawful purpose are known;
- authorization is enforced at the server and negatively tested;
- normal, error, offline, denied, conflict and recovery states are usable;
- audit/provenance is present and privacy-minimized;
- accessibility and performance acceptance criteria pass;
- operational monitoring, backup/restore and incident response exist;
- documentation matches verified behavior;
- the accountable product, clinical, security and privacy owners approve it.

## 20. References

### Sierra Leone primary sources

- Ministry of Health, Digital Health Coordination: <https://mohs.gov.sl/digital-health/>
- Sierra Leone Digital Health Roadmap 2024–2026: <https://mohs.gov.sl/download/68/digital-health/18150/sierral-leone-digital-health-roadmap-2024-2026-2.pdf>
- Ministry of Health, Health Information Hub launch, 20 January 2026: <https://mohs.gov.sl/moh-launches-health-information-hub/>
- Ministry of Health, phased EMR development/deployment procurement: <https://mohs.gov.sl/jobs/hiring-of-a-consulting-firm-to-develop-customize-deploy-manage-and-maintain-an-electronic-medical-records-system/>
- Ministry of Health, Connaught Hospital EMR pilot: <https://mohs.gov.sl/emr-system-to-improve-health-care-delivery-in-sierra-leone/>
- Ministry of Information and Civic Education, National Data Protection Policy announcement, 22 April 2026: <https://moice.gov.sl/cabinet-approves-first-ever-data-protection-policy-paving-way-for-new-data-law/>

### Interoperability, security and AI sources

- HL7 FHIR R4 overview: <https://hl7.org/fhir/R4/overview-arch.html>
- HL7 FHIR R4 security: <https://hl7.org/fhir/R4/security.html>
- Hyperledger Fabric membership and MSPs: <https://hyperledger-fabric.readthedocs.io/en/latest/membership/membership.html>
- Hyperledger Fabric private data architecture: <https://hyperledger-fabric.readthedocs.io/en/latest/private-data-arch.html>
- WHO, *Ethics and governance of artificial intelligence for health*: <https://www.who.int/publications/i/item/9789240029200>
- WHO, *Ethics and governance of artificial intelligence for health: guidance on large multi-modal models*: <https://iris.who.int/bitstream/handle/10665/375579/9789240084759-eng.pdf>
- NIST AI Risk Management Framework 1.0: <https://www.nist.gov/publications/artificial-intelligence-risk-management-framework-ai-rmf-10>
- NIST Cybersecurity Framework 2.0: <https://www.nist.gov/publications/nist-cybersecurity-framework-csf-20>
- OWASP Application Security Verification Standard: <https://owasp.org/www-project-application-security-verification-standard/>
- OWASP API Security Top 10: <https://owasp.org/www-project-api-security/>
- OWASP Mobile Application Security Verification Standard: <https://mas.owasp.org/MASVS/>
- W3C Web Content Accessibility Guidelines 2.2: <https://www.w3.org/TR/WCAG22/>

## Appendix A — Phase 0 finding format

Each finding shall contain:

- unique ID, title, severity and confidence;
- affected asset, role, data and environment;
- evidence with repository-relative path and line number or command/test artifact;
- preconditions and reproducible steps that do not expose secrets or real PHI;
- actual versus expected behavior;
- patient, privacy, security, financial and operational impact;
- root cause;
- recommended remediation and safer alternatives;
- owner, target phase and dependencies;
- verification test and status;
- residual risk and explicit unverified assumptions.

## Appendix B — Codex phase report template

At the end of every approved phase, Codex reports:

1. objective and scope completed;
2. files changed and why;
3. tests/evidence run and results;
4. security, privacy, clinical and accessibility effect;
5. deviations from this blueprint and approved ADRs;
6. remaining findings and unverified areas;
7. migration, rollback and operational notes;
8. release recommendation: PASS, CONDITIONAL or FAIL;
9. explicit request for approval before the next phase.

## Appendix C — Glossary

- **ABAC:** Attribute-Based Access Control.
- **BFF:** Backend for Frontend.
- **Break-glass:** Exceptional, time-bound emergency access with strong accountability.
- **DHCU:** Digital Health Coordination Unit.
- **DHIS2:** District Health Information Software 2.
- **DPIA:** Data Protection Impact Assessment.
- **DPPI:** Directorate of Policy, Planning and Information.
- **EHR/EMR:** Electronic Health/Medical Record.
- **FHIR:** Fast Healthcare Interoperability Resources.
- **Health ID:** PalmChain/nationally approved identifier or token used to locate a patient identity; not clinical data itself.
- **HIE:** Health Information Exchange.
- **MSP:** Membership Service Provider in Hyperledger Fabric.
- **NFC:** Near-Field Communication.
- **OIDC:** OpenID Connect.
- **PHI:** Protected/personal health information.
- **RBAC:** Role-Based Access Control.
- **RPO/RTO:** Recovery Point/Recovery Time Objective.
- **Transactional outbox:** A pattern that commits a domain change and an event for later delivery atomically.
- **WCAG:** Web Content Accessibility Guidelines.

---

**Document control note:** Update this blueprint through reviewed changes. Record material architecture, legal, clinical-safety and governance changes in decision records; do not silently edit the target state to match an implementation shortcut.
