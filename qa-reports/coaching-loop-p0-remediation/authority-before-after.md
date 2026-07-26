# Authority before and after

## Before

Train durably recorded workout and Progress evidence. Evaluation, decision production, and application existed as disconnected contracts. UI surfaces presented the current carrier but no production caller could author the next prescription from completed training.

## After

| Responsibility | Canonical authority |
| --- | --- |
| Durable completion and performed work | `canonical-recorded-session-application.ts` and recorded-session ledger |
| Post-workout coordination | `canonical-post-workout-orchestrator.ts` |
| Factual interpretation | `evaluateCanonicalPostWorkoutProgress` |
| Decision persistence | `canonical-progress-decision-production.ts` and decision repository |
| Future prescription application | `canonicalActivePlanState.applyProgressDecision` |
| Exact future exercises/sets/reps/load states/rest/methods | existing Session Construction |
| Presentation | shared canonical active-plan read model, Home/Plan/Train projections, completion summary |

The orchestrator is imported by the durable completion application only. Home, Plan, Train, and completion presentation do not evaluate or apply coaching logic.

## Precedence

1. Immutable identity and context validity.
2. Pain/review evidence.
3. Fresh, complete recovery/capacity evidence.
4. Repeated comparable failure.
5. current target completion/drop-off.
6. completed Microcycle exposure; an approved successor remains review-only without machine-evaluable objective policy.
7. verified calibration.
8. explicit maintain.

Legacy, shadow, UI-authored, and experimental authorities remain unmounted.
