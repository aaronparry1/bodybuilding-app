import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { goalTranslationArchitectureNotes, translateUserGoalToCoachObjectives } from "@/domain/training/goal-translation-engine";

describe("Goal Translation Engine", () => {
  it("translates vague general fitness into structured coaching objectives", () => {
    const output = translateUserGoalToCoachObjectives({
      user_stated_goal: "improve general fitness",
      training_age: "beginner",
    });

    expect(output.primary_training_goal).toBe("general_fitness");
    expect(output.session_priority_bias).toBe("balanced_development");
    expect(output.support_function_priorities).toContain("movement_balance");
    expect(output.energy_system_priorities).toContain("aerobic_base");
    expect(output.success_metrics).toContain("movement_quality");
    expect(output.reason_codes).toContain("vague_goal_made_measurable");
  });

  it("preserves strength goals as loadable measurable progression", () => {
    const output = translateUserGoalToCoachObjectives({
      user_stated_goal: "get stronger",
      current_strength_level: "moderate",
    });

    expect(output.primary_training_goal).toBe("get_stronger");
    expect(output.session_priority_bias).toBe("strength_first");
    expect(output.support_function_priorities).toContain("primary_strength");
    expect(output.progression_expectations).toContain("loadable_progression_when_owned");
    expect(output.reason_codes).toContain("strength_biases_loadable_measurable_progression");
  });

  it("preserves hypertrophy goals as recoverable target-muscle stimulus", () => {
    const output = translateUserGoalToCoachObjectives({
      user_stated_goal: "build muscle",
    });

    expect(output.primary_training_goal).toBe("build_muscle");
    expect(output.session_priority_bias).toBe("hypertrophy_first");
    expect(output.support_function_priorities).toContain("target_muscle_stimulus");
    expect(output.progression_expectations).toContain("recoverable_volume_progression");
  });

  it("does not turn fat loss into excessive conditioning by default", () => {
    const output = translateUserGoalToCoachObjectives({
      user_stated_goal: "lose fat",
      bodyweight_goal: "lose_weight",
    });

    expect(output.primary_training_goal).toBe("lose_fat");
    expect(output.session_priority_bias).toBe("fat_loss_preservation");
    expect(output.support_function_priorities).toContain("strength_preservation");
    expect(output.energy_system_priorities).toEqual(["recovery_capacity", "aerobic_base"]);
    expect(output.contraindicated_emphases).toContain("fatigue_chasing");
    expect(output.reason_codes).toContain("fat_loss_does_not_force_excess_conditioning");
  });

  it("translates athletic and sport goals into transfer, power, and movement-quality priorities", () => {
    const output = translateUserGoalToCoachObjectives({
      user_stated_goal: "train for sport",
      sport: "rugby",
    });

    expect(output.primary_training_goal).toBe("sport_training");
    expect(output.session_priority_bias).toBe("performance_transfer");
    expect(output.support_function_priorities).toContain("sport_transfer");
    expect(output.energy_system_priorities).toContain("sport_specific_conditioning");
    expect(output.success_metrics).toContain("performance_transfer");
  });

  it("handles conflicting goals safely while preserving the primary stated goal", () => {
    const output = translateUserGoalToCoachObjectives({
      user_stated_goal: "get stronger",
      secondary_user_goals: ["lose fat", "improve conditioning"],
      bodyweight_goal: "lose_weight",
      injury_pain_restrictions: ["shoulder pain"],
    });

    expect(output.primary_training_goal).toBe("get_stronger");
    expect(output.secondary_training_goals).toEqual(["lose_fat", "conditioning_development"]);
    expect(output.recovery_priority).toBe("critical");
    expect(output.contraindicated_emphases).toContain("pain_aggravating_patterns");
    expect(output.reason_codes).toContain("conflicting_goals_resolved_safely");
  });

  it("biases return-after-layoff toward Foundation re-entry and conservative progression", () => {
    const output = translateUserGoalToCoachObjectives({
      user_stated_goal: "return after time off",
      training_age: "returning",
      adherence_history: "poor",
    });

    expect(output.primary_training_goal).toBe("return_to_training");
    expect(output.recommended_training_states[0]).toBe("Foundation");
    expect(output.progression_expectations[0]).toBe("conservative_reentry");
    expect(output.recovery_priority).toBe("critical");
  });

  it("marks translated objectives as the downstream contract rather than raw user wording", () => {
    const output = translateUserGoalToCoachObjectives({ user_stated_goal: "improve confidence" });

    expect(output.raw_user_goal_consumed).toBe(true);
    expect(output.builds_workouts).toBe(false);
    expect(output.reason_codes).toContain("downstream_engines_use_translated_objectives");
    expect(goalTranslationArchitectureNotes.downstreamEnginesConsumeTranslatedObjectives).toBe(true);
    expect(goalTranslationArchitectureNotes.rawUserWordingIsNotAPlan).toBe(true);
  });

  it("is deterministic", () => {
    const input = {
      user_stated_goal: "stay healthy",
      training_age: "new" as const,
      available_time: "limited" as const,
    };

    expect(translateUserGoalToCoachObjectives(input)).toEqual(translateUserGoalToCoachObjectives(input));
  });

  it("does not use network, storage, async, or workout generation", () => {
    const source = readFileSync("src/domain/training/goal-translation-engine.ts", "utf8");

    expect(source).not.toMatch(/\bfetch\s*\(/);
    expect(source).not.toMatch(/\bawait\b/);
    expect(source).not.toMatch(/AsyncStorage|localStorage|repository|supabase/i);
    expect(source).not.toMatch(/\b(buildWorkout|generateWorkout|startWorkout|writeWorkout)\s*\(/);
  });
});
