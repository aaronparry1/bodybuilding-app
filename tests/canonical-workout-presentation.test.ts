import { describe, expect, it } from "vitest";
import { projectCanonicalWorkoutPresentation } from "@/application/training/canonical-workout-presentation";

const snapshot = {
  schemaVersion: "canonical_session_snapshot_v3",
  sessionId: "planned:1",
  role: "Bench and hypertrophy",
  slots: [{ id: "slot:bench", index: 0, exerciseId: "ex-bench-press", method: "straight_sets", loadingMode: "established", prescribedLoad: 80, settings: { requiredSets: 3, repRange: { min: 6, max: 8 } }, rest: { seconds: 120 } }],
};

describe("canonical workout presentation", () => {
  it("maps exact prescription and current/completed set states without leaking domain fields", () => {
    const planned = projectCanonicalWorkoutPresentation({ session: null, snapshot });
    expect(planned.title).toBe("Bench and hypertrophy");
    expect(planned.totalSets).toBe(3);
    expect(planned.exercises[0]?.sets.map((set) => [set.target, set.loadLabel, set.restSeconds, set.state])).toEqual([["6 reps", "80 kg", 120, "current"], ["6 reps", "80 kg", 120, "upcoming"], ["6 reps", "80 kg", 120, "upcoming"]]);
    expect(JSON.stringify(planned)).not.toMatch(/straight_sets|ex-bench|canonical_session/);
  });

  it("marks only the exact performed set complete and leaves remaining prescription unchanged", () => {
    const session = { schemaVersion: "canonical_recorded_session_v1" as const, recordedSessionId: "recorded:1", plannedSessionId: "planned:1", planId: "plan:1", startRevision: 1, macrocycleId: "macro:1", mesocycleId: "meso:1", microcycleId: "micro:1", role: "Bench and hypertrophy", prescriptionSnapshot: snapshot, prescriptionHash: JSON.stringify(snapshot), provenance: {}, athleteId: "athlete:1", version: 2, status: "started" as const, createdAt: "2026-01-01T00:00:00.000Z" };
    const result = projectCanonicalWorkoutPresentation({ session, snapshot, events: [{ eventId: "start", aggregateId: session.recordedSessionId, expectedVersion: 0, type: "started", occurredAt: session.createdAt, operationId: "start", payload: {} }, { eventId: "set", aggregateId: session.recordedSessionId, expectedVersion: 1, type: "performance", occurredAt: session.createdAt, operationId: "set", payload: { slotId: "slot:bench", setOrder: 1, reps: 8, load: 80 } }] });
    expect(result.completedSets).toBe(1);
    expect(result.exercises[0]?.sets[0]?.state).toBe("completed");
    expect(result.exercises[0]?.sets[0]?.actualReps).toBe(8);
    expect(result.exercises[0]?.sets[1]?.state).toBe("current");
  });

  it("projects first-exposure calibration once and reuses compatible retained evidence as smart defaults", () => {
    const calibrationSnapshot = { ...snapshot, slots: [{ ...snapshot.slots[0], prescribedLoad: undefined, loadPrescription: { schemaVersion: "canonical_load_prescription_v1", state: "calibration_required", loadingMode: "rep_progression", instruction: "calibrate", reason: "missing", evidenceStatus: "missing", protocol: { schemaVersion: "canonical_load_calibration_protocol_v1", targetReps: 6, workingSets: 3, warmupAndRampExcludedFromWorkingVolume: true, startingInstruction: "start", safeAdjustment: "increase gradually", successCriteria: "six controlled reps", laterWorkingSets: "reuse", evidenceRetention: { persistCompletedWorkingSetEvidence: true, reuseWhileFreshAndCompatible: true, recalibrateOnlyWhen: ["missing", "stale", "incompatible"] } } } }] };
    const missing = projectCanonicalWorkoutPresentation({ session: null, snapshot: calibrationSnapshot });
    expect(missing.exercises[0]?.calibration).toMatchObject({ required: true, targetReps: 6, evidenceStatus: "missing" });
    expect(missing.exercises[0]?.sets[0]).toMatchObject({ defaultLoad: null, loadLabel: "Find starting load" });
    const retained = projectCanonicalWorkoutPresentation({ session: null, snapshot: calibrationSnapshot, evidence: [{ schemaVersion: "canonical_progress_evidence_v1", evidenceId: "evidence", planId: "plan", planRevision: 2, macrocycleId: "macro", mesocycleId: "powerbuilding_foundation", microcycleId: "micro", sessionId: "prior", slotId: "prior-slot", athleteId: "athlete", observedAt: "2026-01-01T00:00:00.000Z", source: "ledger", kind: "performance", observations: { exerciseId: "ex-bench-press", loadingMode: "rep_progression", reps: 6, load: 80, unit: "kg", completion: "complete" }, evidenceVersion: "progress_v1" }] });
    expect(retained.exercises[0]?.calibration).toMatchObject({ required: false, evidenceStatus: "compatible_evidence" });
    expect(retained.exercises[0]?.sets[0]).toMatchObject({ defaultLoad: 80, loadLabel: "80 kg starting load", previous: "6 reps · 80 kg" });
  });
});
