export const COMPATIBILITY_PRESCRIPTION_SCHEMA_VERSION = "v1" as const;
export const COMPATIBILITY_PRESCRIPTION_REGISTRY_ID = "compatibility_prescription_semantics_registry" as const;
export const COMPATIBILITY_PRESCRIPTION_REGISTRY_VERSION = "v1" as const;
export const COMPATIBILITY_PRESCRIPTION_FINGERPRINT_VERSION = "v1" as const;

export type CompatibilityBranchId =
  | "hypertrophy-primary-compound-fresh"
  | "hypertrophy-primary-compound-established"
  | "hypertrophy-accessory-fresh"
  | "hypertrophy-accessory-established"
  | "strength-primary"
  | "power-primary"
  | "deload-any-role";
export type CompatibilityBlockClassification = "hypertrophy" | "strength" | "power" | "deload";
export type CompatibilityExerciseClass = "primary_compound" | "secondary_compound" | "accessory";
export type CompatibilityHistoryState = "none" | "sparse" | "established" | "any";
export type CompatibilityLoadingCapability = "percentage_capable" | "small_increment" | "history_derived" | "any";
export type CompatibilitySuitabilityOutcome = "suitable" | "unsupported_rep_policy" | "unsupported_lane" | "unsupported_exercise_class" | "unsupported_loading_method" | "invalid_set_guidance" | "insufficient_history" | "invalid_combination";

export type CompatibilityBranchKey = Readonly<{
  blockClassification: CompatibilityBlockClassification;
  exerciseClass: CompatibilityExerciseClass;
  slotRole: "primary" | "secondary" | "accessory" | "any";
  movementFamily: "compound" | "isolation" | "any";
  historyState: CompatibilityHistoryState;
  loadingCapability: CompatibilityLoadingCapability;
  guidanceEnvelope: "compound" | "accessory" | "strength" | "power" | "deload";
  sessionContext: "generated_slot";
}>;

export type CompatibilityRepSemantics = Readonly<{
  policyId: string; policyVersion: string; minimum: number; maximum: number;
  exactSelection: "range_default" | "evidence_adjusted" | "deload_reduced";
  finalSet: "same_range" | "controlled_final_set"; adjustment: string;
  supportedExerciseClass: CompatibilityExerciseClass; reasonCode: string;
}>;
export type CompatibilityLaneSemantics = Readonly<{
  laneId: string; laneVersion: string; supportedExerciseClasses: readonly CompatibilityExerciseClass[];
  supportedSlotRoles: readonly string[]; repRelationship: string; setRelationship: string;
  loadRelationship: string; dropOffInfluence: string; reasonCode: string;
}>;
export type CompatibilitySetSemantics = Readonly<{
  policyId: string; policyVersion: string; guidancePrecedence: "caller_guidance_first" | "compatibility_default";
  exactCount: "minimum" | "within_envelope" | "reduced_envelope"; historyInfluence: string;
  classInfluence: string; backOff: "none" | "allowed"; minimumSets: number; maximumSets: number;
  invalidRange: "reject"; reasonCode: string;
}>;
export type CompatibilityLoadSemantics = Readonly<{
  policyId: string; policyVersion: string; method: "percentage_or_history" | "history_first" | "strength_hierarchy" | "power_hierarchy" | "deload_reduction";
  evidenceHierarchy: readonly string[]; noHistoryFallback: string; historyBehaviour: string;
  rounding: "available_increment"; incrementHandling: "respect_available_increment"; unsupportedResult: string; reasonCode: string;
}>;
export type CompatibilityDropOffSemantics = Readonly<{
  policyId: string; policyVersion: string; threshold: number; comparisonBasis: string;
  minimumObservations: number; enabled: boolean; reasonCode: string;
}>;
export type CompatibilityShutdownSemantics = Readonly<{
  policyId: string; policyVersion: string; scope: "exercise" | "session"; trigger: string;
  retainTriggeringSet: boolean; remainingSets: "cancel" | "continue"; laterJobs: "continue" | "stop"; reasonCode: string;
}>;
export type CompatibilitySuitabilitySemantics = Readonly<{
  outcome: CompatibilitySuitabilityOutcome; reasonCode: string; blocking: boolean;
}>;

export type CompatibilityPrescriptionSemantics = Readonly<{
  schemaVersion: typeof COMPATIBILITY_PRESCRIPTION_SCHEMA_VERSION;
  registryId: typeof COMPATIBILITY_PRESCRIPTION_REGISTRY_ID;
  registryVersion: typeof COMPATIBILITY_PRESCRIPTION_REGISTRY_VERSION;
  branchId: CompatibilityBranchId; branchKey: CompatibilityBranchKey;
  rep: CompatibilityRepSemantics; lane: CompatibilityLaneSemantics; set: CompatibilitySetSemantics;
  startingLoad: CompatibilityLoadSemantics; dropOff: CompatibilityDropOffSemantics;
  shutdown: CompatibilityShutdownSemantics; suitability: CompatibilitySuitabilitySemantics;
  sourceClassification: "compatibility_registry"; reasonCodes: readonly string[]; fingerprint: string;
}>;

export type CompatibilityPrescriptionResolution =
  | Readonly<{ status: "resolved"; semantics: CompatibilityPrescriptionSemantics }>
  | Readonly<{ status: "unsupported_branch" | "unsupported_exercise_class" | "unsupported_slot_role" | "invalid_set_guidance" | "unsupported_loading_method" | "insufficient_history" | "contradictory_branch" | "invalid_input" | "unsupported_registry_version"; reasonCode: string }>;

const stable = (value: unknown): string => JSON.stringify(value);
const fingerprint = (value: Omit<CompatibilityPrescriptionSemantics, "fingerprint">): string => `${COMPATIBILITY_PRESCRIPTION_FINGERPRINT_VERSION}|${stable(value)}`;

function branch(branchId: CompatibilityBranchId, key: CompatibilityBranchKey, rep: CompatibilityRepSemantics, lane: CompatibilityLaneSemantics, set: CompatibilitySetSemantics, load: CompatibilityLoadSemantics, deload = false): CompatibilityPrescriptionSemantics {
  const base = { schemaVersion: COMPATIBILITY_PRESCRIPTION_SCHEMA_VERSION, registryId: COMPATIBILITY_PRESCRIPTION_REGISTRY_ID, registryVersion: COMPATIBILITY_PRESCRIPTION_REGISTRY_VERSION, branchId, branchKey: key, rep, lane, set, startingLoad: load, dropOff: { policyId: `compatibility_dropoff_${branchId}_v1`, policyVersion: "v1", threshold: deload ? 0 : 20, comparisonBasis: "best_valid_working_set", minimumObservations: 2, enabled: !deload, reasonCode: deload ? "dropoff_disabled_for_deload" : "legacy_dropoff_threshold" }, shutdown: { policyId: `compatibility_shutdown_${branchId}_v1`, policyVersion: "v1", scope: "exercise" as const, trigger: deload ? "deload_recovery_limit" : "dropoff_threshold", retainTriggeringSet: true, remainingSets: deload ? "cancel" as const : "continue" as const, laterJobs: "continue" as const, reasonCode: "compatibility_shutdown_semantics" }, suitability: { outcome: "suitable" as const, reasonCode: "compatibility_branch_supported", blocking: false }, sourceClassification: "compatibility_registry" as const, reasonCodes: [rep.reasonCode, lane.reasonCode, set.reasonCode, load.reasonCode] };
  return { ...base, fingerprint: fingerprint(base) };
}

const key = (blockClassification: CompatibilityBlockClassification, exerciseClass: CompatibilityExerciseClass, historyState: CompatibilityHistoryState, loadingCapability: CompatibilityLoadingCapability, guidanceEnvelope: CompatibilityBranchKey["guidanceEnvelope"], slotRole: CompatibilityBranchKey["slotRole"]): CompatibilityBranchKey => ({ blockClassification, exerciseClass, historyState, loadingCapability, guidanceEnvelope, slotRole, movementFamily: exerciseClass === "accessory" ? "isolation" : "compound", sessionContext: "generated_slot" });
const rep = (id: string, min: number, max: number, exactSelection: CompatibilityRepSemantics["exactSelection"], exerciseClass: CompatibilityExerciseClass): CompatibilityRepSemantics => ({ policyId: id, policyVersion: "v1", minimum: min, maximum: max, exactSelection, finalSet: "same_range", adjustment: exactSelection === "evidence_adjusted" ? "history_evidence" : "none", supportedExerciseClass: exerciseClass, reasonCode: `rep_${id}` });
const lane = (id: string, exerciseClass: CompatibilityExerciseClass): CompatibilityLaneSemantics => ({ laneId: `compatibility_${id}`, laneVersion: "v1", supportedExerciseClasses: [exerciseClass], supportedSlotRoles: ["primary", "secondary", "accessory"], repRelationship: "lane_constrains_rep_policy", setRelationship: "lane_constrains_set_envelope", loadRelationship: "lane_selects_load_hierarchy", dropOffInfluence: "lane_selects_threshold", reasonCode: `lane_${id}` });
const set = (id: string, min: number, max: number, exactCount: CompatibilitySetSemantics["exactCount"]): CompatibilitySetSemantics => ({ policyId: id, policyVersion: "v1", guidancePrecedence: "caller_guidance_first", exactCount, historyInfluence: "evidence_when_available", classInfluence: "exercise_class_and_lane", backOff: "none", minimumSets: min, maximumSets: max, invalidRange: "reject", reasonCode: `set_${id}` });
const load = (method: CompatibilityLoadSemantics["method"], fallback: string): CompatibilityLoadSemantics => ({ policyId: `compatibility_load_${method}_v1`, policyVersion: "v1", method, evidenceHierarchy: ["established_history", "sparse_history", "percentage_reference", "explicit_review"], noHistoryFallback: fallback, historyBehaviour: "use_available_evidence_without_mutating_history", rounding: "available_increment", incrementHandling: "respect_available_increment", unsupportedResult: "unsupported_loading_method", reasonCode: `load_${method}` });

export const COMPATIBILITY_PRESCRIPTION_REGISTRY: readonly CompatibilityPrescriptionSemantics[] = [
  branch("hypertrophy-primary-compound-fresh", key("hypertrophy", "primary_compound", "none", "percentage_capable", "compound", "primary"), rep("hypertrophy_compound", 6, 12, "range_default", "primary_compound"), lane("primary_compound", "primary_compound"), set("compound", 1, 5, "minimum"), load("percentage_or_history", "percentage_reference")),
  branch("hypertrophy-primary-compound-established", key("hypertrophy", "primary_compound", "established", "history_derived", "compound", "primary"), rep("hypertrophy_compound", 6, 12, "evidence_adjusted", "primary_compound"), lane("primary_compound", "primary_compound"), set("compound_evidence", 1, 5, "within_envelope"), load("history_first", "explicit_review")),
  branch("hypertrophy-accessory-fresh", key("hypertrophy", "accessory", "none", "small_increment", "accessory", "accessory"), rep("hypertrophy_accessory", 10, 20, "range_default", "accessory"), lane("accessory", "accessory"), set("accessory", 1, 4, "minimum"), load("percentage_or_history", "conservative_increment")),
  branch("hypertrophy-accessory-established", key("hypertrophy", "accessory", "established", "history_derived", "accessory", "accessory"), rep("hypertrophy_accessory", 10, 20, "evidence_adjusted", "accessory"), lane("accessory", "accessory"), set("accessory_evidence", 1, 4, "within_envelope"), load("history_first", "explicit_review")),
  branch("strength-primary", key("strength", "primary_compound", "any", "any", "strength", "primary"), rep("strength_primary", 3, 8, "range_default", "primary_compound"), lane("strength", "primary_compound"), set("strength", 1, 5, "within_envelope"), load("strength_hierarchy", "explicit_review")),
  branch("power-primary", key("power", "primary_compound", "any", "any", "power", "primary"), rep("power_primary", 1, 6, "range_default", "primary_compound"), lane("power", "primary_compound"), set("power", 1, 5, "within_envelope"), load("power_hierarchy", "explicit_review")),
  branch("deload-any-role", key("deload", "accessory", "any", "any", "deload", "any"), rep("deload", 8, 15, "deload_reduced", "accessory"), lane("recovery", "accessory"), set("deload", 1, 3, "reduced_envelope"), load("deload_reduction", "explicit_review"), true),
];

export function copyCompatibilityPrescriptionSemantics(value: CompatibilityPrescriptionSemantics): CompatibilityPrescriptionSemantics { return JSON.parse(JSON.stringify(value)) as CompatibilityPrescriptionSemantics; }
export function validateCompatibilityPrescriptionSemantics(value: CompatibilityPrescriptionSemantics): readonly string[] {
  const issues: string[] = [];
  if (value.schemaVersion !== "v1" || value.registryVersion !== "v1") issues.push("unsupported_version");
  if (!value.branchId || !value.branchKey || value.sourceClassification !== "compatibility_registry") issues.push("identity_invalid");
  if (!Number.isInteger(value.rep.minimum) || !Number.isInteger(value.rep.maximum) || value.rep.minimum > value.rep.maximum) issues.push("rep_bounds_invalid");
  if (!Number.isInteger(value.set.minimumSets) || !Number.isInteger(value.set.maximumSets) || value.set.minimumSets > value.set.maximumSets) issues.push("set_bounds_invalid");
  if (value.dropOff.enabled && value.dropOff.threshold <= 0) issues.push("dropoff_invalid");
  if (!value.shutdown.trigger || !value.shutdown.policyId) issues.push("shutdown_invalid");
  if (value.suitability.outcome === "suitable" && value.suitability.blocking) issues.push("suitability_incoherent");
  if (value.rep.supportedExerciseClass !== value.branchKey.exerciseClass) issues.push("rep_branch_mismatch");
  if (!value.lane.supportedExerciseClasses.includes(value.branchKey.exerciseClass)) issues.push("lane_branch_mismatch");
  return issues;
}
export function fingerprintCompatibilityPrescriptionSemantics(value: CompatibilityPrescriptionSemantics): string { const { fingerprint: _ignored, ...rest } = value; return fingerprint(rest); }
export function lookupCompatibilityPrescriptionSemantics(branchKey: CompatibilityBranchKey): Readonly<{ status: "found"; semantics: CompatibilityPrescriptionSemantics } | { status: "missing" | "ambiguous" | "invalid_key"; reasonCode: string }> {
  if (!branchKey || branchKey.sessionContext !== "generated_slot") return { status: "invalid_key", reasonCode: "branch_key_invalid" };
  const matches = COMPATIBILITY_PRESCRIPTION_REGISTRY.filter((entry) => Object.keys(entry.branchKey).every((field) => entry.branchKey[field as keyof CompatibilityBranchKey] === branchKey[field as keyof CompatibilityBranchKey]));
  if (matches.length === 0) return { status: "missing", reasonCode: "branch_not_registered" };
  if (matches.length > 1) return { status: "ambiguous", reasonCode: "duplicate_branch_key" };
  return { status: "found", semantics: copyCompatibilityPrescriptionSemantics(matches[0]) };
}
export function resolveCompatibilityPrescriptionSemantics(branchKey: CompatibilityBranchKey): CompatibilityPrescriptionResolution {
  const result = lookupCompatibilityPrescriptionSemantics(branchKey);
  if (result.status !== "found") return { status: result.status === "missing" ? "unsupported_branch" : "invalid_input", reasonCode: result.reasonCode };
  const issues = validateCompatibilityPrescriptionSemantics(result.semantics);
  return issues.length ? { status: "contradictory_branch", reasonCode: issues.join(",") } : { status: "resolved", semantics: result.semantics };
}
export function compatibilityRegistryFingerprint(): string { return stable(COMPATIBILITY_PRESCRIPTION_REGISTRY.map((entry) => entry.fingerprint)); }
