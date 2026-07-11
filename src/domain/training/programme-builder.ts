import type { Exercise, ExperienceLevel, Programme, ProgrammeGoal, ProgramExercise, ProgressionSettings, SessionTemplate } from "@/domain/training/models";
import { withSetPrescription } from "@/domain/training/set-prescription";

const makeId = (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;

export interface CreateProgrammeInput {
  name: string;
  description?: string;
  goal?: ProgrammeGoal;
  experienceLevel?: ExperienceLevel;
  daysPerWeek?: number;
  createdByUserId?: string | null;
}

export interface ProgrammeDraftValidation {
  valid: boolean;
  reason: string | null;
}

export function createCustomProgramme(input: CreateProgrammeInput): Programme {
  return {
    id: makeId("programme"),
    name: input.name.trim() || "Untitled Programme",
    description: input.description?.trim() ?? "",
    goal: input.goal ?? "hypertrophy",
    experienceLevel: input.experienceLevel ?? "intermediate",
    daysPerWeek: input.daysPerWeek ?? 3,
    days: [],
    notes: "",
    createdByUserId: input.createdByUserId ?? null,
    isCustom: true,
    isPreset: false,
  };
}

/** A builder programme is a saved draft/template, never an active plan. */
export function validateProgrammeDraft(programme: Programme): ProgrammeDraftValidation {
  if (programme.days.length === 0) {
    return { valid: false, reason: "Add at least one day before using this programme as a session template." };
  }
  if (!programme.days.some((day) => day.exerciseSlots.length > 0)) {
    return { valid: false, reason: "Add at least one exercise before using this programme as a session template." };
  }
  return { valid: true, reason: null };
}

export function createProgrammeDay(name: string, order: number): SessionTemplate {
  return {
    id: makeId("programme-day"),
    name: name.trim() || `Day ${order + 1}`,
    equipmentAvailable: [],
    exerciseSlots: [],
  };
}

export function addProgrammeDay(programme: Programme, name?: string): Programme {
  const nextDay = createProgrammeDay(name ?? `Day ${programme.days.length + 1}`, programme.days.length);
  return {
    ...programme,
    daysPerWeek: Math.max(programme.daysPerWeek, programme.days.length + 1),
    days: [...programme.days, nextDay],
  };
}

export function renameProgrammeDay(programme: Programme, dayId: string, name: string): Programme {
  return {
    ...programme,
    days: programme.days.map((day) => (day.id === dayId ? { ...day, name: name.trim() || day.name } : day)),
  };
}

export function createDraftExercise(exercise: Exercise, plannedOrder: number): ProgramExercise {
  return {
    id: makeId("draft-exercise"),
    exerciseId: exercise.id,
    plannedOrder,
    settings: withSetPrescription(exercise.defaultSettings, {
      exerciseRole: exercise.role,
      exerciseFamily: exercise.family,
      primaryMuscles: exercise.primaryMuscles,
    }, {
      source: "generated",
    }),
  };
}

export function addExerciseToDay(programme: Programme, dayId: string, exercise: Exercise): Programme {
  return {
    ...programme,
    days: programme.days.map((day) => {
      if (day.id !== dayId) return day;
      return {
        ...day,
        exerciseSlots: [...day.exerciseSlots, createDraftExercise(exercise, day.exerciseSlots.length + 1)],
      };
    }),
  };
}

export function updateDraftExerciseSettings(
  programme: Programme,
  dayId: string,
  slotId: string,
  settings: Partial<ProgressionSettings>,
): Programme {
  return {
    ...programme,
    days: programme.days.map((day) => {
      if (day.id !== dayId) return day;
      return {
        ...day,
        exerciseSlots: day.exerciseSlots.map((slot) =>
          slot.id === slotId
            ? {
                ...slot,
                settings: {
                  ...slot.settings,
                  ...settings,
                  repRange: settings.repRange ?? slot.settings.repRange,
                },
              }
            : slot,
        ),
      };
    }),
  };
}

export function removeExerciseFromDay(programme: Programme, dayId: string, slotId: string): Programme {
  return {
    ...programme,
    days: programme.days.map((day) => {
      if (day.id !== dayId) return day;
      return {
        ...day,
        exerciseSlots: day.exerciseSlots
          .filter((slot) => slot.id !== slotId)
          .map((slot, index) => ({ ...slot, plannedOrder: index + 1 })),
      };
    }),
  };
}

export function moveExercise(programme: Programme, dayId: string, slotId: string, direction: "up" | "down"): Programme {
  return {
    ...programme,
    days: programme.days.map((day) => {
      if (day.id !== dayId) return day;
      const currentIndex = day.exerciseSlots.findIndex((slot) => slot.id === slotId);
      const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
      if (currentIndex < 0 || targetIndex < 0 || targetIndex >= day.exerciseSlots.length) return day;

      const nextSlots = [...day.exerciseSlots];
      const [slot] = nextSlots.splice(currentIndex, 1);
      nextSlots.splice(targetIndex, 0, slot);

      return {
        ...day,
        exerciseSlots: nextSlots.map((candidate, index) => ({ ...candidate, plannedOrder: index + 1 })),
      };
    }),
  };
}

export function createOneOffSession(name = "One-Off Session", createdByUserId?: string | null): Programme {
  return {
    ...createCustomProgramme({
      name,
      description: "Standalone session that does not belong to a full programme.",
      daysPerWeek: 1,
      createdByUserId,
    }),
    goal: "hypertrophy",
    days: [createProgrammeDay("Session", 0)],
    notes: "One and done. Like a responsible adult with a pump.",
  };
}
