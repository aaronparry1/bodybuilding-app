import { describe, expect, it } from "vitest";
import { createActiveTrainingPlan } from "@/domain/training/plan-setup";
import { resolveCurrentSessionConstructionSource } from "@/domain/training/current-session-construction-projection";

const setup = { goal: "build_muscle" as const, planningChoice: "single_block" as const, equipmentPreset: "full_gym" as const, daysPerWeek: 4, preferredSplit: "upper_lower" as const, experienceLevel: "intermediate" as const };

describe("D4 current programme construction projection", () => {
  it.each([["upper-a", "Upper"], ["lower-a", "Lower"], ["upper-b", "Upper"], ["lower-b", "Lower"]] as const)("projects %s from the exact D3 template", (identity, role) => {
    const plan = createActiveTrainingPlan(setup, `2026-02-${identity === "upper-a" ? "01" : identity === "lower-a" ? "02" : identity === "upper-b" ? "03" : "04"}T00:00:00.000Z`);
    const result = resolveCurrentSessionConstructionSource({ activePlan: plan, sessionIdentity: identity, sessionRole: role });
    expect(result.status).toBe("current_programme_specification");
    if (result.status === "current_programme_specification") {
      expect(result.guidance.sessionIdentity).toBe(identity);
      expect(result.guidance.slots.length).toBeGreaterThan(0);
      expect(result.guidance.slots.every((slot) => slot.sourceTrace.programmeId === result.guidance.programmeId)).toBe(true);
      expect(result.guidance.slots.map((slot) => slot.ordinal)).toEqual([...result.guidance.slots].map((slot) => slot.ordinal));
    }
  });

  it("routes compatibility plans explicitly and never fabricates current guidance", () => {
    const plan = createActiveTrainingPlan({ ...setup, experienceLevel: "beginner", daysPerWeek: 3, preferredSplit: "full_body" }, "2026-02-05T00:00:00.000Z");
    expect(resolveCurrentSessionConstructionSource({ activePlan: plan, sessionIdentity: "upper-a", sessionRole: "Upper" })).toEqual({ status: "compatibility_generated_guidance" });
  });

  it("fails supported current plans without a reference instead of falling back", () => {
    const plan = createActiveTrainingPlan(setup, "2026-02-06T00:00:00.000Z");
    const withoutReference = { ...plan, microcycleProgrammeReferences: [] };
    expect(resolveCurrentSessionConstructionSource({ activePlan: withoutReference, sessionIdentity: "upper-a", sessionRole: "Upper" }).status).toBe("invalid_programme_specification");
  });
});
