import type { BlockType } from "@/domain/training/annual-models";
import type {
  Exercise,
  ExerciseFamily,
  ExerciseHistorySummary,
  ExerciseRole,
  MovementPattern,
  RepRange,
  SetLog,
  TrainingLane,
} from "@/domain/training/models";
import { getWorkSets } from "@/domain/training/workout-sets";

export type ExerciseTargetZoneState =
  | "insufficient_data"
  | "balanced_default"
  | "load_biased"
  | "balanced"
  | "rep_biased";

export type ExerciseTargetZoneEvidenceQuality =
  | "insufficient_data"
  | "biased_low_only"
  | "biased_high_only"
  | "balanced_sample"
  | "strong_style_evidence";

export interface ExerciseTargetZoneInput {
  exercise?: Exercise | null;
  slotRole?: string | null;
  block?: BlockType | null;
  lane?: TrainingLane | null;
  repRange: RepRange;
  completedProductiveWorkSets?: SetLog[];
  recentExerciseHistory?: ExerciseHistorySummary[];
  exerciseId?: string;
  exerciseRole?: ExerciseRole | null;
  exerciseFamily?: ExerciseFamily | null;
  movementPattern?: MovementPattern | null;
  volumeLearningContext?: {
    status?: string;
    evidence?: string[];
  } | null;
}

export interface ExerciseTargetZoneResult {
  state: ExerciseTargetZoneState;
  targetZone: RepRange;
  defaultZone: RepRange;
  evidenceQuality: ExerciseTargetZoneEvidenceQuality;
  confidence: "insufficient_data" | "low" | "medium" | "high";
  guidance: string;
  reason: string;
  exposures: number;
  productiveSets: number;
  evidence: string[];
}

interface Exposure {
  load: number;
  averageReps: number;
  bestSetReps: number;
  qualitySets: number;
  progressionEarned: boolean;
  stoppedByDropOff: boolean;
  confounded: boolean;
  completedAt?: string;
}

const MIN_LEARNING_EXPOSURES = 3;
const MIN_LEARNING_SETS = 9;

export function resolveExerciseTargetZone(input: ExerciseTargetZoneInput): ExerciseTargetZoneResult {
  const range = normalizeRange(input.repRange);
  const defaults = defaultTargetZone(input, range);
  const exposures = buildExposures(input, range);
  const clean = exposures.filter((exposure) => !exposure.confounded);
  const productiveSets = clean.reduce((sum, exposure) => sum + exposure.qualitySets, 0);
  const evidenceQuality = classifyEvidenceQuality(clean, range);

  if (isOverrideLane(input.lane, input.block)) {
    return {
      state: input.lane === "power" || input.block === "power" ? "balanced_default" : "insufficient_data",
      targetZone: defaults.zone,
      defaultZone: defaults.zone,
      evidenceQuality: clean.length > 0 ? evidenceQuality : "insufficient_data",
      confidence: clean.length > 0 ? "low" : "insufficient_data",
      guidance: overrideGuidance(input.lane, input.block),
      reason: overrideReason(input.lane, input.block),
      exposures: clean.length,
      productiveSets,
      evidence: [
        defaults.reason,
        overrideReason(input.lane, input.block),
        `${clean.length} clean exposure(s) available.`,
      ],
    };
  }

  if (clean.length < MIN_LEARNING_EXPOSURES || productiveSets < MIN_LEARNING_SETS) {
    return insufficientResult(input, defaults.zone, clean.length, productiveSets, evidenceQuality, defaults.reason);
  }

  const style = learnStyle(clean, range, evidenceQuality);
  if (style.state === "insufficient_data") {
    return insufficientResult(input, defaults.zone, clean.length, productiveSets, evidenceQuality, style.reason);
  }

  return {
    state: style.state,
    targetZone: style.zone,
    defaultZone: defaults.zone,
    evidenceQuality,
    confidence: style.confidence,
    guidance: guidanceForState(style.state, style.zone),
    reason: style.reason,
    exposures: clean.length,
    productiveSets,
    evidence: [
      `${clean.length} clean exposure(s) analysed.`,
      `${productiveSets} productive work set(s) analysed.`,
      `Evidence quality: ${evidenceQuality.replaceAll("_", " ")}.`,
      style.reason,
    ],
  };
}

export function targetZoneLabel(zone: RepRange): string {
  return zone.min === zone.max ? `${zone.min}` : `${zone.min}-${zone.max}`;
}

export function targetZoneMidpoint(zone: RepRange): number {
  return Math.round((zone.min + zone.max) / 2);
}

function insufficientResult(
  input: ExerciseTargetZoneInput,
  zone: RepRange,
  exposures: number,
  productiveSets: number,
  evidenceQuality: ExerciseTargetZoneEvidenceQuality,
  reason: string,
): ExerciseTargetZoneResult {
  return {
    state: evidenceQuality === "insufficient_data" ? "balanced_default" : "insufficient_data",
    targetZone: zone,
    defaultZone: zone,
    evidenceQuality,
    confidence: evidenceQuality === "insufficient_data" ? "low" : "insufficient_data",
    guidance: explorationGuidance(input.repRange, zone, evidenceQuality),
    reason,
    exposures,
    productiveSets,
    evidence: [
      exposures < MIN_LEARNING_EXPOSURES ? `Need at least ${MIN_LEARNING_EXPOSURES} clean exposures before learning a target zone.` : null,
      productiveSets < MIN_LEARNING_SETS ? `Need at least ${MIN_LEARNING_SETS} productive work sets.` : null,
      evidenceQuality !== "insufficient_data" ? `Current sample is ${evidenceQuality.replaceAll("_", " ")}.` : null,
      reason,
    ].filter((item): item is string => Boolean(item)),
  };
}

function defaultTargetZone(input: ExerciseTargetZoneInput, range: RepRange): { zone: RepRange; reason: string } {
  const block = normalizeBlock(input.block);
  const role = input.exerciseRole ?? input.exercise?.role ?? roleFromSlot(input.slotRole);
  const family = input.exerciseFamily ?? input.exercise?.family;
  const movementPattern = input.movementPattern ?? input.exercise?.movementPattern;
  const width = Math.max(0, range.max - range.min);

  if (block === "power" || input.lane === "power" || role === "power" || family === "olympic_power" || family === "jump_power" || family === "throw_power") {
    return { zone: lowerZone(range, width <= 2 ? 1 : 2), reason: "Power work defaults to crisp, low-rep quality." };
  }
  if (block === "peak" || input.lane === "peak") {
    return { zone: lowerZone(range, width <= 2 ? 1 : 2), reason: "Peak work defaults to specific, low-fatigue readiness." };
  }
  if (block === "deload" || input.lane === "recovery" || role === "recovery") {
    return { zone: middleZone(range), reason: "Recovery Window work defaults to easy quality in the middle of the range." };
  }

  if (block === "strength") {
    if (role === "primary_compound") return { zone: lowerZone(range, 2), reason: "Strength primary work defaults to the lower target zone." };
    if (role === "secondary_compound") return { zone: clampZone({ min: range.min, max: Math.min(range.max, range.min + 2) }, range), reason: "Strength secondary work defaults to lower-middle reps." };
  }

  if (role === "isolation" || role === "accessory" || movementPattern === "isolation" || isSmallIsolationFamily(family)) {
    return { zone: upperMiddleZone(range), reason: "Isolation work defaults to building reps before load." };
  }

  if (role === "primary_compound" || role === "secondary_compound") {
    return { zone: middleZone(range), reason: "Compound work defaults to the middle of the target range until outcomes prove otherwise." };
  }

  return { zone: middleZone(range), reason: "Default target zone starts in the middle of the range." };
}

function buildExposures(input: ExerciseTargetZoneInput, range: RepRange): Exposure[] {
  const directSets = getWorkSets(input.completedProductiveWorkSets ?? []).filter((set) => set.reps > 0);
  if (directSets.length > 0) {
    return [
      {
        load: average(directSets.map((set) => set.load)),
        averageReps: average(directSets.map((set) => set.reps)),
        bestSetReps: Math.max(...directSets.map((set) => set.reps)),
        qualitySets: directSets.filter((set) => set.reps >= range.min).length,
        progressionEarned: false,
        stoppedByDropOff: false,
        confounded: false,
      },
    ];
  }

  return (input.recentExerciseHistory ?? [])
    .filter((entry) => !input.exerciseId || entry.exerciseId === input.exerciseId)
    .filter((entry) => entry.setsCompleted > 0 && entry.repsCompleted > 0)
    .sort((a, b) => new Date(a.completedAt ?? "").getTime() - new Date(b.completedAt ?? "").getTime())
    .map((entry) => ({
      load: entry.load,
      averageReps: entry.repsCompleted / Math.max(1, entry.qualitySets || entry.setsCompleted),
      bestSetReps: entry.bestSetReps,
      qualitySets: entry.qualitySets,
      progressionEarned: entry.progressionEarned || (entry.nextLoadApprovalStatus === "approved" && entry.nextRecommendedLoad > entry.load),
      stoppedByDropOff: entry.stoppedByDropOff,
      confounded: isConfounded(entry),
      completedAt: entry.completedAt,
    }));
}

function classifyEvidenceQuality(exposures: Exposure[], range: RepRange): ExerciseTargetZoneEvidenceQuality {
  if (exposures.length === 0) return "insufficient_data";
  const positions = exposures.map((exposure) => positionInRange(exposure.averageReps, range));
  const lowOnly = positions.every((position) => position <= 0.35);
  const highOnly = positions.every((position) => position >= 0.65);
  const hasLow = positions.some((position) => position <= 0.35);
  const hasMiddle = positions.some((position) => position > 0.35 && position < 0.65);
  const hasHigh = positions.some((position) => position >= 0.65);
  if (lowOnly) return "biased_low_only";
  if (highOnly) return "biased_high_only";
  if (hasLow && hasMiddle && hasHigh && exposures.length >= MIN_LEARNING_EXPOSURES) return "strong_style_evidence";
  return "balanced_sample";
}

function learnStyle(
  exposures: Exposure[],
  range: RepRange,
  evidenceQuality: ExerciseTargetZoneEvidenceQuality,
): { state: ExerciseTargetZoneState; zone: RepRange; confidence: ExerciseTargetZoneResult["confidence"]; reason: string } {
  if (evidenceQuality === "biased_low_only" || evidenceQuality === "biased_high_only") {
    return {
      state: "insufficient_data",
      zone: middleZone(range),
      confidence: "insufficient_data",
      reason: "The sample is one-sided, so the app needs balanced exploration before learning a target zone.",
    };
  }

  const improving = exposures.filter((exposure) => exposure.progressionEarned && !exposure.stoppedByDropOff);
  if (improving.length < 2) {
    return {
      state: "insufficient_data",
      zone: middleZone(range),
      confidence: "low",
      reason: "Not enough successful outcomes yet to learn where this exercise progresses best.",
    };
  }

  const loadTrend = trend(exposures.map((exposure) => exposure.load));
  const repeatability = repeatabilityScore(exposures);
  const averageImprovingPosition = average(improving.map((exposure) => positionInRange(exposure.averageReps, range)));
  const confidence = evidenceQuality === "strong_style_evidence" && exposures.length >= 4 && repeatability >= 0.7 ? "high" : "medium";

  if (averageImprovingPosition <= 0.38 && loadTrend !== "falling" && repeatability >= 0.65) {
    return {
      state: "load_biased",
      zone: lowerZone(range, Math.max(2, Math.round((range.max - range.min + 1) * 0.35))),
      confidence,
      reason: "Lower-zone work has repeatedly produced progression while load and repeatability stayed solid.",
    };
  }

  if (averageImprovingPosition >= 0.65 && repeatability >= 0.65) {
    return {
      state: "rep_biased",
      zone: upperMiddleZone(range),
      confidence,
      reason: "Upper-zone work has produced the strongest repeatable progression for this exercise.",
    };
  }

  return {
    state: "balanced",
    zone: middleZone(range),
    confidence,
    reason: "Middle-zone work has produced the most reliable progression signal.",
  };
}

function explorationGuidance(range: RepRange, zone: RepRange, quality: ExerciseTargetZoneEvidenceQuality): string {
  if (quality === "biased_low_only") return `Stay at this load and aim for ${targetZoneLabel(zone)} clean reps.`;
  if (quality === "biased_high_only") return `Try a slightly heavier load and aim for ${targetZoneLabel(zone)} clean reps.`;
  return `Target ${targetZoneLabel(zone)} clean reps while the app learns this exercise.`;
}

function guidanceForState(state: ExerciseTargetZoneState, zone: RepRange): string {
  if (state === "load_biased") return `Heavy-end work: aim for ${targetZoneLabel(zone)} clean reps.`;
  if (state === "rep_biased") return `Build reps first: aim for ${targetZoneLabel(zone)} clean reps.`;
  if (state === "balanced") return `Balanced target zone: aim for ${targetZoneLabel(zone)} clean reps.`;
  return `Target ${targetZoneLabel(zone)} clean reps.`;
}

function isOverrideLane(lane?: TrainingLane | null, block?: BlockType | null): boolean {
  return lane === "power" || lane === "peak" || lane === "recovery" || block === "power" || block === "peak" || block === "deload";
}

function overrideGuidance(lane?: TrainingLane | null, block?: BlockType | null): string {
  if (lane === "power" || block === "power") return "Keep it sharp. Quality beats extra reps.";
  if (lane === "peak" || block === "peak") return "Specificity first. Stay ready, not tired.";
  return "Easy quality reps. Recovery is the point.";
}

function overrideReason(lane?: TrainingLane | null, block?: BlockType | null): string {
  if (lane === "power" || block === "power") return "Power work ignores rep preference and prioritises fast, crisp output.";
  if (lane === "peak" || block === "peak") return "Peak work prioritises specificity and readiness over rep-range learning.";
  return "Recovery Window work prioritises easy quality over progression.";
}

function isConfounded(entry: ExerciseHistorySummary): boolean {
  const finishReason = entry.finishReason;
  return Boolean(
    entry.stoppedByDropOff ||
      (entry.finishedManually && finishReason !== "completed_enough" && finishReason !== "out_of_time") ||
      finishReason === "pain_limitation" ||
      finishReason === "equipment_unavailable",
  );
}

function lowerZone(range: RepRange, width: number): RepRange {
  return clampZone({ min: range.min, max: range.min + Math.max(0, width - 1) }, range);
}

function middleZone(range: RepRange): RepRange {
  const width = range.max - range.min;
  if (width <= 2) return clampZone({ min: range.min, max: range.max }, range);
  const min = Math.max(range.min, Math.round(range.min + width * 0.3));
  const max = Math.min(range.max, Math.round(range.min + width * 0.55));
  return clampZone({ min, max }, range);
}

function upperMiddleZone(range: RepRange): RepRange {
  const width = range.max - range.min;
  if (width <= 2) return middleZone(range);
  const min = Math.max(range.min, Math.round(range.min + width * 0.5));
  const max = Math.min(range.max, Math.round(range.min + width * 0.75));
  return clampZone({ min, max: Math.max(min, max) }, range);
}

function clampZone(zone: RepRange, range: RepRange): RepRange {
  const min = Math.max(range.min, Math.min(range.max, Math.round(zone.min)));
  const max = Math.max(min, Math.max(range.min, Math.min(range.max, Math.round(zone.max))));
  return { min, max };
}

function normalizeRange(range: RepRange): RepRange {
  const min = Math.max(1, Math.round(Math.min(range.min, range.max)));
  const max = Math.max(min, Math.round(Math.max(range.min, range.max)));
  return { min, max };
}

function roleFromSlot(slotRole?: string | null): ExerciseRole | null {
  if (slotRole === "heavy_primary") return "primary_compound";
  if (slotRole === "heavy_secondary" || slotRole === "strength") return "secondary_compound";
  if (slotRole === "power") return "power";
  if (slotRole === "isolation") return "isolation";
  if (slotRole === "secondary_compound" || slotRole === "primary_compound") return slotRole;
  return null;
}

function normalizeBlock(block?: BlockType | null): BlockType | "hypertrophy" {
  if (block === "strength_hypertrophy") return "powerbuilding";
  return block ?? "hypertrophy";
}

function isSmallIsolationFamily(family?: ExerciseFamily | null): boolean {
  return Boolean(
    family &&
      [
        "biceps_isolation",
        "triceps_isolation",
        "shoulder_isolation",
        "rear_delt_corrective",
        "calf_raise",
        "forearm",
        "adductor",
        "abductor",
      ].includes(family),
  );
}

function positionInRange(reps: number, range: RepRange): number {
  if (range.max <= range.min) return 0.5;
  return Math.min(1, Math.max(0, (reps - range.min) / (range.max - range.min)));
}

function repeatabilityScore(exposures: Exposure[]): number {
  if (exposures.length < 2) return 0;
  const reps = exposures.map((exposure) => exposure.averageReps);
  const mean = average(reps);
  if (mean <= 0) return 0;
  const variance = average(reps.map((value) => (value - mean) ** 2));
  const coefficient = Math.sqrt(variance) / mean;
  return Math.max(0, Math.min(1, 1 - coefficient));
}

function trend(values: number[]): "rising" | "stable" | "falling" {
  if (values.length < 2) return "stable";
  const first = average(values.slice(0, Math.max(1, Math.floor(values.length / 2))));
  const last = average(values.slice(Math.floor(values.length / 2)));
  if (last > first) return "rising";
  if (last < first) return "falling";
  return "stable";
}

function average(values: number[]): number {
  const clean = values.filter(Number.isFinite);
  if (clean.length === 0) return 0;
  return clean.reduce((sum, value) => sum + value, 0) / clean.length;
}
