import { describe, expect, it } from "vitest";
import { decideAdaptiveLoadPrescription } from "@/domain/training/adaptive-load-prescription";
import { decideAdaptiveRepPrescription } from "@/domain/training/adaptive-rep-prescription";
import { deriveCycleStrategyContext } from "@/domain/training/cycle-strategy-context";
import { decideSessionStrategy } from "@/domain/training/session-strategy";

describe("adaptive load prescription", () => {
  it("uses small progression for owned load with improving signal and good recovery", () => {
    const prescription = decideAdaptiveLoadPrescription({
      goal: "strength",
      exerciseName: "Competition Bench Press",
      exerciseCategory: "competition_bench",
      movementPattern: "horizontal_push",
      trainingPhase: "intensification",
      repPrescription: rep("fixed_reps", "productive", "tension", "heavier_specific_load", 86),
      previousLoad: 100,
      loadOwnership: "owned",
      recentPerformanceSignal: "improving",
      recoveryFlag: "good",
      availableLoadJump: 2.5,
    });

    expect(prescription.load_action).toBe("increase_load");
    expect(prescription.load_strategy).toBe("small_progression");
    expect(prescription.suggested_load).toBe(102.5);
  });

  it("keeps introduced load for stabilisation", () => {
    const prescription = decideAdaptiveLoadPrescription({
      goal: "strength",
      exerciseName: "Competition Squat",
      exerciseCategory: "competition_squat",
      trainingPhase: "intensification",
      repPrescription: rep("fixed_reps", "productive", "tension", "heavier_specific_load", 84),
      previousLoad: 140,
      loadOwnership: "introduced",
      recentPerformanceSignal: "appropriate",
      recoveryFlag: "normal",
    });

    expect(prescription.load_action).toBe("keep_load");
    expect(prescription.short_reason).toBe("Stabilise the new load.");
  });

  it("keeps or reduces unstable load instead of progressing", () => {
    const stableEnough = decideAdaptiveLoadPrescription({
      goal: "strength",
      exerciseName: "Competition Squat",
      exerciseCategory: "competition_squat",
      trainingPhase: "accumulation",
      repPrescription: rep("fixed_reps", "productive", "skill", "conservative_load", 80),
      previousLoad: 120,
      loadOwnership: "unstable",
      recentPerformanceSignal: "appropriate",
      recoveryFlag: "normal",
    });
    const limited = decideAdaptiveLoadPrescription({
      goal: "strength",
      exerciseName: "Competition Squat",
      exerciseCategory: "competition_squat",
      trainingPhase: "accumulation",
      repPrescription: rep("fixed_reps", "productive", "skill", "conservative_load", 80),
      previousLoad: 120,
      loadOwnership: "unstable",
      recentPerformanceSignal: "plateau",
      recoveryFlag: "limited",
    });

    expect(stableEnough.load_action).toBe("keep_load");
    expect(limited.load_action).toBe("reduce_load");
  });

  it("poor recovery blocks load increase", () => {
    const prescription = decideAdaptiveLoadPrescription({
      goal: "strength",
      exerciseName: "Competition Bench Press",
      exerciseCategory: "competition_bench",
      trainingPhase: "peak",
      repPrescription: rep("fixed_reps", "performance", "peak", "heavier_specific_load", 88),
      previousLoad: 100,
      loadOwnership: "owned",
      recentPerformanceSignal: "improving",
      recoveryFlag: "poor",
      availableLoadJump: 2.5,
    });

    expect(prescription.load_action).toBe("reduce_load");
    expect(prescription.load_strategy).toBe("recovery_load");
  });

  it("deload produces recovery load", () => {
    const prescription = decideAdaptiveLoadPrescription({
      goal: "hypertrophy",
      exerciseName: "Leg Press",
      exerciseCategory: "heavy_compound",
      trainingPhase: "deload",
      repPrescription: rep("recovery_reps", "recovery", "recovery", "recovery_load", 86),
      previousLoad: 180,
      loadOwnership: "owned",
      recoveryFlag: "normal",
    });

    expect(prescription.load_action).toBe("reduce_load");
    expect(prescription.load_strategy).toBe("recovery_load");
    expect(prescription.intensity_band).toBe("very_light");
  });

  it("keeps deadlift calibration conservative and capped", () => {
    const prescription = decideAdaptiveLoadPrescription({
      goal: "strength",
      exerciseName: "Competition Deadlift",
      exerciseCategory: "competition_deadlift",
      movementPattern: "hinge",
      trainingPhase: "accumulation",
      repPrescription: rep("capped_amrap", "calibration", "tension", "conservative_load", 62),
      previousLoad: 180,
      lastSuccessfulLoad: 170,
      loadOwnership: "unknown",
      recentPerformanceSignal: "unknown",
      recoveryFlag: "normal",
    });

    expect(prescription.load_action).toBe("conservative_start");
    expect(prescription.load_strategy).toBe("calibration_load");
    expect(prescription.suggested_load).toBe(170);
    expect(prescription.debug_reasons.join(" ")).toContain("high-risk calibration");
  });

  it("bench progression can be less conservative than deadlift progression", () => {
    const bench = decideAdaptiveLoadPrescription({
      goal: "strength",
      exerciseName: "Competition Bench Press",
      exerciseCategory: "competition_bench",
      trainingPhase: "intensification",
      repPrescription: rep("fixed_reps", "productive", "tension", "heavier_specific_load", 88),
      previousLoad: 100,
      loadOwnership: "owned",
      recentPerformanceSignal: "underloaded",
      recoveryFlag: "good",
      availableLoadJump: 2.5,
    });
    const deadlift = decideAdaptiveLoadPrescription({
      goal: "strength",
      exerciseName: "Competition Deadlift",
      exerciseCategory: "competition_deadlift",
      movementPattern: "hinge",
      trainingPhase: "intensification",
      repPrescription: rep("fixed_reps", "productive", "tension", "heavier_specific_load", 88),
      previousLoad: 180,
      loadOwnership: "owned",
      recentPerformanceSignal: "underloaded",
      recoveryFlag: "good",
      availableLoadJump: 5,
    });

    expect(bench.load_strategy).toBe("small_progression");
    expect(deadlift.load_strategy).toBe("conservative_progression");
    expect(deadlift.suggested_change ?? 0).toBeLessThanOrEqual(5);
  });

  it("uses small progression for underloaded hypertrophy isolation", () => {
    const prescription = decideAdaptiveLoadPrescription({
      goal: "hypertrophy",
      exerciseName: "Lateral Raise",
      exerciseCategory: "isolation",
      movementPattern: "isolation",
      trainingPhase: "accumulation",
      repPrescription: rep("top_range_check", "verification", "metabolic", "use_current_load", 84),
      previousLoad: 12,
      loadOwnership: "owned",
      recentPerformanceSignal: "underloaded",
      recoveryFlag: "good",
      availableLoadJump: 1,
    });

    expect(prescription.load_action).toBe("increase_load");
    expect(prescription.load_strategy).toBe("small_progression");
  });

  it("keeps appropriate hypertrophy load", () => {
    const prescription = decideAdaptiveLoadPrescription({
      goal: "hypertrophy",
      exerciseName: "Chest Press",
      exerciseCategory: "machine_compound",
      trainingPhase: "accumulation",
      repPrescription: rep("fixed_reps", "productive", "balanced", "use_current_load", 84),
      previousLoad: 70,
      loadOwnership: "owned",
      recentPerformanceSignal: "appropriate",
      recoveryFlag: "normal",
    });

    expect(prescription.load_action).toBe("keep_load");
    expect(prescription.load_strategy).toBe("owned_load");
  });

  it("reduces or conserves load when overreached", () => {
    const prescription = decideAdaptiveLoadPrescription({
      goal: "build_muscle_strength",
      exerciseName: "Leg Press",
      exerciseCategory: "heavy_compound",
      trainingPhase: "intensification",
      repPrescription: rep("fixed_reps", "productive", "tension", "conservative_load", 80),
      previousLoad: 200,
      loadOwnership: "owned",
      recentPerformanceSignal: "overreached",
      recoveryFlag: "limited",
    });

    expect(prescription.load_action).toBe("reduce_load");
    expect(["recovery_load", "conservative_progression"]).toContain(prescription.load_strategy);
  });

  it("uses power quality load for power movements", () => {
    const prescription = decideAdaptiveLoadPrescription({
      goal: "athletic_performance",
      exerciseName: "Speed Bench",
      exerciseCategory: "power",
      trainingPhase: "intensification",
      repPrescription: rep("fixed_reps", "productive", "speed_power", "quality_speed_load", 84),
      previousLoad: 50,
      loadOwnership: "owned",
      recentPerformanceSignal: "appropriate",
      recoveryFlag: "good",
    });

    expect(prescription.load_action).toBe("keep_load");
    expect(prescription.load_strategy).toBe("power_quality_load");
    expect(prescription.short_reason).toContain("speed");
  });

  it("uses no external load for duration plank", () => {
    const prescription = decideAdaptiveLoadPrescription({
      goal: "maintenance",
      exerciseName: "Plank",
      exerciseCategory: "duration_bodyweight",
      movementPattern: "core",
      trainingPhase: "maintenance",
      repPrescription: rep("duration_hold", "productive", "balanced", "use_current_load", 78),
      loadOwnership: "owned",
      recentPerformanceSignal: "appropriate",
    });

    expect(prescription.load_action).toBe("no_external_load");
    expect(prescription.load_strategy).toBe("bodyweight_or_duration");
  });

  it("blocks forced increase when the available jump is too large", () => {
    const prescription = decideAdaptiveLoadPrescription({
      goal: "hypertrophy",
      exerciseName: "Lateral Raise",
      exerciseCategory: "isolation",
      movementPattern: "isolation",
      trainingPhase: "accumulation",
      repPrescription: rep("top_range_check", "verification", "metabolic", "use_current_load", 88),
      previousLoad: 10,
      loadOwnership: "owned",
      recentPerformanceSignal: "underloaded",
      recoveryFlag: "good",
      availableLoadJump: 5,
    });

    expect(prescription.load_action).toBe("keep_load");
    expect(prescription.short_reason).toBe("Jump is too large. Keep load.");
  });

  it("estimates or starts conservatively for AMRAP with low confidence", () => {
    const estimate = decideAdaptiveLoadPrescription({
      goal: "hypertrophy",
      exerciseName: "Cable Curl",
      exerciseCategory: "isolation",
      trainingPhase: "accumulation",
      repPrescription: rep("amrap", "calibration", "metabolic", "estimate_load", 62),
      previousLoad: 20,
      loadOwnership: "unknown",
      recentPerformanceSignal: "unknown",
    });
    const start = decideAdaptiveLoadPrescription({
      goal: "hypertrophy",
      exerciseName: "Cable Curl",
      exerciseCategory: "isolation",
      trainingPhase: "accumulation",
      repPrescription: rep("amrap", "calibration", "metabolic", "estimate_load", 62),
      loadOwnership: "unknown",
      recentPerformanceSignal: "unknown",
    });

    expect(estimate.load_action).toBe("estimate_from_amrap");
    expect(start.load_action).toBe("conservative_start");
  });

  it("keeps short reasons compact", () => {
    const prescription = decideAdaptiveLoadPrescription({
      goal: "strength",
      exerciseName: "Competition Bench Press",
      exerciseCategory: "competition_bench",
      trainingPhase: "intensification",
      repPrescription: rep("fixed_reps", "productive", "tension", "heavier_specific_load", 88),
      previousLoad: 100,
      loadOwnership: "owned",
      recentPerformanceSignal: "improving",
      recoveryFlag: "good",
    });

    expect(prescription.short_reason.length).toBeLessThanOrEqual(80);
  });

  it("is deterministic and performs no network, async, or history scan work", () => {
    const context = {
      goal: "maintenance" as const,
      exerciseName: "Chest Press",
      exerciseCategory: "machine_compound" as const,
      trainingPhase: "maintenance" as const,
      repPrescription: rep("fixed_reps", "productive", "balanced", "use_current_load", 80),
      previousLoad: 70,
      loadOwnership: "owned" as const,
      recentPerformanceSignal: "appropriate" as const,
    };
    const startedAt = performance.now();
    const first = decideAdaptiveLoadPrescription(context);
    const second = decideAdaptiveLoadPrescription(context);

    for (let index = 0; index < 1000; index += 1) decideAdaptiveLoadPrescription(context);

    expect(first).toEqual(second);
    expect(performance.now() - startedAt).toBeLessThan(100);
  });

  it("chains Cycle Strategy to Session Strategy to Rep Prescription to Load Prescription", () => {
    const cycle = deriveCycleStrategyContext({
      goal: "hypertrophy",
      trainingPhase: "accumulation",
      recoveryFlag: "good",
      recentPerformanceSignal: "underloaded",
      loadOwnership: "owned",
      evidenceConfidence: 88,
    });
    const session = decideSessionStrategy({
      goal: "hypertrophy",
      exerciseName: "Lateral Raise",
      exerciseCategory: "isolation",
      movementPattern: "isolation",
      trainingPhase: "accumulation",
      recoveryFlag: "good",
      recentPerformanceSignal: "underloaded",
      loadEstimateConfidence: "high",
      exerciseExposureCount: 6,
      loadOwnership: "owned",
      cycleStrategyContext: cycle,
    });
    const repPrescription = decideAdaptiveRepPrescription({
      goal: "hypertrophy",
      exerciseName: "Lateral Raise",
      exerciseCategory: "isolation",
      movementPattern: "isolation",
      trainingPhase: "accumulation",
      setObjective: session.set_objective,
      coachingBias: session.coaching_bias,
      prescribedRange: { min: 10, max: 15 },
      exerciseExposureCount: 6,
      loadEstimateConfidence: 90,
      recentPerformanceSignal: "underloaded",
    });
    const load = decideAdaptiveLoadPrescription({
      goal: "hypertrophy",
      exerciseName: "Lateral Raise",
      exerciseCategory: "isolation",
      movementPattern: "isolation",
      trainingPhase: "accumulation",
      cycleStrategyContext: cycle,
      sessionStrategy: session,
      repPrescription,
      previousLoad: 12,
      loadOwnership: "owned",
      recentPerformanceSignal: "underloaded",
      recoveryFlag: "good",
      availableLoadJump: 1,
    });

    expect(session.set_objective).toBe("verification");
    expect(repPrescription.prescription_type).toBe("top_range_check");
    expect(load.load_action).toBe("increase_load");
    expect(load.debug_reasons.join(" ")).toContain("cycle stress");
    expect(load.debug_reasons.join(" ")).toContain("session verification");
  });
});

function rep(
  prescription_type:
    | "fixed_reps"
    | "top_range_check"
    | "amrap"
    | "capped_amrap"
    | "recovery_reps"
    | "duration_hold"
    | "duration_carry",
  set_objective: "calibration" | "productive" | "verification" | "performance" | "recovery",
  coaching_bias: "tension" | "balanced" | "metabolic" | "speed_power" | "skill" | "recovery" | "peak",
  load_strategy: "use_current_load" | "conservative_load" | "heavier_specific_load" | "quality_speed_load" | "recovery_load" | "estimate_load",
  confidence: number,
) {
  return {
    prescription_type,
    load_strategy,
    set_objective,
    coaching_bias,
    confidence,
    short_reason: "Test rep prescription.",
    debug_reasons: ["test rep prescription"],
  };
}
