# P0 repair verification

## RB-P0-01 — truthful material application

**Verdict: CONTRADICTED**

- Production entrypoint:
  `canonicalActivePlanState.applyProgressDecision` →
  `applyCanonicalProgressDecision` →
  `applyPhaseOneDecision`.
- Persisted state: active-plan carrier CAS followed by
  `canonical_coaching_application_receipt_v2`.
- Representative proof:
  `does not claim an applied coaching change when reconstruction is materially
  equivalent`, `ignores generated metadata but detects exact prescription
  changes`, and the fresh repeated-stall/athletic longitudinal records.
- Affected configurations: regenerated future sessions containing grouped
  method structures; any interruption between carrier CAS and receipt write.
- Confidence: high.

The validator prevents an empty-delta `applied` receipt. It does not prove that
each non-empty delta is semantically material. `methodStructure.groupId`
contains regenerated session IDs and timestamps, and the comparator does not
exclude it. Two applications advance the revision solely because those
generated strings changed.

The application writes the carrier before the receipt. A returned receipt
failure triggers a CAS rollback. An exception/process interruption skips that
rollback. Retry sees `carrier.progress.decisionReference`, returns
`decision_already_applied`, and does not reconstruct the missing receipt or
terminalise the attempt.

## RB-P0-02 — safe boundary continuity

**Verdict: PARTIALLY PROVEN**

- Production entrypoint:
  `orchestrateCanonicalPostWorkoutAdaptation` →
  `evaluateCanonicalPostWorkoutProgress` →
  `resolveCanonicalCycleBoundary` →
  `applyPhaseOneDecision`.
- Persisted state: cycle lineage, Mesocycle identity, new immutable planned
  sessions, application receipt, and carrier revision.
- Representative proof:
  `selects only the existing ordered approved successor at the canonical
  horizon`, `constructs an approved successor atomically while retaining
  limited equipment and limitations`, the two fresh 12-week runs, and
  `exposes the unresolved final-session review boundary hidden by the
  continuity harness`.
- Affected configurations: ordinary successful/partial boundaries are proven;
  final-session recovery, pain, or other review outcomes are not continuous.
- Confidence: high.

The fresh runs cross real Microcycle and Mesocycle boundaries; they do not
bypass the resolver. They use favourable contexts, however. Continuity mode
explicitly removes recovery, pain, returning-capacity, and changed
sport-workload facts. When constrained recovery is supplied on the final
session of a three-session Microcycle, evaluation persists a blocked decision
before `advance_microcycle`; the exhausted carrier has no next session.

No successor is invented. Existing `defaultWeeks`, `maximumWeeks`, and ordered
`approvedSuccessors` remain authoritative. Unavailable-successor resolution is
typed, but maximum-horizon construction failure is not exercised in the
12-scenario production-path matrix.

## RB-P0-03 — completion evidence reconciliation

**Verdict: PARTIALLY PROVEN**

- Production entrypoint:
  `completeCanonicalSession` and
  `ProductionProtectedLayout` →
  `resumePendingCanonicalCoachingWork`.
- Persisted state: immutable completed ledger, deterministic performance and
  completion evidence, coaching work item, decision, carrier, and receipt.
- Representative proof:
  `reconciles missing completion evidence from the durable ledger after
  restart exactly once`, `recovers a transient first coaching-work-item write
  from the durable completed ledger`, the decision/CAS/receipt fault tests,
  and the hard receipt-interruption certification test.
- Affected configurations: valid canonical identity with returned storage
  failures is proven; hard interruption after CAS and ambiguous duplicate
  identity are not.
- Confidence: high.

The original missing-completion-evidence defect is repaired. Effective repair
events replace stale performed-work evidence before evaluation. Missing slot
identity creates factual review evidence and a blocked decision.

The complete transaction is not crash-atomic across carrier and receipt
stores. Startup enumerates pending attempts, but the early
`decisionReference` branch neither reconstructs a receipt nor terminalises the
attempt. Duplicate slot/exercise matches use `find`, so ambiguity is not
explicitly rejected at reconciliation.

## Original findings

| Finding | Fresh verdict | Result |
| --- | --- | --- |
| F01 — mounted loop is open | PARTIALLY PROVEN repaired | One automatic authority exists and ordinary completion closes, but final-session review and receipt-crash paths do not converge. |
| F02 — slot-keyed load authority | PROVEN repaired for valid canonical snapshots | Exercise identity owns calibration; slot remains provenance. Historical ambiguity is still fail-closed only where detected. |
| F03 — factual evidence cannot drive transition/deload | PARTIALLY PROVEN repaired | Caller flags have no authority and approved boundary transitions run; recovery/deload evidence collection and automatic deload remain unavailable. |
