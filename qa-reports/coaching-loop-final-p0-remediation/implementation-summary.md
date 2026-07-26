# Final P0 coaching-loop remediation

Starting commit: `25da391c1392577182ddd3d498c5aef155a71e40`

This bounded remediation closes PC-P0-01, PC-P0-02 and PC-P0-03 without
adding progression policy, athlete facts, successor edges, methods, or a
second coaching authority.

## Corrections

1. `compareCanonicalMaterialPrescriptions` now projects stable session, slot,
   exercise and linked-group semantics while excluding generated persistence
   identity, timestamps, revisions, provenance and display metadata.
2. A blocked final-session result persists
   `canonical_coaching_boundary_state_v1`. Startup reconciliation retries only
   after its declared evidence/construction/policy trigger changes.
3. `applyCanonicalProgressDecision` writes a durable
   `canonical_coaching_application_intent_v1` before carrier CAS. Restart can
   distinguish pre-state, exact committed result and conflicting/newer state.

Production entrypoint remains
`completeCanonicalSession` → `orchestrateCanonicalPostWorkoutAdaptation`.
Mounted adaptation authorities: **1**. Competing authorities: **0**.

## Fresh result

- Two isolated 12-scenario/12-week runs: 12/12 reached, zero deadlocks,
  semantically identical.
- Coaching opportunities/run: 648.
- Truthful material applications: 155.
- Explicit no-change results: 493.
- Generated-ID-only applications: 0.
- Numeric progressions/regressions: 0/0 (intentionally unchanged scope).
- Exhaustive boundary inputs: 154, across all 22 canonical Mesocycles.
- Focused material/boundary/coaching suite: 47 tests passed before broader
  regression verification.
- Full automated suite: 371 files and 2,219 tests passed.
- TypeScript, production Expo public config, web export and production-payload
  scan passed.

Verdict: the three implementation defects are repaired in the tested
production paths. This does not certify a complete autoregulated progression
policy.
