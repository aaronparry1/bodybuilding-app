import { describe, expect, it } from "vitest";
import { resolveCanonicalLoadPrescription } from "@/domain/training/canonical-load-resolution";
import { exerciseLibrary } from "@/domain/training/presets";

const exercise = exerciseLibrary.find((item) => item.id === "ex-bench-press")!;
describe("canonical load resolution", () => {
  it("resolves evidence-backed established loads with deterministic rounding", () => {
    const result = resolveCanonicalLoadPrescription({ exercise, equipment: ["barbell"], lane: "hypertrophy", loadingMode: "fixed", establishedLoad: 81, evidence: { evidenceId: "e", evidenceVersion: "v1", athleteId: "a", exerciseId: exercise.id, observedLoad: 81, observedReps: 8, baseUnit: "kg", freshnessVersion: 1, calibrationStatus: "established" }, increment: 2.5, calibrationSupported: true });
    expect(result.state).toBe("established");
    if (result.state === "established") expect(result.prescribedBaseLoad).toBe(80);
  });
  it("returns calibration instead of zero when evidence is absent", () => expect(resolveCanonicalLoadPrescription({ exercise, equipment: ["barbell"], lane: "hypertrophy", loadingMode: "fixed", increment: 2.5, calibrationSupported: true }).state).toBe("calibration_required"));
});
