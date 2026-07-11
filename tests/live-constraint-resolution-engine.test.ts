import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  liveConstraintResolutionArchitectureNotes,
  resolveLiveWorkoutConstraint,
  type LiveConstraintResolutionInput,
} from "../src/domain/training/live-constraint-resolution-engine";

const baseInput: LiveConstraintResolutionInput = {
  activeExerciseId: "bench_press",
  sessionObjective: "maximal bench strength",
  primaryObjectiveExerciseIds: ["bench_press"],
  constraintSignal: "none",
  painIssueFlag: "none",
  failedSets: 0,
  techniqueBreakdown: false,
  fatigueSpike: false,
  equipmentIssueCanBeSolvedLater: true,
  availableAlternativeSameObjective: true,
  exerciseMatchingAvailable: true,
  densityPlan: {
    time_compression_options: [
      {
        action: "pair_accessories",
        target_layers: ["structural_balance"],
      },
    ],
  },
  sessionCompositionLayers: [
    {
      layer_id: "mission_critical",
      exercise_ids: ["bench_press"],
      required: true,
    },
    {
      layer_id: "structural_balance",
      exercise_ids: ["chest_supported_row"],
      required: false,
    },
  ],
  recoveryBetweenEffortsGuidance: {
    recovery_objective: "full_recovery",
    suggested_rest_range: {
      min_seconds: 180,
      max_seconds: 300,
    },
  },
  liveTimeRemainingMinutes: 25,
  remainingExerciseIds: ["chest_supported_row", "triceps_pushdown"],
  blockedExerciseIds: [],
  userOverrideAllowed: true,
};

describe("Live Constraint Resolution Engine", () => {
  it("classifies safety constraints and selects a safety-first termination", () => {
    const output = resolveLiveWorkoutConstraint({
      ...baseInput,
      constraintSignal: "dizziness",
      painIssueFlag: "unsafe",
    });

    expect(output.identified_constraint.category).toBe("safety");
    expect(output.constraint_severity).toBe("critical");
    expect(output.selected_solution.action).toBe("terminate_workout");
    expect(output.reason_codes).toContain("safety_overrides_all");
    expect(output.safety_flags).toContain("dizziness_or_medical_concern");
    expect(output.evidence_for_9J[0].safety_related).toBe(true);
    expect(output.active_session_only).toBe(true);
    expect(output.permanent_mutation_allowed).toBe(false);
  });

  it("prefers reordering before exercise substitution for equipment constraints", () => {
    const output = resolveLiveWorkoutConstraint({
      ...baseInput,
      constraintSignal: "rack_unavailable",
      remainingExerciseIds: ["row", "triceps_pushdown"],
      equipmentIssueCanBeSolvedLater: true,
    });

    expect(output.identified_constraint.category).toBe("equipment");
    expect(output.selected_solution.action).toBe("reorder_exercises");
    expect(output.reason_codes).toContain("equipment_reorder_before_substitution");
    expect(output.ranked_solution_options.map((option) => option.action)).toContain("substitute_exercise");
    expect(output.if_required_exercise_substitution.required).toBe(false);
  });

  it("uses Exercise Matching handoff only when substitution is required", () => {
    const output = resolveLiveWorkoutConstraint({
      ...baseInput,
      constraintSignal: "machine_occupied",
      equipmentIssueCanBeSolvedLater: false,
      remainingExerciseIds: [],
      exerciseMatchingAvailable: true,
      availableAlternativeSameObjective: true,
    });

    expect(output.selected_solution.action).toBe("remove_lower_priority_work");
    const substitution = output.ranked_solution_options.find((option) => option.action === "substitute_exercise");
    expect(substitution?.requires_exercise_matching_engine).toBe(true);
    expect(output.reason_codes).toContain("substitution_requires_exercise_matching_engine");
    expect(output.reason_codes).toContain("no_independent_matching_logic");
  });

  it("uses density and composition before cutting mission-critical work for time constraints", () => {
    const output = resolveLiveWorkoutConstraint({
      ...baseInput,
      constraintSignal: "gym_closing",
      liveTimeRemainingMinutes: 8,
    });

    expect(output.identified_constraint.category).toBe("time");
    expect(output.selected_solution.action).toBe("compress_density");
    expect(output.reason_codes).toContain("time_uses_density_and_composition_first");
    expect(output.selected_solution.preserves_session_objective).toBe(true);
    expect(output.evidence_for_9J[0].signal).toBe("time_compressed");
  });

  it("uses loading and recovery-style adjustments before substitution for performance constraints", () => {
    const output = resolveLiveWorkoutConstraint({
      ...baseInput,
      constraintSignal: "repeated_failed_sets",
      failedSets: 2,
    });

    expect(output.identified_constraint.category).toBe("performance");
    expect(output.selected_solution.action).toBe("modify_load");
    expect(output.ranked_solution_options[1].action).toBe("extend_recovery");
    expect(output.reason_codes).toContain("performance_load_recovery_before_substitution");
    expect(output.if_required_exercise_substitution.required).toBe(false);
  });

  it("preserves the session objective for user-choice constraints where safe", () => {
    const output = resolveLiveWorkoutConstraint({
      ...baseInput,
      constraintSignal: "preference",
      userOverrideAllowed: true,
    });

    expect(output.identified_constraint.category).toBe("user_choice");
    expect(output.selected_solution.action).toBe("modify_grip");
    expect(output.selected_solution.preserves_session_objective).toBe(true);
    expect(output.reason_codes).toContain("user_override_respected_with_guardrails");
  });

  it("keeps architecture notes explicit about active-session scope", () => {
    expect(liveConstraintResolutionArchitectureNotes.decision_id).toBe("10B");
    expect(liveConstraintResolutionArchitectureNotes.active_session_only).toBe(true);
    expect(liveConstraintResolutionArchitectureNotes.permanent_mutation_allowed).toBe(false);
    expect(liveConstraintResolutionArchitectureNotes.exercise_substitution_requires_exercise_matching_engine).toBe(true);
  });

  it("does not duplicate existing engine implementation logic", () => {
    const source = readFileSync("src/domain/training/live-constraint-resolution-engine.ts", "utf8");

    expect(source).not.toMatch(/\b(matchExercisesToSupportFunctions|rankExerciseCandidates|decideLoadingProgression|planRecoveryBetweenEfforts|composeSession)\s*\(/);
    expect(source).not.toMatch(/\b(fetch|XMLHttpRequest|localStorage|AsyncStorage|setItem|getItem)\b/);
    expect(source).not.toMatch(/\b(mutateProgramme|replaceProgramme|transitionProgramme|writeWorkout|startWorkout)\s*\(/i);
  });
});
