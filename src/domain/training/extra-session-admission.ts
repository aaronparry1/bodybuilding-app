import type { ActiveTrainingPlan } from "@/domain/training/plan-setup";

export type ExtraSessionDecision = "add" | "redistribute" | "replace" | "reduce" | "block";
export type ExtraSessionPurpose = "priority_volume" | "lift_practice" | "make_up" | "recreational" | "conditioning" | "recovery";

export function admitExtraSession(input: { plan: ActiveTrainingPlan; purpose: ExtraSessionPurpose; recentHighStressSessions: number; pain?: boolean }): { decision: ExtraSessionDecision; reason: string } {
  const phase = input.plan.currentMesocycleId ?? "";
  if (input.pain) return { decision: "block", reason: "Pain requires recovery or an approved substitution, not extra work." };
  if (phase.includes("taper") || phase.includes("transition") || phase.includes("realisation")) return input.purpose === "recovery" ? { decision: "reduce", reason: "Only low-stress recovery work is permitted in this phase." } : { decision: "block", reason: "This phase protects readiness; extra developmental work is not permitted." };
  if (phase.includes("intensification")) return input.purpose === "lift_practice" || input.purpose === "recovery" ? { decision: "reduce", reason: "Only brief technical or recovery work fits intensification." } : { decision: "block", reason: "Extra volume would compromise priority heavy work." };
  if (input.recentHighStressSessions >= 2) return { decision: "reduce", reason: "Recent high-stress work leaves room only for a lower-cost session." };
  if (input.purpose === "make_up") return { decision: "replace", reason: "Make-up work replaces a missed exposure; it is not added on top." };
  if (input.purpose === "priority_volume" && phase.includes("volume")) return { decision: "add", reason: "The current phase authorises targeted additional volume." };
  if (input.purpose === "recreational" || input.purpose === "conditioning") return { decision: "reduce", reason: "Recreational and conditioning work counts toward recovery, so it is kept low cost." };
  return { decision: "redistribute", reason: "Move authorised work rather than increasing the microcycle dose." };
}
