# Canonical Progress Load Intervention — Blocked Boundary

Status: `blocked_by_missing_mesocycle_load_adjustment_policy`

The requested load-intervention evaluator and application owner are not implemented in this phase because the canonical Mesocycle owner does not yet define the policy facts required to make a bounded decision. This is an explicit fail-closed result, not a compatibility fallback.

## Existing canonical facts

- `MesocyclePrescriptionPolicy` defines loading modes, progression families, rep target envelopes, evidence-required flags, and drop-off response.
- `CanonicalLoadPrescription` defines established, calibration-required, autoregulated, bodyweight, and unavailable load states. Exact future loads are resolved by Session Construction.
- Progress evidence repositories and the canonical decision producer retain plan/revision/evidence identity and stale-chain checks.
- `canonical-progress-intervention_v1` permits a `load_adjustment` disposition but intentionally contains no exact prescription fields.

## Missing policy-owned facts

The current Mesocycle policy has no canonical fields for:

1. bounded load-adjustment magnitude or step/range;
2. productive target-range semantics for load decisions;
3. soft-cap semantics for load decisions;
4. minimum evidence count and freshness window for load adjustment;
5. explicit contraindications/ambiguity rules for increase, maintain, and reduce;
6. policy-owned handling for regression/drop-off evidence;
7. policy identity/version for those rules.

The existing rep target envelopes and legacy recommendation helpers cannot supply these facts. Reusing them would violate canonical ownership and introduce copied legacy thresholds.

## Required next boundary

Define and certify a versioned Mesocycle load-adjustment policy containing the missing fields above. Only after that policy is complete should Progress implement a pure load-intervention evaluator. Session Construction must remain the sole owner of exact future load calculation, and the application owner must remain responsible only for policy-input persistence, CAS, and future-session regeneration.

No affected Design-QA fixtures are migrated here. The eight load-dependent fixture IDs remain explicitly blocked:

- `train_load_regression_reduce`
- `train_load_escalation`
- `train_load_escalation_modal`
- `train_load_average_next`
- `train_productive_below_min`
- `train_productive_target_zone`
- `train_productive_soft_cap`
- `train_productive_over_soft_cap`

