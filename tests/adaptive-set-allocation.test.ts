import { describe, expect, it } from "vitest";
import { decideAdaptiveSetAllocation } from "@/domain/training/adaptive-set-allocation";
import type { Exercise, ProgressionSettings, SetLog } from "@/domain/training/models";

const baseSettings: ProgressionSettings = {
  repRange: { min: 8, max: 12 },
  dropOffPercent: 15,
  loadIncrease: 2.5,
  requiredWorkSets: 2,
  recommendedMinSets: 2,
  recommendedMaxSets: 4,
  softCapSets: 5,
  unit: "kg",
};

const compound = {
  role: "primary_compound",
  family: "horizontal_press",
  primaryMuscles: ["chest"],
  movementPattern: "horizontal_push",
  fatigueCost: "high",
} satisfies Partial<Exercise>;

const isolation = {
  role: "isolation",
  family: "biceps_isolation",
  primaryMuscles: ["biceps"],
  movementPattern: "isolation",
  fatigueCost: "low",
} satisfies Partial<Exercise>;

describe("adaptive set allocation", () => {
  it("cannot stop before the minimum prescribed sets", () => {
    const decision = decideAdaptiveSetAllocation({
      exerciseName: "Bench Press",
      settings: baseSettings,
      sets: [work(1, 100, 12)],
      currentLoad: 100,
      metadata: compound,
      remainingExercises: 3,
    });

    expect(decision.action).toBe("continue");
    expect(decision.recommendation).toBe("continue");
    expect(decision.recommended_next).toBe("one_more_set");
    expect(decision.stimulus_status).toBe("insufficient");
    expect(decision.short_reason).toBe("Minimum not reached yet.");
  });

  it("stops after minimum sets when high-fatigue quality work is achieved", () => {
    const decision = decideAdaptiveSetAllocation({
      exerciseName: "Bench Press",
      settings: baseSettings,
      sets: [work(1, 100, 12), work(2, 100, 11)],
      currentLoad: 100,
      metadata: compound,
      remainingExercises: 3,
    });

    expect(decision.action).toBe("stop");
    expect(decision.recommendation).toBe("move_on");
    expect(decision.recommended_next).toBe("move_on");
    expect(decision.stimulus_status).toBe("sufficient");
    expect(decision.short_reason).toBe("Stimulus achieved. Save energy for the next lift.");
  });

  it("recommends one more set when useful stimulus remains", () => {
    const decision = decideAdaptiveSetAllocation({
      exerciseName: "Cable Curl",
      settings: baseSettings,
      sets: [work(1, 20, 11), work(2, 20, 10)],
      currentLoad: 20,
      metadata: isolation,
      remainingExercises: 1,
    });

    expect(decision.action).toBe("continue");
    expect(decision.recommended_next).toBe("one_more_set");
    expect(decision.short_reason).toBe("One more productive set.");
  });

  it("returns max_reached at the prescribed maximum and never exceeds max sets", () => {
    const decision = decideAdaptiveSetAllocation({
      exerciseName: "Cable Curl",
      settings: baseSettings,
      sets: [work(1, 20, 12), work(2, 20, 12), work(3, 20, 11), work(4, 20, 10)],
      currentLoad: 20,
      metadata: isolation,
    });

    expect(decision.action).toBe("max_reached");
    expect(decision.recommendation).toBe("max_reached");
    expect(decision.recommended_next).toBe("move_on");
    expect(decision.short_reason).toBe("Max sets reached.");
  });

  it("stops instead of adding junk volume after same-load below-minimum evidence", () => {
    const decision = decideAdaptiveSetAllocation({
      exerciseName: "Bench Press",
      settings: baseSettings,
      sets: [work(1, 100, 8), work(2, 100, 6)],
      currentLoad: 100,
      metadata: compound,
      remainingExercises: 2,
    });

    expect(decision.action).toBe("stop");
    expect(decision.recommended_next).toBe("move_on");
    expect(decision.short_reason).toBe("Below target. Move on.");
  });

  it("does not punish productive heavier-load fatigue inside the target range", () => {
    const highRepSettings: ProgressionSettings = {
      ...baseSettings,
      repRange: { min: 12, max: 25 },
      recommendedMinSets: 2,
      recommendedMaxSets: 5,
      requiredWorkSets: 2,
    };
    const decision = decideAdaptiveSetAllocation({
      exerciseName: "Spider Curl",
      settings: highRepSettings,
      sets: [
        work(1, 5, 25),
        work(2, 5, 25),
        work(3, 5, 25),
        work(4, 10, 20),
      ],
      currentLoad: 10,
      metadata: isolation,
    });

    expect(decision.action).toBe("continue");
    expect(decision.recommended_next).toBe("complete_prescribed_max");
    expect(decision.debug_reasons.join(" ")).toContain("high quality");
  });

  it("respects shutdown and drop-off stop rules", () => {
    const explicitShutdown = decideAdaptiveSetAllocation({
      exerciseName: "Bench Press",
      settings: baseSettings,
      sets: [work(1, 100, 12), work(2, 100, 10)],
      currentLoad: 100,
      metadata: compound,
      shutdown: true,
    });
    const dropOff = decideAdaptiveSetAllocation({
      exerciseName: "Bench Press",
      settings: baseSettings,
      sets: [work(1, 100, 12), work(2, 100, 11), work(3, 100, 8)],
      currentLoad: 100,
      metadata: compound,
    });

    expect(explicitShutdown.action).toBe("stop");
    expect(dropOff.action).toBe("stop");
    expect(dropOff.short_reason).toBe("Fatigue is rising. Move on.");
  });

  it("lets low-fatigue isolation continue when quality remains high", () => {
    const decision = decideAdaptiveSetAllocation({
      exerciseName: "Cable Fly",
      settings: baseSettings,
      sets: [work(1, 25, 12), work(2, 25, 12), work(3, 25, 11)],
      currentLoad: 25,
      metadata: isolation,
      remainingExercises: 3,
    });

    expect(decision.action).toBe("continue");
    expect(decision.recommended_next).toBe("complete_prescribed_max");
  });

  it("allows 2-4 sets to stop at 2, recommend 3, or go to 4 when justified", () => {
    const stopAtTwo = decideAdaptiveSetAllocation({
      exerciseName: "Squat",
      settings: baseSettings,
      sets: [work(1, 140, 10), work(2, 140, 9)],
      currentLoad: 140,
      metadata: { ...compound, movementPattern: "squat" },
      remainingExercises: 4,
    });
    const recommendThird = decideAdaptiveSetAllocation({
      exerciseName: "Lateral Raise",
      settings: baseSettings,
      sets: [work(1, 12, 12), work(2, 12, 11)],
      currentLoad: 12,
      metadata: isolation,
    });
    const goToFourth = decideAdaptiveSetAllocation({
      exerciseName: "Lateral Raise",
      settings: baseSettings,
      sets: [work(1, 12, 12), work(2, 12, 12), work(3, 12, 11)],
      currentLoad: 12,
      metadata: isolation,
    });

    expect(stopAtTwo.action).toBe("stop");
    expect(recommendThird.recommended_next).toBe("one_more_set");
    expect(goToFourth.recommended_next).toBe("complete_prescribed_max");
  });

  it("handles 2-5 and 3-5 ranges without exceeding the prescribed maximum", () => {
    const twoToFive: ProgressionSettings = {
      ...baseSettings,
      requiredWorkSets: 2,
      recommendedMinSets: 2,
      recommendedMaxSets: 5,
    };
    const threeToFive: ProgressionSettings = {
      ...baseSettings,
      requiredWorkSets: 3,
      recommendedMinSets: 3,
      recommendedMaxSets: 5,
    };

    const twoToFiveDecision = decideAdaptiveSetAllocation({
      exerciseName: "Cable Curl",
      settings: twoToFive,
      sets: [work(1, 20, 12), work(2, 20, 12), work(3, 20, 11), work(4, 20, 10)],
      currentLoad: 20,
      metadata: isolation,
    });
    const threeToFiveMinimum = decideAdaptiveSetAllocation({
      exerciseName: "Leg Press",
      settings: threeToFive,
      sets: [work(1, 180, 12), work(2, 180, 11)],
      currentLoad: 180,
      metadata: { ...compound, fatigueCost: "moderate" },
    });
    const threeToFiveMax = decideAdaptiveSetAllocation({
      exerciseName: "Leg Press",
      settings: threeToFive,
      sets: [work(1, 180, 12), work(2, 180, 11), work(3, 180, 10), work(4, 180, 9), work(5, 180, 8)],
      currentLoad: 180,
      metadata: { ...compound, fatigueCost: "moderate" },
    });

    expect(twoToFiveDecision.recommendation).toBe("continue");
    expect(twoToFiveDecision.recommended_next).toBe("complete_prescribed_max");
    expect(threeToFiveMinimum.recommendation).toBe("continue");
    expect(threeToFiveMinimum.short_reason).toBe("Minimum not reached yet.");
    expect(threeToFiveMax.recommendation).toBe("max_reached");
  });

  it("handles duration exercises using seconds without converting to fake reps", () => {
    const durationSettings: ProgressionSettings = {
      ...baseSettings,
      measurementType: "duration",
      repRange: { min: 30, max: 45 },
      durationIncreaseSeconds: 5,
    };

    const decision = decideAdaptiveSetAllocation({
      exerciseName: "Plank",
      settings: durationSettings,
      sets: [work(1, 0, 45), work(2, 0, 40)],
      currentLoad: 0,
      metadata: { role: "accessory", family: "core_stability", primaryMuscles: ["abs"], movementPattern: "core", fatigueCost: "low" },
    });

    expect(decision.action).toBe("continue");
    expect(decision.recommended_next).toBe("one_more_set");
  });

  it("keeps user-facing reasons compact", () => {
    const decision = decideAdaptiveSetAllocation({
      exerciseName: "Bench Press",
      settings: baseSettings,
      sets: [work(1, 100, 12), work(2, 100, 11)],
      currentLoad: 100,
      metadata: compound,
      remainingExercises: 3,
    });

    expect(decision.short_reason.length).toBeLessThanOrEqual(80);
    expect(decision.short_reason.split(".").length).toBeLessThanOrEqual(3);
  });

  it("does not call network, scan history, or mutate logged sets", () => {
    const sets = [warmup(1, 60, 8), work(1, 100, 12), work(2, 100, 11)];
    const original = structuredClone(sets);
    const decision = decideAdaptiveSetAllocation({
      exerciseName: "Bench Press",
      settings: baseSettings,
      sets,
      currentLoad: 100,
      metadata: compound,
      remainingExercises: 2,
      currentSessionWorkingSetCount: 2,
    });

    expect(decision.action).toBe("stop");
    expect(sets).toEqual(original);
    expect(decision.debug_reasons.some((reason) => reason.includes("completed 2/2-4"))).toBe(true);
  });

  it("does not treat two easy top-range sets as automatically complete when prescription intent needs verification", () => {
    const decision = decideAdaptiveSetAllocation({
      exerciseName: "Bench Press",
      settings: baseSettings,
      sets: [work(1, 100, 12), work(2, 100, 12)],
      currentLoad: 100,
      metadata: compound,
      remainingExercises: 3,
      repPrescription: {
        prescription_type: "top_range_check",
        set_objective: "verification",
        coaching_bias: "tension",
      },
    });

    expect(decision.action).toBe("continue");
    expect(decision.recommended_next).toBe("one_more_set");
    expect(decision.short_reason).toBe("Possible underload. Verify with one more.");
    expect(decision.debug_reasons.join(" ")).toContain("prevents early move-on");
  });

  it("runs synchronously with negligible local overhead", () => {
    const startedAt = performance.now();
    let lastDecision = decideAdaptiveSetAllocation({
      exerciseName: "Cable Curl",
      settings: baseSettings,
      sets: [work(1, 20, 12), work(2, 20, 11)],
      currentLoad: 20,
      metadata: isolation,
    });

    for (let index = 0; index < 1000; index += 1) {
      lastDecision = decideAdaptiveSetAllocation({
        exerciseName: "Cable Curl",
        settings: baseSettings,
        sets: [work(1, 20, 12), work(2, 20, 11), work(3, 20, 10)],
        currentLoad: 20,
        metadata: isolation,
      });
    }

    expect(lastDecision.recommendation).toBe("continue");
    expect(performance.now() - startedAt).toBeLessThan(100);
  });
});

function work(setNumber: number, load: number, reps: number): SetLog {
  return {
    id: `work-${setNumber}`,
    setNumber,
    load,
    reps,
    loggedAt: `2026-06-28T10:0${setNumber}:00.000Z`,
    type: "work",
  };
}

function warmup(setNumber: number, load: number, reps: number): SetLog {
  return {
    id: `warmup-${setNumber}`,
    setNumber,
    load,
    reps,
    loggedAt: `2026-06-28T09:5${setNumber}:00.000Z`,
    type: "warmup",
  };
}
