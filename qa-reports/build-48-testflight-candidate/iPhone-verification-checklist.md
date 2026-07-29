# Genuine iPhone verification checklist

Uploading and processing a binary do not complete this checklist. Execute it only after App Store Connect exposes `1.0.16 (50)` in TestFlight.

## Installation and identity

- [ ] TestFlight shows Adaptive Strength Coach `1.0.16 (50)`.
- [ ] Install build 50 on the genuine iPhone.
- [ ] Confirm production app identity and icon.
- [ ] Confirm launch does not show a development client, Metro dependency or profiling UI.

## Existing user

- [ ] Launch with an existing production-like local account state.
- [ ] Confirm the user is routed past onboarding.
- [ ] Confirm programme, cycle, history and active-workout identity restore unchanged.
- [ ] Confirm Home, Plan and Train reference the same persisted programme/session.
- [ ] Restart and repeat the identity checks.

## Fresh onboarding

- [ ] Use an approved disposable test state, not real customer data.
- [ ] Complete the repaired onboarding path.
- [ ] Confirm programme creation succeeds once and persists atomically.
- [ ] Confirm the first workout is planned/ready, not in progress.
- [ ] Confirm Home shows Start workout until the workout is explicitly started.
- [ ] Confirm Home, Plan and Train reference the same first prescription.
- [ ] Terminate and relaunch; confirm onboarding does not reappear and state remains consistent.

## Protected behavior

- [ ] Start, record, restore and complete a workout.
- [ ] Exercise Discard and confirm its transactional/idempotent behavior.
- [ ] Confirm existing prescriptions, method execution and coaching identity remain unchanged.

If the onboarding defect or existing-user routing failure reproduces, capture exact steps, screenshots and the build number. The defect must not be called fixed on iPhone until this checklist passes.
