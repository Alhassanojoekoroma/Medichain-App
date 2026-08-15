# Production Threat Model

## Protected assets

Patient identity and PHI, consent and care relationships, clinician identity, medical files, audit evidence, encryption/signing keys, Fabric identities, Ministry aggregates, and service availability.

## Trust boundaries

1. Patient device to patient BFF/API.
2. Workforce browser to clinical BFF/API.
3. Ministry browser to aggregate-only service.
4. Admin browser to restricted administration services.
5. Domain services to PostgreSQL/object storage/audit/queue.
6. Ledger-anchor worker to Hyperledger Fabric.
7. External OIDC, SMS/push, license-register, malware-scanning, and KMS/HSM providers.

## Priority threats and required controls

| Threat | Primary controls |
|---|---|
| Account takeover or impersonated clinician | OIDC, mandatory workforce MFA, license verification, short sessions, central revocation |
| Cross-patient/cross-facility access | centralized deny-by-default policy, care relationship/consent evaluation, PostgreSQL RLS, negative tests |
| Revoked/expired/read-only consent accepted for a write | typed consent scopes, server-time evaluation, one policy engine, transactional revocation |
| Silent emergency bypass | explicit break-glass action, written justification, patient notification, prominent audit and review |
| Malicious or disguised upload | quarantine, magic-byte and size validation, malware scan, CDR where approved, server hash, encryption |
| False upload success or partial workflow | honest lifecycle states, idempotency, transactional outbox, retry/reconciliation, audit gate before Active |
| Audit deletion or mutation | append-only access, hash chain, restricted audit service, independent verification, Fabric anchor |
| Fabric leaks PHI | strict allowlisted schema, random anchor IDs, no patient pointer, chaincode validation, automated forbidden-field tests |
| Compromised Fabric key | HSM/managed custody, least-privilege identity, rotation/revocation, no generated crypto in Git |
| Ministry re-identification | isolated aggregation service/read model, minimum-cell suppression for views and exports, no patient query path |
| Lost/shared phone discloses cached PHI | encrypted cache, hardware-backed key, biometric/PIN re-entry, account-switch wipe, TTL, backup exclusion |
| Demo behavior reaches production | fail-closed startup assertions and CI/deployment policy; synthetic adapters unavailable in real mode |
| Dependency or build compromise | locked dependencies, secret scan, SBOM, vulnerability gates, signed build provenance |
| Service/ledger outage blocks care | clinical system remains authoritative; explicit degraded anchor state, durable retries, monitored backlog |

## Abuse cases that must remain in automated tests

Wrong role, wrong patient, wrong facility, no relationship, revoked/expired/wrong-purpose/read-only consent, disabled account, revoked device, missing MFA, replayed idempotency key, modified file after hashing, malicious upload, forged Ministry filter, direct patient query from Ministry, Fabric anchor with unknown fields, unapproved MSP, and duplicate anchor ID with different content.
