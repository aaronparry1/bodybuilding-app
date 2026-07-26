# Coaching identity contract

Version: `canonical_coaching_identity_v1`

The contract links:

- plan and revision;
- Macrocycle, Mesocycle, and Microcycle;
- planned and recorded session;
- immutable prescription hash;
- athlete;
- optional exercise, slot, and evidence.

Validation occurs between the recorded session and every persisted evidence item before evaluation.

## Load identity

- `exerciseId` owns established load continuity.
- `slotId` records where the observation occurred.
- `sourceSessionId`, `sourceSlotId`, evidence version, athlete, base unit, load, reps, freshness, and calibration status remain provenance.
- only complete positive-kg observations with a compatible loading mode and no substitution can establish load evidence;
- pounds are display input and are not treated as canonical base-unit evidence;
- substituted observations do not transfer load to another exercise;
- conflicting latest observations remove the inferred load and fail back to calibration.

New plans persist `canonical_construction_context_v1`. Old plans without it are interpreted conservatively from valid snapshots and evidence. Unknown preferences, unavailable catalogue identities, or unavailable equipment block reconstruction rather than creating defaults.
