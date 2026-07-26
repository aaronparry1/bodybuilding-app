# Completion reconciliation certification

## Durable chain

Production entrypoints:

- `completeCanonicalSession`;
- duplicate completion through the same command;
- `ProductionProtectedLayout` →
  `resumePendingCanonicalCoachingWork`.

Persisted state:

- canonical recorded-session ledger;
- deterministic performance/completion/review evidence;
- `canonical_coaching_attempt_v1`;
- canonical decision and application receipt;
- canonical active-plan carrier.

Representative tests:

- `reconciles missing completion evidence from the durable ledger after
  restart exactly once`;
- `reconstructs the latest repaired completed-set facts before a pending
  adaptation retry`;
- `fails closed when durable performed work cannot be matched to the immutable
  prescription`;
- `recovers a transient first coaching-work-item write from the durable
  completed ledger`;
- decision, CAS, and receipt fault tests.

Affected configurations: canonical completed planned sessions with valid
immutable snapshots; confidence: high.

## What is reproducible

- Target completion comes from immutable exact targets plus effective ledger
  performance/repair events.
- Completed sets, reps, loads, partial work, and rep drop-off are deterministic.
- Evidence IDs, operation ID, evaluation ID, and decision ID are deterministic.
- Missing performance/completion evidence is recreated from ledger facts.
- Conflicting observations are replaced only when the durable ledger provides
  the factual correction.
- Readiness, recovery, pain, capacity, equipment, missed-session, and sport
  workload facts are never invented.
- A missing slot/exercise match creates review evidence and a blocked decision.
- Edits while active replace evidence; edits after completion are rejected.

Verdict: **PROVEN** for valid unambiguous canonical identity.

## Remaining discontinuities

### Attempt persistence is not acknowledged

`completeCanonicalSession` does not inspect the first work-item save result.
The immediate reconciliation normally writes the attempt again, so a transient
first failure recovers in the same command. A persistent attempt-store failure
cannot be rediscovered by startup because startup enumerates attempts rather
than all completed ledger records.

Verdict: **PARTIALLY PROVEN**. Production entrypoint:
`completeCanonicalSession`; persisted state: ledger without guaranteed attempt;
representative test: transient first-write fault; affected configurations:
attempt-store interruption; confidence: high.

### Ambiguous slot identity

Reconciliation uses `slots.find(...)`. Missing identity is rejected, but two
matching historical slots are not cardinality-checked. Current Session
Construction does not generate such snapshots; malformed/older data requires
carrier validation evidence before it can be certified.

Verdict: **NOT PROVEN**. Production entrypoint:
`reconcileCanonicalCompletedSessionEvidence`; persisted state: historical
ledger snapshot; representative source: the single-match `find` call; affected
configurations: malformed or ambiguous historical snapshots; confidence:
medium.

### Receipt interruption

A hard interruption after the carrier CAS and before receipt persistence
leaves the attempt at `decision_persisted`. Restart observes the carrier's
decision reference and returns early without the receipt or terminal attempt.

Verdict: **CONTRADICTED**. Production entrypoint:
`applyPhaseOneDecision`; persisted state: advanced carrier + decision, missing
receipt; representative test: `exposes the unresolved crash window between
carrier commit and application-receipt persistence`; affected configurations:
process/storage interruption in that window; confidence: high.

## Overall verdict

Original missing-evidence reconstruction: **PROVEN repaired**.

Complete evidence → decision → application → receipt convergence across every
fault boundary: **PARTIALLY PROVEN**.
