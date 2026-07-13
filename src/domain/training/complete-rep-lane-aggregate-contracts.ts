import type { CompatibilityExerciseClass } from "@/domain/training/compatibility-prescription-semantics";

export const COMPLETE_REP_LANE_SCHEMA_VERSION = "v2" as const;
export const COMPLETE_REP_LANE_REGISTRY_VERSION = "v2" as const;
export const COMPLETE_REP_LANE_FINGERPRINT_VERSION = "v2" as const;

export type CompatibilityLaneIdentity = "strength" | "strength_support" | "hypertrophy_strength" | "hypertrophy" | "power" | "peak" | "maintenance" | "recovery";
export type AuthorityCategory = "explicit_slot_override" | "advanced_method" | "exercise_family" | "explicit_role" | "inferred_role" | "corrective_family" | "recovery_family" | "power_family" | "planned_order" | "block_compatibility" | "programme_default" | "compatibility_fallback";
export type AuthorityStatus = "production_active" | "deprecated_reachable" | "test_only";

export type CompleteRepLaneBranchKey = Readonly<{
  blockClassification: "hypertrophy" | "powerbuilding" | "strength" | "power" | "peak" | "deload";
  sessionRole: "upper" | "lower" | "unknown";
  plannedOrderClass: "first" | "early" | "later" | "unknown";
  slotRole: string;
  exerciseRole: string;
  exerciseClass: CompatibilityExerciseClass;
  movementFamily: string;
  prescriptionFamily: "ordinary" | "corrective" | "recovery" | "power";
  explicitSlotOverrideId: string | null;
  exerciseFamilyOverrideId: string | null;
  advancedMethodId: string | null;
  programmeDefaultId: string | null;
  historyState: "none" | "sparse" | "established" | "any";
  loadingCapability: "percentage_capable" | "small_increment" | "history_derived" | "any";
  guidanceEnvelope: string;
}>;

export type CompatibilityPrescriptionAuthorityCandidate = Readonly<{
  authorityId: string; authorityVersion: string; category: AuthorityCategory;
  appliesTo: "rep" | "lane" | "both"; precedenceRank: number;
  requiredFacts: readonly string[]; matched: boolean; status: AuthorityStatus;
  reasonCode: string; repBranchId?: string; laneIdentity?: CompatibilityLaneIdentity;
}>;

export type CompatibilityPrescriptionPrecedenceTrace = Readonly<{
  schemaVersion: typeof COMPLETE_REP_LANE_SCHEMA_VERSION;
  branchKey: CompleteRepLaneBranchKey;
  evaluatedAuthorityIds: readonly string[];
  matchingAuthorityIds: readonly string[];
  selectedRepAuthorityId: string | null;
  selectedLaneAuthorityId: string | null;
  rejectedRepAuthorityIds: readonly string[];
  rejectedLaneAuthorityIds: readonly string[];
  collisionReasonCodes: readonly string[];
  fingerprint: string;
}>;

export type CompleteRepSemantics = Readonly<{
  authorityId: string; policyId: string; policyVersion: string; minimum: number; maximum: number;
  exactMode: "range" | "evidence_adjusted" | "override" | "deload_reduced";
  finalSetBehaviour: string; overrideSource: string | null; methodIdentity: string | null;
  roleStatus: "explicit" | "inferred"; prescriptionFamily: CompleteRepLaneBranchKey["prescriptionFamily"];
  reasonCodes: readonly string[];
}>;

export type CompleteLaneSemantics = Readonly<{
  authorityId: string; laneId: CompatibilityLaneIdentity; laneVersion: string;
  supportedSessionRoles: readonly string[]; supportedSlotRoles: readonly string[];
  plannedOrderClasses: readonly CompleteRepLaneBranchKey["plannedOrderClass"][];
  exerciseClasses: readonly CompatibilityExerciseClass[]; familyConstraints: readonly string[];
  repRelationship: string; setRelationship: string; loadRelationship: string;
  dropOffRelationship: string; suitabilityRelationship: string; reasonCodes: readonly string[];
}>;

export type RepLanePairing = Readonly<{ repAuthorityId: string; laneId: CompatibilityLaneIdentity; allowed: boolean; reasonCode: string }>;
export type GeneratedSettingsOwnership = Readonly<{ field: string; classification: "authority_input" | "precedence_input" | "derived_projection" | "downstream_arithmetic_input" | "display_metadata" | "duplicate_authority"; owner: string; reasonCode: string }>;

export type CompleteRepLaneAggregate = Readonly<{
  schemaVersion: typeof COMPLETE_REP_LANE_SCHEMA_VERSION; registryVersion: typeof COMPLETE_REP_LANE_REGISTRY_VERSION;
  branchId: string; branchKey: CompleteRepLaneBranchKey; candidates: readonly CompatibilityPrescriptionAuthorityCandidate[];
  precedence: CompatibilityPrescriptionPrecedenceTrace; rep: CompleteRepSemantics; lane: CompleteLaneSemantics;
  pairing: RepLanePairing; generatedSettingsOwnership: readonly GeneratedSettingsOwnership[]; fingerprint: string;
}>;

const json = (value: unknown) => JSON.stringify(value);
const semanticFingerprint = (value: Omit<CompleteRepLaneAggregate, "fingerprint">) => `${COMPLETE_REP_LANE_FINGERPRINT_VERSION}|${json(value)}`;

const authority = (id: string, category: AuthorityCategory, rank: number, appliesTo: CompatibilityPrescriptionAuthorityCandidate["appliesTo"], reasonCode: string, laneIdentity?: CompatibilityLaneIdentity): CompatibilityPrescriptionAuthorityCandidate => ({ authorityId: id, authorityVersion: "v1", category, precedenceRank: rank, requiredFacts: [], matched: true, status: "production_active", reasonCode, ...(laneIdentity ? { laneIdentity } : {}) , appliesTo });
const commonKey = (blockClassification: CompleteRepLaneBranchKey["blockClassification"], exerciseRole: string, exerciseClass: CompatibilityExerciseClass): CompleteRepLaneBranchKey => ({ blockClassification, sessionRole: "unknown", plannedOrderClass: "unknown", slotRole: "unknown", exerciseRole, exerciseClass, movementFamily: "unknown", prescriptionFamily: "ordinary", explicitSlotOverrideId: null, exerciseFamilyOverrideId: null, advancedMethodId: null, programmeDefaultId: null, historyState: "any", loadingCapability: "any", guidanceEnvelope: "ordinary" });
const ownership: readonly GeneratedSettingsOwnership[] = [
  { field: "trainingLane", classification: "derived_projection", owner: "aggregate.lane", reasonCode: "lane_semantics_owner" },
  { field: "repRange", classification: "derived_projection", owner: "aggregate.rep", reasonCode: "rep_semantics_owner" },
  { field: "requiredSets", classification: "downstream_arithmetic_input", owner: "set_prescription_deferred", reasonCode: "set_migration_deferred" },
  { field: "dropOffPercent", classification: "downstream_arithmetic_input", owner: "dropoff_migration_deferred", reasonCode: "dropoff_migration_deferred" },
];

function makeAggregate(branchId: string, key: CompleteRepLaneBranchKey, repAuthorityId: string, laneAuthorityId: string, laneId: CompatibilityLaneIdentity, min: number, max: number): CompleteRepLaneAggregate {
  const candidates = [authority(repAuthorityId, "block_compatibility", 70, "both", "block_branch_selected"), authority(laneAuthorityId, "block_compatibility", 70, "lane", "lane_branch_selected", laneId)];
  const precedenceBase = { schemaVersion: COMPLETE_REP_LANE_SCHEMA_VERSION, branchKey: key, evaluatedAuthorityIds: candidates.map((c) => c.authorityId), matchingAuthorityIds: candidates.filter((c) => c.matched).map((c) => c.authorityId), selectedRepAuthorityId: repAuthorityId, selectedLaneAuthorityId: laneAuthorityId, rejectedRepAuthorityIds: [], rejectedLaneAuthorityIds: [], collisionReasonCodes: [] };
  const precedence = { ...precedenceBase, fingerprint: `${COMPLETE_REP_LANE_FINGERPRINT_VERSION}|${json(precedenceBase)}` };
  const aggregateBase = { schemaVersion: COMPLETE_REP_LANE_SCHEMA_VERSION, registryVersion: COMPLETE_REP_LANE_REGISTRY_VERSION, branchId, branchKey: key, candidates, precedence, rep: { authorityId: repAuthorityId, policyId: `compatibility_${branchId}_rep`, policyVersion: "v2", minimum: min, maximum: max, exactMode: "range" as const, finalSetBehaviour: "same_range", overrideSource: null, methodIdentity: null, roleStatus: "explicit" as const, prescriptionFamily: key.prescriptionFamily, reasonCodes: ["rep_authority_selected"] }, lane: { authorityId: laneAuthorityId, laneId, laneVersion: "v2", supportedSessionRoles: ["upper", "lower", "unknown"], supportedSlotRoles: [key.slotRole], plannedOrderClasses: [key.plannedOrderClass], exerciseClasses: [key.exerciseClass], familyConstraints: [], repRelationship: "lane_rep_pair_validated", setRelationship: "deferred_set_projection", loadRelationship: "deferred_load_projection", dropOffRelationship: "deferred_dropoff_projection", suitabilityRelationship: "deferred_suitability_projection", reasonCodes: ["lane_authority_selected"] }, pairing: { repAuthorityId, laneId, allowed: true, reasonCode: "characterized_pairing" }, generatedSettingsOwnership: ownership };
  return { ...aggregateBase, fingerprint: semanticFingerprint(aggregateBase) };
}

export const COMPLETE_REP_LANE_AGGREGATE_REGISTRY: readonly CompleteRepLaneAggregate[] = [
  makeAggregate("hypertrophy-primary-compound", commonKey("hypertrophy", "primary_compound", "primary_compound"), "rep_block_hypertrophy_primary_v2", "lane_hypertrophy_strength_v2", "hypertrophy_strength", 6, 10),
  makeAggregate("hypertrophy-secondary-compound", commonKey("hypertrophy", "secondary_compound", "secondary_compound"), "rep_block_hypertrophy_secondary_v2", "lane_hypertrophy_v2", "hypertrophy", 8, 12),
  makeAggregate("hypertrophy-accessory", commonKey("hypertrophy", "accessory", "accessory"), "rep_block_hypertrophy_accessory_v2", "lane_hypertrophy_v2", "hypertrophy", 10, 15),
  makeAggregate("strength-primary", commonKey("strength", "primary_compound", "primary_compound"), "rep_block_strength_primary_v2", "lane_strength_v2", "strength", 3, 5),
  makeAggregate("strength-secondary-support", commonKey("strength", "secondary_compound", "secondary_compound"), "rep_block_strength_secondary_v2", "lane_strength_support_v2", "strength_support", 5, 8),
  makeAggregate("power-primary", commonKey("power", "power", "primary_compound"), "rep_block_power_primary_v2", "lane_power_v2", "power", 1, 3),
  makeAggregate("peak-primary", commonKey("peak", "primary_compound", "primary_compound"), "rep_block_peak_primary_v2", "lane_peak_v2", "peak", 1, 3),
  makeAggregate("deload-maintenance", commonKey("deload", "secondary_compound", "secondary_compound"), "rep_block_deload_secondary_v2", "lane_maintenance_v2", "maintenance", 8, 12),
  makeAggregate("deload-recovery", { ...commonKey("deload", "recovery", "accessory"), prescriptionFamily: "recovery" }, "rep_block_deload_recovery_v2", "lane_recovery_v2", "recovery", 10, 15),
];

export function validateCompleteRepLaneAggregate(value: CompleteRepLaneAggregate): readonly string[] {
  const issues: string[] = [];
  if (value.schemaVersion !== "v2" || value.registryVersion !== "v2") issues.push("unsupported_schema");
  if (!value.branchId || !value.branchKey || !value.precedence) issues.push("identity_missing");
  if (value.rep.minimum > value.rep.maximum) issues.push("rep_bounds_invalid");
  if (!value.pairing.allowed || value.pairing.repAuthorityId !== value.rep.authorityId || value.pairing.laneId !== value.lane.laneId) issues.push("invalid_rep_lane_pair");
  if (!value.precedence.matchingAuthorityIds.includes(value.precedence.selectedRepAuthorityId ?? "") || !value.precedence.matchingAuthorityIds.includes(value.precedence.selectedLaneAuthorityId ?? "")) issues.push("precedence_selection_invalid");
  if (new Set(value.candidates.map((candidate) => candidate.authorityId)).size !== value.candidates.length) issues.push("duplicate_authority");
  return issues;
}
export function copyCompleteRepLaneAggregate(value: CompleteRepLaneAggregate): CompleteRepLaneAggregate { return JSON.parse(JSON.stringify(value)) as CompleteRepLaneAggregate; }
export function completeRepLaneAggregateFingerprint(value: CompleteRepLaneAggregate): string { const { fingerprint: _ignored, ...rest } = value; return semanticFingerprint(rest); }
