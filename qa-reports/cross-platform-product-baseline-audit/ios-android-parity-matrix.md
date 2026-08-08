# iOS and Android parity matrix

Status is evidence-based, not inferred from shared components.

| Area | iOS | Android | Finding/evidence |
|---|---|---|---|
| Auth/onboarding | historical native captures; not current-device tested | not tested | unknown parity |
| Home/Plan/Progress/Library | historical iPhone-like captures | not tested | shared code, parity unknown |
| Train logger | historical native captures | not tested | iOS has numeric keyboard accessory; Android uses native keyboard behavior, intentionally platform-specific |
| Rest timer/pause/resume/discard | historical captures/tests | repository tests only | Android retained-upgrade tests exist; physical equivalence unknown |
| Haptics | implementation shared | implementation shared | device behavior unverified |
| Billing | RevenueCat iOS key | RevenueCat Android key plus Android stale-entitlement handling | intentionally platform-specific; store flows unverified |
| Safe area/back | shared safe-area/screens; standard iOS back | Android predictive back disabled | intentional config difference; gesture behavior unverified |
| Tablet/orientation | iPad supported; plist allows rotations | portrait app config | divergent configuration |
| Accessibility/large text | one retained large-text onboarding capture | no capture | Android unknown |
| Backup/account deletion | repository/test evidence | repository/test evidence | platform-independent logic, external and device behavior unverified |
| Offline mode | repository/test evidence | repository/test evidence | physical device unverified |
| Update/migration | iOS release reports exist | explicit Android retained-update regression tests/history | neither current in-place gate completed for 111 |

Conclusion: no journey is labelled “verified equivalent” on current physical devices. Shared logic gives a reasonable expectation, not verification.
