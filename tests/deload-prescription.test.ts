import { describe, expect, it } from "vitest";
import { buildDeloadPrescription, hasDeloadEvidence, resolveDeloadPrescription } from "@/domain/training/deload-prescription";
import type { BlockReadiness, StrategicSignals } from "@/domain/training/strategic-coaching";

function signals(patch: Partial<StrategicSignals> = {}): StrategicSignals {
  return {
    progressionRate: 0.05,
    qualitySetTrend: "falling",
    fatigueTrend: "high",
    volumeTolerance: "declining",
    exercisePerformanceTrend: "falling",
    recoveryTrend: "unknown",
    stalledExercises: [],
    progressingMuscles: [],
    undertrainedMuscles: [],
    overreachedMuscles: [],
    sessionsAnalyzed: 6,
    exerciseEntriesAnalyzed: 12,
    averageQualitySets: 2,
    shutdownRate: 0.45,
    ...patch,
  };
}

function readiness(score: number, patch: Partial<StrategicSignals> = {}): BlockReadiness {
  const resolvedSignals = signals(patch);
  return {
    score,
    band: score < 40 ? "deload_or_adjust" : score < 60 ? "monitor" : "continue",
    factors: {
      progression: 20,
      qualitySets: 30,
      fatigue: 18,
      volumeTolerance: 30,
      recovery: 70,
    },
    signals: resolvedSignals,
    reasons: ["Fatigue is high.", "Quality sets are falling."],
  };
}

describe("deload prescriptions", () => {
  it("builds mild, clear, and severe deload profiles", () => {
    const mild = buildDeloadPrescription("mild");
    const clear = buildDeloadPrescription("clear");
    const severe = buildDeloadPrescription("severe");

    expect(mild.productiveSetReductionPercent).toEqual({ min: 30, max: 40 });
    expect(clear.productiveSetReductionPercent).toEqual({ min: 40, max: 60 });
    expect(severe.productiveSetReductionPercent).toEqual({ min: 50, max: 70 });
    expect(clear.suppressEscalationPrompts).toBe(true);
    expect(severe.suppressAggressiveProgression).toBe(true);
  });

  it("resolves clear and severe deloads from repeated objective evidence", () => {
    expect(resolveDeloadPrescription({ readiness: readiness(38) })?.profile).toBe("severe");
    expect(resolveDeloadPrescription({ readiness: readiness(45, { shutdownRate: 0.4, averageQualitySets: 4, exercisePerformanceTrend: "flat" }) })?.profile).toBe("clear");
  });

  it("requires repeated completed-session evidence", () => {
    const thinSignals = signals({ sessionsAnalyzed: 1, exerciseEntriesAnalyzed: 2 });

    expect(hasDeloadEvidence(thinSignals)).toBe(false);
    expect(resolveDeloadPrescription({ readiness: readiness(25, thinSignals) })).toBeNull();
  });

  it("does not allow a full deload from only two or three planned sessions", () => {
    for (const sessionsAnalyzed of [2, 3]) {
      const thinSignals = signals({
        sessionsAnalyzed,
        exerciseEntriesAnalyzed: sessionsAnalyzed,
        fatigueTrend: "high",
        qualitySetTrend: "falling",
        volumeTolerance: "declining",
        exercisePerformanceTrend: "falling",
        shutdownRate: 0.6,
      });

      expect(hasDeloadEvidence(thinSignals)).toBe(false);
      expect(resolveDeloadPrescription({ readiness: readiness(25, thinSignals) })).toBeNull();
    }
  });

  it("uses safe training-preparation copy without medical claims", () => {
    const copy = [
      buildDeloadPrescription("mild").coachCopy,
      buildDeloadPrescription("clear").coachCopy,
      buildDeloadPrescription("severe").coachCopy,
    ].join(" ");

    expect(copy).not.toMatch(/rehab|therapy|cure|fix pain|recovery protocol/i);
    expect(copy).toContain("Pull back");
  });
});
