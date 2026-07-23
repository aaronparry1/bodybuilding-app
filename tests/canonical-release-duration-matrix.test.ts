import { describe, expect, it } from "vitest";
import { allocateCanonicalMicrocycleVolume } from "@/domain/training/canonical-microcycle-volume-allocator";
import { createMacrocycle, macrocycleEngineForGoal } from "@/domain/training/macrocycle-engine";
import { selectMesocycles } from "@/domain/training/mesocycle-library";
import { createMicrocycle } from "@/domain/training/microcycle-scheduler";
import { canonicalSessionDurationOptions } from "@/domain/training/canonical-session-duration";
import type { CanonicalStartingVolumeContext } from "@/domain/training/canonical-hypertrophy-volume-policy";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";

const startingVolumeContext: CanonicalStartingVolumeContext = { continuity: "currently_training", recentTrainingDaysPerWeek: 5, recentSessionWorkload: "moderate", recentSessionDurationMinutes: 60, recovery: "ordinary", history: "none", workCapacity: "not_demonstrated", concurrentSport: "none", loadConfidence: "calibration_required", dosageConfidence: "declared_recent_training" };
const equipment = ["barbell", "dumbbell", "machine", "cable", "smith", "bodyweight"] as const;

function matrix() {
  const macrocycle = createMacrocycle("build_muscle", "intermediate", undefined, "2026-07-20T08:00:00.000Z");
  const mesocycle = selectMesocycles(macrocycleEngineForGoal("build_muscle"), "intermediate")[0]!;
  const microcycle = createMicrocycle({ parentMesocycleId: mesocycle.id, trainingDays: 5, split: "push_pull_legs" });
  return canonicalSessionDurationOptions.map((minutes) => {
    const allocation = allocateCanonicalMicrocycleVolume({ macrocycleGoal: "build_muscle", mesocycleId: mesocycle.id, mesocyclePurpose: mesocycle.adaptation, microcyclePriority: microcycle.priority, microcycleSequence: microcycle.sequenceNumber, experience: "intermediate", frequency: 5, split: "push_pull_legs", equipment, recoveryRestricted: false, establishedLoadExerciseIds: [], sessionRoles: microcycle.sessionRoles, sessionTypes: microcycle.sessionTypes, startingVolumeContext, availableSessionMinutes: minutes });
    return { minutes, calendarSliceWorkingSets: allocation.totalWorkingSets, slots: allocation.slots, sessions: allocation.sessionWorkingSets.map((workingSets, index) => ({ role: microcycle.sessionRoles[index], workingSets, estimatedMinutes: allocation.estimatedSessionMinutes[index] })), durationConstraint: allocation.durationConstraint, certification: allocation.certification };
  });
}

function releaseArtifact() {
  return {
    schemaVersion: "canonical_release_duration_coverage_v1",
    scenario: {
      goal: "build_muscle",
      experience: "intermediate",
      frequencyDays: 5,
      framework: "push_pull_legs",
      continuity: "currently_training",
      quantityDefinitions: {
        sessionWorkingSets: "working sets in one generated session",
        calendarSliceWorkingSets: "working sets in the five sessions scheduled in the current calendar slice",
        completeRotationDirectSets: "direct working sets across the complete six-session PPL rotation",
        normalizedSevenDayDirectSets: "complete-rotation direct working sets multiplied by 5/6",
        meaningfulSecondaryExposure: "separately certified exercise-metadata exposure; never added to direct dosage",
        completedPerformedWork: "valid ledger performance events in completed recorded sessions",
      },
    },
    durations: matrix().map((entry) => ({
      minutes: entry.minutes,
      feasibility: entry.durationConstraint.feasibility,
      calendarSliceWorkingSets: entry.calendarSliceWorkingSets,
      sessions: entry.sessions.map((session) => ({ role: session.role, sessionWorkingSets: session.workingSets, estimatedMinutes: session.estimatedMinutes })),
      completeRotationDirectSets: entry.durationConstraint.completeRotationDirectSets,
      normalizedSevenDayDirectSets: entry.durationConstraint.normalizedSevenDayDirectSets,
      omittedStimuliByCompleteRotationSession: entry.durationConstraint.omittedStimuliBySession,
      redistributions: entry.durationConstraint.redistributions,
      recoveredLater: entry.durationConstraint.recoveryByStimulus,
      durationInducedUnmetTargets: entry.durationConstraint.durationInducedUnmetTargets,
      customerGuidance: entry.durationConstraint.customerGuidance ?? null,
      certificationStatus: entry.certification.status,
      certificationFailures: entry.certification.failures,
    })),
  };
}

describe("release duration rolling-coverage matrix", () => {
  it("labels calendar-slice, complete-rotation and normalized seven-day quantities and fails chronic gaps closed", () => {
    const output = matrix();
    const generated = releaseArtifact();
    if (process.env.UPDATE_RELEASE_CANDIDATE_REPORTS === "1") {
      mkdirSync("qa-reports/release-candidate", { recursive: true });
      writeFileSync("qa-reports/release-candidate/canonical-duration-coverage.json", `${JSON.stringify(generated, null, 2)}\n`);
    }
    const artifact = JSON.parse(readFileSync("qa-reports/release-candidate/canonical-duration-coverage.json", "utf8"));
    expect(output.map((entry) => entry.minutes)).toEqual([30, 45, 60, 75, 90]);
    for (const entry of output) {
      expect(entry.sessions.every((session) => session.estimatedMinutes! <= entry.minutes)).toBe(true);
      expect(entry.durationConstraint.completeRotationDirectSets).toBeDefined();
      expect(entry.durationConstraint.normalizedSevenDayDirectSets).toBeDefined();
      expect(entry.certification.status).toBe(entry.durationConstraint.durationInducedUnmetTargets.length ? "failed" : "passed");
    }
    const sixtyMinutes = output.find((entry) => entry.minutes === 60)!;
    expect(sixtyMinutes.durationConstraint.feasibility).toBe("viable");
    expect(sixtyMinutes.durationConstraint.durationInducedUnmetTargets).toEqual([]);
    expect(sixtyMinutes.durationConstraint.redistributions.map((entry) => entry.stimulus).sort()).toEqual([
      "calves",
      "hamstrings_knee_flexion",
    ]);
    expect(sixtyMinutes.durationConstraint.redistributions.every((entry) => entry.recoveredWorkingSets >= 1)).toBe(true);
    expect(sixtyMinutes.slots.every((slot) => slot.workingSets >= 2)).toBe(true);
    const ninetyMinutes = output.find((entry) => entry.minutes === 90)!;
    const primarySignature = (entry: typeof sixtyMinutes) => entry.slots
      .filter((slot) => slot.constructionRole === "primary")
      .map((slot) => ({ sessionIndex: slot.sessionIndex, purpose: slot.purpose, workingSets: slot.workingSets }));
    expect(primarySignature(sixtyMinutes)).toEqual(primarySignature(ninetyMinutes));
    expect(output.filter((entry) => entry.minutes >= 60).every((entry) => entry.durationConstraint.feasibility === "viable")).toBe(true);
    expect(output.filter((entry) => entry.minutes < 60).every((entry) => entry.durationConstraint.feasibility === "infeasible" && Boolean(entry.durationConstraint.customerGuidance))).toBe(true);
    expect(artifact).toEqual(generated);
  });
});
