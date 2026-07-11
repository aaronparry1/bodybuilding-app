import type { TrainingBlock } from "@/domain/training/annual-models";
import { evaluateCardioInterference, type CardioInterferenceResult, type LiftingContext } from "@/domain/training/cardio-interference";
import { resolveCardioDose, type CardioDoseAction } from "@/domain/training/cardio-dose";
import { resolveEventTaper } from "@/domain/training/event-taper";
import { classifyFatigue } from "@/domain/training/fatigue-classifier";
import type { Exercise, CardioSessionKind, WorkoutHistorySummary } from "@/domain/training/models";
import type { WorkoutSession } from "@/domain/training/models";
import { analyzePersonalisedVolume } from "@/domain/training/personalised-volume";
import { sessionRolesForPlan, type ActiveTrainingPlan } from "@/domain/training/plan-setup";
import { buildPlannedWorkoutProgramme } from "@/domain/training/planned-workout";
import { resolveRecoveryCapacity } from "@/domain/training/recovery-capacity";
import { resolveRecoveryCapacityTiming, type RecoveryCapacityTimingGuidance } from "@/domain/training/recovery-capacity-timing";
import { startOfWeek, resolveRecommendedSessionIndex } from "@/domain/training/training-session-selection";
import { previousVolumeLadderActions } from "@/domain/training/volume-adjustments";

export interface RecoveryCapacityWeeklyTarget {
  title: string;
  completedSessions: number;
  targetSessions: number;
  targetLabel: string;
  note: string;
  sessionType: CardioSessionKind;
  actionLabel: string;
  secondaryActionLabel: string;
  progressAction: CardioDoseAction;
  recommendation: string;
  evidence: string[];
  interference: CardioInterferenceResult;
  timingGuidance: RecoveryCapacityTimingGuidance;
}

export function buildRecoveryCapacityWeeklyTarget({
  activePlan,
  currentBlock,
  history,
  exercises,
  activeWorkout,
  date = new Date(),
}: {
  activePlan?: ActiveTrainingPlan | null;
  currentBlock?: TrainingBlock | null;
  history: WorkoutHistorySummary[];
  exercises: Exercise[];
  activeWorkout?: WorkoutSession | null;
  date?: Date;
}): RecoveryCapacityWeeklyTarget | undefined {
  if (!activePlan) return undefined;

  const eventTaper = activePlan.targetDate
    ? resolveEventTaper({
        eventType: activePlan.eventType,
        targetDate: activePlan.targetDate,
        currentBlock: currentBlock?.type,
        goal: activePlan.goal,
        experienceLevel: activePlan.experienceLevel,
        referenceDate: date,
      })
    : null;
  const personalisedVolumeState = analyzePersonalisedVolume({
    completedWorkouts: history,
    exercises,
    goal: activePlan.goal,
    experienceLevel: activePlan.experienceLevel,
    block: currentBlock?.type,
    deloadActive: currentBlock?.type === "deload" || activePlan.recommendationState?.deload?.status === "accepted",
    eventTaper,
    previousLadderActionsByMuscle: Object.fromEntries(
      exercises.flatMap((exercise) => exercise.primaryMuscles).map((muscle) => [muscle, previousVolumeLadderActions(activePlan, muscle)]),
    ),
  });
  const fatigueClassification = classifyFatigue({
    workoutHistory: history,
    exercises,
    muscleVolumeSignals: personalisedVolumeState,
    deloadActive: currentBlock?.type === "deload" || activePlan.recommendationState?.deload?.status === "accepted",
  });
  const recoveryCapacity = resolveRecoveryCapacity({
    goal: activePlan.goal,
    block: currentBlock?.type,
    eventType: activePlan.eventType,
    fatigueClassification,
    personalisedVolumeState,
    extraSessionWorkload: history.filter((summary) => summary.sessionKind && summary.sessionKind !== "planned").length,
    recoveryCardioPreference: activePlan.recoveryCardioPreference,
    weeklyTrainingVolume: history.slice(0, 4).reduce((sum, summary) => sum + summary.setsCompleted, 0),
    experienceLevel: activePlan.experienceLevel,
    completedWorkouts: history,
  });

  if (
    recoveryCapacity.recommendation === "none" ||
    !recoveryCapacity.suggestedSessionType ||
    !recoveryCapacity.message ||
    recoveryCapacity.confidence === "low" ||
    recoveryCapacity.confidence === "insufficient_data"
  ) {
    return undefined;
  }

  const currentWeekCardio = currentWeekCardioSummaries(history, date);
  const cardioDose = resolveCardioDose({
    goal: activePlan.goal,
    block: currentBlock?.type,
    recoveryCardioPreference: activePlan.recoveryCardioPreference,
    currentWeeklyCardioSessions: currentWeekCardio,
    recentLiftingFatigueClassification: fatigueClassification,
    extraLiftingWorkload: history.filter((summary) => summary.sessionKind && summary.sessionKind !== "planned" && !summary.cardioLog).length,
    eventTaperPhase: eventTaper?.eventPhase,
    experienceLevel: activePlan.experienceLevel,
  });
  const sessionType = recoveryCapacity.suggestedSessionType ?? cardioDose.suggestedSessionType ?? "recovery_cardio";
  const matchingCompleted = currentWeekCardio.filter((summary) => summary.cardioLog?.sessionType === sessionType).length;
  const targetSessions = Math.max(1, cardioDose.recommendedWeeklyFrequency.min || recoveryCapacity.dose?.recommendedWeeklyFrequency.min || 1);
  const nextLiftingContext = resolveNextLiftingContext({ activePlan, history, currentBlock, exercises, activeWorkout, eventTaperPhase: eventTaper?.eventPhase, date });
  const interference = evaluateCardioInterference({
    sessionType,
    goal: activePlan.goal,
    block: currentBlock?.type,
    nextLiftingContext,
    recentLiftingFatigue: fatigueClassification,
    eventTaperPhase: eventTaper?.eventPhase,
  });
  const timingGuidance = resolveRecoveryCapacityTiming({
    recommendation: sessionType,
    nextWorkoutContext: nextLiftingContext,
    goal: activePlan.goal,
    block: currentBlock?.type,
    fatigueClassification,
    eventTaperPhase: eventTaper?.eventPhase,
    recoveryCardioPreference: activePlan.recoveryCardioPreference,
  });

  return {
    title: "Recovery & Capacity",
    completedSessions: Math.min(matchingCompleted, targetSessions),
    targetSessions,
    targetLabel: formatTargetLabel(targetSessions, cardioDose.recommendedWeeklyFrequency.max, cardioDose.recommendedDurationRange, sessionType),
    note: timingGuidance.startMessage,
    sessionType,
    actionLabel: `Start ${sessionTypeLabel(sessionType)}`,
    secondaryActionLabel: "Ignore This Week",
    progressAction: cardioDose.progressionAction,
    recommendation: recoveryCapacity.message,
    evidence: [...recoveryCapacity.evidence, ...cardioDose.evidence].slice(0, 6),
    interference,
    timingGuidance,
  };
}

export function currentWeekCardioSummaries(history: WorkoutHistorySummary[], date: Date = new Date()): WorkoutHistorySummary[] {
  const weekStart = startOfWeek(date);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 7);
  return history.filter((summary) => {
    if (!summary.cardioLog) return false;
    const completedAt = new Date(summary.completedAt);
    return completedAt >= weekStart && completedAt < weekEnd;
  });
}

export function resolveNextLiftingContext({
  activePlan,
  history,
  currentBlock,
  exercises = [],
  activeWorkout,
  eventTaperPhase,
  date = new Date(),
}: {
  activePlan?: ActiveTrainingPlan | null;
  history: WorkoutHistorySummary[];
  currentBlock?: TrainingBlock | null;
  exercises?: Exercise[];
  activeWorkout?: WorkoutSession | null;
  eventTaperPhase?: ReturnType<typeof resolveEventTaper>["eventPhase"] | null;
  date?: Date;
}): LiftingContext {
  if (eventTaperPhase === "event_week") return "event_week";
  if (eventTaperPhase === "taper" || currentBlock?.type === "peak") return "peak_or_taper";

  const activeWorkoutContext = contextFromActiveWorkout(activeWorkout, exercises);
  if (activeWorkoutContext !== "unknown") return activeWorkoutContext;

  const plannedWorkoutContext = contextFromNextPlannedWorkout({ activePlan, currentBlock, exercises, history, date });
  if (plannedWorkoutContext !== "unknown") return plannedWorkoutContext;

  if (!activePlan) return "none";
  const split = sessionRolesForPlan(activePlan);
  if (split.length === 0) return "none";
  const index = resolveRecommendedSessionIndex({ activePlan, history, date });
  const nextLabel = split[index]?.toLowerCase() ?? "";
  if (nextLabel.includes("deadlift")) return "deadlift_focused";
  if (nextLabel.includes("squat")) return "squat_focused";
  if (nextLabel.includes("lower") || nextLabel.includes("legs")) return "heavy_lower";
  if (nextLabel.includes("upper") || nextLabel.includes("push") || nextLabel.includes("pull")) return "heavy_upper";
  if (currentBlock?.type === "power") return "power_focused";
  return "unknown";
}

function contextFromActiveWorkout(activeWorkout: WorkoutSession | null | undefined, exercises: Exercise[]): LiftingContext {
  if (!activeWorkout || activeWorkout.completedAt || activeWorkout.sessionKind !== "planned") return "unknown";
  const workoutExercises = activeWorkout.exercises
    .map((entry) => exercises.find((exercise) => exercise.id === entry.exerciseId))
    .filter((exercise): exercise is Exercise => Boolean(exercise));
  return contextFromExercises(workoutExercises, activeWorkout.name);
}

function contextFromNextPlannedWorkout({
  activePlan,
  currentBlock,
  exercises,
  history,
  date,
}: {
  activePlan?: ActiveTrainingPlan | null;
  currentBlock?: TrainingBlock | null;
  exercises: Exercise[];
  history: WorkoutHistorySummary[];
  date: Date;
}): LiftingContext {
  if (!activePlan || exercises.length === 0) return "unknown";
  const programme = buildPlannedWorkoutProgramme({
    activePlan,
    exercises,
    currentBlock,
    date,
    history,
  });
  const slots = programme?.days[0]?.exerciseSlots ?? [];
  if (slots.length === 0) return "unknown";
  const workoutExercises = slots
    .map((slot) => exercises.find((exercise) => exercise.id === slot.exerciseId))
    .filter((exercise): exercise is Exercise => Boolean(exercise));
  return contextFromExercises(workoutExercises, programme?.name);
}

function contextFromExercises(exercises: Exercise[], name?: string): LiftingContext {
  const joined = `${name ?? ""} ${exercises.map((exercise) => exercise.name).join(" ")}`.toLowerCase();
  if (exercises.some((exercise) => exercise.defaultSettings.trainingLane === "power" || exercise.role === "power" || exercise.family === "olympic_power" || exercise.family === "jump_power" || exercise.family === "throw_power")) {
    return "power_focused";
  }
  if (exercises.some((exercise) => isPrimaryDeadlift(exercise)) || /\b(deadlift|rack pull|block pull|deficit)\b/i.test(joined)) {
    return "deadlift_focused";
  }
  if (exercises.some((exercise) => isPrimarySquat(exercise)) || /\b(squat|safety squat|front squat|box squat)\b/i.test(joined)) {
    return "squat_focused";
  }
  if (exercises.some((exercise) => exercise.movementPattern === "squat" || exercise.movementPattern === "hinge") || /\b(lower|legs)\b/i.test(joined)) {
    return "heavy_lower";
  }
  if (exercises.some((exercise) => isHeavyUpper(exercise)) || /\b(bench|overhead press|upper|push|pull)\b/i.test(joined)) {
    return "heavy_upper";
  }
  return "unknown";
}

function isPrimaryDeadlift(exercise: Exercise): boolean {
  return exercise.tier === "A" && (exercise.family === "hip_hinge" || /\bdeadlift\b/i.test(exercise.name));
}

function isPrimarySquat(exercise: Exercise): boolean {
  return exercise.tier === "A" && (exercise.family === "squat_pattern" || exercise.movementPattern === "squat" || /\bsquat\b/i.test(exercise.name));
}

function isHeavyUpper(exercise: Exercise): boolean {
  return (
    exercise.tier === "A" &&
    (exercise.family === "horizontal_press" || exercise.family === "vertical_press" || exercise.movementPattern === "horizontal_push" || exercise.movementPattern === "vertical_push")
  );
}

function formatTargetLabel(
  targetSessions: number,
  maxSessions: number,
  duration: { min: number; max: number },
  sessionType: CardioSessionKind,
): string {
  const frequency = maxSessions > targetSessions ? `${targetSessions}-${maxSessions}` : `${targetSessions}`;
  const durationLabel = duration.min === duration.max ? `${duration.min} min` : `${duration.min}-${duration.max} min`;
  return `${frequency} x ${durationLabel} ${sessionTypeLabel(sessionType)}`;
}

function sessionTypeLabel(sessionType: CardioSessionKind): string {
  if (sessionType === "recovery_cardio") return "Recovery Cardio";
  if (sessionType === "capacity_cardio") return "Capacity Cardio";
  return "Performance Conditioning";
}
