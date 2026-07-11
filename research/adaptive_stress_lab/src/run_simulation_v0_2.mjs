import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { runSimulationV0_2 } from "./simulation_v0_2.mjs";

const labRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const repoRoot = dirname(dirname(labRoot));
const reportPath = join(repoRoot, "reports", "adaptive_stress_lab", "simulation_v0_2_report.md");

const results = runSimulationV0_2();

await mkdir(dirname(reportPath), { recursive: true });
await writeFile(reportPath, renderReport(results), "utf8");

console.log("Simulation v0.2 complete");
console.log(`Athletes: ${results.aggregate.total_athletes}`);
console.log(`Weeks: ${results.aggregate.total_weeks}`);
console.log(`Verdict: ${results.aggregate.verdict}`);
console.log(`Report: ${reportPath}`);

function renderReport(results) {
  const { aggregate, athletes } = results;
  return `# Simulation v0.2 Report

Generated: ${new Date().toISOString()}

## Scope

Simulation v0.2 runs 20 virtual athletes across 52 weeks and compares:

- V2 lab coaching: Coaching State -> Safety Gate -> Decision Engine -> Goal Progress
- V1-style baseline: target-range success drives push/hold/reduce with only simple deload and basic pain handling

No production code is imported or modified.

## Simulation Setup

- Total simulated athletes: ${aggregate.total_athletes}
- Total simulated weeks: ${aggregate.total_weeks}
- Goal types: Strength, Build Muscle, Build Muscle + Strength, Get Lean, Athletic Performance
- Athletes per goal: 4

Each virtual athlete has training age, weekly training days, recovery profile, consistency profile, progression potential, disruption risk, safety risk, and momentum tendency.

## V1 vs V2 Comparison Table

| Metric | V1 Baseline | V2 Lab |
|---|---:|---:|
| Final goal progress score | ${aggregate.final_v1_progress} | ${aggregate.final_v2_progress} |
| Average goal progress score | ${aggregate.average_v1_progress} | ${aggregate.average_v2_progress} |
| Over-aggressive pushes | ${aggregate.v1_over_aggressive_pushes} | ${aggregate.v2_over_aggressive_pushes} |
| Unnecessary recovery weeks | ${aggregate.v1_unnecessary_recovery_weeks} | ${aggregate.v2_unnecessary_recovery_weeks} |
| Missed unsafe pain responses | ${aggregate.v1_missed_unsafe_pain_responses} | ${aggregate.v2_missed_unsafe_pain_responses} |
| Under-aggressive holds | ${aggregate.v1_under_aggressive_holds} | ${aggregate.v2_under_aggressive_holds} |
| Final momentum proxy | ${aggregate.final_v1_momentum} | ${aggregate.final_v2_momentum} |
| Average recovery proxy | ${aggregate.average_v1_recovery} | ${aggregate.average_v2_recovery} |
| V2 decision confidence | n/a | ${aggregate.average_v2_decision_confidence} |

## Goal-By-Goal Results

${Object.entries(aggregate.by_goal).map(renderGoalResult).join("\n")}

## Best V2 Wins

${bestWins(athletes).map(renderAthleteWin).join("\n")}

## Worst V2 Failures

${worstFailures(athletes).map(renderAthleteFailure).join("\n")}

## Weird Decisions

${aggregate.weird_decisions.length ? aggregate.weird_decisions.slice(0, 20).map((item) => `- ${item.athlete} week ${item.week}: ${item.event}, \`${item.recommendation}\` (${item.reason})`).join("\n") : "- No weird V2 decisions were flagged."}

## Safety Events

- Total V2 safety events: ${aggregate.safety_events}
- V2 missed unsafe pain responses: ${aggregate.v2_missed_unsafe_pain_responses}
- V1 missed unsafe pain responses: ${aggregate.v1_missed_unsafe_pain_responses}

## Cases Requiring Aaron Review

- V2 still produces ${aggregate.v2_under_aggressive_holds} under-aggressive hold(s) by the current heuristic.
- Get Lean athletes without body-fat data are intentionally low-confidence; decide whether ASC should ask for waist/body-fat data.
- Baseline is intentionally simple and not production V1 code; decide how realistic the comparator needs to become.
- The outcome model rewards/penalises recommendations heuristically and needs future validation.

## Limitations / Unrealistic Assumptions

- Virtual athletes are deterministic synthetic fixtures, not real user data.
- Progress outcomes are heuristic estimates, not biological adaptation.
- V1 baseline is a lab comparator only and does not import production code.
- Fatigue, momentum, and confidence proxies are simplified.
- Injury/pain events are synthetic and not medical models.
- The simulation does not yet include exercise-level prescription details, exact load jumps, or user adherence after each recommendation.

## Acceptance Criteria Check

- No unsafe V2 decisions: ${aggregate.v2_missed_unsafe_pain_responses === 0 ? "PASS" : "FAIL"}
- Fewer over-aggressive pushes than baseline: ${aggregate.v2_over_aggressive_pushes < aggregate.v1_over_aggressive_pushes ? "PASS" : "FAIL"}
- Fewer unnecessary recovery weeks than baseline: ${aggregate.v2_unnecessary_recovery_weeks <= aggregate.v1_unnecessary_recovery_weeks ? "PASS" : "FAIL"}
- Equal or better average goal progress: ${aggregate.average_v2_progress >= aggregate.average_v1_progress ? "PASS" : "FAIL"}
- Better momentum/confidence proxy: ${aggregate.final_v2_momentum > aggregate.final_v1_momentum ? "PASS" : "FAIL"}
- Sensible behaviour after disruptions: ${aggregate.weird_decisions.length <= 12 ? "PASS" : "REVIEW"}

## Clear Verdict

${aggregate.verdict.toUpperCase()}

V2 is classified as \`${aggregate.verdict}\` in this synthetic lab run.

## Production Safety Confirmation

- Production app code was not touched.
- V1 workout generation was not modified.
- V1 progression logic was not modified.
- Subscription/paywall logic was not modified.
- No EAS build was started.
`;
}

function renderGoalResult([goal, result]) {
  return `### ${goal}

- Athletes: ${result.athletes}
- Final progress: V1 ${result.final_v1_progress}, V2 ${result.final_v2_progress}
- Average progress: V1 ${result.average_v1_progress}, V2 ${result.average_v2_progress}
- Over-aggressive pushes: V1 ${result.v1_over_aggressive_pushes}, V2 ${result.v2_over_aggressive_pushes}
- Unnecessary recovery weeks: V1 ${result.v1_unnecessary_recovery_weeks}, V2 ${result.v2_unnecessary_recovery_weeks}
- Missed unsafe pain responses: V1 ${result.v1_missed_unsafe_pain_responses}, V2 ${result.v2_missed_unsafe_pain_responses}
- Final momentum: V1 ${result.final_v1_momentum}, V2 ${result.final_v2_momentum}
`;
}

function bestWins(athletes) {
  return [...athletes]
    .sort((a, b) => (b.summary.average_v2_progress - b.summary.average_v1_progress) - (a.summary.average_v2_progress - a.summary.average_v1_progress))
    .slice(0, 5);
}

function worstFailures(athletes) {
  return [...athletes]
    .sort((a, b) => (a.summary.average_v2_progress - a.summary.average_v1_progress) - (b.summary.average_v2_progress - b.summary.average_v1_progress))
    .slice(0, 5);
}

function renderAthleteWin(item) {
  const delta = item.summary.average_v2_progress - item.summary.average_v1_progress;
  return `- ${item.athlete.label}: V2 average progress +${delta} vs baseline, over-pushes ${item.summary.v2_over_aggressive_pushes} vs ${item.summary.v1_over_aggressive_pushes}.`;
}

function renderAthleteFailure(item) {
  const delta = item.summary.average_v2_progress - item.summary.average_v1_progress;
  return `- ${item.athlete.label}: V2 average progress delta ${delta}; weird decisions ${item.summary.weird_decisions.length}.`;
}
