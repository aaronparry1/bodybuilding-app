import {
  processCoachingEvidence,
  type CoachingEvidenceEngineResult,
  type RawCoachingEvidence,
} from "@/domain/training/coaching-evidence-engine";
import type { WorkoutSession } from "@/domain/training/models";
import {
  normalizePostWorkoutReviewAnswers,
  type PostWorkoutReviewAnswers,
  type PostWorkoutReviewOutput,
} from "@/domain/training/post-workout-review-flow";
import {
  assessQualityOfExecution,
  type ExecutionSetEvidence,
  type QualityOfExecutionInput,
  type QualityOfExecutionOutput,
} from "@/domain/training/quality-of-execution-engine";
import { getWorkSets } from "@/domain/training/workout-sets";
import { trainingEvidenceFromCompletedSession, type TrainingEvidenceRecord } from "@/domain/training/training-evidence-record";

export interface FirstShippableCoachingLoopInput {
  session: WorkoutSession;
  previousSessions: WorkoutSession[];
  completedAt: string;
  reviewAnswers: PostWorkoutReviewAnswers;
}

export interface FirstShippableCoachingLoopResult {
  review: PostWorkoutReviewOutput;
  quality: QualityOfExecutionOutput;
  evidence: CoachingEvidenceEngineResult;
  rawEvidence: RawCoachingEvidence[];
  trainingEvidence: TrainingEvidenceRecord[];
  reason_codes: string[];
  direct_athlete_model_update_allowed: false;
  updated_only_through_coaching_evidence_engine: true;
}

export function buildDefaultPostWorkoutReviewAnswers(session: WorkoutSession): PostWorkoutReviewAnswers {
  const skippedSets = skippedSetCount(session);
  const skippedExercises = session.exercises.filter((exercise) => getWorkSets(exercise.sets).length === 0).length;
  const incomplete = skippedSets > 0 || skippedExercises > 0;
  const painLimited = session.exercises.some((exercise) => exercise.finishReason === "pain_limitation" || /pain/i.test(exercise.shutdownReason ?? ""));

  return {
    session_difficulty: "unknown",
    pain_feedback: {
      status: painLimited ? "pain" : "none",
      severity: painLimited ? "moderate" : undefined,
    },
    completion_reason: incomplete ? "modified" : "completed_as_planned",
    user_constraint_reason: painLimited ? "pain" : incomplete ? "unknown" : "none",
    substitution_feedback: session.exercises.some((exercise) => exercise.status === "swapped") ? "unknown" : "not_applicable",
    recovery_context: "none",
  };
}

export function runFirstShippablePostWorkoutLoop(input: FirstShippableCoachingLoopInput): FirstShippableCoachingLoopResult {
  const review = normalizePostWorkoutReviewAnswers(input.reviewAnswers);
  const quality = assessQualityOfExecution(buildQualityInputFromWorkoutSession(input.session, review));
  const rawEvidence = buildRawCoachingEvidenceFromLoop(input.session, input.completedAt, quality, review);
  const evidence = processCoachingEvidence({
    raw_evidence: rawEvidence,
    currentDate: input.completedAt,
  });
  const trainingEvidence = trainingEvidenceFromCompletedSession({
    sessionId: input.session.id,
    occurredAt: input.completedAt,
    completedSets: getWorkSets(input.session.exercises.flatMap((exercise) => exercise.sets)).length,
    pain: review.pain_feedback.status === "pain",
  });

  return {
    review,
    quality,
    evidence,
    rawEvidence,
    trainingEvidence,
    reason_codes: unique([
      "13a_first_shippable_coaching_loop",
      ...review.reason_codes,
      ...quality.quality_reason_codes,
      ...evidence.reason_codes,
    ]),
    direct_athlete_model_update_allowed: false,
    updated_only_through_coaching_evidence_engine: true,
  };
}

export function buildQualityInputFromWorkoutSession(
  session: WorkoutSession,
  review: PostWorkoutReviewOutput,
): QualityOfExecutionInput {
  const prescribedSets = session.exercises.reduce(
    (total, exercise) => total + Math.max(1, exercise.settings.requiredWorkSets),
    0,
  );
  const sets = session.exercises.flatMap((exercise): ExecutionSetEvidence[] => {
    const targetReps = exercise.settings.measurementType === "duration"
      ? exercise.settings.repRange.min
      : exercise.settings.repRange.max;
    return getWorkSets(exercise.sets).map((set) => ({
      prescribed_load: exercise.loadKnown === false ? null : exercise.load,
      completed_load: set.load,
      prescribed_reps: targetReps,
      completed_reps: set.reps,
      completed: true,
      failed: set.reps < exercise.settings.repRange.min,
    }));
  });
  const completedSets = sets.filter((set) => set.completed).length;

  return {
    sessionId: session.id,
    prescribed_sets: prescribedSets,
    completed_sets: completedSets,
    sets,
    skipped_sets: Math.max(0, prescribedSets - completedSets),
    skipped_exercises: session.exercises.filter((exercise) => getWorkSets(exercise.sets).length === 0).length,
    substitutions: session.exercises.filter((exercise) => exercise.status === "swapped").length,
    exercise_order_changes: 0,
    early_termination: review.completion_reason === "incomplete",
    pain_flag: painFlagFromReview(review),
    recovery_effort_input: effortFromReview(review),
    recovery_effort_input_validated: true,
    user_notes: review.user_notes,
  };
}

export function buildRawCoachingEvidenceFromLoop(
  session: WorkoutSession,
  completedAt: string,
  quality: QualityOfExecutionOutput,
  review: PostWorkoutReviewOutput,
): RawCoachingEvidence[] {
  const completedSets = session.exercises.reduce((total, exercise) => total + getWorkSets(exercise.sets).length, 0);
  const completedReps = session.exercises.reduce(
    (total, exercise) => total + getWorkSets(exercise.sets).reduce((setTotal, set) => setTotal + set.reps, 0),
    0,
  );
  const loadUsed = Math.max(0, ...session.exercises.flatMap((exercise) => getWorkSets(exercise.sets).map((set) => set.load)));
  const skippedSets = skippedSetCount(session);
  const painFlag = painFlagFromReview(review);
  const base = quality.evidence_for_9J
    .filter((item) => item.permitted_for_learning)
    .map((item): RawCoachingEvidence => ({
      sessionId: session.id,
      occurredAt: completedAt,
      signal: item.signal,
      completedSets,
      completedReps,
      loadUsed,
      skippedSets,
      skippedExercises: session.exercises.filter((exercise) => getWorkSets(exercise.sets).length === 0).length,
      substitutions: session.exercises.filter((exercise) => exercise.status === "swapped").length,
      earlyTermination: review.completion_reason === "incomplete",
      failedSets: session.exercises.flatMap((exercise) => getWorkSets(exercise.sets)).filter((set) => set.reps <= 0).length,
      painFlag,
      readiness: readinessFromReview(review),
      recoveryResponse: recoveryResponseFromReview(review),
      userNotes: review.user_notes,
      adherenceBehaviour: review.completion_reason === "completed_as_planned" ? "completed" : "partial",
    }));

  if (quality.downstream_learning_permission === "allow_full_learning" || quality.downstream_learning_permission === "allow_weighted_learning") {
    if (review.completion_reason === "completed_as_planned" && painFlag === "none") {
      base.push(
        {
          sessionId: session.id,
          occurredAt: completedAt,
          signal: "performance_improved",
          completedSets,
          completedReps,
          loadUsed,
          skippedSets,
          painFlag,
          adherenceBehaviour: "completed",
        },
        {
          sessionId: session.id,
          occurredAt: completedAt,
          signal: "performance_improved",
          completedSets,
          completedReps,
          loadUsed,
          skippedSets,
          painFlag,
          adherenceBehaviour: "completed",
        },
      );
    }
  }

  return base;
}

function skippedSetCount(session: WorkoutSession): number {
  return session.exercises.reduce(
    (total, exercise) => total + Math.max(0, exercise.settings.requiredWorkSets - getWorkSets(exercise.sets).length),
    0,
  );
}

function painFlagFromReview(review: PostWorkoutReviewOutput): QualityOfExecutionInput["pain_flag"] {
  if (review.pain_feedback.status === "pain") return "pain";
  if (review.pain_feedback.status === "discomfort") return "minor";
  return "none";
}

function effortFromReview(review: PostWorkoutReviewOutput): QualityOfExecutionInput["recovery_effort_input"] {
  if (review.session_difficulty === "easy") return "easy";
  if (review.session_difficulty === "moderate") return "normal";
  if (review.session_difficulty === "hard" || review.session_difficulty === "very_hard") return "hard";
  if (review.session_difficulty === "grind") return "grind";
  return "unknown";
}

function readinessFromReview(review: PostWorkoutReviewOutput): RawCoachingEvidence["readiness"] {
  if (review.recovery_context === "fatigue" || review.recovery_context === "illness") return "poor";
  if (review.session_difficulty === "grind") return "limited";
  if (review.session_difficulty === "easy" || review.session_difficulty === "moderate") return "normal";
  return "unknown";
}

function recoveryResponseFromReview(review: PostWorkoutReviewOutput): RawCoachingEvidence["recoveryResponse"] {
  if (review.recovery_context === "fatigue" || review.session_difficulty === "grind") return "negative";
  if (review.session_difficulty === "easy" || review.session_difficulty === "moderate") return "positive";
  return "unknown";
}

function unique<T>(items: T[]): T[] {
  return [...new Set(items)];
}

export const firstShippableCoachingLoopArchitectureNotes = {
  decision_id: "13A",
  usesCoachingPacketForWorkoutGeneration: true,
  qualityGateBeforeEvidence: true,
  athleteModelUpdatesOnlyThroughCoachingEvidenceEngine: true,
  liveCoachingNotExpanded: true,
  workoutExecutionRemainsLocalOffline: true,
} as const;
