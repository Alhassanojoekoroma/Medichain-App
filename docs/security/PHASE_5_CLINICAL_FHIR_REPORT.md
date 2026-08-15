# Phase 5 — Clinical Workforce and FHIR Workflow Report

**Date:** 2026-07-16  
**Engineering status:** CONDITIONALLY IMPLEMENTED  
**Pilot/production status:** FAIL / STOP SHIP

## Implemented

- An explicit synthetic-sandbox clinical API for patient matching, clinician summary, encounters, signed notes and append-only corrections.
- Cross-role authorization for doctor, nurse, laboratory, pharmacy and scheduling staff actions. Ordering, specimen collection, result entry and dispensing are separated by duty.
- Append-only nursing observations and medication-administration events with actor and timestamp provenance.
- Laboratory order state machine with invalid-transition/replay rejection, corrected results and urgent facility tasks for critical results.
- Prescription and dispensing state machine with command idempotency, partial fills and over-dispense prevention.
- Referral, acceptance, appointment and facility task-queue workflows.
- Versioned downtime-command reconciliation with duplicate detection and stale-version conflicts.
- FHIR R4 capability/validation support for the Phase 5 resource set, bounded Bundle validation, patient Bundle export and validated sandbox import.
- PostgreSQL migration foundations for encounters, notes, observations, labs, prescriptions, dispensing, referrals, tasks and downtime events.

## Verification

- 34 backend tests pass, including state-machine, authorization, provenance, FHIR Bundle and downtime-conflict tests.
- A live synthetic journey passes across patient, doctor, nurse, laboratory, pharmacy and staff sessions.
- The journey creates an encounter, signs and corrects a note, records a nursing observation and administration, processes a critical lab result, rejects a replayed result, partially dispenses a prescription, rejects doctor dispensing and over-dispensing, schedules a referral, exports/import-validates a FHIR Bundle and reconciles a simulated downtime command.
- The OpenAPI 3.1 contract parses and operation IDs are unique.
- Clinical routes remain fail-closed outside the explicit synthetic sandbox.

## Exit-gate gaps

1. The sandbox workflow stores live journey state in contained process memory. Production wiring to PostgreSQL repositories, transactions, encryption and migration evidence remains required.
2. FHIR support is a bounded R4 contract layer, not certified conformance. National profiles, terminology bindings, validation-server evidence, MPI rules and HIE endpoint testing require Ministry/HIE decisions.
3. A qualified clinical-safety officer must review hazards, medication/lab semantics, critical-result escalation, correction policy and downtime forms. Automated simulation is not a completed field downtime exercise.
4. Consent/care-relationship checks must be enforced at every new clinical endpoint through the production policy decision point; the current clinical journey is sandbox-only containment evidence.
5. Laboratory, pharmacy and referral operating organizations, facilities, queues, SLAs and escalation owners are not configured for production.
6. Accessibility, localization, health-literacy and representative Sierra Leone clinician/patient usability evidence remain external field work.
7. Final Sierra Leone legal obligations and data-protection controls require local counsel/regulator confirmation before real patient data.

## Decision

Phase 5 is suitable for continued synthetic development and controlled demonstrations only. It is not approved for a real-patient pilot, production deployment or public access. Phase 6 Fabric consortium work may begin as an isolated synthetic engineering track, but it must not be treated as authorization to place clinical records, identifiers or secrets on-chain.
