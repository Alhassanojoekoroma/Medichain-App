# Phase 6 Consortium Deployment Template

This repository does not contain a production Fabric network or reusable private keys. The legacy single-organization network remains a disposable prototype and must not be promoted.

Production entry requires signed identification of at least `MoHMSP` and one governed facility MSP. Each organization must operate its own CA/identity lifecycle and peer. Runtime certificates and keys must be mounted from the approved secret manager and must never be committed.

Required deployment controls:

- mutual TLS on peer, orderer, gateway and CA paths;
- Raft ordering with an approved failure-domain design;
- `AND('MoHMSP.peer','HospitalMSP.peer')` endorsement for the minimized anchor chaincode unless the signed governance decision specifies a safer multi-facility policy;
- certificate issuance, expiry alerting, revocation, rotation and emergency removal procedures;
- no names, contacts, FHIR resources, document locations, stable patient identifiers or unkeyed clinical hashes;
- private-data collections only after a written metadata/privacy assessment;
- off-chain clinical writes and urgent care continue when the ledger is unavailable;
- outbox lag, commit failure, certificate expiry and peer/orderer health monitoring;
- tested backup, restore, organization onboarding/removal and reconciliation runbooks.

The only candidate production chaincode is `backend/chaincode/anchor`. The patient, doctor, consent and audit chaincodes are historical prototypes and are not approved for deployment.
