# Exact planned-target boundary

## Authority

For an already-constructed planned workout, `WorkoutExerciseLog.prescribedSetTargets` is the executable rep prescription. The target is selected by work-set ordinal and is preserved with the workout record.

`ExactPrescribedSetTargets` names that contract without changing the persisted array shape.

## Boundary metadata

`ProgressionSettings.repRange` remains valid for:

- generating exact targets before a workout exists;
- calibration and exercise safety bounds;
- template/programme design metadata;
- non-planned sessions; and
- legacy records without stored exact targets.

It does not overwrite an exact target on a planned workout.

## Compatibility

`resolveExecutableTargetReps` returns either an `exact_planned_target` or an explicit `compatibility_rep_range` result. The compatibility branch retains the existing deterministic range fallback only when a record does not contain an exact target. It does not create or persist a new exact prescription.

## Constructor and execution guarantees

`buildRecoveryWorkoutSession` creates an exact target for every required planned work set. The completion quality loop reads those stored targets before evaluating performance, rather than rebuilding planned reps from range metadata.

## Deferred callers

Train's range fallback for an old workout without exact targets, post-workout legacy fallback branches, active block authority, ad-hoc policy, builder metadata, and reporting remain deferred to later phases. This phase does not rename or remove repository-wide `repRange` fields.
