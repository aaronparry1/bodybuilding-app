import { describe, expect, it } from "vitest";
import { classifyShutdownEvidence, shutdownEvidenceCounts, shutdownRecoveryPressureRate } from "@/domain/training/fatigue-evidence";
import type { ExerciseHistorySummary } from "@/domain/training/models";
import { exerciseLibrary } from "@/domain/training/presets";

const cableFly = exerciseLibrary.find((exercise) => exercise.id === "ex-cable-fly")!;
const bench = exerciseLibrary.find((exercise) => exercise.id === "ex-bench-press")!;

describe("shutdown fatigue evidence", () => {
  it("classifies hypertrophy isolation shutdown after useful target work as productive", () => {
    const history = [
      entry(1, { exerciseId: cableFly.id, exerciseName: cableFly.name, bestSetReps: 16, progressionEarned: true, stoppedByDropOff: true }),
      entry(2, { exerciseId: cableFly.id, exerciseName: cableFly.name, bestSetReps: 18, progressionEarned: true, stoppedByDropOff: true }),
      entry(3, { exerciseId: cableFly.id, exerciseName: cableFly.name, load: 22.5, bestSetReps: 18, progressionEarned: true, stoppedByDropOff: true }),
    ];

    const evidence = classifyShutdownEvidence(history[2]!, cableFly, {
      block: "hypertrophy",
      goal: "build_muscle",
      recentEntries: history,
    });

    expect(evidence.classification).toBe("productive_shutdown");
    expect(evidence.recoveryPressure).toBe(0);
    expect(evidence.reason).toContain("Hard productive work");
  });

  it("does not turn repeated productive shutdowns into systemic pressure by count alone", () => {
    const history = [1, 2, 3, 4].map((index) =>
      entry(index, {
        exerciseId: cableFly.id,
        exerciseName: cableFly.name,
        bestSetReps: 15 + index,
        progressionEarned: true,
        stoppedByDropOff: true,
      }),
    );

    expect(shutdownRecoveryPressureRate(history, exerciseLibrary, { block: "hypertrophy", goal: "build_muscle" })).toBe(0);
    expect(shutdownEvidenceCounts(history, exerciseLibrary, { block: "hypertrophy", goal: "build_muscle" }).productive_shutdown).toBe(4);
  });

  it("classifies primary compound early shutdown as regressive", () => {
    const history = [
      entry(1, { exerciseId: bench.id, exerciseName: bench.name, qualitySets: 3, bestSetReps: 10 }),
      entry(2, { exerciseId: bench.id, exerciseName: bench.name, qualitySets: 2, bestSetReps: 8, stoppedByDropOff: true }),
      entry(3, { exerciseId: bench.id, exerciseName: bench.name, qualitySets: 1, setsCompleted: 1, bestSetReps: 5, stoppedByDropOff: true }),
    ];

    const evidence = classifyShutdownEvidence(history[2]!, bench, {
      block: "strength",
      goal: "build_strength",
      recentEntries: history,
    });

    expect(evidence.classification).toBe("regressive_shutdown");
    expect(evidence.recoveryPressure).toBe(1);
    expect(evidence.reason).toMatch(/before enough useful work|primary lift|falling/i);
  });

  it("treats Power and Peak shutdowns more strictly", () => {
    const powerEvidence = classifyShutdownEvidence(
      entry(1, {
        exerciseId: bench.id,
        exerciseName: bench.name,
        stoppedByDropOff: true,
        qualitySets: 3,
        bestSetReps: 5,
      }),
      bench,
      { block: "peak", goal: "powerlifting_meet" },
    );

    expect(powerEvidence.classification).toBe("regressive_shutdown");
    expect(powerEvidence.reason).toContain("strict output");
  });
});

function entry(index: number, patch: Partial<ExerciseHistorySummary> = {}): ExerciseHistorySummary {
  return {
    sessionId: `session-${index}`,
    sessionName: "Push",
    completedAt: `2026-06-${String(index).padStart(2, "0")}T10:00:00.000Z`,
    exerciseLogId: `log-${index}`,
    exerciseId: "ex-bench-press",
    exerciseName: "Bench Press",
    load: 20,
    unit: "kg",
    setsCompleted: 3,
    repsCompleted: 45,
    qualitySets: 3,
    bestSetReps: 15,
    dropOffThreshold: 15,
    stoppedByDropOff: false,
    progressionEarned: false,
    nextRecommendedLoad: 20,
    volumeLoad: 900,
    ...patch,
  };
}
