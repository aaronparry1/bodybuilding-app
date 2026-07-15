import { canonicalActivePlanState } from "@/application/training/canonical-active-plan-state";
import { startCanonicalSession, prescriptionHash, pauseCanonicalSession, resumeCanonicalSession, recordCanonicalPerformedWork } from "@/application/training/canonical-recorded-session-application";
import { canonicalRecordedSessionLedger } from "@/data/local/canonical-recorded-session-ledger";
import { exerciseLibrary } from "@/domain/training/presets";

export type CanonicalDesignQaSessionResult = Readonly<{ status: "ready" | "started" | "rejected"; fixtureId: string; planId: string; plannedSessionId?: string; recordedSessionId?: string; reason: string }>;

export function applyCanonicalActiveSessionFixture(fixtureId: string): CanonicalDesignQaSessionResult {
  const planId = `design-qa:${fixtureId}`;
  const state = canonicalActivePlanState.create({ planId, createdAt: "2026-01-01T00:00:00.000Z", updatedAt: "2026-01-01T00:00:00.000Z", goal: "hypertrophy", macrocycleGoal: "build_muscle", experienceLevel: "intermediate", daysPerWeek: 4, preferredSplit: "upper_lower", equipment: ["barbell", "dumbbell", "bodyweight"], units: "kg", exercises: exerciseLibrary });
  if (state.hydration !== "hydrated" || !state.model) return { status: "rejected", fixtureId, planId, reason: state.error ?? "canonical_plan_unavailable" };
  const planned = state.model.nextSession;
  if (!planned) return { status: "rejected", fixtureId, planId, reason: "planned_session_unavailable" };
  const snapshot = state.model.plannedSessions.find((session) => session.id === planned.id)?.snapshot;
  if (!snapshot) return { status: "rejected", fixtureId, planId, plannedSessionId: planned.id, reason: "planned_snapshot_unavailable" };
  const started = startCanonicalSession({ planId, expectedPlanRevision: state.model.revision, plannedSessionId: planned.id, expectedPrescriptionHash: prescriptionHash(snapshot), operationId: `design-qa:${fixtureId}:start`, startedAt: "2026-01-01T00:00:00.000Z", provenance: "design_qa_canonical" });
  if (!started.recordedSessionId) return { status: "rejected", fixtureId, planId, plannedSessionId: planned.id, reason: started.reason };
  let recordedSessionId = started.recordedSessionId;
  const aggregate = canonicalRecordedSessionLedger.get(recordedSessionId);
  if (aggregate.status === "found") {
    const slot = (aggregate.session.prescriptionSnapshot.slots as Array<Record<string, unknown>> | undefined)?.[0];
    const base = { planId, expectedPlanRevision: started.planRevision ?? state.model.revision + 1, recordedSessionId, expectedLedgerVersion: aggregate.session.version, occurredAt: "2026-01-01T00:02:00.000Z", provenance: "design_qa_canonical" };
    if (slot && /work|first_set|warmup|threshold|swapped|added|productive|escalation|shutdown|regression|increment/.test(fixtureId)) recordCanonicalPerformedWork({ ...base, operationId: `${fixtureId}:set`, slotId: String(slot.id), exerciseId: String(slot.exerciseId), setId: `${fixtureId}:set:1`, setOrder: 1, reps: 8, load: 60, unit: "kg", substitutionId: /swapped|added/.test(fixtureId) ? "canonical-substitution:fixture" : undefined, completion: fixtureId.includes("partial") ? "partial" : "complete" });
    const refreshed = canonicalRecordedSessionLedger.get(recordedSessionId);
    if (refreshed.status === "found" && fixtureId.includes("pause")) { pauseCanonicalSession({ ...base, expectedLedgerVersion: refreshed.session.version, operationId: `${fixtureId}:pause` }); }
    if (fixtureId.includes("resume")) { const paused = canonicalRecordedSessionLedger.get(recordedSessionId); if (paused.status === "found") resumeCanonicalSession({ ...base, expectedLedgerVersion: paused.session.version, operationId: `${fixtureId}:resume` }); }
  }
  return { status: started.status === "started" ? "started" : "ready", fixtureId, planId, plannedSessionId: planned.id, recordedSessionId, reason: started.reason };
}

export function readCanonicalFixtureSession(recordedSessionId: string) { return canonicalRecordedSessionLedger.get(recordedSessionId); }
