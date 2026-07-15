import { beforeEach, describe, expect, it } from "vitest";
import { startCanonicalSession, prescriptionHash } from "@/application/training/canonical-recorded-session-application";
import { canonicalActivePlanV2Repository } from "@/data/local/canonical-active-plan-v2-repository";
import { canonicalRecordedSessionLedger } from "@/data/local/canonical-recorded-session-ledger";

describe("canonical recorded-session application", () => {
  beforeEach(() => { canonicalActivePlanV2Repository.clear(); canonicalRecordedSessionLedger.clear(); });
  it("requires a canonical plan and exact snapshot identity", () => {
    expect(startCanonicalSession({ planId: "missing", expectedPlanRevision: 0, plannedSessionId: "s", expectedPrescriptionHash: "x", operationId: "op", startedAt: "2026-01-01T00:00:00.000Z", provenance: "test" }).reason).toBe("canonical_plan_unavailable");
  });
  it("uses deterministic prescription hashes", () => expect(prescriptionHash({ a: 1 })).toBe('{"a":1}'));
});
