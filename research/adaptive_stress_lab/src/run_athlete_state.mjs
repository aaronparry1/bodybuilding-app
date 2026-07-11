import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { calculateAthleteState } from "./athlete_state_engine.mjs";

const labRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const repoRoot = dirname(dirname(labRoot));
const reportPath = join(repoRoot, "reports", "adaptive_stress_lab", "athlete_state_report.md");

const profiles = await readJson(join(labRoot, "data", "athlete_profiles.json"));
const scenarios = await readJson(join(labRoot, "data", "scenarios.json"));

validateInputs(profiles, scenarios);

const generatedAt = new Date();
const states = scenarios.map((scenario) => {
  const athlete = profiles.find((profile) => profile.id === scenario.athleteProfileId);
  return calculateAthleteState({ athlete, evidence: scenario, now: generatedAt });
});

validateStates(states);

await mkdir(dirname(reportPath), { recursive: true });
await writeFile(reportPath, renderReport({ profiles, scenarios, states, generatedAt }), "utf8");

console.log("Athlete State Engine v0.1 complete");
console.log(`Profiles: ${profiles.length}`);
console.log(`Scenarios: ${scenarios.length}`);
console.log(`Athlete states: ${states.length}`);
console.log(`Report: ${reportPath}`);

async function readJson(path) {
  return JSON.parse(await readFile(path, "utf8"));
}

function validateInputs(profiles, scenarios) {
  const profileIds = new Set(profiles.map((profile) => profile.id));
  for (const scenario of scenarios) {
    if (!profileIds.has(scenario.athleteProfileId)) {
      throw new Error(`Scenario ${scenario.id} references missing profile ${scenario.athleteProfileId}`);
    }
  }
}

function validateStates(states) {
  const scoreFields = ["adaptation", "fatigue", "recovery", "momentum", "confidence", "evidence_quality"];
  for (const state of states) {
    for (const field of scoreFields) {
      if (!Number.isInteger(state[field])) throw new Error(`${state.scenario_id} ${field} must be an integer`);
      if (state[field] < 0 || state[field] > 100) throw new Error(`${state.scenario_id} ${field} out of range`);
      if (!Array.isArray(state.score_explanations[field]) || state.score_explanations[field].length === 0) {
        throw new Error(`${state.scenario_id} ${field} missing explanations`);
      }
    }
    if (!state.confidence_reason) throw new Error(`${state.scenario_id} missing confidence_reason`);
    if (!state.evidence_count) throw new Error(`${state.scenario_id} missing evidence_count`);
  }
}

function renderReport({ profiles, scenarios, states, generatedAt }) {
  return `# Athlete State Engine v0.1 Report

Generated: ${generatedAt.toISOString()}

## Scope

This is a research-only Athlete State Engine inside \`research/adaptive_stress_lab\`.

It describes the athlete. It does not make coaching decisions, does not prescribe interventions, does not modify progression, and does not touch production app behaviour.

## AthleteState Object

Each scenario produces:

- \`adaptation\`: 0-100
- \`fatigue\`: 0-100, where higher means more fatigue
- \`recovery\`: 0-100
- \`momentum\`: 0-100
- \`confidence\`: 0-100
- \`evidence_quality\`: 0-100
- \`confidence_reason\`
- \`last_updated\`
- \`evidence_count\`
- score explanations for every field

## Scoring Method

The scoring is deliberately simple, transparent, and not tuned.

Scores begin from a neutral midpoint and move according to available fixture evidence:

- planned/completed training continuity is represented by \`trainingContinuity\`
- working-set outcomes are represented by \`localLiftSignals\`
- missed reps are represented by \`below_range\`
- shutdown/drop-off is represented by \`dropoff\`
- load progression is represented by \`productive_fatigue\` or \`above_range\`
- consistency and missed sessions are represented by \`trainingContinuity\` and \`missed_sessions\`
- recovery weeks are reserved for future evidence fixtures and are not inferred here

No sleep, HRV, wearable, or external sensor data is used.

## Scenario States

${states
  .map((state) => {
    const scenario = scenarios.find((item) => item.id === state.scenario_id);
    const athlete = profiles.find((item) => item.id === state.athlete_profile_id);
    return `### ${scenario.scenario}

- Scenario ID: \`${state.scenario_id}\`
- Athlete: ${athlete.label}
- Last updated: ${state.last_updated}
- Evidence count: ${state.evidence_count}
- Confidence reason: ${state.confidence_reason}

#### Athlete State

| Field | Score |
| --- | ---: |
| Adaptation | ${state.adaptation} |
| Fatigue | ${state.fatigue} |
| Recovery | ${state.recovery} |
| Momentum | ${state.momentum} |
| Confidence | ${state.confidence} |
| Evidence quality | ${state.evidence_quality} |

#### Evidence Summary

${state.evidence_summary.map((line) => `- ${line}`).join("\n")}

#### Score Explanations

${renderExplanationBlock(state)}

#### Open Questions

${state.open_questions.map((question) => `- ${question}`).join("\n")}
`;
  })
  .join("\n")}

## Global Open Questions

1. Should fatigue remain higher-is-worse while the other fields are higher-is-better?
2. Should evidence quality be a score, a confidence label, or both?
3. What minimum real workout history is required before athlete state should influence production coaching?
4. How should recovery weeks be represented: as an input, a state modifier, or both?
5. Should confidence mean athlete belief, model confidence, or should those be separated permanently?

## Production Safety Confirmation

- Production app code was not imported.
- Production app behaviour was not modified.
- Workout generation was not modified.
- Progression logic was not modified.
- Paywall/subscription logic was not modified.
- No EAS build was started.
`;
}

function renderExplanationBlock(state) {
  return Object.entries(state.score_explanations)
    .map(([field, explanations]) => {
      const lines = explanations
        .map((item) => `  - ${item.evidence} (${item.contribution}, movement ${formatMovement(item.movement)}, confidence ${item.confidence_level})`)
        .join("\n");
      return `**${field}**\n\n${lines}`;
    })
    .join("\n\n");
}

function formatMovement(value) {
  return value > 0 ? `+${value}` : `${value}`;
}
