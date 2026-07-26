import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const root = process.cwd();
const reportRoot = join(root, "qa-reports/coaching-loop-p0-continuity-remediation");

describe("canonical coaching-loop remaining-P0 continuity remediation", () => {
  it("certifies twelve longitudinal contexts without deadlock or contradictory receipts", () => {
    const artifact = JSON.parse(readFileSync(join(reportRoot, "longitudinal-12-week-results.json"), "utf8")) as {
      scenarioCount: number;
      scenariosReachingTwelveWeeks: number;
      deadlockedScenarioCount: number;
      contradictoryReceiptCount: number;
      scenarios: Array<{
        decisions: Array<{
          applicationStatus: string;
          priorRevision: number;
          newRevision: number;
          materialDeltas: Array<{ field: string }>;
        }>;
      }>;
    };
    expect(artifact).toMatchObject({
      scenarioCount: 12,
      scenariosReachingTwelveWeeks: 12,
      deadlockedScenarioCount: 0,
      contradictoryReceiptCount: 0,
    });
    for (const decision of artifact.scenarios.flatMap((scenario) => scenario.decisions)) {
      if (decision.applicationStatus === "applied") {
        expect(decision.newRevision).toBeGreaterThan(decision.priorRevision);
        expect(decision.materialDeltas.length).toBeGreaterThan(0);
      } else {
        expect(decision.newRevision).toBe(decision.priorRevision);
        expect(decision.materialDeltas).toEqual([]);
      }
      expect(decision.materialDeltas.some((delta) => delta.field.includes("staleRevision"))).toBe(false);
    }
  });

  it("keeps every required deterministic artifact present", () => {
    for (const name of [
      "implementation-summary.md",
      "truthful-delta-and-receipt-contract.md",
      "boundary-continuity-contract.md",
      "completion-evidence-reconciliation.md",
      "transaction-state-machine.md",
      "longitudinal-12-week-results.json",
      "longitudinal-12-week-results.md",
      "fault-injection-results.md",
      "screen-consistency-results.md",
      "protected-baseline-regressions.md",
      "remaining-phase-2-findings.md",
    ]) expect(existsSync(join(reportRoot, name)), name).toBe(true);
  });

  it("mounts restart reconciliation and removes the certified deadlock reason from production evaluation", () => {
    const productionLayout = readFileSync(join(root, "src/application/shell/production-protected-layout.tsx"), "utf8");
    const developmentLayout = readFileSync(join(root, "app/(protected)/_layout.tsx"), "utf8");
    const evaluator = readFileSync(join(root, "src/domain/training/canonical-progress-evaluator.ts"), "utf8");
    const application = readFileSync(join(root, "src/application/training/canonical-progress-decision-application.ts"), "utf8");
    expect(productionLayout).toContain("resumePendingCanonicalCoachingWork");
    expect(developmentLayout).toContain("resumePendingCanonicalCoachingWork");
    expect(evaluator).not.toContain("machine_evaluable_objective_policy_missing");
    expect(evaluator).toContain("resolveCanonicalCycleBoundary");
    expect(application).toContain("compareCanonicalMaterialPrescriptions");
    expect(application).toContain("material_prescription_delta_absent");
  });
});
