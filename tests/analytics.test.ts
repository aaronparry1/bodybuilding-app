import { describe, expect, it } from "vitest";
import type { WorkoutHistorySummary } from "@/domain/training/models";
import {
  buildAnalyticsDashboard,
  calculateEstimatedVolumeLoad,
  calculateExerciseFrequency,
  calculateProgrammeAdherence,
  calculateSetsPerMuscleGroup,
  calculateWeeklyTrainingVolume,
  getExerciseAnalytics,
} from "@/domain/training/analytics";
import { exerciseLibrary } from "@/domain/training/presets";

const referenceDate = new Date("2026-06-03T12:00:00.000Z");

const history: WorkoutHistorySummary[] = [
  {
    sessionId: "session-1",
    sessionName: "Upper A",
    startedAt: "2026-06-01T10:00:00.000Z",
    completedAt: "2026-06-01T11:00:00.000Z",
    durationMinutes: 60,
    exercisesCompleted: 2,
    setsCompleted: 6,
    repsCompleted: 66,
    totalLoadVolume: 6000,
    progressionHighlights: ["Bench Press -> 102.5kg"],
    exerciseSummaries: [
      {
        sessionId: "session-1",
        sessionName: "Upper A",
        completedAt: "2026-06-01T11:00:00.000Z",
        exerciseLogId: "bench-1",
        exerciseId: "ex-bench-press",
        exerciseName: "Bench Press",
        load: 100,
        unit: "kg",
        setsCompleted: 3,
        repsCompleted: 33,
        qualitySets: 3,
        bestSetReps: 12,
        dropOffThreshold: 15,
        stoppedByDropOff: false,
        progressionEarned: true,
        nextRecommendedLoad: 102.5,
        volumeLoad: 3300,
      },
      {
        sessionId: "session-1",
        sessionName: "Upper A",
        completedAt: "2026-06-01T11:00:00.000Z",
        exerciseLogId: "row-1",
        exerciseId: "ex-chest-supported-row",
        exerciseName: "Chest Supported Row",
        load: 80,
        unit: "kg",
        setsCompleted: 3,
        repsCompleted: 33,
        qualitySets: 3,
        bestSetReps: 12,
        dropOffThreshold: 15,
        stoppedByDropOff: false,
        progressionEarned: false,
        nextRecommendedLoad: 80,
        volumeLoad: 2700,
      },
    ],
  },
  {
    sessionId: "session-2",
    sessionName: "Upper B",
    startedAt: "2026-06-03T10:00:00.000Z",
    completedAt: "2026-06-03T11:00:00.000Z",
    durationMinutes: 60,
    exercisesCompleted: 1,
    setsCompleted: 3,
    repsCompleted: 30,
    totalLoadVolume: 3000,
    progressionHighlights: [],
    exerciseSummaries: [
      {
        sessionId: "session-2",
        sessionName: "Upper B",
        completedAt: "2026-06-03T11:00:00.000Z",
        exerciseLogId: "bench-2",
        exerciseId: "ex-bench-press",
        exerciseName: "Bench Press",
        load: 102.5,
        unit: "kg",
        setsCompleted: 3,
        repsCompleted: 30,
        qualitySets: 3,
        bestSetReps: 10,
        dropOffThreshold: 15,
        stoppedByDropOff: false,
        progressionEarned: false,
        nextRecommendedLoad: 102.5,
        volumeLoad: 3075,
      },
    ],
  },
];

describe("analytics utilities", () => {
  it("calculates weekly volume and estimated volume load", () => {
    expect(calculateWeeklyTrainingVolume(history, referenceDate)).toBe(9);
    expect(calculateEstimatedVolumeLoad(history)).toBe(9000);
  });

  it("calculates muscle group sets from exercise metadata", () => {
    const volumes = calculateSetsPerMuscleGroup(history, exerciseLibrary, referenceDate);
    expect(volumes.find((volume) => volume.muscleGroup === "chest")?.sets).toBe(6);
    expect(volumes.find((volume) => volume.muscleGroup === "hamstrings")?.status).toBe("undertrained");
  });

  it("calculates exercise frequency and exercise analytics", () => {
    expect(calculateExerciseFrequency(history)["ex-bench-press"]).toBe(2);
    const bench = getExerciseAnalytics(history, "ex-bench-press");
    expect(bench?.loadTrend).toEqual([100, 102.5]);
    expect(bench?.bestSetTrend).toEqual([12, 10]);
    expect(bench?.progressionRate).toBe(0.5);
  });

  it("builds dashboard insights and adherence", () => {
    const dashboard = buildAnalyticsDashboard(history, exerciseLibrary, 4, referenceDate);
    expect(calculateProgrammeAdherence(history, 4, referenceDate)).toBe(0.5);
    expect(dashboard.missedSessions).toBe(2);
    expect(dashboard.recentPrs).toHaveLength(1);
    expect(dashboard.musclesUndertrainedThisWeek.length).toBeGreaterThan(0);
    expect(dashboard.insights.length).toBeGreaterThan(0);
  });
});
