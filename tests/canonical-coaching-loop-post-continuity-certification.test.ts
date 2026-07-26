import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const root = process.cwd();
const reportRoot = join(root, "qa-reports/coaching-loop-post-continuity-certification");

describe("independent post-P0 continuity certification", () => {
  it("keeps the complete deterministic evidence set present", () => {
    for (const name of [
      "executive-summary.md",
      "p0-repair-verification.md",
      "truthful-receipt-certification.md",
      "material-change-classification.json",
      "material-change-classification.md",
      "boundary-continuity-certification.md",
      "completion-reconciliation-certification.md",
      "fault-injection-results.md",
      "longitudinal-12-week-results.json",
      "longitudinal-12-week-results.md",
      "no-change-outcome-audit.md",
      "numeric-progression-gap.md",
      "screen-consistency-results.md",
      "remaining-findings.md",
      "p1-implementation-sequence.md",
    ]) {
      expect(existsSync(join(reportRoot, name)), name).toBe(true);
    }
  });

  it("distinguishes mechanical applied receipts from truthful coaching-demand changes", () => {
    const material = JSON.parse(readFileSync(join(reportRoot, "material-change-classification.json"), "utf8")) as {
      freshRunCount: number;
      freshRunSemanticDeterminism: boolean;
      mechanicalAppliedReceiptCount: number;
      truthfulMaterialTransactionCount: number;
      generatedIdentityOnlyAppliedReceiptCount: number;
      numberToNumberBaseLoadDeltaCount: number;
      transactionCategoryCounts: Record<string, number>;
      applications: Array<{ truthfulMaterialPrescriptionDelta: boolean; category: string }>;
    };
    expect(material).toMatchObject({
      freshRunCount: 2,
      freshRunSemanticDeterminism: true,
      mechanicalAppliedReceiptCount: 157,
      truthfulMaterialTransactionCount: 155,
      generatedIdentityOnlyAppliedReceiptCount: 2,
      numberToNumberBaseLoadDeltaCount: 0,
      transactionCategoryCounts: {
        approved_successor_failure_continuation: 5,
        approved_successor_transition: 22,
        generated_identity_only_false_positive: 2,
        load_state_recalibration: 1,
        observed_load_calibration: 10,
        ordinary_next_microcycle_construction: 117,
      },
    });
    expect(material.applications).toHaveLength(157);
    expect(material.applications.filter((application) => !application.truthfulMaterialPrescriptionDelta)).toHaveLength(2);
  });

  it("certifies the fresh longitudinal run without treating successful maintenance as progression", () => {
    const result = JSON.parse(readFileSync(join(reportRoot, "longitudinal-12-week-results.json"), "utf8")) as {
      freshRunCount: number;
      scenarioCount: number;
      scenariosReachingTwelveWeeks: number;
      coachingOpportunityCount: number;
      explicitNoChangeCount: number;
      automaticNumericProgressionCount: number;
      automaticNumericRegressionCount: number;
      semanticallyContradictoryAppliedReceiptCount: number;
      secondRunSemanticallyIdentical: boolean;
      outcomeCounts: Record<string, number>;
    };
    expect(result).toMatchObject({
      freshRunCount: 2,
      scenarioCount: 12,
      scenariosReachingTwelveWeeks: 12,
      coachingOpportunityCount: 648,
      explicitNoChangeCount: 491,
      automaticNumericProgressionCount: 0,
      automaticNumericRegressionCount: 0,
      semanticallyContradictoryAppliedReceiptCount: 2,
      secondRunSemanticallyIdentical: true,
      outcomeCounts: {
        calibration: 10,
        incorrect_adaptation: 2,
        missed_adaptation_opportunity: 462,
        non_numeric_demand_change: 1,
        structural_session_continuity_change: 144,
      },
    });
  });

  it("keeps one mounted post-workout authority and no legacy competitor in its mounted chain", () => {
    const recordedApplication = readFileSync(join(root, "src/application/training/canonical-recorded-session-application.ts"), "utf8");
    const orchestrator = readFileSync(join(root, "src/application/training/canonical-post-workout-orchestrator.ts"), "utf8");
    const productionLayout = readFileSync(join(root, "src/application/shell/production-protected-layout.tsx"), "utf8");
    const productionTrain = readFileSync(join(root, "app-production/(protected)/(tabs)/train.tsx"), "utf8");
    const mountedChain = [recordedApplication, orchestrator, productionLayout, productionTrain].join("\n");

    expect(recordedApplication).toContain("orchestrateCanonicalPostWorkoutAdaptation");
    expect(orchestrator).toContain("evaluateCanonicalPostWorkoutProgress");
    expect(orchestrator).toContain("canonicalActivePlanState.applyProgressDecision");
    expect(productionLayout).toContain("resumePendingCanonicalCoachingWork");
    expect(productionTrain).toContain('app/(protected)/(tabs)/train');
    expect(mountedChain).not.toMatch(/activeTrainingPlanRepository|workoutSessionRepository|applyCurrentMesocycleDecision|buildProgressDashboardViewModel/);
  });

  it("does not overstate the three P0 verdicts", () => {
    const summary = readFileSync(join(reportRoot, "executive-summary.md"), "utf8");
    expect(summary).toContain("RB-P0-01 truthful application receipts | **CONTRADICTED**");
    expect(summary).toContain("RB-P0-02 boundary continuity | **PARTIALLY PROVEN**");
    expect(summary).toContain("RB-P0-03 completion reconciliation | **PARTIALLY PROVEN**");
    expect(summary).toContain("No production fix is included");
  });
});
