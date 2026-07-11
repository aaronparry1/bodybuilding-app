# Phase 2: exact planned-target boundary map

Status: audit complete before production edits.

| File | Symbol | Current purpose | Exact-target role | `repRange` classification | Phase 2 action |
| --- | --- | --- | --- | --- | --- |
| `src/domain/training/models.ts` | `WorkoutExerciseLog.prescribedSetTargets` | Persisted workout exercise data | Optional exact per-work-set target array | `ProgressionSettings.repRange` is shared boundary metadata | Name the exact-target type explicitly without changing persisted shape. |
| `src/domain/training/recovery-workout-constructor.ts` | `createExerciseLog` | Creates active planned workout exercises | Produces `prescribedSetTargets` with `exactTargets` | Design input/safety boundary before target generation | No Phase 2 logic change; characterize constructor guarantee. |
| `src/domain/training/prescribed-performance-progression.ts` | `exactTargets`, `decideNextPrescription` | Generates and advances exact rep targets | Produces/consumes exact arrays | Range only enters upstream generator input | Keep unchanged; test determinism through constructor. |
| `app/(protected)/(tabs)/train.tsx` | `resolvePrescribedWorkSetReps` | Shows work-set suggestion | Reads exact target first, otherwise uses a compatibility range fallback | Compatibility/display fallback when exact target is absent | Do not redesign UI in Phase 2; document as a later explicit legacy-display migration. |
| `src/domain/training/first-shippable-coaching-loop.ts` | `buildQualityInputFromWorkoutSession` | Converts completed work into review evidence | Currently reconstructs prescribed reps from `repRange` even when exact targets exist | Incorrect planned-workout authority | Change to read stored exact set target for planned exercises; retain explicit range fallback only for non-planned/legacy sessions. |
| `src/domain/training/post-workout-review.ts` | `isStrongFirstBaseline`, `targetZoneEarnsIncrease` | Review/progression decision helpers | Uses exact targets when present | Range fallback for records without exact targets | No change; add characterization assertion through focused test. |
| `src/features/workout-logging/use-workout-logger.ts` | persistence mapping | Writes `prescribedSetTargets` into completed session copies | Preserves exact target field | Range is validation/input only here | No change. |
| `src/domain/training/session-builder.ts`, `ad-hoc-workout-generator.ts`, `programme-builder.ts` | template/builder outputs | Build non-authoritative programme data | Do not produce active planned runtime target contract | Non-planned design metadata | No change in Phase 2. |

## Boundary decision

`WorkoutExerciseLog.prescribedSetTargets` is the exact executable planned prescription. A planned workout with a valid target array must use that array per work-set ordinal. `ProgressionSettings.repRange` remains a safety/calibration/design boundary and legacy compatibility input. Missing exact targets on a legacy planned record are represented as an explicit compatibility resolution, not converted by this phase.

## Focused files for this phase

- `src/domain/training/models.ts`
- `src/domain/training/planned-target-boundary.ts` (new)
- `src/domain/training/first-shippable-coaching-loop.ts`
- `tests/planned-target-boundary.test.ts` (new)
- `docs/exact-planned-target-boundary.md` (new)
- `qa-reports/legacy-migration-change-control/manifest.md`
