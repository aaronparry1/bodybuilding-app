import type {
  AdaptiveCoachingBias,
  AdaptiveProgrammingGoal,
  AdaptiveSetObjective,
  AdaptiveTrainingPhase,
  RecentPerformanceSignal,
} from "@/domain/training/adaptive-rep-prescription";

export type CycleRecoveryFlag = "good" | "normal" | "limited" | "poor";
export type CycleLoadOwnership = "unknown" | "introduced" | "unstable" | "stabilising" | "owned";
export type StressBudgetBias = "spend" | "maintain" | "conserve";

export type MacroIntent =
  | "build_strength_capacity"
  | "increase_specificity"
  | "express_strength"
  | "build_quality_volume"
  | "progress_quality_work"
  | "build_muscle_and_strength"
  | "express_power"
  | "preserve_performance"
  | "maintain_training"
  | "recover";

export type MesoFocus =
  | "base_capacity"
  | "specific_strength"
  | "performance_expression"
  | "quality_volume"
  | "quality_progression"
  | "power_skill"
  | "performance_preservation"
  | "maintenance"
  | "recovery";

export type MicroEmphasis =
  | "practice_and_build"
  | "specific_productive_work"
  | "low_fatigue_expression"
  | "quality_stimulus"
  | "verify_and_progress"
  | "conservative_quality"
  | "recover_and_resensitise";

export interface CycleStrategyContextInput {
  goal: AdaptiveProgrammingGoal;
  trainingPhase: AdaptiveTrainingPhase;
  weekInBlock?: number;
  blockLengthWeeks?: number;
  plannedTrainingDays?: number;
  currentSessionIndex?: number;
  recentPerformanceSignal?: RecentPerformanceSignal;
  recoveryFlag?: CycleRecoveryFlag;
  loadOwnership?: CycleLoadOwnership;
  evidenceConfidence?: number;
}

export interface CycleStrategyContext {
  macro_intent: MacroIntent;
  meso_focus: MesoFocus;
  micro_emphasis: MicroEmphasis;
  allowed_objectives: AdaptiveSetObjective[];
  blocked_objectives: AdaptiveSetObjective[];
  allowed_biases: AdaptiveCoachingBias[];
  blocked_biases: AdaptiveCoachingBias[];
  stress_budget_bias: StressBudgetBias;
  confidence: number;
  short_reason: string;
  debug_reasons: string[];
}

const SHORT_REASON_LIMIT = 80;
const ALL_OBJECTIVES: AdaptiveSetObjective[] = ["calibration", "productive", "verification", "performance", "recovery"];
const ALL_BIASES: AdaptiveCoachingBias[] = ["tension", "balanced", "metabolic", "speed_power", "skill", "recovery", "peak"];

export function deriveCycleStrategyContext(context: CycleStrategyContextInput): CycleStrategyContext {
  const recovery = context.recoveryFlag ?? "normal";
  const signal = context.recentPerformanceSignal ?? "appropriate";
  const evidenceConfidence = clamp(context.evidenceConfidence ?? 70, 0, 100);
  const debug = [
    `goal ${context.goal}`,
    `phase ${context.trainingPhase}`,
    `week ${context.weekInBlock ?? "unknown"}/${context.blockLengthWeeks ?? "unknown"}`,
    `planned days ${context.plannedTrainingDays ?? "unknown"}`,
    `session ${context.currentSessionIndex ?? "unknown"}`,
    `signal ${signal}`,
    `recovery ${recovery}`,
    `ownership ${context.loadOwnership ?? "unknown"}`,
    `evidence confidence ${evidenceConfidence}`,
  ];

  if (context.trainingPhase === "deload" || recovery === "poor" || signal === "overreached") {
    return cycleDecision({
      macro_intent: "recover",
      meso_focus: "recovery",
      micro_emphasis: "recover_and_resensitise",
      allowed_objectives: ["recovery"],
      blocked_objectives: ["calibration", "productive", "verification", "performance"],
      allowed_biases: ["recovery"],
      blocked_biases: ["tension", "balanced", "metabolic", "speed_power", "skill", "peak"],
      stress_budget_bias: "conserve",
      confidence: confidenceFromEvidence(90, evidenceConfidence),
      short_reason: "Recovery governs this cycle.",
      debug_reasons: [...debug, "deload, poor recovery, or overreached signal forces recovery context"],
    });
  }

  const base = contextForGoalAndPhase(context, recovery);
  const stressBudget = stressBudgetFor(context, recovery, signal);
  const blocked = blockedFor(context, recovery, evidenceConfidence);
  const allowedObjectives = removeBlocked(base.allowed_objectives, blocked.objectives);
  const allowedBiases = removeBlocked(base.allowed_biases, blocked.biases);

  return cycleDecision({
    ...base,
    allowed_objectives: allowedObjectives.length > 0 ? allowedObjectives : ["productive"],
    blocked_objectives: blocked.objectives,
    allowed_biases: allowedBiases.length > 0 ? allowedBiases : ["balanced"],
    blocked_biases: blocked.biases,
    stress_budget_bias: stressBudget,
    confidence: confidenceFromEvidence(base.confidence, evidenceConfidence),
    debug_reasons: [...debug, ...base.debug_reasons, `stress budget ${stressBudget}`],
  });
}

function contextForGoalAndPhase(
  context: CycleStrategyContextInput,
  recovery: CycleRecoveryFlag,
): Omit<CycleStrategyContext, "blocked_objectives" | "blocked_biases" | "stress_budget_bias"> {
  if (context.goal === "strength") return strengthContext(context);
  if (context.goal === "hypertrophy") return hypertrophyContext(context, recovery);
  if (context.goal === "build_muscle_strength") return buildMuscleStrengthContext(context);
  if (context.goal === "athletic_performance") return athleticPerformanceContext(context);
  if (context.goal === "get_lean") return getLeanContext(context, recovery);
  return maintenanceContext(context);
}

function strengthContext(
  context: CycleStrategyContextInput,
): Omit<CycleStrategyContext, "blocked_objectives" | "blocked_biases" | "stress_budget_bias"> {
  if (context.trainingPhase === "peak") {
    return {
      macro_intent: "express_strength",
      meso_focus: "performance_expression",
      micro_emphasis: "low_fatigue_expression",
      allowed_objectives: ["performance", "recovery", "verification"],
      allowed_biases: ["peak", "tension", "skill", "recovery"],
      confidence: 82,
      short_reason: "Express strength with low fatigue.",
      debug_reasons: ["strength peak prioritises expression and specificity"],
    };
  }

  if (context.trainingPhase === "intensification") {
    return {
      macro_intent: "increase_specificity",
      meso_focus: "specific_strength",
      micro_emphasis: "specific_productive_work",
      allowed_objectives: ["productive", "verification", "calibration", "performance"],
      allowed_biases: ["tension", "skill", "peak"],
      confidence: 80,
      short_reason: "Increase specificity.",
      debug_reasons: ["strength intensification allows cautious performance work and load-finding when evidence is weak"],
    };
  }

  return {
    macro_intent: "build_strength_capacity",
    meso_focus: "base_capacity",
    micro_emphasis: "practice_and_build",
    allowed_objectives: ["productive", "verification", "calibration"],
    allowed_biases: ["tension", "skill", "balanced"],
    confidence: 80,
    short_reason: "Build base strength capacity.",
    debug_reasons: ["strength accumulation builds capacity before expression"],
  };
}

function hypertrophyContext(
  context: CycleStrategyContextInput,
  recovery: CycleRecoveryFlag,
): Omit<CycleStrategyContext, "blocked_objectives" | "blocked_biases" | "stress_budget_bias"> {
  if (context.trainingPhase === "peak") {
    return {
      macro_intent: "progress_quality_work",
      meso_focus: "quality_progression",
      micro_emphasis: "verify_and_progress",
      allowed_objectives: ["verification", "performance", "productive"],
      allowed_biases: ["tension", "balanced"],
      confidence: 70,
      short_reason: "Verify quality work.",
      debug_reasons: ["hypertrophy has no primary peak, so expression stays cautious"],
    };
  }

  return {
    macro_intent: context.trainingPhase === "intensification" ? "progress_quality_work" : "build_quality_volume",
    meso_focus: context.trainingPhase === "intensification" ? "quality_progression" : "quality_volume",
    micro_emphasis: recovery === "limited" ? "conservative_quality" : "quality_stimulus",
    allowed_objectives: context.trainingPhase === "intensification" ? ["productive", "verification"] : ["productive", "verification", "calibration"],
    allowed_biases: recovery === "limited" ? ["tension", "balanced", "recovery"] : ["balanced", "metabolic", "tension"],
    confidence: 78,
    short_reason: "Build quality muscle stimulus.",
    debug_reasons: ["hypertrophy context favours quality volume over expression"],
  };
}

function buildMuscleStrengthContext(
  context: CycleStrategyContextInput,
): Omit<CycleStrategyContext, "blocked_objectives" | "blocked_biases" | "stress_budget_bias"> {
  if (context.trainingPhase === "peak") {
    return {
      macro_intent: "express_strength",
      meso_focus: "performance_expression",
      micro_emphasis: "low_fatigue_expression",
      allowed_objectives: ["performance", "verification", "recovery"],
      allowed_biases: ["peak", "tension", "balanced", "recovery"],
      confidence: 78,
      short_reason: "Express strength, keep accessories conservative.",
      debug_reasons: ["powerbuilding peak expresses strength while limiting accessory fatigue"],
    };
  }

  return {
    macro_intent: "build_muscle_and_strength",
    meso_focus: context.trainingPhase === "intensification" ? "specific_strength" : "quality_volume",
    micro_emphasis: context.trainingPhase === "intensification" ? "specific_productive_work" : "quality_stimulus",
    allowed_objectives: context.trainingPhase === "intensification" ? ["productive", "verification", "performance"] : ["productive", "verification", "calibration"],
    allowed_biases: context.trainingPhase === "intensification" ? ["tension", "balanced", "skill"] : ["balanced", "tension", "metabolic"],
    confidence: 78,
    short_reason: "Balance strength support and muscle stimulus.",
    debug_reasons: ["build muscle + strength keeps load and volume stress coordinated"],
  };
}

function athleticPerformanceContext(
  context: CycleStrategyContextInput,
): Omit<CycleStrategyContext, "blocked_objectives" | "blocked_biases" | "stress_budget_bias"> {
  const recovery = context.recoveryFlag ?? "normal";
  if (context.trainingPhase === "peak") {
    return {
      macro_intent: "express_power",
      meso_focus: "performance_expression",
      micro_emphasis: "low_fatigue_expression",
      allowed_objectives: ["performance", "verification", "recovery"],
      allowed_biases: ["speed_power", "peak", "skill", "recovery"],
      confidence: 78,
      short_reason: "Express power with low fatigue.",
      debug_reasons: ["athletic performance peak prioritises quality and low fatigue"],
    };
  }

  return {
    macro_intent: context.trainingPhase === "intensification" ? "increase_specificity" : "build_strength_capacity",
    meso_focus: context.trainingPhase === "intensification" ? "specific_strength" : "power_skill",
    micro_emphasis: context.trainingPhase === "intensification" ? "specific_productive_work" : "practice_and_build",
    allowed_objectives: ["productive", "verification", "calibration"],
    allowed_biases: recovery === "limited" ? ["recovery", "balanced", "skill", "tension"] : ["speed_power", "skill", "tension", "balanced"],
    confidence: 76,
    short_reason: "Build power skill and strength support.",
    debug_reasons: ["athletic performance blends power quality with strength support"],
  };
}

function getLeanContext(
  context: CycleStrategyContextInput,
  recovery: CycleRecoveryFlag,
): Omit<CycleStrategyContext, "blocked_objectives" | "blocked_biases" | "stress_budget_bias"> {
  return {
    macro_intent: "preserve_performance",
    meso_focus: "performance_preservation",
    micro_emphasis: recovery === "limited" ? "conservative_quality" : "specific_productive_work",
    allowed_objectives: recovery === "limited" ? ["productive", "recovery", "verification"] : ["productive", "verification", "calibration"],
    allowed_biases: recovery === "limited" ? ["recovery", "balanced", "tension"] : ["balanced", "tension"],
    confidence: context.trainingPhase === "maintenance" ? 76 : 74,
    short_reason: "Preserve performance and consistency.",
    debug_reasons: ["get lean context avoids unnecessary fatigue"],
  };
}

function maintenanceContext(
  context: CycleStrategyContextInput,
): Omit<CycleStrategyContext, "blocked_objectives" | "blocked_biases" | "stress_budget_bias"> {
  return {
    macro_intent: "maintain_training",
    meso_focus: "maintenance",
    micro_emphasis: "conservative_quality",
    allowed_objectives: ["productive", "verification"],
    allowed_biases: ["balanced", "tension", "recovery"],
    confidence: context.trainingPhase === "maintenance" ? 80 : 72,
    short_reason: "Keep training controlled.",
    debug_reasons: ["maintenance context favours simple controlled work"],
  };
}

function blockedFor(context: CycleStrategyContextInput, recovery: CycleRecoveryFlag, evidenceConfidence: number) {
  const blockedObjectives: AdaptiveSetObjective[] = [];
  const blockedBiases: AdaptiveCoachingBias[] = [];

  if (context.trainingPhase === "peak" && context.goal === "strength") blockedBiases.push("metabolic");
  if (context.goal === "maintenance") blockedObjectives.push("performance", "calibration");
  if (context.goal === "get_lean" && (recovery === "limited" || evidenceConfidence < 70)) blockedObjectives.push("performance");
  if (recovery === "limited") blockedObjectives.push("performance");
  if (recovery === "limited" && context.goal !== "hypertrophy") blockedBiases.push("metabolic");
  if (evidenceConfidence < 55) blockedObjectives.push("performance");

  return {
    objectives: unique(blockedObjectives),
    biases: unique(blockedBiases),
  };
}

function stressBudgetFor(
  context: CycleStrategyContextInput,
  recovery: CycleRecoveryFlag,
  signal: RecentPerformanceSignal,
): StressBudgetBias {
  if (context.trainingPhase === "deload" || recovery === "poor" || signal === "overreached") return "conserve";
  if (recovery === "limited" || context.goal === "get_lean") return context.goal === "get_lean" && recovery !== "good" ? "conserve" : "maintain";
  if (context.trainingPhase === "peak") return "conserve";
  if (recovery === "good" || signal === "improving") return "spend";
  return "maintain";
}

function cycleDecision(decision: CycleStrategyContext): CycleStrategyContext {
  return {
    ...decision,
    short_reason: decision.short_reason.length > SHORT_REASON_LIMIT ? decision.short_reason.slice(0, SHORT_REASON_LIMIT).trimEnd() : decision.short_reason,
  };
}

function confidenceFromEvidence(base: number, evidenceConfidence: number) {
  const blended = base * 0.7 + evidenceConfidence * 0.3;
  return clamp(Math.round(blended), 0, 100);
}

function removeBlocked<T>(values: T[], blocked: T[]) {
  return values.filter((value) => !blocked.includes(value));
}

function unique<T>(values: T[]) {
  return Array.from(new Set(values));
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}
