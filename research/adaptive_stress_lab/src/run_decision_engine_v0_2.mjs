import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { calculateCoachingState } from "./coaching_state_engine.mjs";
import { createCoachingRecommendation } from "./decision_engine_v0_2.mjs";
import { evaluateSafetyGate } from "./safety_gate.mjs";

const labRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const repoRoot = dirname(dirname(labRoot));
const reportPath = join(repoRoot, "reports", "adaptive_stress_lab", "decision_engine_v0_2_report.md");

const profiles = await readJson(join(labRoot, "data", "athlete_profiles.json"));
const scenarios = await readJson(join(labRoot, "data", "scenarios.json"));
const generatedAt = new Date();

const outputs = scenarios.map((scenario) => {
  const athlete = profiles.find((profile) => profile.id === scenario.athleteProfileId);
  const coachingState = calculateCoachingState({ athlete, evidence: scenario, now: generatedAt });
  const safetyGate = evaluateSafetyGate({ athlete, evidence: scenario, coachingState });
  const recommendation = createCoachingRecommendation({ athlete, evidence: scenario, coachingState, safetyGate });
  return { scenario, athlete, coachingState, safetyGate, recommendation };
});

await mkdir(dirname(reportPath), { recursive: true });
await writeFile(reportPath, renderReport({ outputs, generatedAt }), "utf8");

console.log("Decision Engine v0.2 complete");
console.log(`Scenarios: ${outputs.length}`);
console.log(`Report: ${reportPath}`);

async function readJson(path) {
  return JSON.parse(await readFile(path, "utf8"));
}

function renderReport({ outputs, generatedAt }) {
  return `# Decision Engine v0.2 Report

Generated: ${generatedAt.toISOString()}

## Scope

Decision Engine v0.2 is a research-only prototype inside \`research/adaptive_stress_lab\`.

It consumes Athlete profile, Training evidence, Coaching State, and Safety Gate output. It does not modify production workout generation, V1 progression, subscriptions, or app behaviour.

## Scenario Recommendations

${outputs
  .map(
    ({ scenario, athlete, coachingState, safetyGate, recommendation }) => `### ${scenario.scenario}

- Scenario ID: \`${scenario.id}\`
- Athlete: ${athlete.label}
- Coaching State summary: adaptation ${coachingState.adaptation}, recovery_capacity ${coachingState.recovery_capacity}, momentum ${coachingState.momentum}, confidence ${coachingState.confidence}, evidence_quality ${coachingState.evidence_quality}, opportunity ${coachingState.coaching_opportunity}
- Safety Gate: \`${safetyGate.status}\`, veto ${safetyGate.veto}, affected ${safetyGate.affected_areas.join(", ")}

#### Coaching Recommendation

- Type: \`${recommendation.recommendation_type}\`
- Aggressiveness: \`${recommendation.aggressiveness}\`
- Primary intervention: ${recommendation.primary_intervention}
- Confidence: ${recommendation.confidence}

Secondary interventions:
${recommendation.secondary_interventions.map((item) => `- ${item}`).join("\n")}

Blocked interventions:
${recommendation.blocked_interventions.length ? recommendation.blocked_interventions.map((item) => `- ${item}`).join("\n") : "- none"}

Rationale:
${recommendation.rationale.map((line) => `- ${line}`).join("\n")}

User message:

${recommendation.user_message}

Charter alignment:

- Long-term progress: ${recommendation.charter_alignment.long_term_progress}
- Adaptation: ${recommendation.charter_alignment.adaptation}
- Recovery: ${recommendation.charter_alignment.recovery}
- Confidence: ${recommendation.charter_alignment.confidence}
- Enjoyment: ${recommendation.charter_alignment.enjoyment}
- Momentum: ${recommendation.charter_alignment.momentum}
- Notes: ${recommendation.charter_alignment.notes.join(" ")}

Evidence sources:
${recommendation.evidence_sources.map((source) => `- ${source}`).join("\n")}

Open questions:
${recommendation.open_questions.map((question) => `- ${question}`).join("\n")}
`,
  )
  .join("\n")}

## Summary Counts

${renderCounts(outputs)}

## Open Aaron Decisions

1. Should \`stop_session\` include severe/worsening pain by default, or only systemic symptoms such as dizziness, faintness, chest pain, and unusual symptoms?
2. Should \`restrict\` always allow substitute/reduce/consolidate, or should some affected-pattern restrictions require human review?
3. Should \`push\` ever use \`high\` aggressiveness, or should V2 cap all pushes at moderate?
4. Should \`coaching_opportunity\` be split into opportunity and caution before Decision Engine v0.3?
5. What confidence threshold is required before a recommendation can move from research to simulation?

## Production Safety Confirmation

- Production app code was not imported.
- Production app behaviour was not modified.
- V1 workout generation was not modified.
- V1 progression logic was not modified.
- Paywall/subscription logic was not modified.
- No EAS build was started.
`;
}

function renderCounts(outputs) {
  const counts = outputs.reduce((acc, { recommendation }) => {
    acc[recommendation.recommendation_type] = (acc[recommendation.recommendation_type] ?? 0) + 1;
    return acc;
  }, {});

  return Object.entries(counts)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([type, count]) => `- \`${type}\`: ${count}`)
    .join("\n");
}
