# Canonical release-candidate certification

The release-candidate working tree based on `146462e9553938a14e2454ed2e51c727d1e5da1` passes every pre-upload gate. EAS reports remote iOS build `44` and the latest production artifact as `1.0.13 (44)`, so the release candidate is `1.0.14 (45)`.

## Closed blockers

- **Production payload:** production uses the separate `app-production` router graph. The native archive scan inspected 104 files and the web export scan inspected 27 files; both returned zero Design-QA, preview, ordinary-v2, EXDevLauncher, EXDevMenu, or expo-dev-client findings.
- **Native customer journey:** repository-owned XCUITest completed the fresh-install 60-minute journey on an iPhone 17 Pro and an iPhone SE (3rd generation) at accessibility-extra-extra-extra-large Dynamic Type. No manual clicks or production fixture backdoor were used.
- **60-minute planning:** the five-day intermediate hypertrophy PPL now constructs five sessions estimated at 54, 55, 56, 51, and 51 minutes. Priority compounds remain unchanged, all retained exercises have at least two sets, and hamstring/calf work is recovered across the complete six-session rotation.

## Native evidence

- Modern journey: `/tmp/ASC-RC-modern-final3.xcresult` — passed, 192.392 seconds.
- Narrow accessibility journey: `/tmp/ASC-RC-narrow-final11.xcresult` — passed, 425.712 seconds.
- Persistence/recovery: stale future, idempotent second launch, corrupt plan, and incompatible active attempt all passed in `/tmp/asc-ios-persistence-results/`.
- Generic-device Release archive: `/tmp/AdaptiveStrengthCoachRC-archive10.xcarchive` — `ARCHIVE SUCCEEDED`; Xcode store validation passed.
- Native screenshots: `qa-reports/release-candidate/native-screenshots/{modern,narrow,recovery}` — 33 current screenshots.

## Duration decision

| Duration | Result | Behaviour |
| --- | --- | --- |
| 30 min | Fail closed | Explains the exact chronic coverage conflict and offers longer duration, fewer days, or another framework. |
| 45 min | Fail closed | Same atomic, actionable rejection; the existing preference is unchanged. |
| 60 min | Viable | Canonical redistribution across the rolling rotation; every session is within 60 minutes. |
| 75 min | Viable | Full eligible starting prescription. |
| 90 min | Viable | Full eligible starting prescription. |

The native Settings journey proves supported 60/75/90 changes rebuild future work while preserving completed history. It also proves 30/45 choices do not silently mutate the current setting.

## Verification

- Focused release-candidate suite: 13 files, 86 tests passed.
- Complete suite: 356 files, 2,114 tests passed; zero failures.
- Baseline reconciliation: 355/2,110 to 356/2,114 = +1 test file and +4 tests.
- TypeScript: passed.
- Production Expo public config: passed.
- Production web export and payload scan: passed.
- Native Release archive and payload scan: passed.
- `git diff --check`: passed.

The native performance evidence is intentionally described as a basic interaction smoke gate. It found no automation timeout, native exception, or obvious interaction regression, but it is not a comprehensive Instruments, React render, long-lived-account, or memory-leak certification.

## Decision

`allPreUploadGatesPassed` and `releaseCandidateCertified` are true.

## TestFlight upload

- EAS build: `0810f076-c114-4737-92cc-379675043889` — finished successfully.
- EAS build page: <https://expo.dev/accounts/arxapps/projects/hypertrophy-app/builds/0810f076-c114-4737-92cc-379675043889>
- EAS submission: `7d39f089-0fd6-4973-91c4-30143e0aa8cc` — uploaded successfully.
- EAS submission page: <https://expo.dev/accounts/arxapps/projects/hypertrophy-app/submissions/7d39f089-0fd6-4973-91c4-30143e0aa8cc>
- App Store Connect application: `6762462649`.
- Uploaded identity: `1.0.14 (45)` for `com.aaronparry.adaptivestrengthcoach`.
- Current Apple state: uploaded and processing for TestFlight.
- Internal testing availability: pending Apple processing.
- App Review submission: not performed.
- Public release: not performed.

The production TestFlight build and upload are complete. Public release and App Review submission remain unauthorized.
