import type { TrainingGoalId } from "@/domain/training/training-goals";
import type { PreferredSplit, TrainingSetupGoal } from "@/domain/training/plan-setup";

export type ProgrammeFrameworkGoal =
  | "hypertrophy"
  | "get_lean"
  | "strength"
  | "athletic_performance"
  | "build_muscle_strength";

export type ProgrammeFrameworkId =
  | "push_pull_legs"
  | "upper_lower"
  | "full_body"
  | "chest_back_shoulders_arms_legs"
  | "bench_squat_deadlift";

export type UserProgrammeFrameworkId =
  | "asc_recommended"
  | "push_pull_legs"
  | "upper_lower"
  | "full_body"
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

export type ProgrammeFrameworkSessionType =
  | "push"
  | "pull"
  | "legs"
  | "upper"
  | "lower"
  | "full_body"
  | "chest_back"
  | "shoulders_arms"
  | "chest"
  | "back"
  | "shoulders"
  | "arms"
  | "upper_strength"
  | "lower_strength"
  | "bench"
  | "squat"
  | "deadlift"
  | "full_body_strength";

export interface BuildWeeklySessionSequenceInput {
  goal: ProgrammeFrameworkGoal;
  framework: ProgrammeFrameworkId;
  sessionsPerWeek: number;
}

const hypertrophyFrameworks = [
  "push_pull_legs",
  "upper_lower",
  "full_body",
  "chest_back_shoulders_arms_legs",
] as const satisfies readonly ProgrammeFrameworkId[];

const strengthFrameworks = [
  "bench_squat_deadlift",
  "push_pull_legs",
  "upper_lower",
  "full_body",
] as const satisfies readonly ProgrammeFrameworkId[];

const frameworkSequences: Record<ProgrammeFrameworkId, Record<number, readonly ProgrammeFrameworkSessionType[]>> = {
  push_pull_legs: {
    2: ["upper", "lower"],
    3: ["push", "pull", "legs"],
    4: ["push", "pull", "legs", "full_body"],
    5: ["push", "pull", "legs", "upper", "lower"],
    6: ["push", "pull", "legs", "push", "pull", "legs"],
  },
  upper_lower: {
    2: ["upper", "lower"],
    3: ["upper", "lower", "full_body"],
    4: ["upper", "lower", "upper", "lower"],
    5: ["upper", "lower", "upper", "lower", "full_body"],
    6: ["upper", "lower", "upper", "lower", "upper", "lower"],
  },
  full_body: {
    2: ["full_body", "full_body"],
    3: ["full_body", "full_body", "full_body"],
    4: ["full_body", "full_body", "full_body", "full_body"],
    5: ["full_body", "full_body", "full_body", "full_body", "full_body"],
    6: ["full_body", "full_body", "full_body", "full_body", "full_body", "full_body"],
  },
  chest_back_shoulders_arms_legs: {
    2: ["upper", "lower"],
    3: ["chest_back", "shoulders_arms", "legs"],
    4: ["chest_back", "shoulders_arms", "legs", "full_body"],
    5: ["chest", "back", "shoulders", "arms", "legs"],
    6: ["chest", "back", "shoulders", "arms", "legs", "full_body"],
  },
  bench_squat_deadlift: {
    2: ["upper_strength", "lower_strength"],
    3: ["bench", "squat", "deadlift"],
    4: ["bench", "squat", "deadlift", "full_body_strength"],
    5: ["bench", "squat", "deadlift", "upper_strength", "lower_strength"],
    6: ["bench", "squat", "deadlift", "bench", "squat", "deadlift"],
  },
};

const frameworkDisplay: Record<UserProgrammeFrameworkId, Pick<ProgrammeFrameworkOption, "displayName" | "shortDescription">> = {
  asc_recommended: {
    displayName: "ASC Recommended",
    shortDescription: "ASC chooses the best structure for your goal, schedule and progress.",
  },
  push_pull_legs: {
    displayName: "Push/Pull/Legs",
    shortDescription: "Focused sessions for push, pull and legs. Best with moderate to high weekly frequency.",
  },
  upper_lower: {
    displayName: "Upper/Lower",
    shortDescription: "Balanced structure for strength, muscle and recovery.",
  },
  full_body: {
    displayName: "Full Body",
    shortDescription: "Train key movement patterns each session. Strong option for lower frequency or athletic goals.",
  },
  body_part_split: {
    displayName: "Body Part Split",
    shortDescription: "Highly targeted muscle-group training. Better suited to experienced physique-focused lifters.",
  },
  bench_squat_deadlift: {
    displayName: "Bench/Squat/Deadlift",
    shortDescription: "Strength-focused structure built around the main lifts.",
  },
};

const frameworkSuitabilityByGoal: Record<TrainingGoalId, Record<UserProgrammeFrameworkId, ProgrammeFrameworkSuitability>> = {
  build_muscle: {
    asc_recommended: "best",
    push_pull_legs: "best",
    upper_lower: "recommended",
    full_body: "recommended",
    body_part_split: "advanced",
    bench_squat_deadlift: "not_recommended",
  },
  get_stronger: {
    asc_recommended: "best",
    bench_squat_deadlift: "best",
    upper_lower: "recommended",
    full_body: "recommended",
    push_pull_legs: "advanced",
    body_part_split: "not_recommended",
  },
  build_muscle_strength: {
    asc_recommended: "best",
    upper_lower: "best",
    bench_squat_deadlift: "recommended",
    push_pull_legs: "recommended",
    full_body: "recommended",
    body_part_split: "not_recommended",
  },
  athletic_performance: {
    asc_recommended: "best",
    full_body: "best",
    upper_lower: "recommended",
    push_pull_legs: "advanced",
    bench_squat_deadlift: "advanced",
    body_part_split: "not_recommended",
  },
  lose_fat: {
    asc_recommended: "best",
    upper_lower: "best",
    full_body: "best",
    push_pull_legs: "recommended",
    body_part_split: "advanced",
    bench_squat_deadlift: "not_recommended",
  },
};

const frameworkOrder: UserProgrammeFrameworkId[] = [
  "asc_recommended",
  "push_pull_legs",
  "upper_lower",
  "full_body",
  "body_part_split",
  "bench_squat_deadlift",
];

const frameworkReasons: Record<ProgrammeFrameworkSuitability, string> = {
  best: "Strong fit for this goal and weekly session budget.",
  recommended: "Good fit when it matches your schedule and preferences.",
  advanced: "Can work, but it needs more coaching precision and consistency.",
  not_recommended: "Available as an override, but ASC would usually choose a better structure.",
};

export function getAllowedProgrammeFrameworks(goal: ProgrammeFrameworkGoal): ProgrammeFrameworkId[] {
  if (goal === "hypertrophy" || goal === "get_lean") return [...hypertrophyFrameworks];
  if (goal === "strength" || goal === "athletic_performance" || goal === "build_muscle_strength") return [...strengthFrameworks];
  return assertNever(goal);
}

export function getFrameworkOptionsForGoal(goal: TrainingGoalId): ProgrammeFrameworkOption[] {
  const suitability = frameworkSuitabilityByGoal[goal];
  return frameworkOrder.map((id) => ({
    id,
    displayName: frameworkDisplay[id].displayName,
    suitability: suitability[id],
    shortDescription: frameworkDisplay[id].shortDescription,
    coachingReason: id === "asc_recommended" ? "Default: let ASC choose the best framework from the available evidence." : frameworkReasons[suitability[id]],
    isDefaultRecommendation: id === "asc_recommended",
  }));
}

/** Options that may create an active programme. Informational `not_recommended`
 * entries remain available through `getFrameworkOptionsForGoal`, but are not
 * executable onboarding choices. */
export function getSelectableFrameworkOptionsForGoal(goal: TrainingGoalId): ProgrammeFrameworkOption[] {
  return getFrameworkOptionsForGoal(goal).filter((option) => option.suitability !== "not_recommended");
}

export type CanonicalFrameworkResolution = Readonly<{
  status: "resolved";
  goal: ProgrammeFrameworkGoal;
  requested: PreferredSplit;
  framework: ProgrammeFrameworkId;
  reason: "explicit_supported_preference" | "asc_recommended_for_frequency" | "phase_specific_morph";
}> | Readonly<{
  status: "unsupported";
  reason: "unsupported_goal" | "unsupported_framework" | "unsupported_frequency";
}>;

/** Resolves a user preference into an executable framework. The caller retains
 * `requested`; the resolved framework is Microcycle-owned and may morph at an
 * authorised phase boundary. */
export function resolveCanonicalProgrammeFramework(input: Readonly<{
  goal: TrainingSetupGoal;
  sessionsPerWeek: number;
  requested: PreferredSplit;
  phase?: string;
}>): CanonicalFrameworkResolution {
  if (!Number.isInteger(input.sessionsPerWeek) || input.sessionsPerWeek < 2 || input.sessionsPerWeek > 6) {
    return { status: "unsupported", reason: "unsupported_frequency" };
  }
  const goal = frameworkGoalForSetupGoal(input.goal);
  if (!goal) return { status: "unsupported", reason: "unsupported_goal" };
  const phaseFramework = phaseSpecificFramework(goal, input.phase, input.sessionsPerWeek);
  if (phaseFramework) return { status: "resolved", goal, requested: input.requested, framework: phaseFramework, reason: "phase_specific_morph" };
  if (input.requested === "let_app_choose") {
    return { status: "resolved", goal, requested: input.requested, framework: recommendedFramework(goal, input.sessionsPerWeek), reason: "asc_recommended_for_frequency" };
  }
  const framework = executableFramework(input.requested);
  if (!framework || !getAllowedProgrammeFrameworks(goal).includes(framework)) return { status: "unsupported", reason: "unsupported_framework" };
  return { status: "resolved", goal, requested: input.requested, framework, reason: "explicit_supported_preference" };
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

function executableFramework(split: PreferredSplit): ProgrammeFrameworkId | null {
  if (split === "body_part_split") return "chest_back_shoulders_arms_legs";
  if (split === "push_pull_legs" || split === "upper_lower" || split === "full_body" || split === "bench_squat_deadlift") return split;
  return null;
}

function recommendedFramework(goal: ProgrammeFrameworkGoal, frequency: number): ProgrammeFrameworkId {
  if (goal === "athletic_performance") return frequency <= 3 ? "full_body" : "upper_lower";
  if (goal === "strength") return frequency <= 2 ? "full_body" : "bench_squat_deadlift";
  if (goal === "build_muscle_strength") return frequency <= 3 ? "full_body" : frequency === 4 ? "upper_lower" : "bench_squat_deadlift";
  if (frequency <= 3) return "full_body";
  if (frequency === 4) return "upper_lower";
  return "push_pull_legs";
}

function phaseSpecificFramework(goal: ProgrammeFrameworkGoal, phase: string | undefined, frequency: number): ProgrammeFrameworkId | null {
  if (!phase) return null;
  const strengthSpecific = /specific|intensification|realisation|taper/.test(phase);
  if ((goal === "strength" || goal === "build_muscle_strength") && strengthSpecific) return frequency === 2 ? "full_body" : "bench_squat_deadlift";
  if (goal === "build_muscle_strength" && /powerbuilding_(strength|intensification|realisation)/.test(phase) && frequency >= 3) return "bench_squat_deadlift";
  if (goal === "athletic_performance" && /power|pre_competition/.test(phase)) return "full_body";
  return null;
}

export function buildWeeklySessionSequence({
  goal,
  framework,
  sessionsPerWeek,
}: BuildWeeklySessionSequenceInput): ProgrammeFrameworkSessionType[] {
  if (!Number.isInteger(sessionsPerWeek) || sessionsPerWeek < 2 || sessionsPerWeek > 6) {
    throw new Error("Programme framework supports 2-6 sessions per week.");
  }

  const allowed = getAllowedProgrammeFrameworks(goal);
  if (!allowed.includes(framework)) {
    throw new Error(`Framework ${framework} is not supported for goal ${goal}.`);
  }

  const sequence = frameworkSequences[framework][sessionsPerWeek];
  if (!sequence) {
    throw new Error(`No session sequence exists for ${framework} at ${sessionsPerWeek} sessions per week.`);
  }

  return [...sequence];
}

function assertNever(value: never): never {
  throw new Error(`Unsupported programme framework goal: ${value}`);
}
