# Compatibility prescription aggregate resolver

D4E3C3 adds the sole compatibility aggregate resolver without changing production prescription callers. The resolver receives complete branch facts, normalizes them, performs exact registry lookup, validates the returned aggregate, and returns one defensive `CompatibilityPrescriptionSemantics` value or an explicit failure.

The only block-aware operation is the isolated input projector. The resolver result contains no block object, block identity, workout, repository, callback, target, or persistence state. It performs no rep, set, load, drop-off, or suitability arithmetic. There is no wildcard, closest-match, first-match, or fallback branch.

All seven D4E3C0 branch families are resolved from real normalized facts in focused tests. Existing helpers are intentionally unchanged; D4E3C4 must establish complete field-level helper equivalence before any caller is migrated.
