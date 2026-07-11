import type { ExperienceLevel } from "@/domain/training/models";
import type { TrainingSetupGoal } from "@/domain/training/plan-setup";

export type MacrocyclePhase = "calibration" | "foundation" | "general_preparation" | "accumulation" | "hypertrophy_bias" | "strength_accumulation" | "transmutation" | "intensification" | "specific_preparation" | "pre_competition" | "realisation" | "taper" | "consolidation" | "transition" | "recovery";
export type MacrocycleEngineId = "hypertrophy" | "powerbuilding" | "strength" | "athletic_performance";
export interface MacrocyclePhaseSpec { phase: MacrocyclePhase; minWeeks: number; maxWeeks: number; emphasis: string; }
export interface MacrocycleSpec { goal: TrainingSetupGoal; phases: MacrocyclePhaseSpec[]; rolling: boolean; targetDate?: string; }

export function macrocycleEngineForGoal(goal: TrainingSetupGoal): MacrocycleEngineId {
  if (goal === "build_muscle") return "hypertrophy";
  if (goal === "build_muscle_and_strength") return "powerbuilding";
  if (goal === "build_strength" || goal === "powerlifting_meet") return "strength";
  return "athletic_performance";
}

export function createMacrocycle(goal: TrainingSetupGoal, experience: ExperienceLevel, targetDate?: string, createdAt = new Date().toISOString()): MacrocycleSpec {
  const beginner = experience === "beginner";
  const engine = macrocycleEngineForGoal(goal);
  const phases: MacrocyclePhaseSpec[] = engine === "hypertrophy" ? [
    { phase: "calibration", minWeeks: 1, maxWeeks: 2, emphasis: "Establish exercises, loads and recoverability." },
    { phase: "accumulation", minWeeks: beginner ? 4 : 3, maxWeeks: 6, emphasis: "Build productive muscle-specific volume." },
    { phase: "consolidation", minWeeks: 2, maxWeeks: 4, emphasis: "Retain muscle and restore strength expression." },
    { phase: "transition", minWeeks: 1, maxWeeks: 2, emphasis: "Recover before the next productive cycle." },
  ] : engine === "powerbuilding" ? [
    { phase: "foundation", minWeeks: 2, maxWeeks: 4, emphasis: "Establish coordinated muscle and main-lift work." },
    { phase: "hypertrophy_bias", minWeeks: 4, maxWeeks: 8, emphasis: "Prioritise muscle while retaining squat, bench and deadlift." },
    { phase: "strength_accumulation", minWeeks: 4, maxWeeks: 6, emphasis: "Increase main-lift specificity while retaining muscle." },
    { phase: "intensification", minWeeks: 3, maxWeeks: 5, emphasis: "Express heavier specific performance with lower fatigue." },
    { phase: "realisation", minWeeks: 1, maxWeeks: 2, emphasis: "Test or express the adaptation." },
    { phase: "transition", minWeeks: 1, maxWeeks: 2, emphasis: "Recover before the next cycle." },
  ] : engine === "strength" ? [
    { phase: "general_preparation", minWeeks: 3, maxWeeks: 6, emphasis: "Build work capacity, muscle and movement tolerance." },
    { phase: "strength_accumulation", minWeeks: 4, maxWeeks: 8, emphasis: "Build force capacity and lift-relevant volume." },
    { phase: "transmutation", minWeeks: 3, maxWeeks: 6, emphasis: "Convert general strength to specific lift performance." },
    { phase: "intensification", minWeeks: 2, maxWeeks: 4, emphasis: "Practice heavy specific work while reducing fatigue." },
    { phase: "taper", minWeeks: 1, maxWeeks: 2, emphasis: "Express strength without detraining." },
    { phase: "transition", minWeeks: 1, maxWeeks: 3, emphasis: "Recover physically and psychologically." },
  ] : [
    { phase: "general_preparation", minWeeks: 3, maxWeeks: 6, emphasis: "Build general strength, movement competency and work capacity." },
    { phase: "specific_preparation", minWeeks: 3, maxWeeks: 6, emphasis: "Develop power and athletic qualities without sport-specific claims." },
    { phase: "pre_competition", minWeeks: 2, maxWeeks: 4, emphasis: "Prioritise speed and power quality with lower nonspecific volume." },
    { phase: "transition", minWeeks: 1, maxWeeks: 2, emphasis: "Restore before the next rolling development cycle." },
  ];
  return { goal, phases: targetDate ? reverseEngineerToDate(phases, targetDate, createdAt) : phases, rolling: !targetDate, targetDate };
}

function reverseEngineerToDate(phases: MacrocyclePhaseSpec[], targetDate: string, createdAt: string): MacrocyclePhaseSpec[] {
  const availableWeeks = Math.max(1, Math.floor((new Date(targetDate).getTime() - new Date(createdAt).getTime()) / 604_800_000));
  if (!Number.isFinite(availableWeeks)) return phases;
  const minimumWeeks = phases.reduce((total, phase) => total + phase.minWeeks, 0);
  if (availableWeeks >= phases.reduce((total, phase) => total + phase.maxWeeks, 0)) return phases;

  // Allocate from the performance endpoint backwards: taper/realisation retains its
  // minimum first; earlier development phases receive any remaining available time.
  let remaining = Math.max(availableWeeks, minimumWeeks);
  return phases.map((phase) => ({ ...phase, maxWeeks: phase.minWeeks })).map((phase, index, all) => {
    const laterMinimum = all.slice(index + 1).reduce((total, item) => total + item.minWeeks, 0);
    const capacity = phases[index]!.maxWeeks - phase.minWeeks;
    const extra = Math.max(0, Math.min(capacity, remaining - phase.minWeeks - laterMinimum));
    remaining -= phase.minWeeks + extra;
    return { ...phase, maxWeeks: phase.minWeeks + extra };
  });
}
