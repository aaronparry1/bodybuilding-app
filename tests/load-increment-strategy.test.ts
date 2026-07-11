import { describe, expect, it } from "vitest";
import {
  defaultLoadIncrementProfile,
  resolveLoadIncrement,
  roundDownToIncrement,
  roundUpToIncrement,
} from "@/domain/training/load-increment-strategy";
import { exerciseLibrary } from "@/domain/training/presets";

function exerciseNamed(name: string) {
  const exercise = exerciseLibrary.find((candidate) => candidate.name === name);
  if (!exercise) throw new Error(`Missing exercise: ${name}`);
  return exercise;
}

describe("load increment strategy", () => {
  it("uses 2.5kg barbell jumps by default when microplates are available", () => {
    const resolution = resolveLoadIncrement({
      exercise: exerciseNamed("Bench Press"),
      equipmentProfile: defaultLoadIncrementProfile,
      unit: "kg",
    });

    expect(resolution.increment).toBe(2.5);
    expect(resolution.reason).toContain("plates");
  });

  it("supports 1kg options across every loadable equipment profile", () => {
    const profile = {
      barbellPlateLoadedKg: 1,
      dumbbellKg: 1,
      cableKg: 1,
      machineKg: 1,
      bodyweightExternalLoading: false,
    } as const;

    expect(resolveLoadIncrement({ exercise: exerciseNamed("Bench Press"), equipmentProfile: profile, unit: "kg" }).increment).toBe(1);
    expect(resolveLoadIncrement({ exercise: exerciseNamed("Incline Dumbbell Press"), equipmentProfile: profile, unit: "kg" }).increment).toBe(1);
    expect(resolveLoadIncrement({ exercise: exerciseNamed("Cable Fly"), equipmentProfile: profile, unit: "kg" }).increment).toBe(1);
    expect(resolveLoadIncrement({ exercise: exerciseNamed("Machine Chest Press"), equipmentProfile: profile, unit: "kg" }).increment).toBe(1);
  });

  it("uses the machine profile for machine-coded plate-loaded work until custom station increments exist", () => {
    const resolution = resolveLoadIncrement({
      exercise: exerciseNamed("Incline Plate Loaded Press"),
      equipmentProfile: { ...defaultLoadIncrementProfile, machineKg: 5, barbellPlateLoadedKg: 2.5 },
      unit: "kg",
    });

    expect(resolution.increment).toBe(5);
    expect(resolution.reason).toContain("machine stack");
  });

  it("uses 5kg machine and cable jumps by default", () => {
    expect(resolveLoadIncrement({ exercise: exerciseNamed("Machine Chest Press"), unit: "kg" }).increment).toBe(5);
    expect(resolveLoadIncrement({ exercise: exerciseNamed("Cable Fly"), unit: "kg" }).increment).toBe(5);
  });

  it("uses configured dumbbell jumps", () => {
    const dumbbell = exerciseNamed("Incline Dumbbell Press");

    expect(resolveLoadIncrement({ exercise: dumbbell, equipmentProfile: { ...defaultLoadIncrementProfile, dumbbellKg: 2 }, unit: "kg" }).increment).toBe(2);
    expect(resolveLoadIncrement({ exercise: dumbbell, equipmentProfile: { ...defaultLoadIncrementProfile, dumbbellKg: 2.5 }, unit: "kg" }).increment).toBe(2.5);
  });

  it("lets explicit exercise overrides beat a larger equipment setting", () => {
    const lateralRaise = exerciseNamed("Dumbbell Lateral Raise");
    const resolution = resolveLoadIncrement({
      exercise: lateralRaise,
      equipmentProfile: { ...defaultLoadIncrementProfile, dumbbellKg: 5 },
      exerciseOverride: 1,
      unit: "kg",
    });

    expect(resolution.increment).toBe(1);
    expect(resolution.source).toBe("exercise_override");
  });

  it("lets conservative small-isolation defaults beat larger equipment settings", () => {
    const cableCurl = exerciseNamed("Cable Curl");
    const resolution = resolveLoadIncrement({
      exercise: cableCurl,
      equipmentProfile: { ...defaultLoadIncrementProfile, cableKg: 5 },
      unit: "kg",
    });

    expect(resolution.increment).toBe(2.5);
    expect(resolution.source).toBe("exercise_override");
  });

  it("keeps bodyweight progression at 0 unless external loading is enabled", () => {
    const pullUp = exerciseNamed("Pull-Up");

    expect(resolveLoadIncrement({ exercise: pullUp, equipmentProfile: { ...defaultLoadIncrementProfile, bodyweightExternalLoading: false }, unit: "kg" }).increment).toBe(0);
    expect(resolveLoadIncrement({ exercise: pullUp, equipmentProfile: { ...defaultLoadIncrementProfile, bodyweightExternalLoading: true }, unit: "kg" }).increment).toBe(2.5);
  });

  it("rounds up and down to the resolved increment", () => {
    expect(roundUpToIncrement(103.57, 2.5)).toBe(105);
    expect(roundUpToIncrement(101.67, 5)).toBe(105);
    expect(roundUpToIncrement(23.1, 2)).toBe(24);
    expect(roundDownToIncrement(97.5, 5)).toBe(95);
  });
});
