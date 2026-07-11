import type { AppSupabaseClient } from "@/lib/supabase/client";
import { fromJson, toJson } from "@/data/supabase/json";
import type { Programme } from "@/domain/training/models";

type PlannedExerciseRow = {
  id: string;
  exercise_id: string;
  planned_order: number;
  settings: Parameters<typeof fromJson>[0];
  notes: string | null;
};

type ProgrammeDayRow = {
  id: string;
  name: string;
  day_order: number;
  planned_exercises?: PlannedExerciseRow[];
};

type ProgrammeRow = {
  id: string;
  name: string;
  description: string | null;
  goal: string;
  experience_level: string;
  days_per_week: number;
  notes: string | null;
  created_by_user_id: string | null;
  is_custom: boolean;
  is_preset: boolean;
  programme_days?: ProgrammeDayRow[];
};

export class ProgrammeCloudRepository {
  constructor(private readonly client: AppSupabaseClient) {}

  async saveProgramme(userId: string, programme: Programme): Promise<void> {
    const { error: programmeError } = await this.client.from("programmes").upsert({
      id: programme.id,
      user_id: userId,
      created_by_user_id: userId,
      name: programme.name,
      description: programme.description,
      goal: programme.goal,
      experience_level: programme.experienceLevel,
      days_per_week: programme.daysPerWeek,
      notes: programme.notes ?? null,
      is_custom: programme.isCustom,
      is_preset: programme.isPreset,
      updated_at: new Date().toISOString(),
    });
    if (programmeError) throw programmeError;

    for (const [dayOrder, day] of programme.days.entries()) {
      const { error: dayError } = await this.client.from("programme_days").upsert({
        id: day.id,
        user_id: userId,
        programme_id: programme.id,
        name: day.name,
        day_order: dayOrder,
      });
      if (dayError) throw dayError;

      if (day.exerciseSlots.length > 0) {
        const { error: plannedError } = await this.client.from("planned_exercises").upsert(
          day.exerciseSlots.map((slot) => ({
            id: slot.id,
            user_id: userId,
            programme_day_id: day.id,
            exercise_id: slot.exerciseId,
            planned_order: slot.plannedOrder,
            settings: toJson(slot.settings),
            notes: slot.notes ?? null,
          })),
        );
        if (plannedError) throw plannedError;
      }
    }
  }

  async loadProgrammes(userId: string): Promise<Programme[]> {
    const { data, error } = await this.client
      .from("programmes")
      .select("*, programme_days(*, planned_exercises(*))")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false });

    if (error) throw error;

    return ((data ?? []) as unknown as ProgrammeRow[]).map((programme) => ({
      id: programme.id,
      name: programme.name,
      description: programme.description ?? "",
      goal: programme.goal as Programme["goal"],
      experienceLevel: programme.experience_level as Programme["experienceLevel"],
      daysPerWeek: programme.days_per_week,
      notes: programme.notes ?? undefined,
      createdByUserId: programme.created_by_user_id,
      isCustom: programme.is_custom,
      isPreset: programme.is_preset,
      days: [...(programme.programme_days ?? [])]
        .sort((a, b) => a.day_order - b.day_order)
        .map((day) => ({
          id: day.id,
          name: day.name,
          equipmentAvailable: [],
          exerciseSlots: [...(day.planned_exercises ?? [])]
            .sort((a, b) => a.planned_order - b.planned_order)
            .map((slot) => ({
              id: slot.id,
              exerciseId: slot.exercise_id,
              plannedOrder: slot.planned_order,
              settings: fromJson<Programme["days"][number]["exerciseSlots"][number]["settings"]>(slot.settings),
              notes: slot.notes ?? undefined,
            })),
        })),
    }));
  }
}
