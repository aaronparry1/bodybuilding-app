# D4E current-job exact-target handoff map

## Audit result

D4E cannot safely hand selected current jobs to the existing exact-target path yet. The existing target-generation mechanics are embedded in generated-workout construction and consume block-derived semantics that D4B jobs do not define.

| Target dependency | Existing source | Formula influence | Approved current equivalent | Result |
|---|---|---|---|---|
| Rep range | `resolveRepRange({ blockType, exerciseRole, ... })` | exact rep targets | no current calibration block/rep policy field | blocking |
| Training lane | `resolveTrainingLane({ blockType, ... })` | set caps and prescription constraints | no certified current lane | blocking |
| Drop-off rule | `getSafeDropOffPercent(currentBlock, ...)` | shutdown/drop-off settings | no current drop-off semantic | blocking |
| Load recommendation | `resolveStartingLoadRecommendation(... blockType ...)` | starting load/calibration | no approved current purpose-to-load policy | blocking |
| Set guidance | `withSetPrescription` / evidence slot prescription | exact set ranges | D4B guidance can be carried, but does not replace block-dependent formulas | incomplete alone |
| Exercise identity | selected D4D2 job | target subject | available | non-blocking |
| Source trace | D4D2 result | metadata only | available and arithmetic-neutral | non-blocking |

## Precise mismatch

The existing exact-target engine is not a standalone request accepting one selected exercise and D4B guidance. `createGeneratedSlot` calls block-dependent rep-range, lane, drop-off and load-selection logic. Passing a fake `TrainingBlock` would make legacy block semantics authoritative for current calibration jobs. Passing no block leaves target behavior under-specified and changes formulas.

Therefore D4E is blocked. No target handoff, target formula change, current-to-compatibility fallback, or runtime mutation was made.

## Required next seam

A future phase must extract a shared arithmetic core or define an approved current exact-target context containing rep-range, lane, drop-off and load-calibration semantics. It must prove compatibility output equivalence before current jobs are wired. D4E should resume only after that semantic contract is approved.

## Baseline

Pre-edit baseline: 15 failing files, 43 failing tests, 1,662 passing tests; typecheck, Expo public config and web export passed. High-risk target-generation originals must remain unchanged.
