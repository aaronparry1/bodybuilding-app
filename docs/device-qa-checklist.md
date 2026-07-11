# Iron Logic Device QA Checklist

Use this on a physical iOS or Android device against the staging Supabase project.

## Build Info

- Tester:
- Date:
- Device:
- OS version:
- Build profile: development / preview / production
- Build number:
- Supabase project ref:
- RevenueCat project/app:
- Network mode: online / offline / offline-to-online

## Tester Accounts Needed

- [ ] Supabase/app test account email:
- [ ] Supabase/app test account password stored securely outside this checklist.
- [ ] Apple sandbox tester email for iOS purchases:
- [ ] Google Play test user email for Android purchases:
- [ ] Tester is added to the correct TestFlight/Internal Testing distribution group.
- [ ] Tester is added to App Store Connect sandbox testing or Google Play license/internal testing.

## Fresh Install

- [ ] App installs successfully.
- [ ] App icon, name, splash, and dark theme appear correctly.
- [ ] First launch does not show missing environment errors.
- [ ] App can be killed and reopened without losing navigation state unexpectedly.

## Onboarding

- [ ] Onboarding appears for a new install.
- [ ] No RPE / no RIR messaging is clear.
- [ ] Double progression explanation is clear.
- [ ] Rep drop-off shutdown explanation is clear.
- [ ] kg/lb preference saves.
- [ ] Training goal saves.
- [ ] Experience level saves.
- [ ] Completing onboarding lands in the protected app area.

## Auth

- [ ] Create app account with a staging test email.
- [ ] Profile row is created automatically after sign-up.
- [ ] Login succeeds after fresh app restart.
- [ ] Logout returns to public auth area.
- [ ] Invalid login shows a useful error.
- [ ] Re-login restores the session.
- [ ] Continue offline works without an app account.

## Offline Mode

- [ ] Launch app online, then enable airplane mode.
- [ ] Existing local exercises/programmes/history remain visible.
- [ ] A workout can be started while offline.
- [ ] Sets can be logged while offline.
- [ ] Completed workout saves locally while offline.
- [ ] Returning online does not duplicate local records after sync.

## Exercise Library

- [ ] Seeded exercises browse smoothly.
- [ ] Search finds expected exercises.
- [ ] Muscle filter works.
- [ ] Equipment filter works.
- [ ] Exercise detail opens and back navigation works.
- [ ] Create a custom exercise.
- [ ] Custom exercise appears alongside seeded library.
- [ ] Custom exercise remains after app restart.
- [ ] Authenticated custom exercise syncs to Supabase.

## Programmes

- [ ] Preset programmes load.
- [ ] Programme detail opens and preserves exercise order.
- [ ] Start preset programme day.
- [ ] Create custom programme.
- [ ] Add a day.
- [ ] Rename a day.
- [ ] Add exercises from the library.
- [ ] Reorder exercises.
- [ ] Edit rep range, drop-off threshold, and load jump.
- [ ] Remove an exercise.
- [ ] Save programme.
- [ ] Start custom programme day.
- [ ] Custom programme remains after app restart.

## One-Off Session

- [ ] Start a one-off session.
- [ ] Add/select an exercise.
- [ ] Start workout logging from the session.
- [ ] Complete the session.
- [ ] Session appears in history.

## Workout Logging

- [ ] Exercise name, target rep range, load, and unit are visible.
- [ ] Previous performance appears when available.
- [ ] Logging a set updates the screen immediately.
- [ ] Best set updates correctly.
- [ ] Minimum acceptable reps updates correctly.
- [ ] Undo Last Set removes only the latest set.
- [ ] Skip Exercise advances when no sets are logged.
- [ ] Complete Exercise advances when sets exist but no shutdown happens.
- [ ] Rep drop-off shutdown triggers when reps fall below the threshold.
- [ ] Shutdown disables further set entry.
- [ ] Next Exercise advances in order.
- [ ] Final exercise completion saves the workout.

## Edge Cases

- [ ] Empty workout can be exited without crashing.
- [ ] Zero reps can be logged without crashing.
- [ ] Bodyweight exercise uses zero load cleanly.
- [ ] Deleted custom exercise used by an old programme is preserved as a deleted exercise placeholder.
- [ ] App restart mid-workout restores the open workout.
- [ ] Logout with unsynced local data does not erase local history.
- [ ] Failed save shows a useful error or leaves local data intact.

## History

- [ ] Workout history list shows completed workout.
- [ ] Workout detail shows each exercise, load, sets, reps, best set, and drop-off result.
- [ ] Exercise history shows previous sessions.
- [ ] Last recommended load appears when progression was earned.
- [ ] History search/filter by exercise works.
- [ ] History search/filter by programme works.
- [ ] Date range filter works.

## Analytics

- [ ] Weekly volume summary appears after history exists.
- [ ] Muscle group volume matches completed workouts.
- [ ] Recent progression wins reflect actual logged data.
- [ ] Stalled exercise insight appears only when supported by history.
- [ ] Suggested focus areas do not appear for nonexistent data.
- [ ] Analytics empty state appears for new users with no workouts.

## Premium Gates

- [ ] Advanced analytics gate appears for free user.
- [ ] Cloud sync premium lock appears where expected.
- [ ] Account shows RevenueCat provider when using native preview builds.
- [ ] Paywall opens from Account and locked premium features.
- [ ] Monthly package loads.
- [ ] Yearly package loads.
- [ ] Lifetime package loads if configured in the current RevenueCat offering.
- [ ] Restore purchases works gracefully with no active purchase.
- [ ] Apple sandbox tester can complete an iOS sandbox purchase.
- [ ] Google Play test user can complete an Android sandbox purchase.
- [ ] Premium entitlement unlocks advanced analytics, cloud sync, premium programmes, and unlimited limits.
- [ ] App restart preserves premium entitlement.
- [ ] App remains usable if RevenueCat offering fetch fails.

## Settings

- [ ] Unit setting changes kg/lb defaults.
- [ ] Default drop-off percentage saves.
- [ ] Default rep range saves.
- [ ] Default load jump saves.
- [ ] Subscription status displays.
- [ ] Logout works from settings/account.
- [ ] Data export placeholder is clear.
- [ ] Delete account placeholder is clear and non-destructive.

## Supabase Validation

- [ ] `profiles` has one row for the tester.
- [ ] `exercises` custom rows are owned by tester `user_id`.
- [ ] `programmes` custom rows are owned by tester `user_id`.
- [ ] `workout_sessions` rows are owned by tester `user_id`.
- [ ] `performed_exercises` rows preserve exercise order.
- [ ] `performed_sets` rows match device-entered reps/load.
- [ ] A second test user cannot read the first tester's user-owned rows through the app.

## Sync Diagnostics

- [ ] Diagnostics screen opens from Account.
- [ ] App environment shows staging.
- [ ] Supabase URL is present.
- [ ] Auth session status matches signed-in/signed-out state.
- [ ] Current user id matches Supabase auth user when signed in.
- [ ] Unsynced queue count increments for offline work.
- [ ] Manual sync drains queued custom exercises, programmes, and completed workouts.
- [ ] Last sync attempt timestamp updates.
- [ ] Last sync error is useful if network is disabled.
- [ ] Clear local test data is available only in dev/staging testing contexts.

## Final Notes

- Bugs found:
- Screenshots/videos captured:
- Supabase validation query result:
- Ready for TestFlight/Internal Testing: yes / no
