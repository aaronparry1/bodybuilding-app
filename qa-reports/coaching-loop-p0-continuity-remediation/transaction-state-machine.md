# Coaching transaction state machine

```text
ledger started/paused
  -> ledger completed
  -> attempt pending (evidence pending)
  -> attempt pending (evidence complete, decision pending)
  -> attempt decision_persisted (application pending)
  -> attempt applied | unchanged | blocked
```

## Failure states

- Ledger completion failure: nothing downstream is created.
- Evidence failure: completion and pending attempt remain durable; future plan
  remains unchanged.
- Decision persistence failure: evidence and pending attempt remain durable;
  future plan remains unchanged.
- Application/CAS failure: decision remains durable; future plan remains
  unchanged.
- Receipt failure after carrier CAS: carrier is CAS-restored to the prior
  version; the same decision remains retryable.
- Duplicate/restart: deterministic identities converge on the existing
  evidence, decision, receipt, and terminal attempt.
- Concurrent application: carrier revision CAS and deterministic decision
  identity prevent double application.

Application status is never advanced before the future carrier and truthful
receipt are both durable.
