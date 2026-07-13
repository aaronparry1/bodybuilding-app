import {
  COMPLETE_REP_LANE_REGISTRY_VERSION,
  COMPLETE_REP_LANE_SCHEMA_VERSION,
  COMPLETE_REP_LANE_AGGREGATE_REGISTRY,
  copyCompleteRepLaneAggregate,
  validateCompleteRepLaneAggregate,
  type CompatibilityPrescriptionAuthorityCandidate,
  type CompleteRepLaneAggregate,
  type CompleteRepLaneBranchKey,
} from "@/domain/training/complete-rep-lane-aggregate-contracts";

export type CompleteCompatibilityPrescriptionResolutionInput = Readonly<{
  schemaVersion: typeof COMPLETE_REP_LANE_SCHEMA_VERSION;
  registryVersion: typeof COMPLETE_REP_LANE_REGISTRY_VERSION;
  branchKey: CompleteRepLaneBranchKey;
  explicitRolePresent: boolean;
  generatedSettingsFactsComplete: boolean;
  sourceMetadata?: Readonly<{ sourceId?: string; timestamp?: string }>;
}>;

export type CompleteRepLaneResolution = Readonly<{ status: "resolved"; aggregate: CompleteRepLaneAggregate; normalizedInput: CompleteCompatibilityPrescriptionResolutionInput; reasonCode: string }> | Readonly<{ status: "unsupported_registry_version" | "invalid_input" | "unsupported_override_identity" | "unsupported_advanced_method" | "unsupported_prescription_family" | "unsupported_planned_order" | "unsupported_exercise_class" | "unsupported_slot_role" | "missing_explicit_role" | "invalid_inferred_role" | "incomplete_generated_settings_facts" | "no_matching_rep_authority" | "no_matching_lane_authority" | "precedence_collision" | "invalid_rep_lane_pair" | "contradictory_branch" | "unsupported_final_branch"; reasonCode: string }>;

const fingerprint = (value: unknown) => `v2|${JSON.stringify(value)}`;
const supportedClasses = new Set(["primary_compound", "secondary_compound", "accessory"]);
const supportedFamilies = new Set(["ordinary", "corrective", "recovery", "power"]);

function candidate(id: string, category: CompatibilityPrescriptionAuthorityCandidate["category"], rank: number, appliesTo: CompatibilityPrescriptionAuthorityCandidate["appliesTo"], reasonCode: string, matched: boolean): CompatibilityPrescriptionAuthorityCandidate {
  return { authorityId: id, authorityVersion: "v2", category, precedenceRank: rank, requiredFacts: [], matched, status: "production_active", reasonCode, appliesTo };
}

function candidatesFor(input: CompleteCompatibilityPrescriptionResolutionInput): readonly CompatibilityPrescriptionAuthorityCandidate[] {
  const key = input.branchKey;
  const result: CompatibilityPrescriptionAuthorityCandidate[] = [];
  if (key.explicitSlotOverrideId) result.push(candidate(key.explicitSlotOverrideId, "explicit_slot_override", 100, "both", "explicit_slot_override_matched", true));
  if (key.advancedMethodId) result.push(candidate(key.advancedMethodId, "advanced_method", 90, "both", "advanced_method_matched", true));
  if (key.exerciseFamilyOverrideId) result.push(candidate(key.exerciseFamilyOverrideId, "exercise_family", 80, "rep", "exercise_family_override_matched", true));
  if (input.explicitRolePresent) result.push(candidate(`role_${key.exerciseRole}`, "explicit_role", 70, "both", "explicit_role_matched", true));
  else result.push(candidate(`inferred_role_${key.exerciseRole}`, "inferred_role", 60, "both", "role_inferred", true));
  if (key.prescriptionFamily === "corrective") result.push(candidate("prescription_corrective_v2", "corrective_family", 85, "both", "corrective_family_matched", true));
  if (key.prescriptionFamily === "recovery") result.push(candidate("prescription_recovery_v2", "recovery_family", 85, "both", "recovery_family_matched", true));
  if (key.prescriptionFamily === "power") result.push(candidate("prescription_power_v2", "power_family", 85, "both", "power_family_matched", true));
  if (key.plannedOrderClass !== "unknown") result.push(candidate(`planned_order_${key.plannedOrderClass}_v2`, "planned_order", 75, "lane", "planned_order_matched", true));
  result.push(candidate(`block_${key.blockClassification}_v2`, "block_compatibility", 40, "both", "block_compatibility_matched", true));
  if (key.programmeDefaultId) result.push(candidate(key.programmeDefaultId, "programme_default", 20, "both", "programme_default_matched", true));
  return result.sort((a, b) => b.precedenceRank - a.precedenceRank || a.authorityId.localeCompare(b.authorityId));
}

function failure(status: CompleteRepLaneResolution["status"], reasonCode: string): CompleteRepLaneResolution { return { status: status as Exclude<CompleteRepLaneResolution["status"], "resolved">, reasonCode }; }

export function resolveCompleteRepLanePrecedence(input: CompleteCompatibilityPrescriptionResolutionInput): CompleteRepLaneResolution {
  if (input.schemaVersion !== "v2" || input.registryVersion !== "v2") return failure("unsupported_registry_version", "v2_required");
  if (!input.generatedSettingsFactsComplete) return failure("incomplete_generated_settings_facts", "generated_settings_facts_required");
  if (!supportedClasses.has(input.branchKey.exerciseClass)) return failure("unsupported_exercise_class", "exercise_class_not_supported");
  if (!supportedFamilies.has(input.branchKey.prescriptionFamily)) return failure("unsupported_prescription_family", "prescription_family_not_supported");
  if (input.branchKey.plannedOrderClass === "unknown" && input.branchKey.blockClassification === "peak") return failure("unsupported_planned_order", "peak_requires_order_class");
  if (!input.explicitRolePresent && input.branchKey.exerciseRole === "unknown") return failure("missing_explicit_role", "role_inference_missing");
  const candidates = candidatesFor(input);
  const repMatches = candidates.filter((c) => c.matched && (c.appliesTo === "rep" || c.appliesTo === "both"));
  const laneMatches = candidates.filter((c) => c.matched && (c.appliesTo === "lane" || c.appliesTo === "both"));
  if (!repMatches.length) return failure("no_matching_rep_authority", "rep_authority_missing");
  if (!laneMatches.length) return failure("no_matching_lane_authority", "lane_authority_missing");
  const topRep = repMatches[0];
  const topLane = laneMatches[0];
  if (repMatches[1] && repMatches[1].precedenceRank === topRep.precedenceRank && repMatches[1].authorityId !== topRep.authorityId) return failure("precedence_collision", "equal_rep_precedence");
  if (laneMatches[1] && laneMatches[1].precedenceRank === topLane.precedenceRank && laneMatches[1].authorityId !== topLane.authorityId) return failure("precedence_collision", "equal_lane_precedence");
  const entry = COMPLETE_REP_LANE_AGGREGATE_REGISTRY.find((candidateEntry) => Object.keys(candidateEntry.branchKey).every((field) => candidateEntry.branchKey[field as keyof CompleteRepLaneBranchKey] === input.branchKey[field as keyof CompleteRepLaneBranchKey]));
  if (!entry) return failure("unsupported_final_branch", "v2_final_branch_not_registered");
  const traceBase = { schemaVersion: "v2" as const, branchKey: input.branchKey, evaluatedAuthorityIds: candidates.map((c) => c.authorityId), matchingAuthorityIds: candidates.filter((c) => c.matched).map((c) => c.authorityId), selectedRepAuthorityId: topRep.authorityId, selectedLaneAuthorityId: topLane.authorityId, rejectedRepAuthorityIds: repMatches.slice(1).map((c) => c.authorityId), rejectedLaneAuthorityIds: laneMatches.slice(1).map((c) => c.authorityId), collisionReasonCodes: [] };
  const aggregate = copyCompleteRepLaneAggregate({ ...entry, candidates, precedence: { ...traceBase, fingerprint: fingerprint(traceBase) }, fingerprint: "" });
  if (validateCompleteRepLaneAggregate(aggregate).length) return failure("contradictory_branch", "aggregate_validation_failed");
  return { status: "resolved", aggregate: { ...aggregate, fingerprint: fingerprint({ ...aggregate, fingerprint: undefined }) }, normalizedInput: input, reasonCode: "complete_precedence_resolved" };
}
