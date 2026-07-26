# Post-CAS reconciliation contract

Before carrier CAS, Progress durably stores:

- coaching work-item, decision and application-attempt identities;
- expected revision and canonical pre-state fingerprint;
- exact intended material deltas and their fingerprint;
- affected future prescription semantic identities;
- complete expected pre-carrier and intended result carrier;
- deterministic resulting-state fingerprint;
- the truthful receipt that is valid only for that result.

Restart outcomes:

| Durable state | Action |
| --- | --- |
| Exact pre-state | Retry the same CAS safely. |
| Exact intended result | Recompute the actual delta, verify its fingerprint, persist the truthful receipt, do not apply again. |
| Receipt already present | Return the persisted result without mutation. |
| Newer or conflicting state | Persist a terminal reconciliation block; never overwrite or rebase implicitly. |
| Missing/corrupt intent after a committed decision | Persist a terminal reconciliation block. |
| Semantic no-op | Persist unchanged; no application intent or revision. |

Receipt reconstruction compares the stored pre-carrier with the actual
committed carrier. It does not trust evaluator prose as proof of what changed.
The valid completed workout is never rolled back.

Representative tests inject termination immediately before CAS, immediately
after CAS, a returned receipt-write failure, missing intent, newer-state
conflict, restart and duplicate restart workers.
