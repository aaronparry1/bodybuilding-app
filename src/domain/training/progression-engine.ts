import type { ProgressionSettings, SetLog } from "@/domain/training/models";
import { formatTargetRange, nextDurationTargetRange } from "@/domain/training/exercise-metrics";
import { getRequiredSets } from "@/domain/training/set-prescription";

export const defaultDropOffPercent = 15;

export const defaultLoadIncreaseByUnit = {
  kg: 2.5,
  lb: 5,
} as const;

type RepSet = Pick<SetLog, "reps"> & Partial<Pick<SetLog, "load" | "setNumber">>;

export interface ExerciseProgressionState {
  bestSetReps: number;
  dropOffReps: number;
  minimumAcceptableReps: number;
  completedAcceptableSets: number;
  shouldContinue: boolean;
  shouldShutdown: boolean;
  shutdownMessage?: string;
  shouldIncreaseLoad: boolean;
  nextLoad: number;
  nextTargetRange?: ProgressionSettings["repRange"];
  recommendation: string;
}

export interface ProgressionInput {
  exerciseName: string;
  currentLoad: number;
  settings: ProgressionSettings;
  sets: RepSet[];
  prescribedSetTargets?: number[];
}

export interface LoadProgressionInput {
  currentLoad: number;
  unit: ProgressionSettings["unit"];
  earnedIncrease: boolean;
  customLoadJump?: number;
}

function assertValidReps(reps: number): void {
  if (!Number.isFinite(reps) || reps < 0 || !Number.isInteger(reps)) {
    throw new Error("Logged reps must be a non-negative integer.");
  }
}

function assertValidPercent(percent: number): void {
  if (!Number.isFinite(percent) || percent < 0 || percent > 100) {
    throw new Error("Drop-off percent must be between 0 and 100.");
  }
}

function assertValidLoad(load: number): void {
  if (!Number.isFinite(load) || load < 0) {
    throw new Error("Load must be a non-negative number.");
  }
}

function assertValidLoadJump(loadJump: number): void {
  if (!Number.isFinite(loadJump) || loadJump < 0) {
    throw new Error("Load jump must be a non-negative number.");
  }
}

export function getDefaultLoadIncrease(unit: ProgressionSettings["unit"]): number {
  return defaultLoadIncreaseByUnit[unit];
}

export function resolveDropOffPercent(dropOffPercent = defaultDropOffPercent): number {
  assertValidPercent(dropOffPercent);
  return dropOffPercent;
}

export function calculateBestSet(sets: Pick<SetLog, "reps">[]): number {
  sets.forEach((set) => assertValidReps(set.reps));
  return sets.length ? Math.max(...sets.map((set) => set.reps)) : 0;
}

export function calculateRepDropOffThreshold(
  bestSetReps: number,
  dropOffPercent = defaultDropOffPercent,
): number {
  assertValidReps(bestSetReps);
  const safeDropOffPercent = resolveDropOffPercent(dropOffPercent);
  return bestSetReps * (safeDropOffPercent / 100);
}

export function calculateMinimumAllowedReps(
  bestSetReps: number,
  dropOffPercent = defaultDropOffPercent,
): number {
  if (bestSetReps === 0) return 0;
  const dropOffReps = calculateRepDropOffThreshold(bestSetReps, dropOffPercent);
  return Math.floor(bestSetReps - dropOffReps);
}

export const minimumAcceptableReps = calculateMinimumAllowedReps;

export function isWithinRepRange(reps: number, settings: ProgressionSettings): boolean {
  assertValidReps(reps);
  return reps >= settings.repRange.min && reps <= settings.repRange.max;
}

export function shouldStopExercise(sets: Pick<SetLog, "reps">[], dropOffPercent = defaultDropOffPercent): boolean {
  if (sets.length <= 1) return false;
  const bestSetReps = calculateBestSet(sets);
  const latestReps = sets.at(-1)?.reps ?? 0;
  assertValidReps(latestReps);
  return latestReps < calculateMinimumAllowedReps(bestSetReps, dropOffPercent);
}

function hasLoadData(sets: RepSet[]): sets is (RepSet & Pick<SetLog, "load">)[] {
  return sets.every((set) => Number.isFinite(set.load));
}

function hasProgressiveLoadIncrease(sets: RepSet[]): boolean {
  if (!hasLoadData(sets)) return false;

  let previousMax = sets[0]?.load ?? 0;
  for (const set of sets.slice(1)) {
    if (set.load > previousMax) return true;
    previousMax = Math.max(previousMax, set.load);
  }
  return false;
}

function latestSetIsAtProgressedLoad(sets: RepSet[]): boolean {
  if (!hasProgressiveLoadIncrease(sets)) return false;
  if (!hasLoadData(sets)) return false;

  const latestLoad = sets.at(-1)?.load;
  if (latestLoad == null || !Number.isFinite(latestLoad)) return false;
  const previousMax = Math.max(...sets.slice(0, -1).map((set) => set.load));

  return latestLoad > previousMax || latestLoad === Math.max(...sets.map((set) => set.load));
}

function getHighestLoadSets(sets: RepSet[]): RepSet[] {
  if (!sets.length || !hasLoadData(sets)) return sets;
  const highestLoad = Math.max(...sets.map((set) => set.load));
  return sets.filter((set) => set.load === highestLoad);
}

function shouldStopProgressionAwareExercise(sets: RepSet[], settings: ProgressionSettings): boolean {
  if (sets.length <= 1) return false;

  const latestSet = sets.at(-1);
  if (!latestSet) return false;

  if (latestSetIsAtProgressedLoad(sets)) {
    return latestSet.reps < settings.repRange.min;
  }

  return shouldStopExercise(sets, settings.dropOffPercent);
}

export function shouldContinueExercise(sets: Pick<SetLog, "reps">[], dropOffPercent = defaultDropOffPercent): boolean {
  return !shouldStopExercise(sets, dropOffPercent);
}

export function countAcceptableWorkSets(
  sets: RepSet[],
  settings: ProgressionSettings,
): number {
  if (hasProgressiveLoadIncrease(sets)) {
    return sets.filter((set) => isWithinRepRange(set.reps, settings)).length;
  }

  const bestSetReps = calculateBestSet(sets);
  const minimum = calculateMinimumAllowedReps(bestSetReps, settings.dropOffPercent);
  return sets.filter((set) => set.reps >= minimum && isWithinRepRange(set.reps, settings)).length;
}

export function earnedLoadIncrease(sets: RepSet[], settings: ProgressionSettings): boolean {
  if (shouldStopProgressionAwareExercise(sets, settings)) return false;

  const comparableSets = hasProgressiveLoadIncrease(sets) ? getHighestLoadSets(sets) : sets;
  const bestSetReps = calculateBestSet(comparableSets);
  const reachedTopOfRange = bestSetReps >= settings.repRange.max;
  const completedRequiredWork =
    comparableSets.filter((set) => isWithinRepRange(set.reps, settings)).length >= getRequiredSets(settings);

  return reachedTopOfRange && completedRequiredWork;
}

export function calculateNextRecommendedLoad({
  currentLoad,
  unit,
  earnedIncrease,
  customLoadJump,
}: LoadProgressionInput): number {
  assertValidLoad(currentLoad);
  const loadJump = customLoadJump ?? getDefaultLoadIncrease(unit);
  assertValidLoadJump(loadJump);

  if (!earnedIncrease || loadJump === 0) return currentLoad;

  const nextLoad = currentLoad + loadJump;
  return Number(nextLoad.toFixed(2));
}

export function formatLoad(load: number, unit: ProgressionSettings["unit"]): string {
  assertValidLoad(load);
  return `${Number(load.toFixed(2))}${unit}`;
}

export function evaluateExerciseProgression({
  exerciseName,
  currentLoad,
  settings,
  sets,
  prescribedSetTargets,
}: ProgressionInput): ExerciseProgressionState {
  assertValidLoad(currentLoad);
  resolveDropOffPercent(settings.dropOffPercent);

  const bestSetReps = calculateBestSet(sets);
  const dropOffReps = calculateRepDropOffThreshold(bestSetReps, settings.dropOffPercent);
  const minimum = calculateMinimumAllowedReps(bestSetReps, settings.dropOffPercent);
  const shouldShutdown = shouldStopProgressionAwareExercise(sets, settings);
  const shouldContinue = !shouldShutdown;
  const completedAcceptableSets = countAcceptableWorkSets(sets, settings);
  const isDuration = settings.measurementType === "duration";
  const hasExactTargets = prescribedSetTargets?.length === sets.length;
  const exactTargetsMet = hasExactTargets && prescribedSetTargets!.every((target, index) => (sets[index]?.reps ?? 0) >= target);
  const shouldIncreaseMetric = hasExactTargets ? exactTargetsMet : earnedLoadIncrease(sets, settings);
  const shouldIncreaseLoad = !isDuration && shouldIncreaseMetric;
  const productiveProgressedLoad = hasProgressiveLoadIncrease(sets) && getHighestLoadSets(sets).some((set) => isWithinRepRange(set.reps, settings));
  const nextTargetRange = isDuration && shouldIncreaseMetric
    ? nextDurationTargetRange(settings.repRange, settings.durationIncreaseSeconds ?? 5)
    : settings.repRange;
  const nextLoad = calculateNextRecommendedLoad({
    currentLoad,
    unit: settings.unit,
    earnedIncrease: shouldIncreaseLoad,
    customLoadJump: settings.loadIncrease,
  });

  if (shouldShutdown) {
    return {
      bestSetReps,
      dropOffReps,
      minimumAcceptableReps: minimum,
      completedAcceptableSets,
      shouldContinue,
      shouldShutdown,
      shutdownMessage: `Exercise complete. Performance dropped enough to move on from ${exerciseName.toLowerCase()} today.`,
      shouldIncreaseLoad: false,
      nextLoad: currentLoad,
      nextTargetRange: settings.repRange,
      recommendation: "Stop this exercise. Save the next load decision for your next session.",
    };
  }

  if (productiveProgressedLoad) {
    return {
      bestSetReps,
      dropOffReps,
      minimumAcceptableReps: minimum,
      completedAcceptableSets,
      shouldContinue,
      shouldShutdown,
      shouldIncreaseLoad,
      nextLoad,
      nextTargetRange,
      recommendation: isDuration
        ? `Good duration progression. Time stayed inside the target range at the harder variation.`
        : "Good load progression. Reps stayed inside the target range at the heavier weight.",
    };
  }

  if (isDuration && shouldIncreaseMetric) {
    return {
      bestSetReps,
      dropOffReps,
      minimumAcceptableReps: minimum,
      completedAcceptableSets,
      shouldContinue,
      shouldShutdown,
      shouldIncreaseLoad: false,
      nextLoad: currentLoad,
      nextTargetRange,
      recommendation: `Increase duration next time to ${formatTargetRange(nextTargetRange, "duration")}.`,
    };
  }

  if (shouldIncreaseLoad) {
    return {
      bestSetReps,
      dropOffReps,
      minimumAcceptableReps: minimum,
      completedAcceptableSets,
      shouldContinue,
      shouldShutdown,
      shouldIncreaseLoad,
      nextLoad,
      nextTargetRange,
      recommendation: `Increase load next time by ${settings.loadIncrease}${settings.unit}. Top-end reps and required quality sets were earned.`,
    };
  }

  return {
    bestSetReps,
    dropOffReps,
    minimumAcceptableReps: minimum,
    completedAcceptableSets,
    shouldContinue,
    shouldShutdown,
    shouldIncreaseLoad,
    nextLoad,
    nextTargetRange,
    recommendation:
      sets.length === 0
        ? "First set sets the bar. Literally."
        : isDuration
          ? "Keep the target. Aim for more controlled seconds next time."
          : "Keep the load. Aim for more clean reps next time.",
  };
}
