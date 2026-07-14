# Session Construction canonical switch — blocker map

## Current state

HEAD `abc2648bcd38bc6cbb5fcd49160961d59bded77b` contains the canonical
`SessionConstructionContext`, exhaustive mesocycle policy matrices, and the
canonical active-plan carrier. The production session-construction engine is
still `generateWorkoutByFocus`/`buildPlannedWorkoutProgramme` and is still
block-shaped.

## Exact missing canonical inputs

The current `SessionConstructionContext` is sufficient to identify a
mesocycle policy and a microcycle role, but it is not sufficient to execute
session construction without consulting legacy inputs or inventing defaults:

1. **Per-session slot plan** — no ordered slot definitions (role, muscle
   targets, movement-pattern constraints, exercise-class constraints, set
   intent, or slot label/reason) are present in the context.
2. **Exercise-selection evidence** — no canonical selected exercise IDs,
   candidate constraints, or deterministic selection seed are present. The
   existing engine derives these from workout focus, block/week and plan
   rotation fields.
3. **Per-slot method/loading choice** — the context has policy-level method
   permissions but no selected method, loading mode, or slot-level method
   parameters for the current session.
4. **Per-slot progress evidence** — `progress` has aggregate history and
   optional established loads, but no slot/exercise keyed calibration state,
   readiness decision, or evidence status required by the target-envelope and
   set-prescription resolvers.
5. **Session construction identity/provenance** — `operational` identifies the
   construction request, but does not carry a deterministic planned-session
   identity/plan index linkage for every generated slot.
6. **Canonical drop-off inputs** — policy defaults exist, but there is no
   explicit planned-slot drop-off rule or resolved session-level rule in the
   context. The current engine still reads `TrainingBlock.dropOffRule`.

## Why this is a genuine blocker

Removing `TrainingBlock`, `blockType`, and `currentBlock` from the existing
engine before supplying these fields would require one of the prohibited
behaviours: selecting exercises from an underspecified template, deriving
methods/targets from final lane values, or manufacturing progress and
drop-off defaults. Those would change production authority and cannot be
classified as a mechanical migration.

The blocker is upstream of the requested switch; it is not a stale snapshot,
test expectation, or compatibility-only failure.

## Required next phase

Define and validate a canonical `SessionConstructionPlan`/slot-input carrier
owned by Microcycle + Progress. It must provide ordered slot facts, deterministic
exercise-selection constraints/seed, selected method/loading mode, keyed
calibration evidence, resolved drop-off rule, and planned-session identity.
Only after that carrier has completeness tests can the construction engine be
changed to accept `SessionConstructionContext` exclusively.

No production construction code was changed in this phase.
