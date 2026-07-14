# D4E3C4E1 v2 shadow-resolution map

The final compatibility decision calls `shadowResolveCompatibilityV2` after production rep and lane values are resolved. The projector supplies only known block, role, slot, family, lane, and rep facts. It never accepts production or v2 winner IDs from callers and never feeds the v2 result back into production.

Eligibility is explicit. Unsupported or incomplete facts yield `not_evaluated`; resolver failures yield `v2_resolution_failed`; bound differences yield `resolved_difference`. The result remains an internal field on the final decision carrier and is ignored by generated-settings projection.
