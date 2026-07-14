# Canonical Session Construction Pipeline

The internal pipeline introduced in this phase is:

`CanonicalSessionConstructionInput → SessionBlueprint → PlannedSessionSlot[] → exercise resolution → lane/method/target resolution → canonical snapshot`.

The input contains only upstream facts: Macrocycle constraints, Mesocycle policy,
Microcycle session identity/role/order, athlete and factual exercise metadata,
keyed Progress evidence, and deterministic operational identity. Slots,
exercises, lanes, methods, targets, and drop-off remain construction outputs.

The pipeline is intentionally not wired into the legacy production entry points
yet. Representative construction, deterministic identity, and fail-closed empty
catalogue behaviour are covered by
`tests/canonical-session-construction-pipeline.test.ts`.

## Readiness

The seam is structurally ready for incremental caller migration, but global
replacement is not certified. Existing callers still depend on the legacy
`TrainingBlock` generator and require separate migration work. No public
runtime authority changed in this phase.
