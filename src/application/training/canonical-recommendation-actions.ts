import { activeTrainingPlanRepository } from "@/data/local/active-training-plan-repository";
import { currentMesocycleDecisionRepository } from "@/data/local/current-mesocycle-decision-repository";
import { applyCurrentMesocycleDecision, type CurrentDecisionApplicationResult } from "@/domain/training/current-decision-application";
import { classifyPlanAuthority } from "@/domain/training/plan-authority-provenance";

export type CanonicalRecommendationAction = Readonly<{
  kind: "continue_mesocycle" | "transition_mesocycle" | "deload_mesocycle" | "review_required";
  owner: "mesocycle";
  planId: string;
  mesocycleId: string;
  microcycleNumber: number;
  evidenceId: string;
  evidenceVersion: string;
  reason: string;
  expectedDecisionId: string;
  explanation: string;
  targetMesocycleId?: string;
}>;

export type CanonicalRecommendationQuery =
  | { status: "no_plan" | "legacy_compatibility" | "ambiguous" | "no_current_decision" }
  | { status: "available"; action: CanonicalRecommendationAction };

export function readCanonicalRecommendationAction(planId: string): CanonicalRecommendationQuery {
  const plan = activeTrainingPlanRepository.getOptional();
  if (!plan || plan.id !== planId) return { status: "no_plan" };
  const provenance = classifyPlanAuthority(plan);
  if (provenance.kind === "legacy_compatibility") return { status: "legacy_compatibility" };
  if (provenance.kind === "ambiguous_unversioned") return { status: "ambiguous" };
  const loaded = currentMesocycleDecisionRepository.get(planId);
  if (loaded.status !== "ready" || (loaded.record.lifecycle !== "ready" && loaded.record.lifecycle !== "proposed")) return { status: "no_current_decision" };
  const record = loaded.record;
  const kind = record.outcome === "continue" ? "continue_mesocycle" : record.outcome === "advance" ? "transition_mesocycle" : record.outcome === "deload" ? "deload_mesocycle" : "review_required";
  return { status: "available", action: { kind, owner: "mesocycle", planId, mesocycleId: record.mesocycleId, microcycleNumber: record.microcycleNumber, evidenceId: record.readinessSnapshotId ?? record.id, evidenceVersion: String(record.schemaVersion), reason: record.outcome === "advance" ? "approved_successor" : record.outcome === "deload" ? record.fatigue : record.outcome === "continue" ? "productive_current_stimulus" : record.reason, expectedDecisionId: record.id, explanation: "This action is generated from the current canonical mesocycle decision.", ...(record.outcome === "advance" ? { targetMesocycleId: record.targetMesocycleId } : {}) } };
}

export function applyCanonicalRecommendationAction(action: CanonicalRecommendationAction, appliedAt: string): CurrentDecisionApplicationResult | { status: "legacy_action_rejected" | "action_not_current"; reason: string } {
  const plan = activeTrainingPlanRepository.getOptional();
  if (!plan || plan.id !== action.planId || classifyPlanAuthority(plan).kind !== "canonical_modern") return { status: "legacy_action_rejected", reason: "canonical_plan_required" };
  return applyCurrentMesocycleDecision({ decisionId: action.expectedDecisionId, planId: action.planId, mesocycleId: action.mesocycleId, microcycleNumber: action.microcycleNumber, appliedAt });
}
