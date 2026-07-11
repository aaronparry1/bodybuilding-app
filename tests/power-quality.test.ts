import { describe, expect, it } from "vitest";
import { resolvePowerQuality } from "@/domain/training/power-quality";
import { resolveProgressionThrottle } from "@/domain/training/progression-throttle";
import type { ExerciseHistorySummary, SetLog } from "@/domain/training/models";

describe("power quality model", () => {
  it("classifies sharp power work when output is stable and fatigue is low", () => {
    const result = resolvePowerQuality({
      repTarget: 3,
      trainingLane: "power",
      completedProductiveWorkSets: [set(1, 3), set(2, 3), set(3, 3)],
      fatigueSignal: "low",
    });

    expect(result.status).toBe("sharp");
    expect(result.coachCopy).toBe("Power looks sharp.");
  });

  it("classifies acceptable power work when completed work has minor degradation", () => {
    const result = resolvePowerQuality({
      repTarget: 3,
      trainingLane: "power",
      completedProductiveWorkSets: [set(1, 3), set(2, 3), set(3, 2)],
      fatigueSignal: "low",
    });

    expect(result.status).toBe("acceptable");
    expect(result.coachCopy).toBe("Keep quality high.");
  });

  it("classifies degrading power work from output drop, missed work, or fatigue", () => {
    const result = resolvePowerQuality({
      repTarget: 3,
      trainingLane: "power",
      completedProductiveWorkSets: [set(1, 3), set(2, 2), set(3, 1)],
      targetWorkSets: 4,
      fatigueSignal: "high",
    });

    expect(result.status).toBe("degrading");
    expect(result.coachCopy).toBe("Speed is fading. Pull back.");
    expect(result.evidence.join(" ")).not.toMatch(/\bRPE\b|\bRIR\b/i);
  });

  it("returns insufficient data outside power context or before enough work exists", () => {
    const nonPower = resolvePowerQuality({
      repTarget: 3,
      trainingLane: "hypertrophy",
      completedProductiveWorkSets: [set(1, 3), set(2, 3)],
    });
    const thinPower = resolvePowerQuality({
      repTarget: 3,
      trainingLane: "power",
      completedProductiveWorkSets: [set(1, 3)],
    });

    expect(nonPower.status).toBe("insufficient_data");
    expect(thinPower.status).toBe("insufficient_data");
  });

  it("lets power progression push only when quality is sharp", () => {
    const decision = resolveProgressionThrottle({
      exerciseRole: "power",
      exerciseFamily: "olympic_power",
      goal: "athletic_performance",
      experienceLevel: "intermediate",
      currentBlock: "power",
      trainingLane: "power",
      targetRepRange: { min: 2, max: 3 },
      progressionEarned: true,
      recentExercisePerformance: [
        entry(1, { repsCompleted: 9, qualitySets: 3, bestSetReps: 3 }),
        entry(2, { repsCompleted: 9, qualitySets: 3, bestSetReps: 3 }),
        entry(3, { repsCompleted: 9, qualitySets: 3, bestSetReps: 3 }),
      ],
    });

    expect(decision.decision).toBe("push");
    expect(decision.evidence.join(" ")).toContain("Power looks sharp");
  });

  it("holds power progression when quality is acceptable", () => {
    const decision = resolveProgressionThrottle({
      exerciseRole: "power",
      exerciseFamily: "jump_power",
      goal: "athletic_performance",
      experienceLevel: "intermediate",
      currentBlock: "power",
      trainingLane: "power",
      targetRepRange: { min: 2, max: 3 },
      progressionEarned: true,
      recentVolumeFatigueSignal: "moderate",
      recentExercisePerformance: [
        entry(1, { repsCompleted: 9, qualitySets: 3, bestSetReps: 3 }),
        entry(2, { repsCompleted: 9, qualitySets: 3, bestSetReps: 3 }),
        entry(3, { repsCompleted: 8, qualitySets: 3, bestSetReps: 3 }),
      ],
    });

    expect(decision.decision).toBe("hold");
    expect(decision.reason).toBe("Keep quality high.");
  });

  it("pulls back power progression when quality is degrading", () => {
    const decision = resolveProgressionThrottle({
      exerciseRole: "power",
      exerciseFamily: "olympic_power",
      goal: "athletic_performance",
      experienceLevel: "intermediate",
      currentBlock: "power",
      trainingLane: "power",
      targetRepRange: { min: 2, max: 3 },
      progressionEarned: true,
      recentExercisePerformance: [
        entry(1, { repsCompleted: 9, qualitySets: 3, bestSetReps: 3 }),
        entry(2, { repsCompleted: 6, qualitySets: 2, bestSetReps: 2, stoppedByDropOff: true }),
        entry(3, { repsCompleted: 3, qualitySets: 1, bestSetReps: 1, stoppedByDropOff: true }),
      ],
    });

    expect(decision.decision).toBe("pull_back");
    expect(decision.suggestedAction).toBe("reduce_load");
    expect(decision.reason).toBe("Speed is fading. Pull back.");
  });

  it("does not introduce RPE or RIR language", () => {
    const result = resolvePowerQuality({
      repTarget: 3,
      trainingLane: "power",
      recentExercisePerformance: [entry(1), entry(2), entry(3)],
    });

    expect([result.reason, result.coachCopy, ...result.evidence].join(" ")).not.toMatch(/\bRPE\b|\bRIR\b/i);
  });
});

function set(index: number, reps: number): SetLog {
  return {
    id: `set-${index}`,
    setNumber: index,
    reps,
    load: 60,
    loggedAt: `2026-05-0${index}T12:00:00.000Z`,
    type: "work",
  };
}

function entry(index: number, patch: Partial<ExerciseHistorySummary> = {}): ExerciseHistorySummary {
  return {
    sessionId: `session-${index}`,
    sessionName: "Power",
    completedAt: `2026-05-${String(index).padStart(2, "0")}T12:00:00.000Z`,
    exerciseLogId: `log-${index}`,
    exerciseId: "ex-power-clean",
    exerciseName: "Power Clean",
    load: 60,
    unit: "kg",
    setsCompleted: 3,
    repsCompleted: 9,
    qualitySets: 3,
    bestSetReps: 3,
    dropOffThreshold: 10,
    stoppedByDropOff: false,
    progressionEarned: false,
    nextRecommendedLoad: 60,
    volumeLoad: 540,
    trainingLane: "power",
    ...patch,
  };
}
