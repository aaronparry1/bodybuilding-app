import type { AdaptiveProgrammingGoal, AdaptiveTrainingPhase } from "@/domain/training/adaptive-rep-prescription";
import type { ProgrammeFrameworkId, ProgrammeFrameworkSessionType } from "@/domain/training/programme-framework-rules";
import type { StimulusDesiredAdaptation, StimulusSpecificity } from "@/domain/training/adaptive-stimulus-planner";

export interface SessionResponsibilityInput {
  goal: AdaptiveProgrammingGoal;
  framework: ProgrammeFrameworkId;
  sessionType: ProgrammeFrameworkSessionType;
  trainingPhase: AdaptiveTrainingPhase;
}

export interface Responsibility {
  id: string;
  targetRegion: string;
  movementPattern: string;
  desiredAdaptation: StimulusDesiredAdaptation;
  specificityRequirement: StimulusSpecificity;
  rationale: string;
}

export interface SessionResponsibilityPlan {
  sessionType: ProgrammeFrameworkSessionType;
  requiredResponsibilities: Responsibility[];
  importantResponsibilities: Responsibility[];
  optionalResponsibilities: Responsibility[];
  excludedResponsibilities: Responsibility[];
  rationale: string[];
  confidence: number;
}

export function deriveSessionResponsibility(input: SessionResponsibilityInput): SessionResponsibilityPlan {
  const responsibilities = responsibilitiesFor(input.sessionType);

  return {
    sessionType: input.sessionType,
    requiredResponsibilities: responsibilities.required,
    importantResponsibilities: responsibilities.important,
    optionalResponsibilities: responsibilities.optional,
    excludedResponsibilities: responsibilities.excluded,
    rationale: [
      `${input.sessionType} defines what the session must deliver before exercise selection.`,
      `goal ${input.goal}`,
      `framework ${input.framework}`,
      `phase ${input.trainingPhase}`,
    ],
    confidence: confidenceFor(input.sessionType),
  };
}

function responsibilitiesFor(sessionType: ProgrammeFrameworkSessionType): {
  required: Responsibility[];
  important: Responsibility[];
  optional: Responsibility[];
  excluded: Responsibility[];
} {
  switch (sessionType) {
    case "push":
    case "chest":
    case "shoulders":
    case "arms":
    case "chest_back":
    case "shoulders_arms":
      return {
        required: [
          responsibility("primary_press", "chest_shoulders_triceps", "horizontal_or_vertical_press", "hypertrophy", "movement_specific", "Push sessions must include a real pressing responsibility."),
          responsibility("chest_pressing_stimulus", "chest", "horizontal_press", "hypertrophy", "muscle_specific", "Chest pressing stimulus is central to push work."),
          responsibility("triceps_pressing_support", "triceps", "elbow_extension", "hypertrophy", "muscle_specific", "Triceps support protects the pressing role."),
        ],
        important: [
          responsibility("secondary_press", "upper_chest_or_shoulders", "secondary_press", "hypertrophy", "movement_specific", "A second press can add useful stimulus when recoverable."),
          responsibility("shoulder_pressing_or_delt_stimulus", "delts", "shoulder_press_or_abduction", "hypertrophy", "muscle_specific", "Delt stimulus supports push balance."),
        ],
        optional: [
          responsibility("lateral_delt", "lateral_delts", "shoulder_abduction", "hypertrophy", "muscle_specific", "Optional local delt work."),
          responsibility("extra_chest", "chest", "chest_accessory", "hypertrophy", "muscle_specific", "Optional extra chest stimulus."),
          responsibility("serratus_or_core", "serratus_or_trunk", "scapular_control_or_bracing", "maintenance", "general", "Optional support work if it does not distract from pressing."),
        ],
        excluded: [
          responsibility("primary_leg_stimulus", "lower_body", "squat_or_hinge", "hypertrophy", "movement_specific", "Primary leg work belongs elsewhere."),
          responsibility("primary_back_stimulus", "back", "row_or_pull", "hypertrophy", "movement_specific", "Primary back work belongs elsewhere."),
        ],
      };
    case "pull":
    case "back":
      return {
        required: [
          responsibility("primary_pull_or_row", "back", "vertical_pull_or_horizontal_row", "hypertrophy", "movement_specific", "Pull sessions must include a real pulling or rowing responsibility."),
          responsibility("back_stimulus", "back", "row_or_pull", "hypertrophy", "muscle_specific", "Back stimulus is central to pull work."),
          responsibility("biceps_support", "biceps", "elbow_flexion", "hypertrophy", "muscle_specific", "Biceps support complements pulling."),
        ],
        important: [
          responsibility("secondary_pull_or_row", "back", "secondary_row_or_pull", "hypertrophy", "movement_specific", "Secondary pulling adds coverage when appropriate."),
          responsibility("upper_back_or_lat_emphasis", "upper_back_or_lats", "row_or_vertical_pull", "hypertrophy", "muscle_specific", "Pull work should emphasise upper-back or lat coverage."),
        ],
        optional: [
          responsibility("rear_delt", "rear_delts", "shoulder_horizontal_abduction", "hypertrophy", "muscle_specific", "Optional rear-delt support."),
          responsibility("lower_trap", "lower_traps", "scapular_control", "maintenance", "muscle_specific", "Optional scapular support."),
          responsibility("core", "trunk", "bracing", "maintenance", "general", "Optional trunk support."),
        ],
        excluded: [
          responsibility("primary_pressing_stimulus", "chest_shoulders_triceps", "press", "hypertrophy", "movement_specific", "Primary pressing belongs elsewhere."),
          responsibility("primary_leg_stimulus", "lower_body", "squat_or_hinge", "hypertrophy", "movement_specific", "Primary leg work belongs elsewhere."),
        ],
      };
    case "legs":
    case "lower":
    case "lower_strength":
      return {
        required: [
          responsibility("knee_dominant_stimulus", "quads", "knee_dominant", "hypertrophy", "movement_specific", "Lower sessions must cover knee-dominant work."),
          responsibility("hip_hinge_or_posterior_chain_stimulus", "posterior_chain", "hinge_or_hip_extension", "hypertrophy", "movement_specific", "Lower sessions must cover posterior-chain work."),
        ],
        important: [
          responsibility("quad_support", "quads", "knee_extension_or_squat_support", "hypertrophy", "muscle_specific", "Quad support rounds out lower-body work."),
          responsibility("hamstring_or_glute_support", "hamstrings_or_glutes", "knee_flexion_or_hip_extension", "hypertrophy", "muscle_specific", "Hamstring or glute support balances the session."),
        ],
        optional: [
          responsibility("calves", "calves", "plantar_flexion", "hypertrophy", "muscle_specific", "Optional calf work."),
          responsibility("core", "trunk", "bracing", "maintenance", "general", "Optional trunk support."),
        ],
        excluded: [
          responsibility("primary_pressing_stimulus", "chest_shoulders_triceps", "press", "hypertrophy", "movement_specific", "Primary pressing belongs elsewhere."),
          responsibility("primary_back_stimulus", "back", "row_or_pull", "hypertrophy", "movement_specific", "Primary back work belongs elsewhere."),
        ],
      };
    case "upper":
    case "upper_strength":
      return {
        required: [
          responsibility("upper_press", "chest_shoulders_triceps", "press", "hypertrophy", "movement_specific", "Upper sessions must include pressing."),
          responsibility("upper_pull", "back_biceps", "pull_or_row", "hypertrophy", "movement_specific", "Upper sessions must include pulling."),
        ],
        important: [
          responsibility("chest_or_delt_stimulus", "chest_or_delts", "press_or_delt_isolation", "hypertrophy", "muscle_specific", "Upper work should include chest or delt stimulus."),
          responsibility("back_or_lat_stimulus", "back_or_lats", "row_or_pull", "hypertrophy", "muscle_specific", "Upper work should include back or lat stimulus."),
        ],
        optional: [
          responsibility("arms", "biceps_triceps", "elbow_flexion_or_extension", "hypertrophy", "muscle_specific", "Optional arm work."),
          responsibility("lateral_delt", "lateral_delts", "shoulder_abduction", "hypertrophy", "muscle_specific", "Optional lateral-delt work."),
          responsibility("rear_delt", "rear_delts", "shoulder_horizontal_abduction", "hypertrophy", "muscle_specific", "Optional rear-delt work."),
        ],
        excluded: [responsibility("primary_leg_stimulus", "lower_body", "squat_or_hinge", "hypertrophy", "movement_specific", "Primary leg work belongs elsewhere.")],
      };
    case "full_body":
    case "full_body_strength":
      return {
        required: [
          responsibility("lower_body_stimulus", "lower_body", "squat_or_hinge", "hypertrophy", "movement_specific", "Full body must include lower-body stimulus."),
          responsibility("upper_push_stimulus", "chest_shoulders_triceps", "press", "hypertrophy", "movement_specific", "Full body must include upper pushing."),
          responsibility("upper_pull_stimulus", "back_biceps", "pull_or_row", "hypertrophy", "movement_specific", "Full body must include upper pulling."),
        ],
        important: [responsibility("posterior_chain_or_hinge_support", "posterior_chain", "hinge_or_hip_extension", "hypertrophy", "movement_specific", "Posterior-chain support helps keep full-body work balanced.")],
        optional: [
          responsibility("arms", "biceps_triceps", "elbow_flexion_or_extension", "hypertrophy", "muscle_specific", "Optional arm work."),
          responsibility("delts", "delts", "shoulder_isolation_or_press", "hypertrophy", "muscle_specific", "Optional delt work."),
          responsibility("core", "trunk", "bracing", "maintenance", "general", "Optional trunk support."),
        ],
        excluded: [],
      };
    case "bench":
      return {
        required: [
          responsibility("bench_specific_strength", "bench_press", "horizontal_press", "strength", "competition_specific", "Bench day must preserve bench specificity."),
          responsibility("pressing_strength_stimulus", "chest_shoulders_triceps", "press", "strength", "movement_specific", "Bench day must deliver pressing strength stimulus."),
        ],
        important: [
          responsibility("secondary_press", "chest_or_shoulders", "secondary_press", "hypertrophy", "movement_specific", "Secondary pressing supports bench development."),
          responsibility("triceps_support", "triceps", "elbow_extension", "hypertrophy", "muscle_specific", "Triceps support assists bench strength."),
          responsibility("upper_back_support", "upper_back", "row_or_scapular_retraction", "hypertrophy", "muscle_specific", "Upper-back support helps bench stability."),
        ],
        optional: [
          responsibility("chest_hypertrophy", "chest", "chest_accessory", "hypertrophy", "muscle_specific", "Optional chest volume."),
          responsibility("shoulder_support", "shoulders", "delt_support", "hypertrophy", "muscle_specific", "Optional shoulder support."),
        ],
        excluded: [responsibility("primary_leg_stimulus", "lower_body", "squat_or_hinge", "hypertrophy", "movement_specific", "Primary leg work belongs elsewhere.")],
      };
    case "squat":
      return {
        required: [
          responsibility("squat_specific_strength", "squat", "squat", "strength", "competition_specific", "Squat day must preserve squat specificity."),
          responsibility("knee_dominant_strength_stimulus", "quads", "knee_dominant", "strength", "movement_specific", "Squat day must deliver knee-dominant strength stimulus."),
        ],
        important: [
          responsibility("posterior_chain_support", "posterior_chain", "hinge_or_hip_extension", "hypertrophy", "movement_specific", "Posterior-chain support assists squat development."),
          responsibility("quad_support", "quads", "knee_extension_or_squat_support", "hypertrophy", "muscle_specific", "Quad support assists squat strength."),
        ],
        optional: [
          responsibility("hamstrings", "hamstrings", "knee_flexion_or_hinge", "hypertrophy", "muscle_specific", "Optional hamstring work."),
          responsibility("core", "trunk", "bracing", "maintenance", "general", "Optional trunk support."),
        ],
        excluded: [responsibility("primary_pressing_stimulus", "chest_shoulders_triceps", "press", "hypertrophy", "movement_specific", "Primary pressing belongs elsewhere.")],
      };
    case "deadlift":
      return {
        required: [
          responsibility("deadlift_specific_strength", "deadlift", "hinge", "strength", "competition_specific", "Deadlift day must preserve deadlift specificity."),
          responsibility("hip_hinge_strength_stimulus", "posterior_chain", "hinge", "strength", "movement_specific", "Deadlift day must deliver hinge strength stimulus."),
        ],
        important: [
          responsibility("posterior_chain_support", "posterior_chain", "hip_extension", "hypertrophy", "movement_specific", "Posterior-chain support assists deadlift development."),
          responsibility("upper_back_support", "upper_back", "row_or_isometric_hold", "hypertrophy", "muscle_specific", "Upper-back support assists deadlift positioning."),
        ],
        optional: [
          responsibility("hamstrings", "hamstrings", "knee_flexion_or_hinge", "hypertrophy", "muscle_specific", "Optional hamstring work."),
          responsibility("core", "trunk", "bracing", "maintenance", "general", "Optional trunk support."),
        ],
        excluded: [responsibility("primary_pressing_stimulus", "chest_shoulders_triceps", "press", "hypertrophy", "movement_specific", "Primary pressing belongs elsewhere.")],
      };
  }
}

function responsibility(
  id: string,
  targetRegion: string,
  movementPattern: string,
  desiredAdaptation: StimulusDesiredAdaptation,
  specificityRequirement: StimulusSpecificity,
  rationale: string,
): Responsibility {
  return {
    id,
    targetRegion,
    movementPattern,
    desiredAdaptation,
    specificityRequirement,
    rationale,
  };
}

function confidenceFor(sessionType: ProgrammeFrameworkSessionType) {
  if (sessionType === "bench" || sessionType === "squat" || sessionType === "deadlift") return 92;
  if (sessionType === "push" || sessionType === "pull" || sessionType === "legs" || sessionType === "upper" || sessionType === "lower" || sessionType === "full_body") return 88;
  return 78;
}
