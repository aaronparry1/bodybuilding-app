# Compatibility selector authority decisions

D4E3C4D10A now enriches the existing rep-range selector with `resolveRepRangeDecision`. It preserves the exact conditional order and the primitive `resolveRepRange` façade while carrying explicit-override, block, family, default and advanced-method identities. The remaining lane and collision selector families are still blocked and will be handled independently.

No precedence, formulas, generated output, public façade, v2 routing, persistence, or fallback behavior changed. The next rollback-safe subphase is to enrich `resolveRepRange` directly, preserve its primitive façade, and verify exact output equivalence before lane work.
