import type { CanonicalStimulusRegion, Equipment, ExerciseRole, ExperienceLevel, MovementPattern, MuscleGroup } from "@/domain/training/models";
import type { ProgrammeFrameworkSessionType } from "@/domain/training/programme-framework-rules";

export const canonicalMicrocycleVolumePolicy = {
  policyId: "canonical_microcycle_volume_policy_v2",
  accountingConvention: "A working set counts once for every explicitly programmed direct stimulus region it meaningfully trains; it is not divided into fractional set-equivalents. Meaningful secondary stimulus and fatigue are reported separately and are not added to direct volume. These categories are guardrails, not claims of physiological precision.",
  durationConvention: "The construction estimate reserves eight minutes of session overhead and three minutes per working set; it is a feasibility bound, not a promise of elapsed workout time.",
  fatigueConvention: "The planning index weights primary, secondary and accessory sets 3/2/1 only to detect concentration and overlap. Exercise-level output retains the catalogue's factual high/moderate/low fatigue class.",
  sourceReferences: [
    "docs/evidence-based-prescription-model.md#weekly-volume-targets",
    "docs/evidence-based-prescription-model.md#session-volume-targets",
    "src/domain/training/productive-set-targets.ts#targetTable",
    "src/domain/training/volume-landmarks.ts#getStartingVolumeLandmarks",
  ],
} as const;

export type CanonicalMicrocycleAllocationProfile = "powerbuilding_five_day_v1" | "goal_phase_frequency_v1";
export type AllocatedSlot = Readonly<{
  sessionIndex: number;
  sessionRole: string;
  order: number;
  exerciseRole: ExerciseRole;
  constructionRole: "primary" | "secondary" | "accessory";
  muscles: readonly MuscleGroup[];
  requiredStimuli: readonly CanonicalStimulusRegion[];
  purpose: string;
  movementPatterns: readonly MovementPattern[];
  primaryLift?: "bench" | "squat" | "deadlift";
  liftExposure?: "primary" | "secondary_variation";
  specialistsPermitted?: boolean;
  repeatPolicy: "stable_primary_practice" | "variation_preferred" | "repeat_if_no_equivalent";
  preferredHypertrophyBias?: "lengthened" | "neutral" | "shortened";
  baseWorkingSets?: number;
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
  sessionTypes?: readonly ProgrammeFrameworkSessionType[];
}>;
export type CanonicalMicrocycleVolumeAllocation = Readonly<{
  schemaVersion: "canonical_microcycle_volume_allocation_v1";
  policyId: typeof canonicalMicrocycleVolumePolicy.policyId;
  profile: CanonicalMicrocycleAllocationProfile;
  experience: ExperienceLevel;
  recoveryRestricted: boolean;
  slots: readonly AllocatedSlot[];
  directSetTargets: Readonly<Partial<Record<CanonicalStimulusRegion, Readonly<{ min: number; max: number }>>>>;
  directSets: Readonly<Partial<Record<CanonicalStimulusRegion, number>>>;
  indirectContributions: Readonly<{ convention: "certified_from_selected_exercise_metadata"; sets: Readonly<Record<string, never>> }>;
  movementPatternExposures: Readonly<Record<string, number>>;
  primaryLiftExposures: Readonly<Record<"bench" | "squat" | "deadlift", Readonly<{ primary: number; secondaryVariation: number }>>>;
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
    slot("primary_compound", "primary", ["chest"], ["chest"], "bench competition-pattern practice", ["horizontal_push"], { primaryLift: "bench", liftExposure: "primary", repeatPolicy: "stable_primary_practice", baseWorkingSets: 4 }),
    slot("secondary_compound", "secondary", ["chest"], ["chest"], "complementary chest hypertrophy", ["horizontal_push"], { repeatPolicy: "variation_preferred", preferredHypertrophyBias: "lengthened" }),
    slot("isolation", "accessory", ["shoulders"], ["lateral_delts"], "lateral-delt work not supplied by pressing", ["isolation"], { repeatPolicy: "variation_preferred" }),
    slot("isolation", "accessory", ["triceps"], ["triceps"], "triceps support", ["isolation"], { repeatPolicy: "variation_preferred" }),
  ],
  "Squat and hypertrophy": [
    slot("primary_compound", "primary", ["quads"], ["quadriceps"], "squat competition-pattern practice", ["squat"], { primaryLift: "squat", liftExposure: "primary", repeatPolicy: "stable_primary_practice", baseWorkingSets: 4 }),
    slot("secondary_compound", "secondary", ["quads"], ["quadriceps"], "stable low-complexity quadriceps hypertrophy", ["squat", "lunge"], { repeatPolicy: "variation_preferred" }),
    slot("isolation", "accessory", ["hamstrings"], ["hamstrings_knee_flexion"], "knee-flexion hamstring work", ["isolation"], { repeatPolicy: "variation_preferred" }),
    slot("isolation", "accessory", ["calves"], ["calves"], "calf work", ["isolation"], { repeatPolicy: "variation_preferred" }),
  ],
  "Deadlift and back": [
    slot("primary_compound", "primary", ["hamstrings", "glutes"], ["hip_extension"], "deadlift competition-pattern practice", ["hinge"], { primaryLift: "deadlift", liftExposure: "primary", repeatPolicy: "stable_primary_practice", baseWorkingSets: 3 }),
    slot("secondary_compound", "secondary", ["back"], ["upper_back"], "horizontal-pull upper-back work", ["horizontal_pull"], { repeatPolicy: "variation_preferred" }),
    slot("secondary_compound", "secondary", ["back"], ["lats"], "true vertical-pull lat work", ["vertical_pull"], { minimumSets: 3, repeatPolicy: "variation_preferred" }),
    slot("isolation", "accessory", ["biceps"], ["biceps"], "elbow-flexor support", ["isolation"], { repeatPolicy: "variation_preferred" }),
  ],
  "Upper support": [
    slot("secondary_compound", "secondary", ["chest"], ["chest"], "bench-family secondary variation exposure", ["horizontal_push"], { primaryLift: "bench", liftExposure: "secondary_variation", repeatPolicy: "variation_preferred" }),
    slot("secondary_compound", "secondary", ["back"], ["upper_back"], "complementary horizontal-pull exposure", ["horizontal_pull"], { repeatPolicy: "variation_preferred" }),
    slot("isolation", "accessory", ["rear_delts"], ["rear_delts"], "rear-delt/scapular work", ["isolation"], { repeatPolicy: "variation_preferred" }),
    slot("isolation", "accessory", ["shoulders"], ["lateral_delts"], "second lateral-delt exposure", ["isolation"], { repeatPolicy: "variation_preferred" }),
    slot("isolation", "accessory", ["triceps"], ["triceps"], "triceps volume", ["isolation"], { repeatPolicy: "variation_preferred" }),
    slot("isolation", "accessory", ["biceps"], ["biceps"], "biceps volume", ["isolation"], { repeatPolicy: "variation_preferred" }),
  ],
  "Lower support": [
    slot("secondary_compound", "secondary", ["quads"], ["quadriceps"], "second knee-dominant hypertrophy exposure", ["squat", "lunge"], { repeatPolicy: "variation_preferred" }),
    slot("isolation", "accessory", ["hamstrings"], ["hamstrings_knee_flexion"], "second knee-flexion hamstring exposure", ["isolation"], { repeatPolicy: "variation_preferred" }),
    slot("secondary_compound", "secondary", ["glutes"], ["hip_extension"], "hip-thrust hip-extension work distinct from a hinge", ["hip_thrust"], { minimumSets: 3, repeatPolicy: "variation_preferred" }),
    slot("isolation", "accessory", ["calves"], ["calves"], "second calf exposure", ["isolation"], { repeatPolicy: "variation_preferred" }),
    slot("accessory", "accessory", ["abs"], ["core"], "trunk work", ["core"], { repeatPolicy: "repeat_if_no_equivalent" }),
  ],
};

export function allocateCanonicalMicrocycleVolume(input: CanonicalMicrocycleVolumeAllocationInput): CanonicalMicrocycleVolumeAllocation {
  const profile = isExactFiveDayProfile(input.sessionRoles) ? "powerbuilding_five_day_v1" : "goal_phase_frequency_v1";
  const slots: AllocatedSlot[] = [];
  for (const [sessionIndex, sessionRole] of input.sessionRoles.entries()) {
    const contract = profile === "powerbuilding_five_day_v1" ? fiveDayPurpose[sessionRole as (typeof requiredFiveDayRoles)[number]] : canonicalContract(input, input.sessionTypes?.[sessionIndex] ?? inferSessionType(sessionRole), sessionIndex);
    contract.forEach((entry, order) => slots.push({
      ...entry,
      sessionIndex,
      sessionRole,
      order,
      workingSets: Math.max(entry.minimumSets ?? 1, setsFor(input.experience, entry.constructionRole, input.mesocycleId, input.recoveryRestricted, input.frequency, entry.baseWorkingSets, profile === "powerbuilding_five_day_v1")),
    }));
  }

  const directSets: Partial<Record<CanonicalStimulusRegion, number>> = {};
  const movementPatternExposures: Record<string, number> = {};
  for (const allocated of slots) {
    for (const region of allocated.requiredStimuli) directSets[region] = (directSets[region] ?? 0) + allocated.workingSets;
    for (const pattern of allocated.movementPatterns) movementPatternExposures[pattern] = (movementPatternExposures[pattern] ?? 0) + 1;
  }
  const sessionWorkingSets = input.sessionRoles.map((_, index) => slots.filter((entry) => entry.sessionIndex === index).reduce((sum, entry) => sum + entry.workingSets, 0));
  const estimatedSessionMinutes = sessionWorkingSets.map((sets) => 8 + sets * 3);
  const perSessionFatigue = input.sessionRoles.map((_, index) => slots.filter((entry) => entry.sessionIndex === index).reduce((sum, entry) => sum + entry.workingSets * fatigueWeight(entry.constructionRole), 0));
  const primaryLiftExposures = Object.fromEntries((["bench", "squat", "deadlift"] as const).map((lift) => [lift, {
    primary: slots.filter((entry) => entry.primaryLift === lift && entry.liftExposure === "primary").length,
    secondaryVariation: slots.filter((entry) => entry.primaryLift === lift && entry.liftExposure === "secondary_variation").length,
  }])) as CanonicalMicrocycleVolumeAllocation["primaryLiftExposures"];
  const directSetTargets = profile === "powerbuilding_five_day_v1"
    ? Object.fromEntries((["chest", "lats", "upper_back", "lateral_delts", "rear_delts", "triceps", "biceps", "quadriceps", "hamstrings_knee_flexion", "hip_extension", "calves", "core"] as CanonicalStimulusRegion[]).map((region) => [region, weeklyBounds(input.experience, region)]))
    : Object.fromEntries(Object.entries(directSets).map(([region, sets]) => [region, { min: Math.max(1, Number(sets) - Math.max(1, Math.floor(Number(sets) * 0.2))), max: Number(sets) + Math.max(2, Math.ceil(Number(sets) * 0.35)) }]));
  const checks = certify(input, profile, slots, directSets, sessionWorkingSets, estimatedSessionMinutes, primaryLiftExposures);
  return {
    schemaVersion: "canonical_microcycle_volume_allocation_v1",
    policyId: canonicalMicrocycleVolumePolicy.policyId,
    profile,
    experience: input.experience,
    recoveryRestricted: input.recoveryRestricted,
    slots,
    directSetTargets,
    directSets,
    indirectContributions: { convention: "certified_from_selected_exercise_metadata", sets: {} },
    movementPatternExposures,
    primaryLiftExposures,
    totalWorkingSets: sessionWorkingSets.reduce((sum, sets) => sum + sets, 0),
    sessionWorkingSets,
    estimatedSessionMinutes,
    fatigue: { perSession: perSessionFatigue, weeklyUnits: perSessionFatigue.reduce((sum, units) => sum + units, 0), overlapFlags: detectCanonicalMicrocycleOverlap(slots) },
    certification: { status: checks.failures.length ? "failed" : "passed", checks: checks.passed, failures: checks.failures },
  };
}

export function isStrictCanonicalAllocation(allocation: CanonicalMicrocycleVolumeAllocation | undefined): boolean {
  return Boolean(allocation);
}

type SlotOptions = Readonly<Partial<Pick<SlotContract, "minimumSets" | "primaryLift" | "liftExposure" | "specialistsPermitted" | "repeatPolicy" | "baseWorkingSets" | "preferredHypertrophyBias">>>;
function slot(exerciseRole: ExerciseRole, constructionRole: SlotContract["constructionRole"], muscles: readonly MuscleGroup[], requiredStimuli: readonly CanonicalStimulusRegion[], purpose: string, movementPatterns: readonly MovementPattern[], options: SlotOptions = {}): SlotContract {
  return { exerciseRole, constructionRole, muscles, requiredStimuli, purpose, movementPatterns, repeatPolicy: options.repeatPolicy ?? "repeat_if_no_equivalent", ...options };
}

function setsFor(experience: ExperienceLevel, role: AllocatedSlot["constructionRole"], mesocycleId: string, restricted: boolean, frequency: number, baseOverride?: number, preserveCertifiedProfile = false): number {
  const powerbuilding = mesocycleId.startsWith("powerbuilding_");
  const athletic = mesocycleId.startsWith("athletic_");
  const base = baseOverride ?? (role === "primary" ? (powerbuilding ? 4 : 3) : role === "secondary" ? (powerbuilding ? 3 : 2) : athletic ? 1 : 2);
  const experienced = preserveCertifiedProfile && experience !== "beginner"
    ? base
    : experience === "beginner"
    ? Math.max(2, base - 1)
    : experience === "advanced" && baseOverride === undefined && role === "primary"
      ? Math.min(5, base + 1)
      : base;
  // The certified five-day powerbuilding profile owns explicit per-slot
  // dosage. Frequency distribution applies only to the general contracts;
  // changing it would silently rewrite the already-certified prescription.
  const distributed = preserveCertifiedProfile
    ? experienced
    : frequency === 6 && role !== "primary"
      ? Math.max(1, experienced - 1)
      : experienced;
  return restricted ? Math.max(1, distributed - 1) : distributed;
}

function canonicalContract(input: CanonicalMicrocycleVolumeAllocationInput, type: ProgrammeFrameworkSessionType, index: number): readonly SlotContract[] {
  if (input.macrocycleGoal === "athletic_performance") return athleticContract(input, index);
  const barbellDominant = input.equipment.includes("barbell") && !input.equipment.some((item) => item === "dumbbell" || item === "machine" || item === "cable" || item === "smith");
  const contract = type === "push" ? pushContract((input.macrocycleGoal === "build_strength" && input.experience !== "beginner") || barbellDominant)
    : type === "pull" ? pullContract(input.experience === "beginner")
    : type === "legs" || type === "lower" || type === "lower_strength" ? lowerContract(false)
    : type === "squat" ? lowerContract(true)
    : type === "bench" ? benchContract()
    : type === "deadlift" ? deadliftContract()
    : type === "upper" || type === "upper_strength" ? upperContract(type === "upper_strength", barbellDominant)
    : type === "full_body" || type === "full_body_strength" ? fullBodyContract(index, type === "full_body_strength" || input.mesocycleId.startsWith("strength_") || input.mesocycleId.startsWith("powerbuilding_"), barbellDominant)
    : type === "chest_back" ? chestBackContract(input.experience === "beginner")
    : type === "shoulders_arms" ? shouldersArmsContract()
    : type === "chest" ? chestContract()
    : type === "back" ? backContract(input.experience === "beginner")
    : type === "shoulders" ? shouldersContract()
    : type === "arms" ? armsContract()
    : fullBodyContract(index, false);
  return adaptOptionalStimulusToEquipment(contract, input.equipment);
}

/** Optional local-muscle slots must reflect actual equipment capability. This
 * never replaces a required movement-pattern anchor: it only omits direct
 * lateral/rear-delt isolation when the athlete has no implement that can
 * deliver the canonical stimulus. */
function adaptOptionalStimulusToEquipment(contract: readonly SlotContract[], equipment: readonly Equipment[]): readonly SlotContract[] {
  const supportsDeltIsolation = equipment.some((item) => item === "dumbbell" || item === "machine" || item === "cable" || item === "smith");
  return supportsDeltIsolation ? contract : contract.filter((entry) => !entry.requiredStimuli.some((region) => region === "lateral_delts" || region === "rear_delts"));
}

function pushContract(strengthSpecific = false): readonly SlotContract[] { return [
  slot(strengthSpecific ? "primary_compound" : "secondary_compound", "primary", ["chest"], ["chest"], "primary horizontal press", ["horizontal_push"], { repeatPolicy: "stable_primary_practice" }),
  slot("secondary_compound", "secondary", ["chest", "shoulders"], ["chest"], "secondary press stimulus", ["horizontal_push", "vertical_push"], { repeatPolicy: "variation_preferred" }),
  slot("isolation", "accessory", ["shoulders"], ["lateral_delts"], "lateral-delt stimulus", ["isolation"], { repeatPolicy: "variation_preferred" }),
  slot("isolation", "accessory", ["triceps"], ["triceps"], "elbow-extension support", ["isolation"], { repeatPolicy: "variation_preferred" }),
]; }

function pullContract(beginnerStable = false): readonly SlotContract[] { return [
  slot(beginnerStable ? "secondary_compound" : "primary_compound", "primary", ["back"], ["upper_back"], "primary horizontal pull", ["horizontal_pull"], { repeatPolicy: "stable_primary_practice" }),
  slot("secondary_compound", "secondary", ["back"], ["lats"], "vertical-pull lat stimulus", ["vertical_pull"], { repeatPolicy: "variation_preferred" }),
  slot("secondary_compound", "secondary", ["hamstrings", "glutes"], ["hip_extension"], "hinge support", ["hinge", "hip_thrust"], { repeatPolicy: "variation_preferred" }),
  slot("isolation", "accessory", ["biceps"], ["biceps"], "elbow-flexor support", ["isolation"], { repeatPolicy: "variation_preferred" }),
]; }

function lowerContract(squatSpecific: boolean): readonly SlotContract[] { return [
  slot(squatSpecific ? "primary_compound" : "secondary_compound", "primary", ["quads"], ["quadriceps"], squatSpecific ? "squat-specific anchor" : "knee-dominant anchor", ["squat", "lunge"], squatSpecific ? { primaryLift: "squat", liftExposure: "primary", repeatPolicy: "stable_primary_practice" } : { repeatPolicy: "stable_primary_practice" }),
  slot("secondary_compound", "secondary", ["hamstrings", "glutes"], ["hip_extension"], "hip-extension support", ["hinge", "hip_thrust"], { repeatPolicy: "variation_preferred" }),
  slot("isolation", "accessory", ["hamstrings"], ["hamstrings_knee_flexion"], "knee-flexion hamstring work", ["isolation"], { repeatPolicy: "variation_preferred" }),
  slot("isolation", "accessory", ["calves"], ["calves"], "calf work", ["isolation"], { repeatPolicy: "variation_preferred" }),
]; }

function upperContract(strength: boolean, primaryOnlyEquipment = false): readonly SlotContract[] { return [
  slot(strength || primaryOnlyEquipment ? "primary_compound" : "secondary_compound", "primary", ["chest"], ["chest"], strength ? "upper strength press" : "upper chest anchor", ["horizontal_push"], strength ? { primaryLift: "bench", liftExposure: "primary", repeatPolicy: "stable_primary_practice" } : { repeatPolicy: "stable_primary_practice" }),
  slot("secondary_compound", "secondary", ["back"], ["upper_back"], "horizontal pulling support", ["horizontal_pull"], { repeatPolicy: "variation_preferred" }),
  slot("secondary_compound", "secondary", ["back"], ["lats"], "vertical pulling support", ["vertical_pull"], { repeatPolicy: "variation_preferred" }),
  slot("isolation", "accessory", ["shoulders"], ["lateral_delts"], "lateral-delt support", ["isolation"], { repeatPolicy: "variation_preferred" }),
  slot("isolation", "accessory", ["triceps"], ["triceps"], "triceps support", ["isolation"], { repeatPolicy: "variation_preferred" }),
  slot("isolation", "accessory", ["biceps"], ["biceps"], "biceps support", ["isolation"], { repeatPolicy: "variation_preferred" }),
]; }

function fullBodyContract(index: number, strength: boolean, primaryOnlyEquipment = false): readonly SlotContract[] {
  const squatDay = index % 2 === 0;
  return [
    slot("primary_compound", "primary", [squatDay ? "quads" : "hamstrings", "glutes"], [squatDay ? "quadriceps" : "hip_extension"], squatDay ? "full-body knee-dominant anchor" : "full-body hinge anchor", squatDay ? ["squat", "lunge"] : ["hinge"], strength ? { primaryLift: squatDay ? "squat" : "deadlift", liftExposure: "primary", repeatPolicy: "stable_primary_practice" } : { repeatPolicy: "variation_preferred" }),
    slot(primaryOnlyEquipment ? "primary_compound" : "secondary_compound", "secondary", ["chest"], ["chest"], "full-body press", ["horizontal_push"], { repeatPolicy: "variation_preferred" }),
    slot("secondary_compound", "secondary", ["back"], [index % 2 === 0 ? "upper_back" : "lats"], "full-body pull", index % 2 === 0 ? ["horizontal_pull"] : ["vertical_pull"], { repeatPolicy: "variation_preferred" }),
    slot("secondary_compound", "secondary", [squatDay ? "hamstrings" : "quads"], [squatDay ? "hip_extension" : "quadriceps"], "complementary lower pattern", squatDay ? ["hinge", "hip_thrust"] : ["squat", "lunge"], { repeatPolicy: "variation_preferred" }),
    slot("accessory", "accessory", ["abs"], ["core"], "trunk support", ["core", "carry"], { repeatPolicy: "repeat_if_no_equivalent" }),
  ];
}

function benchContract(): readonly SlotContract[] { return [
  slot("primary_compound", "primary", ["chest"], ["chest"], "bench-specific anchor", ["horizontal_push"], { primaryLift: "bench", liftExposure: "primary", repeatPolicy: "stable_primary_practice" }),
  slot("secondary_compound", "secondary", ["back"], ["upper_back"], "bench-support row", ["horizontal_pull"], { repeatPolicy: "variation_preferred" }),
  slot("isolation", "accessory", ["triceps"], ["triceps"], "bench triceps support", ["isolation"], { repeatPolicy: "variation_preferred" }),
]; }

function deadliftContract(): readonly SlotContract[] { return [
  slot("primary_compound", "primary", ["hamstrings", "glutes"], ["hip_extension"], "deadlift-specific anchor", ["hinge"], { primaryLift: "deadlift", liftExposure: "primary", repeatPolicy: "stable_primary_practice" }),
  slot("secondary_compound", "secondary", ["back"], ["lats"], "deadlift back support", ["vertical_pull"], { repeatPolicy: "variation_preferred" }),
  slot("isolation", "accessory", ["hamstrings"], ["hamstrings_knee_flexion"], "deadlift hamstring support", ["isolation"], { repeatPolicy: "variation_preferred" }),
]; }

function chestBackContract(beginnerStable = false): readonly SlotContract[] { return [...chestContract().slice(0, 2), ...backContract(beginnerStable).slice(0, 2)]; }
function shouldersArmsContract(): readonly SlotContract[] { return [...shouldersContract().slice(1), ...armsContract().slice(0, 2)]; }
function chestContract(): readonly SlotContract[] { return [...pushContract().slice(0, 2), ...pushContract().slice(2)]; }
function backContract(beginnerStable = false): readonly SlotContract[] { return [pullContract(beginnerStable)[0]!, pullContract(beginnerStable)[1]!, slot("isolation", "accessory", ["rear_delts"], ["rear_delts"], "rear-delt support", ["isolation"], { repeatPolicy: "variation_preferred" }), pullContract(beginnerStable)[3]!]; }
function shouldersContract(): readonly SlotContract[] { return [slot("secondary_compound", "primary", ["shoulders"], ["anterior_delts"], "shoulder press anchor", ["vertical_push"], { repeatPolicy: "stable_primary_practice" }), slot("isolation", "secondary", ["shoulders"], ["lateral_delts"], "lateral-delt work", ["isolation"], { repeatPolicy: "variation_preferred" }), slot("isolation", "accessory", ["rear_delts"], ["rear_delts"], "rear-delt work", ["isolation"], { repeatPolicy: "variation_preferred" }), slot("isolation", "accessory", ["triceps"], ["triceps"], "triceps support", ["isolation"], { repeatPolicy: "variation_preferred" })]; }
function armsContract(): readonly SlotContract[] { return [slot("isolation", "secondary", ["triceps"], ["triceps"], "primary triceps work", ["isolation"], { repeatPolicy: "variation_preferred" }), slot("isolation", "secondary", ["biceps"], ["biceps"], "primary biceps work", ["isolation"], { repeatPolicy: "variation_preferred" }), slot("isolation", "accessory", ["triceps"], ["triceps"], "second triceps angle", ["isolation"], { repeatPolicy: "variation_preferred" }), slot("isolation", "accessory", ["biceps"], ["biceps"], "second biceps angle", ["isolation"], { repeatPolicy: "variation_preferred" })]; }

function athleticContract(input: CanonicalMicrocycleVolumeAllocationInput, index: number): readonly SlotContract[] {
  const limitedToMachines = input.equipment.every((item) => item === "machine" || item === "cable");
  const limitedToDumbbells = input.equipment.every((item) => item === "dumbbell" || item === "bodyweight");
  const support = limitedToMachines
    ? athleticLimitedSupport(index, "machine")
    : limitedToDumbbells
      ? athleticLimitedSupport(index, "dumbbell")
      : fullBodyContract(index, true);
  const trunkSupport = slot("accessory", "accessory", ["abs"], ["core"], "low-cost trunk and movement support", ["core", "carry"], { repeatPolicy: "repeat_if_no_equivalent", baseWorkingSets: 2 });
  if (input.mesocycleId === "athletic_power") return [
    slot("power", "primary", [index % 2 === 0 ? "quads" : "shoulders"], [index % 2 === 0 ? "quadriceps" : "anterior_delts"], "high-quality power exposure", index % 2 === 0 ? ["squat"] : ["horizontal_push", "vertical_push"], { specialistsPermitted: true, repeatPolicy: "variation_preferred", baseWorkingSets: 3 }),
    ...support.slice(1, 3),
    trunkSupport,
  ];
  // General and force phases retain full-body movement-pattern strength and
  // trunk capacity. They do not masquerade as a body-part hypertrophy split,
  // and they avoid emitting low-rep power prescriptions before that phase owns
  // the target envelope.
  return support.some((entry) => entry.requiredStimuli.includes("core")) ? support : [...support, trunkSupport];
}

function athleticLimitedSupport(index: number, mode: "machine" | "dumbbell"): readonly SlotContract[] {
  const squatDay = index % 2 === 0;
  const lowerAnchor = squatDay
    ? slot("secondary_compound", "primary", ["quads", "glutes"], ["quadriceps"], "stable limited-equipment knee-dominant anchor", ["squat", "lunge"], { repeatPolicy: "variation_preferred" })
    : mode === "machine"
      ? slot("secondary_compound", "primary", ["hamstrings", "glutes"], ["hip_extension"], "stable machine hip-extension anchor", ["hip_thrust"], { repeatPolicy: "variation_preferred" })
      : slot("primary_compound", "primary", ["hamstrings", "glutes"], ["hip_extension"], "stable dumbbell hinge anchor", ["hinge"], { repeatPolicy: "variation_preferred" });
  return [
    lowerAnchor,
    slot("secondary_compound", "secondary", ["chest"], ["chest"], "full-body press support", ["horizontal_push"], { repeatPolicy: "variation_preferred" }),
    slot("secondary_compound", "secondary", ["back"], [index % 2 === 0 ? "upper_back" : "lats"], "full-body pull support", index % 2 === 0 ? ["horizontal_pull"] : ["vertical_pull"], { repeatPolicy: "variation_preferred" }),
  ];
}

function inferSessionType(role: string): ProgrammeFrameworkSessionType {
  const value = role.toLowerCase();
  if (value.includes("bench")) return "bench";
  if (value.includes("squat")) return "squat";
  if (value.includes("deadlift")) return "deadlift";
  if (value.includes("full body")) return "full_body";
  if (value.includes("upper")) return value.includes("strength") ? "upper_strength" : "upper";
  if (value.includes("lower")) return value.includes("strength") ? "lower_strength" : "lower";
  if (value.includes("push")) return "push";
  if (value.includes("pull") || value.includes("back")) return "pull";
  if (value.includes("leg")) return "legs";
  return "full_body";
}

function certify(input: CanonicalMicrocycleVolumeAllocationInput, profile: CanonicalMicrocycleAllocationProfile, slots: readonly AllocatedSlot[], direct: Partial<Record<CanonicalStimulusRegion, number>>, sessionSets: readonly number[], durations: readonly number[], lifts: CanonicalMicrocycleVolumeAllocation["primaryLiftExposures"]): { passed: string[]; failures: string[] } {
  const failures: string[] = [];
  const passed: string[] = [];
  check(slots.length > 0 && slots.every((entry) => Number.isInteger(entry.workingSets) && entry.workingSets >= 1), "exact_working_sets_resolved", "invalid_set_allocation", passed, failures);
  check(sessionSets.every((sets) => sets >= 3 && sets <= 20), "session_volume_bounded", "session_volume_out_of_bounds", passed, failures);
  check(durations.every((minutes) => minutes > 0 && minutes <= 90), "session_duration_bounded", "session_duration_exceeded", passed, failures);
  check(slots.every((entry) => entry.muscles.length > 0 && entry.movementPatterns.length > 0), "slot_targets_resolved", "unresolved_slot_target", passed, failures);
  if (profile === "powerbuilding_five_day_v1") {
    check(lifts.bench.primary === 1 && lifts.bench.secondaryVariation >= 1, "bench_primary_and_secondary_exposures_present", "bench_exposure_missing", passed, failures);
    check(lifts.squat.primary === 1, "squat_primary_exposure_present", "squat_exposure_missing", passed, failures);
    check(lifts.deadlift.primary === 1 && lifts.deadlift.secondaryVariation === 0, "deadlift_fatigue_bounded_to_primary_exposure", "deadlift_exposure_invalid", passed, failures);
    check(detectCanonicalMicrocycleOverlap(slots).length === 0, "weekly_overlap_bounded", "excessive_primary_overlap", passed, failures);
    for (const region of ["chest", "lats", "upper_back", "lateral_delts", "rear_delts", "triceps", "biceps", "quadriceps", "hamstrings_knee_flexion", "hip_extension", "calves", "core"] as const) {
      const bounds = weeklyBounds(input.experience, region);
      check((direct[region] ?? 0) >= bounds.min && (direct[region] ?? 0) <= bounds.max, `${region}_volume_authorised`, `${region}_volume_out_of_bounds`, passed, failures);
    }
    check(input.frequency === 5, "frequency_matches_profile", "profile_frequency_mismatch", passed, failures);
  }
  return { passed, failures };
}

function weeklyBounds(experience: ExperienceLevel, region: CanonicalStimulusRegion): { min: number; max: number } {
  const minimums: Record<CanonicalStimulusRegion, number> = { chest: 6, lats: 3, upper_back: 5, anterior_delts: 0, lateral_delts: 3, rear_delts: 2, triceps: 4, biceps: 4, quadriceps: 6, hamstrings_knee_flexion: 4, hip_extension: 5, calves: 4, core: 2 };
  const baseMin = minimums[region];
  // Advanced status permits more complex/intensive work; it does not by itself
  // prove that more weekly sets are recoverable. Volume therefore retains the
  // intermediate floor until Progress evidence authorises a bounded change.
  const min = experience === "beginner" ? Math.max(region === "core" ? 1 : 2, baseMin - 1) : baseMin;
  return { min, max: min + (region === "core" || region.includes("delts") ? 6 : 10) };
}

export function detectCanonicalMicrocycleOverlap(slots: readonly AllocatedSlot[]): string[] {
  const flags: string[] = [];
  const highCostSessions = new Set(slots.filter((entry) => entry.constructionRole === "primary").map((entry) => entry.sessionIndex));
  if (highCostSessions.size > 3) flags.push("more_than_three_primary_sessions");
  for (const sessionIndex of new Set(slots.map((entry) => entry.sessionIndex))) {
    const local = slots.filter((entry) => entry.sessionIndex === sessionIndex);
    const quadricepsSets = local.filter((entry) => entry.requiredStimuli.includes("quadriceps")).reduce((sum, entry) => sum + entry.workingSets, 0);
    const hipExtensionSets = local.filter((entry) => entry.requiredStimuli.includes("hip_extension")).reduce((sum, entry) => sum + entry.workingSets, 0);
    if (quadricepsSets > 8) flags.push(`session_${sessionIndex}_excessive_knee_dominant_overlap`);
    if (hipExtensionSets > 8) flags.push(`session_${sessionIndex}_excessive_hip_extension_overlap`);
  }
  return flags;
}

function fatigueWeight(role: AllocatedSlot["constructionRole"]): number { return role === "primary" ? 3 : role === "secondary" ? 2 : 1; }
function isExactFiveDayProfile(roles: readonly string[]): boolean { return roles.length === requiredFiveDayRoles.length && roles.every((role, index) => role === requiredFiveDayRoles[index]); }
function check(condition: boolean, pass: string, failure: string, passed: string[], failures: string[]): void { (condition ? passed : failures).push(condition ? pass : failure); }
