import { describe, expect, it } from "vitest";
import { buildWarmupPrescriptions, formatLoadDisplay, formatSetLoadDisplay, loadDisplayForExercise, resolveUnknownLoadIntensityPrescription } from "@/domain/training/load-display";
import type { Exercise, WorkoutExerciseLog } from "@/domain/training/models";
import { exerciseLibrary } from "@/domain/training/presets";

function exerciseLog(patch: Partial<WorkoutExerciseLog> = {}): WorkoutExerciseLog {
  const bench = exerciseLibrary.find((exercise) => exercise.id === "ex-bench-press")!;
  return {
    id: "log-bench",
    exerciseId: bench.id,
    exerciseName: bench.name,
    settings: { ...bench.defaultSettings, unit: "kg", loadIncrease: 2.5 },
    load: 100,
    loadKnown: true,
    sets: [],
    status: "active",
    ...patch,
  };
}

describe("load display presenter", () => {
  it("shows Choose load for unknown or zero non-bodyweight loads", () => {
    expect(formatLoadDisplay({ load: 0, unit: "kg", known: false }).label).toBe("Choose load");
    expect(formatLoadDisplay({ load: 0, unit: "lb", known: false }).label).toBe("Choose load");
    expect(loadDisplayForExercise(exerciseLog({ load: 0, loadKnown: false })).label).toBe("Choose load");
  });

  it("never presents unknown load as 0kg or 0lb", () => {
    const labels = [
      formatLoadDisplay({ load: 0, unit: "kg", known: false }).label,
      formatLoadDisplay({ load: 0, unit: "lb", known: false }).label,
      loadDisplayForExercise(exerciseLog({ load: 0, loadKnown: false, settings: { ...exerciseLog().settings, unit: "lb" } })).label,
    ];

    expect(labels).not.toContain("0kg");
    expect(labels).not.toContain("0lb");
  });

  it("shows bodyweight for unloaded bodyweight exercises", () => {
    const pullUp = exerciseLibrary.find((exercise) => exercise.name === "Pull-Up") as Exercise;
    const log = exerciseLog({
      exerciseId: pullUp.id,
      exerciseName: pullUp.name,
      settings: pullUp.defaultSettings,
      load: 0,
      loadKnown: true,
    });

    expect(loadDisplayForExercise(log, pullUp).label).toBe("Bodyweight");
  });

  it("shows bodyweight for completed zero-load bodyweight-capable sets", () => {
    const backExtension = exerciseLibrary.find((exercise) => exercise.name === "Back Extension") as Exercise;
    const log = exerciseLog({
      exerciseId: backExtension.id,
      exerciseName: backExtension.name,
      settings: backExtension.defaultSettings,
      load: 0,
      loadKnown: true,
    });

    expect(formatSetLoadDisplay({ load: 0, reps: 12 }, "kg", "kg", { exercise: log, metadata: backExtension })).toBe("Bodyweight × 12");
  });

  it("shows added load for weighted bodyweight sets", () => {
    const dip = exerciseLibrary.find((exercise) => exercise.name === "Dips") as Exercise;
    const log = exerciseLog({
      exerciseId: dip.id,
      exerciseName: dip.name,
      settings: dip.defaultSettings,
      load: 10,
      loadKnown: true,
    });

    expect(formatSetLoadDisplay({ load: 10, reps: 8 }, "kg", "kg", { exercise: log, metadata: dip })).toBe("Bodyweight + 10kg × 8");
    expect(loadDisplayForExercise(log, dip).label).toBe("Bodyweight + 10kg");
  });

  it("formats known and estimated loads in the selected unit", () => {
    expect(formatLoadDisplay({ load: 75, unit: "kg", known: true }).label).toBe("75kg");
    expect(formatLoadDisplay({ load: 165, unit: "lb", known: true }).label).toBe("165lb");
    expect(formatLoadDisplay({ load: 75, unit: "kg", known: true, estimated: true }).label).toBe("Est. 75kg");
  });

  it("preserves exact user-entered working loads for in-session work rows", () => {
    const machinePress = exerciseLibrary.find((exercise) => exercise.name === "Machine Chest Press") as Exercise;
    const log = exerciseLog({
      exerciseId: machinePress.id,
      exerciseName: machinePress.name,
      settings: { ...machinePress.defaultSettings, unit: "kg", loadIncrease: 5 },
      load: 28,
      loadKnown: true,
    });

    expect(loadDisplayForExercise(log, machinePress).label).toBe("30kg");
    expect(loadDisplayForExercise(log, machinePress, "kg", { preserveExact: true }).label).toBe("28kg");
    expect(loadDisplayForExercise({ ...log, load: 27 }, machinePress, "kg", { preserveExact: true }).label).toBe("27kg");
  });

  it("can convert kg storage to lb display when a target unit is supplied", () => {
    expect(formatLoadDisplay({ load: 100, unit: "kg", targetUnit: "lb", known: true, increment: 5 }).label).toBe("225lb");
  });

  it("formats logged set loads through the same presenter", () => {
    expect(formatSetLoadDisplay({ load: 0, reps: 8 }, "kg")).toBe("Choose load × 8");
    expect(formatSetLoadDisplay({ load: 100, reps: 8 }, "kg")).toBe("100kg × 8");
  });

  it("does not round completed set loads to the configured jump", () => {
    const machinePress = exerciseLibrary.find((exercise) => exercise.name === "Machine Chest Press") as Exercise;
    const log = exerciseLog({
      exerciseId: machinePress.id,
      exerciseName: machinePress.name,
      settings: { ...machinePress.defaultSettings, unit: "kg", loadIncrease: 5 },
      load: 28,
      loadKnown: true,
    });

    expect(formatSetLoadDisplay({ load: 28, reps: 20 }, "kg", "kg", { exercise: log, metadata: machinePress })).toBe("28kg × 20");
    expect(formatSetLoadDisplay({ load: 27, reps: 20 }, "kg", "kg", { exercise: log, metadata: machinePress })).toBe("27kg × 20");
  });

  it("starts opening barbell warm-ups with the empty bar", () => {
    const bench = exerciseLibrary.find((exercise) => exercise.id === "ex-bench-press") as Exercise;
    const rows = buildWarmupPrescriptions(exerciseLog({ load: 120, loadKnown: true, settings: { ...bench.defaultSettings, unit: "kg", loadIncrease: 5 } }), bench, "kg", "hypertrophy", { exerciseIndex: 0 });

    expect(rows[0]?.loadDisplay).toBe("20kg × 12");
    expect(rows[0]?.load).toBe(20);
    expect(rows[0]?.reps).toBe(12);
  });

  it("gives heavy opening compounds more bridging sets than light opening compounds", () => {
    const bench = exerciseLibrary.find((exercise) => exercise.id === "ex-bench-press") as Exercise;
    const lightRows = buildWarmupPrescriptions(exerciseLog({ load: 50, loadKnown: true, settings: { ...bench.defaultSettings, unit: "kg", loadIncrease: 5 } }), bench, "kg", "hypertrophy", { exerciseIndex: 0 });
    const heavyRows = buildWarmupPrescriptions(exerciseLog({ load: 180, loadKnown: true, settings: { ...bench.defaultSettings, unit: "kg", loadIncrease: 5 } }), bench, "kg", "hypertrophy", { exerciseIndex: 0 });

    expect(lightRows.length).toBeLessThan(heavyRows.length);
    expect(heavyRows.length).toBeGreaterThanOrEqual(5);
  });

  it("decreases warm-up reps as opening compound load rises", () => {
    const squat = exerciseLibrary.find((exercise) => exercise.id === "ex-barbell-back-squat") as Exercise;
    const rows = buildWarmupPrescriptions(exerciseLog({ exerciseId: squat.id, exerciseName: squat.name, load: 160, loadKnown: true, settings: { ...squat.defaultSettings, unit: "kg", loadIncrease: 5 } }), squat, "kg", "hypertrophy", { exerciseIndex: 0 });
    const reps = rows.map((row) => row.reps ?? 0);

    expect(reps).toEqual([...reps].sort((a, b) => b - a));
    expect(reps.at(-1)).toBeLessThanOrEqual(2);
  });

  it("reduces later exercise warm-up volume", () => {
    const bench = exerciseLibrary.find((exercise) => exercise.id === "ex-bench-press") as Exercise;
    const openingRows = buildWarmupPrescriptions(exerciseLog({ load: 120, loadKnown: true, settings: { ...bench.defaultSettings, unit: "kg", loadIncrease: 5 } }), bench, "kg", "hypertrophy", { exerciseIndex: 0 });
    const laterRows = buildWarmupPrescriptions(exerciseLog({ load: 120, loadKnown: true, settings: { ...bench.defaultSettings, unit: "kg", loadIncrease: 5 } }), bench, "kg", "hypertrophy", { exerciseIndex: 2 });

    expect(laterRows.length).toBeLessThan(openingRows.length);
    expect(laterRows.map((row) => row.loadDisplay)).toEqual(["70kg × 5", "95kg × 2"]);
  });

  it("keeps accessory warm-ups minimal instead of using heavy-compound ramps", () => {
    const lateralRaise = exerciseLibrary.find((exercise) => exercise.name === "Cable Lateral Raise") as Exercise;
    const rows = buildWarmupPrescriptions(exerciseLog({ exerciseId: lateralRaise.id, exerciseName: lateralRaise.name, load: 10, loadKnown: true, settings: { ...lateralRaise.defaultSettings, unit: "kg", loadIncrease: 2.5 } }), lateralRaise, "kg", "hypertrophy", { exerciseIndex: 3 });

    expect(rows).toHaveLength(1);
    expect(rows[0]?.loadDisplay).toBe("7.5kg × 8");
  });

  it("shows warm-up percentages with effort labels only when working load is unknown", () => {
    const rows = buildWarmupPrescriptions(exerciseLog({ load: 0, loadKnown: false }), undefined, "kg", "hypertrophy");

    expect(rows.map((row) => row.loadDisplay)).toEqual(["30% · easy warm-up × 10", "45% · warm-up × 6", "55% · close to working weight × 4"]);
    expect(rows.every((row) => !row.loadDisplay.includes("kg") && !row.loadDisplay.includes("lb"))).toBe(true);
    expect(rows[0]?.suggestionDisplay).toBe("Suggested: 30% · easy warm-up × 10");
  });

  it("shows estimated warm-up loads without visible percentages", () => {
    const bench = exerciseLibrary.find((exercise) => exercise.id === "ex-bench-press") as Exercise;
    const rows = buildWarmupPrescriptions(exerciseLog({ load: 60, loadKnown: true, notes: "Estimated from similar exercises. Adjust during warm-ups." }), bench);

    expect(rows.map((row) => row.loadDisplay)).toEqual(["Est. 20kg × 10", "Est. 37.5kg × 5", "Est. 50kg × 2"]);
    expect(rows.every((row) => !row.loadDisplay.includes("%"))).toBe(true);
    expect(rows.every((row) => !row.loadDisplay.includes("warm-up"))).toBe(true);
  });

  it("keeps bodyweight warm-up rows labelled as bodyweight", () => {
    const pullUp = exerciseLibrary.find((exercise) => exercise.name === "Pull-Up") as Exercise;
    const rows = buildWarmupPrescriptions(
      exerciseLog({
        exerciseId: pullUp.id,
        exerciseName: pullUp.name,
        settings: pullUp.defaultSettings,
        load: 0,
        loadKnown: true,
      }),
      pullUp,
    );

    expect(rows.map((row) => row.loadDisplay)).toEqual(["Bodyweight × 6", "Bodyweight × 3"]);
    expect(rows[0]?.suggestionDisplay).toBe("Suggested: Bodyweight × 6");
  });

  it("resolves unknown-load work percentages by block and role", () => {
    expect(resolveUnknownLoadIntensityPrescription({ blockType: "hypertrophy", exerciseRole: "primary_compound" }).workDisplay).toBe("65-80%");
    expect(resolveUnknownLoadIntensityPrescription({ blockType: "hypertrophy", exerciseRole: "primary_compound" }).workDisplayWithEffort).toBe("65-80% · hard but clean");
    expect(resolveUnknownLoadIntensityPrescription({ blockType: "strength", exerciseRole: "primary_compound" }).workDisplay).toBe("80-90%");
    expect(resolveUnknownLoadIntensityPrescription({ blockType: "strength", exerciseRole: "primary_compound" }).workEffortLabel).toBe("heavy, clean reps");
    expect(resolveUnknownLoadIntensityPrescription({ blockType: "hypertrophy", exerciseRole: "isolation", primaryMuscles: ["biceps"] }).workDisplay).toBe("40-65%");
  });

  it("uses lower deload prescriptions without medical or RPE/RIR language", () => {
    const unknown = resolveUnknownLoadIntensityPrescription({ blockType: "deload", exerciseRole: "primary_compound" });
    const knownRows = buildWarmupPrescriptions(exerciseLog({ load: 100, loadKnown: true }), exerciseLibrary.find((exercise) => exercise.id === "ex-bench-press"), "kg", "deload");

    expect(unknown.workDisplayWithEffort).toBe("50-65% · lighter, clean reps");
    expect(knownRows.map((row) => row.loadDisplay)).toEqual(["20kg × 12", "45kg × 6", "62.5kg × 4", "77.5kg × 2"]);
    expect(`${unknown.workDisplayWithEffort} ${unknown.reason}`).not.toMatch(/\bRPE\b|\bRIR\b|rehab|therapy|cure/i);
  });
});
