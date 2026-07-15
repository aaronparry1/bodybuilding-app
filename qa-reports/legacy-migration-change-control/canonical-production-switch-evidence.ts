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
    { id: "no_production_active_training_plan_authority", passed: false, caseIds: ["reachability:activeTrainingPlanRepository", "reachability:workoutLogger"], reason: "production workout logging and planning helpers still consume ActiveTrainingPlan" },
    { id: "no_production_legacy_block_authority", passed: false, caseIds: ["reachability:plan-setup", "reachability:progress-dashboard"], reason: "plan-setup and Progress dashboard still read blocks/currentBlock" },
    { id: "no_legacy_workout_constructor", passed: false, caseIds: ["reachability:ad-hoc-workout-generation", "reachability:planned-workout"], reason: "legacy workout constructors remain production-reachable" },
    { id: "no_legacy_workout_history_authority", passed: false, caseIds: ["reachability:workoutSessionRepository", "reachability:workoutLogger"], reason: "Train logging and history screens still write/read workoutSessionRepository" },
    { id: "no_legacy_recommendation_mutation", passed: false, caseIds: ["reachability:progress-dashboard", "reachability:recommendation-actions"], reason: "legacy recommendation state and action helpers remain production-reachable" },
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
