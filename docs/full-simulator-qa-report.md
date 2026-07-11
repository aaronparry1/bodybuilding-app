# Full Simulator QA Report

Date: 2026-06-10  
Device: iPhone 17 Pro simulator  
Mode: `EXPO_PUBLIC_DESIGN_QA_MODE=1`  
EAS build: not started

## Executive Summary

Hostile simulator QA found two genuine transient-overlay bugs. Both were fixed during this pass:

- Train performance/logging overlays could remain visible after navigating away from Train.
- Plan block explanation/next-block modals could remain visible after navigating away from Plan.

No workout data-loss, swap-confirmation, planned-session completion, or cardio/lifting contamination blocker was found after those fixes. The app is functionally ready for a fresh iOS preview build, with a few non-blocking QA notes below.

## Verification

- `npm test`: passed, 67 files / 743 tests
- `npx tsc --noEmit`: passed
- `npx expo export --platform web`: passed
- `EXPO_PUBLIC_DESIGN_QA_MODE=1 npx expo run:ios --device "iPhone 17 Pro"`: build/install/launch passed
- Simulator build errors: 0
- Simulator build warnings: 1 native linker warning, duplicate `-lc++`

## Screenshots

- Home current block/week: `screenshots/full-simulator-qa-2026-06-10/home-current-block.jpg`
- Plan after drawer cleanup: `screenshots/full-simulator-qa-2026-06-10/plan-after-drawer-cleanup.jpg`
- Plan block explanation: `screenshots/full-simulator-qa-2026-06-10/plan-block-explanation.jpg`
- Progress volume recommendation: `screenshots/full-simulator-qa-2026-06-10/progress-volume-recommendation.jpg`
- Library Power Clean search: `screenshots/full-simulator-qa-2026-06-10/library-power-clean-search.jpg`
- Settings Recovery & Cardio: `screenshots/full-simulator-qa-2026-06-10/settings-recovery-cardio.jpg`
- Extra Session cardio options: `screenshots/full-simulator-qa-2026-06-10/extra-session-cardio-options.jpg`
- Recovery Cardio logging: `screenshots/full-simulator-qa-2026-06-10/recovery-cardio-logging.jpg`
- Reason sheet: `screenshots/full-simulator-qa-2026-06-10/reason-sheet-remove.jpg`
- Onboarding step 1: `screenshots/full-simulator-qa-2026-06-10/onboarding-step1-sparse.jpg`
- Dev warning overlay during drawer QA: `screenshots/full-simulator-qa-2026-06-10/bug-log-set-keyboard-stuck.jpg`

## Findings

### Fixed: Train Overlay Persists After Navigation

Severity: high  
Status: fixed

Reproduction:

1. Open Train with `train_overview_fresh`.
2. Open a performance drawer from a work set.
3. Navigate/deep-link to Plan.
4. The performance drawer remains visible above Plan content.

Screenshot:

- Before/finding state: `screenshots/full-simulator-qa-2026-06-10/bug-log-set-keyboard-stuck.jpg`
- After fix: `screenshots/full-simulator-qa-2026-06-10/plan-after-drawer-cleanup.jpg`

Suspected cause:

The Train tab stays mounted while other tabs/routes are focused, so `Modal` state owned by Train remained active globally.

Fix:

Added `useFocusEffect` cleanup in `app/(protected)/(tabs)/train.tsx` to dismiss transient UI only:

- performance drawer
- swap picker
- add exercise picker
- escalation modal
- reason sheet
- overview action state

Active workout/session state is not cleared.

Tests:

- Added source contract coverage in `tests/workout-navigation-ui.test.ts`.

### Fixed: Plan Block Modal Persists After Navigation

Severity: medium/high  
Status: fixed

Reproduction:

1. Open Plan with `plan_recommended`.
2. Open a roadmap block explanation.
3. Navigate/deep-link to Progress.
4. The Plan block explanation remains visible above Progress content.

Screenshot:

- After fix: `screenshots/full-simulator-qa-2026-06-10/progress-volume-recommendation.jpg`

Suspected cause:

Plan tab modal state remained mounted after the route lost focus.

Fix:

Added `useFocusEffect` cleanup in `app/(protected)/(tabs)/programmes.tsx` to close:

- selected block explanation
- choose-next-block modal

Plan state/block logic is not changed.

Tests:

- Added source contract coverage in `tests/workout-navigation-ui.test.ts`.

### Non-Blocking: Dev Warning Overlay Can Block Drawer Controls

Severity: low/medium in simulator QA, likely non-production  
Status: documented

Reproduction:

1. Launch dev simulator.
2. Open performance drawer.
3. Runtime warning banner appears: `Open debugger to view warnings.`
4. Banner can sit over lower drawer actions during simulator QA.

Screenshot:

- `screenshots/full-simulator-qa-2026-06-10/bug-log-set-keyboard-stuck.jpg`

Suspected cause:

Metro logs a require-cycle warning:

`src/domain/training/planned-workout.ts -> src/domain/training/training-session-selection.ts -> src/domain/training/planned-workout.ts`

Recommended fix:

Refactor the require cycle when convenient. This is not a preview-build blocker unless runtime warnings are enabled in that distribution.

### Non-Blocking: Extra Session Sheet Shows Capacity Focus Labels After Selecting Recovery Cardio

Severity: low  
Status: documented

Reproduction:

1. Home -> Create Extra Session.
2. Select Recovery Cardio.
3. Lower chip row changes to Low Back / Hips / Ankles / Shoulders / Neck while still in the cardio session creator.

Screenshot:

- `screenshots/full-simulator-qa-2026-06-10/extra-session-cardio-options.jpg`

Suspected cause:

Shared extra-session configuration UI still shows capacity-focus choices after selecting a cardio session type.

Recommended fix:

Hide capacity-focus chips for cardio session kinds or replace them with cardio-relevant copy. This is polish, not a blocker: Create Session still opens the Recovery Cardio logging screen correctly.

### Non-Blocking: Library Search Results Are Hard To Inspect With Keyboard Open

Severity: low  
Status: documented

Reproduction:

1. Open Library.
2. Search for `Power Clean`.
3. The count updates to `2 movements`, but result rows are awkward to inspect while the keyboard/search field is active in the simulator view.

Screenshot:

- `screenshots/full-simulator-qa-2026-06-10/library-power-clean-search.jpg`

Suspected cause:

Search/results layout plus keyboard height leaves little visible result space on the iPhone 17 Pro simulator.

Recommended fix:

Consider auto-scrolling results into view, dismissing keyboard on submit, or adding a clearer result area. Not a blocker because the search index responds and tests cover library entries.

## Coverage Notes

### Onboarding

Inspected setup step 1 in simulator. Goal cards were visible and readable in screenshot, including:

- Build Muscle
- Build Strength
- Build Muscle & Strength
- Athletic Performance
- Prepare For Event
- Just Help Me Train

Full goal/programme/equipment/unit combinations are covered primarily by domain and fixture tests rather than manual tapping of every combination in this sweep.

### Home

Validated:

- Home loads.
- This Week is expanded.
- Current block/week shown.
- Next block shown.
- Create Extra Session opens.
- Training System Guide entry point is present.

### Train

Validated:

- Workout overview loads.
- Target ranges display.
- Warm-up/work rows are separated.
- Swap confirmation path was previously verified fixed.
- Reason sheet opens for remove action.
- Transient Train overlays now close on navigation away.

### Plan

Validated:

- Annual roadmap fixture loads.
- Block explanation opens and is readable.
- Plan transient modals now close on navigation away.

### Progress

Validated:

- Volume ladder recommendation fixture loads.
- Evidence and Why disclosures are present.
- No Plan modal leaks after fix.

### Settings

Validated:

- Recovery & Cardio setting is visible.
- Recommended / Minimal / Off buttons update the displayed setting.
- Setting was restored to Recommended after the test.

### Cardio

Validated:

- Extra Session includes Recovery Cardio, Capacity Cardio, and Performance Conditioning.
- Recovery Cardio creates a cardio logging screen.
- Cardio logging screen includes modality, duration, optional distance, ease, and notes.
- Cardio flow is distinct from lifting completion UI.

### Library

Validated:

- Library loads.
- Search for Power Clean updates result count.
- Existing test suite covers expanded exercise uniqueness/search/taxonomy.

## Files Changed

- `app/(protected)/(tabs)/train.tsx`
- `app/(protected)/(tabs)/programmes.tsx`
- `tests/workout-navigation-ui.test.ts`
- `docs/full-simulator-qa-report.md`

## Build Recommendation

Ready for a fresh iOS preview build after accepting these known non-blocking notes:

- Dev-only require-cycle warning can trigger the LogBox overlay during simulator QA.
- Native simulator build reports one duplicate `-lc++` linker warning.
- Extra Session cardio selector has a minor confusing chip row after selecting Recovery Cardio.
- Library search result rows could be easier to inspect with keyboard open.

No EAS build was started.
