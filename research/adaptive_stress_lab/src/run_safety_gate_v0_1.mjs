import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { calculateCoachingState } from "./coaching_state_engine.mjs";
import { evaluateSafetyGate } from "./safety_gate.mjs";

const labRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const repoRoot = dirname(dirname(labRoot));
const reportPath = join(repoRoot, "reports", "adaptive_stress_lab", "safety_gate_v0_1_report.md");

const profiles = await readJson(join(labRoot, "data", "athlete_profiles.json"));
const scenarios = await readJson(join(labRoot, "data", "scenarios.json"));
const generatedAt = new Date();

const outputs = scenarios.map((scenario) => {
  const athlete = profiles.find((profile) => profile.id === scenario.athleteProfileId);
  const coachingState = calculateCoachingState({ athlete, evidence: scenario, now: generatedAt });
  const safetyGate = evaluateSafetyGate({ athlete, evidence: scenario, coachingState });
  validateSafetyGate(safetyGate);
  return { scenario, athlete, coachingState, safetyGate };
});

await mkdir(dirname(reportPath), { recursive: true });
await writeFile(reportPath, renderReport({ outputs, generatedAt }), "utf8");

console.log("Safety Gate v0.1 complete");
console.log(`Scenarios: ${outputs.length}`);
console.log(`Report: ${reportPath}`);

async function readJson(path) {
  return JSON.parse(await readFile(path, "utf8"));
}

function validateSafetyGate(item) {
  if (!["clear", "caution", "restrict", "stop"].includes(item.status)) throw new Error(`Invalid status ${item.status}`);
  if (!["none", "low", "moderate", "high", "severe"].includes(item.severity)) throw new Error(`Invalid severity ${item.severity}`);
  if ((item.status === "restrict" || item.status === "stop") !== item.veto) throw new Error(`${item.scenario_id} veto mismatch`);
  if (!Number.isInteger(item.confidence) || item.confidence < 0 || item.confidence > 100) throw new Error(`${item.scenario_id} invalid confidence`);
  for (const field of ["affected_areas", "reasons", "allowed_actions", "blocked_actions", "evidence_sources"]) {
    if (!Array.isArray(item[field])) throw new Error(`${item.scenario_id} ${field} must be array`);
  }
  if (!item.recommended_user_message) throw new Error(`${item.scenario_id} missing message`);
}

function renderReport({ outputs, generatedAt }) {
  return `# Safety Gate v0.1 Report

Generated: ${generatedAt.toISOString()}

## Scope

Safety Gate is a research-only veto layer inside \`research/adaptive_stress_lab\`.

Architecture:

Objective evidence -> Coaching State -> Safety Gate -> future coaching decision.

Safety Gate does not prescribe training. It only describes whether future coaching decisions should be clear, cautious, restricted, or stopped.

## Status Rules

- \`clear\`: no meaningful safety concern.
- \`caution\`: mild concern; monitor and reduce aggression.
- \`restrict\`: meaningful concern; veto aggressive progression, PR attempts, and affected-area load increases.
- \`stop\`: severe concern; stop affected movement/session and suggest professional advice where appropriate.

## Scenario Outputs

${outputs
  .map(
    ({ scenario, athlete, coachingState, safetyGate }) => `### ${scenario.scenario}

- Scenario ID: \`${scenario.id}\`
- Athlete: ${athlete.label}
- Coaching State summary: adaptation ${coachingState.adaptation}, recovery_capacity ${coachingState.recovery_capacity}, momentum ${coachingState.momentum}, confidence ${coachingState.confidence}, coaching_opportunity ${coachingState.coaching_opportunity}
- Safety Gate status: \`${safetyGate.status}\`
- Severity: \`${safetyGate.severity}\`
- Veto: ${safetyGate.veto}
- Confidence: ${safetyGate.confidence}
- Affected areas: ${safetyGate.affected_areas.join(", ")}

Reasons:
${safetyGate.reasons.map((reason) => `- ${reason}`).join("\n")}

Allowed actions:
${safetyGate.allowed_actions.map((action) => `- ${action}`).join("\n")}

Blocked actions:
${safetyGate.blocked_actions.length ? safetyGate.blocked_actions.map((action) => `- ${action}`).join("\n") : "- none"}

Recommended user message:

${safetyGate.recommended_user_message}

Evidence sources:
${safetyGate.evidence_sources.map((source) => `- ${source}`).join("\n")}
`,
  )
  .join("\n")}

## Open Questions

1. Should \`restrict\` always veto future coaching decisions, or should future decisions be able to request human review?
2. Should \`stop\` be movement-specific, session-specific, or both?
3. Which exact production signals should count as repeated shutdowns versus ordinary fatigue?
4. How should the gate handle user-entered pain notes without encouraging medical self-diagnosis?
5. Should professional-advice copy vary by region, app store policy, or severity?

## Production Safety Confirmation

- Production app code was not imported.
- Production app behaviour was not modified.
- V1 workout generation was not modified.
- V1 progression logic was not modified.
- Paywall/subscription logic was not modified.
- No EAS build was started.
`;
}
