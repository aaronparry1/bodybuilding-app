# Phase 11A.2 current evidence/readiness map

| Evidence field | Authority | Immutable | Missing behaviour | Producer |
| --- | --- | --- | --- | --- |
| required roles | `currentMicrocycle.sessionRoles` | current plan state | invalid if absent | deduplicated role/index pairs |
| completed planned roles | stored `WorkoutHistorySummary` planning identity | yes | unresolved | count one planned completion per session index |
| exact-target quality | `workout-history.ts` stored exact targets/actuals | yes | insufficient | ordinal target met/missed aggregation |
| drop-off / stops | stored exercise summary settings/outcomes | yes | insufficient | structured counts, not a new score |
| blocked roles | construction/intervention result | derived | blocked only when explicit source is supplied | producer input, never inferred from absence |
| exposure | prior persisted snapshots for current mesocycle | yes | zero evaluable exposure | count evaluable snapshots only |
| successors | `MesocycleSpec.nextStates` filtered by eligibility | current library | empty approved list | direct validation |
| prerequisites | no explicit current architecture mapping | N/A | empty list / explicit unavailable | do not infer from legacy order |

Legacy block week/order and block decisions are excluded from the producer.

Phase 11A.2A implements only role derivation, matching and evaluability. Trends, fatigue, exposure, snapshot persistence and writer integration remain deferred.
