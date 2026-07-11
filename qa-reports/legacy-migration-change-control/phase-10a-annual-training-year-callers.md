# Phase 10A annual/training-year callers

| File | Symbol | Behaviour | Classification | Rule |
| --- | --- | --- | --- | --- |
| `use-workout-logger.ts` | `useTrainingYear` fallback | Supplied a year block when no active plan existed, affecting fallback/custom logging context | Illegitimate executable authority | Remove; no-active-plan logging must not acquire year-block authority. |
| `train.tsx` | `useTrainingYear` import | Unused import | Dead | Remove. |
| `plan-setup.ts` | `createTrainingBlock` | Legacy plan shape/compatibility construction | Saved-data compatibility / deferred block migration | Retain outside Phase 10A. |
| `workout-settings.ts` / ad-hoc generator | annual block helpers | Non-planned/calibration policy | Non-planned policy | Retain; Phase 10A does not migrate block utilities. |
| training-year repository and cloud sync | persisted year snapshot | Legacy storage and hydration | Saved-data compatibility | Retain; must not enter active-plan construction. |
| design QA and V2 QA | year snapshot/block starts | QA/historical | Historical/QA | Retain for deferred V2 QA phase. |

The active planned constructor, selector, exact-target reader, and Train screen already do not read `useTrainingYear`. This phase removes the remaining logger fallback and unused screen import; it does not delete storage or block utilities.
