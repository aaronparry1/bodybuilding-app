import { describe, expect, it } from "vitest";
import { certifyCanonicalSessionConstruction } from "@/domain/training/canonical-session-construction-certification";

describe("canonical session construction certification", () => {
  it("fails closed until complete prescription and canonical-v2 orchestration are proven", () => {
    const result = certifyCanonicalSessionConstruction([]);
    expect(result.readiness).toBe("not_ready");
    expect(result.productionSwitchAllowed).toBe(false);
    expect(result.carrierFailures).toContain("canonical_v2_planned_session_orchestration_not_connected");
    expect(result.blockers).toHaveLength(2);
  });
});
