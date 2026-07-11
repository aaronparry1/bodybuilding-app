import type { BlockType } from "@/domain/training/annual-models";
import type { EventTaperResult } from "@/domain/training/event-taper";
import type { FatigueClassifierResult } from "@/domain/training/fatigue-classifier";
import type { Exercise, ExperienceLevel, MuscleGroup, WorkoutHistorySummary } from "@/domain/training/models";
import { normalizeTrainingSetupGoal, type TrainingSetupGoal } from "@/domain/training/plan-setup";
import { getSuccessModel } from "@/domain/training/success-model";
import { getStartingVolumeLandmarks } from "@/domain/training/volume-landmarks";

export type PersonalisedVolumeStatus = "insufficient_data" | "underdosed" | "productive" | "high_cost" | "overreaching";
export type PersonalisedVolumeConfidence = "low" | "medium" | "high";
export type PersonalisedVolumeTrend = "rising" | "stable" | "falling";
export type VolumeLadderAction =
  | "bias_high"
  | "raise_range"
  | "add_exercise"
  | "hold"
  | "bias_low"
  | "lower_range"
  | "remove_or_swap_exercise"
  | "deload_caution"
  | "insufficient_data";

export interface PersonalisedVolumeEvidence {
  weeksObserved: number;
  exposures: number;
  extraSessionExposures: number;
  shutdownRate: number;
  progressionRate: number;
  averageProductiveSetsPerWeek: number;
  recentProductiveSetsPerWeek: number;
  previousProductiveSetsPerWeek: number;
  productiveRange: {
    low: number;
    high: number;
  };
  summary: string[];
}

export interface PersonalisedVolumeResult {
  muscleGroup: MuscleGroup;
  status: PersonalisedVolumeStatus;
  confidence: PersonalisedVolumeConfidence;
  currentProductiveSetsPerWeek: number;
  trend: PersonalisedVolumeTrend;
  recommendedLadderAction: VolumeLadderAction;
  evidence: PersonalisedVolumeEvidence;
  reason: string;
  userCopy: string;
}

export interface PersonalisedVolumeInput {
  completedWorkouts: WorkoutHistorySummary[];
  exercises: Exercise[];
  muscleGroup: MuscleGroup;
  goal?: TrainingSetupGoal | null;
  block?: BlockType | null;
  experienceLevel?: ExperienceLevel | null;
  includeSecondaryContribution?: boolean;
  previousLadderActions?: VolumeLadderAction[];
  previousLadderActionsByMuscle?: Partial<Record<MuscleGroup, VolumeLadderAction[]>>;
  deloadActive?: boolean;
  fatigueClassification?: FatigueClassifierResult;
  eventTaper?: EventTaperResult | null;
  referenceDate?: Date;
}

const allMuscles: MuscleGroup[] = [
  "chest",
  "back",
  "quads",
  "hamstrings",
  "glutes",
  "shoulders",
  "biceps",
  "triceps",
  "calves",
  "abs",
  "forearms",
  "traps",
  "rear_delts",
  "adductors",
  "abductors",
];

const minimumWeeks = 3;
const minimumExposures = 2;
const minimumProductiveSets = 6;

export function analyzePersonalisedMuscleVolume(input: PersonalisedVolumeInput): PersonalisedVolumeResult {
  const goal = input.goal ? normalizeTrainingSetupGoal(input.goal) : undefined;
  const exerciseById = new Map(input.exercises.map((exercise) => [exercise.id, exercise]));
  const weeklyBuckets = new Map<string, { sets: number; exposures: number; shutdowns: number; progressions: number; extraExposures: number }>();

  for (const workout of input.completedWorkouts) {
    if (!workout.completedAt) continue;
    for (const entry of workout.exerciseSummaries) {
      const exercise = exerciseById.get(entry.exerciseId);
      if (!exercise) continue;
      const contribution = muscleContribution(exercise, input.muscleGroup, input.includeSecondaryContribution);
      if (contribution <= 0) continue;
      const productiveSets = Math.max(0, entry.qualitySets) * contribution;
      if (productiveSets <= 0) continue;
      const key = weekKey(workout.completedAt);
      const bucket = weeklyBuckets.get(key) ?? { sets: 0, exposures: 0, shutdowns: 0, progressions: 0, extraExposures: 0 };
      bucket.sets += productiveSets;
      bucket.exposures += 1;
      bucket.shutdowns += entry.stoppedByDropOff ? 1 : 0;
      bucket.progressions += entry.progressionEarned ? 1 : 0;
      bucket.extraExposures += workout.sessionKind && workout.sessionKind !== "planned" ? 1 : 0;
      weeklyBuckets.set(key, bucket);
    }
  }

  const weeks = [...weeklyBuckets.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([, bucket]) => bucket);
  const weeksObserved = weeks.length;
  const exposures = weeks.reduce((sum, bucket) => sum + bucket.exposures, 0);
  const totalProductiveSets = weeks.reduce((sum, bucket) => sum + bucket.sets, 0);
  const productiveRange = productiveRangeFor(input.muscleGroup, goal, input.experienceLevel);
  const baseEvidence = buildEvidence({
    weeks,
    productiveRange,
    fallbackWeeks: weeksObserved,
    fallbackExposures: exposures,
  });

  if (weeksObserved < minimumWeeks || exposures < minimumExposures || totalProductiveSets < minimumProductiveSets) {
    return {
      muscleGroup: input.muscleGroup,
      status: "insufficient_data",
      confidence: "low",
      currentProductiveSetsPerWeek: round1(baseEvidence.recentProductiveSetsPerWeek),
      trend: "stable",
      recommendedLadderAction: "insufficient_data",
      evidence: {
        ...baseEvidence,
        summary: [
          `Need at least ${minimumWeeks} weeks and ${minimumExposures} exposures for this muscle.`,
          `${title(input.muscleGroup)} currently has ${weeksObserved} week${weeksObserved === 1 ? "" : "s"} and ${exposures} exposure${exposures === 1 ? "" : "s"}.`,
        ],
      },
      reason: "Not enough muscle-specific history yet.",
      userCopy: "Log a few weeks first. The app is smart, not psychic.",
    };
  }

  const trend = volumeTrend(weeks.map((bucket) => bucket.sets));
  const shutdownRate = baseEvidence.shutdownRate;
  const progressionRate = baseEvidence.progressionRate;
  const risingFatigue = shutdownRate >= fatigueThreshold(goal, input.experienceLevel);
  const repeatedlyUnderdosed = repeatedBelowRange(weeks, productiveRange.low);
  const repeatedlyHighCost = repeatedHighCost(weeks, productiveRange.high);
  const highVolume = baseEvidence.recentProductiveSetsPerWeek > productiveRange.high || baseEvidence.averageProductiveSetsPerWeek > productiveRange.high;
  const lowVolume = baseEvidence.recentProductiveSetsPerWeek < productiveRange.low;
  const progressFlat = progressionRate < 0.25;

  let status: PersonalisedVolumeStatus = "productive";
  if (highVolume && risingFatigue && trend === "falling") status = "overreaching";
  else if (risingFatigue || repeatedlyHighCost) status = "high_cost";
  else if (lowVolume && progressFlat && shutdownRate < 0.34) status = "underdosed";

  const recommendedLadderAction = chooseLadderAction({
    status,
    input,
    repeatedlyUnderdosed,
    repeatedlyHighCost,
    trend,
    highVolume,
  });
  const confidence = confidenceFor(weeksObserved, exposures, status, recommendedLadderAction);
  const reason = reasonFor(input.muscleGroup, status, recommendedLadderAction);

  return {
    muscleGroup: input.muscleGroup,
    status,
    confidence,
    currentProductiveSetsPerWeek: round1(baseEvidence.recentProductiveSetsPerWeek),
    trend,
    recommendedLadderAction,
    evidence: {
      ...baseEvidence,
      summary: [
        `${title(input.muscleGroup)} averaged ${round1(baseEvidence.averageProductiveSetsPerWeek)} productive sets/week over ${weeksObserved} weeks.`,
        `Recent week: ${round1(baseEvidence.recentProductiveSetsPerWeek)} productive sets.`,
        `Shutdown rate: ${Math.round(shutdownRate * 100)}%.`,
        baseEvidence.extraSessionExposures > 0 ? `${baseEvidence.extraSessionExposures} extra-session exposure${baseEvidence.extraSessionExposures === 1 ? "" : "s"} counted as real workload.` : "No extra-session exposure counted.",
      ],
    },
    reason,
    userCopy: userCopyFor(input.muscleGroup, recommendedLadderAction),
  };
}

export function analyzePersonalisedVolume(input: Omit<PersonalisedVolumeInput, "muscleGroup">): PersonalisedVolumeResult[] {
  return allMuscles.map((muscleGroup) =>
    analyzePersonalisedMuscleVolume({
      ...input,
      muscleGroup,
      previousLadderActions: input.previousLadderActionsByMuscle?.[muscleGroup] ?? input.previousLadderActions,
    }),
  );
}

export function getPrimaryPersonalisedVolumeRecommendation(results: PersonalisedVolumeResult[]): PersonalisedVolumeResult | null {
  return (
    results.find((result) => result.recommendedLadderAction === "deload_caution" && result.confidence !== "low") ??
    results.find((result) => result.recommendedLadderAction === "remove_or_swap_exercise" && result.confidence !== "low") ??
    results.find((result) => result.recommendedLadderAction === "lower_range" && result.confidence !== "low") ??
    results.find((result) => result.recommendedLadderAction === "add_exercise" && result.confidence !== "low") ??
    results.find((result) => result.recommendedLadderAction === "raise_range" && result.confidence !== "low") ??
    results.find((result) => ["bias_low", "bias_high"].includes(result.recommendedLadderAction) && result.confidence !== "low") ??
    null
  );
}

function chooseLadderAction({
  status,
  input,
  repeatedlyUnderdosed,
  repeatedlyHighCost,
  trend,
  highVolume,
}: {
  status: PersonalisedVolumeStatus;
  input: PersonalisedVolumeInput;
  repeatedlyUnderdosed: boolean;
  repeatedlyHighCost: boolean;
  trend: PersonalisedVolumeTrend;
  highVolume: boolean;
}): VolumeLadderAction {
  const previous = input.previousLadderActions ?? [];
  const goal = input.goal ? normalizeTrainingSetupGoal(input.goal) : undefined;
  const model = getSuccessModel(goal);

  if (input.deloadActive || input.block === "deload") {
    if (status === "overreaching" || status === "high_cost") return "deload_caution";
    return "hold";
  }

  if (input.eventTaper && ["taper", "event_week", "post_event"].includes(input.eventTaper.eventPhase)) {
    if (status === "overreaching" || status === "high_cost") return "deload_caution";
    return "hold";
  }

  if (input.eventTaper?.eventPhase === "specificity") {
    if (status === "underdosed") return "bias_high";
    if (status === "high_cost" && (repeatedlyHighCost || highVolume)) return "lower_range";
  }

  if (input.fatigueClassification?.classification === "systemic" || input.fatigueClassification?.classification === "mixed") {
    if (input.fatigueClassification.severity !== "low") return status === "high_cost" || status === "overreaching" ? "deload_caution" : "hold";
  }

  if (
    input.fatigueClassification?.classification === "muscle_local" &&
    input.fatigueClassification.affectedMuscles.includes(input.muscleGroup) &&
    input.fatigueClassification.severity === "high" &&
    status === "underdosed"
  ) {
    return "hold";
  }

  if (status === "overreaching") return "deload_caution";

  if (status === "underdosed") {
    if (goal === "powerlifting_meet") return "bias_high";
    if (model.recommendationBias.keepSimple) return previous.includes("bias_high") && repeatedlyUnderdosed ? "raise_range" : "bias_high";
    if (goal === "build_strength" && !previous.includes("raise_range")) return repeatedlyUnderdosed ? "raise_range" : "bias_high";
    if (previous.includes("raise_range") && repeatedlyUnderdosed) return "add_exercise";
    if (previous.includes("bias_high") && repeatedlyUnderdosed) return "raise_range";
    return "bias_high";
  }

  if (status === "high_cost") {
    if (previous.includes("lower_range") && repeatedlyHighCost) return "remove_or_swap_exercise";
    if (previous.includes("bias_low") && repeatedlyHighCost) return "lower_range";
    if ((goal === "athletic_performance" || goal === "get_leaner") && (repeatedlyHighCost || highVolume)) return "lower_range";
    if (model.recommendationBias.keepSimple && !previous.includes("bias_low")) return "bias_low";
    return repeatedlyHighCost || trend === "falling" ? "lower_range" : "bias_low";
  }

  return "hold";
}

function productiveRangeFor(muscleGroup: MuscleGroup, goal?: TrainingSetupGoal | null, experienceLevel?: ExperienceLevel | null): PersonalisedVolumeEvidence["productiveRange"] {
  goal = goal ? normalizeTrainingSetupGoal(goal) : goal;
  const landmarks = getStartingVolumeLandmarks(muscleGroup).mav;
  let low = landmarks.min;
  let high = landmarks.max;
  if (goal === "build_muscle") {
    low += 1;
    high += 1;
  }
  if (goal === "build_strength" || goal === "athletic_performance" || goal === "powerlifting_meet") {
    high -= 2;
  }
  if (goal === "get_leaner") {
    low -= 1;
    high -= 2;
  }
  if (experienceLevel === "beginner") {
    low -= 1;
    high -= 2;
  }
  if (experienceLevel === "advanced" && goal === "build_muscle") {
    high += 1;
  }
  return { low: Math.max(4, low), high: Math.max(low + 2, high) };
}

function buildEvidence({
  weeks,
  productiveRange,
  fallbackWeeks,
  fallbackExposures,
}: {
  weeks: Array<{ sets: number; exposures: number; shutdowns: number; progressions: number; extraExposures: number }>;
  productiveRange: PersonalisedVolumeEvidence["productiveRange"];
  fallbackWeeks: number;
  fallbackExposures: number;
}): PersonalisedVolumeEvidence {
  const totalSets = weeks.reduce((sum, bucket) => sum + bucket.sets, 0);
  const totalExposures = weeks.reduce((sum, bucket) => sum + bucket.exposures, 0);
  const recent = weeks.at(-1)?.sets ?? 0;
  const previousWeeks = weeks.slice(0, -1);
  const previous = average(previousWeeks.map((bucket) => bucket.sets));
  return {
    weeksObserved: fallbackWeeks,
    exposures: fallbackExposures,
    extraSessionExposures: weeks.reduce((sum, bucket) => sum + bucket.extraExposures, 0),
    shutdownRate: ratio(weeks.reduce((sum, bucket) => sum + bucket.shutdowns, 0), totalExposures),
    progressionRate: ratio(weeks.reduce((sum, bucket) => sum + bucket.progressions, 0), totalExposures),
    averageProductiveSetsPerWeek: average(weeks.map((bucket) => bucket.sets)),
    recentProductiveSetsPerWeek: recent,
    previousProductiveSetsPerWeek: previous,
    productiveRange,
    summary: [`${round1(totalSets)} productive sets across ${fallbackWeeks} observed weeks.`],
  };
}

function muscleContribution(exercise: Exercise, muscleGroup: MuscleGroup, includeSecondaryContribution?: boolean): number {
  if (exercise.primaryMuscles.includes(muscleGroup)) return 1;
  if (includeSecondaryContribution && exercise.secondaryMuscles.includes(muscleGroup)) return 0.5;
  return 0;
}

function repeatedBelowRange(weeks: Array<{ sets: number }>, low: number): boolean {
  const recent = weeks.slice(-3);
  return recent.length >= 3 && recent.filter((week) => week.sets < low).length >= 2;
}

function repeatedHighCost(weeks: Array<{ sets: number; shutdowns: number; exposures: number }>, high: number): boolean {
  const recent = weeks.slice(-3);
  return recent.length >= 3 && recent.filter((week) => week.sets > high || ratio(week.shutdowns, week.exposures) >= 0.34).length >= 2;
}

function volumeTrend(values: number[]): PersonalisedVolumeTrend {
  const recent = values.slice(-3);
  if (recent.length < 3) return "stable";
  if (recent.every((value, index) => index === 0 || value > recent[index - 1]!)) return "rising";
  if (recent.every((value, index) => index === 0 || value < recent[index - 1]!)) return "falling";
  return "stable";
}

function fatigueThreshold(goal?: TrainingSetupGoal | null, experienceLevel?: ExperienceLevel | null): number {
  goal = goal ? normalizeTrainingSetupGoal(goal) : goal;
  let threshold = 0.34;
  if (goal === "athletic_performance" || goal === "powerlifting_meet" || goal === "get_leaner") threshold -= 0.08;
  if (experienceLevel === "advanced") threshold -= 0.04;
  if (experienceLevel === "beginner") threshold += 0.04;
  return Math.max(0.2, threshold);
}

function confidenceFor(weeksObserved: number, exposures: number, status: PersonalisedVolumeStatus, action: VolumeLadderAction): PersonalisedVolumeConfidence {
  if (status === "insufficient_data" || action === "insufficient_data") return "low";
  if (weeksObserved >= 5 && exposures >= 5) return "high";
  return "medium";
}

function reasonFor(muscleGroup: MuscleGroup, status: PersonalisedVolumeStatus, action: VolumeLadderAction): string {
  if (status === "productive") return `${title(muscleGroup)} is moving. Stay here.`;
  if (action === "deload_caution") return `${title(muscleGroup)} is costing more than it is giving back.`;
  if (["bias_high", "raise_range", "add_exercise"].includes(action)) return `${title(muscleGroup)} looks underdosed across recent weeks.`;
  if (["bias_low", "lower_range", "remove_or_swap_exercise"].includes(action)) return `${title(muscleGroup)} work is getting expensive.`;
  return "Hold the current volume until the trend is clearer.";
}

function userCopyFor(muscleGroup: MuscleGroup, action: VolumeLadderAction): string {
  const name = title(muscleGroup);
  switch (action) {
    case "bias_high":
      return `${name} looks underdosed. Aim for the top of the range this week.`;
    case "raise_range":
      return `${name} still needs more. Start one set higher next week.`;
    case "add_exercise":
      return `${name} needs another slot. Add a low-fatigue accessory.`;
    case "bias_low":
      return `${name} is getting expensive. Stay near the low end this week.`;
    case "lower_range":
      return `${name} needs less work. Pull one set from accessories.`;
    case "remove_or_swap_exercise":
      return `${name} still is not recovering. Swap or remove one low-priority accessory.`;
    case "deload_caution":
      return "You’re doing more work than you’re recovering from.";
    case "insufficient_data":
      return "Log a few weeks first. The app is smart, not psychic.";
    case "hold":
    default:
      return `${name} is moving. Stay here.`;
  }
}

function weekKey(date: string): string {
  const value = new Date(date);
  const utc = new Date(Date.UTC(value.getUTCFullYear(), value.getUTCMonth(), value.getUTCDate()));
  const day = utc.getUTCDay() || 7;
  utc.setUTCDate(utc.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(utc.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((utc.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${utc.getUTCFullYear()}-${String(week).padStart(2, "0")}`;
}

function ratio(numerator: number, denominator: number): number {
  return denominator <= 0 ? 0 : numerator / denominator;
}

function average(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function round1(value: number): number {
  return Math.round(value * 10) / 10;
}

function title(muscleGroup: MuscleGroup): string {
  return muscleGroup.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}
