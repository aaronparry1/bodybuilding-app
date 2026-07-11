import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { calculateCoachingState } from "./coaching_state_engine.mjs";

const labRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const repoRoot = dirname(dirname(labRoot));
const reportPath = join(repoRoot, "reports", "adaptive_stress_lab", "coaching_state_objective_first_report.md");

const profiles = await readJson(join(labRoot, "data", "athlete_profiles.json"));
const scenarios = await readJson(join(labRoot, "data", "scenarios.json"));

validateInputs(profiles, scenarios);

const generatedAt = new Date();
const states = scenarios.map((scenario) => {
  const athlete = profiles.find((profile) => profile.id === scenario.athleteProfileId);
  return calculateCoachingState({ athlete, evidence: scenario, now: generatedAt });
});

validateStates(states);

await mkdir(dirname(reportPath), { recursive: true });
await writeFile(reportPath, renderReport({ profiles, scenarios, states, generatedAt }), "utf8");

console.log("Coaching State Objective-First v0.1 complete");
console.log(`Profiles: ${profiles.length}`);
console.log(`Scenarios: ${scenarios.length}`);
console.log(`Coaching states: ${states.length}`);
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
  const scoreFields = ["adaptation", "recovery_capacity", "momentum", "confidence", "evidence_quality", "coaching_opportunity"];
  for (const state of states) {
    for (const field of scoreFields) {
      if (!Number.isInteger(state[field])) throw new Error(`${state.scenario_id} ${field} must be an integer`);
      if (state[field] < 0 || state[field] > 100) throw new Error(`${state.scenario_id} ${field} out of range`);
      if (!Array.isArray(state.score_explanations[field]) || state.score_explanations[field].length === 0) {
        throw new Error(`${state.scenario_id} ${field} missing explanations`);
      }
    }
    if (!Array.isArray(state.subjective_context_handling)) throw new Error(`${state.scenario_id} missing subjective handling`);
  }
}

function renderReport({ profiles, scenarios, states, generatedAt }) {
  return `# Coaching State Objective-First Report

Generated: ${generatedAt.toISOString()}

## Scope

This is V2 Sprint 1B inside \`research/adaptive_stress_lab\`.

It describes Coaching State only. It does not prescribe interventions, does not modify V1 workout generation, does not modify V1 progression, and does not touch production app behaviour.

## Approved Semantics

- 100 always means more positive, more coachable, or better state.
- \`fatigue\` has been replaced by \`recovery_capacity\`.
- Permanent top-level state fields are \`adaptation\`, \`recovery_capacity\`, \`momentum\`, \`confidence\`, \`evidence_quality\`, and \`coaching_opportunity\`.
- Adherence, readiness, stress, sleep, and motivation remain context inputs, not permanent dominant states.
- Subjective feedback cannot dominate objective training evidence unless a severe pain/safety flag is present.
- RPE/RIR-led and wellness-questionnaire-led coaching are deliberately avoided.

## Signal Authority Hierarchy

1. Objective performance evidence: completed planned workouts, working sets, load, reps/seconds, target success, missed ranges, shutdowns, progression, comparable workload trends.
2. Training behaviour: consistency, missed sessions, skipped work, repeated swaps.
3. Recovery behaviour: session spacing, recovery week completion, recovery/cardio/capacity completion where relevant.
4. Subjective feedback: soreness, motivation, stress, sleep, perceived readiness.
5. Future wearable data: HRV, resting heart rate, sleep duration/quality, treated as context until validated.

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
- Safety flags: ${state.safety_flags.length ? state.safety_flags.join(", ") : "none"}

#### Coaching State

| Field | Score |
| --- | ---: |
| Adaptation | ${state.adaptation} |
| Recovery capacity | ${state.recovery_capacity} |
| Momentum | ${state.momentum} |
| Confidence | ${state.confidence} |
| Evidence quality | ${state.evidence_quality} |
| Coaching opportunity | ${state.coaching_opportunity} |

#### Evidence Summary

${state.evidence_summary.map((line) => `- ${line}`).join("\n")}

#### Authority Handling

${state.authority_summary.map((line) => `- ${line}`).join("\n")}

#### Subjective Context Handling

${state.subjective_context_handling.map((line) => `- ${line}`).join("\n")}

#### Score Explanations

${renderExplanationBlock(state)}

#### Open Questions

${state.open_questions.map((question) => `- ${question}`).join("\n")}
`;
  })
  .join("\n")}

## Objective-First Checks

${renderObjectiveFirstChecks(states)}

## Global Open Decisions For Aaron

1. Confirm whether \`coaching_opportunity\` should remain a single field or split into \`opportunity\` and \`caution\`.
2. Confirm whether severe pain/safety flags belong inside CoachingState or a separate pre-coaching safety gate.
3. Confirm whether subjective context should be ignored entirely until a minimum objective evidence count is reached.
4. Confirm whether \`confidence\` means athlete confidence, model confidence, or whether those must split before V2 advances.
5. Confirm how future wearable data should be validated before it can move above low-authority context.

## Production Safety Confirmation

- Production app code was not imported.
- Production app behaviour was not modified.
- V1 workout generation was not modified.
- V1 progression logic was not modified.
- Paywall/subscription logic was not modified.
- No EAS build was started.
`;
}

function renderExplanationBlock(state) {
  return Object.entries(state.score_explanations)
    .map(([field, explanations]) => {
      const lines = explanations
        .map((item) => `  - [${item.authority}] ${item.evidence} (${item.contribution}, movement ${formatMovement(item.movement)}, confidence ${item.confidence_level})`)
        .join("\n");
      return `**${field}**\n\n${lines}`;
    })
    .join("\n\n");
}

function renderObjectiveFirstChecks(states) {
  const ids = [
    "poor_readiness_strong_performance",
    "feels_great_performance_declining",
    "high_stress_objective_stable",
    "low_motivation_consistent_sessions",
    "severe_pain_safety_flag",
  ];

  return ids
    .map((id) => {
      const state = states.find((item) => item.scenario_id === id);
      if (!state) return `- \`${id}\`: missing`;
      return `- \`${id}\`: adaptation ${state.adaptation}, recovery_capacity ${state.recovery_capacity}, momentum ${state.momentum}, confidence ${state.confidence}, coaching_opportunity ${state.coaching_opportunity}, safety ${state.safety_flags.length ? state.safety_flags.join(", ") : "none"}`;
    })
    .join("\n");
}

function formatMovement(value) {
  return value > 0 ? `+${value}` : `${value}`;
}
