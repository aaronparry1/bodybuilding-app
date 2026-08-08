# Automated release-gate result — 2026-08-08

## Decision

The automated release gates pass. A protected Android internal-testing candidate and a signed iOS candidate were built without modifying Candidate 111. Android store processing and iOS upload status are recorded below; neither candidate is approved for public release.

## Source and changes

- Starting commit: `4b35b6b3c4a5010020b7edb8f5590ab67b52fc43`
- Expo alignment commit: `aa3271c9effe2a953716edca27b5f03612a3b10a`
- iOS pod-lock reconciliation commit: `224c9938b655661f941dbcc0b1b5417ce40844e1`
- Production application code changed: no.
- Tests, test assertions and test-runner configuration changed: no.
- Expo/native configuration and release metadata changed: no.
- Candidate 111 was not queried, installed, promoted, replaced, overwritten, deleted or modified.

The eight direct Expo SDK 56 alignments were:

| Package | Previous | Aligned |
| --- | ---: | ---: |
| `expo` | `~56.0.8` | `~56.0.19` |
| `expo-build-properties` | `~56.0.16` | `~56.0.25` |
| `expo-linking` | `~56.0.13` | `~56.0.16` |
| `expo-router` | `~56.2.8` | `~56.2.18` |
| `expo-sharing` | `~56.0.17` | `~56.0.24` |
| `expo-sqlite` | `~56.0.4` | `~56.0.5` |
| `expo-symbols` | `56.0.5` | `56.0.7` |
| `react-native-screens` | `4.25.2` | `4.26.0` |

The iOS lock then moved `RNPurchases`/`RNPaywalls` from 10.2.0 to the installed 10.6.0 wrapper version, `PurchasesHybridCommon`/UI from 18.8.0 to the wrapper-required 18.28.0, and RevenueCat/UI from 5.74.0 to 5.83.0. A targeted CocoaPods update and a subsequent `pod install --no-repo-update` both completed.

## Diagnosis and verification

The original TypeScript and Metro stalls were environment I/O stalls, not compiler, bundler or application deadlocks. The repository is in an iCloud-backed Documents directory; tracked files and Git objects were present as dataless/compressed placeholders, and blocked processes were sleeping in synchronous file reads. A controlled local copy read all 2,261 tracked files and both commands then completed normally. Shell Node 23.9.0 was also outside React Native 0.85's supported Node lines; verification and builds used bundled Node 24.14.0.

| Gate | Result |
| --- | --- |
| `expo install --check` | pass; dependencies up to date (0.87 s on the aligned dependency commit) |
| `npm run typecheck` | pass; 4.17 s after final native-lock change |
| timing-sensitive three-test group | 3 files, 25 tests passed; 1.14 s Vitest / 2.12 s wall; no timeout or config change |
| focused recovery matrix | 12 files, 70 tests passed; 1.32 s Vitest / 1.67 s wall |
| Train active experience | 1 file, 13 tests passed; 541 ms Vitest / 0.91 s wall |
| full suite | 396 files, 2,410 tests passed; 34.99 s Vitest / 35.88 s wall; `--maxWorkers=2 --testTimeout=30000` |
| production web export | pass; 1,335 modules, 2.46 s; `APP_ENV=production EAS_BUILD_PROFILE=production EXPO_NO_DOTENV=1` |
| production payload scan | pass; 27 files, zero forbidden findings |
| resolved production config | version 1.0.18; Android `com.aaronparry.adaptivestrengthcoach`; iOS `com.aaronparry.adaptivestrengthcoach` |

The three timing-sensitive files were `canonical-adaptive-planning-system.test.ts`, `canonical-p1a-policy-quality-certification.test.ts`, and `home-design-qa-production-boundary.test.ts`. They did not reproduce a shared-state, timer, handle or product defect. The stable full-suite command retains two workers and the existing 30-second timeout; no test was skipped, weakened or broadly serialized.

## Candidate traceability

### Android

- App/build: 1.0.18 (versionCode 113).
- EAS build: `6a570d35-cab8-43d4-9feb-e1de1551e79a`.
- Source: `aa3271c9effe2a953716edca27b5f03612a3b10a`.
- AAB SHA-256: `24da767a49c45000d41aa143c56cacf512c287a71617f1c64393784cdee3f8bb`.
- Destination: Google Play `internal`; submission `c1b52a6b-d7c5-45ef-9c0b-bcdea468ae9f`.
- Status: submission `FINISHED`; Google Play accepted the app on the `internal` track.
- Note: remote auto-increment consumed 112 during a packaging attempt that created no build artifact; no counter was reset because Candidate 111 is protected.

### iOS

- App/build: 1.0.18 (55).
- EAS build: `162c523b-6000-4436-9e30-5520e860461f`.
- Source: `224c9938b655661f941dbcc0b1b5417ce40844e1`.
- IPA SHA-256: `ca4d1846f4bad91776fc82409304c88af4d698121c26d71802fa0c23db5f383f`.
- Inspected metadata: bundle `com.aaronparry.adaptivestrengthcoach`, version 1.0.18, build 55, Team ID `5A854TFKYL`.
- Destination attempted: App Store Connect/TestFlight only.
- Status: signed IPA finished; two EAS Submit jobs (`322fe971-c661-47c8-9644-2aaeb6603f7b`, `c53cc27e-6808-449f-a8be-02781f55ff55`) errored without an Apple receipt or diagnostic log. The build is not claimed available in TestFlight.
- Preceding build 54 failed before archive creation because the old lock pinned `PurchasesHybridCommon` 18.8.0 while wrapper 10.6.0 required 18.28.0. Build 55 proves the targeted lock repair.

## Remaining blockers and next owner action

Automated source gates are green. Public release remains prohibited. The Android candidate must finish Play processing and both platforms still require the evidence in `physical-device-certification.md`. iOS additionally requires an App Store Connect upload of the already-built build 55; inspect the EAS submission page or upload the exact IPA with Apple Transporter, without generating another build.
