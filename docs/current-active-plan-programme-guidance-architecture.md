# Current active-plan programme-guidance architecture

## Current chain

`buildPlannedWorkoutProgramme` selects a role and calls `generateWorkoutByFocus`. The ad-hoc generator, presets, slot prescription matrix and `withSetPrescription` create `recommendedMinSets`/`recommendedMaxSets` on generated exercise settings. Exercise selection/replacements then shape the generated slots; exact targets are persisted only when a planned workout is constructed.

Those settings are temporary constructor output: they are not active-plan programme state, do not have persistent stable identity, and may change when construction, selection, substitution or order changes. They cannot own a current guidance adjustment.

## Recommended architecture

Adopt **Option C: a mesocycle programme specification plus an explicit microcycle programme-version reference**.

Each mesocycle owns a versioned future programme specification. It contains stable session-template IDs and stable prescription-slot IDs. A prescription slot owns one future recommended min/max set pair and is slot/muscle-pattern guidance, not selected-exercise identity. Construction selects exercises under existing eligibility/intervention policy and projects the persisted prescription into generated settings, retaining programme/template/prescription source IDs for traceability.

Each microcycle references one exact programme ID/version. Continue first establishes the next microcycle identity; pending eligible guidance application then creates a new programme version and binds that next microcycle before any workout is constructed. Deload retains its existing programme reference/explicit deload construction and cannot consume pending productive guidance. Advance creates a successor mesocycle with new programme/template/prescription IDs; old adjustments become stale.

## Required contracts

- Programme specification: ID, version, mesocycle ID, ordered session templates, policy version.
- Session template: stable ID, programme ID/version, role/semantic purpose, ordered prescription slots.
- Prescription slot: stable ID, session template ID, muscle/pattern/slot role, recommended min/max sets, target version, selection constraints and policy version.
- Constructed workout trace: plan, mesocycle, microcycle, programme ID/version, session-template ID and source prescription-slot IDs. Stored exact targets remain authoritative and never point live at mutable guidance.

## Compatibility and migration

Existing plans remain compatibility-only. No generated settings may be promoted to current identities. The migration is: contracts → new-plan specification constructor → repository/hydration → construction projection accessor → microcycle version reference → workout trace → concrete service adapter → service binding → routing. Legacy writable fields are compatibility projections until all readers/writers migrate.

## Owner decisions

Aaron must approve the hybrid mesocycle/version model, slot/muscle-pattern granularity, template exercise-selection representation, deload programme treatment, historical version retention, and the continue/guidance orchestration order. No E2E3E implementation is safe before these are approved.
