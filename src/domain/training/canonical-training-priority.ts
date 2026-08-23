import type { CanonicalStimulusRegion } from "@/domain/training/models";

export type CanonicalTrainingPriority =
  | "balanced"
  | "chest"
  | "back"
  | "shoulders"
  | "arms"
  | "quadriceps"
  | "posterior_chain";

export const canonicalTrainingPriorityOptions: readonly Readonly<{
  value: CanonicalTrainingPriority;
  label: string;
  detail: string;
}>[] = [
  { value: "balanced", label: "Balanced development", detail: "Keep the starting programme evenly distributed." },
  { value: "chest", label: "Chest", detail: "Protect a little more high-quality chest work within the same weekly workload." },
  { value: "back", label: "Back", detail: "Bias useful lat and upper-back work without neglecting pressing." },
  { value: "shoulders", label: "Shoulders", detail: "Bias recoverable delt work within the existing weekly workload." },
  { value: "arms", label: "Arms", detail: "Bias direct biceps and triceps work without simply adding more sets." },
  { value: "quadriceps", label: "Quadriceps", detail: "Bias knee-dominant work while retaining posterior-chain training." },
  { value: "posterior_chain", label: "Posterior chain", detail: "Bias hamstring and hip-extension work while retaining knee-dominant training." },
] as const;

export function canonicalPriorityStimuli(priority: CanonicalTrainingPriority): readonly CanonicalStimulusRegion[] {
  if (priority === "back") return ["lats", "upper_back"];
  if (priority === "shoulders") return ["lateral_delts", "rear_delts", "anterior_delts"];
  if (priority === "arms") return ["biceps", "triceps"];
  if (priority === "quadriceps") return ["quadriceps"];
  if (priority === "posterior_chain") return ["hamstrings_knee_flexion", "hip_extension"];
  if (priority === "chest") return ["chest"];
  return [];
}

export function isCanonicalTrainingPriority(value: unknown): value is CanonicalTrainingPriority {
  return canonicalTrainingPriorityOptions.some((option) => option.value === value);
}
