export const CANONICAL_PROGRESS_DECISION_SCHEMA = "canonical_progress_decision_v1" as const;
export type CanonicalPhaseOneDecisionDetails = Readonly<{
  schemaVersion: "canonical_coaching_decision_details_v1";
  decisionType: "establish_calibration" | "maintain" | "recalibrate" | "advance_microcycle" | "transition" | "blocked";
  sourceRecordedSessionId: string;
  sourcePrescriptionHash: string;
  reasonCodes: readonly string[];
  evidenceSummary: Readonly<{
    targetCompletion: "successful" | "partial" | "failed";
    comparableExposureCount: number;
    repDropOff: boolean;
    recoveryEvidence: "not_collected" | "stable" | "constrained" | "conflicting";
    transitionEligible: boolean;
    deloadEligible: false;
  }>;
  priorFutureSessionIds: readonly string[];
  result: "future_prescription_change" | "explicit_no_change" | "blocked_no_change";
  boundedAdjustment: Readonly<{
    kind: "establish_observed_calibration" | "retain_prescription" | "require_recalibration" | "construct_next_microcycle" | "construct_approved_successor" | "none";
    exerciseIds: readonly string[];
    numericLoadAdjustmentAuthorised: false;
  }>;
  contextIdentity: Readonly<{ macrocycleId: string; mesocycleId: string; microcycleId: string }>;
  decidedAt: string;
  idempotencyKey: string;
}>;
export type CanonicalPhaseOneApplicationReceipt = Readonly<{
  schemaVersion: "canonical_coaching_application_receipt_v1";
  status: "applied" | "unchanged" | "blocked";
  priorRevision: number;
  newRevision: number;
  resultingFutureSessionIds: readonly string[];
  appliedAt: string;
}>;
export type CanonicalProgressDecision = Readonly<{
  schemaVersion: typeof CANONICAL_PROGRESS_DECISION_SCHEMA;
  decisionId: string;
  planId: string;
  expectedPlanRevision: number;
  macrocycleId: string;
  mesocycleId: string;
  microcycleId: string;
  evaluationId: string;
  evidenceIds: readonly string[];
  outcome: "continue" | "transition" | "deload" | "review_required" | "insufficient_evidence";
  successorMesocycleId?: string;
  owner: "mesocycle";
  reason: string;
  explanation: string;
  status: "current" | "consumed";
  intervention?: import("@/domain/training/canonical-progress-intervention").CanonicalProgressIntervention;
  phaseOne?: CanonicalPhaseOneDecisionDetails;
  phaseOneApplication?: CanonicalPhaseOneApplicationReceipt;
}>;

export function validateCanonicalProgressDecision(value: unknown): { status: "valid"; decision: CanonicalProgressDecision } | { status: "invalid"; reason: string } {
  if (!value || typeof value !== "object") return { status: "invalid", reason: "malformed_decision" };
  const c = value as Record<string, unknown>;
  if (c.schemaVersion !== CANONICAL_PROGRESS_DECISION_SCHEMA) return { status: "invalid", reason: "unsupported_decision_schema" };
  for (const key of ["decisionId", "planId", "macrocycleId", "mesocycleId", "microcycleId", "evaluationId", "owner", "reason", "explanation"]) if (typeof c[key] !== "string" || !c[key]) return { status: "invalid", reason: `missing_${key}` };
  if (!Number.isInteger(c.expectedPlanRevision) || Number(c.expectedPlanRevision) < 0) return { status: "invalid", reason: "invalid_expected_revision" };
  if (!Array.isArray(c.evidenceIds) || !(c.evidenceIds as unknown[]).every((id) => typeof id === "string")) return { status: "invalid", reason: "invalid_evidence_ids" };
  if (!["continue", "transition", "deload", "review_required", "insufficient_evidence"].includes(String(c.outcome))) return { status: "invalid", reason: "invalid_outcome" };
  if (!["current", "consumed"].includes(String(c.status))) return { status: "invalid", reason: "invalid_status" };
  if (c.phaseOne !== undefined) {
    const details = c.phaseOne as Partial<CanonicalPhaseOneDecisionDetails>;
    if (details.schemaVersion !== "canonical_coaching_decision_details_v1"
      || !["establish_calibration", "maintain", "recalibrate", "advance_microcycle", "transition", "blocked"].includes(String(details.decisionType))
      || typeof details.sourceRecordedSessionId !== "string" || !details.sourceRecordedSessionId
      || typeof details.sourcePrescriptionHash !== "string" || !details.sourcePrescriptionHash
      || !Array.isArray(details.reasonCodes) || !details.reasonCodes.length || details.reasonCodes.some((reason) => typeof reason !== "string" || !reason)
      || !details.evidenceSummary
      || !["successful", "partial", "failed"].includes(String(details.evidenceSummary.targetCompletion))
      || !Number.isInteger(details.evidenceSummary.comparableExposureCount) || details.evidenceSummary.comparableExposureCount < 0
      || typeof details.evidenceSummary.repDropOff !== "boolean"
      || !["not_collected", "stable", "constrained", "conflicting"].includes(String(details.evidenceSummary.recoveryEvidence))
      || typeof details.evidenceSummary.transitionEligible !== "boolean"
      || details.evidenceSummary.deloadEligible !== false
      || !Array.isArray(details.priorFutureSessionIds) || details.priorFutureSessionIds.some((id) => typeof id !== "string" || !id)
      || !["future_prescription_change", "explicit_no_change", "blocked_no_change"].includes(String(details.result))
      || !details.boundedAdjustment
      || !["establish_observed_calibration", "retain_prescription", "require_recalibration", "construct_next_microcycle", "construct_approved_successor", "none"].includes(String(details.boundedAdjustment.kind))
      || !Array.isArray(details.boundedAdjustment.exerciseIds) || details.boundedAdjustment.exerciseIds.some((id) => typeof id !== "string" || !id)
      || details.boundedAdjustment.numericLoadAdjustmentAuthorised !== false
      || !details.contextIdentity || !details.contextIdentity.macrocycleId || !details.contextIdentity.mesocycleId || !details.contextIdentity.microcycleId
      || typeof details.decidedAt !== "string" || Number.isNaN(Date.parse(details.decidedAt))
      || typeof details.idempotencyKey !== "string" || !details.idempotencyKey) return { status: "invalid", reason: "invalid_phase_one_decision" };
    const expectedResult = details.decisionType === "blocked" ? "blocked_no_change" : details.decisionType === "maintain" ? "explicit_no_change" : "future_prescription_change";
    if (details.result !== expectedResult) return { status: "invalid", reason: "invalid_phase_one_decision_result" };
  }
  if (c.phaseOneApplication !== undefined) {
    const receipt = c.phaseOneApplication as Partial<CanonicalPhaseOneApplicationReceipt>;
    if (receipt.schemaVersion !== "canonical_coaching_application_receipt_v1"
      || !["applied", "unchanged", "blocked"].includes(String(receipt.status))
      || !Number.isInteger(receipt.priorRevision) || Number(receipt.priorRevision) < 0
      || !Number.isInteger(receipt.newRevision) || Number(receipt.newRevision) < Number(receipt.priorRevision)
      || !Array.isArray(receipt.resultingFutureSessionIds) || receipt.resultingFutureSessionIds.some((id) => typeof id !== "string" || !id)
      || typeof receipt.appliedAt !== "string" || Number.isNaN(Date.parse(receipt.appliedAt))) return { status: "invalid", reason: "invalid_phase_one_application_receipt" };
  }
  return { status: "valid", decision: { ...(c as CanonicalProgressDecision), evidenceIds: [...(c.evidenceIds as string[])] } };
}
