# Current Progress strategic summary

`CurrentProgressStrategicSummary` is a pure, read-only projection of the already authoritative current Progress context. It exposes the persisted decision directly, an explicit persisted advance target when present, mesocycle purpose, and optional immutable historical observations.

It returns explicit available, assessment-unavailable, review-required, no-current, compatibility, and invalid states. Historical observations are supporting only and cannot change the decision outcome.

The summary does not import the legacy strategic engine, construct a block/plan, select a successor, persist state, apply a decision, or create UI recommendations. Stage 2C2A1.2 exposes it from the dashboard contract; A1.3 still owns removal of the legacy presenter call.
