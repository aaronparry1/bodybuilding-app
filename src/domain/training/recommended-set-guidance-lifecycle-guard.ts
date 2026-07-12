import { classifyRecommendedSetGuidanceMutationScope, type RecommendedSetGuidanceMutationTarget } from "@/domain/training/recommended-set-guidance-mutation-scope";
export type RecommendedSetGuidanceLifecycleFacts = RecommendedSetGuidanceMutationTarget & Readonly<{ workoutId?: string; lifecycle: "not_created" | "open" | "completed"; hasExactTargetCoverage?: boolean; hasHistoricalActuals?: boolean; planId?: string; workoutPlanId?: string }>;
export type RecommendedSetGuidanceLifecycleGuardResult = Readonly<{ status: "safe_for_later_guidance_mutation" | "additional_timing_policy_required" | "blocked_open_planned_exact_authority" | "blocked_open_planned_compatibility" | "blocked_completed_historical_authority" | "blocked_non_planned_existing_session" | "compatibility_policy_required" | "invalid_identity" | "unsupported_scope"; reason: string }>;
/** Pure lifecycle guard; target presence and lifecycle facts only, never prescription values. */
export function guardRecommendedSetGuidanceMutation(facts: RecommendedSetGuidanceLifecycleFacts): RecommendedSetGuidanceLifecycleGuardResult {
  const scope = classifyRecommendedSetGuidanceMutationScope(facts);
  if (facts.planId && facts.workoutPlanId && facts.planId !== facts.workoutPlanId) return { status: "invalid_identity", reason: "plan_identity_mismatch" };
  if (facts.lifecycle === "completed" || facts.kind === "completed_planned_workout") return { status: "blocked_completed_historical_authority", reason: "historical_prescription_authority" };
  if (facts.kind === "open_planned_workout" || facts.lifecycle === "open") return { status: facts.hasExactTargetCoverage ? "blocked_open_planned_exact_authority" : "blocked_open_planned_compatibility", reason: facts.hasExactTargetCoverage ? "executable_exact_targets" : "planned_compatibility_incomplete" };
  if (scope.status === "compatibility_review_required") return { status: "compatibility_policy_required", reason: scope.reason };
  if (scope.status === "unsupported_scope") return { status: "unsupported_scope", reason: scope.reason };
  if (scope.status !== "potentially_permitted" || facts.lifecycle !== "not_created" || facts.workoutId || facts.hasHistoricalActuals) return { status: "invalid_identity", reason: "future_metadata_identity_conflict" };
  return facts.kind === "future_active_plan_guidance" ? { status: "additional_timing_policy_required", reason: "future_guidance_requires_timing_policy" } : { status: "safe_for_later_guidance_mutation", reason: "no_existing_workout" };
}
