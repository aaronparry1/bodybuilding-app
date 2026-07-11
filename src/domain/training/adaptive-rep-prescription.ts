import type { ExerciseFatigueCost, MovementPattern, RepRange } from "@/domain/training/models";

export type AdaptiveProgrammingGoal = "strength" | "hypertrophy" | "build_muscle_strength" | "athletic_performance" | "get_lean" | "maintenance";
export type AdaptiveTrainingPhase = "accumulation" | "intensification" | "peak" | "deload" | "maintenance";
export type AdaptiveSetObjective = "calibration" | "productive" | "verification" | "performance" | "recovery";
export type AdaptiveCoachingBias = "tension" | "balanced" | "metabolic" | "speed_power" | "skill" | "recovery" | "peak";
export type AdaptiveRepPrescriptionType = "fixed_reps" | "top_range_check" | "amrap" | "capped_amrap" | "recovery_reps" | "duration_hold" | "duration_carry";
export type AdaptiveLoadStrategy =
  | "use_current_load"
  | "conservative_load"
  | "heavier_specific_load"
  | "quality_speed_load"
  | "recovery_load"
  | "estimate_load";
export type AdaptiveExerciseArchetype =
  | "competition_lift"
  | "primary_compound"
  | "machine_compound"
  | "isolation"
  | "power"
  | "duration_bodyweight"
  | "unsupported";
export type AdaptiveExerciseCategory =
  | "competition_squat"
  | "competition_bench"
  | "competition_deadlift"
  | "standing_overhead_press"
  | "heavy_compound"
  | "machine_compound"
  | "isolation"
  | "power"
  | "duration_bodyweight"
  | "unsupported";
export type RecentPerformanceSignal = "unknown" | "underloaded" | "appropriate" | "overreached" | "plateau" | "improving";
type MappingSource = "provided_archetype" | "provided_category" | "movement_pattern" | "name" | "fallback";
type CompetitionLiftKind = "squat" | "bench" | "deadlift" | null;

export interface AdaptiveRepPrescriptionContext {
  goal: AdaptiveProgrammingGoal;
  exerciseName: string;
  exerciseArchetype?: AdaptiveExerciseArchetype;
  exerciseCategory?: AdaptiveExerciseCategory;
  movementPattern?: MovementPattern;
  trainingPhase: AdaptiveTrainingPhase;
  setObjective?: AdaptiveSetObjective;
  coachingBias?: AdaptiveCoachingBias;
  prescribedRange?: RepRange;
  exerciseExposureCount?: number;
  loadEstimateConfidence?: number;
  recoveryFlag?: boolean;
  recentPerformanceSignal?: RecentPerformanceSignal;
  fatigueCost?: ExerciseFatigueCost;
}

export interface AdaptiveRepPrescription {
  prescription_type: AdaptiveRepPrescriptionType;
  target_reps?: number;
  rep_range?: RepRange;
  amrap_cap?: number;
  target_seconds?: number;
  duration_range?: RepRange;
  load_strategy: AdaptiveLoadStrategy;
  set_objective: AdaptiveSetObjective;
  coaching_bias: AdaptiveCoachingBias;
  confidence: number;
  short_reason: string;
  debug_reasons: string[];
}

const SHORT_REASON_LIMIT = 80;
const HIGH_RISK_MOVEMENTS = new Set<MovementPattern>(["squat", "hinge"]);
const COMPETITION_LIFTS = new Set(["competition squat", "competition bench press", "competition deadlift"]);
const PRIMARY_COMPOUNDS = new Set(["standing overhead press", "barbell row", "incline dumbbell press", "leg press", "romanian deadlift"]);
const MACHINE_COMPOUNDS = new Set(["chest press", "lat pulldown", "chest supported row"]);
const ISOLATIONS = new Set(["leg extension", "hamstring curl", "lateral raise", "cable curl", "triceps pushdown"]);
const POWER_EXERCISES = new Set(["box jump", "medicine ball throw", "speed squat", "speed bench"]);
const DURATION_BODYWEIGHT = new Set(["plank", "dead hang", "farmer carry"]);

export function decideAdaptiveRepPrescription(context: AdaptiveRepPrescriptionContext): AdaptiveRepPrescription {
  const mapping = resolveExerciseMapping(context);
  const archetype = mapping.archetype;
  const competitionLiftKind = mapping.competitionLiftKind;
  const prescribedRange = normaliseRange(context.prescribedRange, archetype);
  const setObjective = resolveSetObjective(context, archetype);
  const coachingBias = resolveCoachingBias(context, archetype, setObjective);
  const debug = [
    `goal ${context.goal}`,
    `phase ${context.trainingPhase}`,
    `archetype ${archetype}`,
    `mapping ${mapping.source}`,
    ...(competitionLiftKind ? [`competition lift ${competitionLiftKind}`] : []),
    `objective ${setObjective}`,
    `bias ${coachingBias}`,
  ];

  if (archetype === "duration_bodyweight") {
    return durationPrescription(context, prescribedRange, setObjective, coachingBias, mapping.source, debug);
  }

  if (setObjective === "recovery" || context.recoveryFlag || context.trainingPhase === "deload") {
    return prescription({
      prescription_type: "recovery_reps",
      target_reps: recoveryTarget(archetype, prescribedRange),
      rep_range: lowerStressRange(prescribedRange),
      load_strategy: "recovery_load",
      set_objective: "recovery",
      coaching_bias: "recovery",
      confidence: confidence(context, 84, mapping.source, archetype),
      short_reason: "Recovery set.",
      debug_reasons: [...debug, "recovery context suppresses AMRAP and aggressive checks"],
    });
  }

  if (archetype === "power") {
    return powerPrescription(context, prescribedRange, setObjective, mapping.source, debug);
  }

  if (
    (context.goal === "strength" || context.goal === "build_muscle_strength" || context.goal === "athletic_performance") &&
    (context.trainingPhase === "peak" || setObjective === "performance" || coachingBias === "peak")
  ) {
    return peakPrescription(context, archetype, competitionLiftKind, prescribedRange, setObjective, coachingBias, mapping.source, debug);
  }

  if (setObjective === "verification") {
    return prescription({
      prescription_type: "top_range_check",
      rep_range: prescribedRange,
      load_strategy: "use_current_load",
      set_objective: setObjective,
      coaching_bias: coachingBias,
      confidence: confidence(context, 82, mapping.source, archetype),
      short_reason: "Top-range check.",
      debug_reasons: [...debug, "verification asks for clean top-range evidence without full AMRAP cost"],
    });
  }

  if (setObjective === "calibration") {
    return calibrationPrescription(context, archetype, competitionLiftKind, prescribedRange, coachingBias, mapping.source, debug);
  }

  if (context.goal === "strength") {
    return strengthPrescription(context, archetype, competitionLiftKind, prescribedRange, coachingBias, mapping.source, debug);
  }

  if (context.goal === "build_muscle_strength") {
    return buildMuscleStrengthPrescription(context, archetype, competitionLiftKind, prescribedRange, coachingBias, mapping.source, debug);
  }

  if (context.goal === "athletic_performance") {
    return athleticPerformancePrescription(context, archetype, competitionLiftKind, prescribedRange, coachingBias, mapping.source, debug);
  }

  if (context.goal === "get_lean") {
    return getLeanPrescription(context, archetype, competitionLiftKind, prescribedRange, coachingBias, mapping.source, debug);
  }

  if (context.goal === "maintenance") {
    return maintenancePrescription(context, archetype, competitionLiftKind, prescribedRange, coachingBias, mapping.source, debug);
  }

  return hypertrophyPrescription(context, archetype, competitionLiftKind, prescribedRange, coachingBias, mapping.source, debug);
}

export function inferExerciseArchetype(exerciseName: string): AdaptiveExerciseArchetype {
  const key = exerciseName.trim().toLowerCase();
  if (COMPETITION_LIFTS.has(key)) return "competition_lift";
  if (PRIMARY_COMPOUNDS.has(key)) return "primary_compound";
  if (MACHINE_COMPOUNDS.has(key)) return "machine_compound";
  if (ISOLATIONS.has(key)) return "isolation";
  if (POWER_EXERCISES.has(key)) return "power";
  if (DURATION_BODYWEIGHT.has(key)) return "duration_bodyweight";
  return "unsupported";
}

function resolveExerciseMapping(context: AdaptiveRepPrescriptionContext): {
  archetype: AdaptiveExerciseArchetype;
  competitionLiftKind: CompetitionLiftKind;
  source: MappingSource;
} {
  if (context.exerciseArchetype) {
    return {
      archetype: context.exerciseArchetype,
      competitionLiftKind: inferCompetitionLiftKind(context),
      source: "provided_archetype",
    };
  }

  if (context.exerciseCategory) {
    return {
      archetype: archetypeFromCategory(context.exerciseCategory),
      competitionLiftKind: competitionKindFromCategory(context.exerciseCategory) ?? inferCompetitionLiftKind(context),
      source: "provided_category",
    };
  }

  const movementArchetype = archetypeFromMovementPattern(context.movementPattern);
  if (movementArchetype) {
    return {
      archetype: movementArchetype,
      competitionLiftKind: inferCompetitionLiftKind(context),
      source: "movement_pattern",
    };
  }

  const nameArchetype = inferExerciseArchetype(context.exerciseName);
  return {
    archetype: nameArchetype,
    competitionLiftKind: inferCompetitionLiftKind(context),
    source: nameArchetype === "unsupported" ? "fallback" : "name",
  };
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

function competitionKindFromCategory(category: AdaptiveExerciseCategory): CompetitionLiftKind {
  if (category === "competition_squat") return "squat";
  if (category === "competition_bench") return "bench";
  if (category === "competition_deadlift") return "deadlift";
  return null;
}

function inferCompetitionLiftKind(context: Pick<AdaptiveRepPrescriptionContext, "exerciseName" | "movementPattern" | "exerciseCategory">): CompetitionLiftKind {
  const fromCategory = context.exerciseCategory ? competitionKindFromCategory(context.exerciseCategory) : null;
  if (fromCategory) return fromCategory;
  const key = context.exerciseName.trim().toLowerCase();
  if (key.includes("deadlift")) return "deadlift";
  if (key.includes("bench")) return "bench";
  if (key.includes("squat")) return "squat";
  if (context.movementPattern === "hinge") return "deadlift";
  if (context.movementPattern === "squat") return "squat";
  if (context.movementPattern === "horizontal_push") return "bench";
  return null;
}

function hypertrophyPrescription(
  context: AdaptiveRepPrescriptionContext,
  archetype: AdaptiveExerciseArchetype,
  competitionLiftKind: CompetitionLiftKind,
  prescribedRange: RepRange,
  coachingBias: AdaptiveCoachingBias,
  mappingSource: MappingSource,
  debug: string[],
) {
  if (competitionLiftKind === "deadlift") {
    const range = intersectRange(prescribedRange, { min: 5, max: 8 });
    return prescription({
      prescription_type: "fixed_reps",
      target_reps: fitTargetToRange(6, range),
      rep_range: range,
      load_strategy: "conservative_load",
      set_objective: "productive",
      coaching_bias: "tension",
      confidence: confidence(context, 74, mappingSource, archetype),
      short_reason: `${fitTargetToRange(6, range)} controlled reps.`,
      debug_reasons: [...debug, "deadlift hypertrophy work avoids high-rep fatigue drift"],
    });
  }

  const target =
    coachingBias === "tension"
      ? 8
      : coachingBias === "metabolic"
        ? archetype === "isolation"
          ? 12
          : 12
        : 10;
  return prescription({
    prescription_type: "fixed_reps",
    target_reps: fitTargetToRange(target, prescribedRange),
    rep_range: prescribedRange,
    load_strategy: archetype === "isolation" || archetype === "machine_compound" ? "use_current_load" : "conservative_load",
    set_objective: "productive",
    coaching_bias: coachingBias,
    confidence: confidence(context, archetype === "unsupported" ? 64 : 82, mappingSource, archetype),
    short_reason: `${fitTargetToRange(target, prescribedRange)} reps.`,
    debug_reasons: [...debug, "hypertrophy productive work uses fixed reps by default"],
  });
}

function strengthPrescription(
  context: AdaptiveRepPrescriptionContext,
  archetype: AdaptiveExerciseArchetype,
  competitionLiftKind: CompetitionLiftKind,
  prescribedRange: RepRange,
  coachingBias: AdaptiveCoachingBias,
  mappingSource: MappingSource,
  debug: string[],
) {
  if (archetype === "competition_lift") {
    const { range, target, loadStrategy } = competitionStrengthPrescription(context.trainingPhase, competitionLiftKind);
    return prescription({
      prescription_type: "fixed_reps",
      target_reps: target,
      rep_range: range,
      load_strategy: loadStrategy,
      set_objective: "productive",
      coaching_bias: coachingBias === "balanced" ? "skill" : coachingBias,
      confidence: confidence(context, competitionLiftKind ? 84 : 76, mappingSource, archetype),
      short_reason: `${target} reps.`,
      debug_reasons: [...debug, "strength competition lift uses Prilepin-inspired low-rep boundaries", ...(competitionLiftKind === "deadlift" ? ["deadlift uses stricter fatigue-aware limits"] : [])],
    });
  }

  const range = archetype === "isolation" ? { min: 8, max: 15 } : archetype === "machine_compound" ? { min: 6, max: 10 } : { min: 5, max: 8 };
  const target = archetype === "primary_compound" ? 6 : archetype === "isolation" ? 12 : 8;
  return prescription({
    prescription_type: "fixed_reps",
    target_reps: fitTargetToRange(target, range),
    rep_range: range,
    load_strategy: "conservative_load",
    set_objective: "productive",
      coaching_bias: archetype === "isolation" ? coachingBias : coachingBias === "balanced" ? "tension" : coachingBias,
      confidence: confidence(context, 78, mappingSource, archetype),
      short_reason: `${fitTargetToRange(target, range)} reps.`,
      debug_reasons: [...debug, archetype === "isolation" ? "strength isolation support uses moderate reps, not heavy low-rep defaults" : "secondary strength work uses support-zone reps"],
  });
}

function buildMuscleStrengthPrescription(
  context: AdaptiveRepPrescriptionContext,
  archetype: AdaptiveExerciseArchetype,
  competitionLiftKind: CompetitionLiftKind,
  prescribedRange: RepRange,
  coachingBias: AdaptiveCoachingBias,
  mappingSource: MappingSource,
  debug: string[],
) {
  if (archetype === "competition_lift" || archetype === "primary_compound") {
    const deadliftControlled = competitionLiftKind === "deadlift" || (archetype === "primary_compound" && context.movementPattern === "hinge" && context.fatigueCost === "high");
    const range = deadliftControlled
      ? context.trainingPhase === "intensification"
        ? { min: 2, max: 5 }
        : { min: 3, max: 6 }
      : context.trainingPhase === "intensification"
        ? { min: 4, max: 8 }
        : { min: 5, max: 10 };
    const target = deadliftControlled ? (context.trainingPhase === "intensification" ? 3 : 5) : context.trainingPhase === "intensification" ? 5 : coachingBias === "tension" ? 8 : 8;
    return prescription({
      prescription_type: "fixed_reps",
      target_reps: target,
      rep_range: range,
      load_strategy: "conservative_load",
      set_objective: "productive",
      coaching_bias: coachingBias === "metabolic" ? "balanced" : coachingBias,
      confidence: confidence(context, 80, mappingSource, archetype),
      short_reason: `${target} reps.`,
      debug_reasons: [...debug, "build muscle + strength avoids pushing load and volume at once", ...(deadliftControlled ? ["deadlift/hinge work stays strength-biased and controlled"] : [])],
    });
  }

  const accessoryRange = archetype === "isolation" ? { min: 10, max: 15 } : { min: 8, max: 15 };
  return prescription({
    prescription_type: "fixed_reps",
    target_reps: fitTargetToRange(coachingBias === "metabolic" ? 12 : 10, accessoryRange),
    rep_range: accessoryRange,
    load_strategy: "use_current_load",
    set_objective: "productive",
    coaching_bias: coachingBias,
    confidence: confidence(context, 78, mappingSource, archetype),
    short_reason: `${fitTargetToRange(coachingBias === "metabolic" ? 12 : 10, accessoryRange)} reps.`,
    debug_reasons: [...debug, "accessory work supports muscle without forcing load progression"],
  });
}

function getLeanPrescription(
  context: AdaptiveRepPrescriptionContext,
  archetype: AdaptiveExerciseArchetype,
  competitionLiftKind: CompetitionLiftKind,
  prescribedRange: RepRange,
  coachingBias: AdaptiveCoachingBias,
  mappingSource: MappingSource,
  debug: string[],
) {
  const deadliftControlled = competitionLiftKind === "deadlift" || (context.movementPattern === "hinge" && context.fatigueCost === "high");
  const target = deadliftControlled ? 4 : archetype === "competition_lift" || archetype === "primary_compound" ? 6 : 10;
  const range = deadliftControlled ? { min: 2, max: 5 } : archetype === "competition_lift" || archetype === "primary_compound" ? { min: 5, max: 8 } : lowerStressRange(prescribedRange);
  return prescription({
    prescription_type: "fixed_reps",
    target_reps: fitTargetToRange(target, range),
    rep_range: range,
    load_strategy: "conservative_load",
    set_objective: "productive",
    coaching_bias: coachingBias === "metabolic" ? "balanced" : coachingBias,
    confidence: confidence(context, context.loadEstimateConfidence && context.loadEstimateConfidence < 60 ? 66 : 76, mappingSource, archetype),
    short_reason: `${fitTargetToRange(target, range)} controlled reps.`,
    debug_reasons: [...debug, "get lean preserves quality work and avoids unnecessary AMRAP fatigue"],
  });
}

function calibrationPrescription(
  context: AdaptiveRepPrescriptionContext,
  archetype: AdaptiveExerciseArchetype,
  competitionLiftKind: CompetitionLiftKind,
  prescribedRange: RepRange,
  coachingBias: AdaptiveCoachingBias,
  mappingSource: MappingSource,
  debug: string[],
) {
  const highRisk = isHighRisk(context, archetype);
  const deadliftRisk = competitionLiftKind === "deadlift" || (context.movementPattern === "hinge" && context.fatigueCost === "high");
  if (deadliftRisk) {
    const cap = Math.min(prescribedRange.max, Math.max(prescribedRange.min + 1, 4));
    return prescription({
      prescription_type: "capped_amrap",
      rep_range: intersectRange(prescribedRange, { min: 1, max: 6 }),
      amrap_cap: cap,
      load_strategy: "conservative_load",
      set_objective: "calibration",
      coaching_bias: "tension",
      confidence: confidence(context, 66, mappingSource, archetype),
      short_reason: `AMRAP, cap ${cap}.`,
      debug_reasons: [
        ...debug,
        "deadlift calibration never uses open AMRAP",
        ...(coachingBias !== "tension" ? ["intentionally overrides session intent for deadlift calibration safety"] : []),
      ],
    });
  }

  if (highRisk || context.loadEstimateConfidence === undefined || context.loadEstimateConfidence < 50) {
    const cap = highRisk ? Math.min(prescribedRange.max, Math.max(prescribedRange.min + 2, 5)) : undefined;
    return prescription({
      prescription_type: highRisk ? "capped_amrap" : "top_range_check",
      rep_range: prescribedRange,
      amrap_cap: cap,
      load_strategy: highRisk ? "conservative_load" : "estimate_load",
      set_objective: "calibration",
      coaching_bias: coachingBias,
      confidence: confidence(context, highRisk ? 70 : 66, mappingSource, archetype),
      short_reason: highRisk ? `AMRAP, cap ${cap}.` : "Load-finding check.",
      debug_reasons: [...debug, highRisk ? "high-risk calibration is capped" : "uncertain calibration uses top-range/load-finding check before AMRAP"],
    });
  }

  return prescription({
    prescription_type: "amrap",
    rep_range: prescribedRange,
    amrap_cap: prescribedRange.max,
    load_strategy: "estimate_load",
    set_objective: "calibration",
    coaching_bias: coachingBias,
    confidence: confidence(context, 74, mappingSource, archetype),
    short_reason: "AMRAP.",
    debug_reasons: [...debug, "low-risk known calibration can use AMRAP"],
  });
}

function peakPrescription(
  context: AdaptiveRepPrescriptionContext,
  archetype: AdaptiveExerciseArchetype,
  competitionLiftKind: CompetitionLiftKind,
  prescribedRange: RepRange,
  setObjective: AdaptiveSetObjective,
  coachingBias: AdaptiveCoachingBias,
  mappingSource: MappingSource,
  debug: string[],
) {
  const isSpecific = archetype === "competition_lift";
  const target = isSpecific ? (competitionLiftKind === "deadlift" || context.recentPerformanceSignal === "improving" ? 1 : 2) : 3;
  const range = isSpecific ? (competitionLiftKind === "deadlift" ? { min: 1, max: 2 } : { min: 1, max: 3 }) : { min: 2, max: 5 };
  return prescription({
    prescription_type: "fixed_reps",
    target_reps: fitTargetToRange(target, range),
    rep_range: range,
    load_strategy: isSpecific ? "heavier_specific_load" : "conservative_load",
    set_objective: setObjective === "performance" ? "performance" : "verification",
    coaching_bias: coachingBias === "balanced" ? "peak" : coachingBias,
    confidence: confidence(context, isSpecific ? 82 : 72, mappingSource, archetype),
    short_reason: `${fitTargetToRange(target, range)} reps.`,
    debug_reasons: [...debug, "peak prescription favours specificity, low volume, and high intensity"],
  });
}

function powerPrescription(context: AdaptiveRepPrescriptionContext, prescribedRange: RepRange, setObjective: AdaptiveSetObjective, mappingSource: MappingSource, debug: string[]) {
  const range = context.exerciseName.toLowerCase().includes("jump") || context.exerciseName.toLowerCase().includes("throw") ? { min: 2, max: 4 } : { min: 1, max: 3 };
  const resolvedObjective = setObjective === "recovery" || setObjective === "performance" || setObjective === "verification" || setObjective === "calibration" ? setObjective : "productive";
  return prescription({
    prescription_type: "fixed_reps",
    target_reps: midpoint(range),
    rep_range: range,
    load_strategy: "quality_speed_load",
    set_objective: resolvedObjective,
    coaching_bias: "speed_power",
    confidence: confidence(context, 80, mappingSource, "power"),
    short_reason: `${midpoint(range)} fast reps.`,
    debug_reasons: [
      ...debug,
      `original range ${prescribedRange.min}-${prescribedRange.max}`,
      "power work stays low fatigue; no bar-speed claims",
      ...(context.coachingBias && context.coachingBias !== "speed_power" ? ["intentionally overrides session intent for true power movement bias"] : []),
    ],
  });
}

function athleticPerformancePrescription(
  context: AdaptiveRepPrescriptionContext,
  archetype: AdaptiveExerciseArchetype,
  competitionLiftKind: CompetitionLiftKind,
  prescribedRange: RepRange,
  coachingBias: AdaptiveCoachingBias,
  mappingSource: MappingSource,
  debug: string[],
) {
  if (archetype === "competition_lift") {
    const { range, target } = competitionStrengthPrescription("accumulation", competitionLiftKind);
    return prescription({
      prescription_type: "fixed_reps",
      target_reps: target,
      rep_range: competitionLiftKind === "deadlift" ? intersectRange(range, { min: 2, max: 4 }) : range,
      load_strategy: "conservative_load",
      set_objective: "productive",
      coaching_bias: "skill",
      confidence: confidence(context, 76, mappingSource, archetype),
      short_reason: `${target} quality reps.`,
      debug_reasons: [...debug, "athletic performance non-power lift uses strength-support prescription"],
    });
  }

  if (archetype === "primary_compound") {
    const range = context.movementPattern === "hinge" ? { min: 3, max: 6 } : { min: 4, max: 8 };
    const target = context.movementPattern === "hinge" ? 4 : 6;
    return prescription({
      prescription_type: "fixed_reps",
      target_reps: target,
      rep_range: range,
      load_strategy: "conservative_load",
      set_objective: "productive",
      coaching_bias: "tension",
      confidence: confidence(context, 74, mappingSource, archetype),
      short_reason: `${target} quality reps.`,
      debug_reasons: [...debug, "athletic performance compound work supports force without power-fatigue confusion"],
    });
  }

  const range = archetype === "isolation" ? { min: 8, max: 15 } : { min: 6, max: 10 };
  const target = archetype === "isolation" ? 12 : 8;
  return prescription({
    prescription_type: "fixed_reps",
    target_reps: target,
    rep_range: range,
    load_strategy: "use_current_load",
    set_objective: "productive",
    coaching_bias: coachingBias === "speed_power" ? "balanced" : coachingBias,
    confidence: confidence(context, 70, mappingSource, archetype),
    short_reason: `${target} support reps.`,
    debug_reasons: [
      ...debug,
      "athletic performance accessory work stays conservative support work",
      ...(coachingBias === "speed_power" ? ["intentionally overrides session intent for athletic accessory support"] : []),
    ],
  });
}

function maintenancePrescription(
  context: AdaptiveRepPrescriptionContext,
  archetype: AdaptiveExerciseArchetype,
  competitionLiftKind: CompetitionLiftKind,
  prescribedRange: RepRange,
  coachingBias: AdaptiveCoachingBias,
  mappingSource: MappingSource,
  debug: string[],
) {
  if (archetype === "competition_lift") {
    const range = competitionLiftKind === "deadlift" ? { min: 2, max: 5 } : competitionLiftKind === "squat" ? { min: 3, max: 6 } : { min: 5, max: 8 };
    const target = competitionLiftKind === "deadlift" ? 3 : competitionLiftKind === "squat" ? 5 : 6;
    return prescription({
      prescription_type: "fixed_reps",
      target_reps: target,
      rep_range: range,
      load_strategy: "conservative_load",
      set_objective: "productive",
      coaching_bias: coachingBias === "recovery" ? "recovery" : "balanced",
      confidence: confidence(context, 74, mappingSource, archetype),
      short_reason: "Controlled work.",
      debug_reasons: [...debug, "maintenance uses category-specific controlled prescriptions"],
    });
  }

  const range = archetype === "isolation" ? { min: 10, max: 15 } : archetype === "primary_compound" ? { min: 6, max: 10 } : archetype === "machine_compound" ? { min: 8, max: 12 } : prescribedRange;
  const target = archetype === "isolation" ? 12 : clamp(midpoint(range), 6, 12);
  return prescription({
    prescription_type: "fixed_reps",
    target_reps: target,
    rep_range: range,
    load_strategy: archetype === "isolation" || archetype === "machine_compound" ? "use_current_load" : "conservative_load",
    set_objective: "productive",
    coaching_bias: coachingBias === "recovery" ? "recovery" : "balanced",
    confidence: confidence(context, 72, mappingSource, archetype),
    short_reason: "Controlled work.",
    debug_reasons: [...debug, "maintenance avoids aggressive AMRAP unless explicitly requested"],
  });
}

function durationPrescription(
  context: AdaptiveRepPrescriptionContext,
  prescribedRange: RepRange,
  setObjective: AdaptiveSetObjective,
  coachingBias: AdaptiveCoachingBias,
  mappingSource: MappingSource,
  debug: string[],
) {
  const isCarry = context.exerciseName.toLowerCase().includes("carry") || context.movementPattern === "carry";
  const range = setObjective === "recovery" ? lowerStressRange(prescribedRange) : prescribedRange;
  const targetSeconds = setObjective === "recovery" ? Math.max(15, range.min) : midpoint(range);
  return prescription({
    prescription_type: isCarry ? "duration_carry" : "duration_hold",
    target_seconds: targetSeconds,
    duration_range: range,
    rep_range: undefined,
    load_strategy: setObjective === "recovery" ? "recovery_load" : "use_current_load",
    set_objective: setObjective,
    coaching_bias: coachingBias,
    confidence: confidence(context, 72, mappingSource, "duration_bodyweight"),
    short_reason: isCarry ? "Carry for time." : "Hold the target time.",
    debug_reasons: [...debug, "duration/bodyweight prescription uses duration fields, not fake reps"],
  });
}

function competitionStrengthPrescription(
  phase: AdaptiveTrainingPhase,
  competitionLiftKind: CompetitionLiftKind,
): { range: RepRange; target: number; loadStrategy: AdaptiveLoadStrategy } {
  if (competitionLiftKind === "deadlift") {
    return {
      range: phase === "intensification" ? { min: 1, max: 4 } : { min: 2, max: 5 },
      target: phase === "intensification" ? 2 : 3,
      loadStrategy: phase === "intensification" ? "heavier_specific_load" : "conservative_load",
    };
  }
  if (competitionLiftKind === "bench") {
    return {
      range: phase === "intensification" ? { min: 2, max: 5 } : { min: 4, max: 6 },
      target: phase === "intensification" ? 3 : 5,
      loadStrategy: phase === "intensification" ? "heavier_specific_load" : "conservative_load",
    };
  }
  return {
    range: phase === "intensification" ? { min: 2, max: 5 } : { min: 3, max: 6 },
    target: phase === "intensification" ? 3 : 5,
    loadStrategy: phase === "intensification" ? "heavier_specific_load" : "conservative_load",
  };
}

function resolveSetObjective(
  context: AdaptiveRepPrescriptionContext,
  archetype: AdaptiveExerciseArchetype,
): AdaptiveSetObjective {
  if (context.setObjective) return context.setObjective;
  if (context.recoveryFlag || context.trainingPhase === "deload") return "recovery";
  if (context.trainingPhase === "peak") return archetype === "competition_lift" ? "performance" : "verification";
  if (context.goal === "get_lean" && (context.loadEstimateConfidence ?? 100) < 50) return "productive";
  if ((context.exerciseExposureCount ?? 3) <= 0 || (context.loadEstimateConfidence ?? 100) < 50) return "calibration";
  if (context.recentPerformanceSignal === "plateau") return "calibration";
  if (context.recentPerformanceSignal === "underloaded" || context.recentPerformanceSignal === "improving") return "verification";
  return "productive";
}

function resolveCoachingBias(
  context: AdaptiveRepPrescriptionContext,
  archetype: AdaptiveExerciseArchetype,
  setObjective: AdaptiveSetObjective,
): AdaptiveCoachingBias {
  if (context.coachingBias) return context.coachingBias;
  if (setObjective === "recovery" || context.trainingPhase === "deload") return "recovery";
  if (context.trainingPhase === "peak") return "peak";
  if (archetype === "power") return "speed_power";
  if (context.goal === "athletic_performance") return archetype === "isolation" || archetype === "machine_compound" ? "balanced" : "tension";
  if (context.goal === "strength") return archetype === "competition_lift" ? "skill" : "tension";
  if (archetype === "isolation") return "metabolic";
  if (archetype === "competition_lift" || archetype === "primary_compound") return "tension";
  return "balanced";
}

function normaliseRange(range: RepRange | undefined, archetype: AdaptiveExerciseArchetype): RepRange {
  if (range && Number.isFinite(range.min) && Number.isFinite(range.max) && range.min > 0 && range.max >= range.min) return range;
  if (archetype === "competition_lift") return { min: 3, max: 6 };
  if (archetype === "primary_compound") return { min: 6, max: 10 };
  if (archetype === "machine_compound") return { min: 8, max: 12 };
  if (archetype === "isolation") return { min: 10, max: 20 };
  if (archetype === "power") return { min: 1, max: 5 };
  if (archetype === "duration_bodyweight") return { min: 30, max: 45 };
  return { min: 8, max: 12 };
}

function lowerStressRange(range: RepRange): RepRange {
  const width = Math.max(2, Math.min(4, range.max - range.min));
  return { min: range.min, max: range.min + width };
}

function recoveryTarget(archetype: AdaptiveExerciseArchetype, range: RepRange) {
  if (archetype === "competition_lift" || archetype === "primary_compound") return Math.max(3, range.min);
  return range.min;
}

function fitTargetToRange(target: number, range: RepRange) {
  return clamp(target, range.min, range.max);
}

function midpoint(range: RepRange) {
  return Math.round((range.min + range.max) / 2);
}

function isHighRisk(context: AdaptiveRepPrescriptionContext, archetype: AdaptiveExerciseArchetype) {
  if (context.fatigueCost === "high") return true;
  if (archetype === "competition_lift") return true;
  if (context.movementPattern && HIGH_RISK_MOVEMENTS.has(context.movementPattern)) return true;
  return false;
}

function confidence(context: AdaptiveRepPrescriptionContext, base: number, mappingSource: MappingSource, archetype: AdaptiveExerciseArchetype) {
  let value = base;
  const exposureCount = context.exerciseExposureCount ?? 3;
  const loadConfidence = context.loadEstimateConfidence ?? 75;
  if (exposureCount <= 0) value -= 12;
  else if (exposureCount < 2) value -= 6;
  else if (exposureCount >= 4) value += 4;
  if (loadConfidence < 50) value -= 12;
  else if (loadConfidence >= 85) value += 4;
  if (context.recoveryFlag) value -= 4;
  if (mappingSource === "name") value -= 4;
  if (mappingSource === "movement_pattern") value -= 6;
  if (mappingSource === "fallback" || archetype === "unsupported") value -= 14;
  if (context.goal === "athletic_performance" && archetype !== "power") value -= 4;
  return clamp(value, 0, 100);
}

function intersectRange(primary: RepRange, limit: RepRange): RepRange {
  const min = Math.max(primary.min, limit.min);
  const max = Math.min(primary.max, limit.max);
  if (max >= min) return { min, max };
  return limit;
}

function prescription(input: AdaptiveRepPrescription): AdaptiveRepPrescription {
  const shortReason = input.short_reason.length > SHORT_REASON_LIMIT ? input.short_reason.slice(0, SHORT_REASON_LIMIT).trimEnd() : input.short_reason;
  return {
    ...input,
    confidence: clamp(Math.round(input.confidence), 0, 100),
    short_reason: shortReason,
  };
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}
