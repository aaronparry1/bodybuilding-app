# Controlled Android in-place recovery checklist

## Before updating

- Do not uninstall the app, clear storage, log out, repeat onboarding, reset data, or discard an active workout.
- Record the installed app version and versionCode from Android App info.
- Capture the current startup failure and current Settings backup status.
- If an approved computer connection is available, begin a filtered `adb logcat` capture without changing application storage.
- Confirm the update is offered through the existing Google Play Alpha closed-testing opt-in/account.

## Install and first launch

1. Use Google Play to update the existing installation. Stop if Android offers a separate install rather than an update.
2. Open the app once while logcat is running where available.
3. Record the first destination shown. Stop if destructive onboarding appears.
4. Confirm the expected programme and its macrocycle, mesocycle and microcycle position.
5. Confirm planned sessions, active-workout identity and completed-set state.
6. Confirm visible workout history and that prior performance still informs recommendations.
7. Confirm Home, Plan and Train show the same programme/session.
8. Open Settings > Recovery diagnostic summary and press **Create read-only summary**. Copy only that redacted summary.
9. Confirm backup status says local, pending, failed/retryable, or verified account backup accurately.

## Stability and safe editing

1. Force-close and reopen twice.
2. Reboot the device and reopen once.
3. Start one programme edit and cancel it; confirm nothing changed.
4. Make one permitted future exercise replacement.
5. Confirm the original exercise history remains attached to the original exercise.
6. Confirm no duplicate programme, workout or history records appear.

Stop immediately if data disappears, counts decrease unexpectedly, onboarding tries to regenerate a programme, an account mismatch appears, storage fails to initialize, or the app crashes. Preserve the installation and send the redacted summary and logcat capture to support.
