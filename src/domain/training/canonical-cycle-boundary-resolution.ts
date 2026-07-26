import type { MesocycleSpec } from "@/domain/training/mesocycle-library";
import type { MesocyclePrescriptionPolicy } from "@/domain/training/mesocycle-prescription-policy";

export const CANONICAL_CYCLE_BOUNDARY_RESOLUTION_VERSION = "canonical_cycle_boundary_resolution_v1" as const;

export type CanonicalCycleBoundaryResolution = Readonly<{
  schemaVersion: typeof CANONICAL_CYCLE_BOUNDARY_RESOLUTION_VERSION;
  status: "not_at_boundary" | "continue_current_phase" | "transition_approved" | "review_required";
  reasonCode: string;
  successorMesocycleId?: string;
  missingFact?: "approved_successor";
  requiredBecause?: string;
  resolutionEvent?: string;
  currentProgrammeSafelyUsable?: boolean;
}>;

/**
 * Resolves continuity only from the existing Mesocycle horizon and ordered
 * approved-successor policy. It introduces neither a new duration threshold
 * nor a parallel transition graph.
 */
export function resolveCanonicalCycleBoundary(input: Readonly<{
  microcycleComplete: boolean;
  completedMicrocyclesInMesocycle: number;
  mesocycle: MesocycleSpec;
  policy: MesocyclePrescriptionPolicy;
  targetCompletion: "successful" | "partial" | "failed";
}>): CanonicalCycleBoundaryResolution {
  if (!input.microcycleComplete) {
    return { schemaVersion: CANONICAL_CYCLE_BOUNDARY_RESOLUTION_VERSION, status: "not_at_boundary", reasonCode: "current_microcycle_in_progress" };
  }
  if (input.targetCompletion !== "successful") {
    return { schemaVersion: CANONICAL_CYCLE_BOUNDARY_RESOLUTION_VERSION, status: "continue_current_phase", reasonCode: "incomplete_exposure_retained_next_microcycle" };
  }
  if (input.completedMicrocyclesInMesocycle < input.mesocycle.defaultWeeks) {
    return { schemaVersion: CANONICAL_CYCLE_BOUNDARY_RESOLUTION_VERSION, status: "continue_current_phase", reasonCode: "minimum_phase_exposure_continues" };
  }
  const successor = input.policy.transition.approvedSuccessors[0];
  if (successor) {
    return { schemaVersion: CANONICAL_CYCLE_BOUNDARY_RESOLUTION_VERSION, status: "transition_approved", reasonCode: "default_mesocycle_exposure_completed", successorMesocycleId: successor };
  }
  if (input.completedMicrocyclesInMesocycle < input.mesocycle.maximumWeeks) {
    return { schemaVersion: CANONICAL_CYCLE_BOUNDARY_RESOLUTION_VERSION, status: "continue_current_phase", reasonCode: "approved_successor_unavailable_continuation_within_horizon" };
  }
  return {
    schemaVersion: CANONICAL_CYCLE_BOUNDARY_RESOLUTION_VERSION,
    status: "review_required",
    reasonCode: "approved_successor_unavailable_at_maximum_horizon",
    missingFact: "approved_successor",
    requiredBecause: "The current Mesocycle has reached its certified maximum horizon and policy contains no compatible successor.",
    resolutionEvent: "canonical_mesocycle_policy_successor_approved",
    currentProgrammeSafelyUsable: false,
  };
}
