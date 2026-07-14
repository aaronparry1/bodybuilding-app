# Canonical training architecture authority map

The repository has clear canonical modules for the new architecture, but it does **not** yet demonstrate one production owner for every decision. This audit therefore stops before implementation, as required.

| Layer | Canonical owner | State | Main competing path |
|---|---|---|---|
| Macrocycle | `macrocycle-engine.ts:createMacrocycle` | Active plan route projection | `annual-planner.ts`, `TrainingYear`, strategic coaching |
| Mesocycle | `mesocycle-library.ts` + `decideMesocycleTransition` | `currentMesocycleId`, readiness decisions | annual block transitions and TrainingYear actions |
| Microcycle | `microcycle-scheduler.ts:createMicrocycle` | `ActiveTrainingPlan.currentMicrocycle` | split/week fallbacks and legacy block matching |
| Session construction | `buildPlannedWorkoutProgramme` + `resolveSetPrescription` | generated programme/session exact targets | ad-hoc/block-default inputs |
| Progress | readiness producer + canonical transition writer/application | readiness snapshots and decision records | annual `recommendBlockAction`, strategic coaching |

Blocking conflicts are `AUTH-CONFLICT-1` and `AUTH-CONFLICT-2` in the deterministic artifact. Modern planning context, Home, Plan, Train, Progress, analytics, paywall, and duration summaries are projections; they must not become authorities. Legacy annual/training-year fields remain compatibility inputs only until their active callers are isolated.

No horizon engine, route planner, or parallel domain model was introduced. Runtime authority remains `production_only`, and exact prescriptions remain owned by session construction.

The next task is to isolate the two legacy production-reachable continuation paths and prove that modern active-plan continuation uses only the canonical mesocycle decision/application boundary. Only after that conflict is resolved should horizon semantics be implemented or the 48-week assertions replaced.
