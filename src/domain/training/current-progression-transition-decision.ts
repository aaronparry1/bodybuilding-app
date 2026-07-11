import type { MesocycleId, MesocycleSpec } from "@/domain/training/mesocycle-library";

export type PerformanceBasedFatigueTrend = "normal" | "watch" | "deload_eligible" | "deload_required";
export type MicrocycleEvaluationState = "unresolved" | "evaluable" | "disrupted" | "construction_blocked";

export type MesocycleDecision =
  | { outcome: "delay"; reason: "incomplete_compatibility" | "unresolved_work" | "insufficient_evidence" | "construction_blocked" | "no_approved_successor" }
  | { outcome: "continue" }
  | { outcome: "deload"; fatigue: PerformanceBasedFatigueTrend }
  | { outcome: "advance"; targetMesocycleId: MesocycleId }
  | { outcome: "review_required"; reason: "maximum_exposure" | "unsupported_compatibility" | "no_safe_transition" };

export type MesocycleDecisionInput = {
  compatibility: "ready" | "incomplete" | "unsupported";
  microcycleState: MicrocycleEvaluationState;
  completedMicrocycles: number;
  mesocycle: Pick<MesocycleSpec, "minimumWeeks" | "maximumWeeks" | "nextStates" | "successCriteria" | "failureRoute">;
  purposeConcluded: boolean;
  currentStimulusProductive: boolean;
  fatigue: PerformanceBasedFatigueTrend;
  approvedSuccessors: MesocycleId[];
  approvedPrerequisites: Array<{ id: MesocycleId; deficiency: string }>;
};

export function decideMesocycleTransition(input: MesocycleDecisionInput): MesocycleDecision {
  if (input.compatibility === "incomplete") return { outcome: "delay", reason: "incomplete_compatibility" };
  if (input.compatibility === "unsupported") return { outcome: "review_required", reason: "unsupported_compatibility" };
  if (input.microcycleState === "construction_blocked") return { outcome: "delay", reason: "construction_blocked" };
  if (input.microcycleState === "unresolved") return { outcome: "delay", reason: "unresolved_work" };
  if (input.microcycleState === "disrupted" || input.completedMicrocycles < input.mesocycle.minimumWeeks) return { outcome: "delay", reason: "insufficient_evidence" };
  if (input.fatigue === "deload_required" || input.fatigue === "deload_eligible") return { outcome: "deload", fatigue: input.fatigue };
  const successor = input.approvedSuccessors.find((id) => input.mesocycle.nextStates.includes(id));
  if (input.purposeConcluded && successor) return { outcome: "advance", targetMesocycleId: successor };
  if (input.purposeConcluded && !successor) return { outcome: "delay", reason: "no_approved_successor" };
  if (input.currentStimulusProductive && input.completedMicrocycles < input.mesocycle.maximumWeeks) return { outcome: "continue" };
  return { outcome: "review_required", reason: input.completedMicrocycles >= input.mesocycle.maximumWeeks ? "maximum_exposure" : "no_safe_transition" };
}
