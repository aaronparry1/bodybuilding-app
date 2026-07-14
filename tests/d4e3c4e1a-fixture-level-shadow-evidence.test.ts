import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { resolveRepRangeDecision } from "@/domain/training/rep-range-strategy";
import { resolveTrainingLaneDecision } from "@/domain/training/block-training-lanes";

const evidence = JSON.parse(fs.readFileSync(path.join(process.cwd(), "qa-reports/legacy-migration-change-control/phase-d4e3c4e1a-fixture-level-shadow-evidence.json"), "utf8")) as { fixtures: Array<{ id: string; productionRepAuthority: string; productionLaneAuthority: string; rollback: string }>; fixtureCount: number; selectedFirstCandidate: null };

describe("D4E3C4E1A fixture-level shadow evidence", () => {
  it("records every independent equivalence fixture without inventing authority", () => {
    expect(evidence.fixtureCount).toBe(12);
    expect(evidence.fixtures).toHaveLength(12);
    expect(evidence.fixtures.filter((fixture) => fixture.productionRepAuthority !== "unavailable").map((fixture) => fixture.id).sort()).toEqual(["ordinary_accessory", "ordinary_primary", "ordinary_secondary"]);
    expect(evidence.fixtures.filter((fixture) => fixture.productionRepAuthority === "unavailable")).toHaveLength(9);
  });

  it("keeps candidate certification blocked until rollback evidence exists", () => {
    expect(evidence.fixtures.every((fixture) => fixture.rollback === "incomplete")).toBe(true);
    expect(evidence.selectedFirstCandidate).toBeNull();
  });

  it("retains ordinary production decisions from the real selectors", () => {
    const primary = evidence.fixtures.find((fixture) => fixture.id === "ordinary_primary") as any;
    const rep = resolveRepRangeDecision({ blockType: "hypertrophy", exerciseRole: "primary_compound", exerciseFamily: undefined });
    const lane = resolveTrainingLaneDecision({ blockType: "hypertrophy", exerciseRole: "primary_compound", slotRole: "primary_compound" });
    expect(primary.productionRep).toMatchObject({ minimum: rep.value.min, maximum: rep.value.max, authority: rep.authoritySource, branchId: rep.appliedIdentity });
    expect(primary.productionLane).toMatchObject({ lane: lane.lane, authority: lane.source, branchId: lane.branchId, appliedIdentity: lane.appliedIdentity });
  });

  it("fails closed on duplicate or missing correlation identities", () => {
    const ids = evidence.fixtures.map((fixture) => fixture.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids.every(Boolean)).toBe(true);
  });
});
