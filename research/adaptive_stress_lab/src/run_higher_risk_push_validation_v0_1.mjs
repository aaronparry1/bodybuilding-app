import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { calculateCoachingState } from "./coaching_state_engine.mjs";
import { runCoachingOpportunityAuditV0_1 } from "./coaching_opportunity_audit_v0_1.mjs";
import { createCoachingRecommendation } from "./decision_engine_v0_2.mjs";
import { evaluateSafetyGate } from "./safety_gate.mjs";
import { runSimulationV0_3 } from "./simulation_v0_3.mjs";
import { pushTypeScenariosV0_1 } from "../gauntlet/push_type_scenarios_v0_1.mjs";

const labRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const repoRoot = dirname(dirname(labRoot));
const reportPath = join(repoRoot, "reports", "adaptive_stress_lab", "higher_risk_push_validation_v0_1.md");
const profiles = JSON.parse(await readFile(join(labRoot, "data", "athlete_profiles.json"), "utf8"));
const generatedAt = new Date();

const scenarioResults = runScenarios();
const simulation = runSimulationV0_3();
const audit = runCoachingOpportunityAuditV0_1({ simulation });

await mkdir(dirname(reportPath), { recursive: true });
await writeFile(reportPath, renderReport({ scenarioResults, simulation, audit, generatedAt }), "utf8");

console.log("Higher-risk push validation v0.1 complete");
console.log(`Scenarios: ${scenarioResults.length}`);
console.log(`Simulation weeks: ${simulation.aggregate.total_weeks}`);
console.log(`Pushes: ${simulation.aggregate.push_count}`);
console.log(`Report: ${reportPath}`);

function runScenarios() {
  return pushTypeScenariosV0_1.map((scenario) => {
    const athlete = scenario.athlete ?? profiles.find((profile) => profile.id === scenario.athleteProfileId);
    if (!athlete) throw new Error(`Missing athlete ${scenario.athleteProfileId}`);
    const coachingState = calculateCoachingState({ athlete, evidence: scenario.evidence, now: generatedAt });
    const safetyGate = evaluateSafetyGate({ athlete, evidence: scenario.evidence, coachingState });
    const recommendation = createCoachingRecommendation({ athlete, evidence: scenario.evidence, coachingState, safetyGate });
    const pass = recommendation.recommendation_type === scenario.expected.recommendation_type &&
      (!scenario.expected.push_category || recommendation.push_category === scenario.expected.push_category);
    return { scenario, athlete, coachingState, safetyGate, recommendation, pass };
  });
}

function renderReport({ scenarioResults, simulation, audit, generatedAt }) {
  const passed = scenarioResults.filter((result) => result.pass);
  const failed = scenarioResults.filter((result) => !result.pass);
  const pushTypes = audit.metrics.by_push_type;

  return `# Higher-Risk Push Validation v0.1

Generated: ${generatedAt.toISOString()}

## Scope

Sprint 14 validates that the V2 research coach can use higher-risk push categories without becoming reckless or collapsing into micro-push only behaviour.

This is research-lab validation only. It does not modify production app behaviour, V1 workout generation, V1 progression, subscription logic, or EAS build configuration.

## Push Type Eligibility Rules

### \`micro_push\`

- Smallest possible progression.
- Default positive progression option.
- Used when evidence is strong but not exceptional enough for volume, load, or performance pushing.

### \`volume_push\`

- Adds a small amount of productive work without increasing load.
- Requires high evidence quality, high recovery capacity, high quality-volume tolerance, high target-range completion, no workload-density warning, no recovery compression, and a muscle-building relevant goal.

### \`load_push\`

- Increases actual load by the smallest sensible jump.
- Requires repeated same-exercise success, repeated top-end target-range evidence, high evidence quality, strength-relevant goal progress, clear Safety Gate, no recent recovery compression, and a sensible available load jump.

### \`performance_push\`

- Planned milestone or rep-PR attempt.
- Requires exceptional evidence, 5+ same-exercise successful exposures, long stable block, clear Safety Gate, high recovery capacity, high momentum, high confidence, and an explicit milestone opportunity.
- Remains rare and deliberately scheduled, not reactive.

## Scenario Results

- Total scenarios: ${scenarioResults.length}
- Passed: ${passed.length}
- Failed: ${failed.length}
- Categories exercised: ${categoriesExercised(scenarioResults).join(", ")}

${failed.length ? failed.map(renderFailure).join("\n") : "- No failed Sprint 14 scenarios."}

## Scenario Category Summary

${renderScenarioCategorySummary(scenarioResults)}

## Simulation v0.3 Results

- Targeted athletes: ${simulation.aggregate.total_athletes}
- Targeted weeks/cases: ${simulation.aggregate.total_weeks}
- Push count: ${simulation.aggregate.push_count}
- Missed expected pushes: ${simulation.aggregate.missed_expected_pushes}
- Wrong push categories: ${simulation.aggregate.wrong_push_categories}
- Unsafe pushes: ${simulation.aggregate.unsafe_pushes}
- Verdict: ${simulation.aggregate.verdict}

## Push Type Audit

| Push Type | Actual | Correct | Incorrect | Correctness | Premature | Missed | Avg Confidence | 4w Outcome |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
${["micro_push", "volume_push", "load_push", "performance_push"].map((category) => {
  const item = pushTypes[category];
  return `| \`${category}\` | ${item.total} | ${item.correct} | ${item.incorrect} | ${item.correctness_rate}% | ${item.premature} | ${item.missed} | ${item.average_confidence} | ${item.four_week_outcome_rate}% |`;
}).join("\n")}

## Before / After

| Metric | Before Sprint 14 | Sprint 14 Targeted Validation |
| --- | ---: | ---: |
| Actual \`micro_push\` | 150 | ${pushTypes.micro_push.total} |
| Actual \`volume_push\` | 0 | ${pushTypes.volume_push.total} |
| Actual \`load_push\` | 0 | ${pushTypes.load_push.total} |
| Actual \`performance_push\` | 0 | ${pushTypes.performance_push.total} |
| Premature pushes | 0 | ${audit.metrics.opportunity.premature_pushes} |
| Missed pushes | 20 | ${audit.metrics.opportunity.missed_pushes} |
| High-confidence wrong decisions | 0 | ${audit.metrics.high_confidence_wrong} |

## Weird Decisions / Failures

${simulation.aggregate.wrong_push_categories === 0 && simulation.aggregate.unsafe_pushes === 0 ? "- No wrong push categories or unsafe pushes in targeted simulation v0.3." : "- Review targeted simulation failures before any future production prototype."}

## Interpretation

The V2 lab coach is no longer micro-push only under targeted evidence. It can choose \`volume_push\`, \`load_push\`, and \`performance_push\` when the evidence is intentionally strong enough, while still blocking poor-recovery, post-swap, pain, excessive-jump, low-confidence, and get-lean volume-push cases.

This does not prove production readiness. It proves the category rules are reachable and testable in the lab.

## Open Aaron Decisions

1. Should \`performance_push\` remain available only for powerlifting, strength, and athletic-performance contexts?
2. Should \`volume_push\` ever be allowed in a Get Lean phase when performance preservation is excellent?
3. Should \`load_push\` require exactly the same exercise, or can close competition variants count after a future validation sprint?
4. Should higher-risk push confidence remain capped at 85 until real-world validation exists?
5. What is the minimum acceptable four-week outcome rate for each push category before production prototype work begins?

## Production Status

Production app untouched. No V1 changes. No EAS build started.
`;
}

function renderScenarioCategorySummary(results) {
  const categories = ["micro_push", "volume_push", "load_push", "performance_push", "hold", "consolidate", "reduce", "recover", "stop_movement"];
  return `| Expected | Count | Passed |
| --- | ---: | ---: |
${categories.map((category) => {
    const items = results.filter((result) => (result.scenario.expected.push_category ?? result.scenario.expected.recommendation_type) === category);
    return `| \`${category}\` | ${items.length} | ${items.filter((item) => item.pass).length} |`;
  }).join("\n")}`;
}

function renderFailure(result) {
  return `- \`${result.scenario.id}\`: expected \`${result.scenario.expected.push_category ?? result.scenario.expected.recommendation_type}\`, got \`${result.recommendation.push_category ?? result.recommendation.recommendation_type}\`.`;
}

function categoriesExercised(results) {
  return Array.from(new Set(results
    .map((result) => result.recommendation.push_category)
    .filter(Boolean)))
    .sort();
}
