import type { Exercise } from "@/domain/training/models";
import { getPrimaryLiftFamilyForExercise, isCanonicalPrimaryLift } from "@/domain/training/primary-lift-variations";
import type { ExercisePreferenceRecord, ExerciseReasonCode } from "@/domain/training/exercise-preferences";

export type PreferenceConfidence = "low" | "medium" | "high";

export interface PreferenceLearningContext {
  currentBlock?: string;
  goal?: string;
  workoutType?: string;
  actionSurface?: "swap" | "remove" | "skip" | "generation" | "add" | "rotation";
}

export interface LearnedExercisePreference {
  avoidedExerciseId: string;
  preferredReplacementExerciseId?: string;
  reason: ExerciseReasonCode;
  context?: PreferenceLearningContext;
  count: number;
  recency: string;
  temporary: boolean;
  persistent: boolean;
  confidence: PreferenceConfidence;
  cooldownUntil?: string;
  decayMultiplier: number;
  avoidanceScore: number;
  replacementBoost: number;
  evidence: string[];
}

export interface PreferenceLearningOptions {
  referenceDate?: Date;
  exercise?: Exercise;
  candidate?: Exercise;
  currentExercise?: Exercise;
  primaryLiftProtection?: boolean;
}

export function resolveLearnedExercisePreference(
  record: ExercisePreferenceRecord | null | undefined,
  options: PreferenceLearningOptions = {},
): LearnedExercisePreference | null {
  if (!record) return null;
  const referenceDate = options.referenceDate ?? new Date();
  const days = daysSince(record.recency ?? record.lastAt, referenceDate);
  const temporary = record.temporary || record.reason === "temporary_skip" || record.reason === "other";
  const cooldownUntil = cooldownFor(record, options.exercise, options.referenceDate ?? new Date(record.lastAt));
  const inCooldown = cooldownUntil ? new Date(cooldownUntil).getTime() >= referenceDate.getTime() : false;
  const decayMultiplier = decayFor(record.reason, days, inCooldown);
  const protectedPrimary = Boolean(options.primaryLiftProtection ?? true) && Boolean(options.exercise && isProtectedPrimaryLift(options.exercise));
  const confidence = confidenceFor(record, decayMultiplier, protectedPrimary);
  const persistent = !temporary && confidence !== "low" && ["dislike_exercise", "prefer_another", "gym_lacks_equipment", "pain_limitation"].includes(record.reason);
  const avoidanceScore = avoidanceScoreFor(record, confidence, decayMultiplier, inCooldown, protectedPrimary);
  const replacementBoost = replacementBoostFor(record, confidence, decayMultiplier);

  return {
    avoidedExerciseId: record.avoidedExerciseId,
    preferredReplacementExerciseId: record.preferredReplacementExerciseId,
    reason: record.reason,
    context: record.context,
    count: record.count,
    recency: record.recency,
    temporary,
    persistent,
    confidence,
    cooldownUntil,
    decayMultiplier,
    avoidanceScore,
    replacementBoost,
    evidence: buildEvidence(record, confidence, decayMultiplier, inCooldown, protectedPrimary),
  };
}

export function scoreLearnedExerciseAvoidance(
  exercise: Exercise,
  preferences: Record<string, ExercisePreferenceRecord> | null | undefined,
  referenceDate = new Date(),
): number {
  if (!preferences) return 0;
  const exact = resolveLearnedExercisePreference(preferences[exercise.id], { exercise, referenceDate });
  let score = exact ? -exact.avoidanceScore : 0;

  for (const record of Object.values(preferences)) {
    if (record.avoidedExerciseId === exercise.id) continue;
    const learned = resolveLearnedExercisePreference(record, { exercise, referenceDate });
    if (!learned || learned.temporary || learned.reason !== "pain_limitation") continue;
    if (!learned.cooldownUntil || new Date(learned.cooldownUntil).getTime() < referenceDate.getTime()) continue;
    if (isCloseRelative(exercise, record)) score -= Math.min(42, learned.avoidanceScore * 0.45);
  }

  const rounded = Math.round(score);
  return Object.is(rounded, -0) ? 0 : rounded;
}

export function scoreLearnedReplacementPreference(
  avoidedExerciseId: string,
  candidateExerciseId: string,
  preferences: Record<string, ExercisePreferenceRecord> | null | undefined,
  referenceDate = new Date(),
): number {
  const record = preferences?.[avoidedExerciseId];
  if (!record || record.preferredReplacementExerciseId !== candidateExerciseId) return 0;
  const learned = resolveLearnedExercisePreference(record, { referenceDate });
  if (!learned || learned.temporary) return 0;
  return Math.round(learned.replacementBoost);
}

export function preferenceEvidenceForExercise(
  exercise: Exercise,
  preferences: Record<string, ExercisePreferenceRecord> | null | undefined,
  referenceDate = new Date(),
): string[] {
  const learned = resolveLearnedExercisePreference(preferences?.[exercise.id], { exercise, referenceDate });
  return learned?.evidence ?? [];
}

export function canUserOverridePreference(record: ExercisePreferenceRecord | null | undefined): boolean {
  void record;
  return true;
}

function confidenceFor(record: ExercisePreferenceRecord, decayMultiplier: number, protectedPrimary: boolean): PreferenceConfidence {
  if (record.temporary || decayMultiplier <= 0.15) return "low";
  const requiredHigh = protectedPrimary ? 5 : 3;
  const requiredMedium = protectedPrimary ? 3 : 2;
  if (record.reason === "pain_limitation") return decayMultiplier >= 0.4 ? "high" : "medium";
  if (record.reason === "gym_lacks_equipment") return record.count >= 2 ? "high" : "medium";
  if (record.reason === "equipment_unavailable" || record.reason === "machine_occupied") return "low";
  if (record.count >= requiredHigh) return "high";
  if (record.count >= requiredMedium) return "medium";
  return "low";
}

function avoidanceScoreFor(record: ExercisePreferenceRecord, confidence: PreferenceConfidence, decayMultiplier: number, inCooldown: boolean, protectedPrimary: boolean): number {
  if (record.temporary) return 0;
  const confidenceScore = confidence === "high" ? 75 : confidence === "medium" ? 42 : 12;
  const reasonScore =
    record.reason === "pain_limitation"
      ? 95
      : record.reason === "gym_lacks_equipment"
        ? 80
        : record.reason === "dislike_exercise" || record.reason === "prefer_another"
          ? 55
          : record.reason === "equipment_unavailable" || record.reason === "machine_occupied"
            ? 22
            : 8;
  const cooldownScore = inCooldown ? 28 : 0;
  const primaryProtection = protectedPrimary && record.reason !== "pain_limitation" && record.reason !== "gym_lacks_equipment" ? 0.45 : 1;
  return Math.max(0, Math.round((confidenceScore + reasonScore + cooldownScore) * decayMultiplier * primaryProtection));
}

function replacementBoostFor(record: ExercisePreferenceRecord, confidence: PreferenceConfidence, decayMultiplier: number): number {
  if (!record.preferredReplacementExerciseId || record.temporary) return 0;
  if (record.reason === "pain_limitation") return Math.round(70 * decayMultiplier);
  if (record.reason === "prefer_another") return Math.round((confidence === "high" ? 78 : confidence === "medium" ? 52 : 18) * decayMultiplier);
  if (record.reason === "dislike_exercise") return Math.round((confidence === "high" ? 58 : 34) * decayMultiplier);
  return Math.round(22 * decayMultiplier);
}

function cooldownFor(record: ExercisePreferenceRecord, exercise: Exercise | undefined, decidedAt: Date): string | undefined {
  if (record.reason === "pain_limitation") return record.suppressSimilarUntil ?? addDaysIso(decidedAt.toISOString(), 28);
  if (record.reason === "equipment_unavailable" || record.reason === "machine_occupied") return addDaysIso(record.lastAt, 7);
  if (record.reason === "gym_lacks_equipment") return addDaysIso(record.lastAt, 180);
  if (exercise && isProtectedPrimaryLift(exercise) && (record.reason === "dislike_exercise" || record.reason === "prefer_another")) return addDaysIso(record.lastAt, 21);
  return undefined;
}

function decayFor(reason: ExerciseReasonCode, days: number, inCooldown: boolean): number {
  if (reason === "temporary_skip" || reason === "other") return 0;
  if (inCooldown) return 1;
  const halfLife = reason === "dislike_exercise" || reason === "prefer_another" ? 90 : reason === "gym_lacks_equipment" ? 180 : 28;
  return Math.max(0, Math.min(1, Math.pow(0.5, Math.max(0, days) / halfLife)));
}

function isCloseRelative(exercise: Exercise, record: ExercisePreferenceRecord): boolean {
  if (record.avoidedFamily && exercise.family === record.avoidedFamily) return true;
  return Boolean(record.avoidedPrimaryMuscles?.some((muscle) => exercise.primaryMuscles.includes(muscle)));
}

function isProtectedPrimaryLift(exercise: Exercise): boolean {
  return exercise.tier === "A" || isCanonicalPrimaryLift(exercise) || Boolean(getPrimaryLiftFamilyForExercise(exercise));
}

function buildEvidence(
  record: ExercisePreferenceRecord,
  confidence: PreferenceConfidence,
  decayMultiplier: number,
  inCooldown: boolean,
  protectedPrimary: boolean,
): string[] {
  return [
    `${record.count} recorded ${record.reason.replaceAll("_", " ")} event${record.count === 1 ? "" : "s"}.`,
    record.preferredReplacementExerciseId ? `Preferred replacement: ${record.preferredReplacementExerciseId}.` : null,
    `Preference confidence: ${confidence}.`,
    `Decay multiplier: ${decayMultiplier.toFixed(2)}.`,
    inCooldown ? "Cooldown is active." : null,
    protectedPrimary ? "Primary lift protection applies; user can keep it." : null,
  ].filter((item): item is string => Boolean(item));
}

function daysSince(value: string, referenceDate: Date): number {
  const elapsedMs = referenceDate.getTime() - new Date(value).getTime();
  return elapsedMs / 86_400_000;
}

function addDaysIso(value: string, days: number): string {
  const date = new Date(value);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString();
}
