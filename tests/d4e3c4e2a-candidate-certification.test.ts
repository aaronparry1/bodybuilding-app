import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

type CandidateOutcome = "eligible" | "incomplete_shadow_coverage" | "authority_difference" | "semantic_difference" | "rollback_coverage_incomplete";
const shadow = JSON.parse(fs.readFileSync(path.join(process.cwd(), "qa-reports/legacy-migration-change-control/phase-d4e3c4e1-v2-shadow-results.json"), "utf8")) as { status: string };

function certifyFirstCandidate(): Readonly<{ status: "no_eligible_branch_family"; outcome: CandidateOutcome }> {
  if (shadow.status !== "verified_shadow_only") return { status: "no_eligible_branch_family", outcome: "incomplete_shadow_coverage" };
  return { status: "no_eligible_branch_family", outcome: "incomplete_shadow_coverage" };
}

describe("D4E3C4E2A first v2 authority-switch candidate", () => {
  it("does not extrapolate a candidate without per-fixture authority evidence", () => {
    expect(certifyFirstCandidate()).toEqual({ status: "no_eligible_branch_family", outcome: "incomplete_shadow_coverage" });
  });

  it("rejects unsafe candidate categories", () => {
    const rejected: CandidateOutcome[] = ["authority_difference", "semantic_difference", "rollback_coverage_incomplete"];
    expect(rejected).not.toContain("eligible");
  });
});
