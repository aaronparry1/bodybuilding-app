# Current planning constructor authority

## Source of truth

Active planned construction resolves `CurrentPlanningInput` from the active plan's current mesocycle, current microcycle and session role. It also records the mesocycle and microcycle number on each new planned session.

`TrainingBlock`, annual-plan and training-year data are not constructor inputs, exercise-scoring inputs, target-generation inputs, or planned-session-selection inputs.

## Compatibility

For a saved plan with neither current mesocycle nor microcycle data, `resolveCurrentPlanningInput` returns an explicitly labelled `legacy_compatibility` input derived from the plan goal, experience, training days and split. It does not read a block to select the phase. If a partial or invalid current state exists, resolution is `incomplete` and construction returns no workout.

## Session selection

Completed planned sessions are matched to the active mesocycle and microcycle number, then by `planSessionIndex`. The logger advances only the current microcycle after that match; it does not gate advancement on a block or training-year week. A record without current identity may use its stored block/week only through the historical-summary compatibility adapter; otherwise it uses the existing calendar-week branch. Older plans without a microcycle use their stored split only for session-selection compatibility; they cannot enter the current constructor until current planning data exists. Ad-hoc sessions remain excluded by `sessionKind`.

## Deferred consumers

Home, Plan, Train live-coaching helpers, Progress, Analytics, reporting, ad-hoc construction, builder paths and historical block labels remain deferred. Existing legacy `TrainingBlock` fields remain for saved-record compatibility only.
