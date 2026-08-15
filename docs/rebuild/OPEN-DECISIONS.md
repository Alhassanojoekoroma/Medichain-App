# Open Stakeholder Decisions

Unresolved decisions use the default-safe behavior shown below.

| Decision | Owner | Default until approved |
|---|---|---|
| Final product name: MediChain SL or PalmChain | Product/Ministry | MediChain SL user-facing; PalmChain reserved as technical legacy name |
| Nurse permission set | Clinical governance | read-only; `NURSE_CAN_WRITE_RECORDS=false` |
| Patient-facing languages beyond English | Product/communities | English with i18n-ready message keys |
| Identity provider and hosting | Legal/MOHS/engineering | OIDC adapter; no production login until configured |
| SMS/push supplier | Procurement/engineering | provider interface; no simulated delivery in production |
| Hosting jurisdiction and data residency | Legal/MOHS | synthetic data only |
| Accepted in-person identity evidence and patient matching rules | MOHS/pilot hospitals | manual verified status; no automatic merge |
| Retention and purge timelines | Legal/privacy/clinical governance | soft delete only; purge disabled |
| Ministry minimum cell size and indicators | Ministry/privacy | configurable conservative threshold; not approved for production |
| Admin oversight / compliance super-admin | Ministry/compliance | no unrestricted admin PHI access; disputed actions externally reviewed |
| Fabric consortium members, endorsement N-of-M, hosting, HSM owner | MOHS/hospitals/legal | development network only; production deployment blocked |
