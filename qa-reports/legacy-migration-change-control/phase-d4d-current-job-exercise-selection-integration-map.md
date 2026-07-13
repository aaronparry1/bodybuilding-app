# D4D current-job exercise-selection integration map

## Audit result

D4D cannot safely invoke the existing selector without a contract change. The existing entry point `selectPlannedExercisesForWeek` accepts a whole generated-workout request (`GeneratedWorkoutType`, `TrainingBlock`, week number and global exercise/history context) and internally calls `generateWorkoutByFocus`. It does not accept one semantic exercise-selection job.

| D4B field | Existing selector contract | Status |
|---|---|---|
| semantic target / movement | Collapsed into `GeneratedWorkoutType` and internal template slots | Blocking loss of exact slot semantics |
| slot purpose | Internal generated template role | Blocking; no one-job field |
| compound/isolation constraint | Internal template filters | Not safely injectable per D3 job |
| min/max sets | Generated after template selection | Guidance authority cannot be replaced without changing source |
| requiredness/omission | Whole-workout target count and template logic | Cannot preserve required D3 slots one-to-one |
| ordinal/source trace | `ProgramExercise.plannedOrder` only; no D3 trace | Missing trace contract |
| exercise history/preferences | Existing context | Reusable unchanged |
| exact targets | Downstream | Unchanged |

## Consequence

Calling the existing selector once per D3 job would require inventing a `TrainingBlock` and a generated workout type, causing generic template slots, accessory padding, and potentially multiple or missing jobs. Passing all jobs to the existing selector would collapse D3 semantics into one generic workout and violate one-slot/one-exercise identity. Changing selector algorithms or adding hidden fallback would be an authority violation.

The precise seam is now provided by D4D1 as a narrow request accepting one certified D4B job plus existing exercise/history context, with the existing candidate filtering/ranking structurally reused. D4C current-job runtime wiring remains deferred to D4D2; no runtime selector change was made.

## Baseline

Pre-edit baseline: 15 failing files, 43 failing tests, 1,651 passing tests; typecheck, Expo public config and web export passed. High-risk selector originals are under `qa-reports/legacy-migration-change-control/originals/`.
