# Non-planned sessions and Programme Builder authority

## Session origin

`WorkoutSession.sessionKind` distinguishes authoritative `planned` workouts from explicit non-planned origins: `custom`, extra lifting sessions, and cardio extras. `isAuthoritativePlannedWorkout` is the planned-only predicate; `getOpenPlannedWorkout` never selects a custom or extra workout.

Programme-day selection is restricted to a non-planned session kind. It carries no plan-session index, mesocycle identity, microcycle identity, block/week identity, or planned session role. Persisted selections without a kind load as `custom`; persisted selections marked `planned` are rejected at this non-planned boundary.

## Ad-hoc, custom, and extra sessions

Custom/extra programme templates use `buildWorkoutSessionFromProgrammeDay`. That builder always produces a non-planned session and does not accept plan identity. The logger resumes any open workout for the user, but an explicit programme-day request can only construct a non-planned session; authoritative planned construction remains exclusively in `buildRecoveryWorkoutSession`.

Extra sessions may use active-plan context for admission (for example, whether extra work should be reduced) but are not a planned microcycle session. Completion does not advance the active microcycle, transition a mesocycle, complete an open planned workout, or create planned progression evidence. Their `repRange` settings remain non-planned safety/calibration guidance.

## Programme Builder

Programme Builder creates and saves a custom draft/template only. `validateProgrammeDraft` reports whether it has enough content to be used as a custom-session template; it does not create, replace, or mutate an active plan. There is currently no approved Builder-to-active-plan creation command, so this phase deliberately does not fabricate one.

Builder ranges are design guidance. They are not a final executable planned prescription. Exact planned targets are still generated only after the active-plan constructor creates a planned workout.

## Compatibility

Older selected programme-day records with no session kind are treated as `custom`. An older record marked `planned` is not accepted by the programme-template bridge. Historical sessions without a session kind remain compatibility data and are not retroactively rewritten in this phase.

## Deferred work

Evidence migration, exercise interventions, broad legacy `TrainingBlock` deletion, the commented V2/V3 logger implementation, ad-hoc target-policy refinement, and an approved Programme Builder plan-creation handoff remain separate work.
