# Phase 10 Pilot Operations Runbook

## Current decision

**FAIL / STOP SHIP.** No pilot environment, facility, service line or real-patient authorization is configured. The procedures below are rehearsal requirements, not evidence that an exercise occurred.

## Pilot boundary

- One named facility and service line only after written approval.
- Named trained users, support rota, data set, start/end dates, outcome measures and rollback authority.
- Fabric and AI remain disabled unless their separate Phase 6/7 gates are signed.
- No production claim may be made from synthetic demonstrations.

## Migration rehearsal

1. Inventory and classify the approved source data without copying it into development.
2. Validate identity, facility, terminology and FHIR mappings with synthetic fixtures first.
3. Run a dry import, reconcile counts and clinical samples, record exceptions and obtain clinical sign-off.
4. Prove rollback to the pre-import snapshot and document deletion of rehearsal artifacts.

## Monitoring and incident response

- Monitor authentication denial/abuse, break-glass, sensitive reads/writes/exports, sync conflicts, clinical task backlog, critical-result acknowledgement, dependency availability, p95 latency, error rate, AI quota/quarantine, Fabric anchor lag, backup age and aggregate-feed completeness.
- Logs use correlation IDs and route templates; never record tokens, patient identifiers, clinical narratives, prompts or full FHIR resources.
- Security or privacy incident: contain, preserve evidence, revoke affected sessions/credentials, notify the accountable incident lead and follow the locally approved Ministry/legal notification clock.
- Clinical-safety incident: stop the affected workflow, preserve the clinical record and audit trail, activate the approved downtime procedure and escalate to the clinical-safety officer.

## Backup, restore and disaster recovery exercise

1. Approve RPO/RTO and backup encryption/key custody before the exercise.
2. Restore PostgreSQL and private object storage into an isolated environment from a selected encrypted backup.
3. Reconcile row/object counts, referential integrity, audit-chain integrity and a clinically reviewed sample.
4. Verify secrets and identities are not restored from repository material.
5. Record actual RPO/RTO, failures, corrective actions and reviewer signatures. Destroy the isolated copy under the approved retention procedure.

## Rollback

- Release manager freezes changes, disables affected feature flags and routes traffic to the last approved artifact.
- Database changes use tested forward-compatible migrations; destructive rollback requires data-owner and clinical approval.
- Queued commands remain visible and are reconciled idempotently after recovery.
- Urgent clinical care continues under the approved downtime workflow; ledger or AI failure never blocks care.

## Training and support

- Train role-specific normal, denied, offline, conflict, correction, emergency and recovery journeys.
- Assess competence with synthetic cases. Record attendee, role, date, trainer, result and retraining need.
- Publish safe support channels, severity definitions, on-call ownership and escalation paths; users must not send PHI through unapproved support channels.

## Go/no-go

Run `npm run release:gate`. It must return `PASS`; editing a status without an immutable evidence reference and accountable review date does not satisfy a gate. Any Critical finding, unresolved High finding, missing legal/Ministry/clinical approval, failed restore/failover, untrained user group, missing rollback or unavailable incident response is STOP SHIP.
