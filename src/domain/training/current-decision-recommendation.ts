import { applyCanonicalRecommendationAction, readCanonicalRecommendationAction, type ApplyCanonicalRecommendationCommand } from "@/application/training/canonical-recommendation-actions";

/** Current-only recommendation consumer. Legacy recommendation actions remain compatibility-only. */
export function getCurrentDecisionRecommendation(planId: string):
  | { status: "available"; decisionId: string; outcome: "delay" | "continue" | "deload" | "advance" | "review_required"; reason?: string }
  | { status: "missing" | "invalid" } {
  const current = readCanonicalRecommendationAction(planId);
  if (current.status === "no_current_decision") return { status: "missing" };
  if (current.status !== "available") return { status: "invalid" };
  const outcome = current.action.kind === "continue_mesocycle" ? "continue" : current.action.kind === "transition_mesocycle" ? "advance" : current.action.kind === "deload_mesocycle" ? "deload" : "review_required";
  return { status: "available", decisionId: current.action.expectedDecisionId, outcome, ...(outcome === "review_required" ? { reason: current.action.reason } : {}) };
}

export function applyCurrentDecisionRecommendation(input: ApplyCanonicalRecommendationCommand) {
  return applyCanonicalRecommendationAction(input);
}
