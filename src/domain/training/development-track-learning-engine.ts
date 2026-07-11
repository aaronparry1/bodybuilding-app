import type { GoalTranslationOutput } from "@/domain/training/goal-translation-engine";
import type { ExperienceLevel } from "@/domain/training/models";

export type DevelopmentTrackCategory = "strength" | "hypertrophy" | "athletic" | "health";
export type DevelopmentTrackStatus = "active" | "watching" | "paused" | "completed";
export type DevelopmentLearningVariable =
  | "load_progression_rate"
  | "weekly_quality_volume"
  | "frequency"
  | "method"
  | "exercise_family"
  | "density"
  | "conditioning_dose"
  | "recovery_bias"
  | "technical_exposure";
export type DevelopmentTrackConfidence = "low" | "medium" | "high";
export type DevelopmentTrackReasonCode =
  | "development_tracks_created_by_goal_translation"
  | "development_tracks_are_not_exercise_specific"
  | "one_primary_learning_variable_per_track"
  | "global_learning_budget_respected"
  | "conflicting_experiment_blocked"
  | "safety_recovery_override_experiments"
  | "successful_experiments_become_coaching_knowledge"
  | "failed_experiments_become_coaching_knowledge"
  | "athlete_model_stores_truth_tracks_store_hypotheses"
  | "recommendations_flow_through_existing_engines"
  | "insufficient_budget_for_additional_experiment";

export type DevelopmentTrackExperience = "novice" | "intermediate" | "advanced" | "elite";

export interface DevelopmentTrackHypothesis {
  hypothesis_id: string;
  statement: string;
  learning_variable: DevelopmentLearningVariable;
  controlled_variables: string[];
  expected_signal: string;
  confidence: DevelopmentTrackConfidence;
}

export interface DevelopmentTrackEvidence {
  evidence_count: number;
  positive_signals: string[];
  negative_signals: string[];
  neutral_signals: string[];
  last_observed_at?: string;
}

export interface DevelopmentTrackObservationWindow {
  sessions: number;
  minimum_exposures: number;
}

export interface DevelopmentTrackCriteria {
  metric: string;
  threshold: string;
}

export interface DevelopmentTrackOptimisationHistoryItem {
  hypothesis_id: string;
  learning_variable: DevelopmentLearningVariable;
  outcome: "successful" | "failed" | "inconclusive";
  summary: string;
  completed_at: string;
}

export interface DevelopmentTrack {
  track_id: string;
  category: DevelopmentTrackCategory;
  objective: string;
  current_strategy: string;
  active_hypothesis: DevelopmentTrackHypothesis | null;
  learning_variable: DevelopmentLearningVariable | null;
  current_evidence: DevelopmentTrackEvidence;
  confidence: DevelopmentTrackConfidence;
  observation_window: DevelopmentTrackObservationWindow;
  success_criteria: DevelopmentTrackCriteria[];
  failure_criteria: DevelopmentTrackCriteria[];
  optimisation_history: DevelopmentTrackOptimisationHistoryItem[];
  status: DevelopmentTrackStatus;
  reason_codes: DevelopmentTrackReasonCode[];
}

export interface DevelopmentTrackLearningInput {
  goal_translation: Pick<GoalTranslationOutput, "primary_training_goal" | "secondary_training_goals" | "support_function_priorities" | "energy_system_priorities">;
  athlete_experience: ExperienceLevel | DevelopmentTrackExperience;
  existing_tracks?: DevelopmentTrack[];
  safety_or_recovery_limited?: boolean;
  current_date?: string;
}

export interface DevelopmentTrackLearningResult {
  development_tracks: DevelopmentTrack[];
  active_hypotheses: DevelopmentTrackHypothesis[];
  learning_budget_usage: {
    max_active_experiments: number;
    active_experiments: number;
    remaining_budget: number;
    experience: DevelopmentTrackExperience;
  };
  confidence: number;
  evidence_summary: string;
  recommended_next_experiments: DevelopmentTrackHypothesis[];
  reason_codes: DevelopmentTrackReasonCode[];
  mutates_programme: false;
  updates_athlete_truth: false;
}

interface TrackTemplate {
  track_id: string;
  category: DevelopmentTrackCategory;
  objective: string;
  current_strategy: string;
  learning_variable: DevelopmentLearningVariable;
  hypothesis: string;
  expected_signal: string;
}

export function deriveDevelopmentTrackLearningPlan(input: DevelopmentTrackLearningInput): DevelopmentTrackLearningResult {
  const experience = normalizeExperience(input.athlete_experience);
  const budget = learningBudgetFor(experience);
  const baseTracks = createBaseTracks(input);
  const existingById = new Map((input.existing_tracks ?? []).map((track) => [track.track_id, track]));
  const mergedTracks = baseTracks.map((template) => mergeTrack(template, existingById.get(template.track_id), input.current_date));
  const activeFromExisting = mergedTracks.filter((track) => track.active_hypothesis && track.status === "active");
  const reasons: DevelopmentTrackReasonCode[] = [
    "development_tracks_created_by_goal_translation",
    "development_tracks_are_not_exercise_specific",
    "one_primary_learning_variable_per_track",
    "athlete_model_stores_truth_tracks_store_hypotheses",
    "recommendations_flow_through_existing_engines",
  ];

  const finalTracks = input.safety_or_recovery_limited
    ? mergedTracks.map((track) => pauseTrack(track, "safety_recovery_override_experiments"))
    : applyLearningBudget(mergedTracks, budget, reasons);

  if (input.safety_or_recovery_limited) reasons.push("safety_recovery_override_experiments");

  const activeHypotheses = finalTracks
    .filter((track) => track.status === "active")
    .map((track) => track.active_hypothesis)
    .filter((hypothesis): hypothesis is DevelopmentTrackHypothesis => Boolean(hypothesis));
  const nextExperiments = finalTracks
    .filter((track) => track.status === "watching" && track.active_hypothesis)
    .map((track) => track.active_hypothesis!)
    .slice(0, Math.max(0, budget - activeHypotheses.length));

  return {
    development_tracks: finalTracks,
    active_hypotheses: activeHypotheses,
    learning_budget_usage: {
      max_active_experiments: budget,
      active_experiments: activeHypotheses.length,
      remaining_budget: Math.max(0, budget - activeHypotheses.length),
      experience,
    },
    confidence: confidenceFor(finalTracks, input.safety_or_recovery_limited),
    evidence_summary: evidenceSummaryFor(finalTracks),
    recommended_next_experiments: nextExperiments,
    reason_codes: uniqueReasons(reasons),
    mutates_programme: false,
    updates_athlete_truth: false,
  };
}

function createBaseTracks(input: DevelopmentTrackLearningInput): TrackTemplate[] {
  const primary = input.goal_translation.primary_training_goal;
  const support = input.goal_translation.support_function_priorities;
  const energy = input.goal_translation.energy_system_priorities;
  const templates: TrackTemplate[] = [];

  if (primary === "get_stronger" || primary === "build_muscle_strength" || support.includes("primary_strength")) {
    templates.push(
      strengthTrack("horizontal_press_strength", "Horizontal Press Strength", "load_progression_rate"),
      strengthTrack("squat_pattern_strength", "Squat Pattern Strength", "technical_exposure"),
      strengthTrack("hinge_strength", "Hinge Strength", "load_progression_rate"),
      strengthTrack("pulling_strength", "Pulling Strength", "weekly_quality_volume"),
    );
  }

  if (primary === "build_muscle" || primary === "build_muscle_strength" || support.includes("target_muscle_stimulus")) {
    templates.push(
      hypertrophyTrack("chest_development", "Chest Development", "weekly_quality_volume"),
      hypertrophyTrack("back_width", "Back Width", "frequency"),
      hypertrophyTrack("delts", "Delts", "weekly_quality_volume"),
      hypertrophyTrack("arms", "Arms", "method"),
      hypertrophyTrack("quads", "Quads", "weekly_quality_volume"),
      hypertrophyTrack("hamstrings", "Hamstrings", "exercise_family"),
    );
  }

  if (primary === "athletic_performance" || primary === "sport_training" || support.includes("power")) {
    templates.push(
      athleticTrack("lower_body_power", "Lower Body Power", "technical_exposure"),
      athleticTrack("acceleration", "Acceleration", "method"),
      athleticTrack("deceleration", "Deceleration", "technical_exposure"),
      athleticTrack("work_capacity", "Work Capacity", "density"),
    );
  }

  if (primary === "lose_fat" || primary === "general_fitness" || primary === "health_maintenance" || energy.includes("aerobic_base")) {
    templates.push(
      healthTrack("shoulder_health", "Shoulder Health", "recovery_bias"),
      healthTrack("core_stability", "Core Stability", "technical_exposure"),
      healthTrack("aerobic_capacity", "Aerobic Capacity", "conditioning_dose"),
    );
  }

  return uniqueTemplates(templates.length ? templates : [
    healthTrack("core_stability", "Core Stability", "technical_exposure"),
    healthTrack("aerobic_capacity", "Aerobic Capacity", "conditioning_dose"),
  ]);
}

function strengthTrack(trackId: string, objective: string, variable: DevelopmentLearningVariable): TrackTemplate {
  return {
    track_id: trackId,
    category: "strength",
    objective,
    current_strategy: "Keep movement-specific strength exposure stable while testing one progression lever.",
    learning_variable: variable,
    hypothesis: `${objective} will improve when ${humanVariable(variable)} is adjusted while exercise intent remains stable.`,
    expected_signal: "Improved load, reps, estimated strength, or cleaner completion in the same movement objective.",
  };
}

function hypertrophyTrack(trackId: string, objective: string, variable: DevelopmentLearningVariable): TrackTemplate {
  return {
    track_id: trackId,
    category: "hypertrophy",
    objective,
    current_strategy: "Keep target-muscle stimulus repeatable while testing one recoverable hypertrophy lever.",
    learning_variable: variable,
    hypothesis: `${objective} will improve when ${humanVariable(variable)} is adjusted without increasing junk volume.`,
    expected_signal: "More quality reps, better volume tolerance, or stable performance with recoverable added stimulus.",
  };
}

function athleticTrack(trackId: string, objective: string, variable: DevelopmentLearningVariable): TrackTemplate {
  return {
    track_id: trackId,
    category: "athletic",
    objective,
    current_strategy: "Keep transfer and movement quality stable while testing one performance-support lever.",
    learning_variable: variable,
    hypothesis: `${objective} will improve when ${humanVariable(variable)} is adjusted without turning power work into fatigue work.`,
    expected_signal: "Better high-quality outputs, completed explosive work, or improved capacity without strength collapse.",
  };
}

function healthTrack(trackId: string, objective: string, variable: DevelopmentLearningVariable): TrackTemplate {
  return {
    track_id: trackId,
    category: "health",
    objective,
    current_strategy: "Keep training continuity stable while testing one resilience or capacity lever.",
    learning_variable: variable,
    hypothesis: `${objective} will improve when ${humanVariable(variable)} is adjusted while pain and recovery stay controlled.`,
    expected_signal: "More pain-free continuity, better completion quality, or improved capacity without recovery cost.",
  };
}

function mergeTrack(template: TrackTemplate, existing: DevelopmentTrack | undefined, currentDate: string | undefined): DevelopmentTrack {
  if (existing) {
    const activeHypothesis = existing.active_hypothesis
      ? {
        ...existing.active_hypothesis,
        learning_variable: existing.learning_variable ?? existing.active_hypothesis.learning_variable,
      }
      : createHypothesis(template);
    return {
      ...existing,
      objective: template.objective,
      category: template.category,
      current_strategy: existing.current_strategy || template.current_strategy,
      active_hypothesis: activeHypothesis,
      learning_variable: activeHypothesis.learning_variable,
      reason_codes: uniqueReasons([...existing.reason_codes, "development_tracks_are_not_exercise_specific", "one_primary_learning_variable_per_track"]),
    };
  }

  return {
    track_id: template.track_id,
    category: template.category,
    objective: template.objective,
    current_strategy: template.current_strategy,
    active_hypothesis: createHypothesis(template),
    learning_variable: template.learning_variable,
    current_evidence: {
      evidence_count: 0,
      positive_signals: [],
      negative_signals: [],
      neutral_signals: [],
      last_observed_at: currentDate,
    },
    confidence: "low",
    observation_window: {
      sessions: 4,
      minimum_exposures: 2,
    },
    success_criteria: [
      { metric: "objective_training_signal", threshold: "Improves or remains productive inside the observation window." },
      { metric: "recovery_cost", threshold: "Does not create pain, repeated misses, or unacceptable fatigue." },
    ],
    failure_criteria: [
      { metric: "performance_signal", threshold: "Repeated decline or no useful signal after minimum exposures." },
      { metric: "safety_signal", threshold: "Pain or recovery warning overrides the experiment." },
    ],
    optimisation_history: [],
    status: "active",
    reason_codes: ["development_tracks_created_by_goal_translation", "development_tracks_are_not_exercise_specific", "one_primary_learning_variable_per_track"],
  };
}

function createHypothesis(template: TrackTemplate): DevelopmentTrackHypothesis {
  return {
    hypothesis_id: `${template.track_id}:${template.learning_variable}`,
    statement: template.hypothesis,
    learning_variable: template.learning_variable,
    controlled_variables: [
      "session_objective",
      "support_function",
      "exercise_intent",
      "method_family_unless_selected_variable",
      "recovery_constraints",
    ],
    expected_signal: template.expected_signal,
    confidence: "low",
  };
}

function applyLearningBudget(tracks: DevelopmentTrack[], budget: number, reasons: DevelopmentTrackReasonCode[]): DevelopmentTrack[] {
  let activeCount = 0;
  return tracks.map((track) => {
    if (!track.active_hypothesis) return track;
    const conflicts = activeCount > 0 && tracks.slice(0, activeCount).some((prior) => prior.track_id === track.track_id);
    if (conflicts) {
      reasons.push("conflicting_experiment_blocked");
      return pauseTrack(track, "conflicting_experiment_blocked");
    }
    if (activeCount >= budget) {
      reasons.push("global_learning_budget_respected", "insufficient_budget_for_additional_experiment");
      return {
        ...track,
        status: "watching",
        reason_codes: uniqueReasons([...track.reason_codes, "global_learning_budget_respected"]),
      };
    }
    activeCount += 1;
    return {
      ...track,
      status: "active",
      reason_codes: uniqueReasons([...track.reason_codes, "global_learning_budget_respected"]),
    };
  });
}

function pauseTrack(track: DevelopmentTrack, reason: DevelopmentTrackReasonCode): DevelopmentTrack {
  return {
    ...track,
    status: "paused",
    reason_codes: uniqueReasons([...track.reason_codes, reason]),
  };
}

function normalizeExperience(experience: ExperienceLevel | DevelopmentTrackExperience): DevelopmentTrackExperience {
  if (experience === "beginner") return "novice";
  return experience;
}

function learningBudgetFor(experience: DevelopmentTrackExperience): number {
  if (experience === "novice") return 2;
  if (experience === "intermediate") return 3;
  if (experience === "advanced") return 2;
  return 1;
}

function confidenceFor(tracks: DevelopmentTrack[], safetyLimited: boolean | undefined): number {
  if (safetyLimited) return 58;
  const evidenceCount = tracks.reduce((sum, track) => sum + track.current_evidence.evidence_count, 0);
  return Math.min(84, 62 + evidenceCount * 2);
}

function evidenceSummaryFor(tracks: DevelopmentTrack[]): string {
  const active = tracks.filter((track) => track.status === "active").length;
  const watching = tracks.filter((track) => track.status === "watching").length;
  const evidence = tracks.reduce((sum, track) => sum + track.current_evidence.evidence_count, 0);
  return `${active} active experiment(s), ${watching} queued/watch track(s), ${evidence} evidence point(s).`;
}

function humanVariable(variable: DevelopmentLearningVariable): string {
  return variable.replace(/_/g, " ");
}

function uniqueTemplates(templates: TrackTemplate[]): TrackTemplate[] {
  const seen = new Set<string>();
  return templates.filter((template) => {
    if (seen.has(template.track_id)) return false;
    seen.add(template.track_id);
    return true;
  });
}

function uniqueReasons(reasons: DevelopmentTrackReasonCode[]): DevelopmentTrackReasonCode[] {
  return [...new Set(reasons)];
}

export const developmentTrackLearningArchitectureNotes = {
  decisionId: "12C",
  name: "Development Track Learning Engine",
  tracksCreatedByGoalTranslation: true,
  exerciseSpecific: false,
  onePrimaryVariablePerTrack: true,
  mutatesProgramme: false,
  updatesAthleteTruth: false,
  downstreamEnginesApplyRecommendations: true,
} as const;
