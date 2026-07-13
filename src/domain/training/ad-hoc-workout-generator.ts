import type { TrainingBlock } from "@/domain/training/annual-models";
import { createTrainingBlock, getBlockDropOffPercentage } from "@/domain/training/annual-planner";
import { getLanePrescriptionConstraints, resolveTrainingLane } from "@/domain/training/block-training-lanes";
import { scoreExercisePreference, type ExercisePreferenceRecord } from "@/domain/training/exercise-preferences";
import { resolveStartingLoadRecommendation } from "@/domain/training/load-selection";
import { resolveLoadIncrement, type LoadIncrementProfile } from "@/domain/training/load-increment-strategy";
import { resolveRepRange } from "@/domain/training/rep-range-strategy";
import { withSetPrescription } from "@/domain/training/set-prescription";
import { resolveEvidenceBasedSlotPrescription } from "@/domain/training/slot-prescription-matrix";
import type { TrainingSetupGoal } from "@/domain/training/plan-setup";
import type {
  BlockCompatibility,
  Equipment,
  Exercise,
  ExerciseFamily,
  ExerciseRole,
  ExperienceLevel,
  MuscleGroup,
  MovementPattern,
  Programme,
  ProgramExercise,
  ProgressionSettings,
  RepRange,
  WorkoutHistorySummary,
} from "@/domain/training/models";

export type GeneratedWorkoutType = "push" | "pull" | "legs" | "upper" | "lower" | "full_body" | "arms" | "chest" | "back" | "shoulders" | "custom";

export interface GenerateWorkoutOptions {
  exercises: Exercise[];
  currentBlock?: TrainingBlock | null;
  availableEquipment?: Equipment[];
  experienceLevel?: ExperienceLevel;
  targetExerciseCount?: number;
  focusMuscles?: MuscleGroup[];
  name?: string;
  createdByUserId?: string | null;
  variant?: number;
  availableMinutes?: number;
  history?: WorkoutHistorySummary[];
  recentVolumeByMuscle?: Partial<Record<MuscleGroup, number>>;
  recentExerciseIds?: string[];
  stalledExerciseIds?: string[];
  overusedMuscles?: MuscleGroup[];
  stablePrimaryExerciseIds?: string[];
  loadIncrementProfile?: Partial<LoadIncrementProfile>;
  unit?: ProgressionSettings["unit"];
  goal?: TrainingSetupGoal;
  referenceDate?: Date;
  exercisePreferences?: Record<string, ExercisePreferenceRecord>;
}

export interface MuscleVolumeLandmark {
  muscle: MuscleGroup;
  recentQualitySets: number;
  baselineQualitySets: number;
  estimatedMEV: number;
  estimatedMAV: number;
  estimatedMRV: number;
  status: "under_mev" | "adaptive" | "near_mrv" | "over_mrv" | "insufficient_data";
}

type BlockFamily = "hypertrophy" | "powerbuilding" | "strength" | "power" | "peak" | "deload";
type TemplateRole = ExerciseRole | "heavy_primary" | "heavy_secondary" | "strength" | "hypertrophy_maintenance";

type TemplateSlot = {
  role: TemplateRole;
  muscles: MuscleGroup[];
  patterns?: MovementPattern[];
  families?: ExerciseFamily[];
  avoidPatterns?: MovementPattern[];
  avoidFamilies?: ExerciseFamily[];
  label: string;
  sets: number;
  reason: string;
};

type CoachingTemplate = {
  name: string;
  muscles: MuscleGroup[];
  slots: TemplateSlot[];
};

/** Selection-only semantic request used by current programme jobs. */
export type SemanticExerciseSelectionRequest = Readonly<{
  allowedMuscles: readonly MuscleGroup[];
  movementPattern?: MovementPattern;
  exerciseFamily?: ExerciseFamily;
  purpose: "primary_compound" | "secondary_compound" | "isolation" | "supporting_accessory";
  exerciseClass: "compound" | "isolation" | "either";
}>;

/**
 * Reuses the generator's candidate filtering, scoring and tie-breaking mechanics
 * for one semantic job. It intentionally accepts no block or workout type.
 */
export function selectExerciseCandidateForSemanticJob(
  request: SemanticExerciseSelectionRequest,
  options: Omit<GenerateWorkoutOptions, "currentBlock" | "targetExerciseCount" | "focusMuscles">,
): Exercise | null {
  const role: ExerciseRole = request.purpose === "primary_compound"
    ? "primary_compound"
    : request.purpose === "secondary_compound"
      ? "secondary_compound"
      : request.purpose === "isolation"
        ? "isolation"
        : "accessory";
  const slot: TemplateSlot = {
    role,
    muscles: [...request.allowedMuscles],
    patterns: request.movementPattern ? [request.movementPattern] : undefined,
    families: request.exerciseFamily ? [request.exerciseFamily] : undefined,
    label: "semantic selection job",
    sets: 1,
    reason: "current programme semantic job",
  };
  const candidates = options.exercises
    .filter((exercise) => matchesEquipment(exercise, options.availableEquipment))
    .filter((exercise) => matchesExperience(exercise, options.experienceLevel));
  const classFiltered = request.exerciseClass === "either"
    ? candidates
    : candidates.filter((exercise) => request.exerciseClass === "compound"
      ? exercise.role !== "isolation" && exercise.roles.includes("primary_compound") || exercise.roles.includes("secondary_compound")
      : exercise.role === "isolation" || exercise.roles.includes("isolation"));
  return pickExerciseForSlot(slot, classFiltered, [], options);
}

const templateMap: Record<BlockFamily, Record<Exclude<GeneratedWorkoutType, "custom">, CoachingTemplate>> = {
  hypertrophy: {
    push: template("Push", ["chest", "shoulders", "triceps"], [
      primary(["chest"], ["horizontal_push"], "Primary chest compound"),
      secondary(["chest"], ["horizontal_push"], "Secondary chest press"),
      secondary(["shoulders"], ["vertical_push"], "Shoulder compound"),
      isolation(["chest"], "Chest isolation"),
      isolation(["shoulders"], "Delt isolation", 3, ["rear_delt_corrective"], ["shoulder_isolation"]),
      isolation(["triceps"], "Triceps isolation"),
    ]),
    pull: template("Pull", ["back", "biceps", "rear_delts"], [
      primary(["back"], ["horizontal_pull", "vertical_pull"], "Primary back compound"),
      secondary(["back"], ["vertical_pull"], "Vertical pull"),
      secondary(["back"], ["horizontal_pull"], "Horizontal row"),
      isolation(["biceps"], "Biceps isolation"),
      isolation(["rear_delts", "shoulders"], "Rear-delt isolation"),
    ]),
    legs: template("Legs", ["quads", "hamstrings", "glutes", "calves"], [
      primary(["quads"], ["squat"], "Primary squat pattern"),
      secondary(["hamstrings", "glutes"], ["hinge"], "Hip hinge"),
      secondary(["glutes"], ["hip_thrust", "lunge"], "Glute-biased compound"),
      isolation(["quads"], "Quad isolation"),
      isolation(["hamstrings"], "Hamstring isolation"),
      isolation(["calves"], "Calf isolation"),
      core(["abs"], "Core/bracing accessory"),
    ]),
    upper: template("Upper", ["chest", "back", "shoulders", "biceps", "triceps"], [
      primary(["chest"], ["horizontal_push"], "Primary press"),
      primary(["back"], ["horizontal_pull"], "Primary row"),
      secondary(["shoulders"], ["vertical_push"], "Shoulder compound"),
      secondary(["back"], ["vertical_pull"], "Vertical pull"),
      isolation(["triceps"], "Triceps isolation"),
      isolation(["biceps"], "Biceps isolation"),
    ]),
    lower: template("Lower", ["quads", "hamstrings", "glutes", "calves"], [
      primary(["quads"], ["squat"], "Primary squat pattern"),
      secondary(["hamstrings", "glutes"], ["hinge"], "Hip hinge"),
      secondary(["glutes"], ["hip_thrust", "lunge"], "Glute/leg compound"),
      isolation(["hamstrings"], "Hamstring isolation"),
      isolation(["calves"], "Calf isolation"),
      core(["abs"], "Core/bracing accessory"),
    ]),
    full_body: template("Full Body", ["quads", "chest", "back", "hamstrings", "shoulders"], [
      primary(["quads"], ["squat"], "Lower primary"),
      primary(["chest"], ["horizontal_push"], "Upper push primary"),
      primary(["back"], ["horizontal_pull"], "Upper pull primary"),
      secondary(["hamstrings", "glutes"], ["hinge"], "Posterior-chain secondary"),
      secondary(["shoulders"], ["vertical_push"], "Shoulder secondary"),
      isolation(["abs"], "Core accessory"),
    ]),
    arms: template("Arms", ["biceps", "triceps", "forearms"], [
      secondary(["triceps"], ["horizontal_push"], "Triceps compound"),
      isolation(["biceps"], "Biceps isolation"),
      isolation(["triceps"], "Triceps isolation"),
      isolation(["biceps", "forearms"], "Brachialis/forearm curl"),
      isolation(["triceps"], "Long-head triceps"),
    ]),
    chest: template("Chest", ["chest", "triceps", "shoulders"], [
      primary(["chest"], ["horizontal_push"], "Chest compound"),
      secondary(["chest"], ["horizontal_push"], "Incline or secondary press"),
      isolation(["chest"], "Chest fly / pec isolation", 3, undefined, ["chest_isolation"]),
      secondary(["triceps", "chest"], ["horizontal_push"], "Pressing support"),
      isolation(["triceps", "shoulders"], "Small push accessory", 2, ["rear_delt_corrective", "trap"]),
    ]),
    back: template("Back", ["back", "rear_delts", "traps", "biceps"], [
      primary(["back"], ["vertical_pull"], "Vertical pull"),
      secondary(["back"], ["horizontal_pull"], "Horizontal row"),
      secondary(["back"], ["vertical_pull", "horizontal_pull"], "Lat / upper-back accessory"),
      isolation(["biceps"], "Optional biceps support", 2),
      isolation(["rear_delts", "traps", "shoulders"], "Rear-delt or trap accessory", 3, undefined, ["rear_delt_corrective", "trap", "shoulder_isolation"]),
    ]),
    shoulders: template("Shoulders", ["shoulders", "rear_delts", "traps", "triceps"], [
      secondary(["shoulders"], ["vertical_push"], "Shoulder press pattern"),
      isolation(["shoulders"], "Lateral delt", 3, ["rear_delt_corrective", "trap"], ["shoulder_isolation"]),
      isolation(["rear_delts", "shoulders"], "Rear delt", 3, undefined, ["rear_delt_corrective", "shoulder_isolation"]),
      isolation(["traps", "rear_delts", "shoulders"], "Trap / lower-trap / scapular accessory", 3, undefined, ["trap"]),
      isolation(["triceps", "back"], "Optional support accessory", 2),
    ]),
  },
  powerbuilding: {
    push: template("Push", ["chest", "shoulders", "triceps"], [
      heavyPrimary(["chest"], ["horizontal_push"], "Heavy primary press"),
      secondary(["chest"], ["horizontal_push"], "Hypertrophy press"),
      secondary(["shoulders"], ["vertical_push"], "Shoulder compound"),
      secondary(["triceps"], ["horizontal_push"], "Triceps compound"),
      isolation(["shoulders"], "Delt isolation", 3, ["rear_delt_corrective"], ["shoulder_isolation"]),
      isolation(["triceps"], "Triceps isolation"),
    ]),
    pull: template("Pull", ["back", "biceps", "rear_delts"], [
      heavyPrimary(["back"], ["horizontal_pull"], "Heavy row"),
      secondary(["back"], ["vertical_pull"], "Vertical pull"),
      secondary(["back"], ["horizontal_pull"], "Supported row"),
      isolation(["biceps"], "Biceps isolation"),
      isolation(["rear_delts"], "Rear-delt isolation"),
    ]),
    legs: template("Legs", ["quads", "hamstrings", "glutes"], [
      heavyPrimary(["quads"], ["squat"], "Heavy squat pattern"),
      heavySecondary(["hamstrings", "glutes"], ["hinge"], "Heavy hinge"),
      secondary(["quads", "glutes"], ["lunge", "hip_thrust"], "Single-leg/glute compound"),
      isolation(["quads"], "Quad isolation"),
      isolation(["hamstrings"], "Hamstring isolation"),
      core(["abs"], "Core/bracing accessory"),
    ]),
    upper: template("Upper", ["chest", "back", "shoulders", "biceps", "triceps"], [
      heavyPrimary(["chest"], ["horizontal_push"], "Heavy press"),
      heavyPrimary(["back"], ["horizontal_pull"], "Heavy pull"),
      secondary(["shoulders"], ["vertical_push"], "Shoulder compound"),
      secondary(["back"], ["vertical_pull"], "Vertical pull"),
      isolation(["triceps"], "Triceps isolation"),
      isolation(["biceps"], "Biceps isolation"),
    ]),
    lower: template("Lower", ["quads", "hamstrings", "glutes"], [
      heavyPrimary(["quads"], ["squat"], "Heavy squat pattern"),
      heavySecondary(["hamstrings"], ["hinge"], "Heavy hinge"),
      secondary(["glutes"], ["hip_thrust", "lunge"], "Glute compound"),
      isolation(["hamstrings"], "Hamstring isolation"),
      isolation(["calves"], "Calf isolation"),
      core(["abs"], "Core/bracing accessory"),
    ]),
    full_body: template("Full Body", ["quads", "chest", "back", "hamstrings"], [
      heavyPrimary(["quads"], ["squat"], "Heavy lower"),
      heavyPrimary(["chest"], ["horizontal_push"], "Heavy push"),
      heavyPrimary(["back"], ["horizontal_pull"], "Heavy pull"),
      secondary(["hamstrings", "glutes"], ["hinge"], "Posterior chain"),
      isolation(["shoulders"], "Delt isolation", 3, ["rear_delt_corrective"], ["shoulder_isolation"]),
      isolation(["biceps", "triceps"], "Arm accessory"),
    ]),
    arms: template("Arms", ["biceps", "triceps", "forearms"], [
      secondary(["triceps"], ["horizontal_push"], "Heavy triceps compound"),
      isolation(["biceps"], "Biceps isolation"),
      isolation(["triceps"], "Triceps isolation"),
      isolation(["biceps", "forearms"], "Brachialis/forearm curl"),
      isolation(["triceps"], "Long-head triceps"),
    ]),
    chest: template("Chest", ["chest", "triceps", "shoulders"], [
      heavyPrimary(["chest"], ["horizontal_push"], "Heavy chest press"),
      secondary(["chest"], ["horizontal_push"], "Hypertrophy press"),
      isolation(["chest"], "Chest fly / pec isolation", 3, undefined, ["chest_isolation"]),
      secondary(["triceps", "chest"], ["horizontal_push"], "Triceps-biased press"),
      isolation(["triceps"], "Triceps support", 2),
    ]),
    back: template("Back", ["back", "rear_delts", "traps", "biceps"], [
      heavyPrimary(["back"], ["horizontal_pull"], "Heavy row"),
      secondary(["back"], ["vertical_pull"], "Vertical pull"),
      secondary(["back"], ["horizontal_pull"], "Upper-back row"),
      isolation(["biceps"], "Biceps support", 2),
      isolation(["rear_delts", "traps", "shoulders"], "Rear-delt or trap accessory", 3, undefined, ["rear_delt_corrective", "trap", "shoulder_isolation"]),
    ]),
    shoulders: template("Shoulders", ["shoulders", "rear_delts", "traps", "triceps"], [
      heavySecondary(["shoulders"], ["vertical_push"], "Heavy shoulder press"),
      isolation(["shoulders"], "Lateral delt", 3, ["rear_delt_corrective", "trap"], ["shoulder_isolation"]),
      isolation(["rear_delts", "shoulders"], "Rear delt", 3, undefined, ["rear_delt_corrective", "shoulder_isolation"]),
      isolation(["traps", "rear_delts", "shoulders"], "Trap / lower-trap / scapular accessory", 3, undefined, ["trap"]),
      secondary(["triceps", "shoulders"], ["vertical_push", "horizontal_push"], "Pressing support", 2),
    ]),
  },
  strength: {
    push: template("Push", ["chest", "shoulders", "triceps"], [
      heavyPrimary(["chest"], ["horizontal_push"], "Bench press anchor", 4),
      heavySecondary(["shoulders"], ["vertical_push"], "Overhead press anchor/support", 3),
      heavySecondary(["triceps", "chest"], ["horizontal_push"], "Close press variation", 3),
      isolation(["triceps", "shoulders"], "Triceps and shoulder support", 2, ["rear_delt_corrective"], ["triceps_isolation", "shoulder_isolation"]),
    ]),
    pull: template("Pull", ["back", "biceps"], [
      heavyPrimary(["hamstrings", "glutes", "back"], ["hinge"], "Deadlift-family anchor", 3),
      heavySecondary(["back"], ["horizontal_pull"], "Heavy row support", 3),
      heavySecondary(["back"], ["vertical_pull"], "Heavy vertical pull support", 2),
      isolation(["rear_delts", "traps"], "Upper-back stability support", 2, undefined, ["rear_delt_corrective", "trap"]),
      isolation(["biceps"], "Small arm dose", 2),
    ]),
    legs: template("Legs", ["quads", "hamstrings", "glutes"], [
      heavyPrimary(["quads"], ["squat"], "Squat anchor", 4),
      heavySecondary(["hamstrings", "glutes", "back"], ["hinge"], "Deadlift-family support", 3),
      secondary(["glutes"], ["hip_thrust", "lunge"], "Secondary lower compound", 2),
      isolation(["hamstrings"], "Hamstring support", 2, undefined, ["hamstring_isolation"]),
      core(["abs"], "Core/bracing support", 2),
    ]),
    upper: template("Upper", ["chest", "back", "shoulders"], [
      heavyPrimary(["chest"], ["horizontal_push"], "Bench press anchor", 4),
      heavySecondary(["shoulders"], ["vertical_push"], "Overhead press support", 3),
      heavySecondary(["back"], ["horizontal_pull"], "Upper-back support", 3),
      isolation(["triceps", "biceps", "rear_delts"], "Pressing and pulling support", 2),
    ]),
    lower: template("Lower", ["quads", "hamstrings", "glutes"], [
      heavyPrimary(["quads"], ["squat"], "Squat anchor", 4),
      heavySecondary(["hamstrings", "glutes", "back"], ["hinge"], "Deadlift-family anchor/support", 3),
      secondary(["glutes"], ["hip_thrust", "lunge"], "Secondary lower compound", 2),
      isolation(["hamstrings"], "Hamstring support", 2, undefined, ["hamstring_isolation"]),
      core(["abs"], "Core/bracing support", 2),
    ]),
    full_body: template("Full Body", ["quads", "chest", "back"], [
      heavyPrimary(["quads"], ["squat"], "Squat/deadlift lower anchor", 4),
      heavyPrimary(["chest"], ["horizontal_push"], "Bench press anchor", 3),
      heavySecondary(["shoulders", "back"], ["vertical_push", "horizontal_pull"], "OHP or upper-back support", 2),
      core(["abs"], "Core support", 2),
    ]),
    arms: template("Arms", ["biceps", "triceps"], [
      secondary(["triceps"], ["horizontal_push"], "Heavy triceps compound", 3),
      isolation(["biceps"], "Biceps hypertrophy dose", 2),
      isolation(["triceps"], "Triceps hypertrophy dose", 2),
      isolation(["biceps", "triceps"], "Direct arm support", 2),
    ]),
    chest: template("Chest", ["chest", "triceps", "shoulders"], [
      heavyPrimary(["chest"], ["horizontal_push"], "Bench press anchor", 4),
      heavySecondary(["chest", "triceps"], ["horizontal_push"], "Specific secondary press", 3),
      isolation(["chest"], "Small chest isolation dose", 2, undefined, ["chest_isolation"]),
      isolation(["triceps"], "Small triceps dose", 2),
    ]),
    back: template("Back", ["back", "rear_delts", "traps", "biceps"], [
      heavyPrimary(["hamstrings", "glutes", "back"], ["hinge"], "Deadlift-family anchor", 3),
      heavySecondary(["back"], ["horizontal_pull"], "Heavy row", 3),
      heavySecondary(["back"], ["vertical_pull"], "Heavy vertical pull", 2),
      isolation(["rear_delts", "traps", "shoulders"], "Upper-back support", 2, undefined, ["rear_delt_corrective", "trap", "shoulder_isolation"]),
      isolation(["biceps"], "Small biceps dose", 2),
    ]),
    shoulders: template("Shoulders", ["shoulders", "rear_delts", "traps", "triceps"], [
      heavySecondary(["shoulders"], ["vertical_push"], "Heavy shoulder press", 4),
      isolation(["shoulders"], "Lateral delt maintenance", 2, ["rear_delt_corrective", "trap"], ["shoulder_isolation"]),
      isolation(["rear_delts", "shoulders"], "Rear-delt support", 2, undefined, ["rear_delt_corrective", "shoulder_isolation"]),
      isolation(["traps", "rear_delts", "shoulders"], "Trap / scapular support", 2, undefined, ["trap"]),
    ]),
  },
  power: {
    push: template("Push", ["chest", "shoulders", "triceps"], [
      power(["chest"], ["horizontal_push"], "Explosive push", 4, ["olympic_power", "jump_power", "throw_power"], ["horizontal_press"]),
      power(["shoulders"], ["vertical_push"], "Explosive overhead", 3, ["olympic_power", "jump_power", "throw_power"], ["vertical_press"]),
      strength(["chest"], ["horizontal_push"], "Strength exposure", 3),
      isolation(["shoulders", "triceps"], "Low-volume support", 2, ["rear_delt_corrective"], ["shoulder_isolation", "triceps_isolation"]),
    ]),
    pull: template("Pull", ["back", "biceps"], [
      power(["hamstrings", "glutes", "back"], ["hinge"], "Explosive hinge", 4, undefined, ["olympic_power", "hip_hinge"]),
      strength(["back"], ["horizontal_pull"], "Strength pull", 3),
      secondary(["back"], ["vertical_pull"], "Lat maintenance", 2),
      isolation(["rear_delts", "biceps"], "Scapular or arm maintenance", 2),
    ]),
    legs: template("Legs", ["quads", "hamstrings", "glutes"], [
      power(["quads", "glutes"], ["squat"], "Jump or speed squat", 4, undefined, ["jump_power", "squat_pattern"]),
      power(["hamstrings", "glutes"], ["hinge"], "Explosive hinge", 3, undefined, ["olympic_power", "hip_hinge"]),
      strength(["quads"], ["squat"], "Strength exposure", 3),
      core(["abs"], "Core/bracing support", 2),
      isolation(["hamstrings"], "Hypertrophy maintenance", 2),
    ]),
    upper: template("Upper", ["chest", "back", "shoulders"], [
      power(["chest"], ["horizontal_push"], "Explosive push", 4, ["olympic_power", "jump_power", "throw_power"], ["horizontal_press"]),
      power(["shoulders"], ["vertical_push"], "Explosive overhead", 3, ["olympic_power", "jump_power", "throw_power"], ["vertical_press"]),
      strength(["back"], ["horizontal_pull"], "Strength pull", 3),
      isolation(["rear_delts", "shoulders"], "Scapular/delt maintenance", 2, undefined, ["rear_delt_corrective", "shoulder_isolation"]),
    ]),
    lower: template("Lower", ["quads", "hamstrings", "glutes"], [
      power(["quads", "glutes"], ["squat"], "Jump or speed squat", 4, undefined, ["jump_power", "squat_pattern"]),
      power(["hamstrings", "glutes"], ["hinge"], "Explosive hinge", 3, undefined, ["olympic_power", "hip_hinge"]),
      strength(["quads"], ["squat"], "Strength exposure", 3),
      core(["abs"], "Core/bracing support", 2),
      isolation(["calves"], "Calf maintenance", 2),
    ]),
    full_body: template("Full Body", ["quads", "chest", "back", "hamstrings"], [
      power(["quads", "glutes"], ["squat"], "Lower power", 4, undefined, ["jump_power", "squat_pattern"]),
      power(["chest"], ["horizontal_push"], "Upper power", 3, ["olympic_power", "jump_power", "throw_power"], ["horizontal_press"]),
      strength(["back"], ["horizontal_pull"], "Pull strength", 3),
      core(["abs"], "Core maintenance", 2),
    ]),
    arms: template("Arms", ["biceps", "triceps", "shoulders"], [
      power(["shoulders"], ["vertical_push"], "Explosive shoulder/triceps", 3, ["olympic_power", "jump_power", "throw_power"], ["vertical_press"]),
      strength(["triceps"], ["horizontal_push"], "Triceps strength"),
      isolation(["biceps"], "Biceps maintenance", 2),
      isolation(["triceps"], "Triceps maintenance", 2),
    ]),
    chest: template("Chest", ["chest", "triceps", "shoulders"], [
      power(["chest"], ["horizontal_push"], "Explosive chest press", 4, ["olympic_power", "jump_power", "throw_power"], ["horizontal_press"]),
      strength(["chest"], ["horizontal_push"], "Press strength exposure", 3),
      isolation(["chest"], "Chest maintenance", 2, undefined, ["chest_isolation"]),
      isolation(["triceps"], "Triceps maintenance", 2),
    ]),
    back: template("Back", ["back", "rear_delts", "traps", "biceps"], [
      power(["back", "hamstrings", "glutes"], ["hinge", "horizontal_pull"], "Explosive pull", 4, undefined, ["olympic_power", "hip_hinge"]),
      strength(["back"], ["horizontal_pull"], "Pull strength exposure", 3),
      secondary(["back"], ["vertical_pull"], "Lat maintenance", 2),
      isolation(["rear_delts", "traps", "shoulders"], "Rear-delt/trap maintenance", 2, undefined, ["rear_delt_corrective", "trap", "shoulder_isolation"]),
    ]),
    shoulders: template("Shoulders", ["shoulders", "rear_delts", "traps"], [
      power(["shoulders"], ["vertical_push"], "Explosive shoulder press", 3, ["olympic_power", "jump_power", "throw_power"], ["vertical_press"]),
      strength(["shoulders"], ["vertical_push"], "Shoulder strength exposure", 3),
      isolation(["shoulders"], "Lateral delt maintenance", 2, ["rear_delt_corrective", "trap"], ["shoulder_isolation"]),
      isolation(["rear_delts", "traps", "shoulders"], "Rear-delt/trap maintenance", 2, undefined, ["trap", "rear_delt_corrective"]),
    ]),
  },
  peak: {
    push: template("Push", ["chest", "shoulders", "triceps"], [
      heavyPrimary(["chest"], ["horizontal_push"], "Specific bench press exposure", 2),
      heavySecondary(["chest", "triceps"], ["horizontal_push"], "Close press support", 1),
      isolation(["triceps", "rear_delts", "shoulders"], "Minimal press support", 1),
    ]),
    pull: template("Pull", ["back", "biceps", "rear_delts"], [
      heavyPrimary(["hamstrings", "glutes", "back"], ["hinge"], "Specific deadlift exposure", 2),
      heavySecondary(["back"], ["horizontal_pull"], "Upper-back support", 1),
      isolation(["rear_delts", "traps"], "Low-fatigue scapular support", 1, undefined, ["rear_delt_corrective", "trap"]),
    ]),
    legs: template("Legs", ["quads", "hamstrings", "glutes"], [
      heavyPrimary(["quads"], ["squat"], "Specific squat exposure", 2),
      heavySecondary(["hamstrings", "glutes", "back"], ["hinge"], "Specific deadlift support", 1),
      core(["abs"], "Minimal bracing support", 1),
    ]),
    upper: template("Upper", ["chest", "back", "shoulders"], [
      heavyPrimary(["chest"], ["horizontal_push"], "Specific bench exposure", 2),
      heavySecondary(["shoulders"], ["vertical_push"], "OHP specificity support", 1),
      heavySecondary(["back"], ["horizontal_pull"], "Upper-back stability support", 1),
    ]),
    lower: template("Lower", ["quads", "hamstrings", "glutes"], [
      heavyPrimary(["quads"], ["squat"], "Specific squat exposure", 2),
      heavySecondary(["hamstrings", "glutes", "back"], ["hinge"], "Specific deadlift exposure", 1),
      core(["abs"], "Minimal bracing support", 1),
    ]),
    full_body: template("Full Body", ["quads", "chest", "back"], [
      heavyPrimary(["quads"], ["squat"], "Specific lower exposure", 2),
      heavyPrimary(["chest"], ["horizontal_push"], "Specific upper exposure", 2),
      heavySecondary(["back"], ["horizontal_pull"], "Minimal upper-back support", 1),
      core(["abs"], "Minimal bracing support", 1),
    ]),
    arms: template("Arms", ["biceps", "triceps"], [
      isolation(["triceps"], "Triceps maintenance", 1),
      isolation(["biceps"], "Biceps maintenance", 1),
      isolation(["rear_delts", "traps"], "Low-fatigue shoulder support", 1, undefined, ["rear_delt_corrective", "trap"]),
    ]),
    chest: template("Chest", ["chest", "triceps"], [
      heavyPrimary(["chest"], ["horizontal_push"], "Specific bench exposure", 2),
      heavySecondary(["chest", "triceps"], ["horizontal_push"], "Close bench support", 1),
      isolation(["triceps"], "Minimal triceps support", 1),
    ]),
    back: template("Back", ["back", "rear_delts", "traps"], [
      heavyPrimary(["hamstrings", "glutes", "back"], ["hinge"], "Specific deadlift exposure", 2),
      heavySecondary(["back"], ["horizontal_pull"], "Upper-back support", 1),
      isolation(["rear_delts", "traps"], "Low-fatigue upper-back support", 1, undefined, ["rear_delt_corrective", "trap"]),
    ]),
    shoulders: template("Shoulders", ["shoulders", "rear_delts", "traps"], [
      heavyPrimary(["shoulders"], ["vertical_push"], "Specific OHP exposure", 2),
      isolation(["rear_delts", "traps"], "Low-fatigue scapular support", 1, undefined, ["rear_delt_corrective", "trap"]),
      isolation(["triceps"], "Minimal lockout support", 1),
    ]),
  },
  deload: {
    push: template("Push", ["chest", "shoulders", "triceps"], [
      secondary(["chest"], ["horizontal_push"], "Easy press pattern", 2),
      isolation(["chest", "shoulders"], "Low-fatigue chest/shoulder work", 1, undefined, ["chest_isolation", "shoulder_isolation"]),
      isolation(["triceps"], "Light triceps support", 1),
    ]),
    pull: template("Pull", ["back", "biceps", "rear_delts"], [
      secondary(["back"], ["vertical_pull", "horizontal_pull"], "Easy row or pulldown", 2),
      isolation(["rear_delts", "traps", "shoulders"], "Scapular/rear-delt support", 1, undefined, ["rear_delt_corrective", "trap", "shoulder_isolation"]),
      isolation(["biceps"], "Light biceps support", 1),
    ]),
    legs: template("Legs", ["quads", "hamstrings", "glutes", "calves"], [
      secondary(["quads"], ["squat"], "Easy squat or press pattern", 2),
      isolation(["hamstrings"], "Easy hamstring support", 1, undefined, ["hamstring_isolation"]),
      core(["abs"], "Low-fatigue core support", 1),
    ]),
    upper: template("Upper", ["chest", "back", "shoulders"], [
      secondary(["chest"], ["horizontal_push"], "Easy upper push", 2),
      secondary(["back"], ["horizontal_pull", "vertical_pull"], "Easy upper pull", 2),
      isolation(["rear_delts", "shoulders"], "Low-fatigue shoulder support", 1, undefined, ["rear_delt_corrective", "shoulder_isolation"]),
    ]),
    lower: template("Lower", ["quads", "hamstrings", "glutes"], [
      secondary(["quads"], ["squat"], "Easy lower pattern", 2),
      isolation(["hamstrings"], "Easy hamstring support", 1, undefined, ["hamstring_isolation"]),
      core(["abs"], "Light bracing practice", 1),
    ]),
    full_body: template("Full Body", ["quads", "chest", "back"], [
      secondary(["quads"], ["squat"], "Easy lower pattern", 2),
      secondary(["chest"], ["horizontal_push"], "Easy upper push", 1),
      secondary(["back"], ["horizontal_pull", "vertical_pull"], "Easy upper pull", 1),
    ]),
    arms: template("Arms", ["biceps", "triceps"], [
      isolation(["biceps"], "Easy biceps work", 1),
      isolation(["triceps"], "Easy triceps work", 1),
      isolation(["forearms", "rear_delts"], "Low-fatigue support", 1),
    ]),
    chest: template("Chest", ["chest", "triceps"], [
      secondary(["chest"], ["horizontal_push"], "Easy chest press", 2),
      isolation(["chest"], "Easy pec work", 1, undefined, ["chest_isolation"]),
      isolation(["triceps"], "Light triceps support", 1),
    ]),
    back: template("Back", ["back", "rear_delts", "traps", "biceps"], [
      secondary(["back"], ["vertical_pull", "horizontal_pull"], "Easy back pattern", 2),
      isolation(["rear_delts", "traps"], "Easy upper-back support", 1, undefined, ["rear_delt_corrective", "trap"]),
      isolation(["biceps"], "Light biceps support", 1),
    ]),
    shoulders: template("Shoulders", ["shoulders", "rear_delts", "traps"], [
      secondary(["shoulders"], ["vertical_push"], "Easy shoulder press pattern", 2),
      isolation(["shoulders"], "Easy lateral delt work", 1, ["rear_delt_corrective", "trap"], ["shoulder_isolation"]),
      isolation(["rear_delts", "traps"], "Easy rear-delt/trap support", 1, undefined, ["rear_delt_corrective", "trap"]),
    ]),
  },
};

export function generatePushWorkout(options: GenerateWorkoutOptions): Programme {
  return generateWorkoutByFocus("push", options);
}

export function generatePullWorkout(options: GenerateWorkoutOptions): Programme {
  return generateWorkoutByFocus("pull", options);
}

export function generateLegsWorkout(options: GenerateWorkoutOptions): Programme {
  return generateWorkoutByFocus("legs", options);
}

export function generateUpperWorkout(options: GenerateWorkoutOptions): Programme {
  return generateWorkoutByFocus("upper", options);
}

export function generateLowerWorkout(options: GenerateWorkoutOptions): Programme {
  return generateWorkoutByFocus("lower", options);
}

export function generateFullBodyWorkout(options: GenerateWorkoutOptions): Programme {
  return generateWorkoutByFocus("full_body", options);
}

export function generateWorkoutByFocus(type: GeneratedWorkoutType, options: GenerateWorkoutOptions): Programme {
  const blockFamily = getBlockFamily(options.currentBlock);
  const baseTemplate = type === "custom" ? customTemplate(options) : templateMap[blockFamily][type];
  const template = applyFatigueToTemplate(baseTemplate, options);
  const targetCount = options.targetExerciseCount ?? countForExperience(options.experienceLevel, countForAvailableTime(options.availableMinutes, template.slots.length));
  const slots = selectTemplateSlots(template.slots, targetCount);
  const selected = selectExercisesFromTemplate(slots, options);
  const timestamp = new Date().toISOString();

  return {
    id: `generated-${type}-${timestamp}`,
    name: options.name ?? template.name,
    description: "Generated from coaching templates, block intent, exercise roles, and performance history.",
    goal: blockFamily === "powerbuilding" ? "strength_hypertrophy" : "hypertrophy",
    experienceLevel: options.experienceLevel ?? "intermediate",
    daysPerWeek: 1,
    notes: buildProgrammeNotes(blockFamily, options),
    createdByUserId: options.createdByUserId ?? null,
    isCustom: true,
    isPreset: false,
    days: [
      {
        id: `generated-${type}-day-${timestamp}`,
        name: labelWorkoutType(type),
        equipmentAvailable: options.availableEquipment ?? [],
        notes: "Planner chooses the exercises. Logged performance still decides volume, shutdown, and progression.",
        exerciseSlots: selected.map(({ exercise, slot }, index) => createGeneratedSlot(exercise, slot, index + 1, options)),
      },
    ],
  };
}

export function getWorkoutTypeMuscles(type: GeneratedWorkoutType, focusMuscles?: MuscleGroup[]): MuscleGroup[] {
  if (type === "custom") return focusMuscles ?? [];
  return templateMap.hypertrophy[type].muscles;
}

export function calculateMuscleVolumeLandmarks(
  history: WorkoutHistorySummary[],
  exercises: Exercise[],
  muscle: MuscleGroup,
): MuscleVolumeLandmark {
  const exerciseById = new Map(exercises.map((exercise) => [exercise.id, exercise]));
  const weekly = history
    .map((session) => ({
      completedAt: session.completedAt,
      sets: session.exerciseSummaries.reduce((total, summary) => {
        const exercise = exerciseById.get(summary.exerciseId);
        if (!exercise) return total;
        const primary = exercise.primaryMuscles.includes(muscle) ? summary.qualitySets : 0;
        const secondary = exercise.secondaryMuscles.includes(muscle) ? summary.qualitySets * 0.5 : 0;
        return total + primary + secondary;
      }, 0),
    }))
    .filter((entry) => entry.sets > 0)
    .slice(-6);

  if (weekly.length < 3) {
    return {
      muscle,
      recentQualitySets: weekly.at(-1)?.sets ?? 0,
      baselineQualitySets: 0,
      estimatedMEV: 0,
      estimatedMAV: 0,
      estimatedMRV: 0,
      status: "insufficient_data",
    };
  }

  const values = weekly.map((entry) => entry.sets);
  const recentQualitySets = values.at(-1) ?? 0;
  const baselineQualitySets = average(values.slice(0, -1));
  const peak = Math.max(...values);
  const estimatedMEV = Math.max(1, Math.round(Math.min(...values)));
  const estimatedMAV = Math.max(estimatedMEV + 1, Math.round(baselineQualitySets));
  const estimatedMRV = Math.max(estimatedMAV + 1, Math.round(peak * 1.15));
  const status =
    recentQualitySets < estimatedMEV
      ? "under_mev"
      : recentQualitySets >= estimatedMRV
        ? "over_mrv"
        : recentQualitySets >= estimatedMAV
          ? "near_mrv"
          : "adaptive";

  return { muscle, recentQualitySets, baselineQualitySets, estimatedMEV, estimatedMAV, estimatedMRV, status };
}

function selectExercisesFromTemplate(slots: TemplateSlot[], options: GenerateWorkoutOptions): Array<{ exercise: Exercise; slot: TemplateSlot }> {
  const candidates = options.exercises
    .filter((exercise) => matchesEquipment(exercise, options.availableEquipment))
    .filter((exercise) => matchesExperience(exercise, options.experienceLevel))
    .filter((exercise) => matchesBlock(exercise, options.currentBlock));
  const selected: Array<{ exercise: Exercise; slot: TemplateSlot }> = [];

  for (const slot of slots) {
    const pick = pickExerciseForSlot(slot, candidates, selected.map((item) => item.exercise), options);
    if (pick) selected.push({ exercise: pick, slot });
  }

  return selected;
}

function selectTemplateSlots(slots: TemplateSlot[], targetCount: number): TemplateSlot[] {
  const count = Math.max(1, targetCount);
  if (count >= slots.length) return slots;

  const selected = slots.slice(0, count);
  const omittedCoreSlot = slots.slice(count).find(isCoreSlot);
  if (!omittedCoreSlot || selected.some(isCoreSlot)) return selected;

  const replaceIndex = findLastReplaceableSupportSlotIndex(selected);
  if (replaceIndex < 0) return selected;

  return selected.map((slot, index) => index === replaceIndex ? omittedCoreSlot : slot);
}

function findLastReplaceableSupportSlotIndex(slots: TemplateSlot[]): number {
  const optionalIsolationIndex = findLastIndex(slots, (slot) => slot.role === "isolation");
  if (optionalIsolationIndex >= 0) return optionalIsolationIndex;
  for (let index = slots.length - 1; index >= 0; index -= 1) {
    const slot = slots[index]!;
    if (slot.role !== "primary_compound" && slot.role !== "heavy_primary" && slot.role !== "power") return index;
  }
  return -1;
}

function pickExerciseForSlot(slot: TemplateSlot, candidates: Exercise[], selected: Exercise[], options: GenerateWorkoutOptions): Exercise | null {
  const primaryLike = slot.role === "primary_compound" || slot.role === "heavy_primary" || slot.role === "power";
  const matchingCandidates = candidates
    .filter((exercise) => !selected.some((item) => item.id === exercise.id))
    .filter((exercise) => touchesMuscles(exercise, slot.muscles))
    .filter((exercise) => matchesSlotRole(exercise, slot.role))
    .filter((exercise) => !slot.patterns || slot.patterns.includes(exercise.movementPattern))
    .filter((exercise) => !slot.families || slot.families.includes(exercise.family))
    .filter((exercise) => !slot.avoidPatterns?.includes(exercise.movementPattern))
    .filter((exercise) => !slot.avoidFamilies?.includes(exercise.family));
  const nonStalledPrimaryCandidates = primaryLike
    ? matchingCandidates.filter((exercise) => !(options.stalledExerciseIds?.includes(exercise.id) ?? false))
    : matchingCandidates;
  const scored = (nonStalledPrimaryCandidates.length > 0 ? nonStalledPrimaryCandidates : matchingCandidates)
    .map((exercise) => ({ exercise, score: scoreExerciseForSlot(exercise, slot, selected, options) }))
    .sort((a, b) => b.score - a.score);

  const meetPeakSpecific = pickMeetPeakSpecificExercise(scored.map((item) => item.exercise), slot, options);
  if (meetPeakSpecific) return meetPeakSpecific;

  if (scored.length === 0 && slot.role !== "power") {
    return (
      candidates
        .filter((exercise) => !selected.some((item) => item.id === exercise.id))
        .filter((exercise) => touchesMuscles(exercise, slot.muscles))
        .filter((exercise) => !slot.patterns || slot.patterns.includes(exercise.movementPattern))
        .filter((exercise) => !slot.families || slot.families.includes(exercise.family))
        .filter((exercise) => !slot.avoidPatterns?.includes(exercise.movementPattern))
        .filter((exercise) => !slot.avoidFamilies?.includes(exercise.family))
        .map((exercise) => ({ exercise, score: scoreExerciseForSlot(exercise, slot, selected, options) - 25 }))
        .sort((a, b) => b.score - a.score)[0]?.exercise ?? null
    );
  }

  const stablePrimary = stablePrimaryPick(scored.map((item) => item.exercise), slot, options);
  if (stablePrimary) return stablePrimary;

  const slotIndex = selected.length;
  const offset = variantOffsetForSlot(slot, slotIndex, options);
  const pool = rotateRecentTierCAccessories(scored, slot, options);
  const topPool = pool.slice(0, Math.min(4, pool.length));
  return topPool.length ? topPool[offset % topPool.length]?.exercise ?? topPool[0]!.exercise : null;
}

function pickMeetPeakSpecificExercise(candidates: Exercise[], slot: TemplateSlot, options: GenerateWorkoutOptions): Exercise | null {
  if (options.goal !== "powerlifting_meet" || options.currentBlock?.type !== "peak") return null;
  if (slot.role !== "heavy_primary" && slot.role !== "heavy_secondary") return null;
  const canonicalId = canonicalIdForPeakSlot(slot);
  return canonicalId ? candidates.find((exercise) => exercise.id === canonicalId) ?? null : null;
}

function canonicalIdForPeakSlot(slot: TemplateSlot): string | null {
  if (slot.patterns?.includes("horizontal_push")) return "ex-bench-press";
  if (slot.patterns?.includes("squat")) return "ex-barbell-back-squat";
  if (slot.patterns?.includes("hinge")) return "ex-deadlift";
  if (slot.patterns?.includes("vertical_push")) return "ex-military-press";
  return null;
}

function rotateRecentTierCAccessories(
  scored: Array<{ exercise: Exercise; score: number }>,
  slot: TemplateSlot,
  options: GenerateWorkoutOptions,
): Array<{ exercise: Exercise; score: number }> {
  const primaryLike = slot.role === "primary_compound" || slot.role === "heavy_primary" || slot.role === "power";
  if (primaryLike) return scored;
  const rotated = scored.filter((item) => item.exercise.tier !== "C" || !(options.recentExerciseIds?.includes(item.exercise.id) ?? false));
  return rotated.length > 0 ? rotated : scored;
}

function stablePrimaryPick(candidates: Exercise[], slot: TemplateSlot, options: GenerateWorkoutOptions): Exercise | null {
  const primaryLike = slot.role === "primary_compound" || slot.role === "heavy_primary" || slot.role === "power";
  if (!primaryLike) return null;
  return (
    candidates.find(
      (exercise) =>
        exercise.tier === "A" &&
        (options.stablePrimaryExerciseIds?.includes(exercise.id) ?? false) &&
        !(options.stalledExerciseIds?.includes(exercise.id) ?? false),
    ) ?? null
  );
}

function scoreExerciseForSlot(exercise: Exercise, slot: TemplateSlot, selected: Exercise[], options: GenerateWorkoutOptions): number {
  let score = 0;
  score += roleScore(exercise, slot.role);
  score += muscleScore(exercise, slot.muscles);
  score += slot.patterns?.includes(exercise.movementPattern) ? 25 : 0;
  score += exercise.isCustom ? 6 : 0;
  score += exercise.isBeginnerFriendly ? 3 : 0;
  score += options.experienceLevel === "beginner" && exercise.isAdvanced ? -40 : 0;
  score += tierFitScore(exercise, slot);
  score += fatigueCostPenalty(exercise, options);
  score += deloadEaseScore(exercise, options);
  score += staleExercisePenalty(exercise, options.history);
  score += structuredVariabilityScore(exercise, slot, options);
  score += progressionScore(exercise, options.history);
  score += scoreExercisePreference(exercise, options.exercisePreferences, options.referenceDate);
  score += canonicalStrengthAnchorScore(exercise, slot, options);
  score += familyRedundancyPenalty(exercise, selected);
  score += selected.some((item) => item.movementPattern === exercise.movementPattern) && exercise.movementPattern !== "isolation" ? -18 : 0;
  score += selected.some((item) => sharesPrimaryMuscle(item, exercise) && item.movementPattern === exercise.movementPattern) ? -16 : 0;
  return score;
}

function canonicalStrengthAnchorScore(exercise: Exercise, slot: TemplateSlot, options: GenerateWorkoutOptions): number {
  const blockType = options.currentBlock?.type;
  if (blockType !== "strength" && blockType !== "peak") return 0;
  if (slot.role !== "heavy_primary" && slot.role !== "heavy_secondary") return 0;
  if (exercise.id === "ex-bench-press" && slot.patterns?.includes("horizontal_push")) return 70;
  if (exercise.id === "ex-barbell-back-squat" && slot.patterns?.includes("squat")) return 70;
  if (exercise.id === "ex-deadlift" && slot.patterns?.includes("hinge")) return 70;
  if (exercise.id === "ex-military-press" && slot.patterns?.includes("vertical_push")) return 70;
  return 0;
}

function deloadEaseScore(exercise: Exercise, options: GenerateWorkoutOptions): number {
  if (options.currentBlock?.type !== "deload") return 0;
  let score = 0;
  if (exercise.kind === "machine" || exercise.kind === "cable" || exercise.kind === "bodyweight") score += 18;
  if (exercise.kind === "dumbbell" || exercise.kind === "smith") score += 8;
  if (exercise.kind === "barbell" || exercise.kind === "other") score -= 18;
  if (exercise.equipment.includes("other")) score -= 14;
  if (exercise.jointStress === "low") score += 8;
  if (exercise.jointStress === "high") score -= 12;
  if (exercise.fatigueCost === "high") score -= 14;
  if (exercise.isBeginnerFriendly) score += 10;
  if (!exercise.isBeginnerFriendly) score -= 8;
  if (exercise.isAdvanced) score -= 10;
  return score;
}

function tierFitScore(exercise: Exercise, slot: TemplateSlot): number {
  const primaryLike = slot.role === "primary_compound" || slot.role === "heavy_primary" || slot.role === "power";
  const secondaryLike = slot.role === "secondary_compound" || slot.role === "heavy_secondary" || slot.role === "strength";
  if (primaryLike) return exercise.tier === "A" ? 26 : exercise.tier === "B" ? 8 : -18;
  if (secondaryLike) return exercise.tier === "B" ? 18 : exercise.tier === "A" ? 8 : -8;
  if (slot.role === "isolation" || slot.role === "hypertrophy_maintenance") return exercise.tier === "C" ? 18 : exercise.tier === "B" ? 6 : -14;
  return 0;
}

function familyRedundancyPenalty(exercise: Exercise, selected: Exercise[]): number {
  if (selected.length === 0) return 0;
  const sameFamilyCount = selected.filter((item) => item.family === exercise.family).length;
  if (sameFamilyCount === 0) return 0;
  if (exercise.family === "squat_pattern" || exercise.family === "hip_hinge") return -34 * sameFamilyCount;
  if (exercise.tier !== "C") return -22 * sameFamilyCount;
  return -6 * sameFamilyCount;
}

function variantOffsetForSlot(slot: TemplateSlot, slotIndex: number, options: GenerateWorkoutOptions): number {
  const variant = options.variant ?? 0;
  const primaryLike = slot.role === "primary_compound" || slot.role === "heavy_primary" || slot.role === "power";
  if (primaryLike) return 0;
  if (slot.role === "isolation") return variant + slotIndex * 2;
  return variant + slotIndex;
}

function structuredVariabilityScore(exercise: Exercise, slot: TemplateSlot, options: GenerateWorkoutOptions): number {
  let score = 0;
  const primaryLike = slot.role === "primary_compound" || slot.role === "heavy_primary" || slot.role === "power";
  const recent = options.recentExerciseIds?.includes(exercise.id) ?? false;
  const stalled = options.stalledExerciseIds?.includes(exercise.id) ?? false;
  const stablePrimary = options.stablePrimaryExerciseIds?.includes(exercise.id) ?? false;
  const overused = options.overusedMuscles?.some((muscle) => [exercise.category, ...exercise.primaryMuscles, ...exercise.secondaryMuscles].includes(muscle)) ?? false;

  if (stablePrimary && primaryLike && exercise.tier === "A" && !stalled) score += 42;
  if (stablePrimary && primaryLike && !stalled) score += 20;
  if (recent) {
    if (primaryLike && exercise.tier === "A") score -= 0;
    else if (exercise.tier === "C") score -= 44;
    else score -= primaryLike ? 4 : slot.role === "isolation" ? 22 : 14;
  }
  if (stalled) score -= primaryLike ? 32 : 18;
  if (overused) score -= exercise.roles.includes("primary_compound") ? 20 : 8;
  return score;
}

type CompatibilityGeneratedSlotPrescriptionRequest = Readonly<{ exercise: Exercise; slot: TemplateSlot; options: GenerateWorkoutOptions }>;
type CompatibilityGeneratedSlotPrescription = Readonly<{ settings: ProgressionSettings; loadRecommendation: ReturnType<typeof resolveStartingLoadRecommendation> }>;

function buildCompatibilityGeneratedSlotPrescription(request: CompatibilityGeneratedSlotPrescriptionRequest): CompatibilityGeneratedSlotPrescription {
  const { exercise, slot, options } = request;
  const settings = resolveGeneratedSettings(exercise, slot, options.currentBlock, options.experienceLevel);
  const loadIncrement = resolveLoadIncrement({ exercise, equipmentProfile: options.loadIncrementProfile, unit: options.unit ?? settings.unit, context: "estimate" });
  const resolvedSettings = { ...settings, loadIncrease: loadIncrement.increment, unit: options.unit ?? settings.unit };
  const loadRecommendation = resolveStartingLoadRecommendation({ targetExercise: exercise, exercises: options.exercises, history: options.history, repRange: resolvedSettings.repRange, loadIncrement: resolvedSettings.loadIncrease, referenceDate: options.referenceDate, goal: options.goal, experienceLevel: options.experienceLevel, blockType: options.currentBlock?.type, exerciseRole: strategyRoleForSlot(exercise, slot), exerciseFamily: exercise.family, trainingLane: resolvedSettings.trainingLane, unit: resolvedSettings.unit });
  return { settings: resolvedSettings, loadRecommendation };
}

function createGeneratedSlot(exercise: Exercise, slot: TemplateSlot, plannedOrder: number, options: GenerateWorkoutOptions): ProgramExercise {
  const prescription = buildCompatibilityGeneratedSlotPrescription({ exercise, slot, options });
  const settings = prescription.settings;
  const laneCopy = settings.trainingLane ? getLanePrescriptionConstraints(settings.trainingLane).copy : "Build useful work.";
  const loadRecommendation = prescription.loadRecommendation;
  const hasGapNote = loadRecommendation.recommendationEvidence?.type === "training_gap_starting_load";
  const estimateNote = loadRecommendation.source === "same_family_estimate" && !hasGapNote ? ` ${loadRecommendation.message}` : "";
  const gapNote = hasGapNote ? ` ${loadRecommendation.message}` : "";

  return {
    id: `generated-slot-${plannedOrder}-${exercise.id}`,
    exerciseId: exercise.id,
    plannedOrder,
    suggestedLoad: loadRecommendation.load,
    settings,
    notes: `${slot.label}: ${slot.reason}. ${laneCopy} Autoregulation will cap quality sets from logged performance.${estimateNote}${gapNote}`,
  };
}

function resolveGeneratedSettings(exercise: Exercise, slot: TemplateSlot, currentBlock?: TrainingBlock | null, experienceLevel?: ExperienceLevel): ProgressionSettings {
  const decisionResult = resolveCompatibilityFinalRepLaneDecision(exercise, slot, currentBlock);
  const decision = decisionResult.status === "resolved" ? decisionResult.decision : null;
  const role = decision?.exerciseRole ?? strategyRoleForSlot(exercise, slot);
  const lane = decision?.lane ?? resolveTrainingLane({ blockType: currentBlock?.type, exerciseRole: role, exerciseFamily: exercise.family, slotRole: slot.role });
  const slotSets = setsForExperience(slot, experienceLevel);
  const prescription = resolveEvidenceBasedSlotPrescription({
    blockType: currentBlock?.type,
    slotRole: slot.role,
    exerciseRole: role,
    exerciseFamily: exercise.family,
    movementPattern: exercise.movementPattern,
    primaryMuscles: exercise.primaryMuscles,
    exerciseKind: exercise.kind,
    trainingLane: lane,
    experienceLevel,
    slotSets,
  });
  const generated = withSetPrescription({
    ...exercise.defaultSettings,
    repRange: decision?.repRange ?? getGeneratedRepRange(exercise, slot, currentBlock),
    dropOffPercent: getSafeDropOffPercent(currentBlock, exercise.defaultSettings.dropOffPercent),
    loadIncrease: exercise.defaultLoadJump,
    requiredWorkSets: slotSets,
  }, {
    blockType: currentBlock?.type,
    exerciseRole: role,
    exerciseFamily: exercise.family,
    primaryMuscles: exercise.primaryMuscles,
  }, {
    requiredSets: prescription.requiredSets,
    recommendedMinSets: prescription.recommendedMinSets,
    recommendedMaxSets: prescription.recommendedMaxSets,
    softCapSets: prescription.softCapSets,
    hardCapSets: prescription.hardCapSets,
    source: "generated",
  });
  return applyLaneSetConstraints({ ...generated, trainingLane: lane }, lane);
}

type CompatibilityFinalRepLaneDecision = Readonly<{
  schemaVersion: "v1";
  repRange: RepRange;
  lane: NonNullable<ProgressionSettings["trainingLane"]>;
  exerciseRole: ExerciseRole;
  roleSource: "explicit" | "inferred" | "default";
  prescriptionFamily: "ordinary" | "corrective" | "recovery" | "power";
  plannedOrderClass: "unknown";
  ownershipStage: "helper_resolution";
  repAuthoritySource: "block_compatibility" | "corrective_family" | "recovery_family" | "power_family" | "unavailable_in_legacy_contract";
  laneAuthoritySource: "block_compatibility" | "corrective_family" | "recovery_family" | "power_family" | "unavailable_in_legacy_contract";
  appliedRepAuthorityIdentity: string;
  appliedLaneAuthorityIdentity: string;
  collision: Readonly<{
    selectedAuthority: string;
    reasonCode: string;
    displacedAuthorities: readonly string[];
  }> | null;
  winnerRetention: "retained_at_existing_branch" | "unavailable_in_legacy_contract";
  reasonCodes: readonly string[];
  fingerprint: string;
}>;

type CompatibilityFinalRepLaneDecisionResult = Readonly<{ status: "resolved"; decision: CompatibilityFinalRepLaneDecision }> | Readonly<{ status: "invalid_input"; reasonCode: string }>;

function resolveCompatibilityFinalRepLaneDecision(exercise: Exercise, slot: TemplateSlot, currentBlock?: TrainingBlock | null): CompatibilityFinalRepLaneDecisionResult {
  const exerciseRole = strategyRoleForSlot(exercise, slot);
  const lane = resolveTrainingLane({ blockType: currentBlock?.type, exerciseRole, exerciseFamily: exercise.family, slotRole: slot.role });
  const repRange = (exercise.defaultSettings.measurementType ?? exercise.measurementType) === "duration"
    ? exercise.defaultRepRange
    : resolveRepRange({ blockType: currentBlock?.type, exerciseRole, exerciseFamily: exercise.family, movementPattern: exercise.movementPattern, exerciseDefault: exercise.defaultRepRange });
  if (!Number.isInteger(repRange.min) || !Number.isInteger(repRange.max) || repRange.min < 1 || repRange.max < repRange.min || !lane) return { status: "invalid_input", reasonCode: "final_rep_lane_decision_invalid" };
  const prescriptionFamily = exercise.roles.includes("recovery") ? "recovery" : exercise.roles.includes("corrective") ? "corrective" : exercise.roles.includes("power") || slot.role === "power" ? "power" : "ordinary";
  const roleSource: CompatibilityFinalRepLaneDecision["roleSource"] = slot.role === exerciseRole ? "explicit" : "inferred";
  const familyAuthority = prescriptionFamily === "corrective" ? "corrective_family" : prescriptionFamily === "recovery" ? "recovery_family" : prescriptionFamily === "power" ? "power_family" : "block_compatibility";
  const semantic = { schemaVersion: "v1" as const, repRange, lane, exerciseRole, roleSource, prescriptionFamily: prescriptionFamily as CompatibilityFinalRepLaneDecision["prescriptionFamily"], plannedOrderClass: "unknown" as const, ownershipStage: "helper_resolution" as const, repAuthoritySource: familyAuthority as CompatibilityFinalRepLaneDecision["repAuthoritySource"], laneAuthoritySource: familyAuthority as CompatibilityFinalRepLaneDecision["laneAuthoritySource"], appliedRepAuthorityIdentity: `production.${familyAuthority}.rep`, appliedLaneAuthorityIdentity: `production.${familyAuthority}.lane`, collision: roleSource === "inferred" ? { selectedAuthority: "inferred_role", reasonCode: "explicit_role_absent_inference_selected", displacedAuthorities: [] as readonly string[] } : null, winnerRetention: familyAuthority === "block_compatibility" && roleSource !== "inferred" ? "unavailable_in_legacy_contract" as const : "retained_at_existing_branch" as const, reasonCodes: ["production_helpers_selected_rep_and_lane"] };
  return { status: "resolved", decision: { ...semantic, fingerprint: `v1|${JSON.stringify(semantic)}` } };
}

function getGeneratedRepRange(exercise: Exercise, slot: TemplateSlot, currentBlock?: TrainingBlock | null): RepRange {
  if ((exercise.defaultSettings.measurementType ?? exercise.measurementType) === "duration") return exercise.defaultRepRange;
  return resolveRepRange({
    blockType: currentBlock?.type,
    exerciseRole: strategyRoleForSlot(exercise, slot),
    exerciseFamily: exercise.family,
    movementPattern: exercise.movementPattern,
    exerciseDefault: exercise.defaultRepRange,
  });
}

function strategyRoleForSlot(exercise: Exercise, slot: TemplateSlot): ExerciseRole {
  if (slot.role === "power" || exercise.roles.includes("power")) return "power";
  if (slot.role === "heavy_primary") return "primary_compound";
  if (slot.role === "heavy_secondary" || slot.role === "strength") return "secondary_compound";
  if (slot.role === "hypertrophy_maintenance") return "accessory";
  return slot.role;
}

function applyLaneSetConstraints(settings: ProgressionSettings, lane: NonNullable<ProgressionSettings["trainingLane"]>): ProgressionSettings {
  const required = settings.requiredSets ?? settings.requiredWorkSets;
  if (lane === "power") {
    return withSetPrescription(settings, {}, {
      requiredSets: Math.min(required, 3),
      recommendedMinSets: Math.min(settings.recommendedMinSets ?? required, 3),
      recommendedMaxSets: Math.min(settings.recommendedMaxSets ?? required + 1, 5),
      softCapSets: Math.min(settings.softCapSets ?? 5, 5),
      source: "generated",
    });
  }
  if (lane === "peak") {
    return withSetPrescription(settings, {}, {
      requiredSets: Math.min(required, 2),
      recommendedMinSets: Math.min(settings.recommendedMinSets ?? required, 2),
      recommendedMaxSets: Math.min(settings.recommendedMaxSets ?? required + 1, 4),
      softCapSets: 4,
      source: "generated",
    });
  }
  if (lane === "maintenance" || lane === "strength_support") {
    return withSetPrescription(settings, {}, {
      recommendedMaxSets: Math.min(settings.recommendedMaxSets ?? required + 2, Math.max(required + 1, 4)),
      softCapSets: Math.min(settings.softCapSets ?? 8, 6),
      source: "generated",
    });
  }
  if (lane === "recovery") {
    return withSetPrescription(settings, {}, {
      requiredSets: Math.min(required, 1),
      recommendedMinSets: Math.min(settings.recommendedMinSets ?? required, 1),
      recommendedMaxSets: Math.min(settings.recommendedMaxSets ?? required + 1, 2),
      softCapSets: Math.min(settings.softCapSets ?? 3, 3),
      source: "generated",
    });
  }
  if (lane === "strength") {
    return withSetPrescription(settings, {}, {
      recommendedMaxSets: Math.min(settings.recommendedMaxSets ?? required + 2, 5),
      softCapSets: Math.min(settings.softCapSets ?? 8, 7),
      source: "generated",
    });
  }
  return settings;
}

function getSafeDropOffPercent(currentBlock: TrainingBlock | null | undefined, fallback: number): number {
  if (!currentBlock) return fallback;
  return currentBlock.dropOffRule?.defaultDropOffPercent ?? createTrainingBlock(currentBlock.type).dropOffRule.defaultDropOffPercent ?? fallback;
}

function matchesSlotRole(exercise: Exercise, role: TemplateRole): boolean {
  if (role === "heavy_primary") return exercise.roles.includes("primary_compound");
  if (role === "heavy_secondary" || role === "strength") return exercise.roles.includes("primary_compound") || exercise.roles.includes("secondary_compound");
  if (role === "secondary_compound") return exercise.roles.includes("secondary_compound") || exercise.roles.includes("primary_compound");
  if (role === "hypertrophy_maintenance") {
    return (
      exercise.roles.includes("secondary_compound") ||
      exercise.roles.includes("isolation") ||
      exercise.roles.includes("accessory") ||
      exercise.roles.includes("corrective") ||
      exercise.roles.includes("recovery")
    );
  }
  return exercise.roles.includes(role);
}

function isCoreSlot(slot: TemplateSlot): boolean {
  return slot.muscles.includes("abs") || slot.patterns?.includes("core") === true || slot.families?.includes("core_flexion") === true || slot.families?.includes("core_stability") === true;
}

function roleScore(exercise: Exercise, role: TemplateRole): number {
  if (role === "heavy_primary") return exercise.roles.includes("primary_compound") ? 45 : 0;
  if (role === "heavy_secondary" || role === "strength") return exercise.roles.includes("primary_compound") ? 35 : exercise.roles.includes("secondary_compound") ? 30 : 0;
  if (role === "secondary_compound") return exercise.roles.includes("secondary_compound") ? 38 : exercise.roles.includes("primary_compound") ? 32 : 0;
  if (role === "hypertrophy_maintenance") return exercise.roles.includes("isolation") ? 32 : exercise.roles.includes("secondary_compound") ? 24 : 0;
  return exercise.roles.includes(role) ? 40 : 0;
}

function muscleScore(exercise: Exercise, muscles: MuscleGroup[]): number {
  let score = 0;
  for (const muscle of muscles) {
    if (exercise.primaryMuscles.includes(muscle)) score += 25;
    if (exercise.category === muscle) score += 12;
    if (exercise.secondaryMuscles.includes(muscle)) score += 6;
  }
  return score;
}

function fatigueCostPenalty(exercise: Exercise, options: GenerateWorkoutOptions): number {
  const fatiguedMuscles = Object.entries(options.recentVolumeByMuscle ?? {})
    .filter(([, sets]) => typeof sets === "number" && sets >= 16)
    .map(([muscle]) => muscle as MuscleGroup);
  if (fatiguedMuscles.length === 0) return 0;
  const touchesFatigued = touchesMuscles(exercise, fatiguedMuscles);
  if (!touchesFatigued) return 0;
  if (exercise.fatigueCost === "low") return 0;
  if (exercise.fatigueCost === "moderate") return -6;
  if (exercise.roles.includes("primary_compound")) return -20;
  if (exercise.roles.includes("secondary_compound")) return -10;
  return -3;
}

function staleExercisePenalty(exercise: Exercise, history?: WorkoutHistorySummary[]): number {
  const recentUses = history
    ?.slice(-6)
    .flatMap((summary) => summary.exerciseSummaries)
    .filter((summary) => summary.exerciseId === exercise.id).length ?? 0;
  return recentUses >= 4 ? -18 : recentUses >= 2 ? -6 : 0;
}

function progressionScore(exercise: Exercise, history?: WorkoutHistorySummary[]): number {
  const recent = history
    ?.flatMap((summary) => summary.exerciseSummaries)
    .filter((summary) => summary.exerciseId === exercise.id)
    .slice(-3) ?? [];
  if (recent.length < 2) return 0;
  const stalled = recent.filter((summary) => !summary.progressionEarned).length >= 3;
  const repeatedDropOff = recent.filter((summary) => summary.stoppedByDropOff).length >= 2;
  if (stalled || repeatedDropOff) {
    if (exercise.kind === "machine" || exercise.kind === "cable") return 6;
    return -10;
  }
  return recent.at(-1)?.progressionEarned ? 8 : 0;
}

function applyFatigueToTemplate(template: CoachingTemplate, options: GenerateWorkoutOptions): CoachingTemplate {
  const fatigued = Object.values(options.recentVolumeByMuscle ?? {}).some((sets) => typeof sets === "number" && sets >= 18);
  const repeatedDropOffs =
    options.history
      ?.slice(-4)
      .flatMap((summary) => summary.exerciseSummaries)
      .filter((summary) => summary.stoppedByDropOff).length ?? 0;
  if (!fatigued && repeatedDropOffs < 3) return template;

  const trimmedSlots = template.slots
    .map((slot) => ({
      ...slot,
      sets: Math.max(2, slot.role === "power" ? slot.sets : slot.sets - 1),
      reason: `${slot.reason} Fatigue-aware planner trimmed planned volume; logged performance still decides the final dose`,
    }))
    .filter((slot, index) => index < Math.max(3, template.slots.length - 1));

  return { ...template, slots: trimmedSlots };
}

function customTemplate(options: GenerateWorkoutOptions): CoachingTemplate {
  const muscles = options.focusMuscles?.length ? options.focusMuscles : (["chest", "back", "quads"] as MuscleGroup[]);
  return template(options.name ?? "Custom", muscles, [
    primary([muscles[0] ?? "chest"], undefined, "Primary focus"),
    secondary([muscles[1] ?? muscles[0] ?? "back"], undefined, "Secondary focus"),
    secondary([muscles[2] ?? muscles[0] ?? "quads"], undefined, "Balanced compound"),
    isolation([muscles[0] ?? "chest"], "Isolation dose"),
    isolation([muscles[1] ?? muscles[0] ?? "back"], "Accessory dose"),
  ]);
}

function getBlockFamily(block?: TrainingBlock | null): BlockFamily {
  if (!block) return "hypertrophy";
  if (block.type === "powerbuilding" || block.type === "strength_hypertrophy") return "powerbuilding";
  if (block.type === "peak") return "peak";
  if (block.type === "deload") return "deload";
  if (block.type === "strength") return "strength";
  if (block.type === "power") return "power";
  return "hypertrophy";
}

function matchesEquipment(exercise: Exercise, availableEquipment?: Equipment[]): boolean {
  if (!availableEquipment || availableEquipment.length === 0) return true;
  return exercise.equipment.some((equipment) => availableEquipment.includes(equipment));
}

function matchesExperience(exercise: Exercise, experienceLevel?: ExperienceLevel): boolean {
  if (experienceLevel === "beginner") return !exercise.isAdvanced;
  return true;
}

function matchesBlock(exercise: Exercise, currentBlock?: TrainingBlock | null): boolean {
  if (!currentBlock) return true;
  return exercise.suitableBlocks.includes(currentBlock.type) || (currentBlock.type === "powerbuilding" && exercise.suitableBlocks.includes("strength_hypertrophy"));
}

function touchesMuscles(exercise: Exercise, muscles: MuscleGroup[]): boolean {
  return [exercise.category, ...exercise.primaryMuscles, ...exercise.secondaryMuscles].some((muscle) => muscles.includes(muscle));
}

function sharesPrimaryMuscle(a: Exercise, b: Exercise): boolean {
  return a.primaryMuscles.some((muscle) => b.primaryMuscles.includes(muscle));
}

function findLastIndex<T>(items: T[], predicate: (item: T) => boolean): number {
  for (let index = items.length - 1; index >= 0; index -= 1) {
    if (predicate(items[index]!)) return index;
  }
  return -1;
}

function countForAvailableTime(minutes: number | undefined, fallback: number): number {
  if (!minutes) return fallback;
  if (minutes <= 35) return Math.min(4, fallback);
  if (minutes <= 50) return Math.min(5, fallback);
  return fallback;
}

function countForExperience(experienceLevel: ExperienceLevel | undefined, fallback: number): number {
  if (experienceLevel === "beginner") return Math.max(3, fallback - 1);
  if (experienceLevel === "advanced") return Math.min(fallback + 1, fallback >= 6 ? fallback : 7);
  return fallback;
}

function setsForExperience(slot: TemplateSlot, experienceLevel?: ExperienceLevel): number {
  if (experienceLevel === "beginner") return Math.max(2, slot.role === "isolation" ? slot.sets - 1 : Math.min(slot.sets, 3));
  if (experienceLevel === "advanced") return Math.min(slot.role === "power" ? slot.sets : slot.sets + 1, slot.role === "isolation" ? 5 : 6);
  return slot.sets;
}

function buildProgrammeNotes(blockFamily: BlockFamily, options: GenerateWorkoutOptions): string {
  const fatigueNote = Object.values(options.recentVolumeByMuscle ?? {}).some((sets) => typeof sets === "number" && sets >= 18)
    ? " Fatigue signals trimmed the plan before the workout starts."
    : "";
  const experienceNote =
    options.experienceLevel === "beginner"
      ? " Beginner setup trims complexity and starts with a longer runway."
      : options.experienceLevel === "advanced"
        ? " Advanced setup allows more work where the goal supports it."
        : "";
  return `Strategic ${blockFamily} plan. Tactical autoregulation remains the source of truth.${experienceNote}${fatigueNote}`;
}

function template(name: string, muscles: MuscleGroup[], slots: TemplateSlot[]): CoachingTemplate {
  return { name, muscles, slots };
}

function primary(muscles: MuscleGroup[], patterns: MovementPattern[] | undefined, label: string, sets = 3): TemplateSlot {
  return { role: "primary_compound", muscles, patterns, label, sets, reason: "anchors the session with the highest-value tension stimulus" };
}

function heavyPrimary(muscles: MuscleGroup[], patterns: MovementPattern[] | undefined, label: string, sets = 3): TemplateSlot {
  return { role: "heavy_primary", muscles, patterns, label, sets, reason: "keeps strength exposure crisp without deciding volume by vibes" };
}

function secondary(muscles: MuscleGroup[], patterns: MovementPattern[] | undefined, label: string, sets = 3): TemplateSlot {
  return { role: "secondary_compound", muscles, patterns, label, sets, reason: "adds productive work with a different stress angle" };
}

function heavySecondary(muscles: MuscleGroup[], patterns: MovementPattern[] | undefined, label: string, sets = 3): TemplateSlot {
  return { role: "heavy_secondary", muscles, patterns, label, sets, reason: "bridges heavy practice and hypertrophy work" };
}

function isolation(
  muscles: MuscleGroup[],
  label: string,
  sets = 3,
  avoidFamilies?: ExerciseFamily[],
  families?: ExerciseFamily[],
): TemplateSlot {
  return { role: "isolation", muscles, patterns: ["isolation", "core"], families, avoidFamilies, label, sets, reason: "adds targeted hypertrophy with lower systemic fatigue" };
}

function core(muscles: MuscleGroup[], label: string, sets = 2): TemplateSlot {
  return {
    role: "hypertrophy_maintenance",
    muscles,
    patterns: ["core"],
    families: ["core_flexion", "core_stability"],
    label,
    sets,
    reason: "keeps trunk/bracing exposure programmed instead of accidental",
  };
}

function power(
  muscles: MuscleGroup[],
  patterns: MovementPattern[] | undefined,
  label: string,
  sets = 3,
  avoidFamilies?: ExerciseFamily[],
  families?: ExerciseFamily[],
): TemplateSlot {
  return { role: "power", muscles, patterns, families, avoidFamilies, label, sets, reason: "trains speed and intent before fatigue muddies the water" };
}

function strength(muscles: MuscleGroup[], patterns: MovementPattern[] | undefined, label: string, sets = 3): TemplateSlot {
  return { role: "strength", muscles, patterns, label, sets, reason: "maintains force output while the autoregulation layer controls dose" };
}

function labelWorkoutType(type: GeneratedWorkoutType): string {
  return type
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function average(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((total, value) => total + value, 0) / values.length;
}
