# Phase 11 atomic active-plan dependency graph

| Dependency | Consumers | Decision controlled | Current replacement | Risk |
| --- | --- | --- | --- | --- |
| `ActiveTrainingPlan.blocks` / `activeBlockId` | `plan-setup`, repository, Train/logger, session selection, progress, volume, recommendations, design QA | Persisted phase, week, transitions, settings and compatibility matching | Macrocycle, mesocycle, microcycle, session role, approved transition state | Critical |
| Plan setup block sequence | onboarding and plan creation | Initial persisted plan authority | Current macrocycle plus selected initial mesocycle/microcycle | Critical |
| Block week/session matching | training-session selection and workout summaries | Current-session completion matching | plan/mesocycle/microcycle/session-index identity | High |
| Active block in Train/logger | live display/settings and fallback control | Execution context | Stored planned workout/current planning context | Critical |
| Block transitions | recommendation actions and Plan | Advance/repeat/deload flow | Approved mesocycle transition state | Critical |
| Block context in Progress/volume | future recommendation context | Recovery/volume inputs | Mesocycle/microcycle/progression state | High |
| Block fixtures | design QA/tests | Current fixture construction | Current-plan fixtures plus legacy adapter fixtures | High |

## Migration order

1. Define versioned current/legacy records and hydration result.
2. Replace `ActiveTrainingPlan` runtime shape and new-plan creation.
3. Migrate selectors, Train/logger, transitions, recommendation, Progress/volume, and fixtures in the same change.
4. Add compatibility adapter and schema tests.
5. Verify every remaining block reference is compatibility, historical, ad-hoc, or deferred V2 QA only.

No safe partial production edit exists before steps 1–3 are complete.

## Missing decision-domain layer

The block model currently carries transition, repeat/delay, deload, and volume-context identity. Before Phase 11 implementation, these must be represented by current decision lifecycle, mesocycle-readiness, fatigue-management microcycle, and volume-context types; see `docs/current-progression-transition-decision-design.md`.

## Stage 1 decision persistence bridge

The current decision evaluator now writes a versioned, block-free decision record before any optional compatibility shadow. Stage 2 consumer migrations must read the current record through the current-first resolver; no consumer may treat a legacy block decision as co-equal authority. Stage 3 may delete shadows only after every legacy reader has migrated.

## Phase 11A.2C2

Persisted readiness history now feeds pure exposure context; current mesocycle `nextStates` feed candidate validation; machine-evaluable objective policy remains an explicit gap. Neither edge writes a decision or touches legacy active-plan progression.
