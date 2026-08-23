import { validateCanonicalAdaptationAudit } from "@/domain/training/canonical-adaptation-audit";

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
    numericLoadAdjustmentAuthorised: boolean;
    numericDecisions?: readonly import("@/domain/training/canonical-comparable-exposure-policy").CanonicalNumericPrescriptionDecision[];
  }>;
  boundaryResolution?: import("@/domain/training/canonical-cycle-boundary-resolution").CanonicalCycleBoundaryResolution;
  contextIdentity: Readonly<{ macrocycleId: string; mesocycleId: string; microcycleId: string }>;
  decidedAt: string;
  idempotencyKey: string;
  adaptationAudit?: import("@/domain/training/canonical-adaptation-audit").CanonicalAdaptationAudit;
}>;
export type CanonicalPhaseOneApplicationReceiptV1 = Readonly<{
  schemaVersion: "canonical_coaching_application_receipt_v1";
  status: "applied" | "unchanged" | "blocked";
  priorRevision: number;
  newRevision: number;
  resultingFutureSessionIds: readonly string[];
  appliedAt: string;
}>;
export type CanonicalPhaseOneApplicationReceiptV2 = Readonly<{
  schemaVersion: "canonical_coaching_application_receipt_v2";
  status: "applied" | "unchanged" | "blocked";
  actualResult: "future_prescription_change" | "explicit_no_change" | "blocked_no_change";
  reasonCode: string;
  explanation: string;
  priorRevision: number;
  newRevision: number;
  resultingFutureSessionIds: readonly string[];
  materialDeltas: readonly import("@/domain/training/canonical-material-prescription-delta").CanonicalMaterialPrescriptionDelta[];
  boundaryState?: CanonicalCoachingBoundaryState;
  appliedAt: string;
}>;
export type CanonicalCoachingBoundaryState = Readonly<{
  schemaVersion: "canonical_coaching_boundary_state_v1";
  status: "review_required" | "terminal";
  reasonCode: string;
  missingFactOrPolicy: string;
  currentTrainingSafelyUsable: boolean;
  resolutionEvent: "canonical_progress_evidence_persisted" | "canonical_construction_facts_persisted" | "canonical_successor_policy_approved" | "none_terminal";
  completedSessionId: string;
  planId?: string;
  macrocycleId: string;
  mesocycleId: string;
  microcycleId: string;
  unresolvedBoundary: "ordinary_session" | "final_session" | "maximum_horizon";
  resolutionFingerprint: string;
}>;
export type CanonicalPhaseOneApplicationReceipt =
  | CanonicalPhaseOneApplicationReceiptV1
  | CanonicalPhaseOneApplicationReceiptV2;
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
      || typeof details.boundedAdjustment.numericLoadAdjustmentAuthorised !== "boolean"
      || details.boundedAdjustment.numericDecisions !== undefined && (
        !Array.isArray(details.boundedAdjustment.numericDecisions)
        || details.boundedAdjustment.numericDecisions.some((item) => !item
          || item.schemaVersion !== "canonical_numeric_prescription_decision_v1"
          || typeof item.comparableExposureKey !== "string"
          || typeof item.exerciseId !== "string"
          || !Array.isArray(item.evidenceIds)
          || !item.before
          || !Number.isFinite(item.before.prescribedBaseLoad)
          || !Array.isArray(item.before.exactTargets))
      )
      || details.boundedAdjustment.numericLoadAdjustmentAuthorised !== Boolean(
        details.decisionType === "advance_microcycle"
        && details.boundedAdjustment.numericDecisions?.some((item) => item.after),
      )
      || details.boundaryResolution !== undefined && (
        details.boundaryResolution.schemaVersion !== "canonical_cycle_boundary_resolution_v1"
        || !["not_at_boundary", "continue_current_phase", "transition_approved", "review_required"].includes(String(details.boundaryResolution.status))
        || typeof details.boundaryResolution.reasonCode !== "string"
        || !details.boundaryResolution.reasonCode
      )
      || !details.contextIdentity || !details.contextIdentity.macrocycleId || !details.contextIdentity.mesocycleId || !details.contextIdentity.microcycleId
      || typeof details.decidedAt !== "string" || Number.isNaN(Date.parse(details.decidedAt))
      || typeof details.idempotencyKey !== "string" || !details.idempotencyKey) return { status: "invalid", reason: "invalid_phase_one_decision" };
    if (details.adaptationAudit !== undefined) {
      if (!validateCanonicalAdaptationAudit(details.adaptationAudit)) return { status: "invalid", reason: "invalid_adaptation_audit" };
    }
    const expectedResult = details.decisionType === "blocked" ? "blocked_no_change" : details.decisionType === "maintain" ? "explicit_no_change" : "future_prescription_change";
    if (details.result !== expectedResult) return { status: "invalid", reason: "invalid_phase_one_decision_result" };
  }
  if (c.phaseOneApplication !== undefined) {
    const receipt = c.phaseOneApplication as Partial<CanonicalPhaseOneApplicationReceipt>;
    const legacy = receipt.schemaVersion === "canonical_coaching_application_receipt_v1";
    const current = receipt.schemaVersion === "canonical_coaching_application_receipt_v2";
    if ((!legacy && !current)
      || !["applied", "unchanged", "blocked"].includes(String(receipt.status))
      || !Number.isInteger(receipt.priorRevision) || Number(receipt.priorRevision) < 0
      || !Number.isInteger(receipt.newRevision) || Number(receipt.newRevision) < Number(receipt.priorRevision)
      || !Array.isArray(receipt.resultingFutureSessionIds) || receipt.resultingFutureSessionIds.some((id) => typeof id !== "string" || !id)
      || typeof receipt.appliedAt !== "string" || Number.isNaN(Date.parse(receipt.appliedAt))) return { status: "invalid", reason: "invalid_phase_one_application_receipt" };
    if (current) {
      const value = receipt as Partial<CanonicalPhaseOneApplicationReceiptV2>;
      if (!["future_prescription_change", "explicit_no_change", "blocked_no_change"].includes(String(value.actualResult))
        || typeof value.reasonCode !== "string" || !value.reasonCode
        || typeof value.explanation !== "string" || !value.explanation
        || !Array.isArray(value.materialDeltas)
        || value.materialDeltas.some((item) => !item || item.schemaVersion !== "canonical_material_prescription_delta_v1" || !item.sessionKey || !item.field)
        || (value.status === "applied" && (value.actualResult !== "future_prescription_change" || value.materialDeltas.length === 0 || value.newRevision === value.priorRevision))
        || (value.status === "unchanged" && value.actualResult !== "explicit_no_change")
        || (value.status === "blocked" && value.actualResult !== "blocked_no_change")
        || (value.status !== "applied" && (value.materialDeltas.length !== 0 || value.newRevision !== value.priorRevision))) {
        return { status: "invalid", reason: "invalid_phase_one_application_receipt" };
      }
      if (value.boundaryState !== undefined) {
        const boundary = value.boundaryState as Partial<CanonicalCoachingBoundaryState>;
        if (value.status !== "blocked"
          || boundary.schemaVersion !== "canonical_coaching_boundary_state_v1"
          || !["review_required", "terminal"].includes(String(boundary.status))
          || typeof boundary.reasonCode !== "string" || !boundary.reasonCode
          || typeof boundary.missingFactOrPolicy !== "string" || !boundary.missingFactOrPolicy
          || typeof boundary.currentTrainingSafelyUsable !== "boolean"
          || !["canonical_progress_evidence_persisted", "canonical_construction_facts_persisted", "canonical_successor_policy_approved", "none_terminal"].includes(String(boundary.resolutionEvent))
          || typeof boundary.completedSessionId !== "string" || !boundary.completedSessionId
          || typeof boundary.macrocycleId !== "string" || !boundary.macrocycleId
          || typeof boundary.mesocycleId !== "string" || !boundary.mesocycleId
          || typeof boundary.microcycleId !== "string" || !boundary.microcycleId
          || !["ordinary_session", "final_session", "maximum_horizon"].includes(String(boundary.unresolvedBoundary))
          || typeof boundary.resolutionFingerprint !== "string" || !boundary.resolutionFingerprint.startsWith("canonical_fingerprint_v1|")) {
          return { status: "invalid", reason: "invalid_coaching_boundary_state" };
        }
      }
    }
  }
  return { status: "valid", decision: { ...(c as CanonicalProgressDecision), evidenceIds: [...(c.evidenceIds as string[])] } };
}
