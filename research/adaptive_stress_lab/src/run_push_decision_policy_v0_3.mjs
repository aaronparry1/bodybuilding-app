import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { calculateCoachingState } from "./coaching_state_engine.mjs";
import { runCoachingOpportunityAuditV0_1 } from "./coaching_opportunity_audit_v0_1.mjs";
import { createCoachingRecommendation } from "./decision_engine_v0_2.mjs";
import { evaluatePushDecisionPolicy } from "./push_decision_policy_v0_3.mjs";
import { runPushOutcomeLearningV0_2 } from "./push_outcome_learning_v0_2.mjs";
import { evaluateSafetyGate } from "./safety_gate.mjs";
import { runSimulationV0_2 } from "./simulation_v0_2.mjs";
import { runSimulationV0_3 } from "./simulation_v0_3.mjs";
import { pushTypeScenariosV0_1 } from "../gauntlet/push_type_scenarios_v0_1.mjs";

const labRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const repoRoot = dirname(dirname(labRoot));
const reportPath = join(repoRoot, "reports", "adaptive_stress_lab", "push_decision_policy_v0_3.md");
const profiles = JSON.parse(await readFile(join(labRoot, "data", "athlete_profiles.json"), "utf8"));
const generatedAt = new Date();

const scenarioResults = runScenarioPolicyAudit();
const simulationV0_2 = runSimulationV0_2();
const simulationV0_3 = runSimulationV0_3();
const opportunityAudit = runCoachingOpportunityAuditV0_1({ simulation: simulationV0_2 });
const targetedOpportunityAudit = runCoachingOpportunityAuditV0_1({ simulation: simulationV0_3 });
const pushOutcomeLearning = runPushOutcomeLearningV0_2();

await mkdir(dirname(reportPath), { recursive: true });
await writeFile(reportPath, renderReport({
  scenarioResults,
  simulationV0_3,
  opportunityAudit,
  targetedOpportunityAudit,
  pushOutcomeLearning,
  generatedAt,
}), "utf8");

console.log("Push Decision Policy v0.3 complete");
console.log(`Policy scenarios: ${scenarioResults.length}`);
console.log(`Allowed pushes: ${scenarioResults.filter((item) => item.policy.eligible).length}`);
console.log(`Blocked pushes/non-push cases: ${scenarioResults.filter((item) => !item.policy.eligible).length}`);
console.log(`Report: ${reportPath}`);

function runScenarioPolicyAudit() {
  return pushTypeScenariosV0_1.map((scenario) => {
    const athlete = scenario.athlete ?? profiles.find((profile) => profile.id === scenario.athleteProfileId);
    if (!athlete) throw new Error(`Missing athlete ${scenario.athleteProfileId}`);
    const coachingState = calculateCoachingState({ athlete, evidence: scenario.evidence, now: generatedAt });
    const safetyGate = evaluateSafetyGate({ athlete, evidence: scenario.evidence, coachingState });
    const policy = evaluatePushDecisionPolicy({ athlete, evidence: scenario.evidence, coachingState, safetyGate });
    const recommendation = createCoachingRecommendation({ athlete, evidence: scenario.evidence, coachingState, safetyGate });
    return {
      scenario,
      athlete,
      coachingState,
      safetyGate,
      policy,
      recommendation,
      expected: scenario.expected.push_category ?? scenario.expected.recommendation_type,
      actual: recommendation.push_category ?? recommendation.recommendation_type,
      pass: (scenario.expected.push_category ?? scenario.expected.recommendation_type) === (recommendation.push_category ?? recommendation.recommendation_type),
    };
  });
}

function renderReport({ scenarioResults, simulationV0_3, opportunityAudit, targetedOpportunityAudit, pushOutcomeLearning, generatedAt }) {
  const allowed = scenarioResults.filter((result) => result.policy.eligible);
  const blocked = scenarioResults.filter((result) => !result.policy.eligible);
  const failed = scenarioResults.filter((result) => !result.pass);
  const opportunity = opportunityAudit.metrics;
  const targeted = targetedOpportunityAudit.metrics;
  const pushOutcomes = pushOutcomeLearning.outcome_distribution_by_push_type;

  return `# Push Decision Policy v0.3

Generated: ${generatedAt.toISOString()}

## Scope

Sprint 18 turns Push Outcome Learning v0.2 into an explicit lab-only Push Decision Policy.

This is research-only. It does not touch production app code, V1 workout generation, V1 progression, subscription logic, RevenueCat, or EAS build configuration.

## Core Principle

No push type is automatically safe.

Every push must be goal-specific, context-specific, and evidence-earned.

Synthetic outcome learning remains advisory only. It can inform policy design, but it does not automatically mutate the Decision Engine.

## Policy Inputs

- goal
- derived evidence quality
- recovery capacity
- momentum
- adaptation
- confidence
- Safety Gate status
- goal-progress evidence
- same-exercise successful exposures
- load ownership state
- quality-volume trend
- workload density
- recent shutdowns
- pain flags
- missed ranges
- swap/new-exercise uncertainty
- advisory outcome-learning context

## Base Push Blockers

A push is blocked if any of these are present:

- Safety Gate is not clear
- evidence quality below 90
- fewer than 3 same-exercise successful exposures
- recovery capacity below 80
- momentum below 75
- adaptation below 75
- confidence below 70
- no repeated positive push signal
- recent shutdown or pain
- recent missed range
- swap/new-exercise uncertainty
- recent recovery compression
- high workload-density warning

## Goal-Specific Behaviour

### Strength

- Prefer \`load_push\` only when previous load is owned or not yet blocked by ownership state and same-exercise evidence is strong.
- \`micro_push\` is allowed only when it supports the strength lift without creating fatigue debt.
- \`volume_push\` remains rare and targeted.

### Build Muscle

- Prefer \`volume_push\` when quality-volume trend is positive, target-range completion is high, and recovery is strong.
- \`micro_push\` is not automatic.
- \`load_push\` still requires ownership, top-end target-range success, and a sensible jump.

### Build Muscle + Strength

- Choose \`volume_push\` or \`load_push\` based on whether the limiting factor is quality stimulus or load ownership.
- Do not push both at once.

### Get Lean

- Push is conservative and performance-preservation led.
- Volume push is blocked unless future evidence explicitly supports it.
- Weak body-composition confidence cannot justify push.

### Athletic Performance

- No push without explicit power, dynamic, or milestone evidence.
- No bar-speed claims without sensors.
- \`performance_push\` requires a deliberate milestone context.

### Maintenance

- Push only when user goal and evidence justify it.
- Otherwise hold or consolidate.

## Push Type Policy

| Push Type | Role | Main Requirements |
| --- | --- | --- |
| \`micro_push\` | Smallest possible increase | Strong evidence, clear safety, good recovery; blocked for Get Lean unless performance preservation is excellent. |
| \`volume_push\` | Add productive work | Muscle-building goal, quality-volume tolerance, 4+ same-exercise exposures, high target-range completion, no high recovery cost. |
| \`load_push\` | Increase actual load | Strength-relevant goal, 3+ same-exercise exposures, 3+ top-end successes, sensible jump, strength progress support. |
| \`performance_push\` | Planned milestone | Rare; 5+ same-exercise exposures, stable block, exceptional evidence, explicit milestone opportunity. |

## Policy Scenario Results

- Total policy scenarios: ${scenarioResults.length}
- Passed against expected category: ${scenarioResults.length - failed.length}
- Failed against expected category: ${failed.length}
- Pushes allowed by policy: ${allowed.length}
- Pushes blocked or non-push cases: ${blocked.length}

${failed.length ? failed.map(renderFailure).join("\n") : "- No Sprint 18 policy scenario failures."}

## Push Type Distribution In Policy Scenarios

${renderCountsTable(countBy(scenarioResults, (item) => item.actual))}

## Allowed Push Examples

${allowed.slice(0, 12).map(renderAllowedExample).join("\n")}

## Blocked Push / Downgrade Examples

${blocked.slice(0, 12).map(renderBlockedExample).join("\n")}

## Before / After Metrics

| Metric | Before Policy Context | After Policy / Current Lab |
| --- | ---: | ---: |
| Overall correctness | 94% | ${opportunity.correctness_rate}% |
| Push correctness | 100% | ${aggregatePushCorrectness(opportunity.by_push_type)}% |
| Premature pushes | 0 | ${opportunity.opportunity.premature_pushes} |
| Missed pushes | 20 | ${opportunity.opportunity.missed_pushes} |
| High-confidence wrong decisions | 0 | ${opportunity.high_confidence_wrong} |
| Total opportunity cost | 475 | ${opportunity.total_opportunity_cost} |
| Four-week positive outcome rate | n/a | ${opportunity.four_week_positive_rate}% |

The main 52-week Simulation v0.2 audit is unchanged in broad shape because it already used conservative push thresholds and does not heavily exercise higher-risk push types. The targeted Simulation v0.3 confirms the policy still allows higher-risk pushes when deliberately earned.

## Targeted Higher-Risk Push Behaviour

| Push Type | Actual | Correct | Incorrect | Missed | Avg Confidence | 4w Outcome |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
${["micro_push", "volume_push", "load_push", "performance_push"].map((category) => {
  const item = targeted.by_push_type[category];
  return `| \`${category}\` | ${item.total} | ${item.correct} | ${item.incorrect} | ${item.missed} | ${item.average_confidence} | ${item.four_week_outcome_rate}% |`;
}).join("\n")}

## Simulation v0.3 Summary

- Targeted athletes/cases: ${simulationV0_3.aggregate.total_athletes}
- Targeted weeks/cases: ${simulationV0_3.aggregate.total_weeks}
- Push count: ${simulationV0_3.aggregate.push_count}
- Missed expected pushes: ${simulationV0_3.aggregate.missed_expected_pushes}
- Wrong push categories: ${simulationV0_3.aggregate.wrong_push_categories}
- Unsafe pushes: ${simulationV0_3.aggregate.unsafe_pushes}
- Verdict: ${simulationV0_3.aggregate.verdict}

${renderSimulationPushDistribution(simulationV0_3.aggregate.by_push_type)}

## Outcome Learning Context

Push Outcome Learning v0.2 remains advisory and synthetic:

| Push Type | Events | Success | Negative/Unsafe | Avg Confidence |
| --- | ---: | ---: | ---: | ---: |
${["micro_push", "volume_push", "load_push", "performance_push"].map((category) => {
  const item = pushOutcomes[category];
  return `| \`${category}\` | ${item.total} | ${item.success_rate}% | ${item.negative_or_unsafe_rate}% | ${item.average_confidence} |`;
}).join("\n")}

- Advisory threshold candidates: ${pushOutcomeLearning.advisory_threshold_candidates.length}
- Rejected findings: ${pushOutcomeLearning.rejected_findings.length}
- Sample-size warnings: ${pushOutcomeLearning.sample_size_warnings.length}

## Did The Policy Improve Outcome Learning?

The policy improves decision explicitness and testability more than it changes the existing long-horizon synthetic totals.

- It prevents generic \`push\` recommendations from leaving the Decision Engine without a push type.
- It blocks push when safety, evidence quality, same-exercise exposure, recovery, momentum, missed-range, density, or uncertainty rules are not met.
- It allows \`volume_push\`, \`load_push\`, and \`performance_push\` in targeted validation instead of collapsing into \`micro_push\` only.
- It does not claim the synthetic outcome rates prove production readiness.

## Remaining Weaknesses

- Outcome learning is still synthetic and should not be treated as athlete truth.
- Main 52-week Simulation v0.2 under-exercises higher-risk pushes, so v0.3 targeted cases remain necessary.
- \`micro_push\` remains mixed in synthetic outcome learning despite clean scenario correctness.
- Load ownership can still be \`unknown\`; future policy should require explicit ownership for production prototype.
- Get Lean push policy needs real body-composition confidence rules before production use.
- Athletic Performance needs explicit power/dynamic performance evidence; no sensor-free bar-speed inference.

## Open Aaron Decisions

1. Should future production prototype require explicit \`owned\` load state before any \`load_push\`, or allow unknown ownership in early versions?
2. Should \`volume_push\` ever be allowed during Get Lean when performance preservation is excellent?
3. Should \`performance_push\` remain limited to planned milestone blocks?
4. What minimum real-world success rate is acceptable for each push type before production integration?
5. Should micro-push be renamed internally if synthetic outcomes continue showing it is not reliably low risk?

## Production Status

Production app untouched. V1 untouched. No EAS build started.
`;
}

function renderAllowedExample(result) {
  return `- \`${result.scenario.id}\` — allowed \`${result.policy.recommended_push_type}\`; actual recommendation \`${result.actual}\`; confidence ${result.policy.confidence}.`;
}

function renderBlockedExample(result) {
  const reasons = result.policy.blocked_reasons.slice(0, 3).join(" ");
  return `- \`${result.scenario.id}\` — policy \`${result.policy.recommended_push_type}\`, recommendation \`${result.actual}\`; blocked because ${reasons || "no push type earned."}`;
}

function renderFailure(result) {
  return `- \`${result.scenario.id}\`: expected \`${result.expected}\`, got \`${result.actual}\`.`;
}

function renderCountsTable(counts) {
  return `| Output | Count |
| --- | ---: |
${Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .map(([key, count]) => `| \`${key}\` | ${count} |`)
    .join("\n")}`;
}

function renderSimulationPushDistribution(byPushType) {
  return `| Push Type | Total | Correct Category | Premature |
| --- | ---: | ---: | ---: |
${Object.entries(byPushType).map(([category, item]) => `| \`${category}\` | ${item.total} | ${item.correct_category} | ${item.premature} |`).join("\n")}`;
}

function aggregatePushCorrectness(byPushType) {
  const items = Object.values(byPushType);
  const total = items.reduce((sum, item) => sum + item.total, 0);
  const correct = items.reduce((sum, item) => sum + item.correct, 0);
  if (!total) return 0;
  return Math.round((correct / total) * 100);
}

function countBy(items, getKey) {
  return items.reduce((counts, item) => {
    const key = getKey(item);
    counts[key] = (counts[key] ?? 0) + 1;
    return counts;
  }, {});
}
