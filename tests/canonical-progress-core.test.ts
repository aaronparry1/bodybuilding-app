import { beforeEach, describe, expect, it, vi } from "vitest";
import { canonicalProgressEvidenceRepository } from "@/data/local/canonical-progress-evidence-repository";
import { evaluateCanonicalProgress } from "@/domain/training/canonical-progress-evaluator";
import { canonicalProgressDecisionRepository } from "@/data/local/canonical-progress-decision-repository";
import type { CanonicalActivePlanReadModel } from "@/application/training/canonical-active-plan-application";
import { getLocalStorage } from "@/data/local/local-storage";

const plan = { schemaVersion: "canonical_active_plan_read_model_v1", planId: "p", revision: 1, equipment: ["barbell", "dumbbell", "machine", "cable", "bodyweight"], macrocycle: { goal: "hypertrophy", rolling: true }, mesocycle: { id: "hypertrophy_accumulation_1", position: 0, purpose: "accumulate" }, microcycle: { id: "p:micro", sequenceNumber: 1, trainingDays: 2, sessionRoles: ["Full body 1", "Full body 2"] }, plannedSessions: [], nextSession: null, progress: { evidenceVersion: "progress_v1", revision: 0 } } as CanonicalActivePlanReadModel;

describe("canonical Progress core", () => {
  beforeEach(() => canonicalProgressEvidenceRepository.clear());
  beforeEach(() => canonicalProgressDecisionRepository.clear());
  it("records immutable idempotent evidence and evaluates it without prescription decisions", () => {
    const evidence = { schemaVersion: "canonical_progress_evidence_v1" as const, evidenceId: "e1", planId: "p", planRevision: 1, macrocycleId: "macro", mesocycleId: "hypertrophy_accumulation_1" as any, microcycleId: "p:micro", athleteId: "athlete", observedAt: "2026-01-01T00:00:00.000Z", source: "test", kind: "performance" as const, observations: { completedSets: 4 }, evidenceVersion: "progress_v1" };
    expect(canonicalProgressEvidenceRepository.record(evidence).status).toBe("saved");
    expect(canonicalProgressEvidenceRepository.record(evidence).status).toBe("duplicate");
    expect(evaluateCanonicalProgress({ plan, evidence: canonicalProgressEvidenceRepository.list("p") }).state).toBe("ready");
  });
  it("restores a large evidence envelope through one idempotent batch", () => {
    const evidence = Array.from({ length: 500 }, (_, index) => ({ schemaVersion: "canonical_progress_evidence_v1" as const, evidenceId: `batch-${index}`, planId: "p", planRevision: 1, macrocycleId: "macro", mesocycleId: "hypertrophy_accumulation_1" as any, microcycleId: "p:micro", athleteId: "athlete", observedAt: `2026-01-01T00:${String(index % 60).padStart(2, "0")}:00.000Z`, source: "cloud_restore", kind: "performance" as const, observations: { completedSets: index }, evidenceVersion: "progress_v1" }));
    const writes = vi.spyOn(getLocalStorage(), "setItem");
    expect(canonicalProgressEvidenceRepository.recordBatch(evidence).status).toBe("saved");
    expect(writes).toHaveBeenCalledTimes(1);
    writes.mockRestore();
    expect(canonicalProgressEvidenceRepository.list("p")).toHaveLength(500);
    expect(canonicalProgressEvidenceRepository.recordBatch(evidence).status).toBe("duplicate");
  });
  it("persists canonical decisions idempotently without legacy plan fields", () => {
    const decision = { schemaVersion: "canonical_progress_decision_v1" as const, decisionId: "d1", planId: "p", expectedPlanRevision: 1, macrocycleId: "macro", mesocycleId: "m", microcycleId: "micro", evaluationId: "e", evidenceIds: ["e1"], outcome: "continue" as const, owner: "mesocycle" as const, reason: "sufficient_evidence", explanation: "Continue current adaptation.", status: "current" as const };
    expect(canonicalProgressDecisionRepository.save(decision).status).toBe("saved");
    expect(canonicalProgressDecisionRepository.save(decision).status).toBe("duplicate");
    expect(canonicalProgressDecisionRepository.current("p", "m")).toHaveLength(1);
  });
  it("fails closed on evidence identity conflicts and exposes review signals", () => {
    const evidence = { schemaVersion: "canonical_progress_evidence_v1" as const, evidenceId: "e2", planId: "p", planRevision: 1, macrocycleId: "macro", mesocycleId: "hypertrophy_accumulation_1" as any, microcycleId: "p:micro", athleteId: "athlete", observedAt: "2026-01-01T00:00:00.000Z", source: "test", kind: "review_request" as const, observations: { requested: true }, evidenceVersion: "progress_v1" };
    canonicalProgressEvidenceRepository.record(evidence);
    expect(canonicalProgressEvidenceRepository.record({ ...evidence, observations: { requested: false } }).status).toBe("conflict");
    expect(evaluateCanonicalProgress({ plan, evidence: canonicalProgressEvidenceRepository.list("p") }).state).toBe("review_required");
  });
});
