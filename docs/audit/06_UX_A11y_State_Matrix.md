# PalmChain V2 UX and Accessibility State Matrix

**Audit type:** static source inventory; rendered/manual device and assistive-technology testing was not performed  
**Target:** WCAG 2.2 AA plus truthful, low-connectivity, shared-device and clinical-safety behavior  
**Current result:** implemented screens/components exist, but conformance and critical state completeness are **Absent/unknown**.

## 1. Evidence summary

- 20 named mobile screens were found under `src/screens/`.
- 64 Next.js `page.tsx` routes were found across the five portals.
- No route-level `loading.tsx`, `error.tsx` or `not-found.tsx` files were found in the portals.
- Shared UI primitives contain useful focus and ARIA patterns (for example spinner labels, breadcrumbs, form `aria-invalid`, pagination labels), but component-level attributes do not prove page/workflow conformance.
- No automated accessibility, component, end-to-end or other test files were found.
- Doctor portal lint could not start because its ESLint executable was unavailable; root TypeScript failed on generated nurse route declarations.
- Mock/simulation paths can show “verified”, “anchored”, authenticated or extracted results without a trustworthy backend event. This is a safety/UX defect, not only a backend defect.

## 2. Required shared state contract

Every important route/action must implement the applicable states below with a consistent visual label, programmatic status, audit/provenance semantics and recoverable next step.

| State | Required behavior |
|---|---|
| First use / empty | Explain why empty, privacy implications, prerequisite and one primary next action; never populate fake clinical data outside explicit demo mode |
| Loading | Preserve page context; announce status without repeated screen-reader noise; avoid layout shift; cancel/timeout where relevant |
| Success | State exactly what occurred: local draft, server saved, signed, queued, committed, anchored or delivered; never collapse them into “verified” |
| Validation error | Inline association, summary/focus for long forms, preserve values, plain-language correction, no raw provider error |
| Authentication expired | Protect PHI immediately, preserve safe draft if approved, explain reauthentication and avoid redirect loops |
| Authorization denied | Non-enumerating explanation and safe next step/request workflow; no hidden content in DOM/client cache |
| Offline | Clearly distinguish available cached data, unavailable data and forbidden actions; show last verified timestamp and privacy warning |
| Queued sync | Stable operation ID, item count, retry/cancel rules and “not yet saved to server” wording |
| Partial/degraded dependency | Name affected capability without exposing internals; continue only safe unrelated work; never simulate success |
| Conflict/stale data | Show server/local versions, clinical author/time, safe merge/correction options and escalation; never last-write-wins silently |
| High-risk confirmation | Reauthenticate/step-up as required; summarize patient, action, scope, purpose, expiry and irreversible/retention consequences |
| Completed/recoverable | Provide receipt/reference, audit/provenance status, next step, and accessible way to retry or report a problem |

## 3. Mobile screen inventory and state requirements

Legend: `E` empty/first use, `L` loading, `V` validation, `A` authn/authz, `O` offline, `Q` queued, `D` degraded, `C` conflict/stale, `H` high-risk confirm, `R` receipt/recovery. All marked states require acceptance tests.

| Screen | Data/action risk | Required states | Specific acceptance emphasis |
|---|---|---|---|
| `LoginScreen` | credentials/session | L,V,A,D,R | generic invalid response; throttling/lockout; password manager; keyboard; no demo fallback in pilot |
| `HomeScreen` | PHI summary/navigation | E,L,A,O,D,C | shared-device concealment; last-updated/source; no mock content; logical heading/focus |
| `RecordsScreen` | clinical history/export | E,L,A,O,D,C,R | category/source/provenance; accessible filter; no hidden unauthorized data; large-text reflow |
| `ReportUploadScreen` | medical file/AI | L,V,A,O,Q,D,C,H,R | type/size/scan status; processor consent; upload vs AI vs clinician-confirmed states; cancel/retry |
| `QRGenerateScreen` | capability token/emergency PHI | E,L,A,O,D,H,R | scope/audience/expiry/replay warning; revoke action; printable privacy; never encode PHI |
| `DoctorScanScreen` | scan/patient access | L,V,A,O,D,H,R | camera alternative; permission denied; wrong/expired/revoked token; minimum data; access audit |
| `ConsentManagerScreen` | lawful basis/access | E,L,V,A,O,Q,D,C,H,R | plain-language grantee/action/category/purpose/expiry; revoke future effect; receipt/version |
| `AccessRequestsScreen` | approve/deny PHI access | E,L,V,A,O,Q,D,C,H,R | requester identity/facility/purpose; no all-data default; approve/deny focus and confirmation |
| `AccessHistoryScreen` | audit/transparency | E,L,A,O,D,C,R | actor/purpose/outcome in understandable terms; dispute/report path; redaction |
| `DataPrivacyScreen` | rights/hidden fields/export/delete | E,L,V,A,O,Q,D,C,H,R | distinguish correction, hiding, deletion request and legal retention; no false deletion claim |
| `SecurityScreen` | sessions/keys/recovery | E,L,V,A,O,D,H,R | active devices/session revoke; recovery limits; no fake key assurance; copy/screenshot warnings |
| `ChangePasswordScreen` | credential mutation | L,V,A,D,H,R | current password/step-up; strength guidance; session invalidation; accessible errors |
| `ProfileScreen` | identity/demographics | E,L,V,A,O,Q,D,C,H,R | verified vs self-entered fields; correction history; identity mismatch escalation |
| `MedicationsScreen` | active/historical medication | E,L,A,O,D,C,R | active/stopped status, dose/timing source, emergency relevance; no AI-created active status |
| `AllergiesScreen` | high-risk clinical data | E,L,A,O,D,C,H,R | “none recorded” vs “no known allergy”; severity/source/date; urgent correction path |
| `AppointmentsScreen` | scheduling/contact | E,L,V,A,O,Q,D,C,H,R | timezone/facility; duplicate retry; cancellation consequence; calendar semantics |
| `ExploreDoctorsScreen` | provider discovery | E,L,V,A,O,D,R | verified credential/facility distinction; filters/keyboard; no misleading availability |
| `DoctorProfileScreen` | provider identity | E,L,A,O,D,R | authoritative credential source/date; report discrepancy; do not expose excess personal data |
| `NotificationsScreen` | PHI in device alerts | E,L,A,O,D,R | redacted lock-screen content; read state; deep-link reauth; bulk controls accessible |
| `HelpCenterScreen` | support/privacy incident | E,L,A,O,D,R | emergency vs support distinction; accessible contact methods; no PHI in insecure channel |

## 4. Workforce portal inventory

### Doctor portal

| Routes | Core risk | Required states and controls |
|---|---|---|
| `/login`, `/`, `/dashboard` | auth/session and PHI overview | L,V,A,D; generic auth failure, active facility/role, timeout, shared-screen concealment, no mock fallback |
| `/patients`, `/patients/[id]`, `/patients/new` | lookup, chart and enrollment | E,L,V,A,D,C,H,R; non-enumeration, care relationship, MPI/duplicate warning, field masks, provenance |
| `/records`, `/records/upload` | chart read/file/record mutation | E,L,V,A,O/Q where approved,D,C,H,R; author/sign/status; upload scan; no fabricated ledger proof |
| `/scan` | QR/emergency access | L,V,A,D,H,R; responder/workforce identity, expired/revoked token, minimum necessary and access receipt |
| `/access-log` | audit metadata | E,L,A,D; facility/case scoping, export controls, redaction and privacy escalation |
| `/appointments` | scheduling | E,L,V,A,D,C,H,R; duplicate/cancel conflict and timezone |
| `/analytics` | aggregate/PHI inference | E,L,A,D,C; metric definitions, date/source, small-cell suppression, no mock “live” claims |
| `/notifications`, `/settings` | PHI alerts/session/preferences | E,L,V,A,D,H,R; redaction, session/device management, safe saved-state feedback |
| `/public/emergency`, `/public/patient-qr/[id]` | public PHI capability | target should not be a general public chart; expired/revoked/invalid state must be non-enumerating and minimal |

### Nurse portal

| Routes | Core risk | Required states and controls |
|---|---|---|
| `/login`, `/`, `/dashboard` | role/session/task list | L,V,A,D; nurse-specific capability from server, not doctor default |
| `/patients`, `/patients/[id]`, `/patients/new` | nursing scope/registration | E,L,V,A,D,C,H,R; assigned care, minimum fields; enrollment role approval |
| `/records`, `/records/upload` | nursing documentation/file | E,L,V,A,D,C,H,R; nursing scope, author/signature, no direct unrestricted clinical read |
| `/scan` | token access | L,V,A,D,H,R; role/facility/care or break-glass checks |
| `/appointments`, `/notifications`, `/settings` | workflow/preferences | E,L,V,A,D,C,R; safe retry and shared-device privacy |
| public QR/emergency routes | emergency privacy | same target restrictions as doctor portal; no anonymous broad PHI |

### Staff/pharmacy portal

| Routes | Core risk | Required states and controls |
|---|---|---|
| `/login`, `/`, `/dashboard` | task-scoped session | L,V,A,D; exact pharmacist/staff capability, no default doctor role |
| `/prescriptions`, `/dispensing` | medication safety | E,L,V,A,D,C,H,R; valid order, patient match, allergy/minimum context, duplicate dispense/reversal, signer |
| `/inventory` | stock integrity | E,L,V,A,D,C,H,R; unit/batch/expiry, concurrent adjustment conflict and audit |
| `/appointments`, `/notifications`, `/settings` | operations/privacy | E,L,V,A,D,C,R; minimum PHI and redaction |
| public QR/emergency routes | excess scope | staff must not receive general emergency/chart data unless explicit responder role/policy |

### Facility admin portal

| Routes | Core risk | Required states and controls |
|---|---|---|
| `/login`, `/`, `/dashboard`, `/health` | privileged session/operations | L,V,A,D,H; MFA/step-up; platform health details protected; no raw error/PHI |
| `/users`, `/register` | identity/role elevation | E,L,V,A,D,C,H,R; authoritative credential/facility, separation of duties, no self-elevation, invite expiry |
| `/access`, `/audit` | access policy/audit | E,L,V,A,D,C,H,R; metadata-first, scoped investigation, dual-control export and immutable evidence |
| `/notifications`, `/settings` | privileged changes | E,L,V,A,D,C,H,R; before/after summary, reason, approval, rollback and session impact |
| public QR/emergency routes | public capability | should be isolated from admin shell and minimized/non-enumerating |

### Government/Ministry portal

| Routes | Core risk | Required states and controls |
|---|---|---|
| `/login`, `/`, `/dashboard` | national analytics session | L,V,A,D; strong auth, approved analyst purpose, no patient-level access |
| `/regional`, `/disease-map`, `/drugs`, `/reports` | re-identification and decision quality | E,L,V,A,D,C,H,R; metric/source/coverage/quality, date, suppression, uncertainty, accessible non-color encoding, export approval |
| `/notifications`, `/settings` | policy/alert preferences | E,L,V,A,D,H,R; sensitive alert redaction and purpose controls |
| public QR/emergency routes | inappropriate government PHI path | remove from Ministry product unless separately justified; no patient chart access |

## 5. Cross-workflow state matrix

| Workflow | Empty/first use | Loading/success | Validation/denial | Offline/queued | Degraded/conflict | Confirmation/recovery |
|---|---|---|---|---|---|---|
| Login/session | onboarding/recovery entry | progress; signed-in facility/role | generic error; lockout/support | no offline authentication for protected data | IdP unavailable; no demo fallback | MFA/recovery receipt; revoke other sessions |
| Patient lookup | recent/assigned empty | scoped result with source/time | no existence leak; request access | cached assigned list only if approved | registry/data source unavailable/stale | choose exact patient; mismatch escalation |
| Read chart | no records vs unavailable | provenance and field/category mask | purpose/consent/care denial | last verified and restricted cache | source unavailable; conflicting versions | report error/request correction |
| Create/sign record | draft | local/server/signed/committed separated | field errors and authorization loss | local draft or approved queue | stale chart/signature/Fabric failure | patient/action summary; receipt and retry |
| Consent | no grants | versioned receipt | invalid grantee/scope; denied role | read-only receipt; queue only if approved | permission changed/conflict | plain-language scope/expiry; revoke outcome |
| Emergency | no profile/token | minimum dataset and timer | invalid/revoked token without enumeration | explicit offline card limitation | responder identity/policy service unavailable fails closed | reason/step-up; patient/reviewer follow-up |
| File/AI | no files/jobs | upload→scan→stored→AI pending→reviewed | type/size/malware/schema/human rejection | safe queued upload only | provider/storage unavailable; never fake output | processor consent; clinician confirmation/rollback |
| Offline sync | no pending items | per-item syncing/committed receipt | auth/permission denied retained safely | queue count and last attempt | duplicate/stale/partial conflict | discard/edit/retry/escalate with consequences |
| Export/report | no eligible data | asynchronous progress; dated source | scope/suppression/approval denial | no silent background export | source partial/stale | purpose/recipient/fields; expiring download and audit |

## 6. WCAG 2.2 AA verification checklist

### Perceivable

- Text and meaningful graphics meet contrast; status is not color-only.
- 200% text and 400% reflow preserve clinical data/action without two-dimensional scrolling except genuine tables.
- Images/scans have appropriate labels; decorative icons are hidden; charts include data/table alternatives.
- Error, offline, queued, conflict, emergency and verification states have text labels.

### Operable

- All controls and data grids are keyboard operable with visible focus; skip links and logical heading/landmark structure exist.
- Modals/drawers trap and restore focus; destructive/consent/emergency dialogs are not dismissible accidentally.
- Touch targets meet WCAG 2.2 target-size expectations or allowed spacing exceptions.
- Camera/scan has a manual token/accessibility alternative.
- Timeouts warn users, allow extension where safe, protect PHI on expiry and do not lose approved drafts.

### Understandable

- Labels/instructions precede input; errors identify field and correction; entered values survive errors.
- “No known”, “not recorded”, “pending”, “unverified”, “failed”, “revoked” and “expired” are never conflated.
- Consent, sharing, upload/AI, export, correction/deletion and emergency consequences are plain language and non-coercive.
- Date/time, medication dose, units, facility and patient identity are unambiguous.

### Robust

- Semantic HTML/native accessibility roles, names, values and states are present.
- Dynamic status uses appropriate `aria-live`/native announcement without stealing focus or repeating.
- Tables/charts expose headers/relationships; form errors use `aria-describedby`; invalid state is programmatic.
- Automated axe-like checks are supplemented with NVDA/JAWS/VoiceOver/TalkBack and keyboard testing on supported combinations.

## 7. Privacy, safety, localization and comprehension

| Area | Current risk | Required acceptance evidence |
|---|---|---|
| Shared devices | long sessions/sessionStorage, notification and cached PHI exposure | inactivity timeout, reauth for high-risk action, conceal/reveal, logout clear, lock-screen redaction and device-switch tests |
| Low connectivity | simulation can mask failure; offline queue semantics unclear | representative 2G/intermittent/no-network tests with explicit truthful states and no duplicates/loss |
| Health comprehension | AI summaries and clinical terms may be treated as advice | clinician/content review, plain-language explanation, uncertainty/source, urgent-care guidance only when clinically approved |
| Localization | no verified locale/language workflow | user research for Sierra Leone languages/literacy, translatable strings, locale dates/numbers, content approval and fallback |
| Charts/analytics | color maps and mock precision can mislead | keyboard/data alternative, color-independent legend, source/coverage/date/uncertainty/suppression and small-screen tests |
| Irreversible actions | token share, revoke, export, public IPFS and “delete” consequences unclear | before-action summary, authentication/approval, exact retention/deletion limits, receipt and recovery/escalation |

## 8. Required test matrix

For every critical workflow, test at minimum:

- keyboard-only at 100% and 400% zoom/reflow;
- Windows screen reader + Chromium, iOS VoiceOver and Android TalkBack for mobile-critical flows;
- high contrast/dark mode, reduced motion, text scaling and color-vision simulation;
- touch targets on small phones and landscape; camera denied/unavailable;
- expired/revoked session, wrong role/facility, denied/revoked consent and unrelated patient;
- slow response, timeout, dependency partial failure, offline queue, reconnect, duplicate and conflict;
- shared device/background/resume/notification/deep-link behavior;
- synthetic clinical content reviewed for comprehension and ambiguity;
- no secret/PHI in screenshots, URLs, client logs, error copy or analytics events.

## 9. Exit criteria

This matrix can pass only when critical journeys have explicit acceptance tests for every applicable state, automated accessibility checks are green, qualified manual WCAG 2.2 AA testing has no unresolved critical/serious issue, representative patients/workforce complete low-connectivity usability testing, and UI status is backed by server provenance rather than mock or simulated success. Static source presence is not conformance evidence.
