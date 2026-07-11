import type { BlockType } from "@/domain/training/annual-models";
import type { Exercise, ExerciseFamily, ExerciseHistorySummary, ExerciseRole } from "@/domain/training/models";
import type { TrainingSetupGoal } from "@/domain/training/plan-setup";

export type ShutdownEvidenceClassification =
  | "productive_shutdown"
  | "expected_local_fatigue"
  | "neutral_shutdown"
  | "regressive_shutdown"
  | "systemic_fatigue";

export interface ShutdownEvidenceContext {
  block?: BlockType;
  goal?: TrainingSetupGoal;
  recentEntries?: ExerciseHistorySummary[];
}

export interface ShutdownEvidenceResult {
  classification: ShutdownEvidenceClassification;
  recoveryPressure: number;
  reason: string;
}

const strictBlocks = new Set<BlockType>(["power", "peak"]);
const hypertrophyTolerantBlocks = new Set<BlockType>(["hypertrophy", "powerbuilding", "strength_hypertrophy"]);
const strictGoals = new Set<TrainingSetupGoal>(["athletic_performance", "powerlifting_meet"]);
const localRoles = new Set<ExerciseRole>(["accessory", "isolation", "corrective", "resilience", "capacity"]);
const primaryRoles = new Set<ExerciseRole>(["primary_compound", "power"]);
const localFamilies = new Set<ExerciseFamily>([
  "chest_isolation",
  "shoulder_isolation",
  "rear_delt_corrective",
  "triceps_isolation",
  "biceps_isolation",
  "calf_raise",
  "core_flexion",
  "core_stability",
  "quad_isolation",
  "hamstring_isolation",
  "glute_isolation",
  "adductor",
  "abductor",
  "forearm",
  "trap",
]);

export function classifyShutdownEvidence(
  entry: ExerciseHistorySummary,
  exercise?: Exercise,
  context: ShutdownEvidenceContext = {},
): ShutdownEvidenceResult {
  if (!entry.stoppedByDropOff) {
    return {
      classification: "neutral_shutdown",
      recoveryPressure: 0,
      reason: "No shutdown/drop-off recorded.",
    };
  }

  if (entry.finishReason === "pain_limitation" || entry.finishReason === "equipment_unavailable") {
    return {
      classification: "neutral_shutdown",
      recoveryPressure: 0,
      reason: "Shutdown was tied to pain/limitation or equipment availability, not performance fatigue.",
    };
  }

  const block = context.block ?? blockFromLane(entry);
  const goal = context.goal;
  const role = exercise?.role;
  const family = exercise?.family;
  const usefulWorkCompleted = completedUsefulWork(entry, exercise);
  const strongWorkCompleted = entry.progressionEarned || entry.qualitySets >= 3;
  const performanceTrend = trendFor(entry, context.recentEntries ?? []);
  const isPrimary = role ? primaryRoles.has(role) : false;
  const isLocal = isLocalDominant(exercise);
  const strictContext = (block && strictBlocks.has(block)) || (goal && strictGoals.has(goal));
  const tolerantContext = block && hypertrophyTolerantBlocks.has(block);
  const earlyShutdown = entry.qualitySets < 2 || entry.setsCompleted < 2;
  const trendDown = performanceTrend === "falling";
  const trendUpOrStable = performanceTrend === "rising" || performanceTrend === "stable" || performanceTrend === "insufficient_data";

  if (strictContext && (isPrimary || earlyShutdown || trendDown)) {
    return {
      classification: "regressive_shutdown",
      recoveryPressure: 1,
      reason: "Shutdown affected a strict output block/goal where speed, specificity, or main-lift readiness matters.",
    };
  }

  if (earlyShutdown || !usefulWorkCompleted) {
    return {
      classification: "regressive_shutdown",
      recoveryPressure: 1,
      reason: "Performance dropped before enough useful work was completed.",
    };
  }

  if (isPrimary && trendDown) {
    return {
      classification: "regressive_shutdown",
      recoveryPressure: 1,
      reason: "A primary lift is trending down with repeated shutdown evidence.",
    };
  }

  if (tolerantContext && isLocal && strongWorkCompleted && trendUpOrStable) {
    return {
      classification: entry.progressionEarned ? "productive_shutdown" : "expected_local_fatigue",
      recoveryPressure: entry.progressionEarned ? 0 : 0.15,
      reason: entry.progressionEarned
        ? "Hard productive work reached useful targets before fatigue built up."
        : "Local fatigue appeared after useful target work in a hypertrophy-tolerant block.",
    };
  }

  if (tolerantContext && !isPrimary && usefulWorkCompleted && trendUpOrStable) {
    return {
      classification: "expected_local_fatigue",
      recoveryPressure: 0.25,
      reason: "Fatigue appeared after useful work on a support exercise.",
    };
  }

  if (trendDown) {
    return {
      classification: "regressive_shutdown",
      recoveryPressure: 1,
      reason: "Shutdown is paired with a falling performance trend.",
    };
  }

  return {
    classification: "neutral_shutdown",
    recoveryPressure: isPrimary ? 0.5 : 0.25,
    reason: "Shutdown was recorded, but broader evidence is not clearly regressive.",
  };
}

export function shutdownRecoveryPressureRate(
  entries: ExerciseHistorySummary[],
  exercises: Exercise[],
  context: Omit<ShutdownEvidenceContext, "recentEntries"> = {},
): number {
  if (entries.length === 0) return 0;
  const exerciseById = new Map(exercises.map((exercise) => [exercise.id, exercise]));
  const entriesByExercise = groupEntries(entries);
  const pressure = entries.reduce((sum, entry) => {
    const evidence = classifyShutdownEvidence(entry, exerciseById.get(entry.exerciseId), {
      ...context,
      recentEntries: entriesByExercise.get(entry.exerciseId) ?? [],
    });
    return sum + evidence.recoveryPressure;
  }, 0);
  return pressure / entries.length;
}

export function shutdownEvidenceCounts(
  entries: ExerciseHistorySummary[],
  exercises: Exercise[],
  context: Omit<ShutdownEvidenceContext, "recentEntries"> = {},
): Record<ShutdownEvidenceClassification, number> {
  const counts: Record<ShutdownEvidenceClassification, number> = {
    productive_shutdown: 0,
    expected_local_fatigue: 0,
    neutral_shutdown: 0,
    regressive_shutdown: 0,
    systemic_fatigue: 0,
  };
  const exerciseById = new Map(exercises.map((exercise) => [exercise.id, exercise]));
  const entriesByExercise = groupEntries(entries);
  for (const entry of entries) {
    const evidence = classifyShutdownEvidence(entry, exerciseById.get(entry.exerciseId), {
      ...context,
      recentEntries: entriesByExercise.get(entry.exerciseId) ?? [],
    });
    counts[evidence.classification] += 1;
  }
  return counts;
}

function completedUsefulWork(entry: ExerciseHistorySummary, exercise?: Exercise): boolean {
  if (entry.progressionEarned) return true;
  if (entry.qualitySets >= 3) return true;
  if (isLocalDominant(exercise) && entry.qualitySets >= 2 && entry.bestSetReps >= 8) return true;
  return false;
}

function isLocalDominant(exercise?: Exercise): boolean {
  if (!exercise) return false;
  if (localRoles.has(exercise.role)) return true;
  if (localFamilies.has(exercise.family)) return true;
  if (exercise.kind === "machine" && exercise.role !== "primary_compound") return true;
  return false;
}

function trendFor(entry: ExerciseHistorySummary, recentEntries: ExerciseHistorySummary[]): "rising" | "stable" | "falling" | "insufficient_data" {
  const sorted = [...recentEntries]
    .filter((candidate) => candidate.exerciseId === entry.exerciseId)
    .sort((a, b) => new Date(a.completedAt ?? "").getTime() - new Date(b.completedAt ?? "").getTime());
  const index = sorted.findIndex((candidate) => candidate.exerciseLogId === entry.exerciseLogId && candidate.sessionId === entry.sessionId);
  const window = (index >= 0 ? sorted.slice(Math.max(0, index - 2), index + 1) : sorted.slice(-3)).filter((candidate) => candidate.setsCompleted > 0);
  if (window.length < 3) return "insufficient_data";
  const first = window[0]!;
  const last = window[window.length - 1]!;
  const loadDelta = last.load - first.load;
  const repsDelta = last.bestSetReps - first.bestSetReps;
  const qualityDelta = last.qualitySets - first.qualitySets;
  if (loadDelta >= 0 && repsDelta >= 0 && qualityDelta >= 0 && (loadDelta > 0 || repsDelta > 0 || qualityDelta > 0 || last.progressionEarned)) return "rising";
  if (loadDelta < 0 || repsDelta < 0 || qualityDelta < 0) return "falling";
  return "stable";
}

function blockFromLane(entry: ExerciseHistorySummary): BlockType | undefined {
  if (entry.trainingLane === "hypertrophy") return "hypertrophy";
  if (entry.trainingLane === "hypertrophy_strength") return "powerbuilding";
  if (entry.trainingLane === "strength" || entry.trainingLane === "strength_support") return "strength";
  if (entry.trainingLane === "power") return "power";
  if (entry.trainingLane === "peak") return "peak";
  if (entry.trainingLane === "recovery") return "deload";
  return undefined;
}

function groupEntries(entries: ExerciseHistorySummary[]): Map<string, ExerciseHistorySummary[]> {
  const map = new Map<string, ExerciseHistorySummary[]>();
  for (const entry of entries) {
    map.set(entry.exerciseId, [...(map.get(entry.exerciseId) ?? []), entry]);
  }
  return map;
}
