# State preservation

Verdict: **PROVEN** in deterministic persistence/restart tests.

The repaired flow was exercised against the canonical ledger and plan state, not a replacement UI store.

Preserved across minimise/resume and two repository recreations:

- recorded-session/attempt identity;
- canonical programme and planned-session identity;
- current completed performed work and edits;
- exact exercise, sets, repetitions, load semantics, methods and rest prescription;
- elapsed-workout lifecycle state;
- persisted rest timer state;
- account and plan ownership;
- immutable completed history.

Minimisation appends one versioned pause event. Resume appends one versioned resume event. Duplicate operations remain idempotent and stale versions fail closed. Early finish uses the same completion authority and produces one completed aggregate; repeated delivery does not duplicate History. Discard still uses the existing compensating transaction and does not masquerade as minimise.

No programme regeneration, second attempt, prescription rewrite, history edit, coaching evaluation or plan detachment was introduced.
