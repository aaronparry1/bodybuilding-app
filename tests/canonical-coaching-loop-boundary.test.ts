import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

const source = (path: string) => readFileSync(path, "utf8");

describe("canonical coaching-loop production boundary", () => {
  it("mounts exactly one factual post-workout evaluator behind durable completion", () => {
    const completion = source("src/application/training/canonical-recorded-session-application.ts");
    const orchestrator = source("src/application/training/canonical-post-workout-orchestrator.ts");
    const evaluator = source("src/domain/training/canonical-progress-evaluator.ts");
    expect(completion).toContain("orchestrateCanonicalPostWorkoutAdaptation");
    expect(completion).toContain("isPlannedRecordedSession");
    expect(orchestrator).toContain("evaluateCanonicalPostWorkoutProgress");
    expect(orchestrator).toContain("canonicalActivePlanState.applyProgressDecision");
    expect(orchestrator).toContain("completionEvidence.evidence.observedAt");
    expect(evaluator).toContain("Caller-authored transition/deload booleans are deliberately ignored");
  });

  it("keeps coaching authority out of mounted Home, Plan, Train and completion presentation", () => {
    for (const path of [
      "app/(protected)/(tabs)/index.tsx",
      "app/(protected)/(tabs)/programmes.tsx",
      "app/(protected)/(tabs)/train.tsx",
      "app/(protected)/completion-summary.tsx",
      "src/application/training/canonical-home-projection.ts",
      "src/application/training/canonical-plan-projections.ts",
    ]) {
      const value = source(path);
      expect(value, path).not.toMatch(/evaluateCanonicalPostWorkoutProgress|produceCanonicalProgressDecision|applyCanonicalProgressDecision/);
    }
  });

  it("reconstructs established loads by exercise identity and retains slot identity only as provenance", () => {
    const facts = source("src/application/training/canonical-construction-facts.ts");
    expect(facts).toContain("item.observations.exerciseId");
    expect(facts).toContain("establishedLoads[exerciseId]");
    expect(facts).toContain("sourceSlotId: latest.slotId");
    expect(facts).not.toMatch(/establishedLoads\[[^\]]*slotId/);
  });

  it("retains protected transactional, Discard and method-policy boundaries", () => {
    const recorded = source("src/application/training/canonical-recorded-session-application.ts");
    const methodPolicy = source("src/domain/training/canonical-training-method-policy.ts");
    expect(recorded).toContain("discardCanonicalSessionAttempt");
    expect(recorded).toContain("discard_compensation_failed");
    expect(recorded).toContain("performed_work_already_recorded");
    expect(methodPolicy).toContain("canonical_training_method_policy_v1");
    expect(methodPolicy).toContain("unsupported");
  });
});
