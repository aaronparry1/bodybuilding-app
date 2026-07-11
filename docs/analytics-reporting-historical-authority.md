# Analytics and reporting historical authority

## Current Analytics context

Analytics derives current context from `resolveCurrentPlanningInput`: goal, macrocycle engine, mesocycle purpose, microcycle number and priority, and session role. It does not read a training block or training year to describe the current plan.

## Historical facts

Historical Analytics consumes completed `WorkoutHistorySummary` records. Planned summaries retain stored exact set targets, their source classification, actual logged performance, timestamp, and current-architecture identity where available. Analytics does not reconstruct a target from a current range, template, or block.

## Compatibility grouping

`planMesocycleId` and `planMicrocycleNumber` are historical current-architecture identifiers. `planBlockId` and `planWeekNumber` remain compatibility-only grouping metadata for older records; they are never presented as current planning authority or used to qualify progression.

## Recommendations and reporting

Analytics displays existing Progress/coaching outputs but does not generate sessions, targets, exercise choices, or transitions. The Analytics screen no longer writes active-plan or training-year state. Advanced reports aggregate sessions and history; they do not accept a `TrainingBlock` input.

## Import boundary

No planning, session-construction, Train, progression, or intervention module imports Analytics, advanced-reporting, QA reports, or production-readiness output. QA and report artifacts remain consumers only.

## Deferred work

Evidence migration, interventions, programme builder, ad-hoc/custom sessions, remaining legacy TrainingBlock cleanup, and archived QA/report terminology are separate phases.
