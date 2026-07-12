# Recommended set guidance target resolver map

The command identifies a raise/lower record, expected active plan and persisted programme-guidance target. It has no mutable plan/workout object or exact-target values. The resolver reads an adjustment record, active plan, exact guidance target and matching planned-workout references through narrow read interfaces.

Identity is plan ID + programme ID + optional mesocycle/microcycle/session identity + `recommended_set_count` domain. Timestamps, block order and first-match lookup are prohibited. Missing or multiple targets return explicit unresolved outcomes.

The resolver produces E2C target facts only from the resolved target and E2D lifecycle facts only from relevant persisted workout-reference metadata. It returns timing-required for a future target; it does not normalize, persist, or route any legacy range branch. A future E2E2 resolver adapter must bind these interfaces to repositories, followed by E2E3 idempotent application service work.
