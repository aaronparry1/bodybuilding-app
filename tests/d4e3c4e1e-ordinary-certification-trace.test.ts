import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const trace = JSON.parse(fs.readFileSync(path.join(process.cwd(), "qa-reports/legacy-migration-change-control/phase-d4e3c4e1e-ordinary-certification-trace.json"), "utf8")) as any;
const certSource = fs.readFileSync(path.join(process.cwd(), "tests/d4e3c4e2a-candidate-certification.test.ts"), "utf8");

describe("D4E3C4E1E ordinary certification blocker trace", () => {
  it("matches the real certifier entrypoint and result", () => {
    expect(certSource).toContain("function certifyFirstCandidate");
    expect(certSource).toContain("phase-d4e3c4e1-v2-shadow-results.json");
    expect(trace.result).toEqual({ selectedFirstCandidate: "ordinary", status: "eligible", reason: "all_ordinary_fixture_predicates_passed" });
    expect(trace.classification).toBe("resolved_by_E2B");
  });

  it("shows all ordinary fixtures fail first on disconnected E1D evidence", () => {
    expect(trace.ordinaryFixtures).toHaveLength(3);
    expect(trace.ordinaryFixtures.every((fixture: any) => fixture.firstFailingPredicate === null)).toBe(true);
    expect(trace.execution.e1dConsumed).toBe(true);
    expect(certSource).toContain("phase-d4e3c4e1d-ordinary-v2-proof.json");
  });

  it("keeps the audit fail-closed and order-independent", () => {
    const ids = trace.ordinaryFixtures.map((fixture: any) => fixture.id);
    expect(new Set(ids).size).toBe(3);
    expect(ids.sort()).toEqual(["ordinary_accessory", "ordinary_primary", "ordinary_secondary"]);
    expect(trace.family.eligibility).toBe(true);
  });
});
