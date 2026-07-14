# D4E3-AUDIT-4: legacy annual authority removal blocker

Implementation is intentionally blocked. The repository has canonical owners for macrocycle, mesocycle, microcycle, session construction, and Progress, but modern consumers still share APIs with legacy annual/training-year paths.

`strategic-coaching.ts` imports annual block construction and next-block selection and feeds Home/Progress projections. `recommendation-actions.ts` contains useful modern exercise-intervention functions but also directly mutates `TrainingYear` blocks. `annual-planner.ts` remains reachable through these paths and through ad-hoc generation. There is no reliable persisted discriminator that safely separates modern active plans from legacy saved plans; `currentMesocycleId`/`currentMicrocycle` are optional and cannot be used alone without classifying incomplete saved records.

Removing the imports now would either change current behavior or require a new classifier/recommendation authority, both prohibited by the single-source rule. The next safe boundary is **D4E3-AUDIT-4A**: define one narrow read-time modern/legacy provenance adapter, test that it rejects ambiguous records and cannot override complete canonical state, then isolate legacy block mutation callers. No production authority was changed in this task.
