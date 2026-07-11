import type { Exercise, ExerciseFamily, MuscleGroup } from "@/domain/training/models";
import type { ActiveTrainingPlan } from "@/domain/training/plan-setup";
import {
  resolveLearnedExercisePreference,
  scoreLearnedExerciseAvoidance,
  scoreLearnedReplacementPreference,
  type PreferenceConfidence,
  type PreferenceLearningContext,
} from "@/domain/training/preference-learning";

export type ExerciseReasonCode =
  | "pain_limitation"
  | "equipment_unavailable"
  | "machine_occupied"
  | "gym_lacks_equipment"
  | "dislike_exercise"
  | "prefer_another"
  | "temporary_skip"
  | "other";

export type ExerciseReasonAction = "swap" | "remove" | "skip";

export interface ExercisePreferenceRecord {
  avoidedExerciseId: string;
  avoidedFamily?: ExerciseFamily;
  avoidedPrimaryMuscles?: MuscleGroup[];
  preferredReplacementExerciseId?: string;
  reason: ExerciseReasonCode;
  context?: PreferenceLearningContext;
  action: ExerciseReasonAction;
  count: number;
  firstAt: string;
  lastAt: string;
  recency: string;
  temporary: boolean;
  confidence?: PreferenceConfidence;
  persistent?: boolean;
  cooldownUntil?: string;
  decayMultiplier?: number;
  suppressSimilarUntil?: string;
}

export interface ExerciseReasonInput {
  avoidedExerciseId: string;
  avoidedFamily?: ExerciseFamily;
  avoidedPrimaryMuscles?: MuscleGroup[];
  preferredReplacementExerciseId?: string;
  reason: ExerciseReasonCode;
  context?: PreferenceLearningContext;
  action: ExerciseReasonAction;
}

export const exerciseReasonOptions: Array<{ code: ExerciseReasonCode; label: string; helper: string }> = [
  { code: "pain_limitation", label: "Pain / limitation", helper: "No penalty. We will steer you toward same-muscle alternatives." },
  { code: "equipment_unavailable", label: "Equipment unavailable", helper: "No progression penalty. Find the available option." },
  { code: "machine_occupied", label: "Machine occupied", helper: "Today problem, not a training problem." },
  { code: "gym_lacks_equipment", label: "Gym does not have this equipment", helper: "We will stop acting like it lives here." },
  { code: "dislike_exercise", label: "Dislike exercise", helper: "Logged. This lift can stop getting invited so often." },
  { code: "prefer_another", label: "Prefer another exercise", helper: "Good. Preference is data when it repeats." },
  { code: "temporary_skip", label: "Temporary skip", helper: "One-off skip. No lasting preference learned." },
  { code: "other", label: "Other", helper: "No drama. We will not treat this as failed training." },
];

export function recordExerciseReason(plan: ActiveTrainingPlan, input: ExerciseReasonInput, decidedAt = new Date().toISOString()): ActiveTrainingPlan {
  const existing = plan.recommendationState?.exercisePreferences?.[input.avoidedExerciseId];
  const temporary = isTemporaryReason(input.reason);
  const count = temporary ? 1 : (existing?.count ?? 0) + 1;
  const suppressSimilarUntil = input.reason === "pain_limitation" ? addDaysIso(decidedAt, 28) : existing?.suppressSimilarUntil;
  const draft: ExercisePreferenceRecord = {
    avoidedExerciseId: input.avoidedExerciseId,
    avoidedFamily: input.avoidedFamily ?? existing?.avoidedFamily,
    avoidedPrimaryMuscles: input.avoidedPrimaryMuscles ?? existing?.avoidedPrimaryMuscles,
    preferredReplacementExerciseId: input.preferredReplacementExerciseId ?? existing?.preferredReplacementExerciseId,
    reason: input.reason,
    context: input.context ?? existing?.context,
    action: input.action,
    count,
    firstAt: temporary ? decidedAt : existing?.firstAt ?? decidedAt,
    lastAt: decidedAt,
    recency: decidedAt,
    temporary,
    suppressSimilarUntil,
  };
  const learned = resolveLearnedExercisePreference(draft, { referenceDate: new Date(decidedAt) });

  return {
    ...plan,
    recommendationState: {
      ...plan.recommendationState,
      exercisePreferences: {
        ...(plan.recommendationState?.exercisePreferences ?? {}),
        [input.avoidedExerciseId]: {
          ...draft,
          confidence: learned?.confidence,
          persistent: learned?.persistent,
          cooldownUntil: learned?.cooldownUntil,
          decayMultiplier: learned?.decayMultiplier,
        },
      },
    },
  };
}

export function reasonAffectsProgression(reason: ExerciseReasonCode): boolean {
  void reason;
  return false;
}

export function scoreExercisePreference(
  exercise: Exercise,
  preferences: Record<string, ExercisePreferenceRecord> | null | undefined,
  referenceDate = new Date(),
): number {
  return scoreLearnedExerciseAvoidance(exercise, preferences, referenceDate);
}

export function scoreReplacementPreference(
  avoidedExerciseId: string,
  candidateExerciseId: string,
  preferences: Record<string, ExercisePreferenceRecord> | null | undefined,
): number {
  return scoreLearnedReplacementPreference(avoidedExerciseId, candidateExerciseId, preferences);
}

export function getExercisePreferenceRecord(
  preferences: Record<string, ExercisePreferenceRecord> | null | undefined,
  exerciseId: string,
): ExercisePreferenceRecord | null {
  return preferences?.[exerciseId] ?? null;
}

function isTemporaryReason(reason: ExerciseReasonCode): boolean {
  return reason === "temporary_skip" || reason === "machine_occupied" || reason === "other";
}

function addDaysIso(value: string, days: number): string {
  const date = new Date(value);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString();
}
