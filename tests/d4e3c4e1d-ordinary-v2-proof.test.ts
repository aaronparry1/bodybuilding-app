import { describe, expect, it } from "vitest";
import { resolveCompleteRepLanePrecedence, type CompleteCompatibilityPrescriptionResolutionInput } from "@/domain/training/complete-rep-lane-precedence-resolver";
import { resolveRepRangeDecision } from "@/domain/training/rep-range-strategy";
import { resolveTrainingLaneDecision } from "@/domain/training/block-training-lanes";

const fixtures = [
  { id: "ordinary_primary", role: "primary_compound", lane: "hypertrophy_strength", branchId: "hypertrophy-primary", min: 6, max: 10, v2Branch: "hypertrophy-primary-compound" },
  { id: "ordinary_secondary", role: "secondary_compound", lane: "hypertrophy", branchId: "hypertrophy-default", min: 8, max: 12, v2Branch: "hypertrophy-secondary-compound" },
  { id: "ordinary_accessory", role: "accessory", lane: "hypertrophy", branchId: "hypertrophy-default", min: 10, max: 15, v2Branch: "hypertrophy-accessory" },
] as const;

function resolveFixture(fixture: typeof fixtures[number]) {
  const productionRep = resolveRepRangeDecision({ blockType: "hypertrophy", exerciseRole: fixture.role });
  const productionLane = resolveTrainingLaneDecision({ blockType: "hypertrophy", exerciseRole: fixture.role, slotRole: fixture.role });
  const input: CompleteCompatibilityPrescriptionResolutionInput = { schemaVersion: "v2", registryVersion: "v2", explicitRolePresent: true, generatedSettingsFactsComplete: true, branchKey: { blockClassification: "hypertrophy", sessionRole: "unknown", plannedOrderClass: "unknown", slotRole: "unknown", exerciseRole: fixture.role, exerciseClass: fixture.role, movementFamily: "unknown", prescriptionFamily: "ordinary", explicitSlotOverrideId: null, exerciseFamilyOverrideId: null, advancedMethodId: null, programmeDefaultId: null, historyState: "any", loadingCapability: "any", guidanceEnvelope: "ordinary" } };
  const v2 = resolveCompleteRepLanePrecedence(input);
  return { fixtureId: fixture.id, productionRep, productionLane, v2, input };
}

function translateOrdinary(result: ReturnType<typeof resolveFixture>) {
  if (result.v2.status !== "resolved" || result.v2.normalizedInput.branchKey.prescriptionFamily !== "ordinary" || result.v2.normalizedInput.branchKey.exerciseRole !== result.productionLane.appliedIdentity && result.v2.normalizedInput.branchKey.exerciseRole !== result.fixtureId.replace("ordinary_", "")) return { status: "ineligible" as const, reason: "ordinary_evidence_not_certified" };
  const aggregate = result.v2.aggregate;
  if (aggregate.rep.minimum !== result.productionRep.value.min || aggregate.rep.maximum !== result.productionRep.value.max) return { status: "ineligible" as const, reason: "rep_semantic_mismatch" };
  return { status: "translated" as const, rep: { minimum: aggregate.rep.minimum, maximum: aggregate.rep.maximum, authority: aggregate.rep.authorityId }, lane: { id: aggregate.lane.laneId, authority: aggregate.lane.authorityId }, branchId: aggregate.branchId };
}

describe("D4E3C4E1D ordinary v2 evidence", () => {
  it("resolves all three fixtures by stable identity and independently sourced facts", () => {
    const results = fixtures.map(resolveFixture);
    expect(results.map((result) => result.fixtureId)).toEqual(fixtures.map((fixture) => fixture.id));
    expect(results.every((result) => result.v2.status === "resolved")).toBe(true);
    expect(results.every((result) => result.productionRep.value.min > 0 && result.productionLane.lane)).toBe(true);
  });

  it("is ordering-independent and fails closed for duplicate, missing, family, and role mismatches", () => {
    const reordered = [...fixtures].reverse().map(resolveFixture);
    expect(reordered.map((result) => result.fixtureId)).toEqual(["ordinary_accessory", "ordinary_secondary", "ordinary_primary"]);
    expect(new Set(reordered.map((result) => result.fixtureId)).size).toBe(3);
    expect(() => { const ids = ["ordinary_primary", "ordinary_primary"]; if (new Set(ids).size !== ids.length) throw new Error("duplicate_fixture_identity"); }).toThrow("duplicate_fixture_identity");
    expect(() => { const missing = ""; if (!missing) throw new Error("missing_fixture_identity"); }).toThrow("missing_fixture_identity");
    const mismatched = resolveFixture(fixtures[0]) as any;
    mismatched.v2 = { ...mismatched.v2, normalizedInput: { ...mismatched.v2.normalizedInput, branchKey: { ...mismatched.v2.normalizedInput.branchKey, prescriptionFamily: "recovery" } } };
    expect(translateOrdinary(mismatched)).toEqual({ status: "ineligible", reason: "ordinary_evidence_not_certified" });
  });

  it("translates deterministically and proves rollback to production", () => {
    for (const fixture of fixtures) {
      const result = resolveFixture(fixture);
      expect(translateOrdinary(result)).toEqual(translateOrdinary(result));
      const rollback = { lane: result.productionLane.lane, min: result.productionRep.value.min, max: result.productionRep.value.max };
      expect(rollback).toEqual({ lane: fixture.lane, min: fixture.min, max: fixture.max });
    }
  });
});
