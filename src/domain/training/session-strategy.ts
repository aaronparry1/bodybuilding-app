import type { MovementPattern } from "@/domain/training/models";
import type { CycleStrategyContext } from "@/domain/training/cycle-strategy-context";
import type {
  AdaptiveCoachingBias,
  AdaptiveExerciseArchetype,
  AdaptiveExerciseCategory,
  AdaptiveProgrammingGoal,
  AdaptiveSetObjective,
  AdaptiveTrainingPhase,
  RecentPerformanceSignal,
} from "@/domain/training/adaptive-rep-prescription";

export type SessionRecoveryFlag = "good" | "normal" | "limited" | "poor";
export type SessionLoadEstimateConfidence = "low" | "medium" | "high";
export type LoadOwnershipState = "unknown" | "introduced" | "unstable" | "stabilising" | "owned";

export interface SessionStrategyContext {
  goal: AdaptiveProgrammingGoal;
  exerciseName: string;
  exerciseArchetype?: AdaptiveExerciseArchetype;
  exerciseCategory?: AdaptiveExerciseCategory;
  movementPattern?: MovementPattern;
  trainingPhase: AdaptiveTrainingPhase;
  recoveryFlag?: SessionRecoveryFlag;
  recentPerformanceSignal?: RecentPerformanceSignal;
  loadEstimateConfidence?: SessionLoadEstimateConfidence;
  exerciseExposureCount?: number;
  loadOwnership?: LoadOwnershipState;
  safetyFlag?: boolean;
  cycleStrategyContext?: CycleStrategyContext;
}

export interface SessionStrategyDecision {
  set_objective: AdaptiveSetObjective;
  coaching_bias: AdaptiveCoachingBias;
  confidence: number;
  short_reason: string;
  debug_reasons: string[];
}

type MappingSource = "provided_archetype" | "provided_category" | "movement_pattern" | "name" | "fallback";

const SHORT_REASON_LIMIT = 80;
const COMPETITION_LIFTS = new Set(["competition squat", "competition bench press", "competition deadlift"]);
const PRIMARY_COMPOUNDS = new Set(["standing overhead press", "barbell row", "incline dumbbell press", "leg press", "romanian deadlift"]);
const MACHINE_COMPOUNDS = new Set(["chest press", "lat pulldown", "chest supported row"]);
const ISOLATIONS = new Set(["leg extension", "hamstring curl", "lateral raise", "cable curl", "triceps pushdown"]);
const POWER_EXERCISES = new Set(["box jump", "medicine ball throw", "speed squat", "speed bench"]);
const DURATION_BODYWEIGHT = new Set(["plank", "dead hang", "farmer carry"]);

export function decideSessionStrategy(context: SessionStrategyContext): SessionStrategyDecision {
  const mapping = resolveExerciseMapping(context);
  const recovery = context.recoveryFlag ?? "normal";
  const performanceSignal = context.recentPerformanceSignal ?? "appropriate";
  const loadConfidence = context.loadEstimateConfidence ?? "medium";
  const ownership = context.loadOwnership ?? "unknown";
  const exposureCount = context.exerciseExposureCount ?? 3;
  const debug = [
    `goal ${context.goal}`,
    `phase ${context.trainingPhase}`,
    `archetype ${mapping.archetype}`,
    `mapping ${mapping.source}`,
    `recovery ${recovery}`,
    `signal ${performanceSignal}`,
    `load confidence ${loadConfidence}`,
    `ownership ${ownership}`,
    `exposures ${exposureCount}`,
  ];

  if (context.safetyFlag) {
    return decision(context, "recovery", "recovery", 92, "Safety flag. Keep it recovery focused.", [
      ...debug,
      "safety flag overrides normal intent",
    ]);
  }

  if (context.trainingPhase === "deload" || recovery === "poor" || performanceSignal === "overreached") {
    return decision(context, "recovery", "recovery", 88, "Recovery-focused work today.", [
      ...debug,
      "deload, poor recovery, or overreached signal selected recovery intent",
    ]);
  }

  if (context.trainingPhase === "peak" && canUsePerformanceIntent({ context, recovery, loadConfidence, ownership })) {
    return decision(context, "performance", "peak", 82, "Performance expression.", [
      ...debug,
      "peak phase with owned load and acceptable recovery",
    ]);
  }

  if (shouldCalibrate({ context, mappingSource: mapping.source, loadConfidence, performanceSignal, exposureCount })) {
    return decision(context, "calibration", biasForGoal(context, mapping.archetype, recovery), confidenceBase(mapping.source, 70), "Calibrate before pushing.", [
      ...debug,
      "low confidence, low exposure, or unknown evidence selected calibration",
      ...(isHighRisk(context, mapping.archetype) ? ["high-risk lift leaves AMRAP choice to rep engine safeguards"] : []),
    ]);
  }

  if (shouldVerify({ performanceSignal, ownership, recovery })) {
    return decision(context, "verification", biasForGoal(context, mapping.archetype, recovery), confidenceBase(mapping.source, 78), "Verify the prescription.", [
      ...debug,
      "underload, plateau, or load ownership uncertainty selected verification",
    ]);
  }

  return decision(context, "productive", biasForGoal(context, mapping.archetype, recovery), confidenceBase(mapping.source, 76), "Productive work.", [
    ...debug,
    "normal evidence selected productive intent",
  ]);
}

function canUsePerformanceIntent({
  context,
  recovery,
  loadConfidence,
  ownership,
}: {
  context: SessionStrategyContext;
  recovery: SessionRecoveryFlag;
  loadConfidence: SessionLoadEstimateConfidence;
  ownership: LoadOwnershipState;
}) {
  if (context.safetyFlag) return false;
  if (recovery === "poor" || recovery === "limited") return false;
  if (loadConfidence !== "high") return false;
  if (ownership !== "owned") return false;
  return context.goal === "strength" || context.goal === "build_muscle_strength" || context.goal === "athletic_performance";
}

function shouldCalibrate({
  context,
  mappingSource,
  loadConfidence,
  performanceSignal,
  exposureCount,
}: {
  context: SessionStrategyContext;
  mappingSource: MappingSource;
  loadConfidence: SessionLoadEstimateConfidence;
  performanceSignal: RecentPerformanceSignal;
  exposureCount: number;
}) {
  if (context.recoveryFlag === "limited" && isHighRisk(context, resolveExerciseMapping(context).archetype)) return false;
  if (loadConfidence === "low") return true;
  if (exposureCount <= 0) return true;
  if (performanceSignal === "unknown" && (mappingSource === "fallback" || mappingSource === "name" || loadConfidence !== "high")) return true;
  return false;
}

function shouldVerify({
  performanceSignal,
  ownership,
  recovery,
}: {
  performanceSignal: RecentPerformanceSignal;
  ownership: LoadOwnershipState;
  recovery: SessionRecoveryFlag;
}) {
  if (recovery === "limited" || recovery === "poor") return false;
  if (performanceSignal === "underloaded" || performanceSignal === "plateau") return true;
  return ownership === "introduced" || ownership === "stabilising";
}

function biasForGoal(context: SessionStrategyContext, archetype: AdaptiveExerciseArchetype, recovery: SessionRecoveryFlag): AdaptiveCoachingBias {
  if (recovery === "poor" || context.trainingPhase === "deload") return "recovery";
  if (context.trainingPhase === "peak") return "peak";
  if (archetype === "power") return "speed_power";

  if (context.goal === "strength") {
    if (archetype === "competition_lift") return context.trainingPhase === "accumulation" ? "skill" : "tension";
    return archetype === "isolation" ? "balanced" : "tension";
  }

  if (context.goal === "hypertrophy") {
    if (recovery === "limited") return archetype === "isolation" ? "balanced" : "tension";
    if (archetype === "isolation" && recovery === "good") return "metabolic";
    if (archetype === "machine_compound" && recovery === "good") return "balanced";
    return "balanced";
  }

  if (context.goal === "build_muscle_strength") {
    if (archetype === "competition_lift" || archetype === "primary_compound") return "tension";
    return archetype === "isolation" && recovery === "good" ? "metabolic" : "balanced";
  }

  if (context.goal === "athletic_performance") {
    if (archetype === "competition_lift" || archetype === "primary_compound") return "skill";
    return recovery === "limited" ? "recovery" : "balanced";
  }

  if (context.goal === "get_lean") {
    if (recovery === "limited") return "recovery";
    return archetype === "competition_lift" || archetype === "primary_compound" ? "tension" : "balanced";
  }

  return recovery === "limited" ? "recovery" : "balanced";
}

function resolveExerciseMapping(context: SessionStrategyContext): { archetype: AdaptiveExerciseArchetype; source: MappingSource } {
  if (context.exerciseArchetype) return { archetype: context.exerciseArchetype, source: "provided_archetype" };
  if (context.exerciseCategory) return { archetype: archetypeFromCategory(context.exerciseCategory), source: "provided_category" };
  const movementArchetype = archetypeFromMovementPattern(context.movementPattern);
  if (movementArchetype) return { archetype: movementArchetype, source: "movement_pattern" };
  const nameArchetype = inferExerciseArchetype(context.exerciseName);
  return { archetype: nameArchetype, source: nameArchetype === "unsupported" ? "fallback" : "name" };
}

function archetypeFromCategory(category: AdaptiveExerciseCategory): AdaptiveExerciseArchetype {
  if (category === "competition_squat" || category === "competition_bench" || category === "competition_deadlift") return "competition_lift";
  if (category === "standing_overhead_press" || category === "heavy_compound") return "primary_compound";
  if (category === "machine_compound") return "machine_compound";
  if (category === "isolation") return "isolation";
  if (category === "power") return "power";
  if (category === "duration_bodyweight") return "duration_bodyweight";
  return "unsupported";
}

function archetypeFromMovementPattern(pattern: MovementPattern | undefined): AdaptiveExerciseArchetype | null {
  if (!pattern) return null;
  if (pattern === "isolation") return "isolation";
  if (pattern === "carry" || pattern === "core") return "duration_bodyweight";
  if (pattern === "horizontal_pull" || pattern === "vertical_pull") return "machine_compound";
  if (pattern === "horizontal_push" || pattern === "vertical_push" || pattern === "squat" || pattern === "hinge" || pattern === "lunge" || pattern === "hip_thrust") return "primary_compound";
  return null;
}

function inferExerciseArchetype(exerciseName: string): AdaptiveExerciseArchetype {
  const key = exerciseName.trim().toLowerCase();
  if (COMPETITION_LIFTS.has(key)) return "competition_lift";
  if (PRIMARY_COMPOUNDS.has(key)) return "primary_compound";
  if (MACHINE_COMPOUNDS.has(key)) return "machine_compound";
  if (ISOLATIONS.has(key)) return "isolation";
  if (POWER_EXERCISES.has(key)) return "power";
  if (DURATION_BODYWEIGHT.has(key)) return "duration_bodyweight";
  return "unsupported";
}

function isHighRisk(context: SessionStrategyContext, archetype: AdaptiveExerciseArchetype) {
  if (archetype === "competition_lift") return true;
  return context.movementPattern === "squat" || context.movementPattern === "hinge" || context.exerciseName.toLowerCase().includes("deadlift");
}

function confidenceBase(mappingSource: MappingSource, base: number) {
  if (mappingSource === "provided_archetype" || mappingSource === "provided_category") return base;
  if (mappingSource === "movement_pattern") return base - 6;
  if (mappingSource === "name") return base - 8;
  return base - 16;
}

function decision(
  context: SessionStrategyContext,
  setObjective: AdaptiveSetObjective,
  coachingBias: AdaptiveCoachingBias,
  confidence: number,
  shortReason: string,
  debugReasons: string[],
): SessionStrategyDecision {
  const cycleAdjustment = applyCycleContext(context, setObjective, coachingBias, confidence, debugReasons);
  const adjustedConfidence = context.recoveryFlag === "limited" ? cycleAdjustment.confidence - 6 : cycleAdjustment.confidence;
  return {
    set_objective: cycleAdjustment.setObjective,
    coaching_bias: cycleAdjustment.coachingBias,
    confidence: clamp(Math.round(adjustedConfidence), 0, 100),
    short_reason: shortReason.length > SHORT_REASON_LIMIT ? shortReason.slice(0, SHORT_REASON_LIMIT).trimEnd() : shortReason,
    debug_reasons: cycleAdjustment.debugReasons,
  };
}

function applyCycleContext(
  context: SessionStrategyContext,
  setObjective: AdaptiveSetObjective,
  coachingBias: AdaptiveCoachingBias,
  confidence: number,
  debugReasons: string[],
) {
  const cycle = context.cycleStrategyContext;
  if (!cycle) return { setObjective, coachingBias, confidence, debugReasons };

  let nextObjective = setObjective;
  let nextBias = coachingBias;
  let nextConfidence = confidence;
  const nextDebug = [
    ...debugReasons,
    `cycle macro ${cycle.macro_intent}`,
    `cycle meso ${cycle.meso_focus}`,
    `cycle micro ${cycle.micro_emphasis}`,
    `cycle stress budget ${cycle.stress_budget_bias}`,
  ];

  if (cycle.blocked_objectives.includes(nextObjective)) {
    nextObjective = preferredObjective(cycle);
    nextConfidence -= 12;
    nextDebug.push(`cycle blocked objective ${setObjective}; selected ${nextObjective}`);
  } else if (!cycle.allowed_objectives.includes(nextObjective)) {
    nextObjective = preferredObjective(cycle);
    nextConfidence -= 8;
    nextDebug.push(`cycle did not prefer objective ${setObjective}; selected ${nextObjective}`);
  } else {
    nextDebug.push(`cycle allowed objective ${setObjective}`);
  }

  if (cycle.blocked_biases.includes(nextBias)) {
    nextBias = preferredBias(cycle);
    nextConfidence -= 12;
    nextDebug.push(`cycle blocked bias ${coachingBias}; selected ${nextBias}`);
  } else if (!cycle.allowed_biases.includes(nextBias)) {
    nextBias = preferredBias(cycle);
    nextConfidence -= 8;
    nextDebug.push(`cycle did not prefer bias ${coachingBias}; selected ${nextBias}`);
  } else {
    nextDebug.push(`cycle allowed bias ${coachingBias}`);
  }

  return {
    setObjective: nextObjective,
    coachingBias: nextBias,
    confidence: Math.min(nextConfidence, cycle.confidence),
    debugReasons: nextDebug,
  };
}

function preferredObjective(cycle: CycleStrategyContext): AdaptiveSetObjective {
  const allowed = cycle.allowed_objectives.filter((objective) => !cycle.blocked_objectives.includes(objective));
  return allowed[0] ?? "productive";
}

function preferredBias(cycle: CycleStrategyContext): AdaptiveCoachingBias {
  const allowed = cycle.allowed_biases.filter((bias) => !cycle.blocked_biases.includes(bias));
  return allowed[0] ?? "balanced";
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}
