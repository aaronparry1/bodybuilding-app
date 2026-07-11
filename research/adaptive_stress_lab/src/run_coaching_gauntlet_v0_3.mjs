import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { calculateCoachingState } from "./coaching_state_engine.mjs";
import { createCoachingRecommendation } from "./decision_engine_v0_2.mjs";
import { explicitEvidenceDrivers } from "./evidence_detail.mjs";
import { evaluateSafetyGate } from "./safety_gate.mjs";
import { gauntletScenariosV0_2 } from "../gauntlet/scenarios_v0_2.mjs";
import { gauntletScenariosV0_3 } from "../gauntlet/scenarios_v0_3.mjs";
import { RUBRIC_FIELDS, scoreGauntletDecision } from "../gauntlet/rubric.mjs";

const labRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const repoRoot = dirname(dirname(labRoot));
const reportPath = join(repoRoot, "reports", "adaptive_stress_lab", "coaching_gauntlet_v0_3.md");
const profiles = JSON.parse(await readFile(join(labRoot, "data", "athlete_profiles.json"), "utf8"));
const generatedAt = new Date();

const v02Results = runScenarios(gauntletScenariosV0_2);
const results = runScenarios(gauntletScenariosV0_3);
const changed = compareResults(v02Results, results);

validateResults(results);

await mkdir(dirname(reportPath), { recursive: true });
await writeFile(reportPath, renderReport({ results, changed, generatedAt }), "utf8");

console.log("Coaching Gauntlet v0.3 complete");
console.log(`Scenarios: ${results.length}`);
console.log(`Passed: ${results.filter((result) => result.score.pass).length}`);
console.log(`Failed: ${results.filter((result) => !result.score.pass).length}`);
console.log(`Changed decisions from v0.2: ${changed.length}`);
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
  if (items.length < 150) throw new Error(`Expected at least 150 scenarios, got ${items.length}`);
  const ids = new Set(items.map((item) => item.scenario.id));
  if (ids.size !== items.length) throw new Error("Scenario IDs must be unique");
  for (const result of items) {
    if (!result.scenario.evidence.sessionHistory) throw new Error(`${result.scenario.id} missing sessionHistory`);
    if (!result.scenario.evidence.exerciseHistory) throw new Error(`${result.scenario.id} missing exerciseHistory`);
    if (!result.scenario.evidence.consolidationHistory) throw new Error(`${result.scenario.id} missing consolidationHistory`);
    if (!result.scenario.evidence.frequencyStimulus) throw new Error(`${result.scenario.id} missing frequencyStimulus`);
    if (!result.scenario.evidence.safetyContext) throw new Error(`${result.scenario.id} missing safetyContext`);
    if (!result.scenario.evidence.evidenceConfidence) throw new Error(`${result.scenario.id} missing evidenceConfidence`);
    for (const field of RUBRIC_FIELDS) {
      if (!Number.isInteger(result.score.scores[field])) throw new Error(`${result.scenario.id} missing score ${field}`);
    }
  }
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
    return [{ old, current: result, changedDecision, changedAggression, changedSafety }];
  });
}

function normaliseId(id) {
  return id.replace(/^v03_/, "").replace(/^v02_/, "").replace(/^l([1-4])_/, "l$1_");
}

function renderReport({ results, changed, generatedAt }) {
  const passed = results.filter((result) => result.score.pass);
  const failed = results.filter((result) => !result.score.pass);
  const broadSignals = findRemainingBroadSignals(results);

  return `# Coaching Gauntlet v0.3

Generated: ${generatedAt.toISOString()}

## Scope

The Coaching Gauntlet v0.3 migrates the 164-scenario v0.2 lab to explicit evidence fields. Legacy broad fixture labels are retained for compatibility comparison, but the lab engines now prefer concrete v0.3 fields where rules support them.

## Pass/Fail Summary

- Total scenarios: ${results.length}
- Passed: ${passed.length}
- Failed: ${failed.length}
- Pass rate: ${Math.round((passed.length / results.length) * 100)}%
- Decisions changed from v0.2: ${changed.length}

## Explicit Evidence Fields Added

- Session history: planned completed/missed, extra sessions, spacing, completed sets, skipped exercises, duration, completion quality.
- Exercise history: movement pattern, target range, loads, reps/seconds, range success, comparable-load trend, load events, shutdowns, below-minimum events, above-range events, productive fatigue, new-exercise flag.
- Swap history: from/to, reason, post-swap performance, exposure count, improvement confirmation.
- Consolidation history: recent push, planned consolidation, completion, owns-new-load, repeated successful exposures.
- Frequency/stimulus constraints: available days, current frequency, session density, compound density, hard-set estimate, axial loading, high-fatigue clustering, low-frequency/high-density warning.
- Safety context: affected area/pattern, pain trend, pain severity, technique breakdown, systemic red flags, movement-specific vs session-wide scope.
- Evidence confidence: planned evidence count, comparable exposure count, recency, completeness, source quality.

## Level Summary

${renderLevelSummary(results)}

## Recommendation Distribution

${renderDistribution(results)}

## Evidence Drivers

${renderEvidenceDriverSummary(results)}

## Decisions Changed Due To Evidence Detail

${changed.length ? changed.map(renderChangedDecision).join("\n") : "- No recommendation, aggressiveness, or Safety Gate status changed versus v0.2. Evidence detail made the reasoning more traceable without changing outputs."}

## Remaining Broad Fixture Signals

${broadSignals.length ? broadSignals.map((line) => `- ${line}`).join("\n") : "- None found."}

## Failed Scenarios

${failed.length ? failed.map(renderScenarioSummary).join("\n") : "- No failed scenarios in this run."}

## Weakest Scenarios

${[...results].sort((a, b) => a.score.percentage - b.score.percentage).slice(0, 12).map(renderScenarioSummary).join("\n")}

## Open Aaron Decisions

1. Should v0.4 remove legacy broad fixture labels entirely and force every rule through explicit evidence fields?
2. Should explicit evidence confidence change score magnitudes, or remain explanatory until validated against simulation?
3. Which explicit fields should become mandatory before a future production prototype can make an intervention?
4. Should swap/consolidation/frequency evidence become first-class production data tables later?

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

function renderEvidenceDriverSummary(results) {
  const counts = {};
  for (const result of results) {
    for (const driver of explicitEvidenceDrivers(result.scenario.evidence)) {
      const key = driver.split(":")[0];
      counts[key] = (counts[key] ?? 0) + 1;
    }
  }
  return Object.entries(counts)
    .sort(([, a], [, b]) => b - a)
    .map(([driver, count]) => `- ${driver}: ${count}`)
    .join("\n");
}

function renderChangedDecision(item) {
  return `### ${item.current.scenario.title}

- ID: \`${item.current.scenario.id}\`
- v0.2: \`${item.old.recommendation.recommendation_type}\` / \`${item.old.recommendation.aggressiveness}\`, Safety Gate \`${item.old.safetyGate.status}\`
- v0.3: \`${item.current.recommendation.recommendation_type}\` / \`${item.current.recommendation.aggressiveness}\`, Safety Gate \`${item.current.safetyGate.status}\`
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
- Coaching State: adaptation ${result.coachingState.adaptation}, recovery_capacity ${result.coachingState.recovery_capacity}, momentum ${result.coachingState.momentum}, confidence ${result.coachingState.confidence}, evidence_quality ${result.coachingState.evidence_quality}, opportunity ${result.coachingState.coaching_opportunity}
- Safety Gate: \`${result.safetyGate.status}\`, veto ${result.safetyGate.veto}
- Actual recommendation: \`${result.recommendation.recommendation_type}\` / \`${result.recommendation.aggressiveness}\`
- Pass: ${result.score.pass}
- Score: ${result.score.percentage}%
- Explicit evidence drivers: ${explicitEvidenceDrivers(result.scenario.evidence).join(", ")}

Rationale:
${result.recommendation.rationale.map((line) => `- ${line}`).join("\n")}

User message:

${result.recommendation.user_message}
`;
}

function findRemainingBroadSignals(results) {
  const broad = new Set();
  for (const result of results) {
    for (const signal of result.scenario.evidence.systemicSignals ?? []) {
      if (!["none", "good_readiness", "high_soreness", "sleep_disrupted", "missed_sessions", "time_constraint", "low_frequency", "multiple_lifts_down"].includes(signal)) {
        broad.add(`systemicSignals still contains lab-only marker \`${signal}\``);
      }
    }
  }
  return Array.from(broad).sort();
}

function groupBy(items, getKey) {
  return items.reduce((groups, item) => {
    const key = getKey(item);
    groups[key] ??= [];
    groups[key].push(item);
    return groups;
  }, {});
}
