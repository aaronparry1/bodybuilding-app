import { describe, expect, it } from "vitest";
import { encodeOrdinaryV2BoundaryEvent, evaluateOrdinaryV2Readiness, READINESS_THRESHOLDS } from "@/domain/training/ordinary-v2-readiness";

const complete = { certificationId: "ordinary-v2-certified.v1", roles: ["primary_compound", "secondary_compound", "accessory"], evidenceCountByRole: { primary_compound: 1, secondary_compound: 1, accessory: 1 }, missingRequiredFields: 0, invariantViolations: 0, partialAuthorityDecisions: 0, generatedOutputViolations: 0, rollbackFailures: 0, fallbackRate: 0, translationFailureRate: 0, exceptionRate: 0, riskyDifferenceRate: 0, blockedDifferenceRate: 0, ageDays: 1, supportedBuild: true, rollbackAvailable: true, realUserEvidence: true };

describe("D4E3C4E3B ordinary readiness", () => {
  it("encodes bounded privacy-safe events", () => {
    const event = encodeOrdinaryV2BoundaryEvent({ outcome: "production_default", reasonCode: "rollout_disabled", family: "ordinary", role: "accessory", userId: "secret", exerciseName: "secret", weight: 100, payload: { reps: 10 } });
    expect(event).not.toHaveProperty("userId"); expect(event).not.toHaveProperty("exerciseName"); expect(event).not.toHaveProperty("weight"); expect(event).not.toHaveProperty("payload"); expect(event.schemaVersion).toBeTruthy();
  });
  it("requires real-user evidence and complete role coverage", () => { expect(evaluateOrdinaryV2Readiness(null).status).toBe("insufficient_evidence"); expect(evaluateOrdinaryV2Readiness({ ...complete, realUserEvidence: false }).status).toBe("insufficient_evidence"); expect(evaluateOrdinaryV2Readiness({ ...complete, evidenceCountByRole: { primary_compound: 1, secondary_compound: 0, accessory: 1 } }).status).toBe("insufficient_evidence"); });
  it("fails not-ready on invariants and exact threshold boundaries", () => { expect(evaluateOrdinaryV2Readiness({ ...complete, invariantViolations: 1 }).status).toBe("not_ready"); expect(evaluateOrdinaryV2Readiness({ ...complete, fallbackRate: READINESS_THRESHOLDS.maxFallbackRate + 0.001 }).status).toBe("not_ready"); expect(evaluateOrdinaryV2Readiness(complete).status).toBe("ready"); });
});
