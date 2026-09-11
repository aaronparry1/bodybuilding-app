# D4E3B block-free compatibility prescription map

## Audit outcome

D4E3B cannot be completed safely without a broader semantic extraction. The one-slot seam itself is narrow, but the mechanics it calls still read block semantics through multiple imported helpers.

| Dependency | Current helper | Hidden block use | Projection risk |
|---|---|---|---|
| rep domain | `resolveRepRange` | `BlockType` branch and role/family adjustments | changing signature risks rep drift |
| lane | `resolveTrainingLane`, lane constraints | normalized block selects lane | semantic lane projection not consumed |
| set construction | `resolveEvidenceBasedSlotPrescription`, `withSetPrescription` | block/lane precedence and caps | precedence drift |
| starting load | `resolveStartingLoadRecommendation` | block-specific target/load branches | load and rounding drift |
| drop-off | `getSafeDropOffPercent` | `TrainingBlock.dropOffRule` | threshold drift |
| suitability | `matchesBlock` | block compatibility list | current semantic replacement not wired |

## Required change

The sole compatibility adapter would need to resolve every value above, and each downstream helper would need a block-free semantic contract. Leaving any helper unchanged would violate the no-hidden-block-read rule; changing them without branch-by-branch equivalence risks compatibility output drift.

Therefore no production code was changed. D4E3B remains blocked until a dedicated helper-by-helper extraction plan and compatibility projection contract are approved. No current policy, D4D2 runtime, formulas, persistence or fallback behavior changed.

## Baseline

Pre-edit baseline: 15 failing files, 43 failing tests, 1,667 passing tests; typecheck, Expo public config and web export passed.
