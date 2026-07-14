import type { TrainingYear } from "@/domain/training/annual-models";
import { readCanonicalSessionRoles } from "@/application/training/canonical-training-architecture";
import type { Exercise, Programme, WorkoutHistorySummary, WorkoutSession } from "@/domain/training/models";
import { displayWorkoutName } from "@/domain/training/planned-workout";
import { resolveEventTaper } from "@/domain/training/event-taper";
import { classifyFatigue } from "@/domain/training/fatigue-classifier";
import { buildStrategicCoachingViewModel } from "@/domain/training/strategic-coaching-presenter";
import type { ActiveTrainingPlan } from "@/domain/training/plan-setup";
import { evidence, insufficientEvidence, type RecommendationEvidence } from "@/domain/training/recommendation-evidence";
import { completedPlanSessionIndexes, hasCompletedAllPlanSessionsThisWeek, resolveRecommendedSessionIndex, resolveSelectedSessionIndex } from "@/domain/training/training-session-selection";
import { analyzePersonalisedVolume, getPrimaryPersonalisedVolumeRecommendation } from "@/domain/training/personalised-volume";
import type { PersonalisedVolumeResult } from "@/domain/training/personalised-volume";
import { previousVolumeLadderActions } from "@/domain/training/volume-adjustments";
import { resolveRecoveryCapacity } from "@/domain/training/recovery-capacity";
import { buildRecoveryCapacityWeeklyTarget, type RecoveryCapacityWeeklyTarget } from "@/domain/training/recovery-capacity-delivery";
import { createPlanningContext } from "@/domain/training/planning-context";

export type HomeTodayState = "no_plan" | "planned" | "rest_day" | "active_workout" | "completed_today";

export interface HomeWeekItem {
  label: string;
  status: "done" | "current" | "upcoming" | "rest";
  isRecommended: boolean;
  isSelected: boolean;
}

export interface HomeDashboardViewModel {
  title: string;
  greeting: string;
  todayState: HomeTodayState;
  todayWorkoutName: string;
  todayWorkout: string;
  todayGoal: string;
  todayMeta: string;
  primaryActionLabel: string;
  hasActivePlan: boolean;
  hasOpenWorkout: boolean;
  hasCompletedToday: boolean;
  hasCompletedWeek: boolean;
  activeWorkoutProgress?: string;
  currentDayIndex: number;
  recommendedSessionIndex: number;
  planningContext: {
    goal: string;
    macrocycle: string;
    mesocyclePurpose: string | null;
    microcycleLabel: string | null;
    sessionRole: string | null;
    exactTargets: string[];
    status: "ready" | "compatibility" | "incomplete" | "no_plan";
  };
  thisWeek: string[];
  thisWeekItems: HomeWeekItem[];
  nextWorkout: string;
  showUpNext: boolean;
  momentumLabel: string;
  readinessLabel: string;
  recommendationLabel: string;
  recommendationReasons: string[];
  recommendationEvidence: RecommendationEvidence;
  extraWorkWarning?: {
    message: string;
    evidence: RecommendationEvidence;
  };
  muscleVolumeWarning?: {
    message: string;
    evidence: RecommendationEvidence;
    recommendation: PersonalisedVolumeResult;
  };
  recoveryCapacityWarning?: {
    message: string;
    evidence: RecommendationEvidence;
  };
  recoveryCapacityTarget?: RecoveryCapacityWeeklyTarget;
  hasTrainingDirection: boolean;
  emptyDirectionMessage: string;
  recentProgress: string;
  approvedNextMesocycleLabel: string;
}

export function buildHomeDashboardViewModel({
  trainingYear,
  activePlan,
  history,
  exercises,
  programmes,
  hasOpenWorkout = false,
  activeWorkoutName,
  activeWorkout,
  selectedSessionIndex,
  date = new Date(),
}: {
  trainingYear?: TrainingYear;
  activePlan?: ActiveTrainingPlan | null;
  history: WorkoutHistorySummary[];
  exercises: Exercise[];
  programmes: Programme[];
  hasOpenWorkout?: boolean;
  activeWorkoutName?: string;
  activeWorkout?: WorkoutSession | null;
  selectedSessionIndex?: number | null;
  date?: Date;
}): HomeDashboardViewModel {
  void programmes;
  void trainingYear;
  const hasActivePlan = Boolean(activePlan);
  const split = activePlan ? readCanonicalSessionRoles(activePlan) : [];
  const recommendedSessionIndex = activePlan ? resolveRecommendedSessionIndex({ activePlan, history, date }) : 0;
  const todayIndex = activePlan ? resolveSelectedSessionIndex({ activePlan, history, selectedSessionIndex, date }) : 0;
  const plannedWorkout = split[todayIndex] ?? split[0] ?? "Set up your training plan";
  const isRestDay = plannedWorkout.toLowerCase().includes("rest");
  const hasCompletedWeek = activePlan ? hasCompletedAllPlanSessionsThisWeek({ activePlan, history, date }) : false;
  const completedToday = findCompletedToday(history, date, plannedWorkout);
  const hasCompletedToday = Boolean(completedToday);
  const todayState: HomeTodayState = !hasActivePlan
    ? "no_plan"
    : hasOpenWorkout
      ? "active_workout"
      : hasCompletedToday || hasCompletedWeek
        ? "completed_today"
        : isRestDay
          ? "rest_day"
          : "planned";
  const cleanedActiveWorkoutName = activeWorkoutName ? displayWorkoutName(activeWorkoutName) : undefined;
  const todayWorkout =
    todayState === "no_plan"
      ? "Set up your training plan"
      : todayState === "active_workout"
        ? cleanedActiveWorkoutName ?? "Workout in progress"
      : todayState === "completed_today"
        ? hasCompletedWeek
          ? "Training week complete"
          : `${displayWorkoutName(completedToday?.sessionName ?? plannedWorkout)} complete`
        : todayState === "rest_day"
          ? "Rest day"
        : plannedWorkout;
  const strategic = buildStrategicCoachingViewModel(history, exercises, { activePlan: activePlan ?? undefined, goal: activePlan?.goal });
  const eventTaper = activePlan?.mode === "custom_date_event" && activePlan.targetDate
    ? resolveEventTaper({
        eventType: activePlan.eventType,
        targetDate: activePlan.targetDate,
        goal: activePlan.goal,
        experienceLevel: activePlan.experienceLevel,
        referenceDate: date,
      })
    : null;
  const extraWorkWarning = buildExtraWorkWarning(history);
  const muscleVolumeWarning = buildMuscleVolumeWarning({ history, exercises, activePlan, eventTaper });
  const recoveryCapacityWarning = buildRecoveryCapacityWarning({ history, exercises, activePlan });
  const recoveryCapacityTarget = buildRecoveryCapacityWeeklyTarget({ activePlan, currentBlock: null, history, exercises, activeWorkout, date });
  const latestProgress = history[0]?.progressionHighlights[0] ?? `${history[0]?.setsCompleted ?? 0} sets logged recently`;
  const openPlannedWorkout = activeWorkout && !activeWorkout.completedAt && activeWorkout.sessionKind === "planned" ? activeWorkout : null;
  const planning = activePlan ? createPlanningContext(activePlan, openPlannedWorkout) : null;
  const planningReady = Boolean(activePlan?.currentMesocycleId && activePlan.currentMicrocycle);
  const blockName = !activePlan ? "No active plan" : planningReady ? planning?.mesocyclePurpose ?? "Current training phase" : hasOpenWorkout ? "Workout in progress" : "Plan details unavailable";
  const microcycleLabel = planningReady && planning?.microcycle ? `Microcycle ${planning.microcycle.number} · ${planning.microcycle.priority}` : null;
  const approvedNextMesocycleLabel = activePlan?.currentMesocycleId ? "Approved next mesocycle available in Plan" : "";
  const activeWorkoutProgress = activeWorkout
    ? `${countCompletedExercises(activeWorkout)} of ${activeWorkout.exercises.length} exercises complete`
    : undefined;
  const nextWorkout = hasCompletedWeek ? "" : hasCompletedToday ? plannedWorkout : nextTrainableWorkout(split, todayIndex);
  const showUpNext = shouldShowUpNext(todayState, todayWorkout, plannedWorkout, nextWorkout);
  const completedSlots = activePlan ? completedPlanSessionIndexes({ activePlan, split, history, date }) : new Set<number>();
  const thisWeekItems = split.map((label, index) => ({
    label,
    status: weekStatus(label, index, todayIndex, completedSlots),
    isRecommended: index === recommendedSessionIndex,
    isSelected: index === todayIndex,
  }));

  return {
    title: "Today",
    greeting: greetingForNow(date),
    todayState,
    todayWorkoutName: todayWorkout,
    todayWorkout: `${todayWorkout} - ${blockName}`,
    todayGoal: goalForToday(todayState, todayWorkout, blockName, nextWorkout),
    todayMeta:
      todayState === "active_workout"
        ? activeWorkoutProgress ?? "Workout in progress"
        : todayState === "completed_today"
          ? hasCompletedWeek ? "All planned sessions are complete for this training week" : nextWorkout ? `Next up: ${nextWorkout}` : "Training complete for today"
          : todayState === "rest_day"
            ? nextWorkout ? `Next session: ${nextWorkout}` : "No workout scheduled today"
          : todayState === "no_plan"
            ? "No active plan yet."
            : "Today’s planned session",
    primaryActionLabel:
      todayState === "no_plan"
        ? "Set up your training plan"
        : todayState === "active_workout"
        ? `Continue ${todayWorkout}`
        : todayState === "completed_today"
          ? hasCompletedWeek
            ? "Training week complete"
            : nextWorkout
            ? `Start ${nextWorkout}`
            : "Workout complete"
          : todayState === "rest_day"
            ? nextWorkout
              ? `Start ${nextWorkout}`
              : "View plan"
            : `Start ${todayWorkout}`,
    hasActivePlan,
    hasOpenWorkout,
    hasCompletedToday,
    hasCompletedWeek,
    activeWorkoutProgress,
    currentDayIndex: todayIndex,
    recommendedSessionIndex,
    planningContext: {
      goal: activePlan ? titleBlock(activePlan.goal) : "Set up training",
      macrocycle: planning ? titleBlock(planning.macrocycleEngine) : "-",
      mesocyclePurpose: planningReady ? planning?.mesocyclePurpose ?? null : null,
      microcycleLabel,
      sessionRole: planningReady ? planning?.sessionRole ?? null : null,
      exactTargets: Object.values(planning?.exactPrescribedTargets ?? {}).flat().map(String),
      status: !activePlan ? "no_plan" : planningReady ? "ready" : activePlan.currentMesocycleId || activePlan.currentMicrocycle ? "incomplete" : "compatibility",
    },
    thisWeek: split,
    thisWeekItems,
    nextWorkout,
    showUpNext,
    momentumLabel: strategic.momentum?.band ?? "Not enough data yet",
    readinessLabel: strategic.readiness?.label ?? "Not enough data yet",
    recommendationLabel: strategic.recommendation?.title ?? "Log a few workouts first",
    recommendationReasons: strategic.recommendation?.reasons.slice(0, 2) ?? [],
    recommendationEvidence: strategic.hasEnoughHistory
      ? evidence({
          type: "home_coach_note",
          confidence: "medium",
          source: "history",
          summary: "Home coach note uses completed workout history.",
          dataPoints: [`${history.length} completed workout(s)`, ...(strategic.recommendation?.reasons ?? [])].slice(0, 4),
          reason: strategic.recommendation?.message ?? "Continue collecting training history.",
          actionAllowed: true,
        })
      : insufficientEvidence("home_coach_note", "Log 3-5 completed workouts first."),
    extraWorkWarning,
    muscleVolumeWarning,
    recoveryCapacityWarning,
    recoveryCapacityTarget,
    hasTrainingDirection: strategic.hasEnoughHistory,
    emptyDirectionMessage: "Log a few sessions first. The app is smart, not psychic.",
    recentProgress: latestProgress,
    approvedNextMesocycleLabel,
  };
}

function buildRecoveryCapacityWarning({
  history,
  exercises,
  activePlan,
}: {
  history: WorkoutHistorySummary[];
  exercises: Exercise[];
  activePlan?: ActiveTrainingPlan | null;
}): HomeDashboardViewModel["recoveryCapacityWarning"] {
  if (!activePlan) return undefined;
  const personalisedVolumeState = analyzePersonalisedVolume({
    completedWorkouts: history,
    exercises,
    goal: activePlan.goal,
    experienceLevel: activePlan.experienceLevel,
    deloadActive: activePlan.recommendationState?.deload?.status === "accepted",
    previousLadderActionsByMuscle: Object.fromEntries(
      exercises.flatMap((exercise) => exercise.primaryMuscles).map((muscle) => [muscle, previousVolumeLadderActions(activePlan, muscle)]),
    ),
  });
  const fatigueClassification = classifyFatigue({
    workoutHistory: history,
    exercises,
    muscleVolumeSignals: personalisedVolumeState,
    deloadActive: activePlan.recommendationState?.deload?.status === "accepted",
  });
  const result = resolveRecoveryCapacity({
    goal: activePlan.goal,
    eventType: activePlan.eventType,
    fatigueClassification,
    personalisedVolumeState,
    extraSessionWorkload: history.filter((summary) => summary.sessionKind && summary.sessionKind !== "planned").length,
    recoveryCardioPreference: activePlan.recoveryCardioPreference,
    weeklyTrainingVolume: history.slice(0, 4).reduce((sum, summary) => sum + summary.setsCompleted, 0),
    experienceLevel: activePlan.experienceLevel,
    completedWorkouts: history,
  });
  if (result.recommendation === "none" || !result.message || result.confidence === "low" || result.confidence === "insufficient_data") return undefined;

  return {
    message: result.frequencySuggestion ? `${result.message} ${result.frequencySuggestion}` : result.message,
    evidence: evidence({
      type: "home_coach_note",
      confidence: result.confidence === "high" ? "high" : "medium",
      source: "history",
      summary: "Recovery and capacity recommendation uses workload, fatigue, extra-session, and plan context.",
      dataPoints: result.evidence,
      reason: result.message,
      actionAllowed: false,
    }),
  };
}

function buildMuscleVolumeWarning({
  history,
  exercises,
  activePlan,
  eventTaper,
}: {
  history: WorkoutHistorySummary[];
  exercises: Exercise[];
  activePlan?: ActiveTrainingPlan | null;
  eventTaper?: ReturnType<typeof resolveEventTaper> | null;
}): HomeDashboardViewModel["muscleVolumeWarning"] {
  if (!activePlan) return undefined;
  const recommendation = getPrimaryPersonalisedVolumeRecommendation(
    analyzePersonalisedVolume({
      completedWorkouts: history,
      exercises,
      goal: activePlan.goal,
      experienceLevel: activePlan.experienceLevel,
      deloadActive: activePlan.recommendationState?.deload?.status === "accepted",
      eventTaper,
      previousLadderActionsByMuscle: Object.fromEntries(
        exercises.flatMap((exercise) => exercise.primaryMuscles).map((muscle) => [muscle, previousVolumeLadderActions(activePlan, muscle)]),
      ),
    }),
  );
  if (!recommendation || recommendation.confidence === "low") return undefined;
  if (!["raise_range", "add_exercise", "lower_range", "remove_or_swap_exercise", "deload_caution"].includes(recommendation.recommendedLadderAction)) return undefined;

  return {
    message: recommendation.userCopy,
    recommendation,
    evidence: evidence({
      type: "volume_change",
      confidence: recommendation.confidence,
      source: "history",
      summary: "Muscle-specific volume trend produced a high-priority ladder note.",
      dataPoints: recommendation.evidence.summary,
      reason: recommendation.reason,
      actionAllowed: true,
    }),
  };
}

function buildExtraWorkWarning(history: WorkoutHistorySummary[]): HomeDashboardViewModel["extraWorkWarning"] {
  const completed = history.filter((summary) => summary.setsCompleted > 0);
  if (completed.length < 4) return undefined;

  const extraSessions = completed.filter((summary) => summary.sessionKind && summary.sessionKind !== "planned");
  if (extraSessions.length < 2) return undefined;

  const extraSets = extraSessions.reduce((sum, session) => sum + session.setsCompleted, 0);
  const plannedSets = completed
    .filter((summary) => summary.sessionKind === "planned" || summary.sessionKind == null)
    .reduce((sum, session) => sum + session.setsCompleted, 0);
  const extraShare = extraSets / Math.max(1, extraSets + plannedSets);
  if (extraSets < 12 && extraShare < 0.35) return undefined;

  return {
    message: "You’re adding a lot of extra work. Useful if you recover. Expensive if you don’t.",
    evidence: evidence({
      type: "home_coach_note",
      confidence: "medium",
      source: "history",
      summary: "Extra sessions are meaningfully increasing total workload.",
      dataPoints: [
        `${extraSessions.length} extra session(s) in recent completed history.`,
        `${extraSets} extra work set(s).`,
        `${plannedSets} planned work set(s).`,
      ],
      reason: "Extra sessions count toward fatigue and progress, but they do not complete main-plan sessions.",
      actionAllowed: false,
    }),
  };
}

function shouldShowUpNext(state: HomeTodayState, todayWorkout: string, plannedWorkout: string, nextWorkout: string): boolean {
  if (!nextWorkout) return false;
  if (state === "no_plan" || state === "active_workout" || state === "planned") return false;

  const cleanedNext = displayWorkoutName(nextWorkout).toLowerCase();
  const cleanedToday = displayWorkoutName(todayWorkout.replace(/\s+complete$/i, "")).toLowerCase();

  if (state === "completed_today") return cleanedNext !== cleanedToday;
  if (state === "rest_day") return false;
  return false;
}

function findCompletedToday(history: WorkoutHistorySummary[], date: Date, plannedWorkout: string): WorkoutHistorySummary | null {
  const sameDay = history.filter((summary) => isSameLocalDate(new Date(summary.completedAt), date));
  if (sameDay.length === 0) return null;
  const planned = sameDay.find((summary) => displayWorkoutName(summary.sessionName).toLowerCase().includes(plannedWorkout.toLowerCase()));
  return planned ?? sameDay[0] ?? null;
}

function isSameLocalDate(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function nextTrainableWorkout(split: string[], todayIndex: number): string {
  if (split.length === 0) return "";
  for (let offset = 1; offset <= split.length; offset += 1) {
    const label = split[(todayIndex + offset) % split.length] ?? "";
    if (!label.toLowerCase().includes("rest")) return label;
  }
  return "";
}

function weekStatus(label: string, index: number, todayIndex: number, completedSlots: Set<number>): HomeWeekItem["status"] {
  if (label.toLowerCase().includes("rest")) return "rest";
  if (completedSlots.has(index)) return "done";
  if (index === todayIndex) return "current";
  return "upcoming";
}

function countCompletedExercises(session: WorkoutSession): number {
  return session.exercises.filter((exercise) => exercise.status === "complete" || exercise.status === "shutdown" || exercise.status === "swapped").length;
}

function titleBlock(value: string): string {
  return value.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function greetingForNow(date = new Date()): string {
  const hour = date.getHours();
  if (hour < 12) return "Good Morning";
  if (hour < 18) return "Good Afternoon";
  return "Good Evening";
}

function goalForWorkout(workout: string, block: string): string {
  const workoutLabel = workout.toLowerCase();
  const blockLabel = block.toLowerCase();
  if (blockLabel.includes("power")) {
    if (workoutLabel.includes("pull")) return "Explosive pulling power";
    if (workoutLabel.includes("push")) return "Fast, crisp pressing";
    if (workoutLabel.includes("legs") || workoutLabel.includes("lower")) return "Explosive lower-body output";
    return "Move weight fast";
  }
  if (workoutLabel.includes("push")) return "Pressing volume with clean reps";
  if (workoutLabel.includes("pull")) return "Back work before arm work";
  if (workoutLabel.includes("legs") || workoutLabel.includes("lower")) return "Productive leg work, no junk volume";
  if (workoutLabel.includes("arms")) return "Direct arm work";
  if (workoutLabel.includes("rest")) return "Recover so the next session works";
  return "Quality reps, performance-led volume";
}

function goalForToday(state: HomeTodayState, workout: string, block: string, nextWorkout: string): string {
  if (state === "no_plan") return "Tell Adaptive Strength Coach what you are training for.";
  if (state === "active_workout") return "Finish the session you already started.";
  if (state === "completed_today") return nextWorkout ? `Today is done. Next session: ${nextWorkout}.` : "Today’s training is complete.";
  if (state === "rest_day") return nextWorkout ? `Recover today. Next session: ${nextWorkout}.` : "Recover so the next session works.";
  return goalForWorkout(workout, block);
}
