import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { runPushOutcomeLearningV0_2 } from "./push_outcome_learning_v0_2.mjs";

const labRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const repoRoot = dirname(dirname(labRoot));
const reportPath = join(repoRoot, "reports", "adaptive_stress_lab", "push_outcome_learning_v0_2.md");
const result = runPushOutcomeLearningV0_2();

await mkdir(dirname(reportPath), { recursive: true });
await writeFile(reportPath, renderReport(result), "utf8");

console.log("Push Outcome Learning v0.2 complete");
console.log(`Push outcome events: ${result.total_push_outcome_events}`);
console.log(`Advisory thresholds: ${result.advisory_threshold_candidates.length}`);
console.log(`Report: ${reportPath}`);

function renderReport(result) {
  return `# Push Outcome Learning v0.2

Generated: ${result.generated_at}

## Scope

Sprint 17 analyses push outcomes by context and generates advisory thresholds for when push is actually worthwhile.

This is research-only. It does not mutate the Decision Engine, production app code, V1 progression, or subscription logic.

## Success Criteria

A push is treated as successful only if it improves or preserves:

- goal progress
- recovery capacity
- momentum
- confidence/safety proxy
- safety status

A push is negative if follow-up suggests recovery collapse, target failure proxy, safety escalation, momentum drop, or worse goal progress. One immediate positive result is not enough if the 2-4 week window is poor.

## Dataset Summary

- Total push outcome events: ${result.total_push_outcome_events}
- Best contexts analysed: ${result.best_push_contexts.length}
- Worst contexts analysed: ${result.worst_push_contexts.length}
- Advisory threshold candidates: ${result.advisory_threshold_candidates.length}
- Rejected findings: ${result.rejected_findings.length}
- Sample-size warnings: ${result.sample_size_warnings.length}

## Outcome Distribution By Push Type

${renderDistribution(result.outcome_distribution_by_push_type)}

## Outcome Distribution By Goal

${renderDistribution(result.outcome_distribution_by_goal)}

## Outcome Distribution By Follow-Up Window

${renderDistribution(result.outcome_distribution_by_follow_up_window)}

## Outcome Distribution By Evidence Quality Band

${renderDistribution(result.outcome_distribution_by_evidence_quality_band)}

## Best Push Contexts

${renderContexts(result.best_push_contexts)}

## Worst Push Contexts

${renderContexts(result.worst_push_contexts)}

## Advisory Threshold Candidates

${result.advisory_threshold_candidates.map(renderThreshold).join("\n\n")}

## Rejected Findings

${result.rejected_findings.slice(0, 30).map((item) => `- \`${item.dimension}:${item.key}\` — sample ${item.sample_size}, confidence ${item.confidence}, unsafe ${item.unsafe}. ${item.reason}`).join("\n")}

## Synthetic Limitations

${result.synthetic_limitations.map((item) => `- ${item}`).join("\n")}

## Open Aaron Decisions

1. What minimum real-world success rate should a push context need before future production prototype consideration?
2. Should \`micro_push\` be considered successful with neutral 4-week outcomes, or only clearly positive outcomes?
3. Should \`load_push\` require \`owned\` previous load even when same-exercise exposure count is high?
4. Should \`performance_push\` remain disabled outside explicit milestone blocks?
5. Should push outcome learning be grouped first by goal, exercise category, or ownership state?

## Production Status

Production app untouched. V1 untouched. No EAS build started.
`;
}

function renderDistribution(distribution) {
  const rows = Object.entries(distribution)
    .sort((a, b) => b[1].total - a[1].total)
    .map(([key, item]) => `| \`${key}\` | ${item.total} | ${item.positive} | ${item.neutral} | ${item.negative} | ${item.unsafe} | ${item.inconclusive} | ${item.success_rate}% | ${item.negative_or_unsafe_rate}% | ${item.average_confidence} |`);
  return `| Group | Total | Positive | Neutral | Negative | Unsafe | Inconclusive | Success | Negative/Unsafe | Avg Confidence |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
${rows.join("\n")}`;
}

function renderContexts(contexts) {
  return contexts.map((item) => `- \`${item.dimension}:${item.key}\` — sample ${item.sample_size}, success ${item.success_rate}%, negative/unsafe ${item.negative_or_unsafe_rate}%, confidence ${item.average_confidence}. ${item.advisory_note}`).join("\n");
}

function renderThreshold(item) {
  return `### \`${item.push_type}\` — \`${item.context}\`

- Sample size: ${item.sample_size}
- Success rate: ${item.success_rate}%
- Negative/unsafe rate: ${item.negative_or_unsafe_rate}%
- Confidence: ${item.confidence}
- Status: \`${item.advisory_threshold}\`
- Binding: ${item.binding ? "yes" : "no"}
- Rationale: ${item.rationale}`;
}
