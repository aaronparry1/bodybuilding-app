import { jsonStore } from "@/data/local/json-store";

const appReviewPromptStateKey = "iron-logic.app-review-prompt";
const promptCooldownDays = 30;
/** Third completed workout: enough to have an opinion, early enough that most people are still here. */
export const plannedWorkoutsForReviewPrompt = 3;
const millisecondsPerDay = 24 * 60 * 60 * 1000;

export type AppReviewMilestone = "five_planned_workouts" | "first_pr" | "first_training_week";

export type AppReviewSuppressionReason =
  | "no_value_milestone"
  | "recently_prompted"
  | "onboarding"
  | "paywall_or_subscription"
  | "negative_session"
  | "native_unavailable";

export interface AppReviewPromptState {
  lastPromptedAt: string | null;
  promptCount: number;
}

export interface AppReviewEligibilityInput {
  completedPlannedWorkouts: number;
  completedTrainingWeeks: number;
  hasPersonalRecord: boolean;
  now?: Date | string;
  state?: AppReviewPromptState;
  isOnboardingFlow?: boolean;
  isPaywallOrSubscriptionFlow?: boolean;
  hasNegativeSessionEvent?: boolean;
}

export interface AppReviewEligibilityResult {
  allowed: boolean;
  milestone: AppReviewMilestone | null;
  reason: AppReviewSuppressionReason | null;
}

export interface NativeAppReviewRequester {
  isAvailable(): boolean | Promise<boolean>;
  requestReview(): void | boolean | Promise<void | boolean>;
}

export const defaultAppReviewPromptState: AppReviewPromptState = {
  lastPromptedAt: null,
  promptCount: 0,
};

export const appReviewPromptStore = {
  get(): AppReviewPromptState {
    return normalizeAppReviewPromptState(jsonStore.get<AppReviewPromptState>(appReviewPromptStateKey, defaultAppReviewPromptState));
  },
  set(state: AppReviewPromptState): void {
    jsonStore.set(appReviewPromptStateKey, normalizeAppReviewPromptState(state));
  },
  recordPromptShown(now: Date | string = new Date()): AppReviewPromptState {
    const current = this.get();
    const next = {
      lastPromptedAt: toIsoString(now),
      promptCount: current.promptCount + 1,
    };
    this.set(next);
    return next;
  },
};

export function evaluateAppReviewPromptEligibility(input: AppReviewEligibilityInput): AppReviewEligibilityResult {
  if (input.isOnboardingFlow) return suppressed("onboarding");
  if (input.isPaywallOrSubscriptionFlow) return suppressed("paywall_or_subscription");
  if (input.hasNegativeSessionEvent) return suppressed("negative_session");

  const state = normalizeAppReviewPromptState(input.state ?? appReviewPromptStore.get());
  if (promptedWithinCooldown(state, input.now ?? new Date())) return suppressed("recently_prompted");

  const milestone = resolveMilestone(input);
  if (!milestone) return suppressed("no_value_milestone");

  return {
    allowed: true,
    milestone,
    reason: null,
  };
}

export async function requestAppReviewIfEligible(
  input: AppReviewEligibilityInput,
  requester: NativeAppReviewRequester | null | undefined,
): Promise<AppReviewEligibilityResult> {
  const eligibility = evaluateAppReviewPromptEligibility(input);
  if (!eligibility.allowed) return eligibility;

  try {
    const available = requester ? await requester.isAvailable() : false;
    if (!available || !requester) return suppressed("native_unavailable");

    await requester.requestReview();
    appReviewPromptStore.recordPromptShown(input.now ?? new Date());
    return eligibility;
  } catch {
    return suppressed("native_unavailable");
  }
}

export function normalizeAppReviewPromptState(state: Partial<AppReviewPromptState> | null | undefined): AppReviewPromptState {
  return {
    lastPromptedAt: typeof state?.lastPromptedAt === "string" && state.lastPromptedAt.length > 0 ? state.lastPromptedAt : null,
    promptCount: Number.isFinite(state?.promptCount) ? Math.max(0, Math.floor(state!.promptCount!)) : 0,
  };
}

function resolveMilestone(input: AppReviewEligibilityInput): AppReviewMilestone | null {
  if (input.hasPersonalRecord) return "first_pr";
  if (input.completedTrainingWeeks >= 1) return "first_training_week";
  if (input.completedPlannedWorkouts >= plannedWorkoutsForReviewPrompt) return "five_planned_workouts";
  return null;
}

function promptedWithinCooldown(state: AppReviewPromptState, now: Date | string): boolean {
  if (!state.lastPromptedAt) return false;
  const lastPromptedAt = new Date(state.lastPromptedAt).getTime();
  const currentTime = new Date(now).getTime();
  if (!Number.isFinite(lastPromptedAt) || !Number.isFinite(currentTime)) return false;
  return currentTime - lastPromptedAt < promptCooldownDays * millisecondsPerDay;
}

function toIsoString(value: Date | string): string {
  return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
}

function suppressed(reason: AppReviewSuppressionReason): AppReviewEligibilityResult {
  return {
    allowed: false,
    milestone: null,
    reason,
  };
}
