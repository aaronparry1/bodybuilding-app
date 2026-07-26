# Canonical coaching-loop P0 remediation

Starting commit: `2a68e6331a3ebfdf7202768148a1839e22e2e397`

## Repaired audit findings

- **F01 / P0 — Mounted coaching loop does not close.** `completeCanonicalSession` now invokes one production authority, `orchestrateCanonicalPostWorkoutAdaptation`, only after a planned workout and its completion evidence are durable.
- **F02 / P0 — Established-load reconstruction is invalid.** Reconstruction resolves load facts by `exerciseId`; `slotId` remains provenance only. A valid observed calibration persists as exercise-scoped `CanonicalLoadEvidence`.
- **F03 / P0 — Actual evidence cannot derive transition/deload intent.** The v3 evaluator derives bounded outcomes from immutable prescription targets, performed-work events, factual evidence, cycle state, and approved successors. Caller-authored transition/deload flags are ignored.

## Mounted path

`Train complete command`
→ immutable recorded-session completion
→ completion/performance evidence
→ recorded-reference reconciliation
→ `canonical_post_workout_orchestrator_v1`
→ `canonical_progress_evaluation_v3`
→ persisted `canonical_progress_decision_v1`
→ `canonicalActivePlanState.applyProgressDecision`
→ future-only Session Construction
→ persisted application receipt
→ shared canonical read model used by Home, Plan, and Train.

Extra sessions do not enter the planned-workout adaptation path.

## Phase 1 outcomes

- `establish_calibration`: carries a verified observed exercise load into comparable future construction without inventing an increment.
- `maintain`: explicit persisted no-change for a successful established exposure or one incomplete exposure.
- `recalibrate`: removes established loading for affected exercises after two qualified comparable failures; no automatic numeric reduction.
- `advance_microcycle`: constructs the next week after the full current week is complete.
- `transition boundary`: persists an explicit review/no-change decision after canonical default exposure when the current textual objective policy cannot be evaluated safely. An approved successor alone does not authorize application.
- `blocked`: explicit no-change for missing context, pain/review, or constrained/conflicting recovery evidence.

Automatic numeric load increases/reductions and automatic deload application remain unsupported because no approved canonical numeric/application rule authorises them. No new method, split mutation, exercise replacement, or speculative volume change was introduced.

## Context

Newly created carriers persist the exact exercise catalogue identity, equipment constraint, typed limitations, exercise preferences, initial established loads, load evidence, and recalibration requirements. Existing carriers without this context are interpreted only when facts can be recovered unambiguously; otherwise reconstruction fails closed.

## Certification

The mounted 12-scenario matrix produces 5 appropriate future changes and 7 justified explicit no-change/blocked outcomes. No scenario silently omits a decision.
