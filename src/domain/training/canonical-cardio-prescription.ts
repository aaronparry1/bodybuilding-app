import type { ExperienceLevel } from "@/domain/training/models";
import type { RecoveryCardioPreference, TrainingSetupGoal } from "@/domain/training/plan-setup";

export const CANONICAL_CARDIO_PRESCRIPTION_VERSION = "canonical_cardio_prescription_v1" as const;

export type CanonicalCardioSession = Readonly<{
  id: string;
  dayOffset: number;
  kind: "recovery_cardio" | "capacity_cardio" | "performance_conditioning";
  modality: "incline_walk" | "cycle" | "rower" | "run";
  durationMinutes: number;
  intensity: "easy_zone_2" | "moderate_zone_2" | "intervals";
  intervalStructure?: Readonly<{ repetitions: number; workSeconds: number; recoverySeconds: number }>;
  placement: "after_upper_lifting" | "separate_from_lower_lifting" | "recovery_day";
  progression: string;
  stopOrAdjust: string;
}>

export type CanonicalCardioPrescription = Readonly<{
  schemaVersion: typeof CANONICAL_CARDIO_PRESCRIPTION_VERSION;
  policyId: "canonical_concurrent_training_policy_v1";
  preference: RecoveryCardioPreference;
  status: "active" | "off" | "review_required";
  goal: TrainingSetupGoal;
  sessions: readonly CanonicalCardioSession[];
  weeklyFrequency: number;
  rationaleCodes: readonly string[];
  interferenceRules: readonly string[];
}>;

/** Initial, exact concurrent-training prescription. Later changes require
 * factual Progress evidence; this resolver never infers recovery from a UI label. */
export function resolveCanonicalCardioPrescription(input: Readonly<{
  planId: string;
  goal: TrainingSetupGoal;
  preference: RecoveryCardioPreference;
  experience: ExperienceLevel;
  liftingDays: number;
  liftingDayOffsets: readonly number[];
  recoveryRestricted?: boolean;
  sportSessionsPerWeek?: number;
}>): CanonicalCardioPrescription {
  if (input.preference === "off") return prescription(input, "off", [], ["athlete_preference_off", "lifting_plan_unchanged"]);
  if (input.recoveryRestricted) return prescription(input, "review_required", [], ["recovery_restricted", "automatic_conditioning_withheld"]);
  const minimal = input.preference === "minimal";
  const occupied = new Set(input.liftingDayOffsets);
  const recoveryDays = [0, 1, 2, 3, 4, 5, 6].filter((day) => !occupied.has(day));
  const easy = (count: number, duration: number, kind: CanonicalCardioSession["kind"] = "recovery_cardio") => Array.from({ length: count }, (_, index): CanonicalCardioSession => ({
    id: `${input.planId}:cardio:${index + 1}`,
    dayOffset: recoveryDays[index % Math.max(1, recoveryDays.length)] ?? input.liftingDayOffsets[index % input.liftingDayOffsets.length] ?? index,
    kind,
    modality: index % 2 === 0 ? "incline_walk" : "cycle",
    durationMinutes: duration,
    intensity: kind === "capacity_cardio" ? "moderate_zone_2" : "easy_zone_2",
    placement: recoveryDays.length ? "recovery_day" : "after_upper_lifting",
    progression: "After three completed, well-tolerated sessions, add five minutes to one session; do not add intensity and duration together.",
    stopOrAdjust: "Stop for pain, dizziness or unusual breathlessness; hold progression and review if lower-body performance or recovery declines.",
  }));
  if (input.goal === "athletic_performance") {
    const count = minimal ? 1 : Math.max(2, Math.min(3, 4 - (input.sportSessionsPerWeek ?? 0)));
    const sessions = easy(Math.max(0, count - 1), input.experience === "beginner" ? 20 : 25, "capacity_cardio");
    if (count > 1) sessions.push({ id: `${input.planId}:cardio:${count}`, dayOffset: recoveryDays.at(-1) ?? 6, kind: "performance_conditioning", modality: "run", durationMinutes: 18, intensity: "intervals", intervalStructure: { repetitions: 6, workSeconds: 60, recoverySeconds: 120 }, placement: "separate_from_lower_lifting", progression: "Add one interval only after two completed sessions retain speed and lifting recovery.", stopOrAdjust: "End the session when running speed or movement quality materially declines; do not place within 24 hours before the hardest lower-body session." });
    return prescription(input, "active", sessions, ["athletic_capacity_and_power", "sport_workload_subtracted", "lower_body_interference_managed"]);
  }
  if (input.goal === "get_leaner") return prescription(input, "active", easy(minimal ? 1 : 3, 25, "capacity_cardio"), ["energy_expenditure_support", "resistance_stimulus_preserved", "duration_before_frequency"]);
  if (input.goal === "build_strength" || input.goal === "powerlifting_meet") return prescription(input, "active", easy(minimal ? 1 : 2, 20), ["recovery_capacity", "heavy_lower_interference_minimised"]);
  return prescription(input, "active", easy(minimal ? 1 : 2, 20), ["recovery_capacity", "hypertrophy_stimulus_preserved"]);
}

function prescription(input: Readonly<{ goal: TrainingSetupGoal; preference: RecoveryCardioPreference }>, status: CanonicalCardioPrescription["status"], sessions: readonly CanonicalCardioSession[], rationaleCodes: readonly string[]): CanonicalCardioPrescription {
  return { schemaVersion: CANONICAL_CARDIO_PRESCRIPTION_VERSION, policyId: "canonical_concurrent_training_policy_v1", preference: input.preference, status, goal: input.goal, sessions, weeklyFrequency: sessions.length, rationaleCodes, interferenceRules: ["cardio_never_changes_lifting_session_count", "hard_conditioning_not_before_priority_lower_session", "progress_requires_completed_tolerated_evidence"] };
}
