# Canonical Progress decision production

`produceCanonicalProgressDecision` is the Progress-owned persistence boundary. It validates the current canonical plan revision, cycle identities, evaluation chain, evidence existence/version, and deterministic operation identity before persisting a `canonical_progress_decision_v1` record. Retries are idempotent and conflicting operation identities fail closed.

Production does not apply the decision or mutate the active plan. Application remains exclusively owned by `canonicalActivePlanState.applyProgressDecision`.

The current evaluation contract only expresses `ready`, `review_required`, and `insufficient_evidence`. It does not carry explicit transition/deload intent or an approved successor identity. Those outcomes remain blocked until that canonical field is added; no fixture name or legacy recommendation is used to infer them.
