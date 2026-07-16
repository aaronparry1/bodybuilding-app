import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { buildCanonicalProductionSwitchEvidence } from "@/../qa-reports/legacy-migration-change-control/canonical-production-switch-evidence";

describe("canonical production switch final handoff", () => {
  it("keeps handoff, reachability, and compatibility evidence consistent", () => {
    const root = resolve(process.cwd(), "qa-reports/legacy-migration-change-control");
    const handoff = JSON.parse(readFileSync(resolve(root, "canonical-production-switch-final-handoff.json"), "utf8"));
    const reachability = JSON.parse(readFileSync(resolve(root, "canonical-production-reachability-refresh.json"), "utf8"));
    const finalResult = JSON.parse(readFileSync(resolve(root, "canonical-production-switch-final-result.json"), "utf8"));
    const evidence = buildCanonicalProductionSwitchEvidence("7a80be8");
    expect(evidence.predicates).toHaveLength(24);
    expect(evidence.predicates.every((predicate) => predicate.passed)).toBe(true);
    expect(handoff.predicatesPassed).toBe(24);
    expect(handoff.handoffReady).toBe(true);
    expect(handoff.deploymentAuthorized).toBe(false);
    expect(reachability.mountedLegacyBlockers).toEqual([]);
    expect(finalResult.productionSwitchCompleted).toBe(true);
    expect(finalResult.firstLiveBlocker).toBeNull();
  });
});
