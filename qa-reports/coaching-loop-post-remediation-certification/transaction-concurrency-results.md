# Transaction, retry, and concurrency results

| Required behavior | Evidence | Verdict |
| --- | --- | --- |
| Completion durable if evaluation/application fails | ledger completes before orchestration; CAS fault test retains completion | PROVEN |
| Evidence durable if decision persistence fails | evidence precedes decision persistence; deterministic operation retries | PROVEN by ordering, not separately fault-injected |
| Future unchanged if application fails | CAS fault test compares planned sessions | PROVEN |
| Receipt failure rolls back partial future change | application explicitly CAS-restores prior carrier; existing focused test coverage | PROVEN |
| Retry applies once | deterministic operation ID, decision ID, attempt, carrier decision reference | PROVEN |
| Concurrent duplicate cannot double-progress | ledger version CAS + carrier revision CAS + idempotency references | PROVEN in isolated adapters |
| Stale CAS cannot overwrite newer state | repository `saveAtomically(expectedRevision)` | PROVEN |
| Receipt identifies committed content | receipt records revisions and resulting session IDs | PARTIALLY PROVEN: it does not enumerate exact deltas |
| Screens avoid partial applied state | carrier is saved atomically and projections read one carrier | PROVEN |
| Completion-evidence persistence failure recovers | completed retry only invokes orchestration when completion evidence already exists | CONTRADICTED |
| Crash after carrier save before receipt reconciles | carrier decision reference prevents repeat mutation, but missing receipt is not reconstructed | PARTIALLY PROVEN |

## Finding TX-01

- Severity: P0
- Exact evidence: `completeCanonicalSession` lines 78–83 return `completed_with_evidence_pending`; the completed-session branch lines 58–63 only retries when prior completion evidence is found
- Production path: durable ledger completion → failed completion evidence write → duplicate completion
- Affected configurations: local persistence interruption between completion and evidence
- Consequence: completed workout can permanently omit evaluation/decision/application
- Confidence: high from executable control flow
- Verdict: CONTRADICTED
- Remediation direction: deterministic ledger-to-evidence reconciliation must recreate the missing completion evidence before retrying orchestration
- Production code change required: yes

## Finding TX-02

- Severity: P2
- Exact evidence: application receipt contains revision/session IDs but no exact before/after target list
- Production path: `phaseOneReceipt`
- Affected configurations: all applied Phase 1 decisions
- Consequence: an applied no-op cannot be distinguished from a meaningful change using the receipt alone
- Confidence: high
- Verdict: PARTIALLY PROVEN
- Remediation direction: atomically persist canonical target deltas or an explicit unchanged disposition
- Production code change required: yes
