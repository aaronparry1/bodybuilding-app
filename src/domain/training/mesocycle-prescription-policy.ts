import type { MacrocycleEngineId, MacrocycleSpec } from "@/domain/training/macrocycle-engine";
import { mesocycleById, mesocycleLibrary, type MesocycleId, type MesocycleSpec } from "@/domain/training/mesocycle-library";

export const MESOCYCLE_PRESCRIPTION_POLICY_VERSION = "mesocycle_prescription_policy_v1" as const;
export type PrescriptionMethodFamily = "straight_sets" | "back_off_sets" | "amrap" | "five_three_one" | "eight_across" | "pyramid" | "ladder" | "cluster" | "bbb" | "dynamic_effort" | "max_effort" | "heavy_single_triple_five_backoffs";
export type FatigueBoundary = "normal" | "tight" | "very_tight" | "recovery_first";
export type ProgressionFamily = "double_progression" | "load_progression" | "velocity_intent" | "expression" | "fatigue_reduction";

export type MesocyclePrescriptionPolicy = Readonly<{
  schemaVersion: typeof MESOCYCLE_PRESCRIPTION_POLICY_VERSION;
  mesocycleId: MesocycleId;
  purpose: string;
  primaryAdaptation: string;
  retainedQualities: readonly string[];
  prohibitedEmphases: readonly string[];
  loading: Readonly<{ character: "low" | "moderate" | "high" | "very_high"; establishedPercentagePermitted: boolean; calibrationRequired: boolean }>;
  volume: Readonly<{ character: "low" | "moderate" | "high"; progression: "increase" | "hold" | "reduce" | "adaptive"; recoveryAdjustment: "permitted" | "required" | "prohibited" }>;
  methods: Readonly<{ permitted: readonly PrescriptionMethodFamily[]; prohibited: readonly PrescriptionMethodFamily[]; conditional: readonly PrescriptionMethodFamily[] }>;
  exerciseSuitability: Readonly<{ roles: readonly ("primary_compound" | "secondary_compound" | "accessory" | "isolation" | "power" | "recovery")[]; stability: "low" | "moderate" | "high"; technicalComplexity: "low" | "moderate" | "high"; specificity: "general" | "mixed" | "specific"; fatigueCost: "low" | "moderate" | "high" }>;
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
  return { status: "resolved", policy };
}

export function allMesocyclePrescriptionPolicies(): readonly MesocyclePrescriptionPolicy[] {
  return mesocycleLibrary.map((spec) => {
    const result = resolveMesocyclePrescriptionPolicy(spec.id);
    if (result.status !== "resolved") throw new Error(`invalid mesocycle policy: ${spec.id}`);
    return result.policy;
  });
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
  if (!isDeload && !isTaper && (id.includes("power") || id.includes("intensification"))) methods.push("dynamic_effort");
  if (!isDeload && !isTaper && (id.includes("base") || id.includes("volume") || id.includes("hypertrophy"))) methods.push("amrap", "eight_across");
  const specialState: MesocyclePrescriptionPolicy["specialState"] = isTaper ? "taper" : isRealisation ? "peak" : isPower ? "speed_power" : isDeload ? "deload" : "standard";
  return {
    schemaVersion: MESOCYCLE_PRESCRIPTION_POLICY_VERSION,
    mesocycleId: spec.id,
    purpose: spec.adaptation,
    primaryAdaptation: spec.primaryStimulus,
    retainedQualities: spec.maintenanceStimuli,
    prohibitedEmphases: isDeload ? ["maximal accumulation", "failure chasing"] : isTaper || isRealisation ? ["high fatigue accumulation"] : [],
    loading: { character: isTaper || isRealisation ? "very_high" : isPower ? "high" : "moderate", establishedPercentagePermitted: isTaper || isRealisation || id.includes("strength"), calibrationRequired: id.includes("calibration") || id.includes("foundation") },
    volume: { character: isDeload || isTransition ? "low" : id.includes("volume") || id.includes("hypertrophy") ? "high" : "moderate", progression: isDeload || isTransition ? "reduce" : id.includes("volume") ? "adaptive" : "increase", recoveryAdjustment: isDeload || isTransition ? "required" : "permitted" },
    methods: { permitted: methods, prohibited: isDeload ? ["amrap", "dynamic_effort", "max_effort", "heavy_single_triple_five_backoffs"] : isTaper ? ["amrap", "eight_across", "max_effort"] : [], conditional: ["cluster", "ladder", "bbb"] },
    exerciseSuitability: { roles: isPower || isRealisation ? ["primary_compound", "secondary_compound", "power"] : ["primary_compound", "secondary_compound", "accessory", "isolation", "recovery"], stability: isPower || isRealisation ? "high" : "moderate", technicalComplexity: isPower || isRealisation ? "high" : "moderate", specificity: isPower || isRealisation ? "specific" : "mixed", fatigueCost: isDeload || isTransition ? "low" : isPower || isRealisation ? "high" : "moderate" },
    fatigue: { boundary: isDeload || isTransition ? "recovery_first" : isTaper || isRealisation ? "very_tight" : isPower ? "tight" : "normal", monitoring: isPower ? "velocity" : isDeload || isTransition ? "recovery" : "rep", stopPolicy: isDeload || isTransition ? "reduce" : isTaper || isRealisation ? "stop" : "continue" },
    specialState,
    progression: { permitted: isDeload || isTransition ? ["fatigue_reduction"] : isPower ? ["velocity_intent", "expression"] : ["double_progression", "load_progression"], evidenceRequired: true, exitEvidence: spec.exitCriteria },
    transition,
  };
}
