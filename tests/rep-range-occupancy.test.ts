import { describe, expect, it } from "vitest";
import { resolveProgressionThrottle } from "@/domain/training/progression-throttle";
import { resolveRepRangeOccupancy } from "@/domain/training/rep-range-occupancy";
import type { ExerciseHistorySummary, SetLog } from "@/domain/training/models";

describe("rep range occupancy", () => {
  it("returns insufficient data until multiple productive exposures exist", () => {
    const result = resolveRepRangeOccupancy({
      targetRepRange: { min: 8, max: 12 },
      recentExerciseHistory: [entry(1, { repsCompleted: 24, qualitySets: 3 })],
    });

    expect(result.style).toBe("insufficient_data");
    expect(result.confidence).toBe("insufficient_data");
  });

  it("classifies heavy-biased work from the bottom of the range", () => {
    const result = resolveRepRangeOccupancy({
      targetRepRange: { min: 8, max: 12 },
      recentExerciseHistory: [
        entry(1, { repsCompleted: 24, qualitySets: 3, bestSetReps: 8 }),
        entry(2, { repsCompleted: 25, qualitySets: 3, bestSetReps: 9 }),
        entry(3, { repsCompleted: 25, qualitySets: 3, bestSetReps: 9 }),
      ],
    });

    expect(result.style).toBe("heavy_biased");
    expect(result.confidence).toBe("high");
  });

  it("classifies balanced work from the middle of the range", () => {
    const result = resolveRepRangeOccupancy({
      targetRepRange: { min: 8, max: 12 },
      recentExerciseHistory: [
        entry(1, { repsCompleted: 30, qualitySets: 3, bestSetReps: 10 }),
        entry(2, { repsCompleted: 31, qualitySets: 3, bestSetReps: 11 }),
        entry(3, { repsCompleted: 29, qualitySets: 3, bestSetReps: 10 }),
      ],
    });

    expect(result.style).toBe("balanced");
  });

  it("classifies volume-biased work from the top of the range", () => {
    const result = resolveRepRangeOccupancy({
      targetRepRange: { min: 8, max: 12 },
      recentExerciseHistory: [
        entry(1, { repsCompleted: 35, qualitySets: 3, bestSetReps: 12 }),
        entry(2, { repsCompleted: 36, qualitySets: 3, bestSetReps: 12 }),
        entry(3, { repsCompleted: 35, qualitySets: 3, bestSetReps: 12 }),
      ],
    });

    expect(result.style).toBe("volume_biased");
  });

  it("excludes warm-ups when raw set data is supplied", () => {
    const result = resolveRepRangeOccupancy({
      targetRepRange: { min: 8, max: 12 },
      completedProductiveWorkSets: [
        set("warm-1", 20, "warmup"),
        set("work-1", 8, "work"),
        set("work-2", 8, "work"),
        set("work-3", 9, "work"),
      ],
    });

    expect(result.productiveSets).toBe(3);
    expect(result.style).toBe("insufficient_data");
    expect(result.evidence.join(" ")).toContain("Need at least 2 exposures");
  });

  it("keeps classification exercise-specific", () => {
    const bench = resolveRepRangeOccupancy({
      exerciseId: "bench",
      targetRepRange: { min: 8, max: 12 },
      recentExerciseHistory: [
        entry(1, { exerciseId: "bench", repsCompleted: 24, qualitySets: 3 }),
        entry(2, { exerciseId: "bench", repsCompleted: 25, qualitySets: 3 }),
        entry(3, { exerciseId: "bench", repsCompleted: 25, qualitySets: 3 }),
        entry(1, { exerciseId: "lateral-raise", repsCompleted: 36, qualitySets: 3 }),
      ],
    });
    const lateralRaise = resolveRepRangeOccupancy({
      exerciseId: "lateral-raise",
      targetRepRange: { min: 12, max: 20 },
      recentExerciseHistory: [
        entry(1, { exerciseId: "bench", repsCompleted: 24, qualitySets: 3 }),
        entry(1, { exerciseId: "lateral-raise", repsCompleted: 58, qualitySets: 3 }),
        entry(2, { exerciseId: "lateral-raise", repsCompleted: 57, qualitySets: 3 }),
        entry(3, { exerciseId: "lateral-raise", repsCompleted: 60, qualitySets: 3 }),
      ],
    });

    expect(bench.style).toBe("heavy_biased");
    expect(lateralRaise.style).toBe("volume_biased");
  });

  it("allows stable heavy-biased progression without RPE or RIR inputs", () => {
    const decision = resolveProgressionThrottle({
      exerciseRole: "primary_compound",
      exerciseFamily: "horizontal_press",
      goal: "build_strength",
      experienceLevel: "intermediate",
      currentBlock: "strength",
      targetRepRange: { min: 3, max: 5 },
      progressionEarned: false,
      recentExercisePerformance: [
        entry(1, { repsCompleted: 9, qualitySets: 3, bestSetReps: 3 }),
        entry(2, { repsCompleted: 10, qualitySets: 3, bestSetReps: 4 }),
        entry(3, { repsCompleted: 10, qualitySets: 3, bestSetReps: 4 }),
      ],
    });

    expect(decision.decision).toBe("push");
    expect([decision.reason, ...decision.evidence].join(" ")).not.toMatch(/\bRPE\b|\bRIR\b/i);
  });

  it("lets fatigue override heavy-biased occupancy", () => {
    const decision = resolveProgressionThrottle({
      exerciseRole: "primary_compound",
      exerciseFamily: "horizontal_press",
      goal: "build_strength",
      experienceLevel: "intermediate",
      currentBlock: "strength",
      targetRepRange: { min: 3, max: 5 },
      progressionEarned: false,
      recentVolumeFatigueSignal: "high",
      recentExercisePerformance: [
        entry(1, { repsCompleted: 9, qualitySets: 3, bestSetReps: 3 }),
        entry(2, { repsCompleted: 10, qualitySets: 3, bestSetReps: 4 }),
        entry(3, { repsCompleted: 10, qualitySets: 3, bestSetReps: 4 }),
      ],
    });

    expect(decision.decision).toBe("hold");
  });

  it("still rewards top-of-range muscle-building progress", () => {
    const decision = resolveProgressionThrottle({
      exerciseRole: "isolation",
      exerciseFamily: "shoulder_isolation",
      goal: "build_muscle",
      experienceLevel: "intermediate",
      currentBlock: "hypertrophy",
      targetRepRange: { min: 12, max: 20 },
      progressionEarned: true,
      recentExercisePerformance: [
        entry(1, { repsCompleted: 56, qualitySets: 3, bestSetReps: 19 }),
        entry(2, { repsCompleted: 58, qualitySets: 3, bestSetReps: 20 }),
        entry(3, { repsCompleted: 60, qualitySets: 3, bestSetReps: 20 }),
      ],
    });

    expect(decision.decision).toBe("push");
  });
});

function set(id: string, reps: number, type: NonNullable<SetLog["type"]>): SetLog {
  return {
    id,
    setNumber: 1,
    reps,
    load: 100,
    loggedAt: "2026-05-01T12:00:00.000Z",
    type,
  };
}

function entry(index: number, patch: Partial<ExerciseHistorySummary> = {}): ExerciseHistorySummary {
  return {
    sessionId: `session-${index}`,
    sessionName: "Training",
    completedAt: `2026-05-${String(index).padStart(2, "0")}T12:00:00.000Z`,
    exerciseLogId: `log-${index}-${patch.exerciseId ?? "bench"}`,
    exerciseId: "bench",
    exerciseName: "Bench Press",
    load: 100,
    unit: "kg",
    setsCompleted: 3,
    repsCompleted: 30,
    qualitySets: 3,
    bestSetReps: 10,
    dropOffThreshold: 15,
    stoppedByDropOff: false,
    progressionEarned: false,
    nextRecommendedLoad: 100,
    volumeLoad: 3000,
    ...patch,
  };
}
