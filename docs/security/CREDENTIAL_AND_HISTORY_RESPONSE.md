# Credential and Git-History Response Record

**Opened:** 2026-07-16  
**Status:** working-tree containment complete; external revocation and coordinated history response pending authorized owners

## Exposure inventory

| Category | Repository location | Current working tree | History evidence | Required owner action |
|---|---|---|---|---|
| AI provider credential | root `.env.example` | Removed and replaced with a non-secret client example | Path appears in four commits; the value was previously tracked | Provider owner must revoke/rotate and review usage/billing/logs from first exposure onward |
| Fabric CA/orderer/peer/admin/user private keys and certificates | `medichain-network/crypto-config/**` | All 23 tracked generated identity/certificate files removed; path ignored | Directory appears in one commit | Fabric/network owner must invalidate all identities, regenerate from a clean CA/network and verify no external deployment trusts them |
| Client AI configuration | `app.config.js`, `src/services/aiService.ts` | Provider key injection and direct provider call removed; AI feature fails closed | Prior builds may contain the credential | Mobile/release owner must inventory builds, caches, distributed artifacts and invalidate affected builds |
| Fabric application identity | `backend/src/services/FabricGateway.ts` | Repository Admin identity path removed; real mode requires runtime-mounted paths | Previous gateway referenced a tracked Admin identity | Deploy owner must replace with a least-privilege managed identity after Phase 3 governance approval |

No credential values are reproduced in this record.

## Completed containment

- Removed the credential-bearing environment example from the working tree and replaced it with non-secret mobile settings.
- Removed tracked generated Fabric identity/certificate material and added ignore rules for crypto-config, keystore, wallet and `priv_sk` paths.
- Removed direct client AI and legacy provider integrations.
- Removed hard-coded demo passwords from active application code and UI.
- Added a tracked-file security check for private-key headers, common provider credential forms, generated identity paths, direct client AI and local authenticated-session fallback.
- Added CI execution of the security check.

## Pending external actions

Codex does not have authority or provider access to revoke credentials, rewrite shared Git history, delete distributed artifacts or invalidate deployed Fabric identities. Named owners must:

1. revoke/rotate the AI provider credential and preserve only non-sensitive usage evidence;
2. review provider usage, cost anomalies and data submissions during the exposure window;
3. inventory clones, forks, CI caches, release artifacts, mobile bundles and container images;
4. invalidate/rebuild the Fabric CA/network identities and confirm old certificates are no longer trusted;
5. decide whether to rewrite Git history after coordinating every collaborator, remote, protected branch and retained forensic record;
6. run an approved history secret scanner after cleanup and record only path/category/status, never values.

## History-rewrite safety

History rewriting is intentionally not performed in this phase without explicit repository-owner approval and remote coordination. Removing a value from the current tree does not remove it from existing commits, clones or artifacts. Rotation/revocation is the primary containment control; history cleanup is a secondary exposure-reduction action.

## Closure evidence

This response closes only when provider-side revocation, usage review, Fabric invalidation, artifact inventory, coordinated history decision and clean history/artifact scans are attached to the risk record. Until then, the overall release remains FAIL even though the current source tree is contained.
