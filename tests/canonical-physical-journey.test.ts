import { beforeEach, describe, expect, it } from "vitest";
import { createCanonicalActivePlan, loadCanonicalActivePlan } from "@/application/training/canonical-active-plan-application";
import { canonicalActivePlanV2Repository } from "@/data/local/canonical-active-plan-v2-repository";
import { canonicalRecordedSessionLedger } from "@/data/local/canonical-recorded-session-ledger";
import { canonicalProgressEvidenceRepository } from "@/data/local/canonical-progress-evidence-repository";
import { startCanonicalSession, recordCanonicalPerformedWork, pauseCanonicalSession, resumeCanonicalSession, completeCanonicalSession, prescriptionHash } from "@/application/training/canonical-recorded-session-application";

const exercise = { id: "journey-press", name: "Journey Press", category: "chest", primaryMuscles: ["chest"], secondaryMuscles: [], equipment: ["barbell"], movementPattern: "horizontal_push", defaultRepRange: { min: 6, max: 12 }, defaultLoadJump: 2.5, unitCompatibility: ["kg"], kind: "barbell", role: "primary_compound", roles: ["primary_compound", "secondary_compound", "accessory", "isolation"], family: "horizontal_press", tier: "A", fatigueCost: "low", jointStress: "low", suitability: ["beginner", "intermediate", "advanced"], isBeginnerFriendly: true, isAdvanced: false, notes: [], suitableBlocks: [], swapTags: [], isCustom: false, defaultSettings: { repRange: { min: 6, max: 12 }, dropOffPercent: 0, loadIncrease: 2.5, unit: "kg", requiredWorkSets: 3 } } as any;

describe("canonical physical journey", () => {
  beforeEach(() => { canonicalActivePlanV2Repository.clear(); canonicalRecordedSessionLedger.clear(); canonicalProgressEvidenceRepository.clear(); });

  it("hydrates, starts, records, restores, completes and remains idempotent", () => {
    const created = createCanonicalActivePlan({ planId: "journey-plan", createdAt: "2026-01-01T00:00:00.000Z", updatedAt: "2026-01-01T00:00:00.000Z", goal: "strength_hypertrophy", macrocycleGoal: "build_muscle", experienceLevel: "intermediate", daysPerWeek: 3, preferredSplit: "push_pull_legs", equipment: ["barbell"], units: "kg", exercises: [exercise], establishedLoads: { [exercise.id]: 80 }, history: [] });
    expect(created.status).toBe("ok");
    if (created.status !== "ok") return;
    const planned = created.model.nextSession && created.model.plannedSessions.find((candidate) => candidate.id === created.model.nextSession!.id);
    expect(planned).toBeTruthy();
    const started = startCanonicalSession({ planId: created.model.planId, expectedPlanRevision: created.model.revision, plannedSessionId: planned!.id, expectedPrescriptionHash: prescriptionHash(planned!.snapshot), operationId: "journey-start", startedAt: "2026-01-01T00:01:00.000Z", provenance: "canonical_journey_test" });
    expect(started.status).toBe("started");
    const recordedSessionId = started.recordedSessionId!;
    const aggregate = canonicalRecordedSessionLedger.get(recordedSessionId);
    expect(aggregate.status).toBe("found");
    if (aggregate.status !== "found") return;
    const slot = (aggregate.session.prescriptionSnapshot as any).slots[0];
    const work = recordCanonicalPerformedWork({ planId: created.model.planId, expectedPlanRevision: started.planRevision!, recordedSessionId, expectedLedgerVersion: aggregate.session.version, operationId: "journey-set", occurredAt: "2026-01-01T00:02:00.000Z", provenance: "canonical_journey_test", slotId: slot.id, exerciseId: slot.exerciseId, setId: "journey-set", setOrder: 1, reps: 8, load: 80, unit: "kg", completion: "complete" });
    expect(work.status).toBe("applied");
    const paused = pauseCanonicalSession({ planId: created.model.planId, expectedPlanRevision: started.planRevision! + 1, recordedSessionId, expectedLedgerVersion: work.ledgerVersion!, operationId: "journey-pause", occurredAt: "2026-01-01T00:03:00.000Z", provenance: "canonical_journey_test" });
    expect(paused.status).toBe("applied");
    const resumed = resumeCanonicalSession({ planId: created.model.planId, expectedPlanRevision: paused.planRevision!, recordedSessionId, expectedLedgerVersion: paused.ledgerVersion!, operationId: "journey-resume", occurredAt: "2026-01-01T00:04:00.000Z", provenance: "canonical_journey_test" });
    expect(resumed.status).toBe("applied");
    const completed = completeCanonicalSession({ planId: created.model.planId, expectedPlanRevision: resumed.planRevision!, recordedSessionId, expectedLedgerVersion: resumed.ledgerVersion!, operationId: "journey-complete", occurredAt: "2026-01-01T00:05:00.000Z", provenance: "canonical_journey_test" });
    expect(completed.status).toBe("applied");
    expect(completeCanonicalSession({ planId: created.model.planId, expectedPlanRevision: completed.planRevision ?? resumed.planRevision!, recordedSessionId, expectedLedgerVersion: completed.ledgerVersion!, operationId: "journey-complete-retry", occurredAt: "2026-01-01T00:05:01.000Z", provenance: "canonical_journey_test" }).status).toBe("idempotent");
    const restored = loadCanonicalActivePlan();
    expect(restored.status).toBe("ok");
    if (restored.status === "ok") expect(restored.model.historicalRecordedSessions).toHaveLength(1);
    expect(canonicalProgressEvidenceRepository.list(created.model.planId).some((evidence) => evidence.kind === "completion")).toBe(true);
  });
});
