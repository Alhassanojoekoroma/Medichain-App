# Medical File Lifecycle

## User-visible states

`Uploading -> Scanning -> Pending verification -> Available`, with `Failed` and retry guidance whenever processing cannot continue. The UI must not infer completion from upload progress alone.

## Server states

1. `authorized`: policy engine approved the exact patient, clinician, facility, purpose, and write scope.
2. `uploading`: resumable upload session exists for a client idempotency key.
3. `quarantined`: bytes are durable in a non-readable quarantine bucket.
4. `validating`: size, declared type, extension, and magic bytes are checked.
5. `scanning`: malware and approved content-disarm checks run.
6. `encrypting`: clean bytes are envelope-encrypted with a unique data key and promoted to the clean bucket.
7. `pending_verification`: server SHA-256, encrypted object reference, provenance, record/outbox transaction, and mandatory audit evidence are confirmed.
8. `active`: patient/authorized clinician preview may be issued by short-lived signed URL.
9. `failed`: the failure is durable, visible to the uploader, and retryable with the same idempotency key when safe.

## Hard gates

- Client hashes are advisory only; the server hash is authoritative.
- File bytes never transit through or persist in Hyperledger Fabric.
- Object keys are C3 PHI pointers and never appear in logs, analytics, ledger payloads, or permanent client links.
- Activation requires `scan=clean`, a 64-character server SHA-256, envelope-encryption evidence, a clean object key, and a confirmed audit event.
- Fabric anchoring is separately visible as `pending`, `anchored`, or `failed_retrying`; an outage cannot silently claim an anchor or destroy a clinical record.
- Signed preview URLs expire in five minutes or less. Full download requires an explicit user action.
