import { describe, expect, it } from "vitest";
import { resolveMesocyclePrescriptionPolicy } from "@/domain/training/mesocycle-prescription-policy";
import { resolveCanonicalLoadPrescription } from "@/domain/training/canonical-load-resolution";
import { resolveCanonicalMesocycleLoadAdjustmentPolicy } from "@/domain/training/canonical-mesocycle-load-adjustment-policy";
import { exerciseLibrary } from "@/domain/training/presets";

const policy = resolveMesocyclePrescriptionPolicy("hypertrophy_base");
if (policy.status !== "resolved") throw new Error("policy fixture unavailable");
const exercise = exerciseLibrary.find((item) => item.id === "ex-bench-press")!;
const established = resolveCanonicalLoadPrescription({ exercise, equipment: ["barbell"], lane: "hypertrophy", loadingMode: "fixed", establishedLoad: 80, increment: 2.5, calibrationSupported: true, evidence: { evidenceId: "e1", evidenceVersion: "v1", athleteId: "a", exerciseId: "bench", observedLoad: 80, observedReps: 8, baseUnit: "kg", freshnessVersion: 1, calibrationStatus: "established" } });

describe("canonical Mesocycle load-adjustment policy", () => {
  it.each(["calibration_required", "autoregulated", "bodyweight", "unavailable"] as const)("fails closed for %s", (state) => {
    const prescription = state === "calibration_required" ? resolveCanonicalLoadPrescription({ exercise, equipment: ["barbell"], lane: "hypertrophy", loadingMode: "fixed", increment: 2.5, calibrationSupported: true }) : state === "autoregulated" ? resolveCanonicalLoadPrescription({ exercise, equipment: ["barbell"], lane: "hypertrophy", loadingMode: "rpe", increment: 2.5, calibrationSupported: true }) : state === "bodyweight" ? resolveCanonicalLoadPrescription({ exercise: exerciseLibrary.find((item) => item.kind === "bodyweight")!, equipment: ["bodyweight"], lane: "hypertrophy", loadingMode: "bodyweight", increment: 1, calibrationSupported: false }) : { schemaVersion: "canonical_load_prescription_v1" as const, state: "unavailable" as const, reason: "missing", evidenceStatus: "missing" as const };
    expect(resolveCanonicalMesocycleLoadAdjustmentPolicy({ mesocycle: policy.policy, method: "straight_sets", loadingMode: "fixed", prescription, evidenceState: "missing", equipmentIncrementAvailable: true }).status).not.toBe("resolved");
  });
  it("never emits an exact load or legacy fields", () => {
    const result = resolveCanonicalMesocycleLoadAdjustmentPolicy({ mesocycle: policy.policy, method: "straight_sets", loadingMode: "fixed", prescription: established, evidenceState: "fresh", equipmentIncrementAvailable: true });
    expect(result.status).toBe("manual_review_required");
    expect(result).not.toHaveProperty("exactLoad");
    expect(result).not.toHaveProperty("prescribedLoad");
    expect(result).not.toHaveProperty("blocks");
  });
  it("is deterministic", () => {
    const input = { mesocycle: policy.policy, method: "straight_sets" as const, loadingMode: "fixed", prescription: established, evidenceState: "fresh" as const, equipmentIncrementAvailable: true };
    expect(resolveCanonicalMesocycleLoadAdjustmentPolicy(input)).toEqual(resolveCanonicalMesocycleLoadAdjustmentPolicy(input));
  });
});
