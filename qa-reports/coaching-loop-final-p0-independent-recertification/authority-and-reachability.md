# Authority and reachability

Verdict: **PROVEN**.

- Mounted post-workout adaptation authorities: 1.
- Competing authorities: 0.
- UI adaptation authorities: 0.
- Fixture-only boundary authorities: 0.

Production chain:

`completeCanonicalSession`
→ `orchestrateCanonicalPostWorkoutAdaptation`
→ factual evidence repository
→ canonical evaluation/decision repository
→ `canonicalActivePlanState.applyProgressDecision`
→ application intent
→ active-plan carrier CAS
→ v2 receipt
→ boundary resolution
→ Home/Plan/Train projection.

`canonical-recorded-session-application.ts` invokes the orchestrator on durable
completion. `canonical-completion-evidence-reconciliation.ts` invokes the same
orchestrator to resume persisted work; it is not a second evaluator.

Home commands and recommendation actions dispatch persisted decisions through
the same `canonicalActivePlanState.applyProgressDecision` boundary. They do not
construct or independently decide a future prescription.

Startup reconciliation compares persisted intent fingerprints and actual
carrier state. It can retry, reconstruct or block; it cannot create a new
coaching decision.

Legacy, ordinary-v2, shadow, Design-QA and test-only evaluators do not
participate in this mounted chain.
