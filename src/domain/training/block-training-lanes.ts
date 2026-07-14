import type { BlockType } from "@/domain/training/annual-models";
import type { EventTaperResult } from "@/domain/training/event-taper";
import { roundDownToIncrement } from "@/domain/training/load-increment-strategy";
import type { ExerciseFamily, ExerciseRole, ExperienceLevel, RepRange, TrainingLane } from "@/domain/training/models";
import { normalizeTrainingSetupGoal, type TrainingSetupGoal } from "@/domain/training/plan-setup";

export type LaneEmphasis = "none" | "low" | "moderate" | "moderate_high" | "high" | "maintenance";

export interface BlockLaneComposition {
  hypertrophy: LaneEmphasis;
  strength: LaneEmphasis;
  power: LaneEmphasis;
  peak: LaneEmphasis;
  recovery: LaneEmphasis;
}

export interface LanePrescriptionConstraints {
  repBias: "higher" | "moderate" | "lower" | "very_low";
  volumeLearning: "strong" | "support_only" | "rare" | "suppressed";
  progressionPriority: "primary" | "allowed" | "conservative" | "suppressed";
  softCapBias: "normal" | "lower" | "strict";
  copy: string;
}

export interface HeavyExposureBudget {
  heavyExposuresPerWeek: number;
  hardCompoundSetsPerWeek: number;
  highIntensitySetsPerSession: number;
  reason: string;
}

export interface BlockTransitionLoadInput {
  previousLoad: number;
  previousBestReps: number;
  targetRepRange: RepRange;
  increment: number;
  lane?: TrainingLane;
  blockType?: BlockType | null;
}

export interface BlockTransitionLoadResult {
  load: number;
  changed: boolean;
  reason: string;
  evidence: string[];
}

export function getBlockLaneComposition(blockType?: BlockType | null): BlockLaneComposition {
  const block = normalizeBlock(blockType);
  if (block === "powerbuilding") {
    return { hypertrophy: "moderate_high", strength: "moderate_high", power: "low", peak: "none", recovery: "none" };
  }
  if (block === "strength") {
    return { hypertrophy: "moderate", strength: "high", power: "moderate", peak: "low", recovery: "none" };
  }
  if (block === "power") {
    return { hypertrophy: "low", strength: "moderate", power: "high", peak: "low", recovery: "none" };
  }
  if (block === "peak") {
    return { hypertrophy: "maintenance", strength: "moderate", power: "moderate", peak: "high", recovery: "low" };
  }
  if (block === "deload") {
    return { hypertrophy: "maintenance", strength: "maintenance", power: "maintenance", peak: "none", recovery: "high" };
  }
  return { hypertrophy: "high", strength: "moderate", power: "low", peak: "none", recovery: "none" };
}

export function resolveTrainingLane(input: {
  blockType?: BlockType | null;
  exerciseRole?: ExerciseRole | null;
  exerciseFamily?: ExerciseFamily | null;
  slotRole?: string | null;
  plannedOrder?: number;
}): TrainingLane {
  return resolveTrainingLaneDecision(input).lane;
}

type ResolvedTrainingLaneDecision = Readonly<{
  lane: TrainingLane;
  source: "block_compatibility" | "explicit_exercise_role" | "slot_role" | "planned_order" | "programme_default";
  branchId: string;
  appliedIdentity: string;
  plannedOrderClass: "first" | "later" | "unknown";
  roleSource: "explicit" | "unavailable";
  reasonCode: string;
  winnerRetention: "retained_at_existing_branch";
}>;

function resolveTrainingLaneDecision(input: {
  blockType?: BlockType | null;
  exerciseRole?: ExerciseRole | null;
  exerciseFamily?: ExerciseFamily | null;
  slotRole?: string | null;
  plannedOrder?: number;
}): ResolvedTrainingLaneDecision {
  const block = normalizeBlock(input.blockType);
  const role = input.exerciseRole;
  const slotRole = input.slotRole;
  const plannedOrderClass: ResolvedTrainingLaneDecision["plannedOrderClass"] = input.plannedOrder === 1 ? "first" : input.plannedOrder === undefined ? "unknown" : "later";
  const select = (lane: TrainingLane, source: ResolvedTrainingLaneDecision["source"], branchId: string): ResolvedTrainingLaneDecision => ({ lane, source, branchId, appliedIdentity: source === "explicit_exercise_role" ? role ?? branchId : source === "slot_role" ? slotRole ?? branchId : source === "planned_order" ? `planned_order:${plannedOrderClass}` : source === "block_compatibility" ? block ?? "default" : branchId, plannedOrderClass, roleSource: source === "explicit_exercise_role" ? "explicit" : "unavailable", reasonCode: branchId, winnerRetention: "retained_at_existing_branch" });

  if (block === "deload") return role === "recovery" ? select("recovery", "explicit_exercise_role", "deload-recovery") : select("maintenance", "block_compatibility", "deload-default");
  if (block === "peak") {
    if (role === "primary_compound" || slotRole === "heavy_primary" || input.plannedOrder === 1) return select("peak", role === "primary_compound" ? "explicit_exercise_role" : slotRole === "heavy_primary" ? "slot_role" : "planned_order", "peak-first");
    if (role === "secondary_compound" || slotRole === "heavy_secondary" || slotRole === "strength") return select("strength_support", role === "secondary_compound" ? "explicit_exercise_role" : "slot_role", "peak-secondary");
    return select("maintenance", "block_compatibility", "peak-default");
  }
  if (block === "power") {
    if (role === "power" || slotRole === "power") return select("power", role === "power" ? "explicit_exercise_role" : "slot_role", "power-power");
    if (role === "primary_compound" || slotRole === "heavy_primary" || slotRole === "strength") return select("strength_support", role === "primary_compound" ? "explicit_exercise_role" : "slot_role", "power-strength");
    return select("maintenance", "block_compatibility", "power-default");
  }
  if (block === "strength") {
    if (role === "primary_compound" || slotRole === "heavy_primary") return select("strength", role === "primary_compound" ? "explicit_exercise_role" : "slot_role", "strength-primary");
    if (role === "secondary_compound" || slotRole === "heavy_secondary" || slotRole === "strength") return select("strength_support", role === "secondary_compound" ? "explicit_exercise_role" : "slot_role", "strength-secondary");
    return select("maintenance", "block_compatibility", "strength-default");
  }
  if (block === "powerbuilding") {
    if (role === "primary_compound" || slotRole === "heavy_primary") return select("strength", role === "primary_compound" ? "explicit_exercise_role" : "slot_role", "powerbuilding-primary");
    if (role === "secondary_compound" || slotRole === "heavy_secondary" || slotRole === "strength") return select("hypertrophy_strength", role === "secondary_compound" ? "explicit_exercise_role" : "slot_role", "powerbuilding-secondary");
    return select("hypertrophy", "block_compatibility", "powerbuilding-default");
  }
  if (role === "primary_compound" || slotRole === "heavy_primary") return select("hypertrophy_strength", role === "primary_compound" ? "explicit_exercise_role" : "slot_role", "hypertrophy-primary");
  if (role === "power" || slotRole === "power") return select("power", role === "power" ? "explicit_exercise_role" : "slot_role", "hypertrophy-power");
  return select("hypertrophy", "block_compatibility", "hypertrophy-default");
}

export function getLanePrescriptionConstraints(lane?: TrainingLane | null): LanePrescriptionConstraints {
  switch (lane) {
    case "strength":
      return { repBias: "lower", volumeLearning: "support_only", progressionPriority: "primary", softCapBias: "lower", copy: "Heavy work. Controlled dose." };
    case "strength_support":
    case "hypertrophy_strength":
      return { repBias: "moderate", volumeLearning: "support_only", progressionPriority: "allowed", softCapBias: "lower", copy: "Heavy enough to matter. Not enough to bury the session." };
    case "power":
      return { repBias: "very_low", volumeLearning: "rare", progressionPriority: "conservative", softCapBias: "strict", copy: "Move it fast. No grinders." };
    case "peak":
      return { repBias: "very_low", volumeLearning: "suppressed", progressionPriority: "conservative", softCapBias: "strict", copy: "Express strength. Drop fatigue." };
    case "maintenance":
      return { repBias: "moderate", volumeLearning: "support_only", progressionPriority: "conservative", softCapBias: "lower", copy: "Keep the quality alive." };
    case "recovery":
      return { repBias: "moderate", volumeLearning: "suppressed", progressionPriority: "suppressed", softCapBias: "strict", copy: "Low fatigue. No chasing." };
    case "hypertrophy":
    default:
      return { repBias: "higher", volumeLearning: "strong", progressionPriority: "allowed", softCapBias: "normal", copy: "Build useful work." };
  }
}

export function resolveHeavyExposureBudget(input: {
  blockType?: BlockType | null;
  goal?: TrainingSetupGoal;
  experienceLevel?: ExperienceLevel;
  eventTaper?: EventTaperResult | null;
}): HeavyExposureBudget {
  const block = normalizeBlock(input.blockType);
  const experienceOffset = input.experienceLevel === "beginner" ? -1 : input.experienceLevel === "advanced" ? 1 : 0;
  const goal = input.goal ? normalizeTrainingSetupGoal(input.goal) : undefined;
  const goalOffset = goal === "build_strength" || goal === "powerlifting_meet" ? 1 : goal === "athletic_performance" || goal === "get_leaner" ? -1 : 0;
  const base =
    block === "peak"
      ? { exposures: 2, compounds: 8, intensity: 3, reason: "Peak keeps fatigue tight." }
      : block === "power"
        ? { exposures: 3, compounds: 10, intensity: 4, reason: "Power needs quality before fatigue." }
        : block === "strength"
          ? { exposures: 4, compounds: 12, intensity: 5, reason: "Strength tolerates heavy work with controlled volume." }
          : block === "powerbuilding"
            ? { exposures: 3, compounds: 12, intensity: 4, reason: "Powerbuilding blends heavy work and muscle work." }
            : { exposures: 2, compounds: 10, intensity: 3, reason: "Hypertrophy keeps heavy exposure supportive." };
  const budget = {
    heavyExposuresPerWeek: clamp(base.exposures + experienceOffset + goalOffset, 1, 6),
    hardCompoundSetsPerWeek: clamp(base.compounds + experienceOffset * 2 + goalOffset * 2, 4, 18),
    highIntensitySetsPerSession: clamp(base.intensity + Math.sign(experienceOffset + goalOffset), 2, 7),
    reason: base.reason,
  };
  const phase = input.eventTaper?.eventPhase;
  if (phase === "event_week" || phase === "taper") {
    return {
      heavyExposuresPerWeek: clamp(budget.heavyExposuresPerWeek - 1, 1, 6),
      hardCompoundSetsPerWeek: clamp(budget.hardCompoundSetsPerWeek - 4, 2, 18),
      highIntensitySetsPerSession: clamp(budget.highIntensitySetsPerSession - 1, 1, 7),
      reason: `${budget.reason} Event taper keeps fatigue tighter.`,
    };
  }
  if (phase === "specificity") {
    return {
      ...budget,
      hardCompoundSetsPerWeek: clamp(budget.hardCompoundSetsPerWeek - 2, 3, 18),
      reason: `${budget.reason} Event specificity limits random extra heavy work.`,
    };
  }
  return budget;
}

export function recalibrateLoadForBlockTransition(input: BlockTransitionLoadInput): BlockTransitionLoadResult {
  if (!Number.isFinite(input.previousLoad) || input.previousLoad <= 0 || !Number.isFinite(input.previousBestReps) || input.previousBestReps <= 0) {
    return { load: input.previousLoad, changed: false, reason: "No reliable work-set load to recalibrate.", evidence: ["Insufficient completed work-set load evidence."] };
  }
  const targetReps = Math.round((input.targetRepRange.min + input.targetRepRange.max) / 2);
  const repShift = Math.abs(input.previousBestReps - targetReps);
  if (repShift < 3) {
    return { load: input.previousLoad, changed: false, reason: "Rep target is close enough to carry the load.", evidence: [`Previous best ${input.previousBestReps} reps. Target midpoint ${targetReps}.`] };
  }

  const estimatedMax = estimateOneRepMax(input.previousLoad, input.previousBestReps);
  const laneBuffer = input.lane === "peak" ? 0.94 : input.lane === "strength" || input.lane === "strength_support" ? 0.92 : input.lane === "power" ? 0.72 : 0.96;
  const rawLoad = loadFromEstimatedOneRepMax(estimatedMax, targetReps) * laneBuffer;
  const rounded = roundDownToIncrement(rawLoad, input.increment);
  const nextLoad = rounded > 0 ? rounded : input.previousLoad;
  return {
    load: nextLoad,
    changed: nextLoad !== input.previousLoad,
    reason: "Starting load recalibrated for the new block lane and rep target.",
    evidence: [
      `Previous performance: ${input.previousLoad} x ${input.previousBestReps}.`,
      `Target range: ${input.targetRepRange.min}-${input.targetRepRange.max}.`,
      `Lane buffer: ${Math.round(laneBuffer * 100)}%.`,
      "Rounded down to the available load increment.",
    ],
  };
}

function normalizeBlock(blockType?: BlockType | null): BlockType {
  if (blockType === "strength_hypertrophy") return "powerbuilding";
  return blockType ?? "hypertrophy";
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function estimateOneRepMax(load: number, reps: number): number {
  if (!Number.isFinite(load) || !Number.isFinite(reps) || load <= 0 || reps < 0) return 0;
  return load * (1 + reps / 30);
}

function loadFromEstimatedOneRepMax(estimatedOneRepMax: number, targetReps: number): number {
  if (!Number.isFinite(estimatedOneRepMax) || !Number.isFinite(targetReps) || estimatedOneRepMax <= 0 || targetReps < 0) return 0;
  return estimatedOneRepMax / (1 + targetReps / 30);
}
