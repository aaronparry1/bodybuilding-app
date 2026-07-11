# Post-workout and Progress stored-prescription authority

## Historical authority

A completed planned workout is evaluated from its persisted `WorkoutExerciseLog.prescribedSetTargets` and its actual logged work sets. The comparison is set-ordinal: target `n` is compared with completed work set `n`.

`WorkoutHistorySummary` now retains the exact target array and marks the summary as `stored_exact` when that complete target array exists. Progress reads that immutable historical outcome; a current plan or block may inform a future recommendation, but it cannot reclassify completed work.

## Review and progression

For a planned exercise with complete stored targets, progression qualification and review load changes use the stored exact outcome. Current target-zone, block, and rep-range inputs do not gate or reconstruct that historical decision. Actual logged reps and loads remain the performance evidence.

When stored exact targets are absent, the existing range-based path remains an explicitly compatibility-only branch. It does not create or persist a new exact prescription.

## Live adjustments

The current data model persists original targets and actual set performance, but not a distinct per-set live-adjusted target record. This phase preserves that limitation: live coaching must not overwrite the original target array, and no schema migration is introduced.

## Deferred work

Analytics and reporting presentation, evidence migration, interventions, ad-hoc/custom sessions, programme builder paths, and broader legacy block cleanup remain outside Phase 4C.
