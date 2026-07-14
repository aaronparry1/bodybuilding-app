import { describe, expect, it } from "vitest";
import { restoreCanonicalRecordedSession } from "@/domain/training/canonical-session-restoration";

const snapshot = { id: "s1", microcycleId: "m1", planSessionIndex: 0, role: "primary", kind: "planned" as const, status: "planned" as const, constructionVersion: "v2", revision: 2, prescriptionSnapshot: { schemaVersion: "canonical_session_snapshot_v2", sessionId: "s1", role: "primary", slots: [{ id: "slot1", index: 0, exerciseId: "e1", lane: "hypertrophy", method: "straight_sets", settings: { repRange: { min: 8, max: 12 } }, rest: { seconds: 90 }, progression: { rule: "rep_progression" }, stopRule: { monitoring: "rep" }, loadingMode: "rep_progression", substitutionConstraints: [], reason: "test" }], provenance: { constructionVersion: "v2" } } };

describe("canonical recorded-session restoration", () => {
  it("restores the recorded prescription without construction", () => {
    const result = restoreCanonicalRecordedSession({ snapshot, status: "paused", expectedMicrocycleId: "m1", currentRevision: 2, performedSets: [{ reps: 8 }] });
    expect(result.status).toBe("restored");
    if (result.status === "restored") expect(result.snapshot).toBe(snapshot);
  });
  it.each(["started", "paused", "completed", "legacy_historical"] as const)("preserves %s records", (status) => {
    const result = restoreCanonicalRecordedSession({ snapshot, status, expectedMicrocycleId: "m1", currentRevision: 2, performedSets: [{ reps: 8 }] });
    expect(result.status).toBe("restored");
  });
  it("rejects stale, mislinked and legacy-authority snapshots", () => {
    expect(restoreCanonicalRecordedSession({ snapshot, status: "started", expectedMicrocycleId: "wrong", currentRevision: 2 })).toEqual({ status: "rejected", reason: "invalid_linkage" });
    expect(restoreCanonicalRecordedSession({ snapshot, status: "started", expectedMicrocycleId: "m1", currentRevision: 3 })).toEqual({ status: "rejected", reason: "stale_revision" });
    expect(restoreCanonicalRecordedSession({ snapshot: { ...snapshot, prescriptionSnapshot: { blocks: [] } }, status: "started", expectedMicrocycleId: "m1", currentRevision: 2 })).toEqual({ status: "rejected", reason: "legacy_authority_present" });
  });
});
