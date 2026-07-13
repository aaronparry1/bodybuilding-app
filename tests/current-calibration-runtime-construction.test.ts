import { describe, expect, it } from "vitest";
import { createActiveTrainingPlan } from "@/domain/training/plan-setup";
import { resolveCurrentCalibrationRuntimeConstruction } from "@/domain/training/current-calibration-runtime-construction";

const setup = { goal: "build_muscle" as const, planningChoice: "single_block" as const, equipmentPreset: "full_gym" as const, daysPerWeek: 4, preferredSplit: "upper_lower" as const, experienceLevel: "intermediate" as const };

describe("D4C calibration runtime construction authority", () => {
  it.each([["upper-a", "Upper"], ["lower-a", "Lower"], ["upper-b", "Upper"], ["lower-b", "Lower"]] as const)("routes %s through the current programme adapter", (identity, role) => {
    const plan = createActiveTrainingPlan(setup, `2026-04-${identity === "upper-a" ? "01" : identity === "lower-a" ? "02" : identity === "upper-b" ? "03" : "04"}T00:00:00.000Z`);
    const result = resolveCurrentCalibrationRuntimeConstruction({ activePlan: plan, sessionIdentity: identity, sessionRole: role });
    expect(result.status).toBe("constructed_current_programme");
    if (result.status === "constructed_current_programme") {
      expect(result.source).toBe("current_programme_adapter");
      expect(result.consumedPrescriptionSlotIds.length).toBeGreaterThan(0);
      expect(result.jobs.every((job: any) => !job.selectedExerciseId && !job.exactTargets)).toBe(true);
    }
  });

  it("keeps compatibility construction explicit", () => {
    const plan = createActiveTrainingPlan({ ...setup, experienceLevel: "beginner", daysPerWeek: 3, preferredSplit: "full_body" }, "2026-04-05T00:00:00.000Z");
    expect(resolveCurrentCalibrationRuntimeConstruction({ activePlan: plan, sessionIdentity: "upper-a", sessionRole: "Upper" })).toEqual({ status: "constructed_compatibility", source: "compatibility_generated_guidance" });
  });

  it("fails malformed current plans without compatibility fallback", () => {
    const plan = createActiveTrainingPlan(setup, "2026-04-06T00:00:00.000Z");
    const malformed = { ...plan, microcycleProgrammeReferences: [] };
    const result = resolveCurrentCalibrationRuntimeConstruction({ activePlan: malformed, sessionIdentity: "upper-a", sessionRole: "Upper" });
    expect(result.status).toBe("invalid_input");
  });
});
