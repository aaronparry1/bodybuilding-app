# Current Progress strategic replacement design

Formula-preserving adaptation is rejected: the legacy strategic presenter defaults `BlockType`, constructs `CoachingBlock` and `CoachingPlan`, estimates block week, and emits repeat/advance/deload outcomes. Those outcomes duplicate current readiness, persisted decisions, successor selection, and application lifecycle authority.

The smallest safe replacement is a direct `CurrentProgressStrategicSummary`, not a formula. It projects current status, mesocycle purpose, microcycle priority, readiness state, decision and reason, and an explicitly persisted advance target. It may accompany immutable historical insights, but cannot create a recommendation, infer a successor, or override a decision.

Missing product semantics: any desired goal-specific strategic prioritisation beyond the current readiness/decision/history contract needs an explicit owner-approved analytical question and policy. It must be read-only and prohibited from transition authority.

Strategic, recovery, rotation, and volume are separate migration gates. Progress presentation helpers now receive typed legacy compatibility candidates rather than the full presenter, but those candidates remain legacy authority until their individual current replacements land. The legacy presenter remains temporarily for Home, QA, deload-prescription, and type-only success-model callers; no deletion is safe until all active callers are migrated.
