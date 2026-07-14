import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const matrix = JSON.parse(fs.readFileSync(path.join(process.cwd(), "qa-reports/legacy-migration-change-control/phase-d4e3c4e1c-eligibility-gap-matrix.json"), "utf8")) as any;
const candidate = JSON.parse(fs.readFileSync(path.join(process.cwd(), "qa-reports/legacy-migration-change-control/phase-d4e3c4e2a-authority-switch-candidates.json"), "utf8")) as any;

describe("D4E3C4E1C eligibility-gap audit", () => {
  it("preserves all fixture identities and the real fail-closed result", () => {
    expect(matrix.fixtures).toHaveLength(12);
    expect(new Set(matrix.fixtures.map((fixture: any) => fixture.id)).size).toBe(12);
    expect(matrix.certificationResult).toEqual({ selectedFirstCandidate: null, status: "no_eligible_branch_family", reason: "incomplete_shadow_coverage" });
    expect(candidate.selectedFirstCandidate).toBeNull();
  });

  it("keeps ordinary gaps family-scoped and unavailable evidence explicit", () => {
    const ordinary = matrix.fixtures.filter((fixture: any) => fixture.family === "ordinary");
    expect(ordinary).toHaveLength(3);
    expect(ordinary.every((fixture: any) => fixture.productionAuthority === "retained" && fixture.eligible === false)).toBe(true);
    expect(ordinary.every((fixture: any) => fixture.blockers.includes("shadow_not_evaluated") && fixture.blockers.includes("rollback_coverage_incomplete"))).toBe(true);
    expect(matrix.fixtures.filter((fixture: any) => fixture.productionAuthority === "unavailable")).toHaveLength(9);
  });

  it("fails closed for duplicate, missing, inferred, or reordered correlations", () => {
    const ids = matrix.fixtures.map((fixture: any) => fixture.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids.every(Boolean)).toBe(true);
    expect(matrix.fixtures.some((fixture: any) => fixture.productionAuthority === "unavailable" && fixture.eligible)).toBe(false);
  });
});
