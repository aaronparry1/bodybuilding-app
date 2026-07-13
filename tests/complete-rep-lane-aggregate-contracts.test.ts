import { describe, expect, it } from "vitest";
import { COMPLETE_REP_LANE_AGGREGATE_REGISTRY, completeRepLaneAggregateFingerprint, copyCompleteRepLaneAggregate, validateCompleteRepLaneAggregate } from "@/domain/training/complete-rep-lane-aggregate-contracts";

describe("D4E3C4B complete rep/lane aggregate contracts", () => {
  it("represents eight lane identities and coherent aggregate pairings", () => {
    const lanes = new Set(COMPLETE_REP_LANE_AGGREGATE_REGISTRY.map((entry) => entry.lane.laneId));
    expect(["strength", "strength_support", "hypertrophy_strength", "hypertrophy", "power", "peak", "maintenance", "recovery"].every((lane) => lanes.has(lane as never))).toBe(true);
    expect(COMPLETE_REP_LANE_AGGREGATE_REGISTRY.every((entry) => validateCompleteRepLaneAggregate(entry).length === 0)).toBe(true);
  });
  it("preserves authority and precedence trace without callbacks", () => {
    const entry = COMPLETE_REP_LANE_AGGREGATE_REGISTRY[0];
    expect(entry.precedence.matchingAuthorityIds).toContain(entry.precedence.selectedRepAuthorityId);
    expect(entry.precedence.matchingAuthorityIds).toContain(entry.precedence.selectedLaneAuthorityId);
    expect(entry.candidates.every((candidate) => typeof candidate.authorityId === "string")).toBe(true);
  });
  it("deep-copies and fingerprints semantic fields", () => {
    const entry = COMPLETE_REP_LANE_AGGREGATE_REGISTRY[0];
    const copy = copyCompleteRepLaneAggregate(entry);
    expect(copy).toEqual(entry);
    expect(completeRepLaneAggregateFingerprint(entry)).toBe(entry.fingerprint);
    expect(completeRepLaneAggregateFingerprint({ ...entry, rep: { ...entry.rep, minimum: entry.rep.minimum + 1 } })).not.toBe(entry.fingerprint);
  });
});
