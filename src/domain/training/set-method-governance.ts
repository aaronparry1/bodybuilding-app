import type { MesocycleId } from "@/domain/training/mesocycle-library";
import type { ExperienceLevel, ExerciseRole } from "@/domain/training/models";

export type SetMethod = "exact_straight_sets" | "top_set_backoffs" | "controlled_performance_set" | "technical_repeated_sets" | "output_controlled_sets" | "five_three_one" | "eight_across" | "boring_but_big" | "ladder" | "pyramid" | "clusters" | "dynamic_effort" | "max_effort";

export function selectSetMethod(input: { mesocycleId?: MesocycleId; experience: ExperienceLevel; exerciseRole: ExerciseRole; sessionRole: string }): SetMethod {
  const phase = input.mesocycleId ?? "";
  const advanced = input.experience === "advanced";
  const intermediate = input.experience !== "beginner";
  if (phase.startsWith("strength_intensification") && advanced && input.exerciseRole === "primary_compound") return "max_effort";
  if ((phase.startsWith("strength_specific") || phase.startsWith("powerbuilding_strength")) && intermediate && input.exerciseRole === "primary_compound") return "top_set_backoffs";
  if ((phase.startsWith("strength_accumulation") || phase.startsWith("powerbuilding_strength")) && intermediate && input.exerciseRole === "primary_compound") return "five_three_one";
  if ((phase.startsWith("strength_accumulation") || phase.startsWith("powerbuilding_foundation")) && intermediate && input.exerciseRole === "secondary_compound") return "eight_across";
  if (phase.startsWith("powerbuilding_hypertrophy") && intermediate && input.exerciseRole === "secondary_compound") return "boring_but_big";
  if ((phase.startsWith("strength_specific") || phase.startsWith("athletic_force")) && intermediate && input.exerciseRole === "primary_compound") return "clusters";
  if ((phase.startsWith("strength_accumulation") || phase.startsWith("hypertrophy_base")) && input.exerciseRole === "secondary_compound") return "ladder";
  if ((phase.startsWith("hypertrophy_base") || phase.startsWith("powerbuilding_hypertrophy")) && input.exerciseRole === "primary_compound") return "pyramid";
  if ((phase.startsWith("athletic_power") || phase.startsWith("strength_specific")) && intermediate && input.sessionRole.toLowerCase().includes("power")) return "dynamic_effort";
  if (phase.startsWith("athletic_power")) return "output_controlled_sets";
  if (phase.startsWith("strength_") && input.exerciseRole === "primary_compound" && input.experience !== "beginner") return "top_set_backoffs";
  if ((phase.includes("calibration") || phase.includes("foundation")) && input.exerciseRole !== "isolation") return "technical_repeated_sets";
  return "exact_straight_sets";
}

export function setMethodExplanation(method: SetMethod): string {
  if (method === "top_set_backoffs") return "Heavy evidence followed by pre-authorised developmental work.";
  if (method === "technical_repeated_sets") return "Repeat technically clean work without fatigue-seeking progression.";
  if (method === "output_controlled_sets") return "Short high-quality efforts; stop when output or technique declines.";
  if (method === "controlled_performance_set") return "A capped assessment set with technical stop rules.";
  if (method === "five_three_one") return "A governed multi-week main-lift loading wave; performance work is capped.";
  if (method === "eight_across") return "Eight identical technical work sets; stop on the first missed target.";
  if (method === "boring_but_big") return "A governed 5 × 10 supplemental-volume allocation that replaces other supplemental work.";
  if (method === "ladder") return "A dose-preserving repetition ladder for controlled volume distribution.";
  if (method === "pyramid") return "An exact ascending loading sequence; decisive sets control progression.";
  if (method === "clusters") return "Short intra-set rests preserve authorised repetitions and technical quality.";
  if (method === "dynamic_effort") return "Submaximal work performed for speed; visible slowing ends the method.";
  if (method === "max_effort") return "Advanced-user heavy work capped by technical validity and planned attempts.";
  return "Exact straight-set targets are the default progression method.";
}
