import type { CanonicalProgressDecision } from "@/domain/training/canonical-progress-decision";
import type { CanonicalProgressEvidence } from "@/domain/training/canonical-progress-evidence";

export const CANONICAL_ADAPTATION_OUTCOME_VERSION = "canonical_adaptation_outcome_v1" as const;

export type CanonicalAdaptationOutcome = Readonly<{
  schemaVersion: typeof CANONICAL_ADAPTATION_OUTCOME_VERSION;
  decisionId: string;
  planId: string;
  evaluatedAt: string;
  status: "productive" | "neutral" | "unsuccessful" | "inconclusive";
  subsequentEvidenceIds: readonly string[];
  comparableExposureCount: number;
  reasonCode: string;
  policyVersion: "canonical_adaptation_outcome_policy_v1";
}>;

/** Evaluates only later, comparable completed exposures; it never scores the athlete. */
export function evaluateCanonicalAdaptationOutcome(input: Readonly<{
  decision: CanonicalProgressDecision;
  evidence: readonly CanonicalProgressEvidence[];
}>): CanonicalAdaptationOutcome | undefined {
  const audit = input.decision.phaseOne?.adaptationAudit;
  const numeric = input.decision.phaseOne?.boundedAdjustment.numericDecisions?.filter((item) => item.after) ?? [];
  if (!audit || !numeric.length) return undefined;
  const sourceIds = new Set(audit.evidenceWindow.evidenceIds);
  const keys = new Set(numeric.map((item) => item.comparableExposureKey));
  const later = input.evidence.filter((item) => item.kind === "performance"
    && !sourceIds.has(item.evidenceId)
    && typeof item.observations.comparableExposureKey === "string"
    && keys.has(String(item.observations.comparableExposureKey))
    && item.observedAt > input.decision.phaseOne!.decidedAt);
  const bySession = new Map<string, CanonicalProgressEvidence[]>();
  for (const item of later) if (item.sessionId) bySession.set(item.sessionId, [...(bySession.get(item.sessionId) ?? []), item]);
  const exposures = [...bySession.values()].sort((left, right) => left[0]!.observedAt.localeCompare(right[0]!.observedAt)).slice(0, 2);
  if (exposures.length < 2) return undefined;
  const valid = exposures.every((records) => records.length > 0 && records.every((item) =>
    item.observations.completion === "complete"
    && Number.isFinite(item.observations.reps)
    && Number.isFinite(item.observations.prescribedTargetReps)));
  const successes = exposures.filter((records) => records.every((item) =>
    Number(item.observations.reps) >= Number(item.observations.prescribedTargetReps)
    && (item.observations.effort === undefined || Number(item.observations.effort) <= 9.5))).length;
  const status = !valid ? "inconclusive" : successes === 2 ? "productive" : successes === 0 ? "unsuccessful" : "neutral";
  return {
    schemaVersion: CANONICAL_ADAPTATION_OUTCOME_VERSION,
    decisionId: input.decision.decisionId,
    planId: input.decision.planId,
    evaluatedAt: exposures.flat().map((item) => item.observedAt).sort().at(-1)!,
    status,
    subsequentEvidenceIds: exposures.flat().map((item) => item.evidenceId).sort(),
    comparableExposureCount: exposures.length,
    reasonCode: status === "productive" ? "two_subsequent_comparable_targets_achieved"
      : status === "unsuccessful" ? "two_subsequent_comparable_targets_missed"
        : status === "neutral" ? "mixed_subsequent_comparable_response" : "subsequent_evidence_incomplete",
    policyVersion: "canonical_adaptation_outcome_policy_v1",
  };
}

export function validateCanonicalAdaptationOutcome(value: unknown): value is CanonicalAdaptationOutcome {
  if (!value || typeof value !== "object") return false;
  const outcome = value as Partial<CanonicalAdaptationOutcome>;
  return outcome.schemaVersion === CANONICAL_ADAPTATION_OUTCOME_VERSION
    && typeof outcome.decisionId === "string" && Boolean(outcome.decisionId)
    && typeof outcome.planId === "string" && Boolean(outcome.planId)
    && typeof outcome.evaluatedAt === "string" && !Number.isNaN(Date.parse(outcome.evaluatedAt))
    && ["productive", "neutral", "unsuccessful", "inconclusive"].includes(String(outcome.status))
    && Array.isArray(outcome.subsequentEvidenceIds) && outcome.subsequentEvidenceIds.length > 0
    && outcome.comparableExposureCount === 2
    && typeof outcome.reasonCode === "string" && Boolean(outcome.reasonCode)
    && outcome.policyVersion === "canonical_adaptation_outcome_policy_v1";
}
