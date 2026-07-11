import type { BlockCompatibility, ID, MuscleGroup, RepRange } from "@/domain/training/models";

export type BlockType = BlockCompatibility;

export type BlockGoal =
  | "build_muscle"
  | "bridge_strength_hypertrophy"
  | "increase_force_production"
  | "rate_of_force_development"
  | "express_strength"
  | "restore_performance";

export type VolumeEmphasis = "very_low" | "low" | "moderate" | "moderate_high" | "high";
export type IntensityEmphasis = "low_moderate" | "moderate" | "moderate_high" | "high" | "very_high";
export type StopRuleType = "rep_drop_off" | "speed_drop_off" | "planned_test" | "recovery";
export type BlockStatus = "planned" | "active" | "completed";

export interface BlockDropOffRule {
  type: StopRuleType;
  defaultDropOffPercent: number;
  range?: {
    min: number;
    max: number;
  };
  note: string;
}

export interface BlockProgressionRule {
  type: "double_progression" | "load_progression" | "speed_intent" | "test_expression" | "fatigue_reduction";
  description: string;
}

export interface BlockWeek {
  weekNumber: number;
  focus: string;
  startsAt?: string;
  completedAt?: string;
  notes?: string;
}

export interface BlockExercisePrescription {
  id: ID;
  exerciseId?: ID;
  muscleGroup?: MuscleGroup;
  repRange: RepRange;
  dropOffRule: BlockDropOffRule;
  volumeEmphasis: VolumeEmphasis;
  progressionRule: BlockProgressionRule;
  notes?: string;
}

export interface TrainingBlock {
  id: ID;
  name: string;
  type: BlockType;
  goal: BlockGoal;
  durationWeeks: number;
  currentWeek: number;
  repRange: RepRange;
  mainRepRange: RepRange;
  secondaryRepRange: RepRange;
  accessoryRepRange: RepRange;
  hypertrophyAccessoryRepRange: RepRange;
  hypertrophyShare: number;
  strengthShare: number;
  powerShare: number;
  volumeEmphasis: VolumeEmphasis;
  intensityEmphasis: IntensityEmphasis;
  dropOffRule: BlockDropOffRule;
  progressionRule: BlockProgressionRule;
  weeks: BlockWeek[];
  prescriptions: BlockExercisePrescription[];
  status: BlockStatus;
  startedAt?: string;
  completedAt?: string;
  notes: string[];
}

export interface TrainingYear {
  id: ID;
  name: string;
  startedAt: string;
  currentBlockId: ID;
  blocks: TrainingBlock[];
  status: "active" | "completed";
}

export interface AnnualPlan {
  id: ID;
  name: string;
  description: string;
  repeatable: boolean;
  blocks: TrainingBlock[];
}

export type DeloadTriggerType =
  | "best_set_drop"
  | "quality_set_collapse"
  | "repeated_early_drop_offs"
  | "worsening_performance_trend"
  | "bar_speed_decline"
  | "recovery_marker";

export type TriggerSeverity = "low" | "moderate" | "high";

export interface DeloadTrigger {
  type: DeloadTriggerType;
  active: boolean;
  severity: TriggerSeverity;
  message: string;
  evidence?: string;
}

export type BlockRecommendationAction =
  | "continue_block"
  | "hold_course"
  | "reduce_load"
  | "reduce_volume"
  | "deload_next_week"
  | "end_block_early";

export interface BlockRecommendation {
  action: BlockRecommendationAction;
  triggers: DeloadTrigger[];
  message: string;
  nextBlockType?: BlockType;
}

export interface BlockPerformanceSnapshot {
  sessionId: ID;
  completedAt: string;
  bestSetReps: number;
  qualitySets: number;
  stoppedByDropOff: boolean;
  earlyDropOff?: boolean;
  barSpeedScore?: number;
  recoveryMarkers?: {
    poorSleep?: boolean;
    jointPain?: boolean;
    motivationCrash?: boolean;
    stagnation?: boolean;
  };
}
