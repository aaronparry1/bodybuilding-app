import type { CycleStrategyContext, CycleLoadOwnership, CycleRecoveryFlag } from "@/domain/training/cycle-strategy-context";
import type { MovementPattern } from "@/domain/training/models";
import type { SessionStrategyDecision } from "@/domain/training/session-strategy";
import type {
  AdaptiveExerciseArchetype,
  AdaptiveExerciseCategory,
  AdaptiveProgrammingGoal,
  AdaptiveRepPrescription,
  AdaptiveTrainingPhase,
  RecentPerformanceSignal,
} from "@/domain/training/adaptive-rep-prescription";

export type AdaptiveLoadAction =
  | "keep_load"
  | "increase_load"
  | "reduce_load"
  | "estimate_from_amrap"
  | "conservative_start"
  | "no_external_load";

export type AdaptiveLoadPrescriptionStrategy =
  | "owned_load"
  | "small_progression"
  | "conservative_progression"
  | "calibration_load"
  | "recovery_load"
  | "power_quality_load"
  | "peak_specific_load"
  | "bodyweight_or_duration";

export type AdaptiveIntensityBand = "very_light" | "light" | "moderate" | "moderately_heavy" | "heavy" | "peak";

export interface AdaptiveLoadPrescriptionContext {
  goal: AdaptiveProgrammingGoal;
  exerciseName: string;
  exerciseArchetype?: AdaptiveExerciseArchetype;
  exerciseCategory?: AdaptiveExerciseCategory;
  movementPattern?: MovementPattern;
  trainingPhase: AdaptiveTrainingPhase;
  cycleStrategyContext?: CycleStrategyContext;
  sessionStrategy?: SessionStrategyDecision;
  repPrescription: AdaptiveRepPrescription;
  previousLoad?: number;
  lastSuccessfulLoad?: number;
  estimatedOneRepMax?: number;
  loadOwnership?: CycleLoadOwnership;
  recentPerformanceSignal?: RecentPerformanceSignal;
  recoveryFlag?: CycleRecoveryFlag;
  availableLoadJump?: number;
  safetyFlag?: boolean;
}

export interface AdaptiveLoadPrescription {
  load_action: AdaptiveLoadAction;
  load_strategy: AdaptiveLoadPrescriptionStrategy;
  suggested_load?: number;
  suggested_change?: number;
  intensity_band?: AdaptiveIntensityBand;
  confidence: number;
  short_reason: string;
  debug_reasons: string[];
}

type MappingSource = "provided_archetype" | "provided_category" | "movement_pattern" | "name" | "fallback";
type CompetitionLiftKind = "squat" | "bench" | "deadlift" | null;

const SHORT_REASON_LIMIT = 80;
const COMPETITION_LIFTS = new Set(["competition squat", "competition bench press", "competition deadlift"]);
const POWER_EXERCISES = new Set(["box jump", "medicine ball throw", "speed squat", "speed bench"]);
const DURATION_BODYWEIGHT = new Set(["plank", "side plank", "dead hang", "farmer carry", "farmer's hold", "suitcase hold", "hollow hold", "wall sit", "l-sit"]);

export function decideAdaptiveLoadPrescription(context: AdaptiveLoadPrescriptionContext): AdaptiveLoadPrescription {
  const mapping = resolveExerciseMapping(context);
  const ownership = context.loadOwnership ?? "unknown";
  const signal = context.recentPerformanceSignal ?? "appropriate";
  const recovery = context.recoveryFlag ?? "normal";
  const previousLoad = validLoad(context.previousLoad) ? context.previousLoad : undefined;
  const lastSuccessfulLoad = validLoad(context.lastSuccessfulLoad) ? context.lastSuccessfulLoad : previousLoad;
  const jump = resolveJump(context, mapping.competitionLiftKind);
  const debug = [
    `goal ${context.goal}`,
    `phase ${context.trainingPhase}`,
    `archetype ${mapping.archetype}`,
    `mapping ${mapping.source}`,
    ...(mapping.competitionLiftKind ? [`competition lift ${mapping.competitionLiftKind}`] : []),
    `ownership ${ownership}`,
    `signal ${signal}`,
    `recovery ${recovery}`,
    `rep ${context.repPrescription.prescription_type}`,
    `jump ${jump}`,
  ];

  if (isBodyweightOrDuration(context, mapping.archetype)) {
    return decision(context, "no_external_load", "bodyweight_or_duration", undefined, undefined, "very_light", 88, "Use bodyweight or duration.", [
      ...debug,
      "duration/bodyweight exercise does not need external load",
    ]);
  }

  if (context.safetyFlag || context.trainingPhase === "deload" || context.repPrescription.set_objective === "recovery") {
    return recoveryLoad(context, previousLoad, jump, debug, "Safety or recovery load.");
  }

  if (recovery === "poor" || signal === "overreached") {
    return recoveryLoad(context, previousLoad, jump, debug, "Recovery limits loading today.");
  }

  if (mapping.archetype === "power" || context.repPrescription.coaching_bias === "speed_power" || context.repPrescription.load_strategy === "quality_speed_load") {
    if (recovery === "limited") return reduceOrKeepQualityLoad(context, previousLoad, jump, debug);
    return decision(context, "keep_load", "power_quality_load", previousLoad, 0, "light", confidence(context, 78, mapping.source, previousLoad), "Preserve speed and quality.", [
      ...debug,
      "power loading preserves quality; no velocity claim",
    ]);
  }

  if (isCalibration(context.repPrescription)) {
    return calibrationLoad(context, mapping, previousLoad, lastSuccessfulLoad, jump, debug);
  }

  if (ownership === "unknown") {
    if (!previousLoad) {
      return decision(context, "conservative_start", "calibration_load", lastSuccessfulLoad, undefined, "light", confidence(context, 60, mapping.source, lastSuccessfulLoad), "Start conservatively.", [
        ...debug,
        "unknown ownership and missing previous load",
      ]);
    }
    return decision(context, "keep_load", "calibration_load", previousLoad, 0, "moderate", confidence(context, 66, mapping.source, previousLoad), "Keep load while evidence builds.", [
      ...debug,
      "unknown ownership blocks progression",
    ]);
  }

  if (ownership === "introduced") {
    return decision(context, "keep_load", "owned_load", previousLoad, 0, intensityFor(context, mapping), confidence(context, 74, mapping.source, previousLoad), "Stabilise the new load.", [
      ...debug,
      "introduced load should be repeated before progression",
    ]);
  }

  if (ownership === "unstable") {
    if (previousLoad && (recovery === "limited" || signal === "plateau")) return reduceLoad(context, previousLoad, jump, debug, "Stabilise with a small reduction.");
    return decision(context, "keep_load", "owned_load", previousLoad, 0, "moderate", confidence(context, 68, mapping.source, previousLoad), "Keep load and stabilise.", [
      ...debug,
      "unstable load blocks progression",
    ]);
  }

  if (canProgress(context, mapping, ownership, signal, recovery, previousLoad, jump)) {
    return progressLoad(context, mapping, previousLoad!, jump, debug);
  }

  if (signal === "underloaded" && previousLoad && isJumpTooLarge(previousLoad, jump, mapping.competitionLiftKind)) {
    return decision(context, "keep_load", "conservative_progression", previousLoad, 0, intensityFor(context, mapping), confidence(context, 72, mapping.source, previousLoad), "Jump is too large. Keep load.", [
      ...debug,
      "available load jump blocks forced increase",
    ]);
  }

  if (signal === "plateau" && previousLoad && recovery !== "good") return reduceLoad(context, previousLoad, jump, debug, "Reduce slightly and rebuild.");

  return decision(context, "keep_load", context.trainingPhase === "peak" ? "peak_specific_load" : "owned_load", previousLoad, 0, intensityFor(context, mapping), confidence(context, 80, mapping.source, previousLoad), "Keep the load.", [
    ...debug,
    "evidence supports holding load",
  ]);
}

function calibrationLoad(
  context: AdaptiveLoadPrescriptionContext,
  mapping: ReturnType<typeof resolveExerciseMapping>,
  previousLoad: number | undefined,
  lastSuccessfulLoad: number | undefined,
  jump: number,
  debug: string[],
) {
  const highRisk = isHighRisk(mapping, context);
  const lowConfidence = context.repPrescription.confidence < 75 || !previousLoad;

  if (highRisk) {
    const start = lastSuccessfulLoad ?? previousLoad;
    return decision(context, start ? "conservative_start" : "conservative_start", "calibration_load", start, undefined, "light", confidence(context, 62, mapping.source, start), "Use a conservative calibration load.", [
      ...debug,
      "high-risk calibration stays conservative",
    ]);
  }

  if (lowConfidence && previousLoad) {
    return decision(context, "estimate_from_amrap", "calibration_load", previousLoad, 0, "moderate", confidence(context, 66, mapping.source, previousLoad), "Estimate from the calibration set.", [
      ...debug,
      "AMRAP/calibration with low confidence estimates from result",
    ]);
  }

  if (!previousLoad) {
    return decision(context, "conservative_start", "calibration_load", lastSuccessfulLoad, undefined, "light", confidence(context, 58, mapping.source, lastSuccessfulLoad), "Start conservatively.", [
      ...debug,
      "missing load history requires conservative start",
    ]);
  }

  return decision(context, "keep_load", "calibration_load", previousLoad, 0, "moderate", confidence(context, 70, mapping.source, previousLoad), "Use current load to calibrate.", [
    ...debug,
    "calibration keeps the current load",
  ]);
}

function canProgress(
  context: AdaptiveLoadPrescriptionContext,
  mapping: ReturnType<typeof resolveExerciseMapping>,
  ownership: CycleLoadOwnership,
  signal: RecentPerformanceSignal,
  recovery: CycleRecoveryFlag,
  previousLoad: number | undefined,
  jump: number,
) {
  if (!previousLoad) return false;
  if (context.safetyFlag || recovery === "poor" || recovery === "limited") return false;
  if (signal !== "improving" && signal !== "underloaded") return false;
  if (ownership !== "owned" && ownership !== "stabilising") return false;
  if (ownership === "stabilising" && context.repPrescription.confidence < 82) return false;
  if (context.repPrescription.set_objective === "recovery" || context.repPrescription.load_strategy === "recovery_load") return false;
  if (isJumpTooLarge(previousLoad, jump, mapping.competitionLiftKind)) return false;
  return true;
}

function progressLoad(
  context: AdaptiveLoadPrescriptionContext,
  mapping: ReturnType<typeof resolveExerciseMapping>,
  previousLoad: number,
  jump: number,
  debug: string[],
) {
  const deadlift = mapping.competitionLiftKind === "deadlift" || context.exerciseName.toLowerCase().includes("deadlift");
  const suggestedChange = deadlift ? Math.min(jump, Math.max(1, previousLoad * 0.025)) : jump;
  const strategy: AdaptiveLoadPrescriptionStrategy = deadlift ? "conservative_progression" : "small_progression";
  return decision(context, "increase_load", strategy, roundLoad(previousLoad + suggestedChange), suggestedChange, intensityFor(context, mapping), confidence(context, deadlift ? 78 : 84, mapping.source, previousLoad), deadlift ? "Small conservative increase." : "Small load increase.", [
    ...debug,
    deadlift ? "deadlift progression is more conservative" : "owned load and positive evidence allow small progression",
  ]);
}

function recoveryLoad(
  context: AdaptiveLoadPrescriptionContext,
  previousLoad: number | undefined,
  jump: number,
  debug: string[],
  reason: string,
) {
  if (!previousLoad) {
    return decision(context, "conservative_start", "recovery_load", undefined, undefined, "very_light", confidence(context, 70, "fallback", undefined), reason, [
      ...debug,
      "no previous load available for recovery load",
    ]);
  }
  const change = -Math.min(jump, Math.max(1, previousLoad * 0.1));
  return decision(context, "reduce_load", "recovery_load", roundLoad(previousLoad + change), change, "very_light", confidence(context, 84, "provided_category", previousLoad), reason, [
    ...debug,
    "recovery context blocks aggressive loading",
  ]);
}

function reduceOrKeepQualityLoad(context: AdaptiveLoadPrescriptionContext, previousLoad: number | undefined, jump: number, debug: string[]) {
  if (!previousLoad) {
    return decision(context, "conservative_start", "power_quality_load", undefined, undefined, "light", 66, "Start light for quality.", [
      ...debug,
      "power quality with missing load history",
    ]);
  }
  const change = -Math.min(jump, Math.max(1, previousLoad * 0.05));
  return decision(context, "reduce_load", "power_quality_load", roundLoad(previousLoad + change), change, "light", 78, "Reduce to preserve speed.", [
    ...debug,
    "fatigue limits power quality",
  ]);
}

function reduceLoad(context: AdaptiveLoadPrescriptionContext, previousLoad: number, jump: number, debug: string[], reason: string) {
  const change = -Math.min(jump, Math.max(1, previousLoad * 0.075));
  return decision(context, "reduce_load", "conservative_progression", roundLoad(previousLoad + change), change, "moderate", 76, reason, [
    ...debug,
    "load evidence suggests reducing rather than pushing",
  ]);
}

function isCalibration(rep: AdaptiveRepPrescription) {
  return rep.set_objective === "calibration" || rep.prescription_type === "amrap" || rep.prescription_type === "capped_amrap";
}

function isBodyweightOrDuration(context: AdaptiveLoadPrescriptionContext, archetype: AdaptiveExerciseArchetype) {
  if (archetype !== "duration_bodyweight") return false;
  const name = context.exerciseName.toLowerCase();
  const loadedDuration = name.includes("carry") || name.includes("farmer") || name.includes("suitcase");
  return !loadedDuration;
}

function resolveExerciseMapping(context: AdaptiveLoadPrescriptionContext): {
  archetype: AdaptiveExerciseArchetype;
  competitionLiftKind: CompetitionLiftKind;
  source: MappingSource;
} {
  if (context.exerciseArchetype) return { archetype: context.exerciseArchetype, competitionLiftKind: inferCompetitionLiftKind(context), source: "provided_archetype" };
  if (context.exerciseCategory) return { archetype: archetypeFromCategory(context.exerciseCategory), competitionLiftKind: competitionKindFromCategory(context.exerciseCategory) ?? inferCompetitionLiftKind(context), source: "provided_category" };
  const movementArchetype = archetypeFromMovementPattern(context.movementPattern);
  if (movementArchetype) return { archetype: movementArchetype, competitionLiftKind: inferCompetitionLiftKind(context), source: "movement_pattern" };
  const nameArchetype = inferNameArchetype(context.exerciseName);
  return { archetype: nameArchetype, competitionLiftKind: inferCompetitionLiftKind(context), source: nameArchetype === "unsupported" ? "fallback" : "name" };
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

function inferNameArchetype(name: string): AdaptiveExerciseArchetype {
  const key = name.trim().toLowerCase();
  if (COMPETITION_LIFTS.has(key)) return "competition_lift";
  if (POWER_EXERCISES.has(key)) return "power";
  if (DURATION_BODYWEIGHT.has(key)) return "duration_bodyweight";
  if (key.includes("curl") || key.includes("extension") || key.includes("raise") || key.includes("pushdown")) return "isolation";
  if (key.includes("press") || key.includes("squat") || key.includes("deadlift") || key.includes("row")) return "primary_compound";
  return "unsupported";
}

function competitionKindFromCategory(category: AdaptiveExerciseCategory): CompetitionLiftKind {
  if (category === "competition_squat") return "squat";
  if (category === "competition_bench") return "bench";
  if (category === "competition_deadlift") return "deadlift";
  return null;
}

function inferCompetitionLiftKind(context: Pick<AdaptiveLoadPrescriptionContext, "exerciseName" | "movementPattern" | "exerciseCategory">): CompetitionLiftKind {
  const fromCategory = context.exerciseCategory ? competitionKindFromCategory(context.exerciseCategory) : null;
  if (fromCategory) return fromCategory;
  const key = context.exerciseName.toLowerCase();
  if (key.includes("deadlift")) return "deadlift";
  if (key.includes("bench")) return "bench";
  if (key.includes("squat")) return "squat";
  if (context.movementPattern === "hinge") return "deadlift";
  if (context.movementPattern === "squat") return "squat";
  if (context.movementPattern === "horizontal_push") return "bench";
  return null;
}

function isHighRisk(mapping: ReturnType<typeof resolveExerciseMapping>, context: AdaptiveLoadPrescriptionContext) {
  return mapping.archetype === "competition_lift" || context.movementPattern === "squat" || context.movementPattern === "hinge" || context.exerciseName.toLowerCase().includes("deadlift");
}

function intensityFor(context: AdaptiveLoadPrescriptionContext, mapping: ReturnType<typeof resolveExerciseMapping>): AdaptiveIntensityBand {
  if (context.repPrescription.load_strategy === "recovery_load") return "very_light";
  if (context.repPrescription.load_strategy === "quality_speed_load") return "light";
  if (context.trainingPhase === "peak" && mapping.archetype === "competition_lift") return "peak";
  if (context.trainingPhase === "intensification" && mapping.archetype === "competition_lift") return "heavy";
  if (context.repPrescription.load_strategy === "heavier_specific_load") return "heavy";
  if (mapping.archetype === "isolation" || mapping.archetype === "machine_compound") return "moderate";
  return "moderately_heavy";
}

function resolveJump(context: AdaptiveLoadPrescriptionContext, kind: CompetitionLiftKind) {
  if (context.availableLoadJump && context.availableLoadJump > 0) return context.availableLoadJump;
  if (kind === "deadlift" || kind === "squat") return 5;
  return 2.5;
}

function isJumpTooLarge(previousLoad: number, jump: number, kind: CompetitionLiftKind) {
  const threshold = kind === "deadlift" ? 0.035 : kind === "squat" ? 0.05 : 0.075;
  const absoluteFloor = kind ? 0 : 1.25;
  return jump > Math.max(previousLoad * threshold, absoluteFloor);
}

function confidence(context: AdaptiveLoadPrescriptionContext, base: number, source: MappingSource, load: number | undefined) {
  let value = base;
  if (source === "name") value -= 5;
  if (source === "movement_pattern") value -= 7;
  if (source === "fallback") value -= 14;
  if (!load && context.repPrescription.prescription_type !== "duration_hold") value -= 10;
  if (context.repPrescription.confidence < 70) value -= 8;
  if (context.cycleStrategyContext && context.cycleStrategyContext.confidence < 65) value -= 5;
  if (context.sessionStrategy && context.sessionStrategy.confidence < 65) value -= 5;
  if (context.loadOwnership === "owned" && load && context.repPrescription.confidence >= 80) value += 6;
  return clamp(Math.round(value), 0, 100);
}

function decision(
  context: AdaptiveLoadPrescriptionContext,
  loadAction: AdaptiveLoadAction,
  loadStrategy: AdaptiveLoadPrescriptionStrategy,
  suggestedLoad: number | undefined,
  suggestedChange: number | undefined,
  intensityBand: AdaptiveIntensityBand | undefined,
  confidenceValue: number,
  shortReason: string,
  debugReasons: string[],
): AdaptiveLoadPrescription {
  return {
    load_action: loadAction,
    load_strategy: loadStrategy,
    suggested_load: suggestedLoad,
    suggested_change: suggestedChange,
    intensity_band: intensityBand,
    confidence: clamp(Math.round(confidenceValue), 0, 100),
    short_reason: shortReason.length > SHORT_REASON_LIMIT ? shortReason.slice(0, SHORT_REASON_LIMIT).trimEnd() : shortReason,
    debug_reasons: [
      ...debugReasons,
      ...(context.estimatedOneRepMax ? [`e1rm ${context.estimatedOneRepMax}`] : []),
      ...(context.cycleStrategyContext ? [`cycle stress ${context.cycleStrategyContext.stress_budget_bias}`] : []),
      ...(context.sessionStrategy ? [`session ${context.sessionStrategy.set_objective}/${context.sessionStrategy.coaching_bias}`] : []),
    ],
  };
}

function validLoad(load: number | undefined): load is number {
  return typeof load === "number" && Number.isFinite(load) && load >= 0;
}

function roundLoad(load: number) {
  return Math.max(0, Math.round(load * 100) / 100);
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}
