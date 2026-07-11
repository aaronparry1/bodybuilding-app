import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  deriveAdaptiveStimulusDelivery,
  type AdaptiveStimulusDeliveryContext,
  type AdaptiveStimulusDeliveryPlan,
} from "@/domain/training/adaptive-stimulus-delivery";
import {
  deriveAdaptiveStimulusPlan,
  type AdaptiveStimulusPlannerContext,
} from "@/domain/training/adaptive-stimulus-planner";

describe("adaptive stimulus delivery", () => {
  it("preserves strength competition anchors", () => {
    const delivery = deliveryFor({
      goal: "strength",
      trainingPhase: "peak",
      sessionType: "full_body",
      recoveryFlag: "good",
    });

    for (const stimulusId of ["competition_squat_strength", "competition_bench_strength", "competition_deadlift_strength"]) {
      const decision = byId(delivery, stimulusId);

      expect(decision.preferred_delivery_type).toBe("competition_lift");
      expect(decision.exercise_archetype).toBe("competition_anchor");
      expect(decision.acceptable_alternatives).toContain("heavy_free_weight_compound");
      expect(decision.rationale).toContain("Specificity is protected");
    }
  });

  it("uses efficient hypertrophy delivery without random variety", () => {
    const delivery = deliveryFor({
      goal: "hypertrophy",
      trainingPhase: "accumulation",
      sessionType: "push",
      recoveryFlag: "normal",
    });

    expect(byId(delivery, "chest_hypertrophy").preferred_delivery_type).toBe("machine_compound");
    expect(byId(delivery, "triceps_hypertrophy").preferred_delivery_type).toBe("cable");
    expect(byId(delivery, "lateral_delt_hypertrophy").preferred_delivery_type).toBe("cable");
    expect(JSON.stringify(delivery).toLowerCase()).not.toContain("variety");
  });

  it("does not automatically prefer machines for every stimulus", () => {
    const strength = deliveryFor({
      goal: "strength",
      trainingPhase: "accumulation",
      sessionType: "full_body",
      recoveryFlag: "normal",
    });
    const athletic = deliveryFor({
      goal: "athletic_performance",
      trainingPhase: "accumulation",
      sessionType: "power",
      recoveryFlag: "normal",
    });

    expect(byId(strength, "competition_bench_strength").preferred_delivery_type).toBe("competition_lift");
    expect(byId(strength, "horizontal_pull_strength").preferred_delivery_type).toBe("heavy_free_weight_compound");
    expect(byId(athletic, "lower_body_power").preferred_delivery_type).toBe("power_movement");
  });

  it("reduces axial loading when low-back fatigue affects non-required anchors", () => {
    const delivery = deliveryFor({
      goal: "strength",
      trainingPhase: "accumulation",
      sessionType: "lower",
      recoveryFlag: "normal",
      knownLimitations: ["low_back_fatigue"],
    });

    expect(byId(delivery, "competition_squat_strength").preferred_delivery_type).toBe("competition_lift");
    expect(byId(delivery, "competition_deadlift_strength").preferred_delivery_type).toBe("machine_compound");
    expect(delivery.avoid_delivery_types).toContain("heavy_free_weight_compound");
  });

  it("changes pressing delivery under shoulder irritation", () => {
    const delivery = deliveryFor({
      goal: "hypertrophy",
      trainingPhase: "accumulation",
      sessionType: "push",
      recoveryFlag: "normal",
      knownLimitations: ["shoulder_irritation"],
    });

    expect(byId(delivery, "chest_hypertrophy").preferred_delivery_type).toBe("cable");
    expect(delivery.avoid_delivery_types).toContain("heavy_free_weight_compound");
    expect(delivery.short_reason).toContain("lower-risk");
  });

  it("keeps athletic performance power work as power movement delivery", () => {
    const delivery = deliveryFor({
      goal: "athletic_performance",
      trainingPhase: "intensification",
      sessionType: "power",
      recoveryFlag: "good",
    });

    expect(byId(delivery, "lower_body_power").preferred_delivery_type).toBe("power_movement");
    expect(byId(delivery, "speed_strength").preferred_delivery_type).toBe("power_movement");
    expect(byId(delivery, "landing_skill").preferred_delivery_type).toBe("skill_movement");
    expect(byId(delivery, "upper_body_power").preferred_delivery_type).toBe("power_movement");
  });

  it("preserves strength quality for get lean while controlling support fatigue", () => {
    const delivery = deliveryFor({
      goal: "get_lean",
      trainingPhase: "accumulation",
      sessionType: "full_body",
      recoveryFlag: "limited",
    });

    expect(byId(delivery, "competition_bench_strength").preferred_delivery_type).toBe("competition_lift");
    expect(byId(delivery, "competition_squat_strength").preferred_delivery_type).toBe("competition_lift");
    expect(["machine_compound", "cable"]).toContain(byId(delivery, "upper_back_hypertrophy").preferred_delivery_type);
  });

  it("keeps maintenance delivery economical", () => {
    const delivery = deliveryFor({
      goal: "maintenance",
      trainingPhase: "maintenance",
      sessionType: "full_body",
      recoveryFlag: "normal",
    });

    expect(byId(delivery, "competition_squat_strength").preferred_delivery_type).toBe("competition_lift");
    expect(byId(delivery, "horizontal_pull_strength").preferred_delivery_type).toBe("free_weight_compound");
    expect(delivery.short_reason).toBe("Deliver planned stimuli economically.");
  });

  it("generates acceptable alternatives for every decision", () => {
    const delivery = deliveryFor({
      goal: "build_muscle_strength",
      trainingPhase: "accumulation",
      sessionType: "upper",
      recoveryFlag: "normal",
    });

    expect(delivery.decisions.length).toBeGreaterThan(0);
    expect(delivery.decisions.every((decision) => decision.acceptable_alternatives.length > 0)).toBe(true);
  });

  it("honours preferred exercises only when they fit the coaching reason", () => {
    const strength = deliveryFor(
      {
        goal: "strength",
        trainingPhase: "peak",
        sessionType: "full_body",
        recoveryFlag: "good",
      },
      { preferredExercise: { stimulus_id: "competition_bench_strength", delivery_type: "machine_compound" } },
    );
    const hypertrophy = deliveryFor(
      {
        goal: "hypertrophy",
        trainingPhase: "accumulation",
        sessionType: "push",
        recoveryFlag: "normal",
      },
      { preferredExercise: { stimulus_id: "triceps_hypertrophy", delivery_type: "isolation" } },
    );

    expect(byId(strength, "competition_bench_strength").preferred_delivery_type).toBe("competition_lift");
    expect(byId(hypertrophy, "triceps_hypertrophy").preferred_delivery_type).toBe("isolation");
  });

  it("is deterministic, local, and complete", () => {
    const context = {
      goal: "build_muscle_strength" as const,
      trainingPhase: "accumulation" as const,
      sessionType: "full_body" as const,
      recoveryFlag: "normal" as const,
      knownLimitations: ["time_limited" as const],
    };
    const first = deliveryFor(context);
    const second = deliveryFor(context);

    expect(first).toEqual(second);
    expect(first.short_reason.length).toBeLessThanOrEqual(80);
    expect(first.decisions.every((decision) => decision.rationale.length > 0 && decision.confidence > 0)).toBe(true);
    expect(first.decisions.every((decision) => decision.specificity_score >= 0 && decision.fatigue_score >= 0)).toBe(true);

    const source = readFileSync("src/domain/training/adaptive-stimulus-delivery.ts", "utf8");
    expect(source).not.toMatch(/\bfetch\s*\(/);
    expect(source).not.toMatch(/from ["']expo/);
    expect(source).not.toContain("syncLocalDataForUser");
    expect(source).not.toContain("workoutSessionRepository");
  });
});

function deliveryFor(
  plannerContext: AdaptiveStimulusPlannerContext,
  overrides: Partial<Omit<AdaptiveStimulusDeliveryContext, "stimulusPlan" | "goal" | "trainingPhase">> = {},
) {
  const stimulusPlan = deriveAdaptiveStimulusPlan(plannerContext);

  return deriveAdaptiveStimulusDelivery({
    stimulusPlan,
    goal: plannerContext.goal,
    trainingPhase: plannerContext.trainingPhase,
    recoveryFlag: plannerContext.recoveryFlag,
    knownLimitations: plannerContext.knownLimitations,
    ...overrides,
  });
}

function byId(delivery: AdaptiveStimulusDeliveryPlan, stimulusId: string) {
  const decision = delivery.decisions.find((candidate) => candidate.stimulus_id === stimulusId);
  expect(decision, `Missing delivery decision for ${stimulusId}`).toBeDefined();
  return decision!;
}
