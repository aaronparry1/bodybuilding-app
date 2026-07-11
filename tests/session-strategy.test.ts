import { describe, expect, it } from "vitest";
import { decideAdaptiveRepPrescription } from "@/domain/training/adaptive-rep-prescription";
import { deriveCycleStrategyContext } from "@/domain/training/cycle-strategy-context";
import { decideSessionStrategy } from "@/domain/training/session-strategy";

describe("session strategy", () => {
  it("selects productive skill/tension intent for strength accumulation competition squat", () => {
    const decision = decideSessionStrategy({
      goal: "strength",
      exerciseName: "Competition Squat",
      exerciseCategory: "competition_squat",
      trainingPhase: "accumulation",
      recoveryFlag: "normal",
      loadEstimateConfidence: "medium",
      exerciseExposureCount: 4,
    });

    expect(decision.set_objective).toBe("productive");
    expect(["skill", "tension"]).toContain(decision.coaching_bias);
    expect(decision.short_reason.length).toBeLessThanOrEqual(80);
  });

  it("uses performance and peak for strength peak bench when recovery is good and load is owned", () => {
    const decision = decideSessionStrategy({
      goal: "strength",
      exerciseName: "Competition Bench Press",
      exerciseCategory: "competition_bench",
      trainingPhase: "peak",
      recoveryFlag: "good",
      loadEstimateConfidence: "high",
      loadOwnership: "owned",
      exerciseExposureCount: 6,
    });

    expect(decision.set_objective).toBe("performance");
    expect(decision.coaching_bias).toBe("peak");
  });

  it("blocks performance intent when recovery is limited or poor", () => {
    const limited = decideSessionStrategy({
      goal: "strength",
      exerciseName: "Competition Bench Press",
      exerciseCategory: "competition_bench",
      trainingPhase: "peak",
      recoveryFlag: "limited",
      loadEstimateConfidence: "high",
      loadOwnership: "owned",
    });
    const poor = decideSessionStrategy({
      goal: "strength",
      exerciseName: "Competition Bench Press",
      exerciseCategory: "competition_bench",
      trainingPhase: "peak",
      recoveryFlag: "poor",
      loadEstimateConfidence: "high",
      loadOwnership: "owned",
    });

    expect(limited.set_objective).not.toBe("performance");
    expect(poor.set_objective).toBe("recovery");
    expect(poor.coaching_bias).toBe("recovery");
  });

  it("always uses recovery intent in deload", () => {
    const decision = decideSessionStrategy({
      goal: "hypertrophy",
      exerciseName: "Chest Press",
      exerciseCategory: "machine_compound",
      trainingPhase: "deload",
      recoveryFlag: "good",
      recentPerformanceSignal: "underloaded",
    });

    expect(decision.set_objective).toBe("recovery");
    expect(decision.coaching_bias).toBe("recovery");
  });

  it("uses verification when the recent signal is underloaded", () => {
    const decision = decideSessionStrategy({
      goal: "hypertrophy",
      exerciseName: "Chest Press",
      exerciseCategory: "machine_compound",
      trainingPhase: "accumulation",
      recoveryFlag: "normal",
      recentPerformanceSignal: "underloaded",
      loadEstimateConfidence: "medium",
      exerciseExposureCount: 4,
    });

    expect(decision.set_objective).toBe("verification");
    expect(decision.short_reason).toBe("Verify the prescription.");
  });

  it("uses calibration when exposure and load confidence are low", () => {
    const decision = decideSessionStrategy({
      goal: "hypertrophy",
      exerciseName: "Mystery Lift",
      trainingPhase: "accumulation",
      recentPerformanceSignal: "unknown",
      loadEstimateConfidence: "low",
      exerciseExposureCount: 0,
    });

    expect(decision.set_objective).toBe("calibration");
    expect(decision.confidence).toBeLessThan(70);
  });

  it("does not create aggressive deadlift intent when recovery is poor", () => {
    const decision = decideSessionStrategy({
      goal: "strength",
      exerciseName: "Competition Deadlift",
      exerciseCategory: "competition_deadlift",
      trainingPhase: "peak",
      recoveryFlag: "poor",
      loadEstimateConfidence: "high",
      loadOwnership: "owned",
    });

    expect(decision.set_objective).toBe("recovery");
    expect(decision.coaching_bias).toBe("recovery");
  });

  it("keeps low-confidence deadlift load-finding as calibration inside strength intensification", () => {
    const cycleStrategyContext = deriveCycleStrategyContext({
      goal: "strength",
      trainingPhase: "intensification",
      recentPerformanceSignal: "unknown",
      recoveryFlag: "normal",
      loadOwnership: "unknown",
      evidenceConfidence: 72,
    });
    const decision = decideSessionStrategy({
      goal: "strength",
      exerciseName: "Competition Deadlift",
      exerciseCategory: "competition_deadlift",
      movementPattern: "hinge",
      trainingPhase: "intensification",
      recoveryFlag: "normal",
      recentPerformanceSignal: "unknown",
      loadEstimateConfidence: "low",
      loadOwnership: "unknown",
      exerciseExposureCount: 0,
      cycleStrategyContext,
    });

    expect(cycleStrategyContext.allowed_objectives).toContain("calibration");
    expect(decision.set_objective).toBe("calibration");
    expect(decision.coaching_bias).toBe("tension");
    expect(decision.debug_reasons).toContain("cycle allowed objective calibration");
  });

  it("uses productive balanced intent for hypertrophy machine compound with normal recovery", () => {
    const decision = decideSessionStrategy({
      goal: "hypertrophy",
      exerciseName: "Chest Press",
      exerciseCategory: "machine_compound",
      trainingPhase: "accumulation",
      recoveryFlag: "normal",
    });

    expect(decision.set_objective).toBe("productive");
    expect(decision.coaching_bias).toBe("balanced");
  });

  it("uses metabolic bias for hypertrophy isolation when recovery is good", () => {
    const decision = decideSessionStrategy({
      goal: "hypertrophy",
      exerciseName: "Lateral Raise",
      exerciseCategory: "isolation",
      trainingPhase: "accumulation",
      recoveryFlag: "good",
    });

    expect(decision.set_objective).toBe("productive");
    expect(decision.coaching_bias).toBe("metabolic");
  });

  it("uses tension or balanced intent for build muscle + strength compounds", () => {
    const decision = decideSessionStrategy({
      goal: "build_muscle_strength",
      exerciseName: "Incline Dumbbell Press",
      exerciseCategory: "heavy_compound",
      trainingPhase: "accumulation",
      recoveryFlag: "normal",
    });

    expect(decision.set_objective).toBe("productive");
    expect(["tension", "balanced"]).toContain(decision.coaching_bias);
  });

  it("uses speed_power for athletic performance power movements", () => {
    const decision = decideSessionStrategy({
      goal: "athletic_performance",
      exerciseName: "Box Jump",
      exerciseCategory: "power",
      trainingPhase: "accumulation",
      recoveryFlag: "normal",
    });

    expect(decision.set_objective).toBe("productive");
    expect(decision.coaching_bias).toBe("speed_power");
  });

  it("does not make athletic performance accessories speed_power", () => {
    const decision = decideSessionStrategy({
      goal: "athletic_performance",
      exerciseName: "Triceps Pushdown",
      exerciseCategory: "isolation",
      trainingPhase: "accumulation",
      recoveryFlag: "normal",
    });

    expect(decision.set_objective).toBe("productive");
    expect(decision.coaching_bias).not.toBe("speed_power");
  });

  it("uses recovery or conservative intent for get lean with limited recovery", () => {
    const limited = decideSessionStrategy({
      goal: "get_lean",
      exerciseName: "Leg Press",
      exerciseCategory: "heavy_compound",
      trainingPhase: "accumulation",
      recoveryFlag: "limited",
    });
    const poor = decideSessionStrategy({
      goal: "get_lean",
      exerciseName: "Leg Press",
      exerciseCategory: "heavy_compound",
      trainingPhase: "accumulation",
      recoveryFlag: "poor",
    });

    expect(["productive", "recovery"]).toContain(limited.set_objective);
    expect(["recovery", "tension"]).toContain(limited.coaching_bias);
    expect(poor.set_objective).toBe("recovery");
  });

  it("uses simple productive balanced maintenance intent", () => {
    const decision = decideSessionStrategy({
      goal: "maintenance",
      exerciseName: "Chest Supported Row",
      exerciseCategory: "machine_compound",
      trainingPhase: "maintenance",
      recoveryFlag: "normal",
    });

    expect(decision.set_objective).toBe("productive");
    expect(decision.coaching_bias).toBe("balanced");
  });

  it("uses recovery intent when safety flag is present", () => {
    const decision = decideSessionStrategy({
      goal: "strength",
      exerciseName: "Competition Squat",
      exerciseCategory: "competition_squat",
      trainingPhase: "intensification",
      safetyFlag: true,
      recoveryFlag: "good",
    });

    expect(decision.set_objective).toBe("recovery");
    expect(decision.coaching_bias).toBe("recovery");
  });

  it("is deterministic and keeps short reasons compact", () => {
    const context = {
      goal: "hypertrophy" as const,
      exerciseName: "Cable Curl",
      exerciseCategory: "isolation" as const,
      trainingPhase: "accumulation" as const,
      recoveryFlag: "good" as const,
      recentPerformanceSignal: "underloaded" as const,
    };

    const first = decideSessionStrategy(context);
    const second = decideSessionStrategy(context);

    expect(first).toEqual(second);
    expect(first.short_reason.length).toBeLessThanOrEqual(80);
  });

  it("runs synchronously without network, async work, or history scans", () => {
    const startedAt = performance.now();
    let last = decideSessionStrategy({
      goal: "maintenance",
      exerciseName: "Chest Press",
      exerciseCategory: "machine_compound",
      trainingPhase: "maintenance",
    });

    for (let index = 0; index < 1000; index += 1) {
      last = decideSessionStrategy({
        goal: index % 2 === 0 ? "strength" : "hypertrophy",
        exerciseName: index % 2 === 0 ? "Competition Bench Press" : "Cable Curl",
        exerciseCategory: index % 2 === 0 ? "competition_bench" : "isolation",
        trainingPhase: index % 3 === 0 ? "intensification" : "accumulation",
        recoveryFlag: index % 5 === 0 ? "limited" : "normal",
        loadEstimateConfidence: index % 7 === 0 ? "low" : "medium",
      });
    }

    expect(last.set_objective).toBeTruthy();
    expect(performance.now() - startedAt).toBeLessThan(100);
  });

  it("can feed Adaptive Rep Prescription without global wiring", () => {
    const strategy = decideSessionStrategy({
      goal: "hypertrophy",
      exerciseName: "Chest Press",
      exerciseCategory: "machine_compound",
      trainingPhase: "accumulation",
      recentPerformanceSignal: "underloaded",
      recoveryFlag: "normal",
    });

    const prescription = decideAdaptiveRepPrescription({
      goal: "hypertrophy",
      exerciseName: "Chest Press",
      exerciseCategory: "machine_compound",
      trainingPhase: "accumulation",
      setObjective: strategy.set_objective,
      coachingBias: strategy.coaching_bias,
      prescribedRange: { min: 8, max: 12 },
    });

    expect(strategy.set_objective).toBe("verification");
    expect(prescription.prescription_type).toBe("top_range_check");
    expect(prescription.set_objective).toBe(strategy.set_objective);
    expect(prescription.coaching_bias).toBe(strategy.coaching_bias);
  });
});
