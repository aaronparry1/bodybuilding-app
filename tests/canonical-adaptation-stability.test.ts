import { describe, expect, it } from "vitest";
import { stabilizeCanonicalNumericDecisions } from "@/domain/training/canonical-adaptation-stability";

const numeric = (outcome: "progress_load" | "regress_load", before: number, after: number) => ({
  schemaVersion: "canonical_numeric_prescription_decision_v1", policyId: "canonical_numeric_progression_policy_v1", outcome,
  comparableExposureKey: "stable-key", exerciseId: "bench", planSessionIndex: 0, sessionRole: "Upper", constructionRole: "primary",
  exerciseRole: "press", lane: "strength", method: "straight_sets", progressionRule: "load_progression", evidenceIds: [outcome],
  exposureCount: 3, successfulExposureCount: outcome === "progress_load" ? 3 : 0, failedExposureCount: outcome === "regress_load" ? 2 : 0,
  reasonCode: outcome, before: { prescribedBaseLoad: before, exactTargets: [5] }, after: { prescribedBaseLoad: after, exactTargets: [5] },
  exactNumericDelta: { loadKg: after - before, repetitions: [0] },
} as const);

describe("adaptation stability", () => {
  it("holds an immediate opposing adjustment but permits continuation in the same direction", () => {
    const priorNumeric = numeric("progress_load", 80, 82.5);
    const history = [{ phaseOne: { decidedAt: "2026-01-01", boundedAdjustment: { numericDecisions: [priorNumeric] } } }] as never;
    expect(stabilizeCanonicalNumericDecisions([numeric("regress_load", 82.5, 80)], history)[0]).toMatchObject({
      outcome: "hold", after: undefined, reasonCode: "opposing_numeric_change_requires_confirming_evidence_window",
    });
    expect(stabilizeCanonicalNumericDecisions([numeric("progress_load", 82.5, 85)], history)[0]?.after?.prescribedBaseLoad).toBe(85);
  });
});
