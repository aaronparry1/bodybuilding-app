import { describe, expect, it } from "vitest";
import type { ExerciseHistorySummary, WorkoutHistorySummary } from "@/domain/training/models";
import { exerciseLibrary } from "@/domain/training/presets";
import { buildStrategicCoachingViewModel, titleRecommendation } from "@/domain/training/strategic-coaching-presenter";

function exerciseEntry(index: number, patch: Partial<ExerciseHistorySummary> = {}): ExerciseHistorySummary {
  const completedAt = datedSession(index);
  return {
    sessionId: `session-${index}`,
    sessionName: `Session ${index}`,
    completedAt,
    exerciseLogId: `bench-${index}`,
    exerciseId: "ex-bench-press",
    exerciseName: "Bench Press",
    load: 100 + index * 2.5,
    unit: "kg",
    setsCompleted: patch.setsCompleted ?? 4,
    repsCompleted: patch.repsCompleted ?? 44,
    qualitySets: patch.qualitySets ?? 4,
    bestSetReps: patch.bestSetReps ?? 12,
    dropOffThreshold: 15,
    stoppedByDropOff: patch.stoppedByDropOff ?? false,
    progressionEarned: patch.progressionEarned ?? true,
    nextRecommendedLoad: patch.nextRecommendedLoad ?? 105,
    volumeLoad: patch.volumeLoad ?? 4400,
    ...patch,
  };
}

function workout(index: number, entry: ExerciseHistorySummary): WorkoutHistorySummary {
  const completedAt = datedSession(index);
  return {
    sessionId: `session-${index}`,
    sessionName: `Session ${index}`,
    startedAt: completedAt.replace("T10:00:00.000Z", "T09:00:00.000Z"),
    completedAt,
    durationMinutes: 55,
    exercisesCompleted: 1,
    setsCompleted: entry.setsCompleted,
    repsCompleted: entry.repsCompleted,
    totalLoadVolume: entry.volumeLoad,
    progressionHighlights: entry.progressionEarned ? ["Bench Press -> 105kg"] : [],
    exerciseSummaries: [entry],
  };
}

function datedSession(index: number): string {
  const date = new Date("2026-06-01T10:00:00.000Z");
  date.setDate(date.getDate() + (index - 1) * 7);
  return date.toISOString();
}

describe("strategic coaching presenter", () => {
  it("shows an insufficient-history state before the coach has enough real sessions", () => {
    const viewModel = buildStrategicCoachingViewModel([workout(1, exerciseEntry(1))], exerciseLibrary);

    expect(viewModel.hasEnoughHistory).toBe(false);
    expect(viewModel.emptyMessage).toContain("Log 3-5 completed workouts first");
    expect(viewModel.planningModeLabel).toBe("Guided Annual");
    expect(viewModel.currentBlockLabel).toBe("Hypertrophy");
  });

  it("adapts real completed history into display-ready strategic direction", () => {
    const history = [1, 2, 3, 4].map((index) =>
      workout(
        index,
        exerciseEntry(index, {
          bestSetReps: 10 + index,
          qualitySets: index < 3 ? 3 : 5,
          progressionEarned: index >= 2,
        }),
      ),
    );
    const viewModel = buildStrategicCoachingViewModel(history, exerciseLibrary);

    expect(viewModel.hasEnoughHistory).toBe(true);
    expect(viewModel.readiness?.label).toMatch(/^\d+ - /);
    expect(viewModel.momentum?.band).toBeTruthy();
    expect(viewModel.recommendation?.title).toBeTruthy();
    expect(viewModel.recommendation?.reasons.join(" ")).toContain("Progression");
  });

  it("maps recommendation outcomes to clear copy", () => {
    expect(titleRecommendation("continue_block")).toBe("Continue this block");
    expect(titleRecommendation("deload_then_continue")).toBe("Use a Recovery Window, then continue");
    expect(titleRecommendation("repeat_block")).toBe("Repeat this block");
  });

  it("supports the future single-block mode internally without exposing a full planner UI", () => {
    const history = [1, 2, 3, 4, 5, 6].map((index) =>
      workout(index, exerciseEntry(index, { progressionEarned: true, qualitySets: 5, bestSetReps: 12 + index })),
    );
    const viewModel = buildStrategicCoachingViewModel(history, exerciseLibrary, { planningMode: "single_block" });

    expect(viewModel.planningModeLabel).toBe("Single Block");
    expect(viewModel.currentBlockLabel).toBe("Hypertrophy");
    expect(viewModel.recommendation?.title).toBe("Repeat this block");
  });
});
