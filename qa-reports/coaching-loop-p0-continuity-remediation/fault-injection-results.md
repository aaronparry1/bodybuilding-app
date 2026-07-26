# Fault-injection results

All cases use isolated local repositories and deterministic operation IDs.

| Fault | Durable state after fault | Retry result | Proof |
| --- | --- | --- | --- |
| Ledger succeeds; completion-evidence write fails | completed ledger + pending attempt; prior future plan | restart reconstructs evidence and resolves once | `reconciles missing completion evidence from the durable ledger after restart exactly once` |
| Evidence succeeds; decision write fails | ledger + evidence + pending attempt; prior future plan | restart persists one decision and resolves once | `keeps evidence durable and the future unchanged when decision persistence fails, then resumes once` |
| Decision succeeds; carrier CAS fails | ledger + evidence + decision; prior future plan | retry applies once after conflict clears | `keeps durable completion and the prior future prescription when application CAS fails, then retries exactly once` |
| Carrier save succeeds; receipt write fails | carrier CAS is rolled back; decision remains unapplied | retry reapplies and records one receipt | `rolls back a future change when its application receipt fails and retries the same decision once` |
| Duplicate completion/retry | existing operation/decision/receipt | no additional revision or decision | `completing the same workout twice cannot apply the coaching decision twice` |
| Concurrent semantic no-op replay | unchanged carrier and v2 no-op receipt | both calls return the same unchanged result | `does not claim an applied coaching change when reconstruction is materially equivalent` |
| Performed-work identity cannot be reconstructed | completed ledger + factual reconciliation review; prior future plan | terminal blocked decision with `performed_work_identity_unavailable`; no repeated retry | `fails closed when durable performed work cannot be matched to the immutable prescription` |
| A completed set is repaired before completion-evidence retry | repair event and updated performance evidence remain durable | reconciliation uses the effective repaired event and reproduces its reps/load | `reconstructs the latest repaired completed-set facts before a pending adaptation retry` |
| Edit submitted after workout completion while a decision is unapplied | completed ledger and its derived evidence remain immutable | edit is rejected with `performed_work_edit_not_allowed`; the persisted decision retries against unchanged evidence | `keeps durable completion and the prior future prescription when application CAS fails, then retries exactly once` |
| Existing evidence contradicts effective repair events | stale observations are compared with deterministic ledger derivation | evidence is replaced before evaluation; identity conflict is rejected | reconciliation implementation and completed-set repair regression |

No test mutates cloud or real user data.
