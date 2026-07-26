import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const root = process.cwd();
const report = join(root, "qa-reports/coaching-loop-final-p0-remediation");

describe("canonical final P0 remediation artifacts", () => {
  it("keeps every required deterministic artifact present", () => {
    for (const file of [
      "implementation-summary.md",
      "semantic-identity-and-material-delta.md",
      "exhaustive-boundary-invariant.md",
      "post-cas-reconciliation-contract.md",
      "transaction-state-machine.md",
      "generated-identity-regressions.md",
      "exhaustive-boundary-results.json",
      "exhaustive-boundary-results.md",
      "crash-window-results.md",
      "longitudinal-results.md",
      "screen-consistency-results.md",
      "protected-baseline-regressions.md",
      "retained-phase-2-findings.md",
    ]) expect(existsSync(join(report, file)), file).toBe(true);
  });

  it("certifies exhaustive boundaries without claiming numeric policy", () => {
    const boundary = JSON.parse(readFileSync(join(report, "exhaustive-boundary-results.json"), "utf8"));
    expect(boundary).toMatchObject({
      mesocycleCount: 22,
      boundaryCombinationsTested: 154,
      validFinalSessionDeadlocks: 0,
      inventedSuccessorEdges: 0,
      restartDuplicateConcurrencyConverged: true,
    });
    const longitudinal = readFileSync(join(report, "longitudinal-results.md"), "utf8");
    expect(longitudinal).toContain("| Truthful material applications | 155 | 155 |");
    expect(longitudinal).toContain("| Explicit no-change | 493 | 493 |");
    expect(longitudinal).toContain("| Numeric progression | 0 | 0 |");
    expect(longitudinal).toContain("| Numeric regression | 0 | 0 |");
  });

  it("keeps one mounted authority and crash reconciliation production-reachable", () => {
    const orchestrator = readFileSync(join(root, "src/application/training/canonical-post-workout-orchestrator.ts"), "utf8");
    const application = readFileSync(join(root, "src/application/training/canonical-progress-decision-application.ts"), "utf8");
    const reconciliation = readFileSync(join(root, "src/application/training/canonical-completion-evidence-reconciliation.ts"), "utf8");
    expect(orchestrator).toContain("orchestrateCanonicalPostWorkoutAdaptation");
    expect(reconciliation).toContain("resumePendingCanonicalCoachingWork");
    expect(application).toContain("canonicalCoachingApplicationIntentRepository");
    expect(application).toContain("decision_application_receipt_reconstructed");
    expect(application).toContain("compareCanonicalMaterialPrescriptions");
    expect(application).not.toContain("numericLoadAdjustmentAuthorised: true");
  });
});
