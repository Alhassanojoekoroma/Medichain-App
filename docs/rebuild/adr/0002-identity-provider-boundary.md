# ADR 0002: Managed OIDC Workforce Identity and OTP Patient Boundary

- Status: Accepted architecture; provider procurement pending
- Date: 2026-08-02

## Decision

Workforce, Ministry, and Admin users authenticate through an OIDC provider with MFA. Browser applications use secure HttpOnly BFF session cookies and never store bearer tokens. Provider-specific claims are normalized only after issuer, audience, signature, session ID, authentication time, account status, facility, token version, and MFA assurance are validated.

Patients register and recover accounts using a Sierra Leone phone number and single-use SMS OTP. OTP codes are short-lived, attempt-limited, stored only as keyed hashes, and consumed atomically. Changing devices requires OTP plus re-verification according to the approved recovery policy. Security questions are forbidden.

An OTP-authenticated but unverified patient may see only onboarding and verification status. No PHI session, record access, consent action, or local PHI cache is available until in-person verification sets the account to `active`.

## Provider isolation

`services/auth` exposes interfaces for OIDC and SMS delivery. Sandbox adapters are available only when the application is explicitly running with synthetic data. Pilot and production startup fails unless real providers, HTTPS metadata, durable session revocation, and approved claim mappings are configured.
