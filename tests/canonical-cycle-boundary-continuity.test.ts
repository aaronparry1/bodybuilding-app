import { describe, expect, it } from "vitest";
import { resolveCanonicalCycleBoundary } from "@/domain/training/canonical-cycle-boundary-resolution";
import { mesocycleById } from "@/domain/training/mesocycle-library";
import { resolveMesocyclePrescriptionPolicy } from "@/domain/training/mesocycle-prescription-policy";

describe("canonical cycle-boundary continuity", () => {
  const mesocycle = mesocycleById("strength_general")!;
  const resolved = resolveMesocyclePrescriptionPolicy("strength_general", { goal: "build_strength" });
  if (resolved.status !== "resolved") throw new Error("policy unavailable");
  const policy = resolved.policy;

  it("continues ordinary and incomplete boundaries without inventing completed evidence", () => {
    expect(resolveCanonicalCycleBoundary({
      microcycleComplete: false,
      completedMicrocyclesInMesocycle: 1,
      mesocycle,
      policy,
      targetCompletion: "successful",
    })).toMatchObject({ status: "not_at_boundary" });
    expect(resolveCanonicalCycleBoundary({
      microcycleComplete: true,
      completedMicrocyclesInMesocycle: 1,
      mesocycle,
      policy,
      targetCompletion: "partial",
    })).toMatchObject({ status: "continue_current_phase", reasonCode: "incomplete_exposure_retained_next_microcycle" });
    expect(resolveCanonicalCycleBoundary({
      microcycleComplete: true,
      completedMicrocyclesInMesocycle: mesocycle.defaultWeeks - 1,
      mesocycle,
      policy,
      targetCompletion: "successful",
    })).toMatchObject({ status: "continue_current_phase", reasonCode: "minimum_phase_exposure_continues" });
  });

  it("selects only the existing ordered approved successor at the canonical horizon", () => {
    expect(resolveCanonicalCycleBoundary({
      microcycleComplete: true,
      completedMicrocyclesInMesocycle: mesocycle.defaultWeeks,
      mesocycle,
      policy,
      targetCompletion: "successful",
    })).toEqual({
      schemaVersion: "canonical_cycle_boundary_resolution_v1",
      status: "transition_approved",
      reasonCode: "default_mesocycle_exposure_completed",
      successorMesocycleId: "strength_accumulation",
    });
  });

  it("continues within the maximum horizon and blocks explicitly when no approved successor exists", () => {
    const withoutSuccessor = { ...policy, transition: { ...policy.transition, approvedSuccessors: [] } };
    expect(resolveCanonicalCycleBoundary({
      microcycleComplete: true,
      completedMicrocyclesInMesocycle: mesocycle.defaultWeeks,
      mesocycle,
      policy: withoutSuccessor,
      targetCompletion: "successful",
    })).toMatchObject({ status: "continue_current_phase", reasonCode: "approved_successor_unavailable_continuation_within_horizon" });
    expect(resolveCanonicalCycleBoundary({
      microcycleComplete: true,
      completedMicrocyclesInMesocycle: mesocycle.maximumWeeks,
      mesocycle,
      policy: withoutSuccessor,
      targetCompletion: "successful",
    })).toMatchObject({
      status: "review_required",
      reasonCode: "approved_successor_unavailable_at_maximum_horizon",
      missingFact: "approved_successor",
      resolutionEvent: "canonical_mesocycle_policy_successor_approved",
      currentProgrammeSafelyUsable: false,
    });
  });
});
