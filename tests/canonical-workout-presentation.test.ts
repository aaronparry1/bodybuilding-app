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
    expect(planned.exercises[0]?.sets.map((set) => [set.target, set.loadLabel, set.restSeconds, set.state])).toEqual([["6–8 reps", "80 kg", 120, "current"], ["6–8 reps", "80 kg", 120, "upcoming"], ["6–8 reps", "80 kg", 120, "upcoming"]]);
    expect(JSON.stringify(planned)).not.toMatch(/straight_sets|ex-bench|canonical_session/);
  });

  it("marks only the exact performed set complete and leaves remaining prescription unchanged", () => {
    const session = { schemaVersion: "canonical_recorded_session_v1" as const, recordedSessionId: "recorded:1", plannedSessionId: "planned:1", planId: "plan:1", startRevision: 1, macrocycleId: "macro:1", mesocycleId: "meso:1", microcycleId: "micro:1", role: "Bench and hypertrophy", prescriptionSnapshot: snapshot, prescriptionHash: JSON.stringify(snapshot), provenance: {}, athleteId: "athlete:1", version: 2, status: "started" as const, createdAt: "2026-01-01T00:00:00.000Z" };
    const result = projectCanonicalWorkoutPresentation({ session, snapshot, events: [{ eventId: "start", aggregateId: session.recordedSessionId, expectedVersion: 0, type: "started", occurredAt: session.createdAt, operationId: "start", payload: {} }, { eventId: "set", aggregateId: session.recordedSessionId, expectedVersion: 1, type: "performance", occurredAt: session.createdAt, operationId: "set", payload: { slotId: "slot:bench", setOrder: 1, reps: 8, load: 80 } }] });
    expect(result.completedSets).toBe(1);
    expect(result.exercises[0]?.sets[0]?.state).toBe("completed");
    expect(result.exercises[0]?.sets[0]?.actualReps).toBe(8);
    expect(result.exercises[0]?.sets[1]?.state).toBe("upcoming");
  });
});
