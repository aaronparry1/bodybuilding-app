import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { runLoadOwnershipValidation } from "./load_ownership_v0_1.mjs";

const labRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const repoRoot = dirname(dirname(labRoot));
const reportPath = join(repoRoot, "reports", "adaptive_stress_lab", "load_ownership_v0_1.md");
const generatedAt = new Date();
const validation = runLoadOwnershipValidation();

await mkdir(dirname(reportPath), { recursive: true });
await writeFile(reportPath, renderReport({ validation, generatedAt }), "utf8");

console.log("Load Ownership v0.1 complete");
console.log(`Attempts: ${validation.statistics.total_attempts}`);
console.log(`Ownership success rate: ${validation.statistics.ownership_success_rate}%`);
console.log(`Report: ${reportPath}`);

function renderReport({ validation, generatedAt }) {
  const { statistics, attempts } = validation;
  return `# Load Ownership Calibration v0.1

Generated: ${generatedAt.toISOString()}

## Scope

Sprint 15 introduces a lab-only \`LoadOwnership\` concept for calibrating meaningful load increases over the long term.

This is not user-facing. It exists only for the coach. Production app code, V1 workout generation, V1 progression, subscription logic, and EAS builds were not touched.

## Philosophy

A successful load increase is not when a heavier weight is lifted once.

A successful load increase is when the athlete owns the new weight.

## Load Ownership States

| State | Meaning | Coaching Implication |
| --- | --- | --- |
| \`not_attempted\` | No load increase has been introduced. | Normal push eligibility can decide whether to introduce one. |
| \`introduced\` | The new load was attempted but has no follow-up evidence yet. | Do not stack another meaningful load push. |
| \`unstable\` | New load created repeated misses, shutdowns, safety issues, or poor recovery response. | Reduce, hold, or consolidate locally. |
| \`stabilising\` | New load is trending acceptably but ownership is not proven. | Consolidate the load. |
| \`owned\` | Repeated comparable exposures show target-range success without safety or recovery cost. | Another meaningful load push may be considered if the broader Coaching State allows it. |

## Ownership Criteria

Ownership is inferred from:

- successful comparable exposures
- target-range success
- shutdown frequency
- below-minimum events
- recovery response
- safety status
- trend stability
- confidence and derived evidence quality

One successful exposure is never enough.

## Validation Statistics

| Metric | Value |
| --- | ---: |
| Attempts | ${statistics.total_attempts} |
| Ownership success rate | ${statistics.ownership_success_rate}% |
| Failed ownership rate | ${statistics.failed_ownership_rate}% |
| Average ownership time | ${statistics.average_ownership_time_weeks} weeks |
| Failed ownership attempts | ${statistics.failed_ownership_attempts} |
| Unnecessary load pushes | ${statistics.unnecessary_load_pushes} |
| Delayed load pushes | ${statistics.delayed_load_pushes} |
| Average recommendation quality | ${statistics.average_recommendation_quality} |
| Confidence change proxy | ${statistics.average_confidence_change_proxy} |
| Long-term goal progress proxy | ${statistics.long_term_goal_progress_proxy} |

## State Counts

| State | Count |
| --- | ---: |
${Object.entries(statistics.state_counts).map(([state, count]) => `| \`${state}\` | ${count} |`).join("\n")}

## Attempt Details

${attempts.map(renderAttempt).join("\n\n")}

## Recommendation Quality

- Load pushes are allowed only when ownership is \`not_attempted\` or \`owned\`.
- \`introduced\`, \`stabilising\`, and \`unstable\` block another meaningful \`load_push\` or \`performance_push\`.
- This creates the first lab guardrail against stacking load increases before the previous increase has proved itself.

## Weaknesses

- The model uses synthetic follow-up exposures, not real athlete histories.
- Confidence change is a proxy, not validated psychology.
- Average ownership time is based on four-week validation windows only.
- The model does not yet differentiate exercise-specific ownership requirements. A deadlift load increase may need stricter ownership than a machine press.
- It does not yet model plate jump size, bodyweight changes, or peaking blocks in enough detail.

## Recommended Tuning

1. Add exercise-specific ownership thresholds.
2. Treat high-systemic-cost lifts as requiring stronger ownership before another load push.
3. Compare ownership success against long-horizon Simulation v0.2 and targeted Simulation v0.3.
4. Add “owned but costly” as a possible future state if a load is successful but recovery cost is too high.
5. Decide whether \`performance_push\` should require \`owned\` state for the exact exercise.

## Open Aaron Decisions

1. Should \`owned\` require three successful comparable exposures for every lift, or should compounds require four?
2. Should high-rep hypertrophy load jumps use the same ownership rules as strength lifts?
3. Should \`stabilising\` allow \`volume_push\`, or only \`hold\` / \`consolidate\`?
4. Should \`unstable\` always reduce load, or can it sometimes hold if confidence is low?
5. Should ownership be tracked per exercise, per movement pattern, or both?

## Production Status

Production app untouched. V1 untouched. No EAS build started.
`;
}

function renderAttempt(item) {
  const summary = item.ownership.evidence_summary;
  return `### \`${item.attempt.id}\`

- Expected state: \`${item.attempt.expectedState}\`
- Actual state: \`${item.ownership.state}\`
- Confidence: ${item.ownership.confidence}
- Observations: ${summary?.observations ?? 0}
- Successful comparable exposures: ${summary?.successfulComparableExposures ?? 0}
- Target-range success: ${summary ? Math.round(summary.targetRangeSuccessRate * 100) : 0}%
- Shutdowns: ${summary?.shutdowns ?? 0}
- Below-minimum events: ${summary?.belowMinimumEvents ?? 0}
- Safety issues: ${summary?.safetyIssues ?? 0}
- Transition: ${item.ownership.transition}
- Unnecessary load push: ${item.unnecessary_load_push ? "yes" : "no"}
- Delayed load push: ${item.delayed_load_push ? "yes" : "no"}`;
}
