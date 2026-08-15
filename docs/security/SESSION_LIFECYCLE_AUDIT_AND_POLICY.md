# PalmChain session lifecycle audit and policy

**Status:** implementation gate for synthetic-sandbox testing  
**Reviewed:** 2026-07-16  
**Scope:** patient mobile application and doctor, nurse, staff, government, and admin web portals

## Current-state audit

PalmChain issues a short-lived access token with a 15-minute lifetime. The web BFF cookie has the same 15-minute lifetime. Before this change there was no refresh or renewal path, no distinct idle or absolute session timeout, no meaningful-activity model, and no pre-expiry warning. Consequently, an actively working user was signed out when the access credential expired. This was an absolute credential-expiry defect, not an idle-detector defect.

## Gap analysis

| Control | Previous state | Required state |
|---|---|---|
| Access credential | 15-minute token treated as the complete session | 15-minute token rotates inside an authenticated session |
| Idle timeout | Not defined | Server-authoritative 15-minute inactivity limit |
| Absolute timeout | Not defined | Server-authoritative 8-hour ceiling from authentication |
| Activity | Not tracked | Deliberate foreground actions and authenticated application work |
| Reading | No exception | Bounded visible/focused reading grace; never unlimited focus keepalive |
| Warning | None | Accessible 60-second countdown with renew and sign-out actions |
| Background state | Could only expire | Background pages do not extend a session; state is rechecked on return |
| Production renewal | Not implemented | Managed IdP SDK and refresh-token rotation; local renewal is sandbox-only |

## Approved session policy

- **Access-token lifetime:** 15 minutes. This limits bearer-token exposure and is not the user-facing session duration.
- **Idle timeout:** 15 minutes since meaningful activity. Protected application API requests count as work; current-session polling and token renewal do not.
- **Absolute timeout:** 8 hours from the original authentication time. Renewal cannot move this boundary.
- **Warning:** show at 60 seconds remaining and update the countdown. A deliberate **Stay signed in** action may renew only when the idle and absolute limits permit it.
- **Meaningful browser activity:** trusted clicks on actionable controls, form submission, keyboard/scroll interaction while visible, application navigation, and successful foreground application API calls.
- **Not activity:** mouse or pointer movement, an open or background tab, visibility polling, current-session polling, renewal polling, or focus alone.
- **Sustained reading:** visible and focused reading following recent navigation, keyboard, or scrolling may receive at most 10 minutes of reading grace. This prevents long clinical documents from interrupting users without allowing an unattended focused workstation to stay authenticated indefinitely.
- **Mobile activity:** foreground navigation and deliberate interaction. Time spent in the background never extends a session; the server is checked as soon as the app returns.
- **High-risk operations:** break-glass and other high-impact operations continue to require step-up assurance independently of session age.

## Authorization matrix

| Operation | Synthetic sandbox | Pilot/production |
|---|---:|---:|
| Inspect current session | Authenticated actor | Authenticated managed-IdP actor |
| Renew short-lived token | Allowed by PalmChain sandbox endpoint | Forbidden; managed provider SDK only |
| Extend beyond idle limit | Forbidden | Forbidden |
| Extend beyond absolute limit | Forbidden; reauthenticate | Forbidden; reauthenticate |
| Revoke current session | Current actor | Current actor/provider |

## Keep, refactor, replace

- **Keep:** HTTP-only strict web cookie, server-side token verification, session revocation, short-lived access tokens, and managed OIDC requirement for pilot/production.
- **Refactor:** session persistence, expiry response contract, portal session UX, foreground activity classification, and mobile lifecycle checks.
- **Replace before real users:** the sandbox token-renewal endpoint with the selected identity provider's official authorization-code/PKCE and refresh-token-rotation SDK flow. Provider session revocation, recovery, MFA, device controls, and refresh-token reuse detection remain release gates.

## Security decision

The senior developer's warning recommendation is accepted. The suggestion that a focused document should never be considered idle is narrowed for clinical safety: focus alone is insufficient, while recent visible reading interaction receives bounded grace. Client tracking improves user experience, but all timeout decisions remain server-enforced.

