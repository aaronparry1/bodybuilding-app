# Compatibility selector authority decisions

D4E3C4D10 audited the selector families without introducing wrappers that infer winners after the fact. The current primitive rep and lane helpers discard branch identity at their return contracts, so production decomposition must begin inside those existing return branches.

No precedence, formulas, generated output, public façade, v2 routing, persistence, or fallback behavior changed. The next rollback-safe subphase is to enrich `resolveRepRange` directly, preserve its primitive façade, and verify exact output equivalence before lane work.
