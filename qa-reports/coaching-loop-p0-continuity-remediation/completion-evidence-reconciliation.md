# Completion evidence reconciliation

## Durable facts and limits

The canonical recorded-session ledger is the durable factual source after a
successful completion append. Reconciliation may derive only:

- performed-work evidence from effective performance/repair events; and
- completion evidence from the immutable prescription plus completion summary.

It cannot derive readiness, recovery, pain, limitations, equipment,
missed-session, sport workload, or any other contextual observation that was
not collected.

## Durable work item

Immediately after the ledger completion succeeds, the completion command
persists `canonical_coaching_attempt_v1` with:

- deterministic operation/retry identity;
- plan and recorded-workout identity;
- prescription hash and ledger version;
- plan revision at completion;
- evidence, decision, and application states.

Only then does it reconcile derived evidence and enter the single mounted
post-workout orchestrator.

## Restart and retry

Both duplicate completion and protected-layout startup call
`reconcileCanonicalCompletedSessionEvidence`. Startup enumerates durable pending
attempts, not arbitrary UI state. Evidence IDs are deterministic. Existing
evidence must have matching identity; observations that disagree with effective
ledger work are replaced from the ledger before evaluation.

When performed work cannot be linked safely to its immutable slot/exercise,
reconciliation persists a factual `review_request` naming
`canonical_performed_work_identity`, why it is required, and the event that can
resolve it. The evaluator then persists a terminal blocked no-change decision
and leaves future prescriptions unchanged. It never invents contextual
evidence or retries the irreconstructible state forever.

## Transaction ordering

1. append completed ledger event;
2. persist pending coaching attempt;
3. reconcile deterministic performance/completion evidence;
4. persist evaluation/decision;
5. construct proposed future carrier;
6. compare material delta;
7. carrier CAS;
8. persist truthful receipt;
9. roll carrier back if receipt persistence fails;
10. mark the attempt terminal.

## Proof

- `src/application/training/canonical-recorded-session-application.ts`
- `src/application/training/canonical-completion-evidence-reconciliation.ts`
- `src/application/training/canonical-post-workout-orchestrator.ts`
- `src/data/local/canonical-coaching-attempt-repository.ts`
- `app/(protected)/_layout.tsx`
- `src/application/shell/production-protected-layout.tsx`
- `tests/canonical-coaching-loop-p0.test.ts`
