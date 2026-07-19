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
  recoveryBudget: Readonly<{
    cardioMinutes: number;
    intervalWorkMinutes: number;
    concurrentSportSessions: number;
    lowerBodyInterference: "none" | "low" | "moderate" | "high";
    resistanceDosageAdjustment: "none" | "review_lower_body_dosage" | "review_required";
  }>;
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
  mesocyclePhase?: string;
  lowerBodyRecovery?: "acceptable" | "poor";
  workCapacity?: "not_demonstrated" | "demonstrated_high";
  productiveCardioHistory?: boolean;
}>): CanonicalCardioPrescription {
  if (input.preference === "off") return prescription(input, "off", [], ["athlete_preference_off", "lifting_plan_unchanged"]);
  if (input.recoveryRestricted || input.lowerBodyRecovery === "poor") return prescription(input, "review_required", [], ["lower_body_or_systemic_recovery_restricted", "automatic_conditioning_withheld"]);
  const minimal = input.preference === "minimal";
  const sportSessions = input.sportSessionsPerWeek ?? 0;
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
    const count = minimal ? 1 : Math.max(1, Math.min(3, 4 - sportSessions));
    const sessions = easy(Math.max(0, count - 1), input.experience === "beginner" ? 20 : 25, "capacity_cardio");
    if (count > 1) sessions.push({ id: `${input.planId}:cardio:${count}`, dayOffset: recoveryDays.at(-1) ?? 6, kind: "performance_conditioning", modality: "run", durationMinutes: 18, intensity: "intervals", intervalStructure: { repetitions: 6, workSeconds: 60, recoverySeconds: 120 }, placement: "separate_from_lower_lifting", progression: "Add one interval only after two completed sessions retain speed and lifting recovery.", stopOrAdjust: "End the session when running speed or movement quality materially declines; do not place within 24 hours before the hardest lower-body session." });
    return prescription(input, "active", sessions, ["athletic_capacity_and_power", "sport_workload_subtracted", "lower_body_interference_managed"]);
  }
  if (input.goal === "get_leaner") return prescription(input, "active", easy(minimal ? 1 : input.workCapacity === "demonstrated_high" && input.productiveCardioHistory ? 4 : 3, minimal ? 15 : 25, "capacity_cardio"), ["energy_expenditure_support", "resistance_stimulus_preserved", "duration_before_frequency"]);
  if (input.goal === "build_strength" || input.goal === "powerlifting_meet") {
    const nearIntensification = /intensification|realisation|taper/.test(input.mesocyclePhase ?? "");
    return prescription(input, "active", easy(minimal || nearIntensification ? 1 : 2, nearIntensification || minimal ? 15 : 20), ["recovery_capacity", nearIntensification ? "intensification_conditioning_minimised" : "heavy_lower_interference_minimised"]);
  }
  if (sportSessions >= 2) return prescription(input, "review_required", [], ["concurrent_sport_supplies_conditioning_load", "additional_cardio_withheld_pending_recovery_evidence"]);
  const highCapacity = input.workCapacity === "demonstrated_high" && input.productiveCardioHistory;
  const count = minimal ? 1 : sportSessions === 1 ? 1 : highCapacity ? 3 : 2;
  const duration = minimal || sportSessions === 1 ? 15 : 20;
  return prescription(input, "active", easy(count, duration), ["recovery_capacity", "hypertrophy_stimulus_preserved", highCapacity ? "productive_cardio_history_supports_frequency" : sportSessions ? "sport_workload_subtracted" : "ordinary_recovery_start"]);
}

function prescription(input: Readonly<{ goal: TrainingSetupGoal; preference: RecoveryCardioPreference; sportSessionsPerWeek?: number; lowerBodyRecovery?: "acceptable" | "poor"; recoveryRestricted?: boolean }>, status: CanonicalCardioPrescription["status"], sessions: readonly CanonicalCardioSession[], rationaleCodes: readonly string[]): CanonicalCardioPrescription {
  const cardioMinutes = sessions.reduce((sum, session) => sum + session.durationMinutes, 0);
  const intervalWorkMinutes = sessions.reduce((sum, session) => sum + (session.intervalStructure ? session.intervalStructure.repetitions * session.intervalStructure.workSeconds / 60 : 0), 0);
  const sportSessions = input.sportSessionsPerWeek ?? 0;
  const lowerBodyInterference = status === "review_required" ? (input.lowerBodyRecovery === "poor" || input.recoveryRestricted ? "high" : "moderate") : sessions.some((session) => session.intensity === "intervals") || sportSessions >= 1 ? "moderate" : sessions.length ? "low" : "none";
  return { schemaVersion: CANONICAL_CARDIO_PRESCRIPTION_VERSION, policyId: "canonical_concurrent_training_policy_v1", preference: input.preference, status, goal: input.goal, sessions, weeklyFrequency: sessions.length, rationaleCodes, interferenceRules: ["cardio_never_changes_lifting_session_count", "hard_conditioning_not_before_priority_lower_session", "progress_requires_completed_tolerated_evidence"], recoveryBudget: { cardioMinutes, intervalWorkMinutes, concurrentSportSessions: sportSessions, lowerBodyInterference, resistanceDosageAdjustment: status === "review_required" ? "review_required" : lowerBodyInterference === "moderate" ? "review_lower_body_dosage" : "none" } };
}
