# Exercise intervention session construction

Existing intervention records support only exercise-level decisions: `keep`, `substitute`, `rotate_at_phase_boundary`, and `replace`, with a reason and optional replacement exercise ID. They do not model expiry dates, clinical severity, body regions, user scopes, or medical clearance.

During planned-session construction, normal movement-pattern and experience eligibility is built first. Active records are then resolved by the existing `isExerciseInterventionActive` helper. `replace` and `unavailable` are hard exclusions. `substitute` and `rotate_at_phase_boundary` prefer a declared replacement only when it is already in the normal eligible pool; otherwise the normal candidate pool remains in control. `keep` is a no-op.

Hard exclusions are applied before scoring. If a required slot has no remaining candidate, construction returns `null`; it never selects an excluded exercise or silently changes the session role. The selected workout may store only a derived intervention key in its exercise note, not the intervention’s evidence prose.

Interventions affect future construction only. They do not rewrite in-progress or completed workouts, stored prescriptions, historical analytics, Progress, exact targets, load history, or progression identity. A substitute retains its own exercise ID and therefore its own load/progression evidence. Non-planned sessions remain outside this planned-constructor integration.

Deferred work: intervention authoring UI, expiry/scope semantics, medical modelling, in-progress workout substitution automation, and broad legacy deletion.
