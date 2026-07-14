# Ordinary v2 canary readiness gates

D4E3C4E3B adds bounded boundary-event encoding and a pure readiness evaluator. Events contain only schema, boundary, certification, family/role, authority, outcome, and reason metadata; user identifiers, exercise names, prescriptions, loads, session objects, and free text are excluded.

Readiness requires complete fresh evidence for all three ordinary roles, supported builds, rollback availability, zero invariant/output violations, and zero thresholded failures. The current artifact is `insufficient_evidence`: no real-user observation window exists. The authority boundary remains disabled by default and no activation or remote rollout control is added.
