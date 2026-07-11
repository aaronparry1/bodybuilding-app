import type { BlockType } from "@/domain/training/annual-models";
import { formatMetricValue } from "@/domain/training/exercise-metrics";
import type { ExperienceLevel, NextLoadApproval, SetLog, UnitSystem, WorkoutExerciseLog, WorkoutSession } from "@/domain/training/models";
import { detectPersonalRecords, type PersonalRecordItem } from "@/domain/training/personal-records";
import type { TrainingSetupGoal } from "@/domain/training/plan-setup";
import { exerciseLibrary } from "@/domain/training/presets";
import { resolveProgressionThrottle } from "@/domain/training/progression-throttle";
import { resolveExerciseTargetZone, targetZoneLabel } from "@/domain/training/exercise-target-zone";
import { getRequiredSets } from "@/domain/training/set-prescription";
import { manualFinishShouldSuppressLoadIncrease } from "@/domain/training/workout-exercise-state";
import { summarizeWorkoutHistory, summarizeWorkoutSession } from "@/domain/training/workout-history";
import { getWarmupSets, getWorkSets } from "@/domain/training/workout-sets";
import { resolveCanonicalLoadEvidence } from "@/domain/training/load-evidence-resolver";

export interface PostWorkoutReviewSummary {
  workoutName: string;
  durationMinutes: number;
  exercisesCompleted: number;
  totalExercises: number;
  workSetsCompleted: number;
  warmupsLogged: number;
  skippedExercises: string[];
  extraSession: boolean;
  completedEarly: boolean;
  allPlannedWorkComplete: boolean;
}

export interface PostWorkoutProgressItem {
  id: string;
  title: string;
  detail: string;
}

export interface PostWorkoutLoadChange {
  exerciseLogId: string;
  exerciseName: string;
  currentLoad: number;
  recommendedLoad: number;
  unit: UnitSystem;
  direction: "increase" | "hold" | "decrease";
  reason: string;
  evidence: string[];
}

export interface PostWorkoutReviewViewModel {
  sessionId: string;
  completedAt: string;
  title: "Workout Review";
  headline: string;
  summary: PostWorkoutReviewSummary;
  progressItems: PostWorkoutProgressItem[];
  personalRecords: PersonalRecordItem[];
  baselines: PersonalRecordItem[];
  loadChanges: PostWorkoutLoadChange[];
  emptyStateCopy?: string;
  lowHistoryCopy?: string;
}

export type PostWorkoutLoadDecision = "approved" | "kept";

export interface PostWorkoutReviewOptions {
  session: WorkoutSession;
  previousSessions: WorkoutSession[];
  completedAt: string;
  goal?: TrainingSetupGoal;
  experienceLevel?: ExperienceLevel;
  currentBlock?: BlockType;
  isDeload?: boolean;
}

export function buildPostWorkoutReview({
  session,
  previousSessions,
  completedAt,
  goal,
  experienceLevel,
  currentBlock,
  isDeload,
}: PostWorkoutReviewOptions): PostWorkoutReviewViewModel {
  const completedSession: WorkoutSession = { ...session, completedAt, updatedAt: completedAt, syncState: "local" };
  const historyWithCurrent = summarizeWorkoutHistory([
    ...previousSessions.filter((candidate) => candidate.id !== session.id),
    completedSession,
  ]);
  const currentSummary =
    historyWithCurrent.find((summary) => summary.sessionId === session.id) ?? summarizeWorkoutSession(completedSession);
  const previousByExercise = buildPreviousExerciseStats(previousSessions.filter((candidate) => candidate.id !== session.id));
  const allPlannedWorkComplete = session.exercises.length > 0 && session.exercises.every(isExerciseWorkCompleteForReview);
  const workSetsCompleted = session.exercises.reduce((sum, exercise) => sum + getWorkSets(exercise.sets).length, 0);
  const warmupsLogged = session.exercises.reduce((sum, exercise) => sum + getWarmupSets(exercise.sets).length, 0);
  const skippedExercises = session.exercises
    .filter((exercise) => getWorkSets(exercise.sets).length === 0 && exercise.status !== "swapped")
    .map((exercise) => exercise.exerciseName);
  const progressItems = buildProgressItems(session, previousByExercise, allPlannedWorkComplete);
  const reviewRecords = detectPersonalRecords({
    sessions: [...previousSessions.filter((candidate) => candidate.id !== session.id), completedSession],
    currentSessionId: session.id,
    now: completedAt,
    includeBaselines: true,
    limit: 12,
  });
  const personalRecords = reviewRecords.filter((record) => record.status === "pr");
  const baselines = reviewRecords.filter((record) => record.status === "baseline");
  const loadChanges = buildLoadChanges(session, currentSummary, historyWithCurrent, previousByExercise, { goal, experienceLevel, currentBlock, isDeload });

  return {
    sessionId: session.id,
    completedAt,
    title: "Workout Review",
    headline: loadChanges.length > 0 ? "Strong work. Here’s what changes next time." : "Done. Bank it.",
    summary: {
      workoutName: session.name,
      durationMinutes: currentSummary?.durationMinutes ?? 0,
      exercisesCompleted: session.exercises.filter(isExerciseWorkCompleteForReview).length,
      totalExercises: session.exercises.length,
      workSetsCompleted,
      warmupsLogged,
      skippedExercises,
      extraSession: session.sessionKind != null && session.sessionKind !== "planned",
      completedEarly: !allPlannedWorkComplete,
      allPlannedWorkComplete,
    },
    progressItems,
    personalRecords,
    baselines,
    loadChanges,
    emptyStateCopy:
      progressItems.length === 0 && personalRecords.length === 0 && baselines.length === 0 && loadChanges.length === 0
        ? "Session saved. Nothing dramatic. That’s still training."
        : undefined,
    lowHistoryCopy:
      previousSessions.filter((candidate) => candidate.completedAt).length === 0
        ? "More data needed before stronger recommendations."
        : undefined,
  };
}

export function applyPostWorkoutReviewLoadApprovals(
  session: WorkoutSession,
  review: PostWorkoutReviewViewModel,
  decisions: Record<string, PostWorkoutLoadDecision>,
): WorkoutSession {
  const changeByLogId = new Map(review.loadChanges.map((change) => [change.exerciseLogId, change]));
  return {
    ...session,
    exercises: session.exercises.map((exercise) => {
      const change = changeByLogId.get(exercise.id);
      if (!change) return exercise;
      const decision = decisions[exercise.id] ?? "kept";
      const approval: NextLoadApproval = {
        status: decision,
        recommendedLoad: change.recommendedLoad,
        approvedLoad: decision === "approved" ? change.recommendedLoad : change.currentLoad,
        reason: change.reason,
        reviewedAt: review.completedAt,
      };
      return { ...exercise, nextLoadApproval: approval };
    }),
  };
}

function buildProgressItems(
  session: WorkoutSession,
  previousByExercise: Map<string, PreviousExerciseStats>,
  allPlannedWorkComplete: boolean,
): PostWorkoutProgressItem[] {
  const items: PostWorkoutProgressItem[] = [];
  for (const exercise of session.exercises) {
    const workSets = getWorkSets(exercise.sets);
    if (workSets.length === 0) continue;
    const previous = previousByExercise.get(exercise.exerciseId);
    const bestLoad = Math.max(...workSets.map((set) => set.load));
    const measurementType = exercise.settings.measurementType ?? "reps";
    const bestEstimatedStrength = measurementType === "duration" ? 0 : Math.max(...workSets.map(estimatedStrength));

    if (!previous) {
      items.push({
        id: `${exercise.id}:first`,
        title: "First logged session",
        detail: `${exercise.exerciseName}. Now the app has receipts.`,
      });
      continue;
    }

    if (bestLoad > previous.bestLoad) {
      items.push({
        id: `${exercise.id}:load-pr`,
        title: "New load PR",
        detail: `${exercise.exerciseName}: ${formatLoad(bestLoad, exercise.settings.unit)}.`,
      });
      continue;
    }

    const repPr = workSets.find((set) => set.reps > (previous.bestRepsByLoad.get(set.load) ?? 0));
    if (repPr) {
      const metric = formatMetricValue(repPr.reps, measurementType);
      items.push({
        id: `${exercise.id}:rep-pr`,
        title: measurementType === "duration" ? "Duration PR" : "Rep PR",
        detail: `${exercise.exerciseName}: ${formatLoad(repPr.load, exercise.settings.unit)} x ${metric}.`,
      });
      continue;
    }

    if (measurementType !== "duration" && bestEstimatedStrength > previous.bestEstimatedStrength * 1.015) {
      items.push({
        id: `${exercise.id}:strength-pr`,
        title: "Estimated strength PR",
        detail: `${exercise.exerciseName} moved better than your previous best.`,
      });
    }
  }

  if (allPlannedWorkComplete) {
    const extraSession = session.sessionKind != null && session.sessionKind !== "planned";
    items.push({
      id: `${session.id}:planned-work`,
      title: extraSession ? "All listed work complete" : "All planned work complete",
      detail: extraSession ? "Extra work logged separately. Tidy." : "Tidy.",
    });
  }

  return items.slice(0, 4);
}

function buildLoadChanges(
  session: WorkoutSession,
  currentSummary: ReturnType<typeof summarizeWorkoutSession>,
  history: ReturnType<typeof summarizeWorkoutHistory>,
  previousByExercise: Map<string, PreviousExerciseStats>,
  context: Pick<PostWorkoutReviewOptions, "goal" | "experienceLevel" | "currentBlock" | "isDeload">,
): PostWorkoutLoadChange[] {
  if (!currentSummary) return [];
  if (session.sessionKind != null && session.sessionKind !== "planned") return [];
  const exerciseByLogId = new Map(session.exercises.map((exercise) => [exercise.id, exercise]));
  return currentSummary.exerciseSummaries
    .map((summary) => {
      const exercise = exerciseByLogId.get(summary.exerciseLogId);
      if (!exercise || summary.setsCompleted === 0) return null;
      const currentLoad = exercise.load;
      if (!Number.isFinite(currentLoad) || !Number.isFinite(summary.nextRecommendedLoad)) return null;
      const storedExactTargets = storedExactTargetsForCompletedExercise(session, exercise);
      const metadata = exerciseLibrary.find((candidate) => candidate.id === exercise.exerciseId);
      const exerciseHistory = history
        .filter((candidate) => candidate.sessionId !== session.id)
        .flatMap((candidate) => candidate.exerciseSummaries)
        .filter((candidate) => candidate.exerciseId === exercise.exerciseId);
      const canonicalPrior = resolveCanonicalLoadEvidence(history.filter((candidate) => candidate.sessionId !== session.id), exercise.exerciseId);
      const targetZone = storedExactTargets
        ? null
        : resolveExerciseTargetZone({
            exercise: metadata,
            exerciseId: exercise.exerciseId,
            exerciseRole: metadata?.role,
            exerciseFamily: metadata?.family,
            movementPattern: metadata?.movementPattern,
            block: context.currentBlock,
            lane: exercise.settings.trainingLane,
            repRange: exercise.settings.repRange,
            recentExerciseHistory: canonicalPrior ? [canonicalPrior, ...exerciseHistory.filter((entry) => entry.sessionId !== canonicalPrior.sessionId)] : exerciseHistory,
          });
      const targetZoneEarnedIncrease = storedExactTargets
        ? storedExactTargets.every((target, index) => (getWorkSets(exercise.sets)[index]?.reps ?? 0) >= target)
        : targetZone ? targetZoneEarnsIncrease(exercise, targetZone) : false;
      const targetZoneRecommendedLoad = Number((currentLoad + exercise.settings.loadIncrease).toFixed(2));
      const recommendedLoad = targetZoneEarnedIncrease && summary.nextRecommendedLoad <= currentLoad ? targetZoneRecommendedLoad : summary.nextRecommendedLoad;
      if (!Number.isFinite(recommendedLoad)) return null;
      const rawDirection = recommendedLoad > currentLoad ? "increase" : recommendedLoad < currentLoad ? "decrease" : "hold";
      if (rawDirection === "increase" && manualFinishShouldSuppressLoadIncrease(exercise.finishReason)) return null;
      const firstExposure = !previousByExercise.has(summary.exerciseId);
      const strongFirstBaseline = firstExposure && isStrongFirstBaseline(exercise);
      if (rawDirection === "increase" && firstExposure && !strongFirstBaseline) return null;
      if (rawDirection === "hold") return null;
      const throttle =
        rawDirection === "increase" && !storedExactTargets
          ? resolveProgressionThrottle({
              exerciseRole: metadata?.role,
              exerciseFamily: metadata?.family,
              goal: context.goal,
              experienceLevel: context.experienceLevel,
              currentBlock: context.currentBlock,
              targetRepRange: exercise.settings.repRange,
              recentExercisePerformance: [...exerciseHistory, summary],
              progressionEarned: summary.progressionEarned || targetZoneEarnedIncrease,
              isDeload: context.isDeload ?? context.currentBlock === "deload",
              isExtraSession: session.sessionKind != null && session.sessionKind !== "planned",
              trainingLane: exercise.settings.trainingLane,
            })
          : null;
      const direction = throttle?.decision === "hold" ? "hold" : rawDirection;
      const nextLoad = direction === "hold" ? currentLoad : recommendedLoad;
      const reason =
        direction === "hold"
          ? throttle?.reason ?? "Hold the weight. Earn cleaner reps first."
          : direction === "increase"
          ? strongFirstBaseline
            ? "Strong first baseline. You can try a small increase next time."
            : targetZoneEarnedIncrease && !summary.progressionEarned
              ? "Target zone owned. A small increase is available."
            : "You earned more weight."
          : summary.notes?.includes("current load is too demanding")
            ? "Repeated decline says this load is too expensive."
            : "Back it down before pushing again.";

      return {
        exerciseLogId: exercise.id,
        exerciseName: exercise.exerciseName,
        currentLoad,
        recommendedLoad: nextLoad,
        unit: exercise.settings.unit,
        direction,
        reason,
        evidence:
          direction === "hold"
            ? throttle?.evidence ?? ["Progression was earned, but the smarter move is to hold."]
            : direction === "increase"
            ? strongFirstBaseline
              ? [
                  "First exposure, so this stays cautious.",
                  `${summary.qualitySets} quality work set(s).`,
                  `Top-end baseline: ${formatMetricValue(summary.bestSetReps, summary.measurementType)}.`,
                ]
              : [
                  `${summary.qualitySets} quality work set(s).`,
                  `Best set: ${formatMetricValue(summary.bestSetReps, summary.measurementType)}.`,
                  ...(targetZoneEarnedIncrease && targetZone ? [`Target zone: ${targetZoneLabel(targetZone.targetZone)} ${summary.measurementType === "duration" ? "sec" : "reps"}.`] : []),
                ]
            : [summary.notes ?? "Recent work-set performance declined.", `${summary.setsCompleted} work set(s) logged.`],
      } satisfies PostWorkoutLoadChange;
    })
    .filter((change): change is PostWorkoutLoadChange => Boolean(change));
}

function isStrongFirstBaseline(exercise: WorkoutExerciseLog): boolean {
  if (exercise.finishedManually && manualFinishShouldSuppressLoadIncrease(exercise.finishReason)) return false;
  if (exercise.status === "shutdown") return false;
  if (!Number.isFinite(exercise.load) || exercise.load <= 0) return false;

  const workSets = getWorkSets(exercise.sets);
  const requiredSets = getRequiredSets(exercise.settings);
  if (exercise.prescribedSetTargets?.length) {
    return workSets.length >= requiredSets && exercise.prescribedSetTargets.every((target, index) => (workSets[index]?.reps ?? 0) >= target);
  }
  const topEndSets = workSets.filter((set) => set.reps >= exercise.settings.repRange.max);
  return workSets.length >= requiredSets && topEndSets.length >= Math.max(2, requiredSets);
}

function storedExactTargetsForCompletedExercise(session: WorkoutSession, exercise: WorkoutExerciseLog): number[] | null {
  if (session.sessionKind !== "planned") return null;
  const workSets = getWorkSets(exercise.sets);
  const targets = exercise.prescribedSetTargets;
  if (!targets?.length || targets.length !== workSets.length) return null;
  return targets;
}

function targetZoneEarnsIncrease(
  exercise: WorkoutExerciseLog,
  targetZone: ReturnType<typeof resolveExerciseTargetZone>,
): boolean {
  if (targetZone.state === "insufficient_data" || targetZone.state === "balanced_default") return false;
  if (targetZone.confidence === "insufficient_data" || targetZone.evidenceQuality === "biased_low_only" || targetZone.evidenceQuality === "biased_high_only") return false;
  if (exercise.status === "shutdown") return false;
  if (exercise.finishedManually && manualFinishShouldSuppressLoadIncrease(exercise.finishReason)) return false;
  if (!Number.isFinite(exercise.load) || exercise.load <= 0) return false;

  const workSets = getWorkSets(exercise.sets);
  const requiredSets = getRequiredSets(exercise.settings);
  if (exercise.prescribedSetTargets?.length) {
    return workSets.length >= requiredSets && exercise.prescribedSetTargets.every((target, index) => (workSets[index]?.reps ?? 0) >= target);
  }
  const targetWorkSets = workSets.filter((set) => set.reps >= targetZone.targetZone.min && set.reps <= exercise.settings.repRange.max);
  const topTargetSets = workSets.filter((set) => set.reps >= targetZone.targetZone.max && set.reps <= exercise.settings.repRange.max);

  return targetWorkSets.length >= requiredSets && topTargetSets.length >= Math.max(1, requiredSets - 1);
}

interface PreviousExerciseStats {
  bestLoad: number;
  bestEstimatedStrength: number;
  bestRepsByLoad: Map<number, number>;
}

function buildPreviousExerciseStats(sessions: WorkoutSession[]): Map<string, PreviousExerciseStats> {
  const stats = new Map<string, PreviousExerciseStats>();
  for (const session of sessions) {
    if (!session.completedAt) continue;
    for (const exercise of session.exercises) {
      const workSets = getWorkSets(exercise.sets);
      if (workSets.length === 0) continue;
      const current =
        stats.get(exercise.exerciseId) ?? { bestLoad: 0, bestEstimatedStrength: 0, bestRepsByLoad: new Map<number, number>() };
      for (const set of workSets) {
        current.bestLoad = Math.max(current.bestLoad, set.load);
        current.bestEstimatedStrength = Math.max(current.bestEstimatedStrength, estimatedStrength(set));
        current.bestRepsByLoad.set(set.load, Math.max(current.bestRepsByLoad.get(set.load) ?? 0, set.reps));
      }
      stats.set(exercise.exerciseId, current);
    }
  }
  return stats;
}

function estimatedStrength(set: Pick<SetLog, "load" | "reps">): number {
  if (!Number.isFinite(set.load) || !Number.isFinite(set.reps)) return 0;
  return set.load * (1 + set.reps / 30);
}

function isExerciseWorkCompleteForReview(exercise: WorkoutExerciseLog): boolean {
  if (exercise.status === "complete" || exercise.status === "shutdown" || exercise.status === "swapped") return true;
  return getWorkSets(exercise.sets).length >= getRequiredSets(exercise.settings);
}

function formatLoad(load: number, unit: string): string {
  return `${Number.isInteger(load) ? load : load.toFixed(1)}${unit}`;
}
