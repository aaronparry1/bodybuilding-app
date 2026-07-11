import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { calculateCoachingState } from "./coaching_state_engine.mjs";
import { createCoachingRecommendation } from "./decision_engine_v0_2.mjs";
import { explicitEvidenceDrivers } from "./evidence_detail.mjs";
import { evaluateSafetyGate } from "./safety_gate.mjs";
import { gauntletScenariosV0_3 } from "../gauntlet/scenarios_v0_3.mjs";
import { gauntletScenariosV0_4 } from "../gauntlet/scenarios_v0_4.mjs";
import { RUBRIC_FIELDS, scoreGauntletDecision } from "../gauntlet/rubric.mjs";

const labRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const repoRoot = dirname(dirname(labRoot));
const reportPath = join(repoRoot, "reports", "adaptive_stress_lab", "coaching_gauntlet_v0_4.md");
const profiles = JSON.parse(await readFile(join(labRoot, "data", "athlete_profiles.json"), "utf8"));
const generatedAt = new Date();

const v03Results = runScenarios(gauntletScenariosV0_3);
const results = runScenarios(gauntletScenariosV0_4);
const changed = compareResults(v03Results, results);

validateResults(results);

await mkdir(dirname(reportPath), { recursive: true });
await writeFile(reportPath, renderReport({ results, changed, generatedAt }), "utf8");

console.log("Coaching Gauntlet v0.4 complete");
console.log(`Scenarios: ${results.length}`);
console.log(`Passed: ${results.filter((result) => result.score.pass).length}`);
console.log(`Failed: ${results.filter((result) => !result.score.pass).length}`);
console.log(`Changed decisions from v0.3: ${changed.length}`);
console.log(`Report: ${reportPath}`);

function runScenarios(scenarios) {
  return scenarios.map((scenario) => {
    const athlete = profiles.find((profile) => profile.id === scenario.athleteProfileId);
    if (!athlete) throw new Error(`Missing athlete profile ${scenario.athleteProfileId}`);
    const coachingState = calculateCoachingState({ athlete, evidence: scenario.evidence, now: generatedAt });
    const safetyGate = evaluateSafetyGate({ athlete, evidence: scenario.evidence, coachingState });
    const recommendation = createCoachingRecommendation({ athlete, evidence: scenario.evidence, coachingState, safetyGate });
    const score = scoreGauntletDecision({ scenario, recommendation, safetyGate });
    return { scenario, athlete, coachingState, safetyGate, recommendation, score };
  });
}

function validateResults(items) {
  if (items.length < 174) throw new Error(`Expected at least 174 scenarios, got ${items.length}`);
  for (const result of items) {
    if (containsMagicLabel(result.scenario.evidence.systemicSignals)) throw new Error(`${result.scenario.id} still contains magic label`);
    if (result.scenario.evidence.evidenceModelVersion !== "v0.4") throw new Error(`${result.scenario.id} missing v0.4 evidence model marker`);
    for (const field of RUBRIC_FIELDS) {
      if (!Number.isInteger(result.score.scores[field])) throw new Error(`${result.scenario.id} missing score ${field}`);
    }
  }
}

function renderReport({ results, changed, generatedAt }) {
  const passed = results.filter((result) => result.score.pass);
  const failed = results.filter((result) => !result.score.pass);
  const removed = results.every((result) => !containsMagicLabel(result.scenario.evidence.systemicSignals));

  return `# Coaching Gauntlet v0.4

Generated: ${generatedAt.toISOString()}

## Scope

The Coaching Gauntlet v0.4 removes broad fixture labels from scenario systemic signals and forces context inference through explicit evidence fields.

## Pass/Fail Summary

- Total scenarios: ${results.length}
- Passed: ${passed.length}
- Failed: ${failed.length}
- Pass rate: ${Math.round((passed.length / results.length) * 100)}%
- Decisions changed from v0.3: ${changed.length}

## Magic Label Removal

- Magic labels removed from v0.4 scenario systemic signals: ${removed ? "yes" : "no"}
- Removed labels: \`planned_consolidation\`, \`post_swap_improvement\`, \`high_frequency\`, \`compound_density_high\`, \`hidden_overreach\`
- Decision/State/Safety leak tests are enforced in \`coaching_gauntlet_v0_4.test.mjs\`.

## Evidence Confidence Effects

- Low evidence confidence compresses normal clear-safety decisions toward \`hold\`.
- Low evidence confidence reduces Coaching State \`coaching_opportunity\`.
- Low evidence confidence reduces recommendation confidence.
- High evidence confidence is required before excellent-state evidence can become \`push\`.
- Safety Gate still overrides regardless of evidence confidence.

## Level Summary

${renderLevelSummary(results)}

## Recommendation Distribution

${renderDistribution(results)}

## Decisions Changed From v0.3

${changed.length ? changed.map(renderChangedDecision).join("\n") : "- No recommendation, aggressiveness, or Safety Gate status changed versus v0.3."}

## Failed Scenarios

${failed.length ? failed.map(renderScenarioSummary).join("\n") : "- No failed scenarios in this run."}

## Remaining Broad Assumptions

- Legacy \`performanceTrend\`, \`fatigueState\`, \`recoveryState\`, and \`localLiftSignals\` are still retained for compatibility with v0.1-v0.3.
- v0.5 should decide whether to remove those legacy summary fields from the v0.4-only path.
- Explicit evidence confidence is now active, but the score magnitudes are still research heuristics.

## Open Aaron Decisions

1. Should v0.5 remove \`performanceTrend\`, \`fatigueState\`, and \`recoveryState\` from v0.4-only scenarios?
2. Should production prototype eligibility require all mandatory v0.4 fields or allow graceful degradation?
3. Should confidence weighting affect Safety Gate confidence, or stay outside safety decisions permanently?

## Full Scenario Results

${results.map(renderFullResult).join("\n")}

## Production Safety Confirmation

- Production app code was not imported.
- Production app behaviour was not modified.
- V1 workout generation was not modified.
- V1 progression logic was not modified.
- Paywall/subscription logic was not modified.
- No EAS build was started.
`;
}

function compareResults(oldResults, newResults) {
  const oldByNormalisedId = new Map(oldResults.map((result) => [normaliseId(result.scenario.id), result]));
  return newResults.flatMap((result) => {
    const old = oldByNormalisedId.get(normaliseId(result.scenario.id));
    if (!old) return [];
    const changedDecision = old.recommendation.recommendation_type !== result.recommendation.recommendation_type;
    const changedAggression = old.recommendation.aggressiveness !== result.recommendation.aggressiveness;
    const changedSafety = old.safetyGate.status !== result.safetyGate.status;
    if (!changedDecision && !changedAggression && !changedSafety) return [];
    return [{ old, current: result }];
  });
}

function normaliseId(id) {
  return id.replace(/^v04_/, "").replace(/^v03_/, "").replace(/^v02_/, "");
}

function renderLevelSummary(results) {
  const byLevel = groupBy(results, (result) => result.scenario.level_label);
  return Object.entries(byLevel)
    .map(([level, items]) => {
      const passCount = items.filter((item) => item.score.pass).length;
      return `- ${level}: ${passCount}/${items.length} passed (${Math.round((passCount / items.length) * 100)}%)`;
    })
    .join("\n");
}

function renderDistribution(results) {
  const byType = groupBy(results, (result) => result.recommendation.recommendation_type);
  return Object.entries(byType)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([type, items]) => `- \`${type}\`: ${items.length}`)
    .join("\n");
}

function renderChangedDecision(item) {
  return `### ${item.current.scenario.title}

- ID: \`${item.current.scenario.id}\`
- v0.3: \`${item.old.recommendation.recommendation_type}\` / \`${item.old.recommendation.aggressiveness}\`, Safety Gate \`${item.old.safetyGate.status}\`
- v0.4: \`${item.current.recommendation.recommendation_type}\` / \`${item.current.recommendation.aggressiveness}\`, Safety Gate \`${item.current.safetyGate.status}\`
- Evidence drivers: ${explicitEvidenceDrivers(item.current.scenario.evidence).join(", ")}
`;
}

function renderScenarioSummary(result) {
  return `### ${result.scenario.title}

- ID: \`${result.scenario.id}\`
- Pass: ${result.score.pass}
- Score: ${result.score.percentage}%
- Expected: ${result.score.expectation.recommendation_types.map((type) => `\`${type}\``).join(", ")}
- Actual: \`${result.recommendation.recommendation_type}\` / \`${result.recommendation.aggressiveness}\`
- Safety Gate: expected \`${result.score.expectation.safety_gate_status}\`, actual \`${result.safetyGate.status}\`
- Evidence drivers: ${explicitEvidenceDrivers(result.scenario.evidence).join(", ")}
- Failure reasons: ${result.score.failure_reasons.length ? result.score.failure_reasons.join("; ") : "none"}
`;
}

function renderFullResult(result) {
  return `### ${result.scenario.id}

- Title: ${result.scenario.title}
- Level: ${result.scenario.level_label}
- Athlete profile: ${result.athlete.label}
- Safety Gate: \`${result.safetyGate.status}\`, veto ${result.safetyGate.veto}
- Actual recommendation: \`${result.recommendation.recommendation_type}\` / \`${result.recommendation.aggressiveness}\`
- Pass: ${result.score.pass}
- Score: ${result.score.percentage}%
- Evidence drivers: ${explicitEvidenceDrivers(result.scenario.evidence).join(", ")}
- Recommendation confidence: ${result.recommendation.confidence}
`;
}

function containsMagicLabel(systemicSignals = []) {
  return systemicSignals.some((signal) => ["planned_consolidation", "post_swap_improvement", "high_frequency", "compound_density_high", "hidden_overreach"].includes(signal));
}

function groupBy(items, getKey) {
  return items.reduce((groups, item) => {
    const key = getKey(item);
    groups[key] ??= [];
    groups[key].push(item);
    return groups;
  }, {});
}
