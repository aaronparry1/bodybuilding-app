import type { BlockType } from "@/domain/training/annual-models";
import { roundDownToIncrement } from "@/domain/training/load-increment-strategy";
import type { Exercise, ExerciseFamily, ExerciseHistorySummary, ExerciseRole, ExperienceLevel, UnitSystem, WorkoutHistorySummary } from "@/domain/training/models";
import type { TrainingSetupGoal } from "@/domain/training/plan-setup";

export type TrainingGapStatus = "current" | "short_gap" | "moderate_gap" | "long_gap" | "extended_gap";
export type TrainingGapAdjustment = "none" | "ease_in_note" | "reduce_load" | "return_week";
export type TrainingGapConfidence = "high" | "medium" | "low" | "insufficient_data";
export type TrainingGapScope = "global" | "exercise" | "none";

export interface TrainingGapAdjustmentInput {
  lastCompletedWorkoutDate?: string | Date | null;
  lastCompletedExerciseDate?: string | Date | null;
  history?: WorkoutHistorySummary[];
  exerciseHistory?: ExerciseHistorySummary[];
  targetExercise?: Exercise | null;
  goal?: TrainingSetupGoal;
  experienceLevel?: ExperienceLevel;
  blockType?: BlockType;
  exerciseRole?: ExerciseRole;
  exerciseFamily?: ExerciseFamily;
  currentRecommendedLoad?: number | null;
  unit?: UnitSystem;
  increment?: number;
  referenceDate?: Date;
  activeDeloadOrReturnState?: "deload" | "return_week" | null;
  loadIsEstimated?: boolean;
  loadKnown?: boolean;
}

export interface TrainingGapAdjustmentResult {
  status: TrainingGapStatus;
  adjustment: TrainingGapAdjustment;
  adjustedLoad?: number;
  confidence: TrainingGapConfidence;
  reason: string;
  evidence: string[];
  daysSinceLastWorkout?: number;
  daysSinceLastExercise?: number;
  scope: TrainingGapScope;
}

export function resolveTrainingGapAdjustment(input: TrainingGapAdjustmentInput): TrainingGapAdjustmentResult {
  const referenceDate = input.referenceDate ?? new Date();
  const lastWorkoutDate = parseDate(input.lastCompletedWorkoutDate) ?? latestWorkoutDate(input.history);
  const lastExerciseDate = parseDate(input.lastCompletedExerciseDate) ?? latestExerciseDate(input.exerciseHistory, input.targetExercise?.id);
  const daysSinceLastWorkout = daysBetween(lastWorkoutDate, referenceDate);
  const daysSinceLastExercise = daysBetween(lastExerciseDate, referenceDate);

  if (daysSinceLastWorkout == null && daysSinceLastExercise == null) {
    return {
      status: "current",
      adjustment: "none",
      confidence: "insufficient_data",
      reason: "Log a few sessions first. The app is smart, not psychic.",
      evidence: ["No completed workout history."],
      scope: "none",
    };
  }

  const scopedGap = chooseScopedGap(daysSinceLastWorkout, daysSinceLastExercise);
  const status = statusForGap(scopedGap.days);
  const adjustment = adjustmentForStatus(status);
  const evidence = [
    scopedGap.scope === "exercise" && daysSinceLastExercise != null ? `${daysSinceLastExercise} day(s) since this exercise/family was trained.` : null,
    daysSinceLastWorkout != null ? `${daysSinceLastWorkout} day(s) since last completed workout.` : null,
    input.goal ? `Goal: ${input.goal.replaceAll("_", " ")}.` : null,
    input.experienceLevel ? `Experience: ${input.experienceLevel}.` : null,
    input.blockType ? `Block: ${input.blockType}.` : null,
  ].filter((item): item is string => Boolean(item));

  const adjustedLoad = maybeAdjustedLoad(input, status);
  return {
    status,
    adjustment,
    adjustedLoad,
    confidence: confidenceForStatus(status, scopedGap.scope),
    reason: reasonForStatus(status, adjustedLoad != null),
    evidence,
    daysSinceLastWorkout,
    daysSinceLastExercise,
    scope: scopedGap.scope,
  };
}

function maybeAdjustedLoad(input: TrainingGapAdjustmentInput, status: TrainingGapStatus): number | undefined {
  const currentLoad = input.currentRecommendedLoad;
  if (status === "current" || status === "short_gap") return undefined;
  if (input.loadKnown === false || currentLoad == null || !Number.isFinite(currentLoad) || currentLoad <= 0) return undefined;

  const increment = input.increment ?? 2.5;
  const reduction = reductionForStatus(status, input);
  const raw = currentLoad * (1 - reduction);
  let adjusted = roundDownToIncrement(raw, increment);
  if (increment > 0 && adjusted >= currentLoad) adjusted = roundDownToIncrement(currentLoad - increment, increment);
  if (!Number.isFinite(adjusted) || adjusted <= 0 || adjusted >= currentLoad) return undefined;
  return adjusted;
}

function reductionForStatus(status: TrainingGapStatus, input: TrainingGapAdjustmentInput): number {
  const load = input.currentRecommendedLoad ?? 0;
  const isMainLift = input.exerciseRole === "primary_compound" || input.exerciseRole === "power";
  const lightLoad = input.unit === "lb" ? load <= 90 : load <= 40;

  if (status === "moderate_gap") {
    if (input.experienceLevel === "beginner" && lightLoad) return 0.025;
    if (input.experienceLevel === "advanced" && isMainLift) return 0.05;
    return input.loadIsEstimated ? 0.025 : 0.05;
  }
  if (status === "long_gap") {
    if (input.experienceLevel === "beginner" && lightLoad) return 0.05;
    if (input.experienceLevel === "advanced" && isMainLift) return 0.1;
    return input.loadIsEstimated ? 0.05 : 0.075;
  }
  if (status === "extended_gap") {
    if (input.experienceLevel === "beginner" && lightLoad) return 0.1;
    if (input.experienceLevel === "advanced" && isMainLift) return 0.15;
    return input.loadIsEstimated ? 0.1 : 0.125;
  }
  return 0;
}

function chooseScopedGap(
  daysSinceLastWorkout: number | undefined,
  daysSinceLastExercise: number | undefined,
): { days: number; scope: TrainingGapScope } {
  if (daysSinceLastExercise != null && daysSinceLastExercise >= 8 && (daysSinceLastWorkout == null || daysSinceLastExercise > daysSinceLastWorkout + 7)) {
    return { days: daysSinceLastExercise, scope: "exercise" };
  }
  if (daysSinceLastWorkout != null) return { days: daysSinceLastWorkout, scope: daysSinceLastWorkout >= 8 ? "global" : "none" };
  return { days: daysSinceLastExercise ?? 0, scope: daysSinceLastExercise != null && daysSinceLastExercise >= 8 ? "exercise" : "none" };
}

function statusForGap(days: number): TrainingGapStatus {
  if (days <= 7) return "current";
  if (days <= 14) return "short_gap";
  if (days <= 21) return "moderate_gap";
  if (days <= 35) return "long_gap";
  return "extended_gap";
}

function adjustmentForStatus(status: TrainingGapStatus): TrainingGapAdjustment {
  if (status === "current") return "none";
  if (status === "short_gap") return "ease_in_note";
  if (status === "extended_gap") return "return_week";
  return "reduce_load";
}

function confidenceForStatus(status: TrainingGapStatus, scope: TrainingGapScope): TrainingGapConfidence {
  if (status === "current") return scope === "none" ? "low" : "medium";
  if (status === "short_gap") return "medium";
  if (status === "extended_gap") return "high";
  return scope === "global" ? "high" : "medium";
}

function reasonForStatus(status: TrainingGapStatus, hasAdjustedLoad: boolean): string {
  if (status === "current") return "Training is current. No re-entry adjustment.";
  if (status === "short_gap") return "First session back? Keep it clean before chasing numbers.";
  if (status === "extended_gap") return "Re-entry week. Build back in, don't prove a point.";
  return hasAdjustedLoad ? "We trimmed the target because you've had time away." : "Ease back in.";
}

function latestWorkoutDate(history?: WorkoutHistorySummary[]): Date | null {
  return latestDate((history ?? []).map((session) => session.completedAt));
}

function latestExerciseDate(history?: ExerciseHistorySummary[], exerciseId?: string): Date | null {
  const entries = exerciseId ? (history ?? []).filter((entry) => entry.exerciseId === exerciseId) : history ?? [];
  return latestDate(entries.map((entry) => entry.completedAt));
}

function latestDate(values: Array<string | undefined>): Date | null {
  const times = values
    .map((value) => parseDate(value)?.getTime())
    .filter((value): value is number => typeof value === "number" && Number.isFinite(value));
  if (times.length === 0) return null;
  return new Date(Math.max(...times));
}

function parseDate(value?: string | Date | null): Date | null {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isFinite(date.getTime()) ? date : null;
}

function daysBetween(previous: Date | null, reference: Date): number | undefined {
  if (!previous || !Number.isFinite(previous.getTime()) || !Number.isFinite(reference.getTime())) return undefined;
  const ms = reference.getTime() - previous.getTime();
  if (ms < 0) return 0;
  return Math.floor(ms / 86_400_000);
}
