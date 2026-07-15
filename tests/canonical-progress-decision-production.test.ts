import { beforeEach, describe, expect, it } from "vitest";
import { canonicalActivePlanState } from "@/application/training/canonical-active-plan-state";
import { canonicalProgressEvidenceRepository } from "@/data/local/canonical-progress-evidence-repository";
import { evaluateCanonicalProgress } from "@/domain/training/canonical-progress-evaluator";
import { produceCanonicalProgressDecision } from "@/application/training/canonical-progress-decision-production";
import { exerciseLibrary } from "@/domain/training/presets";
import { jsonStore } from "@/data/local/json-store";

describe("canonical Progress decision production", () => {
  beforeEach(() => { jsonStore.clearByPrefix("iron-logic."); jsonStore.resetCache(); });
  it("produces an idempotent continue decision from current evidence", () => {
    const created = canonicalActivePlanState.create({ planId: "decision-plan", createdAt: "2026-01-01T00:00:00.000Z", updatedAt: "2026-01-01T00:00:00.000Z", goal: "hypertrophy", macrocycleGoal: "build_muscle", experienceLevel: "intermediate", daysPerWeek: 4, preferredSplit: "upper_lower", equipment: ["barbell"], units: "kg", exercises: exerciseLibrary });
    const plan = created.model!;
    const evidenceId = "decision-evidence";
    canonicalProgressEvidenceRepository.record({ schemaVersion: "canonical_progress_evidence_v1", evidenceId, planId: plan.planId, planRevision: plan.revision, macrocycleId: plan.macrocycle.goal, mesocycleId: plan.mesocycle.id as never, microcycleId: plan.microcycle.id, athleteId: "a", observedAt: "2026-01-01T00:00:00.000Z", source: "test", kind: "readiness", observations: { ready: true }, evidenceVersion: "progress_v1" });
    const evaluation = evaluateCanonicalProgress({ plan, evidence: canonicalProgressEvidenceRepository.list(plan.planId) });
    const command = { planId: plan.planId, planRevision: plan.revision, macrocycleId: `${plan.planId}:macrocycle`, mesocycleId: plan.mesocycle.id, microcycleId: plan.microcycle.id, evaluation, evidenceVersions: { [evidenceId]: "progress_v1" }, operationId: "decision-op-1" };
    const first = produceCanonicalProgressDecision(command);
    const retry = produceCanonicalProgressDecision(command);
    expect(first.status).toBe("produced");
    expect(first.decision?.outcome).toBe("continue");
    expect(retry.reason).toBe("idempotent_retry");
    expect(canonicalActivePlanState.getState().model?.revision).toBe(plan.revision);
  });
  it("rejects stale plan production", () => {
    const created = canonicalActivePlanState.create({ planId: "stale-plan", createdAt: "2026-01-01T00:00:00.000Z", updatedAt: "2026-01-01T00:00:00.000Z", goal: "hypertrophy", macrocycleGoal: "build_muscle", experienceLevel: "intermediate", daysPerWeek: 4, preferredSplit: "upper_lower", equipment: ["barbell"], units: "kg", exercises: exerciseLibrary });
    const plan = created.model!;
    const evaluation = evaluateCanonicalProgress({ plan, evidence: [] });
    expect(produceCanonicalProgressDecision({ planId: plan.planId, planRevision: plan.revision - 1, macrocycleId: `${plan.planId}:macrocycle`, mesocycleId: plan.mesocycle.id, microcycleId: plan.microcycle.id, evaluation, evidenceVersions: {}, operationId: "stale" }).reason).toBe("stale_plan_revision");
  });
});
