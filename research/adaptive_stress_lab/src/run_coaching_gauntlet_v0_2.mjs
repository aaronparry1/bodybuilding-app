import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { calculateCoachingState } from "./coaching_state_engine.mjs";
import { createCoachingRecommendation } from "./decision_engine_v0_2.mjs";
import { evaluateSafetyGate } from "./safety_gate.mjs";
import { gauntletScenariosV0_2 } from "../gauntlet/scenarios_v0_2.mjs";
import { RUBRIC_FIELDS, scoreGauntletDecision } from "../gauntlet/rubric.mjs";

const labRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const repoRoot = dirname(dirname(labRoot));
const reportPath = join(repoRoot, "reports", "adaptive_stress_lab", "coaching_gauntlet_v0_2.md");
const profiles = JSON.parse(await readFile(join(labRoot, "data", "athlete_profiles.json"), "utf8"));
const generatedAt = new Date();

const results = gauntletScenariosV0_2.map((scenario) => {
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

console.log("Coaching Gauntlet v0.2 complete");
console.log(`Scenarios: ${results.length}`);
console.log(`Passed: ${results.filter((result) => result.score.pass).length}`);
console.log(`Failed: ${results.filter((result) => !result.score.pass).length}`);
console.log(`Hard failures: ${hardFailures(results).length}`);
console.log(`Borderline passes: ${borderlinePasses(results).length}`);
console.log(`Report: ${reportPath}`);

function validateResults(results) {
  if (results.length < 150) throw new Error(`Expected at least 150 scenarios, got ${results.length}`);
  const ids = new Set(results.map((result) => result.scenario.id));
  if (ids.size !== results.length) throw new Error("Scenario IDs must be unique");
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
  const hard = hardFailures(results);
  const borderline = borderlinePasses(results);
  const weakest = [...results].sort((a, b) => a.score.percentage - b.score.percentage).slice(0, 15);
  const strongest = [...results].sort((a, b) => b.score.percentage - a.score.percentage).slice(0, 15);
  const review = [...failed, ...borderline].slice(0, 50);

  return `# Coaching Gauntlet v0.2

Generated: ${generatedAt.toISOString()}

## Scope

The Coaching Gauntlet v0.2 expands the research-only stress test for Adaptive Strength Coach V2 from 51 scenarios to ${results.length} scenarios.

This report is designed to find bad coaching before production integration. Failures are expected and useful. Production app code, V1 workout generation, V1 progression, subscription logic, and EAS builds are untouched.

## Pass/Fail Summary

- Total scenarios: ${results.length}
- Passed: ${passed.length}
- Failed: ${failed.length}
- Pass rate: ${Math.round((passed.length / results.length) * 100)}%
- Hard failures: ${hard.length}
- Borderline passes: ${borderline.length}
- Pass threshold: current rubric requires score >= 72%, allowed recommendation type, no forbidden recommendation type, and expected Safety Gate status.

## Level Summary

${renderLevelSummary(results)}

## Recommendation Distribution

${renderDistribution(results)}

## Weakest Categories

${renderCategoryAverages(results, "ascending")}

## Strongest Categories

${renderCategoryAverages(results, "descending")}

## Hard Failures

${hard.length ? hard.map(renderScenarioSummary).join("\n") : "- No hard failures in this run."}

## Borderline Passes

${borderline.length ? borderline.map(renderScenarioSummary).join("\n") : "- No borderline passes in this run."}

## Weakest Scenarios

${weakest.map(renderScenarioSummary).join("\n")}

## Strongest Scenarios

${strongest.map(renderScenarioSummary).join("\n")}

## Scenarios Requiring Aaron Review

${review.length ? review.map(renderAaronReviewItem).join("\n") : "- No scenarios require Aaron review in this run."}

## Patterns Of Failure

${renderFailurePatterns(failed)}

## Recommended Next Fixes

${renderRecommendedFixes(failed)}

## Open Research Questions

1. Should the Decision Engine distinguish one good set, one good exercise, and repeated success across sessions more explicitly?
2. Should \`recover\` remain available for systemic fatigue when Safety Gate is \`restrict\`, or should \`consolidate\` be preferred unless a recovery week threshold is met?
3. Should low-frequency and short-session constraints influence recommendations directly, or remain scenario context until frequency-aware stimulus distribution exists?
4. Should pain with improving performance always block \`push\`, even when the safety flag is mild?
5. Should capacity/cardio success contribute to main training momentum, or stay separate evidence?

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

function hardFailures(results) {
  return results.filter((result) => !result.score.pass && (
    result.score.percentage < 72 ||
    result.score.checks.type_forbidden ||
    !result.score.checks.safety_gate_matches
  ));
}

function borderlinePasses(results) {
  return results.filter((result) => result.score.pass && result.score.percentage < 85);
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

function renderCategoryAverages(results, direction) {
  const averages = RUBRIC_FIELDS.map((field) => {
    const average = results.reduce((sum, result) => sum + result.score.scores[field], 0) / results.length;
    return { field, average };
  });
  averages.sort((a, b) => direction === "ascending" ? a.average - b.average : b.average - a.average);
  return averages.map((item) => `- ${item.field}: ${item.average.toFixed(2)}/5`).join("\n");
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
  return `- \`${result.scenario.id}\`: expected ${result.score.expectation.recommendation_types.join(" or ")}, got ${result.recommendation.recommendation_type}; score ${result.score.percentage}%; reasons: ${result.score.failure_reasons.length ? result.score.failure_reasons.join("; ") : "borderline pass"}`;
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

function renderRecommendedFixes(failed) {
  if (failed.length === 0) return "- No engine fixes recommended by this run. Expand scenario difficulty again before production consideration.";
  const hasTypeFailures = failed.some((result) => !result.score.checks.type_allowed);
  const hasSafetyFailures = failed.some((result) => !result.score.checks.safety_gate_matches);
  const fixes = [];
  if (hasTypeFailures) fixes.push("- Add narrower decision rules for the failed scenario families instead of loosening expectations.");
  if (hasSafetyFailures) fixes.push("- Audit Safety Gate severity/status mapping for mismatched safety scenarios.");
  fixes.push("- Review all hard failures with Aaron before changing engine behaviour.");
  fixes.push("- Keep productive fatigue and asymmetric progression protections intact.");
  return fixes.join("\n");
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
