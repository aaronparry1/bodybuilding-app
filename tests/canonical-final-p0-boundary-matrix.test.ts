import { describe, expect, it } from "vitest";
import { resolveCanonicalCycleBoundary } from "@/domain/training/canonical-cycle-boundary-resolution";
import { mesocycleLibrary } from "@/domain/training/mesocycle-library";
import { resolveMesocyclePrescriptionPolicy } from "@/domain/training/mesocycle-prescription-policy";

describe("canonical final P0 exhaustive boundary invariant", () => {
  it("classifies every canonical mesocycle boundary without an absent outcome", () => {
    const results: Array<{ id: string; state: string; status: string }> = [];
    for (const mesocycle of mesocycleLibrary) {
      const resolved = resolveMesocyclePrescriptionPolicy(mesocycle.id, { goal: goalFor(mesocycle.engine) });
      expect(resolved.status, mesocycle.id).toBe("resolved");
      if (resolved.status !== "resolved") continue;
      const cases = [
        { state: "ordinary_session", microcycleComplete: false, completed: 1, target: "successful" as const, expected: "not_at_boundary" },
        { state: "partial_final_session", microcycleComplete: true, completed: mesocycle.defaultWeeks, target: "partial" as const, expected: "continue_current_phase" },
        { state: "failed_final_session", microcycleComplete: true, completed: mesocycle.defaultWeeks, target: "failed" as const, expected: "continue_current_phase" },
        { state: "below_default_horizon", microcycleComplete: true, completed: Math.max(0, mesocycle.defaultWeeks - 1), target: "successful" as const, expected: "continue_current_phase" },
        { state: "default_horizon", microcycleComplete: true, completed: mesocycle.defaultWeeks, target: "successful" as const, expected: resolved.policy.transition.approvedSuccessors.length ? "transition_approved" : mesocycle.defaultWeeks < mesocycle.maximumWeeks ? "continue_current_phase" : "review_required" },
      ];
      for (const item of cases) {
        const result = resolveCanonicalCycleBoundary({
          microcycleComplete: item.microcycleComplete,
          completedMicrocyclesInMesocycle: item.completed,
          mesocycle,
          policy: resolved.policy,
          targetCompletion: item.target,
        });
        expect(result.status, `${mesocycle.id}:${item.state}`).toBe(item.expected);
        results.push({ id: mesocycle.id, state: item.state, status: result.status });
      }
      const noSuccessor = {
        ...resolved.policy,
        transition: { ...resolved.policy.transition, approvedSuccessors: [] },
      };
      expect(resolveCanonicalCycleBoundary({
        microcycleComplete: true,
        completedMicrocyclesInMesocycle: Math.max(0, mesocycle.maximumWeeks - 1),
        mesocycle,
        policy: noSuccessor,
        targetCompletion: "successful",
      }).status, `${mesocycle.id}:no_successor_below_max`).toBe(mesocycle.maximumWeeks > Math.max(0, mesocycle.maximumWeeks - 1) ? "continue_current_phase" : "review_required");
      expect(resolveCanonicalCycleBoundary({
        microcycleComplete: true,
        completedMicrocyclesInMesocycle: mesocycle.maximumWeeks,
        mesocycle,
        policy: noSuccessor,
        targetCompletion: "successful",
      })).toMatchObject({
        status: "review_required",
        missingFact: "approved_successor",
        currentProgrammeSafelyUsable: false,
      });
    }
    expect(results).toHaveLength(mesocycleLibrary.length * 5);
  });

  it("uses only declared approved-successor edges", () => {
    for (const mesocycle of mesocycleLibrary) {
      const resolved = resolveMesocyclePrescriptionPolicy(mesocycle.id, { goal: goalFor(mesocycle.engine) });
      if (resolved.status !== "resolved") continue;
      const result = resolveCanonicalCycleBoundary({
        microcycleComplete: true,
        completedMicrocyclesInMesocycle: mesocycle.defaultWeeks,
        mesocycle,
        policy: resolved.policy,
        targetCompletion: "successful",
      });
      if (result.status === "transition_approved") {
        expect(resolved.policy.transition.approvedSuccessors).toContain(result.successorMesocycleId);
        expect(mesocycle.nextStates).toContain(result.successorMesocycleId);
      }
    }
  });
});

function goalFor(engine: string): "build_muscle" | "build_muscle_and_strength" | "build_strength" | "athletic_performance" {
  return engine === "powerbuilding" ? "build_muscle_and_strength" : engine === "strength" ? "build_strength" : engine === "athletic_performance" ? "athletic_performance" : "build_muscle";
}
