import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { calculateCoachingState } from "./coaching_state_engine.mjs";
import { createCoachingRecommendation } from "./decision_engine_v0_2.mjs";
import { evaluateSafetyGate } from "./safety_gate.mjs";
import { gauntletScenarios } from "../gauntlet/scenarios.mjs";
import { RUBRIC_FIELDS, scoreGauntletDecision } from "../gauntlet/rubric.mjs";

const labRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const repoRoot = dirname(dirname(labRoot));
const reportPath = join(repoRoot, "reports", "adaptive_stress_lab", "coaching_gauntlet_v0_1.md");
const profiles = JSON.parse(await readFile(join(labRoot, "data", "athlete_profiles.json"), "utf8"));
const generatedAt = new Date();

const results = gauntletScenarios.map((scenario) => {
  const athlete = profiles.find((profile) => profile.id === scenario.athleteProfileId);
  if (!athlete) throw new Error(`Missing athlete profile ${scenario.athleteProfileId}`);
  const coachingState = calculateCoachingState({ athlete, evidence: scenario.evidence, now: generatedAt });
  const safetyGate = evaluateSafetyGate({ athlete, evidence: scenario.evidence, coachingState });
  const recommendation = createCoachingRecommendation({ athlete, evidence: scenario.evidence, coachingState, safetyGate });
  const score = scoreGauntletDecision({ scenario, recommendation, safetyGate });
  return { scenario, athlete, coachingState, safetyGate, recommendation, score };
});

validateResults(results);

await mkdir(dirname(reportPath), { recursive: true });
await writeFile(reportPath, renderReport({ results, generatedAt }), "utf8");

console.log("Coaching Gauntlet v0.1 complete");
console.log(`Scenarios: ${results.length}`);
console.log(`Passed: ${results.filter((result) => result.score.pass).length}`);
console.log(`Failed: ${results.filter((result) => !result.score.pass).length}`);
console.log(`Report: ${reportPath}`);

function validateResults(results) {
  if (results.length < 50) throw new Error(`Expected at least 50 scenarios, got ${results.length}`);
  for (const result of results) {
    if (!result.recommendation.recommendation_type) throw new Error(`${result.scenario.id} missing recommendation`);
    if (!result.safetyGate.status) throw new Error(`${result.scenario.id} missing safety gate`);
    if (!result.coachingState.status) throw new Error(`${result.scenario.id} missing coaching state`);
    for (const field of RUBRIC_FIELDS) {
      if (!Number.isInteger(result.score.scores[field])) throw new Error(`${result.scenario.id} missing score ${field}`);
    }
  }
}

function renderReport({ results, generatedAt }) {
  const passed = results.filter((result) => result.score.pass);
  const failed = results.filter((result) => !result.score.pass);
  const weakest = [...results].sort((a, b) => a.score.percentage - b.score.percentage).slice(0, 10);
  const strongest = [...results].sort((a, b) => b.score.percentage - a.score.percentage).slice(0, 10);

  return `# Coaching Gauntlet v0.1

Generated: ${generatedAt.toISOString()}

## Scope

The Coaching Gauntlet is a research-only stress test for Adaptive Strength Coach V2.

It runs Decision Engine v0.2 against realistic scenarios before any production integration. Production app code, V1 workout generation, V1 progression, subscription logic, and EAS builds are untouched.

## Pass/Fail Summary

- Total scenarios: ${results.length}
- Passed: ${passed.length}
- Failed: ${failed.length}
- Pass rate: ${Math.round((passed.length / results.length) * 100)}%

## Level Summary

${renderLevelSummary(results)}

## Recommendation Distribution

${renderDistribution(results)}

## Weakest Scenarios

${weakest.map(renderScenarioSummary).join("\n")}

## Strongest Scenarios

${strongest.map(renderScenarioSummary).join("\n")}

## Recommendations Requiring Aaron Review

${failed.length ? failed.map(renderAaronReviewItem).join("\n") : "- No failed scenarios in this run."}

## Patterns Of Failure

${renderFailurePatterns(failed)}

## Open Research Questions

1. Should \`recover\` be considered acceptable for restrict scenarios caused by local collapse, or should local collapse always prefer \`substitute\` or \`reduce\`?
2. Should the gauntlet fail \`push\` recommendations when poor readiness is reported but objective performance is strong, or allow controlled push?
3. Should sharp/worsening pain always produce \`stop_session\`, or should \`stop_movement\` remain the default unless symptoms are systemic?
4. Should low evidence always force \`hold\`, even when objective performance looks promising?
5. What pass-rate threshold should be required before a Decision Engine version can advance to simulation?

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

function renderScenarioSummary(result) {
  return `### ${result.scenario.title}

- ID: \`${result.scenario.id}\`
- Level: ${result.scenario.level_label}
- Pass: ${result.score.pass}
- Score: ${result.score.percentage}%
- Expected: ${result.score.expectation.recommendation_types.map((type) => `\`${type}\``).join(", ")}
- Actual: \`${result.recommendation.recommendation_type}\` / \`${result.recommendation.aggressiveness}\`
- Safety Gate: expected \`${result.score.expectation.safety_gate_status}\`, actual \`${result.safetyGate.status}\`
- Failure reasons: ${result.score.failure_reasons.length ? result.score.failure_reasons.join("; ") : "none"}
`;
}

function renderAaronReviewItem(result) {
  return `- \`${result.scenario.id}\`: expected ${result.score.expectation.recommendation_types.join(" or ")}, got ${result.recommendation.recommendation_type}; reasons: ${result.score.failure_reasons.join("; ")}`;
}

function renderFailurePatterns(failed) {
  if (failed.length === 0) return "- No failure patterns found.";
  const reasons = {};
  for (const result of failed) {
    for (const reason of result.score.failure_reasons) {
      reasons[reason] = (reasons[reason] ?? 0) + 1;
    }
  }
  return Object.entries(reasons)
    .sort(([, a], [, b]) => b - a)
    .map(([reason, count]) => `- ${reason}: ${count}`)
    .join("\n");
}

function renderFullResult(result) {
  return `### ${result.scenario.id}

- Title: ${result.scenario.title}
- Level: ${result.scenario.level_label}
- Athlete profile: ${result.athlete.label}
- Coaching State: adaptation ${result.coachingState.adaptation}, recovery_capacity ${result.coachingState.recovery_capacity}, momentum ${result.coachingState.momentum}, confidence ${result.coachingState.confidence}, evidence_quality ${result.coachingState.evidence_quality}, opportunity ${result.coachingState.coaching_opportunity}
- Safety Gate: \`${result.safetyGate.status}\`, veto ${result.safetyGate.veto}
- Expected recommendation: ${result.score.expectation.recommendation_types.join(" or ")}
- Actual recommendation: \`${result.recommendation.recommendation_type}\`
- Aggressiveness: \`${result.recommendation.aggressiveness}\`
- Confidence: ${result.recommendation.confidence}
- Pass: ${result.score.pass}
- Score: ${result.score.percentage}%

Rubric:
${RUBRIC_FIELDS.map((field) => `- ${field}: ${result.score.scores[field]}/5`).join("\n")}

Rationale:
${result.recommendation.rationale.map((line) => `- ${line}`).join("\n")}

User message:

${result.recommendation.user_message}
`;
}

function groupBy(items, getKey) {
  return items.reduce((groups, item) => {
    const key = getKey(item);
    groups[key] ??= [];
    groups[key].push(item);
    return groups;
  }, {});
}
