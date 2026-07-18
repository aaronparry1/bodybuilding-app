# Global shell and Home visual certification

This evidence was captured from the local Design-QA web runtime. The controls used for the rest-day and recoverable-error presentations are development-only, do not alter the canonical plan or ledger, and are unavailable in production.

## Intentional shell changes

- The duplicated native page title and repeated `Settings` text were replaced by one compact shared header.
- The five required destinations remain Home, Train, Plan, Progress and Library.
- The oversized selected-tab pill was replaced by a compact icon, label and underline treatment while retaining accessible touch targets.
- Protected content uses shared horizontal spacing and bottom insets so the tab bar does not obscure scroll content.
- Active Train retains its dedicated shell. The global tabs disappear only while an active recorded workout is focused and reappear after Pause and leave.

## Home states

| State | Viewport | Result | Evidence |
| --- | --- | --- | --- |
| Planned workout with zero history | 390×844 | Passed | `screenshots/home-planned-390x844.jpg` |
| Active workout | 390×844 | Passed | `screenshots/home-active-390x844.jpg` |
| Active paused workout | 375×812 | Passed | `screenshots/home-active-paused-375x812.jpg` |
| Completed today | 390×844 | Passed | `screenshots/home-completed-390x844.jpg` |
| Rest day | 375×812 | Passed | `screenshots/home-rest-day-375x812.jpg` |
| Recoverable storage error | 320×568 | Passed | `screenshots/home-storage-error-320x568.jpg` |
| No plan | 320×568 | Passed | `screenshots/home-no-plan-320x568.jpg` |

The screenshots show no horizontal overflow, clipped primary copy or content hidden by the bottom navigation. Primary Start, Resume, retry or setup actions remain reachable without excessive scrolling. Status is expressed in text as well as colour. Default browser focus remains available for keyboard users, and labels use scalable React Native text rather than fixed image content.

## Architecture boundary

Home reads a customer-facing projection assembled from the canonical active-plan state, immutable Session Construction snapshot, recorded-session ledger and canonical Progress evidence. Rendering Home cannot start, complete, discard or revise a session. Start and Resume are navigation descriptors; lifecycle execution remains owned by Train.

The previous shell and Home appearance was assessed from the starting source at `5a4d765`; no baseline image set existed. Therefore this certification records intentional source-to-render changes rather than claiming pixel-diff equivalence.
