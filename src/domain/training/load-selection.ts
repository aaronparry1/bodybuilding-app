import type {
  Equipment,
  Exercise,
  ExerciseFamily,
  ExerciseHistorySummary,
  ExerciseRole,
  ExperienceLevel,
  ProgressionSettings,
  SetLog,
  TrainingLane,
  UnitSystem,
  WorkoutHistorySummary,
} from "@/domain/training/models";
import type { BlockType } from "@/domain/training/annual-models";
import { formatTargetRange } from "@/domain/training/exercise-metrics";
import { recalibrateLoadForBlockTransition } from "@/domain/training/block-training-lanes";
import { roundDownToIncrement, roundUpToIncrement } from "@/domain/training/load-increment-strategy";
import type { TrainingSetupGoal } from "@/domain/training/plan-setup";
import { calculateMinimumAllowedReps } from "@/domain/training/progression-engine";
import { resolveProgressionThrottle, type ProgressionThrottleInput, type ProgressionThrottleResult } from "@/domain/training/progression-throttle";
import { evidence, type RecommendationEvidence } from "@/domain/training/recommendation-evidence";
import { resolveTrainingGapAdjustment } from "@/domain/training/training-gap-adjustment";
import { resolveExerciseTargetZone, targetZoneMidpoint } from "@/domain/training/exercise-target-zone";
import { getWorkSets } from "@/domain/training/workout-sets";
import { resolveCanonicalLoadEvidence } from "@/domain/training/load-evidence-resolver";

export type StartingLoadSource = "exact_history" | "same_family_estimate" | "blank";

export interface StartingLoadRecommendation {
  source: StartingLoadSource;
  load?: number;
  confidence: "high" | "medium" | "low" | "none";
  message: string;
  evidence?: string;
  recommendationEvidence?: RecommendationEvidence;
}

export interface SameFamilyEstimateOptions {
  targetExercise: Exercise;
  exercises: Exercise[];
  history?: WorkoutHistorySummary[];
  repRange: ProgressionSettings["repRange"];
  loadJump?: number;
  loadIncrement?: number;
  referenceDate?: Date;
  recentDays?: number;
  goal?: TrainingSetupGoal;
  experienceLevel?: ExperienceLevel;
  blockType?: BlockType;
  exerciseRole?: ExerciseRole;
  exerciseFamily?: ExerciseFamily;
  trainingLane?: TrainingLane;
  unit?: UnitSystem;
}

export interface InSessionLoadIncreaseSuggestion {
  shouldSuggest: boolean;
  currentLoad: number;
  suggestedLoad: number;
  message: string;
  evidence?: RecommendationEvidence;
  throttle?: ProgressionThrottleResult;
}

export interface InSessionLoadDropSuggestion {
  shouldDrop: boolean;
  currentLoad: number;
  suggestedLoad: number;
  message: string;
  evidence?: RecommendationEvidence;
}

export interface LoadRegressionRecommendation {
  action: "hold" | "caution" | "reduce";
  load?: number;
  severity?: "mild" | "moderate" | "severe";
  message: string;
  reasons: string[];
  evidence?: RecommendationEvidence;
}

export interface MissedRepRangeLoadRecommendation {
  action: "hold" | "reduce";
  load: number;
  severity?: "mild" | "moderate" | "severe";
  message: string;
  reasons: string[];
  evidence?: RecommendationEvidence;
}

const defaultRecentDays = 180;

export function resolveStartingLoadRecommendation({
  targetExercise,
  exercises,
  history,
  repRange,
  loadJump,
  loadIncrement,
  referenceDate,
  recentDays,
  goal,
  experienceLevel,
  blockType,
  exerciseRole,
  exerciseFamily,
  trainingLane,
  unit,
}: SameFamilyEstimateOptions): StartingLoadRecommendation {
  const increment = loadIncrement ?? loadJump ?? 2.5;
  const canonical = targetExercise.kind === "bodyweight" ? null : resolveCanonicalLoadEvidence(history ?? [], targetExercise.id);
  const exact = canonical;
  if (exact) {
    const carriedLoad = roundUpToIncrement(exact.nextRecommendedLoad, increment);
    const recalibrated = recalibrateLoadForBlockTransition({
      previousLoad: exact.load,
      previousBestReps: exact.bestSetReps,
      targetRepRange: repRange,
      increment,
      lane: trainingLane,
      blockType,
    });
    const rounded = recalibrated.changed ? recalibrated.load : carriedLoad;
    return applyTrainingGapToStartingLoad({
      source: "exact_history",
      load: rounded,
      confidence: "high",
      message: recalibrated.changed ? "Starting load recalibrated for this block." : "Previous performance sets today's starting load.",
      evidence: `${exact.exerciseName}: ${rounded}${exact.unit}`,
      recommendationEvidence: evidence({
        type: "starting_load",
        confidence: "high",
        source: "history",
        summary: recalibrated.changed ? "Exact history recalibrated for new rep target." : "Exact exercise history found.",
        dataPoints: [
          `${exact.exerciseName}: previous next load ${carriedLoad}${exact.unit}`,
          `Completed at ${exact.completedAt ?? "unknown date"}`,
          ...(recalibrated.changed ? recalibrated.evidence : []),
        ],
        reason: recalibrated.changed ? recalibrated.reason : "Previous performance sets today's starting load.",
        actionAllowed: true,
      }),
    }, {
      targetExercise,
      history,
      increment,
      referenceDate,
      goal,
      experienceLevel,
      blockType,
      exerciseRole: exerciseRole ?? targetExercise.role,
      exerciseFamily: exerciseFamily ?? targetExercise.family,
      unit: unit ?? exact.unit,
      loadIsEstimated: false,
      loadKnown: true,
    });
  }

  const estimate = estimateLoadFromSameFamily({
    targetExercise,
    exercises,
    history,
    repRange,
    loadIncrement: increment,
    referenceDate,
    recentDays,
    goal,
    experienceLevel,
    blockType,
    exerciseRole,
    exerciseFamily,
    trainingLane,
  });
  if (estimate.source === "same_family_estimate") {
    return applyTrainingGapToStartingLoad(estimate, {
      targetExercise,
      history,
      increment,
      referenceDate,
      goal,
      experienceLevel,
      blockType,
      exerciseRole: exerciseRole ?? targetExercise.role,
      exerciseFamily: exerciseFamily ?? targetExercise.family,
      unit: unit ?? targetExercise.defaultSettings.unit,
      loadIsEstimated: true,
      loadKnown: true,
    });
  }

  return applyTrainingGapToStartingLoad({
    source: "blank",
    confidence: "none",
    message: "Choose a starting load. Use warm-ups to find a weight for today’s exact targets.",
    recommendationEvidence: evidence({
      type: "starting_load",
      confidence: "insufficient_data",
      source: "limited_data",
      summary: "No reliable exact or same-family load history.",
      dataPoints: ["No exact exercise history.", "Same-family history did not meet the confidence threshold."],
      reason: "Choose a starting load. Use warm-ups to find a weight for today’s exact targets.",
      actionAllowed: false,
    }),
  }, {
    targetExercise,
    history,
    increment,
    referenceDate,
    goal,
    experienceLevel,
    blockType,
    exerciseRole: exerciseRole ?? targetExercise.role,
    exerciseFamily: exerciseFamily ?? targetExercise.family,
    unit: unit ?? targetExercise.defaultSettings.unit,
    loadIsEstimated: false,
    loadKnown: false,
  });
}

export function estimateLoadFromSameFamily({
  targetExercise,
  exercises,
  history,
  repRange,
  loadJump,
  loadIncrement,
  referenceDate = new Date(),
  recentDays = defaultRecentDays,
  blockType,
  exerciseRole,
  exerciseFamily,
  trainingLane,
}: SameFamilyEstimateOptions): StartingLoadRecommendation {
  const increment = loadIncrement ?? loadJump ?? 2.5;
  const exerciseById = new Map(exercises.map((exercise) => [exercise.id, exercise]));
  const cutoff = new Date(referenceDate);
  cutoff.setDate(cutoff.getDate() - recentDays);
  const targetZone = resolveExerciseTargetZone({
    exercise: targetExercise,
    exerciseId: targetExercise.id,
    exerciseRole: exerciseRole ?? targetExercise.role,
    exerciseFamily: exerciseFamily ?? targetExercise.family,
    movementPattern: targetExercise.movementPattern,
    block: blockType,
    lane: trainingLane,
    repRange,
    recentExerciseHistory: (history ?? []).flatMap((session) => session.exerciseSummaries),
  });
  const targetReps = targetZoneMidpoint(targetZone.targetZone);
  const entries = (history ?? [])
    .filter((session) => session.setsCompleted > 0)
    .flatMap((session) => session.exerciseSummaries)
    .filter((entry) => isUsefulSimilarEntry(entry, targetExercise, exerciseById, cutoff));

  const uniqueExerciseIds = new Set(entries.map((entry) => entry.exerciseId));
  if (uniqueExerciseIds.size < 2 && entries.length < 3) {
    return {
      source: "blank",
      confidence: "none",
      message: "Choose a starting load. Use warm-ups to find a weight for today’s exact targets.",
      recommendationEvidence: insufficientStartingLoadEvidence("Same-family data needs at least 2 similar exercises or 3 completed entries."),
    };
  }

  const estimates = entries
    .map((entry) => {
      const sourceExercise = exerciseById.get(entry.exerciseId);
      if (!sourceExercise) return null;
      const multiplier = similarityMultiplier(sourceExercise, targetExercise);
      if (multiplier < 0.75) return null;
      const estimatedOneRepMax = estimateOneRepMax(entry.load, entry.bestSetReps);
      const targetLoad = loadFromEstimatedOneRepMax(estimatedOneRepMax, targetReps) * multiplier;
      return Number.isFinite(targetLoad) && targetLoad > 0 ? { targetLoad, multiplier } : null;
    })
    .filter((value): value is { targetLoad: number; multiplier: number } => Boolean(value));

  if (estimates.length < 2) {
    return {
      source: "blank",
      confidence: "none",
      message: "Choose a starting load. Use warm-ups to find a weight for today’s exact targets.",
      recommendationEvidence: insufficientStartingLoadEvidence("Similar entries were not close enough to estimate safely."),
    };
  }

  const averageMultiplier = average(estimates.map((entry) => entry.multiplier));
  if (averageMultiplier < 0.78) {
    return {
      source: "blank",
      confidence: "none",
      message: "Choose a starting load. Similar exercise history is not reliable enough yet.",
      recommendationEvidence: insufficientStartingLoadEvidence("Same-family history exists, but similarity confidence was too low for a safe estimate."),
    };
  }

  const rawEstimate = average(estimates.map((entry) => entry.targetLoad));
  const rounded = roundUpToIncrement(rawEstimate, increment);
  if (rounded <= 0) {
    return {
      source: "blank",
      confidence: "none",
      message: "Choose a starting load. Use warm-ups to find a weight for today’s exact targets.",
      recommendationEvidence: insufficientStartingLoadEvidence("The same-family estimate did not produce a usable load."),
    };
  }

  return {
    source: "same_family_estimate",
    load: rounded,
    confidence: "medium",
    message: "Estimated from similar exercises. Adjust during warm-ups.",
    evidence: `${entries.length} recent same-family entries`,
    recommendationEvidence: evidence({
      type: "same_family_load_estimate",
      confidence: "medium",
      source: "history",
      summary: "Estimated from similar exercise history.",
      dataPoints: [
        `${entries.length} recent same-family entries`,
        `${uniqueExerciseIds.size} similar exercises`,
        "Work-set best performances converted with estimated1RM = load x (1 + reps / 30).",
        "Estimate rounded upward to the available load increment.",
      ],
      reason: "Estimated from similar exercises. Adjust during warm-ups.",
      actionAllowed: true,
    }),
  };
}

function applyTrainingGapToStartingLoad(
  recommendation: StartingLoadRecommendation,
  input: {
    targetExercise: Exercise;
    history?: WorkoutHistorySummary[];
    increment: number;
    referenceDate?: Date;
    goal?: TrainingSetupGoal;
    experienceLevel?: ExperienceLevel;
    blockType?: BlockType;
    exerciseRole?: ExerciseRole;
    exerciseFamily?: ExerciseFamily;
    unit?: UnitSystem;
    loadIsEstimated: boolean;
    loadKnown: boolean;
  },
): StartingLoadRecommendation {
  const exerciseHistory = (input.history ?? []).flatMap((session) => session.exerciseSummaries);
  const gap = resolveTrainingGapAdjustment({
    history: input.history,
    exerciseHistory,
    targetExercise: input.targetExercise,
    goal: input.goal,
    experienceLevel: input.experienceLevel,
    blockType: input.blockType,
    exerciseRole: input.exerciseRole,
    exerciseFamily: input.exerciseFamily,
    currentRecommendedLoad: recommendation.load,
    increment: input.increment,
    unit: input.unit ?? input.targetExercise.defaultSettings.unit,
    referenceDate: input.referenceDate,
    loadIsEstimated: input.loadIsEstimated,
    loadKnown: input.loadKnown,
  });
  if (gap.adjustment === "none") return recommendation;

  const adjustedLoad = gap.adjustedLoad;
  const nextLoad = adjustedLoad ?? recommendation.load;
  const reason = gap.reason;
  const existingEvidence = recommendation.recommendationEvidence;
  const nextEvidence = evidence({
    type: "training_gap_starting_load",
    confidence: gap.confidence === "insufficient_data" ? "insufficient_data" : gap.confidence,
    source: gap.confidence === "insufficient_data" ? "limited_data" : "history",
    summary: gap.adjustment === "return_week" ? "Re-entry week prescription." : gap.adjustment === "reduce_load" ? "Training-gap load adjustment." : "Training-gap ease-in note.",
    dataPoints: [
      ...(existingEvidence?.dataPoints ?? []),
      ...gap.evidence,
      adjustedLoad != null && recommendation.load != null ? `Target trimmed from ${recommendation.load}${input.unit ?? input.targetExercise.defaultSettings.unit} to ${adjustedLoad}${input.unit ?? input.targetExercise.defaultSettings.unit}.` : null,
    ].filter((item): item is string => Boolean(item)),
    reason,
    actionAllowed: Boolean(existingEvidence?.actionAllowed && adjustedLoad != null),
  });

  return {
    ...recommendation,
    load: nextLoad,
    confidence: recommendation.confidence === "none" ? "none" : gap.adjustment === "ease_in_note" ? recommendation.confidence : recommendation.source === "exact_history" ? "high" : "medium",
    message: reason,
    evidence: adjustedLoad != null
      ? `${reason} ${input.targetExercise.name}: ${adjustedLoad}${input.unit ?? input.targetExercise.defaultSettings.unit}`
      : recommendation.evidence,
    recommendationEvidence: nextEvidence,
  };
}

export function estimateOneRepMax(load: number, reps: number): number {
  if (!Number.isFinite(load) || !Number.isFinite(reps) || load <= 0 || reps < 0) return 0;
  return load * (1 + reps / 30);
}

export function loadFromEstimatedOneRepMax(estimatedOneRepMax: number, targetReps: number): number {
  if (!Number.isFinite(estimatedOneRepMax) || !Number.isFinite(targetReps) || estimatedOneRepMax <= 0 || targetReps < 0) return 0;
  return estimatedOneRepMax / (1 + targetReps / 30);
}

export function getInSessionLoadIncreaseSuggestion(
  sets: SetLog[],
  settings: ProgressionSettings,
  currentLoad: number,
  loadIncrement = settings.loadIncrease,
  throttleInput?: Omit<ProgressionThrottleInput, "progressionEarned" | "targetRepRange">,
): InSessionLoadIncreaseSuggestion {
  if (settings.measurementType === "duration") return noInSessionSuggestion(currentLoad);
  const workSets = getWorkSets(sets);
  const latest = workSets.at(-1);
  if (!latest || latest.reps < settings.repRange.max || latest.load !== currentLoad) {
    return noInSessionSuggestion(currentLoad);
  }

  const bestSet = Math.max(...workSets.map((set) => set.reps));
  const minimum = calculateMinimumAllowedReps(bestSet, settings.dropOffPercent);
  const productiveTopSetsAtCurrentLoad = workSets.filter(
    (set) => set.load === currentLoad && set.reps >= settings.repRange.max && set.reps >= minimum,
  );
  const lowerLoadsUsed = workSets.some((set) => set.load < currentLoad);
  const shouldSuggest = productiveTopSetsAtCurrentLoad.length >= 3 || lowerLoadsUsed;
  if (!shouldSuggest) return noInSessionSuggestion(currentLoad);

  const throttle = throttleInput
    ? resolveProgressionThrottle({
        ...throttleInput,
        targetRepRange: settings.repRange,
        progressionEarned: true,
      })
    : null;
  if (throttle && throttle.decision !== "push") {
    return {
      shouldSuggest: false,
      currentLoad,
      suggestedLoad: currentLoad,
      message: throttle.reason,
      throttle,
      evidence: evidence({
        type: "in_session_load_increase",
        confidence: throttle.confidence,
        source: throttle.confidence === "insufficient_data" ? "limited_data" : "history",
        summary: throttle.decision === "pull_back" ? "Progression throttle recommends pulling back." : "Progression throttle recommends holding load.",
        dataPoints: throttle.evidence,
        reason: throttle.reason,
        actionAllowed: false,
      }),
    };
  }

  const suggestedLoad = roundUpToIncrement(currentLoad + loadIncrement, loadIncrement);
  return {
    shouldSuggest: true,
    currentLoad,
    suggestedLoad,
    message: `${currentLoad}${settings.unit} looks too light today. Try ${suggestedLoad}${settings.unit} next set?`,
    throttle: throttle ?? undefined,
    evidence: evidence({
      type: "in_session_load_increase",
      confidence: "high",
      source: "history",
      summary: "Top-of-range work sets at the same load.",
      dataPoints: [
        `${productiveTopSetsAtCurrentLoad.length} productive work sets at ${currentLoad}${settings.unit} reached ${settings.repRange.max}+ reps.`,
        `No logged set at ${currentLoad}${settings.unit} fell below the current drop-off threshold.`,
      ],
      reason: `Exact targets were completed repeatedly at ${currentLoad}${settings.unit}. Next prescription will add one approved progression step.`,
      actionAllowed: true,
    }),
  };
}

export function getInSessionLoadDropSuggestion(
  sets: SetLog[],
  settings: ProgressionSettings,
  currentLoad: number,
  loadIncrement = settings.loadIncrease,
): InSessionLoadDropSuggestion {
  const workSets = getWorkSets(sets);
  const latest = workSets.at(-1);
  const noDrop = (message = "Keep the current load for the next work set."): InSessionLoadDropSuggestion => ({
    shouldDrop: false,
    currentLoad,
    suggestedLoad: currentLoad,
    message,
  });

  if (!latest || !Number.isFinite(currentLoad) || currentLoad <= 0) return noDrop();
  if (latest.reps >= settings.repRange.min) return noDrop();
  if (!Number.isFinite(latest.load) || latest.load <= 0) return noDrop();

  const severity = latest.reps <= Math.max(1, Math.floor(settings.repRange.min * 0.65)) ? "moderate" : "mild";
  const reduced = resolveReducedLoad({ currentLoad: latest.load, increment: loadIncrement, severity });
  if (reduced >= latest.load || reduced <= 0) return noDrop("Hold load. The next available jump down would overcorrect.");

  const metric = settings.measurementType === "duration" ? "duration target" : "rep target";
  const message = `Set missed the prescribed ${metric}. Use ${reduced}${settings.unit} on the next work set.`;
  return {
    shouldDrop: true,
    currentLoad: latest.load,
    suggestedLoad: reduced,
    message,
    evidence: evidence({
      type: "in_session_load_drop",
      confidence: "medium",
      source: "history",
      summary: "Latest work set missed the minimum prescribed rep target.",
      dataPoints: [
        `Latest work set: ${latest.load}${settings.unit} x ${latest.reps}${settings.measurementType === "duration" ? " sec" : ""}.`,
        "Hold today’s exact prescription until the next approved progression step.",
      ],
      reason: message,
      actionAllowed: true,
    }),
  };
}

export function getDeloadAwareInSessionLoadIncreaseSuggestion({
  sets,
  settings,
  currentLoad,
  loadIncrement = settings.loadIncrease,
  suppressEscalation,
  throttleInput,
}: {
  sets: SetLog[];
  settings: ProgressionSettings;
  currentLoad: number;
  loadIncrement?: number;
  suppressEscalation?: boolean;
  throttleInput?: Omit<ProgressionThrottleInput, "progressionEarned" | "targetRepRange">;
}): InSessionLoadIncreaseSuggestion {
  if (suppressEscalation) return noInSessionSuggestion(currentLoad);
  return getInSessionLoadIncreaseSuggestion(sets, settings, currentLoad, loadIncrement, throttleInput);
}

export function calculateNextSessionStartingLoadFromProductiveSets(
  sets: SetLog[],
  settings: ProgressionSettings,
  fallbackLoad: number,
  loadIncrement = settings.loadIncrease,
): number {
  const workSets = getWorkSets(sets);
  if (workSets.length === 0) return fallbackLoad;

  const loadedWorkSets = workSets.filter((set) => Number.isFinite(set.load) && set.load >= 0);
  const loadIncreasedDuringExercise = loadedWorkSets.some((set, index) => {
    const previousMax = Math.max(...loadedWorkSets.slice(0, index).map((previous) => previous.load));
    return index > 0 && set.load > previousMax;
  });
  const highRepLocalPrescription = settings.repRange.min >= 10 && settings.repRange.max >= 20;
  if (loadIncreasedDuringExercise && highRepLocalPrescription) {
    const highestLoad = Math.max(...loadedWorkSets.map((set) => set.load));
    const highestLoadSets = loadedWorkSets.filter((set) => set.load === highestLoad);
    const highestLoadStayedInRange =
      highestLoadSets.length > 0 &&
      highestLoadSets.every((set) => set.reps >= settings.repRange.min && set.reps <= settings.repRange.max);

    if (highestLoadStayedInRange) return roundUpToIncrement(Math.max(fallbackLoad, highestLoad), loadIncrement);
  }

  if (loadIncreasedDuringExercise && loadedWorkSets.length > 0) {
    const highestLoad = Math.max(...loadedWorkSets.map((set) => set.load));
    const highestLoadSets = loadedWorkSets.filter((set) => set.load === highestLoad);
    const fallbackIsHighestLoad = fallbackLoad === highestLoad;
    const highestLoadStayedInRange =
      highestLoadSets.length > 0 &&
      highestLoadSets.every((set) => set.reps >= settings.repRange.min && set.reps <= settings.repRange.max);

    if (fallbackIsHighestLoad && highestLoadStayedInRange) return fallbackLoad;
  }

  const bestSet = Math.max(...workSets.map((set) => set.reps));
  const minimum = calculateMinimumAllowedReps(bestSet, settings.dropOffPercent);
  const productiveLoads = workSets
    .filter((set) => set.reps >= minimum && set.reps >= settings.repRange.min)
    .map((set) => set.load)
    .filter((load) => Number.isFinite(load) && load >= 0);
  if (productiveLoads.length === 0) return fallbackLoad;
  return roundUpToIncrement(average(productiveLoads), loadIncrement);
}

export function calculateNextSessionLoadAfterInSessionEscalation({
  sets,
  settings,
  currentLoad,
  progressionNextLoad,
  loadIncrement = settings.loadIncrease,
}: {
  sets: SetLog[];
  settings: ProgressionSettings;
  currentLoad: number;
  progressionNextLoad: number;
  loadIncrement?: number;
}): number {
  const workSets = getWorkSets(sets);
  if (workSets.length === 0) return currentLoad;

  const bestSet = Math.max(...workSets.map((set) => set.reps));
  const minimum = calculateMinimumAllowedReps(bestSet, settings.dropOffPercent);
  const productiveSets = workSets.filter(
    (set) => set.reps >= minimum && set.reps >= settings.repRange.min && Number.isFinite(set.load) && set.load >= 0,
  );
  if (productiveSets.length === 0) return currentLoad;

  const productiveLoads = productiveSets.map((set) => set.load);
  const uniqueLoads = Array.from(new Set(productiveLoads));
  if (uniqueLoads.length <= 1) return progressionNextLoad;

  const highestSuccessfulLoad = Math.max(...productiveLoads);
  if (currentLoad !== highestSuccessfulLoad) return roundUpToIncrement(average(productiveLoads), loadIncrement);

  const successfulSetsAtHighestLoad = productiveSets.filter((set) => set.load === highestSuccessfulLoad).length;
  const requiredSetsAtNewLoad = Math.max(1, settings.requiredSets ?? settings.requiredWorkSets);

  if (successfulSetsAtHighestLoad >= requiredSetsAtNewLoad + 1) {
    return roundUpToIncrement(highestSuccessfulLoad + loadIncrement, loadIncrement);
  }

  return highestSuccessfulLoad;
}

export function recommendLoadAfterClearRepRangeMiss({
  sets,
  settings,
  currentLoad,
  loadIncrement = settings.loadIncrease,
}: {
  sets: SetLog[];
  settings: ProgressionSettings;
  currentLoad: number;
  loadIncrement?: number;
}): MissedRepRangeLoadRecommendation {
  const workSets = getWorkSets(sets);
  const requiredSets = Math.max(1, settings.requiredSets ?? settings.requiredWorkSets);
  const hold = (message: string, reasons: string[]): MissedRepRangeLoadRecommendation => ({
    action: "hold",
    load: currentLoad,
    message,
    reasons,
    evidence: evidence({
      type: "reduced_load",
      confidence: "low",
      source: "history",
      summary: "Current workout does not justify reducing load.",
      dataPoints: reasons,
      reason: message,
      actionAllowed: false,
    }),
  });

  if (!Number.isFinite(currentLoad) || currentLoad <= 0) {
    return hold("Hold load. No loaded work-set evidence is available.", ["Current load is not a positive loaded prescription."]);
  }

  if (workSets.length < requiredSets) {
    return hold("Hold load. There are not enough completed work sets to reduce confidently.", [
      `${workSets.length} of ${requiredSets} required work set(s) completed.`,
    ]);
  }

  const missedSets = workSets.filter((set) => set.reps < settings.repRange.min);
  if (missedSets.length !== workSets.length) {
    return hold("Hold load. Some work still reached the prescribed range.", [
      `${workSets.length - missedSets.length} work set(s) reached at least ${settings.repRange.min}${settings.measurementType === "duration" ? " sec" : " reps"}.`,
    ]);
  }

  const reduced = resolveReducedLoad({ currentLoad, increment: loadIncrement, severity: "mild" });
  if (reduced >= currentLoad || reduced <= 0) {
    return hold("Hold load. The next available jump down would overcorrect.", [
      `All ${workSets.length} work set(s) were below ${settings.repRange.min}${settings.measurementType === "duration" ? " sec" : " reps"}.`,
      `${currentLoad}${settings.unit} with ${loadIncrement}${settings.unit} jumps would overcorrect.`,
    ]);
  }

  const message = `All work sets missed the prescribed range. Use ${reduced}${settings.unit} next time.`;
  const reasons = [
    `All ${workSets.length} work set(s) were below ${settings.repRange.min}${settings.measurementType === "duration" ? " sec" : " reps"}.`,
    "Hold today’s exact prescription while calibration evidence is rebuilt.",
  ];
  return {
    action: "reduce",
    load: reduced,
    severity: "mild",
    message,
    reasons,
    evidence: evidence({
      type: "reduced_load",
      confidence: "medium",
      source: "history",
      summary: "Clear current-session miss below the prescribed rep range.",
      dataPoints: reasons,
      reason: message,
      actionAllowed: true,
    }),
  };
}

export function recommendLoadRegression(
  entries: ExerciseHistorySummary[],
  loadIncrement: number,
): LoadRegressionRecommendation {
  const recent = [...entries]
    .filter((entry) => entry.setsCompleted > 0)
    .sort((a, b) => new Date(a.completedAt ?? "").getTime() - new Date(b.completedAt ?? "").getTime())
    .slice(-3);
  const latest = recent.at(-1);
  if (!latest) {
    return {
      action: "hold",
      message: "No completed work yet. Choose load from warm-ups.",
      reasons: [],
      evidence: evidence({
        type: "reduced_load",
        confidence: "insufficient_data",
        source: "limited_data",
        summary: "No completed exercise history.",
        dataPoints: ["No completed work sets for this exercise."],
        reason: "Choose load from warm-ups.",
        actionAllowed: false,
      }),
    };
  }
  if (recent.length < 3) {
    return {
      action: "hold",
      load: latest.load,
      message: "Hold load. One poor session is not enough evidence to reduce.",
      reasons: ["Needs repeated objective evidence."],
      evidence: evidence({
        type: "reduced_load",
        confidence: "insufficient_data",
        source: "limited_data",
        summary: "Fewer than 3 recent exposures.",
        dataPoints: [`${recent.length} recent exposure(s) found.`, "Reduction requires repeated objective decline."],
        reason: "Hold load until repeated evidence appears.",
        actionAllowed: false,
      }),
    };
  }

  const earlyShutdowns = recent.filter((entry) => entry.stoppedByDropOff && entry.qualitySets < 2).length;
  const bestSetDecline = strictlyDeclining(recent.map((entry) => entry.bestSetReps));
  const qualitySetCollapse = recent.at(-1)!.qualitySets <= Math.max(1, average(recent.slice(0, -1).map((entry) => entry.qualitySets)) * 0.7);
  const repeatedMissRange = recent.filter((entry) => entry.bestSetReps < 1 || entry.qualitySets === 0).length >= 2;
  const signals = [
    earlyShutdowns >= 2 ? "repeated early shutdowns" : null,
    bestSetDecline ? "best set regression" : null,
    qualitySetCollapse ? "quality-set collapse" : null,
    repeatedMissRange ? "repeated failure to reach target range" : null,
  ].filter((reason): reason is string => Boolean(reason));

  if (signals.length < 2) {
    return {
      action: "caution",
      load: latest.load,
      message: "Hold load and watch the next session. One weak signal is not enough to reduce.",
      reasons: signals,
      evidence: evidence({
        type: "reduced_load",
        confidence: "low",
        source: "history",
        summary: "Some decline signal, but not enough to lower the load.",
        dataPoints: signals.length > 0 ? signals : ["No repeated objective decline."],
        reason: "Hold load and watch the next session.",
        actionAllowed: false,
      }),
    };
  }

  const severity = regressionSeverity(signals);
  const reduced = resolveReducedLoad({
    currentLoad: latest.load,
    increment: loadIncrement,
    severity,
  });
  if (reduced >= latest.load || reduced <= 0) {
    return {
      action: "caution",
      load: latest.load,
      message: "Hold load. The next available jump down is too large for this evidence.",
      severity,
      reasons: [...signals, "available load jump would overcorrect"].slice(0, 5),
      evidence: evidence({
        type: "reduced_load",
        confidence: "low",
        source: "history",
        summary: "Repeated decline exists, but the practical load jump is too large.",
        dataPoints: [...signals, `${latest.load}${latest.unit} with ${loadIncrement}${latest.unit} jumps would overcorrect.`],
        reason: "Hold load unless the next exposure confirms the decline.",
        actionAllowed: false,
      }),
    };
  }
  return {
    action: "reduce",
    load: reduced,
    severity,
    message: `Recent performance suggests the current load is too demanding. Use ${reduced}${latest.unit} next time.`,
    reasons: signals,
    evidence: evidence({
      type: "reduced_load",
      confidence: "high",
      source: "history",
      summary: "Repeated objective decline across recent exposures.",
      dataPoints: signals,
      reason: `Recent performance suggests the current load is too demanding. Use ${reduced}${latest.unit} next time.`,
      actionAllowed: true,
    }),
  };
}

export function resolveReducedLoad({
  currentLoad,
  increment,
  severity,
}: {
  currentLoad: number;
  increment: number;
  severity: "mild" | "moderate" | "severe";
}): number {
  if (!Number.isFinite(currentLoad) || currentLoad <= 0) return 0;
  if (!Number.isFinite(increment) || increment <= 0) {
    const multiplier = severity === "severe" ? 0.9 : severity === "moderate" ? 0.925 : 0.95;
    return Number((currentLoad * multiplier).toFixed(2));
  }

  const reductionPercent = severity === "severe" ? 0.1 : severity === "moderate" ? 0.075 : 0.05;
  const rawTarget = currentLoad * (1 - reductionPercent);
  let reduced = roundDownToIncrement(rawTarget, increment);
  if (reduced >= currentLoad) reduced = roundDownToIncrement(currentLoad - increment, increment);

  const oneJumpDown = roundDownToIncrement(currentLoad - increment, increment);
  const dropPercent = (currentLoad - reduced) / currentLoad;
  if (dropPercent > 0.12 && severity !== "severe") {
    return oneJumpDown > 0 && (currentLoad - oneJumpDown) / currentLoad <= 0.12 ? oneJumpDown : currentLoad;
  }

  return Math.max(0, reduced);
}

function regressionSeverity(signals: string[]): "mild" | "moderate" | "severe" {
  const severeSignals = signals.filter((signal) => signal === "repeated early shutdowns" || signal === "repeated failure to reach target range").length;
  if (signals.length >= 4 || (signals.length >= 3 && severeSignals >= 1)) return "severe";
  if (signals.length >= 3 || severeSignals >= 2) return "moderate";
  return "mild";
}

function insufficientStartingLoadEvidence(reason: string): RecommendationEvidence {
  return evidence({
    type: "starting_load",
    confidence: "insufficient_data",
    source: "limited_data",
    summary: "No reliable load estimate.",
    dataPoints: [reason],
    reason: "Choose a starting load. Use warm-ups to find a weight for today’s exact targets.",
    actionAllowed: false,
  });
}

function isUsefulSimilarEntry(
  entry: ExerciseHistorySummary,
  targetExercise: Exercise,
  exerciseById: Map<string, Exercise>,
  cutoff: Date,
): boolean {
  if (entry.exerciseId === targetExercise.id || entry.setsCompleted <= 0 || entry.bestSetReps <= 0 || entry.load <= 0) return false;
  if (!entry.completedAt || new Date(entry.completedAt) < cutoff) return false;
  const source = exerciseById.get(entry.exerciseId);
  if (!source) return false;
  if (source.family !== targetExercise.family) return false;
  const samePrimary = source.primaryMuscles.some((muscle) => targetExercise.primaryMuscles.includes(muscle));
  return samePrimary || source.movementPattern === targetExercise.movementPattern;
}

function similarityMultiplier(source: Exercise, target: Exercise): number {
  const equipment = equipmentSimilarity(source.equipment, target.equipment);
  if (equipment === "similar") return 0.93;
  if (source.kind === "machine" && isFreeWeight(target.kind)) return 0.8;
  if (isFreeWeight(source.kind) && target.kind === "machine") return 0.88;
  if ((source.kind === "dumbbell" && target.kind === "barbell") || (source.kind === "barbell" && target.kind === "dumbbell")) return 0.78;
  return equipment === "related" ? 0.85 : 0.72;
}

function equipmentSimilarity(source: Equipment[], target: Equipment[]): "similar" | "related" | "different" {
  if (source.some((equipment) => target.includes(equipment))) return "similar";
  const sourceFree = source.some((equipment) => equipment === "barbell" || equipment === "dumbbell");
  const targetFree = target.some((equipment) => equipment === "barbell" || equipment === "dumbbell");
  if (sourceFree && targetFree) return "related";
  const sourceMachine = source.some((equipment) => equipment === "machine" || equipment === "smith" || equipment === "cable");
  const targetMachine = target.some((equipment) => equipment === "machine" || equipment === "smith" || equipment === "cable");
  if (sourceMachine && targetMachine) return "related";
  return "different";
}

function isFreeWeight(kind: Exercise["kind"]): boolean {
  return kind === "barbell" || kind === "dumbbell" || kind === "weighted";
}

function midpoint(range: ProgressionSettings["repRange"]): number {
  return Math.round((range.min + range.max) / 2);
}

function noInSessionSuggestion(currentLoad: number): InSessionLoadIncreaseSuggestion {
  return {
    shouldSuggest: false,
    currentLoad,
    suggestedLoad: currentLoad,
    message: "",
  };
}

function strictlyDeclining(values: number[]): boolean {
  return values.length >= 3 && values.every((value, index) => index === 0 || value < values[index - 1]);
}

function average(values: number[]): number {
  const clean = values.filter(Number.isFinite);
  return clean.length === 0 ? 0 : clean.reduce((sum, value) => sum + value, 0) / clean.length;
}
