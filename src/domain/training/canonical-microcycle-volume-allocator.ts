import type { CanonicalStimulusRegion, Equipment, ExerciseRole, ExperienceLevel, MovementPattern, MuscleGroup } from "@/domain/training/models";
import type { ProgrammeFrameworkSessionType } from "@/domain/training/programme-framework-rules";
import { canonicalHypertrophyLandmark, canonicalHypertrophyVolumePolicy, resolveCanonicalHypertrophyStartingVolume, type CanonicalStartingVolumeContext } from "@/domain/training/canonical-hypertrophy-volume-policy";
import { normalizeCanonicalSessionDuration, resolveCanonicalSessionDuration, type CanonicalSessionDurationMinutes } from "@/domain/training/canonical-session-duration";

export const canonicalMicrocycleVolumePolicy = {
  policyId: "canonical_microcycle_volume_policy_v3",
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

export const canonicalExperiencePlanningPolicy = {
  policyId: "canonical_experience_planning_policy_v1",
  beginner: {
    customerGuidance: "Build skill with stable exercises, simple progression and recoverable starting volume.",
    planning: ["stable_core_patterns", "simpler_progression", "lower_starting_volume", "advanced_methods_restricted", "calibration_emphasised"],
  },
  intermediate: {
    customerGuidance: "Use purposeful variation and muscle-specific progression as your completed training evidence grows.",
    planning: ["balanced_starting_volume", "purposeful_variation", "selective_advanced_methods", "muscle_specific_adaptation"],
  },
  advanced: {
    customerGuidance: "Individualise dosage, weakness work and fatigue management from your own comparable training evidence.",
    planning: ["evidence_dependent_dosage", "specialised_weakness_work", "phase_specific_methods", "tight_fatigue_management", "no_automatic_more_sets"],
  },
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
  transferRationale?: "bench_pec_and_position_strength" | "bench_scapular_platform" | "bench_lat_stability" | "bench_lockout" | "squat_quad_drive" | "squat_posterior_support" | "deadlift_lat_position" | "deadlift_hamstring_strength";
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
  startingVolumeContext?: CanonicalStartingVolumeContext;
  availableSessionMinutes?: CanonicalSessionDurationMinutes;
}>;
export type CanonicalMicrocycleVolumeAllocation = Readonly<{
  schemaVersion: "canonical_microcycle_volume_allocation_v1";
  policyId: typeof canonicalMicrocycleVolumePolicy.policyId;
  profile: CanonicalMicrocycleAllocationProfile;
  experience: ExperienceLevel;
  recoveryRestricted: boolean;
  hypertrophyDosage: Readonly<{ policyId: typeof canonicalHypertrophyVolumePolicy.policyId; muscleFirst: true; startingVolumeBasis: "experience_and_region"; progressionMode: "evidence_bounded" }>;
  experienceAdjustment: Readonly<{ mode: "simplified_beginner" | "balanced_intermediate" | "evidence_individualised_advanced"; establishedEvidenceUsed: boolean }>;
  slots: readonly AllocatedSlot[];
  directSetTargets: Readonly<Partial<Record<CanonicalStimulusRegion, Readonly<{ min: number; max: number }>>>>;
  directSets: Readonly<Partial<Record<CanonicalStimulusRegion, number>>>;
  indirectContributions: Readonly<{ convention: "certified_from_selected_exercise_metadata"; sets: Readonly<Record<string, never>> }>;
  movementPatternExposures: Readonly<Record<string, number>>;
  primaryLiftExposures: Readonly<Record<"bench" | "squat" | "deadlift", Readonly<{ primary: number; secondaryVariation: number }>>>;
  totalWorkingSets: number;
  sessionWorkingSets: readonly number[];
  estimatedSessionMinutes: readonly number[];
  durationConstraint: Readonly<{ minutes: CanonicalSessionDurationMinutes; maximumWorkingSets: number; constrainedSessionIndexes: readonly number[]; unmetStartingTargets: readonly CanonicalStimulusRegion[] }>;
  startingDosage: Readonly<{ context: CanonicalStartingVolumeContext; policyTargets: Readonly<Partial<Record<CanonicalStimulusRegion, number>>>; rotationNormalisation: "calendar_microcycle" | "six_session_rotation_at_five_sessions_per_week"; rounding: "nearest_whole_set_then_proportional_discrete_allocation" }>;
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
  let slots: AllocatedSlot[] = [];
  for (const [sessionIndex, sessionRole] of input.sessionRoles.entries()) {
    const contract = profile === "powerbuilding_five_day_v1" ? fiveDayPurpose[sessionRole as (typeof requiredFiveDayRoles)[number]] : canonicalContract(input, input.sessionTypes?.[sessionIndex] ?? inferSessionType(sessionRole), sessionIndex);
    contract.forEach((entry, order) => slots.push({
      ...entry,
      sessionIndex,
      sessionRole,
      order,
      workingSets: Math.max(entry.minimumSets ?? 1, setsFor(input.experience, entry.constructionRole, input.mesocycleId, input.recoveryRestricted, input.frequency, entry.baseWorkingSets, profile === "powerbuilding_five_day_v1", input.establishedLoadExerciseIds.length > 0)),
    }));
  }

  const hypertrophy = input.macrocycleGoal === "build_muscle" || input.macrocycleGoal === "get_leaner";
  const startingContext: CanonicalStartingVolumeContext = input.startingVolumeContext ?? {
    recovery: input.recoveryRestricted ? "low_acceptable" : "ordinary",
    history: "none",
    workCapacity: "not_demonstrated",
    concurrentSport: "none",
  };
  const policyTargets: Partial<Record<CanonicalStimulusRegion, number>> = {};
  if (hypertrophy) {
    for (const region of new Set(slots.flatMap((entry) => entry.requiredStimuli))) {
      policyTargets[region] = resolveCanonicalHypertrophyStartingVolume({ experience: input.experience, region, context: startingContext }).startingDirectSets;
    }
    slots = applyCanonicalStartingDosage(input, slots, policyTargets);
  }

  const duration = resolveCanonicalSessionDuration(normalizeCanonicalSessionDuration(input.availableSessionMinutes));
  if (duration.status !== "valid") throw new Error("canonical_session_duration_normalisation_failed");
  const maximumSessionSets = Math.min(duration.maximumWorkingSets, hypertrophy ? 24 : 20);
  const constrained = constrainSlotsToDuration(slots, input.sessionRoles.length, maximumSessionSets);
  slots = constrained.slots;
  const constrainedSessionIndexes = constrained.constrainedSessionIndexes;

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
    : hypertrophy
      ? Object.fromEntries(Object.keys(directSets).map((region) => {
        const stimulus = region as CanonicalStimulusRegion;
        const landmark = canonicalHypertrophyLandmark(input.experience, stimulus);
        const policyMinimum = policyTargets[stimulus] ?? resolveCanonicalHypertrophyStartingVolume({ experience: input.experience, region: stimulus, context: startingContext }).startingDirectSets;
        return [region, { min: isRollingPpl(input) || constrainedSessionIndexes.length > 0 ? Math.min(policyMinimum, directSets[stimulus] ?? policyMinimum) : policyMinimum, max: landmark.target.max }];
      }))
      : Object.fromEntries(Object.entries(directSets).map(([region, sets]) => [region, { min: Math.max(1, Number(sets) - Math.max(1, Math.floor(Number(sets) * 0.2))), max: Number(sets) + Math.max(2, Math.ceil(Number(sets) * 0.35)) }]));
  const dosageComparison = isRollingPpl(input)
    ? directSetsForSlots(constrainSlotsToDuration(buildCanonicalRollingPplDosage(input, policyTargets), rollingPplRoles.length, maximumSessionSets).slots)
    : directSets;
  const dosageScale = isRollingPpl(input) ? 5 / 6 : 1;
  const unmetStartingTargets = hypertrophy ? Object.entries(policyTargets).filter(([region, target]) => {
    const actual = Number(dosageComparison[region as CanonicalStimulusRegion] ?? 0) * dosageScale;
    return actual + 0.51 < Number(target);
  }).map(([region]) => region as CanonicalStimulusRegion) : [];
  const checks = certify(input, profile, slots, directSets, sessionWorkingSets, estimatedSessionMinutes, primaryLiftExposures, duration.minutes, policyTargets, constrainedSessionIndexes.length > 0);
  return {
    schemaVersion: "canonical_microcycle_volume_allocation_v1",
    policyId: canonicalMicrocycleVolumePolicy.policyId,
    profile,
    experience: input.experience,
    recoveryRestricted: input.recoveryRestricted,
    hypertrophyDosage: { policyId: canonicalHypertrophyVolumePolicy.policyId, muscleFirst: true, startingVolumeBasis: "experience_and_region", progressionMode: "evidence_bounded" },
    experienceAdjustment: { mode: input.experience === "beginner" ? "simplified_beginner" : input.experience === "advanced" ? "evidence_individualised_advanced" : "balanced_intermediate", establishedEvidenceUsed: input.experience === "advanced" && input.establishedLoadExerciseIds.length > 0 },
    slots,
    directSetTargets,
    directSets,
    indirectContributions: { convention: "certified_from_selected_exercise_metadata", sets: {} },
    movementPatternExposures,
    primaryLiftExposures,
    totalWorkingSets: sessionWorkingSets.reduce((sum, sets) => sum + sets, 0),
    sessionWorkingSets,
    estimatedSessionMinutes,
    durationConstraint: { minutes: duration.minutes, maximumWorkingSets: duration.maximumWorkingSets, constrainedSessionIndexes, unmetStartingTargets },
    startingDosage: { context: startingContext, policyTargets, rotationNormalisation: isRollingPpl(input) ? "six_session_rotation_at_five_sessions_per_week" : "calendar_microcycle", rounding: "nearest_whole_set_then_proportional_discrete_allocation" },
    fatigue: { perSession: perSessionFatigue, weeklyUnits: perSessionFatigue.reduce((sum, units) => sum + units, 0), overlapFlags: profile === "powerbuilding_five_day_v1" || input.macrocycleGoal === "build_strength" || input.macrocycleGoal === "build_muscle_and_strength" ? detectCanonicalMicrocycleOverlap(slots) : [] },
    certification: { status: checks.failures.length ? "failed" : "passed", checks: checks.passed, failures: checks.failures },
  };
}

export function isStrictCanonicalAllocation(allocation: CanonicalMicrocycleVolumeAllocation | undefined): boolean {
  return Boolean(allocation);
}

const rollingPplRoles = ["Push hypertrophy A", "Pull hypertrophy B", "Legs hypertrophy C", "Push hypertrophy D", "Pull hypertrophy E", "Legs hypertrophy F"] as const;
const rollingPplTypes = ["push", "pull", "legs", "push", "pull", "legs"] as const;

/** Converts the muscle-specific seven-day policy into integer slot sets. A
 * five-day rolling PPL is allocated over its complete six-session rotation,
 * then normalised by 5/6; all other schedules use their calendar microcycle.
 * This is the only production bridge from policy dosage to discrete slots. */
function applyCanonicalStartingDosage(
  input: CanonicalMicrocycleVolumeAllocationInput,
  current: readonly AllocatedSlot[],
  targets: Readonly<Partial<Record<CanonicalStimulusRegion, number>>>,
): AllocatedSlot[] {
  if (!isRollingPpl(input)) return distributeCanonicalRegionTargets(current, targets, 1);
  const allocatedRotation = buildCanonicalRollingPplDosage(input, targets);
  const byRoleAndOrder = new Map(allocatedRotation.map((entry) => [`${entry.sessionRole}:${entry.order}`, entry.workingSets]));
  return current.map((entry) => ({ ...entry, workingSets: byRoleAndOrder.get(`${entry.sessionRole}:${entry.order}`) ?? entry.workingSets }));
}

function buildCanonicalRollingPplDosage(
  input: CanonicalMicrocycleVolumeAllocationInput,
  targets: Readonly<Partial<Record<CanonicalStimulusRegion, number>>>,
): AllocatedSlot[] {
  const virtual: AllocatedSlot[] = [];
  const virtualInput: CanonicalMicrocycleVolumeAllocationInput = { ...input, sessionRoles: rollingPplRoles, sessionTypes: rollingPplTypes };
  rollingPplRoles.forEach((sessionRole, sessionIndex) => {
    canonicalContract(virtualInput, rollingPplTypes[sessionIndex]!, sessionIndex).forEach((entry, order) => virtual.push({
      ...entry,
      sessionIndex,
      sessionRole,
      order,
      workingSets: Math.max(1, entry.baseWorkingSets ?? (entry.constructionRole === "primary" ? 3 : 2)),
    }));
  });
  return distributeCanonicalRegionTargets(virtual, targets, 6 / 5);
}

function distributeCanonicalRegionTargets(
  source: readonly AllocatedSlot[],
  targets: Readonly<Partial<Record<CanonicalStimulusRegion, number>>>,
  rotationScale: number,
): AllocatedSlot[] {
  const resolved = source.map((entry) => ({ ...entry, workingSets: 1 }));
  for (const region of new Set(resolved.flatMap((entry) => entry.requiredStimuli))) {
    const indexes = resolved.map((entry, index) => entry.requiredStimuli.includes(region) ? index : -1).filter((index) => index >= 0);
    const requested = Math.max(indexes.length, Math.round(Number(targets[region] ?? indexes.length) * rotationScale));
    let remaining = requested - indexes.length;
    while (remaining > 0) {
      const selected = indexes.slice().sort((left, right) => {
        const a = resolved[left]!; const b = resolved[right]!;
        const aScore = (a.baseWorkingSets ?? defaultSlotWeight(a.constructionRole)) / (a.workingSets + 1);
        const bScore = (b.baseWorkingSets ?? defaultSlotWeight(b.constructionRole)) / (b.workingSets + 1);
        return bScore - aScore || a.sessionRole.localeCompare(b.sessionRole) || a.order - b.order;
      })[0];
      if (selected === undefined) break;
      resolved[selected] = { ...resolved[selected]!, workingSets: resolved[selected]!.workingSets + 1 };
      remaining -= 1;
    }
  }
  return resolved;
}

function defaultSlotWeight(role: AllocatedSlot["constructionRole"]): number { return role === "primary" ? 3 : role === "secondary" ? 2 : 1; }
function roleReductionPriority(role: AllocatedSlot["constructionRole"]): number { return role === "accessory" ? 0 : role === "secondary" ? 1 : 2; }
function constrainSlotsToDuration(source: readonly AllocatedSlot[], sessionCount: number, maximumSessionSets: number): Readonly<{ slots: AllocatedSlot[]; constrainedSessionIndexes: number[] }> {
  let slots = source.map((entry) => ({ ...entry }));
  const constrainedSessionIndexes: number[] = [];
  for (let sessionIndex = 0; sessionIndex < sessionCount; sessionIndex += 1) {
    const local = slots.filter((entry) => entry.sessionIndex === sessionIndex);
    let excess = local.reduce((sum, entry) => sum + entry.workingSets, 0) - maximumSessionSets;
    if (excess <= 0) continue;
    constrainedSessionIndexes.push(sessionIndex);
    const reductionOrder = local.slice().sort((a, b) => roleReductionPriority(a.constructionRole) - roleReductionPriority(b.constructionRole) || b.order - a.order);
    for (const entry of reductionOrder) {
      if (excess <= 0) break;
      const reducible = Math.min(excess, entry.workingSets - 1);
      if (reducible <= 0) continue;
      slots = slots.map((candidate) => candidate.sessionIndex === entry.sessionIndex && candidate.order === entry.order ? { ...candidate, workingSets: candidate.workingSets - reducible } : candidate);
      excess -= reducible;
    }
  }
  return { slots, constrainedSessionIndexes };
}
function directSetsForSlots(slots: readonly AllocatedSlot[]): Partial<Record<CanonicalStimulusRegion, number>> {
  const direct: Partial<Record<CanonicalStimulusRegion, number>> = {};
  for (const slot of slots) for (const region of slot.requiredStimuli) direct[region] = (direct[region] ?? 0) + slot.workingSets;
  return direct;
}
function isRollingPpl(input: CanonicalMicrocycleVolumeAllocationInput): boolean {
  return input.frequency === 5
    && input.sessionTypes?.every((type) => type === "push" || type === "pull" || type === "legs") === true
    && input.sessionRoles.every((role) => rollingPplRoles.includes(role as (typeof rollingPplRoles)[number]));
}

type SlotOptions = Readonly<Partial<Pick<SlotContract, "minimumSets" | "primaryLift" | "liftExposure" | "specialistsPermitted" | "repeatPolicy" | "baseWorkingSets" | "preferredHypertrophyBias" | "transferRationale">>>;
function slot(exerciseRole: ExerciseRole, constructionRole: SlotContract["constructionRole"], muscles: readonly MuscleGroup[], requiredStimuli: readonly CanonicalStimulusRegion[], purpose: string, movementPatterns: readonly MovementPattern[], options: SlotOptions = {}): SlotContract {
  return { exerciseRole, constructionRole, muscles, requiredStimuli, purpose, movementPatterns, repeatPolicy: options.repeatPolicy ?? "repeat_if_no_equivalent", ...options };
}

function setsFor(experience: ExperienceLevel, role: AllocatedSlot["constructionRole"], mesocycleId: string, restricted: boolean, frequency: number, baseOverride?: number, preserveCertifiedProfile = false, establishedEvidence = false): number {
  const powerbuilding = mesocycleId.startsWith("powerbuilding_");
  const athletic = mesocycleId.startsWith("athletic_");
  const base = baseOverride ?? (role === "primary" ? (powerbuilding ? 4 : 3) : role === "secondary" ? (powerbuilding ? 3 : 2) : athletic ? 1 : 2);
  const experienced = preserveCertifiedProfile && experience !== "beginner"
    ? base
    : experience === "beginner"
    ? Math.max(2, base - 1)
    : experience === "advanced" && role === "primary" && (baseOverride === undefined || establishedEvidence)
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
  const dumbbellBodyweightOnly = input.equipment.every((item) => item === "dumbbell" || item === "bodyweight");
  const machineCableOnly = input.equipment.every((item) => item === "machine" || item === "cable" || item === "bodyweight");
  const strengthOrPowerbuilding = input.macrocycleGoal === "build_strength" || input.macrocycleGoal === "build_muscle_and_strength";
  const denseHypertrophy = input.macrocycleGoal === "build_muscle" || input.macrocycleGoal === "get_leaner" || input.mesocycleId.includes("hypertrophy");
  const contract = type === "push" ? strengthOrPowerbuilding ? strengthPushContract() : pushContract(barbellDominant)
    : type === "pull" ? strengthOrPowerbuilding ? strengthPullContract() : pullContract(input.experience === "beginner")
    : type === "legs" ? strengthOrPowerbuilding ? lowerContract(true, input.experience === "beginner", false) : lowerContract(false, input.experience === "beginner", true, input.sessionRoles[index]?.endsWith(" F") === true)
    : type === "lower" || type === "lower_strength" ? strengthOrPowerbuilding ? lowerContract(true, input.experience === "beginner", false) : dumbbellBodyweightOnly ? limitedLowerContract("dumbbell") : machineCableOnly ? limitedLowerContract("machine") : lowerContract(false, input.experience === "beginner", denseHypertrophy)
    : type === "squat" ? lowerContract(true)
    : type === "bench" ? benchContract()
    : type === "deadlift" ? deadliftContract()
    : type === "upper" || type === "upper_strength" ? upperContract(strengthOrPowerbuilding, barbellDominant)
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

function limitedLowerContract(mode: "dumbbell" | "machine"): readonly SlotContract[] {
  return mode === "dumbbell" ? [
    slot("secondary_compound", "primary", ["quads", "glutes"], ["quadriceps"], "dumbbell knee-dominant anchor", ["squat", "lunge"], { repeatPolicy: "stable_primary_practice", baseWorkingSets: 4 }),
    slot("primary_compound", "secondary", ["hamstrings"], ["hip_extension"], "dumbbell hinge anchor", ["hinge"], { repeatPolicy: "variation_preferred", baseWorkingSets: 4 }),
    slot("isolation", "accessory", ["hamstrings"], ["hamstrings_knee_flexion"], "bodyweight knee-flexion hamstring work", ["isolation"], { repeatPolicy: "variation_preferred", baseWorkingSets: 3 }),
    slot("isolation", "accessory", ["calves"], ["calves"], "single-leg calf work", ["isolation"], { repeatPolicy: "variation_preferred", baseWorkingSets: 3 }),
  ] : [
    slot("primary_compound", "primary", ["quads"], ["quadriceps"], "machine knee-dominant anchor", ["squat"], { repeatPolicy: "stable_primary_practice", baseWorkingSets: 4 }),
    slot("isolation", "secondary", ["quads"], ["quadriceps"], "machine knee-extension hypertrophy", ["isolation"], { repeatPolicy: "variation_preferred", baseWorkingSets: 3 }),
    slot("secondary_compound", "secondary", ["glutes"], ["hip_extension"], "machine hip-extension work", ["hip_thrust"], { repeatPolicy: "variation_preferred", baseWorkingSets: 4 }),
    slot("isolation", "accessory", ["hamstrings"], ["hamstrings_knee_flexion"], "machine knee-flexion hamstring work", ["isolation"], { repeatPolicy: "variation_preferred", baseWorkingSets: 3 }),
    slot("isolation", "accessory", ["calves"], ["calves"], "machine calf work", ["isolation"], { repeatPolicy: "variation_preferred", baseWorkingSets: 3 }),
    slot("accessory", "accessory", ["abs"], ["core"], "cable trunk support", ["core"], { repeatPolicy: "repeat_if_no_equivalent", baseWorkingSets: 2 }),
  ];
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
  slot("primary_compound", "primary", ["chest"], ["chest"], "high-priority horizontal press", ["horizontal_push"], { repeatPolicy: strengthSpecific ? "stable_primary_practice" : "variation_preferred", baseWorkingSets: 4 }),
  slot("secondary_compound", "secondary", ["chest"], ["chest"], "second-angle chest stimulus", ["horizontal_push"], { repeatPolicy: "variation_preferred", preferredHypertrophyBias: "lengthened", baseWorkingSets: 3 }),
  slot("secondary_compound", "secondary", ["shoulders"], ["anterior_delts"], "vertical pressing stimulus", ["vertical_push"], { repeatPolicy: "variation_preferred", baseWorkingSets: 3 }),
  slot("isolation", "accessory", ["shoulders"], ["lateral_delts"], "lateral-delt stimulus", ["isolation"], { repeatPolicy: "variation_preferred", baseWorkingSets: 3 }),
  slot("isolation", "accessory", ["triceps"], ["triceps"], "lengthened elbow-extension work", ["isolation"], { repeatPolicy: "variation_preferred", preferredHypertrophyBias: "lengthened", baseWorkingSets: 3 }),
  slot("isolation", "accessory", ["triceps"], ["triceps"], "shortened-range triceps finish", ["isolation"], { repeatPolicy: "variation_preferred", preferredHypertrophyBias: "shortened", baseWorkingSets: 2 }),
]; }

function pullContract(beginnerStable = false): readonly SlotContract[] { return [
  slot("secondary_compound", "primary", ["back"], ["upper_back"], "supported horizontal-pull anchor", ["horizontal_pull"], { repeatPolicy: beginnerStable ? "stable_primary_practice" : "variation_preferred", baseWorkingSets: 4 }),
  slot("secondary_compound", "secondary", ["back"], ["lats"], "vertical-pull lat stimulus", ["vertical_pull"], { repeatPolicy: "variation_preferred", baseWorkingSets: 4 }),
  slot("secondary_compound", "secondary", ["back"], ["upper_back"], "second-angle upper-back stimulus", ["horizontal_pull"], { repeatPolicy: "variation_preferred", baseWorkingSets: 3 }),
  slot("isolation", "accessory", ["rear_delts"], ["rear_delts"], "rear-delt and scapular work", ["isolation"], { repeatPolicy: "variation_preferred", baseWorkingSets: 3 }),
  slot("isolation", "accessory", ["biceps"], ["biceps"], "lengthened elbow-flexor work", ["isolation"], { repeatPolicy: "variation_preferred", preferredHypertrophyBias: "lengthened", baseWorkingSets: 3 }),
  slot("secondary_compound", "secondary", ["back"], ["lats"], "second-angle lat stimulus", ["vertical_pull"], { repeatPolicy: "variation_preferred", baseWorkingSets: 2 }),
]; }

function lowerContract(squatSpecific: boolean, beginnerSimple = false, denseHypertrophy = true, complementarySecond = false): readonly SlotContract[] {
  if (beginnerSimple && !squatSpecific) return [
    slot("secondary_compound", "primary", ["quads"], ["quadriceps"], "stable knee-dominant practice", ["squat", "lunge"], { repeatPolicy: "stable_primary_practice", baseWorkingSets: 6 }),
    slot("secondary_compound", "secondary", ["glutes"], ["hip_extension"], "stable hip-extension practice", ["hip_thrust"], { repeatPolicy: "variation_preferred", baseWorkingSets: 6 }),
    slot("isolation", "accessory", ["hamstrings"], ["hamstrings_knee_flexion"], "knee-flexion hamstring work", ["isolation"], { repeatPolicy: "variation_preferred", baseWorkingSets: 2 }),
    slot("isolation", "accessory", ["calves"], ["calves"], "calf work", ["isolation"], { repeatPolicy: "variation_preferred", baseWorkingSets: 2 }),
    slot("accessory", "accessory", ["abs"], ["core"], "simple trunk support", ["core"], { repeatPolicy: "repeat_if_no_equivalent", baseWorkingSets: 2 }),
  ];
  if (!denseHypertrophy) return [
    slot(squatSpecific ? "primary_compound" : "secondary_compound", "primary", ["quads"], ["quadriceps"], squatSpecific ? "squat-specific anchor" : "knee-dominant strength support", ["squat", "lunge"], squatSpecific ? { primaryLift: "squat", liftExposure: "primary", repeatPolicy: "stable_primary_practice", baseWorkingSets: 4 } : { repeatPolicy: "stable_primary_practice", baseWorkingSets: 4 }),
    slot("secondary_compound", "secondary", ["quads", "glutes"], ["quadriceps"], "quad drive assistance", ["squat", "lunge"], { repeatPolicy: "variation_preferred", transferRationale: squatSpecific ? "squat_quad_drive" : undefined, baseWorkingSets: 3 }),
    slot("secondary_compound", "secondary", ["hamstrings", "glutes"], ["hip_extension"], "posterior-chain assistance", ["hinge", "hip_thrust"], { repeatPolicy: "variation_preferred", transferRationale: squatSpecific ? "squat_posterior_support" : undefined, baseWorkingSets: 3 }),
    slot("isolation", "accessory", ["hamstrings"], ["hamstrings_knee_flexion"], "knee-flexion hamstring support", ["isolation"], { repeatPolicy: "variation_preferred", baseWorkingSets: 2 }),
    slot("isolation", "accessory", ["calves"], ["calves"], "calf retention", ["isolation"], { repeatPolicy: "variation_preferred", baseWorkingSets: 2 }),
  ];
  if (complementarySecond) return [
    slot("secondary_compound", "primary", ["hamstrings", "glutes"], ["hip_extension"], "moderate-fatigue hinge-led posterior-chain anchor", ["hinge"], { repeatPolicy: "variation_preferred", baseWorkingSets: 3 }),
    slot("secondary_compound", "secondary", ["quads", "glutes"], ["quadriceps"], "single-leg knee-dominant hypertrophy", ["lunge"], { repeatPolicy: "variation_preferred", baseWorkingSets: 3 }),
    slot("isolation", "accessory", ["hamstrings"], ["hamstrings_knee_flexion"], "knee-flexion hamstring work", ["isolation"], { repeatPolicy: "variation_preferred", baseWorkingSets: 3 }),
    slot("isolation", "accessory", ["quads"], ["quadriceps"], "low-systemic-cost quadriceps work", ["isolation"], { repeatPolicy: "variation_preferred", baseWorkingSets: 2 }),
    slot("secondary_compound", "secondary", ["glutes"], ["hip_extension"], "shortened hip-extension stimulus", ["hip_thrust"], { repeatPolicy: "variation_preferred", preferredHypertrophyBias: "shortened", baseWorkingSets: 3 }),
    slot("isolation", "accessory", ["calves"], ["calves"], "calf work", ["isolation"], { repeatPolicy: "variation_preferred", baseWorkingSets: 4 }),
    slot("accessory", "accessory", ["abs"], ["core"], "trunk work", ["core"], { repeatPolicy: "repeat_if_no_equivalent", baseWorkingSets: 2 }),
  ];
  return [
  slot(squatSpecific ? "primary_compound" : "secondary_compound", "primary", ["quads"], ["quadriceps"], squatSpecific ? "squat-specific anchor" : "knee-dominant anchor", ["squat", "lunge"], squatSpecific ? { primaryLift: "squat", liftExposure: "primary", repeatPolicy: "stable_primary_practice", transferRationale: "squat_quad_drive", baseWorkingSets: 4 } : { repeatPolicy: "stable_primary_practice", baseWorkingSets: 4 }),
  slot("secondary_compound", "secondary", ["quads", "glutes"], ["quadriceps"], "complementary knee-dominant hypertrophy", ["squat", "lunge"], { repeatPolicy: "variation_preferred", baseWorkingSets: 3, transferRationale: squatSpecific ? "squat_quad_drive" : undefined }),
  slot("secondary_compound", "secondary", ["hamstrings", "glutes"], ["hip_extension"], "hip-extension support", ["hinge"], { repeatPolicy: "variation_preferred", baseWorkingSets: 3, transferRationale: squatSpecific ? "squat_posterior_support" : undefined }),
  slot("isolation", "accessory", ["hamstrings"], ["hamstrings_knee_flexion"], "knee-flexion hamstring work", ["isolation"], { repeatPolicy: "variation_preferred", baseWorkingSets: 4 }),
  slot("secondary_compound", "secondary", ["glutes"], ["hip_extension"], "shortened hip-extension stimulus", ["hip_thrust"], { repeatPolicy: "variation_preferred", preferredHypertrophyBias: "shortened", baseWorkingSets: 3 }),
  slot("isolation", "accessory", ["calves"], ["calves"], "calf work", ["isolation"], { repeatPolicy: "variation_preferred", baseWorkingSets: 4 }),
  ];
}

function strengthPushContract(): readonly SlotContract[] { return [
  slot("primary_compound", "primary", ["chest"], ["chest"], "bench-family strength anchor", ["horizontal_push"], { primaryLift: "bench", liftExposure: "primary", repeatPolicy: "stable_primary_practice", baseWorkingSets: 4 }),
  slot("secondary_compound", "secondary", ["chest"], ["chest"], "bench position and pec-strength assistance", ["horizontal_push"], { repeatPolicy: "variation_preferred", transferRationale: "bench_pec_and_position_strength", baseWorkingSets: 3 }),
  slot("secondary_compound", "secondary", ["back"], ["upper_back"], "scapular platform assistance", ["horizontal_pull"], { repeatPolicy: "variation_preferred", transferRationale: "bench_scapular_platform", baseWorkingSets: 3 }),
  slot("isolation", "accessory", ["triceps"], ["triceps"], "bench lockout assistance", ["isolation"], { repeatPolicy: "variation_preferred", transferRationale: "bench_lockout", baseWorkingSets: 3 }),
  slot("isolation", "accessory", ["shoulders"], ["lateral_delts"], "upper-body muscle retention", ["isolation"], { repeatPolicy: "variation_preferred", baseWorkingSets: 2 }),
]; }

function strengthPullContract(): readonly SlotContract[] { return [
  slot("primary_compound", "primary", ["hamstrings", "glutes"], ["hip_extension"], "deadlift-family strength anchor", ["hinge"], { primaryLift: "deadlift", liftExposure: "primary", repeatPolicy: "stable_primary_practice", baseWorkingSets: 3 }),
  slot("secondary_compound", "secondary", ["back"], ["lats"], "lat position assistance for the deadlift", ["vertical_pull"], { repeatPolicy: "variation_preferred", transferRationale: "deadlift_lat_position", baseWorkingSets: 3 }),
  slot("isolation", "accessory", ["hamstrings"], ["hamstrings_knee_flexion"], "hamstring strength assistance", ["isolation"], { repeatPolicy: "variation_preferred", transferRationale: "deadlift_hamstring_strength", baseWorkingSets: 3 }),
  slot("secondary_compound", "secondary", ["back"], ["upper_back"], "upper-back hypertrophy and position support", ["horizontal_pull"], { repeatPolicy: "variation_preferred", baseWorkingSets: 3 }),
  slot("isolation", "accessory", ["biceps"], ["biceps"], "elbow-flexor muscle retention", ["isolation"], { repeatPolicy: "variation_preferred", baseWorkingSets: 2 }),
]; }

function upperContract(strength: boolean, primaryOnlyEquipment = false): readonly SlotContract[] { return [
  slot(strength || primaryOnlyEquipment ? "primary_compound" : "secondary_compound", "primary", ["chest"], ["chest"], strength ? "upper strength press" : "upper chest anchor", ["horizontal_push"], strength ? { primaryLift: "bench", liftExposure: "primary", repeatPolicy: "stable_primary_practice", baseWorkingSets: 4 } : { repeatPolicy: "stable_primary_practice", baseWorkingSets: 4 }),
  slot("secondary_compound", "secondary", ["back"], ["upper_back"], strength ? "scapular platform assistance for pressing" : "horizontal pulling support", ["horizontal_pull"], { repeatPolicy: "variation_preferred", transferRationale: strength ? "bench_scapular_platform" : undefined }),
  slot("secondary_compound", "secondary", ["back"], ["lats"], strength ? "lat stability assistance for pressing" : "vertical pulling support", ["vertical_pull"], { repeatPolicy: "variation_preferred", transferRationale: strength ? "bench_lat_stability" : undefined }),
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
  slot("secondary_compound", "secondary", ["chest"], ["chest"], "bench variation for pec and position strength", ["horizontal_push"], { repeatPolicy: "variation_preferred", transferRationale: "bench_pec_and_position_strength" }),
  slot("secondary_compound", "secondary", ["back"], ["upper_back"], "row for a stable benching platform", ["horizontal_pull"], { repeatPolicy: "variation_preferred", transferRationale: "bench_scapular_platform" }),
  slot("isolation", "accessory", ["triceps"], ["triceps"], "bench lockout support", ["isolation"], { repeatPolicy: "variation_preferred", transferRationale: "bench_lockout" }),
  slot("isolation", "accessory", ["rear_delts"], ["rear_delts"], "shoulder-balance hypertrophy", ["isolation"], { repeatPolicy: "variation_preferred" }),
]; }

function deadliftContract(): readonly SlotContract[] { return [
  slot("primary_compound", "primary", ["hamstrings", "glutes"], ["hip_extension"], "deadlift-specific anchor", ["hinge"], { primaryLift: "deadlift", liftExposure: "primary", repeatPolicy: "stable_primary_practice" }),
  slot("secondary_compound", "secondary", ["back"], ["lats"], "lat work for deadlift bar position", ["vertical_pull"], { repeatPolicy: "variation_preferred", transferRationale: "deadlift_lat_position" }),
  slot("isolation", "accessory", ["hamstrings"], ["hamstrings_knee_flexion"], "hamstring strength supporting the hinge", ["isolation"], { repeatPolicy: "variation_preferred", transferRationale: "deadlift_hamstring_strength" }),
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

function certify(input: CanonicalMicrocycleVolumeAllocationInput, profile: CanonicalMicrocycleAllocationProfile, slots: readonly AllocatedSlot[], direct: Partial<Record<CanonicalStimulusRegion, number>>, sessionSets: readonly number[], durations: readonly number[], lifts: CanonicalMicrocycleVolumeAllocation["primaryLiftExposures"], availableMinutes: CanonicalSessionDurationMinutes, policyTargets: Readonly<Partial<Record<CanonicalStimulusRegion, number>>>, durationConstrained: boolean): { passed: string[]; failures: string[] } {
  const failures: string[] = [];
  const passed: string[] = [];
  check(slots.length > 0 && slots.every((entry) => Number.isInteger(entry.workingSets) && entry.workingSets >= 1), "exact_working_sets_resolved", "invalid_set_allocation", passed, failures);
  const ppl = input.sessionTypes?.every((type) => type === "push" || type === "pull" || type === "legs");
  const hypertrophy = input.macrocycleGoal === "build_muscle" || input.macrocycleGoal === "get_leaner";
  const hypertrophyPpl = hypertrophy && ppl;
  check(sessionSets.every((sets) => sets >= 3 && sets <= ((ppl || input.macrocycleGoal === "build_muscle" || input.macrocycleGoal === "get_leaner") ? 24 : 20)), "session_volume_bounded", "session_volume_out_of_bounds", passed, failures);
  check(durations.every((minutes) => minutes > 0 && minutes <= availableMinutes), "available_session_duration_respected", "available_session_duration_exceeded", passed, failures);
  check(slots.every((entry) => entry.muscles.length > 0 && entry.movementPatterns.length > 0), "slot_targets_resolved", "unresolved_slot_target", passed, failures);
  if (hypertrophyPpl && !input.recoveryRestricted) {
    check(input.sessionTypes!.every((type, index) => slots.filter((entry) => entry.sessionIndex === index).length >= (input.experience === "beginner" ? 5 : 6)), "ppl_session_density_authorised", "skeletal_ppl_session", passed, failures);
    check(input.sessionTypes!.every((type, index) => type !== "push" || ["chest", "anterior_delts", "lateral_delts", "triceps"].every((region) => slots.some((entry) => entry.sessionIndex === index && entry.requiredStimuli.includes(region as CanonicalStimulusRegion)))), "push_identity_preserved", "push_identity_incomplete", passed, failures);
    check(input.sessionTypes!.every((type, index) => type !== "pull" || ["upper_back", "lats", "rear_delts", "biceps"].every((region) => slots.some((entry) => entry.sessionIndex === index && entry.requiredStimuli.includes(region as CanonicalStimulusRegion)))), "pull_identity_preserved", "pull_identity_incomplete", passed, failures);
    check(input.sessionTypes!.every((type, index) => type !== "legs" || ["quadriceps", "hamstrings_knee_flexion", "hip_extension", "calves"].every((region) => slots.some((entry) => entry.sessionIndex === index && entry.requiredStimuli.includes(region as CanonicalStimulusRegion)))), "legs_identity_preserved", "legs_identity_incomplete", passed, failures);
  }
  if (hypertrophy && !durationConstrained && !isRollingPpl(input)) {
    check(Object.entries(policyTargets).every(([region, target]) => {
      const stimulus = region as CanonicalStimulusRegion;
      const actual = Number(direct[stimulus] ?? 0);
      const minimumDiscreteExposures = slots.filter((entry) => entry.requiredStimuli.includes(stimulus)).length;
      return actual >= Number(target) && actual <= Number(target) + Math.max(0, minimumDiscreteExposures - Number(target));
    }), "starting_dosage_matches_policy_or_minimum_discrete_exposure", "starting_dosage_policy_mismatch", passed, failures);
  } else if (hypertrophy && durationConstrained) {
    check(slots.every((entry) => entry.workingSets >= 1), "duration_constraint_preserves_every_planned_stimulus", "duration_constraint_deleted_essential_coverage", passed, failures);
  }
  const strengthSlots = slots.filter((entry) => entry.primaryLift && entry.liftExposure === "primary" && ["bench", "squat", "deadlift"].includes(input.sessionTypes?.[entry.sessionIndex] ?? ""));
  check(strengthSlots.every((primary) => slots.filter((entry) => entry.sessionIndex === primary.sessionIndex && entry.order > primary.order).slice(0, 2).every((entry) => Boolean(entry.transferRationale))), "strength_assistance_transfer_explained", "strength_assistance_transfer_missing", passed, failures);
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
