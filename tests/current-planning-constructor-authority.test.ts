import { describe, expect, it } from "vitest";
import { defaultAppSettings } from "@/application/settings/app-settings";
import { resolveCurrentPlanningInput } from "@/domain/training/current-planning-input";
import { createActiveTrainingPlan } from "@/domain/training/plan-setup";
import { exerciseLibrary } from "@/domain/training/presets";
import { buildRecoveryWorkoutSession } from "@/domain/training/recovery-workout-constructor";
import { resolveRecommendedSessionIndex } from "@/domain/training/training-session-selection";

function activePlan() {
  return createActiveTrainingPlan({
    goal: "build_strength",
    planningChoice: "recommended_12_month",
    equipmentPreset: "full_gym",
    daysPerWeek: 4,
    preferredSplit: "upper_lower",
    experienceLevel: "intermediate",
  }, "2026-07-11T09:00:00.000Z");
}

function construct(plan: ReturnType<typeof activePlan>) {
  return buildRecoveryWorkoutSession({ id: "session", startedAt: "2026-07-11T09:00:00.000Z", activePlan: plan, appSettings: defaultAppSettings, exercises: exerciseLibrary, history: [], sessionIndex: 0 });
}

describe("current planning constructor authority", () => {
  it("constructs a current plan without a TrainingBlock input", () => {
    const session = construct(activePlan());

    expect(session?.sessionKind).toBe("planned");
    expect(session?.planMesocycleId).toBe("strength_general");
    expect(session?.planMicrocycleNumber).toBe(1);
  });

  it("does not let conflicting legacy blocks override current mesocycle construction", () => {
    const plan = activePlan();
    const conflicting = { ...plan, blocks: plan.blocks.map((block) => ({ ...block, type: "deload" as const })) };

    expect(construct(conflicting)?.exercises[0]?.settings.requiredWorkSets).toBe(4);
  });

  it("returns no planned workout when current authority is incomplete and compatibility cannot apply", () => {
    const plan = { ...activePlan(), currentMesocycleId: undefined };

    expect(resolveCurrentPlanningInput(plan, 0).status).toBe("incomplete");
    expect(construct(plan)).toBeNull();
  });

  it("uses an explicitly labelled compatibility input only for plans without current planning fields", () => {
    const plan = activePlan();
    const legacy = { ...plan, currentMesocycleId: undefined, currentMicrocycle: undefined };
    const resolution = resolveCurrentPlanningInput(legacy, 0);

    expect(resolution.status).toBe("ready");
    if (resolution.status === "ready") expect(resolution.planning.source).toBe("legacy_compatibility");
  });

  it("selects the next planned session from current mesocycle and microcycle metadata, not block identity", () => {
    const plan = activePlan();
    const index = resolveRecommendedSessionIndex({
      activePlan: plan,
      history: [{
        sessionId: "completed-0",
        planSessionIndex: 0,
        planMesocycleId: plan.currentMesocycleId,
        planMicrocycleNumber: plan.currentMicrocycle?.sequenceNumber,
        planBlockId: "conflicting-legacy-block",
        planWeekNumber: 99,
        sessionKind: "planned",
        sessionName: "Bench strength",
        startedAt: "2026-07-11T09:00:00.000Z",
        completedAt: "2026-07-11T10:00:00.000Z",
        durationMinutes: 60,
        exercisesCompleted: 3,
        setsCompleted: 9,
        repsCompleted: 45,
        totalLoadVolume: 1000,
        progressionHighlights: [],
        exerciseSummaries: [],
      }],
    });

    expect(index).toBe(1);
  });

  it("keeps older session summaries behind an explicit compatibility path", () => {
    const plan = activePlan();
    const legacy = { ...plan, currentMicrocycle: undefined };
    const activeBlock = legacy.blocks.find((block) => block.id === legacy.activeBlockId);
    const index = resolveRecommendedSessionIndex({
      activePlan: legacy,
      history: [{
        sessionId: "legacy-completed-0",
        planSessionIndex: 0,
        planBlockId: activeBlock?.id,
        planWeekNumber: activeBlock?.currentWeek,
        sessionKind: "planned",
        sessionName: "Upper",
        startedAt: "2026-07-11T09:00:00.000Z",
        completedAt: "2026-07-11T10:00:00.000Z",
        durationMinutes: 60,
        exercisesCompleted: 3,
        setsCompleted: 9,
        repsCompleted: 45,
        totalLoadVolume: 1000,
        progressionHighlights: [],
        exerciseSummaries: [],
      }],
    });

    expect(index).toBe(1);
  });
});
