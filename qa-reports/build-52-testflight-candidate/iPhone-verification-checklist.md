# iPhone retained-state verification

Install/update `1.0.17 (52)` from TestFlight over the broken installation; do not delete the app first.

1. Confirm the TestFlight build number is `52`.
2. Launch with the existing retained programme and workout data.
3. Confirm the app does not route the established user into onboarding because of stale `onboardingCompleted` metadata.
4. Confirm an existing active workout restores to Train.
5. Confirm an existing programme without an active workout routes to the authenticated app.
6. Confirm Home, Plan, and Train show the same programme/session identity.
7. Confirm no history, prescriptions, progress, or account ownership changed.
8. Record any failure with screenshot, route shown, and whether an active workout existed.

Uploading and processing a binary do not complete this checklist. Physical-device retained-state behavior remains **NOT PROVEN** until these steps are performed.
