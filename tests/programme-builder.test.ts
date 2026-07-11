import { describe, expect, it } from "vitest";
import {
  addExerciseToDay,
  addProgrammeDay,
  createCustomProgramme,
  moveExercise,
  removeExerciseFromDay,
  renameProgrammeDay,
  updateDraftExerciseSettings,
} from "@/domain/training/programme-builder";
import { exerciseLibrary, presetProgrammes } from "@/domain/training/presets";

describe("programme builder utilities", () => {
  it("creates and edits a custom programme day", () => {
    const programme = addProgrammeDay(createCustomProgramme({ name: "Mass Plan" }), "Upper");
    const renamed = renameProgrammeDay(programme, programme.days[0].id, "Upper A");

    expect(renamed.name).toBe("Mass Plan");
    expect(renamed.days[0].name).toBe("Upper A");
    expect(renamed.isCustom).toBe(true);
  });

  it("adds, reorders, edits, and removes planned exercises", () => {
    const base = addProgrammeDay(createCustomProgramme({ name: "Builder Test" }), "Day 1");
    const dayId = base.days[0].id;
    const withBench = addExerciseToDay(base, dayId, exerciseLibrary.find((exercise) => exercise.id === "ex-bench-press")!);
    const withRow = addExerciseToDay(withBench, dayId, exerciseLibrary.find((exercise) => exercise.id === "ex-chest-supported-row")!);
    const rowSlot = withRow.days[0].exerciseSlots[1];
    const moved = moveExercise(withRow, dayId, rowSlot.id, "up");
    const edited = updateDraftExerciseSettings(moved, dayId, rowSlot.id, {
      repRange: { min: 10, max: 15 },
      dropOffPercent: 12,
      loadIncrease: 5,
    });
    const removed = removeExerciseFromDay(edited, dayId, rowSlot.id);

    expect(moved.days[0].exerciseSlots[0].exerciseId).toBe("ex-chest-supported-row");
    expect(edited.days[0].exerciseSlots[0].settings.repRange).toEqual({ min: 10, max: 15 });
    expect(edited.days[0].exerciseSlots[0].settings.dropOffPercent).toBe(12);
    expect(removed.days[0].exerciseSlots).toHaveLength(1);
    expect(removed.days[0].exerciseSlots[0].plannedOrder).toBe(1);
  });

  it("seeds the requested preset programmes", () => {
    expect(presetProgrammes.map((programme) => programme.name)).toEqual([
      "Full Body 3 Days",
      "Upper/Lower 4 Days",
      "Push/Pull/Legs 6 Days",
      "Beginner 3-Day Foundation",
      "4-Day Upper/Lower Foundation",
    ]);

    expect(presetProgrammes.every((programme) => programme.days.length > 0)).toBe(true);
    expect(presetProgrammes.every((programme) => programme.days.every((day) => day.exerciseSlots.length > 0))).toBe(true);
  });
});
