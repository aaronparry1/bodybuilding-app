# Global shell and Home visual certification

This evidence was recaptured from the local Design-QA web runtime after replacing the stale Home inputs with the shared five-day canonical fixture source. Final screenshots contain no Design-QA banner or query-state chrome. Production configuration resolves `designQaMode` to `false` even when the public QA flag is supplied.

The Home fixture IDs date to baseline commit `67710ff`, before allocator commit `7154124` and training-quality correction `17a9d68`. The later canonical fixture wrapper retained a four-day `upper_lower` input, so its rendered session drifted from the corrected allocator. That independent input is now removed from Home visual setup.

## Canonical fixture

- Source: `canonical_five_day_microcycle_certification_v2`
- Profile: Build muscle and strength · intermediate · 5 days · let app choose
- Next session: Bench and hypertrophy
- Exercises: Bench Press · Incline Dumbbell Press · Cable Lateral Raise · Rope Overhead Triceps Extension
- Exact work-set counts: 4 / 3 / 2 / 2 — 11 total
- Certified week: 11 / 11 / 11 / 14 / 12 — 59 total working sets
- Alignment: visual plan session identity, ordered exercise IDs, exact targets and required work sets equal the certification source

The active state starts that planned session and records one performed-work event. The paused state adds the canonical pause lifecycle event. The completed state records all 11 prescribed working sets, invokes canonical completion, derives history/evidence, and leaves session two available.

## Visual corrections

- One compact application header and one page heading remain; the duplicate uppercase brand eyebrow was removed.
- Gold `#d8b56d` is the sole primary functional accent for actions, active work, progress and selected navigation. Success remains semantic green.
- `expo-symbols` supplies one coherent outline icon family for Home, Train, Plan, Progress, Library and Settings.
- Programme Position follows the primary workout and precedes compact zero-history guidance.
- Zero history has no Progress action. Review becomes available only after a completed recorded session exists.
- Metrics and programme sections use lighter surfaces and dividers rather than nested bordered cards.

## Grey capture block

The grey block was a screenshot-capture failure, not a product overlay. The superseded evidence used a full-page capture against React Native Web's internally scrolling viewport. DOM inspection found no modal, backdrop, loading mask or fixed overlay, and the committed viewport image itself did not reproduce the block. Replacement images use `fullPage: false`, explicit device viewports, exact pixel-dimension checks and visual inspection. The corrected active capture is a complete 390×844 viewport.

## Home states

| State | Viewport | Result | Evidence |
| --- | --- | --- | --- |
| Planned next workout | 390×844 | Passed | `screenshots/home-planned-390x844.png` |
| Active workout | 390×844 | Passed | `screenshots/home-active-390x844.png` |
| Paused workout | 375×812 | Passed | `screenshots/home-paused-375x812.png` |
| Completed today | 390×844 | Passed | `screenshots/home-completed-390x844.png` |
| Rest day | 375×812 | Passed | `screenshots/home-rest-day-375x812.png` |
| Zero history | 390×844 | Passed | `screenshots/home-zero-history-390x844.png` |
| Recoverable storage error | 320×568 | Passed | `screenshots/home-storage-error-320x568.png` |
| No plan | 320×568 | Passed | `screenshots/home-no-plan-320x568.png` |

No captured viewport contains QA chrome, a grey overlay, the stale three-exercise workout, competing primary accents, raw identifiers, horizontal overflow, clipped text or unsupported actions.

## Architecture boundary

Home remains a read-only projection over canonical active-plan state, immutable Session Construction snapshots, recorded-session ledger facts and canonical Progress evidence. Home actions remain navigation descriptors. Fixture state is constructed by shared canonical plan and ledger owners and is gated to explicit non-production Design-QA mode.

## Verification

- Focused Home, Design-QA and Train coverage: 15 files, 154 tests passed
- Full suite: 344 files, 2,027 tests passed; zero failed or skipped
- TypeScript: passed
- Production Expo public config: passed with Design-QA disabled
- Production web export: passed
