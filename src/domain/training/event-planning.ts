import type { ExperienceLevel } from "@/domain/training/models";
import type { TrainingEventType } from "@/domain/training/training-commitment";
import type { TrainingGoalId } from "@/domain/training/training-goals";

export type EventPlanStatus = "ready" | "unsupported_event_type" | "not_enough_time" | "incompatible_goal_for_powerlifting_meet";
export type EventPlanTrainingPhase =
  | "accumulation"
  | "strength_development"
  | "strength_accumulation"
  | "intensification_specificity"
  | "peak_taper"
  | "short_peak_taper";
export type EventPlanWarning =
  | "short_meet_prep_window"
  | "insufficient_meet_prep_time"
  | "unsupported_event_type"
  | "incompatible_goal_for_powerlifting_meet"
  | "experience_affects_execution_later";

export interface EventPlanningInput {
  trainingGoal: TrainingGoalId;
  eventType: TrainingEventType;
  targetDate: string;
  startDate: string;
  trainingDaysPerWeek: number;
  trainingExperience: ExperienceLevel;
}

export interface EventPlanSkeleton {
  planningMode: "event_driven";
  eventType: TrainingEventType;
  targetDate: string;
  startDate: string;
  totalWeeks: number;
  phases: EventPlanPhase[];
  currentPhase?: EventPlanPhase;
  warnings: EventPlanWarning[];
  confidence: number;
  status: EventPlanStatus;
  requiresManualPlanning?: boolean;
  trainingDaysPerWeek: number;
  trainingExperience: ExperienceLevel;
}

export interface EventPlanPhase {
  phaseId: string;
  displayName: string;
  startWeek: number;
  endWeek: number;
  durationWeeks: number;
  trainingPhase: EventPlanTrainingPhase;
  objective: string;
  mandatory: true;
  adaptiveExecutionAllowed: true;
  rationale: string;
}

const powerliftingCompatibleGoals: TrainingGoalId[] = ["get_stronger", "build_muscle_strength"];

export function createEventPlanSkeleton(input: EventPlanningInput): EventPlanSkeleton {
  const totalWeeks = weeksBetween(input.startDate, input.targetDate);
  const base = {
    planningMode: "event_driven" as const,
    eventType: input.eventType,
    targetDate: input.targetDate,
    startDate: input.startDate,
    totalWeeks,
    trainingDaysPerWeek: clampTrainingDays(input.trainingDaysPerWeek),
    trainingExperience: input.trainingExperience,
  };

  if (input.eventType !== "powerlifting_meet") {
    return manualPlan({
      ...base,
      status: "unsupported_event_type",
      warnings: ["unsupported_event_type", "experience_affects_execution_later"],
      confidence: 62,
    });
  }

  if (!powerliftingCompatibleGoals.includes(input.trainingGoal)) {
    return manualPlan({
      ...base,
      status: "incompatible_goal_for_powerlifting_meet",
      warnings: ["incompatible_goal_for_powerlifting_meet", "experience_affects_execution_later"],
      confidence: 64,
    });
  }

  if (totalWeeks < 4) {
    return manualPlan({
      ...base,
      status: "not_enough_time",
      warnings: ["insufficient_meet_prep_time", "experience_affects_execution_later"],
      confidence: 58,
    });
  }

  const phaseSpecs = powerliftingPhaseSpecs(totalWeeks);
  const phases = buildPhases(phaseSpecs);

  return {
    ...base,
    phases,
    currentPhase: phases[0],
    warnings: [...(totalWeeks <= 7 ? ["short_meet_prep_window" as const] : []), "experience_affects_execution_later"],
    confidence: totalWeeks >= 8 ? 86 : 74,
    status: "ready",
  };
}

function manualPlan(
  input: Omit<EventPlanSkeleton, "phases" | "currentPhase" | "requiresManualPlanning"> & { status: Exclude<EventPlanStatus, "ready"> },
): EventPlanSkeleton {
  return {
    ...input,
    phases: [],
    requiresManualPlanning: true,
  };
}

function powerliftingPhaseSpecs(totalWeeks: number): Array<{ trainingPhase: EventPlanTrainingPhase; durationWeeks: number }> {
  if (totalWeeks >= 20) {
    const peak = totalWeeks >= 24 ? 3 : 2;
    const accumulation = Math.round(totalWeeks * 0.38);
    const strength = Math.round(totalWeeks * 0.32);
    return withFinalDuration([
      { trainingPhase: "accumulation", durationWeeks: accumulation },
      { trainingPhase: "strength_development", durationWeeks: strength },
      { trainingPhase: "intensification_specificity", durationWeeks: Math.max(1, totalWeeks - accumulation - strength - peak) },
      { trainingPhase: "peak_taper", durationWeeks: peak },
    ], totalWeeks);
  }

  if (totalWeeks >= 12) {
    const peak = totalWeeks >= 16 ? 3 : 2;
    const strength = Math.round(totalWeeks * 0.4);
    return withFinalDuration([
      { trainingPhase: "strength_accumulation", durationWeeks: strength },
      { trainingPhase: "intensification_specificity", durationWeeks: Math.max(1, totalWeeks - strength - peak) },
      { trainingPhase: "peak_taper", durationWeeks: peak },
    ], totalWeeks);
  }

  if (totalWeeks >= 8) {
    const peak = 3;
    return withFinalDuration([
      { trainingPhase: "intensification_specificity", durationWeeks: totalWeeks - peak },
      { trainingPhase: "peak_taper", durationWeeks: peak },
    ], totalWeeks);
  }

  return [{ trainingPhase: "short_peak_taper", durationWeeks: totalWeeks }];
}

function withFinalDuration<T extends { durationWeeks: number }>(phases: T[], totalWeeks: number): T[] {
  const usedBeforeFinal = phases.slice(0, -1).reduce((sum, phase) => sum + phase.durationWeeks, 0);
  const final = phases[phases.length - 1];
  if (!final) return phases;
  return [...phases.slice(0, -1), { ...final, durationWeeks: Math.max(1, totalWeeks - usedBeforeFinal) }];
}

function buildPhases(specs: Array<{ trainingPhase: EventPlanTrainingPhase; durationWeeks: number }>): EventPlanPhase[] {
  let nextStartWeek = 1;
  return specs.map((spec) => {
    const startWeek = nextStartWeek;
    const endWeek = startWeek + spec.durationWeeks - 1;
    nextStartWeek = endWeek + 1;
    return {
      phaseId: spec.trainingPhase,
      displayName: displayNameForPhase(spec.trainingPhase),
      startWeek,
      endWeek,
      durationWeeks: spec.durationWeeks,
      trainingPhase: spec.trainingPhase,
      objective: objectiveForPhase(spec.trainingPhase),
      mandatory: true,
      adaptiveExecutionAllowed: true,
      rationale: rationaleForPhase(spec.trainingPhase),
    };
  });
}

function weeksBetween(startDate: string, targetDate: string): number {
  const start = new Date(startDate).getTime();
  const target = new Date(targetDate).getTime();
  if (!Number.isFinite(start) || !Number.isFinite(target)) return 0;
  return Math.max(0, Math.floor((target - start) / 604_800_000));
}

function clampTrainingDays(days: number): number {
  return Math.max(2, Math.min(6, Math.round(days)));
}

function displayNameForPhase(phase: EventPlanTrainingPhase): string {
  const names: Record<EventPlanTrainingPhase, string> = {
    accumulation: "Accumulation",
    strength_development: "Strength Development",
    strength_accumulation: "Strength Accumulation",
    intensification_specificity: "Intensification & Specificity",
    peak_taper: "Peak & Taper",
    short_peak_taper: "Short Peak & Taper",
  };
  return names[phase];
}

function objectiveForPhase(phase: EventPlanTrainingPhase): string {
  const objectives: Record<EventPlanTrainingPhase, string> = {
    accumulation: "Build muscle, work capacity, and technical base before meet-specific loading narrows.",
    strength_development: "Develop the strength base while preserving repeatable competition-lift practice.",
    strength_accumulation: "Build strength capacity quickly without skipping specificity.",
    intensification_specificity: "Increase competition-lift specificity and reduce non-essential fatigue.",
    peak_taper: "Express strength while reducing fatigue into the fixed meet date.",
    short_peak_taper: "Prioritise readiness, specificity, and fatigue reduction in a short runway.",
  };
  return objectives[phase];
}

function rationaleForPhase(phase: EventPlanTrainingPhase): string {
  const rationales: Record<EventPlanTrainingPhase, string> = {
    accumulation: "Long meet preps can afford a base-building phase before intensification.",
    strength_development: "The middle of a long prep should convert base work into stronger, more specific performance.",
    strength_accumulation: "A moderate runway needs strength-first work earlier because time is limited.",
    intensification_specificity: "Powerlifting performance depends on specific squat, bench, and deadlift readiness.",
    peak_taper: "A meet plan must finish with a mandatory peak and taper; adaptation may adjust execution but not skip it.",
    short_peak_taper: "With only a few weeks, new adaptation is limited; readiness and fatigue control matter most.",
  };
  return rationales[phase];
}
