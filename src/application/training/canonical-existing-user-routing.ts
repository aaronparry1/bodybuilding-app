import type { CanonicalReleaseReconciliationResult } from "@/application/training/canonical-release-reconciliation";
import type { CanonicalStartupHydrationDecision } from "@/application/training/canonical-startup-hydration";
import { canonicalActivePlanOwnerRepository } from "@/data/local/canonical-active-plan-owner-repository";
import { canonicalActivePlanV2Repository } from "@/data/local/canonical-active-plan-v2-repository";
import { canonicalRecordedSessionLedger } from "@/data/local/canonical-recorded-session-ledger";

export type CanonicalRetainedTrainingPresence = Readonly<{
  localPlanStatus: "saved" | "missing" | "invalid";
  status:
    | "none"
    | "plan"
    | "plan_with_active_workout"
    | "active_workout_without_plan"
    | "account_mismatch"
    | "unreadable";
  reason: string;
  planId?: string;
  activeRecordedSessionId?: string;
  activeRecordedSessionStatus?: "started" | "paused";
}>;

export type CanonicalExistingUserRouteDecision =
  | Readonly<{ status: "waiting"; reason: string }>
  | Readonly<{ status: "authenticated"; destination: "tabs" | "active_workout"; reason: string }>
  | Readonly<{ status: "onboarding"; reason: string }>
  | Readonly<{ status: "recovery"; reason: string }>;

export function shouldAutoEnterCanonicalActiveWorkout(input: Readonly<{
  routeDecision: CanonicalExistingUserRouteDecision;
  retainedTraining: CanonicalRetainedTrainingPresence;
  isTrainRoute: boolean;
}>): boolean {
  return input.routeDecision.status === "authenticated"
    && input.routeDecision.destination === "active_workout"
    && !input.isTrainRoute
    && input.retainedTraining.activeRecordedSessionStatus !== "paused";
}

/**
 * Read-only retained-state probe. It prevents a durable workout from being
 * interpreted as first-run state while its parent programme or ownership is
 * still restoring. It never binds an owner, mutates a carrier, or repairs a
 * ledger; those operations remain with canonical reconciliation.
 */
export function inspectCanonicalRetainedTrainingPresence(
  authenticatedUserId: string | null,
): CanonicalRetainedTrainingPresence {
  const plan = canonicalActivePlanV2Repository.get();
  const active = canonicalRecordedSessionLedger.inspectActive();
  const owner = canonicalActivePlanOwnerRepository.get();
  const localPlanStatus = plan.status;

  if (active.status === "invalid") {
    return { localPlanStatus, status: "unreadable", reason: active.reason };
  }
  if (owner.status === "invalid") {
    return { localPlanStatus, status: "unreadable", reason: owner.reason };
  }
  if (plan.status === "invalid") {
    return { localPlanStatus, status: "unreadable", reason: `canonical_plan_unrestorable:${plan.reason}` };
  }

  const activeSession = active.status === "found" ? active.sessions[0] : undefined;
  if (owner.status === "owned") {
    if (!authenticatedUserId || owner.record.ownerUserId !== authenticatedUserId) {
      return {
        localPlanStatus,
        status: "account_mismatch",
        reason: "retained_training_belongs_to_different_account",
        planId: owner.record.planId,
        ...(activeSession ? { activeRecordedSessionId: activeSession.recordedSessionId, activeRecordedSessionStatus: activeSession.status as "started" | "paused" } : {}),
      };
    }
    if (plan.status === "saved" && owner.record.planId !== plan.carrier.planId) {
      return { localPlanStatus, status: "unreadable", reason: "active_plan_owner_identity_mismatch", planId: plan.carrier.planId };
    }
    if (activeSession && owner.record.planId !== activeSession.planId) {
      return {
        localPlanStatus,
        status: "unreadable",
        reason: "active_workout_owner_identity_mismatch",
        planId: owner.record.planId,
        activeRecordedSessionId: activeSession.recordedSessionId,
        activeRecordedSessionStatus: activeSession.status as "started" | "paused",
      };
    }
  }

  if (plan.status === "saved") {
    if (activeSession && activeSession.planId !== plan.carrier.planId) {
      return {
        localPlanStatus,
        status: "unreadable",
        reason: "active_workout_plan_identity_mismatch",
        planId: plan.carrier.planId,
        activeRecordedSessionId: activeSession.recordedSessionId,
        activeRecordedSessionStatus: activeSession.status as "started" | "paused",
      };
    }
    return {
      localPlanStatus,
      status: activeSession ? "plan_with_active_workout" : "plan",
      reason: activeSession ? "retained_plan_and_active_workout_found" : "retained_plan_found",
      planId: plan.carrier.planId,
      ...(activeSession ? { activeRecordedSessionId: activeSession.recordedSessionId, activeRecordedSessionStatus: activeSession.status as "started" | "paused" } : {}),
    };
  }

  if (activeSession) {
    return {
      localPlanStatus,
      status: "active_workout_without_plan",
      reason: owner.status === "owned"
        ? "active_workout_programme_temporarily_unavailable"
        : "active_workout_ownership_unresolved",
      planId: activeSession.planId,
      activeRecordedSessionId: activeSession.recordedSessionId,
      activeRecordedSessionStatus: activeSession.status as "started" | "paused",
    };
  }

  return { localPlanStatus, status: "none", reason: "no_retained_training" };
}

/**
 * Single route contract shared by startup and the Create Programme preflight.
 * Onboarding metadata is never consulted here independently of the canonical
 * reconciliation result.
 */
export function resolveCanonicalExistingUserRoute(input: Readonly<{
  hydration: CanonicalStartupHydrationDecision;
  reconciliation: CanonicalReleaseReconciliationResult | null;
  isOnboardingRoute: boolean;
  explicitSetupRestart: boolean;
}>): CanonicalExistingUserRouteDecision {
  if (input.hydration.status === "waiting") return { status: "waiting", reason: input.hydration.reason };
  if (input.hydration.status === "retry_required") return { status: "recovery", reason: input.hydration.reason };
  if (!input.reconciliation) return { status: "waiting", reason: "canonical_reconciliation_pending" };

  if (input.reconciliation.planVisible) {
    if (input.reconciliation.activeAttempt === "resumable") {
      return {
        status: "authenticated",
        destination: "active_workout",
        reason: "resumable_active_workout_outranks_onboarding",
      };
    }
    if (input.isOnboardingRoute && input.explicitSetupRestart) {
      return { status: "onboarding", reason: "explicit_setup_restart_without_active_workout" };
    }
    return { status: "authenticated", destination: "tabs", reason: "validated_existing_plan_outranks_onboarding" };
  }

  if (input.reconciliation.status === "onboarding_required" || input.reconciliation.status === "setup_required") {
    return { status: "onboarding", reason: input.reconciliation.reason };
  }

  return { status: "recovery", reason: input.reconciliation.reason };
}
