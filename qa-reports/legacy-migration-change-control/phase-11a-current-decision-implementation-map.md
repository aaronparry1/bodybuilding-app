# Phase 11A current decision implementation map

| File | Change | Legacy state | Stage 2 requirement |
| --- | --- | --- | --- |
| `current-progression-transition-decision.ts` | Pure current decision union and precedence evaluator | None read or written | Connect evaluated evidence and lifecycle persistence. |
| `current-progression-transition-decision.test.ts` | Delay/continue/deload/advance/regress/review contract coverage | None | Add evidence-trend and persistence cases. |

The legacy block decision remains untouched. Stage 2 must add evaluated fatigue evidence, microcycle completion/readiness persistence, and a shadow writer before migrated consumers read current decisions. Stage 3 may delete legacy decision state only after all consumers migrate.
