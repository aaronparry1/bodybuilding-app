# Recommended set guidance application orchestration

Recommended set-count guidance changes need a stateful application boundary above programme construction. The pure E2B normalizer, E2C scope classifier, and E2D lifecycle guard accept supplied facts; they must never discover those facts from repositories.

The current legacy path does not have those facts. `approveVolumeAdjustment` appends an applied, block-compatible record to the active plan, while `buildPlannedWorkoutProgramme` later invokes `applyVolumeAdjustmentsToProgramme`. That low-level transformer has no authoritative target identity or planned-workout-reference query and must not infer future scope from the presence of `recommendedMinSets` and `recommendedMaxSets`.

The next implementation boundary is a dedicated `CurrentVolumeGuidanceApplicationService`. It will resolve the active-plan programme-guidance target, query planned-workout references using plan/programme/mesocycle/microcycle/session identity, pass facts to E2C and E2D, apply E2B only after an explicit timing policy, persist the guidance change, and only then persist the applied lifecycle. It must be idempotent and return explicit blocked, stale, timing-required, compatibility-required, and persistence-failed outcomes.

No range branch is routed in this phase. Open and completed workouts retain their stored exact-target and historical authority; no workout is rebuilt. The authoritative caller map, missing record fields, product decisions, and routing gates are recorded in the [orchestration audit](/Users/aaronparry/Documents/Bodybuilding%20App/qa-reports/legacy-migration-change-control/phase-11b2c3a1e2e0-range-application-orchestration-audit.md).
