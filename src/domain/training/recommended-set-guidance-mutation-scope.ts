export type RecommendedSetGuidanceMutationTarget = Readonly<{ kind: "future_active_plan_guidance" | "programme_template_guidance" | "programme_builder_draft" | "custom_session_guidance" | "extra_session_guidance" | "legacy_compatibility_guidance" | "open_planned_workout" | "completed_planned_workout" | "unknown_or_mixed"; hasPlannedIdentity?: boolean; isCompleted?: boolean; isDraft?: boolean }>;
export type RecommendedSetGuidanceMutationScope = Readonly<{ status: "potentially_permitted" | "blocked_open_planned_scope" | "blocked_completed_historical_scope" | "compatibility_review_required" | "unsupported_scope" | "invalid_target"; reason: string; requiredGuard?: string }>;
/** Facts-only scope classifier; it does not inspect targets, normalize ranges, or mutate anything. */
export function classifyRecommendedSetGuidanceMutationScope(target: RecommendedSetGuidanceMutationTarget): RecommendedSetGuidanceMutationScope {
  if (target.kind === "unknown_or_mixed") return { status: "unsupported_scope", reason: "unknown_or_mixed" };
  if (target.kind === "open_planned_workout") return { status: "blocked_open_planned_scope", reason: "executable_planned_authority" };
  if (target.kind === "completed_planned_workout") return { status: "blocked_completed_historical_scope", reason: "historical_prescription_authority" };
  if (target.hasPlannedIdentity && (target.kind === "custom_session_guidance" || target.kind === "extra_session_guidance")) return { status: "invalid_target", reason: "non_planned_with_planned_identity" };
  if (target.kind === "legacy_compatibility_guidance") return { status: "compatibility_review_required", reason: "legacy_range_only", requiredGuard: "compatibility_policy_required" };
  if (target.kind === "custom_session_guidance" || target.kind === "extra_session_guidance") return { status: "unsupported_scope", reason: "non_planned_policy_required", requiredGuard: "non_planned_policy_required" };
  if (target.kind === "future_active_plan_guidance") return { status: "potentially_permitted", reason: "future_guidance", requiredGuard: "planned_exact_target_guard" };
  if (target.kind === "programme_template_guidance") return { status: "potentially_permitted", reason: "template_guidance", requiredGuard: "template_persistence_guard" };
  return { status: "potentially_permitted", reason: "builder_draft", requiredGuard: "builder_draft_guard" };
}
