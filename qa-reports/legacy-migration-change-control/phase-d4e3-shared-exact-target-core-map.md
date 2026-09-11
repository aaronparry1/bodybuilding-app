# D4E3 shared exact-target core map

## Audit result

D4E3 cannot be completed as an equivalence-preserving extraction in the current repository. There is no standalone public exact-target engine. Exact prescription mechanics are embedded in `ad-hoc-workout-generator.ts` inside `createGeneratedSlot` and `resolveGeneratedSettings`.

| Current symbol | Actual mechanics | Block dependency | Proposed core | Result |
|---|---|---|---|---|
| `createGeneratedSlot` | settings, load recommendation, target snapshot | passes `currentBlock` to all downstream decisions | shared arithmetic core | extraction requires request/result redesign |
| `resolveGeneratedSettings` | lanes, evidence set prescription, reps, drop-off | direct `BlockType` use | shared settings core | formula/input boundary not isolated |
| `getGeneratedRepRange` | rep policy | direct `BlockType` | rep core | current semantic adapter not wired |
| `resolveStartingLoadRecommendation` | load calibration/rounding | `blockType` in request | load core | current block-free owner not consumed |
| `resolveEvidenceBasedSlotPrescription` | set counts/caps | block/lane context | set core | compatibility precedence embedded |

The only public compatibility façade currently generates whole workout programmes. Extracting these functions now would require broad result-contract changes and could alter formulas or legacy semantics. D4E2B policy metadata is not yet consumed by the arithmetic path.

## Decision

Stop D4E3 before production edits. Do not create a second engine, fake a block, or weaken equivalence. A future extraction phase must first define an internal compatibility arithmetic seam around the existing generated-slot mechanics, prove every block branch, then expose a block-free request for D4E4.

No runtime, formula, persistence, D4D2 or compatibility changes were made.

## Baseline

Pre-edit baseline: 15 failing files, 43 failing tests, 1,667 passing tests; typecheck, Expo public config and web export passed.
