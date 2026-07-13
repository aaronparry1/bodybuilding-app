# D4E1 current exact-target context map

## Audit result

D4E1 cannot safely extract a block-free exact-target arithmetic core in the current phase. The existing target mechanics are distributed through generated-workout helpers and directly consume `BlockType`; replacing that input with guessed semantic fields would alter or under-specify formulas.

| Block-derived dependency | Current symbol | Controls | Classification | Current source | Current status |
|---|---|---|---|---|---|
| block type | `resolveRepRange`, `resolveEvidenceBasedSlotPrescription`, `resolveTrainingLane` | reps, lanes, set construction | A semantic fact, but unresolved current owner | `TrainingBlock.type` | missing current policy |
| drop-off rule | `getSafeDropOffPercent` | drop-off threshold and shutdown inputs | A semantic fact | `TrainingBlock.dropOffRule` | missing current policy |
| lane | `resolveTrainingLane` / lane constraints | caps, maintenance/strength/recovery behavior | A semantic fact | derived from block + slot | missing current policy |
| block suitability | `matchesBlock` | candidate eligibility | compatibility orchestration | `TrainingBlock.type` | compatibility-only |
| block identity/week | selector rotation and callers | orchestration/rotation | B | block ID/week | not target arithmetic |
| annual transition metadata | callers | lifecycle | B/C | annual plan | not target arithmetic |
| exercise history | load selection | starting-load evidence | A | history context | reusable |
| selected exercise facts | load/rep helpers | exercise-specific arithmetic | A | selected exercise | reusable |

## Call-graph dependency

Generated slot construction calls `resolveGeneratedSettings`, which calls `resolveTrainingLane`, `resolveEvidenceBasedSlotPrescription`, `resolveRepRange`, `withSetPrescription`, and load-selection helpers. Drop-off and lane behavior then branch on block-derived values. There is no existing standalone exact-target entry point that accepts one selected current job.

## Precise blocker

A compatibility adapter can project a `TrainingBlock` into a context only if the narrow context retains the same block-derived semantics. Current calibration has no approved owners for rep strategy, training lane, drop-off policy, shutdown policy, or starting-load calibration policy. Removing `BlockType` now would change formulas; retaining it would violate the block-free current boundary.

Therefore no target code, formula, D4D2 wiring, persistence, or fallback was changed. D4E1 requires an approved current exact-target policy decomposition before extraction can complete.

## Required next owner

D4E2 must define and certify current calibration owners for rep strategy, lane, set construction, drop-off/shutdown and starting-load calibration. Only then can a compatibility adapter and shared arithmetic core be extracted with output-equivalence tests.

## Baseline

Pre-edit baseline: 15 failing files, 43 failing tests, 1,662 passing tests; typecheck, Expo public config and web export passed.
