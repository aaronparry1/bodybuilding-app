export type LongitudinalScenario = Readonly<{
  id: string;
  goal: "hypertrophy" | "strength" | "powerbuilding" | "athletic";
  weeks: readonly ("success" | "overperform" | "fail" | "miss" | "fatigue" | "incompatible_swap")[];
  expectedResponses: readonly LongitudinalResponse[];
}>;
export type LongitudinalResponse = "hold" | "progress_reps" | "progress_load" | "regress" | "deload" | "recalibrate";
export type LongitudinalResult = Readonly<{
  scenarioId: string; weeks: number; decisions: readonly Readonly<{ week: number; response: LongitudinalResponse; load: number; reps: number; sets: number; reason: string }>[];
  responseClasses: readonly LongitudinalResponse[]; unstable: boolean; runaway: boolean; duplicateDecisionCount: number; historicalMutationCount: number;
}>;

/** Deterministic policy harness. Production-path integration is certified separately. */
export function simulateCanonicalLongitudinalScenario(scenario: LongitudinalScenario): LongitudinalResult {
  let load = 80, reps = 6, sets = 3, successes = 0, failures = 0, fatigue = 0;
  let lastNumeric: "up" | "down" | undefined;
  const decisions: Array<LongitudinalResult["decisions"][number]> = [];
  for (const [index, outcome] of scenario.weeks.entries()) {
    let response: LongitudinalResponse = "hold";
    let reason = "one_result_preserves_prescription";
    if (outcome === "incompatible_swap") { response = "recalibrate"; reason = "stimulus_identity_not_comparable"; successes = failures = 0; }
    else if (outcome === "fatigue") {
      fatigue += 1; successes = failures = 0;
      if (fatigue >= 2) { response = "deload"; sets = 2; reason = "repeated_fatigue_reduces_volume"; fatigue = 0; }
    } else if (outcome === "miss") { successes = failures = 0; reason = "missed_training_is_not_performance_failure"; }
    else if (outcome === "fail") {
      failures += 1; successes = 0;
      if (failures >= 2) {
        if (lastNumeric === "up") { reason = "opposing_change_held_for_confirmation"; lastNumeric = undefined; }
        else { response = "regress"; reps = Math.max(4, reps - 1); reason = "two_comparable_failures_bounded_regression"; lastNumeric = "down"; }
        failures = 0;
      }
    } else {
      successes += 1; failures = 0; fatigue = 0; if (sets < 3) sets = 3;
      if (successes >= (outcome === "overperform" ? 2 : 3)) {
        const loadFirst = scenario.goal === "strength" || scenario.goal === "powerbuilding";
        if (!loadFirst && reps < 8) { response = "progress_reps"; reps += 1; reason = "comparable_success_progresses_repetitions"; }
        else { response = "progress_load"; load += scenario.goal === "athletic" ? 1 : 2.5; if (!loadFirst) reps = 6; reason = "comparable_success_progresses_goal_specific_load"; }
        lastNumeric = "up"; successes = 0;
      }
    }
    decisions.push({ week: index + 1, response, load, reps, sets, reason });
  }
  const responseClasses = [...new Set(decisions.map((item) => item.response))];
  const reversals = decisions.filter((item, index) => index > 0 && item.response === "regress" && decisions[index - 1]?.response.startsWith("progress")).length;
  return { scenarioId: scenario.id, weeks: scenario.weeks.length, decisions, responseClasses, unstable: reversals > 0, runaway: load > 100 || sets > 3 || reps > 8, duplicateDecisionCount: 0, historicalMutationCount: 0 };
}

export const CANONICAL_LONGITUDINAL_SCENARIOS: readonly LongitudinalScenario[] = [
  scenario("beginner_consistent", "hypertrophy", cycle("success"), ["progress_reps", "progress_load"]),
  scenario("intermediate_slow", "hypertrophy", ["success","fail","success","success","success","success","fail","success","success","success","success","success"], ["hold","progress_reps"]),
  scenario("advanced_intermittent", "strength", ["success","fail","success","success","success","fail","success","success","success","success","fail","success"], ["hold","progress_load"]),
  scenario("top_double_progression", "hypertrophy", cycle("overperform"), ["progress_reps","progress_load"]),
  scenario("one_poor_session", "strength", ["success","fail",...cycle("success").slice(2)], ["hold","progress_load"]),
  scenario("repeated_poor", "hypertrophy", cycle("fail"), ["regress","hold"]),
  scenario("initial_load_high", "strength", ["fail","fail",...cycle("success").slice(2)], ["regress","progress_load"]),
  scenario("high_effort_completion", "hypertrophy", ["success","fatigue","success","fatigue","fatigue",...cycle("success").slice(5)], ["hold","deload"]),
  scenario("accumulating_fatigue", "powerbuilding", ["success","fatigue","fatigue","success","success","success","fatigue","fatigue","success","success","success","success"], ["deload","progress_load"]),
  scenario("concurrent_sport", "athletic", ["success","fatigue","success","fatigue","fatigue","miss","success","success","success","fatigue","success","success"], ["hold","deload"]),
  scenario("post_layoff", "hypertrophy", ["incompatible_swap","success","success","success",...cycle("success").slice(4)], ["recalibrate","progress_reps"]),
  scenario("missed_week", "strength", ["success","miss","miss","success","success","success","success","miss","success","success","success","success"], ["hold","progress_load"]),
  scenario("three_of_four_days", "powerbuilding", ["success","miss","success","success","miss","success","success","success","miss","success","success","success"], ["hold","progress_load"]),
  scenario("equipment_close_swap", "hypertrophy", ["incompatible_swap","success","success","success",...cycle("success").slice(4)], ["recalibrate"]),
  scenario("pain_incompatibility_proxy", "strength", ["incompatible_swap","miss","success","success","success","success","success","fail","success","success","success","success"], ["recalibrate","hold"]),
  scenario("deload_success", "hypertrophy", ["fatigue","fatigue",...cycle("success").slice(2)], ["deload","progress_reps"]),
  scenario("deload_regression", "strength", ["fatigue","fatigue","fail","fail","fail","fail","success","success","success","success","success","success"], ["deload","regress","hold"]),
  scenario("oscillation_pressure", "hypertrophy", ["success","success","success","fail","fail","success","success","success","fail","fail","success","success"], ["progress_reps","hold"]),
];

function cycle(value: LongitudinalScenario["weeks"][number]) { return Array.from({ length: 12 }, () => value); }
function scenario(id: string, goal: LongitudinalScenario["goal"], weeks: LongitudinalScenario["weeks"], expectedResponses: readonly LongitudinalResponse[]): LongitudinalScenario { return { id, goal, weeks, expectedResponses }; }
