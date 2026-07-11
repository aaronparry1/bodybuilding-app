import { describe, expect, it } from "vitest";
import { decideMesocycleTransition, type MesocycleDecisionInput } from "@/domain/training/current-progression-transition-decision";

const base: MesocycleDecisionInput = {
  compatibility: "ready", microcycleState: "evaluable", completedMicrocycles: 3,
  mesocycle: { minimumWeeks: 3, maximumWeeks: 5, nextStates: ["hypertrophy_consolidation"], successCriteria: [], failureRoute: "consolidate" },
  purposeConcluded: false, currentStimulusProductive: true, fatigue: "normal", approvedSuccessors: ["hypertrophy_consolidation"], approvedPrerequisites: [],
};

describe("current mesocycle decision", () => {
  it("delays before minimum exposure or when planned work is unresolved", () => {
    expect(decideMesocycleTransition({ ...base, completedMicrocycles: 2 }).outcome).toBe("delay");
    expect(decideMesocycleTransition({ ...base, microcycleState: "unresolved" })).toEqual({ outcome: "delay", reason: "unresolved_work" });
  });

  it("does not let construction blocking or incomplete compatibility trigger deload", () => {
    expect(decideMesocycleTransition({ ...base, microcycleState: "construction_blocked", fatigue: "deload_required" })).toEqual({ outcome: "delay", reason: "construction_blocked" });
    expect(decideMesocycleTransition({ ...base, compatibility: "incomplete" })).toEqual({ outcome: "delay", reason: "incomplete_compatibility" });
  });

  it("uses evaluated sustained fatigue, approved successors, continuation, and review states distinctly", () => {
    expect(decideMesocycleTransition({ ...base, fatigue: "deload_eligible" })).toEqual({ outcome: "deload", fatigue: "deload_eligible" });
    expect(decideMesocycleTransition({ ...base, purposeConcluded: true })).toEqual({ outcome: "advance", targetMesocycleId: "hypertrophy_consolidation" });
    expect(decideMesocycleTransition(base)).toEqual({ outcome: "continue" });
    expect(decideMesocycleTransition({ ...base, currentStimulusProductive: false, approvedPrerequisites: [{ id: "hypertrophy_calibration", deficiency: "baseline quality" }] })).toEqual({ outcome: "review_required", reason: "no_safe_transition" });
    expect(decideMesocycleTransition({ ...base, currentStimulusProductive: false, completedMicrocycles: 5 })).toEqual({ outcome: "review_required", reason: "maximum_exposure" });
  });
});
