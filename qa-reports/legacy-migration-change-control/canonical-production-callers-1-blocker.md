# CANONICAL-PRODUCTION-CALLERS-1 blocker

The canonical application service exists, but the first production caller group
cannot yet be switched without creating a forbidden compatibility adapter.

## Exact missing application boundary

The live plan/application state is still `activeTrainingPlanRepository` with an
`ActiveTrainingPlan` value. The production consumers directly require its
legacy fields (`blocks`, `activeBlockId`, `currentMicrocycle`, recommendation
state, and block-derived planning context). There is no normal application
store/context that can hold `CanonicalActivePlanReadModel`, nor a canonical
hydration path that replaces the active-plan repository.

The new service also requires factual `Exercise[]` and keyed Progress/history
inputs. Onboarding and plan setup currently provide only `TrainingSetupInput`
and do not own or query those canonical inputs at the creation boundary.

## Reachable callers identified

- `src/domain/training/plan-setup.ts:createActiveTrainingPlan`
- `src/application/sync/cloud-data-sync.ts` active-plan hydration
- `src/domain/training/training-session-selection.ts`
- `src/domain/training/planned-workout.ts`
- `src/domain/training/ad-hoc-workout-generator.ts`
- `src/domain/training/progress-dashboard.ts`
- `src/domain/training/current-progress-context.ts`
- `src/application/design-qa/design-qa-fixtures.ts`

These callers are not archive-only. Switching one without the canonical state
container and factual-input query boundary would either return a block-shaped
projection or silently omit required exercise/evidence facts.

## Required next boundary

Create the application-owned canonical active-plan store/hydration contract and
fact query assembler first. Then migrate plan creation and loading together;
only after that can Plan and Train consumers read canonical snapshots without a
legacy adapter.

No production callers were changed in this phase.
