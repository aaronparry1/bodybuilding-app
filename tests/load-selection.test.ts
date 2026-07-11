import { describe, expect, it } from "vitest";
import {
  calculateNextSessionLoadAfterInSessionEscalation,
  calculateNextSessionStartingLoadFromProductiveSets,
  estimateLoadFromSameFamily,
  estimateOneRepMax,
  getDeloadAwareInSessionLoadIncreaseSuggestion,
  getInSessionLoadDropSuggestion,
  getInSessionLoadIncreaseSuggestion,
  recommendLoadRegression,
  resolveReducedLoad,
  resolveStartingLoadRecommendation,
} from "@/domain/training/load-selection";
import type { Exercise, ExerciseHistorySummary, ProgressionSettings, SetLog, WorkoutHistorySummary } from "@/domain/training/models";

const settings: ProgressionSettings = {
  repRange: { min: 8, max: 12 },
  dropOffPercent: 15,
  loadIncrease: 2.5,
  requiredWorkSets: 3,
  unit: "kg",
};

function exercise(patch: Partial<Exercise> = {}): Exercise {
  return {
    id: "ex-bench",
    name: "Bench Press",
    category: "chest",
    primaryMuscles: ["chest"],
    secondaryMuscles: ["triceps", "shoulders"],
    equipment: ["barbell"],
    movementPattern: "horizontal_push",
    defaultRepRange: { min: 6, max: 10 },
    defaultLoadJump: 2.5,
    unitCompatibility: ["kg", "lb"],
    kind: "barbell",
    role: "primary_compound",
    roles: ["primary_compound"],
    family: "horizontal_press",
    tier: "A",
    fatigueCost: "high",
    jointStress: "moderate",
    suitability: ["beginner", "intermediate", "advanced"],
    isBeginnerFriendly: true,
    isAdvanced: false,
    notes: [],
    suitableBlocks: ["hypertrophy", "powerbuilding", "strength"],
    swapTags: ["horizontal_press", "chest"],
    isCustom: false,
    defaultSettings: settings,
    ...patch,
  };
}

function entry(index: number, patch: Partial<ExerciseHistorySummary> = {}): ExerciseHistorySummary {
  return {
    sessionId: `session-${index}`,
    sessionName: "Push",
    completedAt: `2026-05-${String(index).padStart(2, "0")}T12:00:00.000Z`,
    exerciseLogId: `log-${index}`,
    exerciseId: "ex-db-bench",
    exerciseName: "Dumbbell Bench Press",
    load: 40,
    unit: "kg",
    setsCompleted: 3,
    repsCompleted: 30,
    qualitySets: 3,
    bestSetReps: 10,
    dropOffThreshold: 15,
    stoppedByDropOff: false,
    progressionEarned: false,
    nextRecommendedLoad: 40,
    volumeLoad: 1200,
    ...patch,
  };
}

function history(entries: ExerciseHistorySummary[]): WorkoutHistorySummary[] {
  return entries.map((exerciseEntry, index) => ({
    sessionId: exerciseEntry.sessionId ?? `session-${index}`,
    userId: "user",
    sessionName: exerciseEntry.sessionName ?? "Push",
    startedAt: exerciseEntry.completedAt ?? "2026-05-01T11:00:00.000Z",
    completedAt: exerciseEntry.completedAt ?? "2026-05-01T12:00:00.000Z",
    durationMinutes: 60,
    exercisesCompleted: 1,
    setsCompleted: exerciseEntry.setsCompleted,
    repsCompleted: exerciseEntry.repsCompleted,
    totalLoadVolume: exerciseEntry.volumeLoad,
    progressionHighlights: exerciseEntry.progressionEarned ? [`${exerciseEntry.exerciseName} -> ${exerciseEntry.nextRecommendedLoad}kg`] : [],
    exerciseSummaries: [exerciseEntry],
  }));
}

function set(id: string, reps: number, load: number, type: SetLog["type"] = "work"): SetLog {
  return {
    id,
    setNumber: Number(id.replace(/\D/g, "")) || 1,
    reps,
    load,
    type,
    loggedAt: "2026-06-04T12:00:00.000Z",
  };
}

describe("adaptive load selection", () => {
  it("uses exact exercise history before same-family estimates", () => {
    const bench = exercise();
    const dbBench = exercise({ id: "ex-db-bench", name: "Dumbbell Bench Press", kind: "dumbbell", equipment: ["dumbbell"] });
    const result = resolveStartingLoadRecommendation({
      targetExercise: bench,
      exercises: [bench, dbBench],
      history: history([
        entry(1, { exerciseId: "ex-db-bench", load: 40, bestSetReps: 12 }),
        entry(2, { exerciseId: "ex-db-bench", load: 42.5, bestSetReps: 10 }),
        entry(3, { exerciseId: "ex-bench", exerciseName: "Bench Press", load: 100, nextRecommendedLoad: 105, progressionEarned: true }),
      ]),
      repRange: settings.repRange,
      loadJump: 2.5,
      referenceDate: new Date("2026-05-04T12:00:00.000Z"),
    });

    expect(result.source).toBe("exact_history");
    expect(result.load).toBe(105);
    expect(result.recommendationEvidence?.confidence).toBe("high");
    expect(result.recommendationEvidence?.actionAllowed).toBe(true);
  });

  it("ignores extra-session history when selecting planned starting load", () => {
    const bench = exercise();
    const plannedThenExtra = history([
      entry(1, { exerciseId: "ex-bench", exerciseName: "Bench Press", load: 100, nextRecommendedLoad: 100 }),
      entry(2, { exerciseId: "ex-bench", exerciseName: "Bench Press", load: 100, nextRecommendedLoad: 95 }),
    ]).map((session, index) => ({
      ...session,
      sessionKind: index === 0 ? ("planned" as const) : ("extra_full" as const),
    }));
    const result = resolveStartingLoadRecommendation({
      targetExercise: bench,
      exercises: [bench],
      history: plannedThenExtra,
      repRange: settings.repRange,
      loadIncrement: 2.5,
      referenceDate: new Date("2026-05-03T12:00:00.000Z"),
    });

    expect(result.source).toBe("exact_history");
    expect(result.load).toBe(100);
    expect(result.evidence).toContain("100kg");
  });

  it("trims exact-history starting loads after a moderate training gap", () => {
    const bench = exercise();
    const result = resolveStartingLoadRecommendation({
      targetExercise: bench,
      exercises: [bench],
      history: history([
        entry(19, {
          exerciseId: "ex-bench",
          exerciseName: "Bench Press",
          completedAt: "2026-05-19T12:00:00.000Z",
          load: 100,
          nextRecommendedLoad: 100,
        }),
      ]),
      repRange: settings.repRange,
      loadJump: 2.5,
      referenceDate: new Date("2026-06-08T12:00:00.000Z"),
    });

    expect(result.source).toBe("exact_history");
    expect(result.load).toBe(95);
    expect(result.message).toContain("trimmed");
    expect(result.recommendationEvidence?.type).toBe("training_gap_starting_load");
  });

  it("keeps unknown-load exercises unknown during a return week", () => {
    const bench = exercise();
    const result = resolveStartingLoadRecommendation({
      targetExercise: bench,
      exercises: [bench],
      history: history([
        entry(1, {
          exerciseId: "ex-curl",
          exerciseName: "Cable Curl",
          completedAt: "2026-04-20T12:00:00.000Z",
        }),
      ]),
      repRange: settings.repRange,
      loadJump: 2.5,
      referenceDate: new Date("2026-06-08T12:00:00.000Z"),
    });

    expect(result.source).toBe("blank");
    expect(result.load).toBeUndefined();
    expect(result.message).toContain("Re-entry week");
  });

  it("requires enough same-family data before estimating load", () => {
    const bench = exercise();
    const dbBench = exercise({ id: "ex-db-bench", name: "Dumbbell Bench Press", kind: "dumbbell", equipment: ["dumbbell"] });
    const result = estimateLoadFromSameFamily({
      targetExercise: bench,
      exercises: [bench, dbBench],
      history: history([entry(1, { exerciseId: "ex-db-bench", load: 40, bestSetReps: 10 })]),
      repRange: settings.repRange,
      loadJump: 2.5,
    });

    expect(result.source).toBe("blank");
    expect(result.load).toBeUndefined();
    expect(result.recommendationEvidence?.confidence).toBe("insufficient_data");
  });

  it("uses the estimated1RM formula for same-family load estimates", () => {
    expect(estimateOneRepMax(100, 10)).toBeCloseTo(133.33, 2);
  });

  it("returns blank load for low-confidence unrelated data", () => {
    const bench = exercise();
    const curl = exercise({
      id: "ex-curl",
      name: "Cable Curl",
      category: "biceps",
      primaryMuscles: ["biceps"],
      secondaryMuscles: [],
      equipment: ["cable"],
      movementPattern: "isolation",
      kind: "cable",
      role: "isolation",
      roles: ["isolation"],
      family: "biceps_isolation",
      tier: "C",
    });
    const result = resolveStartingLoadRecommendation({
      targetExercise: bench,
      exercises: [bench, curl],
      history: history([
        entry(1, { exerciseId: "ex-curl", exerciseName: "Cable Curl", load: 30, bestSetReps: 12 }),
        entry(2, { exerciseId: "ex-curl", exerciseName: "Cable Curl", load: 32.5, bestSetReps: 10 }),
        entry(3, { exerciseId: "ex-curl", exerciseName: "Cable Curl", load: 35, bestSetReps: 9 }),
      ]),
      repRange: settings.repRange,
      loadJump: 2.5,
    });

    expect(result.source).toBe("blank");
  });

  it("returns guided discovery state when no history exists", () => {
    const result = resolveStartingLoadRecommendation({
      targetExercise: exercise(),
      exercises: [exercise()],
      history: [],
      repRange: settings.repRange,
      loadJump: 2.5,
    });

    expect(result.source).toBe("blank");
    expect(result.message).toContain("Choose a starting load");
  });

  it("suggests an in-session load increase after 3 top-range sets at the same load", () => {
    const suggestion = getInSessionLoadIncreaseSuggestion(
      [set("set-1", 12, 100), set("set-2", 12, 100), set("set-3", 12, 100)],
      settings,
      100,
    );

    expect(suggestion.shouldSuggest).toBe(true);
    expect(suggestion.suggestedLoad).toBe(102.5);
    expect(suggestion.evidence?.dataPoints.join(" ")).toContain("3 productive work sets");
  });

  it("suppresses aggressive in-session escalation during a training-gap return", () => {
    const suggestion = getInSessionLoadIncreaseSuggestion(
      [set("set-1", 12, 100), set("set-2", 12, 100), set("set-3", 12, 100)],
      settings,
      100,
      settings.loadIncrease,
      {
        exerciseRole: "primary_compound",
        exerciseFamily: "horizontal_press",
        goal: "build_strength",
        experienceLevel: "intermediate",
        currentBlock: "hypertrophy",
        recentExercisePerformance: [entry(1, { exerciseId: "ex-bench", completedAt: "2026-05-19T12:00:00.000Z" })],
        trainingGapStatus: "long_gap",
      },
    );

    expect(suggestion.shouldSuggest).toBe(false);
    expect(suggestion.suggestedLoad).toBe(100);
    expect(suggestion.message).toContain("Ease back in");
  });

  it("does not let warm-ups trigger in-session load escalation", () => {
    const suggestion = getInSessionLoadIncreaseSuggestion(
      [
        set("warmup-1", 12, 60, "warmup"),
        set("warmup-2", 12, 80, "warmup"),
        set("warmup-3", 12, 100, "warmup"),
      ],
      settings,
      100,
    );

    expect(suggestion.shouldSuggest).toBe(false);
    expect(suggestion.suggestedLoad).toBe(100);
  });

  it("does not increase after one above-range first set", () => {
    const increase = getInSessionLoadIncreaseSuggestion(
      [set("set-1", 13, 100)],
      settings,
      100,
    );
    const drop = getInSessionLoadDropSuggestion(
      [set("set-1", 13, 100)],
      settings,
      100,
    );

    expect(increase.shouldSuggest).toBe(false);
    expect(increase.suggestedLoad).toBe(100);
    expect(drop.shouldDrop).toBe(false);
    expect(drop.suggestedLoad).toBe(100);
  });

  it("keeps asymmetric load adjustment stable after a corrective drop", () => {
    const firstMiss = getInSessionLoadDropSuggestion(
      [set("set-1", 6, 100)],
      settings,
      100,
    );
    expect(firstMiss.shouldDrop).toBe(true);
    expect(firstMiss.suggestedLoad).toBe(95);

    const nextSetDrop = getInSessionLoadDropSuggestion(
      [set("set-1", 6, 100), set("set-2", 8, 95)],
      settings,
      95,
    );
    const nextSetIncrease = getInSessionLoadIncreaseSuggestion(
      [set("set-1", 6, 100), set("set-2", 8, 95)],
      settings,
      95,
    );

    expect(nextSetDrop.shouldDrop).toBe(false);
    expect(nextSetDrop.suggestedLoad).toBe(95);
    expect(nextSetIncrease.shouldSuggest).toBe(false);
    expect(nextSetIncrease.suggestedLoad).toBe(95);
  });

  it("requires consistent above-range evidence before upward in-session load changes", () => {
    const oneStrongSet = getInSessionLoadIncreaseSuggestion(
      [set("set-1", 13, 100)],
      settings,
      100,
    );
    const consistentTopRange = getInSessionLoadIncreaseSuggestion(
      [set("set-1", 12, 100), set("set-2", 12, 100), set("set-3", 12, 100)],
      settings,
      100,
    );

    expect(oneStrongSet.shouldSuggest).toBe(false);
    expect(oneStrongSet.suggestedLoad).toBe(100);
    expect(consistentTopRange.shouldSuggest).toBe(true);
    expect(consistentTopRange.suggestedLoad).toBe(102.5);
  });

  it("drops the next work-set load immediately when the latest work set misses the minimum range", () => {
    const suggestion = getInSessionLoadDropSuggestion(
      [set("set-1", 6, 100)],
      settings,
      100,
    );

    expect(suggestion.shouldDrop).toBe(true);
    expect(suggestion.currentLoad).toBe(100);
    expect(suggestion.suggestedLoad).toBe(95);
    expect(suggestion.message).toContain("Use 95kg on the next work set");
  });

  it("drops again conservatively after repeated in-session misses", () => {
    const suggestion = getInSessionLoadDropSuggestion(
      [set("set-1", 6, 100), set("set-2", 7, 95)],
      settings,
      95,
    );

    expect(suggestion.shouldDrop).toBe(true);
    expect(suggestion.suggestedLoad).toBe(90);
  });

  it("respects available equipment jumps for immediate in-session drops", () => {
    const machineSettings = { ...settings, loadIncrease: 5 };
    const suggestion = getInSessionLoadDropSuggestion(
      [set("set-1", 6, 100)],
      machineSettings,
      100,
    );

    expect(suggestion.shouldDrop).toBe(true);
    expect(suggestion.suggestedLoad).toBe(95);
    expect(suggestion.suggestedLoad % 5).toBe(0);
  });

  it("does not let warm-up misses reduce the next working load", () => {
    const suggestion = getInSessionLoadDropSuggestion(
      [set("warmup-1", 4, 100, "warmup")],
      settings,
      100,
    );

    expect(suggestion.shouldDrop).toBe(false);
    expect(suggestion.suggestedLoad).toBe(100);
  });

  it("does not drop load when the minimum target is hit", () => {
    const suggestion = getInSessionLoadDropSuggestion(
      [set("set-1", 8, 100)],
      settings,
      100,
    );

    expect(suggestion.shouldDrop).toBe(false);
    expect(suggestion.suggestedLoad).toBe(100);
  });

  it("does not drop load after above-range work", () => {
    const suggestion = getInSessionLoadDropSuggestion(
      [set("set-1", 13, 100)],
      settings,
      100,
    );

    expect(suggestion.shouldDrop).toBe(false);
    expect(suggestion.suggestedLoad).toBe(100);
  });

  it("continues suggesting increases after later top-range escalation sets", () => {
    const suggestion = getInSessionLoadIncreaseSuggestion(
      [set("set-1", 12, 100), set("set-2", 12, 100), set("set-3", 12, 100), set("set-4", 12, 102.5)],
      settings,
      102.5,
    );

    expect(suggestion.shouldSuggest).toBe(true);
    expect(suggestion.suggestedLoad).toBe(105);
  });

  it("does not force increases when a user ignores the suggestion", () => {
    const suggestion = getInSessionLoadIncreaseSuggestion(
      [set("set-1", 12, 100), set("set-2", 12, 100), set("set-3", 12, 100)],
      settings,
      100,
    );

    expect(suggestion.currentLoad).toBe(100);
    expect(suggestion.shouldSuggest).toBe(true);
  });

  it("suppresses in-session escalation during deload prescriptions", () => {
    const suggestion = getDeloadAwareInSessionLoadIncreaseSuggestion({
      sets: [set("set-1", 12, 100), set("set-2", 12, 100), set("set-3", 12, 100)],
      settings,
      currentLoad: 100,
      suppressEscalation: true,
    });

    expect(suggestion.shouldSuggest).toBe(false);
    expect(suggestion.suggestedLoad).toBe(100);
  });

  it("holds in-session escalation when the progression throttle sees high fatigue", () => {
    const suggestion = getDeloadAwareInSessionLoadIncreaseSuggestion({
      sets: [set("set-1", 12, 100), set("set-2", 12, 100), set("set-3", 12, 100)],
      settings,
      currentLoad: 100,
      throttleInput: {
        exerciseRole: "primary_compound",
        exerciseFamily: "horizontal_press",
        goal: "build_muscle",
        experienceLevel: "advanced",
        currentBlock: "hypertrophy",
        recentVolumeFatigueSignal: "high",
        recentExercisePerformance: [entry(1, { exerciseId: "ex-bench", exerciseName: "Bench Press" }), entry(2, { exerciseId: "ex-bench", exerciseName: "Bench Press" })],
      },
    });

    expect(suggestion.shouldSuggest).toBe(false);
    expect(suggestion.throttle?.decision).toBe("hold");
    expect(suggestion.message).toContain("Hold");
  });

  it("uses average productive load rounded up for next-session starting load", () => {
    const nextLoad = calculateNextSessionStartingLoadFromProductiveSets(
      [
        set("set-1", 12, 100),
        set("set-2", 12, 100),
        set("set-3", 12, 100),
        set("set-4", 12, 102.5),
        set("set-5", 12, 105),
        set("set-6", 12, 107.5),
        set("set-7", 12, 110),
      ],
      settings,
      100,
    );

    expect(nextLoad).toBe(105);
  });

  it("consolidates a final in-session escalation instead of adding another increment", () => {
    const nextLoad = calculateNextSessionLoadAfterInSessionEscalation({
      sets: [
        set("set-1", 12, 100),
        set("set-2", 12, 100),
        set("set-3", 12, 100),
        set("set-4", 12, 102.5),
        set("set-5", 12, 105),
      ],
      settings,
      currentLoad: 105,
      progressionNextLoad: 107.5,
    });

    expect(nextLoad).toBe(105);
  });

  it("uses the highest successful escalated load as the next baseline", () => {
    const nextLoad = calculateNextSessionLoadAfterInSessionEscalation({
      sets: [
        set("set-1", 12, 100),
        set("set-2", 12, 100),
        set("set-3", 12, 102.5),
        set("set-4", 12, 102.5),
        set("set-5", 12, 102.5),
      ],
      settings,
      currentLoad: 102.5,
      progressionNextLoad: 105,
    });

    expect(nextLoad).toBe(102.5);
  });

  it("can progress again when the escalated load is proven across extra relevant work", () => {
    const nextLoad = calculateNextSessionLoadAfterInSessionEscalation({
      sets: [
        set("set-1", 12, 100),
        set("set-2", 12, 102.5),
        set("set-3", 12, 105),
        set("set-4", 12, 105),
        set("set-5", 12, 105),
        set("set-6", 12, 105),
      ],
      settings,
      currentLoad: 105,
      progressionNextLoad: 107.5,
    });

    expect(nextLoad).toBe(107.5);
  });

  it("does not treat a failed escalated load as the next baseline", () => {
    const nextLoad = calculateNextSessionLoadAfterInSessionEscalation({
      sets: [
        set("set-1", 12, 100),
        set("set-2", 12, 100),
        set("set-3", 12, 100),
        set("set-4", 12, 102.5),
        set("set-5", 5, 105),
      ],
      settings,
      currentLoad: 105,
      progressionNextLoad: 107.5,
    });

    expect(nextLoad).toBe(102.5);
  });

  it("ignores warm-ups when consolidating in-session escalation", () => {
    const nextLoad = calculateNextSessionLoadAfterInSessionEscalation({
      sets: [
        set("warmup-1", 10, 110, "warmup"),
        set("set-1", 12, 100),
        set("set-2", 12, 100),
        set("set-3", 12, 100),
        set("set-4", 12, 102.5),
      ],
      settings,
      currentLoad: 102.5,
      progressionNextLoad: 105,
    });

    expect(nextLoad).toBe(102.5);
  });

  it("rounds next-session average to the resolved machine increment", () => {
    const machineSettings = { ...settings, loadIncrease: 5 };
    const nextLoad = calculateNextSessionStartingLoadFromProductiveSets(
      [set("set-1", 12, 100), set("set-2", 12, 100), set("set-3", 12, 105)],
      machineSettings,
      100,
    );

    expect(nextLoad).toBe(105);
  });

  it("excludes warm-ups from next-session average", () => {
    const nextLoad = calculateNextSessionStartingLoadFromProductiveSets(
      [set("set-1", 8, 40, "warmup"), set("set-2", 12, 100), set("set-3", 12, 100), set("set-4", 12, 100)],
      settings,
      100,
    );

    expect(nextLoad).toBe(100);
  });

  it("returns fallback load when only warm-ups are logged", () => {
    const nextLoad = calculateNextSessionStartingLoadFromProductiveSets(
      [set("warmup-1", 12, 40, "warmup"), set("warmup-2", 10, 70, "warmup"), set("warmup-3", 8, 90, "warmup")],
      settings,
      100,
    );

    expect(nextLoad).toBe(100);
  });

  it("excludes below-threshold sets from next-session average", () => {
    const nextLoad = calculateNextSessionStartingLoadFromProductiveSets(
      [set("set-1", 12, 100), set("set-2", 11, 100), set("set-3", 8, 150)],
      settings,
      100,
    );

    expect(nextLoad).toBe(100);
  });

  it("uses the resolved increment for in-session escalation", () => {
    const machineSettings = { ...settings, loadIncrease: 5 };
    const suggestion = getInSessionLoadIncreaseSuggestion(
      [set("set-1", 12, 100), set("set-2", 12, 100), set("set-3", 12, 100)],
      machineSettings,
      100,
    );

    expect(suggestion.suggestedLoad).toBe(105);
  });

  it("rounds same-family estimates upward to the resolved increment", () => {
    const bench = exercise();
    const machinePress = exercise({
      id: "ex-machine-press",
      name: "Machine Chest Press",
      kind: "machine",
      equipment: ["machine"],
      defaultLoadJump: 5,
      defaultSettings: { ...settings, loadIncrease: 5 },
    });
    const result = estimateLoadFromSameFamily({
      targetExercise: bench,
      exercises: [bench, machinePress],
      history: history([
        entry(1, { exerciseId: "ex-machine-press", exerciseName: "Machine Chest Press", load: 100, bestSetReps: 10 }),
        entry(2, { exerciseId: "ex-machine-press", exerciseName: "Machine Chest Press", load: 105, bestSetReps: 10 }),
        entry(3, { exerciseId: "ex-machine-press", exerciseName: "Machine Chest Press", load: 110, bestSetReps: 10 }),
      ]),
      repRange: settings.repRange,
      loadIncrement: 5,
    });

    expect(result.source).toBe("same_family_estimate");
    expect(result.load! % 5).toBe(0);
    expect(result.recommendationEvidence?.confidence).toBe("medium");
  });

  it("aligns same-family estimates to the learned exercise target zone", () => {
    const cableCurl = exercise({
      id: "ex-cable-curl",
      name: "Cable Curl",
      category: "biceps",
      primaryMuscles: ["biceps"],
      secondaryMuscles: ["forearms"],
      equipment: ["cable"],
      movementPattern: "isolation",
      defaultRepRange: { min: 12, max: 20 },
      kind: "cable",
      role: "isolation",
      roles: ["isolation"],
      family: "biceps_isolation",
      tier: "C",
    });
    const ropeCurl = exercise({
      id: "ex-rope-curl",
      name: "Rope Cable Curl",
      category: "biceps",
      primaryMuscles: ["biceps"],
      secondaryMuscles: ["forearms"],
      equipment: ["cable"],
      movementPattern: "isolation",
      kind: "cable",
      role: "isolation",
      roles: ["isolation"],
      family: "biceps_isolation",
      tier: "C",
    });
    const vBarCurl = exercise({
      id: "ex-vbar-curl",
      name: "V-Bar Cable Curl",
      category: "biceps",
      primaryMuscles: ["biceps"],
      secondaryMuscles: ["forearms"],
      equipment: ["cable"],
      movementPattern: "isolation",
      kind: "cable",
      role: "isolation",
      roles: ["isolation"],
      family: "biceps_isolation",
      tier: "C",
    });

    const result = estimateLoadFromSameFamily({
      targetExercise: cableCurl,
      exercises: [cableCurl, ropeCurl, vBarCurl],
      history: history([
        entry(1, { exerciseId: "ex-cable-curl", exerciseName: "Cable Curl", repsCompleted: 36, bestSetReps: 12, load: 20 }),
        entry(2, { exerciseId: "ex-cable-curl", exerciseName: "Cable Curl", repsCompleted: 48, bestSetReps: 16, progressionEarned: true, load: 20 }),
        entry(3, { exerciseId: "ex-cable-curl", exerciseName: "Cable Curl", repsCompleted: 54, bestSetReps: 18, progressionEarned: true, load: 22.5 }),
        entry(4, { exerciseId: "ex-cable-curl", exerciseName: "Cable Curl", repsCompleted: 60, bestSetReps: 20, progressionEarned: true, load: 25 }),
        entry(5, { exerciseId: "ex-rope-curl", exerciseName: "Rope Cable Curl", load: 40, bestSetReps: 20 }),
        entry(6, { exerciseId: "ex-vbar-curl", exerciseName: "V-Bar Cable Curl", load: 40, bestSetReps: 20 }),
      ]),
      repRange: { min: 12, max: 20 },
      loadIncrement: 0.1,
    });

    expect(result.source).toBe("same_family_estimate");
    expect(result.load).toBeLessThan(40.1);
  });

  it("rounds exact-history recommendations upward to the resolved increment", () => {
    const bench = exercise();
    const result = resolveStartingLoadRecommendation({
      targetExercise: bench,
      exercises: [bench],
      history: history([entry(1, { exerciseId: "ex-bench", exerciseName: "Bench Press", nextRecommendedLoad: 103.1, load: 100 })]),
      repRange: settings.repRange,
      loadIncrement: 1,
      referenceDate: new Date("2026-05-02T12:00:00.000Z"),
    });

    expect(result.source).toBe("exact_history");
    expect(result.load).toBe(104);
  });

  it("does not reduce load after one bad session", () => {
    const recommendation = recommendLoadRegression([entry(1, { stoppedByDropOff: true, qualitySets: 1, bestSetReps: 8, load: 100 })], 2.5);

    expect(recommendation.action).toBe("hold");
    expect(recommendation.evidence?.confidence).toBe("insufficient_data");
    expect(recommendation.evidence?.actionAllowed).toBe(false);
  });

  it("recommends reduced load after repeated objective decline", () => {
    const recommendation = recommendLoadRegression(
      [
        entry(1, { stoppedByDropOff: false, qualitySets: 4, bestSetReps: 12, load: 100 }),
        entry(2, { stoppedByDropOff: true, qualitySets: 2, bestSetReps: 10, load: 100 }),
        entry(3, { stoppedByDropOff: true, qualitySets: 1, bestSetReps: 8, load: 100 }),
      ],
      2.5,
    );

    expect(recommendation.action).toBe("reduce");
    expect(recommendation.load).toBe(95);
    expect(recommendation.evidence?.confidence).toBe("high");
    expect(recommendation.evidence?.dataPoints).toContain("best set regression");
  });

  it("rounds reduced-load recommendations to the resolved increment", () => {
    const recommendation = recommendLoadRegression(
      [
        entry(1, { stoppedByDropOff: false, qualitySets: 4, bestSetReps: 12, load: 102.5 }),
        entry(2, { stoppedByDropOff: true, qualitySets: 2, bestSetReps: 10, load: 102.5 }),
        entry(3, { stoppedByDropOff: true, qualitySets: 1, bestSetReps: 8, load: 102.5 }),
      ],
      5,
    );

    expect(recommendation.action).toBe("reduce");
    expect(recommendation.load).toBe(95);
    expect(recommendation.load).toBeLessThan(102.5);
  });

  it("uses severity bands and rounds reductions down to practical loads", () => {
    expect(resolveReducedLoad({ currentLoad: 100, increment: 2.5, severity: "mild" })).toBe(95);
    expect(resolveReducedLoad({ currentLoad: 100, increment: 2.5, severity: "moderate" })).toBe(92.5);
    expect(resolveReducedLoad({ currentLoad: 100, increment: 2.5, severity: "severe" })).toBe(90);
  });

  it("does not recommend the same load as a reduction", () => {
    const recommendation = recommendLoadRegression(
      [
        entry(1, { stoppedByDropOff: false, qualitySets: 4, bestSetReps: 12, load: 100 }),
        entry(2, { stoppedByDropOff: true, qualitySets: 2, bestSetReps: 10, load: 100 }),
        entry(3, { stoppedByDropOff: true, qualitySets: 1, bestSetReps: 8, load: 100 }),
      ],
      2.5,
    );

    expect(recommendation.action).toBe("reduce");
    expect(recommendation.load).not.toBe(100);
  });

  it("holds when a large increment would overcorrect mild decline", () => {
    const recommendation = recommendLoadRegression(
      [
        entry(1, { stoppedByDropOff: false, qualitySets: 4, bestSetReps: 12, load: 25 }),
        entry(2, { stoppedByDropOff: false, qualitySets: 3, bestSetReps: 10, load: 25 }),
        entry(3, { stoppedByDropOff: true, qualitySets: 1, bestSetReps: 8, load: 25 }),
      ],
      5,
    );

    expect(recommendation.action).toBe("caution");
    expect(recommendation.load).toBe(25);
    expect(recommendation.reasons).toContain("available load jump would overcorrect");
  });
});
