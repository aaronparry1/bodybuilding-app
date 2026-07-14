import { describe, expect, it } from "vitest";
import { ORDINARY_V2_CERTIFICATION_ID, ORDINARY_V2_DISABLED_POLICY, ORDINARY_V2_ROLLBACK_BOUNDARY, resolveOrdinaryV2Authority, type OrdinaryV2BoundaryInput } from "@/domain/training/ordinary-v2-authority-boundary";

const production = { authority: "production" as const, value: { lane: "hypertrophy", min: 10, max: 15 }, reason: "production" };
const base: OrdinaryV2BoundaryInput<typeof production.value> = { family: "ordinary", role: "accessory", production, translatedV2: { authority: "v2_ordinary_canary", value: production.value, reason: "certified_translation" }, v2Resolved: true, translationValid: true, requiredFieldsComplete: true, unsupportedMethodPresent: false, certificationId: ORDINARY_V2_CERTIFICATION_ID, rollbackBoundary: ORDINARY_V2_ROLLBACK_BOUNDARY };
const canary = { mode: "ordinary_v2_canary" as const, certificationId: ORDINARY_V2_CERTIFICATION_ID, rollbackBoundary: ORDINARY_V2_ROLLBACK_BOUNDARY };

describe("D4E3C4E3A disabled ordinary v2 authority boundary", () => {
  it("defaults to production and permits only explicit certified canary policy", () => {
    expect(resolveOrdinaryV2Authority(base)).toEqual({ ...production, reason: "production_default_or_canary_safety_failure" });
    expect(resolveOrdinaryV2Authority(base, canary).authority).toBe("v2_ordinary_canary");
  });
  it.each(["override", "advanced_method", "power", "unknown"])("rejects uncertified families: %s", (family) => expect(resolveOrdinaryV2Authority({ ...base, family }, canary).authority).toBe("production"));
  it.each([{ translationValid: false }, { v2Resolved: false }, { requiredFieldsComplete: false }, { unsupportedMethodPresent: true }, { certificationId: "stale" }, { rollbackBoundary: "missing" }])("fails closed on safety mismatch %o", (change) => expect(resolveOrdinaryV2Authority({ ...base, ...change }, canary).authority).toBe("production"));
  it("rolls back atomically when policy is disabled", () => expect(resolveOrdinaryV2Authority(base, ORDINARY_V2_DISABLED_POLICY)).toEqual({ ...production, reason: "production_default_or_canary_safety_failure" }));
  it("does not consult environment or persistence", () => expect(ORDINARY_V2_DISABLED_POLICY).toEqual({ mode: "production_only" }));
});
