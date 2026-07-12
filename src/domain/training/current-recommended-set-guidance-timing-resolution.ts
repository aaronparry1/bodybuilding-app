import { semanticIdempotencyKey, type CurrentRecommendedSetGuidanceAdjustmentRecord } from "@/domain/training/current-recommended-set-guidance-adjustment-record";

export type RecommendedSetGuidanceTimingResolutionInput = Readonly<{ record: CurrentRecommendedSetGuidanceAdjustmentRecord | Readonly<{ legacy: true }>; currentPlanId: string; currentMesocycleId: string; currentMicrocycleNumber: number; decision: Readonly<{ id: string; outcome: "continue" | "delay" | "review_required" | "deload" | "advance"; applied: boolean }> | null; nextMicrocycle: Readonly<{ planId: string; mesocycleId: string; number: number; state: "normal" | "deload" }> | null; createdWorkoutIds: readonly string[]; parentProgrammeVersion: string; timingPolicyVersion: "next_eligible_normal_microcycle_v1" }>;
export type RecommendedSetGuidanceTimingResolution = Readonly<{ status: "resolved_next_normal_microcycle" | "unchanged_already_resolved" | "blocked_decision_unresolved" | "blocked_decision_not_applied" | "blocked_deload" | "blocked_created_workout" | "blocked_mesocycle_changed" | "blocked_target_version_changed" | "stale_after_advance" | "stale_timing_passed" | "compatibility_record_unsupported" | "invalid_record" | "invalid_identity"; reason: string; record?: CurrentRecommendedSetGuidanceAdjustmentRecord; decisionId?: string }>;

/** Pure validation of a decision-produced next normal microcycle. It never invents, persists, or applies timing. */
export function resolveCurrentRecommendedSetGuidanceTiming(input: RecommendedSetGuidanceTimingResolutionInput): RecommendedSetGuidanceTimingResolution {
  if ("legacy" in input.record) return { status: "compatibility_record_unsupported", reason: "legacy_record" };
  const record = input.record;
  if (record.lifecycle === "applied" || record.lifecycle === "stale" || record.lifecycle === "superseded" || record.lifecycle === "failed") return { status: "invalid_record", reason: "record_lifecycle_not_resolvable" };
  if (record.timing.state === "resolved_next_normal_microcycle") return { status: "unchanged_already_resolved", reason: "timing_already_resolved", record };
  if (record.target.planId !== input.currentPlanId) return { status: "invalid_identity", reason: "plan_identity_mismatch" };
  if (record.target.mesocycleId !== input.currentMesocycleId) return { status: "blocked_mesocycle_changed", reason: "target_mesocycle_no_longer_current" };
  if (record.target.parentProgrammeVersion !== input.parentProgrammeVersion) return { status: "blocked_target_version_changed", reason: "parent_programme_version_changed" };
  if (!input.decision || input.decision.outcome === "delay" || input.decision.outcome === "review_required") return { status: "blocked_decision_unresolved", reason: "decision_unresolved" };
  if (!input.decision.applied) return { status: "blocked_decision_not_applied", reason: "decision_not_applied", decisionId: input.decision.id };
  if (input.decision.outcome === "advance") return { status: "stale_after_advance", reason: "advance_invalidates_old_mesocycle_target", decisionId: input.decision.id };
  if (input.decision.outcome === "deload" || !input.nextMicrocycle || input.nextMicrocycle.state === "deload") return { status: "blocked_deload", reason: "next_eligible_normal_microcycle_not_established", decisionId: input.decision.id };
  if (input.nextMicrocycle.planId !== record.target.planId || input.nextMicrocycle.mesocycleId !== record.target.mesocycleId || input.nextMicrocycle.number <= input.currentMicrocycleNumber) return { status: "invalid_identity", reason: "next_microcycle_identity_invalid", decisionId: input.decision.id };
  if (input.createdWorkoutIds.length > 0) return { status: "blocked_created_workout", reason: "effective_microcycle_already_has_created_workout", decisionId: input.decision.id };
  const timing = { state: "resolved_next_normal_microcycle" as const, effective: { schemaVersion: "v1" as const, planId: record.target.planId, mesocycleId: record.target.mesocycleId, effectiveMicrocycleNumber: input.nextMicrocycle.number, timingPolicyVersion: input.timingPolicyVersion } };
  const proposed = { ...record, timing, lifecycle: "ready" as const };
  return { status: "resolved_next_normal_microcycle", reason: "applied_continue_created_next_normal_microcycle", decisionId: input.decision.id, record: { ...proposed, semanticIdempotencyKey: semanticIdempotencyKey(proposed) } };
}
