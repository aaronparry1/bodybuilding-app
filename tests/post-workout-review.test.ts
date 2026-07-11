import { describe, expect, it } from "vitest";
import type { PostWorkoutLoadDecision } from "@/domain/training/post-workout-review";
import type { WorkoutExerciseLog, WorkoutSession } from "@/domain/training/models";
import { applyPostWorkoutReviewLoadApprovals, buildPostWorkoutReview } from "@/domain/training/post-workout-review";
import { defaultHypertrophySettings } from "@/domain/training/presets";
import { summarizeWorkoutSession } from "@/domain/training/workout-history";

const settings = { ...defaultHypertrophySettings, requiredWorkSets: 3 };

describe("post-workout review", () => {
  it("separates warm-ups and work sets in the review summary", () => {
    const review = buildPostWorkoutReview({
      session: session("current", [exercise("bench", "Bench Press", 100, [12, 11, 10], [{ reps: 8, load: 40 }])]),
      previousSessions: [],
      completedAt: "2026-06-08T11:00:00.000Z",
    });

    expect(review.summary.workSetsCompleted).toBe(3);
    expect(review.summary.warmupsLogged).toBe(1);
    expect(review.summary.exercisesCompleted).toBe(1);
  });

  it("celebrates load PRs without treating warm-ups as work", () => {
    const previous = completedSession("previous", [exercise("bench", "Bench Press", 90, [12, 10, 9])]);
    const review = buildPostWorkoutReview({
      session: session("current", [exercise("bench", "Bench Press", 100, [10, 9, 8], [{ reps: 8, load: 40 }])]),
      previousSessions: [previous],
      completedAt: "2026-06-08T11:00:00.000Z",
    });

    expect(review.progressItems.some((item) => item.title === "New load PR")).toBe(true);
    expect(review.personalRecords.some((record) => record.type === "load" && record.status === "pr")).toBe(true);
    expect(review.summary.workSetsCompleted).toBe(3);
  });

  it("celebrates rep PRs at the same load", () => {
    const previous = completedSession("previous", [exercise("bench", "Bench Press", 100, [10, 9, 8])]);
    const review = buildPostWorkoutReview({
      session: session("current", [exercise("bench", "Bench Press", 100, [12, 10, 9])]),
      previousSessions: [previous],
      completedAt: "2026-06-08T11:00:00.000Z",
    });

    expect(review.progressItems.some((item) => item.title === "Rep PR")).toBe(true);
  });

  it("marks the first logged exercise with receipts copy", () => {
    const review = buildPostWorkoutReview({
      session: session("current", [exercise("bench", "Bench Press", 100, [10, 9, 8])]),
      previousSessions: [],
      completedAt: "2026-06-08T11:00:00.000Z",
    });

    expect(review.progressItems.some((item) => item.detail.includes("receipts"))).toBe(true);
    expect(review.personalRecords).toHaveLength(0);
    expect(review.baselines.length).toBeGreaterThan(0);
    expect(review.baselines.every((record) => record.status === "baseline")).toBe(true);
  });

  it("deduplicates PR cards for the same workout achievement", () => {
    const previous = completedSession("previous", [exercise("bench", "Bench Press", 100, [10, 10, 10])]);
    const review = buildPostWorkoutReview({
      session: session("current", [exercise("bench", "Bench Press", 100, [12, 12, 12])]),
      previousSessions: [previous],
      completedAt: "2026-06-08T11:00:00.000Z",
    });

    expect(review.personalRecords.filter((record) => record.type === "rep")).toHaveLength(1);
  });

  it("uses cautious copy for a strong first-baseline load increase", () => {
    const review = buildPostWorkoutReview({
      session: session("current", [exercise("bench", "Bench Press", 100, [12, 12, 12])]),
      previousSessions: [],
      completedAt: "2026-06-08T11:00:00.000Z",
    });

    expect(review.loadChanges[0]).toMatchObject({
      exerciseName: "Bench Press",
      currentLoad: 100,
      recommendedLoad: 102.5,
      direction: "increase",
    });
    expect(review.loadChanges[0]?.reason).toBe("Strong first baseline. You can try a small increase next time.");
    expect(review.loadChanges[0]?.reason).not.toBe("You earned more weight.");
  });

  it("holds first exposure when only one set reaches the top of the range", () => {
    const review = buildPostWorkoutReview({
      session: session("current", [exercise("bench", "Bench Press", 100, [12, 10, 10])]),
      previousSessions: [],
      completedAt: "2026-06-08T11:00:00.000Z",
    });

    expect(review.loadChanges).toHaveLength(0);
    expect(review.lowHistoryCopy).toBe("More data needed before stronger recommendations.");
  });

  it("uses normal earned-progression copy after previous exposure exists", () => {
    const previous = completedSession("previous", [exercise("bench", "Bench Press", 100, [10, 10, 10])]);
    const review = buildPostWorkoutReview({
      session: session("current", [exercise("bench", "Bench Press", 100, [12, 10, 10])]),
      previousSessions: [previous],
      completedAt: "2026-06-08T11:00:00.000Z",
    });

    expect(review.loadChanges[0]).toMatchObject({
      exerciseName: "Bench Press",
      currentLoad: 100,
      recommendedLoad: 102.5,
      direction: "increase",
      reason: "You earned more weight.",
    });
  });

  it("keeps a planned review decision stable when current range and block context change", () => {
    const completed = {
      ...exercise("bench", "Bench Press", 100, [5, 7, 6]),
      settings: { ...settings, repRange: { min: 12, max: 15 } },
      prescribedSetTargets: [5, 7, 6],
    };
    const changedCurrentContext = {
      ...completed,
      settings: { ...completed.settings, repRange: { min: 1, max: 3 } },
    };
    const baseline = buildPostWorkoutReview({
      session: session("stored-exact", [completed]),
      previousSessions: [completedSession("previous", [exercise("bench", "Bench Press", 100, [5, 7, 6])])],
      completedAt: "2026-06-08T11:00:00.000Z",
      currentBlock: "hypertrophy",
    });
    const changed = buildPostWorkoutReview({
      session: session("stored-exact", [changedCurrentContext]),
      previousSessions: [completedSession("previous", [exercise("bench", "Bench Press", 100, [5, 7, 6])])],
      completedAt: "2026-06-08T11:00:00.000Z",
      currentBlock: "deload",
    });

    expect(changed.loadChanges).toEqual(baseline.loadChanges);
  });

  it("can recommend a target-zone-aware increase without requiring the full top of the original range", () => {
    const approvedLowZone = (id: string, load: number, reps: number[], approvedLoad: number, completedAt: string) =>
      completedSession(
        id,
        [
          {
            ...exercise("bench", "Bench Press", load, reps),
            nextLoadApproval: {
              status: "approved" as const,
              recommendedLoad: approvedLoad,
              approvedLoad,
              reason: "Target zone owned.",
              reviewedAt: completedAt,
            },
          },
        ],
        completedAt,
      );
    const previousSessions = [
      approvedLowZone("low-1", 100, [8, 8, 8], 102.5, "2026-05-01T11:00:00.000Z"),
      approvedLowZone("low-2", 102.5, [9, 9, 9], 105, "2026-05-04T11:00:00.000Z"),
      approvedLowZone("low-3", 105, [8, 8, 8], 107.5, "2026-05-08T11:00:00.000Z"),
      completedSession("middle", [exercise("bench", "Bench Press", 105, [10, 10, 10])], "2026-05-12T11:00:00.000Z"),
      completedSession("high", [exercise("bench", "Bench Press", 105, [12, 12, 12])], "2026-05-16T11:00:00.000Z"),
    ];
    const review = buildPostWorkoutReview({
      session: session("current", [exercise("bench", "Bench Press", 107.5, [9, 9, 9])]),
      previousSessions,
      completedAt: "2026-06-08T11:00:00.000Z",
      currentBlock: "hypertrophy",
    });

    expect(review.loadChanges[0]).toMatchObject({
      exerciseName: "Bench Press",
      currentLoad: 107.5,
      recommendedLoad: 110,
      direction: "increase",
      reason: "Target zone owned. A small increase is available.",
    });
    expect(review.loadChanges[0]?.evidence).toContain("Target zone: 8-9 reps.");
  });

  it("does not recommend a load increase when manual pain finish ended the exercise", () => {
    const manuallyFinished = {
      ...exercise("bench", "Bench Press", 100, [12, 12, 12]),
      status: "complete" as const,
      finishedManually: true,
      finishReason: "pain_limitation" as const,
      finishedAt: "2026-06-08T10:30:00.000Z",
      finishType: "manual_completion" as const,
      shutdownReason: "Finished early: pain/limitation.",
    };

    const review = buildPostWorkoutReview({
      session: session("current", [manuallyFinished]),
      previousSessions: [],
      completedAt: "2026-06-08T11:00:00.000Z",
    });

    expect(review.loadChanges).toHaveLength(0);
    expect(review.summary.exercisesCompleted).toBe(1);
    expect(review.summary.allPlannedWorkComplete).toBe(true);
  });

  it("allows neutral manual completion to use cautious first-baseline recommendation evidence", () => {
    const manuallyFinished = {
      ...exercise("bench", "Bench Press", 100, [12, 12, 12]),
      status: "complete" as const,
      finishedManually: true,
      finishReason: "completed_enough" as const,
      finishedAt: "2026-06-08T10:30:00.000Z",
      finishType: "manual_completion" as const,
      shutdownReason: "Finished for today.",
    };

    const review = buildPostWorkoutReview({
      session: session("current", [manuallyFinished]),
      previousSessions: [],
      completedAt: "2026-06-08T11:00:00.000Z",
    });

    expect(review.loadChanges[0]).toMatchObject({
      exerciseName: "Bench Press",
      direction: "increase",
      reason: "Strong first baseline. You can try a small increase next time.",
    });
  });

  it("does not let swapped-in first exposure inherit confidence from the replaced exercise", () => {
    const swapped = {
      ...exercise("machine-chest-press", "Machine Chest Press", 80, [12, 10, 10]),
      swappedFromExerciseId: "ex-bench",
      swappedFromExerciseName: "Bench Press",
    };
    const previous = completedSession("previous", [exercise("bench", "Bench Press", 100, [12, 12, 12])]);
    const review = buildPostWorkoutReview({
      session: session("current", [swapped]),
      previousSessions: [previous],
      completedAt: "2026-06-08T11:00:00.000Z",
    });

    expect(review.loadChanges).toHaveLength(0);
  });

  it("does not aggressively progress an added exercise from one normal exposure", () => {
    const added = {
      ...exercise("elbows-out-extension", "Elbows Out Extension", 20, [12, 10, 10]),
      origin: "added_during_workout" as const,
    };
    const review = buildPostWorkoutReview({
      session: session("current", [added]),
      previousSessions: [],
      completedAt: "2026-06-08T11:00:00.000Z",
    });

    expect(review.loadChanges).toHaveLength(0);
  });

  it("handles bodyweight first exposure without inventing a load increase", () => {
    const bodyweight = {
      ...exercise("pull-up", "Pull-Up", 0, [12, 12, 12]),
      loadKnown: true,
    };
    const review = buildPostWorkoutReview({
      session: session("current", [bodyweight]),
      previousSessions: [],
      completedAt: "2026-06-08T11:00:00.000Z",
    });

    expect(review.loadChanges).toHaveLength(0);
  });

  it("can hold a technically earned increase when goal and fatigue make pushing load expensive", () => {
    const review = buildPostWorkoutReview({
      session: session("current", [exercise("cable-curl", "Cable Curl", 30, [12, 12, 12])]),
      previousSessions: [],
      completedAt: "2026-06-08T11:00:00.000Z",
      goal: "build_muscle",
      experienceLevel: "advanced",
      currentBlock: "hypertrophy",
    });

    expect(review.loadChanges[0]).toMatchObject({
      exerciseName: "Cable Curl",
      direction: "hold",
      currentLoad: 30,
      recommendedLoad: 30,
    });
    expect(review.loadChanges[0]?.reason).toContain("Hold");
  });

  it("still records next-session load changes after the final work set", () => {
    const review = buildPostWorkoutReview({
      session: session("current", [exercise("bench", "Bench Press", 100, [12, 12, 12])]),
      previousSessions: [],
      completedAt: "2026-06-08T11:00:00.000Z",
    });

    expect(review.loadChanges).toHaveLength(1);
    expect(review.loadChanges[0]).toMatchObject({
      exerciseName: "Bench Press",
      direction: "increase",
      recommendedLoad: 102.5,
    });
  });

  it("does not double-progress after in-session escalation already found the next load", () => {
    const current = session("current", [exerciseWithLoads("bench", "Bench Press", 105, [100, 100, 100, 102.5, 105], [12, 12, 12, 12, 12])]);
    const review = buildPostWorkoutReview({
      session: current,
      previousSessions: [],
      completedAt: "2026-06-08T11:00:00.000Z",
    });
    const summary = summarizeWorkoutSession({ ...current, completedAt: review.completedAt, updatedAt: review.completedAt });

    expect(summary?.exerciseSummaries[0].nextRecommendedLoad).toBe(105);
    expect(review.loadChanges).toHaveLength(0);
  });

  it("keeps a failed final escalated load out of the next-session baseline", () => {
    const current = session("current", [exerciseWithLoads("bench", "Bench Press", 105, [100, 100, 100, 102.5, 105], [12, 12, 12, 12, 5])]);
    const summary = summarizeWorkoutSession({ ...current, completedAt: "2026-06-08T11:00:00.000Z", updatedAt: "2026-06-08T11:00:00.000Z" });

    expect(summary?.exerciseSummaries[0].nextRecommendedLoad).toBe(102.5);
  });

  it("can still recommend another increase when the escalated load has enough extra successful work", () => {
    const review = buildPostWorkoutReview({
      session: session("current", [exerciseWithLoads("bench", "Bench Press", 105, [100, 102.5, 105, 105, 105, 105], [12, 12, 12, 12, 12, 12])]),
      previousSessions: [],
      completedAt: "2026-06-08T11:00:00.000Z",
    });

    expect(review.loadChanges[0]).toMatchObject({
      exerciseName: "Bench Press",
      currentLoad: 105,
      recommendedLoad: 107.5,
      direction: "increase",
    });
  });

  it("shows next-session decrease recommendations from real repeated-decline history", () => {
    const previousSessions = [
      completedSession("decline-1", [exercise("bench", "Bench Press", 100, [10, 8], [], "shutdown")], "2026-06-01T11:00:00.000Z"),
      completedSession("decline-2", [exercise("bench", "Bench Press", 100, [9, 7], [], "shutdown")], "2026-06-04T11:00:00.000Z"),
    ];
    const review = buildPostWorkoutReview({
      session: session("decline-3", [exercise("bench", "Bench Press", 100, [8, 6], [], "shutdown")]),
      previousSessions,
      completedAt: "2026-06-08T11:00:00.000Z",
    });

    expect(review.loadChanges[0]).toMatchObject({
      direction: "decrease",
      recommendedLoad: 90,
    });
  });

  it("reduces load after a clear miss below the prescribed rep range", () => {
    const current = session("current", [exercise("bench", "Bench Press", 100, [5, 5, 4])]);
    const review = buildPostWorkoutReview({
      session: current,
      previousSessions: [],
      completedAt: "2026-06-08T11:00:00.000Z",
    });
    const summary = summarizeWorkoutSession({ ...current, completedAt: review.completedAt, updatedAt: review.completedAt });

    expect(summary?.exerciseSummaries[0].nextRecommendedLoad).toBe(95);
    expect(review.loadChanges[0]).toMatchObject({
      exerciseName: "Bench Press",
      currentLoad: 100,
      recommendedLoad: 95,
      direction: "decrease",
      reason: "Back it down before pushing again.",
    });
    expect(review.loadChanges[0]?.evidence).toContain("All work sets missed the prescribed range. Use 95kg next time.");
  });

  it("reduces more confidently after repeated below-range shutdowns", () => {
    const previousSessions = [
      completedSession("miss-1", [exercise("bench", "Bench Press", 100, [7, 7, 6], [], "shutdown")], "2026-06-01T11:00:00.000Z"),
      completedSession("miss-2", [exercise("bench", "Bench Press", 100, [6, 6, 5], [], "shutdown")], "2026-06-04T11:00:00.000Z"),
    ];
    const review = buildPostWorkoutReview({
      session: session("miss-3", [exercise("bench", "Bench Press", 100, [5, 5, 4], [], "shutdown")]),
      previousSessions,
      completedAt: "2026-06-08T11:00:00.000Z",
    });

    expect(review.loadChanges[0]).toMatchObject({
      direction: "decrease",
      recommendedLoad: 90,
    });
  });

  it("does not increase after a partial miss with later set collapse", () => {
    const review = buildPostWorkoutReview({
      session: session("current", [exercise("bench", "Bench Press", 100, [8, 6, 5], [], "shutdown")]),
      previousSessions: [completedSession("previous", [exercise("bench", "Bench Press", 100, [8, 8, 8])])],
      completedAt: "2026-06-08T11:00:00.000Z",
    });

    expect(review.loadChanges).toHaveLength(0);
  });

  it("does not overreact to one bad work set when other sets reach the range", () => {
    const review = buildPostWorkoutReview({
      session: session("current", [exercise("bench", "Bench Press", 100, [10, 9, 5])]),
      previousSessions: [completedSession("previous", [exercise("bench", "Bench Press", 100, [10, 10, 10])])],
      completedAt: "2026-06-08T11:00:00.000Z",
    });

    expect(review.loadChanges).toHaveLength(0);
  });

  it("holds after barely meeting the minimum rep range", () => {
    const review = buildPostWorkoutReview({
      session: session("current", [exercise("bench", "Bench Press", 100, [8, 8, 8])]),
      previousSessions: [completedSession("previous", [exercise("bench", "Bench Press", 100, [8, 8, 8])])],
      completedAt: "2026-06-08T11:00:00.000Z",
    });

    expect(review.loadChanges).toHaveLength(0);
  });

  it("does not count warm-up reps as below-range miss evidence", () => {
    const review = buildPostWorkoutReview({
      session: session("current", [exercise("bench", "Bench Press", 100, [8, 8, 8], [{ reps: 5, load: 100 }])]),
      previousSessions: [completedSession("previous", [exercise("bench", "Bench Press", 100, [8, 8, 8])])],
      completedAt: "2026-06-08T11:00:00.000Z",
    });

    expect(review.summary.warmupsLogged).toBe(1);
    expect(review.loadChanges).toHaveLength(0);
  });

  it("keeps extra-session misses out of planned load recommendations", () => {
    const extra = { ...session("extra", [exercise("bench", "Bench Press", 100, [5, 5, 4])]), sessionKind: "extra_full" as const };
    const review = buildPostWorkoutReview({
      session: extra,
      previousSessions: [completedSession("previous", [exercise("bench", "Bench Press", 100, [8, 8, 8])])],
      completedAt: "2026-06-08T11:00:00.000Z",
    });
    const summary = summarizeWorkoutSession({ ...extra, completedAt: review.completedAt, updatedAt: review.completedAt });

    expect(summary?.exerciseSummaries[0].nextRecommendedLoad).toBe(100);
    expect(review.loadChanges).toHaveLength(0);
  });

  it("approved next-session changes are exposed to history summaries", () => {
    const current = session("current", [exercise("bench", "Bench Press", 100, [12, 12, 12])]);
    const review = buildPostWorkoutReview({
      session: current,
      previousSessions: [],
      completedAt: "2026-06-08T11:00:00.000Z",
    });
    const approved = applyPostWorkoutReviewLoadApprovals(current, review, decisions(review, "approved"));
    const summary = summarizeWorkoutSession({ ...approved, completedAt: review.completedAt, updatedAt: review.completedAt });

    expect(summary?.exerciseSummaries[0].nextRecommendedLoad).toBe(102.5);
    expect(summary?.exerciseSummaries[0].nextLoadApprovalStatus).toBe("approved");
  });

  it("kept next-session changes keep the previous starting load while preserving workout history", () => {
    const current = session("current", [exercise("bench", "Bench Press", 100, [12, 12, 12])]);
    const review = buildPostWorkoutReview({
      session: current,
      previousSessions: [],
      completedAt: "2026-06-08T11:00:00.000Z",
    });
    const kept = applyPostWorkoutReviewLoadApprovals(current, review, decisions(review, "kept"));
    const summary = summarizeWorkoutSession({ ...kept, completedAt: review.completedAt, updatedAt: review.completedAt });

    expect(summary?.setsCompleted).toBe(3);
    expect(summary?.exerciseSummaries[0].nextRecommendedLoad).toBe(100);
    expect(summary?.exerciseSummaries[0].nextLoadApprovalStatus).toBe("kept");
  });

  it("marks extra sessions without completing planned slots", () => {
    const review = buildPostWorkoutReview({
      session: { ...session("extra", [exercise("bench", "Bench Press", 100, [10, 9, 8])]), sessionKind: "extra_full" },
      previousSessions: [],
      completedAt: "2026-06-08T11:00:00.000Z",
    });

    expect(review.summary.extraSession).toBe(true);
    expect(review.progressItems.some((item) => item.title === "All planned work complete")).toBe(false);
  });

  it("uses the no-drama copy when no PRs or load changes exist", () => {
    const previous = completedSession("previous", [exercise("bench", "Bench Press", 100, [10, 10, 10])]);
    const review = buildPostWorkoutReview({
      session: session("current", [exercise("bench", "Bench Press", 100, [10, 10])]),
      previousSessions: [previous],
      completedAt: "2026-06-08T11:00:00.000Z",
    });

    expect(review.emptyStateCopy).toBe("Session saved. Nothing dramatic. That’s still training.");
  });
});

function decisions(
  review: ReturnType<typeof buildPostWorkoutReview>,
  decision: PostWorkoutLoadDecision,
): Record<string, PostWorkoutLoadDecision> {
  return Object.fromEntries(review.loadChanges.map((change) => [change.exerciseLogId, decision]));
}

function session(id: string, exercises: WorkoutExerciseLog[]): WorkoutSession {
  return {
    id,
    userId: null,
    programmeId: "programme-1",
    templateId: "day-1",
    planSessionIndex: 0,
    sessionKind: "planned",
    name: "Push",
    startedAt: "2026-06-08T10:00:00.000Z",
    updatedAt: "2026-06-08T10:00:00.000Z",
    syncState: "local",
    exercises,
  };
}

function completedSession(id: string, exercises: WorkoutExerciseLog[], completedAt = "2026-06-01T11:00:00.000Z"): WorkoutSession {
  return {
    ...session(id, exercises),
    startedAt: "2026-06-01T10:00:00.000Z",
    completedAt,
    updatedAt: completedAt,
  };
}

function exercise(
  id: string,
  name: string,
  load: number,
  workReps: number[],
  warmups: Array<{ reps: number; load: number }> = [],
  status: WorkoutExerciseLog["status"] = "active",
): WorkoutExerciseLog {
  return {
    id: `performed-${id}`,
    exerciseId: `ex-${id}`,
    exerciseName: name,
    load,
    loadKnown: true,
    settings,
    status,
    shutdownReason: status === "shutdown" ? "Performance dropped enough to move on." : undefined,
    sets: [
      ...warmups.map((set, index) => ({
        id: `warmup-${id}-${index + 1}`,
        setNumber: index + 1,
        reps: set.reps,
        load: set.load,
        loggedAt: "2026-06-08T10:05:00.000Z",
        type: "warmup" as const,
      })),
      ...workReps.map((reps, index) => ({
        id: `work-${id}-${index + 1}`,
        setNumber: index + 1,
        reps,
        load,
        loggedAt: "2026-06-08T10:10:00.000Z",
        type: "work" as const,
      })),
    ],
  };
}

function exerciseWithLoads(
  id: string,
  name: string,
  load: number,
  workLoads: number[],
  workReps: number[],
  status: WorkoutExerciseLog["status"] = "active",
): WorkoutExerciseLog {
  return {
    ...exercise(id, name, load, [], [], status),
    sets: workLoads.map((setLoad, index) => ({
      id: `work-${id}-${index + 1}`,
      setNumber: index + 1,
      reps: workReps[index] ?? 0,
      load: setLoad,
      loggedAt: "2026-06-08T10:10:00.000Z",
      type: "work" as const,
    })),
  };
}
