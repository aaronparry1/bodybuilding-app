# Volume authority and mutation-boundary audit

## Call graph

| Export | Callers | Responsibility | Stateful | Block authority |
| --- | --- | --- | --- | --- |
| `approveVolumeAdjustment` | tests, event-taper policy, former Home compatibility | eligibility + persisted plan mutation | yes | active block type/id/week |
| `ignoreVolumeAdjustment` | tests/former Home compatibility | persisted record mutation | yes | record block scope |
| `previousVolumeLadderActions` | Progress, Home, recovery-capacity delivery | read-only adjustment history | no | indirect legacy record scope |
| `applyVolumeAdjustmentsToProgramme` | planned-workout construction | programme mutation/application | yes | current block type/id |
| `canApplyVolumeAdjustment` | approval | eligibility/taper policy | no | type/id/week, event taper |

## TrainingBlock inventory

| Function | Field | Purpose | Current equivalent | Gap | Future phase |
| --- | --- | --- | --- | --- | --- |
| approval record | `id`, `currentWeek` | record identity/frequency | plan + mesocycle + microcycle attempt + evidence identity | persisted schema compatibility | C3A2 |
| eligibility | `type` deload/peak/power | adjustment suppression | active deload is available; peak/power policy is not | explicit macrocycle/event policy missing | C3A3/C3A4 |
| taper | `type` | `resolveEventTaper` input | event policy context | no approved current mapping | C3A4 |
| programme application | `type`, `id` | deload bypass and record applicability | active microcycle + current identity | current record scope missing | C3A2/C3A5 |

## Responsibility classification

The slot operations (`applyAdjustmentToSlots`, `adjustBestAccessorySlot`, `addAccessorySlot`, `removeLowestPriorityAccessory`, ordering) are pure programme mathematics/application mechanics. They need `CurrentVolumeFormulaInput` only: existing slots, exercises/equipment, applied adjustment action, muscle, and explicit active-deload state. They must not receive plan mutation, block IDs, week, successor, or decision application.

`canApplyVolumeAdjustment` is eligibility policy. Future `CurrentVolumeAdjustmentEligibility` requires readiness/decision lifecycle, active deload, evidence sufficiency, current identity, and explicit event-policy result. Watch, deload eligibility, blocked/disrupted, and pending deload remain non-mutating.

`resolveEventTaper` branches are event/taper policy. Current architecture lacks an approved macrocycle/event policy replacement for `peak`/`power`; migration must return `insufficient_policy`, not map mesocycle purpose to block type.

Records are block-scoped (`blockId`, `week`) today. Future identity: plan ID, mesocycle ID, microcycle attempt, snapshot/decision IDs where applicable, source session IDs, and policy version. Old records require read-only compatibility hydration; no rewrite is authorised.

Programme mutation is owned by a future volume-adjustment application service, not Progress or current-decision application. Required result states: `applied`, `already_applied`, `ineligible`, `identity_mismatch`, `policy_unavailable`, `persistence_failed`. It must preserve created workouts/exact targets and be idempotent.

## Progress boundary

Future `CurrentProgressVolumePresentation`: `available`, `maintain`, `increase`, `reduce`, `deload_ready`, `deload_active`, `assessment_unavailable`, `compatibility`, `invalid`. It is read-only. Pending deload remains recovery-owned; only active deload supplies reduced-stress formula context.

## Formula-equivalence matrix

| Case | Extract unchanged? | Current equivalent | Gate |
| --- | --- | --- | --- |
| normal/increase/reduce/maintain | yes | planned history + formula primitives | C3A1 |
| active deload | yes | explicit current active deload | C3A1 |
| pending deload/watch/eligible | yes: normal context | decision/evidence read-only | C3A3 |
| peak/power/taper | no approved equivalent | event policy | C3A4 unavailable until approved |
| legacy record scope | no | current identity + hydration | C3A2 |

## Migration sequence and gates

1. **C3A1** extract pure formula/application mechanics; exact numerical fixtures; `refactor: extract current volume formula inputs`.
2. **C3A2** introduce current record identity + legacy hydration; no mutation change; `refactor: define current volume adjustment identity`.
3. **C3A3** extract eligibility policy using current readiness/decision; `refactor: define current volume adjustment eligibility`.
4. **C3A4** add approved current event/taper policy or explicitly retain unavailable; `docs: define current volume event policy`.
5. **C3A5** add idempotent mutation service; `refactor: add volume adjustment application boundary`.
6. **C3A6** migrate Progress presentation; `refactor: use current Progress volume authority`.

Deletion requires zero current `TrainingBlock` callers, compatibility hydration, formula/equivalence coverage, mutation idempotency, and full-suite verification.

## Product-policy blockers

Owner approval is required for current peak/power/taper equivalence, adjustment frequency identity, immediate versus next-microcycle application, and compatibility treatment of old block-scoped records. No decision is inferred by this audit.
