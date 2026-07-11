import { describe, expect, it } from "vitest";
import { resolveProgressionThrottle } from "@/domain/training/progression-throttle";
import type { ExerciseHistorySummary, ExperienceLevel } from "@/domain/training/models";

const base = {
  exerciseRole: "primary_compound" as const,
  exerciseFamily: "horizontal_press" as const,
  goal: "build_muscle_and_strength" as const,
  experienceLevel: "intermediate" as const,
  currentBlock: "hypertrophy" as const,
  targetRepRange: { min: 8, max: 12 },
  progressionEarned: true,
};

describe("progression throttle", () => {
  it("pushes when progression was earned and fatigue is low", () => {
    const decision = resolveProgressionThrottle({
      ...base,
      recentExercisePerformance: [
        entry(1, { progressionEarned: true, qualitySets: 4, bestSetReps: 12 }),
        entry(2, { progressionEarned: true, qualitySets: 4, bestSetReps: 12 }),
      ],
    });

    expect(decision.decision).toBe("push");
    expect(decision.suggestedAction).toBe("increase_load");
    expect(decision.reason).toContain("earned");
  });

  it("holds when progression was earned but fatigue cost is high", () => {
    const decision = resolveProgressionThrottle({
      ...base,
      recentVolumeFatigueSignal: "high",
      recentExercisePerformance: [entry(1), entry(2), entry(3, { progressionEarned: true })],
    });

    expect(decision.decision).toBe("hold");
    expect(decision.suggestedAction).toBe("hold_load");
  });

  it("pulls back on repeated objective decline", () => {
    const decision = resolveProgressionThrottle({
      ...base,
      progressionEarned: false,
      recentExercisePerformance: [
        entry(1, { bestSetReps: 10, qualitySets: 2, stoppedByDropOff: true }),
        entry(2, { bestSetReps: 8, qualitySets: 1, stoppedByDropOff: true }),
        entry(3, { bestSetReps: 6, qualitySets: 1, stoppedByDropOff: true }),
      ],
    });

    expect(decision.decision).toBe("pull_back");
    expect(decision.suggestedAction).toBe("reduce_load");
  });

  it("lets beginners push strong compound trends more readily than advanced lifters", () => {
    const beginner = resolveProgressionThrottle({
      ...base,
      experienceLevel: "beginner",
      recentVolumeFatigueSignal: "moderate",
      recentExercisePerformance: [entry(1, { progressionEarned: true }), entry(2, { progressionEarned: true })],
    });
    const advanced = resolveProgressionThrottle({
      ...base,
      experienceLevel: "advanced",
      recentVolumeFatigueSignal: "moderate",
      recentExercisePerformance: [entry(1, { progressionEarned: true }), entry(2, { progressionEarned: true })],
    });

    expect(beginner.decision).toBe("push");
    expect(advanced.decision).toBe("hold");
  });

  it("uses goal-specific interpretation for strength, muscle, athletic, and general goals", () => {
    const strength = resolveProgressionThrottle({
      ...base,
      goal: "build_strength",
      recentVolumeFatigueSignal: "high",
    });
    const muscle = resolveProgressionThrottle({
      ...base,
      goal: "build_muscle",
      exerciseRole: "isolation",
      exerciseFamily: "biceps_isolation",
      targetRepRange: { min: 12, max: 25 },
      recentVolumeFatigueSignal: "moderate",
    });
    const athletic = resolveProgressionThrottle({
      ...base,
      goal: "athletic_performance",
      recentVolumeFatigueSignal: "moderate",
    });
    const general = resolveProgressionThrottle({
      ...base,
      goal: "get_leaner",
      recentVolumeFatigueSignal: "moderate",
    });

    expect(strength.reason).toContain("main lift");
    expect(muscle.decision).toBe("hold");
    expect(athletic.reason).toContain("Quality");
    expect(general.reason).toContain("Hold");
  });

  it("uses rep range and exercise role to make isolation load jumps more conservative", () => {
    const compound = resolveProgressionThrottle({
      ...base,
      exerciseRole: "primary_compound",
      targetRepRange: { min: 3, max: 5 },
      recentExercisePerformance: [entry(1, { progressionEarned: true }), entry(2, { progressionEarned: true }), entry(3, { progressionEarned: true })],
    });
    const isolation = resolveProgressionThrottle({
      ...base,
      exerciseRole: "isolation",
      exerciseFamily: "triceps_isolation",
      experienceLevel: "advanced",
      targetRepRange: { min: 12, max: 25 },
      recentExercisePerformance: [entry(1, { progressionEarned: true })],
    });

    expect(compound.decision).toBe("push");
    expect(isolation.decision).toBe("hold");
  });

  it("suppresses push during deload and records extra-session evidence without forcing planned progression", () => {
    const deload = resolveProgressionThrottle({ ...base, isDeload: true });
    const extra = resolveProgressionThrottle({ ...base, isExtraSession: true });

    expect(deload.decision).toBe("hold");
    expect(extra.evidence.join(" ")).toContain("Extra-session evidence");
  });

  it("uses separated systemic fatigue to hold broad progression", () => {
    const decision = resolveProgressionThrottle({
      ...base,
      fatigueClassification: {
        classification: "systemic",
        severity: "high",
        confidence: "high",
        evidence: ["Multiple unrelated lifts are declining.", "3 recent sessions include shutdown/drop-off."],
        recommendedResponse: "Hold broad progression and consider deload, re-entry, or a calmer week.",
        affectedExerciseIds: ["ex-bench-press", "ex-deadlift"],
        affectedMuscles: ["chest", "hamstrings"],
      },
    });

    expect(decision.decision).toBe("hold");
    expect(decision.suggestedAction).toBe("deload_or_volume_caution");
    expect(decision.reason).toContain("Fatigue is spreading");
  });

  it("keeps exercise-specific fatigue local instead of forcing a global deload", () => {
    const decision = resolveProgressionThrottle({
      ...base,
      progressionEarned: false,
      fatigueClassification: {
        classification: "exercise_specific",
        severity: "moderate",
        confidence: "medium",
        evidence: ["Bench Press is declining repeatedly."],
        recommendedResponse: "Hold or reduce this lift and consider a close variation. Do not deload the whole plan from one lift.",
        affectedExerciseIds: ["ex-bench-press"],
        affectedMuscles: ["chest"],
      },
    });

    expect(decision.decision).toBe("pull_back");
    expect(decision.suggestedAction).toBe("reduce_load");
    expect(decision.evidence.join(" ")).toContain("Bench Press");
  });

  it("uses training lanes to hold peak/recovery work and protect power quality", () => {
    const peak = resolveProgressionThrottle({ ...base, trainingLane: "peak" });
    const recovery = resolveProgressionThrottle({ ...base, trainingLane: "recovery" });
    const power = resolveProgressionThrottle({ ...base, trainingLane: "power", recentVolumeFatigueSignal: "moderate" });

    expect(peak.decision).toBe("hold");
    expect(recovery.decision).toBe("hold");
    expect(power.decision).toBe("hold");
    expect(power.reason).toContain("quality");
  });

  it("does not introduce subjective RPE or RIR language", () => {
    const decision = resolveProgressionThrottle({ ...base, recentVolumeFatigueSignal: "high" });
    expect([decision.reason, ...decision.evidence].join(" ")).not.toMatch(/\bRPE\b|\bRIR\b/i);
  });
});

function entry(index: number, patch: Partial<ExerciseHistorySummary> = {}): ExerciseHistorySummary {
  return {
    sessionId: `session-${index}`,
    sessionName: "Push",
    completedAt: `2026-05-${String(index).padStart(2, "0")}T12:00:00.000Z`,
    exerciseLogId: `log-${index}`,
    exerciseId: "ex-bench-press",
    exerciseName: "Bench Press",
    load: 100,
    unit: "kg",
    setsCompleted: 3,
    repsCompleted: 30,
    qualitySets: 3,
    bestSetReps: 12,
    dropOffThreshold: 15,
    stoppedByDropOff: false,
    progressionEarned: false,
    nextRecommendedLoad: 100,
    volumeLoad: 3000,
    ...patch,
  };
}
