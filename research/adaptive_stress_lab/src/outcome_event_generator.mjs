import { runSimulationV0_2 } from "./simulation_v0_2.mjs";
import { runSimulationV0_3 } from "./simulation_v0_3.mjs";
import {
  buildDetailedEvidence,
  hasRecentMissedMinimumRange,
  hasRecentShutdownOrPain,
  sameExerciseSuccessfulExposureCount,
} from "./evidence_detail.mjs";

export const OUTCOME_WINDOWS = ["immediate_session", "next_session", "two_week", "four_week", "eight_week"];
export const OUTCOME_CLASSIFICATIONS = new Set(["positive", "neutral", "negative", "unsafe", "inconclusive"]);

export function generateSyntheticOutcomeEvents({ simulations = [runSimulationV0_2(), runSimulationV0_3()] } = {}) {
  return simulations.flatMap((simulation, simulationIndex) =>
    simulation.athletes.flatMap((athleteResult) =>
      athleteResult.weeks.flatMap((week, weekIndex, weeks) =>
        OUTCOME_WINDOWS.map((window) => buildOutcomeEvent({ simulationIndex, athleteResult, week, weekIndex, weeks, window }))
      )
    )
  );
}

function buildOutcomeEvent({ simulationIndex, athleteResult, week, weekIndex, weeks, window }) {
  const followUp = followUpForWindow({ weekIndex, weeks, window });
  const classification = classifyOutcome({ week, followUp, window });
  const confidence = confidenceForOutcome({ week, followUp, window, classification });
  const exercise = week.evidence.exerciseHistory?.[0] ?? null;
  const detail = buildDetailedEvidence(week.evidence);
  return {
    id: `sim${simulationIndex}_${athleteResult.athlete.id}_week${week.week}_${window}`,
    athlete_profile_id: athleteResult.athlete.id,
    coaching_state_summary: {
      adaptation: week.coachingState.adaptation,
      recovery_capacity: week.coachingState.recovery_capacity,
      momentum: week.coachingState.momentum,
      confidence: week.coachingState.confidence,
      evidence_quality: week.coachingState.evidence_quality,
      coaching_opportunity: week.coachingState.coaching_opportunity,
    },
    safety_gate_status: week.safetyGate.status,
    recommendation_type: week.v2Recommendation.recommendation_type,
    push_type: week.v2Recommendation.push_category ?? null,
    intervention_type: interventionTypeFor(week.v2Recommendation),
    goal: athleteResult.athlete.goal,
    exercise: exercise?.exerciseName ?? null,
    movement_pattern: exercise?.movementPattern ?? null,
    week: week.week,
    timestamp: timestampForWeek(week.week),
    follow_up_window: window,
    follow_up_evidence: {
      current_progress_score: week.goalProgress.progress_score,
      current_v2_progress_score: week.v2.progress_score,
      current_momentum: week.v2.momentum,
      current_recovery: week.v2.recovery,
      follow_up_available: Boolean(followUp),
      follow_up_week: followUp?.week ?? null,
      follow_up_progress_score: followUp?.v2.progress_score ?? null,
      follow_up_goal_progress_score: followUp?.goalProgress.progress_score ?? null,
      follow_up_momentum: followUp?.v2.momentum ?? null,
      follow_up_recovery: followUp?.v2.recovery ?? null,
      unsafe_push: week.safetyGate.status !== "clear" && week.v2Recommendation.recommendation_type === "push",
      expected_recommendation: week.expected?.recommendation_type ?? null,
      expected_push_category: week.expected?.push_category ?? null,
      same_exercise_exposure_count: sameExerciseSuccessfulExposureCount(week.evidence),
      load_ownership_state: week.evidence.loadOwnership?.state ?? "unknown",
      recent_shutdown_or_pain: hasRecentShutdownOrPain(week.evidence),
      recent_missed_range: hasRecentMissedMinimumRange(week.evidence),
      evidence_quality_score: week.coachingState.evidence_quality,
      recovery_capacity: week.coachingState.recovery_capacity,
      momentum: week.coachingState.momentum,
      adaptation: week.coachingState.adaptation,
      safety_issue_scope: detail.safetyContext.safetyIssueScope,
      pain_severity: detail.safetyContext.painSeverity,
    },
    outcome_classification: classification,
    confidence,
    source: "synthetic_simulation",
    notes: ["Lab-only synthetic outcome event. Advisory only; never mutates rules automatically."],
  };
}

function followUpForWindow({ weekIndex, weeks, window }) {
  const offsets = {
    immediate_session: 0,
    next_session: 1,
    two_week: 2,
    four_week: 4,
    eight_week: 8,
  };
  return weeks[weekIndex + offsets[window]] ?? null;
}

function classifyOutcome({ week, followUp, window }) {
  if (week.safetyGate.status !== "clear" && week.v2Recommendation.recommendation_type === "push") return "unsafe";
  if (!followUp && window !== "immediate_session") return "inconclusive";

  if (window === "immediate_session") {
    if (week.comparison?.v2UnsafePain) return "unsafe";
    if (week.v2.progress_score >= week.goalProgress.progress_score + 4) return "positive";
    if (week.v2.progress_score <= week.goalProgress.progress_score - 6) return "negative";
    return "neutral";
  }

  const progressDelta = followUp.v2.progress_score - week.v2.progress_score;
  const recoveryDelta = followUp.v2.recovery - week.v2.recovery;
  const momentumDelta = followUp.v2.momentum - week.v2.momentum;
  const safetyWorsened = followUp.safetyGate.status === "stop" && week.safetyGate.status === "clear";

  if (safetyWorsened) return "unsafe";
  if (week.v2Recommendation.recommendation_type === "push" && (recoveryDelta <= -12 || progressDelta <= -10)) return "negative";
  if (week.v2Recommendation.recommendation_type === "recover" && recoveryDelta >= 8 && progressDelta >= -2) return "positive";
  if (["reduce", "substitute", "stop_movement"].includes(week.v2Recommendation.recommendation_type) && recoveryDelta >= 2) return "positive";
  if (progressDelta + recoveryDelta + momentumDelta >= 6) return "positive";
  if (progressDelta + recoveryDelta + momentumDelta <= -8) return "negative";
  return "neutral";
}

function confidenceForOutcome({ week, followUp, window, classification }) {
  let confidence = 35;
  confidence += Math.round(week.coachingState.evidence_quality * 0.25);
  if (followUp) confidence += 20;
  if (window === "four_week") confidence += 10;
  if (window === "eight_week") confidence += 8;
  if (classification === "inconclusive") confidence = Math.min(confidence, 45);
  if (classification === "unsafe") confidence += 12;
  return Math.max(0, Math.min(100, Math.round(confidence)));
}

function interventionTypeFor(recommendation) {
  if (recommendation.recommendation_type === "push") return recommendation.push_category ?? "push";
  return recommendation.recommendation_type;
}

function timestampForWeek(week) {
  const date = new Date("2026-01-05T00:00:00.000Z");
  date.setUTCDate(date.getUTCDate() + (week - 1) * 7);
  return date.toISOString();
}
