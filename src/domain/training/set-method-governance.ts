import type { MesocycleId } from "@/domain/training/mesocycle-library";
import type { ExperienceLevel, ExerciseRole } from "@/domain/training/models";
import { resolveCanonicalTrainingMethodCandidate } from "@/domain/training/canonical-training-method-policy";

export type SetMethod = "exact_straight_sets" | "top_set_backoffs" | "controlled_performance_set" | "technical_repeated_sets" | "output_controlled_sets" | "five_three_one" | "eight_across" | "boring_but_big" | "ladder" | "pyramid" | "clusters" | "dynamic_effort" | "max_effort";

export function selectSetMethod(input: { mesocycleId?: MesocycleId; experience: ExperienceLevel; exerciseRole: ExerciseRole; sessionRole: string }): SetMethod {
  const candidate = resolveCanonicalTrainingMethodCandidate(input);
  const mapping: Record<ReturnType<typeof resolveCanonicalTrainingMethodCandidate>, SetMethod> = {
    straight_sets: "exact_straight_sets",
    back_off_sets: "top_set_backoffs",
    amrap: "controlled_performance_set",
    five_three_one: "five_three_one",
    eight_across: "eight_across",
    pyramid: "pyramid",
    ladder: "ladder",
    cluster: "clusters",
    bbb: "boring_but_big",
    dynamic_effort: "dynamic_effort",
    max_effort: "max_effort",
    heavy_single_triple_five_backoffs: "top_set_backoffs",
    antagonist_superset: "exact_straight_sets",
    rest_pause: "controlled_performance_set",
  };
  return mapping[candidate];
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
