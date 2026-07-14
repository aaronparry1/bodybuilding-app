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
      if (first.snapshot.slots.some((slot) => !("dropOffPercent" in slot.settings))) qualityViolations.push(`${input.operational.identity}:dropoff_not_owned_by_snapshot`);
    }
  }
  carrierFailures.push("canonical_v2_planned_session_orchestration_not_connected");
  carrierFailures.push("persistence_round_trip_not_proven_for_pipeline_snapshot");
  const blockers = [
    "exact prescription snapshot lacks explicit rest/progression/stop-rule ownership",
    "drop-off is represented only indirectly through policy provenance, not a resolved construction output",
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
    blockers,
  };
}
