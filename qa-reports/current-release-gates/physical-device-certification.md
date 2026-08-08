# Physical-device certification — candidates 113 and 55

Capture device model, OS version, tester account, installed build, timestamp, pre-state, action, visible result, post-relaunch result, and a screenshot or screen recording for every item. Do not clear storage, reseed data or substitute synthetic backup evidence.

## Android — 1.0.18 (113), Google Play internal

- [ ] Confirm Play shows versionCode 113 on the **internal** track and install it from the intended tester account. Do not open or alter Candidate 111.
- [ ] Perform an in-place upgrade over a populated installation without clearing storage; record the previous version and retained programme/history counts.
- [ ] Confirm the existing signed-in account resolves and belongs to the expected user.
- [ ] Confirm the active programme, completed sessions and history detail remain visible and unchanged.
- [ ] Perform authenticated remote backup/readback and capture server-confirmed identity/count evidence without changing Supabase data manually.
- [ ] Change a split, relaunch the app, and confirm the selected split persists.
- [ ] Replace one exercise, relaunch, and confirm the replacement persists in the correct prescription.
- [ ] Start a workout, record at least one set, force-close, reopen, and confirm the same workout/set resumes.
- [ ] Discard that workout and confirm navigation returns to a clean valid state; relaunch and confirm no stale active workout returns.
- [ ] Complete a workout, confirm retained history after relaunch, and confirm a duplicate same-day completion cannot be created through the normal flow.
- [ ] Sign out and use a second account; prove programme, workout and backup data remain isolated, then restore the original account.
- [ ] Capture Home, Plan, active workout and Progress screens; verify dark styling, brand colours, legibility and system-bar treatment on the physical display.

## iOS — 1.0.18 (55), TestFlight

- [ ] First upload exact build 55 to App Store Connect and wait for processing; do not create build 56 merely to bypass the failed EAS Submit job.
- [ ] Confirm TestFlight identifies version 1.0.18 (55), add only intended internal testers, and install from TestFlight.
- [ ] Perform an in-place upgrade over a populated installation without deleting the app; record the previous version and retained programme/history counts.
- [ ] Confirm the existing signed-in account resolves and belongs to the expected user.
- [ ] Confirm the active programme, completed sessions and history detail remain visible and unchanged.
- [ ] Perform authenticated remote backup/readback and capture server-confirmed identity/count evidence without changing Supabase data manually.
- [ ] Change a split, terminate and relaunch the app, and confirm the selected split persists.
- [ ] Replace one exercise, terminate and relaunch, and confirm the replacement persists in the correct prescription.
- [ ] Start a workout, record at least one set, force-quit, reopen, and confirm the same workout/set resumes.
- [ ] Discard that workout and confirm navigation returns to a clean valid state; relaunch and confirm no stale active workout returns.
- [ ] Complete a workout, confirm retained history after relaunch, and confirm a duplicate same-day completion cannot be created through the normal flow.
- [ ] Sign out and use a second account; prove programme, workout and backup data remain isolated, then restore the original account.
- [ ] Capture Home, Plan, active workout and Progress screens; verify dark styling, brand colours, legibility, safe areas and system-bar treatment on the physical display.

## Certification decision

- Android ready for wider testing: yes / no; evidence location:
- iOS ready for wider testing: yes / no; evidence location:
- Retained-data gate: pass / fail / blocked.
- Authenticated backup/readback gate: pass / fail / blocked.
- Workout lifecycle gate: pass / fail / blocked.
- Account-isolation gate: pass / fail / blocked.
- Device-UI gate: pass / fail / blocked.
- Exact observed defect, if any: route, pre-state, action, result/reason, and post-relaunch state.
