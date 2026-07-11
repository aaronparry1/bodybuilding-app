# Phase 3 constructor authority map

| File / symbol | Caller | Legacy input/effect | Path | Phase 3 action |
| --- | --- | --- | --- | --- |
| `recovery-workout-constructor.ts` / `buildRecoveryWorkoutSession` | `use-workout-logger` | `currentBlock` selected exercises, settings, stored block identity and deload state | Active planned | Remove raw block input; resolve current planning input first. |
| `recovery-workout-constructor.ts` / `constructSessionContract` | constructor/tests | Block fallback supplied deload context and missing mesocycle default | Active planned | Require resolved mesocycle/microcycle/session role; return `null` when incomplete. |
| `recovery-workout-constructor.ts` / `exerciseScore` | constructor | `suitableBlocks` scoring | Active planned | Remove block score; retain current mesocycle role/experience decisions. |
| `training-session-selection.ts` | logger/completion | `activeBlockId`/week decide completed current sessions | Active planned | Match current mesocycle/microcycle fields; legacy calendar only for records without current identity. |
| `workout-history.ts` | session selection | Carries legacy plan block/week summary | Active planned history | Also carry new mesocycle/microcycle metadata. |
| `use-workout-logger.ts` / `createSessionFromActivePlan`, `advanceTrainingWeekIfEarned` | Train start/next session, completed planned session | Passed raw `currentBlock` to the active constructor and required matching block/week before microcycle advancement | Active planned | Stop passing block; use mesocycle/microcycle identity through session selection before advancing the current microcycle. |
| `current-planning-input.ts` | new boundary | N/A | Compatibility adapter | Current plan wins; legacy missing current state is explicitly normalised or marked incomplete. |
| `ad-hoc-workout-generator.ts`, builder, analytics, Home | other callers | Block/year assumptions | Non-active paths | Deferred. |
