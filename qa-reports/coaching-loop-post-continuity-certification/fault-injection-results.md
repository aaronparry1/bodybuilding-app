# Fault-injection results

All executable cases use isolated local repositories and synthetic canonical
plans. No cloud or user data is touched.

| Required fault | Durable result | Retry result | Verdict |
| --- | --- | --- | --- |
| 1. Ledger succeeds; first work-item creation fails | completed ledger; reconciliation performs a second deterministic attempt write | same completion resolves once | PROVEN for transient failure; NOT PROVEN for persistent attempt-store failure |
| 2. Work item succeeds; derived evidence fails | completed ledger + pending attempt; future unchanged | startup reconstructs evidence and resolves once | PROVEN |
| 3. Evidence succeeds; decision persistence fails | ledger + evidence + pending attempt; future unchanged | startup persists one decision and resolves | PROVEN |
| 4. Decision succeeds; application CAS fails | ledger + evidence + decision; future unchanged | retry applies once | PROVEN |
| 5a. Carrier applies; receipt returns failure | application rolls carrier back | retry reapplies and writes one receipt | PROVEN |
| 5b. Process interrupts before receipt returns | carrier remains advanced; decision has no receipt; attempt is `decision_persisted` | startup repeats without convergence | CONTRADICTED |
| 6. Restart at evidence/decision/CAS returned failures | deterministic pending attempt rediscovered | converges | PROVEN |
| 6b. Restart at receipt interruption | decision-reference short circuit | does not reconstruct receipt or terminalise attempt | CONTRADICTED |
| 7. Duplicate retry at stable boundary | existing evidence/decision/receipt | no second revision | PROVEN |
| 8. Concurrent retry | deterministic IDs + carrier CAS | no double application; second result is not original applied result | PARTIALLY PROVEN |
| 9. Completed-work edit before completion reconciliation | repair event and replacement evidence durable | latest effective event drives completion | PROVEN |
| 10. Edit after evidence creation while active | evidence observations replaced from effective repair event | restart reproduces replacement | PROVEN |
| 11. Edit after an unapplied decision | completed session is immutable; edit rejected | original evidence/decision remains coherent | PROVEN |
| 12. Missing performed-work identity | factual review evidence persisted | terminal blocked no-change, no invented identity | PROVEN |
| 13. Ambiguous duplicate performed-work identity | reconciliation selects first match | ambiguity is not explicitly rejected | NOT PROVEN |
| 14. Evidence cannot legitimately be reconstructed | missing slot identity blocks; missing plan revision stays retryable | no invented context, but not every irreconstructible context terminalises | PARTIALLY PROVEN |

## Transaction assertions

- Completed history is never removed in tested faults: **PROVEN**.
- Returned repository failures cannot double-progress: **PROVEN**.
- Stale carrier CAS cannot overwrite a newer revision: **PROVEN**.
- Application and receipt always converge after process interruption:
  **CONTRADICTED**.
- Pending work is always rediscovered without UI: **CONTRADICTED** for an
  absent attempt or post-CAS/pre-receipt interruption.
- Unsupported evidence is never invented: **PROVEN**.

Production entrypoints: `completeCanonicalSession`,
`reconcileCanonicalCompletedSessionEvidence`,
`resumePendingCanonicalCoachingWork`, `orchestrateCanonicalPostWorkoutAdaptation`,
and `applyCanonicalProgressDecision`.

Persisted stores: ledger, evidence, attempts, decisions/receipts, and active
carrier. Affected configurations: planned-session completion under storage or
process failure. Confidence: high except the ambiguous historical-data case,
which is medium.
