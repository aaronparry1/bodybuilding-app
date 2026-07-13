# D4E3C2 aggregate compatibility contract map

## Contract inventory

| Contract | Meaning | Validation | Future owner |
|---|---|---|---|
| schema/registry identity | stable versioned semantic namespace | exact supported versions | D4E3C3 resolver |
| branch key | normalized characterization lookup dimensions | all dimensions present; exact match only | compatibility projection boundary |
| rep semantics | rep domain, exact selection and final-set behavior | integer bounds and class consistency | arithmetic core |
| lane semantics | lane identity and downstream relationships | class/role consistency | arithmetic core |
| set semantics | envelope, precedence and history influence | valid min/max and explicit invalid policy | set arithmetic |
| load semantics | evidence hierarchy, method, rounding and fallback | method/capability consistency | load arithmetic |
| drop-off/shutdown | threshold, observations and termination scope | enabled threshold and trigger completeness | fatigue arithmetic |
| suitability | structured supported/blocked outcome | suitable cannot be blocking | pre-arithmetic gate |
| fingerprint | semantic identity of resolved values | deterministic canonical serialization | characterization/audit |

The aggregate is immutable, contains no `TrainingBlock` or `BlockType`, and stores no callbacks, workout, repository, plan, target, or persistence state. A compatibility block discriminator exists only in the registry key for lookup and is not arithmetic authority.

## Registry coverage

The registry contains exactly seven documented active branch families: hypertrophy primary compound (fresh/established), hypertrophy accessory (fresh/established), strength primary, power primary, and deload. There are no wildcard/default entries. Invalid, unsupported, or contradictory inputs resolve explicitly rather than selecting a nearby branch.

## Outcomes and validation

Resolution outcomes are `resolved`, `unsupported_branch`, `unsupported_exercise_class`, `unsupported_slot_role`, `invalid_set_guidance`, `unsupported_loading_method`, `insufficient_history`, `contradictory_branch`, `invalid_input`, and `unsupported_registry_version`. Validation rejects unsupported versions, malformed rep/set bounds, invalid drop-off/shutdown metadata, suitability contradictions, and branch/class mismatches.

## Fingerprints and copying

Semantic fingerprints are independent of object identity and caller mutation. Registry lookup returns defensive nested copies; registry entries contain data only and no executable formulas or callbacks.

## Scope boundary

This phase adds contracts, registry data, validation, copying, lookup, and characterization tests only. Existing helpers and callers remain unchanged. D4E3C3 may implement the outer compatibility resolver; it must preserve existing helper output before any caller migration.
