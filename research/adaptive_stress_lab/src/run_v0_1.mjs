import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { decideNextCoachingAction } from "./decision_engine.mjs";

const labRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const repoRoot = dirname(dirname(labRoot));
const reportPath = join(repoRoot, "reports", "adaptive_stress_lab", "v0_1_report.md");

const foundationDocs = [
  "docs/adaptive-coaching-manifesto-v1.md",
  "docs/adaptive-stress-allocation-v1.md",
  "docs/adaptive-load-management-v1.md",
  "docs/coaching-playbook-v1.md",
  "docs/scientific-validation-framework-v1.md",
  "docs/exercise-stimulus-fatigue-classification.md",
  "docs/training-days-stimulus-audit.md",
];

const profiles = await readJson(join(labRoot, "data", "athlete_profiles.json"));
const scenarios = await readJson(join(labRoot, "data", "scenarios.json"));

validateProfiles(profiles);
validateScenarios(scenarios, profiles);

const decisions = scenarios.map((scenario) => {
  const athlete = profiles.find((profile) => profile.id === scenario.athleteProfileId);
  return decideNextCoachingAction({ athlete, evidence: scenario });
});

await mkdir(dirname(reportPath), { recursive: true });
await writeFile(reportPath, renderReport({ profiles, scenarios, decisions }), "utf8");

console.log(`Adaptive Stress Lab v0.1 complete`);
console.log(`Profiles: ${profiles.length}`);
console.log(`Scenarios: ${scenarios.length}`);
console.log(`Decisions: ${decisions.length}`);
console.log(`Report: ${reportPath}`);

async function readJson(path) {
  return JSON.parse(await readFile(path, "utf8"));
}

function validateProfiles(items) {
  const required = ["id", "label", "status", "goal", "trainingAge", "experienceLevel", "daysPerWeek", "sessionTimeMinutes", "constraints", "recoveryContext", "approvalStatus"];
  for (const item of items) {
    assertRequired(item, required, `profile ${item.id ?? "(missing id)"}`);
    if (item.status !== "research_fixture") throw new Error(`Profile ${item.id} must be research_fixture`);
    if (item.approvalStatus !== "draft_requires_aaron_approval") throw new Error(`Profile ${item.id} must require Aaron approval`);
  }
}

function validateScenarios(items, profiles) {
  const profileIds = new Set(profiles.map((profile) => profile.id));
  const required = ["id", "scenario", "athleteProfileId", "status", "performanceTrend", "fatigueState", "recoveryState", "evidenceQuality", "trainingContinuity", "localLiftSignals", "systemicSignals", "approvalStatus"];
  for (const item of items) {
    assertRequired(item, required, `scenario ${item.id ?? "(missing id)"}`);
    if (!profileIds.has(item.athleteProfileId)) throw new Error(`Scenario ${item.id} references unknown profile ${item.athleteProfileId}`);
    if (item.status !== "research_fixture") throw new Error(`Scenario ${item.id} must be research_fixture`);
    if (item.approvalStatus !== "draft_requires_aaron_approval") throw new Error(`Scenario ${item.id} must require Aaron approval`);
  }
}

function assertRequired(item, fields, label) {
  for (const field of fields) {
    if (!(field in item)) throw new Error(`${label} missing required field ${field}`);
  }
}

function renderReport({ profiles, scenarios, decisions }) {
  const recommendationCounts = decisions.reduce((counts, decision) => {
    counts[decision.primaryRecommendation] = (counts[decision.primaryRecommendation] ?? 0) + 1;
    return counts;
  }, {});

  return `# Adaptive Stress Lab v0.1 Report

Generated: ${new Date().toISOString()}

## Executive Summary

Adaptive Stress Lab v0.1 is a research-only test bench for future Adaptive Strength Coach V2 coaching decisions. It does not modify production app behaviour, workout generation, progression logic, subscriptions, or paywall code.

The lab currently contains:

- ${profiles.length} draft athlete profiles
- ${scenarios.length} draft training scenarios
- ${decisions.length} draft coaching decision outputs
- 3 JSON schemas
- 1 simple decision-engine stub
- 1 validation-scoring stub

No output is production eligible. All profile fields, stress scoring, intervention categories, and language require Aaron approval.

## Foundation Documents

${foundationDocs.map((doc) => `- ${doc}`).join("\n")}

## Starter Athlete Profiles

${profiles
  .map(
    (profile) => `### ${profile.label}

- ID: \`${profile.id}\`
- Goal: ${profile.goal}
- Training age: ${profile.trainingAge}
- Days/week: ${profile.daysPerWeek}
- Session time: ${profile.sessionTimeMinutes} min
- Constraints: ${profile.primaryConstraints.join(", ") || "none listed"}
- Approval status: ${profile.approvalStatus}
`,
  )
  .join("\n")}

## Starter Scenarios

${scenarios
  .map(
    (scenario) => `### ${scenario.scenario}

- ID: \`${scenario.id}\`
- Athlete: \`${scenario.athleteProfileId}\`
- Performance: ${scenario.performanceTrend}
- Fatigue: ${scenario.fatigueState}
- Recovery: ${scenario.recoveryState}
- Evidence quality: ${scenario.evidenceQuality}
- Continuity: ${scenario.trainingContinuity}
- Systemic signals: ${scenario.systemicSignals.join(", ")}
`,
  )
  .join("\n")}

## Example Outputs

${decisions
  .map(
    (decision) => `### ${decision.scenarioId}

- Recommendation: \`${decision.primaryRecommendation}\`
- Interventions: ${decision.interventions.map((item) => `\`${item.type}\` (${item.scope})`).join(", ")}
- Validation score:
  - Scientific confidence: ${decision.validationScore.scientificConfidence}/5
  - Adaptation potential: ${decision.validationScore.adaptationPotential}/5
  - Fatigue cost: ${decision.validationScore.fatigueCost}/5
  - Safety: ${decision.validationScore.safety}/5
  - Behavioural simplicity: ${decision.validationScore.behaviouralSimplicity}/5
  - Overall confidence: ${decision.validationScore.overallConfidence}/5
- Production eligible: ${decision.productionEligible}
- Rationale:
${decision.rationale.map((line) => `  - ${line}`).join("\n")}
`,
  )
  .join("\n")}

## Recommendation Distribution

${Object.entries(recommendationCounts)
  .map(([recommendation, count]) => `- \`${recommendation}\`: ${count}`)
  .join("\n")}

## Open Decisions Requiring Aaron

1. Athlete profile fields: approve current draft fields, simplify them, or add context such as injury history, preferred exercises, schedule volatility, or competitive date.
2. Stress/fatigue scoring model: choose whether v0.2 should use 1-5 numeric scoring, traffic-light states, or both.
3. Intervention hierarchy: approve whether the draft categories are the right internal vocabulary before any deeper simulation.
4. Progression philosophy changes: decide whether future ASA should explicitly prefer reps/quality before load in most cases, or keep that goal-specific.
5. Frequency/stimulus distribution rules: approve whether the lab should prototype weekly stimulus budgets using exercise stimulus/fatigue scores.
6. User-facing language: decide whether terms like "recovery bias", "hold and confirm", and "redistribute stimulus" are internal only or candidates for user copy.
7. Production threshold: decide what validation score and scenario coverage are required before any future production experiment.

## v0.2 Candidate Work

- Add schema validation with a pinned JSON-schema validator if adding dependencies is acceptable.
- Add scenario families from the full Coaching Playbook.
- Add exercise stimulus/fatigue fixture samples.
- Add annual simulation stubs without touching production generation.
- Add report diffs so coaching rule changes are reviewable.

## Production Safety Confirmation

- Production app code was not imported by this lab.
- Production app behaviour was not modified by this lab.
- Workout generation was not modified.
- Progression logic was not modified.
- Paywall/subscription logic was not modified.
- No EAS build was started.
`;
}
