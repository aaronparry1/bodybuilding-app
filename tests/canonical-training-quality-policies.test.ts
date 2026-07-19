import { describe, expect, it } from "vitest";
import { constructCanonicalActivePlanFromCanonicalInputs } from "@/application/training/canonical-active-plan-construction";
import { certifyCanonicalConstructedMicrocycle } from "@/domain/training/canonical-constructed-microcycle-certification";
import { assessCanonicalExerciseRoleSuitability } from "@/domain/training/canonical-exercise-role-suitability";
import { allocateCanonicalMicrocycleVolume, detectCanonicalMicrocycleOverlap, type CanonicalMicrocycleVolumeAllocation } from "@/domain/training/canonical-microcycle-volume-allocator";
import type { CanonicalSessionSnapshotV3 } from "@/domain/training/canonical-session-construction-pipeline";
import type { CanonicalLoadEvidence } from "@/domain/training/canonical-load-prescription";
import { createMicrocycle } from "@/domain/training/microcycle-scheduler";
import { exerciseLibrary } from "@/domain/training/presets";

const roles = createMicrocycle({ parentMesocycleId: "powerbuilding_foundation", trainingDays: 5, split: "push_pull_legs" }).sessionRoles;
const equipment = ["barbell", "dumbbell", "machine", "cable", "bodyweight"] as const;

function exercise(id: string) { return exerciseLibrary.find((candidate) => candidate.id === id)!; }

function allocation(): CanonicalMicrocycleVolumeAllocation {
  return allocateCanonicalMicrocycleVolume({ macrocycleGoal: "build_muscle_and_strength", mesocycleId: "powerbuilding_foundation", mesocyclePurpose: "Establish repeatable squat, bench and deadlift", microcyclePriority: "Main lifts plus muscle development", microcycleSequence: 1, experience: "intermediate", frequency: 5, split: "let_app_choose", equipment, recoveryRestricted: false, establishedLoadExerciseIds: [], sessionRoles: roles });
}

function construct(established = false) {
  const liftIds = ["ex-bench-press", "ex-barbell-back-squat", "ex-deadlift"];
  const loadEvidence = established ? Object.fromEntries(liftIds.map((exerciseId, index) => [exerciseId, { evidenceId: `e-${exerciseId}`, evidenceVersion: "canonical_progress_evidence_v1", athleteId: "synthetic", exerciseId, observedLoad: [80, 120, 150][index]!, observedReps: 6, baseUnit: "kg", freshnessVersion: 1, calibrationStatus: "established" } satisfies CanonicalLoadEvidence])) : undefined;
  const result = constructCanonicalActivePlanFromCanonicalInputs({ planId: established ? "quality-established" : "quality", createdAt: "2026-01-01T00:00:00.000Z", updatedAt: "2026-01-01T00:00:00.000Z", goal: "strength_hypertrophy", macrocycleGoal: "build_muscle_and_strength", experienceLevel: "intermediate", daysPerWeek: 5, preferredSplit: "let_app_choose", equipment, units: "kg", exercises: exerciseLibrary, history: [], establishedLoads: established ? { "ex-bench-press": 80, "ex-barbell-back-squat": 120, "ex-deadlift": 150 } : undefined, loadEvidence });
  if (result.status !== "constructed") throw new Error(result.reason);
  return result.carrier.plannedSessions.map((session) => session.prescriptionSnapshot as CanonicalSessionSnapshotV3);
}

function replace(sessions: readonly CanonicalSessionSnapshotV3[], sessionIndex: number, slotIndex: number, exerciseId: string): CanonicalSessionSnapshotV3[] {
  return sessions.map((session, index) => index === sessionIndex ? { ...session, slots: session.slots.map((slot, position) => position === slotIndex ? { ...slot, exerciseId } : slot) } : session);
}

describe("canonical training-quality policies", () => {
  it("keeps catalogue movement and stimulus classifications factual", () => {
    expect(exercise("ex-dumbbell-pullover")).toMatchObject({ movementPattern: "isolation", family: "other", primaryMuscles: ["back"], secondaryMuscles: ["chest", "triceps"], stimulusProfile: { direct: ["lats"] }, roles: ["accessory"] });
    expect(exercise("ex-lat-pulldown")).toMatchObject({ movementPattern: "vertical_pull", family: "vertical_pull", stimulusProfile: { direct: ["lats"] } });
    expect(exercise("ex-cable-front-raise")).toMatchObject({ movementPattern: "isolation", stimulusProfile: { direct: ["anterior_delts"] }, roles: ["isolation"] });
    expect(exercise("ex-cable-lateral-raise")).toMatchObject({ stimulusProfile: { direct: ["lateral_delts"] } });
    expect(exercise("ex-reverse-machine-fly")).toMatchObject({ stimulusProfile: { direct: ["rear_delts"] } });
    expect(exercise("ex-bench-press").stimulusProfile).toEqual({ direct: ["chest"], meaningfulSecondary: ["triceps", "anterior_delts"] });
    expect(exercise("ex-barbell-back-squat").suitability).toContain("beginner");
    expect(exercise("ex-deadlift").suitability).toContain("beginner");
    expect(exercise("ex-hip-thrust-machine")).toMatchObject({ movementPattern: "hip_thrust", family: "hip_thrust", stimulusProfile: { direct: ["hip_extension"] } });
    expect(exercise("ex-anderson-squat")).toMatchObject({ selectionProfile: "strength_specialist", suitableBlocks: ["strength"], stability: "low", skillDemand: "high" });
  });

  it("ranks a stable hypertrophy squat above an unauthorised strength specialist", () => {
    const slot = allocation().slots.find((candidate) => candidate.purpose === "quad drive assistance")!;
    const context = { slot, macrocycleGoal: "build_muscle_and_strength", mesocycleId: "powerbuilding_foundation", experience: "intermediate" as const, sessionExerciseIds: ["ex-barbell-back-squat"], weeklyExerciseUsage: {}, sessionHighFatigueSets: 4 };
    const specialist = assessCanonicalExerciseRoleSuitability({ ...context, exercise: exercise("ex-anderson-squat") });
    const stable = assessCanonicalExerciseRoleSuitability({ ...context, exercise: exercise("ex-hack-squat-machine") });
    expect(specialist.suitability).toBe("specialist");
    expect(stable.suitability).toBe("primary_choice");
    expect(stable.score).toBeGreaterThan(specialist.score);
  });

  it("excludes high-fatigue support work when recovery is restricted", () => {
    const slot = allocation().slots.find((candidate) => candidate.purpose === "quad drive assistance")!;
    const result = assessCanonicalExerciseRoleSuitability({ exercise: exercise("ex-barbell-back-squat"), slot: { ...slot, exerciseRole: "primary_compound", primaryLift: undefined, liftExposure: undefined }, macrocycleGoal: "build_strength", mesocycleId: "strength_foundation", experience: "advanced", sessionExerciseIds: [], weeklyExerciseUsage: {}, sessionHighFatigueSets: 0, recoveryRestricted: true });
    expect(result).toMatchObject({ suitability: "unsuitable", reasons: expect.arrayContaining(["recovery_restriction_excludes_high_fatigue_support_work"]) });
  });

  it("distinguishes deliberate primary-lift practice from redundant weekly repetition", () => {
    const plan = allocation();
    const primarySlot = plan.slots.find((slot) => slot.primaryLift === "bench" && slot.liftExposure === "primary")!;
    const primaryRepeat = assessCanonicalExerciseRoleSuitability({ exercise: exercise("ex-bench-press"), slot: primarySlot, macrocycleGoal: "build_muscle_and_strength", mesocycleId: "powerbuilding_foundation", experience: "intermediate", sessionExerciseIds: [], weeklyExerciseUsage: { "ex-bench-press": 1 }, sessionHighFatigueSets: 0 });
    expect(primaryRepeat.repeatReason).toBe("stable_primary_practice");

    const chestSlot = plan.slots.find((slot) => slot.purpose === "bench position and pec-strength assistance")!;
    const repeatedAccessory = assessCanonicalExerciseRoleSuitability({ exercise: exercise("ex-incline-dumbbell-press"), slot: chestSlot, macrocycleGoal: "build_muscle_and_strength", mesocycleId: "powerbuilding_foundation", experience: "intermediate", sessionExerciseIds: [], weeklyExerciseUsage: { "ex-incline-dumbbell-press": 1 }, sessionHighFatigueSets: 0 });
    expect(repeatedAccessory.repeatReason).toBe("variation_preferred");
    expect(repeatedAccessory.score).toBeLessThan(primaryRepeat.score);
  });

  it("fails adversarial substitutions closed instead of certifying false coverage", () => {
    const base = construct();
    const pulloverAsVertical = certifyCanonicalConstructedMicrocycle({ allocation: allocation(), sessions: replace(base, 1, 1, "ex-dumbbell-pullover"), exercises: exerciseLibrary });
    expect(pulloverAsVertical.failures).toEqual(expect.arrayContaining([expect.stringContaining("ex-dumbbell-pullover")]));

    const frontRaiseAsLateral = certifyCanonicalConstructedMicrocycle({ allocation: allocation(), sessions: replace(base, 0, 4, "ex-cable-front-raise"), exercises: exerciseLibrary });
    expect(frontRaiseAsLateral.failures).toContain("lateral_delts_direct_coverage_missing");

    const pressingWithoutVerticalPull = certifyCanonicalConstructedMicrocycle({ allocation: allocation(), sessions: replace(base, 1, 1, "ex-decline-barbell-bench"), exercises: exerciseLibrary });
    expect(pressingWithoutVerticalPull.failures).toEqual(expect.arrayContaining(["lats_direct_coverage_missing", "slot_movement_mismatch:ex-decline-barbell-bench:lat position assistance for the deadlift"]));

    const specialistDefault = certifyCanonicalConstructedMicrocycle({ allocation: allocation(), sessions: replace(base, 2, 1, "ex-anderson-squat"), exercises: exerciseLibrary });
    expect(specialistDefault.failures).toContain("unauthorised_specialist_selection");

    const repeatedRowOmittingPull = certifyCanonicalConstructedMicrocycle({ allocation: allocation(), sessions: replace(base, 1, 1, "ex-chest-supported-row"), exercises: exerciseLibrary });
    expect(repeatedRowOmittingPull.failures).toEqual(expect.arrayContaining(["lats_direct_coverage_missing", "repeat_without_programme_reason:ex-chest-supported-row"]));
  });

  it("uses lift- and fatigue-aware exact targets rather than universal 10/14 defaults", () => {
    const sessions = construct();
    const slots = sessions.flatMap((session) => session.slots);
    const bench = slots.find((slot) => slot.exerciseId === "ex-bench-press")!;
    const squat = slots.find((slot) => slot.exerciseId === "ex-barbell-back-squat")!;
    const deadlift = slots.find((slot) => slot.exerciseId === "ex-deadlift")!;
    expect({ sets: deadlift.settings.requiredSets, targets: deadlift.exactTargets, rest: deadlift.rest.seconds }).toEqual({ sets: 3, targets: [5, 5, 5], rest: 240 });
    expect({ targets: bench.exactTargets, rest: bench.rest.seconds }).toEqual({ targets: [6, 6, 6, 6], rest: 180 });
    expect({ targets: squat.exactTargets, rest: squat.rest.seconds }).toEqual({ targets: [6, 6, 6, 6], rest: 210 });
    expect(new Set(sessions.flatMap((session) => session.slots.flatMap((slot) => slot.exactTargets ?? [])))).toEqual(new Set([5, 6, 10, 12, 15]));
  });

  it("keeps calibration outside working volume and does not repeat it with fresh established evidence", () => {
    const missing = construct()[0]!.slots[0]!.loadPrescription;
    expect(missing.state).toBe("calibration_required");
    if (missing.state === "calibration_required") expect(missing.protocol).toMatchObject({ targetReps: 6, workingSets: 4, warmupAndRampExcludedFromWorkingVolume: true, evidenceRetention: { persistCompletedWorkingSetEvidence: true, reuseWhileFreshAndCompatible: true, recalibrateOnlyWhen: ["missing", "stale", "incompatible"] } });
    const established = construct(true).slice(0, 3).map((session) => session.slots[0]!.loadPrescription);
    expect(established.map((load) => load.state)).toEqual(["established", "established", "established"]);
    expect(established.every((load) => !("protocol" in load))).toBe(true);
  });

  it("reports excessive local overlap instead of a false no-overlap result", () => {
    const base = allocation();
    const squatSecondary = base.slots.find((slot) => slot.sessionIndex === 2 && slot.order === 1)!;
    const overloaded = [...base.slots, { ...squatSecondary, order: 99, workingSets: 3 }];
    expect(detectCanonicalMicrocycleOverlap(overloaded)).toContain("session_2_excessive_knee_dominant_overlap");
    expect(base.directSets.quadriceps).toBe(7);
  });
});
