import { describe, expect, it } from "vitest";
import type { BlockType } from "@/domain/training/annual-models";
import type { ExerciseHistorySummary, MuscleGroup, WorkoutHistorySummary } from "@/domain/training/models";
import { exerciseLibrary } from "@/domain/training/presets";
import {
  adaptHistoryToStrategicSignals,
  calculateBlockReadiness,
  calculateTrainingMomentum,
  createCoachingBlock,
  createCoachingPlan,
  recommendStrategicAction,
  type CoachingBlock,
  type PlanningMode,
  type StrategicRecommendation,
} from "@/domain/training/strategic-coaching";

const strategicExercises = exerciseLibrary.filter((exercise) =>
  ["ex-bench-press", "ex-chest-supported-row", "ex-squat", "ex-romanian-deadlift", "ex-lateral-raise"].includes(exercise.id),
);

function exerciseEntry(
  index: number,
  exerciseId: string,
  patch: Partial<ExerciseHistorySummary> = {},
): ExerciseHistorySummary {
  const exercise = exerciseLibrary.find((candidate) => candidate.id === exerciseId) ?? exerciseLibrary[0];
  const reps = patch.repsCompleted ?? 30;
  const load = patch.load ?? 100;

  return {
    sessionId: `session-${index}`,
    sessionName: `Session ${index}`,
    completedAt: `2026-06-${String(Math.min(index, 28)).padStart(2, "0")}T10:00:00.000Z`,
    exerciseLogId: `${exerciseId}-${index}`,
    exerciseId,
    exerciseName: exercise.name,
    load,
    unit: "kg",
    setsCompleted: patch.setsCompleted ?? 3,
    repsCompleted: reps,
    qualitySets: patch.qualitySets ?? 3,
    bestSetReps: patch.bestSetReps ?? 10,
    dropOffThreshold: 15,
    stoppedByDropOff: patch.stoppedByDropOff ?? false,
    progressionEarned: patch.progressionEarned ?? false,
    nextRecommendedLoad: patch.nextRecommendedLoad ?? load,
    volumeLoad: load * reps,
    ...patch,
  };
}

function session(index: number, entries: ExerciseHistorySummary[], completedAt?: string): WorkoutHistorySummary {
  return {
    sessionId: `session-${index}`,
    sessionName: `Session ${index}`,
    startedAt: completedAt ?? `2026-06-${String(Math.min(index, 28)).padStart(2, "0")}T09:00:00.000Z`,
    completedAt: completedAt ?? `2026-06-${String(Math.min(index, 28)).padStart(2, "0")}T10:00:00.000Z`,
    durationMinutes: 60,
    exercisesCompleted: entries.length,
    setsCompleted: entries.reduce((sum, entry) => sum + entry.setsCompleted, 0),
    repsCompleted: entries.reduce((sum, entry) => sum + entry.repsCompleted, 0),
    totalLoadVolume: entries.reduce((sum, entry) => sum + entry.volumeLoad, 0),
    progressionHighlights: entries.filter((entry) => entry.progressionEarned).map((entry) => `${entry.exerciseName} -> ${entry.nextRecommendedLoad}${entry.unit}`),
    exerciseSummaries: entries,
  };
}

function strongHistory(): WorkoutHistorySummary[] {
  return Array.from({ length: 8 }, (_, index) => {
    const qualitySets = index < 4 ? 3 : 5;
    return session(index + 1, [
      exerciseEntry(index + 1, "ex-bench-press", {
        qualitySets,
        setsCompleted: qualitySets,
        bestSetReps: 10 + Math.min(index, 4),
        progressionEarned: index >= 3,
        nextRecommendedLoad: 102.5 + index * 2.5,
      }),
      exerciseEntry(index + 1, "ex-chest-supported-row", {
        qualitySets,
        setsCompleted: qualitySets,
        bestSetReps: 10 + Math.min(index, 3),
        progressionEarned: index >= 4,
      }),
    ]);
  });
}

function fatiguedHistory(): WorkoutHistorySummary[] {
  return Array.from({ length: 8 }, (_, index) => {
    const qualitySets = index < 4 ? 5 : 2;
    return session(index + 1, [
      exerciseEntry(index + 1, "ex-bench-press", {
        qualitySets,
        setsCompleted: qualitySets,
        bestSetReps: 12 - Math.min(index, 5),
        stoppedByDropOff: index >= 4,
      }),
      exerciseEntry(index + 1, "ex-squat", {
        qualitySets,
        setsCompleted: qualitySets,
        bestSetReps: 12 - Math.min(index, 4),
        stoppedByDropOff: index >= 5,
      }),
    ]);
  });
}

describe("strategic coaching engine", () => {
  it("creates plans for guided annual, event, single block, and custom users", () => {
    const guided = createCoachingPlan({ mode: "guided_annual", goal: { type: "muscle_gain" }, createdAt: "2026-01-01T00:00:00.000Z" });
    const meet = createCoachingPlan({ mode: "goal_event", goal: { type: "powerlifting_meet", targetDate: "2026-06-01" }, createdAt: "2026-01-01T00:00:00.000Z" });
    const single = createCoachingPlan({ mode: "single_block", goal: { type: "muscle_gain" }, createdAt: "2026-01-01T00:00:00.000Z" });
    const custom = createCoachingPlan({
      mode: "custom_sequence",
      goal: { type: "custom" },
      blocks: [createCoachingBlock("hypertrophy", 0), createCoachingBlock("strength", 1)],
      createdAt: "2026-01-01T00:00:00.000Z",
    });

    expect(guided.blocks.map((block) => block.type)).toEqual(["hypertrophy", "powerbuilding", "strength", "power", "peak"]);
    expect(meet.blocks.map((block) => block.type)).toEqual(["powerbuilding", "strength", "peak"]);
    expect(single.blocks.map((block) => block.type)).toEqual(["hypertrophy"]);
    expect(custom.blocks.map((block) => block.type)).toEqual(["hypertrophy", "strength"]);
  });

  it("adapts workout history into strategic signals", () => {
    const signals = adaptHistoryToStrategicSignals(strongHistory(), exerciseLibrary);

    expect(signals.progressionRate).toBeGreaterThan(0.35);
    expect(signals.qualitySetTrend).toBe("rising");
    expect(signals.volumeTolerance).toBe("rising");
    expect(signals.fatigueTrend).toBe("low");
    expect(signals.progressingMuscles).toEqual(expect.arrayContaining(["chest", "back"]));
  });

  it("calculates readiness and momentum without subjective effort data", () => {
    const strongSignals = adaptHistoryToStrategicSignals(strongHistory(), exerciseLibrary);
    const tiredSignals = adaptHistoryToStrategicSignals(fatiguedHistory(), exerciseLibrary);
    const strongReadiness = calculateBlockReadiness(strongSignals);
    const tiredReadiness = calculateBlockReadiness(tiredSignals);

    expect(strongReadiness.score).toBeGreaterThanOrEqual(85);
    expect(strongReadiness.band).toBe("ready");
    expect(calculateTrainingMomentum(strongSignals).band).toBe("Strong");
    expect(tiredReadiness.score).toBeLessThan(40);
    expect(tiredReadiness.band).toBe("deload_or_adjust");
    expect(calculateTrainingMomentum(tiredSignals).band).toBe("Declining");
  });

  it("recommends advancing, continuing, deloading, and repeating based on mode", () => {
    const ready = calculateBlockReadiness(adaptHistoryToStrategicSignals(strongHistory(), exerciseLibrary));
    const tired = calculateBlockReadiness(adaptHistoryToStrategicSignals(fatiguedHistory(), exerciseLibrary));
    const steady = calculateBlockReadiness({
      ...adaptHistoryToStrategicSignals(strongHistory().slice(0, 3), exerciseLibrary),
      progressionRate: 0.25,
      qualitySetTrend: "flat",
      fatigueTrend: "low",
      volumeTolerance: "stable",
    });
    const block = createCoachingBlock("hypertrophy", 0, { currentWeek: 6, minWeeks: 4, maxWeeks: 8 });

    expect(recommendStrategicAction({ currentBlock: block, planningMode: "guided_annual", readiness: ready }).outcome).toBe("advance_block");
    expect(recommendStrategicAction({ currentBlock: block, planningMode: "guided_annual", readiness: steady }).outcome).toBe("continue_block");
    expect(recommendStrategicAction({ currentBlock: block, planningMode: "guided_annual", readiness: tired }).outcome).toBe("deload_then_continue");
    expect(recommendStrategicAction({ currentBlock: block, planningMode: "single_block", readiness: ready }).outcome).toBe("repeat_block");
  });

  it("suppresses deload when evidence is too thin", () => {
    const thinSignals = {
      ...adaptHistoryToStrategicSignals(fatiguedHistory().slice(0, 1), exerciseLibrary),
      fatigueTrend: "high" as const,
      qualitySetTrend: "falling" as const,
      exercisePerformanceTrend: "falling" as const,
      sessionsAnalyzed: 1,
      exerciseEntriesAnalyzed: 2,
    };
    const readiness = calculateBlockReadiness(thinSignals);
    const block = createCoachingBlock("hypertrophy", 0, { currentWeek: 5, minWeeks: 4, maxWeeks: 8 });
    const recommendation = recommendStrategicAction({ currentBlock: block, planningMode: "guided_annual", readiness, goal: "build_muscle" });

    expect(recommendation.outcome).toBe("continue_block");
    expect(recommendation.confidence).toBe("low");
    expect(recommendation.message).toContain("not psychic");
  });

  it("uses goal-specific recommendation priorities from the same data", () => {
    const lowFatigueFlatProgress = calculateBlockReadiness({
      ...adaptHistoryToStrategicSignals(strongHistory(), exerciseLibrary),
      progressionRate: 0.05,
      qualitySetTrend: "flat",
      fatigueTrend: "low",
      volumeTolerance: "stable",
      undertrainedMuscles: ["chest"],
      sessionsAnalyzed: 6,
      exerciseEntriesAnalyzed: 12,
    });
    const block = createCoachingBlock("hypertrophy", 0, { currentWeek: 3, minWeeks: 4, maxWeeks: 8 });

    const muscle = recommendStrategicAction({ currentBlock: block, planningMode: "guided_annual", readiness: lowFatigueFlatProgress, goal: "build_muscle" });
    const strength = recommendStrategicAction({ currentBlock: block, planningMode: "guided_annual", readiness: lowFatigueFlatProgress, goal: "build_strength" });

    expect(muscle.outcome).toBe("increase_volume");
    expect(muscle.successModelGoal).toBe("build_muscle");
    expect(strength.outcome).toBe("continue_block");
    expect(strength.successModelGoal).toBe("build_strength");
  });
});

describe("strategic coaching simulations", () => {
  it("runs 50 fake users through 12 months of strategic recommendations", () => {
    const users = Array.from({ length: 50 }, (_, userIndex) => simulateUser(userIndex));
    const recommendations = users.map((user) => user.recommendation.outcome);

    expect(users).toHaveLength(50);
    expect(recommendations).toContain("advance_block");
    expect(recommendations).toContain("repeat_block");
    expect(recommendations).toContain("deload_then_continue");
    expect(recommendations).toContain("continue_block");
    expect(users.every((user) => user.readiness.score >= 0 && user.readiness.score <= 100)).toBe(true);
    expect(users.every((user) => user.momentum.score >= 0 && user.momentum.score <= 100)).toBe(true);

    const strong = users.find((user) => user.profile === "strong" && user.mode !== "single_block");
    const declining = users.find((user) => user.profile === "declining");
    const singleBlock = users.find((user) => user.mode === "single_block" && user.readiness.score >= 85);

    expect(strong?.recommendation.outcome).toBe("advance_block");
    expect(declining?.recommendation.outcome).toBe("deload_then_continue");
    expect(singleBlock?.recommendation.outcome).toBe("repeat_block");
  });
});

type SimulationProfile = "strong" | "stable" | "slowing" | "declining";

function simulateUser(userIndex: number): {
  profile: SimulationProfile;
  mode: PlanningMode;
  block: CoachingBlock;
  readiness: ReturnType<typeof calculateBlockReadiness>;
  momentum: ReturnType<typeof calculateTrainingMomentum>;
  recommendation: StrategicRecommendation;
} {
  const profile: SimulationProfile = userIndex % 4 === 0 ? "strong" : userIndex % 4 === 1 ? "stable" : userIndex % 4 === 2 ? "slowing" : "declining";
  const mode: PlanningMode = userIndex % 5 === 0 ? "single_block" : userIndex % 5 === 1 ? "goal_event" : userIndex % 5 === 2 ? "custom_sequence" : "guided_annual";
  const blockType: BlockType = (["hypertrophy", "powerbuilding", "strength", "power"] as const)[userIndex % 4];
  const block = createCoachingBlock(blockType, 0, { currentWeek: 6, minWeeks: 4, maxWeeks: 8 });
  const plan = createCoachingPlan({
    mode,
    goal: mode === "goal_event" ? { type: userIndex % 2 === 0 ? "powerlifting_meet" : "holiday", targetDate: "2026-12-01" } : { type: "muscle_gain" },
    blocks: mode === "custom_sequence" ? [block, createCoachingBlock("strength", 1)] : undefined,
    createdAt: `2026-01-${String((userIndex % 28) + 1).padStart(2, "0")}T00:00:00.000Z`,
  });
  const history = simulateYearHistory(userIndex, profile);
  const signals = adaptHistoryToStrategicSignals(history, strategicExercises, { recentSessionWindow: 12 });
  const readiness = calculateBlockReadiness(signals);
  const momentum = calculateTrainingMomentum(signals);
  const recommendation = recommendStrategicAction({ currentBlock: block, planningMode: mode, readiness, plan });

  return { profile, mode, block, readiness, momentum, recommendation };
}

function simulateYearHistory(userIndex: number, profile: SimulationProfile): WorkoutHistorySummary[] {
  const sessions: WorkoutHistorySummary[] = [];
  const exerciseIds = ["ex-bench-press", "ex-chest-supported-row", "ex-squat", "ex-romanian-deadlift", "ex-lateral-raise"];
  const sessionCount = 52;

  for (let week = 0; week < sessionCount; week += 1) {
    const completedAt = new Date("2026-01-01T10:00:00.000Z");
    completedAt.setDate(completedAt.getDate() + week * 7);
    const latePhase = week >= sessionCount - 12;
    const entries = exerciseIds.slice(0, 3).map((exerciseId, exerciseIndex) => {
      const trend = profileTrend(profile, week, sessionCount);
      const qualitySets = Math.max(1, Math.round(3 + trend.qualitySetBonus + (exerciseIndex % 2)));
      const bestSetReps = Math.max(3, Math.round(9 + trend.bestSetBonus - exerciseIndex * 0.4));
      const progressionEarned = trend.progressionChance > ((week + userIndex + exerciseIndex) % 10) / 10;
      const stoppedByDropOff = latePhase && trend.fatigueChance > ((week + userIndex + exerciseIndex * 3) % 10) / 10;
      const load = 80 + exerciseIndex * 20 + Math.max(0, week * trend.loadGain);

      return exerciseEntry(week + 1, exerciseId, {
        load,
        setsCompleted: stoppedByDropOff ? Math.max(1, qualitySets - 2) : qualitySets,
        qualitySets: stoppedByDropOff ? Math.max(1, qualitySets - 2) : qualitySets,
        bestSetReps: stoppedByDropOff ? Math.max(3, bestSetReps - 2) : bestSetReps,
        progressionEarned: stoppedByDropOff ? false : progressionEarned,
        stoppedByDropOff,
        repsCompleted: bestSetReps * qualitySets,
        nextRecommendedLoad: progressionEarned ? load + 2.5 : load,
      });
    });

    sessions.push(session(week + 1, entries, completedAt.toISOString()));
  }

  return sessions;
}

function profileTrend(profile: SimulationProfile, week: number, totalWeeks: number) {
  const progress = week / totalWeeks;
  if (profile === "strong") {
    return {
      qualitySetBonus: progress < 0.75 ? progress * 3 : 2.5,
      bestSetBonus: progress * 4,
      progressionChance: 0.72,
      fatigueChance: 0.05,
      loadGain: 1.2,
    };
  }
  if (profile === "stable") {
    return {
      qualitySetBonus: 0.5,
      bestSetBonus: 1,
      progressionChance: 0.28,
      fatigueChance: 0.08,
      loadGain: 0.35,
    };
  }
  if (profile === "slowing") {
    return {
      qualitySetBonus: progress < 0.65 ? 1 : 0,
      bestSetBonus: progress < 0.65 ? 1.5 : 0.5,
      progressionChance: progress < 0.7 ? 0.35 : 0.12,
      fatigueChance: progress < 0.7 ? 0.1 : 0.18,
      loadGain: 0.25,
    };
  }
  return {
    qualitySetBonus: progress < 0.65 ? 1 : -1.5,
    bestSetBonus: progress < 0.65 ? 1 : -2,
    progressionChance: progress < 0.6 ? 0.2 : 0.02,
    fatigueChance: progress < 0.65 ? 0.1 : 0.9,
    loadGain: 0.1,
  };
}

function _titleMuscle(muscle: MuscleGroup): string {
  return muscle.charAt(0).toUpperCase() + muscle.slice(1);
}
