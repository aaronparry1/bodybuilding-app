# Phase 11B current decision consumer map

Stage 1 persists current decisions but does not yet migrate readers. This map separates the executable decision readers targeted in Stage 2 from retained plan-shape compatibility and deferred V2/annual policy.

| File / symbol | Legacy input and mutation | Current equivalent | Lifecycle / shadow | Tests | Order / risk |
| --- | --- | --- | --- | --- | --- |
| `plan-setup.ts` / `completeCurrentPlanWeek` | Advances `activeBlock.currentWeek`; writes `recommendationState.blockDecision` | Persist `MicrocycleEvaluationState` from planned-role completion; evaluate/write current decision first | Legacy write may only be a Stage 3 shadow | completion, non-planned isolation | 1 / high |
| `plan-setup.ts` / `advanceCompletedMicrocycle` | Uses `defaultWeeks`, then automatically chooses first eligible `nextStates` value | Current decision application service: `continue` only creates a same-mesocycle cycle; `advance`/`regress` use explicit target IDs | Ready decision becomes applied once | transition and logger tests | 2 / critical |
| `plan-setup.ts` / `transitionToApprovedMesocycle` | Already validates a target but has no decision/lifecycle ownership | Shared target validator used only by decision application | No legacy read | Plan transition tests | 2 / high |
| `recommendation-actions.ts` / preview/advance/repeat/delay/deload actions | Active block, array order, block week and writes of `blockDecision.blockId` | Read current record/current-first resolver; application service result | Existing legacy actions become compatibility-only wrappers or are removed from active paths | recommendation actions | 3 / critical |
| `progress-dashboard.ts` / block transition action flow | `getBlockTransitionPreview`, active block type and legacy deload state | Current decision outcome/reason; volume context from mesocycle/microcycle/fatigue/evidence | Read-only; never apply | Progress, historical immutability | 4 / high |
| `use-workout-logger.ts` / completion advance | Calls automatic microcycle advance after planned work | Persist current microcycle evaluation and call decision writer; do not apply from logger | logger writes/evaluates once; application remains controlled action | Train/logger, exact target | 5 / critical |
| `programmes.tsx` / direct mesocycle transition | UI invokes direct target transition | Application service receives persisted ready decision only | No legacy reader | Plan action test | 6 / high |
| `design-qa-fixtures.ts` | Uses legacy action functions to seed block transition/deload fixtures | Seed current decision records and invoke application service where fixture requires applied state | Legacy fixture labels stay deferred V2/historical only | design QA fixtures | 7 / medium |
| volume/recovery/fatigue calls in `progress-dashboard.ts` | Pass active block type / block deload state | Narrow current volume context maps mesocycle/microcycle and current decision/fatigue; underlying formulas unchanged | Current decision wins; legacy block is no longer decision authority | volume, Progress | 4 / high |
| `current-mesocycle-decision-repository.ts` and resolver | Stage 1 current state; legacy supplied explicitly | Canonical decision read path | Current first; shadow bridge only writes safe mappings | persistence suite | foundation / low |
| `annual-planner.ts`, `training-year`, strategic/V2 policy | Annual block policy, QA, historical lanes | Deferred; not a Stage 2 current decision reader migration | Retained compatibility/deferred V2 | legacy/V2 suites | out of scope |

## Migration rule

Current production readers must receive a hydrated current decision (or explicit missing/invalid state). They cannot derive a new decision from a legacy block decision, block array order, or block week. The legacy shadow bridge remains the only permitted writer of shadow vocabulary until Stage 3 removes it.

## Implementation blocker

Stage 1 has no canonical writer for `MicrocycleEvaluationState` or `PerformanceBasedFatigueTrend` from persisted planned-session evidence. The only live completion path currently calls `advanceCompletedMicrocycle`, which applies a default-week/first-successor rule without producing the minimum exposure, required-role, completion-quality, target-achievement, trend, or approved-prerequisite inputs required by `evaluateAndPersistMesocycleDecision`.

Using that legacy auto-advance as a substitute would either fabricate `continue`/`advance`/`deload` inputs or preserve the block/array authority Stage 2 is meant to retire. The next safe implementation unit is therefore a current microcycle evidence/readiness producer, with product-approved derivation policy for objective conclusion, productive stimulus, fatigue trend, and approved prerequisites. Until it exists, a decision application service cannot safely be connected to Plan, Train/logger, Progress, volume, or recommendation consumers.

## C2 dependency note

Consumers still cannot produce decisions. C2 adds only pure context for C3: snapshot-derived exposure, non-selected approved successor candidates, and explicit objective-policy absence.
