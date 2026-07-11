import type { AdaptiveProgrammingGoal, AdaptiveTrainingPhase } from "@/domain/training/adaptive-rep-prescription";
import type { CycleRecoveryFlag } from "@/domain/training/cycle-strategy-context";
import type { AdaptiveStimulusKnownLimitation, AdaptiveStimulusPlan, StimulusTarget } from "@/domain/training/adaptive-stimulus-planner";

export type StimulusDeliveryType =
  | "competition_lift"
  | "heavy_free_weight_compound"
  | "free_weight_compound"
  | "machine_compound"
  | "cable"
  | "isolation"
  | "bodyweight"
  | "carry"
  | "power_movement"
  | "skill_movement";

export type StimulusExerciseArchetype =
  | "competition_anchor"
  | "heavy_compound_anchor"
  | "compound_support"
  | "stable_machine_stimulus"
  | "cable_stimulus"
  | "isolation_stimulus"
  | "bodyweight_control"
  | "loaded_carry"
  | "explosive_power"
  | "technical_skill";

export type DeliveryExerciseOwnership = "unknown" | "introduced" | "unstable" | "stabilising" | "owned";

export interface StimulusDeliveryHistoryEntry {
  stimulus_id: string;
  delivery_type: StimulusDeliveryType;
  ownership?: DeliveryExerciseOwnership;
  successful_exposures?: number;
  recent_issue?: "none" | "missed_range" | "pain" | "shutdown" | "poor_stimulus" | "excessive_fatigue";
}

export interface AdaptiveStimulusDeliveryContext {
  stimulusPlan: AdaptiveStimulusPlan;
  goal: AdaptiveProgrammingGoal;
  trainingPhase: AdaptiveTrainingPhase;
  recoveryFlag?: CycleRecoveryFlag;
  knownLimitations?: AdaptiveStimulusKnownLimitation[];
  availableEquipment?: "full_gym";
  exerciseHistory?: StimulusDeliveryHistoryEntry[];
  exerciseOwnership?: Record<string, DeliveryExerciseOwnership>;
  preferredExercise?: {
    stimulus_id: string;
    delivery_type: StimulusDeliveryType;
  };
}

export interface StimulusDeliveryDecision {
  stimulus_id: string;
  movement_pattern: string;
  exercise_archetype: StimulusExerciseArchetype;
  preferred_delivery_type: StimulusDeliveryType;
  acceptable_alternatives: StimulusDeliveryType[];
  rationale: string;
  specificity_score: number;
  fatigue_score: number;
  confidence: number;
}

export interface AdaptiveStimulusDeliveryPlan {
  decisions: StimulusDeliveryDecision[];
  avoid_delivery_types: StimulusDeliveryType[];
  confidence: number;
  short_reason: string;
  debug_reasons: string[];
}

const SHORT_REASON_LIMIT = 80;

export function deriveAdaptiveStimulusDelivery(context: AdaptiveStimulusDeliveryContext): AdaptiveStimulusDeliveryPlan {
  const recovery = context.recoveryFlag ?? "normal";
  const limitations = context.knownLimitations ?? [];
  const targets = [
    ...context.stimulusPlan.primary_stimuli,
    ...context.stimulusPlan.secondary_stimuli,
    ...context.stimulusPlan.optional_stimuli,
  ];
  const debug = [
    `goal ${context.goal}`,
    `phase ${context.trainingPhase}`,
    `recovery ${recovery}`,
    `equipment ${context.availableEquipment ?? "full_gym"}`,
    `limitations ${limitations.length ? limitations.join(",") : "none"}`,
    `targets ${targets.length}`,
  ];
  const decisions = targets.map((target) => decideDeliveryForTarget(target, context));
  const avoidDeliveryTypes = avoidDeliveryTypesFor(context);
  const confidence = decisions.length > 0 ? Math.round(decisions.reduce((total, decision) => total + decision.confidence, 0) / decisions.length) : 50;

  return {
    decisions,
    avoid_delivery_types: avoidDeliveryTypes,
    confidence,
    short_reason: compactReason(context, decisions).slice(0, SHORT_REASON_LIMIT).trimEnd(),
    debug_reasons: debug,
  };
}

function decideDeliveryForTarget(target: StimulusTarget, context: AdaptiveStimulusDeliveryContext): StimulusDeliveryDecision {
  const limitations = context.knownLimitations ?? [];
  const history = context.exerciseHistory?.find((entry) => entry.stimulus_id === target.stimulus_id);
  const ownership = context.exerciseOwnership?.[target.stimulus_id] ?? history?.ownership ?? "unknown";
  const preferred = context.preferredExercise?.stimulus_id === target.stimulus_id ? context.preferredExercise.delivery_type : undefined;
  const base = baseDelivery(target, context);
  const limited = applyDeliveryLimitations(base, target, context);
  const deliveryType = choosePreferredDelivery(preferred, limited, target, context);
  const alternatives = alternativesFor(deliveryType, target, context);
  const specificity = specificityScore(deliveryType, target, context);
  const fatigue = fatigueScore(deliveryType, target, context);
  const confidence = confidenceFor(target, deliveryType, ownership, history, limitations);

  return {
    stimulus_id: target.stimulus_id,
    movement_pattern: target.movement_pattern,
    exercise_archetype: archetypeFor(deliveryType, target),
    preferred_delivery_type: deliveryType,
    acceptable_alternatives: alternatives,
    rationale: rationaleFor(target, deliveryType, context, history),
    specificity_score: specificity,
    fatigue_score: fatigue,
    confidence,
  };
}

function baseDelivery(target: StimulusTarget, context: AdaptiveStimulusDeliveryContext): StimulusDeliveryType {
  if (target.specificity === "competition_specific") return "competition_lift";
  if (target.desired_adaptation === "power") return "power_movement";
  if (target.desired_adaptation === "skill") return "skill_movement";
  if (target.stimulus_id === "trunk_stiffness") return "carry";
  if (target.stimulus_id.includes("recovery") || target.stimulus_id.includes("mobility")) return "bodyweight";
  if (context.goal === "hypertrophy") {
    if (target.delivery_constraints.includes("stable_path") && target.fatigue_budget !== "high") return target.movement_pattern.includes("elbow") || target.movement_pattern.includes("shoulder_abduction") ? "cable" : "machine_compound";
    return target.specificity === "muscle_specific" ? "isolation" : "machine_compound";
  }
  if (context.goal === "build_muscle_strength") {
    if (target.desired_adaptation === "strength") return "heavy_free_weight_compound";
    if (target.fatigue_budget === "low") return "cable";
    return "machine_compound";
  }
  if (context.goal === "get_lean") {
    if (target.desired_adaptation === "strength") return "heavy_free_weight_compound";
    return target.fatigue_budget === "low" ? "cable" : "machine_compound";
  }
  if (context.goal === "maintenance") {
    if (target.desired_adaptation === "strength") return target.specificity === "movement_specific" ? "free_weight_compound" : "heavy_free_weight_compound";
    return target.fatigue_budget === "low" ? "bodyweight" : "machine_compound";
  }
  if (target.desired_adaptation === "strength") return "heavy_free_weight_compound";
  return "machine_compound";
}

function applyDeliveryLimitations(delivery: StimulusDeliveryType, target: StimulusTarget, context: AdaptiveStimulusDeliveryContext): StimulusDeliveryType {
  const limitations = context.knownLimitations ?? [];
  if (limitations.includes("pain")) return saferDeliveryFor(target, delivery);
  if (limitations.includes("low_back_fatigue") && isAxialTarget(target) && delivery !== "competition_lift") return "machine_compound";
  if (limitations.includes("low_back_fatigue") && isAxialTarget(target) && delivery === "competition_lift" && target.priority !== "required") return "machine_compound";
  if (limitations.includes("shoulder_irritation") && isShoulderOrPressing(target) && delivery !== "competition_lift") return target.desired_adaptation === "hypertrophy" ? "cable" : "machine_compound";
  if (limitations.includes("elbow_irritation") && isDirectArm(target)) return "cable";
  if (limitations.includes("knee_irritation") && isKneeDominant(target) && delivery !== "competition_lift") return "machine_compound";
  if (limitations.includes("time_limited")) return highReturnDeliveryFor(target, delivery);
  if (context.recoveryFlag === "limited" && delivery === "heavy_free_weight_compound" && target.specificity !== "competition_specific") return "machine_compound";
  if (context.recoveryFlag === "poor") return saferDeliveryFor(target, delivery);
  return delivery;
}

function choosePreferredDelivery(preferred: StimulusDeliveryType | undefined, delivery: StimulusDeliveryType, target: StimulusTarget, context: AdaptiveStimulusDeliveryContext) {
  if (!preferred) return delivery;
  if (context.goal === "strength" && target.specificity === "competition_specific") return delivery;
  if (target.desired_adaptation === "power" && preferred !== "power_movement") return delivery;
  if (context.knownLimitations?.includes("pain") && highRiskDelivery(preferred)) return delivery;
  return preferred;
}

function alternativesFor(delivery: StimulusDeliveryType, target: StimulusTarget, context: AdaptiveStimulusDeliveryContext): StimulusDeliveryType[] {
  if (delivery === "competition_lift") {
    return context.trainingPhase === "peak" || target.priority === "required" ? ["heavy_free_weight_compound", "skill_movement"] : ["heavy_free_weight_compound", "machine_compound"];
  }
  if (delivery === "power_movement") return ["skill_movement", "bodyweight"];
  if (delivery === "heavy_free_weight_compound") return ["free_weight_compound", "machine_compound"];
  if (delivery === "free_weight_compound") return ["machine_compound", "cable"];
  if (delivery === "machine_compound") return ["cable", "free_weight_compound"];
  if (delivery === "cable") return ["isolation", "machine_compound"];
  if (delivery === "isolation") return ["cable", "machine_compound"];
  if (delivery === "carry") return ["bodyweight", "skill_movement"];
  if (delivery === "skill_movement") return ["bodyweight", "competition_lift"];
  return ["skill_movement", "machine_compound"];
}

function rationaleFor(
  target: StimulusTarget,
  delivery: StimulusDeliveryType,
  context: AdaptiveStimulusDeliveryContext,
  history: StimulusDeliveryHistoryEntry | undefined,
) {
  const reasons = [`Deliver ${target.stimulus_id} through ${delivery.replace(/_/g, " ")}.`];
  if (target.specificity === "competition_specific") reasons.push("Specificity is protected.");
  if (target.desired_adaptation === "hypertrophy") reasons.push("Stimulus quality matters more than exercise novelty.");
  if (target.desired_adaptation === "power") reasons.push("Power stimulus requires explosive, low-fatigue delivery.");
  if (context.knownLimitations?.length) reasons.push("Known limitations constrain delivery choice.");
  if (history?.recent_issue && history.recent_issue !== "none") reasons.push(`Recent ${history.recent_issue.replace(/_/g, " ")} supports a coaching reason to adjust.`);
  return reasons.join(" ");
}

function specificityScore(delivery: StimulusDeliveryType, target: StimulusTarget, context: AdaptiveStimulusDeliveryContext) {
  if (delivery === "competition_lift") return target.specificity === "competition_specific" ? 96 : 82;
  if (delivery === "power_movement") return target.desired_adaptation === "power" ? 92 : 60;
  if (target.specificity === "muscle_specific" && (delivery === "machine_compound" || delivery === "cable" || delivery === "isolation")) return 84;
  if (delivery === "heavy_free_weight_compound") return context.goal === "strength" || context.goal === "build_muscle_strength" ? 86 : 74;
  if (delivery === "skill_movement") return target.desired_adaptation === "skill" || target.desired_adaptation === "recovery" ? 84 : 64;
  return 72;
}

function fatigueScore(delivery: StimulusDeliveryType, target: StimulusTarget, context: AdaptiveStimulusDeliveryContext) {
  const base =
    delivery === "competition_lift" ? 78 :
    delivery === "heavy_free_weight_compound" ? 74 :
    delivery === "free_weight_compound" ? 62 :
    delivery === "machine_compound" ? 48 :
    delivery === "power_movement" ? 42 :
    delivery === "cable" || delivery === "isolation" ? 32 :
    delivery === "carry" ? 40 :
    24;
  const targetAdjustment = target.fatigue_budget === "high" ? 8 : target.fatigue_budget === "low" ? -10 : 0;
  const recoveryAdjustment = context.recoveryFlag === "limited" ? -8 : context.recoveryFlag === "poor" ? -16 : 0;
  return clamp(base + targetAdjustment + recoveryAdjustment, 5, 100);
}

function confidenceFor(
  target: StimulusTarget,
  delivery: StimulusDeliveryType,
  ownership: DeliveryExerciseOwnership,
  history: StimulusDeliveryHistoryEntry | undefined,
  limitations: AdaptiveStimulusKnownLimitation[],
) {
  let confidence = Math.min(target.confidence, 86);
  if (target.specificity === "competition_specific" && delivery === "competition_lift") confidence += 6;
  if (target.desired_adaptation === "power" && delivery === "power_movement") confidence += 6;
  if (target.desired_adaptation === "hypertrophy" && ["machine_compound", "cable", "isolation"].includes(delivery)) confidence += 4;
  if (ownership === "owned" || (history?.successful_exposures ?? 0) >= 3) confidence += 4;
  if (ownership === "unstable" || history?.recent_issue === "pain" || history?.recent_issue === "shutdown") confidence -= 10;
  if (limitations.length > 0) confidence -= 4;
  return clamp(Math.round(confidence), 45, 94);
}

function archetypeFor(delivery: StimulusDeliveryType, target: StimulusTarget): StimulusExerciseArchetype {
  if (delivery === "competition_lift") return "competition_anchor";
  if (delivery === "heavy_free_weight_compound") return target.priority === "required" ? "heavy_compound_anchor" : "compound_support";
  if (delivery === "free_weight_compound") return "compound_support";
  if (delivery === "machine_compound") return "stable_machine_stimulus";
  if (delivery === "cable") return "cable_stimulus";
  if (delivery === "isolation") return "isolation_stimulus";
  if (delivery === "bodyweight") return "bodyweight_control";
  if (delivery === "carry") return "loaded_carry";
  if (delivery === "power_movement") return "explosive_power";
  return "technical_skill";
}

function avoidDeliveryTypesFor(context: AdaptiveStimulusDeliveryContext): StimulusDeliveryType[] {
  const limitations = context.knownLimitations ?? [];
  const avoid: StimulusDeliveryType[] = [];
  if (limitations.includes("low_back_fatigue")) avoid.push("heavy_free_weight_compound");
  if (limitations.includes("shoulder_irritation")) avoid.push("heavy_free_weight_compound");
  if (limitations.includes("pain")) avoid.push("competition_lift", "heavy_free_weight_compound");
  if (context.recoveryFlag === "poor") avoid.push("heavy_free_weight_compound");
  return unique(avoid);
}

function compactReason(context: AdaptiveStimulusDeliveryContext, decisions: StimulusDeliveryDecision[]) {
  if (context.knownLimitations?.length) return "Deliver required stimulus with lower-risk options.";
  if (context.goal === "strength") return "Protect specificity and adapt support work.";
  if (context.goal === "hypertrophy") return "Deliver high-quality stimulus efficiently.";
  if (context.goal === "athletic_performance") return "Protect power and movement quality.";
  if (context.goal === "maintenance") return "Deliver planned stimuli economically.";
  if (decisions.some((decision) => decision.preferred_delivery_type === "competition_lift")) return "Preserve anchors and control fatigue.";
  return "Deliver planned stimuli economically.";
}

function saferDeliveryFor(target: StimulusTarget, delivery: StimulusDeliveryType): StimulusDeliveryType {
  if (target.specificity === "competition_specific" && target.priority === "required") return "skill_movement";
  if (target.desired_adaptation === "power") return "skill_movement";
  if (target.desired_adaptation === "recovery" || target.desired_adaptation === "skill") return "bodyweight";
  if (target.desired_adaptation === "hypertrophy") return target.movement_pattern.includes("elbow") || target.movement_pattern.includes("shoulder") ? "cable" : "machine_compound";
  if (highRiskDelivery(delivery)) return "machine_compound";
  return delivery;
}

function highReturnDeliveryFor(target: StimulusTarget, delivery: StimulusDeliveryType): StimulusDeliveryType {
  if (target.specificity === "competition_specific" || target.priority === "required") return delivery;
  if (target.desired_adaptation === "hypertrophy" && target.fatigue_budget === "low") return "cable";
  if (target.desired_adaptation === "hypertrophy") return "machine_compound";
  return delivery;
}

function highRiskDelivery(delivery: StimulusDeliveryType) {
  return delivery === "competition_lift" || delivery === "heavy_free_weight_compound" || delivery === "free_weight_compound";
}

function isAxialTarget(target: StimulusTarget) {
  return target.movement_pattern === "hinge" || target.movement_pattern === "squat" || target.delivery_constraints.includes("low_axial") || target.stimulus_id.includes("deadlift") || target.stimulus_id.includes("squat");
}

function isShoulderOrPressing(target: StimulusTarget) {
  return target.movement_pattern.includes("push") || target.movement_pattern.includes("press") || target.target_region.includes("delt") || target.stimulus_id.includes("bench") || target.stimulus_id.includes("chest");
}

function isDirectArm(target: StimulusTarget) {
  return target.stimulus_id.includes("biceps") || target.stimulus_id.includes("triceps");
}

function isKneeDominant(target: StimulusTarget) {
  return target.movement_pattern === "knee_extension" || target.movement_pattern === "squat" || target.stimulus_id.includes("quad") || target.stimulus_id.includes("squat");
}

function unique<T>(values: T[]): T[] {
  return Array.from(new Set(values));
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}
