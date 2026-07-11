import { describe, expect, it } from "vitest";
import {
  decideAdaptiveRepPrescription,
  inferExerciseArchetype,
  type AdaptiveRepPrescriptionContext,
} from "@/domain/training/adaptive-rep-prescription";

const hypertrophyBase = {
  goal: "hypertrophy",
  exerciseName: "Incline Dumbbell Press",
  trainingPhase: "accumulation",
  prescribedRange: { min: 8, max: 12 },
  exerciseExposureCount: 3,
  loadEstimateConfidence: 80,
} satisfies AdaptiveRepPrescriptionContext;

describe("adaptive rep prescription", () => {
  it("uses fixed hypertrophy reps for tension, balanced, and metabolic bias", () => {
    const tension = decideAdaptiveRepPrescription({ ...hypertrophyBase, coachingBias: "tension" });
    const balanced = decideAdaptiveRepPrescription({ ...hypertrophyBase, coachingBias: "balanced" });
    const metabolic = decideAdaptiveRepPrescription({ ...hypertrophyBase, exerciseName: "Cable Curl", coachingBias: "metabolic", prescribedRange: { min: 10, max: 20 } });

    expect(tension.prescription_type).toBe("fixed_reps");
    expect(tension.target_reps).toBe(8);
    expect(tension.set_objective).toBe("productive");
    expect(balanced.target_reps).toBe(10);
    expect(metabolic.target_reps).toBe(12);
  });

  it("supports strength peak singles, doubles, and triples through low-rep peak ranges", () => {
    const single = decideAdaptiveRepPrescription({
      goal: "strength",
      exerciseName: "Competition Squat",
      trainingPhase: "peak",
      recentPerformanceSignal: "improving",
      exerciseExposureCount: 5,
      loadEstimateConfidence: 90,
    });
    const double = decideAdaptiveRepPrescription({
      goal: "strength",
      exerciseName: "Competition Bench Press",
      trainingPhase: "peak",
      exerciseExposureCount: 5,
      loadEstimateConfidence: 90,
    });
    const triple = decideAdaptiveRepPrescription({
      goal: "strength",
      exerciseName: "Barbell Row",
      trainingPhase: "peak",
      exerciseExposureCount: 4,
      loadEstimateConfidence: 85,
    });

    expect(single.target_reps).toBe(1);
    expect(single.rep_range).toEqual({ min: 1, max: 3 });
    expect(double.target_reps).toBe(2);
    expect(triple.target_reps).toBe(3);
    expect(triple.rep_range).toEqual({ min: 2, max: 5 });
  });

  it("uses 2-5 work for strength intensification and moderate reps for accumulation", () => {
    const intensification = decideAdaptiveRepPrescription({
      goal: "strength",
      exerciseName: "Competition Deadlift",
      trainingPhase: "intensification",
      exerciseExposureCount: 4,
      loadEstimateConfidence: 88,
    });
    const accumulation = decideAdaptiveRepPrescription({
      goal: "strength",
      exerciseName: "Competition Deadlift",
      trainingPhase: "accumulation",
      exerciseExposureCount: 4,
      loadEstimateConfidence: 88,
    });

    expect(intensification.rep_range).toEqual({ min: 1, max: 4 });
    expect(intensification.target_reps).toBe(2);
    expect(accumulation.rep_range).toEqual({ min: 2, max: 5 });
    expect(accumulation.target_reps).toBe(3);
  });

  it("represents Prilepin-inspired constraints without using them as dogma", () => {
    const prescription = decideAdaptiveRepPrescription({
      goal: "strength",
      exerciseName: "Competition Squat",
      trainingPhase: "intensification",
      exerciseExposureCount: 4,
      loadEstimateConfidence: 90,
    });

    expect(prescription.rep_range?.max).toBeLessThanOrEqual(5);
    expect(prescription.debug_reasons.join(" ")).toContain("Prilepin-inspired");
  });

  it("keeps power movements low rep and high quality", () => {
    const boxJump = decideAdaptiveRepPrescription({
      goal: "athletic_performance",
      exerciseName: "Box Jump",
      trainingPhase: "accumulation",
    });
    const speedBench = decideAdaptiveRepPrescription({
      goal: "athletic_performance",
      exerciseName: "Speed Bench",
      trainingPhase: "intensification",
    });

    expect(boxJump.coaching_bias).toBe("speed_power");
    expect(boxJump.rep_range).toEqual({ min: 2, max: 4 });
    expect(speedBench.rep_range).toEqual({ min: 1, max: 3 });
    expect(speedBench.debug_reasons.join(" ")).toContain("no bar-speed claims");
  });

  it("uses AMRAP for calibration and caps AMRAP for high-risk lifts", () => {
    const lowRisk = decideAdaptiveRepPrescription({
      goal: "hypertrophy",
      exerciseName: "Lateral Raise",
      trainingPhase: "accumulation",
      setObjective: "calibration",
      prescribedRange: { min: 12, max: 25 },
      fatigueCost: "low",
      loadEstimateConfidence: 80,
    });
    const highRisk = decideAdaptiveRepPrescription({
      goal: "strength",
      exerciseName: "Competition Squat",
      trainingPhase: "accumulation",
      setObjective: "calibration",
      prescribedRange: { min: 3, max: 8 },
      movementPattern: "squat",
      fatigueCost: "high",
    });

    expect(lowRisk.prescription_type).toBe("amrap");
    expect(lowRisk.amrap_cap).toBe(25);
    expect(highRisk.prescription_type).toBe("capped_amrap");
    expect(highRisk.amrap_cap).toBeLessThanOrEqual(8);
    expect(highRisk.short_reason).toContain("cap");
  });

  it("uses top-range checks for verification", () => {
    const prescription = decideAdaptiveRepPrescription({
      goal: "hypertrophy",
      exerciseName: "Chest Press",
      trainingPhase: "accumulation",
      setObjective: "verification",
      prescribedRange: { min: 8, max: 12 },
    });

    expect(prescription.prescription_type).toBe("top_range_check");
    expect(prescription.rep_range).toEqual({ min: 8, max: 12 });
    expect(prescription.short_reason).toBe("Top-range check.");
  });

  it("uses recovery prescriptions during recovery or deload contexts", () => {
    const prescription = decideAdaptiveRepPrescription({
      goal: "build_muscle_strength",
      exerciseName: "Leg Press",
      trainingPhase: "deload",
      prescribedRange: { min: 8, max: 15 },
      recoveryFlag: true,
    });

    expect(prescription.prescription_type).toBe("recovery_reps");
    expect(prescription.set_objective).toBe("recovery");
    expect(prescription.coaching_bias).toBe("recovery");
    expect(prescription.load_strategy).toBe("recovery_load");
  });

  it("keeps get lean prescriptions conservative", () => {
    const prescription = decideAdaptiveRepPrescription({
      goal: "get_lean",
      exerciseName: "Romanian Deadlift",
      trainingPhase: "accumulation",
      prescribedRange: { min: 8, max: 12 },
      coachingBias: "metabolic",
      loadEstimateConfidence: 45,
    });

    expect(prescription.prescription_type).toBe("fixed_reps");
    expect(prescription.coaching_bias).toBe("balanced");
    expect(prescription.load_strategy).toBe("conservative_load");
    expect(prescription.confidence).toBeLessThan(70);
    expect(prescription.debug_reasons.join(" ")).toContain("avoids unnecessary AMRAP");
  });

  it("keeps maintenance simple and controlled", () => {
    const prescription = decideAdaptiveRepPrescription({
      goal: "maintenance",
      exerciseName: "Chest Supported Row",
      trainingPhase: "maintenance",
      prescribedRange: { min: 8, max: 12 },
    });

    expect(prescription.prescription_type).toBe("fixed_reps");
    expect(prescription.target_reps).toBe(10);
    expect(prescription.short_reason).toBe("Controlled work.");
  });

  it("preserves maintenance recovery bias without turning it into peak work", () => {
    const prescription = decideAdaptiveRepPrescription({
      goal: "maintenance",
      exerciseName: "Competition Deadlift",
      exerciseCategory: "competition_deadlift",
      trainingPhase: "accumulation",
      coachingBias: "recovery",
      setObjective: "productive",
      prescribedRange: { min: 2, max: 5 },
    });

    expect(prescription.set_objective).toBe("productive");
    expect(prescription.coaching_bias).toBe("recovery");
    expect(prescription.prescription_type).toBe("fixed_reps");
  });

  it("does not give duration exercises fake rep language", () => {
    const prescription = decideAdaptiveRepPrescription({
      goal: "hypertrophy",
      exerciseName: "Plank",
      trainingPhase: "accumulation",
      prescribedRange: { min: 30, max: 45 },
    });

    expect(prescription.prescription_type).toBe("duration_hold");
    expect(prescription.target_reps).toBeUndefined();
    expect(prescription.target_seconds).toBeGreaterThanOrEqual(30);
    expect(prescription.duration_range).toEqual({ min: 30, max: 45 });
    expect(prescription.debug_reasons.join(" ")).toContain("duration fields, not fake reps");
    expect(prescription.short_reason.toLowerCase()).not.toContain("reps");
  });

  it("does not route non-power athletic performance exercises to power-style reps", () => {
    const squat = decideAdaptiveRepPrescription({
      goal: "athletic_performance",
      exerciseName: "Competition Squat",
      trainingPhase: "accumulation",
      exerciseCategory: "competition_squat",
      loadEstimateConfidence: 85,
    });
    const row = decideAdaptiveRepPrescription({
      goal: "athletic_performance",
      exerciseName: "Barbell Row",
      trainingPhase: "accumulation",
      exerciseCategory: "heavy_compound",
      movementPattern: "horizontal_pull",
    });
    const lateralRaise = decideAdaptiveRepPrescription({
      goal: "athletic_performance",
      exerciseName: "Lateral Raise",
      trainingPhase: "accumulation",
      exerciseCategory: "isolation",
      coachingBias: "speed_power",
    });

    expect(squat.rep_range).toEqual({ min: 3, max: 6 });
    expect(squat.load_strategy).toBe("conservative_load");
    expect(squat.coaching_bias).toBe("skill");
    expect(row.rep_range).toEqual({ min: 4, max: 8 });
    expect(row.load_strategy).toBe("conservative_load");
    expect(lateralRaise.rep_range).toEqual({ min: 8, max: 15 });
    expect(lateralRaise.coaching_bias).toBe("balanced");
    expect(lateralRaise.debug_reasons.join(" ")).toContain("accessory work stays conservative");
  });

  it("preserves power objectives while intentionally overriding non-power bias", () => {
    const prescription = decideAdaptiveRepPrescription({
      goal: "athletic_performance",
      exerciseName: "Medicine Ball Throw",
      exerciseCategory: "power",
      trainingPhase: "peak",
      setObjective: "performance",
      coachingBias: "peak",
      prescribedRange: { min: 1, max: 3 },
    });

    expect(prescription.set_objective).toBe("performance");
    expect(prescription.coaching_bias).toBe("speed_power");
    expect(prescription.debug_reasons.join(" ")).toContain("intentionally overrides session intent");
  });

  it("keeps hypertrophy isolation peak contexts out of very low-rep peak prescriptions", () => {
    const prescription = decideAdaptiveRepPrescription({
      goal: "hypertrophy",
      exerciseName: "Leg Extension",
      exerciseCategory: "isolation",
      trainingPhase: "peak",
      setObjective: "verification",
      coachingBias: "tension",
      prescribedRange: { min: 10, max: 15 },
      exerciseExposureCount: 4,
      loadEstimateConfidence: 90,
    });

    expect(prescription.prescription_type).toBe("top_range_check");
    expect(prescription.rep_range).toEqual({ min: 10, max: 15 });
    expect(prescription.target_reps).toBeUndefined();
  });

  it("keeps actual power movements low rep and speed/power biased", () => {
    const throwPrescription = decideAdaptiveRepPrescription({
      goal: "athletic_performance",
      exerciseName: "Medicine Ball Throw",
      trainingPhase: "accumulation",
      exerciseCategory: "power",
    });

    expect(throwPrescription.coaching_bias).toBe("speed_power");
    expect(throwPrescription.rep_range).toEqual({ min: 2, max: 4 });
    expect(throwPrescription.load_strategy).toBe("quality_speed_load");
  });

  it("separates squat, bench, and deadlift strength prescriptions", () => {
    const squat = decideAdaptiveRepPrescription({
      goal: "strength",
      exerciseName: "Competition Squat",
      exerciseCategory: "competition_squat",
      trainingPhase: "accumulation",
      loadEstimateConfidence: 90,
    });
    const bench = decideAdaptiveRepPrescription({
      goal: "strength",
      exerciseName: "Competition Bench Press",
      exerciseCategory: "competition_bench",
      trainingPhase: "accumulation",
      loadEstimateConfidence: 90,
    });
    const deadlift = decideAdaptiveRepPrescription({
      goal: "strength",
      exerciseName: "Competition Deadlift",
      exerciseCategory: "competition_deadlift",
      trainingPhase: "accumulation",
      loadEstimateConfidence: 90,
    });

    expect(squat.rep_range).toEqual({ min: 3, max: 6 });
    expect(bench.rep_range).toEqual({ min: 4, max: 6 });
    expect(deadlift.rep_range).toEqual({ min: 2, max: 5 });
    expect(deadlift.debug_reasons.join(" ")).toContain("deadlift uses stricter");
  });

  it("never uses open AMRAP for deadlift calibration", () => {
    const prescription = decideAdaptiveRepPrescription({
      goal: "strength",
      exerciseName: "Competition Deadlift",
      exerciseCategory: "competition_deadlift",
      trainingPhase: "accumulation",
      setObjective: "calibration",
      prescribedRange: { min: 3, max: 8 },
      loadEstimateConfidence: 95,
    });

    expect(prescription.prescription_type).toBe("capped_amrap");
    expect(prescription.amrap_cap).toBeLessThanOrEqual(8);
    expect(prescription.rep_range?.max).toBeLessThanOrEqual(6);
    expect(prescription.debug_reasons.join(" ")).toContain("deadlift calibration never uses open AMRAP");
  });

  it("prevents high-rep deadlift drift in build muscle + strength", () => {
    const prescription = decideAdaptiveRepPrescription({
      goal: "build_muscle_strength",
      exerciseName: "Competition Deadlift",
      exerciseCategory: "competition_deadlift",
      trainingPhase: "accumulation",
      prescribedRange: { min: 5, max: 10 },
    });

    expect(prescription.rep_range).toEqual({ min: 3, max: 6 });
    expect(prescription.target_reps).toBe(5);
    expect(prescription.debug_reasons.join(" ")).toContain("strength-biased and controlled");
  });

  it("uses moderate support ranges for strength isolation accessories", () => {
    const prescription = decideAdaptiveRepPrescription({
      goal: "strength",
      exerciseName: "Triceps Pushdown",
      exerciseCategory: "isolation",
      trainingPhase: "accumulation",
    });

    expect(prescription.rep_range).toEqual({ min: 8, max: 15 });
    expect(prescription.target_reps).toBe(12);
    expect(prescription.debug_reasons.join(" ")).toContain("not heavy low-rep defaults");
  });

  it("uses category-specific maintenance prescriptions", () => {
    const deadlift = decideAdaptiveRepPrescription({
      goal: "maintenance",
      exerciseName: "Competition Deadlift",
      exerciseCategory: "competition_deadlift",
      trainingPhase: "maintenance",
      prescribedRange: { min: 8, max: 12 },
    });
    const isolation = decideAdaptiveRepPrescription({
      goal: "maintenance",
      exerciseName: "Cable Curl",
      exerciseCategory: "isolation",
      trainingPhase: "maintenance",
      prescribedRange: { min: 8, max: 12 },
    });

    expect(deadlift.rep_range).toEqual({ min: 2, max: 5 });
    expect(deadlift.target_reps).toBe(3);
    expect(isolation.rep_range).toEqual({ min: 10, max: 15 });
    expect(isolation.target_reps).toBe(12);
  });

  it("uses duration_carry output for carry prescriptions", () => {
    const prescription = decideAdaptiveRepPrescription({
      goal: "maintenance",
      exerciseName: "Farmer Carry",
      exerciseCategory: "duration_bodyweight",
      movementPattern: "carry",
      trainingPhase: "maintenance",
      prescribedRange: { min: 20, max: 40 },
    });

    expect(prescription.prescription_type).toBe("duration_carry");
    expect(prescription.target_seconds).toBe(30);
    expect(prescription.duration_range).toEqual({ min: 20, max: 40 });
    expect(prescription.target_reps).toBeUndefined();
  });

  it("decouples uncertain calibration from automatic AMRAP", () => {
    const uncertain = decideAdaptiveRepPrescription({
      goal: "hypertrophy",
      exerciseName: "Chest Press",
      exerciseCategory: "machine_compound",
      trainingPhase: "accumulation",
      setObjective: "calibration",
      prescribedRange: { min: 8, max: 12 },
      loadEstimateConfidence: 30,
    });
    const knownLowRisk = decideAdaptiveRepPrescription({
      goal: "hypertrophy",
      exerciseName: "Cable Curl",
      exerciseCategory: "isolation",
      trainingPhase: "accumulation",
      setObjective: "calibration",
      prescribedRange: { min: 10, max: 20 },
      loadEstimateConfidence: 90,
      fatigueCost: "low",
    });

    expect(uncertain.prescription_type).toBe("top_range_check");
    expect(uncertain.short_reason).toBe("Load-finding check.");
    expect(knownLowRisk.prescription_type).toBe("amrap");
  });

  it("reduces confidence for name fallback and ambiguous goal/exercise pairings", () => {
    const nameMapped = decideAdaptiveRepPrescription({
      goal: "hypertrophy",
      exerciseName: "Incline Dumbbell Press",
      trainingPhase: "accumulation",
      loadEstimateConfidence: 85,
    });
    const metadataMapped = decideAdaptiveRepPrescription({
      goal: "hypertrophy",
      exerciseName: "Incline Dumbbell Press",
      exerciseCategory: "heavy_compound",
      trainingPhase: "accumulation",
      loadEstimateConfidence: 85,
    });
    const ambiguousAthletic = decideAdaptiveRepPrescription({
      goal: "athletic_performance",
      exerciseName: "Mystery Lift",
      trainingPhase: "accumulation",
    });

    expect(metadataMapped.confidence).toBeGreaterThan(nameMapped.confidence);
    expect(ambiguousAthletic.confidence).toBeLessThan(65);
    expect(ambiguousAthletic.debug_reasons.join(" ")).toContain("mapping fallback");
  });

  it("prefers provided metadata over name fallback", () => {
    const prescription = decideAdaptiveRepPrescription({
      goal: "strength",
      exerciseName: "Mystery Press",
      exerciseArchetype: "machine_compound",
      movementPattern: "horizontal_push",
      trainingPhase: "accumulation",
    });

    expect(prescription.rep_range).toEqual({ min: 6, max: 10 });
    expect(prescription.debug_reasons.join(" ")).toContain("mapping provided_archetype");
  });

  it("falls back safely for unsupported exercises", () => {
    const prescription = decideAdaptiveRepPrescription({
      goal: "hypertrophy",
      exerciseName: "Mystery Lift",
      trainingPhase: "accumulation",
    });

    expect(inferExerciseArchetype("Mystery Lift")).toBe("unsupported");
    expect(prescription.prescription_type).toBe("fixed_reps");
    expect(prescription.target_reps).toBe(10);
    expect(prescription.confidence).toBeLessThan(70);
  });

  it("keeps short reasons compact", () => {
    const prescriptions = [
      decideAdaptiveRepPrescription({ ...hypertrophyBase, coachingBias: "tension" }),
      decideAdaptiveRepPrescription({ ...hypertrophyBase, setObjective: "verification" }),
      decideAdaptiveRepPrescription({ ...hypertrophyBase, setObjective: "calibration", movementPattern: "squat", fatigueCost: "high" }),
    ];

    for (const prescription of prescriptions) {
      expect(prescription.short_reason.length).toBeLessThanOrEqual(80);
      expect(prescription.short_reason.split(".").length).toBeLessThanOrEqual(3);
    }
  });

  it("runs synchronously without network, async work, or history scans", () => {
    const startedAt = performance.now();
    let last = decideAdaptiveRepPrescription(hypertrophyBase);

    for (let index = 0; index < 1000; index += 1) {
      last = decideAdaptiveRepPrescription({
        goal: "build_muscle_strength",
        exerciseName: index % 2 === 0 ? "Leg Extension" : "Competition Bench Press",
        trainingPhase: index % 3 === 0 ? "intensification" : "accumulation",
        exerciseExposureCount: 3,
        loadEstimateConfidence: 80,
      });
    }

    expect(last.prescription_type).toBeTruthy();
    expect(performance.now() - startedAt).toBeLessThan(100);
  });
});
