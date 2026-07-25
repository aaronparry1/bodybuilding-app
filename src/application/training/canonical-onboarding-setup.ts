import {
  constructCanonicalActivePlanFromCanonicalInputs,
  type CanonicalGeneratedPlanInput,
} from "@/application/training/canonical-active-plan-construction";
import { appSettingsStore, type AppSettings } from "@/application/settings/app-settings";
import { canonicalActivePlanState } from "@/application/training/canonical-active-plan-state";
import { canonicalActivePlanV2Repository } from "@/data/local/canonical-active-plan-v2-repository";
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
  if (input.recentTrainingDaysPerWeek === 0) {
    return { ...input, continuity: input.continuity === "currently_training" ? "short_layoff" : input.continuity };
  }
  return input;
}

export function onboardingStepKeys(input: Readonly<{
  eventDriven: boolean;
  frameworkOptionCount: number;
}>): readonly string[] {
  const steps = ["goal", "commitment"];
  if (input.eventDriven) steps.push("event");
  steps.push("schedule");
  if (input.frameworkOptionCount > 1) steps.push("split");
  steps.push("experience", "recent_training", "recovery", "review");
  return steps;
}

/**
 * Makes plan persistence and onboarding completion one user-visible commit.
 * Construction remains in memory until the canonical carrier save succeeds;
 * if settings persistence then fails, the exact prior carrier is restored.
 */
export function completeCanonicalOnboardingSetup(input: Readonly<{
  command: CanonicalGeneratedPlanInput;
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
  const priorSettings = appSettingsStore.get();
  const committed = canonicalActivePlanState.completeOnboarding(input.command);
  if (committed.status !== "saved") {
    canonicalActivePlanState.refresh();
    return { ...committed, rollback: "not_required" };
  }

  try {
    appSettingsStore.patch({ ...input.settings, onboardingCompleted: true });
    return { ...committed, rollback: "not_required" };
  } catch {
    try {
      if (priorPlan.status === "saved") {
        const restored = canonicalActivePlanV2Repository.save(priorPlan.carrier);
        if (restored.status !== "saved") throw new Error("plan_rollback_failed");
      } else {
        canonicalActivePlanV2Repository.clear();
      }
      appSettingsStore.set(priorSettings);
      canonicalActivePlanState.refresh();
      return {
        status: "rejected",
        reason: "onboarding_settings_persistence_failed",
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
