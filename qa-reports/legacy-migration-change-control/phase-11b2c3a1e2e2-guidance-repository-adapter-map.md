# Guidance repository adapter map

`getActivePlan` supplies the only active-plan read; adjustment records are resolved by exact ID from its persisted recommendation state. `listWorkoutSessions` supplies planned references filtered by persisted mesocycle, microcycle and session identity and sorted deterministically by identity. Exact-target coverage is metadata only.

The repository currently has no persisted guidance-target container carrying the complete programme identity contract. `findGuidanceTargets` is therefore a mandatory narrow read adapter for E2E3, not a first-match fallback. Missing/ambiguous targets must remain unresolved. All adapters are read-only; no repository write API is exposed.
