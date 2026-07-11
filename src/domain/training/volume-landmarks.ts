import type { Exercise, MuscleGroup, WorkoutHistorySummary } from "@/domain/training/models";
import type { BlockType } from "@/domain/training/annual-models";
import type { TrainingSetupGoal } from "@/domain/training/plan-setup";
import { shutdownRecoveryPressureRate } from "@/domain/training/fatigue-evidence";

export type VolumeLandmarkRecommendation = "maintain" | "increase_volume" | "reduce_volume" | "deload";

export interface VolumeRange {
  min: number;
  max: number;
}

export interface MuscleVolumeLandmark {
  muscleGroup: MuscleGroup;
  weeklyProductiveSets: number;
  mev: VolumeRange;
  mav: VolumeRange;
  mrv: VolumeRange;
  progressionRate: number;
  shutdownRate: number;
  performanceTrend: "rising" | "stable" | "declining";
  recommendation: VolumeLandmarkRecommendation;
  reason: string;
}

const largeMuscles = new Set<MuscleGroup>(["chest", "back", "quads", "hamstrings", "glutes"]);
const smallMuscles = new Set<MuscleGroup>([
  "biceps",
  "triceps",
  "shoulders",
  "rear_delts",
  "calves",
  "abs",
  "forearms",
  "traps",
  "adductors",
  "abductors",
]);

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

export function getStartingVolumeLandmarks(muscleGroup: MuscleGroup): Pick<MuscleVolumeLandmark, "mev" | "mav" | "mrv"> {
  if (largeMuscles.has(muscleGroup)) {
    return {
      mev: { min: 6, max: 8 },
      mav: { min: 10, max: 16 },
      mrv: { min: 18, max: 22 },
    };
  }

  return {
    mev: { min: 4, max: 6 },
    mav: { min: 8, max: 14 },
    mrv: { min: 16, max: 20 },
  };
}

export function analyzeMuscleVolumeLandmarks(
  history: WorkoutHistorySummary[],
  exercises: Exercise[],
  referenceDate = new Date(),
  context: { block?: BlockType; goal?: TrainingSetupGoal } = {},
): MuscleVolumeLandmark[] {
  const exerciseById = new Map(exercises.map((exercise) => [exercise.id, exercise]));
  const cutoff = new Date(referenceDate);
  cutoff.setDate(cutoff.getDate() - 7);
  const entries = history
    .filter((session) => new Date(session.completedAt).getTime() >= cutoff.getTime())
    .flatMap((session) => session.exerciseSummaries);

  return allMuscles.map((muscleGroup) => {
    const muscleEntries = entries.filter((entry) => {
      const exercise = exerciseById.get(entry.exerciseId);
      return exercise?.primaryMuscles.includes(muscleGroup);
    });
    const weeklyProductiveSets = muscleEntries.reduce((sum, entry) => sum + Math.max(0, entry.qualitySets), 0);
    const progressionRate = ratio(muscleEntries.filter((entry) => entry.progressionEarned).length, muscleEntries.length);
    const shutdownRate = shutdownRecoveryPressureRate(muscleEntries, exercises, context);
    const performanceTrend = trend(muscleEntries.map((entry) => entry.bestSetReps));
    const landmarks = getStartingVolumeLandmarks(muscleGroup);
    const recommendation = recommendVolume({
      weeklyProductiveSets,
      progressionRate,
      shutdownRate,
      performanceTrend,
      mav: landmarks.mav,
      mrv: landmarks.mrv,
    });

    return {
      muscleGroup,
      weeklyProductiveSets,
      ...landmarks,
      progressionRate,
      shutdownRate,
      performanceTrend,
      recommendation,
      reason: recommendationReason(muscleGroup, recommendation, weeklyProductiveSets, landmarks.mav, landmarks.mrv, shutdownRate, performanceTrend),
    };
  });
}

export function getPrimaryVolumeRecommendation(landmarks: MuscleVolumeLandmark[]): MuscleVolumeLandmark | null {
  return (
    landmarks.find((entry) => entry.recommendation === "deload") ??
    landmarks.find((entry) => entry.recommendation === "reduce_volume") ??
    landmarks.find((entry) => entry.recommendation === "increase_volume") ??
    null
  );
}

function recommendVolume({
  weeklyProductiveSets,
  progressionRate,
  shutdownRate,
  performanceTrend,
  mav,
  mrv,
}: {
  weeklyProductiveSets: number;
  progressionRate: number;
  shutdownRate: number;
  performanceTrend: MuscleVolumeLandmark["performanceTrend"];
  mav: VolumeRange;
  mrv: VolumeRange;
}): VolumeLandmarkRecommendation {
  const highFatigue = shutdownRate >= 0.5 || performanceTrend === "declining";
  const noProgress = progressionRate === 0;

  if (weeklyProductiveSets >= mrv.min && highFatigue) return "deload";
  if (weeklyProductiveSets >= mav.max && highFatigue) return "reduce_volume";
  if (noProgress && highFatigue) return "reduce_volume";
  if (noProgress && weeklyProductiveSets < mav.min && shutdownRate < 0.34) return "increase_volume";
  return "maintain";
}

function recommendationReason(
  muscleGroup: MuscleGroup,
  recommendation: VolumeLandmarkRecommendation,
  weeklyProductiveSets: number,
  mav: VolumeRange,
  mrv: VolumeRange,
  shutdownRate: number,
  performanceTrend: MuscleVolumeLandmark["performanceTrend"],
): string {
  const name = title(muscleGroup);
  if (recommendation === "increase_volume") {
    return `${name} is below the productive volume zone and progress is flat. Add a small amount of direct work.`;
  }
  if (recommendation === "reduce_volume") {
    return `${name} volume is high relative to output. Shutdowns are rising and productive sets are falling.`;
  }
  if (recommendation === "deload") {
    return `${name} is near the recoverable ceiling. Reduce workload before pushing harder.`;
  }
  if (weeklyProductiveSets >= mav.min && weeklyProductiveSets <= mav.max && shutdownRate < 0.5 && performanceTrend !== "declining") {
    return `${name} is inside the productive zone. Maintain current volume.`;
  }
  if (weeklyProductiveSets >= mrv.min) return `${name} is near the upper recoverable range. Monitor fatigue.`;
  return `${name} volume is building. Keep collecting completed sessions.`;
}

function trend(values: number[]): MuscleVolumeLandmark["performanceTrend"] {
  const recent = values.slice(-3);
  if (recent.length < 3) return "stable";
  if (recent.every((value, index) => index === 0 || value > recent[index - 1]!)) return "rising";
  if (recent.every((value, index) => index === 0 || value < recent[index - 1]!)) return "declining";
  return "stable";
}

function ratio(numerator: number, denominator: number): number {
  return denominator === 0 ? 0 : numerator / denominator;
}

function title(muscleGroup: MuscleGroup): string {
  return muscleGroup.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function isSmallMuscle(muscleGroup: MuscleGroup): boolean {
  return smallMuscles.has(muscleGroup);
}
