import type { MesocycleId } from "@/domain/training/mesocycle-library";
import type { Exercise, ExerciseRole, ExperienceLevel, MovementPattern } from "@/domain/training/models";
import type { PrescriptionMethodFamily } from "@/domain/training/mesocycle-prescription-policy";

export const CANONICAL_TRAINING_METHOD_POLICY_ID = "canonical_training_method_policy_v1" as const;
export const CANONICAL_TRAINING_METHOD_CONTRACT_VERSION = "canonical_training_method_contract_v2" as const;

export type CanonicalMethodContract = Readonly<{
  contractVersion: typeof CANONICAL_TRAINING_METHOD_CONTRACT_VERSION;
  setRoles: readonly ("standard" | "top_set" | "back_off" | "activation" | "mini_set")[];
  loadMultipliers: readonly number[];
  completionRule: string;
  stopRule: string;
  progressionRule: string;
  adaptationEligibility: string;
  substitutionCompatibility: string;
  durationCost: Readonly<{ setupSeconds: number; transitionSeconds: number; activeSetSeconds: number; restSeconds: number }>;
  explanation: string;
  evidenceAuthorityVersion: string;
}>;

export type CanonicalTrainingMethodId =
  | PrescriptionMethodFamily
  | "antagonist_superset"
  | "same_region_superset"
  | "triset"
  | "rest_pause"
  | "myo_reps"
  | "drop_set"
  | "capped_amrap"
  | "ten_by_ten"
  | "high_rep_finisher";

export type CanonicalMethodStructure =
  | Readonly<{
    kind: "standalone";
    policyId: typeof CANONICAL_TRAINING_METHOD_POLICY_ID;
    method: PrescriptionMethodFamily;
    rounds: number;
    interRoundRestSeconds: number;
    executionLabel: string;
    reasonCodes: readonly string[];
    contract?: CanonicalMethodContract;
  }>
  | Readonly<{
    kind: "linked_rounds";
    policyId: typeof CANONICAL_TRAINING_METHOD_POLICY_ID;
    method: "antagonist_superset";
    groupId: string;
    position: 1 | 2;
    groupSize: 2;
    rounds: number;
    intraMethodRestSeconds: 0;
    interRoundRestSeconds: 60;
    pairedExerciseName: string;
    pairedExerciseId?: string;
    executionLabel: string;
    reasonCodes: readonly string[];
    contract?: CanonicalMethodContract;
  }>
  | Readonly<{
    kind: "rest_pause";
    policyId: typeof CANONICAL_TRAINING_METHOD_POLICY_ID;
    method: "rest_pause";
    rounds: number;
    activationReps: number;
    miniSetTargetReps: number;
    minimumMiniSetReps: number;
    maximumMiniSets: number;
    intraMethodRestSeconds: number;
    interRoundRestSeconds: number;
    executionLabel: string;
    reasonCodes: readonly string[];
    contract?: CanonicalMethodContract;
  }>;

export type CanonicalTrainingMethodDefinition = Readonly<{
  method: CanonicalTrainingMethodId;
  status: "supported" | "unsupported";
  eligibleGoals: readonly string[];
  eligibleExperience: readonly ExperienceLevel[];
  eligibleMesocycles: readonly string[];
  suitableExerciseClasses: readonly string[];
  contraindications: readonly string[];
  minimumEvidence: "none" | "calibration_supported" | "established_load" | "approved_method_specific_evidence";
  fatigueBoundary: string;
  exactConstructionOwner: string | null;
  restOwner: string | null;
  progressionOwner: string | null;
  stopRuleOwner: string | null;
  maximumFrequency: string;
  exitRule: string;
  durationEffect: string;
  provenance: readonly Readonly<{ source: string; pdfPage?: number; printedPage?: number; rule: string; limitation: string }>[];
}>;

const existingPolicy = (method: CanonicalTrainingMethodId, overrides: Partial<CanonicalTrainingMethodDefinition> = {}): CanonicalTrainingMethodDefinition => ({
  method,
  status: "supported",
  eligibleGoals: ["mesocycle_owned"],
  eligibleExperience: ["beginner", "intermediate", "advanced"],
  eligibleMesocycles: ["mesocycle_prescription_policy_v1_permitted"],
  suitableExerciseClasses: ["canonical_exact_target_policy_eligible"],
  contraindications: ["mesocycle_prohibited", "recovery_restricted", "incompatible_exact_structure"],
  minimumEvidence: "calibration_supported",
  fatigueBoundary: "mesocycle_fatigue_and_drop_off_policy",
  exactConstructionOwner: "canonical_exact_target_policy_v2",
  restOwner: "canonical_prescription_components",
  progressionOwner: "canonical_prescription_components",
  stopRuleOwner: "canonical_prescription_components",
  maximumFrequency: "mesocycle_and_microcycle_allocation_owned",
  exitRule: "exit when the owning Mesocycle no longer permits the method or its stop rule fires",
  durationEffect: "canonical_session_duration_policy_v2",
  provenance: [{ source: "existing canonical policy", rule: "The method is already bounded by Mesocycle permission and exact Session Construction.", limitation: "This entry does not widen existing eligibility or author new numeric rules." }],
  ...overrides,
});

const unsupported = (method: CanonicalTrainingMethodId, reason: string): CanonicalTrainingMethodDefinition => ({
  method,
  status: "unsupported",
  eligibleGoals: [],
  eligibleExperience: [],
  eligibleMesocycles: [],
  suitableExerciseClasses: [],
  contraindications: ["no_approved_exact_canonical_contract"],
  minimumEvidence: "approved_method_specific_evidence",
  fatigueBoundary: "fail_closed",
  exactConstructionOwner: null,
  restOwner: null,
  progressionOwner: null,
  stopRuleOwner: null,
  maximumFrequency: "zero",
  exitRule: "unsupported",
  durationEffect: "not_constructed",
  provenance: [{ source: "canonical policy gap", rule: reason, limitation: "A product label or fixture expectation cannot create method authority." }],
});

export const canonicalTrainingMethodDefinitions: readonly CanonicalTrainingMethodDefinition[] = [
  existingPolicy("straight_sets", { minimumEvidence: "none", contraindications: [], exactConstructionOwner: "canonical_microcycle_volume_policy_v4_and_canonical_exact_target_policy_v2" }),
  existingPolicy("back_off_sets"),
  existingPolicy("amrap", { eligibleExperience: ["intermediate", "advanced"], contraindications: ["deload", "taper", "uncapped_effort", "recovery_restricted"] }),
  existingPolicy("five_three_one", { eligibleExperience: ["intermediate", "advanced"] }),
  existingPolicy("eight_across", { eligibleExperience: ["intermediate", "advanced"] }),
  existingPolicy("pyramid"),
  existingPolicy("ladder", { eligibleExperience: ["intermediate", "advanced"] }),
  existingPolicy("cluster", { eligibleExperience: ["intermediate", "advanced"], minimumEvidence: "established_load" }),
  existingPolicy("bbb", { eligibleExperience: ["intermediate", "advanced"], minimumEvidence: "established_load" }),
  existingPolicy("dynamic_effort", { eligibleExperience: ["intermediate", "advanced"], minimumEvidence: "established_load" }),
  existingPolicy("max_effort", { eligibleExperience: ["advanced"], minimumEvidence: "established_load" }),
  existingPolicy("heavy_single_triple_five_backoffs", { eligibleExperience: ["intermediate", "advanced"], minimumEvidence: "established_load" }),
  {
    method: "antagonist_superset",
    status: "supported",
    eligibleGoals: ["build_muscle", "build_muscle_and_strength", "athletic_performance"],
    eligibleExperience: ["intermediate", "advanced"],
    eligibleMesocycles: ["hypertrophy_volume", "hypertrophy_specialisation", "powerbuilding_hypertrophy", "athletic_general"],
    suitableExerciseClasses: ["horizontal_push_plus_horizontal_pull", "vertical_push_plus_vertical_pull", "joint_flexion_plus_extension", "non_primary_low_or_moderate_fatigue"],
    contraindications: ["primary_compound_pair", "high_skill_pair", "high_fatigue_pair", "unequal_rounds", "recovery_restricted", "deload", "taper", "transition"],
    minimumEvidence: "calibration_supported",
    fatigueBoundary: "both exercises must remain below high skill and high fatigue; stop either side on its canonical rule",
    exactConstructionOwner: "canonical_microcycle_volume_policy_v4 retains each exercise's allocated rounds and canonical_exact_target_policy_v2 retains reps",
    restOwner: "canonical_training_method_policy_v1",
    progressionOwner: "each exercise retains canonical_prescription_components progression",
    stopRuleOwner: "either exercise canonical stop rule ends its remaining linked work",
    maximumFrequency: "one linked antagonist group per session",
    exitRule: "return both exercises to standalone execution when eligibility, readiness, equality or compatibility is lost",
    durationEffect: "zero intra-pair rest and 60 seconds between completed rounds; canonical duration is recomputed",
    provenance: [
      { source: "08-Tier-System-Manual-Athletic-Based-Strength-Training.pdf", pdfPage: 103, printedPage: 87, rule: "Supersets pair antagonistic groups: horizontal push/pull, vertical push/pull, or joint flexion/extension.", limitation: "The source does not author exercise selection or universal eligibility." },
      { source: "08-Tier-System-Manual-Athletic-Based-Strength-Training.pdf", pdfPage: 232, rule: "Published chest/back examples use three paired rounds of ten with one minute between supersets.", limitation: "The app retains its canonical set and rep allocation; only the one-minute inter-round rest is imported." },
    ],
  },
  {
    method: "rest_pause",
    status: "supported",
    eligibleGoals: ["build_muscle", "build_muscle_and_strength"],
    eligibleExperience: ["intermediate", "advanced"],
    eligibleMesocycles: ["hypertrophy_volume", "hypertrophy_specialisation", "powerbuilding_hypertrophy"],
    suitableExerciseClasses: ["stable_low_or_moderate_fatigue_dumbbell_machine_or_cable_accessory_or_row"],
    contraindications: ["primary_compound", "barbell_compound", "high_skill", "high_fatigue", "missing_established_load", "recovery_restricted", "deload", "taper", "transition"],
    minimumEvidence: "established_load",
    fatigueBoundary: "three exact ten-repetition rounds only; every repetition remains technically valid",
    exactConstructionOwner: "canonical_training_method_policy_v1",
    restOwner: "canonical_training_method_policy_v1_inside_round_and_canonical_prescription_components_between_rounds",
    progressionOwner: "canonical_prescription_components; no load increase from rest-pause novelty",
    stopRuleOwner: "canonical stop rule plus immediate technical stop",
    maximumFrequency: "one exercise per session",
    exitRule: "return to straight sets on missed target, stale evidence, restricted recovery or Mesocycle exit",
    durationEffect: "ten one-repetition segments separated by one second inside each of three rounds",
    provenance: [
      { source: "02-Vault-T-Nation.pdf", pdfPage: 132, printedPage: 132, rule: "The supplied programme labels dumbbell rows Rest Pause and prescribes three sets of ten, returning each rep to the floor and waiting one second before the next pull.", limitation: "This supports only the exact bounded row-style structure; it does not author failure training or use on unstable compounds." },
    ],
  },
  unsupported("same_region_superset", "No supplied source-backed exact same-region pairing contract is approved."),
  unsupported("triset", "The supplied material names tri-sets, but no bounded production eligibility and exact execution contract is approved."),
  unsupported("myo_reps", "No approved canonical exact construction exists."),
  unsupported("drop_set", "No approved canonical exact construction and load-reduction rule exists."),
  unsupported("capped_amrap", "Existing canonical amrap owns capped performance work; a duplicate method identity is unnecessary."),
  unsupported("ten_by_ten", "No approved standalone 10x10 production policy exists."),
  unsupported("high_rep_finisher", "No approved need, dose and recovery contract exists; finishers cannot disguise missing primary work."),
] as const;

export type CanonicalMethodSelectionInput = Readonly<{
  goal: string;
  mesocycleId: MesocycleId;
  specialState: string;
  experience: ExperienceLevel;
  exercise: Exercise;
  exerciseRole: ExerciseRole;
  sessionRole: string;
  requiredSets: number;
  targetReps: number;
  loadState: string;
  readiness?: "ready" | "restricted";
  permittedMethods: readonly PrescriptionMethodFamily[];
}>;

export type CanonicalMethodSelectionResult = Readonly<{
  status: "selected";
  policyId: typeof CANONICAL_TRAINING_METHOD_POLICY_ID;
  method: PrescriptionMethodFamily;
  reasonCodes: readonly string[];
}> | Readonly<{
  status: "unsupported";
  policyId: typeof CANONICAL_TRAINING_METHOD_POLICY_ID;
  method: "straight_sets";
  reasonCodes: readonly string[];
}>;

export type CanonicalMethodCandidateInput = Readonly<{
  mesocycleId?: MesocycleId;
  experience: ExperienceLevel;
  exerciseRole: ExerciseRole;
  sessionRole: string;
}>;

/**
 * Single phase/role candidate selector. The production resolver still has to
 * validate allocation shape, Mesocycle permission, exercise safety, recovery
 * and load evidence before this candidate can reach a snapshot.
 */
export function resolveCanonicalTrainingMethodCandidate(input: CanonicalMethodCandidateInput): PrescriptionMethodFamily {
  const phase = input.mesocycleId ?? "";
  const intermediate = input.experience !== "beginner";
  const advanced = input.experience === "advanced";
  return phase === "strength_intensification" && advanced && input.exerciseRole === "primary_compound" ? "max_effort"
    : (phase === "strength_specific" || phase === "powerbuilding_strength") && intermediate && input.exerciseRole === "primary_compound" ? "back_off_sets"
      : phase === "strength_accumulation" && intermediate && input.exerciseRole === "primary_compound" ? "five_three_one"
        : (phase === "strength_accumulation" || phase === "powerbuilding_foundation") && intermediate && input.exerciseRole === "secondary_compound" ? "eight_across"
          : phase === "powerbuilding_hypertrophy" && intermediate && input.exerciseRole === "secondary_compound" ? "bbb"
            : (phase === "strength_specific" || phase === "athletic_force") && intermediate && input.exerciseRole === "primary_compound" ? "cluster"
              : (phase === "strength_accumulation" || phase === "hypertrophy_base") && input.exerciseRole === "secondary_compound" ? "ladder"
                : (phase === "hypertrophy_base" || phase === "powerbuilding_hypertrophy") && input.exerciseRole === "primary_compound" ? "pyramid"
                  : (phase === "hypertrophy_volume" || phase === "hypertrophy_specialisation") && intermediate && input.exerciseRole === "isolation" ? "amrap"
                    : (phase === "athletic_power" || phase === "strength_specific") && intermediate && input.sessionRole.toLowerCase().includes("power") ? "dynamic_effort"
                      : phase === "athletic_power" ? "dynamic_effort"
                        : phase.startsWith("strength_") && input.exerciseRole === "primary_compound" && intermediate ? "back_off_sets"
                          : "straight_sets";
}

export function resolveCanonicalTrainingMethod(input: CanonicalMethodSelectionInput): CanonicalMethodSelectionResult {
  if (input.readiness === "restricted" || input.specialState === "deload" || input.specialState === "transition") {
    return selected("straight_sets", ["fatigue_or_recovery_requires_repeatable_straight_sets"]);
  }
  const phase = input.mesocycleId;
  const candidate = resolveCanonicalTrainingMethodCandidate(input);
  const structureFits = candidate === "five_three_one" ? input.requiredSets === 3
    : candidate === "eight_across" ? input.requiredSets === 8
      : candidate === "bbb" ? input.requiredSets === 5
        : true;
  if (!structureFits || !input.permittedMethods.includes(candidate)) {
    return selected("straight_sets", [structureFits ? "mesocycle_does_not_permit_candidate" : "allocated_structure_does_not_fit_candidate", "straight_sets_fail_safe"]);
  }
  return selected(candidate, [`mesocycle:${phase}`, `role:${input.exerciseRole}`, `experience:${input.experience}`]);
}

function selected(method: PrescriptionMethodFamily, reasonCodes: readonly string[]): CanonicalMethodSelectionResult {
  return { status: "selected", policyId: CANONICAL_TRAINING_METHOD_POLICY_ID, method, reasonCodes };
}

export type CanonicalMethodSessionSlot = Readonly<{
  id: string;
  index: number;
  exercise: Exercise;
  method: PrescriptionMethodFamily;
  requiredSets: number;
  targetReps: number;
  restSeconds: number;
  loadState: string;
}>;

export function applyCanonicalSessionMethodStructures(input: Readonly<{
  goal: string;
  mesocycleId: MesocycleId;
  specialState: string;
  experience: ExperienceLevel;
  readiness?: "ready" | "restricted";
  slots: readonly CanonicalMethodSessionSlot[];
}>): readonly Readonly<{ id: string; method: PrescriptionMethodFamily; structure: CanonicalMethodStructure }>[] {
  const output = input.slots.map((slot) => ({
    id: slot.id,
    method: slot.method,
    structure: standalone(slot.method, slot.requiredSets, slot.restSeconds, [`selected_method:${slot.method}`]),
  }));
  if (input.readiness === "restricted" || ["deload", "transition", "taper"].includes(input.specialState) || input.experience === "beginner") return output;

  const restPausePhase = ["build_muscle", "build_muscle_and_strength"].includes(input.goal)
    && ["hypertrophy_volume", "hypertrophy_specialisation", "powerbuilding_hypertrophy"].includes(input.mesocycleId);
  if (restPausePhase) {
    const restPauseIndex = input.slots.findIndex((slot) =>
      (slot.method === "amrap"
        || (slot.method === "straight_sets"
          && slot.exercise.role === "secondary_compound"
          && slot.exercise.movementPattern === "horizontal_pull"))
      && slot.requiredSets === 3
      && slot.targetReps === 10
      && slot.loadState === "established"
      && ["secondary_compound", "accessory", "isolation"].includes(slot.exercise.role)
      && slot.exercise.stability === "high"
      && slot.exercise.skillDemand !== "high"
      && slot.exercise.fatigueCost !== "high"
      && !slot.exercise.equipment.includes("barbell"));
    if (restPauseIndex >= 0) {
      const slot = input.slots[restPauseIndex]!;
      output[restPauseIndex] = {
        id: slot.id,
        method: "rest_pause",
        structure: {
          kind: "rest_pause",
          policyId: CANONICAL_TRAINING_METHOD_POLICY_ID,
          method: "rest_pause",
          rounds: 3,
          activationReps: 10,
          miniSetTargetReps: 4,
          minimumMiniSetReps: 3,
          maximumMiniSets: 2,
          intraMethodRestSeconds: 20,
          interRoundRestSeconds: slot.restSeconds,
          executionLabel: "10-rep activation · up to 2 × 4 mini-sets · 20 sec",
          reasonCodes: ["established_load", "stable_accessory", `mesocycle:${input.mesocycleId}`, "observable_rep_stop_rule"],
          contract: methodContract("rest_pause", 3, slot.restSeconds),
        },
      };
    }
  }

  const supersetPhase = ["build_muscle", "build_muscle_and_strength", "athletic_performance"].includes(input.goal)
    && ["hypertrophy_volume", "hypertrophy_specialisation", "powerbuilding_hypertrophy", "athletic_general"].includes(input.mesocycleId);
  if (!supersetPhase) return output;
  for (let leftIndex = 0; leftIndex < input.slots.length - 1; leftIndex += 1) {
    const left = input.slots[leftIndex]!;
    const right = input.slots[leftIndex + 1]!;
    if (!eligibleAntagonistPair(left, right) || left.requiredSets !== right.requiredSets) continue;
    const groupId = `method-group:${left.id}:${right.id}`;
    output[leftIndex] = {
      id: left.id,
      method: "antagonist_superset",
      structure: linked(groupId, 1, left.requiredSets, left.exercise.id, right.exercise.id, left.exercise.name, right.exercise.name),
    };
    output[leftIndex + 1] = {
      id: right.id,
      method: "antagonist_superset",
      structure: linked(groupId, 2, right.requiredSets, left.exercise.id, right.exercise.id, left.exercise.name, right.exercise.name),
    };
    break;
  }
  return output;
}

function eligibleAntagonistPair(left: CanonicalMethodSessionSlot, right: CanonicalMethodSessionSlot): boolean {
  const safe = [left, right].every((slot) =>
    slot.exercise.role !== "primary_compound"
    && slot.exercise.skillDemand !== "high"
    && slot.exercise.fatigueCost !== "high"
    && slot.method === "straight_sets");
  if (!safe) return false;
  return antagonistPatterns(left.exercise.movementPattern, right.exercise.movementPattern)
    || flexionExtensionMuscles(left.exercise, right.exercise);
}

function antagonistPatterns(left: MovementPattern, right: MovementPattern): boolean {
  const pair = new Set([left, right]);
  return pair.has("horizontal_push") && pair.has("horizontal_pull")
    || pair.has("vertical_push") && pair.has("vertical_pull");
}

function flexionExtensionMuscles(left: Exercise, right: Exercise): boolean {
  const muscles = new Set([...left.primaryMuscles, ...right.primaryMuscles]);
  return muscles.has("biceps") && muscles.has("triceps")
    || muscles.has("quads") && muscles.has("hamstrings");
}

function standalone(method: PrescriptionMethodFamily, rounds: number, restSeconds: number, reasonCodes: readonly string[]): CanonicalMethodStructure {
  return { kind: "standalone", policyId: CANONICAL_TRAINING_METHOD_POLICY_ID, method, rounds, interRoundRestSeconds: restSeconds, executionLabel: method === "back_off_sets" ? `1 top set · ${Math.max(0, rounds - 1)} back-off sets` : `${rounds} standalone working sets`, reasonCodes, contract: methodContract(method, rounds, restSeconds) };
}

export function createCanonicalStraightSetStructure(rounds: number, restSeconds: number, reasonCodes: readonly string[] = ["method_adaptation:pair_removed"]): Extract<CanonicalMethodStructure, { kind: "standalone" }> {
  return standalone("straight_sets", rounds, restSeconds, reasonCodes) as Extract<CanonicalMethodStructure, { kind: "standalone" }>;
}

function linked(groupId: string, position: 1 | 2, rounds: number, leftId: string, rightId: string, leftName: string, rightName: string): Extract<CanonicalMethodStructure, { kind: "linked_rounds" }> {
  return {
    kind: "linked_rounds",
    policyId: CANONICAL_TRAINING_METHOD_POLICY_ID,
    method: "antagonist_superset",
    groupId,
    position,
    groupSize: 2,
    rounds,
    intraMethodRestSeconds: 0,
    interRoundRestSeconds: 60,
    pairedExerciseName: position === 1 ? rightName : leftName,
    pairedExerciseId: position === 1 ? rightId : leftId,
    executionLabel: `${position === 1 ? "A" : "B"} · ${rounds} rounds · ${leftName} + ${rightName}`,
    reasonCodes: ["antagonist_pair", "equal_rounds", "source:tier_manual_pdf_103_printed_87", "source:tier_manual_pdf_232"],
    contract: methodContract("antagonist_superset", rounds, 60),
  };
}

function methodContract(method: PrescriptionMethodFamily, rounds: number, restSeconds: number): CanonicalMethodContract {
  const setRoles = method === "back_off_sets" ? Array.from({ length: rounds }, (_, index) => index === 0 ? "top_set" as const : "back_off" as const)
    : method === "rest_pause" ? Array.from({ length: rounds }, (_, index) => index === 0 ? "activation" as const : "mini_set" as const)
      : Array.from({ length: rounds }, () => "standard" as const);
  const grouped = method === "antagonist_superset";
  return {
    contractVersion: CANONICAL_TRAINING_METHOD_CONTRACT_VERSION,
    setRoles,
    loadMultipliers: method === "back_off_sets" ? Array.from({ length: rounds }, (_, index) => index === 0 ? 1 : 0.9) : Array.from({ length: rounds }, () => 1),
    completionRule: method === "rest_pause" ? "complete prescribed observable repetitions without forced effort entry" : "complete each immutable prescribed set role",
    stopRule: method === "rest_pause" ? "stop when a mini-set falls below 3 clean reps or technique fails; the ordinary 15% set drop rule does not apply to intentionally smaller mini-sets" : "apply the slot canonical stop rule",
    progressionRule: method === "back_off_sets" ? "evaluate the top set and back-offs separately; change the smallest supported variable" : grouped ? "progress each paired exercise independently" : "use canonical exercise evidence",
    adaptationEligibility: "comparable completed exposure through persisted canonical evidence",
    substitutionCompatibility: method === "rest_pause" ? "stable low-skill non-barbell exercise retaining the same method" : method === "back_off_sets" ? "top-set/back-off eligible loadable exercise" : grouped ? "non-primary low-interference antagonist preserving the pair" : "compatible canonical exercise",
    durationCost: { setupSeconds: 0, transitionSeconds: grouped ? 20 : 0, activeSetSeconds: 40, restSeconds },
    explanation: method === "back_off_sets" ? "A heavier practice set is followed by lower-fatigue back-offs." : method === "rest_pause" ? "This stable exercise uses short, bounded work segments to save time." : grouped ? "These non-competing movements are paired to save time without removing work." : "Straight sets preserve repeatable performance.",
    evidenceAuthorityVersion: "canonical_progress_evidence_v1",
  };
}
