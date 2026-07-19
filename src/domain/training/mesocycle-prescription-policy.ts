import type { MacrocycleEngineId, MacrocycleSpec } from "@/domain/training/macrocycle-engine";
import { mesocycleById, mesocycleLibrary, type MesocycleId, type MesocycleSpec } from "@/domain/training/mesocycle-library";
import type { TrainingLane } from "@/domain/training/models";

export const MESOCYCLE_PRESCRIPTION_POLICY_VERSION = "mesocycle_prescription_policy_v1" as const;
export type PrescriptionMethodFamily = "straight_sets" | "back_off_sets" | "amrap" | "five_three_one" | "eight_across" | "pyramid" | "ladder" | "cluster" | "bbb" | "dynamic_effort" | "max_effort" | "heavy_single_triple_five_backoffs";
export type FatigueBoundary = "normal" | "tight" | "very_tight" | "recovery_first";
export type ProgressionFamily = "double_progression" | "load_progression" | "velocity_intent" | "expression" | "fatigue_reduction";
export type CanonicalLaneCharacter = "hypertrophy" | "strength" | "power" | "recovery" | "expression";
export type TargetGenerationMode = "rep_region" | "established_load" | "velocity_intent" | "expression" | "fatigue_reduction";
export type ConstructionRole = "primary" | "secondary" | "accessory";
export type CanonicalTargetEnvelope = Readonly<{ minReps: number; maxReps: number; preferredBias: "higher" | "moderate" | "lower" | "very_low"; loadingMode: "calibrated_load" | "established_percentage" | "rep_progression" | "velocity_intent" | "expression" | "fatigue_reduction"; establishedLoad: "required" | "preferred" | "not_required"; backOffPermitted: boolean; amrapPermitted: boolean; failurePermitted: boolean; dropOffPolicyId: string; provenance: readonly string[] }>;
export type CanonicalTargetCombination = Readonly<{ role: ConstructionRole; lane: TrainingLane; method: PrescriptionMethodFamily; evidence: "established" | "calibrated" | "absent"; outcome: "envelope" | "rejected"; reason?: "method_not_permitted" | "established_load_required" }>;

export type MesocyclePrescriptionPolicy = Readonly<{
  schemaVersion: typeof MESOCYCLE_PRESCRIPTION_POLICY_VERSION;
  mesocycleId: MesocycleId;
  purpose: string;
  primaryAdaptation: string;
  retainedQualities: readonly string[];
  prohibitedEmphases: readonly string[];
  loading: Readonly<{ character: "low" | "moderate" | "high" | "very_high"; establishedPercentagePermitted: boolean; calibrationRequired: boolean }>;
  lane: Readonly<{ allowed: readonly CanonicalLaneCharacter[]; prohibited: readonly CanonicalLaneCharacter[]; preferred: CanonicalLaneCharacter; readinessRestriction?: "none" | "recovery_first" | "expression_only" }>;
  concreteLanes: Readonly<{ allowed: readonly TrainingLane[]; prohibited: readonly TrainingLane[]; required?: TrainingLane; preferredByRole: Readonly<Record<ConstructionRole, TrainingLane>>; fallbacksByRole: Readonly<Record<ConstructionRole, readonly TrainingLane[]>>; calibrationRequired: readonly TrainingLane[]; establishedLoadRequired: readonly TrainingLane[] }>;
  targets: Readonly<{ modes: readonly TargetGenerationMode[]; minimumRepTarget: number; maximumRepTarget: number; establishedLoadRequired: boolean; backOffPermitted: boolean; failureOrAmrapPermitted: boolean }>;
  targetEnvelopes: Readonly<Record<ConstructionRole, Readonly<Partial<Record<TrainingLane, CanonicalTargetEnvelope>>>> >;
  volume: Readonly<{ character: "low" | "moderate" | "high"; progression: "increase" | "hold" | "reduce" | "adaptive"; recoveryAdjustment: "permitted" | "required" | "prohibited" }>;
  methods: Readonly<{ permitted: readonly PrescriptionMethodFamily[]; prohibited: readonly PrescriptionMethodFamily[]; conditional: readonly PrescriptionMethodFamily[] }>;
  exerciseSuitability: Readonly<{ roles: readonly ("primary_compound" | "secondary_compound" | "accessory" | "isolation" | "power" | "recovery")[]; stability: "low" | "moderate" | "high"; technicalComplexity: "low" | "moderate" | "high"; specificity: "general" | "mixed" | "specific"; fatigueCost: "low" | "moderate" | "high" }>;
  specialStateScoring: Readonly<{ state: "standard" | "deload" | "taper" | "peak" | "speed_power" | "transition"; fatiguePenalty: "none" | "moderate" | "high"; specificityBonus: "none" | "moderate" | "high"; velocityRequired: boolean }>;
  strengthAnchor: Readonly<{ required: boolean; roles: readonly ("primary_compound" | "secondary_compound")[]; specificity: "general" | "mixed" | "specific"; loadability: "optional" | "preferred" | "required"; calibrationRequired: boolean }>;
  dropOff: Readonly<{ monitoring: "rep" | "velocity" | "recovery" | "none"; status: "required" | "permitted" | "prohibited"; thresholdPolicyId: string; response: "continue" | "reduce" | "stop"; evidenceRequired: boolean }>;
  fatigue: Readonly<{ boundary: FatigueBoundary; monitoring: "rep" | "velocity" | "recovery" | "none"; stopPolicy: "continue" | "reduce" | "stop" }>;
  specialState: "standard" | "deload" | "taper" | "peak" | "speed_power" | "transition";
  progression: Readonly<{ permitted: readonly ProgressionFamily[]; evidenceRequired: boolean; exitEvidence: readonly string[] }>;
  transition: Readonly<{ entryRequirements: readonly string[]; continuationRequirements: readonly string[]; exitRequirements: readonly string[]; approvedSuccessors: readonly MesocycleId[] }>;
}>;

export type MesocyclePolicyResult = Readonly<{ status: "resolved"; policy: MesocyclePrescriptionPolicy } | { status: "invalid" | "unsupported" | "incompatible"; reason: "unknown_mesocycle" | "invalid_macrocycle" | "incompatible_engine" | "empty_method_eligibility" | "contradictory_methods" | "invalid_fatigue_policy" | "invalid_transition" }>;

export function resolveMesocyclePrescriptionPolicy(mesocycleId: MesocycleId, macrocycle?: Pick<MacrocycleSpec, "goal"> & { engine?: MacrocycleEngineId }): MesocyclePolicyResult {
  const spec = mesocycleById(mesocycleId);
  if (!spec) return { status: "unsupported", reason: "unknown_mesocycle" };
  if (macrocycle?.engine && macrocycle.engine !== spec.engine) return { status: "incompatible", reason: "incompatible_engine" };
  const policy = policyFor(spec);
  const validation = validateMesocyclePrescriptionPolicy(policy);
  return validation.status === "resolved" ? { status: "resolved", policy } : validation;
}

export function validateMesocyclePrescriptionPolicy(policy: MesocyclePrescriptionPolicy): MesocyclePolicyResult {
  if (!policy.methods.permitted.length) return { status: "invalid", reason: "empty_method_eligibility" };
  if (policy.methods.permitted.some((method) => policy.methods.prohibited.includes(method))) return { status: "invalid", reason: "contradictory_methods" };
  if (!policy.transition.approvedSuccessors.every((id) => Boolean(mesocycleById(id)))) return { status: "invalid", reason: "invalid_transition" };
  if (policy.fatigue.boundary === "recovery_first" && policy.fatigue.stopPolicy === "continue") return { status: "invalid", reason: "invalid_fatigue_policy" };
  if (policy.targets.minimumRepTarget < 1 || policy.targets.maximumRepTarget < policy.targets.minimumRepTarget) return { status: "invalid", reason: "invalid_fatigue_policy" };
  if (!policy.lane.allowed.includes(policy.lane.preferred) || policy.lane.allowed.some((lane) => policy.lane.prohibited.includes(lane))) return { status: "invalid", reason: "contradictory_methods" };
  for (const role of ["primary", "secondary", "accessory"] as const) {
    const preferred = policy.concreteLanes.preferredByRole[role];
  if (!policy.concreteLanes.allowed.includes(preferred) || policy.concreteLanes.prohibited.includes(preferred)) return { status: "invalid", reason: "contradictory_methods" };
    if (!policy.concreteLanes.fallbacksByRole[role].every((lane) => policy.concreteLanes.allowed.includes(lane))) return { status: "invalid", reason: "contradictory_methods" };
    if (!policy.concreteLanes.allowed.every((lane) => policy.targetEnvelopes[role][lane])) return { status: "invalid", reason: "invalid_transition" };
  }
  return { status: "resolved", policy };
}

export function allMesocyclePrescriptionPolicies(): readonly MesocyclePrescriptionPolicy[] {
  return mesocycleLibrary.map((spec) => {
    const result = resolveMesocyclePrescriptionPolicy(spec.id);
    if (result.status !== "resolved") throw new Error(`invalid mesocycle policy: ${spec.id}`);
    return result.policy;
  });
}

export function enumerateMesocycleTargetCombinations(policy: MesocyclePrescriptionPolicy): readonly CanonicalTargetCombination[] {
  const combinations: CanonicalTargetCombination[] = [];
  for (const role of ["primary", "secondary", "accessory"] as const) {
    for (const lane of policy.concreteLanes.allowed) {
      for (const method of policy.methods.permitted) {
        const envelope = policy.targetEnvelopes[role][lane];
        if (!envelope) { combinations.push({ role, lane, method, evidence: "absent", outcome: "rejected", reason: "method_not_permitted" }); continue; }
        for (const evidence of ["established", "calibrated", "absent"] as const) combinations.push({ role, lane, method, evidence, outcome: envelope.establishedLoad === "required" && evidence === "absent" ? "rejected" : "envelope", ...(envelope.establishedLoad === "required" && evidence === "absent" ? { reason: "established_load_required" as const } : {}) });
      }
    }
  }
  return combinations;
}

function policyFor(spec: MesocycleSpec): MesocyclePrescriptionPolicy {
  const id = spec.id;
  const transition = { entryRequirements: ["macrocycle permits mesocycle"], continuationRequirements: spec.successCriteria, exitRequirements: spec.exitCriteria, approvedSuccessors: spec.nextStates };
  const isTransition = id.endsWith("transition");
  const isDeload = id.includes("consolidation") || isTransition;
  const isTaper = id.includes("taper");
  const isRealisation = id.includes("realisation");
  const isPower = id.includes("athletic_power") || id.includes("intensification") || id.includes("specific");
  const methods: PrescriptionMethodFamily[] = ["straight_sets", "back_off_sets"];
  if (!isDeload && !isTaper) methods.push("pyramid");
  if (!isDeload && !isTaper && (id.includes("strength") || id.includes("specific") || isRealisation)) methods.push("heavy_single_triple_five_backoffs");
  if (!isDeload && !isTaper && isPower) methods.push("dynamic_effort");
  if (["hypertrophy_base", "hypertrophy_volume", "hypertrophy_specialisation", "powerbuilding_hypertrophy"].includes(id)) methods.push("amrap");
  if (["hypertrophy_volume", "hypertrophy_specialisation", "powerbuilding_hypertrophy"].includes(id)) methods.push("eight_across");
  const conditionalMethods: PrescriptionMethodFamily[] = id === "powerbuilding_hypertrophy"
    ? ["bbb"]
    : id === "strength_accumulation" || id === "strength_specific"
      ? ["cluster", "ladder"]
      : [];
  const specialState: MesocyclePrescriptionPolicy["specialState"] = isTaper ? "taper" : isRealisation ? "peak" : isPower ? "speed_power" : isDeload ? "deload" : "standard";
  const allowedLanes: TrainingLane[] = isDeload || isTransition ? ["recovery", "maintenance"] : isRealisation ? ["peak", "strength_support", "maintenance"] : isPower ? ["power", "strength_support", "maintenance"] : id.includes("strength") ? ["strength", "strength_support", "hypertrophy_strength", "maintenance"] : ["hypertrophy", "hypertrophy_strength", "strength_support", "maintenance"];
  const primaryLane = allowedLanes[0]!;
  const secondaryLane = allowedLanes.includes("strength_support") ? "strength_support" : allowedLanes.includes("hypertrophy_strength") ? "hypertrophy_strength" : primaryLane;
  const accessoryLane = allowedLanes.includes("maintenance") ? "maintenance" : allowedLanes.includes("hypertrophy") ? "hypertrophy" : primaryLane;
  const envelope = (role: ConstructionRole, lane: TrainingLane): CanonicalTargetEnvelope => ({ minReps: role === "primary" && (lane === "strength" || lane === "peak" || lane === "power") ? 1 : role === "accessory" ? 8 : 4, maxReps: role === "accessory" ? 20 : lane === "power" || lane === "peak" ? 5 : 15, preferredBias: lane === "power" || lane === "peak" || lane === "strength" ? "lower" : role === "accessory" ? "higher" : "moderate", loadingMode: lane === "power" ? "velocity_intent" : lane === "peak" ? "expression" : isDeload || isTransition ? "fatigue_reduction" : "rep_progression", establishedLoad: lane === "peak" || lane === "strength" ? "preferred" : "not_required", backOffPermitted: lane !== "peak", amrapPermitted: methods.includes("amrap") && lane !== "peak", failurePermitted: false, dropOffPolicyId: `mesocycle:${id}:dropoff:v1`, provenance: [`mesocycle:${id}`, `role:${role}`, `lane:${lane}`] });
  return {
    schemaVersion: MESOCYCLE_PRESCRIPTION_POLICY_VERSION,
    mesocycleId: spec.id,
    purpose: spec.adaptation,
    primaryAdaptation: spec.primaryStimulus,
    retainedQualities: spec.maintenanceStimuli,
    prohibitedEmphases: isDeload ? ["maximal accumulation", "failure chasing"] : isTaper || isRealisation ? ["high fatigue accumulation"] : [],
    loading: { character: isTaper || isRealisation ? "very_high" : isPower ? "high" : "moderate", establishedPercentagePermitted: isTaper || isRealisation || id.includes("strength"), calibrationRequired: id.includes("calibration") || id.includes("foundation") },
    lane: { allowed: isDeload || isTransition ? ["recovery", "hypertrophy"] : isRealisation ? ["expression", "strength"] : isPower ? ["power", "strength"] : ["hypertrophy", "strength"], prohibited: isDeload || isTransition ? ["expression", "power"] : [], preferred: isDeload || isTransition ? "recovery" : isRealisation ? "expression" : isPower ? "power" : id.includes("strength") ? "strength" : "hypertrophy", readinessRestriction: isDeload || isTransition ? "recovery_first" : isRealisation ? "expression_only" : "none" },
    concreteLanes: { allowed: allowedLanes, prohibited: isDeload || isTransition ? ["power", "peak", "strength"] : isTaper ? ["power"] : [], required: isDeload || isTransition ? "recovery" : undefined, preferredByRole: { primary: primaryLane, secondary: secondaryLane, accessory: accessoryLane }, fallbacksByRole: { primary: allowedLanes.slice(1), secondary: allowedLanes.slice(1), accessory: allowedLanes.slice(1) }, calibrationRequired: allowedLanes.filter((lane) => lane === "peak" || lane === "power"), establishedLoadRequired: allowedLanes.filter((lane) => lane === "peak" || lane === "strength") },
    targets: { modes: isDeload || isTransition ? ["fatigue_reduction", "rep_region"] : isPower ? ["velocity_intent", "established_load"] : isRealisation ? ["expression", "established_load"] : ["rep_region", "established_load"], minimumRepTarget: isPower || isRealisation ? 1 : 4, maximumRepTarget: isPower || isRealisation ? 12 : 20, establishedLoadRequired: isRealisation, backOffPermitted: !isRealisation, failureOrAmrapPermitted: methods.includes("amrap") },
    targetEnvelopes: { primary: Object.fromEntries(allowedLanes.map((lane) => [lane, envelope("primary", lane)])), secondary: Object.fromEntries(allowedLanes.map((lane) => [lane, envelope("secondary", lane)])), accessory: Object.fromEntries(allowedLanes.map((lane) => [lane, envelope("accessory", lane)])) },
    volume: { character: isDeload || isTransition ? "low" : id.includes("volume") || id.includes("hypertrophy") ? "high" : "moderate", progression: isDeload || isTransition ? "reduce" : id.includes("volume") ? "adaptive" : "increase", recoveryAdjustment: isDeload || isTransition ? "required" : "permitted" },
    methods: { permitted: methods, prohibited: isDeload ? ["amrap", "dynamic_effort", "max_effort", "heavy_single_triple_five_backoffs", "bbb"] : isTaper ? ["amrap", "eight_across", "max_effort", "bbb"] : [], conditional: conditionalMethods },
    exerciseSuitability: { roles: isPower || isRealisation ? ["primary_compound", "secondary_compound", "power"] : ["primary_compound", "secondary_compound", "accessory", "isolation", "recovery"], stability: isPower || isRealisation ? "high" : "moderate", technicalComplexity: isPower || isRealisation ? "high" : "moderate", specificity: isPower || isRealisation ? "specific" : "mixed", fatigueCost: isDeload || isTransition ? "low" : isPower || isRealisation ? "high" : "moderate" },
    specialStateScoring: { state: specialState, fatiguePenalty: isDeload || isTransition ? "high" : isTaper || isRealisation ? "moderate" : "none", specificityBonus: isRealisation || isTaper ? "high" : isPower ? "moderate" : "none", velocityRequired: isPower },
    strengthAnchor: { required: isPower || isRealisation || id.includes("strength"), roles: ["primary_compound", "secondary_compound"], specificity: isPower || isRealisation ? "specific" : "mixed", loadability: isPower || isRealisation ? "required" : "preferred", calibrationRequired: isPower || isRealisation },
    dropOff: { monitoring: isPower ? "velocity" : isDeload || isTransition ? "recovery" : "rep", status: isDeload || isTransition ? "required" : isTaper || isRealisation ? "required" : "permitted", thresholdPolicyId: `mesocycle:${id}:dropoff:v1`, response: isDeload || isTransition ? "reduce" : isTaper || isRealisation ? "stop" : "continue", evidenceRequired: true },
    fatigue: { boundary: isDeload || isTransition ? "recovery_first" : isTaper || isRealisation ? "very_tight" : isPower ? "tight" : "normal", monitoring: isPower ? "velocity" : isDeload || isTransition ? "recovery" : "rep", stopPolicy: isDeload || isTransition ? "reduce" : isTaper || isRealisation ? "stop" : "continue" },
    specialState,
    progression: { permitted: isDeload || isTransition ? ["fatigue_reduction"] : isPower ? ["velocity_intent", "expression"] : ["double_progression", "load_progression"], evidenceRequired: true, exitEvidence: spec.exitCriteria },
    transition,
  };
}
