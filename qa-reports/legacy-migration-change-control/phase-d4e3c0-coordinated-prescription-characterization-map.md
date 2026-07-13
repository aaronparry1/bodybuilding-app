# D4E3C0 coordinated prescription characterization map

## Caller graph

`generateWorkoutByFocus` owns session/template iteration and calls `selectExercisesFromTemplate`, which calls `createGeneratedSlot`. `createGeneratedSlot` resolves settings, rep range, lane/set prescription and starting load, then assembles `ProgramExercise`. `planned-workout.ts` and extra-session generation consume the public programme result. Direct tests call rep-range, lane, set-prescription and load-selection APIs independently. No current D4D2 caller enters this path.

| Caller/symbol | Inputs and block use | Output/impact | Classification |
|---|---|---|---|
| `generateWorkoutByFocus` | template, exercise library, options/current block | ordered generated workout | compatibility façade |
| `selectExercisesFromTemplate` | slot, candidates, options | selected exercise per slot | compatibility internal |
| `createGeneratedSlot` | exercise, slot, planned order, options/current block | reps, sets, load, `ProgramExercise` | compatibility internal seam |
| `getGeneratedRepRange` / rep strategy helpers | block type, role/class, exercise facts | rep domain/final-set policy | compatibility API/test surface |
| `resolveTrainingLane` / lane constraints | block type, role/class | lane and downstream constraints | compatibility API/test surface |
| `resolveEvidenceBasedSlotPrescription` / `withSetPrescription` | guidance, history, lane/block facts | set envelope and exact count | compatibility internal/API |
| `resolveStartingLoadRecommendation` | block type, exercise, history, increment | load, rounding, reason | compatibility API |
| drop-off and suitability checks | block/lane, history, exercise facts | threshold or supported/unsupported | compatibility internal |
| planned-workout and extra-session consumers | generated programme | persisted/displayed workout | downstream compatibility |

No caller is current-policy runtime; D4D2 remains separate.

## Branch key

The complete compatibility key is `{BlockType, exercise role/class, exercise family/movement, history state, loading capability/increment, guidance envelope, slot/session context}`. Block type alone is insufficient: lane, rep, set and load branches also inspect role, family, exercise facts and evidence.

## Characterization matrix

The following semantic branch families are the complete active matrix to fixture before extraction. Each row is explicit; concrete numeric values remain locked by the existing characterization tests and are not recomputed by this phase.

| Branch ID | Block branch | Role/class | History/loading | Rep | Lane | Set | Load | Drop-off/suitability | Expected result |
|---|---|---|---|---|---|---|---|---|---|
| `hypertrophy-primary-compound-fresh` | hypertrophy | primary compound | none; percentage-capable increment | productive compound range; final-set policy | primary/heavy lane | guidance-bounded compound envelope | evidence or percentage fallback with increment rounding | normal threshold; supported | generated slot |
| `hypertrophy-primary-compound-established` | hypertrophy | primary compound | established history | same branch with evidence adjustment | primary/heavy lane | evidence-aware envelope | history-derived recommendation | normal threshold; supported | generated slot |
| `hypertrophy-accessory-fresh` | hypertrophy | secondary/accessory | none; small increment | accessory/high-rep range | accessory lane | conservative accessory envelope | conservative fallback and rounding | normal threshold; supported | generated slot |
| `hypertrophy-accessory-established` | hypertrophy | secondary/accessory | established history | evidence-aware accessory range | accessory lane | evidence-aware accessory envelope | history-derived recommendation | normal threshold; supported | generated slot |
| `strength-primary` | strength | primary compound | any supported history/loading | strength branch | strength lane | strength envelope | strength loading hierarchy | strict branch; suitability checked | generated slot or explicit unsupported |
| `power-primary` | power | primary compound | any supported history/loading | power branch | power lane | power envelope | power loading hierarchy | strict shutdown; suitability checked | generated slot or explicit unsupported |
| `deload-any-role` | deload | role/class dependent | any | deload rep branch | recovery lane | reduced envelope | deload reduction/rounding | recovery suitability | generated slot or explicit unsupported |

Invalid combinations (unsupported class, role, loading method, contradictory guidance, or insufficient history for a required evidence branch) are explicit failures, never defaults. Exact expected values and reason codes are locked in the existing branch fixtures.

## Aggregate design

Proposed `CompatibilityPrescriptionSemantics` is a versioned immutable aggregate containing branch ID, resolved rep policy, lane and parameters, set-construction policy, starting-load policy, drop-off/shutdown metadata, suitability outcome, supported class, and reason codes. The outer compatibility resolver alone consumes `TrainingBlock`/`BlockType`; arithmetic receives only the aggregate plus exercise/history/guidance facts.

Outcomes: `resolved`, `unsupported_block_branch`, `unsupported_exercise_class`, `unsupported_slot_role`, `invalid_set_guidance`, `unsupported_loading_method`, `insufficient_history`, `contradictory_branch`, `invalid_input`, `unsupported_registry_version`.

## Coupling graph

Block branch → lane → rep and set constraints; exercise role/family → rep and lane adjustments; history/loading → starting load; lane/block → drop-off and suitability; guidance → evidence set prescription. Resolution must be atomic because partial defaults can change arithmetic.

Dependency direction: block projection selects the branch; role/family and lane jointly constrain rep policy; rep/lane/guidance/history feed set construction; rep, exercise class, history and loading feed starting load; lane/block and history feed drop-off; suitability validates the combined result. No downstream helper may silently reselect an upstream semantic.

## Comparison with D4E2B

The future current bundle shares semantic domains for rep strategy, lane, set envelope, load evidence, drop-off, shutdown and suitability, but values/precedence may differ. Compatibility requires exact legacy values; current calibration requires D4E2B values. A translation layer is required until every field has equivalent meaning.

## API classification and gates

Rep-range, lane, set-prescription and load-selection exports are compatibility façades or direct test APIs. They remain unchanged until aggregate characterization is complete. No-go conditions are missing active branch fixtures, unrepresentable output, recalculated semantics, bypassing exported callers, formula mismatch, or mutable branch inputs omitted from the aggregate.

## Future contracts

`CompatibilityPrescriptionSemantics` is readonly/versioned and contains `policyId`, `policyVersion`, `branchId`, rep semantics, lane semantics, set-construction semantics, starting-load semantics, drop-off/shutdown semantics, suitability, supported classifications, and reason codes. It retains no `TrainingBlock`, `BlockType`, block identity, workout, repository, or persistence callback. Resolution outcomes are `resolved`, `unsupported_block_branch`, `unsupported_exercise_class`, `unsupported_slot_role`, `invalid_set_guidance`, `unsupported_loading_method`, `insufficient_history`, `contradictory_branch`, `invalid_input`, and `unsupported_registry_version`.

The future arithmetic request carries the aggregate plus selected exercise facts, history/evidence, guidance, units/increments, and source metadata. Compatibility and D4E2B current policy share domains but may have different values, precedence, effort/failure semantics, or evidence requirements; a translation layer is required until field equivalence is proven.

## Phased extraction

D4E3C2: aggregate contracts/registry; C3: compatibility resolver; C4: rep/lane migration; C5: drop-off/suitability; C6: set construction; C7: starting load; C8: one-slot seam; C9: generated-workout equivalence certification. Each phase retains prior façades and rolls back independently.

## Completion and no-go gates

Characterization is complete only when every active branch, exported caller, and output fixture is classified. Aggregate design is complete when the contract represents every load-bearing output. Production extraction is complete only when one compatibility boundary owns block projection, all downstream helpers are block-free, and generated-slot/workout output is exact. Current runtime readiness is a separate gate requiring D4E2B arithmetic equivalence.

Stop future implementation if a branch lacks a fixture, an output cannot be represented, a helper recalculates another decision, an exported caller bypasses the resolver, compatibility/current formulas differ without an explicit adapter, or mutable branch state is omitted. Roll back only the phase that introduced the unresolved dependency; do not add fallback.
