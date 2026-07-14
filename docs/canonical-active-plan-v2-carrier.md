# Canonical active-plan v2 carrier

`canonical-active-plan-carrier.ts` is an isolated, pure migration target. It combines outputs already produced by Macrocycle, Mesocycle, Microcycle, Session Construction, Progress, and athlete-input boundaries. It does not select phases, create microcycles, resolve prescriptions, evaluate readiness, or become active through restoration.

The carrier deliberately excludes `blocks`, `activeBlockId`, `TrainingYear`, annual weeks, generic rep ranges, and independently authored successor lists. Planned-session prescription data is an output snapshot tagged with Session Construction provenance; it contains no runtime functions or services.

Validation is fail-closed for schema/version, parent linkage, deterministic session identity/index, prescription provenance, progress revision, timestamps, and injected legacy authority fields. Serialization sorts object keys recursively for deterministic round trips.

Next migration boundary: hydrate and persist this carrier at the active-plan restoration boundary, reconstructing only missing future state through canonical owners and retaining legacy source data solely in recovery storage.

## Consumer migration checklist

The next production migration should proceed in this order:

1. `src/data/local/active-training-plan-repository.ts` and `src/application/training/saved-plan-migration.ts` — restoration/hydration and active-plan pointer.
2. `src/domain/training/planned-workout.ts` and `src/domain/training/training-session-selection.ts` — planned-session snapshots and deterministic selection.
3. `src/domain/training/current-readiness-producer.ts`, `current-decision-application.ts`, and `volume-adjustments.ts` — Progress references and canonical application.
4. `src/domain/training/recovery-capacity-delivery.ts` and `recovery-workout-constructor.ts` — recovery projections.
5. Home/Plan/Train/Progress projections and view models.
6. `src/domain/training/recommendation-actions.ts`, `strategic-coaching.ts`, and `ad-hoc-workout-generator.ts`.
7. Sync, design-QA, v2-QA, and consumer fixtures.
8. Retire the legacy active-plan type, then delete executable annual architecture.

This carrier is not imported by restoration or any screen in the current phase.
