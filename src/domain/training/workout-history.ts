import type { Equipment, ExerciseHistorySummary, SwappedExerciseRecord, WorkoutExerciseLog, WorkoutHistorySummary, WorkoutSession } from "@/domain/training/models";
import {
  calculateNextSessionLoadAfterInSessionEscalation,
  calculateNextSessionStartingLoadFromProductiveSets,
  recommendLoadAfterClearRepRangeMiss,
  recommendLoadRegression,
} from "@/domain/training/load-selection";
import { evaluateExerciseProgression } from "@/domain/training/progression-engine";
import { exerciseLibrary } from "@/domain/training/presets";
import { manualExerciseFinishLabel } from "@/domain/training/workout-exercise-state";
import { getWorkSets } from "@/domain/training/workout-sets";
import { resolveCanonicalLoadEvidence } from "@/domain/training/load-evidence-resolver";

export interface WorkoutHistoryFilters {
  exerciseId?: string;
  programmeId?: string;
  fromDate?: string;
  toDate?: string;
}

export function calculateDurationMinutes(startedAt: string, completedAt: string): number {
  const durationMs = new Date(completedAt).getTime() - new Date(startedAt).getTime();
  if (!Number.isFinite(durationMs) || durationMs <= 0) return 0;
  return Math.max(1, Math.round(durationMs / 60000));
}

export function summarizeWorkoutSession(session: WorkoutSession): WorkoutHistorySummary | null {
  if (!session.completedAt) return null;

  const exerciseSummaries: ExerciseHistorySummary[] = session.cardioLog
    ? []
    : session.exercises
        .flatMap((exercise) => [
          ...(exercise.swapHistory ?? []).map((swapped) => summarizeExerciseLike(session, swapped, exercise)),
          exercise.sets.length > 0 ? summarizeExerciseLike(session, exercise) : null,
        ])
        .filter((summary): summary is ExerciseHistorySummary => Boolean(summary));

  const progressionHighlights = exerciseSummaries
    .filter((exercise) => exercise.progressionEarned)
    .map((exercise) => `${exercise.exerciseName} -> ${exercise.nextRecommendedLoad}${exercise.unit}`);

  return {
    sessionId: session.id,
    userId: session.userId,
    programmeId: session.programmeId,
    programmeDayId: session.templateId,
    planSessionIndex: session.planSessionIndex,
    planMesocycleId: session.planMesocycleId,
    planMicrocycleNumber: session.planMicrocycleNumber,
    planBlockId: session.planBlockId,
    planWeekNumber: session.planWeekNumber,
    sessionKind: session.sessionKind,
    sessionName: session.name,
    startedAt: session.startedAt,
    completedAt: session.completedAt,
    durationMinutes: calculateDurationMinutes(session.startedAt, session.completedAt),
    exercisesCompleted: exerciseSummaries.length,
    setsCompleted: exerciseSummaries.reduce((sum, exercise) => sum + exercise.setsCompleted, 0),
    repsCompleted: exerciseSummaries.reduce((sum, exercise) => sum + exercise.repsCompleted, 0),
    totalLoadVolume: exerciseSummaries.reduce((sum, exercise) => sum + exercise.volumeLoad, 0),
    progressionHighlights,
    exerciseSummaries,
    cardioLog: session.cardioLog,
    notes: session.notes,
  };
}

function summarizeExerciseLike(
  session: WorkoutSession,
  exercise: WorkoutExerciseLog | SwappedExerciseRecord,
  replacement?: WorkoutExerciseLog,
): ExerciseHistorySummary {
  const workSets = getWorkSets(exercise.sets);
  const countsAsPlannedProgressionEvidence = session.sessionKind == null || session.sessionKind === "planned";
  const storedExactTargets = storedExactTargetsForSummary(session, exercise, workSets.length);
  const hasStoredExactTargets = storedExactTargets != null;
  const progression = evaluateExerciseProgression({
    exerciseName: exercise.exerciseName,
    currentLoad: exercise.load,
    settings: exercise.settings,
    sets: workSets,
    prescribedSetTargets: hasStoredExactTargets ? storedExactTargets : undefined,
  });
  const clearMissRecommendation = countsAsPlannedProgressionEvidence && !hasStoredExactTargets
    ? recommendLoadAfterClearRepRangeMiss({
        sets: exercise.sets,
        settings: exercise.settings,
        currentLoad: exercise.load,
        loadIncrement: exercise.settings.loadIncrease,
      })
    : null;
  const averagedProductiveLoad = calculateNextSessionStartingLoadFromProductiveSets(
    exercise.sets,
    exercise.settings,
    progression.nextLoad,
  );
  const nextRecommendedLoad = !countsAsPlannedProgressionEvidence
    ? exercise.load
    : clearMissRecommendation?.action === "reduce"
      ? clearMissRecommendation.load
      : progression.shouldIncreaseLoad
        ? calculateNextSessionLoadAfterInSessionEscalation({
            sets: exercise.sets,
            settings: exercise.settings,
            currentLoad: exercise.load,
            progressionNextLoad: Math.max(progression.nextLoad, averagedProductiveLoad),
          })
        : averagedProductiveLoad;
  const loadApproval = exercise.nextLoadApproval;
  const approvedNextRecommendedLoad = loadApproval?.approvedLoad ?? nextRecommendedLoad;
  const manualFinishLabel = "finishedManually" in exercise ? manualExerciseFinishLabel(exercise) : null;
  const repsCompleted = workSets.reduce((sum, set) => sum + set.reps, 0);
  const totalLoad = workSets.reduce((sum, set) => sum + set.load * set.reps, 0);
  const metadata = exerciseLibrary.find((candidate) => candidate.id === exercise.exerciseId);
  const measurementType = exercise.settings.measurementType ?? metadata?.measurementType ?? "reps";
  const exerciseDefaultIncrement = metadata?.defaultLoadJump;
  const loadIncrement = exercise.settings.loadIncrease;

  return {
    sessionId: session.id,
    sessionName: session.name,
    completedAt: session.completedAt,
    exerciseLogId: "id" in exercise ? exercise.id : `${session.id}-${exercise.exerciseId}-swapped`,
    exerciseId: exercise.exerciseId,
    exerciseName: exercise.exerciseName,
    load: exercise.load,
    unit: exercise.settings.unit,
    measurementType,
    prescribedSetTargets: storedExactTargets ? [...storedExactTargets] : undefined,
    prescriptionSource: hasStoredExactTargets ? "stored_exact" : "compatibility",
    repRange: exercise.settings.repRange,
    setsCompleted: workSets.length,
    repsCompleted,
    qualitySets: storedExactTargets
      ? workSets.filter((set, index) => set.reps >= (storedExactTargets[index] ?? Number.POSITIVE_INFINITY)).length
      : progression.completedAcceptableSets,
    bestSetReps: progression.bestSetReps,
    dropOffThreshold: exercise.settings.dropOffPercent,
    stoppedByDropOff: exercise.status === "shutdown" || progression.shouldShutdown,
    progressionEarned: countsAsPlannedProgressionEvidence && progression.shouldIncreaseLoad && (!("finishedManually" in exercise) || !exercise.finishedManually || exercise.finishReason === "completed_enough" || exercise.finishReason === "out_of_time"),
    nextRecommendedLoad: approvedNextRecommendedLoad,
    trainingLane: exercise.settings.trainingLane,
    nextLoadApprovalStatus: loadApproval?.status,
    volumeLoad: totalLoad,
    loadIncrement,
    loadIncrementSource:
      Number.isFinite(exerciseDefaultIncrement) && exerciseDefaultIncrement === loadIncrement
        ? "exercise_override"
        : Number.isFinite(loadIncrement)
          ? "session_settings"
          : "fallback",
    equipment: metadata?.equipment,
    equipmentSignature: formatEquipmentSignature(metadata?.equipment ?? []),
    swappedFromExerciseId: replacement || !("swappedFromExerciseId" in exercise) ? undefined : exercise.swappedFromExerciseId,
    swappedFromExerciseName: replacement || !("swappedFromExerciseName" in exercise) ? undefined : exercise.swappedFromExerciseName,
    swappedToExerciseId: replacement?.exerciseId ?? exercise.swappedToExerciseId,
    swappedToExerciseName: replacement?.exerciseName ?? exercise.swappedToExerciseName,
    addedDuringWorkout: !replacement && "origin" in exercise && exercise.origin === "added_during_workout",
    finishedManually: "finishedManually" in exercise ? exercise.finishedManually : undefined,
    finishReason: "finishReason" in exercise ? exercise.finishReason : undefined,
    finishType: "finishType" in exercise ? exercise.finishType : undefined,
    notes: replacement ? exercise.notes : clearMissRecommendation?.action === "reduce" ? clearMissRecommendation.message : manualFinishLabel ?? ("shutdownReason" in exercise ? exercise.shutdownReason : exercise.notes),
  };
}

function storedExactTargetsForSummary(
  session: WorkoutSession,
  exercise: WorkoutExerciseLog | SwappedExerciseRecord,
  workSetCount: number,
): number[] | null {
  if (session.sessionKind !== "planned" || !("prescribedSetTargets" in exercise)) return null;
  const targets = exercise.prescribedSetTargets;
  return targets && targets.length > 0 && targets.length === workSetCount ? targets : null;
}

function formatEquipmentSignature(equipment: Equipment[]): string {
  return [...new Set(equipment)].sort().join("|");
}

export function summarizeWorkoutHistory(sessions: WorkoutSession[]): WorkoutHistorySummary[] {
  const summaries = sessions
    .map(summarizeWorkoutSession)
    .filter((summary): summary is WorkoutHistorySummary => Boolean(summary))
    .sort((a, b) => new Date(a.completedAt).getTime() - new Date(b.completedAt).getTime());

  return applyLoadRegressionRecommendations(summaries).sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime());
}

function applyLoadRegressionRecommendations(summaries: WorkoutHistorySummary[]): WorkoutHistorySummary[] {
  const entriesByExercise = new Map<string, ExerciseHistorySummary[]>();
  for (const summary of summaries) {
    for (const exercise of summary.exerciseSummaries) {
      entriesByExercise.set(exercise.exerciseId, [...(entriesByExercise.get(exercise.exerciseId) ?? []), exercise]);
    }
  }

  const reducedLoads = new Map<string, ExerciseHistorySummary>();
  for (const entries of entriesByExercise.values()) {
    const sorted = [...entries].sort((a, b) => new Date(a.completedAt ?? "").getTime() - new Date(b.completedAt ?? "").getTime());
    for (let index = 0; index < sorted.length; index += 1) {
      const current = sorted[index]!;
      if (current.nextLoadApprovalStatus) continue;
      const recommendation = recommendLoadRegression(sorted.slice(0, index + 1), inferHistoryLoadIncrement(current));
      if (recommendation.action !== "reduce" || recommendation.load == null) continue;
      reducedLoads.set(historyEntryKey(current), {
        ...current,
        nextRecommendedLoad: recommendation.load,
        notes: [current.notes, recommendation.message].filter(Boolean).join(" "),
      });
    }
  }

  if (reducedLoads.size === 0) return summaries;

  return summaries.map((summary) => ({
    ...summary,
    exerciseSummaries: summary.exerciseSummaries.map((exercise) => reducedLoads.get(historyEntryKey(exercise)) ?? exercise),
  }));
}

function historyEntryKey(entry: ExerciseHistorySummary): string {
  return `${entry.sessionId ?? "unknown"}:${entry.exerciseLogId}`;
}

function inferHistoryLoadIncrement(entry: ExerciseHistorySummary): number {
  if (entry.loadIncrement && Number.isFinite(entry.loadIncrement) && entry.loadIncrement > 0) return entry.loadIncrement;
  return entry.unit === "lb" ? 5 : 2.5;
}

export function filterWorkoutHistory(
  summaries: WorkoutHistorySummary[],
  filters: WorkoutHistoryFilters,
): WorkoutHistorySummary[] {
  return summaries.filter((summary) => {
    const matchesExercise =
      !filters.exerciseId || summary.exerciseSummaries.some((exercise) => exercise.exerciseId === filters.exerciseId);
    const matchesProgramme = !filters.programmeId || summary.programmeId === filters.programmeId;
    const completedTime = new Date(summary.completedAt).getTime();
    const matchesFrom = !filters.fromDate || completedTime >= new Date(filters.fromDate).getTime();
    const matchesTo = !filters.toDate || completedTime <= new Date(filters.toDate).getTime();

    return matchesExercise && matchesProgramme && matchesFrom && matchesTo;
  });
}

export function getExerciseHistory(sessions: WorkoutSession[], exerciseId: string): ExerciseHistorySummary[] {
  return summarizeWorkoutHistory(sessions)
    .flatMap((summary) =>
      summary.exerciseSummaries
        .filter((exercise) => exercise.exerciseId === exerciseId)
        .map((exercise) => ({ ...exercise, notes: exercise.notes ?? summary.notes })),
    )
    .sort((a, b) => new Date(b.completedAt ?? "").getTime() - new Date(a.completedAt ?? "").getTime());
}

export function getLastExercisePerformance(sessions: WorkoutSession[], currentSessionId: string, exerciseId: string) {
  return resolveCanonicalLoadEvidence(summarizeWorkoutHistory(sessions).filter((summary) => summary.sessionId !== currentSessionId), exerciseId);
}
