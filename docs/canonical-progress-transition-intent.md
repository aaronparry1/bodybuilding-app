# Canonical Progress transition intent

`canonical_progress_evaluation_v2` adds an explicit Progress-owned outcome and deterministic evidence-version provenance. Transition intent requires an explicit `exitCriteriaSatisfied` evidence fact; deload intent requires an explicit `deloadRequired` or `recoveryState: recovery_first` fact. Both are policy-gated and ambiguous simultaneous signals resolve to review.

Decision production maps v2 intent to the existing canonical decision contract and invokes the canonical Mesocycle successor owner for the approved successor. It persists the successor identity but never mutates the active plan. Application remains exclusively owned by `applyCanonicalProgressDecision`.

Design-QA Progress migration is not certified by this phase; fixture-level transition/deload application coverage remains the next gate.
