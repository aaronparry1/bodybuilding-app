import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { runOutcomeLearningV0_1 } from "./outcome_learning_v0_1.mjs";

const labRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const repoRoot = dirname(dirname(labRoot));
const reportPath = join(repoRoot, "reports", "adaptive_stress_lab", "outcome_learning_v0_1.md");
const result = runOutcomeLearningV0_1();

await mkdir(dirname(reportPath), { recursive: true });
await writeFile(reportPath, renderReport(result), "utf8");

console.log("Outcome Learning v0.1 complete");
console.log(`Outcome events: ${result.total_events}`);
console.log(`Learning records: ${result.learning_records.length}`);
console.log(`Report: ${reportPath}`);

function renderReport(result) {
  return `# Outcome Learning Framework v0.1

Generated: ${result.generated_at}

## Scope

This report creates the first lab-only outcome learning framework for Adaptive Strength Coach V2.

Outcome data informs the coach. It does not override the Charter, Safety Gate, or human review.

Production app code was not touched. V1 was not modified. No EAS build was started.

## Outcome Event Model

Each \`OutcomeEvent\` links:

- athlete profile
- Coaching State summary
- Safety Gate status
- recommendation type
- push type where relevant
- intervention type
- goal
- exercise / movement pattern where available
- week / timestamp
- follow-up window
- follow-up evidence
- outcome classification
- confidence

Outcome classifications:

- \`positive\`
- \`neutral\`
- \`negative\`
- \`unsafe\`
- \`inconclusive\`

## Outcome Windows

- \`immediate_session\`
- \`next_session\`
- \`two_week\`
- \`four_week\`
- \`eight_week\`

Different interventions should be judged over different windows. Load pushes care most about the next 2-4 exposures. Recovery weeks care about 2-4 week rebound. Larger block-level decisions need 4-8 week evidence. Safety interventions care immediately and next session.

## Dataset Summary

- Total outcome events: ${result.total_events}
- Learning records: ${result.learning_records.length}
- Candidate learning signals: ${result.candidate_learning_signals.length}
- Rejected signals: ${result.rejected_signals.length}
- Sample-size warnings: ${result.sample_size_warnings.length}
- Low-confidence findings: ${result.low_confidence_findings.length}

## Outcome Distribution By Recommendation

${renderDistributionTable(result.outcome_distribution_by_recommendation)}

## Outcome Distribution By Push Type

${renderDistributionTable(result.outcome_distribution_by_push_type)}

## Outcome Distribution By Goal

${renderDistributionTable(result.outcome_distribution_by_goal)}

## Candidate Learning Signals

${result.candidate_learning_signals.length ? result.candidate_learning_signals.map(renderRecord).join("\n\n") : "- No binding learning signals. That is expected: this is synthetic data and all adjustments remain advisory."}

## Rejected Unsafe / Low-Confidence Signals

${result.rejected_signals.slice(0, 20).map(renderRecord).join("\n\n") || "- No rejected signals in the first 20 records."}

## Suggested But Non-Binding Refinements

${renderSuggestedRefinements(result.learning_records)}

## Guardrails

${result.guardrails.map((item) => `- ${item}`).join("\n")}

## Synthetic Limitations

- Simulation v0.2 and v0.3 are synthetic and cannot validate true physiology.
- Outcome confidence is a modelled score, not a real-world posterior probability.
- Four-week and eight-week windows are approximate because simulations are weekly.
- Population-level aggregates are not individual truth.
- The framework intentionally does not mutate rules.

## Open Aaron Decisions

1. What minimum real-world sample size should be required before an advisory learning record can influence engine design?
2. Should learning records be grouped by goal first, exercise first, or decision context first?
3. Should unsafe outcomes permanently blacklist a rule shape, or only trigger human review?
4. Should ASC use anonymised real-world outcomes only after explicit user consent?
5. What should count as a meaningful long-term outcome: 4-week improvement, 8-week improvement, block completion, or annual progress?

## Production Status

Production app untouched. V1 untouched. No EAS build started.
`;
}

function renderDistributionTable(distribution) {
  const rows = Object.entries(distribution)
    .sort((a, b) => b[1].total - a[1].total)
    .map(([key, item]) => `| \`${key}\` | ${item.total} | ${item.positive} | ${item.neutral} | ${item.negative} | ${item.unsafe} | ${item.inconclusive} | ${item.positive_rate}% | ${item.negative_or_unsafe_rate}% |`);
  return `| Group | Total | Positive | Neutral | Negative | Unsafe | Inconclusive | Positive Rate | Negative/Unsafe Rate |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
${rows.join("\n")}`;
}

function renderRecord(record) {
  return `### \`${record.decision_context_signature}\`

- Recommendation: \`${record.recommendation_type}\`
- Push type: ${record.push_type ? `\`${record.push_type}\`` : "none"}
- Sample size: ${record.sample_size}
- Confidence: ${record.confidence}
- Distribution: positive ${record.outcome_distribution.positive}, neutral ${record.outcome_distribution.neutral}, negative ${record.outcome_distribution.negative}, unsafe ${record.outcome_distribution.unsafe}, inconclusive ${record.outcome_distribution.inconclusive}
- Suggested adjustment: \`${record.suggested_adjustment}\`
- Guardrails: ${record.charter_guardrail_notes.join(" ")}
`;
}

function renderSuggestedRefinements(records) {
  const grouped = records.reduce((acc, record) => {
    acc[record.suggested_adjustment] ??= 0;
    acc[record.suggested_adjustment] += 1;
    return acc;
  }, {});
  return Object.entries(grouped)
    .sort((a, b) => b[1] - a[1])
    .map(([adjustment, count]) => `- \`${adjustment}\`: ${count} record(s)`)
    .join("\n");
}
