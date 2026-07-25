import type { TrainingGoalId } from "@/domain/training/training-goals";
import type { PreferredSplit, TrainingSetupGoal } from "@/domain/training/plan-setup";

export type ProgrammeFrameworkGoal =
  | "hypertrophy"
  | "get_lean"
  | "strength"
  | "athletic_performance"
  | "build_muscle_strength";

/** Framework preferences that can be shown only when canonical construction supports them. */
export type CustomerProgrammeFrameworkId = "push_pull_legs" | "upper_lower" | "full_body" | "body_part_split";

/** Internal delivery strategies are Microcycle-owned and never onboarding choices. */
export type InternalProgrammeDeliveryStrategy =
  | "classic_push_pull_legs_rotation"
  | "complementary_upper_lower_rotation"
  | "varied_full_body_rotation"
  | "lift_emphasis_rotation"
  | "athletic_asymmetric_rotation"
  | "hypertrophy_asymmetric_rotation";

export type ProgrammeFrameworkId =
  | Exclude<CustomerProgrammeFrameworkId, "body_part_split">
  | "chest_back_shoulders_arms_legs"
  | "bench_squat_deadlift";

/** Legacy identifiers remain type-readable for historical rejection/migration only. */
export type UserProgrammeFrameworkId =
  | "asc_recommended"
  | CustomerProgrammeFrameworkId
  | "body_part_split"
  | "bench_squat_deadlift";

export type ProgrammeFrameworkSuitability = "best" | "recommended" | "advanced" | "not_recommended";

export interface ProgrammeFrameworkOption {
  id: UserProgrammeFrameworkId;
  displayName: string;
  suitability: ProgrammeFrameworkSuitability;
  shortDescription: string;
  coachingReason: string;
  isDefaultRecommendation: boolean;
}
export type CustomerProgrammeFrameworkOption = Omit<ProgrammeFrameworkOption, "id" | "suitability"> & Readonly<{ id: CustomerProgrammeFrameworkId; suitability: "best" | "recommended" }>;

export type ProgrammeFrameworkSessionType =
  | "push" | "pull" | "legs" | "upper" | "lower" | "full_body"
  | "chest_back" | "shoulders_arms" | "chest" | "back" | "shoulders" | "arms"
  | "upper_strength" | "lower_strength" | "bench" | "squat" | "deadlift" | "full_body_strength";

export type CanonicalFrameworkMorphPolicy = Readonly<{
  schemaVersion: "canonical_framework_morph_policy_v1";
  publicPreference: CustomerProgrammeFrameworkId;
  internalFramework: ProgrammeFrameworkId;
  deliveryStrategy: InternalProgrammeDeliveryStrategy;
  sessionIdentity: "recognisable_preference" | "lift_emphasis_preserving_preference" | "athletic_delivery_preserving_preference";
  rationaleCodes: readonly string[];
}>;

export interface BuildWeeklySessionSequenceInput {
  goal: ProgrammeFrameworkGoal;
  framework: ProgrammeFrameworkId;
  sessionsPerWeek: number;
  sequenceNumber?: number;
}

export const customerFrameworkFrequencyPolicy = {
  policyId: "canonical_customer_framework_frequency_policy_v1",
  allowed: {
    2: ["full_body", "upper_lower"],
    3: ["full_body", "push_pull_legs"],
    4: ["upper_lower", "push_pull_legs"],
    5: ["push_pull_legs"],
    6: ["push_pull_legs"],
  },
  rationale: {
    full_body: "Distributes the core patterns across a lower-frequency week without leaving a body area untrained.",
    upper_lower: "Alternates complementary upper and lower exposures with predictable recovery.",
    push_pull_legs: "Uses a recognisable push, pull and legs rotation that can roll across calendar weeks.",
    body_part_split: "Uses distinct body-area sessions when five training days provide complete weekly coverage.",
  },
} as const;

const frameworkSequences: Record<ProgrammeFrameworkId, Record<number, readonly ProgrammeFrameworkSessionType[]>> = {
  push_pull_legs: {
    2: ["push", "pull"],
    3: ["push", "pull", "legs"],
    4: ["push", "pull", "legs", "push"],
    5: ["push", "pull", "legs", "push", "pull"],
    6: ["push", "pull", "legs", "push", "pull", "legs"],
  },
  upper_lower: {
    2: ["upper", "lower"],
    3: ["upper", "lower", "upper"],
    4: ["upper", "lower", "upper", "lower"],
    5: ["upper", "lower", "upper", "lower", "upper"],
    6: ["upper", "lower", "upper", "lower", "upper", "lower"],
  },
  full_body: {
    2: ["full_body", "full_body"], 3: ["full_body", "full_body", "full_body"],
    4: ["full_body", "full_body", "full_body", "full_body"],
    5: ["full_body", "full_body", "full_body", "full_body", "full_body"],
    6: ["full_body", "full_body", "full_body", "full_body", "full_body", "full_body"],
  },
  chest_back_shoulders_arms_legs: {
    2: ["upper", "lower"], 3: ["chest_back", "shoulders_arms", "legs"],
    4: ["chest_back", "shoulders_arms", "legs", "full_body"],
    5: ["chest", "back", "shoulders", "arms", "legs"],
    6: ["chest", "back", "shoulders", "arms", "legs", "full_body"],
  },
  bench_squat_deadlift: {
    2: ["upper_strength", "lower_strength"], 3: ["bench", "squat", "deadlift"],
    4: ["bench", "squat", "deadlift", "full_body_strength"],
    5: ["bench", "squat", "deadlift", "upper_strength", "lower_strength"],
    6: ["bench", "squat", "deadlift", "bench", "squat", "deadlift"],
  },
};

const frameworkDisplay: Record<CustomerProgrammeFrameworkId, Pick<ProgrammeFrameworkOption, "displayName" | "shortDescription">> = {
  push_pull_legs: { displayName: "Push/Pull/Legs", shortDescription: "A rolling push, pull and legs rotation for three to six training days." },
  upper_lower: { displayName: "Upper/Lower", shortDescription: "Complementary upper and lower sessions, especially effective across four days." },
  full_body: { displayName: "Full Body", shortDescription: "Varied full-body sessions that distribute key patterns across a lower-frequency week." },
  body_part_split: { displayName: "Body-Part Split", shortDescription: "Distinct chest, back, shoulders, arms and legs sessions across five training days." },
};

export function getCustomerFrameworksForFrequency(sessionsPerWeek: number): readonly CustomerProgrammeFrameworkId[] {
  if (!Number.isInteger(sessionsPerWeek) || sessionsPerWeek < 2 || sessionsPerWeek > 6) return [];
  return [...customerFrameworkFrequencyPolicy.allowed[sessionsPerWeek as keyof typeof customerFrameworkFrequencyPolicy.allowed]];
}

export function getRecommendedCustomerFramework(goal: TrainingGoalId, sessionsPerWeek: number): CustomerProgrammeFrameworkId | null {
  const allowed = getCustomerFrameworksForFrequency(sessionsPerWeek);
  if (!allowed.length) return null;
  if (sessionsPerWeek === 2) return goal === "get_stronger" || goal === "build_muscle_strength" ? "upper_lower" : "full_body";
  if (sessionsPerWeek === 3) return goal === "build_muscle" ? "push_pull_legs" : "full_body";
  if (sessionsPerWeek === 4) return goal === "build_muscle" ? "push_pull_legs" : "upper_lower";
  return "push_pull_legs";
}

/** Public options are canonical goal/frequency compatibility, never an onboarding-only list. */
export function getSelectableFrameworkOptionsForGoal(goal: TrainingGoalId, sessionsPerWeek = 3): ProgrammeFrameworkOption[] {
  const recommended = getRecommendedCustomerFramework(goal, sessionsPerWeek);
  const ids: readonly CustomerProgrammeFrameworkId[] = sessionsPerWeek === 5 && (goal === "build_muscle" || goal === "lose_fat")
    ? ["push_pull_legs", "upper_lower", "full_body", "body_part_split"]
    : getCustomerFrameworksForFrequency(sessionsPerWeek);
  return ids.map((id) => ({
    id,
    displayName: frameworkDisplay[id].displayName,
    suitability: id === recommended ? "best" : "recommended",
    shortDescription: frameworkDisplay[id].shortDescription,
    coachingReason: id === recommended ? `ASC recommends this for ${sessionsPerWeek} training days and your goal.` : customerFrameworkFrequencyPolicy.rationale[id],
    isDefaultRecommendation: id === recommended,
  }));
}

/** Compatibility API returns customer-facing framework identities only. */
export function getFrameworkOptionsForGoal(goal: TrainingGoalId): ProgrammeFrameworkOption[] {
  return (["full_body", "upper_lower", "push_pull_legs"] as const).map((id) => ({
    id,
    displayName: frameworkDisplay[id].displayName,
    suitability: id === getRecommendedCustomerFramework(goal, 3) ? "best" : "recommended",
    shortDescription: frameworkDisplay[id].shortDescription,
    coachingReason: customerFrameworkFrequencyPolicy.rationale[id],
    isDefaultRecommendation: id === getRecommendedCustomerFramework(goal, 3),
  }));
}

export function getAllowedProgrammeFrameworks(goal: ProgrammeFrameworkGoal): ProgrammeFrameworkId[] {
  return goal === "hypertrophy" || goal === "get_lean"
    ? ["push_pull_legs", "upper_lower", "full_body", "chest_back_shoulders_arms_legs"]
    : ["bench_squat_deadlift", "push_pull_legs", "upper_lower", "full_body"];
}

export type CanonicalFrameworkResolution = Readonly<{
  status: "resolved";
  goal: ProgrammeFrameworkGoal;
  requested: PreferredSplit;
  publicPreference: CustomerProgrammeFrameworkId;
  framework: ProgrammeFrameworkId;
  reason: "explicit_supported_preference" | "asc_recommended_for_frequency" | "phase_specific_morph";
  morphPolicy: CanonicalFrameworkMorphPolicy;
}> | Readonly<{ status: "unsupported"; reason: "unsupported_goal" | "unsupported_framework" | "unsupported_frequency" }>;

export function resolveCanonicalProgrammeFramework(input: Readonly<{ goal: TrainingSetupGoal; sessionsPerWeek: number; requested: PreferredSplit; phase?: string }>): CanonicalFrameworkResolution {
  if (!Number.isInteger(input.sessionsPerWeek) || input.sessionsPerWeek < 2 || input.sessionsPerWeek > 6) return { status: "unsupported", reason: "unsupported_frequency" };
  const goal = frameworkGoalForSetupGoal(input.goal);
  if (!goal) return { status: "unsupported", reason: "unsupported_goal" };
  const publicPreference = input.requested === "let_app_choose"
    ? getRecommendedCustomerFramework(trainingGoalForFrameworkGoal(goal), input.sessionsPerWeek)
    : customerPreference(input.requested);
  const goalSpecificFiveDayFramework = input.sessionsPerWeek === 5
    && (goal === "hypertrophy" || goal === "get_lean")
    && (publicPreference === "upper_lower" || publicPreference === "full_body" || publicPreference === "body_part_split");
  if (!publicPreference || (!getCustomerFrameworksForFrequency(input.sessionsPerWeek).includes(publicPreference) && !goalSpecificFiveDayFramework)) return { status: "unsupported", reason: "unsupported_framework" };
  const morphPolicy = resolveCanonicalFrameworkMorph({ goal, phase: input.phase, publicPreference, sessionsPerWeek: input.sessionsPerWeek });
  const isPreferenceTranslation = publicPreference === "body_part_split"
    && morphPolicy.internalFramework === "chest_back_shoulders_arms_legs";
  return {
    status: "resolved",
    goal,
    requested: input.requested,
    publicPreference,
    framework: morphPolicy.internalFramework,
    reason: morphPolicy.internalFramework === publicPreference || isPreferenceTranslation
      ? input.requested === "let_app_choose"
        ? "asc_recommended_for_frequency"
        : "explicit_supported_preference"
      : "phase_specific_morph",
    morphPolicy,
  };
}

export function resolveCanonicalFrameworkMorph(input: Readonly<{ goal: ProgrammeFrameworkGoal; phase?: string; publicPreference: CustomerProgrammeFrameworkId; sessionsPerWeek: number }>): CanonicalFrameworkMorphPolicy {
  const phase = input.phase ?? "";
  const strengthSpecific = /specific|intensification|realisation|taper/.test(phase);
  if ((input.goal === "strength" || input.goal === "build_muscle_strength") && strengthSpecific) {
    return { schemaVersion: "canonical_framework_morph_policy_v1", publicPreference: input.publicPreference, internalFramework: "bench_squat_deadlift", deliveryStrategy: "lift_emphasis_rotation", sessionIdentity: "lift_emphasis_preserving_preference", rationaleCodes: [`preference:${input.publicPreference}`, `phase:${phase}`, "main_lift_priority", "hypertrophy_assistance_retained"] };
  }
  if (input.goal === "athletic_performance" && /power|pre_competition/.test(phase)) {
    return { schemaVersion: "canonical_framework_morph_policy_v1", publicPreference: input.publicPreference, internalFramework: internalFrameworkForPreference(input.publicPreference), deliveryStrategy: "athletic_asymmetric_rotation", sessionIdentity: "athletic_delivery_preserving_preference", rationaleCodes: [`preference:${input.publicPreference}`, `phase:${phase}`, "power_and_sport_workload_coordinated"] };
  }
  const internalFramework = internalFrameworkForPreference(input.publicPreference);
  const deliveryStrategy: InternalProgrammeDeliveryStrategy = input.publicPreference === "push_pull_legs"
    ? "classic_push_pull_legs_rotation"
    : input.publicPreference === "upper_lower"
      ? "complementary_upper_lower_rotation"
      : input.publicPreference === "body_part_split"
        ? "hypertrophy_asymmetric_rotation"
        : "varied_full_body_rotation";
  return { schemaVersion: "canonical_framework_morph_policy_v1", publicPreference: input.publicPreference, internalFramework, deliveryStrategy, sessionIdentity: "recognisable_preference", rationaleCodes: [`preference:${input.publicPreference}`, `goal:${input.goal}`, "frequency_compatible", "preference_identity_preserved"] };
}

export function frameworkGoalForSetupGoal(goal: TrainingSetupGoal): ProgrammeFrameworkGoal | null {
  if (goal === "build_muscle") return "hypertrophy";
  if (goal === "get_leaner") return "get_lean";
  if (goal === "build_strength" || goal === "powerlifting_meet") return "strength";
  if (goal === "build_muscle_and_strength") return "build_muscle_strength";
  if (goal === "athletic_performance") return "athletic_performance";
  return null;
}

export function preferredSplitForProgrammeFramework(framework: ProgrammeFrameworkId): PreferredSplit {
  return framework === "chest_back_shoulders_arms_legs" ? "body_part_split" : framework;
}

export function buildWeeklySessionSequence({ goal, framework, sessionsPerWeek, sequenceNumber = 1 }: BuildWeeklySessionSequenceInput): ProgrammeFrameworkSessionType[] {
  if (!Number.isInteger(sessionsPerWeek) || sessionsPerWeek < 2 || sessionsPerWeek > 6) throw new Error("Programme framework supports 2-6 sessions per week.");
  if (!getAllowedProgrammeFrameworks(goal).includes(framework)) throw new Error(`Framework ${framework} is not supported for goal ${goal}.`);
  const sequence = frameworkSequences[framework][sessionsPerWeek];
  if (!sequence) throw new Error(`No session sequence exists for ${framework} at ${sessionsPerWeek} sessions per week.`);
  if (framework !== "push_pull_legs" || sessionsPerWeek === 3 || sessionsPerWeek === 6) return [...sequence];
  const rotation: ProgrammeFrameworkSessionType[] = ["push", "pull", "legs"];
  const start = ((sequenceNumber - 1) * sessionsPerWeek) % rotation.length;
  return Array.from({ length: sessionsPerWeek }, (_, index) => rotation[(start + index) % rotation.length]!);
}

function customerPreference(split: PreferredSplit): CustomerProgrammeFrameworkId | null {
  return split === "push_pull_legs" || split === "upper_lower" || split === "full_body" || split === "body_part_split" ? split : null;
}

function trainingGoalForFrameworkGoal(goal: ProgrammeFrameworkGoal): TrainingGoalId {
  if (goal === "hypertrophy") return "build_muscle";
  if (goal === "get_lean") return "lose_fat";
  if (goal === "strength") return "get_stronger";
  if (goal === "build_muscle_strength") return "build_muscle_strength";
  return "athletic_performance";
}

function internalFrameworkForPreference(preference: CustomerProgrammeFrameworkId): ProgrammeFrameworkId {
  return preference === "body_part_split" ? "chest_back_shoulders_arms_legs" : preference;
}
