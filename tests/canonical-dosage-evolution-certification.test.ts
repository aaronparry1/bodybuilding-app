import { describe, expect, it } from "vitest";
import { constructCanonicalActivePlanFromCanonicalInputs } from "@/application/training/canonical-active-plan-construction";
import { buildCanonicalDosageEvolutionArtifacts } from "@/domain/training/canonical-dosage-evolution-certification";
import { resolveCanonicalCardioPrescription } from "@/domain/training/canonical-cardio-prescription";
import { canonicalHypertrophyLandmark, resolveCanonicalHypertrophyStartingVolume } from "@/domain/training/canonical-hypertrophy-volume-policy";
import { exerciseLibrary } from "@/domain/training/presets";

const artifacts = buildCanonicalDosageEvolutionArtifacts();
const fullGym = ["barbell", "dumbbell", "machine", "cable", "bodyweight"] as const;

describe("canonical dosage, rotation, method evolution and cardio certification", () => {
  it("carries the six-session PPL identity across calendar boundaries without a Monday reset", () => {
    const rotation = artifacts["complete-rolling-ppl-rotation"];
    expect(rotation.completeRotation.roles).toEqual(["Push hypertrophy A", "Pull hypertrophy B", "Legs hypertrophy C", "Push hypertrophy D", "Pull hypertrophy E", "Legs hypertrophy F"]);
    expect(rotation.resetProof).toMatchObject({ sequence1Last: "Pull hypertrophy E", sequence2First: "Legs hypertrophy F", mondayResetAbsent: true });
    expect(rotation.resetProof.sequence2Roles).toEqual(["Legs hypertrophy F", "Push hypertrophy A", "Pull hypertrophy B", "Legs hypertrophy C", "Push hypertrophy D"]);
    expect(rotation.complementaryPairQuality.every((pair) => pair.completeCoverage && !pair.renamedDuplicate)).toBe(true);
  });

  it("constructs Legs F through real Session Construction as a complementary hinge-led session", () => {
    const result = constructCanonicalActivePlanFromCanonicalInputs({ planId: "legs-f-proof", createdAt: "2026-07-19T08:00:00.000Z", updatedAt: "2026-07-19T08:00:00.000Z", goal: "hypertrophy", macrocycleGoal: "build_muscle", experienceLevel: "intermediate", daysPerWeek: 5, preferredSplit: "push_pull_legs", equipment: fullGym, units: "kg", microcycleSequenceNumber: 2, exercises: exerciseLibrary });
    expect(result.status).toBe("constructed");
    if (result.status !== "constructed") return;
    const session = result.carrier.plannedSessions[0]!;
    const snapshot = session.prescriptionSnapshot as any;
    expect(session.role).toBe("Legs hypertrophy F");
    expect(snapshot.slots.map((slot: any) => slot.reason)).toEqual(expect.arrayContaining(["hinge-led posterior-chain anchor", "single-leg knee-dominant hypertrophy", "trunk work"]));
    expect(snapshot.slots).toHaveLength(7);
  });

  it("normalises five lifting days from the complete rotation and keeps every lower-body region above its floor", () => {
    const dosage = artifacts["normalised-seven-day-dosage"];
    expect(dosage.completeRotation.totalWorkingSets).toBeGreaterThan(95);
    expect(dosage.averageSevenDays.totalWorkingSets).toBeCloseTo(dosage.completeRotation.totalWorkingSets * 5 / 6, 2);
    expect(dosage.balanceProof.chronicLowerUnderexposureAbsent).toBe(true);
    expect(dosage.calendarSlices.map((slice) => slice.distribution)).toEqual([{ push: 2, pull: 2, legs: 1 }, { push: 2, pull: 1, legs: 2 }, { push: 1, pull: 2, legs: 2 }]);
  });

  it("requires productive history and demonstrated capacity before an upper starting dose", () => {
    const ordinary = resolveCanonicalHypertrophyStartingVolume({ experience: "intermediate", region: "chest", context: { recovery: "ordinary", history: "none", workCapacity: "not_demonstrated", concurrentSport: "none" } });
    const unsupportedHigh = resolveCanonicalHypertrophyStartingVolume({ experience: "advanced", region: "chest", context: { recovery: "high", history: "none", workCapacity: "demonstrated_high", concurrentSport: "none" } });
    const supportedHigh = resolveCanonicalHypertrophyStartingVolume({ experience: "advanced", region: "chest", context: { recovery: "high", history: "established_productive", workCapacity: "demonstrated_high", concurrentSport: "none" } });
    expect(ordinary.calibrationRequired).toBe(true);
    expect(unsupportedHigh.startingDirectSets).toBeLessThan(canonicalHypertrophyLandmark("advanced", "chest").maximumAuthorisedStarting);
    expect(supportedHigh.startingDirectSets).toBeGreaterThan(unsupportedHigh.startingDirectSets);
    expect(supportedHigh.startingDirectSets).toBeLessThanOrEqual(canonicalHypertrophyLandmark("advanced", "chest").maximumAuthorisedStarting);
  });

  it("certifies the 95-set calendar slice from muscle-specific floors and ceilings rather than total-set rhetoric", () => {
    const audit = artifacts["ninety-five-set-start-audit"];
    expect(audit.firstCalendarSliceWorkingSets).toBe(95);
    expect(audit.demonstratedTolerance).toBe(false);
    expect(audit.classification).toBe("muscle_specific_floor_to_middle_calibration_start_not_upper_authorised_start");
    expect(audit.muscleSpecificComparison.chest.averageDirectSets).toBeLessThanOrEqual(audit.muscleSpecificComparison.chest.authorisedCeiling);
    expect(audit.excessiveDetection).toContain("three comparable observations required before any addition");
  });

  it("evolves exact method structure only when a Mesocycle owns a useful reason", () => {
    const methods = artifacts["method-evolution-certification"];
    expect(methods.examples.map((example) => example.method)).toEqual(["straight_sets", "pyramid", "amrap", "back_off_sets", "bbb"]);
    expect(methods.examples.every((example) => example.exactTargets.length > 0 && example.stopRule && example.exitRule.length > 0)).toBe(true);
    expect(methods.examples.every((example) => example.selectedByGovernance.mapsToExpected)).toBe(true);
    expect(methods.unsupportedMethods.map((item) => item.method)).toEqual(["rest_pause", "supersets_trisets", "high_rep_finisher_as_separate_method"]);
  });

  it("simulates productive, local, systemic, missed-session and stagnation paths without weekly auto-escalation", () => {
    const simulation = artifacts["intermediate-hypertrophy-mesocycle-simulation"];
    expect(simulation.pathways.map((path) => path.id)).toEqual(["A_productive_progress", "B_local_muscle_underdose", "C_local_excess_fatigue", "D_systemic_fatigue", "E_missed_session", "F_one_poor_workout", "G_persistent_stagnation"]);
    expect(simulation.safeguards.noAutomaticWeeklyAddition).toBe(true);
    expect(simulation.safeguards.noCalendarOnlyDeload).toBe(true);
    expect(simulation.pathways.find((path) => path.id === "F_one_poor_workout")?.result).toMatchObject({ disposition: "retain", setDelta: 0 });
    expect(simulation.pathways.find((path) => path.id === "G_persistent_stagnation")?.result).toMatchObject({ disposition: "reallocate_one_set", setDelta: 0 });
  });

  it("individualises eight cardio profiles and exposes their recovery-budget effect", () => {
    const cardio = artifacts["cardio-individualisation"];
    expect(cardio.cases).toHaveLength(8);
    expect(cardio.universalTwoByTwentyAbsent).toBe(true);
    expect(cardio.cases.find((item) => item.id === "hypertrophy-desired")?.output.recoveryBudget.cardioMinutes).toBe(40);
    expect(cardio.cases.find((item) => item.id === "hypertrophy-minimum")?.output.recoveryBudget.cardioMinutes).toBe(15);
    expect(cardio.cases.find((item) => item.id === "poor-lower-body-recovery")?.output).toMatchObject({ status: "review_required", sessions: [], recoveryBudget: { resistanceDosageAdjustment: "review_required" } });
    expect(cardio.cases.find((item) => item.id === "high-work-capacity")?.output.weeklyFrequency).toBe(3);
  });

  it("never prescribes cardio against an explicit off preference or conflicting sport workload", () => {
    const off = resolveCanonicalCardioPrescription({ planId: "off", goal: "build_muscle", preference: "off", experience: "intermediate", liftingDays: 5, liftingDayOffsets: [0, 1, 2, 4, 5], workCapacity: "demonstrated_high", productiveCardioHistory: true });
    const sport = resolveCanonicalCardioPrescription({ planId: "sport", goal: "build_muscle", preference: "recommended", experience: "intermediate", liftingDays: 5, liftingDayOffsets: [0, 1, 2, 4, 5], sportSessionsPerWeek: 2 });
    expect(off).toMatchObject({ status: "off", sessions: [], weeklyFrequency: 0 });
    expect(sport).toMatchObject({ status: "review_required", sessions: [], recoveryBudget: { concurrentSportSessions: 2 } });
  });

  it("keeps session duration as a declared product-input gap and passes every dosage quality gate", () => {
    expect(artifacts["session-duration-decision"]).toMatchObject({ currentProductionInput: false, commitmentMeaning: "days_per_week_only", userSpecificLimitClaimed: false, decision: "retain_as_explicit_product_input_gap" });
    expect(artifacts["dosage-quality-gate-coverage"].allPassed).toBe(true);
    expect(artifacts["dosage-quality-gate-coverage"].gates.every((gate) => gate.status === "passed")).toBe(true);
  });
});
