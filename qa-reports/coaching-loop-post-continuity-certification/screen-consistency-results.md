# Home, Plan, and Train consistency

## Identity

All three surfaces resolve from one hydrated canonical active-plan carrier:

- Home: `readCanonicalHomeProjection`;
- Plan: `projectCanonicalPlan`;
- Train: `canonicalActivePlanState.getPlannedSession` and
  `projectCanonicalWorkoutPresentation`.

Representative production-path test:
`Home, Plan and Train resolve the same regenerated future-session identity`.
Successor and fallback tests prove the same carrier is committed before any
projection reads it.

Persisted state: carrier revision, planned session IDs, progress decision
reference, cycle lineage. Affected configurations: ordinary next week,
approved successor, same-phase fallback, no-op, and failed application.
Confidence: high.

Verdict: **PROVEN** for identity consistency.

## Partial-state visibility

- Carrier CAS commits the new cycle and all future snapshots together.
- Returned receipt failure rolls that CAS back before returning.
- CAS failure leaves all screens on the prior carrier.
- A semantic no-op retains existing future IDs and revision.

Verdict: **PROVEN** for returned failure paths.

The hard interruption after carrier CAS exposes the new plan before a receipt
exists. Screens remain mutually consistent, but the coaching explanation and
work-item state are incomplete. Verdict: **CONTRADICTED** for complete
transaction visibility.

## Decision explanation

Read-model Progress explanation prefers the persisted v2 receipt. This is
truthful for 646/648 opportunities in the fresh run. For the two
generated-group-ID-only applications, the receipt preserves a calibration
explanation even though no training demand changed.

Verdict: **CONTRADICTED** for complete explanation truth.

## Review boundary

At a final-session constrained-recovery review, all screens consistently see
no next session and the same blocked decision. Consistency is real; continuity
is not.

Verdict: **PROVEN** consistency, **CONTRADICTED** usable next coaching
opportunity.
