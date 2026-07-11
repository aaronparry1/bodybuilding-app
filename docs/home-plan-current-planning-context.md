# Home and Plan current planning context

## Home

Home answers what to do now. Its active-plan presentation reads the active plan's current mesocycle, current microcycle, current session role, and the stored exact targets of an open planned workout. Its primary action opens Train; it no longer creates a block-derived programme preview or writes block/week identity before starting.

## Plan

Plan answers where the athlete is and what is approved next. It displays goal, macrocycle, mesocycle purpose, microcycle priority, session role, optional stored exact targets, and only `getApprovedNextMesocycleStates` results. The transition button uses `transitionToApprovedMesocycle`, which remains the domain boundary.

## Exact targets

Home and Plan display `WorkoutExerciseLog.prescribedSetTargets` only when an open planned workout supplies them. They do not turn `repRange` into an athlete instruction.

## Compatibility

Plans without complete current planning state show an incomplete/compatibility state instead of turning an annual block into a current phase. The Home view model retains a deprecated string-only compatibility shape for historical tests and reports; neither Home nor Plan renders it. Removing that compatibility shape is deletion-gated on its remaining test/report callers.

## Deferred work

Train execution, post-workout review, Progress, Analytics, reporting, ad-hoc and builder flows remain outside this phase. Their legacy block/range inputs have not been changed here.
