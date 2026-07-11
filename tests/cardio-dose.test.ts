import { describe, expect, it } from "vitest";
import { resolveCardioDose } from "@/domain/training/cardio-dose";
import type { WorkoutHistorySummary } from "@/domain/training/models";

describe("cardio dose progression", () => {
  it("suppresses user-facing dose suggestions when cardio is off", () => {
    const result = resolveCardioDose({
      goal: "build_muscle",
      recoveryCardioPreference: "off",
      currentWeeklyCardioSessions: [],
    });

    expect(result.progressionAction).toBe("pause");
    expect(result.recommendedWeeklyFrequency.max).toBe(0);
  });

  it("keeps minimal mode quiet unless recovery evidence is clear", () => {
    const result = resolveCardioDose({
      goal: "build_strength",
      recoveryCardioPreference: "minimal",
      currentWeeklyCardioSessions: [],
    });

    expect(result.progressionAction).toBe("hold");
    expect(result.recommendedWeeklyFrequency.max).toBeLessThanOrEqual(1);
  });

  it("starts low for muscle-building users", () => {
    const result = resolveCardioDose({
      goal: "build_muscle",
      recoveryCardioPreference: "recommended",
      currentWeeklyCardioSessions: [],
    });

    expect(result.suggestedSessionType).toBe("recovery_cardio");
    expect(result.progressionAction).toBe("start");
    expect(result.recommendedWeeklyFrequency.max).toBe(2);
    expect(result.recommendedDurationRange.max).toBe(20);
  });

  it("progresses duration before frequency", () => {
    const result = resolveCardioDose({
      goal: "build_muscle_and_strength",
      recoveryCardioPreference: "recommended",
      currentWeeklyCardioSessions: [cardio(1, 20), cardio(2, 20)],
    });

    expect(result.progressionAction).toBe("add_duration");
    expect(result.reason).toContain("duration before");
  });

  it("allows more conditioning for athletic performance", () => {
    const result = resolveCardioDose({
      goal: "athletic_performance",
      recoveryCardioPreference: "recommended",
      currentWeeklyCardioSessions: [cardio(1, 30), cardio(2, 30), cardio(3, 30)],
    });

    expect(result.suggestedSessionType).toBe("performance_conditioning");
    expect(result.recommendedWeeklyFrequency.max).toBeGreaterThanOrEqual(4);
  });

  it("reduces hard conditioning during taper or peak contexts", () => {
    const result = resolveCardioDose({
      goal: "powerlifting_meet",
      recoveryCardioPreference: "recommended",
      eventTaperPhase: "event_week",
      currentWeeklyCardioSessions: [cardio(1, 25, "performance_conditioning", "hard")],
    });

    expect(result.suggestedSessionType).toBe("recovery_cardio");
    expect(result.progressionAction).toBe("reduce");
    expect(result.recommendedIntensityCategory).toBe("easy");
  });

  it("holds or reduces dose when excessive hard cardio is already adding systemic cost", () => {
    const result = resolveCardioDose({
      goal: "build_strength",
      recoveryCardioPreference: "recommended",
      currentWeeklyCardioSessions: [
        cardio(1, 25, "capacity_cardio", "hard"),
        cardio(2, 20, "performance_conditioning", "hard"),
      ],
      recentLiftingFatigueClassification: {
        classification: "systemic",
        severity: "high",
        confidence: "high",
        evidence: ["Repeated hard cardio and lifting decline."],
        recommendedResponse: "Hold broad progression.",
        affectedExerciseIds: [],
        affectedMuscles: [],
      },
    });

    expect(result.suggestedSessionType).toBe("recovery_cardio");
    expect(result.progressionAction).toBe("reduce");
    expect(result.evidence.join(" ")).toContain("hard cardio");
  });
});

function cardio(
  index: number,
  durationMinutes: number,
  sessionType: WorkoutHistorySummary["sessionKind"] = "recovery_cardio",
  perceivedEase: "easy" | "moderate" | "hard" = "easy",
): WorkoutHistorySummary {
  return {
    sessionId: `cardio-${index}`,
    sessionKind: sessionType,
    sessionName: "Recovery Cardio",
    startedAt: `2026-06-${String(index).padStart(2, "0")}T10:00:00.000Z`,
    completedAt: `2026-06-${String(index).padStart(2, "0")}T10:20:00.000Z`,
    durationMinutes,
    exercisesCompleted: 0,
    setsCompleted: 0,
    repsCompleted: 0,
    totalLoadVolume: 0,
    progressionHighlights: [],
    exerciseSummaries: [],
    cardioLog: {
      sessionType: sessionType === "performance_conditioning" ? "performance_conditioning" : sessionType === "capacity_cardio" ? "capacity_cardio" : "recovery_cardio",
      modality: "bike",
      durationMinutes,
      perceivedEase,
      loggedAt: `2026-06-${String(index).padStart(2, "0")}T10:20:00.000Z`,
    },
  };
}
