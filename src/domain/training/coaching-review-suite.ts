import {
  decideAdaptiveSetAllocation,
  type AdaptiveSetDecision,
} from "@/domain/training/adaptive-set-allocation";
import {
  decideAdaptiveLoadPrescription,
  type AdaptiveLoadPrescription,
} from "@/domain/training/adaptive-load-prescription";
import {
  decideAdaptiveRepPrescription,
  type AdaptiveExerciseCategory,
  type AdaptiveProgrammingGoal,
  type AdaptiveRepPrescription,
  type AdaptiveTrainingPhase,
  type RecentPerformanceSignal,
} from "@/domain/training/adaptive-rep-prescription";
import {
  deriveCycleStrategyContext,
  type CycleLoadOwnership,
  type CycleRecoveryFlag,
  type CycleStrategyContext,
  type StressBudgetBias,
} from "@/domain/training/cycle-strategy-context";
import {
  deriveAdaptiveStimulusDelivery,
  type AdaptiveStimulusDeliveryPlan,
  type StimulusDeliveryDecision,
  type StimulusDeliveryType,
} from "@/domain/training/adaptive-stimulus-delivery";
import {
  deriveAdaptiveStimulusPlan,
  type AdaptiveStimulusKnownLimitation,
  type AdaptiveStimulusPlan,
  type AdaptiveStimulusSessionType,
} from "@/domain/training/adaptive-stimulus-planner";
import type { Exercise, ExerciseFatigueCost, MovementPattern, MuscleGroup, ProgressionSettings, SetLog } from "@/domain/training/models";
import { decideSessionStrategy, type SessionStrategyDecision } from "@/domain/training/session-strategy";

export type CoachingReviewFlag =
  | "questionable_power_bias"
  | "deadlift_too_aggressive"
  | "isolation_too_heavy"
  | "hypertrophy_too_conservative"
  | "get_lean_too_fatiguing"
  | "peak_not_specific_enough"
  | "deload_not_recovery_enough"
  | "calibration_too_aggressive"
  | "low_confidence_mapping"
  | "low_evidence_confidence"
  | "unsupported_fallback"
  | "rep_intent_mismatch"
  | "deadlift_load_too_aggressive"
  | "load_progression_without_ownership"
  | "recovery_load_not_conservative"
  | "power_load_not_quality_biased"
  | "duration_load_invalid"
  | "large_jump_forced"
  | "low_confidence_load_mapping"
  | "rep_load_intent_mismatch";

export interface CoachingReviewScenario {
  scenario_id: string;
  scenario_name: string;
  goal: AdaptiveProgrammingGoal;
  trainingPhase: AdaptiveTrainingPhase;
  exerciseName: string;
  exerciseCategory: AdaptiveExerciseCategory;
  movementPattern?: MovementPattern;
  recoveryFlag?: CycleRecoveryFlag;
  recentPerformanceSignal?: RecentPerformanceSignal;
  loadOwnership?: CycleLoadOwnership;
  evidenceConfidence?: number;
  loadEstimateConfidence?: "low" | "medium" | "high";
  exerciseExposureCount?: number;
  safetyFlag?: boolean;
  weekInBlock?: number;
  blockLengthWeeks?: number;
  plannedTrainingDays?: number;
  currentSessionIndex?: number;
  completedSets?: number[];
  currentLoad?: number;
  availableLoadJump?: number;
  remainingExercises?: number;
  fatigueCost?: ExerciseFatigueCost;
}

export interface CoachingReviewRecord {
  scenario_id: string;
  scenario_name: string;
  input_summary: string;
  cycle_strategy: CycleStrategyContext;
  session_strategy: SessionStrategyDecision;
  rep_prescription: AdaptiveRepPrescription;
  load_prescription: AdaptiveLoadPrescription;
  set_allocation_preview: AdaptiveSetDecision | null;
  coaching_summary: string;
  confidence: number;
  review_flags: CoachingReviewFlag[];
  needs_aaron_review: boolean;
}

export interface CoachingReviewSuiteResult {
  scenario_count: number;
  records: CoachingReviewRecord[];
  passed_expected_checks: number;
  failed_expected_checks: string[];
  flagged_for_aaron_review: number;
  top_questionable_decisions: CoachingReviewRecord[];
  top_questionable_load_decisions: CoachingReviewRecord[];
  missing_context: string[];
  ready_for_simulator_only_wiring: boolean;
}

export type CompleteSessionReviewFlag =
  | "questionable_exercise"
  | "repeated_exercise_bias"
  | "unnecessary_fatigue"
  | "poor_specificity"
  | "lack_of_variety"
  | "unnecessary_complexity"
  | "low_confidence_session"
  | "load_progression_without_ownership"
  | "deadlift_too_aggressive"
  | "duration_load_invalid";

export interface CompleteCoachingSessionSpec {
  session_id: string;
  session_name: string;
  goal: AdaptiveProgrammingGoal;
  trainingPhase: AdaptiveTrainingPhase;
  sessionType: AdaptiveStimulusSessionType;
  recoveryFlag: CycleRecoveryFlag;
  recentPerformanceSignal: RecentPerformanceSignal;
  loadOwnership: CycleLoadOwnership;
  evidenceConfidence: number;
  loadEstimateConfidence: "low" | "medium" | "high";
  knownLimitations?: AdaptiveStimulusKnownLimitation[];
  weekInBlock?: number;
  blockLengthWeeks?: number;
  plannedTrainingDays?: number;
}

export interface CompleteSessionExerciseReview {
  stimulus_id: string;
  selected_exercise: string;
  movement_pattern: string;
  delivery: StimulusDeliveryDecision;
  cycle_strategy: CycleStrategyContext;
  session_strategy: SessionStrategyDecision;
  rep_prescription: AdaptiveRepPrescription;
  load_prescription: AdaptiveLoadPrescription;
  set_allocation: AdaptiveSetDecision | null;
  why_exercise_selected: string;
  why_reps: string;
  why_load: string;
  why_sets: string;
}

export interface CompleteCoachingSessionReview {
  session_id: string;
  session_name: string;
  goal: AdaptiveProgrammingGoal;
  trainingPhase: AdaptiveTrainingPhase;
  sessionType: AdaptiveStimulusSessionType;
  cycle_strategy: CycleStrategyContext;
  stimulus_plan: AdaptiveStimulusPlan;
  stimulus_delivery: AdaptiveStimulusDeliveryPlan;
  exercises: CompleteSessionExerciseReview[];
  session_summary: string;
  confidence: number;
  review_flags: CompleteSessionReviewFlag[];
  gold_standard: boolean;
}

export interface CompleteCoachingSessionReviewResult {
  session_count: number;
  exercise_count: number;
  gold_standard_count: number;
  sessions: CompleteCoachingSessionReview[];
  best_coaching_sessions: CompleteCoachingSessionReview[];
  questionable_sessions: CompleteCoachingSessionReview[];
  repeated_exercise_bias: CompleteCoachingSessionReview[];
  unnecessary_fatigue: CompleteCoachingSessionReview[];
  poor_specificity: CompleteCoachingSessionReview[];
  lack_of_variety: CompleteCoachingSessionReview[];
  unnecessary_complexity: CompleteCoachingSessionReview[];
}

const DEFAULT_UNIT = "kg";
const EXPECTED_CHECK_COUNT = 22;

export const PRODUCTION_V2_COACHING_REVIEW_SCENARIOS: CoachingReviewScenario[] = buildScenarios();
export const PRODUCTION_V2_COMPLETE_SESSION_SPECS: CompleteCoachingSessionSpec[] = buildCompleteSessionSpecs();
export const GOLD_STANDARD_COMPLETE_SESSION_IDS = PRODUCTION_V2_COMPLETE_SESSION_SPECS.map((spec) => spec.session_id);

export function runProductionV2CoachingReviewSuite(
  scenarios: CoachingReviewScenario[] = PRODUCTION_V2_COACHING_REVIEW_SCENARIOS,
): CoachingReviewSuiteResult {
  const records = scenarios.map(reviewScenario);
  const failedExpectedChecks = expectedCheckFailures(records);
  const flaggedRecords = records.filter((record) => record.needs_aaron_review);

  return {
    scenario_count: records.length,
    records,
    passed_expected_checks: EXPECTED_CHECK_COUNT - failedExpectedChecks.length,
    failed_expected_checks: failedExpectedChecks,
    flagged_for_aaron_review: flaggedRecords.length,
    top_questionable_decisions: flaggedRecords.slice(0, 10),
    top_questionable_load_decisions: flaggedRecords.filter(hasLoadReviewFlag).slice(0, 10),
    missing_context: [
      "Adaptive Load Prescription is isolated and not wired to generated workouts.",
      "Cycle context uses compact scalar recovery/performance inputs, not full Coaching State.",
      "Set allocation preview uses synthetic completed sets, not full workout state.",
      "Exercise metadata is archetype-level; production exercise database mapping still needs review before global wiring.",
    ],
    ready_for_simulator_only_wiring: failedExpectedChecks.length === 0,
  };
}

export function reviewScenario(scenario: CoachingReviewScenario): CoachingReviewRecord {
  const cycle = deriveCycleStrategyContext({
    goal: scenario.goal,
    trainingPhase: scenario.trainingPhase,
    weekInBlock: scenario.weekInBlock,
    blockLengthWeeks: scenario.blockLengthWeeks,
    plannedTrainingDays: scenario.plannedTrainingDays,
    currentSessionIndex: scenario.currentSessionIndex,
    recentPerformanceSignal: scenario.recentPerformanceSignal,
    recoveryFlag: scenario.recoveryFlag,
    loadOwnership: scenario.loadOwnership,
    evidenceConfidence: scenario.evidenceConfidence,
  });

  const session = decideSessionStrategy({
    goal: scenario.goal,
    exerciseName: scenario.exerciseName,
    exerciseCategory: scenario.exerciseCategory,
    movementPattern: scenario.movementPattern,
    trainingPhase: scenario.trainingPhase,
    recoveryFlag: scenario.recoveryFlag,
    recentPerformanceSignal: scenario.recentPerformanceSignal,
    loadEstimateConfidence: scenario.loadEstimateConfidence,
    exerciseExposureCount: scenario.exerciseExposureCount,
    loadOwnership: scenario.loadOwnership,
    safetyFlag: scenario.safetyFlag,
    cycleStrategyContext: cycle,
  });

  const settings = settingsForScenario(scenario);
  const rep = decideAdaptiveRepPrescription({
    goal: scenario.goal,
    exerciseName: scenario.exerciseName,
    exerciseCategory: scenario.exerciseCategory,
    movementPattern: scenario.movementPattern,
    trainingPhase: scenario.trainingPhase,
    setObjective: session.set_objective,
    coachingBias: session.coaching_bias,
    prescribedRange: settings.repRange,
    exerciseExposureCount: scenario.exerciseExposureCount,
    loadEstimateConfidence: confidenceNumber(scenario.loadEstimateConfidence),
    recoveryFlag: scenario.recoveryFlag === "poor",
    recentPerformanceSignal: scenario.recentPerformanceSignal,
    fatigueCost: scenario.fatigueCost,
  });

  const load = decideAdaptiveLoadPrescription({
    goal: scenario.goal,
    exerciseName: scenario.exerciseName,
    exerciseCategory: scenario.exerciseCategory,
    movementPattern: scenario.movementPattern,
    trainingPhase: scenario.trainingPhase,
    cycleStrategyContext: cycle,
    sessionStrategy: session,
    repPrescription: rep,
    previousLoad: scenario.currentLoad,
    lastSuccessfulLoad: scenario.currentLoad,
    loadOwnership: scenario.loadOwnership,
    recentPerformanceSignal: scenario.recentPerformanceSignal,
    recoveryFlag: scenario.recoveryFlag,
    availableLoadJump: scenario.availableLoadJump,
    safetyFlag: scenario.safetyFlag,
  });

  const setPreview = buildSetAllocationPreview(scenario, settings, rep);
  const flags = reviewFlags(scenario, cycle, session, rep, load, setPreview);

  return {
    scenario_id: scenario.scenario_id,
    scenario_name: scenario.scenario_name,
    input_summary: inputSummary(scenario),
    cycle_strategy: cycle,
    session_strategy: session,
    rep_prescription: rep,
    load_prescription: load,
    set_allocation_preview: setPreview,
    coaching_summary: coachingSummary(cycle, session, rep, load, setPreview),
    confidence: Math.round((cycle.confidence + session.confidence + rep.confidence + load.confidence + (setPreview?.confidence ?? session.confidence)) / 5),
    review_flags: flags,
    needs_aaron_review: flags.some(isAaronReviewFlag),
  };
}

export function generateProductionV2CoachingReviewMarkdown(result = runProductionV2CoachingReviewSuite()): string {
  const lines = [
    "# Production V2 Coaching Review Suite v2",
    "",
    "Status: isolated production-pipeline review. No global workout-generation wiring.",
    "",
    "## Summary",
    "",
    `- Total scenarios: ${result.scenario_count}`,
    `- Expected behaviour checks passed: ${result.passed_expected_checks}/${EXPECTED_CHECK_COUNT}`,
    `- Flagged for Aaron review: ${result.flagged_for_aaron_review}`,
    `- Ready for simulator-only wiring: ${result.ready_for_simulator_only_wiring ? "yes" : "not yet"}`,
    "",
    "## Top Questionable Decisions",
    "",
    ...questionableDecisionLines(result.top_questionable_decisions),
    "",
    "## Top Questionable Load Decisions",
    "",
    ...questionableDecisionLines(result.top_questionable_load_decisions),
    "",
    "## Missing Context",
    "",
    ...result.missing_context.map((item) => `- ${item}`),
    "",
    "## Scenario Groups",
    "",
    ...scenarioGroupLines(result.records),
    "",
    "## Recommendation",
    "",
    result.ready_for_simulator_only_wiring
      ? "The isolated pipeline is coherent enough for simulator-only wiring, with the flagged review items kept visible."
      : "Do not wire this pipeline into simulation until the failed expected checks are corrected.",
    "",
  ];

  return `${lines.join("\n")}\n`;
}

export function runProductionV2CompleteSessionReviewSuite(
  specs: CompleteCoachingSessionSpec[] = PRODUCTION_V2_COMPLETE_SESSION_SPECS,
): CompleteCoachingSessionReviewResult {
  const sessions = specs.map(reviewCompleteSession);
  const questionable = sessions.filter((session) => session.review_flags.length > 0);

  return {
    session_count: sessions.length,
    exercise_count: sessions.reduce((total, session) => total + session.exercises.length, 0),
    gold_standard_count: sessions.filter((session) => session.gold_standard).length,
    sessions,
    best_coaching_sessions: sessions
      .filter((session) => session.review_flags.length === 0)
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 8),
    questionable_sessions: questionable.slice(0, 12),
    repeated_exercise_bias: sessions.filter((session) => session.review_flags.includes("repeated_exercise_bias")),
    unnecessary_fatigue: sessions.filter((session) => session.review_flags.includes("unnecessary_fatigue")),
    poor_specificity: sessions.filter((session) => session.review_flags.includes("poor_specificity")),
    lack_of_variety: sessions.filter((session) => session.review_flags.includes("lack_of_variety")),
    unnecessary_complexity: sessions.filter((session) => session.review_flags.includes("unnecessary_complexity")),
  };
}

export function reviewCompleteSession(spec: CompleteCoachingSessionSpec): CompleteCoachingSessionReview {
  const cycle = deriveCycleStrategyContext({
    goal: spec.goal,
    trainingPhase: spec.trainingPhase,
    weekInBlock: spec.weekInBlock,
    blockLengthWeeks: spec.blockLengthWeeks,
    plannedTrainingDays: spec.plannedTrainingDays,
    recentPerformanceSignal: spec.recentPerformanceSignal,
    recoveryFlag: spec.recoveryFlag,
    loadOwnership: spec.loadOwnership,
    evidenceConfidence: spec.evidenceConfidence,
  });
  const stimulusPlan = deriveAdaptiveStimulusPlan({
    goal: spec.goal,
    trainingPhase: spec.trainingPhase,
    sessionType: spec.sessionType,
    recoveryFlag: spec.recoveryFlag,
    recentPerformanceSignal: spec.recentPerformanceSignal,
    stressBudgetBias: cycle.stress_budget_bias,
    cycleStrategyContext: cycle,
    knownLimitations: spec.knownLimitations,
  });
  const delivery = deriveAdaptiveStimulusDelivery({
    stimulusPlan,
    goal: spec.goal,
    trainingPhase: spec.trainingPhase,
    recoveryFlag: spec.recoveryFlag,
    knownLimitations: spec.knownLimitations,
    availableEquipment: "full_gym",
  });
  const decisions = delivery.decisions.filter((decision) => !stimulusPlan.avoid_stimuli.includes(decision.stimulus_id));
  const selectedDecisions = trimSessionDecisions(decisions, spec);
  const exercises = selectedDecisions.map((decision, index) => reviewSessionExercise(spec, cycle, decision, index, selectedDecisions.length));
  const flags = completeSessionFlags(spec, exercises);
  const confidence = Math.round(
    (cycle.confidence +
      stimulusPlan.confidence +
      delivery.confidence +
      (exercises.reduce((total, exercise) => total + exercise.rep_prescription.confidence + exercise.load_prescription.confidence + exercise.delivery.confidence, 0) / Math.max(1, exercises.length * 3))) /
      4,
  );

  return {
    session_id: spec.session_id,
    session_name: spec.session_name,
    goal: spec.goal,
    trainingPhase: spec.trainingPhase,
    sessionType: spec.sessionType,
    cycle_strategy: cycle,
    stimulus_plan: stimulusPlan,
    stimulus_delivery: delivery,
    exercises,
    session_summary: `${spec.goal} ${spec.trainingPhase}: ${exercises.map((exercise) => exercise.selected_exercise).join(" -> ")}`,
    confidence,
    review_flags: flags,
    gold_standard: GOLD_STANDARD_COMPLETE_SESSION_IDS.includes(spec.session_id),
  };
}

export function generateProductionV2CompleteSessionReviewMarkdown(result = runProductionV2CompleteSessionReviewSuite()): string {
  const lines = [
    "# Production V2 Coaching Review Suite v3",
    "",
    "Status: complete-session isolated review. No global workout-generation wiring.",
    "",
    "## Summary",
    "",
    `- Complete sessions: ${result.session_count}`,
    `- Exercises reviewed: ${result.exercise_count}`,
    `- Gold Standard Sessions: ${result.gold_standard_count}`,
    `- Questionable sessions: ${result.questionable_sessions.length}`,
    `- Repeated exercise bias: ${result.repeated_exercise_bias.length}`,
    `- Unnecessary fatigue: ${result.unnecessary_fatigue.length}`,
    `- Poor specificity: ${result.poor_specificity.length}`,
    `- Lack of variety: ${result.lack_of_variety.length}`,
    `- Unnecessary complexity: ${result.unnecessary_complexity.length}`,
    "",
    "## Best Coaching Sessions",
    "",
    ...sessionListLines(result.best_coaching_sessions),
    "",
    "## Questionable Sessions",
    "",
    ...sessionListLines(result.questionable_sessions),
    "",
    "## Gold Standard Sessions",
    "",
    "These sessions are regression benchmarks. Future engine changes should compare complete exercise selection, rep intent, load strategy, set guidance, flags, and confidence against this section.",
    "",
    ...completeSessionLines(result.sessions.filter((session) => session.gold_standard)),
    "",
    "## Repeated Exercise Bias",
    "",
    ...sessionListLines(result.repeated_exercise_bias),
    "",
    "## Unnecessary Fatigue",
    "",
    ...sessionListLines(result.unnecessary_fatigue),
    "",
    "## Poor Specificity",
    "",
    ...sessionListLines(result.poor_specificity),
    "",
    "## Lack of Variety",
    "",
    ...sessionListLines(result.lack_of_variety),
    "",
    "## Unnecessary Complexity",
    "",
    ...sessionListLines(result.unnecessary_complexity),
    "",
    "## Verdict",
    "",
    result.questionable_sessions.length === 0
      ? "The complete-session pipeline is coherent enough for simulator-only review."
      : "Keep these sessions in review before any production workout-generation wiring.",
    "",
  ];

  return `${lines.join("\n")}\n`;
}

function buildCompleteSessionSpecs(): CompleteCoachingSessionSpec[] {
  const base = {
    blockLengthWeeks: 6,
    plannedTrainingDays: 4,
    weekInBlock: 3,
    evidenceConfidence: 86,
    loadEstimateConfidence: "medium" as const,
    loadOwnership: "owned" as const,
    recentPerformanceSignal: "appropriate" as const,
    recoveryFlag: "normal" as const,
  };

  return [
    sessionSpec("strength_01_peak_sbd", "Strength Peak SBD", "strength", "peak", "full_body", { ...base, weekInBlock: 6, recoveryFlag: "good", recentPerformanceSignal: "improving", evidenceConfidence: 94, loadEstimateConfidence: "high" }),
    sessionSpec("strength_02_accum_lower", "Strength Accumulation Lower", "strength", "accumulation", "lower", { ...base }),
    sessionSpec("strength_03_intensity_upper", "Strength Intensification Upper", "strength", "intensification", "upper", { ...base, recoveryFlag: "good", recentPerformanceSignal: "underloaded", evidenceConfidence: 90, loadEstimateConfidence: "high" }),
    sessionSpec("strength_04_deadlift_calibration", "Strength Deadlift Calibration", "strength", "accumulation", "lower", { ...base, recentPerformanceSignal: "unknown", loadOwnership: "unknown", evidenceConfidence: 58, loadEstimateConfidence: "low" }),
    sessionSpec("strength_05_low_back_management", "Strength Low Back Managed", "strength", "accumulation", "full_body", { ...base, recoveryFlag: "limited", knownLimitations: ["low_back_fatigue"] }),
    sessionSpec("hypertrophy_01_push", "Hypertrophy Push Quality", "hypertrophy", "accumulation", "push", { ...base, recoveryFlag: "good", recentPerformanceSignal: "appropriate" }),
    sessionSpec("hypertrophy_02_pull", "Hypertrophy Pull Quality", "hypertrophy", "accumulation", "pull", { ...base }),
    sessionSpec("hypertrophy_03_legs", "Hypertrophy Legs Quality", "hypertrophy", "accumulation", "legs", { ...base }),
    sessionSpec("hypertrophy_04_limited_recovery", "Hypertrophy Limited Recovery", "hypertrophy", "intensification", "upper", { ...base, recoveryFlag: "limited", knownLimitations: ["shoulder_irritation"] }),
    sessionSpec("hypertrophy_05_deload", "Hypertrophy Deload", "hypertrophy", "deload", "full_body", { ...base, recoveryFlag: "normal" }),
    sessionSpec("bms_01_upper_anchor", "Build Muscle + Strength Upper Anchor", "build_muscle_strength", "accumulation", "upper", { ...base }),
    sessionSpec("bms_02_lower_anchor", "Build Muscle + Strength Lower Anchor", "build_muscle_strength", "accumulation", "lower", { ...base }),
    sessionSpec("bms_03_intensification", "Build Muscle + Strength Intensification", "build_muscle_strength", "intensification", "full_body", { ...base, recoveryFlag: "good", recentPerformanceSignal: "improving", loadEstimateConfidence: "high" }),
    sessionSpec("bms_04_peak_bench", "Build Muscle + Strength Peak Bench", "build_muscle_strength", "peak", "upper", { ...base, weekInBlock: 6, recoveryFlag: "good", evidenceConfidence: 92 }),
    sessionSpec("bms_05_time_limited", "Build Muscle + Strength Time Limited", "build_muscle_strength", "accumulation", "full_body", { ...base, knownLimitations: ["time_limited"] }),
    sessionSpec("athletic_01_power", "Athletic Power Session", "athletic_performance", "accumulation", "power", { ...base, recoveryFlag: "good", evidenceConfidence: 88 }),
    sessionSpec("athletic_02_peak_power", "Athletic Peak Power", "athletic_performance", "peak", "power", { ...base, recoveryFlag: "good", recentPerformanceSignal: "improving", evidenceConfidence: 92 }),
    sessionSpec("athletic_03_strength_support", "Athletic Strength Support", "athletic_performance", "intensification", "full_body", { ...base }),
    sessionSpec("athletic_04_poor_recovery", "Athletic Poor Recovery", "athletic_performance", "accumulation", "power", { ...base, recoveryFlag: "poor", recentPerformanceSignal: "overreached", evidenceConfidence: 72 }),
    sessionSpec("athletic_05_shoulder_managed", "Athletic Shoulder Managed", "athletic_performance", "accumulation", "upper", { ...base, knownLimitations: ["shoulder_irritation"] }),
    sessionSpec("lean_01_full_body", "Get Lean Full Body", "get_lean", "accumulation", "full_body", { ...base, plannedTrainingDays: 3 }),
    sessionSpec("lean_02_poor_recovery", "Get Lean Poor Recovery", "get_lean", "accumulation", "full_body", { ...base, plannedTrainingDays: 3, recoveryFlag: "poor", recentPerformanceSignal: "overreached", evidenceConfidence: 70 }),
    sessionSpec("lean_03_upper_preserve", "Get Lean Upper Preserve", "get_lean", "intensification", "upper", { ...base, plannedTrainingDays: 3, recoveryFlag: "good" }),
    sessionSpec("lean_04_lower_limited", "Get Lean Lower Limited", "get_lean", "accumulation", "lower", { ...base, plannedTrainingDays: 3, recoveryFlag: "limited", knownLimitations: ["low_back_fatigue"] }),
    sessionSpec("lean_05_maintenance", "Get Lean Maintenance Week", "get_lean", "maintenance", "full_body", { ...base, plannedTrainingDays: 3 }),
  ];
}

function sessionSpec(
  session_id: string,
  session_name: string,
  goal: AdaptiveProgrammingGoal,
  trainingPhase: AdaptiveTrainingPhase,
  sessionType: AdaptiveStimulusSessionType,
  overrides: Omit<CompleteCoachingSessionSpec, "session_id" | "session_name" | "goal" | "trainingPhase" | "sessionType">,
): CompleteCoachingSessionSpec {
  return {
    session_id,
    session_name,
    goal,
    trainingPhase,
    sessionType,
    ...overrides,
  };
}

function reviewSessionExercise(
  spec: CompleteCoachingSessionSpec,
  cycle: CycleStrategyContext,
  delivery: StimulusDeliveryDecision,
  index: number,
  totalExercises: number,
): CompleteSessionExerciseReview {
  const selected = selectExerciseForDelivery(delivery);
  const session = decideSessionStrategy({
    goal: spec.goal,
    exerciseName: selected.exerciseName,
    exerciseCategory: selected.exerciseCategory,
    movementPattern: selected.movementPattern,
    trainingPhase: spec.trainingPhase,
    recoveryFlag: spec.recoveryFlag,
    recentPerformanceSignal: spec.recentPerformanceSignal,
    loadEstimateConfidence: spec.loadEstimateConfidence,
    exerciseExposureCount: exposureCountFor(spec, delivery, index),
    loadOwnership: spec.loadOwnership,
    safetyFlag: spec.knownLimitations?.includes("pain"),
    cycleStrategyContext: cycle,
  });
  const settings = settingsForCompleteExercise(selected.exerciseCategory, delivery, spec);
  const rep = decideAdaptiveRepPrescription({
    goal: spec.goal,
    exerciseName: selected.exerciseName,
    exerciseCategory: selected.exerciseCategory,
    movementPattern: selected.movementPattern,
    trainingPhase: spec.trainingPhase,
    setObjective: session.set_objective,
    coachingBias: session.coaching_bias,
    prescribedRange: settings.repRange,
    exerciseExposureCount: exposureCountFor(spec, delivery, index),
    loadEstimateConfidence: confidenceNumber(spec.loadEstimateConfidence),
    recoveryFlag: spec.recoveryFlag === "poor",
    recentPerformanceSignal: spec.recentPerformanceSignal,
    fatigueCost: selected.fatigueCost,
  });
  const allocationSettings = alignSettingsWithRepIntent(settings, rep);
  const load = decideAdaptiveLoadPrescription({
    goal: spec.goal,
    exerciseName: selected.exerciseName,
    exerciseCategory: selected.exerciseCategory,
    movementPattern: selected.movementPattern,
    trainingPhase: spec.trainingPhase,
    cycleStrategyContext: cycle,
    sessionStrategy: session,
    repPrescription: rep,
    previousLoad: selected.previousLoad,
    lastSuccessfulLoad: selected.previousLoad,
    loadOwnership: spec.loadOwnership,
    recentPerformanceSignal: spec.recentPerformanceSignal,
    recoveryFlag: spec.recoveryFlag,
    availableLoadJump: selected.availableLoadJump,
    safetyFlag: spec.knownLimitations?.includes("pain"),
  });
  const setAllocation = decideAdaptiveSetAllocation({
    exerciseName: selected.exerciseName,
    settings: allocationSettings,
    sets: previewSetsFor(allocationSettings, selected.previousLoad, rep, spec),
    currentLoad: selected.previousLoad,
    metadata: {
      role: roleForCategory(selected.exerciseCategory),
      family: selected.movementPattern === "hinge" ? "hip_hinge" : selected.movementPattern === "squat" ? "squat_pattern" : "other",
      primaryMuscles: [primaryMuscleForMovement(delivery.movement_pattern)],
      fatigueCost: selected.fatigueCost,
      movementPattern: selected.movementPattern ?? "isolation",
    },
    blockType: spec.trainingPhase === "deload" ? "deload" : undefined,
    remainingExercises: Math.max(0, totalExercises - index - 1),
    painOrSafetyFlag: spec.knownLimitations?.includes("pain"),
    repPrescription: rep,
  });

  return {
    stimulus_id: delivery.stimulus_id,
    selected_exercise: selected.exerciseName,
    movement_pattern: delivery.movement_pattern,
    delivery,
    cycle_strategy: cycle,
    session_strategy: session,
    rep_prescription: rep,
    load_prescription: load,
    set_allocation: setAllocation,
    why_exercise_selected: `${selected.exerciseName} delivers ${delivery.stimulus_id} via ${delivery.preferred_delivery_type.replace(/_/g, " ")}: ${delivery.rationale}`,
    why_reps: `${rep.prescription_type.replace(/_/g, " ")} because ${session.set_objective}/${session.coaching_bias}: ${rep.short_reason}`,
    why_load: `${load.load_action.replace(/_/g, " ")} using ${load.load_strategy.replace(/_/g, " ")}: ${load.short_reason}`,
    why_sets: `${allocationSettings.recommendedMinSets}-${allocationSettings.recommendedMaxSets} set range; ${setAllocation.short_reason}`,
  };
}

function trimSessionDecisions(decisions: StimulusDeliveryDecision[], spec: CompleteCoachingSessionSpec) {
  const maxExercises = spec.knownLimitations?.includes("time_limited") ? 4 : spec.trainingPhase === "deload" || spec.recoveryFlag === "poor" ? 3 : 6;
  const priorityRank = (decision: StimulusDeliveryDecision) => {
    if (decision.stimulus_id.includes("competition")) return 0;
    if (decision.stimulus_id.includes("power") || decision.stimulus_id.includes("speed")) return 1;
    return 2;
  };

  return [...decisions]
    .sort((a, b) => priorityRank(a) - priorityRank(b))
    .slice(0, maxExercises);
}

function selectExerciseForDelivery(decision: StimulusDeliveryDecision): {
  exerciseName: string;
  exerciseCategory: AdaptiveExerciseCategory;
  movementPattern?: MovementPattern;
  fatigueCost: ExerciseFatigueCost;
  previousLoad: number;
  availableLoadJump: number;
} {
  const exact = exerciseForStimulus(decision);
  if (exact) return exact;

  if (decision.preferred_delivery_type === "competition_lift") return exerciseSpec("Competition Squat", "competition_squat", "squat", "high", 150, 5);
  if (decision.preferred_delivery_type === "heavy_free_weight_compound") return exerciseSpec("Barbell Row", "heavy_compound", "horizontal_pull", "moderate", 80, 2.5);
  if (decision.preferred_delivery_type === "free_weight_compound") return exerciseSpec("Incline Dumbbell Press", "heavy_compound", "horizontal_push", "moderate", 36, 2);
  if (decision.preferred_delivery_type === "machine_compound") return exerciseSpec("Chest Press", "machine_compound", "horizontal_push", "moderate", 80, 2.5);
  if (decision.preferred_delivery_type === "cable") return exerciseSpec("Cable Fly", "isolation", "isolation", "low", 25, 2.5);
  if (decision.preferred_delivery_type === "isolation") return exerciseSpec("Leg Extension", "isolation", "isolation", "low", 60, 2.5);
  if (decision.preferred_delivery_type === "power_movement") return exerciseSpec("Box Jump", "power", undefined, "moderate", 0, 0);
  if (decision.preferred_delivery_type === "carry") return exerciseSpec("Farmer Carry", "duration_bodyweight", "carry", "moderate", 40, 5);
  if (decision.preferred_delivery_type === "skill_movement") return exerciseSpec("Technique Practice", "duration_bodyweight", "core", "low", 0, 0);
  return exerciseSpec("Plank", "duration_bodyweight", "core", "low", 0, 0);
}

function exerciseForStimulus(decision: StimulusDeliveryDecision) {
  const id = decision.stimulus_id;
  if (id === "competition_squat_strength") return exerciseSpec("Competition Squat", "competition_squat", "squat", "high", 150, 5);
  if (id === "competition_bench_strength") return exerciseSpec("Competition Bench Press", "competition_bench", "horizontal_push", "moderate", 100, 2.5);
  if (id === "competition_deadlift_strength") return exerciseSpec("Competition Deadlift", "competition_deadlift", "hinge", "high", 180, 5);
  if (id === "overhead_press_strength") return exerciseSpec("Standing Overhead Press", "standing_overhead_press", "vertical_push", "moderate", 50, 2.5);
  if (id === "horizontal_pull_strength") return exerciseSpec(decision.preferred_delivery_type === "machine_compound" ? "Chest Supported Row" : "Barbell Row", decision.preferred_delivery_type === "machine_compound" ? "machine_compound" : "heavy_compound", "horizontal_pull", "moderate", 80, 2.5);
  if (id === "chest_hypertrophy") return exerciseSpec(decision.preferred_delivery_type === "cable" ? "Cable Fly" : "Chest Press", decision.preferred_delivery_type === "cable" ? "isolation" : "machine_compound", "horizontal_push", "moderate", 70, 2.5);
  if (id === "upper_chest_hypertrophy") return exerciseSpec("Incline Dumbbell Press", "heavy_compound", "horizontal_push", "moderate", 32, 2);
  if (id === "triceps_hypertrophy") return exerciseSpec("Triceps Pushdown", "isolation", "isolation", "low", 35, 2.5);
  if (id === "front_delt_hypertrophy") return exerciseSpec("Machine Shoulder Press", "machine_compound", "vertical_push", "moderate", 50, 2.5);
  if (id === "lateral_delt_hypertrophy") return exerciseSpec("Lateral Raise", "isolation", "isolation", "low", 12, 1);
  if (id === "upper_back_hypertrophy") return exerciseSpec(decision.preferred_delivery_type === "cable" ? "Cable Row" : "Chest Supported Row", decision.preferred_delivery_type === "cable" ? "machine_compound" : "machine_compound", "horizontal_pull", "moderate", 70, 2.5);
  if (id === "lat_hypertrophy") return exerciseSpec("Lat Pulldown", "machine_compound", "vertical_pull", "moderate", 65, 2.5);
  if (id === "biceps_hypertrophy") return exerciseSpec("Cable Curl", "isolation", "isolation", "low", 25, 2.5);
  if (id === "quad_hypertrophy") return exerciseSpec(decision.preferred_delivery_type === "isolation" ? "Leg Extension" : "Leg Press", decision.preferred_delivery_type === "isolation" ? "isolation" : "heavy_compound", "squat", "moderate", 140, 5);
  if (id === "hamstring_hypertrophy") return exerciseSpec(decision.preferred_delivery_type === "heavy_free_weight_compound" ? "Romanian Deadlift" : "Hamstring Curl", decision.preferred_delivery_type === "heavy_free_weight_compound" ? "heavy_compound" : "isolation", decision.preferred_delivery_type === "heavy_free_weight_compound" ? "hinge" : "isolation", decision.preferred_delivery_type === "heavy_free_weight_compound" ? "high" : "low", 70, 2.5);
  if (id === "glute_hypertrophy") return exerciseSpec("Hip Thrust", "heavy_compound", "hinge", "moderate", 100, 5);
  if (id === "calf_hypertrophy") return exerciseSpec("Calf Raise", "isolation", "isolation", "low", 60, 5);
  if (id === "abdominal_hypertrophy") return exerciseSpec("Cable Crunch", "isolation", "core", "low", 30, 2.5);
  if (id === "lower_body_power") return exerciseSpec("Box Jump", "power", undefined, "moderate", 0, 0);
  if (id === "upper_body_power") return exerciseSpec("Medicine Ball Throw", "power", undefined, "moderate", 0, 0);
  if (id === "speed_strength") return exerciseSpec("Speed Squat", "power", "squat", "moderate", 60, 5);
  if (id === "landing_skill") return exerciseSpec("Landing Skill Drill", "duration_bodyweight", "squat", "low", 0, 0);
  if (id === "trunk_stiffness") return exerciseSpec("Farmer Carry", "duration_bodyweight", "carry", "moderate", 40, 5);
  if (id === "technical_practice") return exerciseSpec("Technique Practice", "duration_bodyweight", "core", "low", 0, 0);
  if (id === "low_stress_movement") return exerciseSpec("Low Stress Circuit", "duration_bodyweight", "core", "low", 0, 0);
  if (id === "recovery_stimulus") return exerciseSpec("Recovery Movement", "duration_bodyweight", "core", "low", 0, 0);
  if (id === "mobility_control") return exerciseSpec("Mobility Control", "duration_bodyweight", "core", "low", 0, 0);
  return null;
}

function exerciseSpec(
  exerciseName: string,
  exerciseCategory: AdaptiveExerciseCategory,
  movementPattern: MovementPattern | undefined,
  fatigueCost: ExerciseFatigueCost,
  previousLoad: number,
  availableLoadJump: number,
) {
  return { exerciseName, exerciseCategory, movementPattern, fatigueCost, previousLoad, availableLoadJump };
}

function settingsForCompleteExercise(
  category: AdaptiveExerciseCategory,
  delivery: StimulusDeliveryDecision,
  spec: CompleteCoachingSessionSpec,
): ProgressionSettings {
  const highFatigue = delivery.fatigue_score >= 70 || category === "competition_deadlift";
  const isDuration = category === "duration_bodyweight";
  return {
    repRange: rangeForCategory(category),
    measurementType: isDuration ? "duration" : "reps",
    durationIncreaseSeconds: isDuration ? 5 : undefined,
    dropOffPercent: 15,
    loadIncrease: category === "competition_deadlift" ? 5 : 2.5,
    unit: DEFAULT_UNIT,
    requiredWorkSets: 2,
    recommendedMinSets: 2,
    recommendedMaxSets: spec.trainingPhase === "deload" || spec.recoveryFlag === "poor" ? 2 : highFatigue ? 3 : category === "isolation" ? 5 : 4,
  };
}

function alignSettingsWithRepIntent(settings: ProgressionSettings, rep: AdaptiveRepPrescription): ProgressionSettings {
  if (rep.target_seconds) {
    return {
      ...settings,
      measurementType: "duration",
      repRange: {
        min: rep.target_seconds,
        max: Math.max(rep.target_seconds, rep.duration_range?.max ?? rep.target_seconds),
      },
    };
  }
  if (!rep.target_reps) return settings;
  if (rep.target_reps >= settings.repRange.min && rep.target_reps <= settings.repRange.max) return settings;
  return {
    ...settings,
    repRange: {
      min: rep.target_reps,
      max: Math.max(rep.target_reps, Math.min(settings.repRange.max, rep.target_reps + 1)),
    },
  };
}

function previewSetsFor(
  settings: ProgressionSettings,
  load: number,
  rep: AdaptiveRepPrescription,
  spec: CompleteCoachingSessionSpec,
): SetLog[] {
  const target = rep.target_reps ?? rep.target_seconds ?? settings.repRange.min;
  const second = spec.recentPerformanceSignal === "overreached" ? Math.max(settings.repRange.min - 1, target - 3) : Math.max(settings.repRange.min, target - 1);
  return [work(1, load, target), work(2, load, second)];
}

function exposureCountFor(spec: CompleteCoachingSessionSpec, delivery: StimulusDeliveryDecision, index: number) {
  if (spec.loadOwnership === "unknown" || spec.loadEstimateConfidence === "low") return 0;
  if (delivery.preferred_delivery_type === "competition_lift") return 8;
  return Math.max(3, 6 - index);
}

function completeSessionFlags(
  spec: CompleteCoachingSessionSpec,
  exercises: CompleteSessionExerciseReview[],
): CompleteSessionReviewFlag[] {
  const flags: CompleteSessionReviewFlag[] = [];
  const exerciseNames = exercises.map((exercise) => exercise.selected_exercise);
  const deliveryTypes = exercises.map((exercise) => exercise.delivery.preferred_delivery_type);
  const highFatigueCount = exercises.filter((exercise) => exercise.delivery.fatigue_score >= 70 || exercise.selected_exercise.includes("Deadlift")).length;
  const competitionAnchors = exercises.filter((exercise) => exercise.delivery.preferred_delivery_type === "competition_lift").length;
  const uniqueDeliveryCount = new Set(deliveryTypes).size;

  if (new Set(exerciseNames).size !== exerciseNames.length) flags.push("repeated_exercise_bias");
  if ((spec.recoveryFlag === "poor" || spec.trainingPhase === "deload") && highFatigueCount > 0) flags.push("unnecessary_fatigue");
  if (spec.recoveryFlag !== "poor" && spec.trainingPhase !== "deload" && highFatigueCount > 2) flags.push("unnecessary_fatigue");
  if ((spec.goal === "strength" || spec.goal === "build_muscle_strength") && spec.trainingPhase !== "deload" && competitionAnchors === 0) flags.push("poor_specificity");
  if (spec.goal === "athletic_performance" && spec.recoveryFlag !== "poor" && !exercises.some((exercise) => exercise.delivery.preferred_delivery_type === "power_movement")) flags.push("poor_specificity");
  if (exercises.length >= 5 && uniqueDeliveryCount <= 2 && spec.trainingPhase !== "peak") flags.push("lack_of_variety");
  if (exercises.length > 6 || (spec.knownLimitations?.includes("time_limited") && exercises.length > 4)) flags.push("unnecessary_complexity");
  if (exercises.some((exercise) => Math.min(exercise.delivery.confidence, exercise.rep_prescription.confidence, exercise.load_prescription.confidence) < 58)) flags.push("low_confidence_session");
  if (exercises.some((exercise) => exercise.load_prescription.load_action === "increase_load" && spec.loadOwnership !== "owned" && spec.loadOwnership !== "stabilising")) flags.push("load_progression_without_ownership");
  if (exercises.some((exercise) => exercise.selected_exercise.includes("Deadlift") && (exercise.rep_prescription.prescription_type === "amrap" || (exercise.rep_prescription.target_reps ?? 0) > 8))) flags.push("deadlift_too_aggressive");
  if (exercises.some((exercise) => exercise.rep_prescription.prescription_type === "duration_hold" && exercise.load_prescription.load_action !== "no_external_load")) flags.push("duration_load_invalid");
  if (exercises.some((exercise) => exercise.selected_exercise === "Mystery Lift")) flags.push("questionable_exercise");

  return unique(flags);
}

function buildScenarios(): CoachingReviewScenario[] {
  const core: CoachingReviewScenario[] = [
    scenario("core_deload_deadlift", "Deload deadlift always recovery", "strength", "deload", "Competition Deadlift", "competition_deadlift", "hinge", "normal", "appropriate", "owned", 90, "high", 8, [5, 5], "high"),
    scenario("core_safety_peak_bench", "Safety blocks peak bench performance", "strength", "peak", "Competition Bench Press", "competition_bench", "horizontal_push", "good", "improving", "owned", 92, "high", 8, [3, 3], "moderate", true),
    scenario("core_athletic_power", "Athletic power movement", "athletic_performance", "accumulation", "Box Jump", "power", undefined, "normal", "appropriate", "stabilising", 80, "medium", 4, [3, 3], "moderate"),
    scenario("core_athletic_accessory", "Athletic accessory support", "athletic_performance", "accumulation", "Triceps Pushdown", "isolation", "isolation", "normal", "appropriate", "owned", 78, "medium", 5, [12, 11], "low"),
    scenario("core_deadlift_calibration", "Deadlift calibration stays capped", "strength", "accumulation", "Competition Deadlift", "competition_deadlift", "hinge", "normal", "unknown", "unknown", 52, "low", 0, [5, 5], "high"),
    scenario("core_strength_peak_owned", "Owned peak squat expression", "strength", "peak", "Competition Squat", "competition_squat", "squat", "good", "improving", "owned", 95, "high", 8, [2, 2], "high"),
    scenario("core_hypertrophy_isolation_good", "Hypertrophy isolation high recovery", "hypertrophy", "accumulation", "Lateral Raise", "isolation", "isolation", "good", "appropriate", "owned", 84, "medium", 5, [15, 14], "low"),
    scenario("core_hypertrophy_compound_limited", "Hypertrophy compound limited recovery", "hypertrophy", "accumulation", "Incline Dumbbell Press", "heavy_compound", "horizontal_push", "limited", "appropriate", "owned", 74, "medium", 5, [10, 9], "moderate"),
    scenario("core_get_lean_poor", "Get lean poor recovery", "get_lean", "accumulation", "Leg Press", "heavy_compound", "squat", "poor", "appropriate", "owned", 70, "medium", 5, [10, 9], "high"),
    scenario("core_maintenance_normal", "Maintenance normal row", "maintenance", "maintenance", "Chest Supported Row", "machine_compound", "horizontal_pull", "normal", "appropriate", "owned", 78, "medium", 5, [10, 10], "moderate"),
    scenario("core_underloaded_chest_press", "Underloaded chest press verification", "hypertrophy", "accumulation", "Chest Press", "machine_compound", "horizontal_push", "normal", "underloaded", "owned", 82, "medium", 5, [12, 12], "moderate"),
    scenario("core_low_exposure_press", "Low exposure overhead press calibration", "build_muscle_strength", "accumulation", "Standing Overhead Press", "standing_overhead_press", "vertical_push", "normal", "unknown", "unknown", 58, "low", 0, [8, 8], "moderate"),
    scenario("core_unstable_squat", "Unstable squat load should not progress", "strength", "intensification", "Competition Squat", "competition_squat", "squat", "normal", "plateau", "unstable", 76, "medium", 3, [4, 3], "high"),
    {
      ...scenario("core_large_jump_lateral_raise", "Large jump blocks lateral raise increase", "hypertrophy", "accumulation", "Lateral Raise", "isolation", "isolation", "good", "underloaded", "owned", 88, "medium", 7, [15, 15], "low"),
      currentLoad: 10,
      availableLoadJump: 5,
    },
  ];

  const matrixGoals: AdaptiveProgrammingGoal[] = ["strength", "hypertrophy", "build_muscle_strength", "athletic_performance", "get_lean", "maintenance"];
  const phases: AdaptiveTrainingPhase[] = ["accumulation", "intensification", "peak", "maintenance"];
  const exercises = [
    ["Competition Squat", "competition_squat", "squat", "high"],
    ["Competition Bench Press", "competition_bench", "horizontal_push", "moderate"],
    ["Competition Deadlift", "competition_deadlift", "hinge", "high"],
    ["Standing Overhead Press", "standing_overhead_press", "vertical_push", "moderate"],
    ["Barbell Row", "heavy_compound", "horizontal_pull", "moderate"],
    ["Chest Press", "machine_compound", "horizontal_push", "moderate"],
    ["Leg Extension", "isolation", "isolation", "low"],
    ["Box Jump", "power", undefined, "moderate"],
    ["Plank", "duration_bodyweight", "core", "low"],
  ] as const;

  const generated: CoachingReviewScenario[] = [];
  let index = 0;
  for (const goal of matrixGoals) {
    for (const phase of phases) {
      const exercise = exercises[index % exercises.length];
      const recovery = index % 11 === 0 ? "poor" : index % 5 === 0 ? "limited" : index % 3 === 0 ? "good" : "normal";
      const signal = index % 13 === 0 ? "overreached" : index % 7 === 0 ? "plateau" : index % 4 === 0 ? "underloaded" : index % 3 === 0 ? "improving" : "appropriate";
      const ownership = index % 6 === 0 ? "introduced" : index % 5 === 0 ? "stabilising" : index % 4 === 0 ? "unknown" : "owned";
      generated.push(
        scenario(
          `matrix_${String(index + 1).padStart(2, "0")}`,
          `${goal} ${phase} ${exercise[0]}`,
          goal,
          phase,
          exercise[0],
          exercise[1],
          exercise[2],
          recovery,
          signal,
          ownership,
          55 + (index % 40),
          index % 4 === 0 ? "low" : index % 3 === 0 ? "high" : "medium",
          index % 4 === 0 ? 0 : 3 + (index % 5),
          repsForExercise(exercise[1], signal),
          exercise[3],
        ),
      );
      index += 1;
    }
  }

  const situationScenarios: CoachingReviewScenario[] = [
    scenario("sit_new_machine_press", "New machine press", "hypertrophy", "accumulation", "Chest Press", "machine_compound", "horizontal_push", "normal", "unknown", "unknown", 50, "low", 0, [10, 10], "moderate"),
    scenario("sit_owned_bench", "Owned bench load", "strength", "intensification", "Competition Bench Press", "competition_bench", "horizontal_push", "good", "improving", "owned", 92, "high", 8, [5, 5], "moderate"),
    scenario("sit_introduced_squat", "Introduced squat load", "strength", "intensification", "Competition Squat", "competition_squat", "squat", "normal", "appropriate", "introduced", 78, "medium", 2, [4, 4], "high"),
    scenario("sit_stabilising_rdl", "Stabilising RDL", "build_muscle_strength", "accumulation", "Romanian Deadlift", "heavy_compound", "hinge", "normal", "appropriate", "stabilising", 76, "medium", 3, [8, 8], "high"),
    scenario("sit_underloaded_leg_ext", "Underloaded leg extension", "hypertrophy", "accumulation", "Leg Extension", "isolation", "isolation", "good", "underloaded", "owned", 88, "medium", 6, [12, 12], "low"),
    scenario("sit_plateau_row", "Barbell row plateau", "build_muscle_strength", "intensification", "Barbell Row", "heavy_compound", "horizontal_pull", "normal", "plateau", "owned", 82, "medium", 6, [8, 8], "moderate"),
    scenario("sit_improving_lat", "Lat pulldown improving", "hypertrophy", "accumulation", "Lat Pulldown", "machine_compound", "vertical_pull", "good", "improving", "owned", 86, "high", 7, [10, 10], "moderate"),
    scenario("sit_overreached_squat", "Overreached squat", "strength", "intensification", "Competition Squat", "competition_squat", "squat", "limited", "overreached", "owned", 80, "medium", 6, [3, 3], "high"),
    scenario("sit_poor_recovery_isolation", "Poor recovery cable curl", "hypertrophy", "accumulation", "Cable Curl", "isolation", "isolation", "poor", "appropriate", "owned", 80, "medium", 5, [12, 11], "low"),
    scenario("sit_good_recovery_isolation", "Good recovery cable curl", "hypertrophy", "accumulation", "Cable Curl", "isolation", "isolation", "good", "improving", "owned", 86, "medium", 5, [12, 12], "low"),
    scenario("sit_get_lean_good_bench", "Get lean good recovery bench", "get_lean", "intensification", "Competition Bench Press", "competition_bench", "horizontal_push", "good", "appropriate", "owned", 80, "high", 7, [5, 5], "moderate"),
    scenario("sit_get_lean_limited_leg_press", "Get lean limited leg press", "get_lean", "accumulation", "Leg Press", "heavy_compound", "squat", "limited", "appropriate", "owned", 74, "medium", 5, [10, 9], "high"),
    scenario("sit_power_speed_bench", "Speed bench athletic", "athletic_performance", "intensification", "Speed Bench", "power", "horizontal_push", "good", "appropriate", "owned", 84, "high", 6, [3, 3], "moderate"),
    scenario("sit_power_accessory_row", "Athletic row support", "athletic_performance", "intensification", "Chest Supported Row", "machine_compound", "horizontal_pull", "normal", "appropriate", "owned", 80, "medium", 5, [8, 8], "moderate"),
    scenario("sit_peak_deadlift_owned", "Peak deadlift owned", "strength", "peak", "Competition Deadlift", "competition_deadlift", "hinge", "good", "improving", "owned", 95, "high", 9, [2, 2], "high"),
    scenario("sit_peak_deadlift_not_owned", "Peak deadlift not owned", "strength", "peak", "Competition Deadlift", "competition_deadlift", "hinge", "normal", "appropriate", "introduced", 80, "medium", 2, [2, 2], "high"),
    scenario("sit_duration_plank", "Plank duration support", "maintenance", "maintenance", "Plank", "duration_bodyweight", "core", "normal", "appropriate", "owned", 78, "medium", 5, [45, 40], "low"),
    scenario("sit_dead_hang_new", "New dead hang", "athletic_performance", "accumulation", "Dead Hang", "duration_bodyweight", "carry", "normal", "unknown", "unknown", 56, "low", 0, [30, 30], "low"),
    scenario("sit_unsupported_fallback", "Unsupported mystery lift", "maintenance", "maintenance", "Mystery Lift", "unsupported", undefined, "normal", "unknown", "unknown", 45, "low", 0, [10, 10], "low"),
    scenario("sit_deload_lateral_raise", "Deload lateral raise", "hypertrophy", "deload", "Lateral Raise", "isolation", "isolation", "good", "underloaded", "owned", 84, "medium", 5, [12, 12], "low"),
    scenario("sit_build_strength_accessory", "Strength accessory triceps", "strength", "accumulation", "Triceps Pushdown", "isolation", "isolation", "normal", "appropriate", "owned", 78, "medium", 5, [12, 11], "low"),
    scenario("sit_hypertrophy_limited_hack", "Limited recovery heavy compound", "hypertrophy", "intensification", "Leg Press", "heavy_compound", "squat", "limited", "appropriate", "owned", 78, "medium", 5, [10, 9], "high"),
    scenario("sit_maintenance_peak_request", "Maintenance accidental peak phase", "maintenance", "peak", "Chest Press", "machine_compound", "horizontal_push", "good", "improving", "owned", 82, "high", 8, [10, 10], "moderate"),
    scenario("sit_bms_peak_bench", "Build muscle strength peak bench", "build_muscle_strength", "peak", "Competition Bench Press", "competition_bench", "horizontal_push", "good", "improving", "owned", 92, "high", 8, [2, 2], "moderate"),
    scenario("sit_bms_accessory_good", "Build muscle strength accessory", "build_muscle_strength", "accumulation", "Hamstring Curl", "isolation", "isolation", "good", "appropriate", "owned", 84, "medium", 5, [12, 12], "low"),
    scenario("sit_athletic_peak_throw", "Athletic peak medicine ball throw", "athletic_performance", "peak", "Medicine Ball Throw", "power", undefined, "good", "improving", "owned", 88, "high", 8, [3, 3], "moderate"),
    scenario("sit_overreached_get_lean", "Overreached get lean row", "get_lean", "intensification", "Chest Supported Row", "machine_compound", "horizontal_pull", "limited", "overreached", "owned", 76, "medium", 5, [8, 7], "moderate"),
    scenario("sit_plateau_lateral", "Plateau lateral raise", "hypertrophy", "accumulation", "Lateral Raise", "isolation", "isolation", "normal", "plateau", "owned", 82, "medium", 6, [12, 12], "low"),
    scenario("sit_unknown_farmer", "Unknown farmer carry", "athletic_performance", "accumulation", "Farmer Carry", "duration_bodyweight", "carry", "normal", "unknown", "unknown", 58, "low", 0, [40, 35], "moderate"),
    scenario("sit_compound_underloaded_limited", "Underloaded compound limited recovery", "hypertrophy", "intensification", "Incline Dumbbell Press", "heavy_compound", "horizontal_push", "limited", "underloaded", "owned", 72, "medium", 5, [12, 12], "moderate"),
    scenario("sit_strength_oihp_plateau", "Strength overhead press plateau", "strength", "intensification", "Standing Overhead Press", "standing_overhead_press", "vertical_push", "normal", "plateau", "owned", 82, "medium", 6, [5, 5], "moderate"),
    scenario("sit_maintenance_overreached", "Maintenance overreached", "maintenance", "maintenance", "Chest Press", "machine_compound", "horizontal_push", "poor", "overreached", "owned", 74, "medium", 5, [8, 7], "moderate"),
    scenario("sit_power_poor_recovery", "Power movement poor recovery", "athletic_performance", "accumulation", "Box Jump", "power", undefined, "poor", "appropriate", "owned", 74, "medium", 5, [3, 3], "moderate"),
    scenario("sit_squat_new_low_confidence", "New squat low confidence", "strength", "accumulation", "Competition Squat", "competition_squat", "squat", "normal", "unknown", "unknown", 55, "low", 0, [5, 5], "high"),
    scenario("sit_bench_stabilising_underload", "Bench stabilising underload", "strength", "intensification", "Competition Bench Press", "competition_bench", "horizontal_push", "normal", "underloaded", "stabilising", 84, "medium", 4, [5, 5], "moderate"),
    scenario("sit_leg_ext_high_recovery", "Leg extension high recovery", "hypertrophy", "intensification", "Leg Extension", "isolation", "isolation", "good", "improving", "owned", 90, "high", 8, [15, 15], "low"),
    scenario("sit_chest_press_plateau", "Chest press plateau", "hypertrophy", "intensification", "Chest Press", "machine_compound", "horizontal_push", "normal", "plateau", "owned", 86, "medium", 6, [10, 10], "moderate"),
    scenario("sit_get_lean_maintenance_plank", "Get lean maintenance plank", "get_lean", "maintenance", "Plank", "duration_bodyweight", "core", "normal", "appropriate", "owned", 76, "medium", 5, [40, 35], "low"),
    scenario("sit_bms_deadlift_accumulation", "Build muscle strength deadlift", "build_muscle_strength", "accumulation", "Competition Deadlift", "competition_deadlift", "hinge", "normal", "appropriate", "owned", 82, "medium", 6, [5, 5], "high"),
    scenario("sit_strength_row_accessory", "Strength row accessory", "strength", "accumulation", "Barbell Row", "heavy_compound", "horizontal_pull", "normal", "appropriate", "owned", 80, "medium", 5, [8, 8], "moderate"),
  ];

  return [...core, ...generated, ...situationScenarios].slice(0, 80);
}

function scenario(
  scenario_id: string,
  scenario_name: string,
  goal: AdaptiveProgrammingGoal,
  trainingPhase: AdaptiveTrainingPhase,
  exerciseName: string,
  exerciseCategory: AdaptiveExerciseCategory,
  movementPattern: MovementPattern | undefined,
  recoveryFlag: CycleRecoveryFlag,
  recentPerformanceSignal: RecentPerformanceSignal,
  loadOwnership: CycleLoadOwnership,
  evidenceConfidence: number,
  loadEstimateConfidence: "low" | "medium" | "high",
  exerciseExposureCount: number,
  completedSets: number[],
  fatigueCost: ExerciseFatigueCost,
  safetyFlag = false,
): CoachingReviewScenario {
  return {
    scenario_id,
    scenario_name,
    goal,
    trainingPhase,
    exerciseName,
    exerciseCategory,
    movementPattern,
    recoveryFlag,
    recentPerformanceSignal,
    loadOwnership,
    evidenceConfidence,
    loadEstimateConfidence,
    exerciseExposureCount,
    completedSets,
    fatigueCost,
    safetyFlag,
    currentLoad: exerciseCategory === "duration_bodyweight" ? 0 : exerciseCategory === "competition_deadlift" ? 180 : exerciseCategory === "competition_squat" ? 150 : 80,
    availableLoadJump: exerciseCategory === "competition_deadlift" || exerciseCategory === "competition_squat" ? 5 : 2.5,
    remainingExercises: fatigueCost === "high" ? 3 : 1,
    weekInBlock: trainingPhase === "peak" ? 6 : 2,
    blockLengthWeeks: 6,
    plannedTrainingDays: goal === "get_lean" ? 3 : 4,
    currentSessionIndex: 1,
  };
}

function repsForExercise(category: AdaptiveExerciseCategory, signal: RecentPerformanceSignal) {
  if (category === "duration_bodyweight") return [40, 35];
  if (category === "power") return [3, 3];
  if (category === "competition_deadlift") return signal === "underloaded" ? [5, 5] : [3, 3];
  if (category === "competition_squat" || category === "competition_bench") return [5, 5];
  if (category === "isolation") return signal === "underloaded" ? [15, 15] : [12, 11];
  return signal === "underloaded" ? [12, 12] : [10, 9];
}

function buildSetAllocationPreview(
  scenario: CoachingReviewScenario,
  settings: ProgressionSettings,
  repPrescription: AdaptiveRepPrescription,
) {
  const sets = (scenario.completedSets ?? []).map((reps, index) => work(index + 1, scenario.currentLoad ?? 0, reps));
  if (sets.length === 0) return null;

  return decideAdaptiveSetAllocation({
    exerciseName: scenario.exerciseName,
    settings,
    sets,
    currentLoad: scenario.currentLoad ?? 0,
    metadata: metadataForScenario(scenario),
    blockType: scenario.trainingPhase === "deload" ? "deload" : undefined,
    remainingExercises: scenario.remainingExercises,
    painOrSafetyFlag: scenario.safetyFlag,
    repPrescription,
  });
}

function settingsForScenario(scenario: CoachingReviewScenario): ProgressionSettings {
  const range = rangeForCategory(scenario.exerciseCategory);
  const isDuration = scenario.exerciseCategory === "duration_bodyweight";
  return {
    repRange: range,
    measurementType: isDuration ? "duration" : "reps",
    durationIncreaseSeconds: isDuration ? 5 : undefined,
    dropOffPercent: 15,
    loadIncrease: scenario.exerciseCategory === "competition_deadlift" ? 5 : 2.5,
    unit: DEFAULT_UNIT,
    requiredWorkSets: 2,
    recommendedMinSets: scenario.exerciseCategory === "power" ? 2 : 2,
    recommendedMaxSets: scenario.exerciseCategory === "competition_deadlift" ? 3 : scenario.exerciseCategory === "isolation" ? 5 : 4,
  };
}

function rangeForCategory(category: AdaptiveExerciseCategory) {
  if (category === "duration_bodyweight") return { min: 30, max: 45 };
  if (category === "power") return { min: 1, max: 3 };
  if (category === "competition_deadlift") return { min: 2, max: 5 };
  if (category === "competition_squat" || category === "competition_bench") return { min: 3, max: 6 };
  if (category === "isolation") return { min: 10, max: 15 };
  return { min: 8, max: 12 };
}

function metadataForScenario(scenario: CoachingReviewScenario): Pick<Exercise, "role" | "family" | "primaryMuscles" | "fatigueCost" | "movementPattern"> {
  return {
    role: roleForCategory(scenario.exerciseCategory),
    family: scenario.movementPattern === "hinge" ? "hip_hinge" : scenario.movementPattern === "squat" ? "squat_pattern" : scenario.movementPattern === "vertical_pull" ? "vertical_pull" : "other",
    primaryMuscles: scenario.movementPattern === "horizontal_push" ? ["chest"] : scenario.movementPattern === "squat" ? ["quads"] : scenario.movementPattern === "hinge" ? ["hamstrings"] : ["back"],
    fatigueCost: scenario.fatigueCost ?? "moderate",
    movementPattern: scenario.movementPattern ?? "isolation",
  };
}

function primaryMuscleForMovement(movementPattern: string): MuscleGroup {
  if (movementPattern === "horizontal_push" || movementPattern === "vertical_push") return "chest";
  if (movementPattern === "squat") return "quads";
  if (movementPattern === "hinge") return "hamstrings";
  if (movementPattern === "lunge") return "glutes";
  if (movementPattern === "core") return "abs";
  if (movementPattern === "isolation") return "shoulders";
  return "back";
}

function roleForCategory(category: AdaptiveExerciseCategory) {
  if (category === "isolation") return "isolation";
  if (category === "power") return "power";
  if (category === "duration_bodyweight") return "accessory";
  if (category === "machine_compound") return "secondary_compound";
  return "primary_compound";
}

function work(setNumber: number, load: number, reps: number): SetLog {
  return {
    id: `review-work-${setNumber}`,
    setNumber,
    load,
    reps,
    loggedAt: `2026-06-29T10:0${setNumber}:00.000Z`,
    type: "work",
  };
}

function reviewFlags(
  scenario: CoachingReviewScenario,
  cycle: CycleStrategyContext,
  session: SessionStrategyDecision,
  rep: AdaptiveRepPrescription,
  load: AdaptiveLoadPrescription,
  setPreview: AdaptiveSetDecision | null,
): CoachingReviewFlag[] {
  const flags: CoachingReviewFlag[] = [];
  const isDeadlift = scenario.exerciseCategory === "competition_deadlift" || scenario.exerciseName.toLowerCase().includes("deadlift");
  const isPowerMovement = scenario.exerciseCategory === "power";
  const isIsolation = scenario.exerciseCategory === "isolation";
  const isDuration = scenario.exerciseCategory === "duration_bodyweight";
  const isLoadedDuration = isDuration && /carry|farmer|suitcase/i.test(scenario.exerciseName);

  if (scenario.goal === "athletic_performance" && !isPowerMovement && session.coaching_bias === "speed_power") flags.push("questionable_power_bias");
  if (isDeadlift && (rep.prescription_type === "amrap" || (rep.target_reps ?? 0) > 8)) flags.push("deadlift_too_aggressive");
  if (isIsolation && (rep.target_reps ?? 10) <= 5 && rep.prescription_type === "fixed_reps") flags.push("isolation_too_heavy");
  if (scenario.goal === "hypertrophy" && scenario.trainingPhase !== "deload" && scenario.recoveryFlag === "good" && isIsolation && session.coaching_bias === "recovery") flags.push("hypertrophy_too_conservative");
  if (scenario.goal === "get_lean" && scenario.recoveryFlag === "poor" && (cycle.stress_budget_bias !== "conserve" || session.set_objective === "performance")) flags.push("get_lean_too_fatiguing");
  if (
    scenario.trainingPhase === "peak" &&
    scenario.goal === "strength" &&
    scenario.loadOwnership === "owned" &&
    scenario.recoveryFlag === "good" &&
    !scenario.safetyFlag &&
    session.set_objective !== "performance"
  ) {
    flags.push("peak_not_specific_enough");
  }
  if (scenario.trainingPhase === "deload" && (session.set_objective !== "recovery" || rep.set_objective !== "recovery" || setPreview?.action === "continue")) flags.push("deload_not_recovery_enough");
  if (isDeadlift && session.set_objective === "calibration" && rep.prescription_type === "amrap") flags.push("calibration_too_aggressive");
  if (isDeadlift && load.load_action === "increase_load" && ((load.suggested_change ?? 0) > (scenario.availableLoadJump ?? 5) || load.load_strategy === "small_progression")) {
    flags.push("deadlift_load_too_aggressive");
  }
  if (load.load_action === "increase_load" && scenario.loadOwnership !== "owned" && scenario.loadOwnership !== "stabilising") {
    flags.push("load_progression_without_ownership");
  }
  if (
    (scenario.trainingPhase === "deload" || scenario.recoveryFlag === "poor" || scenario.safetyFlag || rep.set_objective === "recovery") &&
    (load.load_action === "increase_load" || (load.load_strategy !== "recovery_load" && load.load_action !== "no_external_load"))
  ) {
    flags.push("recovery_load_not_conservative");
  }
  if (
    isPowerMovement &&
    rep.set_objective !== "recovery" &&
    scenario.recoveryFlag !== "poor" &&
    load.load_strategy !== "power_quality_load" &&
    load.load_action !== "no_external_load"
  ) {
    flags.push("power_load_not_quality_biased");
  }
  if (isDuration && !isLoadedDuration && load.load_action !== "no_external_load") flags.push("duration_load_invalid");
  if ((scenario.availableLoadJump ?? 0) >= Math.max(5, (scenario.currentLoad ?? 0) * 0.25) && load.load_action === "increase_load") flags.push("large_jump_forced");
  if (Math.min(cycle.confidence, session.confidence, rep.confidence) < 58) {
    const hasMetadataMapping = rep.debug_reasons.some((reason) => reason === "mapping provided_category" || reason === "mapping provided_archetype");
    flags.push(hasMetadataMapping ? "low_evidence_confidence" : "low_confidence_mapping");
  }
  if (load.confidence < 58) flags.push("low_confidence_load_mapping");
  if (scenario.exerciseCategory === "unsupported") flags.push("unsupported_fallback");
  if ((rep.set_objective !== session.set_objective || rep.coaching_bias !== session.coaching_bias) && !isIntentionalRepOverride(rep)) flags.push("rep_intent_mismatch");
  if (!repLoadIntentAligned(rep, load, isLoadedDuration)) flags.push("rep_load_intent_mismatch");

  return unique(flags);
}

function repLoadIntentAligned(rep: AdaptiveRepPrescription, load: AdaptiveLoadPrescription, isLoadedDuration: boolean) {
  if (rep.load_strategy === "recovery_load") return load.load_strategy === "recovery_load" || load.load_action === "no_external_load";
  if (rep.load_strategy === "quality_speed_load") return load.load_strategy === "power_quality_load";
  if (rep.load_strategy === "estimate_load") return load.load_strategy === "calibration_load" || load.load_action === "estimate_from_amrap" || load.load_action === "conservative_start";
  if (rep.prescription_type === "duration_hold") return load.load_action === "no_external_load";
  if (rep.prescription_type === "duration_carry") return isLoadedDuration || load.load_action === "no_external_load";
  if (rep.load_strategy === "heavier_specific_load") {
    return (
      load.load_strategy === "peak_specific_load" ||
      load.load_strategy === "small_progression" ||
      load.load_strategy === "conservative_progression" ||
      (load.load_action === "keep_load" && load.load_strategy === "owned_load")
    );
  }
  return true;
}

function hasLoadReviewFlag(record: CoachingReviewRecord) {
  return record.review_flags.some((flag) =>
    [
      "deadlift_load_too_aggressive",
      "load_progression_without_ownership",
      "recovery_load_not_conservative",
      "power_load_not_quality_biased",
      "duration_load_invalid",
      "large_jump_forced",
      "low_confidence_load_mapping",
      "rep_load_intent_mismatch",
    ].includes(flag),
  );
}

function isIntentionalRepOverride(rep: AdaptiveRepPrescription) {
  return rep.debug_reasons.some((reason) => reason.includes("intentionally overrides session intent"));
}

function isAaronReviewFlag(flag: CoachingReviewFlag) {
  return flag !== "low_evidence_confidence";
}

function expectedCheckFailures(records: CoachingReviewRecord[]) {
  const failures: string[] = [];
  const byId = new Map(records.map((record) => [record.scenario_id, record]));
  const assertCheck = (condition: boolean, label: string) => {
    if (!condition) failures.push(label);
  };

  assertCheck(records.filter((record) => record.input_summary.includes("phase deload")).every((record) => record.session_strategy.set_objective === "recovery"), "Deload always produces recovery intent.");
  assertCheck(byId.get("core_safety_peak_bench")?.session_strategy.set_objective !== "performance", "Safety/poor recovery blocks performance.");
  assertCheck(byId.get("core_athletic_power")?.session_strategy.coaching_bias === "speed_power", "Athletic Performance power movement gets speed/power intent.");
  assertCheck(byId.get("core_athletic_accessory")?.session_strategy.coaching_bias !== "speed_power", "Athletic Performance accessory does not get speed/power intent.");
  assertCheck(byId.get("core_deadlift_calibration")?.rep_prescription.prescription_type === "capped_amrap", "Deadlift calibration is capped/conservative.");
  assertCheck(byId.get("core_strength_peak_owned")?.session_strategy.set_objective === "performance", "Strength peak competition lift gets peak/performance-style prescription only when safe/owned.");
  assertCheck(byId.get("core_hypertrophy_isolation_good")?.session_strategy.coaching_bias === "metabolic", "Hypertrophy isolation can use metabolic bias.");
  assertCheck(byId.get("core_hypertrophy_compound_limited")?.session_strategy.coaching_bias !== "metabolic", "Hypertrophy compound with limited recovery avoids aggressive metabolic fatigue.");
  assertCheck(byId.get("core_get_lean_poor")?.cycle_strategy.stress_budget_bias === "conserve", "Get Lean with poor recovery conserves stress.");
  assertCheck(byId.get("core_maintenance_normal")?.session_strategy.set_objective !== "performance", "Maintenance does not become aggressive performance work.");
  assertCheck(byId.get("core_underloaded_chest_press")?.rep_prescription.prescription_type === "top_range_check", "Underloaded signal triggers verification/top-range logic.");
  assertCheck(byId.get("core_low_exposure_press")?.session_strategy.set_objective === "calibration", "Low exposure/low load confidence triggers calibration.");
  assertCheck(records.every((record) => !record.cycle_strategy.blocked_objectives.includes(record.session_strategy.set_objective) && !record.cycle_strategy.blocked_biases.includes(record.session_strategy.coaching_bias)), "Cycle context blocked objectives/biases are respected.");
  assertCheck(byId.get("core_deadlift_calibration")?.load_prescription.load_strategy === "calibration_load" && byId.get("core_deadlift_calibration")?.load_prescription.load_action !== "increase_load", "Deadlift calibration load stays conservative.");
  assertCheck(byId.get("sit_owned_bench")?.load_prescription.load_action === "increase_load" && byId.get("sit_owned_bench")?.load_prescription.load_strategy === "small_progression", "Owned improving bench can allow small progression.");
  assertCheck(byId.get("sit_introduced_squat")?.load_prescription.load_action !== "increase_load" && byId.get("core_unstable_squat")?.load_prescription.load_action !== "increase_load", "Introduced/unstable load does not aggressively progress.");
  assertCheck(byId.get("core_get_lean_poor")?.load_prescription.load_action !== "increase_load", "Poor recovery blocks load increase.");
  assertCheck(records.filter((record) => record.input_summary.includes("phase deload")).every((record) => record.load_prescription.load_strategy === "recovery_load" || record.load_prescription.load_action === "no_external_load"), "Deload uses recovery/conservative load.");
  assertCheck(byId.get("core_athletic_power")?.load_prescription.load_strategy === "power_quality_load", "Power movement uses quality load.");
  assertCheck(byId.get("sit_duration_plank")?.load_prescription.load_action === "no_external_load", "Duration plank has no external load.");
  assertCheck(byId.get("core_large_jump_lateral_raise")?.load_prescription.load_action !== "increase_load", "Large available jump blocks forced increase.");
  assertCheck(records.every((record) => !record.review_flags.includes("rep_load_intent_mismatch")), "Rep prescription and load prescription align.");

  return failures;
}

function coachingSummary(
  cycle: CycleStrategyContext,
  session: SessionStrategyDecision,
  rep: AdaptiveRepPrescription,
  load: AdaptiveLoadPrescription,
  setPreview: AdaptiveSetDecision | null,
) {
  const setText = setPreview ? `${setPreview.recommended_next} (${setPreview.short_reason})` : "no set preview";
  return `${cycle.macro_intent} -> ${session.set_objective}/${session.coaching_bias} -> ${rep.prescription_type} -> ${load.load_action}/${load.load_strategy} -> ${setText}`;
}

function inputSummary(scenario: CoachingReviewScenario) {
  return `${scenario.goal}, phase ${scenario.trainingPhase}, ${scenario.exerciseName}, recovery ${scenario.recoveryFlag ?? "normal"}, signal ${scenario.recentPerformanceSignal ?? "appropriate"}`;
}

function confidenceNumber(value: "low" | "medium" | "high" | undefined) {
  if (value === "low") return 45;
  if (value === "high") return 90;
  return 70;
}

function questionableDecisionLines(records: CoachingReviewRecord[]) {
  if (records.length === 0) return ["- None flagged."];
  return records.map((record) => `- ${record.scenario_id}: ${record.scenario_name} (${record.review_flags.join(", ")})`);
}

function scenarioGroupLines(records: CoachingReviewRecord[]) {
  const grouped = groupBy(records, (record) => record.input_summary.split(",")[0]);
  const lines: string[] = [];
  for (const [goal, goalRecords] of Object.entries(grouped)) {
    lines.push(`### ${goal}`);
    lines.push("");
    for (const record of goalRecords.slice(0, 12)) {
      lines.push(`- ${record.scenario_id}: ${record.scenario_name}`);
      lines.push(`  - Cycle: ${record.cycle_strategy.macro_intent}, ${record.cycle_strategy.stress_budget_bias}`);
      lines.push(`  - Session: ${record.session_strategy.set_objective}/${record.session_strategy.coaching_bias}`);
      lines.push(`  - Rep: ${record.rep_prescription.prescription_type}, ${record.rep_prescription.short_reason}`);
      lines.push(`  - Load: ${record.load_prescription.load_action}/${record.load_prescription.load_strategy}, ${record.load_prescription.short_reason}`);
      lines.push(`  - Review: ${record.coaching_summary}`);
      lines.push(`  - Flags: ${record.review_flags.length ? record.review_flags.join(", ") : "none"}`);
    }
    lines.push("");
  }
  return lines;
}

function sessionListLines(sessions: CompleteCoachingSessionReview[]) {
  if (sessions.length === 0) return ["- None flagged."];
  return sessions.map((session) => `- ${session.session_id}: ${session.session_name} (${session.review_flags.length ? session.review_flags.join(", ") : "clean"}, confidence ${session.confidence}%)`);
}

function completeSessionLines(sessions: CompleteCoachingSessionReview[]) {
  const grouped = groupBy(sessions, (session) => session.goal);
  const lines: string[] = [];
  for (const [goal, goalSessions] of Object.entries(grouped)) {
    lines.push(`### ${goal}`);
    lines.push("");
    for (const session of goalSessions) {
      lines.push(`#### ${session.session_name}`);
      lines.push("");
      lines.push(`- Session: ${session.sessionType}, ${session.trainingPhase}`);
      lines.push(`- Cycle: ${session.cycle_strategy.macro_intent}; ${session.cycle_strategy.stress_budget_bias}`);
      lines.push(`- Stimulus: ${session.stimulus_plan.short_reason}`);
      lines.push(`- Delivery: ${session.stimulus_delivery.short_reason}`);
      lines.push(`- Confidence: ${session.confidence}%`);
      lines.push(`- Flags: ${session.review_flags.length ? session.review_flags.join(", ") : "none"}`);
      lines.push("");
      lines.push("| Exercise | Stimulus | Delivery | Reps | Load | Sets | Why selected | Why reps | Why load | Why sets |");
      lines.push("| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |");
      for (const exercise of session.exercises) {
        lines.push(
          `| ${tableCell(exercise.selected_exercise)} | ${tableCell(exercise.stimulus_id)} | ${tableCell(exercise.delivery.preferred_delivery_type)} | ${tableCell(exercise.rep_prescription.short_reason)} | ${tableCell(exercise.load_prescription.short_reason)} | ${tableCell(exercise.set_allocation?.short_reason ?? "No set preview")} | ${tableCell(exercise.why_exercise_selected)} | ${tableCell(exercise.why_reps)} | ${tableCell(exercise.why_load)} | ${tableCell(exercise.why_sets)} |`,
        );
      }
      lines.push("");
    }
  }
  return lines;
}

function tableCell(value: string | number | boolean | null | undefined) {
  return String(value ?? "")
    .replace(/\|/g, "\\|")
    .replace(/\n/g, " ");
}

function groupBy<T>(values: T[], keyFn: (value: T) => string) {
  return values.reduce<Record<string, T[]>>((groups, value) => {
    const key = keyFn(value);
    groups[key] = groups[key] ?? [];
    groups[key].push(value);
    return groups;
  }, {});
}

function unique<T>(values: T[]) {
  return Array.from(new Set(values));
}
