import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { calculateCoachingState } from "./coaching_state_engine.mjs";
import { createCoachingRecommendation } from "./decision_engine_v0_2.mjs";
import { evaluateSafetyGate } from "./safety_gate.mjs";
import { calculateGoalProgress } from "./goal_progress_metrics.mjs";
import { pushTypeScenariosV0_1 } from "../gauntlet/push_type_scenarios_v0_1.mjs";

const labRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const profiles = JSON.parse(readFileSync(join(labRoot, "data", "athlete_profiles.json"), "utf8"));

export function runSimulationV0_3() {
  const athleteBuckets = buildScenarioBuckets();
  const athletes = athleteBuckets.map(runTargetedAthleteTimeline);
  return {
    athletes,
    aggregate: aggregateTargetedSimulation(athletes),
  };
}

function buildScenarioBuckets() {
  return [
    bucket("sim_v03_hypertrophy_high_tolerance_responder", "Hypertrophy high-tolerance responder", ["v14_volume_", "v14_mixed_choose_volume", "v14_mixed_micro"]),
    bucket("sim_v03_strength_high_confidence_responder", "Strength high-confidence responder", ["v14_load_", "v14_mixed_choose_load"]),
    bucket("sim_v03_powerbuilding_responder", "Powerbuilding responder", ["v14_mixed_post_swap", "v14_mixed_consolidate", "v14_mixed_new_exercise"]),
    bucket("sim_v03_advanced_stable_athlete", "Advanced stable athlete", ["v14_performance_"]),
    bucket("sim_v03_post_deload_rebound_athlete", "Post-deload rebound athlete", ["v14_volume_after_recovery", "v14_load_small", "v14_performance_milestone"]),
  ];
}

function bucket(id, label, prefixes) {
  const scenarios = pushTypeScenariosV0_1.filter((scenario) => prefixes.some((prefix) => scenario.id.startsWith(prefix)));
  if (!scenarios.length) throw new Error(`No Sprint 14 scenarios matched ${id}`);
  const firstAthlete = athleteFor(scenarios[0]);
  return {
    athlete: {
      ...firstAthlete,
      id,
      label,
      status: "simulation_v0_3_research_fixture",
      notes: ["Simulation v0.3 targeted higher-risk push validation athlete; not production data."],
    },
    scenarios,
  };
}

function runTargetedAthleteTimeline({ athlete, scenarios }) {
  let previousProgress = null;
  let momentum = 72;
  let recovery = 78;
  const weeks = scenarios.map((scenario, index) => {
    const scenarioAthlete = athleteFor(scenario);
    const evidence = { ...scenario.evidence, id: `${athlete.id}_week_${index + 1}_${scenario.id}` };
    const coachingState = calculateCoachingState({ athlete: scenarioAthlete, evidence, now: dateForWeek(index + 1) });
    const safetyGate = evaluateSafetyGate({ athlete: scenarioAthlete, evidence, coachingState });
    const v2Recommendation = createCoachingRecommendation({ athlete: scenarioAthlete, evidence, coachingState, safetyGate });
    const goalProgress = calculateGoalProgress({ goal: scenarioAthlete.goal, evidence, previousProgress, now: dateForWeek(index + 1) });
    const event = eventForScenario(scenario);
    const v1Decision = baselineDecision({ evidence, safetyGate });
    const v2Progress = outcomeScore({ base: goalProgress.progress_score, recommendation: v2Recommendation, event, safetyGate });
    momentum = nextMomentum({ previous: momentum, recommendation: v2Recommendation, event });
    recovery = nextRecovery({ previous: recovery, recommendation: v2Recommendation, event });
    previousProgress = goalProgress;

    return {
      week: index + 1,
      event,
      athlete: scenarioAthlete,
      evidence,
      coachingState,
      safetyGate,
      v2Recommendation,
      v1Decision,
      goalProgress,
      v1: { progress_score: outcomeScore({ base: goalProgress.progress_score, recommendation: v1Decision, event, safetyGate }), momentum: 70, recovery: 74 },
      v2: { progress_score: v2Progress, momentum, recovery },
      comparison: {
        v1UnsafePain: event.type.includes("pain") && !["reduce", "substitute", "stop_movement", "stop_session"].includes(v1Decision.type),
        v2UnsafePain: event.type.includes("pain") && !["reduce", "substitute", "stop_movement", "stop_session"].includes(v2Recommendation.recommendation_type),
        v1OverPush: v1Decision.type === "push" && safetyGate.status !== "clear",
        v2OverPush: v2Recommendation.recommendation_type === "push" && safetyGate.status !== "clear",
        v1UnnecessaryRecover: v1Decision.type === "recover",
        v2UnnecessaryRecover: v2Recommendation.recommendation_type === "recover" && !event.type.includes("systemic"),
        v1UnderHold: false,
        v2UnderHold: scenario.expected.recommendation_type === "push" && v2Recommendation.recommendation_type !== "push",
        v2Win: v2Progress >= goalProgress.progress_score,
        v1Win: false,
      },
      expected: scenario.expected,
      sourceScenarioId: scenario.id,
    };
  });

  return {
    athlete,
    weeks,
    summary: summariseTimeline(weeks),
  };
}

function eventForScenario(scenario) {
  const expected = scenario.expected.push_category ?? scenario.expected.recommendation_type;
  return {
    type: `higher_risk_${expected}`,
    expectedPushCategory: scenario.expected.push_category,
    expectedRecommendation: scenario.expected.recommendation_type,
    positive: scenario.expected.recommendation_type === "push",
    systemic: scenario.expected.recommendation_type === "recover",
    disruption: false,
    localProblem: ["reduce", "substitute", "stop_movement"].includes(scenario.expected.recommendation_type),
    systemicSafety: scenario.expected.recommendation_type === "stop_session",
  };
}

function baselineDecision({ evidence, safetyGate }) {
  const below = evidence.exerciseHistory.reduce((sum, item) => sum + item.belowMinimumEvents, 0);
  const shutdowns = evidence.exerciseHistory.reduce((sum, item) => sum + item.shutdowns, 0);
  const above = evidence.exerciseHistory.reduce((sum, item) => sum + item.aboveRangeEvents, 0);
  if (safetyGate.status === "stop") return { type: "reduce", rationale: "Baseline has basic safety handling only." };
  if (below > 0 || shutdowns > 0) return { type: "reduce", rationale: "Baseline reduces on obvious failed work." };
  if (above > 0) return { type: "push", rationale: "Baseline pushes from above-range evidence." };
  return { type: "hold", rationale: "Baseline holds unclear evidence." };
}

function outcomeScore({ base, recommendation, event, safetyGate }) {
  const type = recommendation.recommendation_type ?? recommendation.type;
  const category = recommendation.push_category;
  let score = base;
  if (type === "push") score += event.positive ? 4 : -8;
  if (category === event.expectedPushCategory) score += 4;
  if (type === "hold" && !event.positive) score += 2;
  if (type === "consolidate") score += 3;
  if (type === "reduce" && event.localProblem) score += 4;
  if (type === "stop_movement") score += 5;
  if (safetyGate.status !== "clear" && type === "push") score -= 14;
  return clamp(score);
}

function summariseTimeline(weeks) {
  const pushes = weeks.filter((week) => week.v2Recommendation.recommendation_type === "push");
  return {
    total_weeks: weeks.length,
    push_count: pushes.length,
    volume_pushes: pushes.filter((week) => week.v2Recommendation.push_category === "volume_push").length,
    load_pushes: pushes.filter((week) => week.v2Recommendation.push_category === "load_push").length,
    performance_pushes: pushes.filter((week) => week.v2Recommendation.push_category === "performance_push").length,
    missed_expected_pushes: weeks.filter((week) => week.expected.recommendation_type === "push" && week.v2Recommendation.recommendation_type !== "push").length,
    wrong_push_categories: weeks.filter((week) => week.expected.push_category && week.v2Recommendation.push_category !== week.expected.push_category).length,
    unsafe_pushes: weeks.filter((week) => week.safetyGate.status !== "clear" && week.v2Recommendation.recommendation_type === "push").length,
    average_v2_progress: average(weeks.map((week) => week.v2.progress_score)),
    final_v2_progress: weeks.at(-1)?.v2.progress_score ?? 0,
  };
}

function aggregateTargetedSimulation(athletes) {
  const weeks = athletes.flatMap((athlete) => athlete.weeks);
  const pushes = weeks.filter((week) => week.v2Recommendation.recommendation_type === "push");
  const byPushType = Object.fromEntries(["micro_push", "volume_push", "load_push", "performance_push"].map((category) => {
    const items = pushes.filter((week) => week.v2Recommendation.push_category === category);
    return [category, {
      total: items.length,
      correct_category: items.filter((week) => week.expected.push_category === category).length,
      premature: items.filter((week) => week.expected.recommendation_type !== "push").length,
    }];
  }));
  return {
    total_athletes: athletes.length,
    total_weeks: weeks.length,
    push_count: pushes.length,
    by_push_type: byPushType,
    missed_expected_pushes: weeks.filter((week) => week.expected.recommendation_type === "push" && week.v2Recommendation.recommendation_type !== "push").length,
    wrong_push_categories: weeks.filter((week) => week.expected.push_category && week.v2Recommendation.push_category !== week.expected.push_category).length,
    unsafe_pushes: weeks.filter((week) => week.safetyGate.status !== "clear" && week.v2Recommendation.recommendation_type === "push").length,
    verdict: weeks.some((week) => week.safetyGate.status !== "clear" && week.v2Recommendation.recommendation_type === "push") ? "not ready" : "promising",
  };
}

function athleteFor(scenario) {
  if (scenario.athlete) return scenario.athlete;
  const athlete = profiles.find((profile) => profile.id === scenario.athleteProfileId);
  if (!athlete) throw new Error(`Missing athlete ${scenario.athleteProfileId}`);
  return athlete;
}

function dateForWeek(week) {
  const date = new Date("2026-01-05T00:00:00.000Z");
  date.setUTCDate(date.getUTCDate() + (week - 1) * 7);
  return date;
}

function nextMomentum({ previous, recommendation, event }) {
  let next = previous;
  if (recommendation.recommendation_type === "push" && event.positive) next += 2;
  if (recommendation.recommendation_type === "hold" && event.positive) next -= 1;
  if (recommendation.recommendation_type === "stop_movement") next += 1;
  return clamp(next);
}

function nextRecovery({ previous, recommendation, event }) {
  let next = previous;
  if (recommendation.recommendation_type === "push") next -= recommendation.push_category === "performance_push" ? 4 : recommendation.push_category === "load_push" ? 3 : 2;
  if (recommendation.recommendation_type === "consolidate") next += 4;
  if (recommendation.recommendation_type === "hold") next += 1;
  if (event.localProblem) next -= 2;
  return clamp(next);
}

function average(values) {
  const clean = values.filter(Number.isFinite);
  return clean.length ? Math.round(clean.reduce((sum, value) => sum + value, 0) / clean.length) : 0;
}

function clamp(value) {
  return Math.max(0, Math.min(100, Math.round(value)));
}
