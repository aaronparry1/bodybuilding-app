import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import type { Programme } from "@/domain/training/models";
import { buildWorkoutSessionFromProgrammeDay } from "@/domain/training/session-builder";
import { createTrainingBlock } from "@/domain/training/annual-planner";
import { exerciseLibrary, presetProgrammes } from "@/domain/training/presets";

describe("session builder", () => {
  it("converts a programme day into an ordered workout session", () => {
    const programme = presetProgrammes.find((candidate) => candidate.name === "Full Body 3 Days")!;
    const day = programme.days[0];
    const session = buildWorkoutSessionFromProgrammeDay(programme, day.id, exerciseLibrary, {
      id: "session-test",
      userId: "user-1",
      startedAt: "2026-06-01T08:00:00.000Z",
      defaultLoad: 50,
    });

    expect(session?.programmeId).toBe(programme.id);
    expect(session?.templateId).toBe(day.id);
    expect(session?.exercises.some((exercise) => exercise.load === 50)).toBe(false);
    const expectedOrder = [...day.exerciseSlots].sort((a, b) => a.plannedOrder - b.plannedOrder).map((slot) => slot.exerciseId);
    expect(session?.exercises.map((exercise) => exercise.exerciseId)).toEqual(expectedOrder);
    expect(session?.exercises.every((exercise) => exercise.status === "active")).toBe(true);
  });

  it("preserves a planned slot when a custom exercise was deleted", () => {
    const programme: Programme = {
      id: "programme-missing-exercise",
      name: "Custom Upper",
      description: "Regression plan",
      goal: "hypertrophy",
      experienceLevel: "intermediate",
      daysPerWeek: 1,
      isCustom: true,
      isPreset: false,
      days: [
        {
          id: "day-1",
          name: "Upper",
          equipmentAvailable: ["cable"],
          exerciseSlots: [
            {
              id: "slot-1",
              exerciseId: "deleted-cable-fly",
              plannedOrder: 1,
              settings: {
                repRange: { min: 10, max: 15 },
                dropOffPercent: 15,
                loadIncrease: 2.5,
                unit: "kg",
                requiredWorkSets: 3,
              },
            },
          ],
        },
      ],
    };

    const session = buildWorkoutSessionFromProgrammeDay(programme, "day-1", [], {
      id: "session-missing",
      startedAt: "2026-06-01T08:00:00.000Z",
    });

    expect(session?.exercises[0]).toMatchObject({
      exerciseId: "deleted-cable-fly",
      exerciseName: "Deleted exercise",
      settings: programme.days[0].exerciseSlots[0].settings,
      status: "active",
    });
    expect(session?.exercises[0].shutdownReason).toContain("planned workout was preserved");
  });

  it("preserves generated slot-specific settings when a current block is active", () => {
    const programme = presetProgrammes.find((candidate) => candidate.name === "Full Body 3 Days")!;
    const day = {
      ...programme.days[0],
      exerciseSlots: [
        {
          ...programme.days[0].exerciseSlots[0],
          settings: {
            repRange: { min: 8, max: 15 },
            dropOffPercent: 18,
            loadIncrease: 5,
            unit: "kg" as const,
            requiredWorkSets: 3,
          },
          notes: "Primary compound: generated coaching reason.",
        },
        {
          ...programme.days[0].exerciseSlots[1],
          settings: {
            repRange: { min: 10, max: 20 },
            dropOffPercent: 18,
            loadIncrease: 2.5,
            unit: "kg" as const,
            requiredWorkSets: 2,
          },
          notes: "Isolation: generated coaching reason.",
        },
      ],
    };
    const generated: Programme = { ...programme, id: "generated-test", days: [day] };
    const session = buildWorkoutSessionFromProgrammeDay(
      generated,
      day.id,
      exerciseLibrary,
      { id: "session-generated", startedAt: "2026-06-01T08:00:00.000Z" },
      createTrainingBlock("strength"),
    );

    expect(session?.exercises[0].settings.repRange).toEqual({ min: 8, max: 15 });
    expect(session?.exercises[1].settings.repRange).toEqual({ min: 10, max: 20 });
    expect(session?.exercises[1].settings.requiredWorkSets).toBe(2);
    expect(session?.exercises[1].notes).toContain("generated coaching reason");
  });

  it("does not invent a 40kg starting load when no reliable load exists", () => {
    const programme = presetProgrammes.find((candidate) => candidate.name === "Full Body 3 Days")!;
    const day = programme.days[0];
    const session = buildWorkoutSessionFromProgrammeDay(programme, day.id, exerciseLibrary, {
      id: "session-no-load",
      userId: "user-1",
      startedAt: "2026-06-01T08:00:00.000Z",
    });

    expect(session?.exercises.some((exercise) => exercise.load === 40)).toBe(false);
    expect(session?.exercises.every((exercise) => exercise.loadKnown === false || exercise.load === 0)).toBe(true);
  });

  it("assembles slot prescriptions without block-based rep or load inference", () => {
    const source = readFileSync("src/domain/training/session-builder.ts", "utf8");

    expect(source).not.toContain("resolveRepRange");
    expect(source).not.toContain("getBlockDropOffPercentage");
    expect(source).not.toMatch(/options\.defaultLoad\s*\?\?/);
    expect(source).toContain("options.plannedSlot.settings");
  });
});
