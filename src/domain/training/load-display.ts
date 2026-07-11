import type { BlockType } from "@/domain/training/annual-models";
import { getExerciseMeasurementType } from "@/domain/training/exercise-metrics";
import type { Exercise, ExerciseFamily, ExerciseRole, MuscleGroup, SetLog, UnitSystem, WorkoutExerciseLog } from "@/domain/training/models";
import { roundDownToIncrement, roundUpToIncrement } from "@/domain/training/load-increment-strategy";

export type LoadDisplayKind = "known" | "estimated" | "unknown" | "bodyweight";

export interface LoadDisplayInput {
  load?: number | null;
  unit: UnitSystem;
  targetUnit?: UnitSystem;
  known?: boolean;
  estimated?: boolean;
  bodyweight?: boolean;
  increment?: number;
  preserveExact?: boolean;
}

export interface LoadDisplay {
  label: string;
  value: number | null;
  unit: UnitSystem;
  kind: LoadDisplayKind;
}

export interface WarmupPrescription {
  id: string;
  label: string;
  percent: number;
  reps: number | null;
  repsDisplay: string | null;
  load: number | null;
  loadDisplay: string;
  effortLabel?: string | null;
  suggestionDisplay: string | null;
}

export interface UnknownLoadIntensityPrescription {
  workDisplay: string;
  workEffortLabel: string;
  workDisplayWithEffort: string;
  warmupPercents: [number, number, number];
  reason: string;
}

export function formatLoadDisplay(input: LoadDisplayInput): LoadDisplay {
  const targetUnit = input.targetUnit ?? input.unit;
  if (input.bodyweight) {
    const load = input.load == null || !Number.isFinite(input.load) ? 0 : input.load;
    if (load <= 0) {
      return { label: "Bodyweight", value: null, unit: targetUnit, kind: "bodyweight" };
    }
    const converted = convertLoad(load, input.unit, targetUnit);
    const rounded = !input.preserveExact && input.increment && input.increment > 0 ? roundUpToIncrement(converted, input.increment) : displayNumber(converted);
    return { label: `Bodyweight + ${formatLoadNumber(rounded)}${targetUnit}`, value: rounded, unit: targetUnit, kind: "bodyweight" };
  }

  if (input.known === false || input.load == null || !Number.isFinite(input.load) || input.load <= 0) {
    return { label: "Choose load", value: null, unit: targetUnit, kind: "unknown" };
  }

  const converted = convertLoad(input.load, input.unit, targetUnit);
  const rounded = !input.preserveExact && input.increment && input.increment > 0 ? roundUpToIncrement(converted, input.increment) : displayNumber(converted);
  const prefix = input.estimated ? "Est. " : "";
  return {
    label: `${prefix}${formatLoadNumber(rounded)}${targetUnit}`,
    value: rounded,
    unit: targetUnit,
    kind: input.estimated ? "estimated" : "known",
  };
}

export function formatSetLoadDisplay(
  set: Pick<SetLog, "load" | "reps">,
  unit: UnitSystem,
  targetUnit: UnitSystem = unit,
  context?: { bodyweight?: boolean; exercise?: WorkoutExerciseLog; metadata?: Exercise | null; increment?: number },
): string {
  const bodyweight = context?.bodyweight ?? (context?.exercise ? isBodyweightExercise(context.exercise, context.metadata) : false);
  const display = formatLoadDisplay({
    load: set.load,
    unit,
    targetUnit,
    known: true,
    bodyweight,
    increment: context?.increment,
    preserveExact: true,
  });
  const measurementType = getExerciseMeasurementType(context?.exercise?.settings ?? context?.metadata?.defaultSettings);
  return `${display.label} × ${set.reps}${measurementType === "duration" ? " sec" : ""}`;
}

export function loadDisplayForExercise(
  exercise: WorkoutExerciseLog,
  metadata?: Exercise | null,
  targetUnit: UnitSystem = exercise.settings.unit,
  options: { preserveExact?: boolean } = {},
): LoadDisplay {
  return formatLoadDisplay({
    load: exercise.load,
    unit: exercise.settings.unit,
    targetUnit,
    known: exercise.loadKnown !== false,
    estimated: exercise.notes?.includes("Estimated from similar exercises") === true,
    bodyweight: isBodyweightExercise(exercise, metadata),
    increment: exercise.settings.loadIncrease,
    preserveExact: options.preserveExact,
  });
}

export function buildWarmupPrescriptions(
  exercise: WorkoutExerciseLog,
  metadata?: Exercise | null,
  targetUnit: UnitSystem = exercise.settings.unit,
  blockType?: BlockType | null,
  context: { exerciseIndex?: number } = {},
): WarmupPrescription[] {
  const workingLoad = loadDisplayForExercise(exercise, metadata, targetUnit);
  if (workingLoad.kind === "bodyweight") {
    const rows = (context.exerciseIndex ?? 0) === 0 ? [{ percent: 0.6, reps: 6 }, { percent: 0.85, reps: 3 }] : [{ percent: 0.75, reps: 4 }];
    return rows.map((row, index) => {
      const label = `W${index + 1}`;
      const loadDisplay = `Bodyweight × ${row.reps}`;
      return {
        id: label,
        label,
        percent: row.percent,
        reps: row.reps,
        repsDisplay: String(row.reps),
        load: null,
        loadDisplay,
        effortLabel: null,
        suggestionDisplay: `Suggested: ${loadDisplay}`,
      };
    });
  }

  const hasKnownWorkingLoad = workingLoad.kind === "known" || workingLoad.kind === "estimated";
  const baseLoad = hasKnownWorkingLoad ? applyDeloadLoadReduction(workingLoad.value, exercise.settings.loadIncrease, blockType) : null;
  const unknownPrescription = resolveUnknownLoadIntensityPrescription({
    blockType,
    exerciseRole: metadata?.role,
    exerciseFamily: metadata?.family,
    primaryMuscles: metadata?.primaryMuscles,
  });
  const rampRows = baseLoad == null
    ? unknownPrescription.warmupPercents.map((percent) => ({ percent, reps: repsForUnknownWarmupPercent(percent) }))
    : buildKnownLoadWarmupRamp({
        baseLoad,
        metadata,
        increment: exercise.settings.loadIncrease,
        targetUnit,
        exerciseIndex: context.exerciseIndex ?? 0,
        estimated: workingLoad.kind === "estimated",
      });

  return rampRows.map(({ percent, reps }, index) => {
    const label = `W${index + 1}`;
    const load = baseLoad == null ? null : roundUpToIncrement(baseLoad * (percent / 100), exercise.settings.loadIncrease);
    const effortLabel = load == null ? effortLabelForWarmupPercent(percent) : null;
    const repsDisplay = reps == null ? null : String(reps);
    const loadLabel = load == null
      ? `${percent}% · ${effortLabel}${repsDisplay ? ` × ${repsDisplay}` : ""}`
      : `${workingLoad.kind === "estimated" ? "Est. " : ""}${formatLoadNumber(load)}${targetUnit}${repsDisplay ? ` × ${repsDisplay}` : ""}`;
    const loadDisplay = loadLabel;

    return {
      id: label,
      label,
      percent: percent / 100,
      reps,
      repsDisplay,
      load,
      loadDisplay,
      effortLabel,
      suggestionDisplay: `Suggested: ${loadDisplay}`,
    };
  });
}

export function resolveUnknownLoadIntensityPrescription(input: {
  blockType?: BlockType | null;
  exerciseRole?: ExerciseRole | null;
  exerciseFamily?: ExerciseFamily | null;
  primaryMuscles?: MuscleGroup[];
}): UnknownLoadIntensityPrescription {
  const range = resolveUnknownWorkRange(input);
  const workEffortLabel = effortLabelForWorkRange(input, range);
  return {
    workDisplay: range.label,
    workEffortLabel,
    workDisplayWithEffort: `${range.label} · ${workEffortLabel}`,
    warmupPercents: warmupPercentsForRange(range.min, range.max),
    reason: "Use the percentage and effort cue until Adaptive Strength Coach has your actual load history.",
  };
}

export function isBodyweightExercise(exercise: WorkoutExerciseLog, metadata?: Exercise | null): boolean {
  return metadata?.kind === "bodyweight" || metadata?.equipment.includes("bodyweight") === true || (exercise.loadKnown === true && exercise.load === 0 && exercise.exerciseName.toLowerCase().includes("pull up"));
}

export function convertLoad(load: number, fromUnit: UnitSystem, toUnit: UnitSystem): number {
  if (fromUnit === toUnit) return load;
  return fromUnit === "kg" ? load * 2.2046226218 : load / 2.2046226218;
}

export function formatLoadNumber(load: number): string {
  return `${displayNumber(load)}`;
}

function displayNumber(value: number): number {
  return Number(value.toFixed(value % 1 === 0 ? 0 : 2));
}

type BlockKey = "hypertrophy" | "powerbuilding" | "strength" | "power" | "peak" | "deload";
type RoleGroup = "primary" | "secondary" | "isolation_accessory" | "small_muscle" | "power" | "maintenance";

const smallMuscles = new Set<MuscleGroup>([
  "biceps",
  "triceps",
  "calves",
  "abs",
  "forearms",
  "rear_delts",
  "adductors",
  "abductors",
]);

const unknownIntensityTable: Record<BlockKey, Record<RoleGroup, { min: number; max: number; label: string }>> = {
  hypertrophy: {
    primary: { min: 65, max: 80, label: "65-80%" },
    secondary: { min: 60, max: 75, label: "60-75%" },
    isolation_accessory: { min: 50, max: 70, label: "50-70%" },
    small_muscle: { min: 40, max: 65, label: "40-65%" },
    power: { min: 60, max: 80, label: "60-80%" },
    maintenance: { min: 50, max: 70, label: "50-70%" },
  },
  powerbuilding: {
    primary: { min: 75, max: 85, label: "75-85%" },
    secondary: { min: 65, max: 80, label: "65-80%" },
    isolation_accessory: { min: 50, max: 70, label: "50-70%" },
    small_muscle: { min: 50, max: 70, label: "50-70%" },
    power: { min: 60, max: 80, label: "60-80%" },
    maintenance: { min: 50, max: 70, label: "50-70%" },
  },
  strength: {
    primary: { min: 80, max: 90, label: "80-90%" },
    secondary: { min: 70, max: 85, label: "70-85%" },
    isolation_accessory: { min: 55, max: 75, label: "55-75%" },
    small_muscle: { min: 55, max: 75, label: "55-75%" },
    power: { min: 75, max: 85, label: "75-85%" },
    maintenance: { min: 55, max: 75, label: "55-75%" },
  },
  power: {
    primary: { min: 75, max: 85, label: "75-85%" },
    secondary: { min: 75, max: 85, label: "75-85%" },
    isolation_accessory: { min: 50, max: 70, label: "50-70%" },
    small_muscle: { min: 50, max: 70, label: "50-70%" },
    power: { min: 60, max: 80, label: "60-80%" },
    maintenance: { min: 50, max: 70, label: "50-70%" },
  },
  peak: {
    primary: { min: 85, max: 95, label: "85-95%" },
    secondary: { min: 75, max: 85, label: "75-85%" },
    isolation_accessory: { min: 50, max: 65, label: "50-65%" },
    small_muscle: { min: 50, max: 65, label: "50-65%" },
    power: { min: 60, max: 80, label: "60-80%" },
    maintenance: { min: 50, max: 65, label: "50-65%" },
  },
  deload: {
    primary: { min: 50, max: 65, label: "50-65%" },
    secondary: { min: 45, max: 60, label: "45-60%" },
    isolation_accessory: { min: 40, max: 55, label: "40-55%" },
    small_muscle: { min: 35, max: 50, label: "35-50%" },
    power: { min: 40, max: 60, label: "40-60%" },
    maintenance: { min: 40, max: 55, label: "40-55%" },
  },
};

function resolveUnknownWorkRange(input: {
  blockType?: BlockType | null;
  exerciseRole?: ExerciseRole | null;
  exerciseFamily?: ExerciseFamily | null;
  primaryMuscles?: MuscleGroup[];
}) {
  return unknownIntensityTable[normalizeBlockType(input.blockType)][getRoleGroup(input)];
}

function normalizeBlockType(blockType?: BlockType | null): BlockKey {
  if (blockType === "powerbuilding" || blockType === "strength_hypertrophy") return "powerbuilding";
  if (blockType === "strength") return "strength";
  if (blockType === "power") return "power";
  if (blockType === "peak") return "peak";
  if (blockType === "deload") return "deload";
  return "hypertrophy";
}

function getRoleGroup(input: {
  exerciseRole?: ExerciseRole | null;
  exerciseFamily?: ExerciseFamily | null;
  primaryMuscles?: MuscleGroup[];
}): RoleGroup {
  if (input.exerciseRole === "power" || input.exerciseFamily === "olympic_power" || input.exerciseFamily === "jump_power" || input.exerciseFamily === "throw_power") {
    return "power";
  }
  if (input.primaryMuscles?.length && input.primaryMuscles.every((muscle) => smallMuscles.has(muscle))) return "small_muscle";
  if (input.exerciseRole === "primary_compound") return "primary";
  if (input.exerciseRole === "secondary_compound") return "secondary";
  if (input.exerciseRole === "isolation" || input.exerciseRole === "accessory") return "isolation_accessory";
  if (input.exerciseRole === "corrective" || input.exerciseRole === "recovery" || input.exerciseRole === "resilience" || input.exerciseRole === "capacity") return "maintenance";
  return "isolation_accessory";
}

function warmupPercentsForRange(min: number, max: number): [number, number, number] {
  if (min >= 85 || max >= 95) return [50, 70, 80];
  if (min >= 80) return [40, 60, 75];
  if (min >= 75) return [40, 55, 70];
  return [30, 45, 55];
}

function buildKnownLoadWarmupRamp(input: {
  baseLoad: number;
  metadata?: Exercise | null;
  increment: number;
  targetUnit: UnitSystem;
  exerciseIndex: number;
  estimated: boolean;
}): Array<{ percent: number; reps: number }> {
  const { baseLoad, metadata, exerciseIndex } = input;
  if (!metadata) return percentRamp(baseLoad, exerciseIndex === 0 ? [45, 70, 85] : [65], exerciseIndex === 0 ? [8, 4, 2] : [5]);

  const isOpening = exerciseIndex === 0;
  const primaryCompound = isPrimaryCompound(metadata);
  const secondaryCompound = metadata.role === "secondary_compound";
  const accessory = isAccessory(metadata);

  if (isOpening && primaryCompound) {
    return openingCompoundRamp(input);
  }

  if (primaryCompound || secondaryCompound) {
    if (!isOpening && baseLoad < moderateLoadThreshold(input.targetUnit)) return percentRamp(baseLoad, [70], [5]);
    return percentRamp(baseLoad, isOpening ? [50, 75, 88] : [55, 78], isOpening ? [8, 4, 2] : [5, 2]);
  }

  if (accessory) {
    if (!isOpening) return percentRamp(baseLoad, [55], [8]);
    return percentRamp(baseLoad, baseLoad >= moderateLoadThreshold(input.targetUnit) ? [50, 75] : [60], baseLoad >= moderateLoadThreshold(input.targetUnit) ? [10, 5] : [8]);
  }

  return percentRamp(baseLoad, isOpening ? [50, 75] : [60], isOpening ? [8, 4] : [5]);
}

function openingCompoundRamp(input: {
  baseLoad: number;
  metadata?: Exercise | null;
  increment: number;
  targetUnit: UnitSystem;
  estimated: boolean;
}): Array<{ percent: number; reps: number }> {
  const emptyBarLoad = emptyBarFor(input.metadata, input.targetUnit);
  const emptyBarPercent = emptyBarLoad && emptyBarLoad < input.baseLoad ? Math.max(1, (emptyBarLoad / input.baseLoad) * 100) : null;
  const heavyThreshold = input.targetUnit === "kg" ? 140 : 315;
  const veryHeavyThreshold = input.targetUnit === "kg" ? 180 : 405;
  const lightThreshold = input.targetUnit === "kg" ? 70 : 155;

  const percents = input.baseLoad >= veryHeavyThreshold
    ? [35, 55, 72, 85, 92]
    : input.baseLoad >= heavyThreshold
      ? [40, 60, 78, 90]
      : input.baseLoad <= lightThreshold
        ? [60, 82]
        : [50, 68, 85];
  const reps = input.baseLoad >= veryHeavyThreshold
    ? [8, 5, 3, 2, 1]
    : input.baseLoad >= heavyThreshold
      ? [8, 5, 3, 1]
      : input.baseLoad <= lightThreshold
        ? [5, 2]
        : [6, 4, 2];

  const rows = percentRamp(input.baseLoad, percents, reps);
  if (!emptyBarPercent) return rows;
  const barRow = { percent: emptyBarPercent, reps: input.baseLoad <= lightThreshold ? 10 : 12 };
  const withoutTooSimilarFirstRow = rows[0] && rows[0].percent <= emptyBarPercent + 12 ? rows.slice(1) : rows;
  return [barRow, ...withoutTooSimilarFirstRow].slice(0, input.baseLoad >= veryHeavyThreshold ? 6 : input.baseLoad >= heavyThreshold ? 5 : 4);
}

function percentRamp(baseLoad: number, percents: number[], reps: number[]): Array<{ percent: number; reps: number }> {
  return dedupeWarmupRows(percents.map((percent, index) => ({ percent, reps: reps[index] ?? reps.at(-1) ?? 3 })), baseLoad);
}

function dedupeWarmupRows(rows: Array<{ percent: number; reps: number }>, baseLoad: number): Array<{ percent: number; reps: number }> {
  const seen = new Set<number>();
  return rows.filter((row) => {
    const key = Math.round(baseLoad * (row.percent / 100) * 100) / 100;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function isPrimaryCompound(exercise: Exercise): boolean {
  return exercise.role === "primary_compound" || ["squat", "hinge", "horizontal_push", "vertical_push", "horizontal_pull", "vertical_pull"].includes(exercise.movementPattern);
}

function isAccessory(exercise: Exercise): boolean {
  return exercise.role === "isolation" || exercise.role === "accessory" || exercise.movementPattern === "isolation";
}

function emptyBarFor(exercise: Exercise | null | undefined, unit: UnitSystem): number | null {
  if (!exercise) return null;
  if (exercise.kind !== "barbell" && !exercise.equipment.includes("barbell")) return null;
  return unit === "kg" ? 20 : 45;
}

function moderateLoadThreshold(unit: UnitSystem): number {
  return unit === "kg" ? 60 : 135;
}

function repsForUnknownWarmupPercent(percent: number): number {
  if (percent <= 35) return 10;
  if (percent <= 50) return 6;
  if (percent <= 60) return 4;
  return 2;
}

function effortLabelForWarmupPercent(percent: number): string {
  if (percent <= 35) return "easy warm-up";
  if (percent <= 50) return "warm-up";
  if (percent <= 60) return "close to working weight";
  return "clean ramp-up";
}

function effortLabelForWorkRange(
  input: {
    blockType?: BlockType | null;
    exerciseRole?: ExerciseRole | null;
    exerciseFamily?: ExerciseFamily | null;
    primaryMuscles?: MuscleGroup[];
  },
  range: { min: number; max: number },
): string {
  const blockType = normalizeBlockType(input.blockType);
  const roleGroup = getRoleGroup(input);
  if (blockType === "deload") return "lighter, clean reps";
  if (blockType === "power" || roleGroup === "power") return "fast reps, no grind";
  if (blockType === "strength" && range.min >= 80) return "heavy, clean reps";
  if (blockType === "peak" && range.min >= 85) return "heavy, sharp reps";
  if (roleGroup === "small_muscle" || roleGroup === "isolation_accessory") return "controlled, clean reps";
  return "hard but clean";
}

function applyDeloadLoadReduction(load: number | null, increment: number, blockType?: BlockType | null): number | null {
  if (blockType !== "deload" || load == null || !Number.isFinite(load) || load <= 0) return load;
  const reduced = roundDownToIncrement(load * 0.9, increment);
  return reduced > 0 && reduced < load ? reduced : load;
}
