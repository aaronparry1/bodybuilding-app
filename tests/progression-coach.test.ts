import { describe, expect, it } from "vitest";
import type { ExerciseHistorySummary, WorkoutHistorySummary } from "@/domain/training/models";
import {
  buildHypertrophyCoachReport,
  detectFatigue,
  detectStalledLift,
  recommendPlateauActions,
  recommendVolume,
} from "@/domain/training/progression-coach";
import { exerciseLibrary } from "@/domain/training/presets";

function entry(
  index: number,
  patch: Partial<ExerciseHistorySummary> = {},
): ExerciseHistorySummary {
  return {
    sessionId: `session-${index}`,
    sessionName: `Session ${index}`,
    completedAt: `2026-06-${String(index).padStart(2, "0")}T10:00:00.000Z`,
    exerciseLogId: `bench-${index}`,
    exerciseId: "ex-bench-press",
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

function history(entries: ExerciseHistorySummary[]): WorkoutHistorySummary[] {
  return entries.map((exercise, index) => ({
    sessionId: exercise.sessionId ?? `session-${index}`,
    sessionName: exercise.sessionName ?? `Session ${index}`,
    startedAt: exercise.completedAt ?? "2026-06-01T09:00:00.000Z",
    completedAt: exercise.completedAt ?? "2026-06-01T10:00:00.000Z",
    durationMinutes: 60,
    exercisesCompleted: 1,
    setsCompleted: exercise.setsCompleted,
    repsCompleted: exercise.repsCompleted,
    totalLoadVolume: exercise.load * exercise.repsCompleted,
    progressionHighlights: exercise.progressionEarned ? [`${exercise.exerciseName} -> ${exercise.nextRecommendedLoad}${exercise.unit}`] : [],
    exerciseSummaries: [exercise],
  }));
}

describe("progression coach", () => {
  it("detects 3-session and 5-session stalls from actual progression outcomes", () => {
    const threeSessionStall = detectStalledLift([entry(1, { progressionEarned: true }), entry(2), entry(3), entry(4)]);
    const fiveSessionStall = detectStalledLift([entry(1), entry(2), entry(3), entry(4), entry(5)]);

    expect(threeSessionStall).toMatchObject({
      noProgressionForSessions: 3,
      stalledForThree: true,
      stalledForFive: false,
    });
    expect(fiveSessionStall.stalledForFive).toBe(true);
  });

  it("detects regression trends and fatigue from drop-offs and worsening best sets", () => {
    const entries = [
      entry(1, { bestSetReps: 12, stoppedByDropOff: false, setsCompleted: 4 }),
      entry(2, { bestSetReps: 10, stoppedByDropOff: true, setsCompleted: 3 }),
      entry(3, { bestSetReps: 8, stoppedByDropOff: true, setsCompleted: 2 }),
    ];

    expect(detectStalledLift(entries).regressionTrend).toBe(true);
    expect(detectFatigue(entries)).toMatchObject({
      repeatedEarlyDropOffs: true,
      worseningPerformanceTrend: true,
      decliningVolumeTolerance: true,
    });
  });

  it("recommends plateau actions without RPE or RIR", () => {
    const stall = detectStalledLift([entry(1), entry(2), entry(3), entry(4), entry(5)]);
    const fatigue = detectFatigue([
      entry(1, { stoppedByDropOff: true, bestSetReps: 12 }),
      entry(2, { stoppedByDropOff: true, bestSetReps: 10 }),
      entry(3, { stoppedByDropOff: false, bestSetReps: 8 }),
    ]);

    expect(recommendPlateauActions(stall, fatigue)).toEqual(
      expect.arrayContaining(["hold_load", "reduce_load", "reduce_volume"]),
    );
  });

  it("uses recent performance to add, remove, or maintain volume", () => {
    expect(
      recommendVolume([
        entry(1, { progressionEarned: true, setsCompleted: 3 }),
        entry(2, { progressionEarned: true, setsCompleted: 3 }),
        entry(3, { progressionEarned: false, setsCompleted: 3 }),
      ], detectFatigue([])),
    ).toBe("add_set");

    const fatigued = detectFatigue([
      entry(1, { stoppedByDropOff: true, setsCompleted: 4 }),
      entry(2, { stoppedByDropOff: true, setsCompleted: 3 }),
      entry(3, { stoppedByDropOff: false, setsCompleted: 2 }),
    ]);
    expect(recommendVolume([entry(1), entry(2), entry(3)], fatigued)).toBe("remove_set");
  });

  it("builds exercise and muscle-level coaching recommendations", () => {
    const report = buildHypertrophyCoachReport(
      history([
        entry(1, { progressionEarned: true, nextRecommendedLoad: 102.5, bestSetReps: 12 }),
        entry(2, { load: 102.5, bestSetReps: 11 }),
        entry(3, { load: 102.5, bestSetReps: 10 }),
        entry(4, { load: 102.5, bestSetReps: 9 }),
      ]),
      exerciseLibrary,
    );

    expect(report.exerciseAssessments[0].coachActions).toContain("maintain_load");
    expect(report.exerciseAssessments[0].stall.stalledForThree).toBe(true);
    expect(report.muscleAssessments.find((muscle) => muscle.muscleGroup === "chest")?.exercisesAnalyzed).toBe(1);
    expect(report.coachingSummary[0]).toContain("Bench Press");
  });
});
