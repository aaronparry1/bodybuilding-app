import {
  constructCanonicalActivePlanFromCanonicalInputs,
  type CanonicalGeneratedPlanInput,
} from "@/application/training/canonical-active-plan-construction";
import { appSettingsStore, type AppSettings } from "@/application/settings/app-settings";
import { canonicalActivePlanState } from "@/application/training/canonical-active-plan-state";
import { canonicalActivePlanV2Repository } from "@/data/local/canonical-active-plan-v2-repository";
import { canonicalActivePlanOwnerRepository } from "@/data/local/canonical-active-plan-owner-repository";
import type { CanonicalStartingVolumeContext } from "@/domain/training/canonical-hypertrophy-volume-policy";
import {
  getSelectableFrameworkOptionsForGoal,
  type ProgrammeFrameworkOption,
} from "@/domain/training/programme-framework-rules";
import type { PreferredSplit } from "@/domain/training/plan-setup";
import type { TrainingGoalId } from "@/domain/training/training-goals";

export const CANONICAL_ONBOARDING_SETUP_VERSION = "canonical_onboarding_setup_v1" as const;

export type CanonicalOnboardingSetupCommitResult = Readonly<{
  status: "saved" | "rejected";
  reason: string;
  priorRevision: number | null;
  newRevision: number | null;
  rollback: "not_required" | "restored" | "failed";
}>;

export type CanonicalOnboardingFrameworkOption = Readonly<{
  value: PreferredSplit;
  label: string;
  detail: string;
  isRecommended: boolean;
  resolvedFramework: string;
  resolvedLabel: string;
}>;

type FrameworkProbeInput = Omit<
  CanonicalGeneratedPlanInput,
  "planId" | "createdAt" | "updatedAt" | "preferredSplit"
> & Readonly<{
  goalId: TrainingGoalId;
}>;

/**
 * The selection screen is a projection of executable canonical construction,
 * not a second compatibility table. A choice is shown only if the same facts
 * that will be committed can construct a complete programme.
 */
export function resolveExecutableOnboardingFrameworks(
  input: FrameworkProbeInput,
): readonly CanonicalOnboardingFrameworkOption[] {
  const direct = getSelectableFrameworkOptionsForGoal(input.goalId, input.daysPerWeek);
  const requested: readonly Readonly<{
    value: PreferredSplit;
    label: string;
    detail: string;
    isRecommended: boolean;
  }>[] = direct.length > 1
    ? [
        {
          value: "let_app_choose",
          label: "ASC Recommended",
          detail: "Let the coach choose the best supported framework for this setup.",
          isRecommended: true,
        },
        ...direct.map((option) => frameworkChoice(option)),
      ]
    : direct.map((option) => frameworkChoice(option));

  return requested.flatMap((option, index) => {
    const probe = constructCanonicalActivePlanFromCanonicalInputs({
      ...input,
      planId: `onboarding-framework-probe:${index}:${option.value}`,
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
      preferredSplit: option.value,
    });
    if (probe.status !== "constructed") return [];
    return [{
      ...option,
      resolvedFramework: probe.carrier.microcycle.output.split,
      resolvedLabel: canonicalFrameworkLabel(probe.carrier.microcycle.output.split),
    }];
  });
}

function canonicalFrameworkLabel(framework: string): string {
  const labels: Readonly<Record<string, string>> = {
    push_pull_legs: "Push/Pull/Legs",
    upper_lower: "Upper/Lower",
    full_body: "Full Body",
    chest_back_shoulders_arms_legs: "Body-Part Split",
    bench_squat_deadlift: "Main-Lift Focus",
  };
  return labels[framework] ?? "Unavailable";
}

export function normalizeRecentTrainingInput(input: Readonly<{
  continuity: CanonicalStartingVolumeContext["continuity"];
  recentTrainingDaysPerWeek: CanonicalStartingVolumeContext["recentTrainingDaysPerWeek"];
}>): Readonly<{
  continuity: CanonicalStartingVolumeContext["continuity"];
  recentTrainingDaysPerWeek: CanonicalStartingVolumeContext["recentTrainingDaysPerWeek"];
}> {
  if (input.continuity !== "currently_training") {
    return { continuity: input.continuity, recentTrainingDaysPerWeek: 0 };
  }
  return {
    continuity: input.continuity,
    recentTrainingDaysPerWeek: input.recentTrainingDaysPerWeek === 0 ? 1 : input.recentTrainingDaysPerWeek,
  };
}

export function onboardingStepKeys(input: Readonly<{
  eventDriven: boolean;
  frameworkOptionCount: number;
}>): readonly string[] {
  const steps = ["goal", "commitment"];
  if (input.eventDriven) steps.push("event");
  steps.push("schedule");
  if (input.frameworkOptionCount > 1) steps.push("split");
  steps.push("experience", "priority", "recent_training", "recovery", "review");
  return steps;
}

export function createCanonicalOnboardingSubmissionGate() {
  let state: Readonly<{ status: "idle" | "in_flight" | "committed"; fingerprint?: string }> = { status: "idle" };
  return {
    begin(fingerprint: string): "started" | "in_flight" | "already_committed" {
      if (state.status === "in_flight") return "in_flight";
      if (state.status === "committed" && state.fingerprint === fingerprint) return "already_committed";
      state = { status: "in_flight", fingerprint };
      return "started";
    },
    commit(fingerprint: string): void {
      if (state.status === "in_flight" && state.fingerprint === fingerprint) {
        state = { status: "committed", fingerprint };
      }
    },
    retry(fingerprint: string): void {
      if (state.status === "in_flight" && state.fingerprint === fingerprint) {
        state = { status: "idle" };
      }
    },
    inspect(): Readonly<{ status: "idle" | "in_flight" | "committed"; fingerprint?: string }> {
      return state;
    },
  };
}

/**
 * Makes plan persistence and onboarding completion one user-visible commit.
 * Construction remains in memory until the canonical carrier save succeeds;
 * if settings persistence then fails, the exact prior carrier is restored.
 */
export function completeCanonicalOnboardingSetup(input: Readonly<{
  command: CanonicalGeneratedPlanInput;
  ownerUserId?: string | null;
  settings: Pick<
    AppSettings,
    | "unit"
    | "trainingGoal"
    | "experienceLevel"
    | "recoveryCardioPreference"
    | "availableSessionMinutes"
    | "startingVolumeContext"
  >;
}>): CanonicalOnboardingSetupCommitResult {
  const priorPlan = canonicalActivePlanV2Repository.get();
  const priorOwner = canonicalActivePlanOwnerRepository.get();
  const priorSettings = appSettingsStore.get();
  if (priorOwner.status === "invalid") {
    return {
      status: "rejected",
      reason: `unrestorable_owner_record:${priorOwner.reason}`,
      priorRevision: priorPlan.status === "saved" ? priorPlan.carrier.revision : null,
      newRevision: priorPlan.status === "saved" ? priorPlan.carrier.revision : null,
      rollback: "not_required",
    };
  }
  const committed = canonicalActivePlanState.completeOnboarding(input.command);
  if (committed.status !== "saved") {
    canonicalActivePlanState.refresh();
    return { ...committed, rollback: "not_required" };
  }

  try {
    if (input.ownerUserId) {
      const committedPlan = canonicalActivePlanV2Repository.get();
      if (committedPlan.status !== "saved") throw new Error("onboarding_owner_persistence_failed");
      const owner = canonicalActivePlanOwnerRepository.save({
        planId: committedPlan.carrier.planId,
        ownerUserId: input.ownerUserId,
        boundAt: input.command.updatedAt,
        provenance: "authenticated_onboarding",
      });
      if (owner.status !== "owned") throw new Error("onboarding_owner_persistence_failed");
    }
    appSettingsStore.patch({ ...input.settings, onboardingCompleted: true });
    return { ...committed, rollback: "not_required" };
  } catch (error) {
    try {
      if (priorPlan.status === "saved") {
        const restored = canonicalActivePlanV2Repository.save(priorPlan.carrier);
        if (restored.status !== "saved") throw new Error("plan_rollback_failed");
      } else {
        canonicalActivePlanV2Repository.clear();
      }
      if (priorOwner.status === "owned") {
        const restoredOwner = canonicalActivePlanOwnerRepository.save({
          planId: priorOwner.record.planId,
          ownerUserId: priorOwner.record.ownerUserId,
          boundAt: priorOwner.record.boundAt,
          provenance: priorOwner.record.provenance,
        });
        if (restoredOwner.status !== "owned") throw new Error("owner_rollback_failed");
      } else {
        canonicalActivePlanOwnerRepository.clear();
      }
      appSettingsStore.set(priorSettings);
      canonicalActivePlanState.refresh();
      return {
        status: "rejected",
        reason: error instanceof Error && error.message === "onboarding_owner_persistence_failed"
          ? "onboarding_owner_persistence_failed"
          : "onboarding_settings_persistence_failed",
        priorRevision: priorPlan.status === "saved" ? priorPlan.carrier.revision : null,
        newRevision: priorPlan.status === "saved" ? priorPlan.carrier.revision : null,
        rollback: "restored",
      };
    } catch {
      canonicalActivePlanState.refresh();
      return {
        status: "rejected",
        reason: "onboarding_atomic_rollback_failed",
        priorRevision: priorPlan.status === "saved" ? priorPlan.carrier.revision : null,
        newRevision: null,
        rollback: "failed",
      };
    }
  }
}

export function backfillExistingUserOnboardingMetadata(): Readonly<{
  status: "backfilled" | "unchanged" | "rejected";
  reason: string;
}> {
  const loaded = canonicalActivePlanV2Repository.get();
  if (loaded.status !== "saved") return { status: "rejected", reason: loaded.status === "missing" ? "canonical_plan_missing" : loaded.reason };
  const current = appSettingsStore.get();
  const patch = {
    onboardingCompleted: true,
    unit: loaded.carrier.constraints.units,
    trainingGoal: loaded.carrier.constraints.goal,
    experienceLevel: loaded.carrier.constraints.experienceLevel,
    recoveryCardioPreference: loaded.carrier.constraints.recoveryCardioPreference,
    availableSessionMinutes: loaded.carrier.constraints.availableSessionMinutes,
    startingVolumeContext: loaded.carrier.constraints.startingVolumeContext,
  };
  if (Object.entries(patch).every(([key, value]) => JSON.stringify(current[key as keyof AppSettings]) === JSON.stringify(value))) {
    return { status: "unchanged", reason: "metadata_already_current" };
  }
  try {
    appSettingsStore.patch(patch);
    return { status: "backfilled", reason: "derived_from_validated_active_plan_constraints" };
  } catch {
    return { status: "rejected", reason: "onboarding_metadata_backfill_failed" };
  }
}

function frameworkChoice(option: ProgrammeFrameworkOption): Readonly<{
  value: PreferredSplit;
  label: string;
  detail: string;
  isRecommended: boolean;
}> {
  return {
    value: option.id as PreferredSplit,
    label: option.displayName,
    detail: option.shortDescription,
    isRecommended: option.isDefaultRecommendation,
  };
}
