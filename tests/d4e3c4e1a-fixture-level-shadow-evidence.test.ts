import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const evidence = JSON.parse(fs.readFileSync(path.join(process.cwd(), "qa-reports/legacy-migration-change-control/phase-d4e3c4e1a-fixture-level-shadow-evidence.json"), "utf8")) as { fixtures: Array<{ id: string; productionRepAuthority: string; productionLaneAuthority: string; rollback: string }>; fixtureCount: number; selectedFirstCandidate: null };

describe("D4E3C4E1A fixture-level shadow evidence", () => {
  it("records every independent equivalence fixture without inventing authority", () => {
    expect(evidence.fixtureCount).toBe(12);
    expect(evidence.fixtures).toHaveLength(12);
    expect(evidence.fixtures.every((fixture) => fixture.productionRepAuthority === "unavailable" && fixture.productionLaneAuthority === "unavailable")).toBe(true);
  });

  it("keeps candidate certification blocked until rollback evidence exists", () => {
    expect(evidence.fixtures.every((fixture) => fixture.rollback === "incomplete")).toBe(true);
    expect(evidence.selectedFirstCandidate).toBeNull();
  });
});
