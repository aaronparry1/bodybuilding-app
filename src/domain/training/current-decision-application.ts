import { activeTrainingPlanRepository } from "@/data/local/active-training-plan-repository";
import { currentMesocycleDecisionRepository } from "@/data/local/current-mesocycle-decision-repository";
import { currentReadinessSnapshotRepository } from "@/data/local/current-readiness-snapshot-repository";
import { markCurrentMesocycleDecisionApplied } from "@/domain/training/current-progression-transition-decision-writer";
import { createMicrocycle } from "@/domain/training/microcycle-scheduler";
import { mesocycleById } from "@/domain/training/mesocycle-library";
import type { ActiveTrainingPlan } from "@/domain/training/plan-setup";

export type CurrentDecisionApplicationResult =
  | { status: "applied"; decisionId: string; outcome: "continue" | "deload" | "advance"; planId: string; mesocycleId: string; microcycleNumber: number; appliedAt: string; lifecycle: "applied" }
  | { status: "no_action_delay"; reason: string }
  | { status: "no_action_review_required"; reason: string }
  | { status: "already_applied" }
  | { status: "stale_decision" | "superseded_decision" | "snapshot_not_found" | "snapshot_mismatch" | "plan_identity_mismatch" | "mesocycle_identity_mismatch" | "microcycle_identity_mismatch" | "invalid_lifecycle" | "missing_advance_target" | "unapproved_advance_target" | "unsupported_compatibility" | "application_failed"; reason: string };

/** Sole normal mutation boundary for persisted current decisions. It never reads legacy block decision state. */
export function applyCurrentMesocycleDecision(input: Readonly<{ decisionId: string; planId: string; mesocycleId: string; microcycleNumber: number; appliedAt: string }>): CurrentDecisionApplicationResult {
  const loaded = currentMesocycleDecisionRepository.get(input.planId);
  if (loaded.status !== "ready") return { status: "stale_decision", reason: "decision_not_current" };
  const decision = loaded.record;
  if (decision.id !== input.decisionId) return { status: "superseded_decision", reason: "decision_id_not_current" };
  if (decision.lifecycle === "applied") return { status: "already_applied" };
  if (decision.lifecycle === "superseded") return { status: "superseded_decision", reason: "decision_superseded" };
  if (decision.lifecycle !== "ready" && decision.lifecycle !== "proposed") return { status: "invalid_lifecycle", reason: "decision_lifecycle_not_applicable" };
  if (decision.planId !== input.planId) return { status: "plan_identity_mismatch", reason: "decision_plan_mismatch" };
  if (decision.mesocycleId !== input.mesocycleId) return { status: "mesocycle_identity_mismatch", reason: "decision_mesocycle_mismatch" };
  if (decision.microcycleNumber !== input.microcycleNumber) return { status: "microcycle_identity_mismatch", reason: "decision_microcycle_mismatch" };
  if (!decision.readinessSnapshotId) return { status: "unsupported_compatibility", reason: "missing_readiness_snapshot" };
  const snapshot = currentReadinessSnapshotRepository.get(decision.readinessSnapshotId);
  if (snapshot.status !== "found") return { status: "snapshot_not_found", reason: "referenced_snapshot_missing" };
  if (snapshot.snapshot.planId !== input.planId || snapshot.snapshot.mesocycleId !== input.mesocycleId || snapshot.snapshot.microcycleNumber !== input.microcycleNumber) return { status: "snapshot_mismatch", reason: "snapshot_identity_mismatch" };
  const currentSnapshot = currentReadinessSnapshotRepository.current(input.planId, snapshot.snapshot.mesocycleId, input.microcycleNumber);
  if (currentSnapshot.status !== "found" || currentSnapshot.snapshot.id !== snapshot.snapshot.id) return { status: "stale_decision", reason: "snapshot_no_longer_current" };
  const plan = activeTrainingPlanRepository.getOptional();
  if (!plan || plan.id !== input.planId || plan.currentMesocycleId !== input.mesocycleId || plan.currentMicrocycle?.sequenceNumber !== input.microcycleNumber) return { status: "plan_identity_mismatch", reason: "plan_not_at_decision_point" };
  if (decision.outcome === "delay") return { status: "no_action_delay", reason: decision.reason };
  if (decision.outcome === "review_required") return { status: "no_action_review_required", reason: decision.reason };
  const current = plan.currentMicrocycle;
  if (!current) return { status: "application_failed", reason: "missing_current_microcycle" };
  let next = plan;
  if (decision.outcome === "continue" || decision.outcome === "deload") {
    next = { ...plan, currentMicrocycle: createMicrocycle({ parentMesocycleId: current.parentMesocycleId, trainingDays: current.trainingDays as 3 | 4 | 5 | 6, split: current.split, sequenceNumber: current.sequenceNumber + 1, progressionState: decision.outcome === "deload" ? "deload" : "build" }) };
  } else if (decision.outcome === "advance") {
    if (!decision.targetMesocycleId) return { status: "missing_advance_target", reason: "advance_target_missing" };
    if (!isCurrentApprovedSuccessor(plan, decision.targetMesocycleId)) return { status: "unapproved_advance_target", reason: "successor_no_longer_approved" };
    next = transitionCurrentPlan(plan, decision.targetMesocycleId);
    if (next.currentMesocycleId !== decision.targetMesocycleId) return { status: "application_failed", reason: "successor_transition_rejected" };
  }
  activeTrainingPlanRepository.save(next);
  const marked = markCurrentMesocycleDecisionApplied(decision, input.appliedAt);
  if (marked.status !== "saved") return { status: "application_failed", reason: "decision_lifecycle_not_persisted" };
  return { status: "applied", decisionId: decision.id, outcome: decision.outcome, planId: next.id, mesocycleId: next.currentMesocycleId ?? input.mesocycleId, microcycleNumber: next.currentMicrocycle?.sequenceNumber ?? input.microcycleNumber, appliedAt: input.appliedAt, lifecycle: "applied" };
}

function isCurrentApprovedSuccessor(plan: ActiveTrainingPlan, targetId: import("@/domain/training/mesocycle-library").MesocycleId): boolean {
  const current = plan.currentMesocycleId ? mesocycleById(plan.currentMesocycleId) : undefined;
  const target = mesocycleById(targetId);
  return Boolean(current && target && current.nextStates.includes(targetId) && target.engine === current.engine && target.eligibility.includes(plan.experienceLevel));
}

function transitionCurrentPlan(plan: ActiveTrainingPlan, targetId: import("@/domain/training/mesocycle-library").MesocycleId): ActiveTrainingPlan {
  return { ...plan, currentMesocycleId: targetId, currentMicrocycle: createMicrocycle({ parentMesocycleId: targetId, trainingDays: plan.daysPerWeek as 3 | 4 | 5 | 6, split: plan.preferredSplit, sequenceNumber: 1 }) };
}
