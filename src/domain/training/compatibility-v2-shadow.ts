import { resolveCompleteRepLanePrecedence, type CompleteCompatibilityPrescriptionResolutionInput, type CompleteRepLaneResolution } from "@/domain/training/complete-rep-lane-precedence-resolver";
import type { CompleteRepLaneBranchKey } from "@/domain/training/complete-rep-lane-aggregate-contracts";

export type CompatibilityV2ShadowResult = Readonly<{
  status: "not_evaluated" | "resolved_agreement" | "resolved_difference" | "v2_resolution_failed";
  eligibility: "eligible" | "incomplete_facts" | "unsupported_compatibility_branch";
  production: Readonly<{ lane: string; repMinimum: number; repMaximum: number }>;
  v2?: CompleteRepLaneResolution;
  differingFields: readonly string[];
}>;

export type CompatibilityV2ShadowFacts = Readonly<{
  blockType?: string | null;
  exerciseRole: string;
  slotRole: string;
  exerciseFamily: string;
  lane: string;
  repMinimum: number;
  repMaximum: number;
}>;

const block = (value: string | null | undefined): CompleteRepLaneBranchKey["blockClassification"] | null => {
  if (value === "hypertrophy" || value === "powerbuilding" || value === "strength" || value === "power" || value === "peak" || value === "deload") return value;
  return null;
};

export function shadowResolveCompatibilityV2(facts: CompatibilityV2ShadowFacts): CompatibilityV2ShadowResult {
  const production = { lane: facts.lane, repMinimum: facts.repMinimum, repMaximum: facts.repMaximum } as const;
  const blockClassification = block(facts.blockType);
  if (!blockClassification || !facts.exerciseRole || !facts.slotRole) return { status: "not_evaluated", eligibility: "incomplete_facts", production, differingFields: [] };
  const branchKey: CompleteRepLaneBranchKey = {
    blockClassification,
    sessionRole: "unknown",
    plannedOrderClass: "unknown",
    slotRole: facts.slotRole,
    exerciseRole: facts.exerciseRole,
    exerciseClass: facts.exerciseRole === "primary_compound" || facts.exerciseRole === "secondary_compound" || facts.exerciseRole === "accessory" ? facts.exerciseRole : "accessory",
    movementFamily: "unknown",
    prescriptionFamily: "ordinary",
    explicitSlotOverrideId: null,
    exerciseFamilyOverrideId: null,
    advancedMethodId: null,
    programmeDefaultId: null,
    historyState: "any",
    loadingCapability: "any",
    guidanceEnvelope: "ordinary",
  };
  const input: CompleteCompatibilityPrescriptionResolutionInput = { schemaVersion: "v2", registryVersion: "v2", branchKey, explicitRolePresent: true, generatedSettingsFactsComplete: true };
  const v2 = resolveCompleteRepLanePrecedence(input);
  if (v2.status !== "resolved") return { status: "v2_resolution_failed", eligibility: "eligible", production, v2, differingFields: [v2.status] };
  const differingFields = [
    ...(v2.aggregate.rep.minimum !== facts.repMinimum ? ["rep.minimum"] : []),
    ...(v2.aggregate.rep.maximum !== facts.repMaximum ? ["rep.maximum"] : []),
  ];
  return { status: differingFields.length ? "resolved_difference" : "resolved_agreement", eligibility: "eligible", production, v2, differingFields };
}
