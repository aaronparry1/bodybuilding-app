import { beforeEach, describe, expect, it } from "vitest";
import { changeCanonicalSessionDuration, createCanonicalActivePlan } from "@/application/training/canonical-active-plan-application";
import { canonicalActivePlanV2Repository } from "@/data/local/canonical-active-plan-v2-repository";
import { constructCanonicalActivePlanFromCanonicalInputs } from "@/application/training/canonical-active-plan-construction";
import { canonicalSessionDurationOptions, resolveCanonicalSessionDuration } from "@/domain/training/canonical-session-duration";
import { calibrateCanonicalSessionDurationEstimate } from "@/domain/training/canonical-session-duration";
import { allocateCanonicalMicrocycleVolume } from "@/domain/training/canonical-microcycle-volume-allocator";
import { exerciseLibrary } from "@/domain/training/presets";

const equipment = ["barbell", "dumbbell", "machine", "cable", "bodyweight"] as const;

describe("canonical per-session available-time planning", () => {
  beforeEach(() => canonicalActivePlanV2Repository.clear());

  it("accepts only the five typed durations", () => {
    expect(canonicalSessionDurationOptions).toEqual([30, 45, 60, 75, 90]);
    expect(resolveCanonicalSessionDuration(44)).toEqual({ status: "invalid", policyId: "canonical_session_duration_policy_v2", reason: "unsupported_session_duration", customerGuidance: "Choose 30, 45, 60, 75 or 90 minutes per workout." });
  });

  it.each(canonicalSessionDurationOptions)("constructs viable %s-minute programmes and fails closed when the duration creates a chronic coverage gap", (availableSessionMinutes) => {
    for (const experienceLevel of ["beginner", "intermediate", "advanced"] as const) {
      for (const daysPerWeek of [2, 3, 4, 5, 6] as const) {
        const result = constructCanonicalActivePlanFromCanonicalInputs({ planId: `duration:${availableSessionMinutes}:${experienceLevel}:${daysPerWeek}`, createdAt: "2026-01-01T00:00:00.000Z", updatedAt: "2026-01-01T00:00:00.000Z", goal: "hypertrophy", macrocycleGoal: "build_muscle", experienceLevel, daysPerWeek, preferredSplit: "let_app_choose", equipment, units: "kg", availableSessionMinutes, exercises: exerciseLibrary, history: [] });
        if (result.status !== "constructed") {
          expect(result).toMatchObject({ status: "carrier_validation_failed" });
          expect(result.reason).toContain("chronic_volume_floor_unmet");
          continue;
        }
        expect(result.carrier.constraints.availableSessionMinutes).toBe(availableSessionMinutes);
        const allocation = allocateCanonicalMicrocycleVolume({ macrocycleGoal: "build_muscle", mesocycleId: result.carrier.mesocycle.id, mesocyclePurpose: result.carrier.mesocycle.output.adaptation, microcyclePriority: result.carrier.microcycle.output.priority, microcycleSequence: result.carrier.microcycle.output.sequenceNumber, experience: experienceLevel, frequency: daysPerWeek, split: "let_app_choose", equipment, recoveryRestricted: false, establishedLoadExerciseIds: [], sessionRoles: result.carrier.microcycle.output.sessionRoles, sessionTypes: result.carrier.microcycle.output.sessionTypes, startingVolumeContext: result.carrier.constraints.startingVolumeContext, availableSessionMinutes, enforceCompleteRollingCoverage: true });
        expect(allocation.durationConstraint.model).toBe("component_duration_v2");
        expect(allocation.durationConstraint.feasibility).toBe("viable");
        expect(allocation.estimatedSessionMinutes.every((minutes) => minutes <= availableSessionMinutes)).toBe(true);
        for (const [index, session] of result.carrier.plannedSessions.entries()) {
          const slots = (session.prescriptionSnapshot as { slots: Array<{ settings: { requiredSets?: number; requiredWorkSets: number } }> }).slots;
          expect(allocation.durationEstimates[index]?.assumptions).toContain("prescribed_or_role_owned_rest_included");
          expect(slots.every((slot) => (slot.settings.requiredSets ?? slot.settings.requiredWorkSets) >= 2)).toBe(true);
        }
      }
    }
  });

  it("calibrates only future estimates from at least three comparable completed durations", () => {
    expect(calibrateCanonicalSessionDurationEstimate({ predictedMinutes: 60, comparableObservedMinutes: [70, 72] })).toMatchObject({ status: "not_available", calibratedFutureMinutes: 60, completedHistoryRewritten: false });
    expect(calibrateCanonicalSessionDurationEstimate({ predictedMinutes: 60, comparableObservedMinutes: [66, 72, 69] })).toMatchObject({ status: "calibrated", comparableCompletedObservations: 3, multiplier: 1.15, calibratedFutureMinutes: 69, completedHistoryRewritten: false });
  });

  it("rejects an infeasible duration atomically and preserves recorded references", () => {
    const created = createCanonicalActivePlan({ planId: "duration-change", createdAt: "2026-01-01T00:00:00.000Z", updatedAt: "2026-01-01T00:00:00.000Z", goal: "hypertrophy", macrocycleGoal: "build_muscle", experienceLevel: "intermediate", daysPerWeek: 5, preferredSplit: "push_pull_legs", equipment, units: "kg", availableSessionMinutes: 75, exercises: exerciseLibrary });
    expect(created.status).toBe("ok");
    const raw = canonicalActivePlanV2Repository.get();
    if (raw.status !== "saved") throw new Error("plan missing");
    const reference = { sessionId: "completed:1", planId: raw.carrier.planId, macrocycleId: raw.carrier.macrocycle.id, mesocycleId: raw.carrier.mesocycle.id, microcycleId: raw.carrier.microcycle.id, revision: 1, status: "completed" as const, recordReference: "canonical-recorded-session:completed:1" };
    const lineage = { schemaVersion: "canonical_session_lineage_v1" as const, planId: raw.carrier.planId, macrocycleId: raw.carrier.macrocycle.id, mesocycleId: raw.carrier.mesocycle.id, microcycleId: raw.carrier.microcycle.id, revision: raw.carrier.revision, sequenceNumber: raw.carrier.microcycle.output.sequenceNumber, status: "current" as const };
    expect(canonicalActivePlanV2Repository.save({ ...raw.carrier, cycleLineage: [lineage], recordedSessionReferences: [reference] }).status).toBe("saved");
    const result = changeCanonicalSessionDuration({ planId: raw.carrier.planId, expectedRevision: raw.carrier.revision, availableSessionMinutes: 45, updatedAt: "2026-01-02T00:00:00.000Z" });
    expect(result).toMatchObject({ status: "rejected", historyPreserved: true, futureSessionsRegenerated: false, priorRevision: 0, newRevision: 0 });
    expect(result.reason).toContain("session_duration_infeasible");
    const after = canonicalActivePlanV2Repository.get();
    expect(after.status).toBe("saved");
    if (after.status === "saved") {
      expect(after.carrier.recordedSessionReferences).toEqual([reference]);
      expect(after.carrier.constraints.availableSessionMinutes).toBe(75);
    }
  });

  it("applies a viable duration change atomically and preserves recorded references", () => {
    const created = createCanonicalActivePlan({ planId: "duration-change-viable", createdAt: "2026-01-01T00:00:00.000Z", updatedAt: "2026-01-01T00:00:00.000Z", goal: "hypertrophy", macrocycleGoal: "build_muscle", experienceLevel: "intermediate", daysPerWeek: 5, preferredSplit: "push_pull_legs", equipment, units: "kg", availableSessionMinutes: 90, exercises: exerciseLibrary });
    expect(created.status).toBe("ok");
    const raw = canonicalActivePlanV2Repository.get();
    if (raw.status !== "saved") throw new Error("plan missing");
    const reference = { sessionId: "completed:viable", planId: raw.carrier.planId, macrocycleId: raw.carrier.macrocycle.id, mesocycleId: raw.carrier.mesocycle.id, microcycleId: raw.carrier.microcycle.id, revision: 1, status: "completed" as const, recordReference: "canonical-recorded-session:completed:viable" };
    expect(canonicalActivePlanV2Repository.save({ ...raw.carrier, recordedSessionReferences: [reference] }).status).toBe("saved");

    const result = changeCanonicalSessionDuration({ planId: raw.carrier.planId, expectedRevision: raw.carrier.revision, availableSessionMinutes: 75, updatedAt: "2026-01-02T00:00:00.000Z" });
    expect(result).toMatchObject({ status: "applied", reason: "future_sessions_reconstructed_for_duration", historyPreserved: true, futureSessionsRegenerated: true, priorRevision: 0, newRevision: 1 });
    const after = canonicalActivePlanV2Repository.get();
    expect(after.status).toBe("saved");
    if (after.status === "saved") {
      expect(after.carrier.recordedSessionReferences).toEqual([reference]);
      expect(after.carrier.constraints.availableSessionMinutes).toBe(75);
      expect(after.carrier.plannedSessions.every((session) => session.constructionVersion === "canonical_plan_v3")).toBe(true);
      expect(after.carrier.plannedSessions.every((session) => (session.prescriptionSnapshot as { schemaVersion?: string }).schemaVersion === "canonical_session_snapshot_v3")).toBe(true);
      expect(after.carrier.plannedSessions.every((session) => Number((session.prescriptionSnapshot as { estimatedDurationMinutes?: number }).estimatedDurationMinutes) <= 75)).toBe(true);
    }
  });

  it("rejects stale, invalid and active-attempt changes without mutation", () => {
    const created = createCanonicalActivePlan({ planId: "duration-reject", createdAt: "2026-01-01T00:00:00.000Z", updatedAt: "2026-01-01T00:00:00.000Z", goal: "hypertrophy", macrocycleGoal: "build_muscle", experienceLevel: "intermediate", daysPerWeek: 4, preferredSplit: "upper_lower", equipment, units: "kg", availableSessionMinutes: 75, exercises: exerciseLibrary });
    expect(created.status).toBe("ok");
    expect(changeCanonicalSessionDuration({ planId: "duration-reject", expectedRevision: 99, availableSessionMinutes: 45, updatedAt: "2026-01-02T00:00:00.000Z" }).reason).toBe("stale_plan_revision");
    expect(changeCanonicalSessionDuration({ planId: "duration-reject", expectedRevision: 0, availableSessionMinutes: 42, updatedAt: "2026-01-02T00:00:00.000Z" }).reason).toBe("unsupported_session_duration");
    const raw = canonicalActivePlanV2Repository.get();
    if (raw.status !== "saved") throw new Error("plan missing");
    expect(canonicalActivePlanV2Repository.save({ ...raw.carrier, operational: { openWorkoutId: "active:1" } }).status).toBe("saved");
    const active = changeCanonicalSessionDuration({ planId: "duration-reject", expectedRevision: 0, availableSessionMinutes: 45, updatedAt: "2026-01-02T00:00:00.000Z" });
    expect(active).toMatchObject({ status: "rejected", reason: "active_session_must_be_completed_or_discarded", historyPreserved: true, futureSessionsRegenerated: false });
    const after = canonicalActivePlanV2Repository.get();
    if (after.status === "saved") expect(after.carrier.constraints.availableSessionMinutes).toBe(75);
  });
});
