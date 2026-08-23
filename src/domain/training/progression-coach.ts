import type { Exercise, ExerciseHistorySummary, MuscleGroup, WorkoutHistorySummary } from "@/domain/training/models";

export type CoachAction =
  | "increase_load"
  | "maintain_load"
  | "add_volume"
  | "reduce_volume"
  | "reduce_load"
  | "deload"
  | "swap_exercise";

export type PlateauAction = "hold_load" | "reduce_load" | "reduce_volume" | "suggest_exercise_swap";
export type VolumeRecommendation = "add_set" | "remove_set" | "maintain_volume";
export type VolumeEvidenceConfidence = "insufficient" | "emerging" | "established";

export interface VolumeEvidenceAssessment {
  confidence: VolumeEvidenceConfidence;
  comparableExposures: number;
  requiredExposures: number;
  comparisonKey: string | null;
}

export interface ProgressionCoachConfig {
  stallWarningSessions: number;
  stallCriticalSessions: number;
  regressionWindow: number;
  fatigueWindow: number;
  earlyDropOffThreshold: number;
  volumeAddProgressionRate: number;
  /** Minimum comparable exposures required before increasing exercise volume. */
  volumeAddMinimumSessions?: number;
  volumeReduceDropOffRate: number;
  maxRecentSetsPerExercise: number;
}

export interface StallDetection {
  noProgressionForSessions: number;
  stalledForThree: boolean;
  stalledForFive: boolean;
  regressionTrend: boolean;
}

export interface FatigueDetection {
  repeatedEarlyDropOffs: boolean;
  worseningPerformanceTrend: boolean;
  decliningVolumeTolerance: boolean;
  dropOffRate: number;
}

export interface ExerciseCoachAssessment {
  exerciseId: string;
  exerciseName: string;
  sessionsAnalyzed: number;
  stall: StallDetection;
  fatigue: FatigueDetection;
  plateauActions: PlateauAction[];
  volumeRecommendation: VolumeRecommendation;
  volumeEvidence: VolumeEvidenceAssessment;
  coachActions: CoachAction[];
  recommendedLoad: number | null;
  rationale: string[];
}

export type MuscleProgressionGroup = "chest" | "back" | "shoulders" | "arms" | "legs";

export interface MuscleProgressionAssessment {
  muscleGroup: MuscleProgressionGroup;
  exercisesAnalyzed: number;
  progressionRate: number;
  stalledExercises: string[];
  fatigueFlags: number;
  recommendation: "progressing" | "maintain" | "add_volume" | "reduce_volume" | "deload";
  rationale: string[];
}

export interface HypertrophyCoachReport {
  exerciseAssessments: ExerciseCoachAssessment[];
  muscleAssessments: MuscleProgressionAssessment[];
  priorityActions: CoachAction[];
  coachingSummary: string[];
}

export const defaultProgressionCoachConfig: ProgressionCoachConfig = {
  stallWarningSessions: 3,
  stallCriticalSessions: 5,
  regressionWindow: 3,
  fatigueWindow: 3,
  earlyDropOffThreshold: 2,
  volumeAddProgressionRate: 0.6,
  volumeAddMinimumSessions: 3,
  volumeReduceDropOffRate: 0.5,
  maxRecentSetsPerExercise: 5,
};

export function getExerciseHistoryEntries(
  history: WorkoutHistorySummary[],
  exerciseId: string,
): ExerciseHistorySummary[] {
  return history
    .flatMap((session) => session.exerciseSummaries.filter((exercise) => exercise.exerciseId === exerciseId))
    .sort((a, b) => new Date(a.completedAt ?? "").getTime() - new Date(b.completedAt ?? "").getTime());
}

export function detectStalledLift(
  entries: ExerciseHistorySummary[],
  config = defaultProgressionCoachConfig,
): StallDetection {
  const reversed = [...entries].reverse();
  const noProgressionForSessions = reversed.findIndex((entry) => entry.progressionEarned);
  const stallCount = noProgressionForSessions === -1 ? reversed.length : noProgressionForSessions;

  return {
    noProgressionForSessions: stallCount,
    stalledForThree: stallCount >= config.stallWarningSessions,
    stalledForFive: stallCount >= config.stallCriticalSessions,
    regressionTrend: hasRegressionTrend(entries, config.regressionWindow),
  };
}

export function detectFatigue(
  entries: ExerciseHistorySummary[],
  config = defaultProgressionCoachConfig,
): FatigueDetection {
  const recent = entries.slice(-config.fatigueWindow);
  const dropOffs = recent.filter((entry) => entry.stoppedByDropOff).length;
  const dropOffRate = recent.length === 0 ? 0 : dropOffs / recent.length;

  return {
    repeatedEarlyDropOffs: dropOffs >= config.earlyDropOffThreshold,
    worseningPerformanceTrend: isStrictlyDeclining(recent.map((entry) => entry.bestSetReps)),
    decliningVolumeTolerance: isStrictlyDeclining(recent.map((entry) => entry.setsCompleted)),
    dropOffRate,
  };
}

export function recommendPlateauActions(stall: StallDetection, fatigue: FatigueDetection): PlateauAction[] {
  const actions = new Set<PlateauAction>();

  if (stall.stalledForThree) actions.add("hold_load");
  if (stall.regressionTrend || fatigue.worseningPerformanceTrend) actions.add("reduce_load");
  if (fatigue.repeatedEarlyDropOffs || fatigue.decliningVolumeTolerance) actions.add("reduce_volume");
  if (stall.stalledForFive && !fatigue.repeatedEarlyDropOffs) actions.add("suggest_exercise_swap");

  return [...actions];
}

export function recommendVolume(
  entries: ExerciseHistorySummary[],
  fatigue: FatigueDetection,
  config = defaultProgressionCoachConfig,
): VolumeRecommendation {
  const comparableEntries = getComparableVolumeEntries(entries);
  const recent = comparableEntries.slice(-config.fatigueWindow);
  if (recent.length === 0) return "maintain_volume";

  const progressionRate = recent.filter((entry) => entry.progressionEarned).length / recent.length;
  const averageSets = recent.reduce((sum, entry) => sum + entry.setsCompleted, 0) / recent.length;

  if (fatigue.dropOffRate >= config.volumeReduceDropOffRate || fatigue.decliningVolumeTolerance) {
    return "remove_set";
  }

  const evidence = assessVolumeEvidence(entries, config);
  if (
    evidence.confidence === "established" &&
    progressionRate >= config.volumeAddProgressionRate &&
    averageSets < config.maxRecentSetsPerExercise
  ) {
    return "add_set";
  }

  return "maintain_volume";
}

export function assessVolumeEvidence(
  entries: ExerciseHistorySummary[],
  config = defaultProgressionCoachConfig,
): VolumeEvidenceAssessment {
  const comparableEntries = getComparableVolumeEntries(entries);
  const requiredExposures = config.volumeAddMinimumSessions ?? defaultProgressionCoachConfig.volumeAddMinimumSessions!;
  const comparableExposures = Math.min(comparableEntries.length, config.fatigueWindow);
  const comparisonKey = comparableEntries.at(-1) ? volumeComparisonKey(comparableEntries.at(-1)!) : null;

  return {
    confidence: comparableExposures >= requiredExposures
      ? "established"
      : comparableExposures >= Math.max(2, requiredExposures - 1)
        ? "emerging"
        : "insufficient",
    comparableExposures,
    requiredExposures,
    comparisonKey,
  };
}

export function assessExerciseProgression(
  history: WorkoutHistorySummary[],
  exerciseId: string,
  config = defaultProgressionCoachConfig,
): ExerciseCoachAssessment | null {
  const entries = getExerciseHistoryEntries(history, exerciseId);
  if (entries.length === 0) return null;

  const last = entries.at(-1)!;
  const stall = detectStalledLift(entries, config);
  const fatigue = detectFatigue(entries, config);
  const plateauActions = recommendPlateauActions(stall, fatigue);
  const volumeRecommendation = recommendVolume(entries, fatigue, config);
  const volumeEvidence = assessVolumeEvidence(entries, config);
  const coachActions = buildCoachActions(last, stall, fatigue, volumeRecommendation, plateauActions);
  const rationale = buildExerciseRationale(last, stall, fatigue, volumeRecommendation, plateauActions);

  return {
    exerciseId,
    exerciseName: last.exerciseName,
    sessionsAnalyzed: entries.length,
    stall,
    fatigue,
    plateauActions,
    volumeRecommendation,
    volumeEvidence,
    coachActions,
    recommendedLoad: recommendedLoadForActions(last, coachActions),
    rationale,
  };
}

export function buildHypertrophyCoachReport(
  history: WorkoutHistorySummary[],
  exercises: Exercise[],
  config = defaultProgressionCoachConfig,
): HypertrophyCoachReport {
  const exerciseIds = unique(history.flatMap((summary) => summary.exerciseSummaries.map((exercise) => exercise.exerciseId)));
  const exerciseAssessments = exerciseIds
    .map((exerciseId) => assessExerciseProgression(history, exerciseId, config))
    .filter((assessment): assessment is ExerciseCoachAssessment => Boolean(assessment));
  const muscleAssessments = assessMuscleProgression(exerciseAssessments, exercises);
  const priorityActions = unique(
    exerciseAssessments.flatMap((assessment) => assessment.coachActions).filter((action) => action !== "maintain_load"),
  );

  return {
    exerciseAssessments,
    muscleAssessments,
    priorityActions,
    coachingSummary: buildReportSummary(exerciseAssessments, muscleAssessments),
  };
}

export function assessMuscleProgression(
  exerciseAssessments: ExerciseCoachAssessment[],
  exercises: Exercise[],
): MuscleProgressionAssessment[] {
  const assessmentsByExercise = new Map(exerciseAssessments.map((assessment) => [assessment.exerciseId, assessment]));

  return (["chest", "back", "shoulders", "arms", "legs"] as MuscleProgressionGroup[]).map((muscleGroup) => {
    const matchingExercises = exercises.filter((exercise) =>
      exercise.primaryMuscles.some((muscle) => toMuscleProgressionGroup(muscle) === muscleGroup),
    );
    const matchingAssessments = matchingExercises
      .map((exercise) => assessmentsByExercise.get(exercise.id))
      .filter((assessment): assessment is ExerciseCoachAssessment => Boolean(assessment));
    const progressionWins = matchingAssessments.filter((assessment) => assessment.coachActions.includes("increase_load")).length;
    const fatigueFlags = matchingAssessments.filter(
      (assessment) =>
        assessment.fatigue.repeatedEarlyDropOffs ||
        assessment.fatigue.worseningPerformanceTrend ||
        assessment.fatigue.decliningVolumeTolerance,
    ).length;
    const stalledExercises = matchingAssessments
      .filter((assessment) => assessment.stall.stalledForThree)
      .map((assessment) => assessment.exerciseName);
    const progressionRate = matchingAssessments.length === 0 ? 0 : progressionWins / matchingAssessments.length;
    const recommendation = recommendMuscleAction(progressionRate, stalledExercises.length, fatigueFlags);

    return {
      muscleGroup,
      exercisesAnalyzed: matchingAssessments.length,
      progressionRate,
      stalledExercises,
      fatigueFlags,
      recommendation,
      rationale: buildMuscleRationale(muscleGroup, progressionRate, stalledExercises, fatigueFlags),
    };
  });
}

function buildCoachActions(
  last: ExerciseHistorySummary,
  stall: StallDetection,
  fatigue: FatigueDetection,
  volumeRecommendation: VolumeRecommendation,
  plateauActions: PlateauAction[],
): CoachAction[] {
  const actions = new Set<CoachAction>();

  if (fatigue.repeatedEarlyDropOffs && fatigue.worseningPerformanceTrend) actions.add("deload");
  if (plateauActions.includes("reduce_load")) actions.add("reduce_load");
  if (plateauActions.includes("reduce_volume") || volumeRecommendation === "remove_set") actions.add("reduce_volume");
  if (plateauActions.includes("suggest_exercise_swap")) actions.add("swap_exercise");
  if (last.progressionEarned && !fatigue.repeatedEarlyDropOffs) actions.add("increase_load");
  // Change the smallest useful variable first. A newly earned load increase takes
  // precedence over adding work, and stalled exercises need diagnosis rather than
  // an automatic workload increase.
  if (volumeRecommendation === "add_set" && !last.progressionEarned && !stall.stalledForThree && !fatigue.repeatedEarlyDropOffs) {
    actions.add("add_volume");
  }
  if (actions.size === 0 || stall.stalledForThree) actions.add("maintain_load");

  return [...actions];
}

function recommendedLoadForActions(entry: ExerciseHistorySummary, actions: CoachAction[]): number {
  if (actions.includes("reduce_load")) return roundLoad(entry.load * 0.95);
  if (actions.includes("increase_load")) return entry.nextRecommendedLoad;
  return entry.load;
}

function buildExerciseRationale(
  last: ExerciseHistorySummary,
  stall: StallDetection,
  fatigue: FatigueDetection,
  volumeRecommendation: VolumeRecommendation,
  plateauActions: PlateauAction[],
): string[] {
  const rationale: string[] = [];

  if (last.progressionEarned) rationale.push("Last session reached the progression rule from logged reps.");
  if (stall.stalledForThree) rationale.push(`No progression has been earned for ${stall.noProgressionForSessions} sessions.`);
  if (stall.stalledForFive) rationale.push("Five-session stall detected. Exercise variation may be worth considering.");
  if (stall.regressionTrend) rationale.push("Recent best-set or load trend is moving down.");
  if (fatigue.repeatedEarlyDropOffs) rationale.push("Repeated drop-off shutdowns suggest fatigue is limiting output.");
  if (fatigue.decliningVolumeTolerance) rationale.push("Recent completed set count is declining.");
  if (volumeRecommendation === "add_set") rationale.push("Recent progression rate supports adding one set.");
  if (volumeRecommendation === "remove_set") rationale.push("Recent fatigue markers support removing one set.");
  if (plateauActions.length === 0 && rationale.length === 0) rationale.push("Performance is stable. Keep the plan boring and productive.");

  return rationale;
}

function buildReportSummary(
  exerciseAssessments: ExerciseCoachAssessment[],
  muscleAssessments: MuscleProgressionAssessment[],
): string[] {
  const summary: string[] = [];
  const stalled = exerciseAssessments.find((assessment) => assessment.stall.stalledForThree);
  const fatigued = exerciseAssessments.find((assessment) => assessment.fatigue.repeatedEarlyDropOffs);
  const progressing = exerciseAssessments.find((assessment) => assessment.coachActions.includes("increase_load"));
  const muscleNeedsVolume = muscleAssessments.find((assessment) => assessment.recommendation === "add_volume");

  if (progressing) summary.push(`${progressing.exerciseName}: increase load next time based on completed reps.`);
  if (stalled) summary.push(`${stalled.exerciseName}: hold load. ${stalled.stall.noProgressionForSessions} sessions without progression.`);
  if (fatigued) summary.push(`${fatigued.exerciseName}: reduce volume or deload. Drop-offs are showing up repeatedly.`);
  if (muscleNeedsVolume) summary.push(`${titleGroup(muscleNeedsVolume.muscleGroup)} may need more productive work.`);
  if (summary.length === 0) summary.push("Training is stable. Maintain loads and volume until the logbook says otherwise.");

  return summary.slice(0, 5);
}

function recommendMuscleAction(
  progressionRate: number,
  stalledCount: number,
  fatigueFlags: number,
): MuscleProgressionAssessment["recommendation"] {
  if (fatigueFlags >= 2) return "deload";
  if (fatigueFlags === 1) return "reduce_volume";
  // Multiple simultaneous stalls are not evidence that the muscle needs more
  // work. Preserve volume until fatigue, execution, load and exercise fit can be
  // distinguished with better evidence.
  if (stalledCount >= 2) return "maintain";
  if (progressionRate > 0.5) return "progressing";
  return "maintain";
}

function buildMuscleRationale(
  muscleGroup: MuscleProgressionGroup,
  progressionRate: number,
  stalledExercises: string[],
  fatigueFlags: number,
): string[] {
  const rationale = [`${titleGroup(muscleGroup)} progression rate is ${Math.round(progressionRate * 100)}%.`];
  if (stalledExercises.length > 0) rationale.push(`Stalled exercises: ${stalledExercises.join(", ")}.`);
  if (fatigueFlags > 0) rationale.push(`${fatigueFlags} exercise(s) show objective fatigue markers.`);
  return rationale;
}

function hasRegressionTrend(entries: ExerciseHistorySummary[], window: number): boolean {
  const recent = entries.slice(-window);
  if (recent.length < window) return false;
  const bestSetDeclining = isStrictlyDeclining(recent.map((entry) => entry.bestSetReps));
  const loadDeclining = isStrictlyDeclining(recent.map((entry) => entry.load));
  const volumeLoadDeclining = isStrictlyDeclining(recent.map((entry) => entry.load * entry.repsCompleted));
  return bestSetDeclining || loadDeclining || volumeLoadDeclining;
}

function isStrictlyDeclining(values: number[]): boolean {
  return values.length >= 2 && values.every((value, index) => index === 0 || value < values[index - 1]);
}

function getComparableVolumeEntries(entries: ExerciseHistorySummary[]): ExerciseHistorySummary[] {
  const latest = entries.at(-1);
  if (!latest) return [];
  const latestKey = volumeComparisonKey(latest);
  if (latestKey === null) return entries;
  return entries.filter((entry) => volumeComparisonKey(entry) === latestKey);
}

function volumeComparisonKey(entry: ExerciseHistorySummary): string | null {
  return entry.calibrationSetupKey ?? entry.equipmentSignature ?? null;
}

function toMuscleProgressionGroup(muscle: MuscleGroup): MuscleProgressionGroup | null {
  if (muscle === "chest" || muscle === "back" || muscle === "shoulders") return muscle;
  if (muscle === "rear_delts") return "shoulders";
  if (muscle === "traps") return "back";
  if (muscle === "biceps" || muscle === "triceps" || muscle === "forearms") return "arms";
  if (muscle === "quads" || muscle === "hamstrings" || muscle === "glutes" || muscle === "calves" || muscle === "adductors" || muscle === "abductors") return "legs";
  return null;
}

function roundLoad(load: number): number {
  return Math.round(load * 2) / 2;
}

function unique<T>(values: T[]): T[] {
  return [...new Set(values)];
}

function titleGroup(group: MuscleProgressionGroup): string {
  return group.charAt(0).toUpperCase() + group.slice(1);
}
