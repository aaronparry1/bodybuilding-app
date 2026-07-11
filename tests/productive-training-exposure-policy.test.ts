import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  evaluateProductiveTrainingExposure,
  productiveTrainingExposureArchitectureNotes,
  type ProductiveExposureInput,
} from "../src/domain/training/productive-training-exposure-policy";

function baseInput(overrides: Partial<ProductiveExposureInput> = {}): ProductiveExposureInput {
  return {
    qualityOfExecution: {
      execution_quality: "good",
      learning_weight: "high",
      downstream_learning_permission: "allow_weighted_learning",
    },
    recoveryManagement: {
      recovery_status: "recovered",
      recommended_recovery_bias: "none",
      veto_flags: [],
    },
    adaptationStatus: {
      adaptation_status: "adapting",
      confidence: 82,
    },
    liveWorkoutCoachingAction: "no_change",
    sessionLayers: [
      { layer_id: "mission_critical", required: true, objective_achieved: false },
      { layer_id: "primary_support", required: false, objective_achieved: false },
      { layer_id: "structural_balance", required: false, objective_achieved: false },
    ],
    resourceAllocation: {
      mission_critical_minimum_met: false,
      primary_support_minimum_met: false,
      lower_priority_layers_remaining: ["primary_support", "structural_balance"],
    },
    methodSelection: {
      method_id: "straight_sets",
      effort_cap: "controlled",
      has_backoff_work: false,
    },
    loadingPolicy: {
      primary_work_completed: false,
      backoff_sets_remaining: 0,
      prescribed_work_sets: 3,
      completed_work_sets: 1,
    },
    liveConstraintResolution: {
      constraint_severity: "none",
      selected_solution: {
        level: "level_1_continue_unchanged",
        action: "continue_unchanged",
        preserves_session_objective: true,
        requires_exercise_matching_engine: false,
        estimated_cost: "none",
        rationale: "No constraint.",
      },
      safety_flags: [],
    },
    safetyPainPolicy: {
      safety_decision: "continue",
      severity: "low",
      blocked_live_actions: [],
    },
    timeRemainingMinutes: 25,
    workoutCompletionPercentage: 35,
    repeatedPoorQualitySets: 0,
    amrapCapReached: false,
    fatigueBasedMethodCapReached: false,
    ...overrides,
  };
}

describe("Productive Training Exposure Policy", () => {
  it("lets productive mission-critical work continue when training effect remains high", () => {
    const output = evaluateProductiveTrainingExposure(baseInput());

    expect(output.training_effect_remaining).toBe("high");
    expect(output.productive_exposure_status).toBe("productive");
    expect(output.recommended_action).toBe("continue_training");
    expect(output.active_workout_only).toBe(true);
    expect(output.permanent_programming_change_allowed).toBe(false);
  });

  it("lets safety override productivity", () => {
    const output = evaluateProductiveTrainingExposure(baseInput({
      safetyPainPolicy: {
        safety_decision: "stop_exercise",
        severity: "high",
        blocked_live_actions: ["increase_next_set_load"],
      },
    }));

    expect(output.training_effect_remaining).toBe("negative");
    expect(output.productive_exposure_status).toBe("unsafe");
    expect(output.recommended_action).toBe("terminate_exercise");
    expect(output.reason_codes).toContain("safety_overrides_productivity");
    expect(output.safety_flags).toContain("safety_gate_stop");
    expect(output.evidence_flags_for_9J).toContain("pain_flag");
  });

  it("recognises mission completion and avoids unnecessary additional work", () => {
    const output = evaluateProductiveTrainingExposure(baseInput({
      sessionLayers: [
        { layer_id: "mission_critical", required: true, objective_achieved: true },
        { layer_id: "primary_support", required: false, objective_achieved: false },
      ],
      resourceAllocation: {
        mission_critical_minimum_met: true,
        primary_support_minimum_met: true,
        lower_priority_layers_remaining: ["structural_balance"],
      },
      loadingPolicy: {
        primary_work_completed: true,
        backoff_sets_remaining: 0,
        prescribed_work_sets: 3,
        completed_work_sets: 3,
      },
      workoutCompletionPercentage: 62,
    }));

    expect(output.training_effect_remaining).toBe("negligible");
    expect(output.productive_exposure_status).toBe("objective_met");
    expect(output.recommended_action).toBe("complete_objective");
    expect(output.reason_codes).toContain("mission_objective_achieved");
    expect(output.reason_codes).toContain("junk_volume_not_rewarded");
  });

  it("prevents junk volume after repeated poor-quality work", () => {
    const output = evaluateProductiveTrainingExposure(baseInput({
      qualityOfExecution: {
        execution_quality: "poor",
        learning_weight: "minimal",
        downstream_learning_permission: "allow_weighted_learning",
      },
      repeatedPoorQualitySets: 2,
      workoutCompletionPercentage: 48,
    }));

    expect(output.training_effect_remaining).toBe("negative");
    expect(output.productive_exposure_status).toBe("junk_volume_risk");
    expect(output.recommended_action).toBe("reduce_exposure");
    expect(output.reason_codes).toContain("poor_quality_work_reduces_exposure");
    expect(output.reason_codes).toContain("junk_volume_not_rewarded");
  });

  it("removes lower-priority layers before mission-critical work", () => {
    const output = evaluateProductiveTrainingExposure(baseInput({
      recoveryManagement: {
        recovery_status: "recovering",
        recommended_recovery_bias: "monitor",
        veto_flags: [],
      },
      resourceAllocation: {
        mission_critical_minimum_met: true,
        primary_support_minimum_met: false,
        lower_priority_layers_remaining: ["weakness_development", "structural_balance", "recovery_mobility_optional"],
      },
      loadingPolicy: {
        primary_work_completed: false,
        backoff_sets_remaining: 0,
        prescribed_work_sets: 4,
        completed_work_sets: 3,
      },
      workoutCompletionPercentage: 78,
    }));

    expect(output.recommended_action).toBe("reduce_exposure");
    expect(output.affected_session_layers).toEqual(["weakness_development", "structural_balance", "recovery_mobility_optional"]);
    expect(output.affected_session_layers).not.toContain("mission_critical");
    expect(output.reason_codes).toContain("lower_priority_layers_removed_first");
    expect(output.reason_codes).toContain("mission_critical_protected");
  });

  it("respects AMRAP and fatigue effort caps", () => {
    const output = evaluateProductiveTrainingExposure(baseInput({
      amrapCapReached: true,
      methodSelection: {
        method_id: "last_set_amrap",
        effort_cap: "capped_amrap",
        has_backoff_work: true,
      },
    }));

    expect(output.recommended_action).toBe("complete_objective");
    expect(output.reason_codes).toContain("effort_cap_respected");
    expect(output.safety_flags).toContain("effort_cap_reached");
  });

  it("removes backoff work before compromising primary work", () => {
    const output = evaluateProductiveTrainingExposure(baseInput({
      sessionLayers: [
        { layer_id: "mission_critical", required: true, objective_achieved: true },
        { layer_id: "primary_support", required: false, objective_achieved: false },
      ],
      resourceAllocation: {
        mission_critical_minimum_met: true,
        primary_support_minimum_met: false,
        lower_priority_layers_remaining: ["structural_balance"],
      },
      loadingPolicy: {
        primary_work_completed: true,
        backoff_sets_remaining: 2,
        prescribed_work_sets: 5,
        completed_work_sets: 3,
      },
    }));

    expect(output.recommended_action).toBe("complete_objective");
    expect(output.affected_session_layers).toContain("primary_support");
    expect(output.reason_codes).toContain("backoff_removed_before_primary_work");
  });

  it("prioritises training effect ahead of workout completion percentage", () => {
    const output = evaluateProductiveTrainingExposure(baseInput({
      workoutCompletionPercentage: 95,
      resourceAllocation: {
        mission_critical_minimum_met: false,
        primary_support_minimum_met: true,
        lower_priority_layers_remaining: ["structural_balance"],
      },
      loadingPolicy: {
        primary_work_completed: false,
        backoff_sets_remaining: 0,
        prescribed_work_sets: 4,
        completed_work_sets: 2,
      },
    }));

    expect(output.recommended_action).toBe("continue_training");
    expect(output.reason_codes).toContain("training_effect_over_completion_percentage");
  });

  it("uses time constraints after higher-priority productivity checks", () => {
    const output = evaluateProductiveTrainingExposure(baseInput({
      timeRemainingMinutes: 4,
      resourceAllocation: {
        mission_critical_minimum_met: false,
        primary_support_minimum_met: false,
        lower_priority_layers_remaining: ["structural_balance"],
      },
    }));

    expect(output.recommended_action).toBe("reduce_exposure");
    expect(output.reason_codes).toContain("time_constraint_considered_last");
    expect(output.evidence_flags_for_9J).toContain("time_compression");
  });

  it("keeps architecture notes explicit", () => {
    expect(productiveTrainingExposureArchitectureNotes.decision_id).toBe("10E");
    expect(productiveTrainingExposureArchitectureNotes.active_workout_only).toBe(true);
    expect(productiveTrainingExposureArchitectureNotes.permanent_programming_change_allowed).toBe(false);
    expect(productiveTrainingExposureArchitectureNotes.coaching_learning_routes_to_9j).toBe(true);
  });

  it("does not contain network, storage, mutation, or future-programming behavior", () => {
    const source = readFileSync("src/domain/training/productive-training-exposure-policy.ts", "utf8");

    expect(source).not.toMatch(/\b(fetch|XMLHttpRequest|localStorage|AsyncStorage|setItem|getItem)\b/);
    expect(source).not.toMatch(/\b(mutateProgramme|replaceProgramme|transitionProgramme|writeWorkout|startWorkout)\s*\(/i);
    expect(source).not.toMatch(/\b(generateWorkout|buildWorkout|selectExercise|selectMethod|decideIntervention)\s*\(/i);
  });
});
