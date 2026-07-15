import { beforeEach, describe, expect, it } from "vitest";
import { canonicalActivePlanState } from "@/application/training/canonical-active-plan-state";
import { evaluateCanonicalGoalPhaseIntervention, evaluateCanonicalRecoveryPhaseIntervention } from "@/domain/training/canonical-recovery-phase-intervention-evaluator";
import { resolveMesocyclePrescriptionPolicy } from "@/domain/training/mesocycle-prescription-policy";
import { exerciseLibrary } from "@/domain/training/presets";

describe("canonical recovery and goal/phase interventions", () => {
  beforeEach(() => canonicalActivePlanState.clear());

  it("fails closed for missing evidence and never carries prescriptions", () => {
    const created = canonicalActivePlanState.create({ planId: "evidence-missing", createdAt: "2026-01-01T00:00:00.000Z", updatedAt: "2026-01-01T00:00:00.000Z", goal: "hypertrophy", macrocycleGoal: "build_muscle", experienceLevel: "intermediate", daysPerWeek: 4, preferredSplit: "upper_lower", equipment: ["barbell"], units: "kg", exercises: exerciseLibrary, history: [] });
    expect(created.model).toBeTruthy();
    const plan = canonicalActivePlanState.getReadModel()!;
    const policy = resolveMesocyclePrescriptionPolicy(plan.mesocycle.id as never)!;
    if (policy.status !== "resolved") throw new Error("policy_missing");
    const result = evaluateCanonicalRecoveryPhaseIntervention({ plan, policy: policy.policy, evidence: [], evidenceState: "missing", operationId: "op-1", intent: "recovery" });
    expect(result.disposition).toBe("insufficient_evidence");
    expect(result.policyVersion).toBe(policy.policy.schemaVersion);
    expect(result).not.toHaveProperty("sets");
    expect(result).not.toHaveProperty("reps");
  });

  it("resolves fresh deload evidence without mutating the plan", () => {
    const created = canonicalActivePlanState.create({ planId: "deload-evidence", createdAt: "2026-01-01T00:00:00.000Z", updatedAt: "2026-01-01T00:00:00.000Z", goal: "hypertrophy", macrocycleGoal: "build_muscle", experienceLevel: "intermediate", daysPerWeek: 4, preferredSplit: "upper_lower", equipment: ["barbell"], units: "kg", exercises: exerciseLibrary, history: [] });
    expect(created.model).toBeTruthy();
    const plan = canonicalActivePlanState.getReadModel()!;
    const policyResult = resolveMesocyclePrescriptionPolicy(plan.mesocycle.id as never);
    if (policyResult.status !== "resolved") throw new Error("policy_missing");
    const evidence = [{ schemaVersion: "canonical_progress_evidence_v1" as const, evidenceId: "ev-1", planId: plan.planId, planRevision: plan.revision, macrocycleId: `${plan.planId}:macrocycle`, mesocycleId: plan.mesocycle.id as never, microcycleId: plan.microcycle.id, athleteId: "athlete", observedAt: "2026-01-01T00:00:00.000Z", source: "test", kind: "readiness" as const, observations: { deloadRequired: true }, evidenceVersion: "1" }];
    const result = evaluateCanonicalRecoveryPhaseIntervention({ plan, policy: policyResult.policy, evidence, evidenceState: "fresh", operationId: "op-2", intent: "recovery" });
    expect(result.disposition).toBe("deload");
    expect(canonicalActivePlanState.getReadModel()?.revision).toBe(plan.revision);
  });

  it("keeps goal review on route unless canonical evidence permits transition", () => {
    const created = canonicalActivePlanState.create({ planId: "goal-evidence", createdAt: "2026-01-01T00:00:00.000Z", updatedAt: "2026-01-01T00:00:00.000Z", goal: "hypertrophy", macrocycleGoal: "build_muscle", experienceLevel: "intermediate", daysPerWeek: 4, preferredSplit: "upper_lower", equipment: ["barbell"], units: "kg", exercises: exerciseLibrary, history: [] });
    expect(created.model).toBeTruthy();
    const plan = canonicalActivePlanState.getReadModel()!;
    const policyResult = resolveMesocyclePrescriptionPolicy(plan.mesocycle.id as never);
    if (policyResult.status !== "resolved") throw new Error("policy_missing");
    const result = evaluateCanonicalGoalPhaseIntervention({ plan, policy: policyResult.policy, evidence: [], evidenceState: "fresh", operationId: "op-3", intent: "goal_or_phase" });
    expect(result.disposition).toBe("remain_on_route");
    expect(result.applicationOwner).toBe("Macrocycle");
  });
});
