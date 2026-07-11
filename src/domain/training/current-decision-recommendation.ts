import { currentMesocycleDecisionRepository } from "@/data/local/current-mesocycle-decision-repository";
import { applyCurrentMesocycleDecision, type CurrentDecisionApplicationResult } from "@/domain/training/current-decision-application";

/** Current-only recommendation consumer. Legacy recommendation actions remain compatibility-only. */
export function getCurrentDecisionRecommendation(planId: string):
  | { status: "available"; decisionId: string; outcome: "delay" | "continue" | "deload" | "advance" | "review_required"; reason?: string }
  | { status: "missing" | "invalid" } {
  const current = currentMesocycleDecisionRepository.get(planId);
  if (current.status === "missing") return { status: "missing" };
  if (current.status !== "ready") return { status: "invalid" };
  return { status: "available", decisionId: current.record.id, outcome: current.record.outcome, ...(current.record.outcome === "delay" || current.record.outcome === "review_required" ? { reason: current.record.reason } : {}) };
}

export function applyCurrentDecisionRecommendation(input: Readonly<{ decisionId: string; planId: string; mesocycleId: string; microcycleNumber: number; appliedAt: string }>): CurrentDecisionApplicationResult {
  return applyCurrentMesocycleDecision(input);
}
