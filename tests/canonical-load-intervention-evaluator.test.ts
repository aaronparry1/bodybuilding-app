import { describe, expect, it } from "vitest";
import { resolveMesocyclePrescriptionPolicy } from "@/domain/training/mesocycle-prescription-policy";
import { resolveCanonicalLoadPrescription } from "@/domain/training/canonical-load-resolution";
import { exerciseLibrary } from "@/domain/training/presets";
import { canonicalActivePlanState } from "@/application/training/canonical-active-plan-state";
import { evaluateCanonicalLoadIntervention } from "@/domain/training/canonical-load-intervention-evaluator";
import { resolveCanonicalMesocycleLoadAdjustmentPolicy } from "@/domain/training/canonical-mesocycle-load-adjustment-policy";

describe("canonical load intervention evaluator", () => {
  it("resolves escalation and regression requests to review without exact load", () => {
    canonicalActivePlanState.clear();
    const plan = canonicalActivePlanState.create({ planId: "load-eval", createdAt: "2026-01-01T00:00:00.000Z", updatedAt: "2026-01-01T00:00:00.000Z", goal: "hypertrophy", macrocycleGoal: "build_muscle", experienceLevel: "intermediate", daysPerWeek: 4, preferredSplit: "upper_lower", equipment: ["barbell"], units: "kg", exercises: exerciseLibrary, establishedLoads: { "ex-bench-press": 80 }, history: [] }).model!;
    const policy = resolveMesocyclePrescriptionPolicy(plan.mesocycle.id as never);
    const prescription = resolveCanonicalLoadPrescription({ exercise: exerciseLibrary.find((item) => item.id === "ex-bench-press")!, equipment: ["barbell"], lane: "hypertrophy", loadingMode: "fixed", establishedLoad: 80, increment: 2.5, calibrationSupported: true, evidence: { evidenceId: "load-e", evidenceVersion: "v1", athleteId: "a", exerciseId: "ex-bench-press", observedLoad: 80, observedReps: 8, baseUnit: "kg", freshnessVersion: 1, calibrationStatus: "established" } });
    if (policy.status !== "resolved") throw new Error("policy unavailable");
    const resolvedPolicy = resolveCanonicalMesocycleLoadAdjustmentPolicy({ mesocycle: policy.policy, method: "straight_sets", loadingMode: "fixed", prescription, evidenceState: "fresh", equipmentIncrementAvailable: true });
    const result = evaluateCanonicalLoadIntervention({ plan, prescription, evidence: [], policy: resolvedPolicy, evidenceState: "fresh", operationId: "load-eval:op" });
    expect(result.status).toBe("resolved");
    expect(result.intervention?.disposition).toBe("review_required");
    expect(result.intervention).not.toHaveProperty("exactLoad");
    expect(result.intervention).not.toHaveProperty("prescribedLoad");
  });
  it("keeps missing and calibration evidence fail-closed", () => {
    canonicalActivePlanState.clear();
    const plan = canonicalActivePlanState.create({ planId: "load-cal", createdAt: "2026-01-01T00:00:00.000Z", updatedAt: "2026-01-01T00:00:00.000Z", goal: "hypertrophy", macrocycleGoal: "build_muscle", experienceLevel: "intermediate", daysPerWeek: 4, preferredSplit: "upper_lower", equipment: ["barbell"], units: "kg", exercises: exerciseLibrary, establishedLoads: { "ex-bench-press": 80 }, history: [] }).model!;
    const policy = resolveMesocyclePrescriptionPolicy(plan.mesocycle.id as never); if (policy.status !== "resolved") throw new Error("policy unavailable");
    const prescription = resolveCanonicalLoadPrescription({ exercise: exerciseLibrary.find((item) => item.id === "ex-bench-press")!, equipment: ["barbell"], lane: "hypertrophy", loadingMode: "fixed", increment: 2.5, calibrationSupported: true });
    const resolvedPolicy = resolveCanonicalMesocycleLoadAdjustmentPolicy({ mesocycle: policy.policy, method: "straight_sets", loadingMode: "fixed", prescription, evidenceState: "missing", equipmentIncrementAvailable: true });
    const result = evaluateCanonicalLoadIntervention({ plan, prescription, evidence: [], policy: resolvedPolicy, evidenceState: "missing", operationId: "load-cal:op" });
    expect(result.intervention?.disposition).toBe("calibration_required");
  });
});
