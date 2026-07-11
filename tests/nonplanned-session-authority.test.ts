import { describe, expect, it } from "vitest";
import { programmeRepository } from "@/data/local/programme-repository";
import { jsonStore } from "@/data/local/json-store";
import { buildWorkoutSessionFromProgrammeDay } from "@/domain/training/session-builder";
import { getOpenPlannedWorkout, isAuthoritativePlannedWorkout, isNonPlannedWorkout } from "@/domain/training/workout-origin";
import { createCustomProgramme, createOneOffSession, validateProgrammeDraft } from "@/domain/training/programme-builder";
import type { WorkoutSession } from "@/domain/training/models";
import { exerciseLibrary } from "@/domain/training/presets";
import { summarizeWorkoutSession } from "@/domain/training/workout-history";

function session(id: string, sessionKind: WorkoutSession["sessionKind"], overrides: Partial<WorkoutSession> = {}): WorkoutSession {
  return {
    id,
    name: id,
    startedAt: "2026-07-11T09:00:00.000Z",
    updatedAt: "2026-07-11T09:00:00.000Z",
    syncState: "local",
    sessionKind,
    exercises: [],
    ...overrides,
  };
}

describe("non-planned workout authority", () => {
  it("selects only an open planned workout even when a newer matching extra session exists", () => {
    const planned = session("planned", "planned", { planSessionIndex: 2 });
    const extra = session("extra", "extra_full", { startedAt: "2026-07-11T10:00:00.000Z" });
    const custom = session("custom", "custom", { startedAt: "2026-07-11T11:00:00.000Z" });

    expect(getOpenPlannedWorkout([extra, custom, planned])?.id).toBe("planned");
    expect(isAuthoritativePlannedWorkout(planned)).toBe(true);
    expect(isNonPlannedWorkout(extra)).toBe(true);
    expect(isNonPlannedWorkout(custom)).toBe(true);
  });

  it("constructs a programme-template session as explicit custom work without planned identity", () => {
    const programme = createOneOffSession("Custom session");
    const day = programme.days[0]!;
    const withExercise = {
      ...programme,
      days: [{ ...day, exerciseSlots: [{ id: "slot", exerciseId: exerciseLibrary[0]!.id, plannedOrder: 1, settings: exerciseLibrary[0]!.defaultSettings }] }],
    };
    const workout = buildWorkoutSessionFromProgrammeDay(withExercise, day.id, exerciseLibrary, {
      id: "custom-session",
      startedAt: "2026-07-11T09:00:00.000Z",
      sessionKind: "custom",
    });

    expect(workout?.sessionKind).toBe("custom");
    expect(workout?.planSessionIndex).toBeUndefined();
    expect(workout?.planMesocycleId).toBeUndefined();
    expect(workout?.planMicrocycleNumber).toBeUndefined();
    expect(workout?.exercises[0]?.prescribedSetTargets).toBeUndefined();
  });

  it("stores programme-day selections only as non-planned requests", () => {
    programmeRepository.selectProgrammeDay({ programmeId: "custom-programme", dayId: "custom-day", sessionKind: "custom" });

    expect(programmeRepository.getSelectedProgrammeDay()).toEqual({
      programmeId: "custom-programme",
      dayId: "custom-day",
      sessionKind: "custom",
    });
  });

  it("rejects a persisted legacy programme selection that claims planned authority", () => {
    jsonStore.set("iron-logic.selected-programme-day", {
      programmeId: "legacy-programme",
      dayId: "legacy-day",
      sessionKind: "planned",
    });

    expect(programmeRepository.getSelectedProgrammeDay()).toBeNull();
  });

  it("keeps a completed extra session out of planned progression evidence", () => {
    const completedExtra = session("extra-completed", "extra_full", {
      completedAt: "2026-07-11T10:00:00.000Z",
      exercises: [
        {
          id: "extra-exercise",
          exerciseId: exerciseLibrary[0]!.id,
          exerciseName: exerciseLibrary[0]!.name,
          settings: exerciseLibrary[0]!.defaultSettings,
          load: 40,
          loadKnown: true,
          status: "complete",
          sets: [{ id: "set-1", setNumber: 1, type: "work", load: 40, reps: 30, loggedAt: "2026-07-11T09:30:00.000Z" }],
        },
      ],
    });

    const summary = summarizeWorkoutSession(completedExtra);

    expect(summary?.exerciseSummaries[0]?.progressionEarned).toBe(false);
    expect(summary?.progressionHighlights).toEqual([]);
  });

  it("keeps builder drafts non-authoritative and validates only draft completeness", () => {
    const emptyDraft = createCustomProgramme({ name: "Draft" });
    const validation = validateProgrammeDraft(emptyDraft);

    expect(validation.valid).toBe(false);
    expect(validation.reason).toContain("at least one day");
    expect(emptyDraft.isCustom).toBe(true);
    expect(emptyDraft.isPreset).toBe(false);
  });
});
