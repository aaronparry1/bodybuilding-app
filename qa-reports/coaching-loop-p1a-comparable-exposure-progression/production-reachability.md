# Production reachability

Mounted route:

`recordCanonicalPerformedWork` → canonical ledger event and performance evidence → `completeCanonicalSession` → durable completion evidence → `orchestrateCanonicalPostWorkoutAdaptation` → `evaluateCanonicalPostWorkoutProgress` → persisted decision → existing application intent → `canonicalActivePlanState.applyProgressDecision` → CAS → receipt → Home/Plan/Train projections.

The evaluator derives numeric intent; it does not mutate. Earlier-session intent within the same Microcycle is recovered from persisted decisions at the final boundary and passed to the existing application authority. Startup reconciliation executes persisted intent and does not reevaluate coaching policy.

Authority count: 1 mounted adaptation authority. Competing and UI authorities: 0.

Completed-set edits replace evidence before completion; reconciliation uses effective ledger work. Discarded and incomplete attempts cannot satisfy completed exposure requirements.
