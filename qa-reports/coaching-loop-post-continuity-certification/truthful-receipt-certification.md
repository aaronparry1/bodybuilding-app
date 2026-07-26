# Truthful receipt certification

Production entrypoint:
`canonicalActivePlanState.applyProgressDecision` →
`applyCanonicalProgressDecision`.

Persisted state: `iron-logic.canonical-active-plan-v2` and
`iron-logic.canonical-progress-decisions-v1`.

Affected configurations: all Phase-1 automatic applications. Confidence: high.

| Case | Evidence | Result | Verdict |
| --- | --- | --- | --- |
| Real material application | calibration test records load-state/base-load deltas after carrier CAS | Exact fields and advanced revision persist | PROVEN |
| Semantic no-op | mocked equivalent Session Construction | Empty deltas, unchanged revision, neutral explanation | PROVEN |
| Metadata-only difference | changed session ID, revision, provenance, stale revision | Comparator returns unchanged | PROVEN |
| Generated-ID-only difference | regenerated `methodStructure.groupId` in repeated-stall ordinal 16 and athletic ordinal 2 | Non-empty delta, `applied`, revision advance despite identical method topology | CONTRADICTED |
| Ordering normalisation | sessions are keyed/sorted and slots sorted by index before comparison | Reordering does not create a semantic field delta | PROVEN |
| Display-unit conversion | display `settings.unit` is excluded; base load remains kg | Comparator returns unchanged and unit change cannot create progression | PROVEN |
| Rounding removes proposal | non-prescription proposal metadata differs, committed target same | Comparator returns unchanged | PROVEN |
| Bound removes proposal | bounded proposal metadata differs, committed target same | Comparator returns unchanged | PROVEN |
| Duplicate replay | deterministic decision/operation references | No second carrier revision | PROVEN |
| Concurrent application | decision identity + carrier CAS | Double application prevented; returned result is not the original applied result | PARTIALLY PROVEN |
| Returned receipt failure | repository returns failure | Carrier rolls back; retry applies once | PROVEN |
| Hard interruption before receipt | repository throws after carrier CAS | Carrier remains advanced, receipt absent, attempt repeats forever | CONTRADICTED |

## Receipt invariants

The v2 validator rejects:

- `applied` with an empty delta;
- `applied` without a revision advance;
- `unchanged` or `blocked` with deltas;
- status/result mismatches.

Verdict: **PROVEN** as a structural schema invariant.

It cannot reject semantically generated fields presented as material. Verdict:
**CONTRADICTED** as a complete coaching-truth invariant.

Exact before/after load fields match committed state. Atomic session additions
also match committed state, but describe construction of a new future session,
not progression of an existing prescription.

## Explanation integrity

No-op explanations do not claim progression. The two generated-ID-only
applications retain the evaluator's calibration explanation even though no
training demand changed. Therefore “explanation exactly matches what changed”
is **CONTRADICTED** for 2/648 opportunities.

## Persistence ordering

The receipt is never written before the carrier. Verdict: **PROVEN**.

The carrier can survive without a receipt after process interruption. Verdict:
**CONTRADICTED** for full atomic durability.
