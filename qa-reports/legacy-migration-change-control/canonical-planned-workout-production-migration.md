# Canonical planned-workout production migration

At `bb51b86`, `planned-workout.ts` had four mounted consumers. The Home label
consumer now imports the canonical `workout-name` presentation utility, the
recovery-capacity projection no longer reconstructs a legacy Programme and
fails closed to `unknown` when no canonical planned snapshot is available, and
the logger's unused legacy imports were removed. Placeholder filtering remains
local to `active-workout.ts` because it still protects the legacy repository
boundary; it is not a planned-workout construction authority.

No mounted production source imports `planned-workout.ts` after this change.
The module remains temporarily for test-only legacy coverage and is therefore
not deleted in this bounded phase. No canonical adapter or replacement matrix
was introduced. The next production migration target remains
`plan-setup.ts:createActiveTrainingPlan`.
