import type { AdaptiveProgrammingGoal, AdaptiveTrainingPhase, RecentPerformanceSignal } from "@/domain/training/adaptive-rep-prescription";
import type { CycleRecoveryFlag, CycleStrategyContext, StressBudgetBias } from "@/domain/training/cycle-strategy-context";

export type AdaptiveStimulusSessionType = "push" | "pull" | "legs" | "upper" | "lower" | "full_body" | "power" | "conditioning" | "recovery" | "maintenance";
export type AdaptiveStimulusExperienceLevel = "beginner" | "intermediate" | "advanced";
export type AdaptiveStimulusKnownLimitation = "pain" | "low_back_fatigue" | "shoulder_irritation" | "elbow_irritation" | "knee_irritation" | "time_limited";
export type StimulusPriority = "required" | "important" | "optional";
export type StimulusSpecificity = "competition_specific" | "movement_specific" | "muscle_specific" | "general";
export type StimulusDesiredAdaptation = "strength" | "hypertrophy" | "power" | "skill" | "recovery" | "maintenance";
export type StimulusFatigueBudget = "low" | "moderate" | "high";
export type StimulusDeliveryConstraint =
  | "low_axial"
  | "low_joint_stress"
  | "high_specificity"
  | "low_skill"
  | "stable_path"
  | "unilateral_ok"
  | "machine_ok"
  | "free_weight_preferred"
  | "avoid_failure"
  | "avoid_amrap";

export interface AdaptiveStimulusPlannerContext {
  goal: AdaptiveProgrammingGoal;
  trainingPhase: AdaptiveTrainingPhase;
  cycleStrategyContext?: CycleStrategyContext;
  sessionType?: AdaptiveStimulusSessionType;
  recoveryFlag?: CycleRecoveryFlag;
  recentPerformanceSignal?: RecentPerformanceSignal;
  stressBudgetBias?: StressBudgetBias;
  userExperienceLevel?: AdaptiveStimulusExperienceLevel;
  knownLimitations?: AdaptiveStimulusKnownLimitation[];
}

export interface StimulusTarget {
  stimulus_id: string;
  target_region: string;
  movement_pattern: string;
  priority: StimulusPriority;
  specificity: StimulusSpecificity;
  desired_adaptation: StimulusDesiredAdaptation;
  fatigue_budget: StimulusFatigueBudget;
  delivery_constraints: StimulusDeliveryConstraint[];
  rationale: string;
  confidence: number;
}

export interface AdaptiveStimulusPlan {
  primary_stimuli: StimulusTarget[];
  secondary_stimuli: StimulusTarget[];
  optional_stimuli: StimulusTarget[];
  avoid_stimuli: string[];
  stress_budget_bias: StressBudgetBias;
  confidence: number;
  short_reason: string;
  debug_reasons: string[];
}

const SHORT_REASON_LIMIT = 80;

export function deriveAdaptiveStimulusPlan(context: AdaptiveStimulusPlannerContext): AdaptiveStimulusPlan {
  const recovery = context.recoveryFlag ?? "normal";
  const signal = context.recentPerformanceSignal ?? "appropriate";
  const limitations = context.knownLimitations ?? [];
  const stressBudget = stressBudgetFor(context, recovery, signal);
  const debug = [
    `goal ${context.goal}`,
    `phase ${context.trainingPhase}`,
    `session ${context.sessionType ?? "full_body"}`,
    `recovery ${recovery}`,
    `signal ${signal}`,
    `stress budget ${stressBudget}`,
    `experience ${context.userExperienceLevel ?? "intermediate"}`,
    `limitations ${limitations.length ? limitations.join(",") : "none"}`,
  ];

  if (context.trainingPhase === "deload" || recovery === "poor" || signal === "overreached" || context.sessionType === "recovery") {
    return buildPlan({
      primary: [
        stimulus("recovery_stimulus", "systemic", "whole_body", "required", "general", "recovery", "low", ["low_joint_stress", "avoid_failure", "avoid_amrap"], "Reduce fatigue while preserving training rhythm.", 88),
        stimulus("technical_practice", "skill", "primary_patterns", "important", "movement_specific", "skill", "low", ["low_joint_stress", "avoid_failure", "avoid_amrap"], "Keep movement quality without meaningful fatigue.", 82),
      ],
      secondary: [stimulus("low_stress_movement", "general", "whole_body", "important", "general", "maintenance", "low", ["low_axial", "low_joint_stress", "low_skill"], "Maintain movement exposure at low cost.", 80)],
      optional: [stimulus("mobility_control", "mobility", "controlled_range", "optional", "general", "recovery", "low", ["low_joint_stress", "low_skill"], "Add control work only if it does not extend fatigue.", 72)],
      avoid: ["amrap", "high_fatigue_compounds", "high_joint_stress", "maximal_loading"],
      stressBudget,
      confidence: confidenceFor(context, 86),
      reason: "Recovery and movement quality.",
      debug: [...debug, "recovery context selected low-stress stimulus"],
    });
  }

  const base = baseStimuliFor(context);
  const constrained = applyLimitations(base, limitations, stressBudget);
  return buildPlan({
    ...constrained,
    stressBudget,
    confidence: confidenceFor(context, base.confidence),
    reason: reasonFor(context, stressBudget),
    debug: [...debug, ...constrained.debug],
  });
}

function baseStimuliFor(context: AdaptiveStimulusPlannerContext) {
  if (context.goal === "strength") return strengthStimuli(context);
  if (context.goal === "hypertrophy") return hypertrophyStimuli(context);
  if (context.goal === "build_muscle_strength") return buildMuscleStrengthStimuli(context);
  if (context.goal === "athletic_performance") return athleticStimuli(context);
  if (context.goal === "get_lean") return getLeanStimuli(context);
  return maintenanceStimuli(context);
}

function strengthStimuli(context: AdaptiveStimulusPlannerContext) {
  const peak = context.trainingPhase === "peak";
  const session = context.sessionType ?? "full_body";
  const primary =
    session === "push" || session === "upper"
      ? [competitionBench("required", peak ? "high" : "moderate")]
      : session === "legs" || session === "lower"
        ? [competitionSquat("required", peak ? "high" : "moderate"), competitionDeadlift("important", peak ? "moderate" : "high")]
        : [competitionSquat("required", peak ? "high" : "moderate"), competitionBench("required", peak ? "high" : "moderate"), competitionDeadlift("important", "moderate")];
  const secondary = peak ? [technicalPractice()] : [overheadPress("important"), horizontalPull("important")];
  const optional = peak ? [] : [upperBackHypertrophy("optional"), tricepsHypertrophy("optional"), hamstringHypertrophy("optional")];
  return {
    primary,
    secondary,
    optional,
    avoid: peak ? ["junk_hypertrophy", "high_fatigue_optional_volume", "amrap"] : [],
    confidence: peak ? 84 : 80,
    debug: [peak ? "strength peak prioritises competition-specific anchors" : "strength accumulation keeps competition anchors plus support stimulus"],
  };
}

function hypertrophyStimuli(context: AdaptiveStimulusPlannerContext) {
  const session = context.sessionType ?? "full_body";
  if (session === "push" || session === "upper") {
    return {
      primary: [chestHypertrophy("required"), tricepsHypertrophy("important"), lateralDeltHypertrophy("important")],
      secondary: [upperChestHypertrophy("important"), frontDeltHypertrophy("optional")],
      optional: [technicalPractice()],
      avoid: [],
      confidence: 80,
      debug: ["hypertrophy push selected muscle-specific pressing and delt/triceps stimulus"],
    };
  }
  if (session === "pull") {
    return {
      primary: [upperBackHypertrophy("required"), latHypertrophy("required"), bicepsHypertrophy("important")],
      secondary: [horizontalPull("important")],
      optional: [abdominalHypertrophy("optional")],
      avoid: [],
      confidence: 80,
      debug: ["hypertrophy pull selected upper-back, lat, and biceps stimulus"],
    };
  }
  if (session === "legs" || session === "lower") {
    return {
      primary: [quadHypertrophy("required"), hamstringHypertrophy("required"), gluteHypertrophy("important")],
      secondary: [calfHypertrophy("important"), abdominalHypertrophy("optional")],
      optional: [],
      avoid: [],
      confidence: 80,
      debug: ["hypertrophy legs selected quad, hamstring, and glute stimulus"],
    };
  }
  return {
    primary: [chestHypertrophy("important"), upperBackHypertrophy("important"), quadHypertrophy("important")],
    secondary: [hamstringHypertrophy("important"), lateralDeltHypertrophy("optional"), bicepsHypertrophy("optional"), tricepsHypertrophy("optional")],
    optional: [calfHypertrophy("optional"), abdominalHypertrophy("optional")],
    avoid: [],
    confidence: 76,
    debug: ["hypertrophy full-body selected broad muscle-specific stimulus"],
  };
}

function buildMuscleStrengthStimuli(context: AdaptiveStimulusPlannerContext) {
  const session = context.sessionType ?? "full_body";
  const heavyAnchors =
    session === "push" || session === "upper"
      ? [competitionBench("required", "moderate")]
      : session === "legs" || session === "lower"
        ? [competitionSquat("required", "moderate"), competitionDeadlift("important", "moderate")]
        : [competitionSquat("required", "moderate"), competitionBench("required", "moderate")];
  const muscleSupport =
    session === "push" || session === "upper"
      ? [chestHypertrophy("important"), tricepsHypertrophy("important"), upperBackHypertrophy("important")]
      : session === "legs" || session === "lower"
        ? [quadHypertrophy("important"), hamstringHypertrophy("important"), gluteHypertrophy("important")]
        : [chestHypertrophy("important"), upperBackHypertrophy("important"), quadHypertrophy("important"), hamstringHypertrophy("important")];
  return {
    primary: heavyAnchors,
    secondary: muscleSupport,
    optional: context.trainingPhase === "intensification" ? [] : [lateralDeltHypertrophy("optional"), abdominalHypertrophy("optional")],
    avoid: ["simultaneous_high_load_and_high_volume_push"],
    confidence: 78,
    debug: ["build muscle + strength preserved heavy anchors plus recoverable hypertrophy support"],
  };
}

function athleticStimuli(context: AdaptiveStimulusPlannerContext) {
  const powerSession = context.sessionType === "power" || context.trainingPhase === "peak";
  return {
    primary: powerSession ? [lowerBodyPower("required"), speedStrength("required"), landingSkill("important")] : [speedStrength("required"), technicalPractice()],
    secondary: [trunkStiffness("important"), upperBodyPower("important")],
    optional: powerSession ? [] : [horizontalPull("optional"), gluteHypertrophy("optional")],
    avoid: ["high_fatigue_bodybuilding", "failure_training", "velocity_claims_without_sensors"],
    confidence: 78,
    debug: ["athletic performance prioritised power, speed-strength, and movement quality"],
  };
}

function getLeanStimuli(context: AdaptiveStimulusPlannerContext) {
  const conserve = context.recoveryFlag === "limited" || context.stressBudgetBias === "conserve" || context.cycleStrategyContext?.stress_budget_bias === "conserve";
  return {
    primary: [competitionBench("important", "moderate"), competitionSquat("important", conserve ? "low" : "moderate"), upperBackHypertrophy("important")],
    secondary: [chestHypertrophy("important"), quadHypertrophy("important")],
    optional: conserve ? [] : [lateralDeltHypertrophy("optional"), abdominalHypertrophy("optional")],
    avoid: conserve ? ["unnecessary_metabolic_fatigue", "amrap", "high_optional_volume"] : ["unnecessary_metabolic_fatigue"],
    confidence: 76,
    debug: ["get lean preserved strength quality while controlling fatigue"],
  };
}

function maintenanceStimuli(context: AdaptiveStimulusPlannerContext) {
  const session = context.sessionType ?? "full_body";
  const fullBody = [competitionSquat("important", "moderate"), competitionBench("important", "moderate"), horizontalPull("important")];
  return {
    primary: session === "full_body" || session === "maintenance" ? fullBody : sessionStimuli(session),
    secondary: [lowStressMovement()],
    optional: [],
    avoid: ["aggressive_optional_volume", "unnecessary_performance_testing"],
    confidence: 76,
    debug: ["maintenance preserved key patterns with economical stress"],
  };
}

function applyLimitations(
  base: { primary: StimulusTarget[]; secondary: StimulusTarget[]; optional: StimulusTarget[]; avoid: string[]; confidence: number; debug: string[] },
  limitations: AdaptiveStimulusKnownLimitation[],
  stressBudget: StressBudgetBias,
) {
  let primary = base.primary;
  let secondary = base.secondary;
  let optional = base.optional;
  const avoid = [...base.avoid];
  const debug = [...base.debug];

  if (limitations.includes("time_limited")) {
    optional = [];
    avoid.push("optional_stimulus");
    debug.push("time limited trimmed optional stimuli first");
  }

  if (stressBudget === "conserve") {
    optional = [];
    primary = primary.map(lowerFatigue);
    secondary = secondary.map(lowerFatigue);
    avoid.push("high_fatigue_optional_volume");
    debug.push("conserve stress budget lowered fatigue and removed optional stimuli");
  }

  if (limitations.includes("low_back_fatigue")) {
    primary = primary.map((target) => (isAxialHingeOrSquat(target) ? constrain(target, ["low_axial", "avoid_failure", "avoid_amrap"], "low", "Low-back fatigue requires lower axial stress.") : target));
    secondary = secondary.filter((target) => !isAxialHingeOrSquat(target) || target.priority === "required").map((target) => (isAxialHingeOrSquat(target) ? constrain(target, ["low_axial", "avoid_failure", "avoid_amrap"], "low", "Low-back fatigue keeps this conservative.") : target));
    optional = optional.filter((target) => !isAxialHingeOrSquat(target));
    avoid.push("high_axial_hinge_stress", "high_axial_squat_stress");
    debug.push("low back fatigue constrained axial hinge and squat stress");
  }

  if (limitations.includes("shoulder_irritation")) {
    primary = primary.map((target) => (isPressingOrShoulder(target) ? constrain(target, ["low_joint_stress", "stable_path", "avoid_failure"], "low", "Shoulder irritation requires conservative pressing stress.") : target));
    secondary = secondary.map((target) => (isPressingOrShoulder(target) ? constrain(target, ["low_joint_stress", "stable_path", "avoid_failure"], "low", "Shoulder irritation lowers pressing cost.") : target));
    optional = optional.filter((target) => !isPressingOrShoulder(target));
    avoid.push("aggressive_pressing", "aggressive_overhead_stress");
    debug.push("shoulder irritation constrained pressing and overhead stimulus");
  }

  if (limitations.includes("elbow_irritation")) {
    secondary = secondary.map((target) => (isDirectArm(target) ? constrain(target, ["low_joint_stress", "avoid_failure"], "low", "Elbow irritation lowers direct arm stress.") : target));
    optional = optional.filter((target) => !isDirectArm(target));
    avoid.push("high_direct_arm_stress");
    debug.push("elbow irritation reduced direct arm stimulus");
  }

  if (limitations.includes("knee_irritation")) {
    primary = primary.map((target) => (isKneeDominant(target) ? constrain(target, ["low_joint_stress", "stable_path", "avoid_failure"], "low", "Knee irritation requires conservative knee-dominant stress.") : target));
    secondary = secondary.map((target) => (isKneeDominant(target) ? constrain(target, ["low_joint_stress", "stable_path", "avoid_failure"], "low", "Knee irritation lowers knee-extension stress.") : target));
    optional = optional.filter((target) => !isKneeDominant(target));
    avoid.push("aggressive_knee_extension_stress");
    debug.push("knee irritation constrained knee-dominant stimulus");
  }

  if (limitations.includes("pain")) {
    primary = primary.map((target) => constrain(target, ["low_joint_stress", "avoid_failure", "avoid_amrap"], "low", "Pain flag keeps stimulus conservative until clarified."));
    secondary = secondary.map((target) => constrain(target, ["low_joint_stress", "avoid_failure", "avoid_amrap"], "low", "Pain flag lowers stress cost."));
    optional = [];
    avoid.push("painful_patterns", "failure_training", "amrap");
    debug.push("pain limitation forced conservative stimulus");
  }

  return { primary, secondary, optional, avoid: unique(avoid), confidence: base.confidence, debug };
}

function buildPlan(input: {
  primary: StimulusTarget[];
  secondary: StimulusTarget[];
  optional: StimulusTarget[];
  avoid: string[];
  stressBudget: StressBudgetBias;
  confidence: number;
  reason: string;
  debug: string[];
}): AdaptiveStimulusPlan {
  return {
    primary_stimuli: input.primary,
    secondary_stimuli: input.secondary,
    optional_stimuli: input.optional,
    avoid_stimuli: unique(input.avoid),
    stress_budget_bias: input.stressBudget,
    confidence: clamp(Math.round(input.confidence), 0, 100),
    short_reason: input.reason.length > SHORT_REASON_LIMIT ? input.reason.slice(0, SHORT_REASON_LIMIT).trimEnd() : input.reason,
    debug_reasons: input.debug,
  };
}

function stressBudgetFor(context: AdaptiveStimulusPlannerContext, recovery: CycleRecoveryFlag, signal: RecentPerformanceSignal): StressBudgetBias {
  if (context.stressBudgetBias) return context.stressBudgetBias;
  if (context.cycleStrategyContext?.stress_budget_bias) return context.cycleStrategyContext.stress_budget_bias;
  if (context.trainingPhase === "deload" || recovery === "poor" || signal === "overreached") return "conserve";
  if (recovery === "limited" || context.goal === "get_lean" || context.trainingPhase === "peak") return "maintain";
  if (recovery === "good" && signal === "improving") return "spend";
  return "maintain";
}

function reasonFor(context: AdaptiveStimulusPlannerContext, stressBudget: StressBudgetBias) {
  if (stressBudget === "conserve") return "Conserve stress while preserving key stimulus.";
  if (context.goal === "strength") return "Prioritise strength-specific stimulus.";
  if (context.goal === "hypertrophy") return "Prioritise quality muscle stimulus.";
  if (context.goal === "build_muscle_strength") return "Blend heavy anchors with quality volume.";
  if (context.goal === "athletic_performance") return "Prioritise power and movement quality.";
  if (context.goal === "get_lean") return "Preserve performance with recoverable work.";
  return "Preserve key patterns economically.";
}

function confidenceFor(context: AdaptiveStimulusPlannerContext, base: number) {
  let confidence = base;
  if (context.cycleStrategyContext) confidence = Math.min(confidence + 4, context.cycleStrategyContext.confidence + 8);
  if (context.knownLimitations?.length) confidence -= 4;
  if (context.recentPerformanceSignal === "unknown") confidence -= 4;
  return clamp(confidence, 45, 92);
}

function stimulus(
  stimulusId: string,
  targetRegion: string,
  movementPattern: string,
  priority: StimulusPriority,
  specificity: StimulusSpecificity,
  desiredAdaptation: StimulusDesiredAdaptation,
  fatigueBudget: StimulusFatigueBudget,
  deliveryConstraints: StimulusDeliveryConstraint[],
  rationale: string,
  confidence: number,
): StimulusTarget {
  return {
    stimulus_id: stimulusId,
    target_region: targetRegion,
    movement_pattern: movementPattern,
    priority,
    specificity,
    desired_adaptation: desiredAdaptation,
    fatigue_budget: fatigueBudget,
    delivery_constraints: unique(deliveryConstraints),
    rationale,
    confidence,
  };
}

function competitionSquat(priority: StimulusPriority, fatigue: StimulusFatigueBudget) {
  return stimulus("competition_squat_strength", "lower_body", "squat", priority, "competition_specific", "strength", fatigue, ["high_specificity", "free_weight_preferred", "avoid_failure"], "Build or preserve specific squat strength.", 84);
}

function competitionBench(priority: StimulusPriority, fatigue: StimulusFatigueBudget) {
  return stimulus("competition_bench_strength", "upper_body_pressing", "horizontal_push", priority, "competition_specific", "strength", fatigue, ["high_specificity", "free_weight_preferred", "avoid_failure"], "Build or preserve specific bench strength.", 84);
}

function competitionDeadlift(priority: StimulusPriority, fatigue: StimulusFatigueBudget) {
  return stimulus("competition_deadlift_strength", "posterior_chain", "hinge", priority, "competition_specific", "strength", fatigue, ["high_specificity", "free_weight_preferred", "avoid_failure", "avoid_amrap"], "Build or preserve specific deadlift strength without unnecessary fatigue.", 82);
}

function overheadPress(priority: StimulusPriority) {
  return stimulus("overhead_press_strength", "upper_body_pressing", "vertical_push", priority, "movement_specific", "strength", "moderate", ["free_weight_preferred", "avoid_failure"], "Support upper-body strength and pressing capacity.", 76);
}

function horizontalPull(priority: StimulusPriority) {
  return stimulus("horizontal_pull_strength", "upper_back", "horizontal_pull", priority, "movement_specific", "strength", "moderate", ["stable_path", "avoid_failure"], "Support upper-back strength and pressing balance.", 76);
}

function chestHypertrophy(priority: StimulusPriority) {
  return stimulus("chest_hypertrophy", "chest", "horizontal_push", priority, "muscle_specific", "hypertrophy", "moderate", ["stable_path", "machine_ok"], "Create quality chest stimulus.", 80);
}

function upperChestHypertrophy(priority: StimulusPriority) {
  return stimulus("upper_chest_hypertrophy", "upper_chest", "incline_push", priority, "muscle_specific", "hypertrophy", "moderate", ["stable_path", "machine_ok"], "Add upper-chest-biased hypertrophy stimulus.", 78);
}

function tricepsHypertrophy(priority: StimulusPriority) {
  return stimulus("triceps_hypertrophy", "triceps", "elbow_extension", priority, "muscle_specific", "hypertrophy", "low", ["stable_path", "low_skill", "machine_ok"], "Add low-systemic triceps stimulus.", 78);
}

function frontDeltHypertrophy(priority: StimulusPriority) {
  return stimulus("front_delt_hypertrophy", "front_delt", "shoulder_flexion", priority, "muscle_specific", "hypertrophy", "low", ["low_skill", "stable_path"], "Add front-delt support only when useful.", 70);
}

function lateralDeltHypertrophy(priority: StimulusPriority) {
  return stimulus("lateral_delt_hypertrophy", "lateral_delt", "shoulder_abduction", priority, "muscle_specific", "hypertrophy", "low", ["low_skill", "stable_path", "machine_ok"], "Add low-fatigue lateral-delt stimulus.", 78);
}

function upperBackHypertrophy(priority: StimulusPriority) {
  return stimulus("upper_back_hypertrophy", "upper_back", "horizontal_pull", priority, "muscle_specific", "hypertrophy", "moderate", ["stable_path", "machine_ok"], "Build upper-back volume with controlled fatigue.", 80);
}

function latHypertrophy(priority: StimulusPriority) {
  return stimulus("lat_hypertrophy", "lats", "vertical_pull", priority, "muscle_specific", "hypertrophy", "moderate", ["stable_path", "machine_ok"], "Create lat-biased pulling stimulus.", 80);
}

function bicepsHypertrophy(priority: StimulusPriority) {
  return stimulus("biceps_hypertrophy", "biceps", "elbow_flexion", priority, "muscle_specific", "hypertrophy", "low", ["low_skill", "stable_path"], "Add low-systemic biceps stimulus.", 76);
}

function quadHypertrophy(priority: StimulusPriority) {
  return stimulus("quad_hypertrophy", "quads", "knee_extension", priority, "muscle_specific", "hypertrophy", "moderate", ["stable_path", "machine_ok"], "Create quality quad stimulus.", 80);
}

function hamstringHypertrophy(priority: StimulusPriority) {
  return stimulus("hamstring_hypertrophy", "hamstrings", "knee_flexion_or_hinge", priority, "muscle_specific", "hypertrophy", "moderate", ["stable_path", "machine_ok"], "Create hamstring stimulus without unnecessary systemic cost.", 80);
}

function gluteHypertrophy(priority: StimulusPriority) {
  return stimulus("glute_hypertrophy", "glutes", "hip_extension", priority, "muscle_specific", "hypertrophy", "moderate", ["stable_path", "machine_ok"], "Add hip-extension stimulus for glutes.", 78);
}

function calfHypertrophy(priority: StimulusPriority) {
  return stimulus("calf_hypertrophy", "calves", "plantar_flexion", priority, "muscle_specific", "hypertrophy", "low", ["stable_path", "low_skill"], "Add local calf stimulus at low systemic cost.", 74);
}

function abdominalHypertrophy(priority: StimulusPriority) {
  return stimulus("abdominal_hypertrophy", "abdominals", "trunk_flexion_or_bracing", priority, "muscle_specific", "hypertrophy", "low", ["low_skill", "stable_path"], "Add trunk stimulus without disrupting main work.", 74);
}

function lowerBodyPower(priority: StimulusPriority) {
  return stimulus("lower_body_power", "lower_body", "jump_or_explosive_extension", priority, "movement_specific", "power", "low", ["avoid_failure", "avoid_amrap", "low_joint_stress"], "Prioritise high-quality lower-body power output.", 82);
}

function upperBodyPower(priority: StimulusPriority) {
  return stimulus("upper_body_power", "upper_body", "throw_or_explosive_press", priority, "movement_specific", "power", "low", ["avoid_failure", "avoid_amrap", "low_joint_stress"], "Add upper-body power without fatigue accumulation.", 78);
}

function speedStrength(priority: StimulusPriority) {
  return stimulus("speed_strength", "global", "explosive_strength", priority, "movement_specific", "power", "low", ["avoid_failure", "avoid_amrap"], "Train force production with low fatigue.", 82);
}

function landingSkill(priority: StimulusPriority) {
  return stimulus("landing_skill", "lower_body", "landing_and_deceleration", priority, "movement_specific", "skill", "low", ["low_joint_stress", "avoid_failure"], "Maintain landing quality and movement control.", 78);
}

function trunkStiffness(priority: StimulusPriority) {
  return stimulus("trunk_stiffness", "trunk", "bracing", priority, "movement_specific", "skill", "low", ["low_skill", "avoid_failure"], "Support athletic force transfer through trunk stiffness.", 76);
}

function technicalPractice() {
  return stimulus("technical_practice", "skill", "primary_patterns", "important", "movement_specific", "skill", "low", ["avoid_failure", "avoid_amrap"], "Preserve skill quality without chasing fatigue.", 78);
}

function lowStressMovement() {
  return stimulus("low_stress_movement", "general", "whole_body", "important", "general", "maintenance", "low", ["low_axial", "low_joint_stress", "low_skill"], "Maintain useful movement exposure economically.", 76);
}

function lowerFatigue(target: StimulusTarget) {
  if (target.fatigue_budget === "low") return target;
  return constrain(target, ["avoid_failure", "avoid_amrap"], target.fatigue_budget === "high" ? "moderate" : "low", "Stress budget reduced the fatigue allowance.");
}

function constrain(target: StimulusTarget, constraints: StimulusDeliveryConstraint[], fatigue: StimulusFatigueBudget, rationale: string): StimulusTarget {
  return {
    ...target,
    fatigue_budget: fatigue,
    delivery_constraints: unique([...target.delivery_constraints, ...constraints]),
    rationale: `${target.rationale} ${rationale}`,
    confidence: Math.max(45, target.confidence - 6),
  };
}

function sessionStimuli(session: AdaptiveStimulusSessionType) {
  if (session === "push" || session === "upper") return [competitionBench("important", "moderate"), chestHypertrophy("important"), upperBackHypertrophy("important")];
  if (session === "pull") return [horizontalPull("important"), latHypertrophy("important"), bicepsHypertrophy("optional")];
  if (session === "legs" || session === "lower") return [competitionSquat("important", "moderate"), quadHypertrophy("important"), hamstringHypertrophy("important")];
  if (session === "power") return [lowerBodyPower("important"), speedStrength("important")];
  return [lowStressMovement()];
}

function isAxialHingeOrSquat(target: StimulusTarget) {
  return target.movement_pattern === "hinge" || target.movement_pattern === "squat" || target.stimulus_id === "competition_deadlift_strength" || target.stimulus_id === "competition_squat_strength";
}

function isPressingOrShoulder(target: StimulusTarget) {
  return target.movement_pattern.includes("push") || target.movement_pattern.includes("press") || target.movement_pattern.includes("shoulder") || target.target_region.includes("delt") || target.stimulus_id.includes("bench");
}

function isDirectArm(target: StimulusTarget) {
  return target.stimulus_id === "biceps_hypertrophy" || target.stimulus_id === "triceps_hypertrophy";
}

function isKneeDominant(target: StimulusTarget) {
  return target.movement_pattern === "knee_extension" || target.movement_pattern === "squat" || target.stimulus_id === "competition_squat_strength" || target.stimulus_id === "quad_hypertrophy";
}

function unique<T>(values: T[]): T[] {
  return Array.from(new Set(values));
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}
