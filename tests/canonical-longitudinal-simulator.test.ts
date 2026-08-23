import { describe, expect, it } from "vitest";
import { CANONICAL_LONGITUDINAL_SCENARIOS, simulateCanonicalLongitudinalScenario } from "@/domain/training/canonical-longitudinal-simulator";

describe("12-week canonical coaching policy simulation", () => {
  const results = CANONICAL_LONGITUDINAL_SCENARIOS.map(simulateCanonicalLongitudinalScenario);

  it("runs every scenario deterministically for twelve weeks without mutation, duplicates or runaway", () => {
    expect(results).toHaveLength(18);
    expect(results.every((result) => result.weeks === 12)).toBe(true);
    expect(results.every((result) => !result.unstable && !result.runaway)).toBe(true);
    expect(results.every((result) => result.duplicateDecisionCount === 0 && result.historicalMutationCount === 0)).toBe(true);
    expect(CANONICAL_LONGITUDINAL_SCENARIOS.map(simulateCanonicalLongitudinalScenario)).toEqual(results);
  });

  it("produces each scenario's expected response classes without exact-number overfitting", () => {
    for (const [index, scenario] of CANONICAL_LONGITUDINAL_SCENARIOS.entries()) {
      for (const response of scenario.expectedResponses) expect(results[index]?.responseClasses, `${scenario.id}:${response}`).toContain(response);
    }
  });

  it("makes goal-specific progress and does not punish a single miss or poor result", () => {
    expect(results.find((item) => item.scenarioId === "beginner_consistent")?.responseClasses).toContain("progress_reps");
    expect(results.find((item) => item.scenarioId === "advanced_intermittent")?.responseClasses).toContain("progress_load");
    expect(results.find((item) => item.scenarioId === "one_poor_session")?.decisions[1]?.response).toBe("hold");
    expect(results.find((item) => item.scenarioId === "missed_week")?.decisions[1]?.reason).toBe("missed_training_is_not_performance_failure");
  });
});
