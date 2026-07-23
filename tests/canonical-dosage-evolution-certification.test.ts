import { describe, expect, it } from "vitest";
import { constructCanonicalActivePlanFromCanonicalInputs } from "@/application/training/canonical-active-plan-construction";
import { buildCanonicalDosageEvolutionArtifacts } from "@/domain/training/canonical-dosage-evolution-certification";
import { resolveCanonicalCardioPrescription } from "@/domain/training/canonical-cardio-prescription";
import { canonicalHypertrophyLandmark, defaultCanonicalStartingVolumeContext, resolveCanonicalHypertrophyStartingVolume } from "@/domain/training/canonical-hypertrophy-volume-policy";
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
    expect(rotation.complementaryPairQuality.find((pair) => pair.id === "Push A/D")?.stableExercises).toEqual([]);
    expect(rotation.complementaryPairQuality.find((pair) => pair.id === "Pull B/E")?.stableExercises).toEqual([]);
    expect(rotation.completeRotation.directSets).toMatchObject({ chest: 10, lats: 10, upper_back: 10, quadriceps: 10, hip_extension: 10 });
    expect(rotation.completeRotation.meaningfulSecondarySets.chest ?? 0).toBe(0);
    expect(Object.values(rotation.completeRotation.frequency).every((value) => Number.isInteger(value))).toBe(true);
  });

  it("constructs Legs F through real Session Construction as a complementary hinge-led session", () => {
    const result = constructCanonicalActivePlanFromCanonicalInputs({ planId: "legs-f-proof", createdAt: "2026-07-19T08:00:00.000Z", updatedAt: "2026-07-19T08:00:00.000Z", goal: "hypertrophy", macrocycleGoal: "build_muscle", experienceLevel: "intermediate", daysPerWeek: 5, preferredSplit: "push_pull_legs", equipment: fullGym, units: "kg", microcycleSequenceNumber: 2, exercises: exerciseLibrary });
    expect(result.status).toBe("constructed");
    if (result.status !== "constructed") return;
    const session = result.carrier.plannedSessions[0]!;
    const snapshot = session.prescriptionSnapshot as any;
    expect(session.role).toBe("Legs hypertrophy F");
    expect(snapshot.slots.map((slot: any) => slot.reason)).toEqual(expect.arrayContaining(["moderate-fatigue hinge-led posterior-chain anchor", "single-leg knee-dominant hypertrophy", "trunk work"]));
    expect(snapshot.slots).toHaveLength(7);
    expect(snapshot.slots[0].exerciseId).not.toMatch(/good-morning/);
    expect(snapshot.slots.some((slot: any) => slot.exerciseId === "ex-deadlift")).toBe(false);
    for (const slot of snapshot.slots) {
      if (slot.loadPrescription.state !== "calibration_required") continue;
      expect(slot.loadPrescription.protocol).toMatchObject({ schemaVersion: "canonical_load_calibration_protocol_v1", targetReps: slot.targetReps, workingSets: slot.settings.requiredSets, warmupAndRampExcludedFromWorkingVolume: true });
      expect(slot.loadPrescription.protocol.startingInstruction.length).toBeGreaterThan(40);
      expect(slot.loadPrescription.protocol.safeAdjustment.length).toBeGreaterThan(40);
    }
  });

  it("normalises five lifting days from the complete rotation and keeps every lower-body region above its floor", () => {
    const dosage = artifacts["normalised-seven-day-dosage"];
    expect(dosage.completeRotation.totalWorkingSets).toBe(101);
    expect(dosage.averageSevenDays.totalWorkingSets).toBe(84.17);
    expect(dosage.averageSevenDays.totalWorkingSets).toBeCloseTo(dosage.completeRotation.totalWorkingSets * 5 / 6, 2);
    expect(dosage.balanceProof.chronicLowerUnderexposureAbsent).toBe(true);
    expect(dosage.averageSevenDays.directSets).toMatchObject({ chest: 8.33, lats: 8.33, upper_back: 8.33, quadriceps: 8.33, hip_extension: 8.33 });
    expect(dosage.calendarSlices.map((slice) => slice.distribution)).toEqual([{ push: 2, pull: 2, legs: 1 }, { push: 2, pull: 1, legs: 2 }, { push: 1, pull: 2, legs: 2 }]);
  });

  it("requires productive history and demonstrated capacity before an upper starting dose", () => {
    const ordinary = resolveCanonicalHypertrophyStartingVolume({ experience: "intermediate", region: "chest", context: defaultCanonicalStartingVolumeContext(5) });
    const unsupportedHigh = resolveCanonicalHypertrophyStartingVolume({ experience: "advanced", region: "chest", context: { ...defaultCanonicalStartingVolumeContext(5), recovery: "high", recentSessionWorkload: "high", workCapacity: "demonstrated_high" } });
    const supportedHigh = resolveCanonicalHypertrophyStartingVolume({ experience: "advanced", region: "chest", context: { ...defaultCanonicalStartingVolumeContext(5), recovery: "high", recentSessionWorkload: "high", history: "established_productive", loadConfidence: "established", dosageConfidence: "canonical_productive_history", workCapacity: "demonstrated_high" } });
    expect(ordinary.calibrationRequired).toBe(true);
    expect(unsupportedHigh.startingDirectSets).toBeLessThan(canonicalHypertrophyLandmark("advanced", "chest").maximumAuthorisedStarting);
    expect(supportedHigh.startingDirectSets).toBeGreaterThan(unsupportedHigh.startingDirectSets);
    expect(supportedHigh.startingDirectSets).toBeLessThanOrEqual(canonicalHypertrophyLandmark("advanced", "chest").maximumAuthorisedStarting);
    expect(canonicalHypertrophyLandmark("intermediate", "chest").maximumRecoverableAuthorisation).toBe(16);
    expect(artifacts["starting-volume-matrix"].sourceEvidence).toHaveLength(3);
    expect(artifacts["starting-volume-matrix"].sourceEvidence.find((item) => "printedPages" in item)?.limitation).toContain("do not define a universal weekly regional dose");
  });

  it("replaces the minimum-floor overcorrection with one executable muscle-specific start", () => {
    const audit = artifacts["ninety-five-set-start-audit"];
    expect(audit.firstCalendarSliceWorkingSets).toBe(85);
    expect(audit.completeRotationWorkingSets).toBe(101);
    expect(audit.averageSevenDayWorkingSets).toBe(84.17);
    expect(audit.demonstratedTolerance).toBe(false);
    expect(audit.retained).toBe(false);
    expect(audit.classification).toBe("experience_and_recent_training_baseline_reconciled_to_discrete_rotation");
    expect(audit.contradictionResolved).toMatchObject({ previousRepresentativeRawRotation: 78, previousRepresentativeNormalisedSevenDays: 65, previousMatrixTotal: 65 });
    expect(audit.muscleSpecificComparison.chest.startingDirectSets).toBe(8);
    expect(audit.muscleSpecificComparison.chest.reasonCodes).toContain("missing_app_history_lowers_dosage_confidence_not_experience");
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
    expect(simulation.inputSensitivityCases.map((item) => item.id)).toEqual(["beginner_ordinary", "intermediate_current_new_app", "intermediate_short_layoff", "intermediate_extended_layoff", "intermediate_poor_recovery", "intermediate_established_productive", "advanced_current_new_app", "intermediate_concurrent_sport", "intermediate_30_minutes", "intermediate_45_minutes", "intermediate_60_minutes", "intermediate_75_minutes", "intermediate_90_minutes"]);
    const byId = Object.fromEntries(simulation.inputSensitivityCases.map((item) => [item.id, item]));
    const owned = (id: keyof typeof byId) => { const item = byId[id]; expect(item.status).toBe("constructed"); if (item.status !== "constructed") throw new Error(`adaptive case failed: ${String(id)}`); return item.ownedDifferences; };
    expect(owned("intermediate_current_new_app").totalWorkingSets).toBeGreaterThan(owned("beginner_ordinary").totalWorkingSets);
    expect(owned("intermediate_current_new_app").totalWorkingSets).toBeGreaterThan(owned("intermediate_short_layoff").totalWorkingSets);
    expect(owned("intermediate_short_layoff").totalWorkingSets).toBeGreaterThan(owned("intermediate_extended_layoff").totalWorkingSets);
    expect(owned("intermediate_established_productive").totalWorkingSets).toBeGreaterThan(owned("intermediate_current_new_app").totalWorkingSets);
    expect(owned("advanced_current_new_app").totalWorkingSets).toBeGreaterThan(owned("intermediate_current_new_app").totalWorkingSets);
    expect(owned("intermediate_concurrent_sport").directSets.quadriceps ?? 0).toBeLessThan(owned("intermediate_current_new_app").directSets.quadriceps ?? 0);
    for (const minutes of [30, 45] as const) {
      const item = byId[`intermediate_${minutes}_minutes`];
      expect(item).toMatchObject({ status: "fail_closed" });
      if (item.status === "fail_closed") expect(item.reason).toContain("chronic_volume_floor_unmet");
    }
    expect(byId.intermediate_60_minutes).toMatchObject({ status: "constructed" });
    expect(owned("intermediate_60_minutes").totalWorkingSets).toBeGreaterThan(0);
    expect(owned("intermediate_75_minutes").totalWorkingSets).toBe(owned("intermediate_90_minutes").totalWorkingSets);
    expect(owned("intermediate_extended_layoff").equalityExplanation).toContain("extended-layoff re-entry");
    expect(owned("intermediate_poor_recovery").recoveryRestrictionApplied).toBe(true);
    expect(owned("intermediate_90_minutes").equalityExplanation).toContain("does not authorise extra volume");
    expect(simulation.representative.rotations.every((rotation) => rotation.callerAuthoredResultFlags === false && rotation.canonicalEvidence.length > 0)).toBe(true);
    expect(simulation.representative.completeMesocycleDemonstrated).toBe(true);
    expect(simulation.representative.rotations).toHaveLength(6);
    expect(simulation.representative.rotations.find((rotation) => rotation.state === "local_fatigue_correction")?.volumeResult.disposition).toMatch(/remove/);
    expect(simulation.representative.rotations.at(-1)?.response.exit).toBe("deload_or_transition_review_required_by_canonical_evidence");
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

  it("uses typed session duration and passes every adversarial dosage quality gate", () => {
    expect(artifacts["session-duration-decision"]).toMatchObject({ currentProductionInput: true, commitmentMeaning: "days_per_week_only", userSpecificLimitClaimed: true, decision: "implemented_as_typed_canonical_input", supportedMinutes: [30, 45, 60, 75, 90] });
    expect(artifacts["session-duration-decision"].representativeCases.map((item) => item.status)).toEqual(["fail_closed", "fail_closed", "constructed", "constructed", "constructed"]);
    expect(artifacts["session-duration-decision"].representativeCases.every((item) => item.status === "fail_closed" ? item.reason.includes("chronic_volume_floor_unmet") : item.maximumObservedMinutes <= item.availableSessionMinutes)).toBe(true);
    expect(artifacts["dosage-quality-gate-coverage"].allPassed).toBe(true);
    expect(artifacts["dosage-quality-gate-coverage"].gates.every((gate) => gate.status === "passed")).toBe(true);
  });
});
