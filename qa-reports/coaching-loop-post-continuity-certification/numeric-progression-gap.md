# Numeric progression and regression gap

## Exact cause

The absence of numeric progression/regression is intentional in the mounted
contract, not an application-bound or Session Construction accident.

1. `CanonicalPhaseOneDecisionDetails.boundedAdjustment` requires
   `numericLoadAdjustmentAuthorised: false`.
2. `evaluateCanonicalPostWorkoutProgress` returns `maintain` after a successful
   established exposure with reason
   `automatic_numeric_adjustment_not_authorised`.
3. Repeated failure returns `recalibrate` with
   `numeric_regression_not_automatically_authorised`.
4. The decision has no increment/decrement field.
5. Application can establish an observed load, remove an established load, or
   reconstruct a cycle; it cannot request a new numeric target.
6. Session Construction therefore receives either the same established load
   map or a map with an exercise removed.

Verdict: **PROVEN** diagnosis.

Production entrypoint:
`evaluateCanonicalPostWorkoutProgress` →
`phaseOneDecisionDetails` →
`applyPhaseOneDecision`.

Persisted state: phase-one decision, bounded adjustment, load evidence, v2
receipt, carrier snapshots. Representative tests: success maintenance,
repeated comparable failure, unit/substitution identity, rounded/bounded no-op.
Affected configurations: all established-load training. Confidence: high.

## Paired production-path counterfactuals

| Pair | Expected expert distinction | Current actual distinction | Verdict |
| --- | --- | --- | --- |
| First success vs repeated success | calibrate first, later permit bounded overload when criteria met | first can calibrate; every later success maintains | CONTRADICTED as progression |
| Normal vs high responder | high responder may reach eligible bounded progression sooner | after calibration both follow the same maintain branch | CONTRADICTED |
| Stable targets vs excessive drop-off | stable may progress; drop-off must not | stable maintains; drop-off maintains with explicit block reason | PARTIALLY PROVEN safety |
| One failure vs repeated qualified failure | one maintains; repeated may regress/recalibrate | one maintains; repeated exercise-keyed failure recalibrates | PARTIALLY PROVEN because comparator compatibility is incomplete |
| kg vs lb display | display change must not cause demand change | display unit excluded; only base-kg performance can establish load | PROVEN |
| Available increment vs unrepresentable increment | representable increment may progress, unrepresentable must no-op | neither reaches an increment resolver | UNREACHABLE |
| Main lift vs accessory | policy should distinguish progression model | both use the same no-numeric branch after establishment | NOT PROVEN |
| Hypertrophy vs strength | prescription-context policy should differ | structural Session Construction differs; performance-driven numeric policy does not | NOT PROVEN |
| Within-Mesocycle vs boundary session | ordinary success may adjust target; boundary may construct/transition | within phase maintains; boundary constructs deterministic sessions | PARTIALLY PROVEN continuity only |
| Same exercise vs substituted exercise | same compatible exercise may use history; substitution must not inherit | substitution cannot establish calibration; same exercise is accepted without full prescription comparator | PARTIALLY PROVEN |

## Specific non-causes

- Evidence threshold is not the final blocker for repeated success: successful
  established exposure reaches the explicit no-numeric branch.
- Load increments/equipment resolution are not invoked.
- Application rounding/bounds do not remove proposed numeric changes because
  no numeric proposal exists.
- Session Construction does not overwrite an evaluator increment because the
  evaluator never emits one.
- Phase restrictions do not explain all cases; the prohibition is unconditional
  in this Phase-1 decision schema.

## Required future policy

A later bounded policy must define:

- prescription-compatible exposure identity;
- minimum stable successes and failure qualification;
- equipment/unit-representable increments;
- distinct main-lift/accessory and strength/hypertrophy rules;
- phase, recovery, limitation, and stop-rule contraindications;
- number-to-number bounds and no-op behavior;
- exact factual explanation and rollback/idempotency tests.

This needs external evidence review reconciled with current product policy. It
must not be inferred from the existing fixture counts or historical coaching
texts alone.
