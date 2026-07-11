import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  assessQualityOfExecution,
  qualityOfExecutionArchitectureNotes,
  type QualityOfExecutionInput,
} from "../src/domain/training/quality-of-execution-engine";

function baseInput(overrides: Partial<QualityOfExecutionInput> = {}): QualityOfExecutionInput {
  return {
    sessionId: "session-1",
    prescribed_sets: 3,
    completed_sets: 3,
    sets: [
      { prescribed_load: 100, completed_load: 100, prescribed_reps: 5, completed_reps: 5, completed: true },
      { prescribed_load: 100, completed_load: 100, prescribed_reps: 5, completed_reps: 5, completed: true },
      { prescribed_load: 100, completed_load: 100, prescribed_reps: 5, completed_reps: 5, completed: true },
    ],
    skipped_sets: 0,
    skipped_exercises: 0,
    substitutions: 0,
    exercise_order_changes: 0,
    prescribed_rest_seconds: [180, 180],
    actual_rest_seconds: [180, 180],
    prescribed_duration_minutes: 60,
    workout_duration_minutes: 60,
    early_termination: false,
    session_compression: false,
    pain_flag: "none",
    dizziness: false,
    equipment_constraints: false,
    recovery_effort_input: "normal",
    recovery_effort_input_validated: true,
    ...overrides,
  };
}

describe("Quality of Execution Engine", () => {
  it("classifies excellent execution as fully learnable", () => {
    const output = assessQualityOfExecution(baseInput());

    expect(output.execution_quality).toBe("excellent");
    expect(output.learning_weight).toBe("full");
    expect(output.downstream_learning_permission).toBe("allow_full_learning");
    expect(output.evidence_reliability).toBe("very_high");
    expect(output.quality_reason_codes).toContain("prescription_completed_as_planned");
  });

  it("keeps minor deviations usable with reduced confidence", () => {
    const output = assessQualityOfExecution(baseInput({
      sets: [
        { prescribed_load: 100, completed_load: 97.5, prescribed_reps: 5, completed_reps: 5, completed: true },
        { prescribed_load: 100, completed_load: 100, prescribed_reps: 5, completed_reps: 4, completed: true },
        { prescribed_load: 100, completed_load: 100, prescribed_reps: 5, completed_reps: 5, completed: true },
      ],
      actual_rest_seconds: [210, 180],
    }));

    expect(output.execution_quality).toBe("good");
    expect(output.learning_weight).toBe("high");
    expect(output.downstream_learning_permission).toBe("allow_weighted_learning");
    expect(output.quality_reason_codes).toContain("minor_deviation_reduced_confidence");
  });

  it("reduces learning weight for significant deviations", () => {
    const output = assessQualityOfExecution(baseInput({
      completed_sets: 2,
      skipped_sets: 1,
      substitutions: 1,
      session_compression: true,
      sets: [
        { prescribed_load: 100, completed_load: 90, prescribed_reps: 5, completed_reps: 3, completed: true, failed: true },
        { prescribed_load: 100, completed_load: 90, prescribed_reps: 5, completed_reps: 3, completed: true, failed: true },
      ],
    }));

    expect(["questionable", "poor"]).toContain(output.execution_quality);
    expect(["low", "minimal"]).toContain(output.learning_weight);
    expect(output.quality_reason_codes).toContain("significant_deviation_low_weight");
    expect(output.quality_reason_codes).toContain("single_poor_quality_session_limited");
  });

  it("blocks learned performance updates from invalid sessions", () => {
    const output = assessQualityOfExecution(baseInput({
      invalid_reason: "corrupted_session",
    }));

    expect(output.execution_quality).toBe("invalid");
    expect(output.learning_weight).toBe("none");
    expect(output.downstream_learning_permission).toBe("block_learning");
    expect(output.invalid_evidence_flags).toContain("corrupted_session");
    expect(output.quality_reason_codes).toContain("invalid_session_blocks_learning");
  });

  it("still propagates safety evidence when the session is otherwise invalid", () => {
    const output = assessQualityOfExecution(baseInput({
      invalid_reason: "corrupted_session",
      pain_flag: "pain",
      completed_sets: 0,
    }));

    expect(output.execution_quality).toBe("invalid");
    expect(output.downstream_learning_permission).toBe("safety_only");
    expect(output.evidence_for_9J.some((item) => item.safety_related && item.signal === "pain_reported")).toBe(true);
    expect(output.quality_reason_codes).toContain("safety_event_always_propagates");
  });

  it("marks missing core execution data invalid", () => {
    const output = assessQualityOfExecution(baseInput({
      prescribed_sets: 3,
      completed_sets: 0,
      sets: [],
    }));

    expect(output.execution_quality).toBe("invalid");
    expect(output.invalid_evidence_flags).toContain("missing_core_execution_data");
    expect(output.recommended_review).toBe("do_not_learn_from_performance");
  });

  it("requires validated user input before using effort notes as reliable evidence", () => {
    const output = assessQualityOfExecution(baseInput({
      recovery_effort_input: "grind",
      recovery_effort_input_validated: false,
    }));

    expect(output.invalid_evidence_flags).toContain("unvalidated_user_input");
    expect(output.quality_reason_codes).toContain("validated_user_input_only");
  });

  it("preserves explicitly labelled inference separately from observed facts", () => {
    const output = assessQualityOfExecution(baseInput({
      explicitly_labelled_inferences: ["possible_underload_from_repeated_top_range"],
    }));

    expect(output.explicitly_labelled_inferences).toEqual(["possible_underload_from_repeated_top_range"]);
    expect(output.quality_reason_codes).toContain("explicit_inference_label_required");
  });

  it("is future-sensor ready without requiring sensors now", () => {
    const output = assessQualityOfExecution(baseInput({
      future_evidence_sources_available: ["bar_velocity", "rom_estimation"],
    }));

    expect(output.future_evidence_sources_available).toEqual(["bar_velocity", "rom_estimation"]);
    expect(output.quality_reason_codes).toContain("future_sensor_ready");
  });

  it("never claims to evaluate lifting technique as fact", () => {
    const output = assessQualityOfExecution(baseInput({
      sets: [
        { prescribed_load: 100, completed_load: 100, prescribed_reps: 5, completed_reps: 5, completed: true },
      ],
    }));

    expect(output.quality_reason_codes).toContain("unobservable_technique_not_inferred");
    const source = readFileSync("src/domain/training/quality-of-execution-engine.ts", "utf8");
    expect(source).not.toMatch(/technique_quality|form_score|good_form|bad_form|depth_was_good|bar_path/i);
  });

  it("keeps architecture notes explicit", () => {
    expect(qualityOfExecutionArchitectureNotes.decision_id).toBe("10D");
    expect(qualityOfExecutionArchitectureNotes.gates_coaching_learning).toBe(true);
    expect(qualityOfExecutionArchitectureNotes.evaluates_execution_quality_not_lifting_technique).toBe(true);
    expect(qualityOfExecutionArchitectureNotes.future_sensor_sources_are_optional_extensions).toBe(true);
  });

  it("does not contain network, storage, mutation, or coaching-decision behavior", () => {
    const source = readFileSync("src/domain/training/quality-of-execution-engine.ts", "utf8");

    expect(source).not.toMatch(/\b(fetch|XMLHttpRequest|localStorage|AsyncStorage|setItem|getItem)\b/);
    expect(source).not.toMatch(/\b(mutateProgramme|replaceProgramme|transitionProgramme|writeWorkout|startWorkout)\s*\(/i);
    expect(source).not.toMatch(/\b(decideIntervention|selectMethod|selectExercise|generateWorkout|buildWorkout)\s*\(/i);
  });
});
