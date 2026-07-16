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

  it("requires the selected blocker to exist and be mounted", () => {
    const source = readFileSync(resolve(process.cwd(), "src/application/sync/cloud-data-sync.ts"), "utf8");
    expect(source).toContain("activeTrainingPlanRepository");
    expect(source).toContain("sync");
  });
});
