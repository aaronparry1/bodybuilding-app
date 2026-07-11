# Train exact planned execution

## Workout selection

Train resumes the persisted open workout through the existing active-workout selector. Current planned construction happens before execution and persists one `WorkoutSession`; opening Train does not construct a replacement prescription.

## Target authority

For `sessionKind: "planned"`, Train reads `WorkoutExerciseLog.prescribedSetTargets` by work-set ordinal. The stored target is the only instruction it may prefill or present as an executable target. `repRange` is not consulted to fill a missing planned target.

For an older planned record without a target at the required ordinal, Train presents an explicit compatibility message instead of inventing a prescription. Non-planned sessions retain their separate boundary-metadata presentation path.

## Resume and history

The stored session, exercise ordering, logged sets, and original target array are restored from the workout repository. Logging records actual performance; this phase does not alter persistence or completion behaviour.

## Original prescription and live coaching

`prescribedSetTargets` remains the original stored prescription. Existing live coaching may provide a next-working-instruction adjustment from completed performance, but this phase does not rewrite the prescription array or introduce a persistence schema change for adjustments.

## Deferred work

Post-workout review, Progress, Analytics, reporting, ad-hoc/custom sessions, programme builder paths, evidence migration, interventions, and the broader legacy logger/block callers remain outside Phase 4B. The commented V2/V3 implementation remains deletion-gated and untouched.
