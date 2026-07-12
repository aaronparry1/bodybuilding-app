# Stage 2C2A1-R strategic replacement audit

## Call graph

| Symbol | Active caller | Inputs | Output classification | Current owner / action |
| --- | --- | --- | --- | --- |
| `buildStrategicCoachingViewModel` | `progress-dashboard.ts` | History, exercises, planning mode, `currentBlockType` | Mixed presentation and duplicate authority | Replace Progress call with current read-only summary. |
| `buildStrategicCoachingViewModel` | `home-dashboard.ts` | History, exercises | Mixed presentation and duplicate authority | Retain temporarily; Stage 2D caller migration. |
| `buildStrategicCoachingViewModel` | real-use and end-to-end QA | Fixture history | Compatibility/test fixture | Reclassify after active callers migrate. |
| `createCoachingBlock` / `createCoachingPlan` | strategic presenter and strategic tests | `BlockType`, week/order | Legacy authority construction | Delete only after all callers migrate. |
| `recommendStrategicAction` | strategic presenter | Current block/plan/readiness | A — duplicate decision authority | Current readiness, persisted decision, application service. |
| `adaptHistoryToStrategicSignals` | strategic presenter | Immutable history plus `currentBlockType` | C only where history-only; current block input contaminates it | Audit/rebuild historical-only insight separately. |

## Output classification

| Legacy output | Category | Current owner / replacement |
| --- | --- | --- |
| `advance_block`, `continue_block`, `repeat_block`, `deload_then_continue` | A — duplicate decision authority | Persisted `advance`, `continue`, `deload`, `delay`/`review_required`. Remove from current Progress. |
| Next block type / order / repeat instruction | A | Approved successor graph and persisted advance target; never infer. |
| Current block label/week/readiness label | B — read-only explanation | Mesocycle purpose, microcycle priority, snapshot state, exposure, decision reason. |
| Progression rate, historical quality/volume tolerance, stalled-exercise observations | C — retain only if no block semantics | Immutable stored-prescription history; rebuild only as historical insight. |
| Goal-specific strategic prioritisation beyond current decision/evidence | D — product decision required | No approved current semantics. |
| Legacy planning-mode labels and block-plan copy | E — dead presentation complexity | Delete after Home/QA callers migrate. |

## Replacement decision

**Option 1: no strategic formula is required for current Progress is preferred.** Current Progress can present a `CurrentProgressStrategicSummary` direct projection: status, mesocycle purpose, microcycle priority, readiness/decision state, persisted advance target, and compatibility reason. Historical cards remain independently authoritative.

No new decision, successor ranking, or strategic recommendation engine is justified by the current contract. If product wants a new analytical engine later, it must define the exact question, inputs, output, and policy independently of transition authority.

## Precedence and deletion gates

1. Invalid/no snapshot: unavailable current analysis.
2. Blocked/disrupted/insufficient: explain assessment unavailable.
3. Persisted current decision: authoritative action/context.
4. Historical insight: supporting only; never overrides a decision.
5. Legacy strategic output: compatibility only; never merged with current advice.

Delete the Progress call to the presenter in Stage 2C2A1.2 after the summary projection is introduced. Retain the legacy module for `home-dashboard.ts`, QA, `deload-prescription.ts`, and type-only `success-model.ts` callers until each is migrated or classified. Tests asserting block advance/repeat/deload are obsolete authority assertions; historical-signal tests require a future history-only replacement matrix.

## Bounded sequence

| Phase | Work | Tests | Commit / rollback |
| --- | --- | --- | --- |
| 2C2A1.1 | Add direct read-only `CurrentProgressStrategicSummary` | Current decision/no successor/compatibility/purity | `refactor: add current Progress strategic summary`; rollback isolated new module. |
| 2C2A1.2 | Replace Progress presenter call and block recommendation copy | Dashboard current-first/historical invariance | `refactor: consume current Progress strategic summary`; rollback caller only. |
| 2C2A1.3 | Remove dead Progress strategic adapter tests/call | Architecture test | `refactor: remove Progress strategic block adapter`; retain shared module. |
