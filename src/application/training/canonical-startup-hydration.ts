export type CanonicalStartupHydrationDecision =
  | Readonly<{ status: "waiting"; reason: "authentication_loading" | "account_data_restoring" }>
  | Readonly<{ status: "retry_required"; reason: "account_data_restore_failed" }>
  | Readonly<{ status: "ready"; reason: "local_plan_available" | "account_data_ready" | "offline_or_signed_out" }>;

export function resolveCanonicalStartupHydration(input: Readonly<{
  authLoading: boolean;
  authenticatedUserId?: string | null;
  localPlanStatus: "saved" | "missing" | "invalid";
  accountDataStatus: "idle" | "restoring" | "ready" | "error";
}>): CanonicalStartupHydrationDecision {
  if (input.authLoading) return { status: "waiting", reason: "authentication_loading" };
  if (!input.authenticatedUserId) return { status: "ready", reason: "offline_or_signed_out" };
  if (input.localPlanStatus !== "missing") return { status: "ready", reason: "local_plan_available" };
  if (input.accountDataStatus === "error") return { status: "retry_required", reason: "account_data_restore_failed" };
  if (input.accountDataStatus === "idle" || input.accountDataStatus === "restoring") {
    return { status: "waiting", reason: "account_data_restoring" };
  }
  return { status: "ready", reason: "account_data_ready" };
}
