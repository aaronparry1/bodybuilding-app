import { describe, expect, it } from "vitest";
import { buildAnalyticsPlanningContext } from "@/domain/training/analytics-planning-context";
import { createActiveTrainingPlan } from "@/domain/training/plan-setup";

function plan() {
  return createActiveTrainingPlan({
    goal: "build_muscle",
    planningChoice: "recommended_12_month",
    equipmentPreset: "full_gym",
    daysPerWeek: 4,
    preferredSplit: "upper_lower",
    experienceLevel: "intermediate",
  }, "2026-07-11T09:00:00.000Z");
}

describe("Analytics planning context", () => {
  it("uses the current mesocycle, microcycle, and session role without reading legacy block metadata", () => {
    const activePlan = plan();
    const context = buildAnalyticsPlanningContext({
      activePlan: {
        ...activePlan,
        blocks: activePlan.blocks.map((block) => ({ ...block, type: "peak" })),
      },
      sessionIndex: 1,
    });

    expect(context).toMatchObject({
      status: "ready",
      goal: "build_muscle",
      macrocycle: "hypertrophy",
      microcycle: { number: activePlan.currentMicrocycle?.sequenceNumber },
      sessionRole: activePlan.currentMicrocycle?.sessionRoles[1],
    });
    expect("block" in context).toBe(false);
  });

  it("returns an explicit no-plan state rather than inventing annual context", () => {
    expect(buildAnalyticsPlanningContext({ activePlan: null })).toEqual({ status: "no_plan" });
  });

  it("marks older plans as compatibility context without promoting their block metadata", () => {
    const activePlan = plan();
    const context = buildAnalyticsPlanningContext({
      activePlan: {
        ...activePlan,
        currentMesocycleId: undefined,
        currentMicrocycle: undefined,
        blocks: activePlan.blocks.map((block) => ({ ...block, type: "peak" })),
      },
    });

    expect(context.status).toBe("compatibility");
    expect("block" in context).toBe(false);
  });
});
