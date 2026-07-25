import { mkdirSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { constructCanonicalActivePlanFromCanonicalInputs } from "@/application/training/canonical-active-plan-construction";
import { projectCanonicalActivePlan } from "@/application/training/canonical-active-plan-application";
import { canonicalPlanningInputRegistry } from "@/domain/training/canonical-adaptive-planning-system";
import {
  canonicalRepresentativeGoldenCases,
  constructGoldenProgramme,
} from "@/domain/training/canonical-adaptive-planning-certification";
import type { CanonicalSessionSnapshotV3 } from "@/domain/training/canonical-session-construction-pipeline";
import { evaluateCanonicalProgressV2 } from "@/domain/training/canonical-progress-evaluator";
import type { CanonicalProgressEvidence } from "@/domain/training/canonical-progress-evidence";
import type { CanonicalStartingVolumeContext } from "@/domain/training/canonical-hypertrophy-volume-policy";
import { resolveMesocyclePrescriptionPolicy } from "@/domain/training/mesocycle-prescription-policy";
import type { Equipment, ExperienceLevel, ProgrammeGoal } from "@/domain/training/models";
import { exerciseLibrary } from "@/domain/training/presets";
import type { PreferredSplit, TrainingSetupGoal } from "@/domain/training/plan-setup";

const CREATED_AT = "2026-07-25T08:00:00.000Z";
const FULL_GYM: readonly Equipment[] = ["barbell", "dumbbell", "machine", "cable", "bodyweight"];
const LIMITED_GYM: readonly Equipment[] = ["dumbbell", "bodyweight"];
const outputDirectory = fileURLToPath(new URL("./", import.meta.url));

type Scenario = Readonly<{
  id: string;
  athlete: string;
  weeks: 12 | 16;
  goal: TrainingSetupGoal;
  programmeGoal: ProgrammeGoal;
  experience: ExperienceLevel;
  days: 2 | 3 | 4 | 5 | 6;
  duration: 30 | 45 | 60 | 75 | 90;
  split: PreferredSplit;
  equipment: readonly Equipment[];
  limitations?: readonly string[];
  startingVolumeContext?: CanonicalStartingVolumeContext;
  evidencePattern:
    | "normal"
    | "high_response"
    | "stalled"
    | "poor_recovery"
    | "inconsistent"
    | "returning"
    | "pain"
    | "time_constrained"
    | "hypertrophy"
    | "strength_expression"
    | "powerbuilding"
    | "athletic_workload";
}>;

const scenarios: readonly Scenario[] = [
  { id: "normal-responder", athlete: "Normal responder", weeks: 12, goal: "build_muscle", programmeGoal: "hypertrophy", experience: "intermediate", days: 4, duration: 75, split: "upper_lower", equipment: FULL_GYM, evidencePattern: "normal" },
  { id: "high-responder", athlete: "High responder", weeks: 12, goal: "build_muscle", programmeGoal: "hypertrophy", experience: "advanced", days: 5, duration: 90, split: "push_pull_legs", equipment: FULL_GYM, startingVolumeContext: startingContext({ recovery: "high", history: "established_productive", workCapacity: "demonstrated_high", loadConfidence: "established", dosageConfidence: "canonical_productive_history", recentTrainingDaysPerWeek: 5, recentSessionWorkload: "high", recentSessionDurationMinutes: 90 }), evidencePattern: "high_response" },
  { id: "stalled-athlete", athlete: "Stalled athlete", weeks: 12, goal: "build_strength", programmeGoal: "strength_hypertrophy", experience: "intermediate", days: 4, duration: 75, split: "upper_lower", equipment: FULL_GYM, evidencePattern: "stalled" },
  { id: "poor-recovery-athlete", athlete: "Poor-recovery athlete", weeks: 12, goal: "build_muscle", programmeGoal: "hypertrophy", experience: "intermediate", days: 4, duration: 60, split: "upper_lower", equipment: FULL_GYM, startingVolumeContext: startingContext({ recovery: "low_acceptable" }), evidencePattern: "poor_recovery" },
  { id: "inconsistent-athlete", athlete: "Inconsistent athlete", weeks: 12, goal: "build_muscle", programmeGoal: "hypertrophy", experience: "intermediate", days: 3, duration: 60, split: "full_body", equipment: FULL_GYM, evidencePattern: "inconsistent" },
  { id: "returning-athlete", athlete: "Returning athlete", weeks: 12, goal: "build_muscle", programmeGoal: "hypertrophy", experience: "advanced", days: 3, duration: 60, split: "full_body", equipment: FULL_GYM, startingVolumeContext: startingContext({ continuity: "extended_layoff", recentTrainingDaysPerWeek: 0, recentSessionWorkload: "light", history: "established_productive", loadConfidence: "calibration_required", dosageConfidence: "low_after_layoff" }), evidencePattern: "returning" },
  { id: "pain-limitation-athlete", athlete: "Pain/limitation athlete", weeks: 12, goal: "build_muscle", programmeGoal: "hypertrophy", experience: "intermediate", days: 4, duration: 75, split: "upper_lower", equipment: FULL_GYM, limitations: ["exclude_exercise:ex-bench-press"], evidencePattern: "pain" },
  { id: "time-constrained-athlete", athlete: "Time-constrained athlete", weeks: 12, goal: "build_muscle", programmeGoal: "hypertrophy", experience: "intermediate", days: 3, duration: 45, split: "full_body", equipment: FULL_GYM, evidencePattern: "time_constrained" },
  { id: "advanced-five-day-hypertrophy", athlete: "Advanced five-day hypertrophy athlete", weeks: 16, goal: "build_muscle", programmeGoal: "hypertrophy", experience: "advanced", days: 5, duration: 90, split: "push_pull_legs", equipment: FULL_GYM, evidencePattern: "hypertrophy" },
  { id: "strength-expression-athlete", athlete: "Strength athlete approaching expression", weeks: 16, goal: "build_strength", programmeGoal: "strength_hypertrophy", experience: "advanced", days: 4, duration: 90, split: "upper_lower", equipment: FULL_GYM, evidencePattern: "strength_expression" },
  { id: "powerbuilding-athlete", athlete: "Powerbuilding athlete", weeks: 16, goal: "build_muscle_and_strength", programmeGoal: "strength_hypertrophy", experience: "intermediate", days: 5, duration: 90, split: "push_pull_legs", equipment: FULL_GYM, evidencePattern: "powerbuilding" },
  { id: "athletic-performance-athlete", athlete: "Athletic-performance athlete", weeks: 16, goal: "athletic_performance", programmeGoal: "hypertrophy", experience: "intermediate", days: 3, duration: 60, split: "full_body", equipment: FULL_GYM, startingVolumeContext: startingContext({ concurrentSport: "lower_body_loading" }), evidencePattern: "athletic_workload" },
] as const;

function startingContext(
  overrides: Partial<CanonicalStartingVolumeContext> = {},
): CanonicalStartingVolumeContext {
  return {
    continuity: "currently_training",
    recentTrainingDaysPerWeek: 3,
    recentSessionWorkload: "moderate",
    recentSessionDurationMinutes: 60,
    recovery: "ordinary",
    history: "none",
    workCapacity: "not_demonstrated",
    concurrentSport: "none",
    loadConfidence: "calibration_required",
    dosageConfidence: "declared_recent_training",
    ...overrides,
  };
}

function constructScenario(scenario: Scenario) {
  return constructCanonicalActivePlanFromCanonicalInputs({
    planId: `forensic:${scenario.id}`,
    createdAt: CREATED_AT,
    updatedAt: CREATED_AT,
    goal: scenario.programmeGoal,
    macrocycleGoal: scenario.goal,
    experienceLevel: scenario.experience,
    daysPerWeek: scenario.days,
    preferredSplit: scenario.split,
    equipment: scenario.equipment,
    units: "kg",
    availableSessionMinutes: scenario.duration,
    limitations: scenario.limitations,
    startingVolumeContext: scenario.startingVolumeContext,
    exercises: exerciseLibrary,
  });
}

function snapshotSummary(snapshot: CanonicalSessionSnapshotV3) {
  return {
    sessionId: snapshot.sessionId,
    role: snapshot.role,
    estimatedDurationMinutes: snapshot.estimatedDurationMinutes,
    exerciseCount: snapshot.slots.length,
    workingSets: snapshot.slots.reduce((sum, slot) => sum + (slot.settings.requiredSets ?? slot.settings.requiredWorkSets), 0),
    prescription: snapshot.slots.map((slot) => ({
      slotId: slot.slotId,
      exerciseId: slot.exerciseId,
      method: slot.method,
      sets: slot.settings.requiredSets ?? slot.settings.requiredWorkSets,
      targets: slot.exactTargets,
      restSeconds: slot.rest.seconds,
      loadState: slot.loadPrescription.state,
    })),
  };
}

function evidenceForWeek(
  scenario: Scenario,
  plan: ReturnType<typeof projectCanonicalActivePlan>,
  week: number,
  macrocycleId: string,
): CanonicalProgressEvidence[] {
  const performanceObservations: Record<string, string | number | boolean | null> = {
    completion: scenario.evidencePattern === "inconsistent" && week % 3 === 0 ? "partial" : "complete",
    performanceIndex:
      scenario.evidencePattern === "high_response" ? 100 + week * 2
        : scenario.evidencePattern === "stalled" ? 100
          : scenario.evidencePattern === "poor_recovery" ? 100 - week
            : 100 + week,
    dropOff: scenario.evidencePattern === "poor_recovery" || scenario.evidencePattern === "stalled",
    comparable: true,
  };
  if (scenario.evidencePattern === "pain" && week >= 2) performanceObservations.pain = true;
  if (scenario.evidencePattern === "athletic_workload") performanceObservations.sportWorkload = week < 7 ? "moderate" : "high";
  const base: CanonicalProgressEvidence = {
    schemaVersion: "canonical_progress_evidence_v1",
    evidenceId: `${scenario.id}:week:${week}:performance`,
    planId: plan.planId,
    planRevision: plan.revision,
    macrocycleId,
    mesocycleId: plan.mesocycle.id as CanonicalProgressEvidence["mesocycleId"],
    microcycleId: plan.microcycle.id,
    sessionId: plan.plannedSessions[0]?.id,
    slotId: String((plan.plannedSessions[0]?.snapshot.slots as { id?: string }[] | undefined)?.[0]?.id ?? "slot-0"),
    athleteId: scenario.id,
    observedAt: `2026-${String(Math.min(12, week + 1)).padStart(2, "0")}-01T08:00:00.000Z`,
    source: "forensic_synthetic_performed_work",
    kind: scenario.evidencePattern === "pain" && week >= 2 ? "pain" : "performance",
    observations: performanceObservations,
    evidenceVersion: "forensic_actual_shape_v1",
  };
  const items = [base];
  if (scenario.evidencePattern === "poor_recovery" || scenario.evidencePattern === "athletic_workload") {
    items.push({
      ...base,
      evidenceId: `${scenario.id}:week:${week}:readiness`,
      kind: "readiness",
      observations: {
        recovery: scenario.evidencePattern === "poor_recovery" ? "constrained" : "sport_workload_recorded",
        fatigue: scenario.evidencePattern === "poor_recovery" ? "systemic" : "variable",
      },
    });
  }
  return items;
}

function prescriptionFingerprint(plan: ReturnType<typeof projectCanonicalActivePlan>) {
  return JSON.stringify(plan.plannedSessions.map((session) => snapshotSummary(session.snapshot as CanonicalSessionSnapshotV3)));
}

function simulateScenario(scenario: Scenario) {
  const construction = constructScenario(scenario);
  if (construction.status !== "constructed") return { id: scenario.id, status: "construction_failed", reason: construction.reason };
  const plan = projectCanonicalActivePlan(construction.carrier);
  const policy = resolveMesocyclePrescriptionPolicy(construction.carrier.mesocycle.id, { goal: scenario.goal });
  if (policy.status !== "resolved") return { id: scenario.id, status: "policy_failed", reason: policy.reason };
  const baselineFingerprint = prescriptionFingerprint(plan);
  let evidence: CanonicalProgressEvidence[] = [];
  const weekly = Array.from({ length: scenario.weeks }, (_, index) => {
    const week = index + 1;
    evidence = [...evidence, ...evidenceForWeek(scenario, plan, week, construction.carrier.macrocycle.id)];
    const evaluation = evaluateCanonicalProgressV2({ plan, evidence, policy: policy.policy });
    return {
      week,
      phase: {
        macrocycleGoal: plan.macrocycle.goal,
        mesocycleId: plan.mesocycle.id,
        purpose: plan.mesocycle.purpose,
        microcycleId: plan.microcycle.id,
      },
      sessions: plan.plannedSessions.map((session) => ({ id: session.id, role: session.role })),
      exactPrescriptionFingerprint: baselineFingerprint,
      inputEvidenceIds: evidenceForWeek(scenario, plan, week, construction.carrier.macrocycle.id).map((item) => item.evidenceId),
      interpretedOutcomeIfPureEvaluatorWereCalled: evaluation.outcome,
      interpretedReasonIfPureEvaluatorWereCalled: evaluation.reason,
      productionAdaptation: "none",
      productionAdaptationReason: "mounted_production_records_evidence_but_has_no_evaluator_decision_application_caller",
      userFacingExplanation: "none_for_future_prescription_change",
    };
  });
  const repeat = constructScenario(scenario);
  const deterministic = repeat.status === "constructed"
    && prescriptionFingerprint(projectCanonicalActivePlan(repeat.carrier)) === baselineFingerprint;
  return {
    id: scenario.id,
    athlete: scenario.athlete,
    status: "executed",
    weeks: scenario.weeks,
    construction: {
      planId: plan.planId,
      macrocycle: plan.macrocycle,
      mesocycle: plan.mesocycle,
      microcycle: plan.microcycle,
      sessions: plan.plannedSessions.map((session) => snapshotSummary(session.snapshot as CanonicalSessionSnapshotV3)),
    },
    deterministic,
    randomSeed: "Session Construction seed is deterministic planId + session index; no random material decision observed.",
    productionLoopClosed: false,
    weekly,
  };
}

function comparableSummary(result: ReturnType<typeof constructGoldenProgramme>) {
  if (result.status !== "constructed") return { status: result.status, reason: "reason" in result ? result.reason : "unknown" };
  return {
    status: result.status,
    macrocycle: result.authority.macrocycle,
    mesocycle: result.authority.mesocycle,
    rotation: result.rotation,
    sessions: result.sessions.map((session) => ({
      role: session.role,
      workingSets: session.workingSets,
      estimatedMinutes: session.estimatedMinutes,
      exercises: session.exercises.map((exercise) => ({
        exerciseId: exercise.exerciseId,
        workingSets: exercise.workingSets,
        exactReps: exercise.exactReps,
        method: exercise.method,
        loadState: exercise.loadState,
      })),
    })),
  };
}

function golden(id: string) {
  const match = canonicalRepresentativeGoldenCases.find((item) => item.id === id);
  if (!match) throw new Error(`missing_golden_case:${id}`);
  return comparableSummary(constructGoldenProgramme(match));
}

function directPair(
  id: string,
  changedInput: string,
  left: Scenario,
  right: Scenario,
  expected: string,
) {
  const a = constructScenario(left);
  const b = constructScenario(right);
  const leftSummary = a.status === "constructed" ? comparablePlan(a.carrier) : { status: a.status, reason: a.reason };
  const rightSummary = b.status === "constructed" ? comparablePlan(b.carrier) : { status: b.status, reason: b.reason };
  return {
    id,
    changedInput,
    expected,
    left: leftSummary,
    right: rightSummary,
    actualDifference: JSON.stringify(leftSummary) === JSON.stringify(rightSummary) ? "none" : "material_output_changed",
  };
}

function comparablePlan(carrier: Extract<ReturnType<typeof constructScenario>, { status: "constructed" }>["carrier"]) {
  const plan = projectCanonicalActivePlan(carrier);
  return {
    status: "constructed",
    macrocycleGoal: plan.macrocycle.goal,
    mesocycleId: plan.mesocycle.id,
    purpose: plan.mesocycle.purpose,
    trainingDays: plan.microcycle.trainingDays,
    roles: plan.microcycle.sessionRoles,
    sessions: plan.plannedSessions.map((session) => {
      const snapshot = session.snapshot as CanonicalSessionSnapshotV3;
      return {
        role: snapshot.role,
        estimatedDurationMinutes: snapshot.estimatedDurationMinutes,
        exerciseCount: snapshot.slots.length,
        workingSets: snapshot.slots.reduce((sum, slot) => sum + (slot.settings.requiredSets ?? slot.settings.requiredWorkSets), 0),
        prescription: snapshot.slots.map((slot) => ({
          exerciseId: slot.exerciseId,
          method: slot.method,
          sets: slot.settings.requiredSets ?? slot.settings.requiredWorkSets,
          targets: slot.exactTargets,
          restSeconds: slot.rest.seconds,
          loadState: slot.loadPrescription.state,
        })),
      };
    }),
  };
}

function deriveCounterfactuals() {
  const base = scenarios[0]!;
  return [
    directPair("beginner-vs-advanced", "experience", { ...base, id: "cf-beginner", experience: "beginner", programmeGoal: "beginner_hypertrophy" }, { ...base, id: "cf-advanced", experience: "advanced" }, "dosage and method eligibility should change"),
    directPair("hypertrophy-vs-strength", "goal", { ...base, id: "cf-hypertrophy" }, { ...base, id: "cf-strength", goal: "build_strength", programmeGoal: "strength_hypertrophy" }, "strategy, mesocycle and prescription should change"),
    directPair("three-vs-five-days", "days_per_week", { ...base, id: "cf-three", days: 3, split: "full_body" }, { ...base, id: "cf-five", days: 5, split: "push_pull_legs" }, "rotation and distribution should change"),
    directPair("45-vs-90-minutes", "session_duration_constraint", { ...base, id: "cf-45", days: 3, split: "full_body", duration: 45 }, { ...base, id: "cf-90", days: 3, split: "full_body", duration: 90 }, "bounded per-session dosage should change or fail closed"),
    directPair("good-vs-poor-recovery-at-construction", "starting_recovery", { ...base, id: "cf-recovery", startingVolumeContext: startingContext({ recovery: "high" }) }, { ...base, id: "cf-recovery", startingVolumeContext: startingContext({ recovery: "low_acceptable" }) }, "initial recovery should change bounded starting dosage"),
    directPair("consistent-vs-missed-sessions", "adherence", { ...base, id: "cf-consistent" }, { ...base, id: "cf-missed" }, "future schedule should reflow after evidence; production construction does not consume this evidence"),
    directPair("full-vs-limited-equipment", "equipment", { ...base, id: "cf-full" }, { ...base, id: "cf-limited", equipment: LIMITED_GYM }, "exercise selection should change while slot coverage remains"),
    directPair("no-pain-vs-limitation", "limitations", { ...base, id: "cf-limitation" }, { ...base, id: "cf-limitation", limitations: ["exclude_exercise:ex-decline-barbell-bench"] }, "the selected chest press must be replaced while the owned slot remains"),
    directPair("ppl-vs-no-preference", "framework_preference", { ...base, id: "cf-ppl", days: 5, split: "push_pull_legs" }, { ...base, id: "cf-auto", days: 5, split: "let_app_choose" }, "preference may affect framework only within compatibility"),
    {
      id: "adequate-evidence-vs-first-exposure",
      changedInput: "established_loads",
      expected: "load state should change from calibration_required to established",
      left: golden("no-load-history"),
      right: golden("established-loads"),
      actualDifference: "material_output_changed",
    },
    {
      id: "stable-vs-excessive-drop-off",
      changedInput: "rep_drop_off",
      expected: "set-local stop/evidence should differ; production future prescription should change only after an approved intervention",
      actualDifference: "actual-shaped evidence differs, but mounted production produces no future intervention",
      classification: "fake_personalisation_longitudinally",
    },
    {
      id: "ordinary-vs-deload",
      changedInput: "cycle_state",
      expected: "approved deload successor should change purpose and prescription",
      actualDifference: "unexercisable from mounted evidence because no production evaluator/decision caller creates the transition",
      classification: "production_loop_gap",
    },
    {
      id: "accumulation-vs-intensification",
      changedInput: "mesocycle",
      expected: "rep/load/method emphasis should change",
      actualDifference: "pure policy library differs, but initial construction always selects the first eligible mesocycle and mounted production does not advance it",
      classification: "unmounted_successor_application",
    },
  ];
}

const executed = scenarios.map(simulateScenario);
const rerun = scenarios.map(simulateScenario);
const semanticDeterminism = JSON.stringify(executed) === JSON.stringify(rerun);
const longitudinal = {
  schemaVersion: "coaching_system_longitudinal_results_v1",
  generatedAt: CREATED_AT,
  executionMode: "isolated_pure_functions_no_repository_or_cloud_mutation",
  scenarios: executed,
  allInitialConstructionsSucceeded: executed.every((item) => item.status === "executed"),
  deterministicAcrossIdenticalRuns: semanticDeterminism,
  productionLoopClosedInAnyScenario: false,
  limitation: "The harness invokes production pure construction and the pure evaluator for diagnosis. It does not invent a mounted evaluator/producer/application path that production lacks.",
};

const scenarioManifest = {
  schemaVersion: "coaching_system_longitudinal_scenarios_v1",
  generatedAt: CREATED_AT,
  isolation: "pure in-memory construction; no repositories, cloud, user data, or mutation",
  scenarios,
};

const counterfactuals = {
  schemaVersion: "coaching_system_counterfactual_results_v1",
  generatedAt: CREATED_AT,
  pairs: deriveCounterfactuals(),
};

const inputSnapshot = {
  schemaVersion: "coaching_system_input_registry_snapshot_v1",
  generatedAt: CREATED_AT,
  registryCount: canonicalPlanningInputRegistry.length,
  registry: canonicalPlanningInputRegistry,
};

type InputClassification =
  | "materially_changes_production_programming"
  | "changes_only_presentation"
  | "stored_but_unused"
  | "collected_but_unreachable"
  | "duplicated_by_another_input"
  | "converted_incorrectly"
  | "silently_defaulted"
  | "overridden_later"
  | "used_only_in_tests_or_documentation";

const inputAudit: readonly Readonly<{
  id: string;
  meaningfulProgrammingInput: boolean;
  classification: InputClassification;
  productionDecision: string;
  proof: string;
  counterfactual: string;
}>[] = [
  { id: "goal", meaningfulProgrammingInput: true, classification: "materially_changes_production_programming", productionDecision: "Macrocycle strategy, first Mesocycle, Microcycle roles, exact prescription", proof: "onboarding.tsx → constructCanonicalActivePlanFromCanonicalInputs → createMacrocycle/selectMesocycles/createMicrocycle/constructCanonicalSession", counterfactual: "hypertrophy-vs-strength" },
  { id: "target_date", meaningfulProgrammingInput: true, classification: "materially_changes_production_programming", productionDecision: "rolling versus fixed Macrocycle horizon and timeline validation", proof: "training commitment targetDate reaches createMacrocycle and validateMacrocycleTimeline", counterfactual: "repository golden fixed-horizon cases" },
  { id: "event_type", meaningfulProgrammingInput: true, classification: "collected_but_unreachable", productionDecision: "No independent production programming decision after compatibility filtering", proof: "onboarding event type selects/validates target context but is absent from CanonicalGeneratedPlanInput", counterfactual: "same goal/date with different compatible event type reaches the same canonical construction command" },
  { id: "experience", meaningfulProgrammingInput: true, classification: "materially_changes_production_programming", productionDecision: "Mesocycle eligibility, volume band, method eligibility, exercise suitability", proof: "experienceLevel reaches all canonical construction owners", counterfactual: "beginner-vs-advanced" },
  { id: "recent_consistency", meaningfulProgrammingInput: true, classification: "materially_changes_production_programming", productionDecision: "initial re-entry or current-training dosage", proof: "continuity is normalized and passed in startingVolumeContext", counterfactual: "returning-athlete versus normal-responder construction" },
  { id: "recent_training_frequency", meaningfulProgrammingInput: true, classification: "materially_changes_production_programming", productionDecision: "bounded initial regional volume", proof: "recentTrainingDaysPerWeek reaches resolveCanonicalHypertrophyStartingVolume", counterfactual: "canonical starting-volume policy cases" },
  { id: "recent_session_workload", meaningfulProgrammingInput: true, classification: "materially_changes_production_programming", productionDecision: "bounded initial regional volume", proof: "recentSessionWorkload reaches resolveCanonicalHypertrophyStartingVolume", counterfactual: "canonical starting-volume policy cases" },
  { id: "available_days", meaningfulProgrammingInput: true, classification: "materially_changes_production_programming", productionDecision: "Microcycle frequency, session roles, scheduling and dose distribution", proof: "daysPerWeek reaches createMicrocycle and volume allocation", counterfactual: "three-vs-five-days" },
  { id: "available_workout_duration", meaningfulProgrammingInput: true, classification: "materially_changes_production_programming", productionDecision: "bounded per-session dosage and feasibility", proof: "availableSessionMinutes reaches allocation and exact-duration validation", counterfactual: "45-vs-90-minutes" },
  { id: "framework_preference", meaningfulProgrammingInput: true, classification: "materially_changes_production_programming", productionDecision: "compatible Microcycle framework, roles and exercise delivery", proof: "selected PreferredSplit reaches createMicrocycle; phase authority may morph it", counterfactual: "five-day framework certification; PPL-vs-auto resolves identically where PPL is the recommendation" },
  { id: "commitment", meaningfulProgrammingInput: true, classification: "duplicated_by_another_input", productionDecision: "Only changes programming through targetDate/rolling representation", proof: "TrainingCommitment is normalized before canonical construction; no independent commitment field remains", counterfactual: "rolling versus fixed target date" },
  { id: "equipment", meaningfulProgrammingInput: true, classification: "silently_defaulted", productionDecision: "Exercise candidate filtering when a real list is supplied", proof: "onboarding.tsx hardcodes the full equipment catalogue in both probe and commit", counterfactual: "full-vs-limited-equipment proves the engine can respond, not that onboarding collects it" },
  { id: "movement_preferences", meaningfulProgrammingInput: true, classification: "collected_but_unreachable", productionDecision: "No mounted collection or canonical writer found", proof: "no onboarding/settings movement-preference field reaches construction", counterfactual: "unavailable" },
  { id: "disliked_exercises", meaningfulProgrammingInput: true, classification: "collected_but_unreachable", productionDecision: "Exercise selection changes only if an ExercisePreferenceRecord is directly supplied", proof: "pure construction supports exercisePreferences; mounted substitution does not persist a learned preference into reconstruction facts", counterfactual: "canonical preference unit test only" },
  { id: "custom_exercises", meaningfulProgrammingInput: true, classification: "materially_changes_production_programming", productionDecision: "Catalogue candidate pool and exercise selection", proof: "customExerciseRepository is the reconstruction catalogue; valid metadata participates in Session Construction", counterfactual: "custom movement certification cases" },
  { id: "limitations", meaningfulProgrammingInput: true, classification: "collected_but_unreachable", productionDecision: "Typed exclusions change exercise selection only when directly supplied", proof: "onboarding does not collect limitations; resolveCanonicalConstructionFacts reconstructs limitations as []", counterfactual: "no-pain-vs-limitation proves pure construction, while future reconstruction loses the fact" },
  { id: "pain_during_training", meaningfulProgrammingInput: true, classification: "collected_but_unreachable", productionDecision: "No mounted Train pain entry was found that creates a future Progress intervention", proof: "pain policies and evaluators exist, but mounted Train records performed work/completion only", counterfactual: "pain longitudinal scenario reaches review only because the harness manually supplies pain evidence" },
  { id: "units", meaningfulProgrammingInput: false, classification: "changes_only_presentation", productionDecision: "Display conversion", proof: "kg/lb metamorphic construction preserves physiological prescription", counterfactual: "canonical unit metamorphic test" },
  { id: "load_increment_profile", meaningfulProgrammingInput: true, classification: "stored_but_unused", productionDecision: "No mounted future-load adjustment is authorised", proof: "load policy requires equipment rounding but ends manual_review_required; construction command does not carry AppSettings increment profile", counterfactual: "no automatic numeric load outcome exists" },
  { id: "established_loads", meaningfulProgrammingInput: true, classification: "converted_incorrectly", productionDecision: "Established versus calibration load state when correct evidence is directly supplied", proof: "resolveCanonicalConstructionFacts keys loads by slotId and omits loadEvidence while Session Construction resolves by exerciseId plus matching evidence", counterfactual: "adequate-evidence-vs-first-exposure proves direct input; production reconstruction cannot reproduce it" },
  { id: "performed_work", meaningfulProgrammingInput: true, classification: "stored_but_unused", productionDecision: "Creates immutable Progress evidence and presentation history, but no mounted future-prescription decision", proof: "completeActiveSession records evidence; mounted Progress only projects it", counterfactual: "all longitudinal scenarios" },
  { id: "target_achievement", meaningfulProgrammingInput: true, classification: "stored_but_unused", productionDecision: "No mounted progression qualification", proof: "performed reps/completion are evidence facts; no mounted evaluator/producer/application caller consumes them", counterfactual: "normal versus high responder produces identical future prescriptions" },
  { id: "adherence_and_missed_sessions", meaningfulProgrammingInput: true, classification: "stored_but_unused", productionDecision: "Pure Microcycle reflow exists, but mounted completion/history does not invoke it", proof: "reflowCanonicalMicrocycleAfterMissedSession has tests and no mounted caller", counterfactual: "consistent-vs-missed-sessions" },
  { id: "performance_trend", meaningfulProgrammingInput: true, classification: "changes_only_presentation", productionDecision: "Progress dashboard trend/highlight presentation", proof: "canonical-progress-presentation derives trends; no mounted decision production follows", counterfactual: "stable versus improving history affects display, not prescription" },
  { id: "rep_drop_off", meaningfulProgrammingInput: true, classification: "stored_but_unused", productionDecision: "A stop rule is embedded in snapshots, but no mounted evidence-to-future-dose application is proven", proof: "volume/drop-off policies are pure and test-covered; production decision chain is unmounted", counterfactual: "stable-vs-excessive-drop-off" },
  { id: "fatigue_readiness", meaningfulProgrammingInput: true, classification: "collected_but_unreachable", productionDecision: "Recovery policy can return bounded review when called", proof: "mounted Train/Progress has no factual readiness entry → policy → persisted intervention chain", counterfactual: "poor-recovery longitudinal scenario" },
  { id: "recovery_cardio_preference", meaningfulProgrammingInput: true, classification: "materially_changes_production_programming", productionDecision: "Canonical conditioning prescription and presentation", proof: "onboarding setting reaches resolveCanonicalCardioPrescription", counterfactual: "recommended/minimal/off policy tests" },
  { id: "perceived_recovery_at_onboarding", meaningfulProgrammingInput: true, classification: "materially_changes_production_programming", productionDecision: "Initial volume only", proof: "perceivedRecovery reaches startingVolumeContext.recovery and volume allocation", counterfactual: "good-vs-poor-recovery-at-construction" },
  { id: "sport_workload", meaningfulProgrammingInput: true, classification: "materially_changes_production_programming", productionDecision: "Initial lower-body starting volume when declared during onboarding", proof: "concurrentSport reaches startingVolumeContext; later workload evidence has no mounted adaptation chain", counterfactual: "athletic-performance scenario versus otherwise equivalent no-sport construction" },
  { id: "body_metrics", meaningfulProgrammingInput: false, classification: "stored_but_unused", productionDecision: "No coaching prescription decision", proof: "registry explicitly limits body metrics to evidence/presentation; no construction consumer", counterfactual: "none expected" },
  { id: "active_cycle_state", meaningfulProgrammingInput: true, classification: "materially_changes_production_programming", productionDecision: "Current authoritative plan/session identity and immutable prescriptions", proof: "Home, Plan, Train and Progress hydrate the canonical carrier/read model", counterfactual: "initial goal/phase constructions" },
  { id: "previous_mesocycles", meaningfulProgrammingInput: true, classification: "stored_but_unused", productionDecision: "Lineage/successor validation exists, but no mounted transition decision is produced", proof: "cycleLineage is persisted; transition evaluator/producer/application has no mounted caller", counterfactual: "accumulation-vs-intensification" },
];

const meaningfulInputs = inputAudit.filter((entry) => entry.meaningfulProgrammingInput);
const materiallyEffectiveInputs = meaningfulInputs.filter((entry) => entry.classification === "materially_changes_production_programming");
const inputUtilisation = {
  schemaVersion: "coaching_system_input_utilisation_matrix_v1",
  generatedAt: CREATED_AT,
  methodology: "A field counts as effective only when an executable mounted production path can change a coaching output. Pure/test-only capability is not counted.",
  totalInputsAudited: inputAudit.length,
  meaningfulProgrammingInputs: meaningfulInputs.length,
  materiallyEffectiveProgrammingInputs: materiallyEffectiveInputs.length,
  meaningfulInputUtilisationPercent: Number(((materiallyEffectiveInputs.length / meaningfulInputs.length) * 100).toFixed(1)),
  entries: inputAudit,
};

mkdirSync(outputDirectory, { recursive: true });
writeFileSync(`${outputDirectory}/longitudinal-scenarios.json`, `${JSON.stringify(scenarioManifest, null, 2)}\n`);
writeFileSync(`${outputDirectory}/longitudinal-results.json`, `${JSON.stringify(longitudinal, null, 2)}\n`);
writeFileSync(`${outputDirectory}/counterfactual-results.json`, `${JSON.stringify(counterfactuals, null, 2)}\n`);
writeFileSync(`${outputDirectory}/canonical-input-registry-snapshot.json`, `${JSON.stringify(inputSnapshot, null, 2)}\n`);
writeFileSync(`${outputDirectory}/input-utilisation-matrix.json`, `${JSON.stringify(inputUtilisation, null, 2)}\n`);
process.stdout.write(`${JSON.stringify({
  scenarios: executed.length,
  constructionsPassed: executed.filter((item) => item.status === "executed").length,
  deterministicAcrossIdenticalRuns: semanticDeterminism,
  productionLoopClosed: false,
  counterfactualPairs: counterfactuals.pairs.length,
  inputUtilisation: `${materiallyEffectiveInputs.length}/${meaningfulInputs.length} (${inputUtilisation.meaningfulInputUtilisationPercent}%)`,
}, null, 2)}\n`);
