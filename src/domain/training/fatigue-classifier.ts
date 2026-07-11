import type { Exercise, ExerciseHistorySummary, MuscleGroup, WorkoutHistorySummary } from "@/domain/training/models";
import type { PersonalisedVolumeResult } from "@/domain/training/personalised-volume";
import type { TrainingGapStatus } from "@/domain/training/training-gap-adjustment";
import type { BlockType } from "@/domain/training/annual-models";
import type { TrainingSetupGoal } from "@/domain/training/plan-setup";
import { classifyShutdownEvidence, shutdownEvidenceCounts, type ShutdownEvidenceClassification } from "@/domain/training/fatigue-evidence";

export type FatigueClassification = "exercise_specific" | "muscle_local" | "systemic" | "mixed" | "insufficient_data";
export type FatigueSeverity = "low" | "moderate" | "high";
export type FatigueConfidence = "low" | "medium" | "high" | "insufficient_data";
export type FatigueThrottleOutcome = "push" | "hold" | "pull_back";

export interface FatigueClassifierInput {
  workoutHistory: WorkoutHistorySummary[];
  exercises: Exercise[];
  exerciseTrends?: ExerciseHistorySummary[];
  muscleVolumeSignals?: PersonalisedVolumeResult[];
  shutdownDropOffHistory?: ExerciseHistorySummary[];
  progressionThrottleOutcomes?: FatigueThrottleOutcome[];
  extraSessionWorkload?: number;
  trainingGapStatus?: TrainingGapStatus;
  deloadActive?: boolean;
  block?: BlockType;
  goal?: TrainingSetupGoal;
}

export interface FatigueClassifierResult {
  classification: FatigueClassification;
  severity: FatigueSeverity;
  confidence: FatigueConfidence;
  evidence: string[];
  recommendedResponse: string;
  affectedExerciseIds: string[];
  affectedMuscles: MuscleGroup[];
}

interface DeclineSignal {
  exerciseId: string;
  exerciseName: string;
  muscles: MuscleGroup[];
  unrelatedKey: string;
  shutdowns: number;
}

export function classifyFatigue(input: FatigueClassifierInput): FatigueClassifierResult {
  const completed = input.workoutHistory
    .filter((session) => Boolean(session.completedAt))
    .sort((a, b) => new Date(a.completedAt).getTime() - new Date(b.completedAt).getTime());
  const exerciseById = new Map(input.exercises.map((exercise) => [exercise.id, exercise]));
  const entries = (input.exerciseTrends?.length ? input.exerciseTrends : completed.flatMap((session) => session.exerciseSummaries))
    .filter((entry) => entry.setsCompleted > 0)
    .sort((a, b) => new Date(a.completedAt ?? "").getTime() - new Date(b.completedAt ?? "").getTime());
  const extraWorkload = input.extraSessionWorkload ?? estimateExtraWorkload(completed);

  if (completed.length < 3 || entries.length < 4) {
    if (completed.length >= 3 && extraWorkload >= 3) {
      return {
        classification: "systemic",
        severity: extraWorkload >= 4 ? "high" : "moderate",
        confidence: "medium",
        evidence: [`${extraWorkload} extra-session workload point${extraWorkload === 1 ? "" : "s"} counted.`, "Repeated hard cardio or extra sessions are real systemic workload."],
        recommendedResponse: responseFor("systemic", extraWorkload >= 4 ? "high" : "moderate"),
        affectedExerciseIds: [],
        affectedMuscles: [],
      };
    }
    return {
      classification: "insufficient_data",
      severity: "low",
      confidence: "insufficient_data",
      evidence: [`${completed.length} completed workout(s), ${entries.length} work-set exercise entr${entries.length === 1 ? "y" : "ies"}.`],
      recommendedResponse: "Keep collecting completed work. The app is smart, not psychic.",
      affectedExerciseIds: [],
      affectedMuscles: [],
    };
  }

  const declineSignals = exerciseDeclineSignals(entries, exerciseById);
  const localMuscles = localMuscleSignals(declineSignals, input.muscleVolumeSignals);
  const shutdownEntries = input.shutdownDropOffHistory ?? entries.filter((entry) => entry.stoppedByDropOff);
  const entriesByExercise = groupEntries(entries);
  const shutdownEvidence = shutdownEvidenceCounts(shutdownEntries, input.exercises, { block: input.block, goal: input.goal });
  const regressiveShutdownEntries = shutdownEntries.filter((entry) => {
    const evidence = classifyShutdownEvidence(entry, exerciseById.get(entry.exerciseId), {
      block: input.block,
      goal: input.goal,
      recentEntries: entriesByExercise.get(entry.exerciseId) ?? [],
    });
    return evidence.classification === "regressive_shutdown" || evidence.classification === "systemic_fatigue";
  });
  const recentSessions = completed.slice(-5);
  const sessionsWithShutdown = recentSessions.filter((session) =>
    session.exerciseSummaries.some((entry) => {
      if (!entry.stoppedByDropOff) return false;
      const evidence = classifyShutdownEvidence(entry, exerciseById.get(entry.exerciseId), {
        block: input.block,
        goal: input.goal,
        recentEntries: entriesByExercise.get(entry.exerciseId) ?? [],
      });
      return evidence.classification === "regressive_shutdown" || evidence.classification === "systemic_fatigue";
    }),
  ).length;
  const unrelatedDeclines = new Set(declineSignals.map((signal) => signal.unrelatedKey)).size;
  const holdOrPullRate = rate(input.progressionThrottleOutcomes ?? [], (outcome) => outcome === "hold" || outcome === "pull_back");
  const systemicSignal =
    unrelatedDeclines >= 3 ||
    sessionsWithShutdown >= 3 ||
    regressiveShutdownEntries.length >= 4 ||
    extraWorkload >= 3 ||
    holdOrPullRate >= 0.6 ||
    input.trainingGapStatus === "extended_gap";
  const localSignal = localMuscles.length > 0;
  const exerciseOnlySignal = declineSignals.length === 1 && !localSignal && !systemicSignal;
  const mixedSignal = systemicSignal && (localSignal || declineSignals.length > 0);

  const classification: FatigueClassification = input.deloadActive
    ? "systemic"
    : mixedSignal
      ? "mixed"
      : systemicSignal
        ? "systemic"
        : localSignal
          ? "muscle_local"
          : exerciseOnlySignal
            ? "exercise_specific"
            : declineSignals.length > 0
              ? "exercise_specific"
              : "insufficient_data";

  if (classification === "insufficient_data") {
    const productiveEvidence = [
      (shutdownEvidence.productive_shutdown ?? 0) > 0 ? `${shutdownEvidence.productive_shutdown} productive shutdown(s): hard work was capped after useful work.` : null,
      (shutdownEvidence.expected_local_fatigue ?? 0) > 0 ? `${shutdownEvidence.expected_local_fatigue} expected local fatigue signal(s) after target work.` : null,
    ].filter((item): item is string => Boolean(item));
    return {
      classification,
      severity: "low",
      confidence: "low",
      evidence: ["No repeated objective fatigue pattern yet.", `${completed.length} completed workouts analysed.`, ...productiveEvidence].slice(0, 5),
      recommendedResponse: "Hold major conclusions. Let the next sessions add signal.",
      affectedExerciseIds: [],
      affectedMuscles: [],
    };
  }

  const affectedExerciseIds = unique(declineSignals.map((signal) => signal.exerciseId));
  const affectedMuscles = uniqueMuscles(localMuscles.length > 0 ? localMuscles : declineSignals.flatMap((signal) => signal.muscles));
  const severity = severityFor({ classification, declineSignals, localMuscles, sessionsWithShutdown, extraWorkload, deloadActive: input.deloadActive });
  const confidence = confidenceFor({ completedCount: completed.length, declineCount: declineSignals.length, localCount: localMuscles.length, classification, severity });

  return {
    classification,
    severity,
    confidence,
    evidence: buildEvidence({
      classification,
      severity,
      completedCount: completed.length,
      declineSignals,
      localMuscles,
      sessionsWithShutdown,
      extraWorkload,
      holdOrPullRate,
      deloadActive: input.deloadActive,
      shutdownEvidence,
    }),
    recommendedResponse: responseFor(classification, severity),
    affectedExerciseIds,
    affectedMuscles,
  };
}

function estimateExtraWorkload(completed: WorkoutHistorySummary[]): number {
  return completed
    .filter((session) => session.sessionKind && session.sessionKind !== "planned")
    .reduce((sum, session) => {
      if (!session.cardioLog) return sum + 1;
      if (session.cardioLog.sessionType === "recovery_cardio" && session.cardioLog.perceivedEase !== "hard") return sum;
      if (session.cardioLog.sessionType === "capacity_cardio" || session.cardioLog.perceivedEase === "hard") return sum + 1;
      if (session.cardioLog.sessionType === "performance_conditioning") return sum + 2;
      return sum;
    }, 0);
}

function exerciseDeclineSignals(entries: ExerciseHistorySummary[], exerciseById: Map<string, Exercise>): DeclineSignal[] {
  const byExercise = new Map<string, ExerciseHistorySummary[]>();
  for (const entry of entries) {
    byExercise.set(entry.exerciseId, [...(byExercise.get(entry.exerciseId) ?? []), entry]);
  }

  const signals: DeclineSignal[] = [];
  for (const [exerciseId, exerciseEntries] of byExercise) {
    const recent = exerciseEntries.slice(-4);
    if (recent.length < 3) continue;
    const shutdowns = recent.filter((entry) => {
      const evidence = classifyShutdownEvidence(entry, exerciseById.get(entry.exerciseId), { recentEntries: exerciseEntries });
      return evidence.classification === "regressive_shutdown" || evidence.classification === "systemic_fatigue";
    }).length;
    const qualityDecline = strictlyDeclining(recent.map((entry) => entry.qualitySets));
    const repsDecline = strictlyDeclining(recent.map((entry) => entry.bestSetReps));
    const repeatedUnderperformance = shutdowns >= 2 || qualityDecline || repsDecline;
    if (!repeatedUnderperformance) continue;
    const exercise = exerciseById.get(exerciseId);
    const muscles = exercise?.primaryMuscles.length ? exercise.primaryMuscles : [];
    signals.push({
      exerciseId,
      exerciseName: recent.at(-1)?.exerciseName ?? exercise?.name ?? exerciseId,
      muscles,
      unrelatedKey: exercise?.family ?? muscles[0] ?? exerciseId,
      shutdowns,
    });
  }
  return signals;
}

function localMuscleSignals(declineSignals: DeclineSignal[], volumeSignals: PersonalisedVolumeResult[] | undefined): MuscleGroup[] {
  const counts = new Map<MuscleGroup, number>();
  for (const signal of declineSignals) {
    for (const muscle of signal.muscles) counts.set(muscle, (counts.get(muscle) ?? 0) + 1);
  }
  const highCostMuscles = new Set(
    (volumeSignals ?? [])
      .filter((signal) => signal.status === "high_cost" || signal.status === "overreaching" || signal.recommendedLadderAction === "lower_range" || signal.recommendedLadderAction === "remove_or_swap_exercise")
      .map((signal) => signal.muscleGroup),
  );
  return [...counts.entries()]
    .filter(([muscle, count]) => count >= 2 || (count >= 1 && highCostMuscles.has(muscle)))
    .map(([muscle]) => muscle);
}

function severityFor(input: {
  classification: FatigueClassification;
  declineSignals: DeclineSignal[];
  localMuscles: MuscleGroup[];
  sessionsWithShutdown: number;
  extraWorkload: number;
  deloadActive?: boolean;
}): FatigueSeverity {
  if (input.deloadActive) return "high";
  if (input.classification === "systemic" || input.classification === "mixed") {
    if (input.sessionsWithShutdown >= 3 || input.extraWorkload >= 4 || input.declineSignals.length >= 4 || (input.declineSignals.length >= 3 && input.sessionsWithShutdown >= 2)) return "high";
    return "moderate";
  }
  if (input.classification === "muscle_local") {
    if (input.localMuscles.length >= 2 || input.declineSignals.length >= 3) return "high";
    return "moderate";
  }
  return input.declineSignals.some((signal) => signal.shutdowns >= 2) ? "moderate" : "low";
}

function confidenceFor(input: {
  completedCount: number;
  declineCount: number;
  localCount: number;
  classification: FatigueClassification;
  severity: FatigueSeverity;
}): FatigueConfidence {
  if (input.completedCount < 3) return "insufficient_data";
  if (input.classification === "systemic" || input.classification === "mixed") return input.severity === "high" ? "high" : "medium";
  if (input.classification === "muscle_local") return input.localCount >= 1 && input.declineCount >= 2 ? "high" : "medium";
  if (input.classification === "exercise_specific") return input.declineCount >= 1 ? "medium" : "low";
  return "low";
}

function buildEvidence(input: {
  classification: FatigueClassification;
  severity: FatigueSeverity;
  completedCount: number;
  declineSignals: DeclineSignal[];
  localMuscles: MuscleGroup[];
  sessionsWithShutdown: number;
  extraWorkload: number;
  holdOrPullRate: number;
  deloadActive?: boolean;
  shutdownEvidence?: Record<ShutdownEvidenceClassification, number>;
}): string[] {
  return [
    `${input.completedCount} completed workouts analysed.`,
    input.declineSignals.length > 0 ? `${input.declineSignals.length} declining exercise pattern(s): ${input.declineSignals.map((signal) => signal.exerciseName).slice(0, 3).join(", ")}.` : null,
    input.localMuscles.length > 0 ? `Local muscle signal: ${input.localMuscles.map((muscle) => muscle.replaceAll("_", " ")).join(", ")}.` : null,
    input.sessionsWithShutdown > 0 ? `${input.sessionsWithShutdown} recent session(s) include regressive shutdown/drop-off.` : null,
    (input.shutdownEvidence?.productive_shutdown ?? 0) > 0 ? `${input.shutdownEvidence?.productive_shutdown} productive shutdown(s): hard work was capped after useful work.` : null,
    (input.shutdownEvidence?.expected_local_fatigue ?? 0) > 0 ? `${input.shutdownEvidence?.expected_local_fatigue} expected local fatigue signal(s) after target work.` : null,
    input.extraWorkload > 0 ? `${input.extraWorkload} extra-session exposure(s) counted as workload.` : null,
    input.holdOrPullRate > 0 ? `${Math.round(input.holdOrPullRate * 100)}% recent throttle outcomes were hold/pull back.` : null,
    input.deloadActive ? "Deload state is active." : null,
    `Classification: ${input.classification.replaceAll("_", " ")} (${input.severity}).`,
  ].filter((item): item is string => Boolean(item)).slice(0, 7);
}

function responseFor(classification: FatigueClassification, severity: FatigueSeverity): string {
  if (classification === "exercise_specific") return severity === "high" ? "Hold or reduce this lift and consider a close variation. Do not deload the whole plan from one lift." : "Hold this lift and let the next exposure confirm the trend. Do not deload the whole plan from one lift.";
  if (classification === "muscle_local") return "Reduce local muscle volume or accessories before changing the whole programme.";
  if (classification === "systemic") return "Hold broad progression and consider deload, re-entry, or a calmer week.";
  if (classification === "mixed") return "Address the local problem, but respect the broader fatigue signal too.";
  return "Keep collecting objective training data.";
}

function strictlyDeclining(values: number[]): boolean {
  const clean = values.filter(Number.isFinite);
  return clean.length >= 3 && clean.every((value, index) => index === 0 || value < clean[index - 1]!);
}

function rate<T>(values: T[], predicate: (value: T) => boolean): number {
  if (values.length === 0) return 0;
  return values.filter(predicate).length / values.length;
}

function unique(values: string[]): string[] {
  return [...new Set(values)];
}

function uniqueMuscles(values: MuscleGroup[]): MuscleGroup[] {
  return [...new Set(values)];
}

function groupEntries(entries: ExerciseHistorySummary[]): Map<string, ExerciseHistorySummary[]> {
  const map = new Map<string, ExerciseHistorySummary[]>();
  for (const entry of entries) {
    map.set(entry.exerciseId, [...(map.get(entry.exerciseId) ?? []), entry]);
  }
  return map;
}
