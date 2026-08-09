import type { PersonalRecordItem } from "@/domain/training/personal-records";
import type { StrengthLiftDashboardItem, StrengthPrItem, StrengthTotalDashboard } from "@/domain/training/strength-dashboard";
import type { CanonicalWorkoutAchievement } from "@/domain/training/canonical-workout-achievements";

export type BrandedShareCardType = "pr" | "strength_progress" | "powerlifting_total" | "workout_summary";

export const ADAPTIVE_STRENGTH_COACH_DOWNLOAD_URL = "https://adaptivestrengthcoach.com/download";
export const SHARE_CARD_EXPORT_WIDTH = 1080;
export const SHARE_CARD_EXPORT_HEIGHT = 1350;

export interface BrandedSharePayload {
  type: BrandedShareCardType;
  eyebrow?: string;
  title: string;
  message: string;
  cardTitle: string;
  metric: string;
  detail: string;
  brand: "Adaptive Strength Coach";
  subtitle: "Auto-Regulated Strength Training";
  privacy: {
    includesPrivateData: false;
    excludedFields: string[];
  };
}

const brand = "Adaptive Strength Coach" as const;
const subtitle = "Auto-Regulated Strength Training" as const;
const excludedFields = ["bodyweight", "personal notes", "pain or injury info", "email", "name", "full workout log"];

export function buildPrSharePayload(record: PersonalRecordItem | StrengthPrItem): BrandedSharePayload {
  const metric = formatPrMetric(record);
  const eyebrow = record.type === "volume" ? "VOLUME PR" : "NEW PR";
  const cardTitle = record.exerciseName;
  return basePayload({
    type: "pr",
    eyebrow,
    title: cardTitle,
    cardTitle,
    metric,
    detail: record.type === "e1rm" ? "Best estimated strength yet." : "New best from completed work sets.",
  });
}

export function buildStrengthProgressSharePayload(lift: StrengthLiftDashboardItem): BrandedSharePayload | null {
  if (lift.currentE1rm == null) return null;
  const change = lift.change90Day ?? lift.change30Day;
  const window = lift.change90Day != null ? "90 days" : lift.change30Day != null ? "30 days" : "recent training";
  const metric = change != null ? `${formatSigned(change, lift.unit)} in ${window}` : `${formatLoad(lift.currentE1rm, lift.unit)} current e1RM`;
  const fromTo =
    change != null
      ? `${formatLoad(Math.max(0, lift.currentE1rm - change), lift.unit)} → ${formatLoad(lift.currentE1rm, lift.unit)}`
      : `Current: ${formatLoad(lift.currentE1rm, lift.unit)}`;
  return basePayload({
    type: "strength_progress",
    title: `${lift.label} strength progress`,
    cardTitle: lift.label,
    metric,
    detail: fromTo,
  });
}

export function buildPowerliftingTotalSharePayload(total: StrengthTotalDashboard): BrandedSharePayload | null {
  if (total.currentTotal == null) return null;
  return basePayload({
    type: "powerlifting_total",
    title: "Powerlifting total",
    cardTitle: "Current Total",
    metric: `${formatLoad(total.currentTotal, total.unit)} total`,
    detail: total.changeInTotal != null ? `Squat + Bench + Deadlift · ${formatSigned(total.changeInTotal, total.unit)} change` : "Squat + Bench + Deadlift",
  });
}

export function buildWorkoutSummarySharePayload({
  workoutName,
  exercisesCompleted,
  workSetsCompleted,
  prCount,
  personalRecords = [],
}: {
  workoutName: string;
  exercisesCompleted: number;
  workSetsCompleted: number;
  prCount: number;
  personalRecords?: Array<PersonalRecordItem | StrengthPrItem>;
}): BrandedSharePayload {
  const records = personalRecords.filter(isShareablePrRecord);
  if (records.length > 1) {
    const names = summarizeRecordNames(records);
    return basePayload({
      type: "pr",
      eyebrow: `${records.length} NEW PRs`,
      title: `${records.length} new PRs`,
      cardTitle: `${records.length} New PRs`,
      metric: names,
      detail: "New bests from completed work sets.",
    });
  }

  if (records.length === 1) {
    return buildPrSharePayload(records[0]);
  }

  const volumeRecord = records.find((record) => record.type === "volume");
  if (volumeRecord) {
    return basePayload({
      type: "pr",
      eyebrow: "VOLUME PR",
      title: "Volume PR",
      cardTitle: volumeRecord.exerciseName,
      metric: `${formatLoad(volumeRecord.value, volumeRecord.unit ?? "kg")} lifted`,
      detail: "Highest tracked volume for this movement.",
    });
  }

  const safeExercises = Math.max(0, exercisesCompleted);
  const safeWorkSets = Math.max(0, workSetsCompleted);
  const hasCompletedWork = safeExercises > 0 || safeWorkSets > 0;
  return basePayload({
    type: "workout_summary",
    title: `${workoutName} complete`,
    cardTitle: "Workout Complete",
    metric: hasCompletedWork ? `${safeExercises} exercises · ${safeWorkSets} work sets` : "Workout logged",
    detail: prCount > 0 ? `${prCount} PR${prCount === 1 ? "" : "s"} logged` : "Completed with Adaptive Strength Coach",
  });
}

export function buildWorkoutAchievementSharePayload(achievement: CanonicalWorkoutAchievement, displayUnit: "kg" | "lb" = "kg"): BrandedSharePayload {
  const loadValue = achievement.value == null ? null : displayUnit === "lb" && achievement.unit === "kg" ? achievement.value * 2.2046226218 : achievement.value;
  const load = loadValue == null ? "" : `${formatNumber(loadValue)}${displayUnit}`;
  const metric = achievement.kind === "load" ? load
    : achievement.kind === "comparable_reps" ? `${achievement.load == null || achievement.load <= 0 ? "Bodyweight" : `${formatNumber(displayUnit === "lb" && achievement.unit === "kg" ? achievement.load * 2.2046226218 : achievement.load)}${displayUnit}`} × ${achievement.reps ?? achievement.value}`
      : achievement.kind === "estimated_strength" ? `${load} estimated 1RM`
        : achievement.kind === "meaningful_volume" ? `${load} completed volume`
          : `${achievement.value ?? ""}`;
  const detail = achievement.kind === "load" ? "Heaviest completed work set for this exercise."
    : achievement.kind === "comparable_reps" ? "Most completed reps at this exact load."
      : achievement.kind === "estimated_strength" ? "Best estimated strength from comparable completed work."
        : achievement.kind === "meaningful_volume" ? "Highest meaningful completed volume for this exercise."
          : achievement.detail;
  return basePayload({
    type: achievement.kind === "programme_milestone" || achievement.kind === "consistency_milestone" || achievement.kind === "exercise_milestone" ? "workout_summary" : "pr",
    eyebrow: achievement.kind.includes("milestone") ? "MILESTONE" : "NEW BEST",
    title: achievement.title,
    cardTitle: achievement.exerciseName ?? achievement.title,
    metric,
    detail,
  });
}

export function fallbackShareMessage(payload: BrandedSharePayload): string {
  return [
    payload.cardTitle,
    payload.metric,
    payload.detail,
    "",
    payload.brand,
    payload.subtitle,
    "",
    "Download:",
    ADAPTIVE_STRENGTH_COACH_DOWNLOAD_URL,
  ].join("\n");
}

function basePayload(input: {
  type: BrandedShareCardType;
  eyebrow?: string;
  title: string;
  cardTitle: string;
  metric: string;
  detail: string;
}): BrandedSharePayload {
  const message = [
    input.cardTitle,
    input.metric,
    input.detail,
    "",
    brand,
    subtitle,
    "",
    "Download:",
    ADAPTIVE_STRENGTH_COACH_DOWNLOAD_URL,
  ].join("\n");

  return {
    ...input,
    message,
    brand,
    subtitle,
    privacy: {
      includesPrivateData: false,
      excludedFields,
    },
  };
}

function formatNumber(value: number): string { const rounded = Math.round(value * 10) / 10; return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1); }

function formatPrMetric(record: PersonalRecordItem | StrengthPrItem): string {
  if (record.type === "load") return `${formatLoad(record.value, record.unit ?? "kg")}`;
  if (record.type === "rep") {
    const load = "load" in record && record.load != null ? `${record.load > 0 ? formatLoad(record.load, record.unit ?? "kg") : "Bodyweight"} × ` : "";
    const measurementType = "measurementType" in record ? record.measurementType : "reps";
    const metric = measurementType === "duration" ? `${record.reps ?? record.value} sec` : `${record.reps ?? record.value}`;
    return `${load}${metric}`;
  }
  if (record.type === "volume") return `${formatLoad(record.value, record.unit ?? "kg")} lifted`;
  return `${formatLoad(record.value, record.unit ?? "kg")} estimated 1RM`;
}

function isShareablePrRecord(record: PersonalRecordItem | StrengthPrItem): boolean {
  return !("status" in record) || record.status === "pr";
}

function summarizeRecordNames(records: Array<PersonalRecordItem | StrengthPrItem>): string {
  const names = [...new Set(records.map((record) => record.exerciseName))];
  if (names.length <= 3) return names.join(" • ");
  return `${names.slice(0, 3).join(" • ")} +${names.length - 3}`;
}

function formatLoad(value: number, unit: string): string {
  return `${Number.isInteger(value) ? value : value.toFixed(1)}${unit}`;
}

function formatSigned(value: number, unit: string): string {
  if (value === 0) return `0${unit}`;
  return `${value > 0 ? "+" : ""}${formatLoad(value, unit)}`;
}
