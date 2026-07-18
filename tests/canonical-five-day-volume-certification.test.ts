import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { constructCanonicalActivePlanFromCanonicalInputs } from "@/application/training/canonical-active-plan-construction";
import { allocateCanonicalMicrocycleVolume } from "@/domain/training/canonical-microcycle-volume-allocator";
import { validateCanonicalLoadPrescription, type CanonicalLoadEvidence } from "@/domain/training/canonical-load-prescription";
import type { CanonicalSessionSnapshotV3 } from "@/domain/training/canonical-session-construction-pipeline";
import { exerciseLibrary } from "@/domain/training/presets";

const artifactPath = new URL("../qa-reports/data-performance-audit/canonical-five-day-microcycle-certification.md", import.meta.url);
const fullEquipment = ["barbell", "dumbbell", "machine", "cable", "bodyweight"] as const;
const fixed = { createdAt: "2026-01-01T00:00:00.000Z", updatedAt: "2026-01-01T00:00:00.000Z" } as const;

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
  return constructCanonicalActivePlanFromCanonicalInputs({
    planId: established ? "canonical-five-day-established" : "canonical-five-day-certification",
    ...fixed,
    goal: "strength_hypertrophy",
    macrocycleGoal: "build_muscle_and_strength",
    experienceLevel: "intermediate",
    daysPerWeek: 5,
    preferredSplit: "let_app_choose",
    equipment: fullEquipment,
    units: "kg",
    exercises: exerciseLibrary,
    history: [],
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
  const lines = [
    "# Canonical five-day microcycle certification",
    "",
    "- Schema: `canonical_five_day_microcycle_certification_v1`",
    "- Profile: Build muscle and strength · intermediate · 5 days · let app choose",
    `- Equipment: ${fullEquipment.join(", ")}`,
    "- Accounting: Direct working sets are divided equally across the allocator's explicit direct target muscles. Secondary exercise muscles are listed but are not converted into set equivalents.",
    "- Supported indirect contribution: none quantified without an explicit canonical policy.",
    "",
    "## Week",
    "",
    `- Direct-set target bands: ${Object.entries(allocation.directSetTargets).map(([muscle, bounds]) => `${muscle} ${bounds!.min}-${bounds!.max}`).join(" · ")}`,
    `- Direct sets: ${Object.entries(allocation.directSets).map(([muscle, sets]) => `${muscle} ${sets}`).join(" · ")}`,
    `- Movement exposures: ${Object.entries(allocation.movementPatternExposures).map(([pattern, count]) => `${pattern} ${count}`).join(" · ")}`,
    `- Primary lifts: bench ${allocation.primaryLiftExposures.bench} · squat ${allocation.primaryLiftExposures.squat} · deadlift ${allocation.primaryLiftExposures.deadlift}`,
    `- Session working sets: ${allocation.sessionWorkingSets.join(" / ")} (total ${allocation.totalWorkingSets})`,
    `- Estimated minutes: ${allocation.estimatedSessionMinutes.join(" / ")}`,
    `- Fatigue units: ${allocation.fatigue.perSession.join(" / ")} (total ${allocation.fatigue.weeklyUnits}); overlap flags: ${allocation.fatigue.overlapFlags.length ? allocation.fatigue.overlapFlags.join(", ") : "none"}`,
    `- Certification checks: ${allocation.certification.checks.join(" · ")}`,
    `- Certification failures: ${allocation.certification.failures.length ? allocation.certification.failures.join(" · ") : "none"}`,
    "",
  ];
  result.carrier.plannedSessions.forEach((session, sessionIndex) => {
    lines.push(`## ${sessionIndex + 1}. ${session.role}`, "", `Purpose: ${result.carrier.mesocycle.output.adaptation}. Estimated duration: ${allocation.estimatedSessionMinutes[sessionIndex]} minutes.`, "", "| # | Exercise | Slot / compatibility | Movement | Primary / secondary | Sets | Exact targets | Load | Rest | Est. min | Fatigue |", "|---:|---|---|---|---|---:|---|---|---:|---:|---|");
    snapshotSlots(session).forEach((prescription, slotIndex) => {
      const exercise = exerciseLibrary.find((candidate) => candidate.id === prescription.exerciseId)!;
      const allocated = allocation.slots.find((candidate) => candidate.sessionIndex === sessionIndex && candidate.order === slotIndex)!;
      const targets = Array.from({ length: prescription.settings.requiredSets ?? 0 }, () => `${prescription.targetReps} reps`).join(" / ");
      lines.push(`| ${slotIndex + 1} | ${exercise.name} (\`${exercise.id}\`) | ${allocated.purpose}; ${exercise.movementPattern} serves ${allocated.muscles.join("+")} | ${exercise.movementPattern} | ${exercise.primaryMuscles.join(", ")} / ${exercise.secondaryMuscles.join(", ") || "none"} | ${prescription.settings.requiredSets} | ${targets} | ${prescription.loadPrescription.state} | ${prescription.rest.seconds}s | ${(prescription.settings.requiredSets ?? 0) * 3} | ${exercise.fatigueCost} |`);
    });
    lines.push("");
  });
  lines.push(`Final status: **${allocation.certification.status.toUpperCase()}**`, "");
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
    expect(result.carrier.plannedSessions.map((session) => snapshotSlots(session).length)).toEqual([4, 4, 4, 5, 5]);
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
    expect(result.carrier.plannedSessions.flatMap(snapshotSlots).some((slot) => slot.loadPrescription.state === "bodyweight")).toBe(true);
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
});
