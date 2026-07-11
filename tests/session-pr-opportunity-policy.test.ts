import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  chooseSessionPrOpportunity,
  sessionPrOpportunityArchitectureNotes,
  type SessionPrInput,
} from "../src/domain/training/session-pr-opportunity-policy";

function baseInput(overrides: Partial<SessionPrInput> = {}): SessionPrInput {
  return {
    session_objective: "bench strength",
    training_state: "Intensification",
    selected_method: {
      method_id: "top_set_backoffs",
      effort_cap: "controlled",
      allows_taxing_pr: true,
    },
    loading_prescription: {
      target_exercise_id: "bench",
      prescribed_load: 102.5,
      prescribed_reps: 3,
      prescribed_sets: 4,
    },
    exercise_history: [
      {
        exercise_id: "bench",
        exercise_name: "Bench Press",
        movement_pattern: "horizontal_press",
        last_load: 100,
        best_load: 100,
        best_reps_at_load: 3,
        best_estimated_1rm: 112,
        best_volume: 1200,
        recent_consistency_streak: 2,
      },
    ],
    recent_pr_history: [],
    adaptation_status: "adapting",
    recovery_status: "recovered",
    pain_safety_flags: [],
    execution_quality_history: ["good", "good", "excellent"],
    athlete_model_summary: {
      experience: "intermediate",
      recovery_capacity: "high",
    },
    intervention_outputs: {
      selected_intervention: "no_change",
      reason_codes: [],
    },
    ...overrides,
  };
}

describe("Session PR Opportunity Policy", () => {
  it("selects a realistic PR opportunity for suitable sessions", () => {
    const output = chooseSessionPrOpportunity(baseInput());

    expect(output.pr_type).toBe("load_pr");
    expect(output.target_exercise).toBe("Bench Press");
    expect(output.target_metric).toBe("load");
    expect(output.risk_level).toBe("moderate");
    expect(output.reason_codes).toContain("supports_session_objective");
    expect(output.reason_codes).toContain("small_realistic_target");
    expect(output.user_facing_message).toMatch(/Small PR opportunity/);
  });

  it("blocks unsafe PR attempts and falls back to recovery-friendly progress when possible", () => {
    const output = chooseSessionPrOpportunity(baseInput({
      pain_safety_flags: ["pain_stop"],
      recovery_status: "borderline",
    }));

    expect(output.pr_type).toBe("recovery_friendly_pr");
    expect(output.risk_level).toBe("low");
    expect(output.reason_codes).toContain("unsafe_pr_blocked");
    expect(output.reason_codes).toContain("deload_or_pivot_uses_recovery_friendly_pr");
    expect(output.user_facing_message).toMatch(/No pressure/);
  });

  it("uses low-cost PRs when recovery is limited", () => {
    const output = chooseSessionPrOpportunity(baseInput({
      recovery_status: "compromised",
      pain_safety_flags: [],
    }));

    expect(output.pr_type).toBe("recovery_friendly_pr");
    expect(output.risk_level).toBe("low");
    expect(output.reason_codes).toContain("low_cost_pr_for_limited_recovery");
  });

  it("does not force taxing PRs during deload or pivot", () => {
    const deload = chooseSessionPrOpportunity(baseInput({ training_state: "Deload" }));
    const pivot = chooseSessionPrOpportunity(baseInput({ training_state: "Pivot" }));

    expect(deload.pr_type).toBe("recovery_friendly_pr");
    expect(pivot.pr_type).toBe("recovery_friendly_pr");
    expect(deload.risk_level).toBe("low");
    expect(pivot.risk_level).toBe("low");
  });

  it("respects method effort caps", () => {
    const output = chooseSessionPrOpportunity(baseInput({
      selected_method: {
        method_id: "recovery_straight_sets",
        effort_cap: "no_grind",
        allows_taxing_pr: false,
      },
    }));

    expect(output.pr_type).not.toBe("load_pr");
    expect(output.reason_codes).toContain("method_effort_cap_respected");
    expect(output.risk_level).toBe("low");
  });

  it("falls back to consistency or quality PRs when no physical PR is appropriate", () => {
    const output = chooseSessionPrOpportunity(baseInput({
      training_state: "Foundation",
      loading_prescription: {
        target_exercise_id: "goblet_squat",
        prescribed_load: 24,
        prescribed_reps: 8,
        prescribed_sets: 3,
      },
      exercise_history: [
        {
          exercise_id: "goblet_squat",
          exercise_name: "Goblet Squat",
          movement_pattern: "squat",
          variation_recently_introduced: true,
        },
      ],
      execution_quality_history: ["acceptable"],
    }));

    expect(output.pr_type).toBe("exercise_variation_pr");
    expect(output.target_metric).toBe("variation ownership");
    expect(output.reason_codes).toContain("small_realistic_target");
  });

  it("keeps PR opportunity gated by Live Workout Coaching and Productive Training Exposure", () => {
    const output = chooseSessionPrOpportunity(baseInput());

    expect(output.live_workout_coaching_must_confirm).toBe(true);
    expect(output.productive_exposure_must_confirm).toBe(true);
    expect(output.reason_codes).toContain("live_workout_coaching_final_gate");
    expect(output.reason_codes).toContain("productive_exposure_final_gate");
  });

  it("routes PR outcomes to Coaching Evidence Engine and does not change programming directly", () => {
    const output = chooseSessionPrOpportunity(baseInput());

    expect(output.evidence_flags_for_9J).toContain("performance_improved");
    expect(output.direct_programming_change_allowed).toBe(false);
    expect(output.reason_codes).toContain("pr_outcome_routes_to_9j");
    expect(output.reason_codes).toContain("no_direct_programming_change");
  });

  it("frames PRs as progress rather than pressure", () => {
    const output = chooseSessionPrOpportunity(baseInput());

    expect(output.reason_codes).toContain("progress_not_pressure");
    expect(output.user_facing_message).not.toMatch(/must|required|have to|failure/i);
  });

  it("keeps architecture notes explicit", () => {
    expect(sessionPrOpportunityArchitectureNotes.decision_id).toBe("10H");
    expect(sessionPrOpportunityArchitectureNotes.identifies_pr_opportunity_only).toBe(true);
    expect(sessionPrOpportunityArchitectureNotes.live_workout_coaching_final_gate).toBe(true);
    expect(sessionPrOpportunityArchitectureNotes.productive_exposure_final_gate).toBe(true);
    expect(sessionPrOpportunityArchitectureNotes.direct_programming_change_allowed).toBe(false);
  });

  it("does not contain network, storage, mutation, or live override behavior", () => {
    const source = readFileSync("src/domain/training/session-pr-opportunity-policy.ts", "utf8");

    expect(source).not.toMatch(/\b(fetch|XMLHttpRequest|localStorage|AsyncStorage|setItem|getItem)\b/);
    expect(source).not.toMatch(/\b(mutateProgramme|replaceProgramme|transitionProgramme|writeWorkout|startWorkout)\s*\(/i);
    expect(source).not.toMatch(/\b(coachLiveWorkout|evaluateProductiveTrainingExposure|processCoachingEvidence)\s*\(/);
  });
});
