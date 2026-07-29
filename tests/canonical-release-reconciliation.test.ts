import { beforeEach, describe, expect, it } from "vitest";
import { createCanonicalActivePlan } from "@/application/training/canonical-active-plan-application";
import { reconcileCanonicalReleaseState, inspectFuturePrescriptions } from "@/application/training/canonical-release-reconciliation";
import { canonicalActivePlanV2Repository } from "@/data/local/canonical-active-plan-v2-repository";
import { canonicalRecordedSessionLedger } from "@/data/local/canonical-recorded-session-ledger";
import { jsonStore } from "@/data/local/json-store";
import { exerciseLibrary } from "@/domain/training/presets";
import { completeCanonicalSession, pauseCanonicalSession, prescriptionHash, recordCanonicalPerformedWork, startCanonicalSession } from "@/application/training/canonical-recorded-session-application";
import { reconcileCanonicalActivePlanReferences } from "@/application/training/canonical-recorded-reference-reconciliation";
import { readFileSync } from "node:fs";

const equipment = ["barbell", "dumbbell", "machine", "cable", "bodyweight"] as const;
const now = "2026-07-20T08:00:00.000Z";

function createCurrent(planId = "release-reconciliation", duration: 30 | 45 | 60 | 75 | 90 = 75, daysPerWeek: 4 | 5 = 5) {
  const created = createCanonicalActivePlan({ planId, createdAt: "2026-01-01T00:00:00.000Z", updatedAt: "2026-01-01T00:00:00.000Z", goal: "hypertrophy", macrocycleGoal: "build_muscle", experienceLevel: "intermediate", daysPerWeek, preferredSplit: daysPerWeek === 4 ? "upper_lower" : "push_pull_legs", equipment, units: "kg", availableSessionMinutes: duration, exercises: exerciseLibrary });
  expect(created.status).toBe("ok");
  const loaded = canonicalActivePlanV2Repository.get();
  if (loaded.status !== "saved") throw new Error("canonical plan missing");
  return loaded.carrier;
}

function makeFutureHistorical(reason: "construction" | "target_reps" | "duration") {
  const carrier = createCurrent(`historical-${reason}`);
  const sessions = carrier.plannedSessions.map((session, index) => {
    if (reason === "construction") return { ...session, constructionVersion: "canonical_plan_v2" };
    if (reason === "target_reps" && index === 0) {
      const snapshot = session.prescriptionSnapshot as { slots: Array<Record<string, unknown>> };
      return { ...session, prescriptionSnapshot: { ...snapshot, slots: snapshot.slots.map((slot, slotIndex) => slotIndex === 0 ? Object.fromEntries(Object.entries(slot).filter(([key]) => key !== "targetReps")) : slot) } };
    }
    return session;
  });
  const next = { ...carrier, plannedSessions: sessions, constraints: reason === "duration" ? { ...carrier.constraints, availableSessionMinutes: undefined } : carrier.constraints };
  expect(canonicalActivePlanV2Repository.save(next).status).toBe("saved");
  return next;
}

describe("release-start canonical plan reconciliation", () => {
  beforeEach(() => {
    canonicalActivePlanV2Repository.clear();
    canonicalRecordedSessionLedger.clear();
    jsonStore.resetCache();
  });

  it("lets a validated existing carrier outrank stale onboarding metadata while preserving history", () => {
    const carrier = makeFutureHistorical("construction");
    expect(reconcileCanonicalReleaseState({ onboardingCompleted: false, updatedAt: now })).toMatchObject({
      status: "reconstructed",
      planVisible: true,
      historyPreserved: true,
      onboardingMetadataBackfillRequired: true,
    });
    const after = canonicalActivePlanV2Repository.get();
    expect(after.status).toBe("saved");
    if (after.status === "saved") {
      expect(after.carrier.planId).toBe(carrier.planId);
      expect(after.carrier.recordedSessionReferences ?? []).toEqual(carrier.recordedSessionReferences ?? []);
    }
  });

  it("routes completed onboarding with no plan to setup without fabricating history", () => {
    expect(reconcileCanonicalReleaseState({ onboardingCompleted: true, updatedAt: now })).toMatchObject({ status: "setup_required", planVisible: false, historyPreserved: true, activeAttempt: "none" });
    expect(canonicalRecordedSessionLedger.list("missing")).toEqual([]);
  });

  it.each(["construction", "target_reps", "duration"] as const)("reconstructs %s-stale future prescriptions atomically and idempotently", (reason) => {
    const before = makeFutureHistorical(reason);
    expect(inspectFuturePrescriptions(before).status).toBe("stale");
    const first = reconcileCanonicalReleaseState({ onboardingCompleted: true, updatedAt: now });
    expect(first).toMatchObject({ status: "reconstructed", planVisible: true, historyPreserved: true, priorRevision: 0, newRevision: 1 });
    const saved = canonicalActivePlanV2Repository.get();
    expect(saved.status).toBe("saved");
    if (saved.status !== "saved") return;
    expect(inspectFuturePrescriptions(saved.carrier)).toEqual({ status: "current", reason: "current_future_prescriptions" });
    expect(saved.carrier.plannedSessions.every((session) => session.constructionVersion === "canonical_plan_v3" && session.prescriptionSnapshot.schemaVersion === "canonical_session_snapshot_v3")).toBe(true);
    const serialized = JSON.stringify(saved.carrier);
    expect(reconcileCanonicalReleaseState({ onboardingCompleted: true, updatedAt: "2026-07-20T09:00:00.000Z" })).toMatchObject({ status: "ready", priorRevision: 1, newRevision: 1, regeneratedFutureSessions: 0 });
    const repeated = canonicalActivePlanV2Repository.get();
    if (repeated.status === "saved") expect(JSON.stringify(repeated.carrier)).toBe(serialized);
  });

  it.each([4, 5] as const)("reconstructs a validated historical %s-day canonical plan without changing its frequency", (daysPerWeek) => {
    const carrier = createCurrent(`historical-${daysPerWeek}-day`, 75, daysPerWeek);
    expect(canonicalActivePlanV2Repository.save({ ...carrier, plannedSessions: carrier.plannedSessions.map((session) => ({ ...session, constructionVersion: "canonical_plan_v2" })) }).status).toBe("saved");
    expect(reconcileCanonicalReleaseState({ onboardingCompleted: true, updatedAt: now })).toMatchObject({ status: "reconstructed", historyPreserved: true });
    const saved = canonicalActivePlanV2Repository.get();
    expect(saved.status).toBe("saved");
    if (saved.status === "saved") expect(saved.carrier.constraints.daysPerWeek).toBe(daysPerWeek);
  });

  it("retains current calibration-required v3 prescriptions without revision churn", () => {
    const carrier = createCurrent("calibration-current");
    expect((carrier.plannedSessions[0]!.prescriptionSnapshot as { slots: Array<{ loadPrescription: { state: string } }> }).slots.some((slot) => slot.loadPrescription.state === "calibration_required")).toBe(true);
    expect(reconcileCanonicalReleaseState({ onboardingCompleted: true, updatedAt: now })).toMatchObject({ status: "ready", priorRevision: 0, newRevision: 0 });
  });

  it("fails corrupt carriers into a customer-safe recovery path without replacing storage", () => {
    jsonStore.set("iron-logic.canonical-active-plan-v2", "{not-valid-json");
    const before = jsonStore.get<string | null>("iron-logic.canonical-active-plan-v2", null);
    expect(reconcileCanonicalReleaseState({ onboardingCompleted: true, updatedAt: now })).toMatchObject({ status: "recovery_required", planVisible: false, historyPreserved: true, activeAttempt: "unsafe" });
    expect(jsonStore.get<string | null>("iron-logic.canonical-active-plan-v2", null)).toBe(before);
  });

  it("rejects a missing active ledger aggregate instead of activating stale future work", () => {
    const carrier = createCurrent("unsafe-active");
    const reference = { sessionId: "missing-active", planId: carrier.planId, macrocycleId: carrier.macrocycle.id, mesocycleId: carrier.mesocycle.id, microcycleId: carrier.microcycle.id, revision: 1, status: "paused" as const, recordReference: "canonical-recorded-session:missing-active" };
    expect(canonicalActivePlanV2Repository.save({ ...carrier, recordedSessionReferences: [reference] }).status).toBe("saved");
    expect(reconcileCanonicalReleaseState({ onboardingCompleted: true, updatedAt: now })).toMatchObject({ status: "recovery_required", reason: "active_attempt_missing_from_ledger", planVisible: false, activeAttempt: "unsafe" });
  });

  it("treats a recorded reference revision as a plan revision rather than a ledger version", () => {
    const carrier = createCurrent("reference-plan-revision");
    const advanced = { ...carrier, revision: 5, progress: { ...carrier.progress, revision: 5 } };
    expect(canonicalActivePlanV2Repository.save(advanced).status).toBe("saved");
    const planned = advanced.plannedSessions[0]!;
    const started = startCanonicalSession({ planId: advanced.planId, expectedPlanRevision: 5, plannedSessionId: planned.id, expectedPrescriptionHash: prescriptionHash(planned.prescriptionSnapshot), operationId: "reference:start", startedAt: now, provenance: "release_reconciliation_test" });
    expect(started).toMatchObject({ status: "started", planRevision: 6 });
    const aggregate = canonicalRecordedSessionLedger.get(started.recordedSessionId!);
    expect(aggregate.status).toBe("found");
    if (aggregate.status !== "found") return;
    expect(aggregate.session.version).toBe(1);
    const saved = canonicalActivePlanV2Repository.get();
    expect(saved.status).toBe("saved");
    if (saved.status !== "saved") return;
    expect(saved.carrier.recordedSessionReferences?.[0]?.revision).toBe(6);
    expect(reconcileCanonicalActivePlanReferences()).toMatchObject({ status: "ready", repairedSessionIds: [] });
  });

  it("fails closed when a recorded reference is genuinely ahead of the active plan revision", () => {
    const carrier = createCurrent("reference-ahead");
    const planned = carrier.plannedSessions[0]!;
    const started = startCanonicalSession({ planId: carrier.planId, expectedPlanRevision: 0, plannedSessionId: planned.id, expectedPrescriptionHash: prescriptionHash(planned.prescriptionSnapshot), operationId: "ahead:start", startedAt: now, provenance: "release_reconciliation_test" });
    expect(started.status).toBe("started");
    const saved = canonicalActivePlanV2Repository.get();
    expect(saved.status).toBe("saved");
    if (saved.status !== "saved") return;
    const corrupted = { ...saved.carrier, recordedSessionReferences: saved.carrier.recordedSessionReferences?.map((reference) => ({ ...reference, revision: saved.carrier.revision + 1 })) };
    expect(canonicalActivePlanV2Repository.save(corrupted).status).toBe("saved");
    expect(reconcileCanonicalActivePlanReferences()).toMatchObject({ status: "recorded_history_corrupt", reason: `carrier_ahead:${started.recordedSessionId}` });
  });

  it.each(["started", "paused"] as const)("preserves a compatible %s immutable attempt while rebuilding only stale future work", (lifecycle) => {
    const carrier = createCurrent(`safe-${lifecycle}`);
    const planned = carrier.plannedSessions[0]!;
    const started = startCanonicalSession({ planId: carrier.planId, expectedPlanRevision: carrier.revision, plannedSessionId: planned.id, expectedPrescriptionHash: prescriptionHash(planned.prescriptionSnapshot), operationId: `${lifecycle}:start`, startedAt: "2026-07-20T08:00:00.000Z", provenance: "release_reconciliation_test" });
    expect(started.status).toBe("started");
    let planRevision = started.planRevision!;
    const recordedSessionId = started.recordedSessionId!;
    if (lifecycle === "paused") {
      const paused = pauseCanonicalSession({ planId: carrier.planId, expectedPlanRevision: planRevision, recordedSessionId, expectedLedgerVersion: 1, operationId: "pause", occurredAt: "2026-07-20T08:05:00.000Z", provenance: "release_reconciliation_test" });
      expect(paused.status).toBe("applied");
      planRevision = paused.planRevision!;
    }
    const activeBefore = canonicalRecordedSessionLedger.get(recordedSessionId);
    const current = canonicalActivePlanV2Repository.get();
    if (current.status !== "saved") throw new Error("active carrier missing");
    expect(current.carrier.revision).toBe(planRevision);
    expect(canonicalActivePlanV2Repository.save({ ...current.carrier, plannedSessions: current.carrier.plannedSessions.map((session) => ({ ...session, constructionVersion: "canonical_plan_v2" })) }).status).toBe("saved");
    expect(reconcileCanonicalReleaseState({ onboardingCompleted: true, updatedAt: now })).toMatchObject({ status: "reconstructed", activeAttempt: "resumable", historyPreserved: true, priorRevision: planRevision, newRevision: planRevision + 1 });
    expect(canonicalRecordedSessionLedger.get(recordedSessionId)).toEqual(activeBefore);
  });

  it("preserves completed canonical history byte-for-byte while stale future work is regenerated", () => {
    const carrier = createCurrent("completed-history");
    const planned = carrier.plannedSessions[0]!;
    const started = startCanonicalSession({ planId: carrier.planId, expectedPlanRevision: 0, plannedSessionId: planned.id, expectedPrescriptionHash: prescriptionHash(planned.prescriptionSnapshot), operationId: "history:start", startedAt: "2026-07-20T08:00:00.000Z", provenance: "release_reconciliation_test" });
    const aggregate = canonicalRecordedSessionLedger.get(started.recordedSessionId!);
    if (aggregate.status !== "found") throw new Error("recorded session missing");
    const slot = ((aggregate.session.prescriptionSnapshot as { slots: Array<{ id: string; exerciseId: string }> }).slots[0])!;
    expect(recordCanonicalPerformedWork({ planId: carrier.planId, expectedPlanRevision: started.planRevision!, recordedSessionId: aggregate.session.recordedSessionId, expectedLedgerVersion: aggregate.session.version, operationId: "history:set", occurredAt: "2026-07-20T08:10:00.000Z", provenance: "release_reconciliation_test", slotId: slot.id, exerciseId: slot.exerciseId, setId: "history:set:1", setOrder: 1, reps: 8, load: 50, unit: "kg", completion: "complete" }).status).toBe("applied");
    expect(completeCanonicalSession({ planId: carrier.planId, expectedPlanRevision: started.planRevision!, recordedSessionId: aggregate.session.recordedSessionId, expectedLedgerVersion: 2, operationId: "history:complete", occurredAt: "2026-07-20T09:00:00.000Z", provenance: "release_reconciliation_test" }).status).toBe("applied");
    expect(["ready", "ready_after_reconciliation"]).toContain(reconcileCanonicalActivePlanReferences().status);
    const historyBefore = JSON.stringify(canonicalRecordedSessionLedger.exportPlan(carrier.planId));
    const current = canonicalActivePlanV2Repository.get();
    if (current.status !== "saved") throw new Error("completed carrier missing");
    expect(canonicalActivePlanV2Repository.save({ ...current.carrier, plannedSessions: current.carrier.plannedSessions.map((session) => ({ ...session, constructionVersion: "canonical_plan_v2" })) }).status).toBe("saved");
    expect(reconcileCanonicalReleaseState({ onboardingCompleted: true, updatedAt: now })).toMatchObject({ status: "reconstructed", historyPreserved: true, activeAttempt: "none" });
    expect(JSON.stringify(canonicalRecordedSessionLedger.exportPlan(carrier.planId))).toBe(historyBefore);
  });

  it("keeps completed canonical ledger history when the active carrier is missing", () => {
    const carrier = createCurrent("completed-history-no-plan");
    const planned = carrier.plannedSessions[0]!;
    const started = startCanonicalSession({ planId: carrier.planId, expectedPlanRevision: 0, plannedSessionId: planned.id, expectedPrescriptionHash: prescriptionHash(planned.prescriptionSnapshot), operationId: "orphan:start", startedAt: "2026-07-20T08:00:00.000Z", provenance: "release_reconciliation_test" });
    const aggregate = canonicalRecordedSessionLedger.get(started.recordedSessionId!);
    if (aggregate.status !== "found") throw new Error("recorded session missing");
    const slot = (aggregate.session.prescriptionSnapshot as { slots: Array<{ id: string; exerciseId: string }> }).slots[0]!;
    expect(recordCanonicalPerformedWork({ planId: carrier.planId, expectedPlanRevision: started.planRevision!, recordedSessionId: aggregate.session.recordedSessionId, expectedLedgerVersion: aggregate.session.version, operationId: "orphan:set", occurredAt: "2026-07-20T08:10:00.000Z", provenance: "release_reconciliation_test", slotId: slot.id, exerciseId: slot.exerciseId, setId: "orphan:set:1", setOrder: 1, reps: 8, load: 50, unit: "kg", completion: "complete" }).status).toBe("applied");
    expect(completeCanonicalSession({ planId: carrier.planId, expectedPlanRevision: started.planRevision!, recordedSessionId: aggregate.session.recordedSessionId, expectedLedgerVersion: 2, operationId: "orphan:complete", occurredAt: "2026-07-20T09:00:00.000Z", provenance: "release_reconciliation_test" }).status).toBe("applied");
    const before = JSON.stringify(canonicalRecordedSessionLedger.exportPlan(carrier.planId));
    canonicalActivePlanV2Repository.clear();
    expect(reconcileCanonicalReleaseState({ onboardingCompleted: true, updatedAt: now })).toMatchObject({ status: "setup_required", planVisible: false, historyPreserved: true });
    expect(JSON.stringify(canonicalRecordedSessionLedger.exportPlan(carrier.planId))).toBe(before);
  });

  it("keeps the deterministic persisted-state matrix complete and uniquely classified", () => {
    const artifact = JSON.parse(readFileSync("qa-reports/release-candidate/canonical-persisted-reconciliation-matrix.json", "utf8")) as { reconciliationVersion: string; cases: Array<{ id: string; result: string }> };
    expect(artifact.reconciliationVersion).toBe("canonical_release_reconciliation_v1");
    expect(artifact.cases.map((entry) => entry.id)).toEqual(["no_onboarding", "onboarding_complete_no_plan", "old_four_day_plan", "old_five_day_plan", "pre_target_reps", "pre_duration", "old_calibration_required", "old_active_attempt", "paused_attempt", "corrupt_attempt", "completed_history_no_plan", "completed_history_stale_future"]);
    expect(new Set(artifact.cases.map((entry) => entry.id)).size).toBe(12);
    expect(artifact.cases.every((entry) => entry.result.length > 0)).toBe(true);
  });
});
