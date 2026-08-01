import { baseKgFromDisplayLoad, type WorkoutLoadSemantic } from "@/application/training/canonical-workout-presentation";

export type CanonicalTrainSetEntry = Readonly<{
  repsText: string;
  loadText: string;
  loadSemantic: WorkoutLoadSemantic;
  displayUnit: "kg" | "lb";
}>;

export type CanonicalTrainSetEntryValidation = Readonly<
  | { status: "valid"; reps: number; baseLoadKg: number }
  | { status: "invalid"; field: "reps" | "load"; reason: string }
>;

export function validateCanonicalTrainSetEntry(input: CanonicalTrainSetEntry): CanonicalTrainSetEntryValidation {
  const reps = Number(input.repsText);
  if (!Number.isInteger(reps) || reps < 1) return { status: "invalid", field: "reps", reason: "Enter whole completed reps greater than zero." };
  if (input.loadSemantic === "bodyweight") return { status: "valid", reps, baseLoadKg: 0 };
  if (input.loadSemantic === "unavailable") return { status: "invalid", field: "load", reason: "Load is unavailable for this prescription. Review the session before recording this set." };
  const load = Number(input.loadText);
  if (!Number.isFinite(load) || load <= 0) {
    const label = input.loadSemantic === "assistance" ? "assistance" : input.loadSemantic === "added_load" ? "added load" : "load";
    return { status: "invalid", field: "load", reason: `Enter the ${label} used for this set.` };
  }
  return { status: "valid", reps, baseLoadKg: baseKgFromDisplayLoad(load, input.displayUnit) };
}

export function validateCanonicalCalibrationEntry(input: Readonly<{ repsText: string; loadText: string; exactTargetReps: number; displayUnit: "kg" | "lb" }>): CanonicalTrainSetEntryValidation {
  const result = validateCanonicalTrainSetEntry({ repsText: input.repsText, loadText: input.loadText, loadSemantic: "external_load", displayUnit: input.displayUnit });
  if (result.status === "invalid") return result;
  if (result.reps !== input.exactTargetReps) return { status: "invalid", field: "reps", reason: `Complete exactly ${input.exactTargetReps} controlled reps for calibration.` };
  return result;
}

export type CanonicalTrainNarrowLayout = Readonly<{ rowGap: number; setWidth: number; doneWidth: number; minimumHitSize: number; horizontalOverflow: false; completionCanWrap: false }>;
export function canonicalTrainNarrowLayout(viewportWidth: number, fontScale = 1): CanonicalTrainNarrowLayout {
  const narrow = viewportWidth <= 375 || fontScale >= 1.25;
  return { rowGap: narrow ? 6 : 8, setWidth: narrow ? 36 : 42, doneWidth: 48, minimumHitSize: 44, horizontalOverflow: false, completionCanWrap: false };
}

export type CanonicalTrainCompletionAffordance = Readonly<{
  normalFinishAvailable: boolean;
  earlyFinishAvailable: boolean;
  completedSets: number;
  remainingSets: number;
}>;

export function resolveCanonicalTrainCompletionAffordance(
  completedSets: number,
  totalSets: number,
  finishAllowed: boolean,
): CanonicalTrainCompletionAffordance {
  const boundedCompleted = Math.max(0, Math.min(completedSets, Math.max(0, totalSets)));
  const remainingSets = Math.max(0, totalSets - boundedCompleted);
  const normalFinishAvailable = totalSets > 0 && remainingSets === 0 && finishAllowed;
  return {
    normalFinishAvailable,
    earlyFinishAvailable: finishAllowed && boundedCompleted > 0 && remainingSets > 0,
    completedSets: boundedCompleted,
    remainingSets,
  };
}

export const canonicalTrainWorkoutActions = [
  { id: "minimise", label: "Resume later", effect: "persist_and_pause" },
  { id: "finish_early", label: "Finish early", effect: "complete_partial_truthfully" },
  { id: "discard", label: "Discard workout", effect: "clear_active_attempt_only" },
] as const;
