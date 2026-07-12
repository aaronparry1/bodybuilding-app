# Current Progress and volume consumers

Stage 2C introduces read-only current context resolvers for Progress and volume. They read the current plan identity, non-superseded readiness snapshot, and current persisted decision. They return explicit no-current, compatibility, invalid, in-progress, blocked, disrupted, insufficient, review-required, or ready states.

The resolvers never create snapshots or decisions, evaluate readiness, apply a decision, select a successor, or mutate the plan. A conflicting legacy active-block ID is ignored by the current context boundary.

Historical Progress authority remains stored exact planned targets and immutable workout summaries. Existing dashboard formula inputs have not been altered in this seam; their formula-preserving replacement is the remaining Stage 2C work.

## Deferred adapters

Stage 2C2A0 exposes the context on the dashboard contract only. Strategic, recovery, rotation, and volume adapters remain separate migration gates. Stage 2C3 will replace only the legacy planning authority passed into volume adapters, without changing formulas.

## Presentation extraction status

Progress copy helpers, primary evidence, journey actions, and action flow now each consume a narrow legacy compatibility input rather than a complete presenter result. These are structural seams only: their legacy strategic, recovery, rotation, and volume meanings remain unchanged until the separately approved semantic phases. The next seam replacement is recovery.
