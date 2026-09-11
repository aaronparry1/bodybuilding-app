# D4E3C1 rep/lane semantic extraction map

## Audit outcome

Rep and lane helpers are not isolated seams yet. They are direct compatibility APIs with `BlockType` inputs and are consumed by prescription helpers that also use the same block-derived context.

| Family | Current symbols | Block dependency | Consumers | Extraction risk |
|---|---|---|---|---|
| rep policy | `resolveRepRange`, `resolveBlockRoleRepRange` | direct block normalization and branch tables | generated settings, rep tests, slot prescription | caller/result drift |
| training lane | `resolveTrainingLane`, `getLanePrescriptionConstraints` | block normalization selects lane and caps | settings, set prescription, load/rep branches | downstream cap drift |
| compatibility façade | generated-workout options | passes `TrainingBlock` through several helpers | all generated callers | coordinated migration required |

## Precise blocker

Removing `BlockType` from these helpers requires migrating their public callers and preserving the exact branch values consumed by set construction, load calculation and drop-off. A thin wrapper would leave hidden block reads; a broad migration would exceed C1 scope and risks output drift. No current D4E2B lanes may be substituted.

No production code was changed. D4E3C1 remains blocked until a branch-characterization fixture and coordinated semantic adapter can be introduced safely.

## Remaining dependencies

Set construction, starting load, drop-off/shutdown and suitability remain unchanged and continue to consume block context. D4E3C2 must address those dependencies after the rep/lane projection boundary is approved.

## Baseline

Pre-edit baseline: 15 failing files, 43 failing tests, 1,667 passing tests; typecheck, Expo public config and web export passed.
