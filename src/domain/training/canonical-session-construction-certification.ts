import type { CanonicalSessionConstructionInput } from "@/domain/training/canonical-session-construction-pipeline";
import { constructCanonicalSession } from "@/domain/training/canonical-session-construction-pipeline";

export type CanonicalPipelineReadiness = "ready" | "not_ready" | "incomplete";
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
