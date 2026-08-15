# Phase 3 — Platform Consolidation and Contracts Report

**Date:** 2026-07-16  
**Engineering status:** CONDITIONALLY IMPLEMENTED  
**Pilot/production status:** FAIL / STOP SHIP

## Implemented

- Shared browser auth client and server-side BFF replace five duplicated active authentication implementations.
- Doctor and nurse portals use capability-filtered proxies; browser code no longer reads or sends bearer tokens.
- Admin, government and staff clients contain no patient/record/consent/treatment endpoint implementation.
- Versioned OpenAPI 3.1 contract at `backend/openapi/palmchain-v2.openapi.json`.
- Shared safe-error, correlation ID, bounded pagination and UUID idempotency primitives.
- FHIR R4 `CapabilityStatement` and minimum validation boundary for Patient, Consent, AllergyIntolerance, MedicationStatement and DocumentReference.
- Government is a separate role rather than an administrator alias.

## Deployment decision

Separate portal deployments remain as a defense-in-depth bundle boundary because clinical, administrative and government capabilities have materially different disclosure risks. Shared identity/BFF code is consolidated. UI shells remain separate until field research establishes whether one workforce shell is safer.

## Verification

- OpenAPI parses and operation IDs are unique.
- Role-bundle tests reject PHI endpoint strings in non-clinical clients and bearer-token storage in clinical clients.
- Doctor, nurse, staff, admin and government production builds all pass.
- Phase 2 authorization tests remain green.

## Exit-gate gaps

- Prototype UI/data modules remain duplicated and use mock data. They are not release evidence and require later vertical migration.
- Full generated-SDK adoption and endpoint-by-endpoint response-schema tests remain incomplete.
- The production OIDC browser flow cannot be finalized until the identity owner selects the provider; password entry is sandbox-only.
- Observability export, protected CI enforcement and target-environment evidence remain external.
