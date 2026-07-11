import { describe, expect, it } from "vitest";
import { decideAdaptiveRepPrescription } from "@/domain/training/adaptive-rep-prescription";
import { deriveCycleStrategyContext } from "@/domain/training/cycle-strategy-context";
import { decideSessionStrategy } from "@/domain/training/session-strategy";

describe("cycle strategy context", () => {
  it("allows productive tension and skill work during strength accumulation", () => {
    const context = deriveCycleStrategyContext({
      goal: "strength",
      trainingPhase: "accumulation",
      recoveryFlag: "normal",
      evidenceConfidence: 80,
    });

    expect(context.allowed_objectives).toEqual(expect.arrayContaining(["productive", "verification", "calibration"]));
    expect(context.allowed_biases).toEqual(expect.arrayContaining(["tension", "skill"]));
    expect(context.short_reason.length).toBeLessThanOrEqual(80);
  });

  it("blocks metabolic bias during strength peak", () => {
    const context = deriveCycleStrategyContext({
      goal: "strength",
      trainingPhase: "peak",
      recoveryFlag: "good",
      loadOwnership: "owned",
      evidenceConfidence: 90,
    });

    expect(context.allowed_objectives).toEqual(expect.arrayContaining(["performance", "recovery", "verification"]));
    expect(context.blocked_biases).toContain("metabolic");
  });

  it("allows balanced and metabolic bias during hypertrophy accumulation", () => {
    const context = deriveCycleStrategyContext({
      goal: "hypertrophy",
      trainingPhase: "accumulation",
      recoveryFlag: "normal",
    });

    expect(context.allowed_objectives).toEqual(expect.arrayContaining(["productive", "verification", "calibration"]));
    expect(context.allowed_biases).toEqual(expect.arrayContaining(["balanced", "metabolic"]));
  });

  it("blocks all non-recovery objectives during deload", () => {
    const context = deriveCycleStrategyContext({
      goal: "build_muscle_strength",
      trainingPhase: "deload",
      recoveryFlag: "good",
    });

    expect(context.allowed_objectives).toEqual(["recovery"]);
    expect(context.blocked_objectives).toEqual(expect.arrayContaining(["calibration", "productive", "verification", "performance"]));
    expect(context.stress_budget_bias).toBe("conserve");
  });

  it("conserves stress for get lean with poor recovery", () => {
    const context = deriveCycleStrategyContext({
      goal: "get_lean",
      trainingPhase: "accumulation",
      recoveryFlag: "poor",
      evidenceConfidence: 75,
    });

    expect(context.allowed_objectives).toEqual(["recovery"]);
    expect(context.stress_budget_bias).toBe("conserve");
  });

  it("allows athletic performance peak expression with speed power and low fatigue", () => {
    const context = deriveCycleStrategyContext({
      goal: "athletic_performance",
      trainingPhase: "peak",
      recoveryFlag: "good",
      evidenceConfidence: 88,
    });

    expect(context.allowed_objectives).toContain("performance");
    expect(context.allowed_biases).toContain("speed_power");
    expect(context.micro_emphasis).toBe("low_fatigue_expression");
    expect(context.stress_budget_bias).toBe("conserve");
  });

  it("biases build muscle + strength intensification toward strength support", () => {
    const context = deriveCycleStrategyContext({
      goal: "build_muscle_strength",
      trainingPhase: "intensification",
      recoveryFlag: "normal",
    });

    expect(context.meso_focus).toBe("specific_strength");
    expect(context.allowed_biases).toEqual(expect.arrayContaining(["tension", "balanced", "skill"]));
  });

  it("keeps maintenance away from aggressive performance and calibration", () => {
    const context = deriveCycleStrategyContext({
      goal: "maintenance",
      trainingPhase: "maintenance",
      recoveryFlag: "normal",
    });

    expect(context.allowed_objectives).toEqual(["productive", "verification"]);
    expect(context.blocked_objectives).toEqual(expect.arrayContaining(["performance", "calibration"]));
  });

  it("makes Session Strategy respect a blocked objective", () => {
    const cycle = deriveCycleStrategyContext({
      goal: "maintenance",
      trainingPhase: "maintenance",
      recoveryFlag: "normal",
    });

    const strategy = decideSessionStrategy({
      goal: "strength",
      exerciseName: "Competition Bench Press",
      exerciseCategory: "competition_bench",
      trainingPhase: "peak",
      recoveryFlag: "good",
      loadEstimateConfidence: "high",
      loadOwnership: "owned",
      cycleStrategyContext: cycle,
    });

    expect(strategy.set_objective).not.toBe("performance");
    expect(cycle.allowed_objectives).toContain(strategy.set_objective);
    expect(strategy.debug_reasons.join(" ")).toContain("cycle blocked objective");
  });

  it("makes Session Strategy respect a blocked bias", () => {
    const cycle = deriveCycleStrategyContext({
      goal: "strength",
      trainingPhase: "peak",
      recoveryFlag: "good",
      evidenceConfidence: 90,
    });

    const strategy = decideSessionStrategy({
      goal: "hypertrophy",
      exerciseName: "Lateral Raise",
      exerciseCategory: "isolation",
      trainingPhase: "accumulation",
      recoveryFlag: "good",
      cycleStrategyContext: cycle,
    });

    expect(strategy.coaching_bias).not.toBe("metabolic");
    expect(cycle.allowed_biases).toContain(strategy.coaching_bias);
    expect(strategy.debug_reasons.join(" ")).toContain("cycle blocked bias");
  });

  it("chains Cycle Strategy to Session Strategy to Rep Prescription", () => {
    const cycle = deriveCycleStrategyContext({
      goal: "hypertrophy",
      trainingPhase: "accumulation",
      recoveryFlag: "normal",
      recentPerformanceSignal: "underloaded",
      evidenceConfidence: 82,
    });

    const strategy = decideSessionStrategy({
      goal: "hypertrophy",
      exerciseName: "Chest Press",
      exerciseCategory: "machine_compound",
      trainingPhase: "accumulation",
      recoveryFlag: "normal",
      recentPerformanceSignal: "underloaded",
      cycleStrategyContext: cycle,
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

    expect(cycle.allowed_objectives).toContain(strategy.set_objective);
    expect(strategy.set_objective).toBe("verification");
    expect(prescription.prescription_type).toBe("top_range_check");
    expect(prescription.set_objective).toBe(strategy.set_objective);
  });

  it("is deterministic and keeps short reasons compact", () => {
    const input = {
      goal: "build_muscle_strength" as const,
      trainingPhase: "intensification" as const,
      weekInBlock: 4,
      blockLengthWeeks: 6,
      plannedTrainingDays: 4,
      currentSessionIndex: 2,
      recentPerformanceSignal: "improving" as const,
      recoveryFlag: "good" as const,
      evidenceConfidence: 84,
    };

    const first = deriveCycleStrategyContext(input);
    const second = deriveCycleStrategyContext(input);

    expect(first).toEqual(second);
    expect(first.short_reason.length).toBeLessThanOrEqual(80);
  });

  it("runs synchronously without network, async work, or history scans", () => {
    const startedAt = performance.now();
    let last = deriveCycleStrategyContext({
      goal: "maintenance",
      trainingPhase: "maintenance",
    });

    for (let index = 0; index < 1000; index += 1) {
      last = deriveCycleStrategyContext({
        goal: index % 2 === 0 ? "strength" : "hypertrophy",
        trainingPhase: index % 3 === 0 ? "intensification" : "accumulation",
        recoveryFlag: index % 5 === 0 ? "limited" : "normal",
        evidenceConfidence: 50 + (index % 50),
      });
    }

    expect(last.macro_intent).toBeTruthy();
    expect(performance.now() - startedAt).toBeLessThan(100);
  });
});
