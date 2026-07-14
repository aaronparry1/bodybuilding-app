import type { CanonicalSessionConstructionInput } from "@/domain/training/canonical-session-construction-pipeline";
import { constructCanonicalSession } from "@/domain/training/canonical-session-construction-pipeline";

export type CanonicalPipelineReadiness = "ready" | "not_ready" | "incomplete";
export type CanonicalEvidence = Readonly<{ evidenceVersion: "canonical_pipeline_evidence_v1"; producer: string; caseIds: readonly string[]; passed: boolean; firstFailure?: Readonly<{ caseId: string; reason: string }> }>;
export const REQUIRED_CANONICAL_EVIDENCE = ["orchestration_matrix_passed", "repository_roundtrip_passed", "atomic_failures_contained", "stale_revision_protected", "malformed_carriers_rejected", "malformed_sessions_rejected", "historical_snapshots_preserved", "legacy_history_non_authoritative", "exact_prescriptions_preserved", "no_legacy_fields_persisted", "deterministic_outputs_verified"] as const;
export type CanonicalPipelineCertification = Readonly<{
  schemaVersion: "canonical_session_pipeline_certification_v1";
  readiness: CanonicalPipelineReadiness;
  totalCases: number;
  validCases: number;
  expectedInvalidCases: number;
  invariantViolations: readonly string[];
  qualityViolations: readonly string[];
  determinismFailures: readonly string[];
  carrierFailures: readonly string[];
  productionSwitchAllowed: false;
  pipelineReadyForSwitch: boolean;
  productionSwitchCompleted: false;
  predicates: Readonly<Record<string, boolean>>;
  blockers: readonly string[];
}>;

/**
 * Certification is deliberately conservative. It reports readiness only when
 * the staged pipeline owns every required output and the v2 carrier proof has
 * been supplied by a later orchestration phase.
 */
export function certifyCanonicalSessionConstruction(inputs: readonly CanonicalSessionConstructionInput[]): CanonicalPipelineCertification {
  const invariantViolations: string[] = [];
  const qualityViolations: string[] = [];
  const determinismFailures: string[] = [];
  const carrierFailures: string[] = [];
  let validCases = 0;
  for (const input of inputs) {
    const first = constructCanonicalSession(input);
    const second = constructCanonicalSession(input);
    if (first.status === "constructed") {
      validCases += 1;
      if (JSON.stringify(first.snapshot) !== JSON.stringify(second.status === "constructed" ? second.snapshot : null)) determinismFailures.push(input.operational.identity);
      if (first.snapshot.slots.some((slot) => !slot.id || !slot.exerciseId || !slot.lane || !slot.method || !slot.settings.repRange)) invariantViolations.push(`${input.operational.identity}:incomplete_slot`);
      if (first.snapshot.slots.some((slot) => !slot.rest || !slot.progression || !slot.stopRule || !slot.loadingMode)) qualityViolations.push(`${input.operational.identity}:incomplete_exact_prescription`);
    }
  }
  carrierFailures.push("canonical_v2_planned_session_orchestration_not_connected");
  carrierFailures.push("persistence_round_trip_not_proven_for_pipeline_snapshot");
  const blockers = [
    "canonical v2 construction still accepts caller-supplied planned-session snapshots",
    "production planned and extra/custom callers remain on the legacy construction engine",
  ];
  return {
    schemaVersion: "canonical_session_pipeline_certification_v1",
    readiness: "not_ready",
    totalCases: inputs.length,
    validCases,
    expectedInvalidCases: inputs.length - validCases,
    invariantViolations,
    qualityViolations,
    determinismFailures,
    carrierFailures,
    productionSwitchAllowed: false,
    pipelineReadyForSwitch: false,
    productionSwitchCompleted: false,
    predicates: {
      orchestration_matrix_passed: inputs.length > 0 && determinismFailures.length === 0,
      repository_roundtrip_passed: false,
      atomic_failures_contained: false,
      stale_revision_protected: false,
      malformed_carriers_rejected: false,
      malformed_sessions_rejected: false,
      historical_snapshots_preserved: false,
      legacy_history_non_authoritative: false,
      exact_prescriptions_preserved: qualityViolations.length === 0,
      no_legacy_fields_persisted: false,
      deterministic_outputs_verified: determinismFailures.length === 0,
    },
    blockers,
  };
}

export function certifyCanonicalPipelineEvidence(evidence: Readonly<Record<string, CanonicalEvidence>>): CanonicalPipelineCertification {
  const predicates = Object.fromEntries(REQUIRED_CANONICAL_EVIDENCE.map((name) => [name, false])) as Record<string, boolean>;
  const blockers: string[] = [];
  for (const name of REQUIRED_CANONICAL_EVIDENCE) {
    const result = evidence[name];
    if (!result) { blockers.push(`${name}:missing_evidence`); continue; }
    if (result.evidenceVersion !== "canonical_pipeline_evidence_v1") { blockers.push(`${name}:unexpected_evidence_version`); continue; }
    if (!result.caseIds.length) { blockers.push(`${name}:no_cases_executed`); continue; }
    if (new Set(result.caseIds).size !== result.caseIds.length) { blockers.push(`${name}:duplicate_case_id`); continue; }
    if (!result.passed) blockers.push(`${name}:${result.firstFailure?.caseId ?? "unknown_case"}:${result.firstFailure?.reason ?? "failed"}`);
    else predicates[name] = true;
  }
  const ready = REQUIRED_CANONICAL_EVIDENCE.every((name) => predicates[name]);
  return { schemaVersion: "canonical_session_pipeline_certification_v1", readiness: ready ? "ready" : "not_ready", totalCases: Object.values(evidence).reduce((sum, item) => sum + item.caseIds.length, 0), validCases: Object.values(evidence).filter((item) => item.passed).length, expectedInvalidCases: 0, invariantViolations: [], qualityViolations: [], determinismFailures: [], carrierFailures: [], productionSwitchAllowed: false, pipelineReadyForSwitch: ready, productionSwitchCompleted: false, predicates, blockers };
}
