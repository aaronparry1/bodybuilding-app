# Phase 4A: Home and Plan consumer map

| File / symbol | Screen | Current source | Reads current hierarchy | Reads legacy block/year/range | Authority | Phase 4A action |
| --- | --- | --- | --- | --- | --- | --- |
| `home-dashboard.ts` / `buildHomeDashboardViewModel` | Home | active plan, training year, history, active workout | Partial: `createPlanningContext` | `TrainingYear`, active block, block rep/drop-off, next block | Mixed active display | Replace current card fields with planning context and open planned workout; retain only isolated compatibility state. |
| `index.tsx` / HomeScreen primary action | Home | dashboard, annual block, legacy programme preview | No direct target authority | `useTrainingYear`, `buildPlannedWorkoutProgramme`, block session identity | Active start-path presentation | Remove the preview as a planned-workout authority; route the current plan to Train and use stored open-workout targets only. |
| `planning-context.ts` / `createPlanningContext` | Shared Home/Plan | active plan and optional workout | Goal, macrocycle, mesocycle, microcycle, role, exact targets | Falls back to `sessionRolesForPlan` | Current with compatibility fallback | Make missing current authority explicit rather than presenting a fallback role as current. |
| `plan-page-view-model.ts` / `buildPlanPageViewModel` | Plan | active plan, optional current block, workouts | Mesocycle, microcycle, role, approved next states, open planned workout | Block summary, annual duration, block roadmap | Mixed | Remove raw current block input and active block roadmap from the contract; expose a narrow ready/incomplete planning context. |
| `programmes.tsx` / PlanScreen | Plan | plan view model plus `useTrainingYear` | Planning context card, approved next states | `currentBlock` supplied to view model; roadmap presentation | Mixed display | Remove training-year dependency and block roadmap rendering; retain approved domain transition action. |
| `training-session-selection.ts` | Shared | active plan/history | Current mesocycle/microcycle identity | Explicit older-summary compatibility | Compatibility-only | Keep unchanged; Phase 3 remains authoritative. |
| `tests/home-dashboard-view-model.test.ts` | Home tests | legacy fixtures | Partial | Blocks and training-year fixtures | Historical assertions | Replace only assertions for the migrated Home contract; preserve unrelated baseline failures. |
| `tests/plan-page-view-model.test.ts` | Plan tests | active plan/workout fixtures | Partial | Roadmap/block assertions | Mixed | Rewrite to assert current planning context, target summary and approved successors. |

## Decision boundary

For a current plan, Home and Plan may display only `createPlanningContext`, `getApprovedNextMesocycleStates`, and the deterministic open planned workout. `WorkoutExerciseLog.prescribedSetTargets` is the sole display source for executable targets. `repRange` remains absent from their prescription summaries.

An older plan without current authority is represented as an explicit incomplete or compatibility state. Legacy block/year fields can remain in lower-level loaders and historical summaries, but do not become Home or Plan display authority.
