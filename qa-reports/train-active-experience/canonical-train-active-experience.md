# Canonical Train active experience

This evidence was rendered from the real Expo web application in development Design-QA mode. It is deliberately labelled non-native; it does not claim native iOS rendering.

The primary capture used a 390 × 844 viewport. The narrow-width check used 320 × 568 and measured a 320-pixel document width with no horizontal overflow. The browser reported no console warnings or errors during the journey.

## Interaction structure

- The planned session is read-only until the explicit **Start workout** action.
- The active shell keeps Close, friendly session name, active elapsed time, set progress, and a progress indicator visible.
- Only the selected exercise is expanded. Completed and upcoming exercises remain compact and selectable.
- Set rows use Set / Reps / Load / Done. The Done control is a fixed circular target and does not contain wrapping copy.
- First exposure has one calibration step before counted working sets. Ramp attempts remain outside the ledger. The successful load then becomes the smart default for the working rows and compatible future evidence.
- A valid one-tap set command records exactly one performed set, starts canonical rest, updates progress, and exposes deliberate editing.
- Close routes through Continue, Pause and leave, or confirmed Discard. Discard restores the immutable planned snapshot and removes only the active attempt, its evidence, and its timer.
- Finish remains disabled with a reason until canonical completion is allowed, then routes to the existing canonical completion summary.

## Rendered evidence

1. `visuals/01-workout-preview.png` — compact planned-session preview.
2. `visuals/02-first-exposure-calibration.png` — explicit first usable load flow.
3. `visuals/03-active-prescribed-workout.png` — phone-first rows and disabled Finish reason.
4. `visuals/04-rest-completed-upcoming.png` — persisted rest plus current/completed/upcoming state.
5. `visuals/05-completed-set-editing.png` — exact-set editing with Save and Cancel.
6. `visuals/06-close-pause-discard-menu.png` — safe exit choices.
7. `visuals/07-workout-complete.png` — canonical completion summary.
8. `visuals/08-narrowest-phone-preview.png` — 320-pixel responsive evidence.

## Programme preconditions

Purposeful exercise repetition remains available when authorised by the goal, phase, lift exposure, or progression. The certified five-day phase intentionally has no vertical press; the allocator has no unserved required vertical-press slot and retains meaningful anterior-delt secondary work.

## Verification

- Focused Train, lifecycle, persistence, and architecture matrix: 18 files / 54 tests passed.
- Full suite: 339 files / 2,007 tests passed, with zero failures.
- The 336-file / 1,993-test baseline increased by exactly three test files and fourteen assertions.
- TypeScript, Expo public configuration, and production web export passed. No lint script is configured.
- No external build, upload, deployment, submission, or release was run.
