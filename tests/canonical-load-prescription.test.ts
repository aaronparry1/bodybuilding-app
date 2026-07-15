import { describe, expect, it } from "vitest";
import { validateCanonicalLoadPrescription, CANONICAL_LOAD_PRESCRIPTION_VERSION } from "@/domain/training/canonical-load-prescription";

describe("canonical load prescription contract", () => {
  it("accepts established evidence-backed load", () => expect(validateCanonicalLoadPrescription({ schemaVersion: CANONICAL_LOAD_PRESCRIPTION_VERSION, state: "established", prescribedBaseLoad: 80, baseUnit: "kg", loadingMode: "fixed", evidence: { evidenceId: "e", evidenceVersion: "v1", athleteId: "a", exerciseId: "ex", observedLoad: 80, observedReps: 8, baseUnit: "kg", freshnessVersion: 1, calibrationStatus: "established" }, rounding: { increment: 2.5, rule: "nearest" } })).toEqual({ status: "valid" }));
  it("rejects zero and ambiguous established loads", () => expect(validateCanonicalLoadPrescription({ schemaVersion: CANONICAL_LOAD_PRESCRIPTION_VERSION, state: "established", prescribedBaseLoad: 0, baseUnit: "kg" })).toMatchObject({ status: "invalid" }));
  it("accepts explicit calibration and unavailable states", () => { expect(validateCanonicalLoadPrescription({ schemaVersion: CANONICAL_LOAD_PRESCRIPTION_VERSION, state: "calibration_required", loadingMode: "calibration", instruction: "calibrate", reason: "missing", evidenceStatus: "missing" })).toEqual({ status: "valid" }); expect(validateCanonicalLoadPrescription({ schemaVersion: CANONICAL_LOAD_PRESCRIPTION_VERSION, state: "unavailable", reason: "stale", evidenceStatus: "stale" })).toEqual({ status: "valid" }); });
});
