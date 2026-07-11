import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  createPostWorkoutReviewPlan,
  normalizePostWorkoutReviewAnswers,
  postWorkoutReviewFlowArchitectureNotes,
  type PostWorkoutSessionSummaryInput,
} from "../src/domain/training/post-workout-review-flow";

function cleanSummary(overrides: Partial<PostWorkoutSessionSummaryInput> = {}): PostWorkoutSessionSummaryInput {
  return {
    completed_work: "3 exercises, 9 work sets",
    missed_work: "",
    live_adjustments: [],
    notable_performances: ["Bench matched last best set"],
    safety_pain_events: [],
    session_duration_minutes: 54,
    planned_exercises: 3,
    completed_exercises: 3,
    skipped_sets: 0,
    substitutions: 0,
    early_termination: false,
    session_compression: false,
    unusually_poor_performance: false,
    skipped_conditioning_or_accessories: false,
    ...overrides,
  };
}

describe("Post-Workout Review Flow", () => {
  it("keeps clean completed workouts low-friction", () => {
    const plan = createPostWorkoutReviewPlan(cleanSummary());

    expect(plan.required_questions.map((question) => question.id)).toEqual([
      "session_difficulty",
      "pain_or_discomfort",
      "completion_blocker",
    ]);
    expect(plan.conditional_questions).toEqual([]);
    expect(plan.reason_codes).toContain("clean_workout_low_friction");
    expect(plan.reason_codes).toContain("minimum_useful_feedback_only");
    expect(plan.feeds_quality_of_execution_first).toBe(true);
  });

  it("adds pain follow-up questions when pain occurred", () => {
    const plan = createPostWorkoutReviewPlan(cleanSummary({
      safety_pain_events: ["Shoulder pain during incline press"],
    }));

    expect(plan.conditional_questions.map((question) => question.id)).toEqual(expect.arrayContaining([
      "pain_location",
      "pain_severity",
      "pain_movement_affected",
    ]));
    expect(plan.reason_codes).toContain("pain_follow_up_required");
  });

  it("adds incomplete-workout follow-up when work was missed", () => {
    const plan = createPostWorkoutReviewPlan(cleanSummary({
      missed_work: "Skipped 2 accessory sets",
      skipped_sets: 2,
      completed_exercises: 2,
    }));

    expect(plan.conditional_questions.map((question) => question.id)).toContain("incomplete_reason");
    expect(plan.reason_codes).toContain("incomplete_workout_follow_up_required");
  });

  it("asks substitution feedback only when substitutions happened", () => {
    const withSub = createPostWorkoutReviewPlan(cleanSummary({ substitutions: 1 }));
    const withoutSub = createPostWorkoutReviewPlan(cleanSummary());

    expect(withSub.conditional_questions.map((question) => question.id)).toContain("substitution_acceptable");
    expect(withSub.reason_codes).toContain("substitution_feedback_required");
    expect(withoutSub.conditional_questions.map((question) => question.id)).not.toContain("substitution_acceptable");
  });

  it("asks recovery context only when performance was unusually poor", () => {
    const plan = createPostWorkoutReviewPlan(cleanSummary({
      unusually_poor_performance: true,
    }));

    expect(plan.conditional_questions.map((question) => question.id)).toContain("poor_performance_context");
    expect(plan.reason_codes).toContain("poor_performance_context_required");
  });

  it("asks skipped optional work reason only when relevant", () => {
    const plan = createPostWorkoutReviewPlan(cleanSummary({
      skipped_conditioning_or_accessories: true,
    }));

    expect(plan.conditional_questions.map((question) => question.id)).toContain("skipped_conditioning_or_accessories_reason");
    expect(plan.reason_codes).toContain("skipped_optional_work_context_required");
  });

  it("normalizes answers into evidence for 10D and 9J without direct model updates", () => {
    const output = normalizePostWorkoutReviewAnswers({
      session_difficulty: "hard",
      pain_feedback: {
        status: "pain",
        location: "left shoulder",
        severity: "moderate",
        movement_affected: "pressing",
      },
      completion_reason: "modified",
      user_constraint_reason: "pain",
      substitution_feedback: "acceptable",
      recovery_context: "fatigue",
      user_notes: "Shoulder felt off after warm-up.",
    });

    expect(output.evidence_flags_for_10D).toContain("validated_user_input_only");
    expect(output.evidence_flags_for_10D).toContain("minor_deviation_reduced_confidence");
    expect(output.evidence_flags_for_9J).toEqual(expect.arrayContaining([
      "pain_reported",
      "exercise_substituted",
      "recovery_failed",
    ]));
    expect(output.must_pass_quality_of_execution_first).toBe(true);
    expect(output.direct_athlete_model_update_allowed).toBe(false);
    expect(output.feedback_is_evidence_not_truth).toBe(true);
  });

  it("treats user feedback as evidence rather than absolute truth", () => {
    const output = normalizePostWorkoutReviewAnswers({
      session_difficulty: "easy",
      pain_feedback: { status: "none" },
      completion_reason: "completed_as_planned",
      user_constraint_reason: "none",
      substitution_feedback: "not_applicable",
      recovery_context: "none",
    });

    expect(output.reason_codes).toContain("feedback_is_evidence_not_truth");
    expect(output.evidence_flags_for_10D).toEqual(["validated_user_input_only"]);
    expect(output.evidence_flags_for_9J).toEqual([]);
  });

  it("keeps architecture notes explicit", () => {
    expect(postWorkoutReviewFlowArchitectureNotes.decision_id).toBe("10F");
    expect(postWorkoutReviewFlowArchitectureNotes.adaptive_review_flow).toBe(true);
    expect(postWorkoutReviewFlowArchitectureNotes.feeds_quality_of_execution_first).toBe(true);
    expect(postWorkoutReviewFlowArchitectureNotes.learning_routes_to_9j).toBe(true);
    expect(postWorkoutReviewFlowArchitectureNotes.direct_athlete_model_update_allowed).toBe(false);
  });

  it("does not contain direct model mutation, network, storage, or fixed-questionnaire behavior", () => {
    const source = readFileSync("src/domain/training/post-workout-review-flow.ts", "utf8");

    expect(source).not.toMatch(/\b(applyValidatedEvidenceToLearnedCharacteristic|addValidatedCoachingMemory|createLivingAthleteModel)\s*\(/);
    expect(source).not.toMatch(/\b(fetch|XMLHttpRequest|localStorage|AsyncStorage|setItem|getItem)\b/);
    expect(source).not.toMatch(/\b(mutateProgramme|replaceProgramme|transitionProgramme|writeWorkout|startWorkout)\s*\(/i);
    expect(source).not.toMatch(/fixed questionnaire/i);
  });
});
