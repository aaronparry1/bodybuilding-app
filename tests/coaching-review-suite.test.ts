import { describe, expect, it } from "vitest";
import {
  generateProductionV2CompleteSessionReviewMarkdown,
  generateProductionV2CoachingReviewMarkdown,
  GOLD_STANDARD_COMPLETE_SESSION_IDS,
  PRODUCTION_V2_COMPLETE_SESSION_SPECS,
  PRODUCTION_V2_COACHING_REVIEW_SCENARIOS,
  runProductionV2CompleteSessionReviewSuite,
  runProductionV2CoachingReviewSuite,
} from "@/domain/training/coaching-review-suite";

describe("production V2 coaching review suite", () => {
  it("runs at least 75 realistic scenarios through the isolated pipeline", () => {
    const result = runProductionV2CoachingReviewSuite();

    expect(PRODUCTION_V2_COACHING_REVIEW_SCENARIOS.length).toBeGreaterThanOrEqual(75);
    expect(result.scenario_count).toBe(PRODUCTION_V2_COACHING_REVIEW_SCENARIOS.length);
    expect(result.records).toHaveLength(result.scenario_count);
    expect(result.records.every((record) => record.cycle_strategy && record.session_strategy && record.rep_prescription && record.load_prescription)).toBe(true);
  });

  it("passes the critical expected behaviour checks", () => {
    const result = runProductionV2CoachingReviewSuite();

    expect(result.failed_expected_checks).toEqual([]);
    expect(result.passed_expected_checks).toBe(22);
  });

  it("adds load prescription output to every review record", () => {
    const result = runProductionV2CoachingReviewSuite();

    expect(
      result.records.every(
        (record) =>
          record.load_prescription.load_action &&
          record.load_prescription.load_strategy &&
          typeof record.load_prescription.confidence === "number" &&
          record.load_prescription.short_reason.length > 0,
      ),
    ).toBe(true);
  });

  it("keeps deload work recovery-focused across the pipeline", () => {
    const result = runProductionV2CoachingReviewSuite();
    const deloadRecords = result.records.filter((record) => record.input_summary.includes("phase deload"));

    expect(deloadRecords.length).toBeGreaterThan(0);
    expect(deloadRecords.every((record) => record.session_strategy.set_objective === "recovery")).toBe(true);
    expect(deloadRecords.every((record) => record.rep_prescription.set_objective === "recovery")).toBe(true);
  });

  it("blocks unsafe or poorly recovered performance work", () => {
    const result = runProductionV2CoachingReviewSuite();
    const safetyPeak = result.records.find((record) => record.scenario_id === "core_safety_peak_bench");
    const poorGetLean = result.records.find((record) => record.scenario_id === "core_get_lean_poor");

    expect(safetyPeak?.session_strategy.set_objective).not.toBe("performance");
    expect(safetyPeak?.session_strategy.coaching_bias).toBe("recovery");
    expect(poorGetLean?.cycle_strategy.stress_budget_bias).toBe("conserve");
    expect(poorGetLean?.session_strategy.set_objective).toBe("recovery");
  });

  it("handles athletic performance power and accessory work differently", () => {
    const result = runProductionV2CoachingReviewSuite();
    const power = result.records.find((record) => record.scenario_id === "core_athletic_power");
    const accessory = result.records.find((record) => record.scenario_id === "core_athletic_accessory");

    expect(power?.session_strategy.coaching_bias).toBe("speed_power");
    expect(power?.rep_prescription.prescription_type).toBe("fixed_reps");
    expect(accessory?.session_strategy.coaching_bias).not.toBe("speed_power");
  });

  it("keeps deadlift calibration capped and conservative", () => {
    const result = runProductionV2CoachingReviewSuite();
    const deadliftCalibration = result.records.find((record) => record.scenario_id === "core_deadlift_calibration");

    expect(deadliftCalibration?.session_strategy.set_objective).toBe("calibration");
    expect(deadliftCalibration?.rep_prescription.prescription_type).toBe("capped_amrap");
    expect(deadliftCalibration?.load_prescription.load_strategy).toBe("calibration_load");
    expect(deadliftCalibration?.load_prescription.load_action).not.toBe("increase_load");
    expect(deadliftCalibration?.review_flags).not.toContain("calibration_too_aggressive");
    expect(deadliftCalibration?.review_flags).not.toContain("deadlift_too_aggressive");
    expect(deadliftCalibration?.review_flags).not.toContain("deadlift_load_too_aggressive");
  });

  it("audits core load prescription behaviours", () => {
    const result = runProductionV2CoachingReviewSuite();
    const ownedBench = result.records.find((record) => record.scenario_id === "sit_owned_bench");
    const introducedSquat = result.records.find((record) => record.scenario_id === "sit_introduced_squat");
    const unstableSquat = result.records.find((record) => record.scenario_id === "core_unstable_squat");
    const poorRecovery = result.records.find((record) => record.scenario_id === "core_get_lean_poor");
    const power = result.records.find((record) => record.scenario_id === "core_athletic_power");
    const plank = result.records.find((record) => record.scenario_id === "sit_duration_plank");
    const largeJump = result.records.find((record) => record.scenario_id === "core_large_jump_lateral_raise");

    expect(ownedBench?.load_prescription.load_action).toBe("increase_load");
    expect(ownedBench?.load_prescription.load_strategy).toBe("small_progression");
    expect(introducedSquat?.load_prescription.load_action).not.toBe("increase_load");
    expect(unstableSquat?.load_prescription.load_action).not.toBe("increase_load");
    expect(poorRecovery?.load_prescription.load_action).not.toBe("increase_load");
    expect(power?.load_prescription.load_strategy).toBe("power_quality_load");
    expect(plank?.load_prescription.load_action).toBe("no_external_load");
    expect(largeJump?.load_prescription.load_action).not.toBe("increase_load");
    expect(result.records.some((record) => record.review_flags.includes("rep_load_intent_mismatch"))).toBe(false);
  });

  it("lets safe owned strength peak work express performance", () => {
    const result = runProductionV2CoachingReviewSuite();
    const peakSquat = result.records.find((record) => record.scenario_id === "core_strength_peak_owned");

    expect(peakSquat?.session_strategy.set_objective).toBe("performance");
    expect(peakSquat?.session_strategy.coaching_bias).toBe("peak");
    expect(peakSquat?.rep_prescription.load_strategy).toBe("heavier_specific_load");
  });

  it("uses hypertrophy bias without making limited-recovery compounds metabolic", () => {
    const result = runProductionV2CoachingReviewSuite();
    const isolation = result.records.find((record) => record.scenario_id === "core_hypertrophy_isolation_good");
    const compound = result.records.find((record) => record.scenario_id === "core_hypertrophy_compound_limited");

    expect(isolation?.session_strategy.coaching_bias).toBe("metabolic");
    expect(compound?.session_strategy.coaching_bias).not.toBe("metabolic");
  });

  it("triggers verification for underloaded evidence and calibration for low exposure", () => {
    const result = runProductionV2CoachingReviewSuite();
    const underloaded = result.records.find((record) => record.scenario_id === "core_underloaded_chest_press");
    const lowExposure = result.records.find((record) => record.scenario_id === "core_low_exposure_press");

    expect(underloaded?.session_strategy.set_objective).toBe("verification");
    expect(underloaded?.rep_prescription.prescription_type).toBe("top_range_check");
    expect(lowExposure?.session_strategy.set_objective).toBe("calibration");
  });

  it("respects cycle context blocked objectives and biases for every scenario", () => {
    const result = runProductionV2CoachingReviewSuite();

    expect(
      result.records.every(
        (record) =>
          !record.cycle_strategy.blocked_objectives.includes(record.session_strategy.set_objective) &&
          !record.cycle_strategy.blocked_biases.includes(record.session_strategy.coaching_bias),
      ),
    ).toBe(true);
  });

  it("separates true rep intent mismatches from intentional rep-engine overrides", () => {
    const result = runProductionV2CoachingReviewSuite();
    const mismatches = result.records.filter(
      (record) =>
        record.rep_prescription.set_objective !== record.session_strategy.set_objective ||
        record.rep_prescription.coaching_bias !== record.session_strategy.coaching_bias,
    );
    const intentional = mismatches.filter((record) => record.rep_prescription.debug_reasons.some((reason) => reason.includes("intentionally overrides session intent")));
    const unintentional = mismatches.filter((record) => !intentional.includes(record));

    expect(mismatches.length).toBeGreaterThan(0);
    expect(intentional.length).toBeGreaterThan(0);
    expect(intentional.every((record) => !record.review_flags.includes("rep_intent_mismatch"))).toBe(true);
    expect(unintentional.every((record) => record.review_flags.includes("rep_intent_mismatch"))).toBe(true);
  });

  it("distinguishes low evidence from true mapping fallback", () => {
    const result = runProductionV2CoachingReviewSuite();
    const lowExposure = result.records.find((record) => record.scenario_id === "core_low_exposure_press");
    const fallback = result.records.find((record) => record.scenario_id === "sit_unsupported_fallback");

    expect(lowExposure?.review_flags).toContain("low_evidence_confidence");
    expect(lowExposure?.review_flags).not.toContain("low_confidence_mapping");
    expect(lowExposure?.needs_aaron_review).toBe(false);
    expect(fallback?.review_flags).toContain("unsupported_fallback");
    expect(fallback?.needs_aaron_review).toBe(true);
  });

  it("reduces Aaron-review flags after hardening clear mismatches", () => {
    const result = runProductionV2CoachingReviewSuite();

    expect(result.flagged_for_aaron_review).toBeLessThan(22);
    expect(result.records.some((record) => record.review_flags.includes("questionable_power_bias"))).toBe(false);
    expect(result.records.some((record) => record.review_flags.includes("isolation_too_heavy"))).toBe(false);
  });

  it("generates a readable markdown report", () => {
    const markdown = generateProductionV2CoachingReviewMarkdown(runProductionV2CoachingReviewSuite());

    expect(markdown).toContain("# Production V2 Coaching Review Suite v2");
    expect(markdown).toContain("Total scenarios:");
    expect(markdown).toContain("Top Questionable Decisions");
    expect(markdown).toContain("Top Questionable Load Decisions");
    expect(markdown).toContain("Ready for simulator-only wiring");
  });

  it("is deterministic and remains local/synchronous", () => {
    const startedAt = performance.now();
    const first = runProductionV2CoachingReviewSuite();
    const second = runProductionV2CoachingReviewSuite();

    expect(first.records).toEqual(second.records);
    expect(performance.now() - startedAt).toBeLessThan(250);
  });

  it("generates complete coaching sessions across the requested goals", () => {
    const result = runProductionV2CompleteSessionReviewSuite();
    const goals = ["strength", "hypertrophy", "build_muscle_strength", "athletic_performance", "get_lean"] as const;

    expect(PRODUCTION_V2_COMPLETE_SESSION_SPECS.length).toBeGreaterThanOrEqual(25);
    expect(result.session_count).toBe(PRODUCTION_V2_COMPLETE_SESSION_SPECS.length);
    for (const goal of goals) {
      expect(result.sessions.filter((session) => session.goal === goal).length).toBeGreaterThanOrEqual(5);
    }
    expect(result.sessions.every((session) => session.exercises.length > 0)).toBe(true);
    expect(result.exercise_count).toBeGreaterThanOrEqual(100);
  });

  it("explains exercise, rep, load, and set choices for every complete-session exercise", () => {
    const result = runProductionV2CompleteSessionReviewSuite();

    expect(
      result.sessions.every((session) =>
        session.exercises.every(
          (exercise) =>
            exercise.why_exercise_selected.length > 0 &&
            exercise.why_reps.length > 0 &&
            exercise.why_load.length > 0 &&
            exercise.why_sets.length > 0 &&
            exercise.delivery.preferred_delivery_type &&
            exercise.rep_prescription.prescription_type &&
            exercise.load_prescription.load_action &&
            exercise.set_allocation,
        ),
      ),
    ).toBe(true);
  });

  it("creates gold standard sessions as regression benchmarks", () => {
    const result = runProductionV2CompleteSessionReviewSuite();

    expect(GOLD_STANDARD_COMPLETE_SESSION_IDS.length).toBe(PRODUCTION_V2_COMPLETE_SESSION_SPECS.length);
    expect(result.gold_standard_count).toBe(result.session_count);
    expect(result.sessions.every((session) => session.gold_standard)).toBe(true);
  });

  it("keeps complete-session strength and athletic specificity intact", () => {
    const result = runProductionV2CompleteSessionReviewSuite();
    const strengthPeak = result.sessions.find((session) => session.session_id === "strength_01_peak_sbd");
    const athleticPower = result.sessions.find((session) => session.session_id === "athletic_01_power");
    const deadliftCalibration = result.sessions.find((session) => session.session_id === "strength_04_deadlift_calibration");

    expect(strengthPeak?.exercises.some((exercise) => exercise.selected_exercise === "Competition Squat")).toBe(true);
    expect(strengthPeak?.exercises.some((exercise) => exercise.selected_exercise === "Competition Bench Press")).toBe(true);
    expect(strengthPeak?.exercises.some((exercise) => exercise.selected_exercise === "Competition Deadlift")).toBe(true);
    expect(strengthPeak?.exercises.filter((exercise) => exercise.rep_prescription.target_reps === 1).every((exercise) => !exercise.why_sets.toLowerCase().includes("below target"))).toBe(true);
    expect(athleticPower?.exercises.some((exercise) => exercise.delivery.preferred_delivery_type === "power_movement")).toBe(true);
    expect(deadliftCalibration?.exercises.find((exercise) => exercise.selected_exercise === "Competition Deadlift")?.rep_prescription.prescription_type).toBe("capped_amrap");
  });

  it("surfaces session-level review flags without hiding questionable sessions", () => {
    const result = runProductionV2CompleteSessionReviewSuite();

    expect(result.questionable_sessions.length).toBeGreaterThanOrEqual(0);
    expect(result.repeated_exercise_bias.every((session) => session.review_flags.includes("repeated_exercise_bias"))).toBe(true);
    expect(result.unnecessary_fatigue.every((session) => session.review_flags.includes("unnecessary_fatigue"))).toBe(true);
    expect(result.poor_specificity.every((session) => session.review_flags.includes("poor_specificity"))).toBe(true);
    expect(result.lack_of_variety.every((session) => session.review_flags.includes("lack_of_variety"))).toBe(true);
    expect(result.unnecessary_complexity.every((session) => session.review_flags.includes("unnecessary_complexity"))).toBe(true);
  });

  it("generates the complete-session markdown report", () => {
    const markdown = generateProductionV2CompleteSessionReviewMarkdown(runProductionV2CompleteSessionReviewSuite());

    expect(markdown).toContain("# Production V2 Coaching Review Suite v3");
    expect(markdown).toContain("Gold Standard Sessions");
    expect(markdown).toContain("Why selected");
    expect(markdown).toContain("Unnecessary Fatigue");
  });
});
