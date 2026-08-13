export type CanonicalStartupHydrationDecision =
  | Readonly<{ status: "waiting"; reason: "authentication_loading" | "account_data_restoring" }>
  | Readonly<{ status: "retry_required"; reason: "account_data_restore_failed" | "retained_training_relationship_unresolved" }>
  | Readonly<{ status: "ready"; reason: "local_plan_available" | "account_data_ready" | "offline_or_signed_out" }>;

export function resolveCanonicalStartupHydration(input: Readonly<{
  authLoading: boolean;
  authenticatedUserId?: string | null;
  localPlanStatus: "saved" | "missing" | "invalid";
  retainedTrainingStatus?: "none" | "plan" | "plan_with_active_workout" | "active_workout_without_plan" | "account_mismatch" | "unreadable";
  accountDataStatus: "idle" | "restoring" | "ready" | "delayed" | "error" | "conflict";
}>): CanonicalStartupHydrationDecision {
  if (input.authLoading) return { status: "waiting", reason: "authentication_loading" };
  if (!input.authenticatedUserId) return { status: "ready", reason: "offline_or_signed_out" };
  if (input.retainedTrainingStatus === "account_mismatch" || input.retainedTrainingStatus === "unreadable") {
    return { status: "retry_required", reason: "retained_training_relationship_unresolved" };
  }
  if (input.retainedTrainingStatus === "active_workout_without_plan") {
    if (input.accountDataStatus === "idle" || input.accountDataStatus === "restoring") {
      return { status: "waiting", reason: "account_data_restoring" };
    }
    return { status: "retry_required", reason: "retained_training_relationship_unresolved" };
  }
  if (input.localPlanStatus !== "missing") return { status: "ready", reason: "local_plan_available" };
  if (input.accountDataStatus === "error" || input.accountDataStatus === "delayed" || input.accountDataStatus === "conflict") return { status: "retry_required", reason: input.accountDataStatus === "conflict" ? "retained_training_relationship_unresolved" : "account_data_restore_failed" };
  if (input.accountDataStatus === "idle" || input.accountDataStatus === "restoring") {
    return { status: "waiting", reason: "account_data_restoring" };
  }
  return { status: "ready", reason: "account_data_ready" };
}
