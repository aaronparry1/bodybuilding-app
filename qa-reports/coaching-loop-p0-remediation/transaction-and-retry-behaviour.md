# Transaction and retry behaviour

Workout completion and coaching adaptation have separate durability.

1. Completion and factual evidence are committed first.
2. The carrier's recorded reference is reconciled to completed.
3. Evaluation and decision are persisted.
4. Application constructs a complete candidate future state.
5. Carrier CAS commits only that complete future state.
6. The application receipt records exact resulting identities.

If evidence persistence fails, completion remains durable and returns `completed_with_evidence_pending`.

If evaluation, decision, or application fails, completion remains durable, the last committed future prescription remains authoritative, and a `canonical_coaching_attempt_v1` pending record preserves the reason and identities.

If carrier CAS succeeds but application-receipt persistence fails, the carrier is rolled back to the prior full revision. There is no partially visible future prescription.

Retry identity is based on plan, recorded session, and completion evidence. The decision timestamp comes from completion evidence, not retry wall time. An identical retry therefore reproduces the same decision. A terminal applied/unchanged/blocked attempt returns idempotently without a second mutation.

Completed ledger snapshots are never regenerated or mutated.
