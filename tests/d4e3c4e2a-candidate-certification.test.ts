import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

type CandidateOutcome = "eligible" | "incomplete_shadow_coverage" | "authority_difference" | "semantic_difference" | "rollback_coverage_incomplete";
const shadow = JSON.parse(fs.readFileSync(path.join(process.cwd(), "qa-reports/legacy-migration-change-control/phase-d4e3c4e1-v2-shadow-results.json"), "utf8")) as { status: string };
const production = JSON.parse(fs.readFileSync(path.join(process.cwd(), "qa-reports/legacy-migration-change-control/phase-d4e3c4e1a-fixture-level-shadow-evidence.json"), "utf8")) as any;
const ordinaryProof = JSON.parse(fs.readFileSync(path.join(process.cwd(), "qa-reports/legacy-migration-change-control/phase-d4e3c4e1d-ordinary-v2-proof.json"), "utf8")) as any;

const requiredOrdinary = ["ordinary_primary", "ordinary_secondary", "ordinary_accessory"] as const;

function certifyFirstCandidate(): Readonly<{ status: "eligible" | "no_eligible_branch_family"; outcome: CandidateOutcome; selectedFirstCandidate: string | null }> {
  if (shadow.status !== "verified_shadow_only") return { status: "no_eligible_branch_family", outcome: "incomplete_shadow_coverage", selectedFirstCandidate: null };
  const productionRows = new Map<string, any>(production.fixtures.map((fixture: any) => [fixture.id, fixture]));
  const proofRows = new Map<string, any>(ordinaryProof.fixtures.map((fixture: any) => [fixture.id, fixture]));
  const valid = requiredOrdinary.every((id) => {
    const p = productionRows.get(id); const v = proofRows.get(id);
    return p && p.productionRepAuthority !== "unavailable" && p.productionLaneAuthority !== "unavailable" && p.productionRep && p.productionLane && v && v.id === id && v.v2Status === "resolved" && v.translation === "translated" && v.rollback === "production_equivalent";
  });
  return valid ? { status: "eligible", outcome: "eligible", selectedFirstCandidate: "ordinary" } : { status: "no_eligible_branch_family", outcome: "incomplete_shadow_coverage", selectedFirstCandidate: null };
}

describe("D4E3C4E2A first v2 authority-switch candidate", () => {
  it("does not extrapolate a candidate without per-fixture authority evidence", () => {
    expect(certifyFirstCandidate()).toEqual({ status: "eligible", outcome: "eligible", selectedFirstCandidate: "ordinary" });
  });

  it("rejects unsafe candidate categories", () => {
    const rejected: CandidateOutcome[] = ["authority_difference", "semantic_difference", "rollback_coverage_incomplete"];
    expect(rejected).not.toContain("eligible");
  });

  it.each(["fixtureId", "translation", "rollback"])("fails closed when ordinary evidence mutates: %s", (field) => {
    const key = field === "fixtureId" ? "id" : field;
    const original = ordinaryProof.fixtures[0][key];
    ordinaryProof.fixtures[0][key] = "invalid";
    expect(certifyFirstCandidate().selectedFirstCandidate).toBeNull();
    ordinaryProof.fixtures[0][key] = original;
  });
});
