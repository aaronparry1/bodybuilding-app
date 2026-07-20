# Canonical release-candidate certification

The integration candidate is automated-test green, compiles as an isolated iOS Release app, installs, and launches. It is **not certified for upload** because the required native interaction matrix could not be executed and QA fixture identifiers remain embedded in the Release JavaScript payload.

## Candidate scope

- Source HEAD: `fc9c80cbf774e022ccd9f865503255896d0c7f61`
- Commits since the latest uploaded source (`58d8ffb`): 14
- Resolved identity: Adaptive Strength Coach 1.0.13 (44)
- Bundle identifier: `com.aaronparry.adaptivestrengthcoach`
- EAS profile: `production`
- Production canonical flags: enabled and strict
- Shadow mode, ordinary-v2 authority and Design-QA mode: disabled

The marketing version and build number were deliberately not changed because the pre-upload gate did not pass.

## Automated verification

- Focused migration/lifecycle/duration/presentation: 39 tests passed.
- Focused planning: 41 tests passed.
- Design-QA, production boundary and UI: 150 tests passed.
- Full suite: 355 files and 2,110 tests passed; zero failures.
- TypeScript, production Expo public config, web export, test discovery and diff checks passed.

## Persistence and duration

The [persisted-state matrix](canonical-persisted-reconciliation-matrix.json) covers onboarding, missing plans, four- and five-day historical plans, missing `targetReps`, missing duration, calibration, active/paused/corrupt attempts, and completed history with missing or stale future work. Completed ledger data is not rewritten. Future work is reconstructed through current Session Construction with a carrier compare-and-swap and idempotent retry behavior.

The [duration matrix](canonical-duration-coverage.json) labels per-session, calendar-slice, complete-rotation and normalized-seven-day quantities separately. In the representative intermediate five-day PPL scenario, 30, 45 and 60 minutes fail closed because authorised rolling coverage cannot be retained. 75 and 90 minutes pass. A requested 60-to-45 change is rejected atomically; a viable 90-to-75 change proves the application path.

## Native evidence

An isolated arm64 Release app was compiled with Xcode 26.6 for an iPhone 17 Pro simulator on iOS 26.5. Public backend and billing values were replaced with disabled local values and the successful bundle made no remote request. The app installed and launched without an uncaught application error.

Captured simulator evidence:

- [Standard onboarding](native-screenshots/ios-release-launch.png)
- [Accessibility-large onboarding](native-screenshots/ios-release-onboarding-accessibility-large.png)

Only the initial onboarding state was genuinely observed. Simulator.app exposed no desktop or accessibility window even after resetting only its window-layout preferences; `simctl` offers framebuffer capture but no touch injection, and no native UI automation runner is installed. Therefore Home, Plan, Train, Progress, cardio, Library, Settings, keyboard, timers and error states were not interactively certified.

Bundle inspection found no EXDevLauncher or EXDevMenu app bundle and no `expo-dev-client` marker. EXDevMenu interface symbols are transitively linked. The Hermes bundle still contains Design-QA fixture identifiers. Although runtime guards disable Design-QA in production, that does not satisfy the stricter no-fixture-payload gate.

## Decision

- All pre-upload gates passed: **false**
- Release candidate certified: **false**
- Version/build incremented: **false**
- App Store archive created: **false**
- TestFlight upload attempted: **false**
- Upload authorized: **false**

No build was uploaded and no App Review or public-release action occurred.
