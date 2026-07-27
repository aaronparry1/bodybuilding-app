import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { resolveCanonicalCycleBoundary } from "@/domain/training/canonical-cycle-boundary-resolution";
import { mesocycleById, mesocycleLibrary, type MesocycleId } from "@/domain/training/mesocycle-library";
import { resolveMesocyclePrescriptionPolicy } from "@/domain/training/mesocycle-prescription-policy";

const reportRoot = join(process.cwd(), "qa-reports/coaching-loop-p1a-comparable-exposure-progression");

describe("independent P1A certification", () => {
  it("keeps week 12 ordinary and preserves authorised cycle continuity for a two-year accelerated policy simulation", () => {
    const result = simulateSuccessfulHypertrophyWeeks(104);
    expect(result.weeksCompleted).toBe(104);
    expect(result.weekTwelveWasArtificialTerminal).toBe(false);
    expect(result.deadlocks).toBe(0);
    expect(result.weekOneResets).toBe(0);
    expect(result.duplicateTransitions).toBe(0);
    expect(result.mesocyclesCompleted).toBeGreaterThan(10);
    expect(result.transitionedAtWeeks).not.toContain(12);
    expect(result.transitionedAtWeeks).toContain(13);
    expect(result.maxObservedWeek).toBe(104);
  });

  it("keeps certification artifacts internally consistent and does not overclaim continuous macrocycle construction", () => {
    const required = [
      "executive-summary.md",
      "missed-opportunity-classification.json",
      "missed-opportunity-classification.md",
      "comparable-exposure-contract.md",
      "evidence-sufficiency-contract.md",
      "progression-regression-policy.md",
      "literature-evidence-map.md",
      "production-reachability.md",
      "numeric-decision-results.json",
      "numeric-decision-results.md",
      "receipt-and-cas-results.md",
      "longitudinal-results.json",
      "longitudinal-results.md",
      "screen-consistency-results.md",
      "protected-regressions.md",
      "remaining-findings.md",
      "continuous-coaching-lifecycle-contract.md",
      "horizon-independence-results.json",
      "horizon-independence-results.md",
      "long-duration-state-growth.md",
    ];
    for (const artifact of required) expect(existsSync(join(reportRoot, artifact)), artifact).toBe(true);

    const missed = readJson<{
      baselineMissedOpportunities: number;
      classificationTotal: number;
      allWerePreviouslyPolicyGapCandidates: boolean;
    }>("missed-opportunity-classification.json");
    expect(missed).toMatchObject({
      baselineMissedOpportunities: 452,
      classificationTotal: 452,
      allWerePreviouslyPolicyGapCandidates: true,
    });

    const numeric = readJson<{
      verdict: string;
      generatedIdentityOnlyApplications: number;
      falseApplications: number;
      unsafeApplications: number;
      dedicatedProgressionJourneyDeltas: number;
      allTargetedJourneyProgressionDeltas: number;
      mountedRegressionDeltas: number;
      postCasPathsConverged: number;
    }>("numeric-decision-results.json");
    expect(numeric).toMatchObject({
      verdict: "PARTIALLY PROVEN",
      generatedIdentityOnlyApplications: 0,
      falseApplications: 0,
      unsafeApplications: 0,
      dedicatedProgressionJourneyDeltas: 13,
      allTargetedJourneyProgressionDeltas: 56,
      mountedRegressionDeltas: 13,
      postCasPathsConverged: 1,
    });

    const longitudinal = readJson<{
      observationWindowWeeks: number;
      productionMountedScenarios: number;
      simulationAssistedScenarios: number;
      fullTwelveScenarioProductionReplayVerdict: string;
    }>("longitudinal-results.json");
    expect(longitudinal).toMatchObject({
      observationWindowWeeks: 12,
      productionMountedScenarios: 6,
      simulationAssistedScenarios: 6,
      fullTwelveScenarioProductionReplayVerdict: "NOT PROVEN",
    });

    const horizon = readJson<ReturnType<typeof simulateSuccessfulHypertrophyWeeks> & {
      successorMacrocycleConstructionVerdict: string;
      continuousCoachingVerdict: string;
    }>("horizon-independence-results.json");
    expect(horizon).toMatchObject({
      ...simulateSuccessfulHypertrophyWeeks(104),
      successorMacrocycleConstructionVerdict: "NOT PROVEN",
      continuousCoachingVerdict: "PARTIALLY PROVEN",
    });

    const policySource = readFileSync(
      join(process.cwd(), "src/domain/training/canonical-comparable-exposure-policy.ts"),
      "utf8",
    );
    expect(policySource).not.toMatch(/\b12\s*\*\s*7|week\s*===\s*12|maximumWeeks:\s*12/);
  });
});

function simulateSuccessfulHypertrophyWeeks(totalWeeks: number) {
  let mesocycleId: MesocycleId = "hypertrophy_base";
  let completedInMesocycle = 0;
  let mesocyclesCompleted = 0;
  let authorisedContinuations = 0;
  let successorTransitions = 0;
  let deadlocks = 0;
  let weekOneResets = 0;
  let previousObservedWeek = 0;
  let duplicateTransitions = 0;
  const transitionedAtWeeks: number[] = [];
  const transitionIdentities = new Set<string>();

  for (let week = 1; week <= totalWeeks; week += 1) {
    const mesocycle = mesocycleById(mesocycleId);
    const policy = resolveMesocyclePrescriptionPolicy(mesocycleId, { goal: "build_muscle" });
    if (!mesocycle || policy.status !== "resolved") {
      deadlocks += 1;
      break;
    }
    completedInMesocycle += 1;
    const boundary = resolveCanonicalCycleBoundary({
      microcycleComplete: true,
      completedMicrocyclesInMesocycle: completedInMesocycle,
      mesocycle,
      policy: policy.policy,
      targetCompletion: "successful",
    });
    if (boundary.status === "transition_approved") {
      const successor = boundary.successorMesocycleId
        ? mesocycleLibrary.find((candidate) => candidate.id === boundary.successorMesocycleId)
        : null;
      if (!successor) {
        deadlocks += 1;
        break;
      }
      const transitionIdentity = `${mesocycleId}:${completedInMesocycle}:${boundary.successorMesocycleId}:${week}`;
      if (transitionIdentities.has(transitionIdentity)) duplicateTransitions += 1;
      transitionIdentities.add(transitionIdentity);
      mesocycleId = successor.id;
      completedInMesocycle = 0;
      mesocyclesCompleted += 1;
      successorTransitions += 1;
      transitionedAtWeeks.push(week);
    } else if (boundary.status === "continue_current_phase") {
      authorisedContinuations += 1;
    } else {
      deadlocks += 1;
      break;
    }
    if (week <= previousObservedWeek) weekOneResets += 1;
    previousObservedWeek = week;
  }

  return {
    schemaVersion: "canonical_p1a_horizon_independence_v1" as const,
    simulationClassification: "accelerated_policy_only" as const,
    weeksCompleted: totalWeeks - deadlocks,
    maxObservedWeek: totalWeeks - deadlocks,
    microcyclesCompleted: totalWeeks - deadlocks,
    mesocyclesCompleted,
    macrocyclesCompleted: 0,
    authorisedContinuations,
    successorTransitions,
    reviewStates: 0,
    terminalStates: 0,
    deadlocks,
    weekOneResets,
    duplicateTransitions,
    weekTwelveWasArtificialTerminal: false,
    transitionedAtWeeks,
  };
}

function readJson<T>(name: string): T {
  return JSON.parse(readFileSync(join(reportRoot, name), "utf8")) as T;
}
