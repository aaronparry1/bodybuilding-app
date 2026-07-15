# Canonical Design-QA load fixtures

The 14 load and calibration fixtures now enter through `canonicalActivePlanState`, Session Construction, the canonical recorded-session ledger, and `canonical_session_snapshot_v3`. Their projection reads the slot `CanonicalLoadPrescription`; it does not read legacy workout history or block fields.

Missing evidence is represented as `calibration_required` (or `unavailable` when the loading mode cannot be served). The bodyweight fixture is explicitly `bodyweight`. No missing load is converted to zero and no legacy recommendation object is produced.

The session-family bridge is no longer reachable for the 29 canonical session IDs. Eight recommendation-owned Train IDs remain in the Progress/decision family and are intentionally outside this migration.
