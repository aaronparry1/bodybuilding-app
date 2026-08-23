import type { CanonicalNumericPrescriptionDecision } from "@/domain/training/canonical-comparable-exposure-policy";
import type { CanonicalProgressDecision } from "@/domain/training/canonical-progress-decision";

export const CANONICAL_ADAPTATION_STABILITY_POLICY = "canonical_adaptation_stability_v1" as const;

/**
 * One opposing numeric move is held until another evidence window confirms it.
 * This is deliberately narrow hysteresis: it cannot author a new prescription.
 */
export function stabilizeCanonicalNumericDecisions(
  candidates: readonly CanonicalNumericPrescriptionDecision[],
  history: readonly CanonicalProgressDecision[],
): readonly CanonicalNumericPrescriptionDecision[] {
  const latestByKey = new Map<string, CanonicalNumericPrescriptionDecision>();
  for (const item of history
    .slice()
    .sort((left, right) => (left.phaseOne?.decidedAt ?? "").localeCompare(right.phaseOne?.decidedAt ?? ""))
    .flatMap((decision) => decision.phaseOne?.boundedAdjustment.numericDecisions ?? [])) {
    if (item.after) latestByKey.set(item.comparableExposureKey, item);
  }
  return candidates.map((candidate) => {
    if (!candidate.after) return candidate;
    const prior = latestByKey.get(candidate.comparableExposureKey);
    if (!prior || !prior.after || direction(prior) === direction(candidate)) return candidate;
    return {
      ...candidate,
      outcome: "hold",
      reasonCode: "opposing_numeric_change_requires_confirming_evidence_window",
      after: undefined,
      exactNumericDelta: undefined,
    };
  });
}

function direction(decision: CanonicalNumericPrescriptionDecision): "increase" | "decrease" | "none" {
  if (!decision.after) return "none";
  const load = decision.after.prescribedBaseLoad - decision.before.prescribedBaseLoad;
  const reps = decision.after.exactTargets.reduce((sum, target, index) => sum + target - (decision.before.exactTargets[index] ?? target), 0);
  return load > 0 || load === 0 && reps > 0 ? "increase" : load < 0 || load === 0 && reps < 0 ? "decrease" : "none";
}
