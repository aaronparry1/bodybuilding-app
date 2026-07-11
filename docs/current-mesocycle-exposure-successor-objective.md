# Current mesocycle exposure, successor, and objective context

Phase 11A.2C2 is a pure context boundary. It consumes validated C1B readiness-snapshot history and current mesocycle definitions; it does not build snapshots, inspect workouts, write decisions, or apply transitions.

Exposure is counted from one non-superseded `ready` snapshot per current microcycle attempt. Blocked, disrupted, invalid, and insufficient snapshots remain traceable but do not count. Minimum, expected, and maximum values come only from the explicit mesocycle exposure policy (`minimumWeeks`, `defaultWeeks`, and `maximumWeeks` when adapted into that policy); calendar time and block week are not inputs.

Successors are the current mesocycle's `nextStates`, validated against engine and experience eligibility. All candidates are retained. There is no first-candidate selection, predecessor inference, or rebuilding-route fabrication. Low-stress metadata is unavailable until the architecture supplies explicit metadata.

The current library's textual success criteria are descriptive, not machine-evaluable objective policy. Accordingly C2 reports `insufficient_policy` unless an explicit machine-evaluable objective policy is supplied. Minimum/maximum exposure or improving performance alone never concludes an objective. This prevents claims of direct hypertrophy or velocity outcomes that the current evidence does not measure.

## Deferred work

C3 will assemble snapshots through the canonical readiness producer and pass persisted context to the authoritative decision writer. Stage 2 consumers will then read those records; C2 does not change consumers or legacy auto-advance behaviour.
