# Truthful material delta and receipt contract

## Authority

The mounted application authority remains
`canonicalActivePlanState.applyProgressDecision` →
`applyCanonicalProgressDecision` →
`applyPhaseOneDecision`.
No projection, fixture, or UI component is allowed to classify an application.

`compareCanonicalMaterialPrescriptions` compares the current future sessions
with the proposed future sessions before the carrier CAS. A v2 receipt records
`applied` only when this comparison produces at least one delta and the plan
revision advances.

## Material prescription

The v1 material projection contains:

- semantic session position, role, kind, and purpose;
- ordered slot position, canonical exercise identity, and lane;
- method and method structure;
- exact targets and target repetitions;
- prescribed set settings;
- canonical load state and prescribed base load;
- loading mode;
- rest;
- progression and stop rules;
- substitution constraints.

Generated carrier IDs, timestamps, revisions, provenance, reasons, display
names, and display-unit metadata are excluded. Reordering object keys,
recreating an equivalent object, or converting display units is not a coaching
change.

## Receipt truth table

| Committed result | Receipt status | Revision | Delta |
| --- | --- | --- | --- |
| Material future prescription changed | `applied` / `future_prescription_change` | advances once | exact before/after entries required |
| Proposed output is semantically identical | `unchanged` / `explicit_no_change` | unchanged | empty |
| Evaluation is blocked | `blocked` / `blocked_no_change` | unchanged | empty |

The v2 validator rejects every contradictory combination. The read model uses
the receipt's actual result, reason, and explanation rather than repeating the
evaluator's requested intention.

## No-op handling

A semantic no-op is persisted with reason
`material_prescription_delta_absent` and explanation:

> The reviewed future prescription was already materially equivalent, so no
> plan revision was written.

Duplicate and concurrent replays return the same unchanged receipt and cannot
advance the carrier revision.

## Proof

- Production: `src/domain/training/canonical-material-prescription-delta.ts`
- Production: `src/application/training/canonical-progress-decision-application.ts`
- Validation: `src/domain/training/canonical-progress-decision.ts`
- Projection: `src/application/training/canonical-active-plan-application.ts`
- Tests: `tests/canonical-coaching-loop-p0.test.ts`
