import { describe, expect, it } from "vitest";
import { advanceCompletedMicrocycle, createActiveTrainingPlan, sessionRolesForPlan } from "@/domain/training/plan-setup";

function hypertrophyPlan() {
  return createActiveTrainingPlan(
    {
      goal: "build_muscle",
      planningChoice: "recommended_12_month",
      equipmentPreset: "full_gym",
      daysPerWeek: 4,
      preferredSplit: "upper_lower",
      experienceLevel: "intermediate",
    },
    "2026-07-11T09:00:00.000Z",
  );
}

describe("microcycle progression", () => {
  it("advances only the persisted microcycle after a complete planned week", () => {
    const plan = hypertrophyPlan();
    const next = advanceCompletedMicrocycle(plan);

    expect(next.currentMesocycleId).toBe("hypertrophy_calibration");
    expect(next.currentMicrocycle?.sequenceNumber).toBe(2);
    expect(sessionRolesForPlan(next)).toEqual(["Upper hypertrophy", "Lower hypertrophy", "Upper hypertrophy", "Lower hypertrophy"]);
  });

  it("moves to the next eligible mesocycle only after its planned microcycles complete", () => {
    const plan = hypertrophyPlan();
    const completedCalibration = {
      ...plan,
      currentMicrocycle: { ...plan.currentMicrocycle!, sequenceNumber: 2 },
    };
    const next = advanceCompletedMicrocycle(completedCalibration);

    expect(next.currentMesocycleId).toBe("hypertrophy_base");
    expect(next.currentMicrocycle?.parentMesocycleId).toBe("hypertrophy_base");
    expect(next.currentMicrocycle?.sequenceNumber).toBe(1);
  });

  it("leaves legacy plans without a microcycle unchanged", () => {
    const plan = { ...hypertrophyPlan(), currentMicrocycle: undefined };
    expect(advanceCompletedMicrocycle(plan)).toEqual(plan);
  });
});
