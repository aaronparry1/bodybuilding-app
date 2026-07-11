import type { LiveWorkoutEvidenceFlag } from "./live-workout-coaching-engine";
import type { ExecutionQualityReasonCode } from "./quality-of-execution-engine";
import type { RawEvidenceSignal } from "./coaching-evidence-engine";

export type PostWorkoutQuestionId =
  | "session_difficulty"
  | "pain_or_discomfort"
  | "completion_blocker"
  | "pain_location"
  | "pain_severity"
  | "pain_movement_affected"
  | "incomplete_reason"
  | "substitution_acceptable"
  | "poor_performance_context"
  | "skipped_conditioning_or_accessories_reason"
  | "optional_notes";

export type PostWorkoutReviewReasonCode =
  | "post_workout_review_flow"
  | "minimum_useful_feedback_only"
  | "adaptive_not_fixed_questionnaire"
  | "clean_workout_low_friction"
  | "pain_follow_up_required"
  | "incomplete_workout_follow_up_required"
  | "substitution_feedback_required"
  | "poor_performance_context_required"
  | "skipped_optional_work_context_required"
  | "feedback_is_evidence_not_truth"
  | "review_feeds_10d_first"
  | "learning_routes_to_9j"
  | "no_direct_athlete_model_update";

export type SessionDifficultyFeedback = "easy" | "moderate" | "hard" | "very_hard" | "grind" | "unknown";
export type PainFeedbackStatus = "none" | "discomfort" | "pain";
export type CompletionReason = "completed_as_planned" | "modified" | "incomplete";
export type UserConstraintReason = "none" | "time" | "fatigue" | "equipment" | "pain" | "motivation" | "other" | "unknown";
export type SubstitutionFeedback = "not_applicable" | "acceptable" | "not_acceptable" | "unknown";
export type RecoveryContextFeedback = "none" | "sleep" | "stress" | "fatigue" | "illness" | "other" | "unknown";

export interface PostWorkoutSessionSummaryInput {
  completed_work: string;
  missed_work: string;
  live_adjustments: string[];
  notable_performances: string[];
  safety_pain_events: string[];
  session_duration_minutes: number;
  planned_exercises: number;
  completed_exercises: number;
  skipped_sets: number;
  substitutions: number;
  early_termination: boolean;
  session_compression: boolean;
  unusually_poor_performance: boolean;
  skipped_conditioning_or_accessories: boolean;
}

export interface PostWorkoutReviewQuestion {
  id: PostWorkoutQuestionId;
  prompt: string;
  required: boolean;
  conditional: boolean;
  options?: string[];
}

export interface PostWorkoutReviewPlan {
  session_summary: {
    completed_work: string;
    missed_work: string;
    live_adjustments: string[];
    notable_performances: string[];
    safety_pain_events: string[];
    session_duration_minutes: number;
  };
  required_questions: PostWorkoutReviewQuestion[];
  conditional_questions: PostWorkoutReviewQuestion[];
  optional_notes_question: PostWorkoutReviewQuestion;
  reason_codes: PostWorkoutReviewReasonCode[];
  feeds_quality_of_execution_first: true;
  direct_athlete_model_update_allowed: false;
}

export interface PostWorkoutReviewAnswers {
  session_difficulty: SessionDifficultyFeedback;
  pain_feedback: {
    status: PainFeedbackStatus;
    location?: string;
    severity?: "low" | "moderate" | "high" | "critical";
    movement_affected?: string;
  };
  completion_reason: CompletionReason;
  user_constraint_reason: UserConstraintReason;
  substitution_feedback: SubstitutionFeedback;
  recovery_context: RecoveryContextFeedback;
  user_notes?: string;
}

export interface PostWorkoutReviewOutput {
  session_difficulty: SessionDifficultyFeedback;
  pain_feedback: PostWorkoutReviewAnswers["pain_feedback"];
  completion_reason: CompletionReason;
  user_constraint_reason: UserConstraintReason;
  substitution_feedback: SubstitutionFeedback;
  recovery_context: RecoveryContextFeedback;
  user_notes?: string;
  evidence_flags_for_10D: ExecutionQualityReasonCode[];
  evidence_flags_for_9J: RawEvidenceSignal[];
  feedback_is_evidence_not_truth: true;
  must_pass_quality_of_execution_first: true;
  direct_athlete_model_update_allowed: false;
  reason_codes: PostWorkoutReviewReasonCode[];
}

export function createPostWorkoutReviewPlan(input: PostWorkoutSessionSummaryInput): PostWorkoutReviewPlan {
  const reasonCodes: PostWorkoutReviewReasonCode[] = [
    "post_workout_review_flow",
    "minimum_useful_feedback_only",
    "adaptive_not_fixed_questionnaire",
    "feedback_is_evidence_not_truth",
    "review_feeds_10d_first",
    "learning_routes_to_9j",
    "no_direct_athlete_model_update",
  ];
  const conditionalQuestions: PostWorkoutReviewQuestion[] = [];

  if (input.safety_pain_events.length > 0) {
    reasonCodes.push("pain_follow_up_required");
    conditionalQuestions.push(
      question("pain_location", "Where did you feel it?", true, true),
      question("pain_severity", "How severe was it?", true, true, ["low", "moderate", "high", "critical"]),
      question("pain_movement_affected", "Which movement was affected?", true, true),
    );
  }

  if (workoutWasIncomplete(input)) {
    reasonCodes.push("incomplete_workout_follow_up_required");
    conditionalQuestions.push(question("incomplete_reason", "What stopped you completing the plan?", true, true, ["time", "fatigue", "equipment", "pain", "motivation", "other"]));
  }

  if (input.substitutions > 0) {
    reasonCodes.push("substitution_feedback_required");
    conditionalQuestions.push(question("substitution_acceptable", "Was the replacement acceptable?", true, true, ["yes", "no"]));
  }

  if (input.unusually_poor_performance) {
    reasonCodes.push("poor_performance_context_required");
    conditionalQuestions.push(question("poor_performance_context", "Was sleep, stress, or recovery a factor?", true, true, ["sleep", "stress", "fatigue", "illness", "other", "no"]));
  }

  if (input.skipped_conditioning_or_accessories) {
    reasonCodes.push("skipped_optional_work_context_required");
    conditionalQuestions.push(question("skipped_conditioning_or_accessories_reason", "Why did you skip the extra work?", true, true, ["time", "fatigue", "equipment", "pain", "motivation", "other"]));
  }

  if (conditionalQuestions.length === 0) {
    reasonCodes.push("clean_workout_low_friction");
  }

  return {
    session_summary: {
      completed_work: input.completed_work,
      missed_work: input.missed_work,
      live_adjustments: input.live_adjustments,
      notable_performances: input.notable_performances,
      safety_pain_events: input.safety_pain_events,
      session_duration_minutes: input.session_duration_minutes,
    },
    required_questions: [
      question("session_difficulty", "How hard did the session feel?", true, false, ["easy", "moderate", "hard", "very hard", "grind"]),
      question("pain_or_discomfort", "Any pain or discomfort?", true, false, ["no", "discomfort", "pain"]),
      question("completion_blocker", "Did anything stop you completing the plan?", true, false, ["no", "time", "fatigue", "equipment", "pain", "motivation", "other"]),
    ],
    conditional_questions: conditionalQuestions,
    optional_notes_question: question("optional_notes", "Anything else ASC should know?", false, false),
    reason_codes: Array.from(new Set(reasonCodes)),
    feeds_quality_of_execution_first: true,
    direct_athlete_model_update_allowed: false,
  };
}

export function normalizePostWorkoutReviewAnswers(answers: PostWorkoutReviewAnswers): PostWorkoutReviewOutput {
  const reasonCodes: PostWorkoutReviewReasonCode[] = [
    "post_workout_review_flow",
    "feedback_is_evidence_not_truth",
    "review_feeds_10d_first",
    "learning_routes_to_9j",
    "no_direct_athlete_model_update",
  ];
  const evidence10D: ExecutionQualityReasonCode[] = ["validated_user_input_only"];
  const evidence9J: RawEvidenceSignal[] = [];

  if (answers.pain_feedback.status !== "none") {
    reasonCodes.push("pain_follow_up_required");
    evidence9J.push("pain_reported");
  }
  if (answers.completion_reason !== "completed_as_planned" || answers.user_constraint_reason !== "none") {
    reasonCodes.push("incomplete_workout_follow_up_required");
    evidence10D.push("minor_deviation_reduced_confidence");
  }
  if (answers.substitution_feedback !== "not_applicable") {
    reasonCodes.push("substitution_feedback_required");
    evidence9J.push("exercise_substituted");
  }
  if (answers.recovery_context !== "none") {
    reasonCodes.push("poor_performance_context_required");
    evidence9J.push(answers.recovery_context === "fatigue" ? "recovery_failed" : "preference_note");
  }

  return {
    session_difficulty: answers.session_difficulty,
    pain_feedback: answers.pain_feedback,
    completion_reason: answers.completion_reason,
    user_constraint_reason: answers.user_constraint_reason,
    substitution_feedback: answers.substitution_feedback,
    recovery_context: answers.recovery_context,
    user_notes: answers.user_notes,
    evidence_flags_for_10D: Array.from(new Set(evidence10D)),
    evidence_flags_for_9J: Array.from(new Set(evidence9J)),
    feedback_is_evidence_not_truth: true,
    must_pass_quality_of_execution_first: true,
    direct_athlete_model_update_allowed: false,
    reason_codes: Array.from(new Set(reasonCodes)),
  };
}

function workoutWasIncomplete(input: PostWorkoutSessionSummaryInput): boolean {
  return input.early_termination ||
    input.skipped_sets > 0 ||
    input.completed_exercises < input.planned_exercises ||
    input.missed_work.trim().length > 0;
}

function question(
  id: PostWorkoutQuestionId,
  prompt: string,
  required: boolean,
  conditional: boolean,
  options?: string[],
): PostWorkoutReviewQuestion {
  return {
    id,
    prompt,
    required,
    conditional,
    options,
  };
}

export const postWorkoutReviewFlowArchitectureNotes = {
  decision_id: "10F",
  adaptive_review_flow: true,
  minimum_useful_feedback_only: true,
  feeds_quality_of_execution_first: true,
  learning_routes_to_9j: true,
  direct_athlete_model_update_allowed: false,
} as const;
