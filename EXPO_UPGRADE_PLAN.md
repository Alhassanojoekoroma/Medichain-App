# Expo SDK Upgrade Plan

## Current Status
- **Current Expo Version:** ~54.0.34
- **React Native Version:** 0.81.5
- **Vulnerabilities:** 10 moderate severity vulnerabilities (uuid package)
- **npm audit recommendation:** Upgrade to expo@46.0.21 (this appears to be incorrect - likely a dependency resolution issue)

## Vulnerability Details
- **Package:** uuid <11.1.1
- **Issue:** Missing buffer bounds check in v3/v5/v6 when buf is provided
- **Severity:** Moderate
- **Affected:** Transitive dependency through xcode → @expo/config-plugins → expo

## Analysis
The npm audit output suggests downgrading to Expo 46.0.21, which is not a viable solution since the current version (54.0.34) is newer. The vulnerability is in a transitive dependency (uuid) that comes through the xcode package used by Expo's build tools.

## Recommended Approach

### Option 1: Wait for Expo Update (Recommended)
- Monitor Expo SDK releases for an update that includes the fixed uuid version
- Current Expo 54 is relatively new; expect a patch release soon
- **Timeline:** 2-4 weeks
- **Risk:** Low

### Option 2: Override uuid dependency
- Add an override in package.json to force uuid >= 11.1.1
- **Risk:** May break xcode compatibility
- **Testing Required:** Full build and test cycle

### Option 3: Accept Risk for Now
- The vulnerability is moderate and requires specific conditions (buf parameter)
- Not directly exploitable in typical React Native usage
- **Risk:** Acceptable for pilot testing
- **Mitigation:** Monitor for security advisories

## Decision
**Recommendation:** Option 3 for now, with Option 1 as the long-term solution. The moderate severity and specific exploit conditions make this acceptable for the pilot testing phase per Tech Health Africa meeting next steps.

## Action Items
1. Document this decision in security review
2. Monitor Expo SDK changelog for uuid updates
3. Re-run npm audit after each Expo SDK update
4. Plan upgrade when fixed version is available

## Testing Checklist (When Upgrade is Available)
- [ ] Update Expo SDK to latest version
- [ ] Run npm audit to verify vulnerabilities resolved
- [ ] Test mobile app build for iOS
- [ ] Test mobile app build for Android
- [ ] Verify all screens render correctly
- [ ] Test authentication flow
- [ ] Test QR scanning functionality
- [ ] Test offline sync
- [ ] Regression test all features

## Notes
- Breaking changes expected with major Expo SDK upgrades
- Allocate 1-2 weeks for testing and migration
- Coordinate with mobile team for testing
