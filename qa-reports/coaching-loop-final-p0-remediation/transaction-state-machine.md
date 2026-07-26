# Transaction state machine

```text
durable completion
  -> evidence reconciled
  -> decision persisted
  -> application intent prepared
  -> carrier CAS
  -> receipt persisted
  -> attempt terminal
```

Interruption rules:

- before intent: existing pending-work reconciliation resumes;
- after intent/before CAS: exact pre-state retries;
- after CAS/before receipt: exact resulting state reconstructs the receipt;
- after receipt: replay returns the persisted result;
- concurrent/equivalent retry: CAS/receipt identity makes the second worker a
  no-op;
- ambiguous/newer state: terminal factual block, no mutation.

The carrier remains the sole future-prescription authority. The intent is
coordination evidence and cannot evaluate or construct training.
