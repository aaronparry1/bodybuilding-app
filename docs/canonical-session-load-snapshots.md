# Canonical session load snapshots

New Session Construction emits `canonical_session_snapshot_v3`. Each slot carries a validated `CanonicalLoadPrescription` resolved from the canonical exercise metadata, Mesocycle loading mode, and Progress evidence supplied to construction.

`canonical_session_snapshot_v2` remains a supported historical transport. It is accepted by the active-plan carrier and restoration paths without being rewritten or enriched. Load semantics therefore remain immutable at the version boundary: v3 is the first version that requires an explicit load state, while v2 records retain their original shape.

The public/session projections continue to consume the primitive prescription fields. No legacy block, workout-history, or fallback load authority is consulted.
