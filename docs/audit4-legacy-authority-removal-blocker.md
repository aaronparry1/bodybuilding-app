# D4E3-AUDIT-4: legacy annual authority removal blocker

The provenance boundary is now established, but legacy-authority removal remains incomplete. The repository has canonical owners for macrocycle, mesocycle, microcycle, session construction, and Progress, while modern consumers still share APIs with legacy annual/training-year paths.

`strategic-coaching.ts` imports annual block construction and next-block selection and feeds Home/Progress projections. `recommendation-actions.ts` contains useful modern exercise-intervention functions but also directly mutates `TrainingYear` blocks. `annual-planner.ts` remains reachable through these paths and through ad-hoc generation. There is no reliable persisted discriminator that safely separates modern active plans from legacy saved plans; `currentMesocycleId`/`currentMicrocycle` are optional and cannot be used alone without classifying incomplete saved records.

New canonical plans now carry `canonical_plan_v1`; the read-time classifier and mutation guard fail closed for ambiguous or malformed records. Removing the imports now would still change current behavior or require a new classifier/recommendation authority, both prohibited by the single-source rule. The remaining boundary is to apply this guard at legacy mutation entry points and contain legacy callers. No prescription, selector, or production authority behavior changed.
