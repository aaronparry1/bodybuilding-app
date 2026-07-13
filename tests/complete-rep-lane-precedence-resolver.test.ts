import { describe, expect, it } from "vitest";
import { COMPLETE_REP_LANE_AGGREGATE_REGISTRY } from "@/domain/training/complete-rep-lane-aggregate-contracts";
import { resolveCompleteRepLanePrecedence } from "@/domain/training/complete-rep-lane-precedence-resolver";

describe("D4E3C4C complete precedence resolver", () => {
  it("derives a coherent result from facts without caller-supplied winners", () => {
    const entry = COMPLETE_REP_LANE_AGGREGATE_REGISTRY[0];
    const result = resolveCompleteRepLanePrecedence({ schemaVersion: "v2", registryVersion: "v2", branchKey: entry.branchKey, explicitRolePresent: true, generatedSettingsFactsComplete: true });
    expect(result.status).toBe("resolved");
    if (result.status === "resolved") {
      expect(result.aggregate.precedence.selectedRepAuthorityId).toBeTruthy();
      expect(result.aggregate.precedence.matchingAuthorityIds).toContain(result.aggregate.precedence.selectedRepAuthorityId);
    }
  });
  it("rejects incomplete, unsupported and equal-precedence facts", () => {
    const entry = COMPLETE_REP_LANE_AGGREGATE_REGISTRY[0];
    expect(resolveCompleteRepLanePrecedence({ schemaVersion: "v2", registryVersion: "v2", branchKey: entry.branchKey, explicitRolePresent: true, generatedSettingsFactsComplete: false }).status).toBe("incomplete_generated_settings_facts");
    expect(resolveCompleteRepLanePrecedence({ schemaVersion: "v2", registryVersion: "v2", branchKey: { ...entry.branchKey, blockClassification: "peak", plannedOrderClass: "unknown" }, explicitRolePresent: true, generatedSettingsFactsComplete: true }).status).toBe("unsupported_planned_order");
  });
});
