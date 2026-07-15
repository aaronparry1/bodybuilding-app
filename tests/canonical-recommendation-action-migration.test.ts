import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { applyCanonicalRecommendationAction } from "@/application/training/canonical-recommendation-actions";

describe("canonical recommendation action migration", () => {
  it("publishes migration evidence without legacy application reachability", () => {
    const artifact = JSON.parse(readFileSync(resolve(process.cwd(), "qa-reports/legacy-migration-change-control/canonical-recommendation-action-migration-result.json"), "utf8"));
    expect(artifact.legacyDecisionApplicationReachability).toBe(false);
    expect(artifact.activePlanRepositoryReachabilityFromRecommendationPath).toBe(false);
    expect(artifact.dualWrite).toBe(false);
    expect(artifact.productionSwitchCompleted).toBe(false);
  });

  it("rejects an incomplete canonical command before any mutation", () => {
    const result = applyCanonicalRecommendationAction({ action: { kind: "continue_mesocycle", owner: "mesocycle", planId: "missing", mesocycleId: "missing", microcycleNumber: 1, evidenceId: "missing", evidenceVersion: "canonical_progress_evidence_v1", reason: "review", expectedDecisionId: "missing", explanation: "review" }, expectedPlanRevision: 0, evaluationVersion: "canonical_progress_evaluation_v2", operationId: "test:missing" });
    expect(result.status).toBe("rejected");
  });
});
