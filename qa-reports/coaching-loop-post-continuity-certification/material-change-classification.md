# Classification of the 157 claimed material changes

The unit “157” is a count of application receipts, not a count of individual
fields. Those receipts contain 729 raw comparator deltas.

## Transaction-level reconciliation

| Class | Transactions | Athlete-responsive coaching | Training demand | Evidence verdict |
| --- | ---: | --- | --- | --- |
| Ordinary next-Microcycle construction | 117 | No. Completion authorises when to construct; deterministic cycle/session policy owns the content. | A real new week is added after the old week is exhausted. | PROVEN structural continuity |
| Approved-successor transition | 22 | Only boundary success/cycle position selects an existing edge; no performance-based numeric dose change. | New Mesocycle/session structure may differ. | PROVEN structural continuity |
| Failed-successor same-phase continuation | 5 | No. This is a safety fallback within an existing maximum horizon. | A new current-phase week is added. | PROVEN structural continuity |
| Observed-load calibration | 10 | Yes for the performed exercise/load fact; it establishes, not progresses, a load. | Calibration-required becomes established for a compatible future target. | PROVEN material |
| Load-state recalibration | 1 | Only partly: the current failure is mounted; the qualifying prior failure was directly injected. | Established load becomes calibration-required; no numeric decrement chosen. | PARTIALLY PROVEN material |
| Generated method-group identity only | 2 | No. | None. Same grouped slots and method; only regenerated ID/timestamp changed. | CONTRADICTED receipt |
| **Total mechanically applied** | **157** |  |  |  |
| **Truthful material total** | **155** |  |  |  |

Production authorities: Session Construction for structural/calibration output,
Mesocycle/Microcycle for cycle identity, Progress for decision/application.
Persisted state: v2 receipts and active-plan carrier. Representative evidence:
fresh two-run longitudinal JSON plus
`compareCanonicalMaterialPrescriptions`. Affected configurations: all 12
scenarios; generated-ID contradiction occurs in repeated stall ordinal 16 and
athletic ordinal 2. Confidence: high.

## Requested field classification

| Field | Raw delta/transition count | Meaning |
| --- | ---: | --- |
| Exercise identity | 0 direct mutations | Exercises are embedded inside 648 atomic new-session additions; no retained future slot changes exercise ID. |
| Sets | 0 | No retained future set count changes. |
| Repetitions | 0 | No retained future target-repetition changes. |
| Load state | 15 field deltas across 11 truthful transactions | Calibration/recalibration only. |
| Base load | 15 field deltas across 11 truthful transactions | `null → observed` or `observed → null`; zero number-to-number changes. |
| Method | 0 semantic | Six group-ID deltas preserve the same method and slot pairing. |
| Rest | 0 | No retained future rest changes. |
| Progression rule | 0 | No retained future progression-rule changes. |
| Stop rule | 0 | No retained future stop-rule changes. |
| Substitution constraints | 0 | No retained future substitution-constraint changes. |
| Session identity | 648 atomic additions in 144 transactions | Next-week/next-phase Session Construction after prior future inventory is exhausted. |
| Mesocycle identity | 22 | Existing approved-successor transitions. |
| Approved-successor transition | 22 | Existing ordered edges only. |
| Same-phase fallback | 5 | Approved successor could not construct; current phase continued within horizon. |
| Base unit/rounding/prescribed-load mirrors | 45 | Companion fields for the 15 load-state/base-load target changes. |
| Generated group identity | 6 raw deltas in 3 transactions | One transaction also has true calibration; two have no other material delta. |

The JSON artifact contains all 157 records with scenario, opportunity ordinal,
decision, category, field list, mounted-context classification, and a compact
before/after example.

## Examples

### Observed calibration

- Session: `3:Push strength and hypertrophy:planned`
- Slot: `0:ex-bench-press`
- Load state: `calibration_required → established`
- Base load: `null → 60 kg`
- Sets/reps: unchanged.

This is athlete-responsive, but it is not progression beyond a prior numeric
prescription.

### Recalibration

- Exercise: the failed comparable exercise in `repeated_stall`.
- Base load: established numeric load → `null`.
- Load state: established → calibration required.
- Reason: repeated comparable failure plus
  `numeric_regression_not_automatically_authorised`.

The second qualifying exposure is simulation-only in the harness, so the
general production comparator remains uncertified.

### Generated-ID-only false positive

The before and after `methodStructure.groupId` identify the same two slots and
same antagonist-superset grouping. Their embedded generated session timestamp
changes from `2026-08-15T09:40:00.000Z` to
`2026-08-16T09:40:00.000Z`. No demand field changes, yet the receipt is
`applied`.

Verdict: **CONTRADICTED**.

## Why 157 coexists with zero progression/regression

- 144 transactions create a next structural training opportunity.
- 10 establish a previously unknown observed load.
- 1 removes an established load and requires calibration.
- 2 are generated-ID-only churn.
- No comparator delta changes a numeric base load from one number to another.
- Every decision carries `numericLoadAdjustmentAuthorised: false`.

Therefore the mechanical count is not evidence of numeric overload,
load reduction, or a complete autoregulated progression policy.
