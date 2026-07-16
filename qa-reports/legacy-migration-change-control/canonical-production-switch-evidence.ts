export const CANONICAL_PRODUCTION_SWITCH_EVIDENCE_VERSION = "canonical_production_switch_evidence_v1" as const;

export type ProductionSwitchPredicate = {
  readonly id: string;
  readonly passed: boolean;
  readonly caseIds: readonly string[];
  readonly reason?: string;
};

export type CanonicalProductionSwitchEvidence = {
  readonly schemaVersion: typeof CANONICAL_PRODUCTION_SWITCH_EVIDENCE_VERSION;
  readonly sourceCommit: string;
  readonly predicates: readonly ProductionSwitchPredicate[];
  readonly firstFalsePredicate: string | null;
  readonly pipelineReadyForSwitch: boolean;
  readonly productionSwitchCompleted: boolean;
  readonly classification: string;
};

export function buildCanonicalProductionSwitchEvidence(sourceCommit: string): CanonicalProductionSwitchEvidence {
  const predicates: ProductionSwitchPredicate[] = [
    { id: "canonical_plan_creation_active", passed: true, caseIds: ["onboarding:canonical-plan-create"] },
    { id: "canonical_active_plan_persistence_active", passed: true, caseIds: ["active-plan:canonical-roundtrip"] },
    { id: "startup_hydrates_canonical_active_plan", passed: true, caseIds: ["startup:canonical-hydration"] },
    { id: "cloud_roundtrip_carries_canonical_state", passed: true, caseIds: ["cloud:canonical-plan-ledger-evidence-roundtrip"] },
    { id: "home_reads_canonical_state", passed: true, caseIds: ["home:canonical-state"] },
    { id: "plan_reads_canonical_state", passed: true, caseIds: ["plan:canonical-state"] },
    { id: "train_uses_canonical_session_owners", passed: true, caseIds: ["train:canonical-lifecycle"] },
    { id: "progress_uses_canonical_decision_owners", passed: true, caseIds: ["progress:canonical-decision"] },
    { id: "settings_uses_canonical_state", passed: true, caseIds: ["settings:canonical-reset"] },
    { id: "analytics_reads_canonical_ledger", passed: true, caseIds: ["analytics:canonical-ledger"] },
    { id: "onboarding_creates_canonical_plan", passed: true, caseIds: ["onboarding:canonical-plan-create"] },
    { id: "design_qa_uses_canonical_owners", passed: true, caseIds: ["design-qa:78-fixture-certification"] },
    { id: "no_production_active_training_plan_authority", passed: true, caseIds: ["reachability:train-route-canonical", "reachability:useWorkoutLogger-outside-mounted-train"], reason: "mounted Train route uses canonical boundary; legacy hook remains outside mounted Train" },
    { id: "no_production_legacy_block_authority", passed: true, caseIds: ["reachability:onboarding-canonical", "reachability:nonproduction-plan-setup"], reason: "remaining plan-setup callers are migration, QA, or preview; no mounted production caller" },
    { id: "no_legacy_workout_constructor", passed: false, caseIds: ["reachability:ad-hoc-workout-generation", "reachability:workoutLogger"], reason: "legacy workout/session construction remains reachable from the mounted logger; planned-workout is test-only" },
    { id: "no_legacy_workout_history_authority", passed: false, caseIds: ["reachability:workoutSessionRepository", "reachability:workoutLogger"], reason: "legacy logger/completion paths still write/read workoutSessionRepository; History detail is canonical" },
    { id: "no_legacy_recommendation_mutation", passed: false, caseIds: ["reachability:recommendation-actions"], reason: "canonical recommendation action path remains under audit; deleted decision-application module is not executable" },
    { id: "no_legacy_plan_shape_adapter", passed: false, caseIds: ["reachability:saved-plan-migration", "reachability:planning-context"], reason: "legacy-shaped ActiveTrainingPlan adapters remain reachable" },
    { id: "no_canonical_legacy_dual_read_write", passed: false, caseIds: ["reachability:cloud-data-sync", "reachability:active-plan-repository"], reason: "cloud sync and repositories retain canonical plus legacy transport paths" },
    { id: "retained_paths_are_explicitly_classified", passed: true, caseIds: ["inventory:retained-compatibility-allowlist"] },
    { id: "historical_payloads_fail_closed", passed: true, caseIds: ["migration:malformed-payload-rejection"] },
    { id: "canonical_failures_fail_closed", passed: true, caseIds: ["canonical:atomic-failure-containment"] },
    { id: "ordinary_v2_inactive", passed: true, caseIds: ["ordinary-v2:authority-disabled"] },
    { id: "d4d2_unchanged", passed: true, caseIds: ["d4d2:unchanged"] },
  ];
  const firstFalsePredicate = predicates.find((predicate) => !predicate.passed)?.id ?? null;
  const pipelineReadyForSwitch = true;
  const productionSwitchCompleted = predicates.every((predicate) => predicate.passed);
  return {
    schemaVersion: CANONICAL_PRODUCTION_SWITCH_EVIDENCE_VERSION,
    sourceCommit,
    predicates,
    firstFalsePredicate,
    pipelineReadyForSwitch,
    productionSwitchCompleted,
    classification: productionSwitchCompleted ? "canonical_architecture_is_production_source_of_truth" : "production_switch_blocked_by_live_legacy_authority",
  };
}
