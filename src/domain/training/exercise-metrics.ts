import type { ExerciseMeasurementType, ProgressionSettings, RepRange } from "@/domain/training/models";

export function getExerciseMeasurementType(settings?: Pick<ProgressionSettings, "measurementType"> | null): ExerciseMeasurementType {
  return settings?.measurementType ?? "reps";
}

export function isDurationMeasurement(settings?: Pick<ProgressionSettings, "measurementType"> | null): boolean {
  return getExerciseMeasurementType(settings) === "duration";
}

export function formatTargetRange(range: RepRange, measurementType: ExerciseMeasurementType = "reps"): string {
  return `${range.min}-${range.max} ${measurementType === "duration" ? "sec" : "reps"}`;
}

export function formatMetricValue(value: number, measurementType: ExerciseMeasurementType = "reps"): string {
  return `${value} ${measurementType === "duration" ? "sec" : "reps"}`;
}

export function metricInputLabel(measurementType: ExerciseMeasurementType = "reps"): string {
  return measurementType === "duration" ? "Seconds" : "Reps";
}

export function metricAccessibilityUnit(measurementType: ExerciseMeasurementType = "reps"): string {
  return measurementType === "duration" ? "seconds" : "reps";
}

export function nextDurationTargetRange(range: RepRange, incrementSeconds = 5): RepRange {
  return {
    min: range.min + incrementSeconds,
    max: range.max + incrementSeconds,
  };
}
