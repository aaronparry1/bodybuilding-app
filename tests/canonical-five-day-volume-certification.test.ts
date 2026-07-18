import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { constructCanonicalActivePlanFromCanonicalInputs } from "@/application/training/canonical-active-plan-construction";
import { canonicalFiveDayFixtureInput, canonicalFiveDayFixtureProfile, constructCanonicalFiveDayFixture } from "@/application/design-qa/canonical-five-day-plan-fixture";
import { allocateCanonicalMicrocycleVolume } from "@/domain/training/canonical-microcycle-volume-allocator";
import { canonicalMicrocycleVolumePolicy } from "@/domain/training/canonical-microcycle-volume-allocator";
import { certifyCanonicalConstructedMicrocycle } from "@/domain/training/canonical-constructed-microcycle-certification";
import { validateCanonicalLoadPrescription, type CanonicalLoadEvidence } from "@/domain/training/canonical-load-prescription";
import type { CanonicalSessionSnapshotV3 } from "@/domain/training/canonical-session-construction-pipeline";
import { exerciseLibrary } from "@/domain/training/presets";

const artifactPath = new URL("../qa-reports/data-performance-audit/canonical-five-day-microcycle-certification.md", import.meta.url);
const fullEquipment = canonicalFiveDayFixtureProfile.equipment;

function snapshotSlots(session: Readonly<{ prescriptionSnapshot: Readonly<Record<string, unknown>> }>): CanonicalSessionSnapshotV3["slots"] {
  return (session.prescriptionSnapshot as CanonicalSessionSnapshotV3).slots;
}

function construct(established = false) {
  const liftIds = ["ex-bench-press", "ex-barbell-back-squat", "ex-deadlift"] as const;
  const establishedLoads = established ? { "ex-bench-press": 80, "ex-barbell-back-squat": 120, "ex-deadlift": 150 } : undefined;
  const loadEvidence = established ? Object.fromEntries(liftIds.map((exerciseId, index) => [exerciseId, {
    evidenceId: `evidence-${exerciseId}`,
    evidenceVersion: "canonical_progress_evidence_v1",
    athleteId: "synthetic-athlete",
    exerciseId,
    observedLoad: [80, 120, 150][index]!,
    observedReps: 8,
    baseUnit: "kg",
    freshnessVersion: 1,
    calibrationStatus: "established",
  } satisfies CanonicalLoadEvidence])) : undefined;
  if (!established) return constructCanonicalFiveDayFixture();
  return constructCanonicalActivePlanFromCanonicalInputs({
    ...canonicalFiveDayFixtureInput("canonical-five-day-established"),
    establishedLoads,
    loadEvidence,
  });
}

function report(): string {
  const result = construct();
  if (result.status !== "constructed") throw new Error(result.reason);
  const allocation = allocateCanonicalMicrocycleVolume({
    macrocycleGoal: "build_muscle_and_strength",
    mesocycleId: result.carrier.mesocycle.id,
    mesocyclePurpose: result.carrier.mesocycle.output.adaptation,
    microcyclePriority: result.carrier.microcycle.output.priority,
    microcycleSequence: result.carrier.microcycle.output.sequenceNumber,
    experience: "intermediate",
    frequency: 5,
    split: "let_app_choose",
    equipment: fullEquipment,
    recoveryRestricted: false,
    establishedLoadExerciseIds: [],
    sessionRoles: result.carrier.microcycle.output.sessionRoles,
  });
  const snapshots = result.carrier.plannedSessions.map((session) => session.prescriptionSnapshot as CanonicalSessionSnapshotV3);
  const certification = certifyCanonicalConstructedMicrocycle({ allocation, sessions: snapshots, exercises: exerciseLibrary });
  const actualMovementExposures = snapshots.flatMap((snapshot) => snapshot.slots).reduce<Record<string, number>>((counts, slot) => {
    const movement = exerciseLibrary.find((exercise) => exercise.id === slot.exerciseId)!.movementPattern;
    counts[movement] = (counts[movement] ?? 0) + 1;
    return counts;
  }, {});
  const lines = [
    "# Canonical five-day microcycle certification",
    "",
    "- Schema: `canonical_five_day_microcycle_certification_v2`",
    "- Profile: Build muscle and strength · intermediate · 5 days · let app choose",
    `- Equipment: ${fullEquipment.join(", ")}`,
    `- Accounting: ${canonicalMicrocycleVolumePolicy.accountingConvention}`,
    "- Calibration: warm-up/ramp attempts occur before working sets and are excluded from working volume; completed working-set evidence is retained and reused while fresh and compatible.",
    "",
    "## Week",
    "",
    `- Direct-set target bands: ${Object.entries(allocation.directSetTargets).map(([muscle, bounds]) => `${muscle} ${bounds!.min}-${bounds!.max}`).join(" · ")}`,
    `- Actual direct stimulus sets: ${Object.entries(certification.directStimulusSets).map(([region, sets]) => `${region} ${sets}`).join(" · ")}`,
    `- Meaningful secondary stimulus sets (reported separately): ${Object.entries(certification.meaningfulSecondaryStimulusSets).map(([region, sets]) => `${region} ${sets}`).join(" · ")}`,
    `- Actual movement exposures: ${Object.entries(actualMovementExposures).map(([pattern, count]) => `${pattern} ${count}`).join(" · ")}`,
    `- Lift exposures: bench primary ${allocation.primaryLiftExposures.bench.primary}, secondary variation ${allocation.primaryLiftExposures.bench.secondaryVariation} · squat primary ${allocation.primaryLiftExposures.squat.primary}, secondary variation ${allocation.primaryLiftExposures.squat.secondaryVariation} · deadlift primary ${allocation.primaryLiftExposures.deadlift.primary}, secondary variation ${allocation.primaryLiftExposures.deadlift.secondaryVariation}`,
    `- Session working sets: ${allocation.sessionWorkingSets.join(" / ")} (total ${allocation.totalWorkingSets})`,
    `- Estimated minutes: ${allocation.estimatedSessionMinutes.join(" / ")}`,
    `- Fatigue units: ${allocation.fatigue.perSession.join(" / ")} (total ${allocation.fatigue.weeklyUnits}); overlap flags: ${allocation.fatigue.overlapFlags.length ? allocation.fatigue.overlapFlags.join(", ") : "none"}`,
    `- Selected-exercise fatigue units: ${certification.fatigueUnits.perSession.join(" / ")} (total ${certification.fatigueUnits.weekly})`,
    `- Repeated exercises: ${certification.repeatedExercises.length ? certification.repeatedExercises.map((entry) => `${entry.exerciseId} ×${entry.count} (${entry.reason})`).join(" · ") : "none; variation filled the required weekly patterns without sacrificing stable week-to-week prescriptions"}`,
    `- Certification checks: ${allocation.certification.checks.join(" · ")}`,
    `- Certification failures: ${allocation.certification.failures.length ? allocation.certification.failures.join(" · ") : "none"}`,
    "",
  ];
  result.carrier.plannedSessions.forEach((session, sessionIndex) => {
    lines.push(`## ${sessionIndex + 1}. ${session.role}`, "", `Purpose: ${result.carrier.mesocycle.output.adaptation}. Estimated duration: ${allocation.estimatedSessionMinutes[sessionIndex]} minutes.`, "", "| # | Exercise | Slot purpose | Classification | Suitability | Repeat reason | Direct / meaningful secondary | Sets | Exact targets | Load/calibration | Rest | Fatigue |", "|---:|---|---|---|---|---|---|---:|---|---|---:|---|");
    snapshotSlots(session).forEach((prescription, slotIndex) => {
      const exercise = exerciseLibrary.find((candidate) => candidate.id === prescription.exerciseId)!;
      const allocated = allocation.slots.find((candidate) => candidate.sessionIndex === sessionIndex && candidate.order === slotIndex)!;
      const targets = (prescription.exactTargets ?? Array.from({ length: prescription.settings.requiredSets ?? 0 }, () => prescription.targetReps)).map((target) => `${target} reps`).join(" / ");
      const profile = exercise.stimulusProfile!;
      const load = prescription.loadPrescription.state === "calibration_required" ? `calibration_required; pre-work ramp to ${prescription.loadPrescription.protocol?.targetReps ?? prescription.targetReps} reps; retain evidence` : prescription.loadPrescription.state;
      lines.push(`| ${slotIndex + 1} | ${exercise.name} (\`${exercise.id}\`) | ${allocated.purpose} | ${exercise.movementPattern}; ${exercise.family}; ${exercise.selectionProfile ?? "general"} | ${prescription.selection?.suitability ?? "not_recorded"} | ${prescription.selection?.repeatReason ?? "not_recorded"} | ${profile.direct.join(", ")} / ${profile.meaningfulSecondary.join(", ") || "none"} | ${prescription.settings.requiredSets} | ${targets} | ${load} | ${prescription.rest.seconds}s | ${exercise.fatigueCost} |`);
    });
    lines.push("");
  });
  lines.push(`Constructed-week checks: ${certification.checks.join(" · ")}`, "", `Final status: **${allocation.certification.status === "passed" && certification.status === "passed" ? "PASSED" : "FAILED"}**`, "");
  return lines.join("\n");
}

describe("canonical five-day microcycle certification", () => {
  it("matches the committed complete-week certification artifact", () => {
    const expected = readFileSync(artifactPath, "utf8");
    expect(report()).toEqual(expected);
  });

  it("persists a complete exact prescription for every allocated exercise", () => {
    const result = construct();
    expect(result.status).toBe("constructed");
    if (result.status !== "constructed") return;
    expect(result.carrier.plannedSessions.map((session) => snapshotSlots(session).length)).toEqual([4, 4, 4, 6, 5]);
    for (const session of result.carrier.plannedSessions) {
      const slots = snapshotSlots(session);
      const exerciseIds = slots.map((slot) => slot.exerciseId);
      expect(new Set(exerciseIds).size).toBe(exerciseIds.length);
      for (const slot of slots) {
        expect(slot.targetReps).toBeGreaterThan(0);
        expect(slot.settings.requiredSets).toBeGreaterThan(0);
        expect(slot.settings.requiredSets).toBe(slot.settings.requiredWorkSets);
        expect(slot.rest.seconds).toBeGreaterThan(0);
        expect(validateCanonicalLoadPrescription(slot.loadPrescription)).toEqual({ status: "valid" });
      }
    }
    expect(result.carrier.plannedSessions.flatMap(snapshotSlots).filter((slot) => slot.loadPrescription.state === "calibration_required").length).toBeGreaterThan(0);
    const calibration = result.carrier.plannedSessions.flatMap(snapshotSlots).find((slot) => slot.loadPrescription.state === "calibration_required")?.loadPrescription;
    expect(calibration?.state).toBe("calibration_required");
    if (calibration?.state === "calibration_required") {
      expect(calibration.protocol?.warmupAndRampExcludedFromWorkingVolume).toBe(true);
      expect(calibration.protocol?.evidenceRetention.reuseWhileFreshAndCompatible).toBe(true);
    }
  });

  it("uses retained canonical evidence for established squat, bench and deadlift loads", () => {
    const result = construct(true);
    expect(result.status).toBe("constructed");
    if (result.status !== "constructed") return;
    const mainLiftSlots = result.carrier.plannedSessions.slice(0, 3).map((session) => snapshotSlots(session)[0]!);
    expect(mainLiftSlots.map((slot) => slot.exerciseId)).toEqual(["ex-bench-press", "ex-barbell-back-squat", "ex-deadlift"]);
    expect(mainLiftSlots.map((slot) => slot.loadPrescription.state)).toEqual(["established", "established", "established"]);
    expect(mainLiftSlots.map((slot) => slot.loadPrescription.state === "established" ? slot.loadPrescription.prescribedBaseLoad : null)).toEqual([80, 120, 150]);
  });

  it("generates byte-equivalent prescriptions for identical inputs", () => {
    expect(JSON.stringify(construct())).toBe(JSON.stringify(construct()));
  });

  it("treats this fixture's absent vertical press as a phase-specific certified result, not an unserved universal slot", () => {
    const result = construct();
    if (result.status !== "constructed") throw new Error(result.reason);
    const snapshots = result.carrier.plannedSessions.map((session) => session.prescriptionSnapshot as CanonicalSessionSnapshotV3);
    const verticalPresses = snapshots.flatMap((session) => session.slots).filter((slot) => exerciseLibrary.find((exercise) => exercise.id === slot.exerciseId)?.movementPattern === "vertical_push");
    const allocation = allocateCanonicalMicrocycleVolume({ macrocycleGoal: "build_muscle_and_strength", mesocycleId: result.carrier.mesocycle.id, mesocyclePurpose: result.carrier.mesocycle.output.adaptation, microcyclePriority: result.carrier.microcycle.output.priority, microcycleSequence: result.carrier.microcycle.output.sequenceNumber, experience: "intermediate", frequency: 5, split: "let_app_choose", equipment: fullEquipment, recoveryRestricted: false, establishedLoadExerciseIds: [], sessionRoles: result.carrier.microcycle.output.sessionRoles });
    const certification = certifyCanonicalConstructedMicrocycle({ allocation, sessions: snapshots, exercises: exerciseLibrary });
    expect(verticalPresses).toHaveLength(0);
    expect(certification.status).toBe("passed");
    expect(certification.meaningfulSecondaryStimulusSets.anterior_delts).toBeGreaterThanOrEqual(6);
    expect(allocation.slots.some((slot) => slot.movementPatterns.includes("vertical_push"))).toBe(false);
  });
});
