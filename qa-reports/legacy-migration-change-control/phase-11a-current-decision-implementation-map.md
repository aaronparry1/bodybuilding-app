# Phase 11A current decision implementation map

| File | Change | Legacy state | Stage 2 requirement |
| --- | --- | --- | --- |
| `current-progression-transition-decision.ts` | Pure current decision union and precedence evaluator | None read or written | Connect evaluated evidence and lifecycle persistence. |
| `current-progression-transition-decision.test.ts` | Delay/continue/deload/advance/regress/review contract coverage | None | Add evidence-trend and persistence cases. |
| `current-progression-transition-decision-record.ts` | Versioned, block-free current decision record and lifecycle/evidence summary | None | Read record through current resolver only. |
| `current-mesocycle-decision-repository.ts` | Current record persistence, payload validation, hydration and unresolved-decision supersession | Legacy store untouched | Migrate consumer reads to repository/hydration result. |
| `current-progression-transition-decision-writer.ts` | Sole normal current writer: evaluator then current persistence | None | Stage 2 action handlers apply ready decisions explicitly. |
| `current-progression-transition-decision-compatibility-resolver.ts` | Compatibility-boundary current-first resolver; legacy can only be an explicit compatibility result | Does not merge authority | Migrate recommendation, transition, Progress, volume and logger reads. |
| `current-progression-transition-legacy-shadow.ts` | Temporary isolated mapping and persist-then-shadow compatibility bridge for safe legacy equivalents only | `delay`, `continue`, `deload`, `advance` only; no new reader | Delete after every legacy decision reader is migrated. |
| `current-mesocycle-decision-persistence.test.ts` | Record, lifecycle, hydration, precedence, shadow and no-side-effect coverage | Tests compatibility result without making it current | Expand only with Stage 2 consumer contract tests. |

The legacy block decision remains untouched. Stage 2 must connect evaluated fatigue evidence and microcycle completion/readiness to the authoritative writer, then migrate readers. Stage 3 may delete legacy decision state only after all consumers migrate, all shadow writes are removed, no import remains, and compatibility records are either migrated or explicitly unsupported.
