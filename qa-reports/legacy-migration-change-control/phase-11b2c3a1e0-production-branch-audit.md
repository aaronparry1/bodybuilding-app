# Volume adjustment production branch audit

## Dispatch

| Kind | Current helper | Primary family | Owner | C3A1 foundation |
| --- | --- | --- | --- | --- |
| `bias_high` / `bias_low` | `applyAdjustmentToSlots` note mapping | annotation | future programme metadata/application | none |
| `raise_range` / `lower_range` | `adjustBestAccessorySlot` + `shiftRecommendedSetRange` | prescription-range transformation | prescription normalization / future programme application | not scalar set mechanics |
| `add_exercise` | `addAccessorySlot` | exercise selection + construction | planned-session construction or volume application service | none |
| `remove_or_swap_exercise` | `removeLowestPriorityAccessory` | policy-coupled removal; no actual substitution path | current removal/substitution application | C3A1B/D only after policy supplies facts |

`applyAdjustmentToSlots` is a legacy dispatcher and should be retained temporarily. Its branches have distinct authority, exact-target, and idempotency requirements; a generic facade would be incorrect.

## Exact-target safety

`raise_range`/`lower_range` change programme `ProgressionSettings` through prescription normalization. They do not directly rewrite completed history, but future construction can consume changed programme guidance. Open planned/exact targets must be audited before routing; no current boundary exists yet. This is C3A1E2's gate.

## Addition and removal

Addition filters the exercise library by target muscle, role, fatigue cost, equipment, existing IDs, then scores candidates and constructs `volume-adjustment-${adjustment.id}-${candidate.id}`. It is selection plus identity construction, not volume arithmetic. Removal uses muscle membership, tier/role protection and a deterministic score; it removes only and does not swap. Both remain policy/application work.

## Legitimate extracted-module use

* C3A1A: approved existing-slot set quantity only.
* C3A1B: caller-approved structural ordering only.
* C3A1C: future existing-slot set increase only; never `add_exercise`.
* C3A1D: future caller-approved set reduction/removal only; never removal policy or substitution selection.

## Revised sequence

1. E1 bias annotation boundary.
2. E2 prescription-range transformation plus exact-target safety.
3. E3 route genuine existing-slot adjustments to C3A1A–D.
4. E4 addition application isolation.
5. E5 removal application isolation.
6. E6 substitution application isolation.
7. E7 shrink legacy dispatcher.
8. F certify branch equivalence.

## Product blockers

Whether bias notes remain product-visible; future-template versus already-created-workout range effect; addition/removal timing; substitution policy/intervention lifecycle; deterministic/idempotent identity; exact-target protection. No answer is invented here.
