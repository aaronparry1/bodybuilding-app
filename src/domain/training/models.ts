export type ID = string;

export type UnitSystem = "kg" | "lb";

export type Equipment =
  | "barbell"
  | "dumbbell"
  | "machine"
  | "cable"
  | "smith"
  | "bodyweight"
  | "bands"
  | "other";

export type BlockCompatibility =
  | "hypertrophy"
  | "powerbuilding"
  | "strength_hypertrophy"
  | "strength"
  | "power"
  | "peak"
  | "deload";

export type MuscleGroup =
  | "chest"
  | "back"
  | "quads"
  | "hamstrings"
  | "glutes"
  | "shoulders"
  | "biceps"
  | "triceps"
  | "calves"
  | "abs"
  | "forearms"
  | "traps"
  | "rear_delts"
  | "adductors"
  | "abductors";

export type MovementPattern =
  | "horizontal_push"
  | "vertical_push"
  | "horizontal_pull"
  | "vertical_pull"
  | "squat"
  | "hinge"
  | "lunge"
  | "hip_thrust"
  | "isolation"
  | "carry"
  | "core";

export type ExerciseKind =
  | "bodyweight"
  | "weighted"
  | "machine"
  | "cable"
  | "dumbbell"
  | "barbell"
  | "smith"
  | "other";

export type ExerciseRole =
  | "primary_compound"
  | "secondary_compound"
  | "accessory"
  | "isolation"
  | "power"
  | "recovery"
  | "corrective"
  | "resilience"
  | "capacity";

export type ExerciseFamily =
  | "horizontal_press"
  | "vertical_press"
  | "vertical_pull"
  | "horizontal_pull"
  | "squat_pattern"
  | "hip_hinge"
  | "hyperextension"
  | "hip_thrust"
  | "single_leg"
  | "chest_isolation"
  | "shoulder_isolation"
  | "rear_delt_corrective"
  | "triceps_isolation"
  | "biceps_isolation"
  | "calf_raise"
  | "core_flexion"
  | "core_stability"
  | "carry"
  | "olympic_power"
  | "jump_power"
  | "throw_power"
  | "quad_isolation"
  | "hamstring_isolation"
  | "glute_isolation"
  | "adductor"
  | "abductor"
  | "forearm"
  | "trap"
  | "other";

export type ExerciseTier = "A" | "B" | "C";

export type ExerciseFatigueCost = "low" | "moderate" | "high";

export type JointStressEstimate = "low" | "moderate" | "high";

export type ExerciseSuitability = "beginner" | "intermediate" | "advanced";

export type CanonicalStimulusRegion =
  | "chest"
  | "lats"
  | "upper_back"
  | "anterior_delts"
  | "lateral_delts"
  | "rear_delts"
  | "triceps"
  | "biceps"
  | "quadriceps"
  | "hamstrings_knee_flexion"
  | "hip_extension"
  | "calves"
  | "core";

export type ExerciseSelectionProfile = "general" | "stable_hypertrophy" | "technique_variation" | "strength_specialist";

export type TrainingLane =
  | "hypertrophy"
  | "hypertrophy_strength"
  | "strength"
  | "strength_support"
  | "power"
  | "peak"
  | "maintenance"
  | "recovery";

export interface RepRange {
  min: number;
  max: number;
}

export type ExerciseMeasurementType = "reps" | "duration";

export interface ProgressionSettings {
  repRange: RepRange;
  measurementType?: ExerciseMeasurementType;
  durationIncreaseSeconds?: number;
  dropOffPercent: number;
  loadIncrease: number;
  unit: UnitSystem;
  requiredWorkSets: number;
  requiredSets?: number;
  recommendedMinSets?: number;
  recommendedMaxSets?: number;
  softCapSets?: number;
  hardCapSets?: number;
  setRangeSource?: "generated" | "productive_target" | "volume_adjustment" | "legacy";
  volumeCoachingIntent?: "bias_high" | "bias_low";
  trainingLane?: TrainingLane;
}

export interface Exercise {
  id: ID;
  name: string;
  category: MuscleGroup;
  primaryMuscles: MuscleGroup[];
  secondaryMuscles: MuscleGroup[];
  equipment: Equipment[];
  movementPattern: MovementPattern;
  defaultRepRange: RepRange;
  measurementType?: ExerciseMeasurementType;
  defaultLoadJump: number;
  unitCompatibility: UnitSystem[];
  kind: ExerciseKind;
  role: ExerciseRole;
  roles: ExerciseRole[];
  family: ExerciseFamily;
  tier: ExerciseTier;
  fatigueCost: ExerciseFatigueCost;
  jointStress: JointStressEstimate;
  suitability: ExerciseSuitability[];
  /** Factual selection metadata. These fields describe the exercise; they do not prescribe a programme. */
  stability?: "low" | "moderate" | "high";
  skillDemand?: "low" | "moderate" | "high";
  loadability?: "low" | "moderate" | "high";
  selectionProfile?: ExerciseSelectionProfile;
  hypertrophyBias?: "lengthened" | "neutral" | "shortened";
  stimulusProfile?: Readonly<{
    direct: CanonicalStimulusRegion[];
    meaningfulSecondary: CanonicalStimulusRegion[];
  }>;
  primaryLift?: "bench" | "squat" | "deadlift";
  isBeginnerFriendly: boolean;
  isAdvanced: boolean;
  notes: string[];
  suitableBlocks: BlockCompatibility[];
  macrocycleEngines?: Array<"hypertrophy" | "powerbuilding" | "strength" | "athletic_performance">;
  mesocycleEligibility?: string[];
  sessionRoleEligibility?: string[];
  setMethodEligibility?: string[];
  competitionLift?: boolean;
  swapTags: string[];
  createdByUserId?: ID | null;
  isCustom: boolean;
  defaultSettings: ProgressionSettings;
}

export interface ProgramExercise {
  id: ID;
  exerciseId: ID;
  plannedOrder: number;
  settings: ProgressionSettings;
  suggestedLoad?: number;
  notes?: string;
}

export interface SessionTemplate {
  id: ID;
  name: string;
  exerciseSlots: ProgramExercise[];
  equipmentAvailable: Equipment[];
  notes?: string;
}

export type ProgrammeGoal = "hypertrophy" | "strength_hypertrophy" | "beginner_hypertrophy" | "body_recomposition";
export type ExperienceLevel = "beginner" | "intermediate" | "advanced";

export interface Programme {
  id: ID;
  name: string;
  description: string;
  goal: ProgrammeGoal;
  experienceLevel: ExperienceLevel;
  daysPerWeek: number;
  days: SessionTemplate[];
  notes?: string;
  createdByUserId?: ID | null;
  isCustom: boolean;
  isPreset: boolean;
}

export interface SetLog {
  id: ID;
  setNumber: number;
  reps: number;
  load: number;
  loggedAt: string;
  type?: "warmup" | "work";
}

export interface NextLoadApproval {
  status: "approved" | "kept";
  recommendedLoad: number;
  approvedLoad: number;
  reason: string;
  reviewedAt: string;
}

/** Exact executable targets for an already-constructed planned workout. */
export type ExactPrescribedSetTargets = number[];

export interface WorkoutExerciseLog {
  id: ID;
  exerciseId: ID;
  exerciseName: string;
  settings: ProgressionSettings;
  load: number;
  loadKnown?: boolean;
  /** Exact working-set targets from the prescribed-performance progression system. */
  prescribedSetTargets?: ExactPrescribedSetTargets;
  loadEstablishedFromLoggedWorkSet?: boolean;
  sets: SetLog[];
  status: "active" | "complete" | "shutdown" | "swapped";
  origin?: "planned" | "added_during_workout";
  shutdownReason?: string;
  swappedFromExerciseId?: ID;
  swappedFromExerciseName?: string;
  swappedToExerciseId?: ID;
  swappedToExerciseName?: string;
  swapHistory?: SwappedExerciseRecord[];
  nextLoadApproval?: NextLoadApproval;
  finishedManually?: boolean;
  finishReason?: ManualExerciseFinishReason;
  finishedAt?: string;
  finishType?: "manual_completion" | "manual_shutdown";
  removedFutureWorkSetNumbers?: number[];
  notes?: string;
}

export type ManualExerciseFinishReason =
  | "completed_enough"
  | "fatigue_performance"
  | "pain_limitation"
  | "equipment_unavailable"
  | "taking_it_easy"
  | "out_of_time";

export interface SwappedExerciseRecord {
  exerciseId: ID;
  exerciseName: string;
  settings: ProgressionSettings;
  load: number;
  loadKnown?: boolean;
  sets: SetLog[];
  status: WorkoutExerciseLog["status"];
  swappedToExerciseId: ID;
  swappedToExerciseName: string;
  nextLoadApproval?: NextLoadApproval;
  notes?: string;
}

export type CardioSessionKind = "recovery_cardio" | "capacity_cardio" | "performance_conditioning";
export type CardioModality =
  | "incline_walk"
  | "outdoor_walk"
  | "bike"
  | "rower"
  | "ski_erg"
  | "assault_bike"
  | "sled_push"
  | "run"
  | "sport_conditioning"
  | "other";
export type CardioEase = "easy" | "moderate" | "hard";

export interface CardioSessionLog {
  sessionType: CardioSessionKind;
  modality: CardioModality;
  durationMinutes: number;
  distance?: number;
  perceivedEase?: CardioEase;
  notes?: string;
  loggedAt: string;
}

export type WorkoutSessionKind = "planned" | "custom" | "extra_full" | "extra_volume" | "extra_capacity" | CardioSessionKind;

export interface WorkoutSession {
  id: ID;
  userId?: ID | null;
  templateId?: ID;
  programmeId?: ID;
  planSessionIndex?: number;
  planMesocycleId?: string;
  planMicrocycleNumber?: number;
  planBlockId?: ID;
  planWeekNumber?: number;
  sessionKind?: WorkoutSessionKind;
  name: string;
  startedAt: string;
  completedAt?: string;
  exercises: WorkoutExerciseLog[];
  cardioLog?: CardioSessionLog;
  syncState: "local" | "queued" | "synced" | "conflict";
  updatedAt: string;
  notes?: string;
}

export interface ExerciseHistorySummary {
  sessionId?: ID;
  sessionName?: string;
  completedAt?: string;
  exerciseLogId: ID;
  exerciseId: ID;
  exerciseName: string;
  load: number;
  unit: UnitSystem;
  measurementType?: ExerciseMeasurementType;
  /** Stored set-ordinal prescription when this summary came from a planned workout. */
  prescribedSetTargets?: ExactPrescribedSetTargets;
  prescriptionSource?: "stored_exact" | "compatibility";
  repRange?: { min: number; max: number };
  setsCompleted: number;
  repsCompleted: number;
  qualitySets: number;
  bestSetReps: number;
  dropOffThreshold: number;
  stoppedByDropOff: boolean;
  progressionEarned: boolean;
  nextRecommendedLoad: number;
  trainingLane?: TrainingLane;
  nextLoadApprovalStatus?: NextLoadApproval["status"];
  volumeLoad: number;
  loadIncrement?: number;
  loadIncrementSource?: "exercise_override" | "session_settings" | "fallback";
  equipment?: Equipment[];
  equipmentSignature?: string;
  calibrationSetupKey?: string;
  swappedFromExerciseId?: ID;
  swappedFromExerciseName?: string;
  swappedToExerciseId?: ID;
  swappedToExerciseName?: string;
  addedDuringWorkout?: boolean;
  finishedManually?: boolean;
  finishReason?: ManualExerciseFinishReason;
  finishType?: "manual_completion" | "manual_shutdown";
  notes?: string;
}

export interface WorkoutHistorySummary {
  sessionId: ID;
  userId?: ID | null;
  programmeId?: ID;
  programmeDayId?: ID;
  planSessionIndex?: number;
  planMesocycleId?: string;
  planMicrocycleNumber?: number;
  planBlockId?: ID;
  planWeekNumber?: number;
  sessionKind?: WorkoutSession["sessionKind"];
  sessionName: string;
  startedAt: string;
  completedAt: string;
  durationMinutes: number;
  exercisesCompleted: number;
  setsCompleted: number;
  repsCompleted: number;
  totalLoadVolume: number;
  progressionHighlights: string[];
  exerciseSummaries: ExerciseHistorySummary[];
  cardioLog?: CardioSessionLog;
  notes?: string;
}

export interface UserTrainingSettings {
  unit: UnitSystem;
  defaultDropOffPercent: number;
  defaultLoadIncreaseKg: number;
  defaultLoadIncreaseLb: number;
  equipmentAvailable: Equipment[];
}
