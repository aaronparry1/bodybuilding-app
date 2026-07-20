import { beforeEach, describe, expect, it } from "vitest";
import { createCanonicalActivePlan, loadCanonicalActivePlan } from "@/application/training/canonical-active-plan-application";
import { canonicalActivePlanV2Repository } from "@/data/local/canonical-active-plan-v2-repository";
import { canonicalRecordedSessionLedger } from "@/data/local/canonical-recorded-session-ledger";
import { canonicalProgressEvidenceRepository } from "@/data/local/canonical-progress-evidence-repository";
import { startCanonicalSession, recordCanonicalPerformedWork, editCanonicalPerformedWork, pauseCanonicalSession, resumeCanonicalSession, completeCanonicalSession, prescriptionHash } from "@/application/training/canonical-recorded-session-application";
import { exerciseLibrary } from "@/domain/training/presets";
import { projectCanonicalHome } from "@/application/training/canonical-home-projection";
import { projectCanonicalPlanPresentation } from "@/application/training/canonical-plan-presentation";
import { projectCanonicalTrainSession } from "@/application/training/canonical-train-session-boundary";
import { canonicalRestTimerRepository } from "@/data/local/canonical-rest-timer-repository";

describe("canonical physical journey", () => {
  beforeEach(() => { canonicalActivePlanV2Repository.clear(); canonicalRecordedSessionLedger.clear(); canonicalProgressEvidenceRepository.clear(); canonicalRestTimerRepository.clear(); });

  it("hydrates, starts, records, restores, completes and remains idempotent", () => {
    const created = createCanonicalActivePlan({ planId: "journey-plan", createdAt: "2026-01-01T08:00:00.000Z", updatedAt: "2026-01-01T08:00:00.000Z", goal: "strength_hypertrophy", macrocycleGoal: "build_muscle", experienceLevel: "intermediate", daysPerWeek: 3, preferredSplit: "push_pull_legs", equipment: ["barbell", "dumbbell", "machine", "cable", "bodyweight"], units: "kg", availableSessionMinutes: 75, exercises: exerciseLibrary, establishedLoads: Object.fromEntries(exerciseLibrary.map((exercise) => [exercise.id, 80])), history: [] });
    expect(created.status).toBe("ok");
    if (created.status !== "ok") return;
    const planned = created.model.nextSession && created.model.plannedSessions.find((candidate) => candidate.id === created.model.nextSession!.id);
    expect(planned).toBeTruthy();
    const home = projectCanonicalHome({ status: "ready", model: created.model, now: Date.parse("2026-01-01T08:00:00.000Z") });
    const plan = projectCanonicalPlanPresentation({ status: "ready", model: created.model });
    expect(home.primary?.action).toMatchObject({ type: "open_planned_session", sessionId: planned!.id });
    expect(plan.primaryAction).toMatchObject({ type: "open_planned_session", sessionId: planned!.id });
    const started = startCanonicalSession({ planId: created.model.planId, expectedPlanRevision: created.model.revision, plannedSessionId: planned!.id, expectedPrescriptionHash: prescriptionHash(planned!.snapshot), operationId: "journey-start", startedAt: "2026-01-01T08:01:00.000Z", provenance: "canonical_journey_test" });
    expect(started.status).toBe("started");
    const recordedSessionId = started.recordedSessionId!;
    const aggregate = canonicalRecordedSessionLedger.get(recordedSessionId);
    expect(aggregate.status).toBe("found");
    if (aggregate.status !== "found") return;
    const slots = (aggregate.session.prescriptionSnapshot as { slots: Array<{ id: string; exerciseId: string; targetReps: number; exactTargets?: number[]; settings: { requiredSets?: number; requiredWorkSets: number } }> }).slots;
    const prescribedWorkingSets = slots.reduce((sum, slot) => sum + (slot.settings.requiredSets ?? slot.settings.requiredWorkSets), 0);
    let ledgerVersion = aggregate.session.version;
    let setNumber = 0;
    for (const slot of slots) {
      const requiredSets = slot.settings.requiredSets ?? slot.settings.requiredWorkSets;
      for (let setOrder = 1; setOrder <= requiredSets; setOrder += 1) {
        setNumber += 1;
        const work = recordCanonicalPerformedWork({ planId: created.model.planId, expectedPlanRevision: started.planRevision!, recordedSessionId, expectedLedgerVersion: ledgerVersion, operationId: `journey-set:${setNumber}`, occurredAt: new Date(Date.parse("2026-01-01T08:01:00.000Z") + setNumber * 180_000).toISOString(), provenance: "canonical_journey_test", slotId: slot.id, exerciseId: slot.exerciseId, setId: `${slot.id}:set:${setOrder}`, setOrder, reps: slot.exactTargets?.[setOrder - 1] ?? slot.targetReps, load: 80, unit: "kg", completion: "complete" });
        expect(work.status).toBe("applied");
        ledgerVersion = work.ledgerVersion!;
      }
    }
    expect(setNumber).toBe(prescribedWorkingSets);
    expect(canonicalRestTimerRepository.get(recordedSessionId)?.state).toBe("running");
    const first = slots[0]!;
    const edited = editCanonicalPerformedWork({ planId: created.model.planId, expectedPlanRevision: started.planRevision!, recordedSessionId, expectedLedgerVersion: ledgerVersion, operationId: "journey-edit", occurredAt: new Date(Date.parse("2026-01-01T08:01:00.000Z") + (setNumber + 1) * 180_000).toISOString(), provenance: "canonical_journey_test", slotId: first.id, exerciseId: first.exerciseId, setId: `${first.id}:set:1`, setOrder: 1, reps: first.exactTargets?.[0] ?? first.targetReps, load: 77.5, unit: "kg", completion: "complete" });
    expect(edited.status).toBe("applied");
    ledgerVersion = edited.ledgerVersion!;
    const activeProjection = projectCanonicalTrainSession(created.model.planId, recordedSessionId);
    expect(activeProjection.status).toBe("projected");
    if (activeProjection.status === "projected") {
      expect(activeProjection.projection.plannedSessionId).toBe(planned!.id);
      expect(activeProjection.projection.slots.flatMap((slot) => slot.performed)).toHaveLength(prescribedWorkingSets);
    }
    const beforePause = canonicalActivePlanV2Repository.get();
    if (beforePause.status !== "saved") throw new Error("plan missing before pause");
    const paused = pauseCanonicalSession({ planId: created.model.planId, expectedPlanRevision: beforePause.carrier.revision, recordedSessionId, expectedLedgerVersion: ledgerVersion, operationId: "journey-pause", occurredAt: "2026-01-01T09:10:00.000Z", provenance: "canonical_journey_test" });
    expect(paused.status, paused.reason).toBe("applied");
    expect(canonicalRestTimerRepository.get(recordedSessionId)?.state).toBe("paused");
    const resumed = resumeCanonicalSession({ planId: created.model.planId, expectedPlanRevision: paused.planRevision!, recordedSessionId, expectedLedgerVersion: paused.ledgerVersion!, operationId: "journey-resume", occurredAt: "2026-01-01T09:12:00.000Z", provenance: "canonical_journey_test" });
    expect(resumed.status).toBe("applied");
    expect(canonicalRestTimerRepository.get(recordedSessionId)?.state).toBe("running");
    const completed = completeCanonicalSession({ planId: created.model.planId, expectedPlanRevision: resumed.planRevision!, recordedSessionId, expectedLedgerVersion: resumed.ledgerVersion!, operationId: "journey-complete", occurredAt: "2026-01-01T09:15:00.000Z", provenance: "canonical_journey_test" });
    expect(completed.status).toBe("applied");
    expect(canonicalRestTimerRepository.get(recordedSessionId)).toBeNull();
    expect(completeCanonicalSession({ planId: created.model.planId, expectedPlanRevision: completed.planRevision ?? resumed.planRevision!, recordedSessionId, expectedLedgerVersion: completed.ledgerVersion!, operationId: "journey-complete-retry", occurredAt: "2026-01-01T09:15:01.000Z", provenance: "canonical_journey_test" }).status).toBe("idempotent");
    const restored = loadCanonicalActivePlan();
    expect(restored.status).toBe("ok");
    if (restored.status === "ok") {
      expect(restored.model.historicalRecordedSessions).toHaveLength(1);
      expect(restored.model.historicalRecordedSessions?.[0]).toMatchObject({ performedSets: prescribedWorkingSets, status: "completed" });
      expect(restored.model.nextSession?.id).not.toBe(planned!.id);
    }
    expect(canonicalProgressEvidenceRepository.list(created.model.planId).some((evidence) => evidence.kind === "completion")).toBe(true);
  });
});
