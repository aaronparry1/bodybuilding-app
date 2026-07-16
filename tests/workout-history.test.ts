import { describe, expect, it } from "vitest";
import { exerciseLibrary } from "@/domain/training/presets";
import { projectCanonicalRecordedSessionHistory } from "@/domain/training/canonical-recorded-session-history-projection";
import { projectCanonicalExerciseHistory } from "@/domain/training/canonical-exercise-history-projection";
import type { CanonicalRecordedSession, CanonicalRecordedSessionEvent } from "@/domain/training/canonical-recorded-session-ledger";

const session: CanonicalRecordedSession = { schemaVersion: "canonical_recorded_session_v1", recordedSessionId: "recorded-1", plannedSessionId: "planned-1", planId: "plan-1", startRevision: 1, macrocycleId: "macro-1", mesocycleId: "meso-1", microcycleId: "micro-1", role: "primary", prescriptionSnapshot: { schemaVersion: "canonical_session_snapshot_v3" }, prescriptionHash: "hash-1", provenance: { source: "canonical" }, athleteId: "athlete-1", version: 3, status: "completed", createdAt: "2026-06-01T10:00:00.000Z" };
const events: CanonicalRecordedSessionEvent[] = [
  { eventId: "work-1", aggregateId: "recorded-1", expectedVersion: 1, type: "performance", occurredAt: "2026-06-01T10:10:00.000Z", operationId: "op-1", payload: { exerciseId: "ex-bench-press", reps: 12, load: 100, unit: "kg", setId: "set-1", warmup: false } },
  { eventId: "warmup-1", aggregateId: "recorded-1", expectedVersion: 2, type: "performance", occurredAt: "2026-06-01T10:05:00.000Z", operationId: "op-2", payload: { exerciseId: "ex-bench-press", reps: 8, load: 40, unit: "kg", setId: "warmup-1", warmup: true } },
  { eventId: "complete-1", aggregateId: "recorded-1", expectedVersion: 3, type: "completed", occurredAt: "2026-06-01T10:45:00.000Z", operationId: "op-3", payload: {} },
];
const entry = { session, events };

describe("canonical recorded-session history projections", () => {
  it("projects completed history with deterministic navigation and work-set counts", () => {
    const result = projectCanonicalRecordedSessionHistory({ athleteId: "athlete-1", planId: "plan-1", sessions: [entry] });
    expect(result.status).toBe("ready");
    if (result.status !== "ready") return;
    expect(result.entries[0]).toMatchObject({ recordedSessionId: "recorded-1", classification: "scheduled", workSets: 1, reps: 12, navigation: { recordedSessionId: "recorded-1" } });
  });

  it("projects exercise history from performed events and excludes warm-ups", () => {
    const result = projectCanonicalExerciseHistory({ athleteId: "athlete-1", planId: "plan-1", exerciseId: "ex-bench-press", sessions: [entry], exercises: exerciseLibrary, unit: "kg" });
    expect(result.status).toBe("ready");
    if (result.status !== "ready") return;
    expect(result.projection.exerciseName).toBe("Bench Press");
    expect(result.projection.entries[0]?.workSets).toEqual([{ reps: 12, load: 100, unit: "kg", setId: "set-1" }]);
    expect(result.projection.entries[0]?.warmUpSets).toBe(1);
  });

  it("filters by exercise and date and fails closed for malformed legacy input", () => {
    expect(projectCanonicalRecordedSessionHistory({ athleteId: "athlete-1", planId: "plan-1", exerciseQuery: "squat", fromDate: "2026-06-01", sessions: [entry] })).toMatchObject({ status: "ready", entries: [] });
    expect(projectCanonicalRecordedSessionHistory({ athleteId: "athlete-1", planId: "plan-1", sessions: [{ session: { ...session, blocks: [] } as never, events }] }).status).toBe("corrupt");
  });
});
