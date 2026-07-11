import type { ExerciseFamily } from "@/domain/training/models";
import { getMovementGuide, type MovementGuide } from "@/domain/training/prep-capacity-guides";
import { trainingPreparationSafetyCopy } from "@/domain/training/session-prep";

export type CapacityFocusArea = "low_back" | "hips" | "ankles" | "shoulders" | "neck";
export type CapacityFocusLevel = 1 | 2 | 3;
export type CapacityAdaptationBucket =
  | "bracing_trunk_stiffness"
  | "anti_extension_flexion"
  | "anti_rotation_lateral_flexion"
  | "hip_extension_posterior_chain"
  | "pelvic_single_leg_control"
  | "progressive_load_exposure";

export type CapacityFocusSettings = Record<CapacityFocusArea, boolean>;

export interface CapacityExercise {
  name: string;
  dose: string;
  note: string;
  bucket: CapacityAdaptationBucket;
  progression: string;
  optional?: boolean;
  guide: MovementGuide;
}

export interface CapacityRoutine {
  id: string;
  area: CapacityFocusArea;
  level: CapacityFocusLevel;
  name: string;
  purpose: string;
  frequency: string;
  durationMinutes: number;
  exercises: CapacityExercise[];
  progressionNotes: string[];
  safetyCopy: string[];
}

export interface CapacityFocusRecord {
  id: string;
  area: CapacityFocusArea;
  level: CapacityFocusLevel;
  routineId: string;
  status: "completed";
  durationMinutes: number;
  createdAt: string;
  completedAt: string;
}

export const capacityFocusAreas: CapacityFocusArea[] = ["low_back", "hips", "ankles", "shoulders", "neck"];

export const defaultCapacityFocusSettings: CapacityFocusSettings = {
  low_back: false,
  hips: false,
  ankles: false,
  shoulders: false,
  neck: false,
};

export const hyperextensionFamily: ExerciseFamily = "hyperextension";

const lowBackRoutines: CapacityRoutine[] = [
  {
    id: "capacity-low-back-foundation-control",
    area: "low_back",
    level: 1,
    name: "Low Back Foundation",
    purpose: "Build trunk control, hip support, and low-fatigue movement tolerance for more consistent training.",
    frequency: "1-2 exposures per week",
    durationMinutes: 6,
    exercises: [
      capacityExercise("Dead Bug", "2 x 5 each side", "Brace gently and keep the ribs stacked.", "bracing_trunk_stiffness", "Add reach distance or slow pauses before adding reps."),
      capacityExercise("Side Plank", "2 x 10-20 sec each side", "Resist side-bending without chasing long holds.", "anti_rotation_lateral_flexion", "Add clean hold time before harder variations."),
      capacityExercise("Glute Bridge", "2 x 8-12 reps", "Use the hips to support the hinge pattern.", "hip_extension_posterior_chain", "Add reps or a longer top pause before load."),
    ],
    progressionNotes: [
      "Default frequency: 1-2x/week.",
      "Progress control, time, and reps before load.",
      "Keep the dose easy enough that main training is not affected.",
    ],
    safetyCopy: trainingPreparationSafetyCopy,
  },
  {
    id: "capacity-low-back-control-tolerance",
    area: "low_back",
    level: 2,
    name: "Low Back Capacity",
    purpose: "Build trunk control, hip support, and load tolerance for more consistent training.",
    frequency: "1-2 exposures per week",
    durationMinutes: 8,
    exercises: [
      capacityExercise("McGill Curl Up", "3 x 5-8 sec", "Short holds with a clean brace.", "bracing_trunk_stiffness", "Add hold quality before total time."),
      capacityExercise("Pallof Press", "2 x 8-10 each side", "Resist rotation with light tension.", "anti_rotation_lateral_flexion", "Step slightly farther from the anchor before adding load."),
      capacityExercise("Single Leg Glute Bridge", "2 x 6-10 each side", "Keep pelvis level while the hip extends.", "hip_extension_posterior_chain", "Add reps or a pause before load."),
      capacityExercise("Reverse Step Up", "1-2 x 6-8 each side", "Use easy single-leg control without fatigue.", "pelvic_single_leg_control", "Add range or reps before load.", true),
    ],
    progressionNotes: [
      "Default frequency: 1-2x/week.",
      "Progress by time, control, reps, range, or light resistance.",
      "Hold the dose if capacity work starts to interfere with lower-body training.",
    ],
    safetyCopy: trainingPreparationSafetyCopy,
  },
  {
    id: "capacity-low-back-load-tolerance",
    area: "low_back",
    level: 3,
    name: "Low Back Load Tolerance",
    purpose: "Use conservative posterior-chain and carry exposure to build repeatable training tolerance.",
    frequency: "1-2 exposures per week; optional 3rd very low-dose exposure only",
    durationMinutes: 10,
    exercises: [
      capacityExercise("Front Plank", "2 x 15-30 sec", "Brace without holding past clean position.", "bracing_trunk_stiffness", "Add clean time before harder variations."),
      capacityExercise("Pallof Press", "2 x 8-10 each side", "Keep trunk quiet against rotation.", "anti_rotation_lateral_flexion", "Add distance from the anchor before resistance."),
      capacityExercise("Back Extension", "2 x 8-12 reps", "Move through the hips, not a hard low-back arch.", "hip_extension_posterior_chain", "Add reps before load."),
      capacityExercise("Full Range Split Squat", "1-2 x 5-8 each side", "Build pelvic control without turning it into leg day.", "pelvic_single_leg_control", "Add range or reps before load.", true),
      capacityExercise("Suitcase Carry", "2 x 20-30 m each side", "Light loaded exposure. Walk tall.", "progressive_load_exposure", "Add distance before load.", true),
    ],
    progressionNotes: [
      "Use progressive load exposure conservatively.",
      "Add distance, reps, range, or control before load.",
      "Do not stack multiple loaded tolerance movements in the same session.",
    ],
    safetyCopy: trainingPreparationSafetyCopy,
  },
];

const allRoutines = [...lowBackRoutines];

export function normalizeCapacityFocusSettings(settings?: Partial<CapacityFocusSettings> | null): CapacityFocusSettings {
  return {
    ...defaultCapacityFocusSettings,
    ...settings,
  };
}

export function listCapacityRoutines(area?: CapacityFocusArea): CapacityRoutine[] {
  return area ? allRoutines.filter((routine) => routine.area === area) : allRoutines;
}

export function isCapacityRoutineImplemented(routine: CapacityRoutine): boolean {
  return routine.area === "low_back";
}

export function listComingSoonCapacityRoutines(): CapacityRoutine[] {
  return [];
}

export function getCapacityRoutine(area: CapacityFocusArea, level: CapacityFocusLevel): CapacityRoutine {
  const routines = listCapacityRoutines(area);
  return routines.find((routine) => routine.level === level) ?? routines[0] ?? lowBackRoutines[1]!;
}

export function listEnabledCapacityRoutines(settings?: Partial<CapacityFocusSettings> | null): CapacityRoutine[] {
  const normalized = normalizeCapacityFocusSettings(settings);
  return allRoutines.filter((routine) => normalized[routine.area] && isCapacityRoutineImplemented(routine));
}

export function buildCapacityFocusRecord(input: { routine: CapacityRoutine; now?: Date }): CapacityFocusRecord {
  const now = input.now ?? new Date();
  const timestamp = now.toISOString();
  return {
    id: `capacity-${input.routine.id}-${now.getTime()}`,
    area: input.routine.area,
    level: input.routine.level,
    routineId: input.routine.id,
    status: "completed",
    durationMinutes: input.routine.durationMinutes,
    createdAt: timestamp,
    completedAt: timestamp,
  };
}

function capacityExercise(
  name: string,
  dose: string,
  note: string,
  bucket: CapacityAdaptationBucket,
  progression: string,
  optional = false,
): CapacityExercise {
  return {
    name,
    dose,
    note,
    bucket,
    progression,
    optional,
    guide: getMovementGuide(name),
  };
}
