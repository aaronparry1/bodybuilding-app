import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { buildCanonicalProductionSwitchEvidence } from "@/../qa-reports/legacy-migration-change-control/canonical-production-switch-evidence";

describe("production reachability stale-blocker correction", () => {
  it("does not classify the deleted decision-application module as live", () => {
    expect(existsSync(resolve(process.cwd(), "src/domain/training/current-decision-application.ts"))).toBe(false);
    const evidence = buildCanonicalProductionSwitchEvidence("291e001");
    expect(evidence.predicates.flatMap((predicate) => predicate.caseIds).join(" ")).not.toContain("current-decision-application");
  });

  it("keeps recommendation actions on the canonical application path", () => {
    const source = readFileSync(resolve(process.cwd(), "src/application/training/canonical-recommendation-actions.ts"), "utf8");
    expect(source).toContain("canonicalActivePlanState.applyProgressDecision");
    expect(source).not.toContain("applyCurrentMesocycleDecision");
  });

  it("does not preserve a blocker after all mounted legacy paths are removed", () => {
    const artifact = JSON.parse(readFileSync(resolve(process.cwd(), "qa-reports/legacy-migration-change-control/canonical-production-reachability-refresh.json"), "utf8"));
    expect(artifact.mountedLegacyBlockers).toEqual([]);
    expect(artifact.productionSwitchCompleted).toBe(true);
  });
});
