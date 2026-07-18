import type { Equipment, ExerciseRole, ExperienceLevel, MovementPattern, MuscleGroup } from "@/domain/training/models";

export const canonicalMicrocycleVolumePolicy = {
  policyId: "canonical_microcycle_volume_policy_v1",
  accountingConvention: "A working set is divided equally between the explicitly allocated direct target muscles. Secondary exercise muscles are reported as non-quantified indirect contributions and never added to direct-set totals.",
  durationConvention: "The construction estimate reserves eight minutes of session overhead and three minutes per working set; it is a feasibility bound, not a promise of elapsed workout time.",
  fatigueConvention: "The planning index weights primary, secondary and accessory sets 3/2/1 only to detect concentration and overlap. Exercise-level output retains the catalogue's factual high/moderate/low fatigue class.",
  sourceReferences: [
    "docs/evidence-based-prescription-model.md#weekly-volume-targets",
    "docs/evidence-based-prescription-model.md#session-volume-targets",
    "src/domain/training/productive-set-targets.ts#targetTable",
    "src/domain/training/volume-landmarks.ts#getStartingVolumeLandmarks",
  ],
} as const;

export type CanonicalMicrocycleAllocationProfile = "powerbuilding_five_day_v1" | "generic_frequency_v1";
export type AllocatedSlot = Readonly<{
  sessionIndex: number;
  sessionRole: string;
  order: number;
  exerciseRole: ExerciseRole;
  constructionRole: "primary" | "secondary" | "accessory";
  muscles: readonly MuscleGroup[];
  purpose: string;
  movementPatterns: readonly MovementPattern[];
  primaryLift?: "bench" | "squat" | "deadlift";
  workingSets: number;
}>;
export type CanonicalMicrocycleVolumeAllocationInput = Readonly<{
  macrocycleGoal: string;
  mesocycleId: string;
  mesocyclePurpose: string;
  microcyclePriority: string;
  microcycleSequence: number;
  experience: ExperienceLevel;
  frequency: number;
  split: string;
  equipment: readonly Equipment[];
  recoveryRestricted: boolean;
  establishedLoadExerciseIds: readonly string[];
  sessionRoles: readonly string[];
}>;
export type CanonicalMicrocycleVolumeAllocation = Readonly<{
  schemaVersion: "canonical_microcycle_volume_allocation_v1";
  policyId: typeof canonicalMicrocycleVolumePolicy.policyId;
  profile: CanonicalMicrocycleAllocationProfile;
  experience: ExperienceLevel;
  slots: readonly AllocatedSlot[];
  directSetTargets: Readonly<Partial<Record<MuscleGroup, Readonly<{ min: number; max: number }>>>>;
  directSets: Readonly<Partial<Record<MuscleGroup, number>>>;
  indirectContributions: Readonly<{ convention: "not_quantified_without_explicit_policy"; sets: Readonly<Record<string, never>> }>;
  movementPatternExposures: Readonly<Record<string, number>>;
  primaryLiftExposures: Readonly<{ bench: number; squat: number; deadlift: number }>;
  totalWorkingSets: number;
  sessionWorkingSets: readonly number[];
  estimatedSessionMinutes: readonly number[];
  fatigue: Readonly<{ perSession: readonly number[]; weeklyUnits: number; overlapFlags: readonly string[] }>;
  certification: Readonly<{ status: "passed" | "failed"; checks: readonly string[]; failures: readonly string[] }>;
}>;

type SlotContract = Readonly<Omit<AllocatedSlot, "sessionIndex" | "sessionRole" | "order" | "workingSets"> & { minimumSets?: number }>;

const requiredFiveDayRoles = ["Bench and hypertrophy", "Squat and hypertrophy", "Deadlift and back", "Upper support", "Lower support"] as const;
const fiveDayPurpose: Readonly<Record<(typeof requiredFiveDayRoles)[number], readonly SlotContract[]>> = {
  "Bench and hypertrophy": [
    slot("primary_compound", "primary", ["chest"], "bench strength exposure", ["horizontal_push"], undefined, "bench"),
    slot("secondary_compound", "secondary", ["chest"], "chest hypertrophy", ["horizontal_push"]),
    slot("secondary_compound", "secondary", ["shoulders"], "shoulder support", ["vertical_push"]),
    slot("isolation", "accessory", ["triceps"], "triceps support", ["isolation"]),
  ],
  "Squat and hypertrophy": [
    slot("primary_compound", "primary", ["quads"], "squat strength exposure", ["squat"], undefined, "squat"),
    slot("secondary_compound", "secondary", ["quads", "glutes"], "quadriceps hypertrophy", ["squat"]),
    slot("accessory", "accessory", ["hamstrings"], "hamstring support", ["isolation"]),
    slot("isolation", "accessory", ["calves"], "calf work", ["isolation"]),
  ],
  "Deadlift and back": [
    slot("primary_compound", "primary", ["hamstrings", "glutes"], "deadlift/hinge exposure", ["hinge"], undefined, "deadlift"),
    slot("secondary_compound", "secondary", ["back"], "back thickness", ["horizontal_pull"]),
    slot("accessory", "accessory", ["back"], "lat volume", ["vertical_pull"], 3),
    slot("isolation", "accessory", ["biceps"], "elbow-flexor support", ["isolation"]),
  ],
  "Upper support": [
    slot("secondary_compound", "secondary", ["chest"], "second press exposure", ["horizontal_push"]),
    slot("secondary_compound", "secondary", ["back"], "second pull exposure", ["horizontal_pull"]),
    slot("isolation", "accessory", ["shoulders"], "side/rear delt work", ["isolation"]),
    slot("isolation", "accessory", ["triceps"], "triceps volume", ["isolation"]),
    slot("isolation", "accessory", ["biceps"], "biceps volume", ["isolation"]),
  ],
  "Lower support": [
    slot("secondary_compound", "secondary", ["quads"], "second knee-dominant exposure", ["squat"]),
    slot("accessory", "accessory", ["hamstrings"], "second hamstring exposure", ["isolation"]),
    slot("secondary_compound", "secondary", ["glutes"], "glute volume", ["hip_thrust"], 3),
    slot("isolation", "accessory", ["calves"], "calf volume", ["isolation"]),
    slot("accessory", "accessory", ["abs"], "trunk work", ["core"]),
  ],
};

export function allocateCanonicalMicrocycleVolume(input: CanonicalMicrocycleVolumeAllocationInput): CanonicalMicrocycleVolumeAllocation {
  const profile = isExactFiveDayProfile(input.sessionRoles) ? "powerbuilding_five_day_v1" : "generic_frequency_v1";
  const slots: AllocatedSlot[] = [];
  for (const [sessionIndex, sessionRole] of input.sessionRoles.entries()) {
    const contract = profile === "powerbuilding_five_day_v1" ? fiveDayPurpose[sessionRole as (typeof requiredFiveDayRoles)[number]] : genericContract(sessionRole);
    contract.forEach((entry, order) => slots.push({
      ...entry,
      sessionIndex,
      sessionRole,
      order,
      workingSets: Math.max(entry.minimumSets ?? 1, setsFor(input.experience, entry.constructionRole, input.mesocycleId, input.recoveryRestricted)),
    }));
  }

  const directSets: Partial<Record<MuscleGroup, number>> = {};
  const movementPatternExposures: Record<string, number> = {};
  for (const allocated of slots) {
    for (const muscle of allocated.muscles) directSets[muscle] = roundSet((directSets[muscle] ?? 0) + allocated.workingSets / allocated.muscles.length);
    for (const pattern of allocated.movementPatterns) movementPatternExposures[pattern] = (movementPatternExposures[pattern] ?? 0) + 1;
  }
  const sessionWorkingSets = input.sessionRoles.map((_, index) => slots.filter((entry) => entry.sessionIndex === index).reduce((sum, entry) => sum + entry.workingSets, 0));
  const estimatedSessionMinutes = sessionWorkingSets.map((sets) => 8 + sets * 3);
  const perSessionFatigue = input.sessionRoles.map((_, index) => slots.filter((entry) => entry.sessionIndex === index).reduce((sum, entry) => sum + entry.workingSets * fatigueWeight(entry.constructionRole), 0));
  const primaryLiftExposures = {
    bench: slots.filter((entry) => entry.purpose === "bench strength exposure").length,
    squat: slots.filter((entry) => entry.purpose === "squat strength exposure").length,
    deadlift: slots.filter((entry) => entry.purpose === "deadlift/hinge exposure").length,
  };
  const directSetTargets = profile === "powerbuilding_five_day_v1"
    ? Object.fromEntries((["chest", "back", "quads", "hamstrings", "glutes", "shoulders", "triceps", "biceps", "calves", "abs"] as MuscleGroup[]).map((muscle) => [muscle, weeklyBounds(input.experience, muscle)]))
    : {};
  const checks = certify(input, profile, slots, directSets, sessionWorkingSets, estimatedSessionMinutes, primaryLiftExposures);
  return {
    schemaVersion: "canonical_microcycle_volume_allocation_v1",
    policyId: canonicalMicrocycleVolumePolicy.policyId,
    profile,
    experience: input.experience,
    slots,
    directSetTargets,
    directSets,
    indirectContributions: { convention: "not_quantified_without_explicit_policy", sets: {} },
    movementPatternExposures,
    primaryLiftExposures,
    totalWorkingSets: sessionWorkingSets.reduce((sum, sets) => sum + sets, 0),
    sessionWorkingSets,
    estimatedSessionMinutes,
    fatigue: { perSession: perSessionFatigue, weeklyUnits: perSessionFatigue.reduce((sum, units) => sum + units, 0), overlapFlags: overlapFlags(slots) },
    certification: { status: checks.failures.length ? "failed" : "passed", checks: checks.passed, failures: checks.failures },
  };
}

export function isStrictCanonicalAllocation(allocation: CanonicalMicrocycleVolumeAllocation | undefined): boolean {
  return allocation?.profile === "powerbuilding_five_day_v1";
}

function slot(exerciseRole: ExerciseRole, constructionRole: SlotContract["constructionRole"], muscles: readonly MuscleGroup[], purpose: string, movementPatterns: readonly MovementPattern[], minimumSets?: number, primaryLift?: AllocatedSlot["primaryLift"]): SlotContract {
  return { exerciseRole, constructionRole, muscles, purpose, movementPatterns, minimumSets, primaryLift };
}

function setsFor(experience: ExperienceLevel, role: AllocatedSlot["constructionRole"], mesocycleId: string, restricted: boolean): number {
  const powerbuilding = mesocycleId.startsWith("powerbuilding_");
  const athletic = mesocycleId.startsWith("athletic_");
  const base = role === "primary" ? (powerbuilding ? 4 : 3) : role === "secondary" ? (powerbuilding ? 3 : 2) : athletic ? 1 : 2;
  const experienced = experience === "beginner" ? Math.max(2, base - 1) : experience === "advanced" ? Math.min(5, base + 1) : base;
  return restricted ? Math.max(1, experienced - 1) : experienced;
}

function genericContract(role: string): readonly SlotContract[] {
  const lower = /lower|squat|leg/i.test(role);
  const pull = /pull|deadlift|back/i.test(role);
  if (pull) return [slot("primary_compound", "primary", ["back"], "primary pull exposure", ["hinge", "horizontal_pull", "vertical_pull"]), slot("secondary_compound", "secondary", ["hamstrings"], "posterior support", ["hinge"]), slot("accessory", "accessory", ["biceps"], "pull accessory contribution", ["isolation"])];
  return [slot("primary_compound", "primary", [lower ? "quads" : "chest"], "primary exposure", lower ? ["squat", "lunge"] : ["horizontal_push", "vertical_push"]), slot("secondary_compound", "secondary", [lower ? "hamstrings" : "back"], "secondary exposure", lower ? ["hinge"] : ["horizontal_pull", "vertical_pull"]), slot("accessory", "accessory", [lower ? "glutes" : "shoulders"], "accessory contribution", lower ? ["hip_thrust"] : ["isolation"])];
}

function certify(input: CanonicalMicrocycleVolumeAllocationInput, profile: CanonicalMicrocycleAllocationProfile, slots: readonly AllocatedSlot[], direct: Partial<Record<MuscleGroup, number>>, sessionSets: readonly number[], durations: readonly number[], lifts: Readonly<{ bench: number; squat: number; deadlift: number }>): { passed: string[]; failures: string[] } {
  const failures: string[] = [];
  const passed: string[] = [];
  check(slots.length > 0 && slots.every((entry) => Number.isInteger(entry.workingSets) && entry.workingSets >= 1), "exact_working_sets_resolved", "invalid_set_allocation", passed, failures);
  check(sessionSets.every((sets) => sets >= 3 && sets <= 20), "session_volume_bounded", "session_volume_out_of_bounds", passed, failures);
  check(durations.every((minutes) => minutes > 0 && minutes <= 90), "session_duration_bounded", "session_duration_exceeded", passed, failures);
  check(slots.every((entry) => entry.muscles.length > 0 && entry.movementPatterns.length > 0), "slot_targets_resolved", "unresolved_slot_target", passed, failures);
  if (profile === "powerbuilding_five_day_v1") {
    check(lifts.bench === 1, "bench_exposure_present", "bench_exposure_missing", passed, failures);
    check(lifts.squat === 1, "squat_exposure_present", "squat_exposure_missing", passed, failures);
    check(lifts.deadlift === 1, "deadlift_exposure_present", "deadlift_exposure_missing", passed, failures);
    check(overlapFlags(slots).length === 0, "weekly_overlap_bounded", "excessive_primary_overlap", passed, failures);
    for (const muscle of ["chest", "back", "quads", "hamstrings", "glutes", "shoulders", "triceps", "biceps", "calves", "abs"] as const) {
      const bounds = weeklyBounds(input.experience, muscle);
      check((direct[muscle] ?? 0) >= bounds.min && (direct[muscle] ?? 0) <= bounds.max, `${muscle}_volume_authorised`, `${muscle}_volume_out_of_bounds`, passed, failures);
    }
    check(input.frequency === 5, "frequency_matches_profile", "profile_frequency_mismatch", passed, failures);
  }
  return { passed, failures };
}

function weeklyBounds(experience: ExperienceLevel, muscle: MuscleGroup): { min: number; max: number } {
  const core = muscle === "abs";
  const large = ["chest", "back", "quads", "hamstrings", "glutes"].includes(muscle);
  if (experience === "beginner") return core ? { min: 1, max: 4 } : large ? { min: 5, max: 10 } : { min: 3, max: 8 };
  if (experience === "advanced") return core ? { min: 2, max: 8 } : large ? { min: 8, max: 20 } : { min: 6, max: 16 };
  return core ? { min: 2, max: 6 } : large ? { min: 6, max: 16 } : { min: 4, max: 14 };
}

function overlapFlags(slots: readonly AllocatedSlot[]): string[] {
  const flags: string[] = [];
  const highCostSessions = new Set(slots.filter((entry) => entry.constructionRole === "primary").map((entry) => entry.sessionIndex));
  if (highCostSessions.size > 3) flags.push("more_than_three_primary_sessions");
  return flags;
}

function fatigueWeight(role: AllocatedSlot["constructionRole"]): number { return role === "primary" ? 3 : role === "secondary" ? 2 : 1; }
function roundSet(value: number): number { return Math.round(value * 10) / 10; }
function isExactFiveDayProfile(roles: readonly string[]): boolean { return roles.length === requiredFiveDayRoles.length && roles.every((role, index) => role === requiredFiveDayRoles[index]); }
function check(condition: boolean, pass: string, failure: string, passed: string[], failures: string[]): void { (condition ? passed : failures).push(condition ? pass : failure); }
