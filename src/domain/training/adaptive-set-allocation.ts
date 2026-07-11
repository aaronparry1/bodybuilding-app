import type { BlockType } from "@/domain/training/annual-models";
import type { AdaptiveRepPrescription } from "@/domain/training/adaptive-rep-prescription";
import type { Exercise, ExerciseFatigueCost, ExerciseRole, ProgressionSettings, SetLog } from "@/domain/training/models";
import { evaluateExerciseProgression } from "@/domain/training/progression-engine";
import { resolveSetPrescription } from "@/domain/training/set-prescription";
import { getWorkSets } from "@/domain/training/workout-sets";

export type AdaptiveSetAction = "continue" | "stop" | "max_reached";
export type AdaptiveSetRecommendation = "continue" | "move_on" | "max_reached";
export type AdaptiveSetRecommendedNext = "move_on" | "one_more_set" | "complete_prescribed_max";
export type AdaptiveSetStimulusStatus = "insufficient" | "sufficient" | "high";

export interface AdaptiveSetDecision {
  recommendation: AdaptiveSetRecommendation;
  action: AdaptiveSetAction;
  recommended_next: AdaptiveSetRecommendedNext;
  confidence: number;
  stimulus_status: AdaptiveSetStimulusStatus;
  fatigue_cost: ExerciseFatigueCost;
  short_reason: string;
  debug_reasons: string[];
}

export interface AdaptiveSetAllocationInput {
  exerciseName: string;
  settings: ProgressionSettings;
  sets: SetLog[];
  currentLoad: number;
  metadata?: Pick<Exercise, "role" | "family" | "primaryMuscles" | "fatigueCost" | "movementPattern"> | null;
  blockType?: BlockType | null;
  remainingExercises?: number;
  currentSessionWorkingSetCount?: number;
  shutdown?: boolean;
  painOrSafetyFlag?: boolean;
  repPrescription?: Pick<AdaptiveRepPrescription, "prescription_type" | "set_objective" | "coaching_bias"> | null;
}

const SHORT_REASON_LIMIT = 80;

export function decideAdaptiveSetAllocation(input: AdaptiveSetAllocationInput): AdaptiveSetDecision {
  const workSets = getWorkSets(input.sets);
  const prescription = resolveSetPrescription(input.settings, {
    blockType: input.blockType,
    exerciseRole: input.metadata?.role,
    exerciseFamily: input.metadata?.family,
    primaryMuscles: input.metadata?.primaryMuscles,
  });
  const minSets = prescription.recommendedMinSets;
  const maxSets = prescription.recommendedMaxSets;
  const completedSets = workSets.length;
  const fatigueCost = resolveFatigueCost(input.metadata);
  const progression = evaluateExerciseProgression({
    exerciseName: input.exerciseName,
    currentLoad: input.currentLoad,
    settings: input.settings,
    sets: workSets,
  });
  const analysis = analyseCompletedSets(workSets, input.settings);
  const debug: string[] = [
    `completed ${completedSets}/${minSets}-${maxSets} working sets`,
    `quality rate ${Math.round(analysis.qualityRate * 100)}%`,
    `fatigue cost ${fatigueCost}`,
  ];

  if (input.painOrSafetyFlag) {
    return decision("stop", "move_on", 95, completedSets >= minSets ? "sufficient" : "insufficient", fatigueCost, "Safety first. Move on.", [
      ...debug,
      "pain or safety flag present",
    ]);
  }

  if (completedSets <= 0) {
    return decision("continue", "one_more_set", 74, "insufficient", fatigueCost, "Start with the first work set.", [
      ...debug,
      "no working sets completed",
    ]);
  }

  if (completedSets < minSets) {
    const reason = analysis.anyBelowMinimum ? "Correct the load, then complete the minimum." : "Minimum not reached yet.";
    return decision("continue", "one_more_set", 86, "insufficient", fatigueCost, reason, [
      ...debug,
      "minimum prescribed sets not reached",
      ...(analysis.anyBelowMinimum ? ["below-minimum evidence before minimum"] : []),
    ]);
  }

  if (completedSets >= maxSets) {
    return decision("max_reached", "move_on", 96, "high", fatigueCost, "Max sets reached.", [
      ...debug,
      "prescribed maximum reached",
    ]);
  }

  if (input.shutdown || progression.shouldShutdown) {
    return decision("stop", "move_on", 92, completedSets >= minSets ? "sufficient" : "insufficient", fatigueCost, "Fatigue is rising. Move on.", [
      ...debug,
      "drop-off shutdown fired",
    ]);
  }

  if (analysis.anyBelowMinimum) {
    return decision("stop", "move_on", 90, "sufficient", fatigueCost, "Below target. Move on.", [
      ...debug,
      "completed working set below target minimum",
    ]);
  }

  if (input.blockType === "deload") {
    return decision("stop", "move_on", 88, "sufficient", fatigueCost, "Recovery week dose complete.", [
      ...debug,
      "deload context favours lower stress",
    ]);
  }

  if (shouldContinueForPrescriptionIntent({ analysis, input, completedSets, minSets, maxSets })) {
    return decision("continue", "one_more_set", 78, "insufficient", fatigueCost, "Possible underload. Verify with one more.", [
      ...debug,
      "rep prescription intent prevents early move-on after easy top-range work",
    ]);
  }

  if (shouldStopForMarginalFatigue({ fatigueCost, analysis, input, completedSets, minSets })) {
    return decision("stop", "move_on", confidenceForStop(fatigueCost, analysis), "sufficient", fatigueCost, stopReasonFor(fatigueCost, input.remainingExercises ?? 0), [
      ...debug,
      "marginal set value lower than fatigue cost",
    ]);
  }

  if (shouldCompleteMax({ fatigueCost, analysis, input, completedSets, maxSets })) {
    return decision("continue", "complete_prescribed_max", 78, "sufficient", fatigueCost, "Quality is high. Finish the range.", [
      ...debug,
      "high quality and max is within one set",
    ]);
  }

  return decision("continue", "one_more_set", 76, analysis.qualityRate >= 0.75 ? "sufficient" : "insufficient", fatigueCost, "One more productive set.", [
    ...debug,
    "additional set likely useful",
  ]);
}

function analyseCompletedSets(sets: SetLog[], settings: ProgressionSettings) {
  const withinRange = sets.filter((set) => set.reps >= settings.repRange.min && set.reps <= settings.repRange.max);
  const belowMinimum = sets.filter((set) => set.reps < settings.repRange.min);
  const loadIncreased = hasLoadIncrease(sets);
  const latest = sets.at(-1);
  const previousComparable = latest ? sets.slice(0, -1).filter((set) => set.load === latest.load) : [];
  const comparableDrop =
    latest && previousComparable.length
      ? Math.max(...previousComparable.map((set) => set.reps)) - latest.reps
      : 0;
  const productiveHeavierLoadFatigue =
    loadIncreased &&
    Boolean(latest) &&
    latest!.reps >= settings.repRange.min &&
    latest!.reps <= settings.repRange.max;

  return {
    qualityRate: sets.length ? withinRange.length / sets.length : 0,
    anyBelowMinimum: belowMinimum.length > 0,
    allInsideRange: sets.length > 0 && withinRange.length === sets.length,
    loadIncreased,
    productiveHeavierLoadFatigue,
    comparableDrop,
    topRangeRate: sets.length ? sets.filter((set) => set.reps >= settings.repRange.max).length / sets.length : 0,
  };
}

function shouldContinueForPrescriptionIntent({
  analysis,
  input,
  completedSets,
  minSets,
  maxSets,
}: {
  analysis: ReturnType<typeof analyseCompletedSets>;
  input: AdaptiveSetAllocationInput;
  completedSets: number;
  minSets: number;
  maxSets: number;
}) {
  if (!input.repPrescription) return false;
  if (completedSets < minSets || completedSets >= maxSets) return false;
  if (analysis.anyBelowMinimum) return false;
  if (input.shutdown || input.painOrSafetyFlag) return false;
  const verificationIntent =
    input.repPrescription.set_objective === "verification" ||
    input.repPrescription.prescription_type === "top_range_check" ||
    input.repPrescription.prescription_type === "capped_amrap" ||
    input.repPrescription.prescription_type === "amrap";
  return verificationIntent && analysis.topRangeRate >= 1;
}

function shouldStopForMarginalFatigue({
  fatigueCost,
  analysis,
  input,
  completedSets,
  minSets,
}: {
  fatigueCost: ExerciseFatigueCost;
  analysis: ReturnType<typeof analyseCompletedSets>;
  input: AdaptiveSetAllocationInput;
  completedSets: number;
  minSets: number;
}) {
  const remainingExercises = input.remainingExercises ?? 0;
  const currentSessionWorkingSetCount = input.currentSessionWorkingSetCount ?? completedSets;

  if (fatigueCost === "high" && completedSets >= minSets && analysis.qualityRate >= 0.75 && remainingExercises > 0) return true;
  if (fatigueCost === "high" && analysis.comparableDrop >= Math.max(2, Math.floor(input.settings.repRange.min * 0.25))) return true;
  if (fatigueCost === "moderate" && remainingExercises >= 3 && analysis.allInsideRange && completedSets >= minSets) return true;
  if (currentSessionWorkingSetCount >= 18 && analysis.qualityRate >= 0.75) return true;
  return false;
}

function shouldCompleteMax({
  fatigueCost,
  analysis,
  input,
  completedSets,
  maxSets,
}: {
  fatigueCost: ExerciseFatigueCost;
  analysis: ReturnType<typeof analyseCompletedSets>;
  input: AdaptiveSetAllocationInput;
  completedSets: number;
  maxSets: number;
}) {
  if (completedSets !== maxSets - 1) return false;
  if (!analysis.allInsideRange) return false;
  if (input.settings.volumeCoachingIntent === "bias_high") return true;
  if (fatigueCost === "low") return true;
  return analysis.productiveHeavierLoadFatigue && fatigueCost !== "high";
}

function resolveFatigueCost(metadata?: Pick<Exercise, "role" | "fatigueCost" | "movementPattern"> | null): ExerciseFatigueCost {
  if (metadata?.fatigueCost) return metadata.fatigueCost;
  if (metadata?.role === "primary_compound" || metadata?.movementPattern === "squat" || metadata?.movementPattern === "hinge") return "high";
  if (metadata?.role === "secondary_compound" || metadata?.role === "power") return "moderate";
  return "low";
}

function confidenceForStop(fatigueCost: ExerciseFatigueCost, analysis: ReturnType<typeof analyseCompletedSets>) {
  let confidence = fatigueCost === "high" ? 84 : fatigueCost === "moderate" ? 78 : 72;
  if (analysis.allInsideRange) confidence += 4;
  if (analysis.productiveHeavierLoadFatigue) confidence -= 3;
  return Math.max(0, Math.min(100, confidence));
}

function stopReasonFor(fatigueCost: ExerciseFatigueCost, remainingExercises: number) {
  if (fatigueCost === "high" && remainingExercises > 0) return "Stimulus achieved. Save energy for the next lift.";
  if (fatigueCost === "high") return "Enough quality work. Move on.";
  return "Stimulus achieved. Move on.";
}

function hasLoadIncrease(sets: SetLog[]) {
  let maxSeen = sets[0]?.load ?? 0;
  for (const set of sets.slice(1)) {
    if (set.load > maxSeen) return true;
    maxSeen = Math.max(maxSeen, set.load);
  }
  return false;
}

function decision(
  action: AdaptiveSetAction,
  recommended_next: AdaptiveSetRecommendedNext,
  confidence: number,
  stimulus_status: AdaptiveSetStimulusStatus,
  fatigue_cost: ExerciseFatigueCost,
  short_reason: string,
  debug_reasons: string[],
): AdaptiveSetDecision {
  const clippedReason = short_reason.length > SHORT_REASON_LIMIT ? short_reason.slice(0, SHORT_REASON_LIMIT).trimEnd() : short_reason;
  return {
    recommendation: action === "stop" ? "move_on" : action,
    action,
    recommended_next,
    confidence,
    stimulus_status,
    fatigue_cost,
    short_reason: clippedReason,
    debug_reasons,
  };
}
