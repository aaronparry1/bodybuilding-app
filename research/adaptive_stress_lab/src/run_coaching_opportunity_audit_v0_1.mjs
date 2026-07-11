import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { runCoachingOpportunityAuditV0_1 } from "./coaching_opportunity_audit_v0_1.mjs";

const labRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const repoRoot = dirname(dirname(labRoot));
const reportPath = join(repoRoot, "reports", "adaptive_stress_lab", "coaching_opportunity_audit_v0_1.md");

const audit = runCoachingOpportunityAuditV0_1();

await mkdir(dirname(reportPath), { recursive: true });
await writeFile(reportPath, renderReport(audit), "utf8");

console.log("Coaching Opportunity Audit v0.1 complete");
console.log(`Decisions: ${audit.metrics.total_decisions}`);
console.log(`Correctness rate: ${audit.metrics.correctness_rate}%`);
console.log(`Report: ${reportPath}`);

function renderReport(audit) {
  const metrics = audit.metrics;
  return `# Coaching Opportunity Audit v0.1

Generated: ${audit.generated_at}

## Scope

This audit retrospectively evaluates every V2 recommendation from Simulation v0.2. It asks whether the coach missed opportunities, pushed too early, recovered unnecessarily, or assigned confidence that did not match correctness.

Production app code is untouched.

## Summary

- Total decisions audited: ${metrics.total_decisions}
- Correct decisions: ${metrics.correct_decisions}
- Incorrect decisions: ${metrics.incorrect_decisions}
- Correctness rate: ${metrics.correctness_rate}%
- Four-week positive outcome rate: ${metrics.four_week_positive_rate}%
- Total opportunity cost: ${metrics.total_opportunity_cost}
- Average opportunity cost: ${metrics.average_opportunity_cost}

## Opportunity Cost

| Metric | Count |
|---|---:|
| Missed Pushes | ${metrics.opportunity.missed_pushes} |
| Missed Consolidations | ${metrics.opportunity.missed_consolidations} |
| Unnecessary Recovery | ${metrics.opportunity.unnecessary_recovery} |
| Premature Pushes | ${metrics.opportunity.premature_pushes} |
| Correct Pushes | ${metrics.opportunity.correct_pushes} |
| Correct Holds | ${metrics.opportunity.correct_holds} |
| Correct Recoveries | ${metrics.opportunity.correct_recoveries} |
| Correct Consolidations | ${metrics.opportunity.correct_consolidations} |

## Aggression Calibration

| Calibration | Count |
|---|---:|
| Too Conservative | ${metrics.aggression.too_conservative} |
| Balanced | ${metrics.aggression.balanced} |
| Too Aggressive | ${metrics.aggression.too_aggressive} |

## Decision Calibration

${renderDecisionTable(metrics.by_recommendation)}

## Push Type Calibration

${renderPushTypeTable(metrics.by_push_type)}

### Push Type Failure Patterns

${renderPushTypeFailures(metrics.by_push_type)}

## Confidence Calibration

| Confidence Bucket | Total | Correct | Incorrect | Correctness Rate | Avg Opportunity Cost |
|---|---:|---:|---:|---:|---:|
${metrics.confidence_calibration.map((bucket) => `| ${bucket.bucket} | ${bucket.total} | ${bucket.correct} | ${bucket.incorrect} | ${bucket.correctness_rate}% | ${bucket.average_opportunity_cost} |`).join("\n")}

- High-confidence wrong decisions: ${metrics.high_confidence_wrong}
- Low-confidence correct decisions: ${metrics.low_confidence_correct}

## Long-Term Four-Week Outcome

Each decision was checked against the state four weeks later where available.

Tracked deltas:

- adaptation
- goal progress
- momentum
- confidence
- recovery

Four-week positive outcome rate: ${metrics.four_week_positive_rate}%

## Best Decisions

${metrics.best_decisions.length ? metrics.best_decisions.map(renderDecision).join("\n") : "- No best-decision examples available."}

## Worst Decisions

${metrics.worst_decisions.length ? metrics.worst_decisions.map(renderDecision).join("\n") : "- No incorrect decisions found."}

## Most Expensive Mistakes

${metrics.most_expensive_mistakes.length ? metrics.most_expensive_mistakes.map(renderDecision).join("\n") : "- No costly mistakes found."}

## Recommendations For Engine Tuning

${metrics.tuning_recommendations.map((item) => `- ${item}`).join("\n")}

## Remaining Weaknesses

- The retrospective ideal action is still heuristic.
- Four-week effects are simulated, not biological reality.
- Confidence calibration is based on synthetic outcomes.
- Get Lean recovery decisions can be training-correct while body-composition confidence remains low.
- The audit currently evaluates recommendation type more strongly than exact intervention details.

## Production Safety Confirmation

- Production app code was not touched.
- V1 workout generation was not modified.
- V1 progression logic was not modified.
- Subscription/paywall logic was not modified.
- No EAS build was started.
`;
}

function renderDecisionTable(byRecommendation) {
  const rows = Object.entries(byRecommendation)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([type, item]) => `| \`${type}\` | ${item.total} | ${item.correct} | ${item.correctness_rate}% | ${item.average_confidence} | ${item.average_opportunity_cost} |`);
  return `| Recommendation | Total | Correct | Correctness Rate | Avg Confidence | Avg Opportunity Cost |
|---|---:|---:|---:|---:|---:|
${rows.join("\n")}`;
}

function renderPushTypeTable(byPushType) {
  const rows = Object.entries(byPushType)
    .map(([type, item]) => `| \`${type}\` | ${item.total} | ${item.correct} | ${item.incorrect} | ${item.correctness_rate}% | ${item.premature} | ${item.missed} | ${item.average_confidence} | ${item.average_opportunity_cost} | ${item.four_week_outcome_rate}% |`);
  return `| Push Type | Total | Correct | Incorrect | Correctness Rate | Premature | Missed | Avg Confidence | Avg Cost | 4w Outcome Rate |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
${rows.join("\n")}`;
}

function renderPushTypeFailures(byPushType) {
  return Object.entries(byPushType).map(([type, item]) => {
    const patterns = item.common_failure_patterns.length
      ? item.common_failure_patterns.map((entry) => `  - ${entry.pattern}: ${entry.count}`).join("\n")
      : "  - No failures recorded.";
    return `- \`${type}\`\n${patterns}`;
  }).join("\n");
}

function renderDecision(item) {
  const outcome = item.four_week_outcome;
  const outcomeText = outcome.available
    ? `4w progress ${outcome.progress_delta}, momentum ${outcome.momentum_delta}, confidence ${outcome.confidence_delta}, recovery ${outcome.recovery_delta}`
    : "4w outcome unavailable";
  return `- ${item.athlete_id} week ${item.week} (${item.event}): actual \`${item.recommendation}\`, ideal \`${item.ideal_recommendation}\`, confidence ${item.confidence}, cost ${item.opportunity_cost}; ${outcomeText}. Reason: ${item.correctness_reason}`;
}
