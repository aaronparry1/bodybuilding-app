import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { deriveAdaptiveStimulusPlan, type AdaptiveStimulusPlan } from "@/domain/training/adaptive-stimulus-planner";
import { deriveCycleStrategyContext } from "@/domain/training/cycle-strategy-context";

describe("adaptive stimulus planner", () => {
  it("prioritises competition-specific strength stimuli and removes optional junk in strength peak", () => {
    const plan = deriveAdaptiveStimulusPlan({
      goal: "strength",
      trainingPhase: "peak",
      sessionType: "full_body",
      recoveryFlag: "good",
    });

    expect(ids(plan.primary_stimuli)).toEqual(expect.arrayContaining(["competition_squat_strength", "competition_bench_strength", "competition_deadlift_strength"]));
    expect(plan.primary_stimuli.every((target) => target.specificity === "competition_specific")).toBe(true);
    expect(plan.optional_stimuli).toEqual([]);
    expect(plan.avoid_stimuli).toEqual(expect.arrayContaining(["junk_hypertrophy", "amrap"]));
  });

  it("keeps competition anchors plus support stimulus during strength accumulation", () => {
    const plan = deriveAdaptiveStimulusPlan({
      goal: "strength",
      trainingPhase: "accumulation",
      sessionType: "full_body",
      recoveryFlag: "normal",
    });

    expect(ids(plan.primary_stimuli)).toEqual(expect.arrayContaining(["competition_squat_strength", "competition_bench_strength", "competition_deadlift_strength"]));
    expect(ids(plan.secondary_stimuli)).toEqual(expect.arrayContaining(["overhead_press_strength", "horizontal_pull_strength"]));
    expect(ids(plan.optional_stimuli)).toEqual(expect.arrayContaining(["upper_back_hypertrophy", "triceps_hypertrophy", "hamstring_hypertrophy"]));
  });

  it("hypertrophy push outputs chest, triceps, and delt stimuli instead of exercise names", () => {
    const plan = deriveAdaptiveStimulusPlan({
      goal: "hypertrophy",
      trainingPhase: "accumulation",
      sessionType: "push",
      recoveryFlag: "normal",
    });

    expect(ids(plan.primary_stimuli)).toEqual(expect.arrayContaining(["chest_hypertrophy", "triceps_hypertrophy", "lateral_delt_hypertrophy"]));
    expect(serialized(plan)).not.toContain("Bench Press");
    expect(serialized(plan)).not.toContain("Lateral Raise");
  });

  it("hypertrophy legs includes quad, hamstring, and glute stimuli", () => {
    const plan = deriveAdaptiveStimulusPlan({
      goal: "hypertrophy",
      trainingPhase: "accumulation",
      sessionType: "legs",
      recoveryFlag: "normal",
    });

    expect(ids(plan.primary_stimuli)).toEqual(expect.arrayContaining(["quad_hypertrophy", "hamstring_hypertrophy", "glute_hypertrophy"]));
  });

  it("build muscle + strength preserves heavy compound anchors plus hypertrophy support", () => {
    const plan = deriveAdaptiveStimulusPlan({
      goal: "build_muscle_strength",
      trainingPhase: "accumulation",
      sessionType: "upper",
      recoveryFlag: "normal",
    });

    expect(ids(plan.primary_stimuli)).toContain("competition_bench_strength");
    expect(ids(plan.secondary_stimuli)).toEqual(expect.arrayContaining(["chest_hypertrophy", "triceps_hypertrophy", "upper_back_hypertrophy"]));
    expect(plan.avoid_stimuli).toContain("simultaneous_high_load_and_high_volume_push");
  });

  it("athletic performance power session prioritises power and speed stimuli", () => {
    const plan = deriveAdaptiveStimulusPlan({
      goal: "athletic_performance",
      trainingPhase: "accumulation",
      sessionType: "power",
      recoveryFlag: "normal",
    });

    expect(ids(plan.primary_stimuli)).toEqual(expect.arrayContaining(["lower_body_power", "speed_strength", "landing_skill"]));
    expect(plan.primary_stimuli.every((target) => target.fatigue_budget === "low")).toBe(true);
    expect(plan.avoid_stimuli).toContain("velocity_claims_without_sensors");
  });

  it("get lean with poor recovery conserves stress and preserves quality work", () => {
    const plan = deriveAdaptiveStimulusPlan({
      goal: "get_lean",
      trainingPhase: "accumulation",
      recoveryFlag: "poor",
      sessionType: "full_body",
    });

    expect(plan.stress_budget_bias).toBe("conserve");
    expect(ids(plan.primary_stimuli)).toEqual(expect.arrayContaining(["recovery_stimulus", "technical_practice"]));
    expect(plan.avoid_stimuli).toContain("high_fatigue_compounds");
  });

  it("maintenance preserves key movement patterns without aggressive extras", () => {
    const plan = deriveAdaptiveStimulusPlan({
      goal: "maintenance",
      trainingPhase: "maintenance",
      sessionType: "full_body",
      recoveryFlag: "normal",
    });

    expect(ids(plan.primary_stimuli)).toEqual(expect.arrayContaining(["competition_squat_strength", "competition_bench_strength", "horizontal_pull_strength"]));
    expect(plan.optional_stimuli).toEqual([]);
    expect(plan.avoid_stimuli).toEqual(expect.arrayContaining(["aggressive_optional_volume", "unnecessary_performance_testing"]));
  });

  it("deload outputs recovery, skill, and low-stress maintenance", () => {
    const plan = deriveAdaptiveStimulusPlan({
      goal: "build_muscle_strength",
      trainingPhase: "deload",
      recoveryFlag: "good",
    });

    expect(ids(plan.primary_stimuli)).toEqual(expect.arrayContaining(["recovery_stimulus", "technical_practice"]));
    expect(ids(plan.secondary_stimuli)).toContain("low_stress_movement");
    expect(plan.primary_stimuli.every((target) => target.fatigue_budget === "low")).toBe(true);
  });

  it("low-back fatigue constrains high axial hinge and squat stimuli", () => {
    const plan = deriveAdaptiveStimulusPlan({
      goal: "strength",
      trainingPhase: "accumulation",
      sessionType: "lower",
      recoveryFlag: "normal",
      knownLimitations: ["low_back_fatigue"],
    });
    const squat = allTargets(plan).find((target) => target.stimulus_id === "competition_squat_strength");
    const deadlift = allTargets(plan).find((target) => target.stimulus_id === "competition_deadlift_strength");

    expect(squat?.delivery_constraints).toContain("low_axial");
    expect(deadlift?.delivery_constraints).toContain("low_axial");
    expect(plan.avoid_stimuli).toEqual(expect.arrayContaining(["high_axial_hinge_stress", "high_axial_squat_stress"]));
  });

  it("shoulder irritation constrains pressing and overhead stimuli", () => {
    const plan = deriveAdaptiveStimulusPlan({
      goal: "hypertrophy",
      trainingPhase: "accumulation",
      sessionType: "push",
      recoveryFlag: "normal",
      knownLimitations: ["shoulder_irritation"],
    });
    const chest = allTargets(plan).find((target) => target.stimulus_id === "chest_hypertrophy");

    expect(chest?.delivery_constraints).toEqual(expect.arrayContaining(["low_joint_stress", "stable_path", "avoid_failure"]));
    expect(plan.optional_stimuli.some((target) => target.stimulus_id === "front_delt_hypertrophy")).toBe(false);
    expect(plan.avoid_stimuli).toContain("aggressive_overhead_stress");
  });

  it("time limited trims optional stimuli first", () => {
    const plan = deriveAdaptiveStimulusPlan({
      goal: "hypertrophy",
      trainingPhase: "accumulation",
      sessionType: "full_body",
      recoveryFlag: "normal",
      knownLimitations: ["time_limited"],
    });

    expect(plan.optional_stimuli).toEqual([]);
    expect(plan.primary_stimuli.length).toBeGreaterThan(0);
    expect(plan.secondary_stimuli.length).toBeGreaterThan(0);
    expect(plan.avoid_stimuli).toContain("optional_stimulus");
  });

  it("can consume Cycle Strategy Context without global wiring", () => {
    const cycleStrategyContext = deriveCycleStrategyContext({
      goal: "strength",
      trainingPhase: "intensification",
      recoveryFlag: "normal",
      recentPerformanceSignal: "improving",
      evidenceConfidence: 84,
    });

    const plan = deriveAdaptiveStimulusPlan({
      goal: "strength",
      trainingPhase: "intensification",
      sessionType: "full_body",
      cycleStrategyContext,
    });

    expect(plan.stress_budget_bias).toBe(cycleStrategyContext.stress_budget_bias);
    expect(ids(plan.primary_stimuli)).toContain("competition_bench_strength");
    expect(plan.debug_reasons.join(" ")).toContain("stress budget");
  });

  it("is deterministic, local, compact, and complete", () => {
    const context = {
      goal: "build_muscle_strength" as const,
      trainingPhase: "accumulation" as const,
      sessionType: "full_body" as const,
      recoveryFlag: "normal" as const,
      knownLimitations: ["time_limited" as const],
    };
    const first = deriveAdaptiveStimulusPlan(context);
    const second = deriveAdaptiveStimulusPlan(context);

    expect(first).toEqual(second);
    expect(first.short_reason.length).toBeLessThanOrEqual(80);
    expect(allTargets(first).every((target) => target.rationale.length > 0 && target.confidence > 0)).toBe(true);

    const source = readFileSync("src/domain/training/adaptive-stimulus-planner.ts", "utf8");
    expect(source).not.toMatch(/\bfetch\s*\(/);
    expect(source).not.toMatch(/from ["']expo/);
    expect(source).not.toContain("syncLocalDataForUser");
    expect(source).not.toContain("workoutSessionRepository");
  });
});

function ids(targets: { stimulus_id: string }[]) {
  return targets.map((target) => target.stimulus_id);
}

function allTargets(plan: AdaptiveStimulusPlan) {
  return [...plan.primary_stimuli, ...plan.secondary_stimuli, ...plan.optional_stimuli];
}

function serialized(plan: AdaptiveStimulusPlan) {
  return JSON.stringify(plan);
}
