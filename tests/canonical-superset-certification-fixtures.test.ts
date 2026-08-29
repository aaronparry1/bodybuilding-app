import { beforeEach, describe, expect, it } from "vitest";
import { applyCanonicalSupersetCertificationFixture, canonicalSupersetCertificationMatrix } from "@/application/design-qa/canonical-superset-certification-fixtures";
import { projectCanonicalSupersetAdaptation } from "@/application/training/canonical-superset-adaptation-presentation";
import { canonicalActivePlanV2Repository } from "@/data/local/canonical-active-plan-v2-repository";
import { canonicalSupersetApplicationRepository } from "@/data/local/canonical-superset-application-repository";

describe("native superset certification fixtures", () => {
  beforeEach(() => canonicalSupersetApplicationRepository.clear());
  for (const fixture of ["member_a_progress", "round_rest_increase", "pair_removal"] as const) it(`persists ${fixture} through repositories and certification application`, () => {
    const applied = applyCanonicalSupersetCertificationFixture(fixture);
    expect(applied.result.status).toBe("applied");
    const carrier = canonicalActivePlanV2Repository.get();
    expect(carrier.status).toBe("saved");
    const presentations = (["completion", "today", "preview", "progress"] as const).map((surface) => projectCanonicalSupersetAdaptation({ planId: applied.planId, surface, includeQaOnly: true }));
    expect(presentations.every(Boolean)).toBe(true);
    expect(new Set(presentations.map((item) => item?.meaningIdentity)).size).toBe(1);
    expect(new Set(presentations.map((item) => item?.explanation)).size).toBe(1);
  });

  it("keeps the held shadow fixture out of ordinary presentation", () => {
    const held = applyCanonicalSupersetCertificationFixture("held_shadow");
    expect(held.result.status).toBe("held");
    expect(projectCanonicalSupersetAdaptation({ planId: held.planId, surface: "today" })).toBeNull();
    expect(projectCanonicalSupersetAdaptation({ planId: held.planId, surface: "today", includeQaOnly: true })).toMatchObject({ state: "held", qaOnly: true });
  });

  for (const fixture of canonicalSupersetCertificationMatrix) it(`certifies the fixed matrix state ${fixture}`, () => {
    const certified = applyCanonicalSupersetCertificationFixture(fixture);
    const record = canonicalSupersetApplicationRepository.list(certified.planId);
    expect(record).toHaveLength(1);
    const held = fixture.endsWith("_hold") || ["correction_invalidation", "transition_reassessment", "no_eligible_adaptation"].includes(fixture);
    expect(certified.result.status).toBe(held ? "held" : "applied");
    expect(Boolean(record[0]?.receipt)).toBe(!held);
    const presentations = (["completion", "today", "preview", "progress"] as const).map((surface) => projectCanonicalSupersetAdaptation({ planId: certified.planId, surface, includeQaOnly: true }));
    expect(presentations.every(Boolean)).toBe(true);
    expect(new Set(presentations.map((item) => item?.meaningIdentity)).size).toBe(1);
    expect(new Set(presentations.map((item) => item?.explanation)).size).toBe(1);
    expect(presentations.every((item) => item?.qaOnly)).toBe(true);
    expect(projectCanonicalSupersetAdaptation({ planId: certified.planId, surface: "today" })).toBeNull();
    for (const item of presentations) {
      expect(item?.explanation).not.toMatch(/\bex-[a-z0-9-]+\b/);
      expect(item?.explanation).not.toContain("qa-superset");
    }
  });
});
