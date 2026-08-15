# MediChain SL Rebuild Specification

This directory is the authoritative engineering specification for the production rebuild. Older reports remain historical evidence; where they conflict with this directory, this directory wins.

## Locked product boundaries

- Patient mobile navigation is exactly **Home / Records / Profile**.
- Doctors and nurses share one role-aware clinical portal.
- Ministry and Admin remain physically separate web applications.
- PostgreSQL is the system of record. Encrypted object storage holds medical files.
- Every PHI action passes through `packages/policy-engine` and produces durable audit evidence.
- Hyperledger Fabric stores privacy-minimized integrity anchors, never PHI.
- Staff/pharmacy, appointments, labs, video consultation, and AI are outside v1.

## Delivery order

1. Foundations, data classification, threat model, and architecture decisions.
2. Identity, sessions, centralized authorization, and negative tests.
3. Medical-file pipeline, audit guarantee, outbox, and Fabric anchor.
4. Patient and clinical experiences.
5. Ministry aggregation and Admin operations.
6. Offline hardening, observability, infrastructure, external validation, and release builds.

Open stakeholder decisions are tracked in [OPEN-DECISIONS.md](./OPEN-DECISIONS.md). Unresolved decisions default to the safest disabled behavior.
