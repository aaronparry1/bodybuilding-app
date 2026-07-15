import { describe, expect, it } from "vitest";
import { canonicalActivePlanState } from "@/application/training/canonical-active-plan-state";
import { resolveMesocyclePrescriptionPolicy } from "@/domain/training/mesocycle-prescription-policy";
import { evaluateCanonicalRotationIntervention, evaluateCanonicalVolumeIntervention } from "@/domain/training/canonical-volume-rotation-intervention-evaluator";
import { exerciseLibrary } from "@/domain/training/presets";

describe("canonical volume and rotation interventions", () => {
  it("returns bounded volume review without exact prescription", () => {
    canonicalActivePlanState.clear();
    const plan = canonicalActivePlanState.create({ planId: "volume-eval", createdAt: "2026-01-01T00:00:00.000Z", updatedAt: "2026-01-01T00:00:00.000Z", goal: "hypertrophy", macrocycleGoal: "build_muscle", experienceLevel: "intermediate", daysPerWeek: 4, preferredSplit: "upper_lower", equipment: ["barbell"], units: "kg", exercises: exerciseLibrary, history: [] }).model!;
    const policy = resolveMesocyclePrescriptionPolicy(plan.mesocycle.id as never); if (policy.status !== "resolved") throw new Error("policy unavailable");
    const result = evaluateCanonicalVolumeIntervention({ plan, policy: policy.policy, evidence: [], evidenceState: "fresh", operationId: "volume-eval:op" });
    expect(result.intervention?.family).toBe("volume_adjustment");
    expect(result.intervention?.disposition).toBe("review");
    expect(result.intervention).not.toHaveProperty("sets");
  });
  it("returns rotation review when no approved edge exists", () => {
    canonicalActivePlanState.clear();
    const plan = canonicalActivePlanState.create({ planId: "rotation-eval", createdAt: "2026-01-01T00:00:00.000Z", updatedAt: "2026-01-01T00:00:00.000Z", goal: "hypertrophy", macrocycleGoal: "build_muscle", experienceLevel: "intermediate", daysPerWeek: 4, preferredSplit: "upper_lower", equipment: ["barbell"], units: "kg", exercises: exerciseLibrary, history: [] }).model!;
    const policy = resolveMesocyclePrescriptionPolicy(plan.mesocycle.id as never); if (policy.status !== "resolved") throw new Error("policy unavailable");
    const result = evaluateCanonicalRotationIntervention({ plan, policy: policy.policy, evidence: [], evidenceState: "fresh", operationId: "rotation-eval:op" });
    expect(result.intervention?.family).toBe("microcycle_rotation");
    expect(result.intervention?.disposition).toBe("review");
    expect(result.intervention).not.toHaveProperty("roles");
  });
});
