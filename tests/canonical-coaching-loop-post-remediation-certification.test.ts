import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

type ScenarioResult = Readonly<{
  scenarioId: string;
  productionInputReachability: "mounted" | "simulation_only";
  persistedDecision: Readonly<{ result: string }>;
  futureDiff: readonly unknown[];
  historicalPrescriptionImmutable: boolean;
  duplicate: Readonly<{ status: string; revisionBefore: number; revisionAfter: number }>;
  screenIdentities: Readonly<Record<string, string | null>>;
}>;

type ScenarioArtifact = Readonly<{
  scenarioCount: number;
  runCount: number;
  semanticDeterminism: boolean;
  reproducedCounts: Readonly<{ futureChanges: number; explicitNoChangeOrReview: number; silentOmissions: number }>;
  fullyMountedInputScenarios: readonly string[];
  simulationOnlyInputScenarios: readonly string[];
  scenarios: readonly ScenarioResult[];
}>;

type LongitudinalArtifact = Readonly<{
  targetWeeks: number;
  scenarioCount: number;
  scenariosReachingTwelveWeeks: number;
  deadlockedScenarioCount: number;
  scenarios: readonly Readonly<{
    scenarioId: string;
    sessionsCompleted: number;
    deadlocked: boolean;
    finalDecision: null | Readonly<{ reasonCodes: readonly string[] }>;
  }>[];
}>;

const reportRoot = "qa-reports/coaching-loop-post-remediation-certification";
const readJson = <T,>(name: string): T => JSON.parse(readFileSync(`${reportRoot}/${name}`, "utf8")) as T;

describe("independent post-remediation coaching-loop certification", () => {
  it("preserves the measured two-run production-path scenario evidence", () => {
    const artifact = readJson<ScenarioArtifact>("scenario-reproduction.json");

    expect(artifact).toMatchObject({
      scenarioCount: 12,
      runCount: 2,
      semanticDeterminism: true,
      reproducedCounts: { futureChanges: 5, explicitNoChangeOrReview: 7, silentOmissions: 0 },
    });
    expect(artifact.fullyMountedInputScenarios).toHaveLength(6);
    expect(artifact.simulationOnlyInputScenarios).toEqual([
      "repeated_stall",
      "poor_recovery",
      "return_after_layoff",
      "pain_or_limitation",
      "limited_equipment",
      "athletic_changing_sport_workload",
    ]);
    expect(artifact.scenarios.every((scenario) => scenario.historicalPrescriptionImmutable)).toBe(true);
    expect(artifact.scenarios.every((scenario) =>
      scenario.duplicate.status === "idempotent"
      && scenario.duplicate.revisionBefore === scenario.duplicate.revisionAfter
    )).toBe(true);
  });

  it("does not confuse a decision label and revision churn with a changed prescription", () => {
    const artifact = readJson<ScenarioArtifact>("scenario-reproduction.json");
    const labelledChanges = artifact.scenarios.filter((scenario) => scenario.persistedDecision.result === "future_prescription_change");
    const actualPrescriptionChanges = labelledChanges.filter((scenario) => scenario.futureDiff.length > 0);
    const noOp = labelledChanges.filter((scenario) => scenario.futureDiff.length === 0);

    expect(labelledChanges).toHaveLength(5);
    expect(actualPrescriptionChanges).toHaveLength(4);
    expect(noOp.map((scenario) => scenario.scenarioId)).toEqual(["advanced_five_day_hypertrophy"]);
  });

  it("records that the mounted policy cannot carry any scenario through twelve weeks", () => {
    const artifact = readJson<LongitudinalArtifact>("longitudinal-12-week-results.json");

    expect(artifact).toMatchObject({
      targetWeeks: 12,
      scenarioCount: 12,
      scenariosReachingTwelveWeeks: 0,
      deadlockedScenarioCount: 12,
    });
    expect(artifact.scenarios.every((scenario) => scenario.deadlocked)).toBe(true);
    expect(artifact.scenarios.filter((scenario) =>
      scenario.finalDecision?.reasonCodes.includes("machine_evaluable_objective_policy_missing")
    )).toHaveLength(8);
  });

  it("proves mounted authority and production evidence reachability from executable source", () => {
    const completion = readFileSync("src/application/training/canonical-recorded-session-application.ts", "utf8");
    const orchestrator = readFileSync("src/application/training/canonical-post-workout-orchestrator.ts", "utf8");
    const evaluator = readFileSync("src/domain/training/canonical-progress-evaluator.ts", "utf8");
    const onboarding = readFileSync("app/(protected)/onboarding.tsx", "utf8");
    const productionTrain = readFileSync("app-production/(protected)/(tabs)/train.tsx", "utf8");
    const train = readFileSync("app/(protected)/(tabs)/train.tsx", "utf8");
    const mountedEvidenceSources = [train, completion, orchestrator].join("\n");
    const mountedEvidenceWriters = mountedEvidenceSources.match(/kind:\s*["'](?:readiness|capacity|pain|review_request)["']/g) ?? [];
    const sourceFiles = [
      "src/application/training/canonical-recorded-session-application.ts",
      "src/application/training/canonical-post-workout-orchestrator.ts",
      "src/application/training/canonical-home-commands.ts",
      "src/application/training/canonical-recommendation-actions.ts",
    ];
    const appSources = sourceFiles.map((path) => ({ path, source: readFileSync(path, "utf8") }));
    const orchestratorImports = appSources.filter(({ path, source }) =>
      path !== "src/application/training/canonical-post-workout-orchestrator.ts"
      && /from\s+["']@\/application\/training\/canonical-post-workout-orchestrator["']/.test(source)
    );

    expect(productionTrain).toContain("../../../app/(protected)/(tabs)/train");
    expect(completion).toContain("orchestrateCanonicalPostWorkoutAdaptation");
    expect(orchestrator).toContain("evaluateCanonicalPostWorkoutProgress");
    expect(orchestrator).toContain("canonicalActivePlanState.applyProgressDecision");
    expect(orchestratorImports.map(({ path }) => path)).toEqual([
      "src/application/training/canonical-recorded-session-application.ts",
    ]);
    expect(mountedEvidenceWriters).toEqual([]);
    expect(evaluator).toContain("deloadEligible: false");
    expect(evaluator).toContain("machine_evaluable_objective_policy_missing");
    expect(onboarding).toMatch(/equipment:\s*\[[^\]]*"machine"[^\]]*"cable"/s);
  });

  it("keeps the complete certification artifact set deterministic and reviewable", () => {
    for (const name of [
      "executive-summary.md",
      "mounted-loop-trace.md",
      "authority-verification.md",
      "scenario-reproduction.json",
      "scenario-reproduction.md",
      "longitudinal-12-week-results.json",
      "longitudinal-12-week-results.md",
      "identity-certification.md",
      "evaluator-evidence-certification.md",
      "transaction-concurrency-results.md",
      "counterfactual-results.json",
      "screen-consistency-results.md",
      "original-verdict-comparison.md",
      "remaining-release-blockers.md",
      "phase-2-sequence.md",
    ]) {
      expect(existsSync(`${reportRoot}/${name}`), name).toBe(true);
    }
  });
});
