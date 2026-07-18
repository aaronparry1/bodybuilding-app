import { exerciseLibrary } from "@/domain/training/presets";

const title = (value: string) => value.replace(/[_-]+/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());

export function exerciseDisplayName(id: string): string {
  return exerciseLibrary.find((exercise) => exercise.id === id)?.name ?? "Exercise unavailable";
}

export function sessionRoleDisplayName(role: string): string {
  return role.trim() || "Training session";
}

export function methodDisplayName(method: string): string {
  const labels: Record<string, string> = { straight_sets: "Straight sets", rest_pause: "Rest-pause", myo_reps: "Myo-reps", drop_set: "Drop set" };
  return labels[method] ?? title(method);
}

export function loadingModeDisplayName(mode: string): string {
  const labels: Record<string, string> = { fixed: "Prescribed load", guided: "Choose a comfortable load", autoregulated: "Adjust by effort", bodyweight: "Bodyweight", unavailable: "Load to be confirmed" };
  return labels[mode] ?? "Calibration required";
}

export function trainingGoalDisplayName(goal: string): string {
  const labels: Record<string, string> = { build_muscle: "Build muscle", build_strength: "Build strength", build_muscle_and_strength: "Build muscle and strength", athletic_performance: "Athletic performance", hypertrophy: "Build muscle", strength_hypertrophy: "Build muscle and strength" };
  return labels[goal] ?? "Training programme";
}

export function mesocyclePurposeDisplayName(purpose: string): string {
  const labels: Record<string, string> = {
    powerbuilding_foundation: "Foundation phase",
    powerbuilding_hypertrophy: "Muscle-building phase",
    powerbuilding_strength: "Strength development phase",
    powerbuilding_intensification: "Heavy practice phase",
    powerbuilding_realisation: "Performance phase",
    powerbuilding_transition: "Recovery phase",
    hypertrophy: "Muscle-building phase",
    hypertrophy_base: "Muscle-building phase",
    hypertrophy_volume: "Volume development phase",
    hypertrophy_specialisation: "Specialisation phase",
    hypertrophy_consolidation: "Consolidation phase",
    hypertrophy_transition: "Recovery phase",
    strength: "Strength phase",
    strength_development: "Strength development phase",
    peaking: "Performance phase",
    deload: "Recovery phase",
    "Establish repeatable squat, bench and deadlift": "Foundation phase",
  };
  return labels[purpose] ?? "Training development phase";
}
