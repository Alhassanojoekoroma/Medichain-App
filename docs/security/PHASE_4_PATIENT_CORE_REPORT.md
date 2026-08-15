# Phase 4 — Patient Core, Health ID, Consent and Offline Report

**Date:** 2026-07-16  
**Engineering status:** CONDITIONALLY IMPLEMENTED  
**Pilot/production status:** FAIL / STOP SHIP

## Implemented

- Patient-owned, short-lived scoped QR issuance and immediate revocation.
- Atomic one-time QR claim prevents concurrent/replayed scans; signature/version/format/expiry checks fail closed.
- Health ID issuance stores only a SHA-256 reference, shows the raw identifier once and supports lost/replacement lifecycle.
- Authenticated break-glass emergency summary. Anonymous resolution and emergency QR issuance remain disabled pending disclosure approval.
- Patient consent, access-history foundations and patient-only resource policy.
- Encrypted SecureStore outbox bounded to 20 commands and 1.8 KB per command for consent, QR-revocation and profile commands only.
- Offline protocol requires UUID idempotency, base version, valid timestamp, current authentication and sync-time authorization; duplicates, conflicts and revoked authorization are explicit states.
- Android backups are disabled and SQLite uses secure deletion. Real-data startup fails closed until the approved encrypted database/device-key profile is installed.
- FHIR R4 capability and validation boundary for patient-core exchange.

## Verification

- Unit tests cover QR tampering, offline duplicate/conflict/revocation, Health ID replacement and FHIR validation.
- Live synthetic smoke test passed patient/workforce login, consent, one-time QR use, replay denial, Health ID replacement, break-glass, offline command, logout and revoked-session denial.
- The integration test also proves duplicate idempotency and stale-base-version conflict behavior against the running API.
- Mobile TypeScript and security scan pass.
- Dependency audit has 0 critical/high findings. Ten moderate Expo toolchain findings remain and require a separately tested Expo SDK major upgrade; no forced upgrade was applied.

## Exit-gate gaps

1. Public emergency-card fields and physical card/NFC operations require clinical, privacy and patient-representative approval.
2. Approved encrypted mobile database, hardware-backed key/device policy, remote wipe and backup verification are unavailable; real data remains blocked.
3. Registration/recovery and assisted-service flows need the selected IdP and operating organization.
4. Patient notifications, conflict-resolution UI, localization, WCAG 2.2 AA manual evidence and health-literacy/usability thresholds require field work.
5. Offline tests against real PostgreSQL transactions, device loss, clock manipulation and interrupted networks remain required.

Clinical encounters, signed notes, labs, pharmacy and record synchronization are Phase 5 and were deliberately not enabled.
