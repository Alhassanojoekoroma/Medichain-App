# Phase 6 — Fabric Consortium Trust Layer Report

**Date:** 2026-07-16  
**Engineering status:** CONDITIONALLY IMPLEMENTED  
**Consortium/production status:** FAIL / STOP SHIP

## Implemented and verified

- Minimal seven-field ledger-anchor schema containing a random event reference, allowed event type, keyed digest, policy version, organization and time. Raw PHI, FHIR data and stable patient identifiers are excluded.
- Deterministic anchor validation, invalid-MSP/role denial, multi-organization endorsement evaluation and idempotent reconciliation state logic.
- A new `palmchain-anchor` Go chaincode with strict JSON decoding, MSP allow-listing, `palmchain.role` client-certificate authorization, exact-replay idempotency and immutable event IDs.
- Gateway adapter accepts only validated minimized anchors.
- PostgreSQL outbox migration foundation and a consortium deployment/control template covering TLS, Raft, PKI lifecycle, monitoring, rotation, restoration and organization lifecycle.
- TypeScript governance tests pass and the Go chaincode compiles with `go test ./...`.

## Remaining gates

The Phase 6 entry gate is not satisfied: no signed consortium agreement, approved organizations, production MSPs, managed CAs, deployed TLS topology or clinical-data placement approval was supplied. Multi-peer deployment, endorsement, outage, certificate rotation, backup/restore, penetration and privacy tests therefore cannot be claimed. Legacy patient/doctor/consent/audit chaincodes and the single-organization network remain prohibited for production.

Clinical writes remain off-chain-first and Fabric remains disabled by default. Release recommendation: **FAIL for real consortium use; CONDITIONAL for synthetic engineering only.**
