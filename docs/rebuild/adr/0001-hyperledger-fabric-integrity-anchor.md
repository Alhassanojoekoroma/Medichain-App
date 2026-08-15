# ADR 0001: Hyperledger Fabric as a Privacy-Minimized Integrity Anchor

- Status: Accepted by product owner; consortium details pending stakeholder approval
- Date: 2026-08-02

## Decision

MediChain SL will use Hyperledger Fabric to anchor record and audit integrity evidence. Fabric is not the medical-record database, identity store, consent store, access log, or document store.

PostgreSQL remains authoritative for clinical and workflow state. Encrypted object storage remains authoritative for document bytes. A transactional outbox dispatches an allowlisted anchor event after the clinical transaction and mandatory audit evidence are durable.

## On-ledger schema

- random UUID anchor/event ID with no patient semantics;
- event category from an allowlist;
- SHA-256/HMAC digest of a canonical off-chain integrity payload;
- schema and policy versions;
- submitting organization MSP identifier;
- occurrence timestamp;
- Fabric transaction ID supplied by the network after commit.

Unknown fields are rejected. PHI, PII, patient IDs, names, phone numbers, diagnosis/treatment, file bytes, object keys/URLs, consent content, access justifications, and reversible patient pointers are forbidden.

## Availability behavior

Clinical availability does not depend on continuous Fabric availability. A valid scanned file with confirmed audit evidence may become available while its separate anchor status remains `Pending`. The outbox retries idempotently. The UI must never label an item `Anchored` before Fabric commit confirmation. Terminal retry exhaustion generates an operational incident; it does not silently discard the event.

## Security and governance

- At least two independently governed organizations are required for production consortium operation.
- Production endorsement policy is N-of-M and cannot be finalized until consortium members sign off.
- Client identities use least-privilege attributes and HSM/managed key custody.
- No generated network identity or private key may enter source control.
- Chaincode validates schema, submitting MSP, role attribute, idempotency, and immutable duplicate behavior.
- Every submission is authorized off-chain and again constrained on-chain; Fabric is never an authorization bypass.
- TLS, certificate rotation/revocation, monitoring, backup, disaster recovery, and chaincode upgrade governance are required before pilot.

## Consequences

Fabric provides independently verifiable provenance across organizations but adds operational and governance cost. The architecture therefore isolates it behind `services/ledger-anchor`, keeps patient care functional during ledger outages, and never exposes ledger payloads directly to patient or Ministry clients.
