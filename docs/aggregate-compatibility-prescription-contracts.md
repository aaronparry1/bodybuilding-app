# Aggregate compatibility prescription contracts

D4E3C2 introduces an isolated, versioned semantic representation for one complete compatibility prescription branch. It does not route runtime helpers or change generated output.

The aggregate contains rep, lane, set-construction, starting-load, drop-off, shutdown, and suitability semantics under one stable branch identity. Resolution is all-or-nothing: a missing or contradictory sub-policy cannot produce a partial arithmetic input. The registry uses a normalized compatibility branch key for exact characterization lookup, while the resolved aggregate remains block-free and retains no mutable block object.

The registry currently covers seven characterized branch families: fresh and established hypertrophy primary compounds, fresh and established hypertrophy accessories, strength primary, power primary, and deload. Lookup has no wildcard, first-match, closest-match, or array-position fallback. Unsupported and invalid combinations return explicit outcomes.

Validation checks version identity, branch completeness, rep/set bounds, sub-policy consistency, drop-off/shutdown coherence, suitability, and classification alignment. Copy helpers defensively copy nested arrays and objects. Fingerprints are deterministic semantic fingerprints and are not branch IDs or programme identity.

No existing prescription helper imports this registry. No formulas, callers, D4D2 routing, persistence, fallback, or current-policy runtime behavior changed. The next phase is D4E3C3: implement the sole compatibility aggregate resolver and prove it matches the existing helper outputs before migrating any consumers.
