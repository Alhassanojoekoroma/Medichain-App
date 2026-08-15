# Data Classification Policy

Status: engineering baseline; requires Sierra Leone legal, privacy, clinical-governance, and Ministry review before real data is processed.

## Tiers

| Tier | Meaning | Examples | Permitted locations |
|---|---|---|---|
| C0 Public | Approved public information | help text, facility public address | public clients and services |
| C1 Internal | Operational data without patient identity | deployment status, non-sensitive configuration | authenticated operational systems |
| C2 Personal | Identifies a person but is not clinical content | name, phone, DOB, device/session details | identity/domain services and encrypted databases |
| C3 PHI | Health information or a linkable clinical event | diagnosis, treatment, document, consent, patient access event | authorized domain services, PostgreSQL, encrypted object storage, minimum necessary client cache |
| C4 Restricted | Highest-risk security/compliance material | private keys, recovery secrets, raw audit investigation data | managed secret/HSM systems or separately restricted compliance stores |
| D1 De-identified aggregate | Output that passed approved aggregation and suppression | national/district counts above minimum cell size | Ministry aggregation read model and portal |

Hashes and pseudonyms inherit the source classification whenever they can be linked back using another dataset. A hash of PHI is not automatically anonymous.

## Field rules

- Direct identifiers, contact details, demographic identity, national/voter IDs: C2.
- Diagnoses, treatments, documents, record metadata linked to a patient: C3.
- Consent, care relationship, access log, and break-glass justification: C3.
- Authentication secrets, signing keys, Fabric private keys, recovery material: C4.
- Ministry data is D1 only after service-side cell suppression. Portal filtering does not change classification.

## Storage and transfer

- C2-C4 require TLS in transit and managed encryption at rest.
- C3 documents use per-object envelope encryption and short-lived signed download URLs.
- C3 mobile caching is minimum necessary, encrypted with hardware-backed key material, expires, and is excluded from OS backup.
- C4 secrets are never committed to Git, application logs, container images, or environment example files.
- Logs and telemetry must use pseudonymous references and must not include document content, phone numbers, names, diagnoses, tokens, or consent text.

## Hyperledger Fabric boundary

Fabric may receive only a random anchor ID, SHA-256/HMAC digest, schema/version, event category, timestamp, policy version, and approved organization MSP identifier. It must never receive patient identifiers, record URLs, diagnoses, document content, consent content, access-log content, or reversible pointers.

## Enforcement

- Domain fields are tagged with a classification in `packages/domain-model`.
- API serializers use explicit allowlists.
- Ministry aggregation and Fabric anchor schemas reject unknown fields.
- CI secret scanning and tests reject forbidden PHI fields at the ledger boundary.
- Production startup fails if real data is combined with demo identity, simulation, or unapproved storage.
