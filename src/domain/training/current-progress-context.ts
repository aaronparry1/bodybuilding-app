import { activeTrainingPlanRepository } from "@/data/local/active-training-plan-repository";
import { currentMesocycleDecisionRepository } from "@/data/local/current-mesocycle-decision-repository";
import { currentReadinessSnapshotRepository } from "@/data/local/current-readiness-snapshot-repository";

export type CurrentProgressContext =
  | { status: "ready" | "in_progress" | "insufficient_evidence" | "insufficient_policy" | "blocked" | "disrupted" | "review_required"; planId: string; mesocycleId: string; microcycleNumber: number; snapshotId: string; decisionId?: string; decisionOutcome?: "delay" | "continue" | "deload" | "advance" | "review_required"; decisionLifecycle?: string; advanceTargetMesocycleId?: string }
  | { status: "no_current_snapshot" | "no_current_decision" | "compatibility" | "invalid"; reason: string };

/** Read-only current-first context for Progress and volume consumers. */
export function resolveCurrentProgressContext(): CurrentProgressContext {
  const plan = activeTrainingPlanRepository.getOptional();
  if (!plan?.currentMesocycleId || !plan.currentMicrocycle) return { status: "compatibility", reason: "missing_current_plan_identity" };
  const snapshot = currentReadinessSnapshotRepository.current(plan.id, plan.currentMesocycleId, plan.currentMicrocycle.sequenceNumber);
  if (snapshot.status === "not_found") return { status: "no_current_snapshot", reason: "snapshot_missing" };
  if (snapshot.status !== "found") return { status: "invalid", reason: "snapshot_repository_conflict" };
  const decision = currentMesocycleDecisionRepository.get(plan.id);
  if (decision.status === "invalid") return { status: "invalid", reason: "decision_repository_invalid" };
  const base = { planId: plan.id, mesocycleId: plan.currentMesocycleId, microcycleNumber: plan.currentMicrocycle.sequenceNumber, snapshotId: snapshot.snapshot.id };
  if (snapshot.snapshot.state === "in_progress") return { status: "in_progress", ...base };
  if (snapshot.snapshot.state === "insufficient_evidence") return { status: "insufficient_evidence", ...base };
  if (snapshot.snapshot.state === "insufficient_policy") return { status: "insufficient_policy", ...base };
  if (snapshot.snapshot.state === "blocked") return { status: "blocked", ...base };
  if (snapshot.snapshot.state === "disrupted") return { status: "disrupted", ...base };
  if (decision.status === "missing") return { status: "no_current_decision", reason: "decision_missing" };
  if (decision.record.outcome === "review_required") return { status: "review_required", ...base, decisionId: decision.record.id, decisionOutcome: decision.record.outcome, decisionLifecycle: decision.record.lifecycle };
  return { status: "ready", ...base, decisionId: decision.record.id, decisionOutcome: decision.record.outcome, decisionLifecycle: decision.record.lifecycle, ...(decision.record.outcome === "advance" ? { advanceTargetMesocycleId: decision.record.targetMesocycleId } : {}) };
}

export type CurrentVolumeContext =
  | { status: "ready"; planId: string; mesocycleId: string; microcycleNumber: number; microcycleProgressionState: string; isDeload: boolean; decisionOutcome?: string }
  | { status: Exclude<CurrentProgressContext["status"], "ready">; reason?: string };

export function resolveCurrentVolumeContext(): CurrentVolumeContext {
  const context = resolveCurrentProgressContext();
  if (context.status !== "ready") return "reason" in context ? { status: context.status, reason: context.reason } : { status: context.status };
  const plan = activeTrainingPlanRepository.getOptional();
  if (!plan?.currentMicrocycle) return { status: "compatibility", reason: "missing_current_microcycle" };
  return { status: "ready", planId: context.planId, mesocycleId: context.mesocycleId, microcycleNumber: context.microcycleNumber, microcycleProgressionState: plan.currentMicrocycle.progressionState, isDeload: plan.currentMicrocycle.progressionState === "deload", decisionOutcome: context.decisionOutcome };
}
