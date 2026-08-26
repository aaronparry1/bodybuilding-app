import { beforeEach, describe, expect, it } from "vitest";
import { canonicalActivePlanState } from "@/application/training/canonical-active-plan-state";
import { editCanonicalExercise, rankExerciseReplacements } from "@/application/training/canonical-exercise-management";
import { prescriptionHash, startCanonicalSession } from "@/application/training/canonical-recorded-session-application";
import { editCanonicalPerformedWork, recordCanonicalPerformedWork } from "@/application/training/canonical-recorded-session-application";
import { effectiveCanonicalPerformedWork } from "@/domain/training/canonical-performed-work";
import { canonicalFiveDayFixtureInput } from "@/application/design-qa/canonical-five-day-plan-fixture";
import { canonicalActivePlanV2Repository } from "@/data/local/canonical-active-plan-v2-repository";
import { canonicalRecordedSessionLedger } from "@/data/local/canonical-recorded-session-ledger";
import { jsonStore } from "@/data/local/json-store";

describe("canonical exercise management", () => {
  beforeEach(() => { jsonStore.clearByPrefix("iron-logic."); jsonStore.resetCache(); });

  it("swaps an unperformed exercise in only the active workout and survives hydration", () => {
    const { carrier, session, slot, replacement } = setup();
    const started = startCanonicalSession({ planId: carrier.planId, expectedPlanRevision: carrier.revision, plannedSessionId: session.id, expectedPrescriptionHash: prescriptionHash(session.prescriptionSnapshot), operationId: "start-current-edit", startedAt: "2026-08-07T10:00:00.000Z", provenance: "test" });
    const aggregate = canonicalRecordedSessionLedger.get(started.recordedSessionId!);
    expect(aggregate.status).toBe("found");
    if (aggregate.status !== "found") return;
    const result = editCanonicalExercise({ action: "replace", scope: "current_session", planId: carrier.planId, expectedPlanRevision: carrier.revision + 1, recordedSessionId: aggregate.session.recordedSessionId, expectedLedgerVersion: aggregate.session.version, slotId: String(slot.id), sourceExerciseId: String(slot.exerciseId), exerciseId: replacement.exercise.id, operationId: "current-replace", occurredAt: "2026-08-07T10:01:00.000Z" });
    expect(result.status).toBe("applied");
    const restored = canonicalRecordedSessionLedger.get(aggregate.session.recordedSessionId);
    expect(restored).toMatchObject({ status: "found", session: { version: aggregate.session.version + 1 } });
    if (restored.status === "found") expect((restored.session.prescriptionSnapshot.slots as Array<Record<string, unknown>>).find((item) => item.id === slot.id)?.exerciseId).toBe(replacement.exercise.id);
  });

  it("replaces matching exercise identities in future occurrences without touching recorded history", () => {
    const { carrier, session, slot, replacement } = setup();
    const historical = { session: { schemaVersion: "canonical_recorded_session_v1" as const, recordedSessionId: "history-1", plannedSessionId: "old", planId: carrier.planId, startRevision: 1, macrocycleId: carrier.macrocycle.id, mesocycleId: carrier.mesocycle.id, microcycleId: carrier.microcycle.id, role: "old", prescriptionSnapshot: session.prescriptionSnapshot, prescriptionHash: JSON.stringify(session.prescriptionSnapshot), provenance: { source: "test" }, athleteId: "athlete", version: 0, status: "historical" as const, createdAt: "2026-07-01T10:00:00.000Z" }, events: [] };
    canonicalRecordedSessionLedger.restorePlan([historical]);
    const before = JSON.stringify(canonicalRecordedSessionLedger.exportPlan(carrier.planId));
    const result = editCanonicalExercise({ action: "replace", scope: "future_programme", planId: carrier.planId, expectedPlanRevision: carrier.revision, plannedSessionId: session.id, slotId: String(slot.id), sourceExerciseId: String(slot.exerciseId), exerciseId: replacement.exercise.id, operationId: "future-replace", occurredAt: "2026-08-07T10:00:00.000Z" });
    expect(result).toMatchObject({ status: "applied" });
    expect(JSON.stringify(canonicalRecordedSessionLedger.exportPlan(carrier.planId))).toBe(before);
    const saved = canonicalActivePlanV2Repository.get();
    expect(saved.status).toBe("saved");
    if (saved.status === "saved") expect(saved.carrier.plannedSessions.flatMap((item) => item.prescriptionSnapshot.slots as Array<Record<string, unknown>>).some((item) => item.exerciseId === replacement.exercise.id)).toBe(true);
  });

  it("adds one optional exercise, rejects a duplicate tap, and persists after hydration", () => {
    const { carrier, session, addExercise } = setup();
    const command = { action: "add" as const, scope: "future_programme" as const, planId: carrier.planId, expectedPlanRevision: carrier.revision, plannedSessionId: session.id, slotId: "new", exerciseId: addExercise.id, operationId: "add-once", occurredAt: "2026-08-07T10:00:00.000Z" };
    expect(editCanonicalExercise(command).status).toBe("applied");
    expect(editCanonicalExercise(command).status).toBe("rejected");
    canonicalActivePlanState.hydrate();
    const saved = canonicalActivePlanV2Repository.get();
    if (saved.status !== "saved") throw new Error("plan missing");
    const edited = saved.carrier.plannedSessions.find((item) => item.id === session.id)!;
    expect((edited.prescriptionSnapshot.slots as Array<Record<string, unknown>>).filter((item) => item.exerciseId === addExercise.id)).toHaveLength(1);
  });

  it("removes optional work but blocks required primary removal", () => {
    const { carrier, session } = setup();
    const slots = session.prescriptionSnapshot.slots as Array<Record<string, unknown>>;
    const optional = slots.find((slot) => slot.constructionRole === "accessory" && slot.exerciseRole !== "primary_compound")!;
    const primary = slots.find((slot) => slot.constructionRole === "primary" || slot.exerciseRole === "primary_compound")!;
    expect(editCanonicalExercise({ action: "remove", scope: "future_programme", planId: carrier.planId, expectedPlanRevision: carrier.revision, plannedSessionId: session.id, slotId: String(primary.id), sourceExerciseId: String(primary.exerciseId), operationId: "remove-primary", occurredAt: "2026-08-07T10:00:00.000Z" })).toMatchObject({ status: "rejected", reason: "required_exercise_requires_replacement" });
    expect(editCanonicalExercise({ action: "remove", scope: "future_programme", planId: carrier.planId, expectedPlanRevision: carrier.revision, plannedSessionId: session.id, slotId: String(optional.id), sourceExerciseId: String(optional.exerciseId), operationId: "remove-optional", occurredAt: "2026-08-07T10:00:00.000Z" }).status).toBe("applied");
  });

  it("blocks mutations before hydration or without a canonical plan", () => {
    expect(editCanonicalExercise({ action: "add", scope: "future_programme", planId: "missing", expectedPlanRevision: 0, plannedSessionId: "missing", exerciseId: "missing", operationId: "blocked", occurredAt: "2026-08-07T10:00:00.000Z" })).toMatchObject({ status: "rejected", reason: "canonical_plan_unavailable" });
  });

  it("reapplies explicit future customisations after safe session-duration regeneration", () => {
    const { carrier, session, slot, replacement } = setup();
    const edited = editCanonicalExercise({ action: "replace", scope: "future_programme", planId: carrier.planId, expectedPlanRevision: carrier.revision, plannedSessionId: session.id, slotId: String(slot.id), sourceExerciseId: String(slot.exerciseId), exerciseId: replacement.exercise.id, operationId: "future-replace-before-regeneration", occurredAt: "2026-08-07T10:00:00.000Z" });
    expect(edited.status).toBe("applied");
    const afterEdit = canonicalActivePlanV2Repository.get();
    if (afterEdit.status !== "saved") throw new Error("edited plan missing");
    const nextDuration = afterEdit.carrier.constraints.availableSessionMinutes === 75 ? 60 : 75;
    expect(canonicalActivePlanState.changeSessionDuration({ planId: afterEdit.carrier.planId, expectedRevision: afterEdit.carrier.revision, availableSessionMinutes: nextDuration, updatedAt: "2026-08-07T10:05:00.000Z" }).status).toBe("applied");
    const regenerated = canonicalActivePlanV2Repository.get();
    if (regenerated.status !== "saved") throw new Error("regenerated plan missing");
    expect(regenerated.carrier.plannedSessions.flatMap((item) => item.prescriptionSnapshot.slots as Array<Record<string, unknown>>).some((item) => item.exerciseId === replacement.exercise.id)).toBe(true);
  });

  it("preserves and separates work when a partially completed exercise is substituted offline", () => {
    const { carrier, session, slot, replacement } = setup();
    const started = startCanonicalSession({ planId: carrier.planId, expectedPlanRevision: carrier.revision, plannedSessionId: session.id, expectedPrescriptionHash: prescriptionHash(session.prescriptionSnapshot), operationId: "partial-sub:start", startedAt: "2026-08-07T10:00:00.000Z", provenance: "test" });
    const first = canonicalRecordedSessionLedger.get(started.recordedSessionId!);
    if (first.status !== "found") throw new Error("recorded session missing");
    expect(recordCanonicalPerformedWork({ planId: carrier.planId, expectedPlanRevision: started.planRevision!, recordedSessionId: first.session.recordedSessionId, expectedLedgerVersion: first.session.version, slotId: String(slot.id), exerciseId: String(slot.exerciseId), setId: "original:set:1", setOrder: 1, reps: 8, load: 60, unit: "kg", completion: "complete", operationId: "partial-sub:original", occurredAt: "2026-08-07T10:01:00.000Z", provenance: "offline_queue" }).status).toBe("applied");
    const afterFirst = canonicalRecordedSessionLedger.get(first.session.recordedSessionId);
    if (afterFirst.status !== "found") throw new Error("recorded session missing");
    const swap = editCanonicalExercise({ action: "replace", scope: "current_session", reason: "equipment_unavailable", planId: carrier.planId, expectedPlanRevision: started.planRevision!, recordedSessionId: afterFirst.session.recordedSessionId, expectedLedgerVersion: afterFirst.session.version, slotId: String(slot.id), sourceExerciseId: String(slot.exerciseId), exerciseId: replacement.exercise.id, operationId: "partial-sub:swap", occurredAt: "2026-08-07T10:02:00.000Z" });
    expect(swap).toMatchObject({ status: "applied", changedSessions: 1 });
    const restored = canonicalRecordedSessionLedger.get(first.session.recordedSessionId);
    if (restored.status !== "found") throw new Error("recorded session missing");
    const restoredSlot = (restored.session.prescriptionSnapshot.slots as Array<Record<string, unknown>>).find((candidate) => candidate.id === slot.id)!;
    expect(restoredSlot).toMatchObject({ exerciseId: replacement.exercise.id, substitutionScope: "current_session", substitutionReason: "equipment_unavailable" });
    expect(restored.events.find((event) => event.type === "prescription_adjusted")?.payload).toMatchObject({ performedSetsPreserved: 1, sourceExerciseId: slot.exerciseId, exerciseId: replacement.exercise.id });
    expect(editCanonicalPerformedWork({ planId: carrier.planId, expectedPlanRevision: started.planRevision!, recordedSessionId: restored.session.recordedSessionId, expectedLedgerVersion: restored.session.version, slotId: String(slot.id), exerciseId: String(slot.exerciseId), setId: "original:set:1", setOrder: 1, reps: 9, load: 60, unit: "kg", completion: "complete", operationId: "partial-sub:repair-original", occurredAt: "2026-08-07T10:03:00.000Z", provenance: "test" }).status).toBe("applied");
    const afterRepair = canonicalRecordedSessionLedger.get(first.session.recordedSessionId);
    if (afterRepair.status !== "found") throw new Error("recorded session missing");
    expect(recordCanonicalPerformedWork({ planId: carrier.planId, expectedPlanRevision: started.planRevision!, recordedSessionId: afterRepair.session.recordedSessionId, expectedLedgerVersion: afterRepair.session.version, slotId: String(slot.id), exerciseId: replacement.exercise.id, setId: "replacement:set:2", setOrder: 2, reps: 8, load: 40, unit: "kg", completion: "complete", operationId: "partial-sub:replacement", occurredAt: "2026-08-07T10:04:00.000Z", provenance: "offline_replay" }).status).toBe("applied");
    const final = canonicalRecordedSessionLedger.get(first.session.recordedSessionId);
    if (final.status !== "found") throw new Error("recorded session missing");
    const effective = effectiveCanonicalPerformedWork(final.events);
    expect(effective.map((event) => [event.payload.exerciseId, event.payload.reps])).toEqual([[slot.exerciseId, 9], [replacement.exercise.id, 8]]);
    expect(effective[0]?.payload.substitutionId).toBeUndefined();
    expect(effective[1]?.payload.substitutionId).toContain("partial-sub:swap");
    expect(editCanonicalExercise({ action: "replace", scope: "current_session", reason: "equipment_unavailable", planId: carrier.planId, expectedPlanRevision: started.planRevision!, recordedSessionId: final.session.recordedSessionId, expectedLedgerVersion: final.session.version, slotId: String(slot.id), sourceExerciseId: String(slot.exerciseId), exerciseId: replacement.exercise.id, operationId: "partial-sub:swap", occurredAt: "2026-08-07T10:02:00.000Z" })).toMatchObject({ status: "idempotent", changedSessions: 0 });
  });

  it("keeps replacement candidates compatible with rest-pause and top-set methods", () => {
    const { carrier, session } = setup();
    const slots = session.prescriptionSnapshot.slots as Array<Record<string, unknown>>;
    const restPauseSlot = { ...slots.find((candidate) => candidate.exerciseRole !== "primary_compound")!, method: "rest_pause", methodStructure: { kind: "rest_pause", method: "rest_pause" } };
    expect(rankExerciseReplacements(restPauseSlot, carrier.constraints.equipment).every(({ exercise }) => exercise.stability === "high" && exercise.skillDemand !== "high" && exercise.fatigueCost !== "high" && !exercise.equipment.includes("barbell"))).toBe(true);
    const topSetSlot = { ...slots.find((candidate) => candidate.exerciseRole === "primary_compound")!, method: "back_off_sets", methodStructure: { kind: "standalone", method: "back_off_sets" } };
    expect(rankExerciseReplacements(topSetSlot, carrier.constraints.equipment).every(({ exercise }) => exercise.setMethodEligibility?.includes("top_set_backoffs"))).toBe(true);
  });
});

function setup() {
  const created = canonicalActivePlanState.create(canonicalFiveDayFixtureInput("exercise-management"));
  if (!created.model) throw new Error("fixture creation failed");
  const loaded = canonicalActivePlanV2Repository.get();
  if (loaded.status !== "saved") throw new Error("carrier missing");
  const carrier = loaded.carrier;
  const session = carrier.plannedSessions.find((candidate) => (candidate.prescriptionSnapshot.slots as unknown[]).length >= 3)!;
  const slots = session.prescriptionSnapshot.slots as Array<Record<string, unknown>>;
  const slot = slots.find((candidate) => rankExerciseReplacements(candidate, carrier.constraints.equipment).some((item) => item.compatibility === "equivalent"))!;
  const replacement = rankExerciseReplacements(slot, carrier.constraints.equipment).find((item) => item.compatibility === "equivalent")!;
  const allIds = new Set(slots.map((item) => item.exerciseId));
  const addExercise = rankExerciseReplacements(slots.find((item) => item.constructionRole === "accessory")!, carrier.constraints.equipment).map((item) => item.exercise).find((exercise) => !allIds.has(exercise.id) && exercise.roles.some((role) => ["accessory", "isolation", "corrective", "secondary_compound"].includes(role)))!;
  return { carrier, session, slot, replacement, addExercise };
}
