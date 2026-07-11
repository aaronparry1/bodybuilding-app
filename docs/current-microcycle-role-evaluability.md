# Current microcycle role evaluability

Current decisions no longer include `regress`. A rebuild or lower-stress route must be an explicit macrocycle-approved successor; otherwise the evaluator returns `review_required`.

`deriveRequiredPlannedRoles` derives ordered role occurrences only from the current mesocycle and microcycle. `matchPlannedRoles` accepts only matching planned session identities, counts each occurrence once, and excludes custom/extra work. Explicit construction blocks remain blocked; skipped required work is disrupted; open work remains unresolved.

`evaluateMicrocycleRoles` returns `in_progress`, `evaluable`, `insufficient`, `disrupted`, `blocked`, or `invalid`. It requires an externally supplied minimum-exposure gate; calendar or block-week state is never used.

Deferred Phase 11A.2B: stored exact-target quality aggregation, performance/fatigue trends, and successor-context production. Deferred Phase 11A.2C: evidence snapshot persistence, exposure, readiness production, and decision-writer integration.
