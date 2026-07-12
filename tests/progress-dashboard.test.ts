import { describe, expect, it } from "vitest";
import { buildProgressDashboardViewModel, cleanGeneratedSessionName } from "@/domain/training/progress-dashboard";
import { buildPlannedWorkoutProgramme } from "@/domain/training/planned-workout";
import type { ExerciseHistorySummary, WorkoutHistorySummary, WorkoutSession } from "@/domain/training/models";
import { exerciseLibrary } from "@/domain/training/presets";
import { createActiveTrainingPlan } from "@/domain/training/plan-setup";
import { keepExerciseDespiteRotationRecommendation, startDeloadPlan } from "@/domain/training/recommendation-actions";
import type { TrainingSetupGoal } from "@/domain/training/plan-setup";
import { resolveSetPrescription } from "@/domain/training/set-prescription";
import { summarizeWorkoutSession } from "@/domain/training/workout-history";

function exerciseEntry(index: number, patch: Partial<ExerciseHistorySummary> = {}): ExerciseHistorySummary {
  return {
    sessionId: `session-${index}`,
    sessionName: `AI Push • Push ${index}`,
    completedAt: `2026-06-${String(index + 1).padStart(2, "0")}T10:00:00.000Z`,
    exerciseLogId: `bench-${index}`,
    exerciseId: "ex-bench-press",
    exerciseName: "Bench Press",
    load: 100,
    unit: "kg",
    setsCompleted: 4,
    repsCompleted: 42,
    qualitySets: 4,
    bestSetReps: 12,
    dropOffThreshold: 15,
    stoppedByDropOff: false,
    progressionEarned: true,
    nextRecommendedLoad: 105,
    volumeLoad: 4200,
    ...patch,
  };
}

function workout(index: number, entries: ExerciseHistorySummary[] = [exerciseEntry(index)], patch: Partial<WorkoutHistorySummary> = {}): WorkoutHistorySummary {
  const completedAt = `2026-06-${String(index + 1).padStart(2, "0")}T10:00:00.000Z`;
  return {
    sessionId: `session-${index}`,
    sessionName: `AI Push • Push`,
    startedAt: completedAt,
    completedAt,
    durationMinutes: 60,
    exercisesCompleted: entries.length,
    setsCompleted: entries.reduce((sum, entry) => sum + entry.setsCompleted, 0),
    repsCompleted: entries.reduce((sum, entry) => sum + entry.repsCompleted, 0),
    totalLoadVolume: entries.reduce((sum, entry) => sum + entry.volumeLoad, 0),
    progressionHighlights: entries.filter((entry) => entry.progressionEarned).map((entry) => `${entry.exerciseName} -> ${entry.nextRecommendedLoad}${entry.unit}`),
    exerciseSummaries: entries,
    ...patch,
  };
}

describe("progress dashboard view model", () => {
  it("projects current context separately from immutable historical metrics", () => {
    const progress = buildProgressDashboardViewModel([workout(1)], exerciseLibrary);

    expect(progress.currentProgressContext).toMatchObject({ status: "compatibility" });
    expect(progress.currentStrategicSummary).toMatchObject({ status: "compatibility" });
    expect(progress.recentWorkouts[0]?.sessionId).toBe("session-1");
  });

  it("excludes zero-set completed or abandoned sessions from normal recent workouts", () => {
    const zeroSet = workout(9, [], {
      sessionId: "zero",
      sessionName: "AI Pull • Pull",
      exercisesCompleted: 0,
      setsCompleted: 0,
      repsCompleted: 0,
      totalLoadVolume: 0,
      progressionHighlights: [],
      exerciseSummaries: [],
    });
    const progress = buildProgressDashboardViewModel([zeroSet, workout(1)], exerciseLibrary);

    expect(progress.recentWorkouts).toHaveLength(1);
    expect(progress.recentWorkouts[0]?.sessionId).toBe("session-1");
    expect(progress.hiddenZeroSetWorkouts).toHaveLength(1);
  });

  it("keeps stored planned prescription outcomes intact when current planning context changes", () => {
    const historical = workout(1, [exerciseEntry(1, {
      prescribedSetTargets: [5, 7, 6],
      repRange: { min: 12, max: 15 },
      qualitySets: 3,
      progressionEarned: true,
    })]);

    const musclePlan = buildProgressDashboardViewModel([historical], exerciseLibrary, activePlan("build_muscle"));
    const strengthPlan = buildProgressDashboardViewModel([historical], exerciseLibrary, activePlan("build_strength"));

    expect(musclePlan.completedWorkouts[0]?.exerciseSummaries[0]).toMatchObject({
      prescribedSetTargets: [5, 7, 6],
      progressionEarned: true,
    });
    expect(strengthPlan.completedWorkouts[0]?.exerciseSummaries[0]).toEqual(musclePlan.completedWorkouts[0]?.exerciseSummaries[0]);
  });

  it("cleans generated workout names before Progress displays them", () => {
    const progress = buildProgressDashboardViewModel([workout(1, [exerciseEntry(1)], { sessionName: "AI Arms • Arms" })], exerciseLibrary);

    expect(cleanGeneratedSessionName("AI Push • Push")).toBe("Push");
    expect(progress.recentWorkouts[0]?.name).toBe("Arms");
  });

  it("lets fatigue verdict override aggressive load-increase coach action", () => {
    const history = [0, 1, 2, 3].map((index) =>
      workout(index, [
        exerciseEntry(index, {
          exerciseId: "ex-bench-press",
          exerciseName: "Bench Press",
          progressionEarned: false,
          stoppedByDropOff: true,
          qualitySets: 5 - index,
          bestSetReps: 12 - index,
        }),
        exerciseEntry(index, {
          exerciseId: "ex-cable-fly",
          exerciseName: "Cable Fly",
          progressionEarned: index === 3,
          stoppedByDropOff: false,
          qualitySets: 3,
          bestSetReps: 15,
          nextRecommendedLoad: 22.5,
        }),
      ]),
    );
    const progress = buildProgressDashboardViewModel(history, exerciseLibrary);

    expect(progress.verdictTitle).toBe("Fatigue is the limiter.");
    expect(progress.actionTitle).toBe("Recovery session planned.");
    expect(progress.actionMessage).not.toContain("increase load");
    expect(progress.progressionNote).toContain("Cable Fly: increase load");
    expect(progress.journeyActions.primary).toEqual({ label: "View recovery plan", href: "/(protected)/(tabs)/programmes" });
    expect(progress.journeyActions.secondary).toBeUndefined();
    expect(progress.actionFlow?.type).toBe("deload");
    if (progress.actionFlow?.type !== "deload") throw new Error("Expected automatic deload flow");
    expect(progress.actionFlow.title).toBe("Recovery session planned");
    expect(progress.actionFlow.primaryLabel).toBe("View recovery plan");
    expect("secondaryLabel" in progress.actionFlow).toBe(false);
    expect(progress.actionFlow.evidence.summary).toContain("automatically");
  });

  it("does not recommend a Recovery Window from repeated productive hypertrophy accessory shutdowns alone", () => {
    const history = [0, 1, 2, 3].map((index) =>
      workout(index, [
        exerciseEntry(index, {
          exerciseId: "ex-cable-fly",
          exerciseName: "Cable Fly",
          load: index >= 2 ? 22.5 : 20,
          progressionEarned: true,
          stoppedByDropOff: true,
          qualitySets: 3,
          bestSetReps: 15 + index,
          repsCompleted: 45 + index,
          nextRecommendedLoad: index >= 2 ? 25 : 22.5,
        }),
      ]),
    );
    const progress = buildProgressDashboardViewModel(history, exerciseLibrary, activePlan("build_muscle"));

    expect(progress.actionFlow?.type).not.toBe("deload");
    expect(progress.verdictMessage).toMatch(/Hard productive work|Local fatigue|Progression/i);
    expect(progress.recommendationEvidence.dataPoints.join(" ")).toContain("productive");
  });

  it("does not recommend a Recovery Window after only two planned sessions, even when extra work is noisy", () => {
    const planned = [0, 1].map((index) =>
      workout(index, [
        exerciseEntry(index, {
          progressionEarned: false,
          stoppedByDropOff: true,
          qualitySets: 2,
          bestSetReps: 6,
        }),
      ]),
    );
    const extras = [2, 3, 4].map((index) =>
      workout(index, [
        exerciseEntry(index, {
          progressionEarned: false,
          stoppedByDropOff: true,
          qualitySets: 1,
          bestSetReps: 5,
        }),
      ], { sessionKind: "extra_full" }),
    );

    const progress = buildProgressDashboardViewModel([...planned, ...extras], exerciseLibrary, activePlan());

    expect(progress.hasEnoughHistory).toBe(false);
    expect(progress.actionFlow).toBeUndefined();
    expect(progress.actionTitle).toBe("Build more history first.");
  });

  it("keeps one bad planned session local instead of escalating to a full Recovery Window", () => {
    const history = [0, 1, 2, 3].map((index) =>
      workout(index, [
        exerciseEntry(index, {
          progressionEarned: index < 3,
          stoppedByDropOff: index === 3,
          qualitySets: index === 3 ? 1 : 4,
          bestSetReps: index === 3 ? 5 : 12,
        }),
      ]),
    );

    const progress = buildProgressDashboardViewModel(history, exerciseLibrary, activePlan());

    expect(progress.actionFlow?.type).not.toBe("deload");
    expect(progress.actionTitle).not.toBe("Reduce workload first.");
  });

  it("recognises an accepted deload instead of repeating the stale fatigue action", () => {
    const history = [0, 1, 2, 3].map((index) =>
      workout(index, [
        exerciseEntry(index, {
          progressionEarned: false,
          stoppedByDropOff: true,
          qualitySets: 5 - index,
          bestSetReps: 12 - index,
        }),
      ]),
    );
    const plan = startDeloadPlan(activePlan());
    const progress = buildProgressDashboardViewModel(history, exerciseLibrary, plan);

    expect(progress.actionFlow?.type).toBe("accepted");
    expect(progress.actionFlow?.title).toBe("Recovery session planned");
  });

  it("keeps mild fatigue evidence below the full Recovery Window action threshold", () => {
    const progress = buildProgressDashboardViewModel(mildDeloadHistory(), exerciseLibrary, activePlan("athletic_performance"));

    expect(progress.actionFlow?.type).not.toBe("deload");
    expect(progress.actionTitle).not.toBe("Reduce workload first.");
  });

  it("carries repeated systemic deload evidence into the automatic recovery plan", () => {
    const plan = activePlan("build_muscle_and_strength");
    const progress = buildProgressDashboardViewModel(severeDeloadHistory(), exerciseLibrary, plan);

    expect(progress.actionFlow?.type).toBe("deload");
    if (progress.actionFlow?.type !== "deload") throw new Error("Expected deload action flow");
    expect(progress.actionFlow.deloadProfile).toBe("severe");

    const accepted = startDeloadPlan(plan, "2026-06-06T10:00:00.000Z", progress.actionFlow.deloadProfile);
    const activeBlock = accepted.blocks.find((block) => block.id === accepted.activeBlockId);

    expect(activeBlock?.type).toBe("deload");
    expect(activeBlock?.notes.join(" ")).toContain("reduce productive sets 50-70%");
  });

  it("accepting a Recovery Window changes the active generated prescription, not just the roadmap", () => {
    const plan = activePlan();
    const normalBlock = plan.blocks.find((block) => block.id === plan.activeBlockId)!;
    const normalProgramme = buildPlannedWorkoutProgramme({
      activePlan: plan,
      exercises: exerciseLibrary,
      currentBlock: normalBlock,
      selectedSessionIndex: 0,
      history: [],
    });

    const accepted = startDeloadPlan(plan, "2026-06-06T10:00:00.000Z", "clear");
    const recoveryBlock = accepted.blocks.find((block) => block.id === accepted.activeBlockId)!;
    const recoveryProgramme = buildPlannedWorkoutProgramme({
      activePlan: accepted,
      exercises: exerciseLibrary,
      currentBlock: recoveryBlock,
      selectedSessionIndex: 0,
      history: [],
    });

    const normalPrescriptions = normalProgramme!.days[0]!.exerciseSlots.map((slot) => resolveSetPrescription(slot.settings));
    const recoveryPrescriptions = recoveryProgramme!.days[0]!.exerciseSlots.map((slot) => resolveSetPrescription(slot.settings));

    expect(recoveryBlock.type).toBe("deload");
    expect(recoveryProgramme?.name).toContain("Upper");
    expect(recoveryProgramme!.days[0]!.exerciseSlots.length).toBeLessThanOrEqual(normalProgramme!.days[0]!.exerciseSlots.length);
    expect(recoveryProgramme!.days[0]!.exerciseSlots.every((slot) => slot.settings.trainingLane === "maintenance")).toBe(true);
    expect(recoveryPrescriptions.every((prescription) => prescription.recommendedMaxSets <= 3)).toBe(true);
    expect(
      recoveryPrescriptions.reduce((sum, prescription) => sum + prescription.recommendedMaxSets, 0),
    ).toBeLessThan(normalPrescriptions.reduce((sum, prescription) => sum + prescription.recommendedMaxSets, 0));
  });

  it("shows a low-history state before enough real completed sessions exist", () => {
    const progress = buildProgressDashboardViewModel([workout(1), workout(2)], exerciseLibrary);

    expect(progress.hasEnoughHistory).toBe(false);
    expect(progress.verdictTitle).toBe("Not enough data yet.");
    expect(progress.actionTitle).toBe("Build more history first.");
    expect(progress.recommendationEvidence.confidence).toBe("insufficient_data");
    expect(progress.recommendationEvidence.actionAllowed).toBe(false);
    expect(progress.actionFlow).toBeUndefined();
    expect(progress.journeyActions.primary).toEqual({ label: "Log a workout", href: "/(protected)/(tabs)/train" });
    expect(progress.journeyActions.secondary?.label).toBe("Review plan");
  });

  it("counts work sets only on recent workout cards after warm-up sets are summarized", () => {
    const session: WorkoutSession = {
      id: "warmup-session",
      userId: "guest-local",
      name: "AI Push • Push",
      startedAt: "2026-06-04T10:00:00.000Z",
      completedAt: "2026-06-04T11:00:00.000Z",
      updatedAt: "2026-06-04T11:00:00.000Z",
      syncState: "local",
      exercises: [
        {
          id: "bench-log",
          exerciseId: "ex-bench-press",
          exerciseName: "Bench Press",
          settings: exerciseLibrary.find((exercise) => exercise.id === "ex-bench-press")!.defaultSettings,
          load: 100,
          loadKnown: true,
          status: "complete",
          sets: [
            { id: "warmup-1", setNumber: 1, reps: 8, load: 40, loggedAt: "2026-06-04T10:05:00.000Z", type: "warmup" },
            { id: "work-1", setNumber: 1, reps: 12, load: 100, loggedAt: "2026-06-04T10:15:00.000Z", type: "work" },
            { id: "work-2", setNumber: 2, reps: 11, load: 100, loggedAt: "2026-06-04T10:20:00.000Z", type: "work" },
          ],
        },
      ],
    };
    const summary = summarizeWorkoutSession(session)!;
    const progress = buildProgressDashboardViewModel([summary], exerciseLibrary);

    expect(summary.setsCompleted).toBe(2);
    expect(progress.recentWorkouts[0]?.workSetsLabel).toBe("2 work sets");
  });

  it("hides warm-up-only completed sessions from Progress coaching metrics", () => {
    const session: WorkoutSession = {
      id: "warmup-only",
      userId: "guest-local",
      name: "Push",
      startedAt: "2026-06-04T10:00:00.000Z",
      completedAt: "2026-06-04T10:20:00.000Z",
      updatedAt: "2026-06-04T10:20:00.000Z",
      syncState: "local",
      exercises: [
        {
          id: "bench-log",
          exerciseId: "ex-bench-press",
          exerciseName: "Bench Press",
          settings: exerciseLibrary.find((exercise) => exercise.id === "ex-bench-press")!.defaultSettings,
          load: 80,
          loadKnown: true,
          status: "active",
          sets: [
            { id: "warmup-1", setNumber: 1, reps: 12, load: 40, loggedAt: "2026-06-04T10:05:00.000Z", type: "warmup" },
            { id: "warmup-2", setNumber: 2, reps: 8, load: 60, loggedAt: "2026-06-04T10:10:00.000Z", type: "warmup" },
          ],
        },
      ],
    };
    const summary = summarizeWorkoutSession(session)!;
    const progress = buildProgressDashboardViewModel([summary], exerciseLibrary);

    expect(summary.setsCompleted).toBe(0);
    expect(progress.completedWorkouts).toEqual([]);
    expect(progress.hiddenZeroSetWorkouts).toEqual([summary]);
    expect(progress.recentWorkouts).toEqual([]);
    expect(progress.recommendationEvidence.confidence).toBe("insufficient_data");
  });

  it("uses real history only and does not create placeholder recent workouts", () => {
    const progress = buildProgressDashboardViewModel([], exerciseLibrary);

    expect(progress.completedWorkouts).toEqual([]);
    expect(progress.recentWorkouts).toEqual([]);
    expect(progress.recentProgress).toEqual([]);
  });

  it("surfaces meaningful volume recommendations without raw landmark labels", () => {
    const progress = buildProgressDashboardViewModel(
      [1, 8, 15].map((index) => workout(index, [exerciseEntry(index, { qualitySets: 7, progressionEarned: false, stoppedByDropOff: false })])),
      exerciseLibrary,
      activePlan("build_muscle"),
    );

    expect(progress.volumeRecommendation).toContain("Aim for the top of the range");
    expect(progress.volumeRecommendation).not.toMatch(/MEV|MAV|MRV/);
    expect(progress.actionFlow).toMatchObject({
      type: "volume",
      primaryLabel: "Apply change",
      secondaryLabel: "Ignore for now",
    });
  });

  it("suppresses volume recommendations until enough completed history exists", () => {
    const progress = buildProgressDashboardViewModel(
      [workout(1, [exerciseEntry(1, { qualitySets: 3, progressionEarned: false, stoppedByDropOff: false })])],
      exerciseLibrary,
    );

    expect(progress.hasEnoughHistory).toBe(false);
    expect(progress.volumeRecommendation).toBeUndefined();
  });

  it("surfaces stalled Tier A rotation recommendations with a clear reason", () => {
    const history = [1, 2, 3, 4].map((index) =>
      workout(index, [
        exerciseEntry(index, {
          exerciseId: "ex-bench-press",
          exerciseName: "Bench Press",
          progressionEarned: false,
          bestSetReps: 9,
          qualitySets: 3,
        }),
      ]),
    );
    const progress = buildProgressDashboardViewModel(history, exerciseLibrary);

    expect(progress.rotationRecommendation).toContain("Rotate Bench Press");
    expect(progress.rotationRecommendation).toContain("stalled across 4 exposures");
    expect(progress.rotationRecommendation).toContain("Suggested replacement");
    expect(progress.journeyActions.primary).toEqual({ label: "Review rotation in Train", href: "/(protected)/(tabs)/train" });
    expect(progress.journeyActions.secondary?.label).toBe("Keep exercise");
    expect(progress.actionFlow?.type).toBe("rotation");
    expect(progress.actionFlow?.evidence.confidence).toBe("high");
    expect(progress.actionFlow?.evidence.dataPoints.join(" ")).toContain("stalled across 4 exposures");
  });

  it("suppresses a kept stalled exercise recommendation", () => {
    const history = [1, 2, 3, 4].map((index) =>
      workout(index, [
        exerciseEntry(index, {
          exerciseId: "ex-bench-press",
          exerciseName: "Bench Press",
          progressionEarned: false,
          bestSetReps: 9,
          qualitySets: 3,
        }),
      ]),
    );
    const plan = keepExerciseDespiteRotationRecommendation(activePlan(), "ex-bench-press", "Still useful.");
    const progress = buildProgressDashboardViewModel(history, exerciseLibrary, plan);

    expect(progress.rotationRecommendation).toBeUndefined();
    expect(progress.actionFlow?.type).not.toBe("rotation");
  });

  it("does not recommend rotating a progressing Tier A exercise", () => {
    const history = [1, 2, 3, 4].map((index) =>
      workout(index, [
        exerciseEntry(index, {
          exerciseId: "ex-bench-press",
          exerciseName: "Bench Press",
          progressionEarned: true,
          bestSetReps: 12,
          qualitySets: 3,
          nextRecommendedLoad: 100 + index * 2.5,
        }),
      ]),
    );
    const progress = buildProgressDashboardViewModel(history, exerciseLibrary);

    expect(progress.rotationRecommendation).toBeUndefined();
  });
});

function activePlan(goal: TrainingSetupGoal = "build_muscle_and_strength") {
  return createActiveTrainingPlan(
    {
      goal,
      planningChoice: "recommended_12_month",
      equipmentPreset: "full_gym",
      daysPerWeek: 4,
      preferredSplit: "upper_lower",
      experienceLevel: "intermediate",
    },
    "2026-06-01T08:00:00.000Z",
  );
}

function mildDeloadHistory(): WorkoutHistorySummary[] {
  return [0, 1, 2, 3].map((index) =>
    workout(index, [
      exerciseEntry(index, {
        progressionEarned: true,
        stoppedByDropOff: index === 3,
        qualitySets: 6 - index,
        bestSetReps: 10 + index,
      }),
    ]),
  );
}

function severeDeloadHistory(): WorkoutHistorySummary[] {
  return [0, 1, 2, 3].map((index) =>
    workout(index, [
      exerciseEntry(index, {
        progressionEarned: false,
        stoppedByDropOff: true,
        qualitySets: Math.max(1, 4 - index),
        bestSetReps: 12 - index,
      }),
    ]),
  );
}
