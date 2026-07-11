import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  deriveDevelopmentTrackLearningPlan,
  developmentTrackLearningArchitectureNotes,
  type DevelopmentTrack,
} from "@/domain/training/development-track-learning-engine";
import type { GoalTranslationOutput } from "@/domain/training/goal-translation-engine";

const strengthGoal = {
  primary_training_goal: "get_stronger",
  secondary_training_goals: [],
  support_function_priorities: ["primary_strength", "technical_practice"],
  energy_system_priorities: ["none"],
} satisfies Pick<GoalTranslationOutput, "primary_training_goal" | "secondary_training_goals" | "support_function_priorities" | "energy_system_priorities">;

const hypertrophyGoal = {
  primary_training_goal: "build_muscle",
  secondary_training_goals: [],
  support_function_priorities: ["target_muscle_stimulus"],
  energy_system_priorities: ["recovery_capacity"],
} satisfies Pick<GoalTranslationOutput, "primary_training_goal" | "secondary_training_goals" | "support_function_priorities" | "energy_system_priorities">;

const athleticGoal = {
  primary_training_goal: "athletic_performance",
  secondary_training_goals: [],
  support_function_priorities: ["power", "movement_quality"],
  energy_system_priorities: ["alactic_power", "sport_specific_conditioning"],
} satisfies Pick<GoalTranslationOutput, "primary_training_goal" | "secondary_training_goals" | "support_function_priorities" | "energy_system_priorities">;

describe("Development Track Learning Engine", () => {
  it("creates long-term development tracks from Goal Translation instead of exercises", () => {
    const result = deriveDevelopmentTrackLearningPlan({
      goal_translation: strengthGoal,
      athlete_experience: "intermediate",
    });

    expect(result.development_tracks.map((track) => track.objective)).toEqual([
      "Horizontal Press Strength",
      "Squat Pattern Strength",
      "Hinge Strength",
      "Pulling Strength",
    ]);
    expect(result.development_tracks.every((track) => !track.track_id.includes("bench_press"))).toBe(true);
    expect(result.reason_codes).toContain("development_tracks_created_by_goal_translation");
    expect(result.reason_codes).toContain("development_tracks_are_not_exercise_specific");
    expect(developmentTrackLearningArchitectureNotes.exerciseSpecific).toBe(false);
  });

  it("keeps one primary learning variable per track", () => {
    const result = deriveDevelopmentTrackLearningPlan({
      goal_translation: hypertrophyGoal,
      athlete_experience: "intermediate",
    });

    for (const track of result.development_tracks) {
      expect(track.learning_variable).toBeTruthy();
      expect(track.active_hypothesis?.learning_variable).toBe(track.learning_variable);
      expect(track.active_hypothesis?.controlled_variables).toContain("session_objective");
      expect(track.active_hypothesis?.controlled_variables).toContain("recovery_constraints");
    }
    expect(result.reason_codes).toContain("one_primary_learning_variable_per_track");
  });

  it("limits simultaneous experiments by learning budget", () => {
    const novice = deriveDevelopmentTrackLearningPlan({
      goal_translation: hypertrophyGoal,
      athlete_experience: "beginner",
    });
    const intermediate = deriveDevelopmentTrackLearningPlan({
      goal_translation: hypertrophyGoal,
      athlete_experience: "intermediate",
    });
    const advanced = deriveDevelopmentTrackLearningPlan({
      goal_translation: athleticGoal,
      athlete_experience: "advanced",
    });
    const elite = deriveDevelopmentTrackLearningPlan({
      goal_translation: athleticGoal,
      athlete_experience: "elite",
    });

    expect(novice.learning_budget_usage.max_active_experiments).toBe(2);
    expect(novice.active_hypotheses).toHaveLength(2);
    expect(intermediate.learning_budget_usage.max_active_experiments).toBe(3);
    expect(intermediate.active_hypotheses).toHaveLength(3);
    expect(advanced.learning_budget_usage.max_active_experiments).toBe(2);
    expect(advanced.active_hypotheses).toHaveLength(2);
    expect(elite.learning_budget_usage.max_active_experiments).toBe(1);
    expect(elite.active_hypotheses).toHaveLength(1);
    expect(novice.reason_codes).toContain("global_learning_budget_respected");
  });

  it("pauses experiments when safety or recovery is limited", () => {
    const result = deriveDevelopmentTrackLearningPlan({
      goal_translation: strengthGoal,
      athlete_experience: "intermediate",
      safety_or_recovery_limited: true,
    });

    expect(result.active_hypotheses).toHaveLength(0);
    expect(result.development_tracks.every((track) => track.status === "paused")).toBe(true);
    expect(result.reason_codes).toContain("safety_recovery_override_experiments");
  });

  it("keeps coaching hypotheses separate from athlete truth", () => {
    const result = deriveDevelopmentTrackLearningPlan({
      goal_translation: hypertrophyGoal,
      athlete_experience: "advanced",
    });

    expect(result.mutates_programme).toBe(false);
    expect(result.updates_athlete_truth).toBe(false);
    expect(result.reason_codes).toContain("athlete_model_stores_truth_tracks_store_hypotheses");
    expect(result.reason_codes).toContain("recommendations_flow_through_existing_engines");
  });

  it("preserves successful and failed experiment history as coaching knowledge candidates", () => {
    const existingTrack: DevelopmentTrack = {
      track_id: "chest_development",
      category: "hypertrophy",
      objective: "Chest Development",
      current_strategy: "Keep chest stimulus stable while testing one volume lever.",
      active_hypothesis: null,
      learning_variable: null,
      current_evidence: {
        evidence_count: 3,
        positive_signals: ["more quality reps"],
        negative_signals: [],
        neutral_signals: [],
      },
      confidence: "medium",
      observation_window: { sessions: 4, minimum_exposures: 2 },
      success_criteria: [{ metric: "quality reps", threshold: "up" }],
      failure_criteria: [{ metric: "pain", threshold: "none" }],
      optimisation_history: [
        {
          hypothesis_id: "chest_development:weekly_quality_volume",
          learning_variable: "weekly_quality_volume",
          outcome: "successful",
          summary: "Added chest volume improved quality reps without recovery cost.",
          completed_at: "2026-07-01",
        },
        {
          hypothesis_id: "chest_development:density",
          learning_variable: "density",
          outcome: "failed",
          summary: "Higher density reduced pressing quality.",
          completed_at: "2026-06-01",
        },
      ],
      status: "completed",
      reason_codes: ["successful_experiments_become_coaching_knowledge", "failed_experiments_become_coaching_knowledge"],
    };

    const result = deriveDevelopmentTrackLearningPlan({
      goal_translation: hypertrophyGoal,
      athlete_experience: "intermediate",
      existing_tracks: [existingTrack],
    });

    const chest = result.development_tracks.find((track) => track.track_id === "chest_development");
    expect(chest?.optimisation_history.map((item) => item.outcome)).toEqual(["successful", "failed"]);
    expect(chest?.current_evidence.evidence_count).toBe(3);
  });

  it("is deterministic", () => {
    const input = {
      goal_translation: athleticGoal,
      athlete_experience: "intermediate" as const,
      current_date: "2026-07-04",
    };

    expect(deriveDevelopmentTrackLearningPlan(input)).toEqual(deriveDevelopmentTrackLearningPlan(input));
  });

  it("does not use network, storage, async, workout generation, or athlete-model mutation", () => {
    const source = readFileSync("src/domain/training/development-track-learning-engine.ts", "utf8");

    expect(source).not.toMatch(/\bfetch\s*\(/);
    expect(source).not.toMatch(/\bawait\b/);
    expect(source).not.toMatch(/AsyncStorage|localStorage|repository|supabase|SQLite/i);
    expect(source).not.toMatch(/\b(buildWorkout|generateWorkout|startWorkout|writeWorkout)\s*\(/);
    expect(source).not.toMatch(/\b(applyValidatedEvidenceToLearnedCharacteristic|addValidatedCoachingMemory)\s*\(/);
  });
});
