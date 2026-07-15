import { describe, expect, it } from "vitest";
import { restoreCanonicalRecordedSession } from "@/domain/training/canonical-session-restoration";

const snapshot = (schemaVersion: "canonical_session_snapshot_v2" | "canonical_session_snapshot_v3") => ({
  schemaVersion,
  sessionId: "session-1",
  role: "Primary",
  slots: [{ id: "slot-1", index: 0, exerciseId: "ex-1", lane: "hypertrophy", method: "straight_sets", settings: {}, rest: {}, progression: {}, stopRule: {}, loadingMode: "fixed", ...(schemaVersion === "canonical_session_snapshot_v3" ? { loadPrescription: { schemaVersion: "canonical_load_prescription_v1", state: "calibration_required", loadingMode: "fixed", instruction: "calibrate", reason: "load_evidence_unavailable", evidenceStatus: "missing" } } : {}) }],
  provenance: {},
});

describe("canonical load snapshot history", () => {
  it("restores historical v2 snapshots without rewriting them", () => {
    const historical = snapshot("canonical_session_snapshot_v2");
    const result = restoreCanonicalRecordedSession({ snapshot: { id: "s", microcycleId: "m", planSessionIndex: 0, role: "Primary", kind: "planned", status: "planned", constructionVersion: "v2", revision: 1, prescriptionSnapshot: historical }, status: "started", expectedMicrocycleId: "m", currentRevision: 1 });
    expect(result.status).toBe("restored");
    if (result.status === "restored") expect(result.snapshot.prescriptionSnapshot).toEqual(historical);
  });

  it("restores v3 snapshots with explicit load state", () => {
    const result = restoreCanonicalRecordedSession({ snapshot: { id: "s", microcycleId: "m", planSessionIndex: 0, role: "Primary", kind: "planned", status: "planned", constructionVersion: "v3", revision: 1, prescriptionSnapshot: snapshot("canonical_session_snapshot_v3") }, status: "started", expectedMicrocycleId: "m", currentRevision: 1 });
    expect(result.status).toBe("restored");
  });
});
