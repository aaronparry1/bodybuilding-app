import { describe, expect, it } from "vitest";
import { classifyPlanAuthority, mutationEligibility, CANONICAL_PLAN_AUTHORITY_VERSION } from "@/domain/training/plan-authority-provenance";
import { createActiveTrainingPlan } from "@/domain/training/plan-setup";

describe("canonical plan authority provenance", () => {
  it("marks newly constructed plans canonically and permits only canonical mutation", () => {
    const plan = createActiveTrainingPlan({ goal: "build_muscle", planningChoice: "recommended_12_month", equipmentPreset: "full_gym", daysPerWeek: 4, preferredSplit: "upper_lower", experienceLevel: "intermediate" }, "2026-07-14T00:00:00.000Z");
    expect(plan.authority).toEqual({ kind: "canonical_modern", version: CANONICAL_PLAN_AUTHORITY_VERSION });
    expect(classifyPlanAuthority(plan)).toEqual(plan.authority);
    expect(mutationEligibility(plan.authority!, "canonical_transition")).toBe("canonical_mutation_permitted");
    expect(mutationEligibility(plan.authority!, "legacy_compatibility")).toBe("mutation_prohibited");
  });
  it("fails closed for ambiguous and conflicting unmarked records", () => {
    expect(classifyPlanAuthority({})).toMatchObject({ kind: "ambiguous_unversioned", reason: "insufficient_evidence" });
    expect(classifyPlanAuthority({ currentMesocycleId: "m", currentMicrocycle: {}, blocks: [{}], activeBlockId: "b" })).toMatchObject({ kind: "ambiguous_unversioned", reason: "conflicting_evidence" });
    expect(mutationEligibility({ kind: "ambiguous_unversioned", reason: "insufficient_evidence" }, "canonical_transition")).toBe("mutation_prohibited");
  });
  it("does not accept malformed or unsupported markers", () => {
    expect(classifyPlanAuthority({ authority: { kind: "canonical_modern", version: "future" }, currentMesocycleId: "m", currentMicrocycle: {} })).toMatchObject({ kind: "ambiguous_unversioned", reason: "unsupported_version" });
    expect(classifyPlanAuthority({ authority: { kind: "canonical_modern", version: CANONICAL_PLAN_AUTHORITY_VERSION } })).toMatchObject({ kind: "ambiguous_unversioned", reason: "invalid_marker" });
  });
});
