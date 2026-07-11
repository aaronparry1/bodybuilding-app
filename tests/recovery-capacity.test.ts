import { beforeEach, describe, expect, it } from "vitest";
import { isRecoveryCapacityIgnoredForWeek, recoveryCapacityIgnoreRepository } from "@/data/local/recovery-capacity-ignore-repository";
import { jsonStore } from "@/data/local/json-store";
import { resolveRecoveryCapacity } from "@/domain/training/recovery-capacity";
import { buildRecoveryCapacityWeeklyTarget, resolveNextLiftingContext } from "@/domain/training/recovery-capacity-delivery";
import { buildCapacityCardioSessionProgramme, buildPerformanceConditioningSessionProgramme, buildRecoveryCardioSessionProgramme } from "@/domain/training/extra-session-generator";
import type { FatigueClassifierResult } from "@/domain/training/fatigue-classifier";
import type { WorkoutHistorySummary, WorkoutSession } from "@/domain/training/models";
import { exerciseLibrary } from "@/domain/training/presets";
import { createActiveTrainingPlan } from "@/domain/training/plan-setup";

describe("recovery and capacity system", () => {
  beforeEach(() => {
    jsonStore.clearByPrefix("iron-logic.recovery-capacity-ignore");
    jsonStore.resetCache();
  });

  it("favours recovery cardio for muscle-building users under high workload", () => {
    const result = resolveRecoveryCapacity({
      goal: "build_muscle",
      recoveryCardioPreference: "recommended",
      weeklyTrainingVolume: 30,
      completedWorkouts: history(4),
    });

    expect(result.recommendation).toBe("recovery_cardio");
    expect(result.message).toContain("easy");
    expect(result.evidence.join(" ")).not.toMatch(/fat.?loss|calorie|heart.?rate|zone/i);
  });

  it("recommends more conditioning for athletic performance when preference allows it", () => {
    const result = resolveRecoveryCapacity({
      goal: "athletic_performance",
      recoveryCardioPreference: "recommended",
      weeklyTrainingVolume: 12,
      completedWorkouts: history(4),
    });

    expect(["capacity_cardio", "performance_conditioning"]).toContain(result.recommendation);
    expect(result.message).toContain("Build your engine");
  });

  it("cardio off suppresses user-facing recommendations without removing recovery status", () => {
    const result = resolveRecoveryCapacity({
      goal: "build_muscle_and_strength",
      recoveryCardioPreference: "off",
      weeklyTrainingVolume: 40,
      fatigueClassification: fatigue("systemic", "high"),
      completedWorkouts: history(5),
    });

    expect(result.recommendation).toBe("none");
    expect(result.recoveryStatus).toBe("under_recovered");
    expect(result.evidence.join(" ")).toContain("suppressed");
  });

  it("minimal mode waits for a clearer signal", () => {
    const result = resolveRecoveryCapacity({
      goal: "build_strength",
      recoveryCardioPreference: "minimal",
      weeklyTrainingVolume: 20,
      completedWorkouts: history(2),
    });

    expect(result.recommendation).toBe("none");
  });

  it("high fatigue can still trigger recovery cardio in minimal mode", () => {
    const result = resolveRecoveryCapacity({
      goal: "build_strength",
      recoveryCardioPreference: "minimal",
      fatigueClassification: fatigue("systemic", "high"),
      completedWorkouts: history(4),
    });

    expect(result.recommendation).toBe("recovery_cardio");
    expect(result.frequencySuggestion).toContain("easy cardio");
  });

  it("recovery and capacity cardio sessions stay extra and separate from planned completion", () => {
    const recovery = buildRecoveryCardioSessionProgramme({ exercises: exerciseLibrary, unit: "kg" });
    const capacity = buildCapacityCardioSessionProgramme({ exercises: exerciseLibrary, unit: "kg" });
    const performance = buildPerformanceConditioningSessionProgramme({ exercises: exerciseLibrary, unit: "kg" });

    expect(recovery.days[0]?.exerciseSlots[0]?.exerciseId).toBe("ex-recovery-cardio");
    expect(capacity.days[0]?.exerciseSlots[0]?.exerciseId).toBe("ex-capacity-cardio");
    expect(performance.days[0]?.exerciseSlots[0]?.exerciseId).toBe("ex-performance-conditioning");
    expect(recovery.notes).toContain("does not complete a planned workout slot");
    expect(capacity.notes).toContain("does not complete a planned workout slot");
    expect(performance.notes).toContain("does not complete a planned workout slot");
  });

  it("builds a weekly Home target when recovery cardio recommendation is useful", () => {
    const target = buildRecoveryCapacityWeeklyTarget({
      activePlan: activePlan("get_leaner"),
      history: history(4),
      exercises: exerciseLibrary,
      date: new Date("2026-06-04T12:00:00.000Z"),
    });

    expect(target?.title).toBe("Recovery & Capacity");
    expect(target?.sessionType).toBe("recovery_cardio");
    expect(target?.targetSessions).toBeGreaterThan(0);
    expect(target?.targetLabel).toContain("Recovery Cardio");
    expect(target?.actionLabel).toBe("Start Recovery Cardio");
    expect(target?.timingGuidance.bestTimingGuidance.length).toBeGreaterThan(0);
    expect(target?.timingGuidance.startMessage).toBeTruthy();
  });

  it("hides the weekly target when Recovery & Cardio is off", () => {
    const target = buildRecoveryCapacityWeeklyTarget({
      activePlan: activePlan("get_leaner", "off"),
      history: history(4),
      exercises: exerciseLibrary,
      date: new Date("2026-06-04T12:00:00.000Z"),
    });

    expect(target).toBeUndefined();
  });

  it("minimal mode only shows weekly target when evidence is meaningful", () => {
    const quiet = buildRecoveryCapacityWeeklyTarget({
      activePlan: activePlan("build_strength", "minimal"),
      history: history(2),
      exercises: exerciseLibrary,
      date: new Date("2026-06-04T12:00:00.000Z"),
    });
    const clear = buildRecoveryCapacityWeeklyTarget({
      activePlan: activePlan("get_leaner", "minimal"),
      history: history(4),
      exercises: exerciseLibrary,
      date: new Date("2026-06-04T12:00:00.000Z"),
    });

    expect(quiet).toBeUndefined();
    expect(clear?.sessionType).toBe("recovery_cardio");
  });

  it("counts current-week cardio logs toward the weekly target", () => {
    const target = buildRecoveryCapacityWeeklyTarget({
      activePlan: activePlan("get_leaner"),
      history: [cardioWorkout(4, "recovery_cardio"), ...history(4)],
      exercises: exerciseLibrary,
      date: new Date("2026-06-04T12:00:00.000Z"),
    });

    expect(target?.completedSessions).toBe(1);
    expect(target?.targetSessions).toBeGreaterThanOrEqual(1);
  });

  it("persists Ignore This Week with week and plan scope", () => {
    recoveryCapacityIgnoreRepository.save({
      ignoredRecoveryCapacityWeekId: "2026-06-01T00:00:00.000Z",
      ignoredAt: "2026-06-04T12:00:00.000Z",
      activePlanId: "plan-one",
      sessionType: "recovery_cardio",
    });

    expect(recoveryCapacityIgnoreRepository.get()).toEqual({
      ignoredRecoveryCapacityWeekId: "2026-06-01T00:00:00.000Z",
      ignoredAt: "2026-06-04T12:00:00.000Z",
      activePlanId: "plan-one",
      sessionType: "recovery_cardio",
    });
  });

  it("resets persisted Ignore This Week next week and keeps plan scope", () => {
    const record = {
      ignoredRecoveryCapacityWeekId: "2026-06-01T00:00:00.000Z",
      ignoredAt: "2026-06-04T12:00:00.000Z",
      activePlanId: "plan-one",
      sessionType: "recovery_cardio" as const,
    };

    expect(isRecoveryCapacityIgnoredForWeek(record, { weekId: "2026-06-01T00:00:00.000Z", activePlanId: "plan-one" })).toBe(true);
    expect(isRecoveryCapacityIgnoredForWeek(record, { weekId: "2026-06-08T00:00:00.000Z", activePlanId: "plan-one" })).toBe(false);
    expect(isRecoveryCapacityIgnoredForWeek(record, { weekId: "2026-06-01T00:00:00.000Z", activePlanId: "plan-two" })).toBe(false);
  });

  it("manual cardio creation remains available after Ignore This Week is persisted", () => {
    recoveryCapacityIgnoreRepository.save({
      ignoredRecoveryCapacityWeekId: "2026-06-01T00:00:00.000Z",
      ignoredAt: "2026-06-04T12:00:00.000Z",
      activePlanId: "plan-one",
      sessionType: "recovery_cardio",
    });

    const programme = buildRecoveryCardioSessionProgramme({ exercises: exerciseLibrary, unit: "kg" });
    expect(programme.name).toBe("Recovery Cardio");
    expect(programme.notes).toContain("does not complete a planned workout slot");
  });

  it("resolves exact next lifting context from active squat, deadlift, and bench workouts", () => {
    expect(resolveNextLiftingContext({ activePlan: activePlan("build_strength"), history: [], exercises: exerciseLibrary, activeWorkout: activeWorkout("ex-barbell-back-squat", "Barbell Back Squat") })).toBe("squat_focused");
    expect(resolveNextLiftingContext({ activePlan: activePlan("build_strength"), history: [], exercises: exerciseLibrary, activeWorkout: activeWorkout("ex-deadlift", "Deadlift") })).toBe("deadlift_focused");
    expect(resolveNextLiftingContext({ activePlan: activePlan("build_strength"), history: [], exercises: exerciseLibrary, activeWorkout: activeWorkout("ex-bench-press", "Bench Press") })).toBe("heavy_upper");
  });

  it("resolves peak/taper/event and unknown next lifting contexts conservatively", () => {
    expect(resolveNextLiftingContext({ activePlan: activePlan("powerlifting_meet"), history: [], exercises: exerciseLibrary, eventTaperPhase: "event_week" })).toBe("event_week");
    expect(resolveNextLiftingContext({ activePlan: activePlan("powerlifting_meet"), history: [], exercises: exerciseLibrary, eventTaperPhase: "taper" })).toBe("peak_or_taper");
    expect(resolveNextLiftingContext({ activePlan: null, history: [], exercises: [] })).toBe("none");
    expect(resolveNextLiftingContext({ activePlan: activePlan("build_strength"), history: [], exercises: [] })).toBe("heavy_upper");
  });
});

function fatigue(classification: FatigueClassifierResult["classification"], severity: FatigueClassifierResult["severity"]): FatigueClassifierResult {
  return {
    classification,
    severity,
    confidence: severity === "high" ? "high" : "medium",
    evidence: ["Fatigue evidence."],
    recommendedResponse: "Hold broad progression.",
    affectedExerciseIds: [],
    affectedMuscles: [],
  };
}

function history(count: number): WorkoutHistorySummary[] {
  return Array.from({ length: count }, (_, index) => ({
    sessionId: `session-${index + 1}`,
    sessionName: "Workout",
    startedAt: `2026-06-${String(index + 1).padStart(2, "0")}T10:00:00.000Z`,
    completedAt: `2026-06-${String(index + 1).padStart(2, "0")}T11:00:00.000Z`,
    durationMinutes: 45,
    exercisesCompleted: 1,
    setsCompleted: 6,
    repsCompleted: 60,
    totalLoadVolume: 3000,
    progressionHighlights: [],
    exerciseSummaries: [],
  }));
}

function cardioWorkout(day: number, sessionType: "recovery_cardio" | "capacity_cardio" | "performance_conditioning"): WorkoutHistorySummary {
  return {
    sessionId: `cardio-${day}`,
    sessionName: "Recovery Cardio",
    sessionKind: sessionType,
    startedAt: `2026-06-${String(day).padStart(2, "0")}T10:00:00.000Z`,
    completedAt: `2026-06-${String(day).padStart(2, "0")}T10:25:00.000Z`,
    durationMinutes: 20,
    exercisesCompleted: 0,
    setsCompleted: 0,
    repsCompleted: 0,
    totalLoadVolume: 0,
    progressionHighlights: [],
    exerciseSummaries: [],
    cardioLog: {
      sessionType,
      modality: "outdoor_walk",
      durationMinutes: 20,
      perceivedEase: "easy",
      loggedAt: `2026-06-${String(day).padStart(2, "0")}T10:25:00.000Z`,
    },
  };
}

function activePlan(goal: Parameters<typeof createActiveTrainingPlan>[0]["goal"], recoveryCardioPreference: "recommended" | "minimal" | "off" = "recommended") {
  return createActiveTrainingPlan(
    {
      goal,
      planningChoice: "recommended_12_month",
      equipmentPreset: "full_gym",
      daysPerWeek: 4,
      preferredSplit: "upper_lower",
      experienceLevel: "intermediate",
      recoveryCardioPreference,
    },
    "2026-06-01T00:00:00.000Z",
  );
}

function activeWorkout(exerciseId: string, exerciseName: string): WorkoutSession {
  return {
    id: `active-${exerciseId}`,
    name: exerciseName,
    startedAt: "2026-06-04T10:00:00.000Z",
    updatedAt: "2026-06-04T10:00:00.000Z",
    syncState: "local",
    sessionKind: "planned",
    exercises: [
      {
        id: `log-${exerciseId}`,
        exerciseId,
        exerciseName,
        load: 100,
        loadKnown: true,
        settings: exerciseLibrary.find((exercise) => exercise.id === exerciseId)?.defaultSettings ?? exerciseLibrary[0]!.defaultSettings,
        sets: [],
        status: "active",
      },
    ],
  };
}
